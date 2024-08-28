//Routes that concern the use of the app from the user (add new recipe, update my recipe, favourites)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const bcrypt = require("bcryptjs");

//User register
router.post("/registration", async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    const SQL = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(SQL, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "This email already exists.",
      });
    }

    if (password != passwordConfirm) {
      return res.status(400).json({
        message:
          "Password and password confirmation, are not the same. Please try again.",
      });
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10);
      const insertSQL =
        "INSERT INTO users (first_name, last_name, email, user_password) VALUES ($1, $2, $3, $4)";
      const newUser = await pool.query(insertSQL, [
        firstName,
        lastName,
        email,
        encryptedPassword,
      ]);

      return res.status(200).json({
        message: "User registered succesfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /registration endpoint", err);
  }
});
module.exports = router;
