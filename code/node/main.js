const express = require('express');
const mysql = require('mysql');
const path = require('path');

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

const app = express();

// React 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'web', 'build')));

// API 예제
app.get('/api/hello', (req, res) => {
  res.json({ message: '안녕하세요!' });
});

// React 라우팅 지원
app.get(/^\/(?!api|static|assets).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'build', 'index.html'));
});

// 서버 실행
app.listen(3000, '0.0.0.0', () => {
  console.log('Express 앱이 3000번 포트에서 실행 중입니다.');
});

app.get('/api/express-endpoint', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.get('/api/call-flask', async (req, res) => {
  try{
    const flaskRes = await fetch('http://capstone-ai-service:5000/api/flask-endpoint');
    const data = await flaskRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling Flask:', error);
    res.status(500).json({ error: 'Error calling Flask' });
  }
});