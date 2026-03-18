// server/src/routes/post.ts

import { Router, Request, Response } from 'express';
import passport from 'passport';
import prisma from '../lib/prisma';
import redisClient from '../lib/redis'; // ✅ Redis 불러오기 - Ver 2026.03.11

const router = Router();

// 게시글 작성 API (POST /api/posts)
// 🛡️ passport.authenticate('jwt') <- 이 녀석이 바로 JWT 신분증 검사 경비원!
router.post('/', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        // req.user는 Passport가  JWT 검증을 통과시킨 유저의 정보
        const user = req.user as any;
        const { videoUrl, category, content, sketchUrl } = req.body;

        // 1. 필수 데이터 누락 체크
        if (!videoUrl || !category || !content) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

        // 2. Prisma를 이용해 DB(post 테이블)에 데이터 저장
        const newPost = await prisma.post.create({
            data: {
                videoUrl,
                category,
                content,
                sketchUrl, // ✅ DB 저장 로직에 추가! (그림이 없으면 null로 들어감) - Ver 2026.03.10
                writerId: user.id // JWT에서 추출한 로그인 유저의 고유 ID (핵심!)
            }
        });

        // 3. 성공 응답
        res.status(201).json({
            message: '게시글이 성공적으로 작성되었습니다!',
            post: newPost
        });

    } catch (error) {
        console.error('Post Create Error:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
});

// 🚀 [수정 Ver- 2026.03.11] 게시글 리스트 조회 (Redis Caching 적용)
// Ver-2026.03.17: 필터링, 정렬, 닉네임 추가
router.get('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const category = req.query.category as string || 'ALL'; // 카테고리 필터
        const sort = req.query.sort as string || 'latest'; // 정렬 필터 (latest or popular)

        const skip = (page - 1) * limit;

        // 1. Redis 캐시 키 생성 (페이지 번호마다 다른 서랍장 이름 부여)
        const cacheKey = `posts:page:${page}:limit:${limit}:cat:${category}:sort:${sort}`;

        // 2. Redis 서랍장 열어보기 (캐시 데이터 조회)
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            // 캐시가 있으면? 초고속으로 바로 응답!
            console.log(`⚡ [Redis] 캐시 적중! (Key: ${cacheKey}) - DB 안 거침`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // 2-1. Prisma 조건 만들기
        const whereClause = category !== 'ALL' ? { category } : {};
        const orderByClause = sort === 'popular' ? { views: 'desc' as const } : { createdAt: 'desc' as const };

        // 3. 캐시가 없으면? DB(MySQL) 조회 (작성자 닉네임 포함!) - Ver 2026.03.17
        console.log(`🐢 [DB] 캐시 없음. DB에서 조회합니다. (Key: ${cacheKey})`);
        const posts = await prisma.post.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: orderByClause,
            include: {
                writer: {
                    select: { nickname: true, role: true } // 🚀 작성자의 닉네임, role(등급) 추출
                }
            }
        });

        const totalPosts = await prisma.post.count({ where: whereClause });
        const totalPages = Math.ceil(totalPosts / limit);
        const responseData = { posts, currentPage: page, totalPages, totalPosts };

        // 4. 방금 찾은 데이터를 Redis 서랍장에 60초(만료시간) 동안 넣어두기!
        // (setEx = Set with Expiration)
        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Get Posts Error:', error);
        res.status(500).json({ message: '게시글 목록을 불러오는데 실패했습니다.' });
    }
});

// 🚀 [신규 추가 2 Ver- 2026.03.03]] 게시글 상세 조회 API
// Ver 2026.03.17:  게시글 상세 조회 API (닉네임 포함)
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                writer: {
                    select: { nickname: true, role: true } // 🚀 상세 페이지에서 -> 작성자의 닉네임, role(등급) 추출
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // (조회수 1 증가)
        await prisma.post.update({
            where: { id: postId },
            data: { views: { increment: 1 } }
        });

        res.status(200).json(post);
    } catch (error) {
        console.error('Get Post Detail Error:', error);
        res.status(500).json({ message: '상세 정보를 불러오는데 실패했습니다.' });
    }
});

// 📊 [신규 추가 3 Ver- 2026.03.09] 특정 게시글의 실시간 통계 불러오기 (GET)
router.get('/:id/stats', async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const allVotes = await prisma.vote.findMany({ where: { postId } });

        const totalVotes = allVotes.length;
        const avgMyFault = totalVotes === 0 ? 50 : allVotes.reduce((acc, curr) => acc + curr.myFault, 0) / totalVotes;
        const avgOpponentFault = totalVotes === 0 ? 50 : allVotes.reduce((acc, curr) => acc + curr.opponentFault, 0) / totalVotes;

        res.status(200).json({
            totalVotes,
            avgMyFault: Math.round(avgMyFault),
            avgOpponentFault: Math.round(avgOpponentFault)
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: '통계를 불러오는데 실패했습니다.' });
    }
});

// 🚀 [수정 Ver- 2026.03.12] 투표 API & Socket 실시간 브로드캐스트 & 등급(Tier) 산정 로직 적용 (POST)
router.post('/:id/vote', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const user = req.user as any;
        const { myFault, opponentFault } = req.body;

        // 1. Prisma upsert로 DB 안전하게 저장 (있으면 수정, 없으면 생성)
        await prisma.vote.upsert({
            where: { userId_postId: { userId: user.id, postId: postId } },
            update: { myFault, opponentFault },
            create: { myFault, opponentFault, userId: user.id, postId: postId }
        });

        // 2. 새로운 통계 계산 및 Socket.io 브로드캐스트
        const allVotes = await prisma.vote.findMany({ where: { postId } });
        const totalVotes = allVotes.length;
        const avgMyFault = Math.round(allVotes.reduce((acc, curr) => acc + curr.myFault, 0) / totalVotes);
        const avgOpponentFault = Math.round(allVotes.reduce((acc, curr) => acc + curr.opponentFault, 0) / totalVotes);
        const stats = { totalVotes, avgMyFault, avgOpponentFault };

        const io = req.app.get('io');
        io.to(`post_${postId}`).emit('update_chart', stats);

        // ====================================================================
        // 🏆 3. [신규] 운전자 등급(Tier) 산정 로직 구현 🏆
        // ====================================================================

        // 3-1. 현재 로그인한 유저가 지금까지 참여한 총 투표 횟수 조회
        const userVoteCount = await prisma.vote.count({
            where: { userId: user.id }
        });

        // 3-2. 횟수에 따른 타겟 등급 계산
        let targetRole = 'BEGINNER';
        if (userVoteCount >= 10) {
            targetRole = 'MASTER';
        } else if (userVoteCount >= 3) {
            targetRole = 'EXPERT';
        }

        // 3-3. DB에서 유저의 최신 정보 가져오기 (JWT 데이터는 과거 기록일 수 있으므로)
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        let isUpgraded = false;

        // 3-4. 유저의 현재 등급과 타겟 등급이 다르면? 👉 승급 업데이트!
        if (currentUser && currentUser.role !== targetRole) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: targetRole }
            });
            isUpgraded = true;
            console.log(`🎉 [승급 알림] 유저 ID ${user.id}님이 '${targetRole}' 등급으로 승급했습니다! (총 투표: ${userVoteCount}회)`);
        }

        // 4. 최종 응답 반환 (승급 여부와 현재 횟수도 함께 프론트로 전달)
        res.status(200).json({
            message: '판결이 성공적으로 제출되었습니다.',
            stats,
            tierInfo: {
                isUpgraded,
                newRole: targetRole,
                totalVotes: userVoteCount
            }
        });
    } catch (error) {
        console.error('Vote Error:', error);
        res.status(500).json({ message: '투표 처리 중 오류가 발생했습니다.' });
    }
});


// ====================================================================
// 🚀 [신규 추가 Ver- 2026.03.18] 게시글 수정 API (PUT)
// ====================================================================
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const user = req.user as any;
        const { category, content } = req.body; // 수정할 데이터 (보통 원본 영상 URL은 수정을 막는 것이 일반적입니다)

        if (!category || !content) {
            return res.status(400).json({ message: '수정할 카테고리와 내용을 모두 입력해주세요.' });
        }

        // 1. 게시글이 존재하는지, 그리고 현재 로그인한 유저가 '작성자' 본인이 맞는지 철저히 검증! (보안 핵심)
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        if (post.writerId !== user.id) return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });

        // 2. 통과했다면 게시글 업데이트
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { category, content }
        });

        res.status(200).json({
            message: '게시글이 성공적으로 수정되었습니다.',
            post: updatedPost
        });
    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.' });
    }
});

// ====================================================================
// 🗑️ [신규 추가 Ver- 2026.03.18] 게시글 삭제 API (DELETE)
// ====================================================================
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const user = req.user as any;

        // 1. 게시글 존재 및 권한 검증
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        if (post.writerId !== user.id) return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });

        // 2. 🚨 트랜잭션(Transaction) 처리: 게시글을 지우려면 거기에 달린 '투표(Vote)' 기록들도 같이 날려줘야 DB 에러가 안 납니다!
        await prisma.$transaction([
            prisma.vote.deleteMany({ where: { postId } }), // 1. 투표 기록들 먼저 싹 지우고
            prisma.post.delete({ where: { id: postId } })  // 2. 마지막으로 게시글 본체를 지움
        ]);

        res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
});

export default router;