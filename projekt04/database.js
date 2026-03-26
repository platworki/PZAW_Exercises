import Database from 'better-sqlite3';

const db = new Database('mountains.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS mountains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        height INTEGER NOT NULL,
        date_climbed TEXT,
        notes TEXT,
        user_id INTEGER
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0
  )
`);

export default db;