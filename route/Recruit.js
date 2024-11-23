const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결
const router = express.Router();
const moment = require("moment");
/**
 * 2. 공고전체 조회
 * GET /Recruit
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const query = "SELECT * FROM Recruit WHERE user_id = ?";

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("공고 조회 실패:", error);
      return res.status(500).send("공고 조회 중 오류가 발생했습니다.");
    }

    // year_half를 제거하고 yearHalf로 변환
    const transformedResults = results.map(({ year_half, ...rest }) => ({
      ...rest, // year_half를 제외한 나머지 필드 복사
      yearHalf: year_half, // yearHalf 필드 추가
    }));

    res.status(200).send(transformedResults);
  });
});
//side메뉴용
router.get("/side", authenticateToken, (req, res) => {
  console.log("야야");
  const userId = req.user.id;

  const query = `SELECT
  R.id AS id,
  R.title AS title,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', C.id,
      'title', C.title,
      'type',C.type
    )
  ) AS cards
FROM Recruit R
LEFT JOIN Card C ON R.id = C.recruit_id
WHERE R.user_id = ?
GROUP BY R.id, R.title`;

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("공고 조회 실패:", error);
      return res.status(500).send("공고 조회 중 오류가 발생했습니다.");
    }
    console.log(results);
    res.status(200).json(results);
  });
});

router.get("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;
  console.log(id);
  const query = "SELECT * FROM Recruit WHERE user_id = ? AND id = ?";

  connection.query(query, [userId, id], (error, results) => {
    if (error) {
      console.error("공고 조회 실패:", error);
      return res.status(500).send("공고 조회 중 오류가 발생했습니다.");
    }

    // year_half를 제거하고 yearHalf로 변환
    const transformedResults = results.map(({ year_half, ...rest }) => ({
      ...rest, // year_half를 제외한 나머지 필드 복사
      yearHalf: year_half, // yearHalf 필드 추가
    }));

    res.status(200).send(transformedResults[0]);
  });
});

/**
 * 1. 공고 추가
 * POST /Recruit
 */
router.post("/", authenticateToken, (req, res) => {
  const userId = req.user.id; // JWT에서 추출한 사용자 ID
  const { title, yearHalf, state, deadline, url } = req.body;
  const deadlineMySQL = moment(deadline).format("YYYY-MM-DD HH:mm:ss");
  const query = `
      INSERT INTO Recruit (user_id, title, year_half, state,deadline,url) 
      VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(
    query,
    [userId, title, yearHalf, state, deadlineMySQL, url],
    (error, results) => {
      if (error) {
        console.error("공고 추가 실패:", error);
        return res.status(500).send("공고 추가 중 오류가 발생했습니다.");
      }
      res.status(201).send({ message: "공고 추가 성공" });
    }
  );
});

/**
 * 3. state 수정
 * PUT /Recruit
 */
router.put("/state/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const { state } = req.body;

  const query = `
      UPDATE Recruit
      SET  state= ?
      WHERE   user_id = ? AND id = ?`;

  connection.query(query, [state, userId, RecruitId], (error, results) => {
    if (error) {
      console.error("공고 state 수정 실패:", error);
      return res.status(500).send("공고  state 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 state 수정 성공" });
  });
});

router.put("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const { title, url } = req.body;

  const query = `
        UPDATE Recruit
        SET  text = ? , url = ? , year_half = ? , state = ? , deadline = ? 
        WHERE   user_id = ? AND id = ?`;

  connection.query(query, [title, userId, RecruitId], (error, results) => {
    if (error) {
      console.error("공고 수정 실패:", error);
      return res.status(500).send("공고 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 수정 성공" });
  });
});
router.put("/yearHalf/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const yearHalf = req.body.yearHalf;

  const query = `
        UPDATE Recruit
        SET  year_half= ?
        WHERE   user_id = ? AND id = ?`;

  connection.query(query, [yearHalf, userId, RecruitId], (error, results) => {
    if (error) {
      console.error("공고 state 수정 실패:", error);
      return res.status(500).send("공고  state 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 state 수정 성공" });
  });
});
router.put("/title/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const title = req.body.title;

  const query = `
        UPDATE Recruit
        SET  title= ?
        WHERE   user_id = ? AND id = ?`;

  connection.query(query, [title, userId, RecruitId], (error, results) => {
    if (error) {
      console.error("공고 title 수정 실패:", error);
      return res.status(500).send("공고  title 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 title 수정 성공" });
  });
});

router.put("/url/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const url = req.body.url;

  const query = `
        UPDATE Recruit
        SET  url= ?
        WHERE   user_id = ? AND id = ?`;

  connection.query(query, [url, userId, RecruitId], (error, results) => {
    if (error) {
      console.error("공고 url 수정 실패:", error);
      return res.status(500).send("공고  url 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 url 수정 성공" });
  });
});

router.put("/deadline/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const RecruitId = req.params.id;
  const deadline = req.body.deadline;
  const deadlineMySQL = moment(deadline).format("YYYY-MM-DD HH:mm:ss");
  const query = `
        UPDATE Recruit
        SET  deadline= ?
        WHERE  user_id = ? AND id = ?`;

  connection.query(
    query,
    [deadlineMySQL, userId, RecruitId],
    (error, results) => {
      if (error) {
        console.error("공고 deadline 수정 실패:", error);
        return res
          .status(500)
          .send("공고  deadline 수정 중 오류가 발생했습니다.");
      }

      if (results.affectedRows === 0) {
        return res
          .status(404)
          .send("해당 공고을 찾을 수 없거나 수정 권한이 없습니다.");
      }

      res.status(200).send({ message: "공고 deadline 수정 성공" });
    }
  );
});
/**
 * 4. 공고 삭제
 * DELETE /Recruit
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  const query = "DELETE FROM Recruit WHERE id = ? AND user_id = ?";
  connection.query(query, [id, userId], (error, results) => {
    if (error) {
      console.error("공고 삭제 실패:", error);
      return res.status(500).send("공고 삭제 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 공고를 찾을 수 없거나 삭제 권한이 없습니다.");
    }

    res.status(200).send({ message: "공고 삭제 성공" });
  });
});

module.exports = router;
