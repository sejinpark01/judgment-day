// server/src/lib/redis.ts

import { createClient } from 'redis';

// 로컬 도커에 띄워둔 Redis(6379 포트)와 연결할 클라이언트 생성
const redisClient = createClient({
    // Docker 기본 Redis 포트 - Ver 2026.03.27
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

// 에러 처리 및 연결 성공 로그
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis Connected Successfully!'));

// 🚀 핵심: 모듈이 import 될 때 즉시 백그라운드에서 연결 시작! (rateLimiter 에러 방지) - Ver 2026.03.27
redisClient.connect().catch(console.error);

export default redisClient;