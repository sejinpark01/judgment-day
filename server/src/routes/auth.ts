// server/src/routes/auth.ts

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'; // 👈 수정: 직접 생성하지 말고 불러오기 (2026.02.26)
import passport from 'passport';
import { loginLimiter } from '../middlewares/rateLimiter'; // Redis로 Rate Limiting(요청 제한) - Ver 2026.03.27

const router = Router();

// 상단에 프론트엔드 주소 정의 (isProd 변수는 이미 passport.ts에서 썼던 로직과 동일하게) - Ver 2026.04.07
const isProd = process.env.NODE_ENV === 'production';
const FRONTEND_URL = isProd ? 'https://judgment-day.vercel.app' : 'http://localhost:3000';

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
                provider: 'local', // 명시적으로 local 가입임을 표시 - Ver 2026.03.25
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

// 일반 이메일 로그인 API (POST /api/auth/login) 
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<any> => {
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

        // 2-1. 소셜 로그인 유저 방어 로직 (Type Guard)
        if (!user.password) {
            return res.status(400).json({ message: '소셜 로그인으로 가입된 계정입니다. 카카오 또는 구글 로그인을 이용해주세요.' });
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
            user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role }
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
                provider: true, // 프론트엔드에서 소셜 유저인지 구분하기 위해 - Ver 2026.03.26

                //  내가 작성한 글 목록(posts)을 최신순으로 가져오도록 명시함 - Ver 2026.04.02
                posts: {
                    orderBy: { createdAt: 'desc' }
                },

                votes: {
                    include: {
                        post: {
                            // select 항목에 title: true 를 반드시 포함시켜 줌  - Ver 2026.04.02
                            select: { id: true, category: true, title: true, content: true, views: true, createdAt: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' } // 최신 투표순 정렬
                }
            }
        });

        if (!userProfile) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });


        // =======================================================
        // 📊 [Feature G] 운전 MBTI 및 편차(Deviation) 분석 로직 - Ver 2026.04.02
        // =======================================================
        let mbtiData = null;

        if (userProfile.votes.length > 0) {
            const postIds = userProfile.votes.map(v => v.post.id);

            // 해당 게시글들의 '대중 평균 과실(myFault)' 그룹화
            const avgVotes = await prisma.vote.groupBy({
                by: ['postId'],
                where: { postId: { in: postIds } },
                _avg: { myFault: true }
            });

            const avgMap = new Map();
            avgVotes.forEach(item => avgMap.set(item.postId, item._avg.myFault || 50));

            let matchCount = 0;
            let myFaultSum = 0;
            const voteCount = userProfile.votes.length;

            // 1. 대중 평균과 나의 투표 차이(diff) 계산
            for (const vote of userProfile.votes) {
                const avgMyFault = avgMap.get(vote.post.id) || 50;
                const diff = Math.abs(vote.myFault - avgMyFault); // 내 투표 - 대중 평균

                // 내 투표가 대중 평균과 20% 이내로 비슷하면 '정답(일치)'으로 인정!
                if (diff <= 20) matchCount++;
                myFaultSum += vote.myFault; // 내 투표의 절대적 수치 합
            }

            const matchRate = matchCount / voteCount;       // 대중과의 일치율 (0.0 ~ 1.0)
            const myOverallAvg = myFaultSum / voteCount;    // 내 투표의 절대 평균 (높으면 블박 혐오, 낮으면 블박 수호)

            // 2. MBTI 유형 도출 (절대 오차 기반의 완벽한 분기)
            let mbtiType = "객관적 솔로몬";

            if (matchRate >= 0.5) {
                // 절반 이상 대중과 비슷한 의견을 냈다면 무조건 솔로몬! (억울한 갈대 방지)
                mbtiType = "객관적 솔로몬";
            } else {
                // 대중과 의견이 많이 다른 마이웨이 성향일 때
                if (myOverallAvg > 65) {
                    mbtiType = "무자비한 심판관"; // 대중과 안 맞는데 평균적으로 65 이상 때림 (가혹함)
                } else if (myOverallAvg < 35) {
                    mbtiType = "맹목적 블박 쉴더"; // 대중과 안 맞는데 평균적으로 35 이하 때림 (관대함)
                } else {
                    mbtiType = "청개구리 트롤러"; // 대중과도 안 맞고, 내 평균도 50 언저리 (그때그때 기분따라 찍는 찐 트롤!)
                }
            }

            // 3. 차트 렌더링용 스탯 정규화
            const objectivity = Math.round(matchRate * 100);
            const strictness = Math.round(myOverallAvg);
            const leniency = Math.round(100 - myOverallAvg);

            // 일관성: 대중과 잘 맞거나(matchRate 높음), 아니면 확고하게 한쪽으로 패거나(myOverallAvg가 0이나 100에 가까움)
            let consistency = 0;
            if (matchRate >= 0.5) consistency = 80 + (matchRate * 20); // 80~100
            else consistency = Math.abs(myOverallAvg - 50) * 2;        // 50에서 멀어질수록 100에 가까워짐

            mbtiData = {
                type: mbtiType,
                chartData: [
                    { subject: '엄격함', value: strictness },
                    { subject: '객관성', value: objectivity },
                    { subject: '관대함', value: leniency },
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

        // 0. 소셜 로그인 유저 방어 로직 (Type Guard) - Ver 2026.03.25
        if (!existingUser.password) {
            return res.status(400).json({ message: '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.' });
        }

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

// ====================================================================
// 🚀 [신규] 카카오(Kakao) OAuth 2.0 라우터 - Ver 2026.03.25
// ====================================================================
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', { session: false, failureRedirect: 'http://localhost:3000/login' }), (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, email: user.email, nickname: user.nickname }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    const userStr = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, nickname: user.nickname, role: user.role }));
    res.redirect(`${FRONTEND_URL}/login?token=${token}&user=${userStr}`);
});

// ====================================================================
// 🚀 [신규] 구글(Google) OAuth 2.0 라우터 - Ver 2026.03.25
// ====================================================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }), (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, email: user.email, nickname: user.nickname }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    const userStr = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, nickname: user.nickname, role: user.role }));
    res.redirect(`${FRONTEND_URL}/login?token=${token}&user=${userStr}`);
});

export default router;