const express = require('express');
const path = require('path');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const connection = require('../database/db'); // DB 연결
const query = require('../database/query');   // 쿼리 함수
require('dotenv').config();
const roadaddr = require('../route/roadaddr'); // 주소 변환 모듈

const router = express.Router();

// GCP 키 디코딩
const gcpKey = JSON.parse(Buffer.from(process.env.GCP_SA_KEY_BASE64, 'base64').toString('utf-8'));

// GCS 객체 생성
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: gcpKey,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// 로컬 임시 저장용 multer 설정
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// pothole 데이터 저장 함수
function saveImageRecord(data) {
  return new Promise((resolve, reject) => {
    const sql = query.insertPothole();
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

// 이미지 업로드 핸들러 예시
router.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const localPath = req.file.path;
    const gcsFileName = `pothole/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(gcsFileName);

    // GCS에 업로드
    await bucket.upload(localPath, {
      destination: gcsFileName,
      resumable: false,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // 공개 URL 생성
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;

    // 임시 파일 삭제
    fs.unlinkSync(localPath);

    // 예시 데이터 저장
    await saveImageRecord({
      road_id: 1, // 실제 데이터로 바꾸세요
      pothole_depth: 5,
      pothole_width: 20,
      pothole_latitude: 37.1234,
      pothole_longitude: 127.5678,
      pothole_date: new Date(),
      pothole_url: publicUrl,
    });

    res.json({ message: '업로드 성공', url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// ✅ 기본 API 예제
router.get('/api/hello', (req, res) => {
  res.json({ message: '안녕하세요!' });
});

router.get('/api/express-endpoint', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// ✅ Flask 호출 API
router.get('/api/call-flask', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const flaskRes = await fetch(process.env.FLASK_API_URL);
    const data = await flaskRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling Flask:', error);
    res.status(500).json({ error: 'Error calling Flask' });
  }
});

// ✅ 주소 계층형 필터 API
// 시도 목록 조회
router.get('/api/sido', (req, res) => {
  connection.query(query.getSidoList(), (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_sido));
  });
});

// 시군구 목록 조회
router.get('/api/sigungu/:sido', (req, res) => {
  const sido = req.params.sido;

  if (sido === '세종특별자치시'){
    return res.json([]);
  }

  const { sql, values } = query.getSigunguList(req.params.sido);
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_sigungu));
  });
});

// 읍면동 목록 조회 (시도만 선택된 경우)
router.get('/api/emd/:sido', (req, res) => {
  const { sql, values } = query.getEmdListBySido(req.params.sido);
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_emd));
  });
});

// 읍면동 목록 조회 (시군구 선택된 경우)
router.get('/api/emd/:sido/:sigungu', (req, res) => {
  const { sql, values } = query.getEmdList(
    req.params.sido,
    req.params.sigungu
  );
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_emd));
  });
});

// 도로명 목록 조회 (시도, 시군구, 읍면동 모두 선택된 경우)
router.get('/api/roadname/:sido/:sigungu/:emd', (req, res) => {
  const { sql, values } = query.getRoadnameList(
    req.params.sido,
    req.params.sigungu,
    req.params.emd
  );
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_roadname));
  });
});

// 도로명 목록 조회 (시도, 읍면동만 선택된 경우)
router.get('/api/roadname/:sido/:emd', (req, res) => {
    const { sql, values } = query.getRoadnameListbyEmd(
        req.params.sido,
        req.params.emd
    );
    connection.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results.map(row => row.roadname_roadname));
    });
});

// 포트홀 위치 조회 API
router.get('/api/pothole-location', (req, res) => {
  const filters = {
    sido: req.query.sido,
    sigungu: req.query.sigungu,
    emd: req.query.emd,
    roadname: req.query.road,
    depthMin: req.query.depthMin,
    depthMax: req.query.depthMax,
    widthMin: req.query.widthMin,
    widthMax: req.query.widthMax,
    dangerMin: req.query.dangerMin,
    dangerMax: req.query.dangerMax,
  }

  const { sql, values } = query.getPotholeLocation(filters);

  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ 포트홀 상세 정보 조회 API
router.get('/api/roadSearch', (req, res) => {
  const { field, query: searchValue } = req.query;
  
  const fieldMap = {
    roadName: "roadname_roadname",
    potholeCount: "road_count",
    risk: "road_danger",
    lastMeasuredAt: "road_lastdate",
    lastRepairedAt: "road_lastfixdate",
    status: "road_state",
  };

  const dbField = fieldMap[field];

  let sql = "";
  let params = [];

  if (dbField && searchValue) {
    const numberFields = ["road_count", "road_danger"];
      if (numberFields.includes(dbField)) {
        sql = `SELECT n.roadname_roadname, r.road_count, r.road_danger, r.road_lastdate, r.road_lastfixdate, r.road_state FROM roadname n INNER JOIN road r ON n.roadname_id = r.roadname_id WHERE ${dbField} = ? ORDER BY n.roadname_roadname`;
        params = [parseInt(searchValue)];
      } else {
        sql = `SELECT n.roadname_roadname, r.road_count, r.road_danger, r.road_lastdate, r.road_lastfixdate, r.road_state FROM roadname n INNER JOIN road r ON n.roadname_id = r.roadname_id WHERE ${dbField} LIKE ? ORDER BY n.roadname_roadname`;
        params = [`%${searchValue}%`];
      }
    } else {
      sql = query.getRoadSearch();
    }

    connection.query(sql, params, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
  });
});

// 포트홀 이미지 업로드 API
router.post('/api/upload', upload.single('file'), async (req, res) => {
  const connection = await getConnection(); // 커넥션 생성
  try {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const { pothole_depth, pothole_width, pothole_latitude, pothole_longitude, pothole_date } = req.body;
    if (!pothole_depth || !pothole_width || !pothole_latitude || !pothole_longitude || !pothole_date) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const filename = req.file.filename;
    const fileUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;
    const { roadAddress, jibunAddress } = await roadaddr.getRoadAddress(pothole_longitude, pothole_latitude);

    let roadnameId = null;

    // 1. 도로명 주소 기반 roadname_id 찾기
    if (roadAddress) {
      const { sql, values } = findRoadnameIdByRoadAddress(roadAddress);
      const [rows] = await connection.query(sql, values);
      if (rows.length > 0) roadnameId = rows[0].roadname_id;
    }

    // 2. 도로명 주소가 없거나 못 찾았으면 지번 주소로 대체
    if (!roadnameId && jibunAddress) {
      const jibunQuery = findRoadIdByJibunAddress(jibunAddress);
      if (jibunQuery) {
        const [rows] = await connection.query(jibunQuery.sql, jibunQuery.values);
        if (rows.length > 0) {
          const [roadRow] = await connection.query(`SELECT roadname_id FROM road WHERE road_id = ?`, [rows[0].road_id]);
          if (roadRow.length > 0) roadnameId = roadRow[0].roadname_id;
        }
      }
    }

    if (!roadnameId) {
      return res.status(400).json({ error: '도로명 주소 또는 지번 주소로 roadname_id를 찾을 수 없습니다.' });
    }

    // 3. 해당 roadname_id 기준 road 존재 여부 확인
    const [existingRoad] = await connection.query(`SELECT road_id FROM road WHERE roadname_id = ?`, [roadnameId]);
    let roadId = existingRoad.length > 0 ? existingRoad[0].road_id : null;

    // 4. 없으면 road 테이블에 신규 등록
    if (!roadId) {
      const [result] = await connection.query(
        `INSERT INTO road (roadname_id, road_lastdate, road_lastfixdate, road_danger, road_count, road_state, road_url) 
         VALUES (?, ?, NULL, NULL, 1, 0, ?)`,
        [roadnameId, format(new Date(), 'yyyy-MM-dd'), fileUrl]
      );
      roadId = result.insertId;
    } else {
      // 5. 이미 존재할 경우 road_count 업데이트
      await connection.query(
        `UPDATE road SET road_count = road_count + 1, road_lastdate = ? WHERE road_id = ?`,
        [format(new Date(), 'yyyy-MM-dd'), roadId]
      );
    }

    // 6. 포트홀 정보 저장
    await saveImageRecord({
      road_id: roadId,
      pothole_depth,
      pothole_width,
      pothole_latitude,
      pothole_longitude,
      pothole_date,
      pothole_url: fileUrl,
    });

    res.json({
      message: '업로드 및 DB 저장 성공',
      fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '서버 오류' });
  } finally {
    connection.release();
  }
});

// ✅ React SPA 라우팅
router.get(/^\/(?!api|static|assets).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'build', 'index.html'));
});

module.exports = router;
