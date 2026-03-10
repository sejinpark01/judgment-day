// server/src/routes/post.ts
import { Router, Request, Response } from 'express';
import passport from 'passport';
import prisma from '../lib/prisma';

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

// 🚀 [추가 1 Ver- 2026.03.03] 게시글 리스트 조회 (Pagination 적용)
router.get('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6; // 한 페이지당 6개 표시
        const skip = (page - 1) * limit;

        // 최신순(내림차순)으로 데이터 가져오기
        const posts = await prisma.post.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }, // 내림차순
        });

        const totalPosts = await prisma.post.count();
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({ posts, currentPage: page, totalPages, totalPosts });
    } catch (error) {
        console.error('Get Posts Error:', error);
        res.status(500).json({ message: '게시글 목록을 불러오는데 실패했습니다.' });
    }
});

// 🚀 [신규 추가 2 Ver- 2026.03.03]] 게시글 상세 조회 API
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const post = await prisma.post.findUnique({
            where: { id: postId },
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

// 🚀 [신규 추가 4 Ver- 2026.03.09] 투표 API & Socket 실시간 브로드캐스트 (POST)
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

        // 2. 새로운 통계 계산
        const allVotes = await prisma.vote.findMany({ where: { postId } });
        const totalVotes = allVotes.length;
        const avgMyFault = Math.round(allVotes.reduce((acc, curr) => acc + curr.myFault, 0) / totalVotes);
        const avgOpponentFault = Math.round(allVotes.reduce((acc, curr) => acc + curr.opponentFault, 0) / totalVotes);
        const stats = { totalVotes, avgMyFault, avgOpponentFault };

        // 3. 🚨 마법의 순간: 이 게시글 방(Room)에 있는 모두에게 새 통계 전송!
        const io = req.app.get('io');
        io.to(`post_${postId}`).emit('update_chart', stats);

        res.status(200).json({ message: '판결이 성공적으로 제출되었습니다.', stats });
    } catch (error) {
        console.error('Vote Error:', error);
        res.status(500).json({ message: '투표 처리 중 오류가 발생했습니다.' });
    }
});

export default router;