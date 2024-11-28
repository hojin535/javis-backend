const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결
const util = require("util"); // Promisify를 사용하기 위해 추가

const router = express.Router();

// MySQL 쿼리를 Promise로 변환
const queryAsync = util.promisify(connection.query).bind(connection);

router.get("/tag", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { tags } = req.query;
  
  try {
    // URL 디코딩 후 JSON 파싱
    const tagArray = JSON.parse(decodeURIComponent(tags));
    console.log(tagArray);

    // 태그 배열이 유효한지 확인
    if (!Array.isArray(tagArray)) {
      return res.status(400).json({ message: "태그는 배열 형식이어야 합니다." });
    }

    // 각 태그 객체에 대해 JSON 검색 조건 생성
    const conditions = tagArray.map(tagObj => {
      const jsonToMatch = JSON.stringify({ tag: tagObj.tag, type: tagObj.type });
      return `JSON_CONTAINS(tags, '${jsonToMatch}')`;
    }).join(' OR ');

    const statementQuery = `
      SELECT * FROM Card 
      WHERE user_id = ? 
      AND mode = 'statement' 
      AND (${conditions})
    `;

    const recruitQuery = `
      SELECT * FROM Card 
      WHERE user_id = ? 
      AND mode = 'recruit' 
      AND (${conditions})
    `;

    console.log('SQL Query:', statementQuery);

    const [statementResults, recruitResults] = await Promise.all([
      queryAsync(statementQuery, [userId]),
      queryAsync(recruitQuery, [userId])
    ]);

    res.json({
        statement: statementResults,
        recruit: recruitResults
      }
    );

  } catch (error) {
    console.error("검색 에러:", error);
    res.status(500).json({ 
      message: "검색 중 오류가 발생했습니다.",
      error: error.message 
    });
  }
});

// 검색
router.get("", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const text = req.query.text;
  console.log(text);
  const keyword = `%${text}%`;

  // SQL 쿼리 생성
  const queryStatement = `
      SELECT DISTINCT * FROM Card
      WHERE user_id = ? AND mode="statement" AND (title LIKE ?  or text LIKE ?)
    `;
  const queryRecruit = `
      SELECT DISTINCT * FROM Card
      WHERE user_id = ? AND mode="recruit" AND (title LIKE ?  or text LIKE ?)
    `;

  try {
    // 두 쿼리를 병렬로 실행
    const [statement, recruit] = await Promise.all([
      queryAsync(queryStatement, [userId, keyword, keyword]),
      queryAsync(queryRecruit, [userId, keyword, keyword]),
    ]);

    // 결과 반환
    res.status(200).send({ statement, recruit });
  } catch (error) {
    console.error("카드 조회 실패:", error);
    res.status(500).send("카드 조회 중 오류가 발생했습니다.");
  }
});

module.exports = router;
