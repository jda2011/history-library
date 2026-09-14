const bcrypt = require('bcrypt');
const User = require('./models/User');

const initAdmin = async () => {
  try {
    // 1. 내가 원하는 이메일(아이디)로 설정
    const myEmail = 'myid@naver.com'; // <--- 원하는 아이디/이메일 입력
    const myPassword = 'myPassword123!'; // <--- 원하는 비밀번호 입력

    const adminExists = await User.findOne({ email: myEmail });

    if (!adminExists) {
      // 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(myPassword, 10);

      // 관리자 계정 생성
      await User.create({
        username: '내관리자닉네임', // <--- 원하는 닉네임 입력
        email: myEmail,
        password: hashedPassword,
        role: 'admin',
        grade: 'OVER_19'
      });

      console.log(`★ 관리자 계정이 생성되었습니다! (${myEmail})`);
    }
  } catch (error) {
    console.error('관리자 생성 중 오류 발생:', error.message);
  }
};

module.exports = initAdmin;
