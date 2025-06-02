const express = require('express');
const router = express.Router();
const axios = require('axios');

// 플라스크 서버 호출 테스트
router.get('/api/flask-test', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: '플라스크 서버 호출 실패' });
  }
});

module.exports = router;
