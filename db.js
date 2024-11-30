var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.NODE_ENV === 'DEV' ? process.env.VITE_HOST : "localhost",
  port: process.env.VITE_PORT, // 포트를 별도로 지정
  user: process.env.VITE_USER,
  password: process.env.VITE_PASSWORD,
  database: process.env.VITE_DATABASE,
});

module.exports = connection;
