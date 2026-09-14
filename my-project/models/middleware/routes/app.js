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
