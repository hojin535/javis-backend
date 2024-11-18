const express = require("express");
const app = express();
var cors = require("cors");
const port = 3000;

var mysql = require("mysql");
var connection = mysql.createConnection({
  //
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패: ", err);
    process.exit();
  } else {
    console.log("MySQL 연결 성공");
  }
});

app.use(cors());
app.use(express.json());

// 기본 라우팅
app.get("/", function (req, res) {
  res.send("Hello World");
});

// 데이터 조회 (SELECT)
app.get("/select", (req, res) => {
  connection.query("SELECT * from customer", function (error, results) {
    if (error) {
      console.error("쿼리 실행 실패: ", error);
      res.status(500).send("Database query failed");
    } else {
      res.json(results); // JSON 형식으로 결과 반환
    }
  });
});

// 데이터 삽입 (INSERT)
app.post("/insert", (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).send("필수 데이터가 없습니다.");
    return;
  }

  const query = "INSERT INTO customer (email, password, name) VALUES (?, ?, ?)";
  connection.query(query, [email, password, name], (error, results) => {
    if (error) {
      console.error("INSERT 실패: ", error);
      res.status(500).send("Database insert failed");
    } else {
      res.json({ message: "데이터 삽입 성공", id: results.insertId });
    }
  });
});

// 데이터 수정 (UPDATE)
app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { email, password, name } = req.body;

  const query =
    "UPDATE customer SET email = ?, password = ?, name = ? WHERE id = ?";
  connection.query(query, [email, password, name, id], (error, results) => {
    if (error) {
      console.error("UPDATE 실패: ", error);
      res.status(500).send("Database update failed");
    } else if (results.affectedRows === 0) {
      res.status(404).send("해당 ID의 데이터가 없습니다.");
    } else {
      res.json({ message: "데이터 수정 성공" });
    }
  });
});

// 데이터 삭제 (DELETE)
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM customer WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("DELETE 실패: ", error);
      res.status(500).send("Database delete failed");
    } else if (results.affectedRows === 0) {
      res.status(404).send("해당 ID의 데이터가 없습니다.");
    } else {
      res.json({ message: "데이터 삭제 성공" });
    }
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 실행 중입니다. 포트: ${port}`);
});
