const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const adapter = new JSONFile('sessions.json');
const db = new Low(adapter, { sessions: {} });

async function loadSessions() {
  await db.read();
  db.data ||= { sessions: {} };
}

async function saveSessions() {
  await db.write();
}

async function getSession(userId) {
  await loadSessions();
  const uid = String(userId);
  if (!db.data.sessions[uid]) {
    db.data.sessions[uid] = {};
    await saveSessions();
  }
  return db.data.sessions[uid];
}

async function setSession(userId, data) {
  await loadSessions();
  db.data.sessions[String(userId)] = data;
  await saveSessions();
}

async function resetSession(userId) {
  await loadSessions();
  db.data.sessions[String(userId)] = {};
  await saveSessions();
}

module.exports = {
  getSession,
  setSession,
  resetSession
};