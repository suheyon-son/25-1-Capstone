const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
  });

  // 테이블 존재 여부 확인
  const [existingTables] = await connection.execute(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'roadname'
  `, [process.env.DATABASE_DATABASE]);

  // 이미 존재한다면 마이그레이션 생략
  if (existingTables.length > 0) {
    console.log('✅ roadname 테이블이 이미 존재합니다. 마이그레이션을 건너뜁니다.');
    await connection.end();
    return;
  }

  // 테이블 생성
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS roadname (
      roadname_id INT NOT NULL,
      roadname_sido VARCHAR(30) NOT NULL,
      roadname_sigungu VARCHAR(30) NOT NULL,
      roadname_emd VARCHAR(30) NOT NULL,
      roadname_roadname VARCHAR(30) NOT NULL,
      PRIMARY KEY (roadname_id)
    );

    CREATE TABLE IF NOT EXISTS road (
      road_id INT NOT NULL,
      roadname_id INT NOT NULL,
      road_lastdate DATE NULL,
      road_lastfixdate DATE NULL,
      road_danger FLOAT NULL,
      road_count INT NULL,
      road_state INT NULL,
      PRIMARY KEY (road_id),
      FOREIGN KEY (roadname_id) REFERENCES roadname (roadname_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pothole (
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
    );
  `;

  // 여러 쿼리 실행 가능하도록 설정
  await connection.query(createTableSQL);

  // CSV 파일 경로
  const csvFilePath = path.resolve(__dirname, 'roadname_data.csv');
  const rows = [];

  // CSV 파싱
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv()) // 기본 쉼표(,) 사용
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📄 ${rows.length}개의 행을 읽었습니다.`);

  for (const row of rows) {
    const values = [
      parseInt(row.roadname_id || '0', 10) || null,
      row.roadname_sido || null,
      row.roadname_sigungu || null,
      row.roadname_emd || null,
      row.roadname_roadname || null,
    ];

    // undefined 방지: 모든 값이 null 아닌 경우만 insert
    if (values.every(v => v !== null)) {
      await connection.execute(
        `INSERT INTO roadname (roadname_id, roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname) VALUES (?, ?, ?, ?, ?)`,
        values
      );
    }
  }

  console.log('✅ roadname 테이블 마이그레이션 완료');
  await connection.end();
}

runMigration().catch((err) => {
  console.error('❌ 마이그레이션 실패:', err);
  process.exit(1);
});

module.exports = runMigration;