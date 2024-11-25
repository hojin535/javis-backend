const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const { 
  client, 
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} = require('../../DynamoDB');


// 사용자 정보 생성/수정
router.put("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;  // 토큰에서 userId 가져오기
  const {     
    serviceStatus,
    militaryType,
    militaryClasses,
    militaryRanks,
    startDate,
    endDate,
    retireMilitary} = req.body;
  console.log(    serviceStatus,
    militaryType,
    militaryClasses,
    militaryRanks,
    startDate,
    endDate,
    retireMilitary)
  const params = {
    TableName: "javis",
    Key: {
      userId: { S: userId }
    },
    UpdateExpression: "SET militaryInfo = :militaryInfo",
    ExpressionAttributeValues: {
      ":militaryInfo": {
        M: {
            serviceStatus: { S: serviceStatus },
            militaryType: { S: militaryType },
            militaryClasses: { S: militaryClasses },
            militaryRanks:{ S: militaryRanks },
            startDate:{ S: startDate },
            endDate:{ S: endDate },
            retireMilitary:{ S: retireMilitary },
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