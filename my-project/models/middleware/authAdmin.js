const jwt = require('jsonwebtoken');

function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 누락되었습니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // admin 권한 검증
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: '접근 권한이 없습니다. 관리자 전용 기능입니다.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }
}

module.exports = authAdmin;
