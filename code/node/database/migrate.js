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

  const createRoadnameTableSQL = `
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

    CREATE TABLE IF NOT EXISTS pothole(
      pothole_id INT  NOT NULL AUTO_INCREMENT,
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

  await connection.execute(createRoadnameTableSQL);

  const csvFilePath = path.resolve(__dirname, 'roadname_data.csv');
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });

  for (const row of rows) {

    const values = [
      parseInt(row.roadname_id, 10),
      row.roadname_sido,
      row.roadname_sigungu,
      row.roadname_emd,
      row.roadname_roadname,
    ];

    await connection.execute(
      `INSERT INTO roadname (roadname_id, roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname) VALUES (?, ?, ?, ?, ?)`,
      values
    );
  }

  console.log('roadname 테이블 마이그레이션 완료');
  await connection.end();
}

runMigration().catch((err) => {
  console.error('마이그레이션 실패:', err);
  process.exit(1);
});

module.exports = runMigration;