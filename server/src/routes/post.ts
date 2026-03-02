// server/src/routes/post.ts
import { Router, Request, Response } from 'express';
import passport from 'passport';
import prisma from '../lib/prisma';

const router = Router();

// 게시글 작성 API (POST /api/posts)
// 🛡️ passport.authenticate('jwt') <- 이 녀석이 바로 JWT 신분증 검사 경비원!
router.post('/', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        // req.user는 Passport가 검증을 통과시킨 유저의 정보야!
        const user = req.user as any; 
        const { videoUrl, category, content } = req.body;

        if (!videoUrl || !category || !content) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

        // TODO: 여기서 Prisma를 이용해 Post 테이블에 데이터 저장 (다음 단계에서 작성 예정!)
        console.log('작성자 ID:', user.id);
        console.log('작성할 내용:', { videoUrl, category, content });

        res.status(201).json({ message: '게시글 작성 요청 받음 (DB 저장 로직 구현 전)' });

    } catch (error) {
        console.error('Post Create Error:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
});

export default router;