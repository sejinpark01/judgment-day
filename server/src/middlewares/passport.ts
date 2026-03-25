// server/src/middlewares/passport.ts

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as KakaoStrategy } from 'passport-kakao'; // 추가 Ver 2026.03.25
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // 추가 Ver 2026.03.25
import prisma from '../lib/prisma';

// 1. JWT 검증 전략
const jwtOpts = {
  // 프론트엔드에서 Authorization 헤더에 'Bearer 토큰' 형태로 보낸 걸 추출
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // 우리가 .env에 설정해둔 비밀 도장
  secretOrKey: process.env.JWT_SECRET || 'fallback_secret_key',
};

// Passport JWT 전략(Strategy) 등록
passport.use(
  new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
    try {
      // 토큰 해독본(jwt_payload)에 있는 id로 DB에서 유저가 진짜 있는지 확인
      const user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });

      if (user) {
        return done(null, user); // 유저가 있으면 통과! (req.user에 유저 정보가 담김)
      } else {
        return done(null, false); // 유저가 없으면 컷! (401 Unauthorized)
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// ==========================================================
// 🚀 2. Kakao 소셜 로그인 전략 (Ver 2026.03.25)
// ==========================================================
passport.use(
  new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID || 'dummy_kakao_id',
    callbackURL: '/api/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const snsId = String(profile.id);
      const email = profile._json?.kakao_account?.email || `kakao_${snsId}@nomail.com`;
      const nickname = profile._json?.properties?.nickname || `카카오유저${snsId.substring(0, 4)}`;

      // 기존 가입자인지 확인, 없으면 신규 가입(자동)
      let user = await prisma.user.findFirst({ where: { snsId, provider: 'kakao' } });
      if (!user) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          // 이메일은 같은데 local로 가입했던 유저면 연동 처리
          user = await prisma.user.update({ where: { email }, data: { snsId, provider: 'kakao' } });
        } else {
          // 완전 신규
          user = await prisma.user.create({ data: { email, nickname, provider: 'kakao', snsId } });
        }
      }
      return done(null, user);
    } catch (error) { return done(error); }
  })
);

// ==========================================================
// 🚀 3. Google 소셜 로그인 전략 (Ver 2026.03.25)
// ==========================================================
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const snsId = String(profile.id);
      const email = profile.emails?.[0].value || `google_${snsId}@nomail.com`;
      const nickname = profile.displayName || `구글유저${snsId.substring(0, 4)}`;

      let user = await prisma.user.findFirst({ where: { snsId, provider: 'google' } });
      if (!user) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await prisma.user.update({ where: { email }, data: { snsId, provider: 'google' } });
        } else {
          user = await prisma.user.create({ data: { email, nickname, provider: 'google', snsId } });
        }
      }
      return done(null, user);
    } catch (error) { return done(error); }
  })
);

export default passport;