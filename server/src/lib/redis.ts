// server/src/lib/redis.ts

import { createClient } from 'redis';

// 로컬 도커에 띄워둔 Redis(6379 포트)와 연결할 클라이언트 생성
const redisClient = createClient({
    url: 'redis://127.0.0.1:6379'
});

// 에러 처리 및 연결 성공 로그
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('📦 Redis Connected Successfully!'));

export default redisClient;