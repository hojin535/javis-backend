const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 토큰 가져오기

  if (!token) {
    return res.status(401).send("토큰이 없습니다. 인증이 필요합니다.");
  }

  jwt.verify(token, process.env.VITE_JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("유효하지 않은 토큰입니다.");
    }
    req.user = user; // 인증된 사용자 정보 저장
    next();
  });
};

module.exports = authenticateToken;
