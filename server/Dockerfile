# 1. 가벼운 Node.js 환경 가져오기
FROM node:20-alpine

# 2. 작업할 폴더 지정
WORKDIR /app

# 3. 패키지 파일 복사 후 설치
COPY package*.json ./
RUN npm install

# 4. 소스코드 전체 복사
COPY . .

# 5. Prisma 클라이언트 생성 (DB 연결용)
RUN npx prisma generate

# 6. 타입스크립트 빌드
RUN npm run build

# 7. 서버 포트 4000번 열어두기
EXPOSE 4000

# 8. 컨테이너 켜질 때 서버 실행
CMD ["npm", "start"]