const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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