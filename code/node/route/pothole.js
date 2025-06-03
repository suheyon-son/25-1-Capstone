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

  if (!roadname_sido) {
    return res.status(400).json({ error: '시도 값이 필요합니다.' });
  }

  const filters = {
    sido: roadname_sido,
    sigungu: roadname_sigungu,
    emd: roadname_emd,
    roadname: roadname_roadname,
    depthMin: depthMin ? parseFloat(depthMin) : null,
    depthMax: depthMax ? parseFloat(depthMax) : null,
    widthMin: widthMin ? parseFloat(widthMin) : null,
    widthMax: widthMax ? parseFloat(widthMax) : null,
    dangerMin: dangerMin ? parseFloat(dangerMin) : null,
    dangerMax: dangerMax ? parseFloat(dangerMax) : null,
  };

  const sqlQuery = query.getPotholeLocation(filters);

  connection.query(sqlQuery.sql, sqlQuery.values, (err, results) => {
    if (err) {
      console.error('쿼리 에러:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
    res.json(results); // ✅ createMarker(x, y)에서 바로 쓸 수 있는 배열로 응답
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
