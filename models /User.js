
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 아이디 (중복 가입 차단)
  username: { 
    type: String, 
    required: [true, '아이디를 입력해 주세요.'], 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, '비밀번호를 입력해 주세요.'] 
  },
  role: { 
    type: String, 
    default: 'user' // 'user' 또는 'admin'
  },
  // 요청하신 9단계 연령대 체계
  grade: {
    type: String,
    required: true,
    enum: [
      'UNDER_13',     // 만 13세 미만
      'ELEMENTARY_6', // 초등학교 6학년
      'MIDDLE_1', 'MIDDLE_2', 'MIDDLE_3', // 중 1~3
      'HIGH_1', 'HIGH_2', 'HIGH_3',       // 고 1~3
      'OVER_19'       // 만 19세 이상
    ]
  },
  points: { type: Number, default: 0 },             // 퀴즈 통과 시 획득, 비난 언행 시 -3점
  badgeRank: { type: String, default: '초보 사관' }, // 포인트 랭크업 배지
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
