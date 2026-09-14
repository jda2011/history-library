const mongoose = require('mongoose');

let isConnected = false; // DB 연결 상태 추적

const connectDB = async () => {
  // 이미 연결되어 있다면 기존 연결 재사용
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB Atlas 연결 성공!');
  } catch (error) {
    console.error('MongoDB Atlas 연결 실패:', error.message);
    throw error;
  }
};

module.exports = connectDB;
