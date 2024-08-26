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

    console.error("Server error at /allrecipes endpoint", err);
  }
});

router.post("/addnewrecipe", async (req, res) => {
  try {
    const {
      category,
      recipe_name,
      first_ingredient,
      second_ingredient,
      third_ingredient,
      fourth_ingredient,
      fifth_ingredient,
      cooking_time,
      description,
    } = req.body;

    const correctCategory =
      category.charAt(0).toUpperCase() + category.slice(1);
    const correctRecipeName =
      recipe_name.charAt(0).toUpperCase() + recipe_name.slice(1);
    const correctFirstIngredient = first_ingredient
      ? first_ingredient.charAt(0).toUpperCase() + first_ingredient.slice(1)
      : null;
    const correctSecondIngredient = second_ingredient
      ? second_ingredient.charAt(0).toUpperCase() + second_ingredient.slice(1)
      : null;
    const correctThirdIngredient = third_ingredient
      ? third_ingredient.charAt(0).toUpperCase() + third_ingredient.slice(1)
      : null;
    const correctFourthIngredient = fourth_ingredient
      ? fourth_ingredient.charAt(0).toUpperCase() + fourth_ingredient.slice(1)
      : null;
    const correctFifthIngredient = fifth_ingredient
      ? fifth_ingredient.charAt(0).toUpperCase() + fifth_ingredient.slice(1)
      : null;

    const categoryCheck = "SELECT * FROM categories WHERE category = $1";
    const categoryCheckResult = await pool.query(categoryCheck, [
      correctCategory,
    ]);

    //Check if the category is valid: based on the category table
    if (categoryCheckResult.rows.length === 0) {
      return res.status(400).json({
        message:
          "Invalid category.Please provide a valid category. See all categories here",
      });
    }

    //Check if body has a category
    if (!correctCategory) {
      return res.status(400).json({
        message: "Providing a category is mandatory.",
      });
    }

    //Check if body has a recipe name
    if (!correctRecipeName) {
      return res.status(400).json({
        message: "Providing a recipe name is mandatory.",
      });
    }

    //Ingredients check:At least 3
    let sumFirstIngredient,
      sumSecondIngredient,
      sumThirdIngredient,
      sumFourthIngredient,
      sumFifthIngredient;

    if (!correctFirstIngredient) {
      sumFirstIngredient = 0;
    } else {
      sumFirstIngredient = 1;
    }

    if (!correctSecondIngredient) {
      sumSecondIngredient = 0;
    } else {
      sumSecondIngredient = 1;
    }

    if (!correctThirdIngredient) {
      sumThirdIngredient = 0;
    } else {
      sumThirdIngredient = 1;
    }

    if (!correctFourthIngredient) {
      sumFourthIngredient = 0;
    } else {
      sumFourthIngredient = 1;
    }

    if (!correctFifthIngredient) {
      sumFifthIngredient = 0;
    } else {
      sumFifthIngredient = 1;
    }

    const sum =
      sumFirstIngredient +
      sumSecondIngredient +
      sumThirdIngredient +
      sumFourthIngredient +
      sumFifthIngredient;

    if (sum < 3) {
      return res.status(400).json({
        message: "Please provide at least three ingredients.",
      });
    }

    if (!cooking_time) {
      return res.status(400).json({
        message: "Providing the cooking time is mandatory.",
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Providing the description is mandatory.",
      });
    }

    const SQL =
      "INSERT INTO recipes (category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    const result = await pool.query(SQL, [
      correctCategory,
      correctRecipeName,
      correctFirstIngredient,
      correctSecondIngredient,
      correctThirdIngredient,
      correctFourthIngredient,
      correctFifthIngredient,
      cooking_time,
      description,
    ]);

    res.status(201).json({ message: "Recipe added successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /addnewrecipe endpoint", err);
  }
});

module.exports = router;
