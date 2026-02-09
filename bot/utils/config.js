// utils/config.js
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  require('dotenv').config();
}

const {
  BOT_TOKEN,
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

const databaseUrl =
  DATABASE_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

module.exports = {
  isDev,
  botToken: BOT_TOKEN,
  databaseUrl
};