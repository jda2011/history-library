const bcrypt = require('bcrypt');
const User = require('./models/User');

const initAdmin = async () => {
  try {
    // 이미 관리자 계정이 존재하는지 확인
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (!adminExists) {
      // 관리자 비밀번호 암호화 (사용할 비밀번호: admin1234)
      const hashedPassword = await bcrypt.hash('admin1234', 10);

      // 관리자 계정 생성
      await User.create({
        username: '관리자',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        grade: 'OVER_19'
      });

      console.log('★ 관리자 계정이 자동으로 생성되었습니다! (admin@example.com / admin1234)');
    }
  } catch (error) {
    console.error('관리자 생성 중 오류 발생:', error.message);
  }
};

module.exports = initAdmin;
