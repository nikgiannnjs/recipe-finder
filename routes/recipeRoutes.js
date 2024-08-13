//Find recipe, get all recipes, delete recipes (admin), update recipe(admin)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");

router.get("/allrecipes", async (req, res) => {
  try {
    const SQL =
      "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time , description  FROM recipes";

    const result = await pool.query(SQL, []);

    const processedRecipes = result.rows.map(
      ({
        category,
        recipe_name,
        first_ingredient,
        second_ingredient,
        third_ingredient,
        fourth_ingredient,
        fifth_ingredient,
        cooking_time,
        description,
      }) => {
        const recipe = {
          category,
          recipe_name,
          first_ingredient,
          second_ingredient,
          third_ingredient,
          cooking_time,
          description,
        };

        if (fourth_ingredient !== null)
          recipe.fourth_ingredient = fourth_ingredient;
        if (fifth_ingredient !== null)
          recipe.fifth_ingredient = fifth_ingredient;

        return recipe;
      }
    );

    res.status(201).json(processedRecipes);
  } catch (err) {
    res.status(501).json({
      message: "Something went with the server. Please try again later",
    });

    console.log("Server error at /allrecipes endpoint", err);
  }
});

module.exports = router;
