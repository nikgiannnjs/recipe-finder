//Controllers that concern authRoutes (Signup, Login, Changepassword, Logout)
const pool = require("../dbconnection");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const JWT_KEY = process.env.JWT_KEY;

exports.signUp = async (req, res) => {
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
};

exports.logIn = async (req, res) => {
  try {
    const { email, user_password } = req.body;

    const validUserSQL = "SELECT * FROM users WHERE email =$1";

    const result = await pool.query(validUserSQL, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Wrong email or password",
      });
    }

    const user = result.rows[0];

    const correctPassword = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (correctPassword === false) {
      return res.status(400).json({
        message: "Wrong email or password",
      });
    } else {
      const token = await jwt.sign({ userID: user.user_id }, JWT_KEY, {
        expiresIn: "1h",
      });

      res.status(200).json({
        message: "Login successfull.",
        token: token,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /login endpoint", err);
  }
};
