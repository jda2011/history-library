const bcrypt = require('bcrypt');
const User = require('./models/User');

const initAdmin = async () => {
  try {
    // ⬇️ 사용하고자 하는 관리자 아이디와 비밀번호 지정
    const myAdminId = "my_custom_admin_id"; 
    const myAdminPassword = "my_custom_password_123";

    const adminExists = await User.findOne({ username: myAdminId });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(myAdminPassword, 10);

      await User.create({
        username: myAdminId,
        password: hashedPassword,
        role: 'admin',
        grade: 'OVER_19'
      });

      console.log(`[초기화 성공] 관리자 계정이 생성되었습니다: ${myAdminId}`);
    }
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error.message);
  }
};

module.exports = initAdmin;
