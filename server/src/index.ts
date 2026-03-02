import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';

// 라우터 및 미들웨어 불러오기
import './middlewares/passport'; // passport 전략 불러오기 (초기화)
import authRoutes from './routes/auth'; // 인증 라우터 불러오기
import postRoutes from './routes/post'; // 게시글 라우터 불러오기

dotenv.config(); // .env 파일 로드

const app = express();
const PORT = process.env.PORT || 4000; // 백엔드는 4000번 포트 사용

// 1. 미들웨어 설정  & CORS 및 JSON 파싱 (프론트엔드 3000번 포트에서의 요청 허용)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// 2. 인증 미들웨어 설정 (Passport 경비원 배치)
app.use(passport.initialize());

// 3. API 라우터 연결 (주소 뚫어주기)
app.use('/api/auth', authRoutes);   // 회원가입, 로그인
app.use('/api/posts', postRoutes);  // 게시글 작성 (내부에 JWT 검사 로직 있음)

// 4. 테스트용 API 라우트
app.get('/api/test', (req, res) => {
  res.json({ message: '백엔드 서버 연결 성공! 🚀' });
});

// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});