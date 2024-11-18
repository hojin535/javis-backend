var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.HOST, // DuckDNS 도메인만
  port: process.env.PORT, // 포트를 별도로 지정
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

module.exports = connection;
