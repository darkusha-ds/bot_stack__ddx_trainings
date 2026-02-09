const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://ddx:ddx_database@dark-angel.ru:5436/ddxdb'
});

async function initTables() {
  console.log('🔧 Инициализация таблиц...');
  try {
    // equipment
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display TEXT NOT NULL,
        image TEXT,
        type TEXT NOT NULL CHECK (type IN ('strength', 'cardio'))
      );
    `);

    // workouts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT,
        date DATE NOT NULL,
        equipment_id INTEGER REFERENCES equipment(id),
        equipment_name TEXT,
        weight INTEGER,
        reps INTEGER,
        sets INTEGER,
        total INTEGER
      );
    `);

    // cardio_sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cardio_sessions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT,
        date DATE NOT NULL,
        equipment_id INTEGER REFERENCES equipment(id),
        equipment_name TEXT,
        speed_kmh REAL,
        duration_min INTEGER,
        incline_percent REAL,
        distance_km REAL
      );
    `);

    // sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        user_id TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'
      );
    `);

    // admins list
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        user_id BIGINT PRIMARY KEY,
        username TEXT,
        added_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC' + interval '5 hours')
      )
    `);

    // users list
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id BIGINT PRIMARY KEY,
        username TEXT,
        added_by BIGINT REFERENCES admins(user_id) ON DELETE SET NULL,
        added_by_name TEXT,
        added_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Yekaterinburg')
      )
    `);

    console.log('✅ Все таблицы успешно инициализированы');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при инициализации таблиц:', err);
    process.exit(1);
  }
}

initTables();