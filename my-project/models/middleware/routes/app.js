require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const adminRouter = require('./routes/adminRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// JSON 요청 바디 파싱 미들웨어
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 연결 완료'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

// 관리자 전용 API 라우트 등록
app.use('/api/admin', adminRouter);

// 기본 상태 체크 라우트
app.get('/', (req, res) => {
  res.send('Quiz App API Server is running');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const adminRouter = require('./routes/adminRouter');

const app = express();

// JSON 파싱 미들웨어
app.use(express.json());

// 모든 API 요청 처리 전에 DB 연결 상태 확인
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: '데이터베이스 연결 오류', error: error.message });
  }
});

// 관리자 라우트 연결
app.use('/api/admin', adminRouter);

// 서버 상태 확인용 루트 경로
app.get('/', (req, res) => {
  res.send('Quiz App API Server is running');
});

// Vercel Serverless 배포를 위한 모듈 내보내기
module.exports = app;

const configRouter = require('./routes/configRouter');

// ... 기존 미들웨어 및 라우터 설정 아래에 추가 ...

// 사용자용 화면 설정 API
app.use('/api/config', configRouter);

// 관리자 API
app.use('/api/admin', adminRouter);

const express = require('express');
const connectDB = require('./db');
const initAdmin = require('./initAdmin'); // 1. initAdmin 불러오기

const app = express();
app.use(express.json());

// 데이터베이스 연결 및 관리자 자동 생성
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin(); // 2. 요청 처리 전 관리자 계정 유무 확인 후 자동 생성
    next();
  } catch (error) {
    res.status(500).json({ message: '데이터베이스 연결 오류', error: error.message });
  }
});

// ... (기존 라우터 설정들)

module.exports = app;

const connectDB = require('./db');
const initAdmin = require('./initAdmin'); // 불러오기

// DB 연결 미들웨어
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin(); // 계정이 없으면 입력하신 정보로 자동 생성
    next();
  } catch (error) {
    res.status(500).json({ message: 'DB 연결 오류', error: error.message });
  }
});
