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

export function addTestData() {
    const count = db.prepare('SELECT COUNT(*) as count FROM mountains').get();
    
    if (count.count === 0) {
        const insert = db.prepare(`
        INSERT INTO mountains (name, height, date_climbed, notes)
        VALUES (?, ?, ?, ?)
        `);
        
        insert.run('Rysy', 2499, '2023-07-15', 'Super widok');
        insert.run('Giewont', 1895, '2023-08-20', 'Dużo turystów');
        insert.run('Kasprowy Wierch', 1987, '2024-01-10', 'Trening przed Rysami');
    }
}

export default db;