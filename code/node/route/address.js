const express = require('express');
const connection = require('../database/db');
const query = require('../database/query');
const router = express.Router();

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

  if (sido === '세종특별자치시') {
    return res.json([]);
  }

  const { sql, values } = query.getSigunguList(sido);
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
  const { sql, values } = query.getEmdList(req.params.sido, req.params.sigungu);
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_emd));
  });
});

// 도로명 목록 조회 (시도, 시군구, 읍면동 모두 선택된 경우)
router.get('/api/roadname/:sido/:sigungu/:emd', (req, res) => {
  const { sql, values } = query.getRoadnameList(req.params.sido, req.params.sigungu, req.params.emd);
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_roadname));
  });
});

// 도로명 목록 조회 (시도, 읍면동만 선택된 경우)
router.get('/api/roadname/:sido/:emd', (req, res) => {
  const { sql, values } = query.getRoadnameListbyEmd(req.params.sido, req.params.emd);
  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(row => row.roadname_roadname));
  });
});

module.exports = router;
