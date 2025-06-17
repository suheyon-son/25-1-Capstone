const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Storage } = require('@google-cloud/storage');

const dataList = JSON.parse(fs.readFileSync(path.join(__dirname, 'migrate-data.json'), 'utf8')).slice(0, 150);

// GCP 버킷 설정
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_KEY_JSON),
});
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

async function uploadToGCP(localPath, destFileName) {
  await bucket.upload(localPath, {
    destination: destFileName,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });
  return `https://storage.googleapis.com/${bucketName}/${destFileName}`;
}

async function uploadOne(connection, data, index) {
  const fullImagePath = path.join(__dirname, 'images', data.imagePath);
  const destFileName = `potholes/pothole_${index + 1}.jpeg`;

  try {
    const imageUrl = await uploadToGCP(fullImagePath, destFileName);

    // pothole 데이터 삽입
    const sql = `
      INSERT INTO pothole (road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longitude, pothole_date, pothole_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.road_id,
      data.pothole_depth,
      data.pothole_width,
      data.pothole_latitude,
      data.pothole_longitude,
      data.pothole_date,
      imageUrl,
    ];

    await connection.query(sql, values);
    console.log(`✅ ${data.imagePath} 업로드 및 DB 삽입 완료`);

  } catch (err) {
    console.error(`❌ ${data.imagePath} 실패:`, err.message);
  }
}

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
  });

  await connection.query(`DROP TABLE IF EXISTS pothole`);
  await connection.query(`DROP TABLE IF EXISTS road`);
  await connection.query(`DROP TABLE IF EXISTS roadname`);
  console.log('🧹 기존 테이블 삭제 완료');

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

  for (let i = 0; i < dataList.length; i++) {
    console.log(`⬆️ ${i + 1}/${dataList.length} 데이터 업로드 중...`);
    await uploadOne(connection, dataList[i], i);
  }

  await connection.end();
  console.log('🎉 마이그레이션 완료!');
}

module.exports = runMigration;
