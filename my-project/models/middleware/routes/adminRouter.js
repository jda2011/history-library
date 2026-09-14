const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/auth/register - 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, grade, adminCode } = req.body;

    if (!username || !password || !grade) {
      return res.status(400).json({ message: '아이디, 비밀번호, 학년을 모두 입력해 주세요.' });
    }

    // 1. 아이디 중복 체크
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    // 2. 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. 관리자 비밀코드 확인 (원하는 코드로 수정 가능)
    let userRole = 'user';
    if (adminCode && adminCode === 'mySuperSecret123') {
      userRole = 'admin';
    }

    // 4. 데이터 저장
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

// POST /api/auth/login - 로그인
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

    res.json({
      message: '로그인 성공!',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        grade: user.grade
      }
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 실패', error: error.message });
  }
});

module.exports = router;
