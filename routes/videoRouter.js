const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

// 1. 관리자 전용: 동영상 및 퀴즈 등록 (POST /api/videos)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { title, videoUrl, targetGrade, quizzes, rewardPoints } = req.body;

    if (!title || !videoUrl || !quizzes || quizzes.length === 0) {
      return res.status(400).json({ message: '제목, 동영상 URL, 퀴즈 항목을 모두 입력해 주세요.' });
    }

    const newVideo = new Video({
      title,
      videoUrl,
      targetGrade,
      quizzes,
      rewardPoints: rewardPoints || 10
    });

    await newVideo.save();

    res.status(201).json({
      message: '동영상 및 퀴즈가 성공적으로 등록되었습니다.',
      videoId: newVideo._id
    });
  } catch (error) {
    res.status(500).json({ message: '동영상 등록 실패', error: error.message });
  }
});

// 2. 로그인 유저: 자신의 학년에 맞는 동영상 목록 조회 (GET /api/videos)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userGrade = req.user.grade;
    
    // 사용자의 학년이 포함되어 있거나 전체 공개 대상인 비디오 검색
    const videos = await Video.find({
      $or: [
        { targetGrade: userGrade },
        { targetGrade: { $size: 0 } }
      ]
    }).select('-quizzes.correctAnswer'); // 목록 조회 시 정답 숨김

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: '동영상 목록 불러오기 실패', error: error.message });
  }
});

// 3. 퀴즈 제출 및 정답 채점 (POST /api/videos/:id/submit)
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body; // 사용자가 선택한 답안 배열 ex) [0, 2, 1, 3]
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: '동영상을 찾을 수 없습니다.' });
    }

    let correctCount = 0;
    video.quizzes.forEach((quiz, idx) => {
      if (answers[idx] !== undefined && answers[idx] === quiz.correctAnswer) {
        correctCount++;
      }
    });

    const isAllCorrect = correctCount === video.quizzes.length;
    let earnedPoints = 0;

    if (isAllCorrect) {
      earnedPoints = video.rewardPoints || 10;
      // 유저 포인트 추가 및 랭크 업 체크
      const user = await User.findById(req.user.id);
      user.points += earnedPoints;

      // 포인트에 따른 벳지 랭크업 로직 예시
      if (user.points >= 100) user.badgeRank = '대사관';
      else if (user.points >= 50) user.badgeRank = '중급 사관';

      await user.save();
    }

    res.json({
      isAllCorrect,
      correctCount,
      totalQuestions: video.quizzes.length,
      earnedPoints
    });
  } catch (error) {
    res.status(500).json({ message: '퀴즈 제출 처리 실패', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// POST /api/videos - 동영상 및 퀴즈 등록
router.post('/', async (req, res) => {
  try {
    const { title, videoUrl, targetGrade, quizzes } = req.body;

    if (!title || !videoUrl || !quizzes || quizzes.length === 0) {
      return res.status(400).json({ message: '제목, URL 및 퀴즈 항목을 모두 입력해 주세요.' });
    }

    const newVideo = new Video({
      title,
      videoUrl,
      targetGrade,
      quizzes
    });

    await newVideo.save();

    res.status(201).json({
      message: '동영상 및 퀴즈 등록 성공',
      videoId: newVideo._id
    });
  } catch (error) {
    res.status(500).json({ message: '동영상 등록 실패', error: error.message });
  }
});

module.exports = router;
