const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { format } = require('date-fns');
const path = require('path');
const connection = require('../database/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const roadaddr = require('./roadaddr'); // 도로명 주소 함수
const {
    findRoadId,
    getRoadSearch,
} = require('../database/query'); 
const router = express.Router();

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// 포트홀 이미지 및 데이터 DB 저장 함수
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

// POST /api/upload
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
    const fileUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;
    console.log('업로드 파일명:', filename);
    console.log('파일 URL:', fileUrl);

    // 위도/경도로 도로명 주소 가져오기
    const { roadAddress, jibunAddress } = await roadaddr.getRoadAddress(pothole_longitude, pothole_latitude);
    console.log('조회된 도로명 주소:', roadAddress);
    console.log('조회된 지번 주소:', jibunAddress);

    let roadnameId = null;

    if (roadAddress) {
      const query = findRoadId(roadAddress, null);
      console.log('도로명 주소 쿼리:', query);
      if (query && query.sql && query.values && query.values.every(v => v !== undefined && v !== null)) {
        const [rows] = await connection.promise().query(query.sql, query.values);
        console.log('도로명 주소 쿼리 결과:', rows);
        if (rows.length > 0) {
          roadnameId = rows[0].roadname_id;
          console.log('도로명 주소에서 찾은 roadnameId:', roadnameId);
        }
      }
    }

    if (!roadnameId && jibunAddress) {
      const query = findRoadId(null, jibunAddress);
      console.log('지번 주소 쿼리:', query);
      if (query && query.sql && query.values && query.values.every(v => v !== undefined && v !== null)) {
        const [rows] = await connection.promise().query(query.sql, query.values);
        console.log('지번 주소 쿼리 결과:', rows);
        if (rows.length > 0) {
          roadnameId = rows[0].roadname_id;
          console.log('지번 주소에서 찾은 roadnameId:', roadnameId);
        }
      }
    }

    if (!roadnameId) {
      console.log('도로명 주소 또는 지번 주소로 roadname_id를 찾을 수 없습니다.');
      return res.status(400).json({ error: '도로명 주소 또는 지번 주소로 roadname_id를 찾을 수 없습니다.' });
    }

    const [existingRoad] = await connection.promise().query(`SELECT road_id FROM road WHERE roadname_id = ?`, [roadnameId]);
    console.log('기존 road 조회 결과:', existingRoad);
    let roadId = existingRoad.length > 0 ? existingRoad[0].road_id : null;

    const today = format(new Date(), 'yyyy-MM-dd');

    if (!roadId) {
      console.log('road 테이블에 새 도로 추가');
      const [result] = await connection.promise().query(
        `INSERT INTO road (roadname_id, road_lastdate, road_lastfixdate, road_danger, road_count, road_state)
         VALUES (?, ?, NULL, NULL, 1, 0)`,
        [roadnameId, today]
      );
      roadId = result.insertId;
    } else {
      console.log('기존 도로 업데이트, roadId:', roadId);
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

router.get('/api/roadSearch', (req, res) => {
  const { field, query: searchValue } = req.query;
  const fieldMap = {
    roadName: 'roadname_roadname',
    potholeCount: 'road_count',
    risk: 'road_danger',
    lastMeasuredAt: 'road_lastdate',
    lastRepairedAt: 'road_lastfixdate',
    status: 'road_state',
    pothole_url: 'pothole_url',
  };

  const dbField = fieldMap[field];
  let sql = '', params = [];

  if (dbField && searchValue) {
    const numberFields = ['road_count', 'road_danger'];
    if (numberFields.includes(dbField)) {
      sql = `
        SELECT n.roadname_roadname, r.road_count, r.road_danger, 
               r.road_lastdate, r.road_lastfixdate, r.road_state
        FROM roadname n
        INNER JOIN road r ON n.roadname_id = r.roadname_id
        WHERE ${dbField} = ?
        ORDER BY n.roadname_roadname
      `;
      params = [parseInt(searchValue)];
    } else {
      sql = `
        SELECT n.roadname_roadname, r.road_count, r.road_danger, 
               r.road_lastdate, r.road_lastfixdate, r.road_state
        FROM roadname n
        INNER JOIN road r ON n.roadname_id = r.roadname_id
        WHERE ${dbField} LIKE ?
        ORDER BY n.roadname_roadname
      `;
      params = [`%${searchValue}%`];
    }
  } else {
    // 기본 전체 조회 쿼리
    const roadQuery = getRoadSearch();
    sql = roadQuery.sql;
    params = roadQuery.values;
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('roadSearch 쿼리 오류:', err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    res.json(results);
  });
});

module.exports = router;
