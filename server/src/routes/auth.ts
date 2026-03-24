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
// 👤 [수정] 내 프로필, 투표 기록 및 📊 운전 MBTI 분석 API (GET /api/auth/me) - Ver 2026.03.24
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


        // =======================================================
        // 📊 [Feature G] 운전 MBTI 및 편차(Deviation) 분석 로직 - Ver 2026.03.24
        // =======================================================
        let mbtiData = null;

        if (userProfile.votes.length > 0) {
            // 성능 최적화: 유저가 투표한 모든 게시글 ID 추출
            const postIds = userProfile.votes.map(v => v.post.id);

            // Prisma Aggregate 활용: 해당 게시글들의 '대중 평균 과실(myFault)'을 한 번에 그룹화하여 계산
            const avgVotes = await prisma.vote.groupBy({
                by: ['postId'],
                where: { postId: { in: postIds } },
                _avg: { myFault: true }
            });

            // 게시글별 평균 매핑
            const avgMap = new Map();
            avgVotes.forEach(item => avgMap.set(item.postId, item._avg.myFault || 50));

            let totalDeviation = 0;
            let deviations: number[] = [];

            // 1. 유저 투표율과 대중 평균 투표율 간의 편차(Deviation) 계산
            for (const vote of userProfile.votes) {
                const avgMyFault = avgMap.get(vote.post.id) || 50;
                // 편차가 양수(+)면 블박차에게 더 가혹함, 음수(-)면 관대함
                const deviation = vote.myFault - avgMyFault; 
                totalDeviation += deviation;
                deviations.push(deviation);
            }

            const avgDeviation = totalDeviation / userProfile.votes.length;
            // 일관성을 측정하기 위한 분산(Variance) 계산
            const variance = deviations.reduce((acc, val) => acc + Math.pow(val - avgDeviation, 2), 0) / userProfile.votes.length;

            // 2. MBTI 유형 도출
            let mbtiType = "객관적 솔로몬"; 
            if (variance > 500) mbtiType = "예측불허 갈대"; // 일관성이 매우 떨어질 때
            else if (avgDeviation > 15) mbtiType = "엄격한 심판관"; // 대중보다 블박차 과실을 높게 잡을 때
            else if (avgDeviation < -15) mbtiType = "블박차 빙의"; // 대중보다 블박차 과실을 낮게 잡을 때

            // 3. 차트 렌더링용 스탯 정규화 (0~100)
            const strictness = Math.min(100, Math.max(0, 50 + avgDeviation * 1.5));
            const leniency = Math.min(100, Math.max(0, 50 - avgDeviation * 1.5));
            const objectivity = Math.min(100, Math.max(0, 100 - Math.abs(avgDeviation) * 2));
            const consistency = Math.min(100, Math.max(0, 100 - (variance / 15)));

            mbtiData = {
                type: mbtiType,
                chartData: [
                    { subject: '엄격함', value: Math.round(strictness) },
                    { subject: '객관성', value: Math.round(objectivity) },
                    { subject: '관대함', value: Math.round(leniency) },
                    { subject: '일관성', value: Math.round(consistency) }
                ]
            };
        }

        // 응답 데이터에 MBTI 통계 결합
        res.status(200).json({ ...userProfile, mbti: mbtiData });
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