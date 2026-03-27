// server/src/middlewares/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../lib/redis';

// 1. 🔒 로그인 무차별 대입 공격 (Brute-force) 방어
// - 타겟: GET, POST /api/auth/login
// - 조건: 같은 IP에서 15분 동안 5회 이상 로그인 실패/시도 시 차단
export const loginLimiter = rateLimit({
    store: new RedisStore({
        // Redis 클라이언트의 명령어를 rate-limit-redis가 알아듣도록 연결
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // IP당 최대 5회 허용
    message: { message: '로그인 시도 횟수를 초과했습니다. 15분 후에 다시 시도해주세요.' },
    standardHeaders: true, // RateLimit 관련 헤더(RateLimit-Limit 등)를 응답에 포함
    legacyHeaders: false,
});

// 2. 🚨 투표(Vote) 매크로 및 API 도배(DDoS) 방어
// - 타겟: POST /api/posts/:id/vote
// - 조건: 같은 IP에서 1분에 10회 이상 찌르기 시도 시 차단
export const voteLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: 1 * 60 * 1000, // 1분
    max: 10, // IP당 최대 10회 허용
    message: { message: '너무 많은 요청이 발생했습니다. 1분 후에 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
});