// 실행 전 설치해야 할것
// npm i mysql2

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'mysql'
});

connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 오류:', err);
        return;
    }
    console.log('MySQL에 연결되었습니다.');
});

connection.query('SELECT * FROM db', (err, results, fields) => {
    if (err) {
        console.error('쿼리 실행 오류:', err);
        return;
    }
    console.log('쿼리 결과:', results);
});

connection.end();
