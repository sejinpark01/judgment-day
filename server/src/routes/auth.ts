import { Router, Request, Response } from 'express';

const router = Router();

// 회원가입 API (POST /api/auth/signup)
router.post('/signup', async (req: Request, res: Response) => {
    // TODO: 실제 DB 저장 로직 구현 예정
    console.log('회원가입 요청 데이터:', req.body);
    res.json({ message: '회원가입 요청 받음 (로직 구현 전)' });
});

// 로그인 API (POST /api/auth/login)
router.post('/login', async (req: Request, res: Response) => {
    // TODO: 실제 로그인 검증 로직 구현 예정
    console.log('로그인 요청 데이터:', req.body);
    res.json({ message: '로그인 요청 받음 (로직 구현 전)' });
});

export default router;