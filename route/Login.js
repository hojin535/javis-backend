const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../db");
require("dotenv").config();

const router = express.Router();

router.post("/", (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    res.status(400).send("아이디와 비밀번호를 입력하세요.");
    return;
  }

  const query = "SELECT * FROM User WHERE id = ?";
  connection.query(query, [id], async (error, results) => {
    if (error) {
      console.error("데이터베이스 에러", error);
      res.status(500).send("서버 에러");
      return;
    }

    if (results.length === 0) {
      res.status(401).send("등록된 회원정보가 없습니다.");
      return;
    }

    const dbpw = results[0].password;
    const isPasswordCorrect = await bcrypt.compare(password, dbpw);

    if (!isPasswordCorrect) {
      console.error("비밀번호가 틀렸습니다.");
      res.status(401).send("회원 인증 실패");
      return;
    }

    // JWT 생성 및 쿠키 저장
    const user = { id: results[0].id, name: results[0].name };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // HTTPS 환경에서만 활성화
      sameSite: "strict", // CSRF 방지
      maxAge: 60 * 60 * 1000, // 1시간
    });

    res.status(200).send("로그인 성공");
  });
});

module.exports = router;
