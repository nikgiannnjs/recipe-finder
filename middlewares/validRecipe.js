const pool = require("../dbconnection");

exports.validRecipe = async (req, res, recipe_id, next) => {
  try {
    const SQL = "SELECT * FROM recipes WHERE recipe_id = $1";
    const validRecipe = await pool.query(SQL, [recipe_id]);

    if (validRecipe.rows.length === 0) {
      return res.status(200).json({
        message: "Invalid recipe id",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      message:
        "Something went wrong while trying to check if the recipe id is valid.",
    });

    console.error(err);
  }
};
