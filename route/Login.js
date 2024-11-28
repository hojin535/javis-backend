const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../db");
require("dotenv").config();

const router = express.Router();

// 액세스 토큰 생성 함수 (짧은 유효기간)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name },
    process.env.VITE_JWT_SECRET,
    { expiresIn: '1h' } // 15분
  );
};

// 리프레시 토큰 생성 함수 (긴 유효기간)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name },
    process.env.VITE_JWT_SECRET + "_refresh", // 리프레시 토큰용 시크릿
    { expiresIn: '7d' } // 7일
  );
};

// 쿠키 설정 함수
const setCookieOptions = (isRefreshToken = false) => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: isRefreshToken ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000 // 리프레시 토큰: 7일, 액세스 토큰: 15분
  };
};

// 로그인
router.post("/", (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
  }

  const query = "SELECT * FROM User WHERE id = ?";
  connection.query(query, [id], async (error, results) => {
    if (error) {
      console.error("데이터베이스 에러", error);
      return res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    const dbpw = results[0].password;
    const isPasswordCorrect = await bcrypt.compare(password, dbpw);

    if (!isPasswordCorrect) {
      console.error("비밀번호가 틀렸습니다.");
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    const user = results[0];

    // 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 리프레시 토큰을 데이터베이스에 저장
    const updateSql = "UPDATE User SET refresh_token = ? WHERE id = ?";
    connection.query(updateSql, [refreshToken, user.id], (updateErr) => {
      if (updateErr) {
        console.error("리프레시 토큰 저장 에러:", updateErr);
        return res.status(500).json({ message: "서버 에러가 발생했습니다." });
      }

      // 리프레시 토큰만 쿠키에 저장
      res.cookie('refreshToken', refreshToken, setCookieOptions(true));

      // 액세스 토큰은 응답 본문에 포함
      res.json({ 
        message: "로그인 성공",
        user: { id: user.id, name: user.name },
        accessToken: accessToken // 클라이언트에서 저장할 액세스 토큰
      });
    });
  });
});

// 토큰 재발급
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "리프레시 토큰이 없습니다." });
  }

  try {
    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.VITE_JWT_SECRET + "_refresh");
    
    // 데이터베이스에서 저장된 리프레시 토큰 확인
    const query = "SELECT * FROM User WHERE id = ? AND refresh_token = ?";
    connection.query(query, [decoded.id, refreshToken], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: "유효하지 않은 리프레시 토큰입니다." });
      }

      const user = results[0];
      
      // 새로운 액세스 토큰 발급
      const newAccessToken = generateAccessToken(user);
      
      // 새로운 액세스 토큰은 응답 본문에 포함
      res.json({ 
        message: "액세스 토큰이 재발급되었습니다.",
        user: { id: user.id, name: user.name },
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    console.error("토큰 재발급 에러:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "리프레시 토큰이 만료되었습니다. 다시 로그인해주세요." });
    }
    res.status(401).json({ message: "유효하지 않은 리프레시 토큰입니다." });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  // 데이터베이스에서 리프레시 토큰 제거
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const query = "UPDATE User SET refresh_token = NULL WHERE refresh_token = ?";
    connection.query(query, [refreshToken], (err) => {
      if (err) {
        console.error("리프레시 토큰 제거 에러:", err);
      }
    });
  }

  // 쿠키 제거
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  
  res.json({ message: "로그아웃 되었습니다." });
});

module.exports = router;
