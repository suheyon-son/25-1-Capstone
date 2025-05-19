const express = require('express');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '10.74.16.3',
  user: 'root',
  password: '1234',
  database: 'capstone'
});

const app = express();
const port = 37812;

connection.connect((err) => {
  if (err) {
    console.error('❌ DB 연결 실패:', err);
    process.exit(1); // 연결 실패 시 서버 종료
  }
  
  console.log('✅ Cloud SQL에 연결되었습니다.');

  // DB 연결 성공 후 서버 시작
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://34.64.119.252:${port}`);
  });
});
