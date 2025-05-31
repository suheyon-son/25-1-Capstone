const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

require('./database/db'); // DB 연결
const routes = require('./route/routes');

const runMigration = require('./database/migrate');

const app = express();

// CORS 미들웨어
app.use(cors({
  origin: 'https://suhyeon.xyz',
  credentials: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'web', 'build')));
app.use(routes);

const PORT = process.env.PORT;

async function startServer() {
  try {
    console.log('마이그레이션 시작...');
    await runMigration(); // ✅ 이제 정상 작동
    console.log('마이그레이션 완료');
  } catch (err) {
    console.error('마이그레이션 실패:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express 앱이 ${PORT}번 포트에서 실행 중입니다.`);
  });
}

startServer();