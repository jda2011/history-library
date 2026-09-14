const express = require('express');
const connectDB = require('./db');
const initAdmin = require('./initAdmin');

const authRouter = require('./routes/authRouter');
const configRouter = require('./routes/configRouter');
const adminRouter = require('./routes/adminRouter');

const app = express();
app.use(express.json());

// 데이터베이스 연결 및 관리자 계정 체크
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin(); // 초기 관리자 자동 생성
    next();
  } catch (error) {
    res.status(500).json({ message: 'DB 연결 오류 발생', error: error.message });
  }
});

// API 라우터 등록
app.use('/api/auth', authRouter);      // 회원가입, 로그인
app.use('/api/config', configRouter);  // 일반 사용자 화면 설정 불러오기
app.use('/api/admin', adminRouter);    // 관리자 기능 (설정 변경, 비번 변경 등)

module.exports = app;
