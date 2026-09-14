const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

// 모든 관리자 라우트에 인증 미들웨어 적용
router.use(authAdmin);

/**
 * [PUT] /api/admin/user/:userId/level
 * 사용자 레벨 수정
 */
router.put('/user/:userId/level', async (req, res) => {
  try {
    const { userId } = req.params;
    const { level } = req.body;

    if (level === undefined || typeof level !== 'number') {
      return res.status(400).json({ message: '올바른 level 숫자 값을 입력하세요.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { level },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }

    res.json({
      message: '사용자 레벨이 성공적으로 업데이트되었습니다.',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

/**
 * [POST] /api/admin/quiz
 * 신규 퀴즈 등록
 */
router.post('/quiz', async (req, res) => {
  try {
    const { question, options, correctAnswer, level } = req.body;

    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ message: '필수 입력 필드가 누락되었습니다.' });
    }

    const newQuiz = new Quiz({
      question,
      options,
      correctAnswer,
      level: level || 1
    });

    await newQuiz.save();

    res.status(201).json({
      message: '새로운 퀴즈가 성공적으로 생성되었습니다.',
      quiz: newQuiz
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;

// 메인 화면 기본 설정 변경 (관리자 전용)
router.put('/config', async (req, res) => {
  try {
    const { mainBannerTitle, mainBannerDescription, heroVideoUrl } = req.body;

    // 기존 설정을 찾아서 업데이트하거나 없으면 새로 생성
    const updatedConfig = await SiteConfig.findOneAndUpdate(
      {},
      { mainBannerTitle, mainBannerDescription, heroVideoUrl },
      { upsert: true, new: true }
    );

    res.json({ message: '화면 설정이 변경되었습니다.', config: updatedConfig });
  } catch (error) {
    res.status(500).json({ message: '설정 변경 실패', error: error.message });
  }
});

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // 비밀번호 암호화용 (설치 필요: npm install bcrypt)
const User = require('../models/User'); // 사용자 모델

// PUT /api/admin/change-password - 비밀번호 변경
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // 로그인 미들웨어를 통해 얻은 사용자 ID

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 기존 비밀번호 확인
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    // 새 비밀번호 암호화 후 저장
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '비밀번호 변경 실패', error: error.message });
  }
});

module.exports = router;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, grade } = req.body;

    // 학년/연령대 유효성 검사
    const validGrades = [
      'UNDER_13',
      'ELEMENTARY_1', 'ELEMENTARY_2', 'ELEMENTARY_3', 'ELEMENTARY_4', 'ELEMENTARY_5', 'ELEMENTARY_6',
      'MIDDLE_1', 'MIDDLE_2', 'MIDDLE_3',
      'HIGH_1', 'HIGH_2', 'HIGH_3',
      'OVER_19'
    ];

    if (!grade || !validGrades.includes(grade)) {
      return res.status(400).json({ message: '올바른 학년 또는 연령대를 선택해 주세요.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      grade,
      role: 'user'
    });

    await newUser.save();
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '회원가입 처리 중 오류 발생', error: error.message });
  }
});
