const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const csv = require('csv-parser');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
  });

  // 테이블 생성 쿼리를 하나씩 실행
  const createTableQueries = [
    `CREATE TABLE IF NOT EXISTS roadname (
      roadname_id INT NOT NULL,
      roadname_sido VARCHAR(30) NOT NULL,
      roadname_sigungu VARCHAR(30) NOT NULL,
      roadname_emd VARCHAR(30) NOT NULL,
      roadname_roadname VARCHAR(30) NOT NULL,
      PRIMARY KEY (roadname_id)
    )`,

    `CREATE TABLE IF NOT EXISTS road (
      road_id INT NOT NULL,
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
      pothole_url VARCHAR(100),
      PRIMARY KEY (pothole_id),
      FOREIGN KEY (road_id) REFERENCES road (road_id) ON DELETE CASCADE
    )`
  ];

  for (const query of createTableQueries) {
    await connection.query(query);
  }

  // 마지막 roadname_id가 184124 이상 있으면 마이그레이션 건너뜀
  const [rows] = await connection.query(
    `SELECT COUNT(*) as count FROM roadname WHERE roadname_id = 184124`
  );
  if (rows[0].count > 0) {
    console.log('🟡 roadname_id 184124가 이미 존재합니다. 마이그레이션을 건너뜁니다.');
    await connection.end();
    return;
  }

  // CP949로 인코딩된 CSV 읽기
  const csvFilePath = path.resolve(__dirname, 'roadname_data.csv');
  const csvData = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(iconv.decodeStream('cp949'))
      .pipe(csv())
      .on('data', (row) => csvData.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  for (const row of csvData) {
    if (!row.roadname_id || isNaN(row.roadname_id)) continue;

    const values = [
      parseInt(row.roadname_id, 10),
      row.roadname_sido?.trim() || '',
      row.roadname_sigungu?.trim() || '',
      row.roadname_emd?.trim() || '',
      row.roadname_roadname?.trim() || ''
    ];

    await connection.execute(
      `INSERT IGNORE INTO roadname (roadname_id, roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname) VALUES (?, ?, ?, ?, ?)`,
      values
    );
  }

  console.log('✅ roadname 테이블 마이그레이션 완료');
  await connection.end();
}

runMigration().catch((err) => {
  console.error('❌ 마이그레이션 실패:', err);
});