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
