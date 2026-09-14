const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const SiteConfig = require('../models/SiteConfig');
const User = require('../models/User');

// PUT /api/admin/config - 메인 화면 설정 수정
router.put('/config', async (req, res) => {
  try {
    const { mainBannerTitle, mainBannerDescription, heroVideoUrl } = req.body;

    const updatedConfig = await SiteConfig.findOneAndUpdate(
      {},
      { 
        mainBannerTitle, 
        mainBannerDescription, 
        heroVideoUrl,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: '메인 화면 설정이 변경되었습니다.',
      config: updatedConfig
    });
  } catch (error) {
    res.status(500).json({ message: '화면 설정 수정 실패', error: error.message });
  }
});

// PUT /api/admin/change-password - 비밀번호 변경
router.put('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '비밀번호 변경 실패', error: error.message });
  }
});

module.exports = router;
