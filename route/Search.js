const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결
const util = require("util"); // Promisify를 사용하기 위해 추가

const router = express.Router();

// MySQL 쿼리를 Promise로 변환
const queryAsync = util.promisify(connection.query).bind(connection);

router.get("/tag", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let data;
  try {
    // JSON 문자열을 파싱하여 배열로 변환
    data = JSON.parse(req.query.data);
  } catch (error) {
    return res.status(400).send("유효하지 않은 JSON 데이터입니다.");
  }

  console.log("dtatat:", data);

  const conditions = [];
  const values = [userId]; // user_id를 먼저 추가

  // 조건 생성
  data.forEach((item) => {
    if (item.tag && item.type) {
      const jsonCondition = JSON.stringify({ tag: item.tag, type: item.type });
      conditions.push(`JSON_CONTAINS(tags, ?)`); // JSON 조건 추가
      values.push(jsonCondition); // JSON 객체를 문자열로 추가
    }
  });

  if (conditions.length === 0) {
    return res.status(400).send("유효한 tag와 type이 없습니다.");
  }

  // SQL 쿼리 생성
  const queryStatement = `
    SELECT * FROM Card
    WHERE user_id = ? AND mode="statement" AND (${conditions.join(" OR ")})
  `;
  const queryRecruit = `
    SELECT * FROM Card
    WHERE user_id = ? AND mode="recruit" AND (${conditions.join(" OR ")})
  `;

  try {
    // 두 쿼리를 병렬로 실행
    const [statement, recruit] = await Promise.all([
      queryAsync(queryStatement, values),
      queryAsync(queryRecruit, values),
    ]);

    // 결과 반환
    res.status(200).send({ statement, recruit });
  } catch (error) {
    console.error("카드 조회 실패:", error);
    res.status(500).send("카드 조회 중 오류가 발생했습니다.");
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
