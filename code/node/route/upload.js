const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const connection = require('../database/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const roadaddr = require('./roadaddr');
const { findRoadId } = require('../database/query');

const router = express.Router();

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

const upload = multer({
  dest: path.join(__dirname, '../temp/'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function saveImageRecord(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO pothole (road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longitude, pothole_date, pothole_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.road_id,
      data.pothole_depth,
      data.pothole_width,
      data.pothole_latitude,
      data.pothole_longitude,
      data.pothole_date,
      data.pothole_url,
    ];
    connection.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function parseRoadAddress(fullAddress) {
  if (!fullAddress) return null;
  const parts = fullAddress.trim().split(/\s+/);
  return {
    sido: parts[0] || '',
    sigungu: parts[1] || '',
    emd: parts[2] || '',
    roadname: parts[3] || '',
  };
}

function parseJibunAddress(fullAddress) {
  if (!fullAddress) return null;
  const parts = fullAddress.trim().split(/\s+/);
  return {
    sido: parts[0] || '',
    sigungu: parts[1] || '',
    emd: parts[2] || '',
    other: parts[3] || null,
    number: parts[4] || null,
  };
}

router.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.log('파일이 없습니다.');
    return res.status(400).json({ error: '파일이 없습니다.' });
  }

  const { pothole_depth, pothole_width, pothole_latitude, pothole_longitude, pothole_date } = req.body;
  if (!pothole_depth || !pothole_width || !pothole_latitude || !pothole_longitude || !pothole_date) {
    console.log('필수 정보가 누락됨:', req.body);
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
  }

  try {
    const filename = req.file.filename;
    const localFilePath = path.join(__dirname, '../temp', filename);

    // ✅ GCS에 업로드
    await bucket.upload(localFilePath, {
      destination: filename,
      contentType: req.file.mimetype,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log('✅ GCS 업로드 완료');

    // ✅ 로컬 임시파일 삭제
    fs.unlink(localFilePath, (err) => {
      if (err) console.error('❌ 로컬 파일 삭제 실패:', err);
      else console.log('🧹 로컬 파일 삭제 완료');
    });

    const fileUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;
    console.log('파일 URL:', fileUrl);

    const { roadAddress, jibunAddress } = await roadaddr.getRoadAddress(pothole_longitude, pothole_latitude);
    console.log('조회된 도로명 주소:', roadAddress);
    console.log('조회된 지번 주소:', jibunAddress);

    let roadnameId = null;

    if (roadAddress) {
      const query = findRoadId(roadAddress, null);
      if (query && query.sql && query.values.every(v => v !== undefined && v !== null)) {
        const [rows] = await connection.promise().query(query.sql, query.values);
        if (rows.length > 0) roadnameId = rows[0].roadname_id;
      }
    }

    if (!roadnameId && jibunAddress) {
      const query = findRoadId(null, jibunAddress);
      if (query && query.sql && query.values.every(v => v !== undefined && v !== null)) {
        const [rows] = await connection.promise().query(query.sql, query.values);
        if (rows.length > 0) roadnameId = rows[0].roadname_id;
      }
    }

    if (!roadnameId) {
      if (!roadAddress && !jibunAddress) {
        return res.status(400).json({ error: '주소 정보가 없어 roadname을 추가할 수 없습니다.' });
      }

      const parsedRoad = parseRoadAddress(roadAddress);
      const parsedJibun = parseJibunAddress(jibunAddress);

      const [insertResult] = await connection.promise().query(
        `INSERT INTO roadname (
          roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname,
          jibun_sido, jibun_sigungu, jibun_emd, jibun_other, jibun_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parsedRoad?.sido || '', parsedRoad?.sigungu || '', parsedRoad?.emd || '', parsedRoad?.roadname || '',
          parsedJibun?.sido || null, parsedJibun?.sigungu || null, parsedJibun?.emd || null,
          parsedJibun?.other || null, parsedJibun?.number || null,
        ]
      );
      roadnameId = insertResult.insertId;
    }

    const [existingRoad] = await connection.promise().query(`SELECT road_id FROM road WHERE roadname_id = ?`, [roadnameId]);
    let roadId = existingRoad.length > 0 ? existingRoad[0].road_id : null;

    const today = format(new Date(), 'yyyy-MM-dd');

    if (!roadId) {
      const [result] = await connection.promise().query(
        `INSERT INTO road (roadname_id, road_lastdate, road_lastfixdate, road_danger, road_count, road_state)
         VALUES (?, ?, NULL, NULL, 1, 0)`,
        [roadnameId, today]
      );
      roadId = result.insertId;
    } else {
      await connection.promise().query(
        `UPDATE road SET road_count = road_count + 1, road_lastdate = ? WHERE road_id = ?`,
        [today, roadId]
      );
    }

    await saveImageRecord({
      road_id: roadId,
      pothole_depth,
      pothole_width,
      pothole_latitude,
      pothole_longitude,
      pothole_date,
      pothole_url: fileUrl,
    });

    console.log('포트홀 데이터 저장 완료');
    res.json({ message: '업로드 및 DB 저장 성공', fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
