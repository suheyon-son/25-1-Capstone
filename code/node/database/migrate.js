const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// JSON 데이터 불러오기
const dataList = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'migrate-data.json'), 'utf8')
);

// GCP 스토리지 초기화
const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// 이미지 업로드 함수
async function uploadToGCP(localFilePath, destFileName) {
  await bucket.upload(localFilePath, {
    destination: destFileName,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${destFileName}`;
}

// 하나의 pothole 데이터를 처리
async function uploadOne(connection, data) {
  const fullImagePath = path.join(__dirname, 'images', data.imagePath);

  if (!fs.existsSync(fullImagePath)) {
    console.error('❌ 이미지 파일 없음:', data.imagePath);
    return;
  }

  try {
    // 1. roadname 존재 확인
    const [roadnameRows] = await connection.query(
      `SELECT roadname_id FROM roadname WHERE 
        roadname_sido = ? AND 
        roadname_sigungu = ? AND 
        roadname_emd = ? AND 
        roadname_roadname = ?`,
      [
        data.roadname_sido,
        data.roadname_sigungu,
        data.roadname_emd,
        data.roadname_roadname
      ]
    );

    let roadnameId;
    if (roadnameRows.length > 0) {
      roadnameId = roadnameRows[0].roadname_id;
    } else {
      const [insertResult] = await connection.query(
        `INSERT INTO roadname (
          roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname
        ) VALUES (?, ?, ?, ?)`,
        [
          data.roadname_sido,
          data.roadname_sigungu,
          data.roadname_emd,
          data.roadname_roadname
        ]
      );
      roadnameId = insertResult.insertId;
    }

    // 2. road 삽입
    const [roadResult] = await connection.query(
      `INSERT INTO road (roadname_id) VALUES (?)`,
      [roadnameId]
    );
    const roadId = roadResult.insertId;

    // 3. 이미지 업로드
    const fileUrl = await uploadToGCP(fullImagePath, data.imagePath);

    // 4. pothole 삽입
    await connection.query(
      `INSERT INTO pothole (
        road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longitude, pothole_date, pothole_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        roadId,
        data.pothole_depth,
        data.pothole_width,
        data.pothole_latitude,
        data.pothole_longitude,
        data.pothole_date,
        fileUrl
      ]
    );

    console.log('✅ 저장 완료:', data.imagePath);

  } catch (err) {
    console.error('❌ 업로드 실패:', data.imagePath, err.message);
  }
}

// 마이그레이션 전체 실행
async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
  });
  console.log('📦 마이그레이션 시작');


  await connection.query(`DROP TABLE IF EXISTS pothole`);
  await connection.query(`DROP TABLE IF EXISTS road`);
  await connection.query(`DROP TABLE IF EXISTS roadname`);
  console.log('🧹 기존 테이블 삭제 완료');

  const createTableQueries = [
    `CREATE TABLE IF NOT EXISTS roadname (
      roadname_id INT NOT NULL AUTO_INCREMENT,
      roadname_sido VARCHAR(30) NOT NULL,
      roadname_sigungu VARCHAR(30) NOT NULL,
      roadname_emd VARCHAR(30) NOT NULL,
      roadname_roadname VARCHAR(30) NOT NULL,
      jibun_sido VARCHAR(30),
      jibun_sigungu VARCHAR(30),
      jibun_emd VARCHAR(30),
      jibun_other VARCHAR(30),
      jibun_number VARCHAR(30),
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
    console.log(`⬆️ ${i + 1}/${dataList.length}`);
    await uploadOne(connection, dataList[i]);
  }

  await connection.end();
  console.log('🎉 마이그레이션 완료!');
}

module.exports = runMigration;
