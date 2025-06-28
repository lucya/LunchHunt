# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 컴파일 및 Vite 빌드
RUN npm run build

# 포트 노출
EXPOSE 3001

# 환경 변수 설정
ENV NODE_ENV=production

# 서버 시작
CMD ["npm", "run", "start"] 