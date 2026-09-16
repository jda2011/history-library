const express = require('express');
const cors = require('cors');
app.use(cors());
const connectDB = require('./db');
const initAdmin = require('./initAdmin');

// 라우터 모듈 불러오기
const authRouter = require('./routes/authRouter');
const configRouter = require('./routes/configRouter');
const adminRouter = require('./routes/adminRouter');
const videoRouter = require('./routes/videoRouter');

const app = express();

app.use(cors());
app.use(express.json());

// DB 연결 및 관리자 계정 체크 미들웨어
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin();
    next();
  } catch (error) {
    res.status(500).json({ message: 'DB 연결 오류', error: error.message });
  }
});

// API 경로 연결
app.use('/api/auth', authRouter);
app.use('/api/config', configRouter);
app.use('/api/admin', adminRouter);
app.use('/api/videos', videoRouter);

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const initAdmin = require('./initAdmin');

const authRouter = require('./routes/authRouter');
const configRouter = require('./routes/configRouter');
const adminRouter = require('./routes/adminRouter');
const videoRouter = require('./routes/videoRouter'); // 1. 동영상 라우터 불러오기

const app = express();

app.use(cors());
app.use(express.json());

// 데이터베이스 연결 및 초기 관리자 체크
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin();
    next();
  } catch (error) {
    res.status(500).json({ message: 'DB 연결 오류 발생', error: error.message });
  }
});

// API 경로 등록
app.use('/api/auth', authRouter);      // 회원가입, 로그인
app.use('/api/config', configRouter);  // 메인 화면 설정
app.use('/api/admin', adminRouter);    // 관리자 기능
app.use('/api/videos', videoRouter);   // 2. 동영상 및 퀴즈 등록/조회 API 연결

module.exports = app;
