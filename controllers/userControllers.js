const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const { correctFormats } = require("../middlewares/formatCorrection");
const {
  numberOfIngsCheck,
} = require("../middlewares/numberOfIngredientsCheck");

exports.addMyRecipe = async (req, res) => {
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

    const {
      correctCategory,
      correctRecipeName,
      correctFirstIngredient,
      correctSecondIngredient,
      correctThirdIngredient,
      correctFourthIngredient,
      correctFifthIngredient,
    } = await correctFormats(
      category,
      recipe_name,
      first_ingredient,
      second_ingredient,
      third_ingredient,
      fourth_ingredient,
      fifth_ingredient
    );

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

    const sum = await numberOfIngsCheck(
      correctFirstIngredient,
      correctSecondIngredient,
      correctThirdIngredient,
      correctFourthIngredient,
      correctFifthIngredient
    );

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
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Error at /addmyrecipe endpoint", err);
  }
};

exports.myRecipes = async (req, res) => {
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

    console.error(err);
  }
};
