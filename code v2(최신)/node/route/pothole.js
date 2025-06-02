const express = require('express');
const connection = require('../database/db');
const query = require('../database/query');
const router = express.Router();

// 포트홀 위치 조회 API
router.get('/api/pothole-location', (req, res) => {
  const { roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname } = req.query;

  if (!roadname_sido) return res.status(400).json({ error: '시도 값이 필요합니다.' });

  let sqlQuery;

  if (roadname_sido && !roadname_sigungu) {
    sqlQuery = query.getPotholeLocationBySido(roadname_sido);
  } else if (roadname_sido && roadname_sigungu && !roadname_emd) {
    sqlQuery = query.getPotholeLocationBySigungu(roadname_sido, roadname_sigungu);
  } else if (roadname_sido && roadname_sigungu && roadname_emd && !roadname_roadname) {
    sqlQuery = query.getPotholeLocationByEmd(roadname_sido, roadname_sigungu, roadname_emd);
  } else if (roadname_sido && roadname_sigungu && roadname_emd && roadname_roadname) {
    sqlQuery = query.getPotholeLocationByRoadname(roadname_sido, roadname_sigungu, roadname_emd, roadname_roadname);
  } else {
    return res.status(400).json({ error: '잘못된 쿼리 파라미터입니다.' });
  }

  connection.query(sqlQuery.sql, sqlQuery.values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
