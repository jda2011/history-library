const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  grade: {
    type: String,
    required: true,
    enum: [
      'UNDER_13',  // 13세 미만
      'ELEMENTARY_1', 'ELEMENTARY_2', 'ELEMENTARY_3', 'ELEMENTARY_4', 'ELEMENTARY_5', 'ELEMENTARY_6',
      'MIDDLE_1', 'MIDDLE_2', 'MIDDLE_3',
      'HIGH_1', 'HIGH_2', 'HIGH_3',
      'OVER_19'    // 19세 이상
    ]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
