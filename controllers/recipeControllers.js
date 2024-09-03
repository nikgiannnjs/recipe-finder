const express = require("express");
const pool = require("../dbconnection");
const { correctFormats } = require("../middlewares/formatCorrection");
const { numberOfIngs } = require("../middlewares/numberOfIngredientsCheck");
const { ifAdmin } = require("../middlewares/ifAdmin");

exports.allRecipes = async (req, res) => {
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
};

exports.addNewRecipeAdmins = async (req, res) => {
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

    const adminCheckSQL = "SELECT admin_state FROM users WHERE email = $1";
    const admin = await pool.query(adminCheckSQL, [email]);

    if (admin.rows.length === 0 || admin.rows[0].admin_state === false) {
      return res.status(400).json({
        messsage: "Access denied. Admins only",
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

    const created_by = "admin";
    const SQL =
      "INSERT INTO recipes (category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description , created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 , $10)";
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

    res.status(201).json({ message: "Recipe added successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /addnewrecipe endpoint", err);
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
        "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3";

      recipe = await pool.query(SQL, ingredients);
    } else if (ingredients.length === 4) {
      SQL =
        "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3 AND fourth_ingredient = $4";

      recipe = await pool.query(SQL, ingredients);
    } else if (ingredients.length === 5) {
      SQL =
        "SELECT category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes WHERE first_ingredient = $1 AND second_ingredient = $2 AND third_ingredient = $3 AND fourth_ingredient = $4 AND fifth_ingredient = $5";

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

    await ifAdmin(req, res, email, async () => {
      const SQL =
        "UPDATE recipes SET category = $1 , recipe_name = $2 , first_ingredient = $3 , second_ingredient = $4 , third_ingredient = $5 , fourth_ingredient = $6 , fifth_ingredient = $7 , cooking_time = $8 , description = $9 WHERE recipe_id = $10";
      const values = [
        category,
        recipe_name,
        first_ingredient,
        second_ingredient,
        third_ingredient,
        fourth_ingredient,
        fifth_ingredient,
        cooking_time,
        description,
        recipe_id,
      ];

      const result = await pool.query(SQL, values);

      res.status(200).json({
        message: "Recipe updated succesfully",
        updatedRecipe: {
          category,
          recipe_name,
          first_ingredient,
          second_ingredient,
          third_ingredient,
          ...(fourth_ingredient !== null &&
            fourth_ingredient !== undefined && { fourth_ingredient }),
          ...(fifth_ingredient !== null &&
            fifth_ingredient !== undefined && { fifth_ingredient }),
          cooking_time,
          description,
        },
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /updateRecipe endpoint", error);
  }
};
