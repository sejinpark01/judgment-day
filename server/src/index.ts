import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // 백엔드는 4000번 포트 사용

// 1. CORS 설정 (프론트엔드 3000번 포트에서의 요청 허용)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// 2. JSON 데이터 파싱 설정
app.use(express.json());

// 3. 테스트용 API 라우트 생성
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀 백엔드와 연결 성공! 데이터가 보입니다.' });
});

// 4. 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});