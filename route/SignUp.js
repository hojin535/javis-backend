const express = require("express");
const bcrypt = require("bcrypt");
const connection = require("../db");
const { client, PutItemCommand } = require('../DynamoDB');

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, password, name } = req.body;

  if (!id || !password || !name) {
    res.status(400).send("모든 필드를 입력하세요.");
    return;
  }

  // 중복 사용자 확인
  const checkQuery = "SELECT * FROM User WHERE id = ?";
  connection.query(checkQuery, [id], async (error, results) => {
    if (error) {
      console.error("데이터베이스 에러", error);
      res.status(500).send("서버 에러");
      return;
    }

    if (results.length > 0) {
      res.status(409).send("이미 존재하는 사용자 ID입니다.");
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // DynamoDB에 사용자 정보 추가
      const dynamoParams = {
        TableName: "javis",
        Item: {
          userId: { S: id },
          name: { S: name }
        }
      };
      
      const command = new PutItemCommand(dynamoParams);
      await client.send(command);

      // MySQL에 사용자 추가
      const insertQuery =
        "INSERT INTO User (id, password, name) VALUES (?, ?, ?)";
      connection.query(insertQuery, [id, hashedPassword, name], (insertError) => {
        if (insertError) {
          console.error("사용자 추가 실패", insertError);
          res.status(500).send("회원가입 중 오류가 발생했습니다.");
          return;
        }

        res.status(201).send("회원가입 성공");
      });
    } catch (dynamoError) {
      console.error("DynamoDB 에러", dynamoError);
      res.status(500).send("회원가입 중 오류가 발생했습니다.");
    }
  });
});

module.exports = router;
