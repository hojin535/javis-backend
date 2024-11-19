const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결
const router = express.Router();

/**
 * 2. 댓글 조회
 * GET /Comment
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const cardId = req.query.cardId;
  const query = "SELECT * FROM Comment WHERE user_id = ? and card_id = ?";

  connection.query(query, [userId, cardId], (error, results) => {
    if (error) {
      console.error("카드 조회 실패:", error);
      return res.status(500).send("카드 조회 중 오류가 발생했습니다.");
    }
    res.status(200).send(results);
  });
});

/**
 * 1. 댓글 추가
 * POST /Comment
 */
router.post("/", authenticateToken, (req, res) => {
  const userId = req.user.id; // JWT에서 추출한 사용자 ID
  const { text, cardId } = req.body;
  const query = `
      INSERT INTO Comment (user_id, date, text, card_id) 
      VALUES (?, NOW(), ?, ?)`;

  connection.query(query, [userId, text, cardId], (error, results) => {
    if (error) {
      console.error("댓글 추가 실패:", error);
      return res.status(500).send("댓글 추가 중 오류가 발생했습니다.");
    }
    res.status(201).send({ message: "댓글 추가 성공" });
  });
});

/**
 * 3. 댓글 수정
 * PUT /Comment
 */
router.put("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const { text } = req.body;
  const query = `
      UPDATE Comment
      SET  text = ?
      WHERE   user_id = ? AND id = ?`;

  connection.query(query, [text, userId, commentId], (error, results) => {
    if (error) {
      console.error("댓글 수정 실패:", error);
      return res.status(500).send("댓글 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 댓글을 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "댓글 수정 성공" });
  });
});

/**
 * 4. 댓글 삭제
 * DELETE /Comment
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  const query = "DELETE FROM Comment WHERE id = ? AND user_id = ?";
  connection.query(query, [id, userId], (error, results) => {
    if (error) {
      console.error("카드 삭제 실패:", error);
      return res.status(500).send("카드 삭제 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 카드를 찾을 수 없거나 삭제 권한이 없습니다.");
    }

    res.status(200).send({ message: "카드 삭제 성공" });
  });
});

module.exports = router;
