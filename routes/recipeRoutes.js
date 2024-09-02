//Find recipe, get all recipes, delete recipes (admin), update recipe(admin)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const recipeControllers = require("../controllers/recipeControllers");

router.get("/allrecipes", recipeControllers.allRecipes);

router.post("/addnewrecipeadminsonly", recipeControllers.addNewRecipeAdmins);

router.get("/findrecipe", recipeControllers.findRecipe);

router.post("/updaterecipe/:id", recipeControllers.updateRecipe);

//delete recipe only if admin

module.exports = router;
