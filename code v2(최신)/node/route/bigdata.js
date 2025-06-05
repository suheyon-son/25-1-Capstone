const express = require('express');
const connection = require('../database/db');
const router = express.Router();

// 포트홀 월별 통계 API
router.get('/api/pothole-monthly-count', (req, res) => {
    const sql = `
        SELECT
            DATE_FORMAT(pothole_date, '%Y-%m') AS month_date,
            count(pothole_id) AS pothole_count
        FROM pothole
        GROUP BY month_date
        ORDER BY month_date DESC LIMIT 12;
    `;
    const values = [];

    connection.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 포트홀 계절별 통계 API
//!! 문제점 : 계절별 통계에서 봄/여름/가을/겨울을 나눌 기준이 명확하지 않음
//!! 임시 조치 : 분기별로 처리
router.get('/api/pothole-season-count', (req, res) => {
    const sql = `
        SELECT concat(year_date, '-', CASE season_rawdate
                WHEN 1 THEN '봄'
                WHEN 2 THEN '여름'
                WHEN 3 THEN '가을'
                WHEN 4 THEN '겨울'
                ELSE '알 수 없음'
            END) AS season_name, pothole_count
        FROM (SELECT
            YEAR(pothole_date) AS year_date,
            QUARTER(pothole_date) AS season_rawdate,
            COUNT(pothole_id) AS pothole_count
        FROM pothole
        GROUP BY year_date, season_rawdate
        ORDER BY year_date DESC, season_rawdate DESC
        LIMIT 8) AS season_result;
    `;
    const values = [];

    connection.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});



// 포트홀 날씨별 통계 API
//!! 문제점 : 날씨별 통계에서 날씨를 어떻게 구분할지 명확하지 않음


module.exports = router;