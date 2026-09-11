const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // 보기의 인덱스 번호 (0, 1, 2, 3 등)
    required: true
  },
  level: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
