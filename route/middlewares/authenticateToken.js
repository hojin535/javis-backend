const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 토큰 추출

  if (!accessToken) {
    return res.status(401).json({ 
      message: '액세스 토큰이 없습니다.', 
      needRefresh: true 
    });
  }

  jwt.verify(accessToken, process.env.VITE_JWT_SECRET, (err, decoded) => {
    if (err) {
      // 토큰이 만료된 경우
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: '액세스 토큰이 만료되었습니다.', 
          needRefresh: true,
          error: 'EXPIRED_TOKEN'
        });
      }
      // 토큰이 유효하지 않은 경우
      return res.status(401).json({ 
        message: '유효하지 않은 액세스 토큰입니다.', 
        needRefresh: true,
        error: 'INVALID_TOKEN'
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;
