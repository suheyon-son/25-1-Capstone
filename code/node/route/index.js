const express = require('express');
const router = express.Router();

const uploadRouter = require('./upload');
const addressRouter = require('./address');
const potholeRouter = require('./pothole');
const flaskRouter = require('./flask');

router.use(uploadRouter);
router.use(addressRouter);
router.use(potholeRouter);
router.use(flaskRouter);

module.exports = router;