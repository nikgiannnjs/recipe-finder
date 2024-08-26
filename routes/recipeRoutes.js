//Find recipe, get all recipes, delete recipes (admin), update recipe(admin)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");

router.get("/allrecipes", async (req, res) => {
  try {
    const SQL =
      "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes";

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
          fourth_ingredient:
            fourth_ingredient !== null ? fourth_ingredient : undefined,
          fifth_ingredient:
            fifth_ingredient !== null ? fifth_ingredient : undefined,
          cooking_time,
          description,
        };

        return recipe;
      }
    );

    res.status(200).json(processedRecipes);
  } catch (err) {
    res.status(501).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.log("Server error at /allrecipes endpoint", err);
  }
});

module.exports = router;
