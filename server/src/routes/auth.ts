// server/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma'; // 👈 수정: 직접 생성하지 말고 불러오기 (2026.02.26)

const router = Router();

// 회원가입 API (POST /api/auth/signup)
router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, nickname, password } = req.body;

        // 1. 필수 데이터 누락 체크
        if (!email || !nickname || !password) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

        // 2. 이메일 중복 검사 (이미 가입된 유저인지 확인)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }

        // 3. 비밀번호 단방향 암호화 (Salt Rounds: 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. DB에 유저 정보 저장 (비밀번호는 암호화된 값으로!)
        const newUser = await prisma.user.create({
            data: {
                email,
                nickname,
                password: hashedPassword,
            },
        });

        // 5. 성공 응답 (보안상 응답 데이터에서 비밀번호는 제외)
        res.status(201).json({
            message: '회원가입이 완료되었습니다!',
            user: { id: newUser.id, email: newUser.email, nickname: newUser.nickname }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
});

// 로그인 API (POST /api/auth/login) - 이건 다음 단계에서 짤 거야!
router.post('/login', async (req: Request, res: Response) => {
    console.log('로그인 요청 데이터:', req.body);
    res.json({ message: '로그인 요청 받음 (로직 구현 전)' });
});

export default router;