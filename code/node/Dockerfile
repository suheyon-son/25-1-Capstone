# 1단계: React 앱 빌드
FROM node:18 AS builder
WORKDIR /app/web

# 루트가 컨텍스트이므로 web 폴더를 이렇게 복사
COPY web ./       

RUN npm install
RUN npm run build

# 2단계: Express 백엔드 실행
FROM node:18
WORKDIR /app

# 백엔드 package.json 복사
COPY code/node/package*.json ./

RUN npm install
RUN npm install mysql

# 백엔드 코드 복사
COPY code/node/ .    

# 빌드된 React 앱 복사
COPY --from=builder /app/web/build ./web/build

EXPOSE 3000
CMD ["node", "main.js"]
