const express = require("express");
const dotenv = require("dotenv");
const app = express();
const recipeRoutes = require("./routes/recipeRoutes");
dotenv.config();

// app.use("/recipefinder/users", userRoutes);

app.use("/recipefinder/recipes", recipeRoutes);

//app.use("/recipefinder/auth", authRoutes);

module.exports = app;
