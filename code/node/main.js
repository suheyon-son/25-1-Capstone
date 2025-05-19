const express = require('express')
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '10.74.16.3',
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
const port = 37812

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})