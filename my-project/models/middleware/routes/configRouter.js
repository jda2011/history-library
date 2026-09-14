const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');

// GET /api/config - 메인 화면 설정 불러오기
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: '설정을 불러오는데 실패했습니다.', error: error.message });
  }
});

module.exports = router;
