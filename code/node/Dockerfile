# 1단계: React 앱 빌드
FROM node:18 AS builder
WORKDIR /app/web
COPY ../web ./                   
RUN npm install
RUN npm run build

# 2단계: Express 백엔드 실행
FROM node:18
WORKDIR /app

# 백엔드 패키지 설치
COPY node/package*.json ./    
RUN npm install
RUN npm install mysql

# 백엔드 코드 복사
COPY node/ .                 

# 프론트 빌드 결과 복사
COPY --from=builder /app/web/build ./web/build

EXPOSE 3000
CMD ["node", "main.js"]