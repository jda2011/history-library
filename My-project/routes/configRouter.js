// routes/configRouter.js
const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');

// 메인 화면 배경 및 타이틀 설정 조회 (GET /api/config)
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({}); // 기본 설정 자동 생성
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: '설정 조회 실패', error: error.message });
  }
});

module.exports = router;
