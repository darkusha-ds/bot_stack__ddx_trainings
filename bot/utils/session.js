const db = require('./db');

async function getSession(userId) {
  const uid = String(userId);
  const res = await db.query(
    'SELECT data FROM sessions WHERE user_id = $1',
    [uid]
  );

  if (res.rows.length > 0) {
    return res.rows[0].data;
  }

  // Если нет — создаём пустую сессию
  const emptySession = {};
  await db.query(
    'INSERT INTO sessions (user_id, data) VALUES ($1, $2)',
    [uid, emptySession]
  );
  return emptySession;
}

async function setSession(userId, data) {
  const uid = String(userId);
  await db.query(
    `INSERT INTO sessions (user_id, data)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET data = EXCLUDED.data`,
    [uid, data]
  );
}

async function resetSession(userId) {
  const uid = String(userId);
  await db.query(
    `INSERT INTO sessions (user_id, data)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET data = $2`,
    [uid, {}]
  );
}

module.exports = {
  getSession,
  setSession,
  resetSession
};