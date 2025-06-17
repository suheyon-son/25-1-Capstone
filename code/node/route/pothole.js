const express = require('express');
const connection = require('../database/db');
const query = require('../database/query');
const router = express.Router();
const { getRoadSearch } = query;

router.get('/api/pothole-location', (req, res) => {
  const {
    roadname_sido,
    roadname_sigungu,
    roadname_emd,
    roadname_roadname,
    depthMin,
    depthMax,
    widthMin,
    widthMax,
    dangerMin,
    dangerMax,
  } = req.query;

  const conditions = [];
  const values = [];

  // 기본 지역 필터링
  if (roadname_sido) {
    conditions.push('n.roadname_sido = ?');
    values.push(roadname_sido);
  }
  if (roadname_sigungu) {
    conditions.push('n.roadname_sigungu = ?');
    values.push(roadname_sigungu);
  }
  if (roadname_emd) {
    conditions.push('n.roadname_emd = ?');
    values.push(roadname_emd);
  }
  if (roadname_roadname) {
    conditions.push('n.roadname_roadname = ?');
    values.push(roadname_roadname);
  }

  // 숫자 필터링
  if (depthMin) {
    conditions.push('p.pothole_depth >= ?');
    values.push(parseFloat(depthMin));
  }
  if (depthMax) {
    conditions.push('p.pothole_depth <= ?');
    values.push(parseFloat(depthMax));
  }
  if (widthMin) {
    conditions.push('p.pothole_width >= ?');
    values.push(parseFloat(widthMin));
  }
  if (widthMax) {
    conditions.push('p.pothole_width <= ?');
    values.push(parseFloat(widthMax));
  }
  if (dangerMin) {
    conditions.push('p.pothole_danger >= ?');
    values.push(parseFloat(dangerMin));
  }
  if (dangerMax) {
    conditions.push('p.pothole_danger <= ?');
    values.push(parseFloat(dangerMax));
  }

  // 최종 SQL
  let sql = `
    SELECT p.pothole_longitude as x, p.pothole_latitude as y
    FROM (roadname n 
    INNER JOIN road r ON n.roadname_id = r.roadname_id) 
    INNER JOIN pothole p ON r.road_id = p.road_id
  `;

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // ✅ 로그 출력
  console.log('🟡 최종 SQL:', sql);
  console.log('🟡 파라미터:', values);

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('🔴 쿼리 에러:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
    console.log('🟢 조회 결과:', results);
    res.json(results);
  });
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
