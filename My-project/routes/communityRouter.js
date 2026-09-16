
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 댓글/소통창 작성 API
router.post('/comment', async (req, res) => {
  const { userId, commentText } = req.body;
  
  // 차단 키워드 예시 (실제 구현 시 단어 목록 확장 가능)
  const badWords = ['비난단어1', '비속어2', '나쁜말3'];
  const hasBadWord = badWords.some(word => commentText.includes(word));

  if (hasBadWord) {
    // 부정적인 언행 사용 시 포인트 3점 감점
    await User.findByIdAndUpdate(userId, { $inc: { points: -3 } });
    return res.status(400).json({ 
      message: '바르지 못한 언어를 사용하여 포인트 3점이 차감되었습니다.' 
    });
  }

  // 정상 댓글 등록 처리...
  res.json({ message: '댓글이 등록되었습니다.' });
});

module.exports = router;
