const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const bcrypt = require("bcryptjs");
const authController = require("../controllers/authControllers");

router.post("/registration", authController.signUp);

module.exports = router;
