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

# 백엔드 package.json 복사
COPY code/node/package*.json ./

RUN npm install
RUN npm install mysql2
RUN npm install csv-parser
RUN npm install express
RUN npm install iconv-lite
RUN npm install cors
RUN npm install dotenv
RUN npm install multer
RUN npm install @google-cloud/storage
RUN npm install date-fns

# 백엔드 코드 복사
COPY code/node/ .    

# 빌드된 React 앱 복사
COPY --from=builder /app/web/build ./web/build

EXPOSE 3000
CMD ["node", "main.js"]