import argon2 from 'argon2';
import db from './database.js';

async function seed() {
    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    
    if (!admin) {
        const hash = await argon2.hash('admin123');
        db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)').run('admin', hash, 1);
        console.log('Admin account created (login: admin, password: admin123)');
    } else {
        console.log('Admin account already exists');
    }
    
    const count = db.prepare('SELECT COUNT(*) as count FROM mountains').get();
    
    if (count.count === 0) {
        const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
        const insert = db.prepare('INSERT INTO mountains (name, height, date_climbed, notes, user_id) VALUES (?, ?, ?, ?, ?)');
        
        insert.run('Rysy', 2499, '2023-07-15', 'mmm morskie oczko', adminUser.id);
        insert.run('Giewont', 1895, '2023-08-20', 'Rozgrzewka na Rysy', adminUser.id);
        insert.run('Kasprowy Wierch', 1987, '2024-01-10', 'Zimno', adminUser.id);
        
        console.log('Test mountains added');
    }
    else {
        console.log('Mountains already exist');
    }
    
    console.log('\nDatabase seeded successfully!');
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});