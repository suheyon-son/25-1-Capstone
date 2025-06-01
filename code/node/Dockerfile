# 1단계: React 앱 빌드
FROM node:18 AS builder
WORKDIR /app/web

# 빌드 컨텍스트 루트가 25-1-Capstone이므로 code/web 경로를 복사해야 함
COPY code/web ./       

RUN npm install
ENV REACT_APP_API_URL=""
RUN npm run build

# 2단계: Express 백엔드 실행
FROM node:18
WORKDIR /app

# 백엔드 package.json, package-lock.json 복사 (있으면 반드시 복사)
COPY code/node/package*.json ./

# 한 번만 npm install 실행 (필요한 모든 패키지는 package.json에 포함되어 있어야 함)
RUN npm install

# 백엔드 코드 복사
COPY code/node/ .    

# 빌드된 React 앱 복사
COPY --from=builder /app/web/build ./web/build

EXPOSE 3000
CMD ["node", "main.js"]
