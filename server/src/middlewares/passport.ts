// server/src/middlewares/passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../lib/prisma';

// JWT 검증 옵션 설정
const opts = {
  // 프론트엔드에서 Authorization 헤더에 'Bearer 토큰' 형태로 보낸 걸 추출
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
  // 우리가 .env에 설정해둔 비밀 도장
  secretOrKey: process.env.JWT_SECRET || 'fallback_secret_key', 
};

// Passport JWT 전략(Strategy) 등록
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
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

export default passport;