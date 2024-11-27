const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connection = require("./db"); // MySQL 연결 가져오기
const cookieParser = require("cookie-parser");
const loginRouter = require("./route/Login");
const signUpRouter = require("./route/SignUp");
const cardRouter = require("./route/Card");
const commentRouter = require("./route/Comment");
const recruitRouter = require("./route/Recruit");
const searchRouter = require("./route/Search");
const basicInfoRouter = require("./route/userInfo/BasicInfo");
const militaryInfoRouter = require("./route/userInfo/MilitaryInfo");
const academicInfoRouter = require("./route/userInfo/AcademicInfo");
const clubInfoRouter = require("./route/userInfo/ClubInfo");
const awardInfoRouter = require("./route/userInfo/AwardInfo");
const userInfoRouter = require("./route/userInfo/UserInfo");
const app = express();
const port = 3000;

// 미들웨어
app.use(
  cors({
    origin: process.env.VITE_FRONTEND_URL, // 프론트엔드의 URL
    credentials: true, // 쿠키 전송 허용
  })
);
app.use(express.json());
app.use(cookieParser());
// 라우터 등록
app.use("/Login", loginRouter);
app.use("/SignUp", signUpRouter);
app.use("/Card", cardRouter);
app.use("/Comment", commentRouter);
app.use("/Recruit", recruitRouter);
app.use("/Search", searchRouter);
app.use("/BasicInfo",basicInfoRouter);
app.use("/MilitaryInfo",militaryInfoRouter);
app.use("/AcademicInfo",academicInfoRouter);
app.use("/ClubInfo",clubInfoRouter);
app.use("/AwardInfo",awardInfoRouter);
app.use("/UserInfo",userInfoRouter);
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
