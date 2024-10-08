const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const host = process.env.HOST;
const port = process.env.POSTGRESQL_PORT;
const database = process.env.DATABASE;
const user = process.env.POSTGRESQL_USER;
const password = process.env.PASSWORD;

const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
});

module.exports = pool;
