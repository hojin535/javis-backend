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
const port = 8080;

// CORS 설정
const corsOptions = {
  origin: [process.env.VITE_FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
    console.log('DynamoDB 연결 테스트 시작...');
    const command = new ListTablesCommand({});
    console.log('ListTablesCommand 생성됨');
    
    // 타임아웃 처리 추가
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DynamoDB 연결 타임아웃')), 10000)
    );
    
    const responsePromise = client.send(command);
    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    console.log('DynamoDB 응답 받음:', response);
    
    if (response.TableNames) {
      console.log('DynamoDB 연결 성공. 테이블 목록:', response.TableNames);
      return true;
    } else {
      console.log('DynamoDB 연결됨, 하지만 테이블이 없습니다.');
      return true;  // 테이블이 없어도 연결은 성공한 것으로 간주
    }
  } catch (error) {
    console.error('DynamoDB 연결 오류 상세 정보:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
};

// MySQL과 DynamoDB 연결 확인
const checkConnections = async () => {
  try {
    // MySQL 연결 확인 (Promise로 변환)
    await new Promise((resolve, reject) => {
      connection.getConnection((err, conn) => {
        if (err) {
          console.error("MySQL 연결 실패: ", err);
          reject(err);
          return;
        }
        conn.release();
        console.log("MySQL 연결 성공");
        resolve();
      });
    });

    // DynamoDB 연결 확인
    console.log("DynamoDB 연결 시도 중...");
    const dynamoDBConnected = await testDynamoDB();
    console.log("DynamoDB 연결 상태:", dynamoDBConnected);
    
    if (!dynamoDBConnected) {
      throw new Error("DynamoDB 연결 실패");
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
