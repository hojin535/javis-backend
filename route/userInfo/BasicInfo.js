const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const { 
  client, 
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} = require('../../DynamoDB');

// 사용자 정보 조회
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;  // 토큰에서 userId 가져오기
  console.log(userId);
  const params = {
    TableName: "javis",
    Key: {
      userId: { S: userId }
    }
  };

  try {
    const command = new GetItemCommand(params);
    const response = await client.send(command);
    
    if (!response.Item) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(response.Item);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

// 사용자 정보 생성/수정
router.put("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;  // 토큰에서 userId 가져오기
  const { koreanName, englishName, chineseName } = req.body;
  
  const params = {
    TableName: "javis",
    Key: {
      userId: { S: userId }
    },
    UpdateExpression: "SET basicInfo = :basicInfo",
    ExpressionAttributeValues: {
      ":basicInfo": {
        M: {
          koreanName: { S: koreanName },
          englishName: { S: englishName },
          chineseName: { S: chineseName }
        }
      }
    }
  };

  try {
    const command = new UpdateItemCommand(params);
    await client.send(command);
    res.status(200).json({ message: "사용자 정보가 저장되었습니다." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;