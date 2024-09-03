const pool = require("../dbconnection");

exports.ifAdmin = async (req, res, email, next) => {
  try {
    const checkSQL = "SELECT admin_state FROM users WHERE email = $1";

    const admin = await pool.query(checkSQL, [email]);

    if (admin.rows.length === 0 || admin.rows[0].admin_state === false) {
      return res.status(400).json({
        message: "Access denied, admins only",
      });
    }

    next();
  } catch (err) {
    console.error("Error checking admin state:", error);
    return res.status(500).json({
      message: "Internal server error while checking admin status",
    });
  }
};
