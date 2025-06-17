const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const dataList = JSON.parse(fs.readFileSync(path.join(__dirname, 'migrate-data.json'), 'utf8')).slice(0, 150);

async function uploadOne(data) {
  const form = new FormData();

  form.append('pothole_depth', data.pothole_depth);
  form.append('pothole_width', data.pothole_width);
  form.append('pothole_latitude', data.pothole_latitude);
  form.append('pothole_longitude', data.pothole_longitude);
  form.append('pothole_date', data.pothole_date);
  form.append('image', fs.createReadStream(data.imagePath));

  try {
    const response = await axios.post('/api/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    console.log('✅ 업로드 성공:', data.imagePath, response.data.fileUrl);
  } catch (error) {
    console.error('❌ 업로드 실패:', data.imagePath, error.response?.data || error.message);
  }
}

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
  });

  // 기존 테이블 삭제
  await connection.query(`DROP TABLE IF EXISTS pothole`);
  await connection.query(`DROP TABLE IF EXISTS road`);
  await connection.query(`DROP TABLE IF EXISTS roadname`);
  console.log('🧹 기존 테이블 삭제 완료');

  // 새 테이블 생성
  const createTableQueries = [
    `CREATE TABLE IF NOT EXISTS roadname (
      roadname_id INT NOT NULL,
      roadname_sido VARCHAR(30) NOT NULL,
      roadname_sigungu VARCHAR(30) NOT NULL,
      roadname_emd VARCHAR(30) NOT NULL,
      roadname_roadname VARCHAR(30) NOT NULL,
      jibun_sido VARCHAR(30) NOT NULL,
      jibun_sigungu VARCHAR(30) NOT NULL,
      jibun_emd VARCHAR(30) NOT NULL,
      jibun_other VARCHAR(30) NOT NULL,
      jibun_number VARCHAR(30) NOT NULL,
      PRIMARY KEY (roadname_id)
    )`,
    `CREATE TABLE IF NOT EXISTS road (
      road_id INT NOT NULL AUTO_INCREMENT,
      roadname_id INT NOT NULL,
      road_lastdate DATE NULL,
      road_lastfixdate DATE NULL,
      road_danger FLOAT NULL,
      road_count INT NULL,
      road_state INT NULL,
      PRIMARY KEY (road_id),
      FOREIGN KEY (roadname_id) REFERENCES roadname (roadname_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS pothole (
      pothole_id INT NOT NULL AUTO_INCREMENT,
      road_id INT NOT NULL,
      pothole_depth FLOAT NOT NULL,
      pothole_width FLOAT NOT NULL,
      pothole_latitude DOUBLE NOT NULL,
      pothole_longitude DOUBLE NOT NULL,
      pothole_date DATE NOT NULL,
      pothole_url VARCHAR(300),
      PRIMARY KEY (pothole_id),
      FOREIGN KEY (road_id) REFERENCES road (road_id) ON DELETE CASCADE
    )`
  ];

  for (const query of createTableQueries) {
    await connection.query(query);
  }
  console.log('📦 새 테이블 생성 완료');

  // 데이터 업로드
  for (let i = 0; i < dataList.length; i++) {
    console.log(`⬆️ ${i + 1}/${dataList.length} 데이터 업로드 중...`);
    await uploadOne(dataList[i]);
  }

  await connection.end();
  console.log('🎉 마이그레이션 완료!');
}

module.exports = runMigration;
