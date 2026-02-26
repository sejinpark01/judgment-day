import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth'; // 4번 단계에서 만들 파일

dotenv.config(); // .env 파일 로드


const app = express();
const PORT = process.env.PORT || 4000; // 백엔드는 4000번 포트 사용

// 1. 미들웨어 설정  & CORS 설정 (프론트엔드 3000번 포트에서의 요청 허용)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// 2. JSON 데이터 파싱 설정
app.use(express.json());

/* 3. 라우터 연결
/api/auth/signup, /api/auth/login 주소로 요청이 오면 authRoutes가 처리함 */
app.use('/api/auth', authRoutes);

// 4. 테스트용 API 라우트 생성
app.get('/api/test', (req, res) => {
  res.json({ message: '백엔드 서버 연결 성공! 🚀' });
});

// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});