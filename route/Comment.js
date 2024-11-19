const express = require("express");
const authenticateToken = require("./middlewares/authenticateToken"); // JWT 인증 미들웨어
const connection = require("../db"); // MySQL 연결

const router = express.Router();

router.module.exports = router;
