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

  try {
    // 테이블 생성 (각각 개별 실행)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roadname (
        roadname_id INT NOT NULL,
        roadname_sido VARCHAR(30) NOT NULL,
        roadname_sigungu VARCHAR(30) NOT NULL,
        roadname_emd VARCHAR(30) NOT NULL,
        roadname_roadname VARCHAR(30) NOT NULL,
        PRIMARY KEY (roadname_id)
      );
    `);

    await connection.execute(`
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
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pothole(
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
    `);

    console.log('✅ 테이블 생성 완료');

    // CSV 파일 로드
    const csvFilePath = path.resolve(__dirname, 'roadname_data.csv');
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // 유효성 검사: 숫자가 아닌 경우 무시 (예: 헤더 줄이 포함됐을 때)
          if (!isNaN(data.roadname_id)) {
            rows.push(data);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // 데이터 삽입
    for (const row of rows) {
      const values = [
        parseInt(row.roadname_id, 10),
        row.roadname_sido,
        row.roadname_sigungu,
        row.roadname_emd,
        row.roadname_roadname,
      ];

      try {
        await connection.execute(
          `INSERT INTO roadname (roadname_id, roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname)
           VALUES (?, ?, ?, ?, ?)`,
          values
        );
      } catch (err) {
        console.warn('⚠️ 데이터 삽입 중 오류 (중복 또는 잘못된 형식일 수 있음):', err.message);
      }
    }

    console.log('✅ roadname 테이블 마이그레이션 완료');
  } catch (err) {
    console.error('❌ 마이그레이션 실패:', err);
  } finally {
    await connection.end();
  }
}

module.exports = runMigration;

// 직접 실행되었을 때만 실행 (다른 곳에서 require 시 실행 안 되게)
if (require.main === module) {
  runMigration().catch((err) => {
    console.error('❌ 예외 발생:', err);
  });
}
