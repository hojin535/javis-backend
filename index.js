const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connection = require("./db"); // MySQL 연결 가져오기
const cookieParser = require("cookie-parser");
const loginRouter = require("./route/Login");
const signUpRouter = require("./route/SignUp");
const cardRouter = require("./route/Card");
const commentRouter = require("./route/Comment");
const app = express();
const port = 3000;

// 미들웨어
app.use(
  cors({
    origin: "http://localhost:5173", // 프론트엔드의 URL
    credentials: true, // 쿠키 전송 허용
  })
);
app.use(express.json());
app.use(cookieParser());
// 라우터 등록
app.use("/Login", loginRouter);
app.use("/Signup", signUpRouter);
app.use("/Card", cardRouter);
app.use("/Comment", commentRouter);

connection.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패: ", err);
    process.exit();
  } else {
    console.log("MySQL 연결 성공");
  }
});

// 기본 라우터
app.get("/", (req, res) => {
  res.send("Hello World");
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 실행 중입니다. 포트: ${port}`);
});
