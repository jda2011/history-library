const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB 연결 (환경 변수 또는 DB URI)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/history_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB 연결 성공!'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

// 1. 회원가입 API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, ageGroup } = req.body;

    if (!username || !password || !ageGroup) {
      return res.status(400).json({ message: ' 모든 필드를 입력해 주세요.' });
    }

    // 아이디 중복 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 저장
    const newUser = new User({
      username,
      password: hashedPassword,
      ageGroup
    });

    await newUser.save();
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 2. 로그인 API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    res.status(200).json({
      message: '로그인 성공!',
      user: {
        username: user.username,
        points: user.points,
        ageGroup: user.ageGroup
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
