import db from './database.js';

export const queries = {
    users: {
        findByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
        insert: db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)'),
        insertRegular: db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    },
    mountains: {
        findById: db.prepare('SELECT * FROM mountains WHERE id = ?'),
        findByUser: db.prepare('SELECT * FROM mountains WHERE user_id = ? ORDER BY id DESC'),
        findAllWithUsers: db.prepare('SELECT mountains.*, users.username FROM mountains LEFT JOIN users ON mountains.user_id = users.id ORDER BY mountains.id DESC'),
        insert: db.prepare('INSERT INTO mountains (name, height, date_climbed, notes, user_id) VALUES (?, ?, ?, ?, ?)'),
        update: db.prepare('UPDATE mountains SET name = ?, height = ?, date_climbed = ?, notes = ? WHERE id = ?'),
        delete: db.prepare('DELETE FROM mountains WHERE id = ?')
    }
};