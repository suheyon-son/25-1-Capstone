const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../.env')});
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('Cloud SQL에 연결되었습니다.');
});

module.exports = connection;