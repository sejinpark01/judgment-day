// server/src/routes/auth.ts

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'; // 👈 수정: 직접 생성하지 말고 불러오기 (2026.02.26)
import passport from 'passport';

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

// 로그인 API (POST /api/auth/login) 
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        // 1. 필수 데이터 확인
        if (!email || !password) {
            return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
        }

        // 2. 유저 존재 여부 확인
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: '가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.' });
        }

        // 3. 비밀번호 일치 여부 확인 (평문 비밀번호 vs DB의 해시 비밀번호)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.' });
        }

        // 4. JWT 토큰 발급 (유효기간: 24시간)
        const secretKey = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign(
            { id: user.id, email: user.email, nickname: user.nickname },
            secretKey,
            { expiresIn: '24h' }
        );

        // 5. 성공 응답 (토큰과 유저 정보 반환)
        res.status(200).json({
            message: '로그인에 성공했습니다.',
            token,
            user: { id: user.id, email: user.email, nickname: user.nickname }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
});

// ====================================================================
// 👤 [추가] 내 프로필 및 투표 기록 조회 API (GET /api/auth/me) - Ver 2026.03.20
// ====================================================================
router.get('/me', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        const user = req.user as any;

        // 유저 정보와 투표 기록(게시글 정보 조인)을 함께 가져옴
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                createdAt: true,
                votes: {
                    include: {
                        post: {
                            select: { id: true, category: true, content: true, views: true, createdAt: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' } // 최신 투표순 정렬
                }
            }
        });

        if (!userProfile) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: '프로필 조회 중 오류가 발생했습니다.' });
    }
});

// ====================================================================
// 🔒 [추가] 비밀번호 변경 API (PUT /api/auth/password) - Ver 2026.03.20
// ====================================================================
router.put('/password', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response): Promise<any> => {
    try {
        const user = req.user as any;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!existingUser) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        // 1. 현재 비밀번호 검증
        const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 2. 새 비밀번호 암호화 및 업데이트
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
    }
});

export default router;