//Routes that concern the use of the app from the user (add my recipe, all my recipes, update my recipe, favourites)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const userControllers = require("../controllers/userControllers");

router.post("/addmyrecipe", userControllers.addMyRecipe);

router.get("/myrecipes", userControllers.myRecipes);

router.post("/updatemyrecipe/:id", userControllers.updateMyRecipe);

//favourites

//get all users(only if admin)

//delete users(only if admin)
module.exports = router;
