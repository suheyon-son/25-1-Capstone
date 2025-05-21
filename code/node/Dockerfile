# 1단계: React 앱 빌드
FROM node:18 AS builder
WORKDIR /app/web
COPY web ./              # code/web 폴더 복사
RUN npm install
RUN npm run build

# 2단계: Express 백엔드 실행
FROM node:18
WORKDIR /app

COPY node/package*.json ./
RUN npm install
RUN npm install mysql

COPY node/ .            # code/node 폴더 복사

COPY --from=builder /app/web/build ./web/build

EXPOSE 3000
CMD ["node", "main.js"]