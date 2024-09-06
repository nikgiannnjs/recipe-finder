const express = require("express");
const router = express.Router();
const pool = require("../dbconnection");
const { correctFormats } = require("../middlewares/formatCorrection");
const { numberOfIngs } = require("../middlewares/numberOfIngredientsCheck");
const { ifAdmin } = require("../middlewares/ifAdmin");
const { nullIngs } = require("../middlewares/nullIngs");
const { validRecipe } = require("../middlewares/validRecipe");
const { adminState } = require("../middlewares/adminState");

exports.myRecipes = async (req, res) => {
  try {
    const user_id = req.params.id;

    const created_by = await adminState(user_id);

    let toSearch;

    if (created_by === "admin") {
      toSearch = "admin";
    } else {
      toSearch = user_id;
    }

    const SQL =
      "SELECT recipe_id, category, recipe_name, first_ingredient, second_ingredient, third_ingredient, fourth_ingredient, fifth_ingredient, cooking_time, description FROM recipes WHERE created_by = $1";
    const myRecipes = await pool.query(SQL, [toSearch]);

    myRecipes.rows = await nullIngs(myRecipes);

    res.status(200).json(myRecipes.rows);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error(err);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user_id = req.params.id;

    await ifAdmin(req, res, user_id, async () => {
      const SQL =
        "SELECT user_id , first_name , last_name , email , admin_state FROM users";

      const result = await pool.query(SQL, []);

      const allUsers = result.rows;

      return res.status(200).json({
        allUsers,
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /getallusers endpoint", err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.query;
    const userIdToDelete = req.params.id;

    await ifAdmin(req, res, user_id, async () => {
      const validUserSQL = "SELECT * FROM users WHERE user_id = $1";
      const user = await pool.query(validUserSQL, [userIdToDelete]);

      if (user.rows.length === 0) {
        return res.status(400).json({
          message: "User does not exist.",
        });
      }

      newUserid = await adminState(userIdToDelete);

      if (newUserid === "admin") {
        return res.status(400).json({
          message: "You cannot delete an admin user.",
        });
      }

      const SQL = "DELETE FROM users WHERE user_id = $1";
      const userToDelete = await pool.query(SQL, [userIdToDelete]);

      return res.status(200).json({
        message: "User deleted successfully",
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /deleteuser endpoint", err);
  }
};

exports.addToFavourites = async (req, res) => {
  try {
    const { user_id } = req.query;
    const recipe_id = req.params.id;

    await validRecipe(req, res, recipe_id, async () => {
      const SQL =
        "INSERT INTO favourites (user_id , recipe_id) VALUES ($1 , $2)";
      const result = await pool.query(SQL, [user_id, recipe_id]);

      res.status(200).json({
        message: "Recipe added to favourites successfully.",
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /addtofavourites endpoint", err);
  }
};

exports.myFavourites = async (req, res) => {
  try {
    const user_id = req.params.id;

    const SQL = "SELECT recipe_id FROM favourites WHERE user_id = $1";
    const result = await pool.query(SQL, [user_id]);

    const recipeIds = result.rows.map((row) => row.recipe_id);

    if (recipeIds.length === 0) {
      return res.status(200).json({
        message: "No favourites yet.",
        favourites: [],
      });
    }

    const placeholders = recipeIds
      .map((_, index) => `($${index + 1})`)
      .join(", ");

    const nextSQL = `
      SELECT recipe_id , category, recipe_name, first_ingredient, second_ingredient,
             third_ingredient, fourth_ingredient, fifth_ingredient,
             cooking_time, description
      FROM recipes
      WHERE recipe_id IN (${placeholders})
    `;
    const favouriteRecipes = await pool.query(nextSQL, recipeIds);

    favouriteRecipes.rows = await nullIngs(favouriteRecipes);

    res.status(200).json(favouriteRecipes.rows);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong with the server. Please try again later",
    });

    console.error("Server error at /myFavourites endpoint", err);
  }
};

exports.deleteFromFavourites = async (req, res) => {
  const { user_id } = req.query;
  const recipe_id = req.params.id;

  if (!recipe_id) {
    return res.status(400).json({
      message: "Id is not provided",
    });
  }

  const checkSQL = "SELECT * FROM favourites WHERE user_id = $1";
  const result = await pool.query(checkSQL, [user_id]);

  if (result.rows.length === 0) {
    return res.status(400).json({
      message: "This user does not have any favourites yet to delete.",
    });
  }

  const SQL = "DELETE FROM favourites WHERE user_id = $1 AND recipe_id = $2";
  const deleteRecipe = await pool.query(SQL, [user_id, recipe_id]);

  res.status(200).json({
    message: "Reciped deleted from favourites successfully.",
  });
};
