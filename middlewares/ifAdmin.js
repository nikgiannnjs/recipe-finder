const pool = require("../dbconnection");

exports.ifAdmin = async (user_id, res) => {
  try {
    const checkSQL = "SELECT admin_state FROM users WHERE user_id = $1";
    const admin = await pool.query(checkSQL, [user_id]);

    if (admin.rows.length === 0 || admin.rows[0].admin_state === false) {
      res.status(403).json({
        message: "Access denied, admins only",
      });
      return null;
    }

    return true;
  } catch (err) {
    console.error("Error checking admin state:", err);
    res.status(500).json({
      message: "Internal server error while checking admin status",
    });
    return null;
  }
};
