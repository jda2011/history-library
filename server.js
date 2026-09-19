const path = require('path');

// API 라우터 설정들 아래에 작성:
// public 폴더(또는 html 파일들이 있는 폴더)를 정적 디렉토리로 지정
app.use(express.static(path.join(__dirname, 'public'))); 

// 그 외 모든 경로 요청 시 index.html 반환
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
