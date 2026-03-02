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
        const { videoUrl, category, content } = req.body;

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

export default router;