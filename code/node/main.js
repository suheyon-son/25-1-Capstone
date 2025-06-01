const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

require('./database/db'); // DB 연결
const routes = require('./route/index'); // routes 폴더 내 index.js (분리된 라우터)

const runMigration = require('./database/migrate');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://suhyeon.xyz'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS 정책에 의해 차단됨: ' + origin));
    }
  },
  credentials: true, // 쿠키 포함 필요 시 true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'web', 'build')));
app.use(routes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  // try {
  //   console.log('마이그레이션 시작...');
  //   await runMigration(); // DB 마이그레이션 수행
  //   console.log('마이그레이션 완료');
  // } catch (err) {
  //   console.error('마이그레이션 실패:', err);
  //   process.exit(1); // 마이그레이션 실패 시 서버 시작 중단
  // }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express 앱이 ${PORT}번 포트에서 실행 중입니다.`);
  });
}

startServer();