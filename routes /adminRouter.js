
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

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // 토큰 발급용
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

// POST /api/auth/register - 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, grade, adminCode } = req.body;

    if (!username || !password || !grade) {
      return res.status(400).json({ message: '아이디, 비밀번호, 학년을 모두 입력해 주세요.' });
    }

    // 아이디 중복 체크
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 비밀코드 확인으로 관리자 지정
    let userRole = 'user';
    if (adminCode && adminCode === 'mySuperSecret123') {
      userRole = 'admin';
    }

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      grade,
      role: userRole
    });

    await newUser.save();

    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      role: userRole
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }
    res.status(500).json({ message: '회원가입 실패', error: error.message });
  }
});

// POST /api/auth/login - 로그인 (JWT 토큰 발급)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해 주세요.' });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(400).json({ message: '존재하지 않는 아이디입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 🔑 JWT 토큰 생성 (미들웨어 auth.js와 연동)
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: '로그인 성공!',
      token, // 프론트엔드로 토큰 전달
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        grade: user.grade,
        points: user.points,
        badgeRank: user.badgeRank
      }
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 실패', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const { verifyAdmin } = require('../middleware/auth'); // 보안 미들웨어 연결

// PUT /api/admin/config - 관리자 전용 배경 및 메인 설정 변경
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
      message: '배경 및 화면 설정이 성공적으로 저장되었습니다.',
      config: updatedConfig
    });
  } catch (error) {
    res.status(500).json({ message: '설정 수정 실패', error: error.message });
  }
});

module.exports = router;
