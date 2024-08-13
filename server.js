const express = require("express");
const dotenv = require("dotenv");
const pool = require("./dbconnection.js");
const app = require("./app.js");

dotenv.config();

const port = process.env.LOCALHOST_PORT || 3000;

pool.connect((err) => {
  if (err) {
    console.error("Connection to db failed", err.stack);
  } else {
    console.log("Connected to DB succesfully");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
