const mongoose = require('mongoose');

// 관리자가 직접 입력하는 퀴즈 문항 구조 (4~5개)
const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // 보기 4개
  correctAnswer: { type: Number, required: true } // 정답 번호 인덱스 (0~3)
});

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true }, // 관리자가 직접 넣는 동영상 URL
  targetGrade: [{ type: String }],           // 대상 연령대
  quizzes: [quizSchema],                     // 퀴즈 문항 배열
  rewardPoints: { type: Number, default: 10 },// 퀴즈 완주 시 보상 포인트
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
