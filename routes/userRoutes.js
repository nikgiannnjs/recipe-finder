//Routes that concern the use of the app from the user (add my recipe, all my recipes, update my recipe, favourites)
const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const bcrypt = require("bcryptjs");

router.post("/addmyrecipe", async (req, res) => {
  try {
    const {
      email,
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

    const usercheckSQL = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(usercheckSQL, [email]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({
        message:
          "The user with this email does not exist. Please enter a valid email or register.",
      });
    }

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

    if (categoryCheckResult.rows.length === 0) {
      return res.status(400).json({
        message:
          "Invalid category.Please provide a valid category. See all categories here",
      });
    }

    if (!correctCategory) {
      return res.status(400).json({
        message: "Providing a category is mandatory.",
      });
    }

    if (!correctRecipeName) {
      return res.status(400).json({
        message: "Providing a recipe name is mandatory.",
      });
    }

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
      "INSERT INTO recipes (category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
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
      email,
    ]);

    res.status(201).json({ message: "Recipe added successfully" });
  } catch (err) {}
});

router.get("/myrecipes", async (req, res) => {
  try {
    const { email } = req.body;

    const SQL =
      "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes WHERE created_by = $1";
    const myRecipes = await pool.query(SQL, [email]);

    const processedRecipes = myRecipes.rows.map(
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
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.err(err);
  }
});

//update my recipe(check added_by in recipes table)

//favourites

//get all users(only if admin)

//delete users(only if admin)
module.exports = router;
