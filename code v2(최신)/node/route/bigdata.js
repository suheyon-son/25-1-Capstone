const express = require('express');
const connection = require('../database/db');
const router = express.Router();

// 포트홀 위치 조회 API
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

module.exports = router;