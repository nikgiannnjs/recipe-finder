const pool = require("../dbconnection");

exports.validRecipe = async (recipe_id, res) => {
  try {
    const SQL = "SELECT * FROM recipes WHERE recipe_id = $1";
    const validRecipe = await pool.query(SQL, [recipe_id]);

    if (validRecipe.rows.length === 0) {
      res.status(400).json({
        message: "Invalid recipe id",
      });
      return null;
    }
    return true;
  } catch (err) {
    console.error("Error validating recipe:", err);
    res.status(500).json({
      message:
        "Something went wrong while trying to check if the recipe id is valid.",
    });
    return null;
  }
};
