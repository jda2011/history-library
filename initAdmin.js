const bcrypt = require('bcrypt');
const User = require('./models/User');

const initAdmin = async () => {
  try {
    // ⬇️ [수정] 원하시는 아이디(이메일)와 비밀번호를 입력하세요.
    const myAdminEmail = "my_id@example.com";    // 사용하실 아이디(이메일)
    const myAdminPassword = "myPassword123!";   // 사용하실 비밀번호

    // 이미 생성되어 있는지 확인
    const adminExists = await User.findOne({ email: myAdminEmail });

    if (!adminExists) {
      // 비밀번호 암호화 후 생성
      const hashedPassword = await bcrypt.hash(myAdminPassword, 10);

      await User.create({
        username: "관리자",
        email: myAdminEmail,
        password: hashedPassword,
        role: "admin",
        grade: "OVER_19"
      });

      console.log(`[완료] 관리자 계정이 생성되었습니다: ${myAdminEmail}`);
    }
  } catch (error) {
    console.error("관리자 계정 생성 오류:", error.message);
  }
};

module.exports = initAdmin;
