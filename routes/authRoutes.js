const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const bcrypt = require("bcryptjs");
const authController = require("../controllers/authControllers");

router.post("/registration", authController.signUp);

router.post("/login", authController.logIn);

router.post("/changepassword", authController.changePassword);

router.post("/logout", authController.logOut);

module.exports = router;
