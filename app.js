npm install cors

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

const path = require('path');

// API 라우터 설정들 아래에 작성:
// public 폴더(또는 html 파일들이 있는 폴더)를 정적 디렉토리로 지정
app.use(express.static(path.join(__dirname, 'public'))); 

// 그 외 모든 경로 요청 시 index.html 반환
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

const cors = require('cors');
app.use(cors()); // 모든 도메인/포트에서의 요청 허용

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const initAdmin = require('./initAdmin');

const authRouter = require('./routes/authRouter');
const configRouter = require('./routes/configRouter');
const adminRouter = require('./routes/adminRouter');
const videoRouter = require('./routes/videoRouter');

const app = express();

app.use(cors());
app.use(express.json());

// static 파일 (html, css, js) 제공
app.use(express.static(path.join(__dirname)));

// DB 연결 및 초기화 미들웨어
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initAdmin();
    next();
  } catch (error) {
    res.status(500).json({ message: 'DB 연결 오류', error: error.message });
  }
});

// API 경로
app.use('/api/auth', authRouter);
app.use('/api/config', configRouter);
app.use('/api/admin', adminRouter);
app.use('/api/videos', videoRouter);

module.exports = app;
