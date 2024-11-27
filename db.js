var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.VITE_HOST, // DuckDNS 도메인만
  port: process.env.VITE_PORT, // 포트를 별도로 지정
  user: process.env.VITE_USER,
  password: process.env.VITE_PASSWORD,
  database: process.env.VITE_DATABASE,
});

module.exports = connection;
