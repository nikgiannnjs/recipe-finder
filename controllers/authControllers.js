const pool = require("../dbconnection");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

dotenv.config();

const JWT_KEY = process.env.JWT_KEY;
const JWT_LI_EXPIRATION = process.env.JWT_LI_EXPIRATION;
const JWT_FPW_EXPIRATION = process.env.JWT_FPW_EXPIRATION;
const GMAIL = process.env.GMAIL;
const PASSWORD = process.env.PASSWORD;

exports.signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "First name and last name are mandatory.",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is mandatory.",
      });
    }

    const SQL = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(SQL, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "This email already exists.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Please provide a password.",
      });
    }

    if (!passwordConfirm) {
      return res.status(400).json({
        message: "Please confirm your password.",
      });
    }

    if (password != passwordConfirm) {
      return res.status(400).json({
        message: "Password and password confirmation, are not the same.",
      });
    }

    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password has to be at least 6 characters.",
      });
    }

    if (!regex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least an uppercase, a number and a special character.",
      });
    }

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

    if (!email) {
      return res.status(400).json({
        message: "Please provide an email.",
      });
    }

    if (!user_password) {
      return res.status(400).json({
        message: "Please provide your password.",
      });
    }

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
        expiresIn: JWT_LI_EXPIRATION,
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

exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, newPasswordConfirm } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please provide an email",
      });
    }

    const validUserSQL = "SELECT * FROM users WHERE email =$1";

    const result = await pool.query(validUserSQL, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "This email does not exist. Please provide a valid email.",
      });
    }

    const user = result.rows[0];

    if (!oldPassword) {
      return res.status(400).json({
        message: "Please provide your old password.",
      });
    }

    const validOldPassword = await bcrypt.compare(
      oldPassword,
      user.user_password
    );

    if (validOldPassword === false) {
      return res.status(400).json({
        message: "Password confirmation failed.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "Please provide a new password.",
      });
    }

    if (newPassword != newPasswordConfirm) {
      return res.status(400).json({
        message: "Password and password confirmation are not the same.",
      });
    }

    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password has to be at least 6 characters.",
      });
    }

    if (!regex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least an uppercase, a number and a special character.",
      });
    }

    const encryptedNewPassword = await bcrypt.hash(newPassword, 10);

    const SQL =
      "UPDATE users SET user_password = $1 , password_updated_at = CURRENT_TIMESTAMP WHERE email = $2";

    const newResult = await pool.query(SQL, [encryptedNewPassword, email]);

    return res.status(200).json({
      message: "Password updated succesfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /changepassword endpoint", err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide an email.",
      });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows[0].length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const token = await jwt.sign({ email }, JWT_KEY, {
      expiresIn: JWT_FPW_EXPIRATION,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: GMAIL,
        pass: PASSWORD,
      },
    });

    const resetLink = `http://recipefinder/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: GMAIL,
      to: email,
      subject: "Reset Password",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email", error);

        return res.status(500).json({
          message: "Failed to send password reset email. Please try again.",
        });
      } else {
        res.status(200).json({
          message: "A link has been sent to your email.",
        });

        console.log("Email info:", info.response);
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later.",
    });

    console.error("erver error at /forgotpassword endpoint", err);
  }
};

const blacklistedTokens = new Set();

exports.logOut = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (token) {
      blacklistedTokens.add(token);
      return res.status(200).json({ message: "Successfully logged out" });
    } else {
      res.status(400).json({ error: "No token provided" });
    }
  } catch (err) {}
};
