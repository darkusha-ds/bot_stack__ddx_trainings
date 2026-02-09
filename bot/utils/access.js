const db = require('./db');

async function isAdmin(userId) {
  const res = await db.query(
    'SELECT 1 FROM admins WHERE user_id = $1',
    [userId]
  );
  return res.rowCount > 0;
}

async function isAllowed(userId) {
  const res = await db.query(
    'SELECT 1 FROM users WHERE user_id = $1',
    [userId]
  );
  return res.rowCount > 0 || await isAdmin(userId); // админы тоже имеют доступ
}

async function allowUser(userId, username, addedBy, addedByName) {
  await db.query(`
    INSERT INTO users (user_id, username, added_by, added_by_name)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      added_by = EXCLUDED.added_by,
      added_by_name = EXCLUDED.added_by_name
  `, [userId, username, addedBy, addedByName]);
}

async function revokeUser(userId) {
  await db.query(
    'DELETE FROM users WHERE user_id = $1',
    [userId]
  );
}

module.exports = {
  isAdmin,
  isAllowed,
  allowUser,
  revokeUser
};