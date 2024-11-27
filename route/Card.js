const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결

const router = express.Router();

/**
 * 1. 카드 추가
 * POST /cards
 */
router.post("/", authenticateToken, (req, res) => {
  const userId = req.user.id; // JWT에서 추출한 사용자 ID
  const { title, tags, mode, type, recruitId } = req.body;
  console.log(tags);
  console.log(recruitId, "공고아이디");
  if (recruitId) {
    const query = `
    INSERT INTO Card (user_id, title, date, tags, mode,type,recruit_id) 
    VALUES (?, ?, NOW(), ?, ?, ?,?)`;

    connection.query(
      query,
      [userId, title, JSON.stringify(tags) || null, mode, type, recruitId],
      (error, results) => {
        if (error) {
          console.error("카드 추가 실패:", error);
          return res.status(500).send("카드 추가 중 오류가 발생했습니다.");
        }
        res
          .status(201)
          .send({ message: "카드 추가 성공", cardId: results.insertId });
      }
    );
  } else {
    const query = `
    INSERT INTO Card (user_id, title, date, tags, mode,type)
    VALUES (?, ?, NOW(), ?, ?, ?)`;

    connection.query(
      query,
      [userId, title, JSON.stringify(tags) || null, mode, type],
      (error, results) => {
        if (error) {
          console.error("카드 추가 실패:", error);
          return res.status(500).send("카드 추가 중 오류가 발생했습니다.");
        }
        res
          .status(201)
          .send({ message: "카드 추가 성공", cardId: results.insertId });
      }
    );
  }
});

/**
 * 2. 카드 조회 (특정 사용자)
 * GET /Card
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const id = req.query.id;
  console.log(userId);
  console.log(id);
  const query = "SELECT * FROM Card WHERE user_id = ? and id = ?";
  connection.query(query, [userId, id], (error, results) => {
    if (error) {
      console.error("카드 조회 실패:", error);
      return res.status(500).send("카드 조회 중 오류가 발생했습니다.");
    }
    console.log("통신 성공", results);
    res.status(200).send(results[0]);
  });
});

/**
 * 2. 카드전부 조회 (특정 사용자)
 * GET /card/All
 */
router.get("/All", authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const mode = req.query.mode;
  const type = req.query.type;
  const query =
    "SELECT * FROM Card WHERE user_id = ? and mode = ? and type = ?";

  connection.query(query, [userId, mode, type], (error, results) => {
    if (error) {
      console.error("카드 조회 실패:", error);
      return res.status(500).send("카드 조회 중 오류가 발생했습니다.");
    }
    res.status(200).send(results);
  });
});

// recruit용 카드 조회
router.get("/recruit/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const recruitId = req.params.id;
  console.log(userId);
  const mode = req.query.mode;
  const type = req.query.type;
  const query =
    "SELECT * FROM Card WHERE user_id = ?and recruit_id = ? and mode = ? and type = ? ";

  connection.query(query, [userId, recruitId, mode, type], (error, results) => {
    if (error) {
      console.error("카드 조회 실패:", error);
      return res.status(500).send("카드 조회 중 오류가 발생했습니다.");
    }
    res.status(200).send(results);
  });
});

/**
 * 3. 카드 수정
 * PUT /cards/:id
 */
router.put("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cardId = req.params.id;
  const { title, text } = req.body;

  const query = `
    UPDATE Card
    SET title = ?, text = ?
    WHERE id = ? AND user_id = ?`;

  connection.query(query, [title, text, cardId, userId], (error, results) => {
    if (error) {
      console.error("카드 수정 실패:", error);
      return res.status(500).send("카드 수정 중 오류가 발생했습니다.");
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .send("해당 카드를 찾을 수 없거나 수정 권한이 없습니다.");
    }

    res.status(200).send({ message: "카드 수정 성공" });
  });
});

/**
 * 4. 카드 삭제
 * DELETE /cards/:id
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cardId = req.params.id;

  const query = "DELETE FROM Card WHERE id = ? AND user_id = ?";
  connection.query(query, [cardId, userId], (error, results) => {
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

//mode별 개수

router.get("/count", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const mode = req.query.mode;
  console.log("mode:", mode);
  const query =
    "SELECT type, COUNT(*) as count FROM Card WHERE user_id = ? AND mode= ? GROUP BY type";
  connection.query(query, [userId, mode], (error, results) => {
    if (error) {
      console.error("카드 개수 조회 실패:", error);
      return res.status(500).send("카드 개수 조회 중 오류가 발생했습니다.");
    }
    // 원하는 순서 지정
    const order = ["경험정리", "자기소개서", "면접질문"];

    // 새로운 타입 추가 함수
    const ensureTypeExists = (array, type) => {
      if (!array.some((item) => item.type === type)) {
        array.push({ type, count: 0 }); // 없는 경우 추가
      }
    };

    // 모든 타입을 배열에 추가
    order.forEach((type) => ensureTypeExists(results, type));

    // 배열 정렬
    const sortedResults = results.sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
    );

    console.log(sortedResults);
    res.status(200).send(results);
  });
});

//recruit에 속한 카드 필터메뉴 개수
router.get("/recruit/count/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const recruitId = req.params.id;
  const mode = req.query.mode;
  console.log("mode:", mode);
  console.log("recruitId:", recruitId);
  const query =
    "SELECT type, COUNT(*) as count FROM Card WHERE user_id = ?AND recruit_id= ? AND mode= ?  GROUP BY type";
  connection.query(query, [userId, recruitId, mode], (error, results) => {
    if (error) {
      console.error("카드 개수 조회 실패:", error);
      return res.status(500).send("카드 개수 조회 중 오류가 발생했습니다.");
    }
    // 원하는 순서 지정
    const order = ["경험정리", "자기소개서", "면접질문"];

    // 새로운 타입 추가 함수
    const ensureTypeExists = (array, type) => {
      if (!array.some((item) => item.type === type)) {
        array.push({ type, count: 0 }); // 없는 경우 추가
      }
    };

    // 모든 타입을 배열에 추가
    order.forEach((type) => ensureTypeExists(results, type));

    // 배열 정렬
    const sortedResults = results.sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
    );

    console.log(sortedResults);
    res.status(200).send(results);
  });
});

module.exports = router;
