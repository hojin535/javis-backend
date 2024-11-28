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

console.log(process.env.VITE_FRONTEND_URL);
console.log(process.env.VITE_HOST); // process.env.VITE_HOST, // DuckDNS 도메인만
console.log(process.env.VITE_PORT); // 포트를 별도로 지정
console.log(process.env.VITE_USER);
console.log(process.env.VITE_PASSWORD);
console.log(process.env.VITE_DATABASE);

// CORS 프리플라이트 요청 처리
const corsOptions = {
  origin: 'https://javisproject.duckdns.org',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('/Login', cors(corsOptions));

// CORS 헤더 추가 미들웨어
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://javisproject.duckdns.org');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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
