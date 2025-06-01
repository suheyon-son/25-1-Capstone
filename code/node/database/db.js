const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mysql = require('mysql2');

// 필수 환경변수 확인
const requiredEnv = ['DATABASE_HOST', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_DATABASE'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
});

// DB 연결
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
    process.exit(1);
  }
  console.log('Cloud SQL에 연결되었습니다.');
});

module.exports = connection;