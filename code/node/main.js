const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

require('./database/db'); // DB 연결
const routes = require('./route/routes');

const app = express();

// ✅ CORS 미들웨어를 라우터보다 먼저 적용
app.use(cors({
  origin: 'https://suhyeon.xyz', // 또는 '*' 개발용 전체 허용
  credentials: true,
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'web', 'build')));
app.use(routes);

const PORT = process.env.PORT;

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express 앱이 ${PORT}번 포트에서 실행 중입니다.`);
});