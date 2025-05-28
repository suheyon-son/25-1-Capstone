const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../.env')});
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('Cloud SQL에 연결되었습니다.');
});

module.exports = connection;