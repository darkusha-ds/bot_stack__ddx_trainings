// helpers.js
const db = require('./db');

async function findEquipment(input) {
  const text = input.trim().toLowerCase();

  // По id
  if (/^\d+$/.test(text)) {
    const id = parseInt(text);
    const res = await db.query('SELECT * FROM equipment WHERE id = $1', [id]);
    return res.rows[0];
  }

  // По имени или display
  const res = await db.query(
    `SELECT * FROM equipment 
     WHERE LOWER(name) = $1 OR LOWER(display) LIKE $2
     LIMIT 1`,
    [text, `%${text}%`]
  );
  return res.rows[0];
}

module.exports = { findEquipment };