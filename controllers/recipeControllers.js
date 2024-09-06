const express = require("express");
const pool = require("../dbconnection");
const { correctFormats } = require("../middlewares/formatCorrection");
const { numberOfIngs } = require("../middlewares/numberOfIngredientsCheck");
const { ifAdmin } = require("../middlewares/ifAdmin");
const { nullIngs } = require("../middlewares/nullIngs");
const { validRecipe } = require("../middlewares/validRecipe");
const { adminState } = require("../middlewares/adminState");

exports.allRecipes = async (req, res) => {
  try {
    const SQL =
      "SELECT recipe_id , category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes";

    const recipes = await pool.query(SQL, []);

    recipes.rows = await nullIngs(recipes);

    res.status(200).json(recipes.rows);
  } catch (err) {
    res.status(501).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /allrecipes endpoint", err);
  }
};

exports.addNewRecipe = async (req, res) => {
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

    const user_id = req.params.id;

    const usercheckSQL = "SELECT * FROM users WHERE user_id = $1";
    const existingUser = await pool.query(usercheckSQL, [user_id]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({
        message: "The user does not exist.",
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

    const created_by = await adminState(user_id);

    const SQL =
      "INSERT INTO recipes (category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING recipe_id";
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
      created_by,
    ]);

    if (result.rowCount != 1) {
      return res.status(400).json({ message: "Could not add recipe." });
    }

    res.status(200).json({ message: "Recipe added successfully" });
    console.log(result.rows[0].recipe_id);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Error at /addmyrecipe endpoint", err);
  }
};

exports.findRecipe = async (req, res) => {
  try {
    const ingredients = req.query.q;
    let SQL;
    let recipe;

    if (ingredients.length < 3) {
      return res.status(400).json({
        message: "Please provide at least 3 ingredients",
      });
    } else if (ingredients.length === 3) {
      SQL =
        "SELECT recipe_id , category, recipe_name, first_ingredient, second_ingredient, third_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3";

      recipe = await pool.query(SQL, ingredients);
    } else if (ingredients.length === 4) {
      SQL =
        "SELECT recipe_ id , category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3 AND fourth_ingredient = $4";

      recipe = await pool.query(SQL, ingredients);
    } else if (ingredients.length === 5) {
      SQL =
        "SELECT recipe_id , category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3 AND fourth_ingredient = $4 AND fifth_ingredient = $5";

      recipe = await pool.query(SQL, ingredients);
    }

    if (recipe && recipe.rows.length === 0) {
      return res.status(400).json({
        message:
          "Could not find a recipe with these ingredients. Please provide other ingredients or add a new recipe with the ingredients you have.",
      });
    } else {
      return res.status(200).json(recipe.rows);
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /findrecipe endpoint", err);
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe_id = req.params.id;
    const { user_id } = req.query;

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

    const usercheckSQL = "SELECT * FROM users WHERE user_id = $1";
    const existingUser = await pool.query(usercheckSQL, [user_id]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({
        message: "The user does not exist.",
      });
    }

    await ifAdmin(req, res, user_id, async () => {
      const checkSQL = "SELECT * FROM recipes WHERE recipe_id = $1";
      const validRecipe = await pool.query(checkSQL, [recipe_id]);

      if (validRecipe.rows.length === 0) {
        return res.status(200).json({
          message: "Invalid recipe id",
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
        "UPDATE recipes SET category = $1 , recipe_name = $2 , first_ingredient = $3 , second_ingredient = $4 , third_ingredient = $5 , fourth_ingredient = $6 , fifth_ingredient = $7 , cooking_time = $8 , description = $9 , updated_at = CURRENT_TIMESTAMP WHERE recipe_id = $10";
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

      await pool.query(SQL, values);

      const newSQL = "SELECT * FROM recipes WHERE recipe_id = $1";
      const updatedRecipe = await pool.query(newSQL, [recipe_id]);

      updatedRecipe.rows = await nullIngs(updatedRecipe);

      res.status(200).json({
        message: "Recipe updated succesfully",
        updatedRecipe: updatedRecipe.rows,
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /updateRecipe endpoint", err);
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe_id = req.params.id;
    const { user_id } = req.query;

    const usercheckSQL = "SELECT * FROM users WHERE user_id = $1";
    const existingUser = await pool.query(usercheckSQL, [user_id]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({
        message: "The user does not exist.",
      });
    }

    await validRecipe(req, res, recipe_id, async () => {
      await ifAdmin(req, res, user_id, async () => {
        const SQL = "DELETE FROM recipes WHERE recipe_id = $1";

        const recipeToDelete = await pool.query(SQL, [recipe_id]);

        res.status(200).json({
          message: "Recipe deleted succesfully",
        });
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /deleteRecipe endpoint", err);
  }
};

exports.recipeSearch = async (req, res) => {
  try {
    const query = req.query.q;

    const SQL =
      "SELECT recipe_id , category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient , cooking_time , description FROM recipes WHERE recipe_name ILIKE $1";

    const recipe = await pool.query(SQL, [`%${query}%`]);

    if (recipe.rows.length === 0) {
      res.status(400).json({
        message: "No results found",
      });
    } else {
      recipe.rows = await nullIngs(recipe);

      res.status(200).json(recipe.rows);
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /search endpoint", err);
  }
};
