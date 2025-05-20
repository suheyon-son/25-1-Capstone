const express = require('express')
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'my-database.suhyeon.xyz',
  user: 'root',
  password: '1234',
  database: 'capstone'
});

connection.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('Cloud SQL에 연결되었습니다.');
});

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/health', (req,res) => {
  res.status(200).send('ok');
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`Example app listening on port 3000`)
})