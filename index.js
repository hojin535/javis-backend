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

// CORS 설정
// const corsOptions = {
//   origin: [process.env.VITE_FRONTEND_URL, 'http://localhost:5173'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
///////////
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

// DynamoDB 연결 테스트
const { client, ListTablesCommand } = require('./DynamoDB');
const testDynamoDB = async () => {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log('DynamoDB 연결 성공. 테이블 목록:', response.TableNames);
    return true;
  } catch (error) {
    console.error('DynamoDB 연결 실패:', error.message);
    return false;
  }
};

// MySQL과 DynamoDB 연결 확인
const checkConnections = async () => {
  try {
    // MySQL 연결 확인
    connection.connect((err) => {
      if (err) {
        console.error("MySQL 연결 실패: ", err);
        process.exit(1);
      }
      console.log("MySQL 연결 성공");
    });

    // DynamoDB 연결 확인
    const dynamoDBConnected = await testDynamoDB();
    if (!dynamoDBConnected) {
      console.error("DynamoDB 연결 실패로 서버를 종료합니다.");
      process.exit(1);
    }

    // 모든 연결이 성공하면 서버 시작
    app.listen(port, () => {
      console.log(`서버가 실행 중입니다. 포트: ${port}`);
    });
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
};

// 기본 라우터
app.get("/", (req, res) => {
  res.send("Hello World");
});

// 서버 시작
checkConnections();
