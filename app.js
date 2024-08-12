const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

app.use("/", (req, res) => {
  res.send("Hello world");
});

module.exports = app;
