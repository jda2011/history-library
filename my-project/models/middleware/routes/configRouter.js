const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');

// GET /api/config - 메인 화면 설정 불러오기 (로그인 불필요)
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    
    // 설정이 아직 없다면 기본값으로 생성
    if (!config) {
      config = await SiteConfig.create({});
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: '설정을 불러오는데 실패했습니다.', error: error.message });
  }
});

module.exports = router;
