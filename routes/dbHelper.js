const sql = require("mssql");
const db = require("../db/config");

async function getPool() {
  return sql.connect(db);
}

function handleError(res, err, message) {
  console.error(message, err);
  res.status(500).json({ message });
}

module.exports = { getPool, handleError };
