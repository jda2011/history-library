const jwt = require('jsonwebtoken');

// 로그인한 사용자인지 검증
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: '토큰이 필요합니다.' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secretKey');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 관리자 권한인지 검증
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
