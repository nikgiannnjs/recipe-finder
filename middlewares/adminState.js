const pool = require("../dbconnection");

exports.adminState = async (user_id) => {
  const SQL = "SELECT admin_state FROM users WHERE user_id = $1";
  const adminState = await pool.query(SQL, [user_id]);

  let result;

  if (adminState.rows[0].admin_state === false) {
    result = user_id;
  } else {
    result = "admin";
  }

  return result;
};
