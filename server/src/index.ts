import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 라우터 및 미들웨어 불러오기
import './middlewares/passport'; // passport 전략 불러오기 (초기화)
import authRoutes from './routes/auth'; // 인증 라우터 불러오기
import postRoutes from './routes/post'; // 게시글 라우터 불러오기
import redisClient from './lib/redis'; // ✅ 새로 만든 Redis 클라이언트 불러오기 - Ver 2026.03.11

dotenv.config(); // .env 파일 로드

const app = express();
const PORT = process.env.PORT || 4000; // 백엔드는 4000번 포트 사용

// 0.  HTTP 서버 및 Socket.io 서버 생성 (Express와 결합) Ver - (2026.03.09) 추가
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// 라우터(post.ts 등)에서 io 객체를 사용할 수 있도록 전역에 저장 
app.set('io', io);

// 🚀 Socket.io 연결 이벤트 리스너
io.on('connection', (socket) => {
  console.log('⚡ 새로운 클라이언트 접속:', socket.id);

  // 유저가 특정 게시글에 들어왔을 때 해당 방(Room)에 입장시킴
  socket.on('join_post', (postId) => {
    socket.join(`post_${postId}`);
    console.log(`유저가 게시글 ${postId}번 방에 입장했습니다.`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 클라이언트 접속 종료:', socket.id);
  });
});

// 1. 미들웨어 설정  & CORS 및 JSON 파싱 (프론트엔드 3000번 포트에서의 요청 허용)
app.use(cors({
  origin: '*',
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

// 5. 서버 실행 (Redis 연결 추가) -Ver 2026.03.11
httpServer.listen(PORT, async () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  
  // 서버가 켜지면 Redis도 비동기로 연결 시작!
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis 연결 실패:', error);
  }
});