const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const { correctFormats } = require("../middlewares/formatCorrection");
const { numberOfIngs } = require("../middlewares/numberOfIngredientsCheck");
const { ifAdmin } = require("../middlewares/ifAdmin");

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

    const sum = await numberOfIngs(
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

exports.updateMyRecipe = async (req, res) => {
  try {
    const recipe_id = req.params.id;

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

    const checkSQL = "SELECT created_by FROM recipes WHERE recipe_id = $1";

    const createdBy = await pool.query(checkSQL, [recipe_id]);

    if (createdBy.rows[0].created_by !== email) {
      return res.status(400).json({
        message: "You cannot update this recipe.",
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

    const SQL =
      "UPDATE recipes SET category = $1 , recipe_name = $2 , first_ingredient = $3 , second_ingredient = $4 , third_ingredient = $5 , fourth_ingredient = $6 , fifth_ingredient = $7 , cooking_time = $8 , description = $9 WHERE recipe_id = $10";
    const values = [
      correctCategory,
      correctRecipeName,
      correctFirstIngredient,
      correctSecondIngredient,
      correctThirdIngredient,
      correctFourthIngredient,
      correctFifthIngredient,
      cooking_time,
      description,
      recipe_id,
    ];

    const result = await pool.query(SQL, values);

    res.status(200).json({
      message: "Recipe updated succesfully",
      updatedRecipe: {
        correctCategory,
        correctRecipeName,
        correctFirstIngredient,
        correctSecondIngredient,
        correctThirdIngredient,
        ...(correctFourthIngredient !== null &&
          correctFourthIngredient !== undefined && { correctFourthIngredient }),
        ...(correctFifthIngredient !== null &&
          correctFifthIngredient !== undefined && { correctFifthIngredient }),
        cooking_time,
        description,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /updateMyRecipe endpoint", err);
  }
};

exports.getAllUsers = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is not provided",
    });
  }

  await ifAdmin(req, res, email, async () => {
    const SQL =
      "SELECT user_id , first_name , last_name , email , admin_state FROM users";

    const result = await pool.query(SQL, []);

    const allUsers = result.rows;

    return res.status(200).json({
      allUsers,
    });
  });
};
