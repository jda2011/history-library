const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const { verifyAdmin } = require('../middleware/auth');

// 관리자 메인 배경 및 타이틀 수정 (PUT /api/admin/config)
router.put('/config', verifyAdmin, async (req, res) => {
  try {
    const { mainBannerTitle, mainBannerDescription, backgroundImageUrl, backgroundColor } = req.body;

    const updatedConfig = await SiteConfig.findOneAndUpdate(
      {},
      { 
        mainBannerTitle, 
        mainBannerDescription, 
        backgroundImageUrl,
        backgroundColor,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: '배경 및 화면 설정이 변경되었습니다.',
      config: updatedConfig
    });
  } catch (error) {
    res.status(500).json({ message: '설정 변경 실패', error: error.message });
  }
});

module.exports = router;
