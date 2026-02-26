// server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 프로젝트 전역에서 사용할 Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

export default prisma;