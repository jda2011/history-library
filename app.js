const express = require('express');
const cors = require('cors');
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
