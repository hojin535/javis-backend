const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const { client, GetItemCommand } = require("../../DynamoDB");

function parseDynamoDBData(data) {
    if (Array.isArray(data)) {
      // 배열인 경우 재귀적으로 처리
      return data.map(parseDynamoDBData);
    } else if (typeof data === "object" && data !== null) {
      // 객체일 경우 DynamoDB 타입을 판별하여 처리
      if ("S" in data) return data.S; // 문자열
      if ("N" in data) return Number(data.N); // 숫자
      if ("BOOL" in data) return data.BOOL; // 불리언
      if ("L" in data) return data.L.map(parseDynamoDBData); // 리스트 처리
      if ("M" in data) {
        // 맵(Map)을 일반 객체로 변환
        const obj = {};
        for (const key in data.M) {
          obj[key] = parseDynamoDBData(data.M[key]); // 재귀 처리
        }
        return obj;
      }
    }
    return data; // 그 외 타입은 그대로 반환
  }
router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const params = {
      TableName: "javis",
      Key: {
        userId: { S: userId },
      },
    };
  
    try {
      const command = new GetItemCommand(params);
      const response = await client.send(command);
      const item = response.Item;
  
      if (!item) {
        return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
      }
  
      // DynamoDB 데이터를 일반 JavaScript 객체로 변환
      const userInfo = {
        userId: parseDynamoDBData(item.userId),
        basicInfo: parseDynamoDBData(item.basicInfo),
        militaryInfo: parseDynamoDBData(item.militaryInfo),
        academicInfo: parseDynamoDBData(item.academicInfo),
        clubInfo: parseDynamoDBData(item.clubInfo),
        awardInfo: parseDynamoDBData(item.awardInfo)
      };

      // 콘솔에 출력
      console.log("=== 사용자 정보 조회 결과 ===");
      console.log(JSON.stringify(userInfo, null, 2));
      console.log("==========================");
  
      res.status(200).json(userInfo);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
});
  

module.exports = router;