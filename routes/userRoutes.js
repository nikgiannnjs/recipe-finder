//Routes that concern the use of the app from the user (add my recipe, all my recipes, update my recipe, favourites)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const userControllers = require("../controllers/userControllers");

router.post("/addmyrecipe", userControllers.addMyRecipe);

router.get("/myrecipes", userControllers.myRecipes);

router.post("/updatemyrecipe/:id", userControllers.updateMyRecipe);

router.post("/addtofavourites/:id", userControllers.addToFavourites);

//get my favourites

//delete from favourites

router.get("/getallusers", userControllers.getAllUsers);

router.delete("/deleteuser/:id", userControllers.deleteUser);

module.exports = router;
