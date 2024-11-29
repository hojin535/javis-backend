var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: import.meta.env.DEV ? process.env.VITE_HOST: "http://localhost",
  port: process.env.VITE_PORT, // 포트를 별도로 지정
  user: process.env.VITE_USER,
  password: process.env.VITE_PASSWORD,
  database: process.env.VITE_DATABASE,
});

module.exports = connection;
