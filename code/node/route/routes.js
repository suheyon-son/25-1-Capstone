const express = require('express');
const path = require('path');
const connection = require('../database/db'); // DB 연결
const query = require('../database/query');   // 쿼리 함수
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

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


const getRandomFilename = function(){
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hash = crypto.randomBytes(32).toString('hex');
  return `${yyyy}${mm}${dd}_${hash}`;
}

// ✅ 포트홀 정보 저장 API
// 이미지 업로드를 위한 POST 요청
router.post('api/send-image', async (req, res) => {
  const body = req.body;
  const pothole_info = JSON.parse(req.headers['pothole_info']);
  const image_path = getRandomFilename();
  const [latitude, longitude] = pothole_info;
  const depth = null; // 포트홀 깊이 정보를 서버에서 처리하고 받을지 모름
  const width = null; // 포트홀 너비 정보를 서버에서 처리하고 받을지 모름
  const danger = null; // 포트홀 위험도 정보를 서버에서 처리하고 받을지 모름
  // 이미지에 대한 추가 처리가 가능합니다.
  fs.writeFileSync(".."+image_path, body.image);
  connection.query({
    sql : `INSERT INTO pothole (
      road_id, pothole_latitude, pothole_longitude,
      pothole_depth, pothole_width, pothole_danger
    ) VALUES (
      NULL, ?, ?,
      ?, ?, ?
    )`,
    // 쿼리 미완성 : 실제 쿼리 작성 필요
    values: [latitude, longitude, depth, width, danger, image_path],
  }, (err, results) => {
    if (err) {
      return res.status(500).json({message: 'fail', error: err.message});
    }else{
      res.json({message: 'success'});
    }
  });
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

// ✅ React SPA 라우팅
router.get(/^\/(?!api|static|assets).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'build', 'index.html'));
});

module.exports = router;
