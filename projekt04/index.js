import express, { urlencoded } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import db, { addTestData } from './database.js';

const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'tajny_klucz_123',
    // Optymalizacja :)
    resave: false,
    saveUninitialized: false
}));

function requireLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    next();
}

const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)').run('admin', hash, 1);
    console.log('Admin account created! Login: admin / admin123');
}
addTestData();

app.get('/', requireLogin, (req, res) => {
    const user = req.session.user;
    let mountains;

    if (user.is_admin) {
        mountains = db.prepare('SELECT mountains.*, users.username FROM mountains LEFT JOIN users ON mountains.user_id = users.id ORDER BY mountains.id DESC').all();
    } 
    else {
        mountains = db.prepare('SELECT * FROM mountains WHERE user_id = ? ORDER BY id DESC').all(user.id);
    }

    let mountainList = '';

    for (let m of mountains) {
        const canEdit = user.is_admin || m.user_id === user.id;
        const dateDisplay = m.date_climbed || '-';
        const notesDisplay = m.notes || '-';
        let adminUserColumn = '';
        if (user.is_admin) {
            adminUserColumn = `<td>${m.username || '-'}</td>`;
        }
        let actionButtons = '-';
        if (canEdit) {
            actionButtons = `
            <a href="/mountain/${m.id}/edit">Edytuj</a>
            <form method="POST" action="/mountain/${m.id}/delete" style="display:inline">
            <button type="submit">Usuń</button>
            </form>
        `;
        }
        mountainList += `
        <tr>
            <td>${m.name}</td>
            <td>${m.height} m</td>
            <td>${dateDisplay}</td>
            <td>${notesDisplay}</td>
            ${adminUserColumn}
            <td>${actionButtons}</td>
        </tr>
        `;
    }

    let adminLabel = '';
    let adminHeader = '';

    if (user.is_admin) {
        adminLabel = ' (admin)';
        adminHeader = '<th>Użytkownik</th>';
    }
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Góry</title>
        <style>
            body { font-family: Arial; max-width: 900px; margin: 50px auto; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            input, textarea { width: 100%; padding: 5px; }
            button { padding: 5px 10px; cursor: pointer; }
            .topbar { display: flex; justify-content: space-between; align-items: center; }
        </style>
        </head>
        <body>
            <div class="topbar">
                <h1>Moje Góry</h1>
                <div>
                Zalogowany jako: <b>${user.username}</b>
                ${adminLabel}
                <form method="POST" action="/logout" style="display:inline">
                    <button type="submit">Wyloguj</button>
                </form>
                </div>
            </div>
            
            <h2>Dodaj nową górę</h2>
            <form method="POST" action="/mountain">
                <p><input type="text" name="name" placeholder="Nazwa" required></p>
                <p><input type="number" name="height" placeholder="Wysokość (m)" required></p>
                <p><input type="date" name="date_climbed"></p>
                <p><textarea name="notes" placeholder="Notatki" rows="3"></textarea></p>
                <button type="submit">Dodaj</button>
            </form>

            <h2>Lista gór (${mountains.length})</h2>
            <table>
                <tr>
                <th>Nazwa</th>
                <th>Wysokość</th>
                <th>Data zdobycia</th>
                <th>Notatki</th>
                ${adminHeader}
                <th>Akcje</th>
                </tr>
                ${mountainList}
            </table>
        </body>
        </html>
    `);
});

app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Logowanie</title>
        <style>
            body { font-family: Arial; max-width: 400px; margin: 100px auto; }
            input { width: 100%; padding: 8px; margin: 5px 0; }
            button { padding: 8px 20px; cursor: pointer; }
            .error { color: red; }
        </style>
        </head>
        <body>
            <h1>Logowanie</h1>
            <form method="POST" action="/login">
                <p><input type="text" name="username" placeholder="Login" required></p>
                <p><input type="password" name="password" placeholder="Hasło" required></p>
                <button type="submit">Zaloguj</button>
            </form>
            <p>Nie masz konta? <a href="/register">Zarejestruj się</a></p>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        res.send('Błędny login lub hasło. <a href="/login">Wróć</a>');
        return;
    }
    req.session.user = { 
        id: user.id, 
        username: user.username, 
        is_admin: user.is_admin 
    };
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Rejestracja</title>
        <style>
            body { font-family: Arial; max-width: 400px; margin: 100px auto; }
            input { width: 100%; padding: 8px; margin: 5px 0; }
            button { padding: 8px 20px; cursor: pointer; }
        </style>
        </head>
        <body>
            <h1>Rejestracja</h1>
            <form method="POST" action="/register">
                <p><input type="text" name="username" placeholder="Login" required></p>
                <p><input type="password" name="password" placeholder="Hasło" required></p>
                <button type="submit">Zarejestruj</button>
            </form>
            <p>Masz już konto? <a href="/login">Zaloguj się</a></p>
        </body>
        </html>
    `);
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existing) {
        res.send('Login już zajęty. <a href="/register">Wróć</a>');
        return;
    }
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.post('/mountain', requireLogin, (req, res) => {
    const { name, height, date_climbed, notes } = req.body;
    
    db.prepare(`
        INSERT INTO mountains (name, height, date_climbed, notes, user_id)
        VALUES (?, ?, ?, ?, ?)
    `).run(name, height, date_climbed, notes, req.session.user.id);

    res.redirect('/');
});

app.get('/mountain/:id/edit', requireLogin, (req, res) => {
    const user = req.session.user;
    const mountain = db.prepare('SELECT * FROM mountains WHERE id = ?').get(req.params.id);

    if (!mountain) {
        res.send('Góra nie znaleziona');
        return;
    }
    if (!user.is_admin && mountain.user_id !== user.id) {
        res.send('Brak dostępu');
        return;
    }

    const dateValue = mountain.date_climbed || '';
    const notesValue = mountain.notes || '';

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Edytuj górę</title>
        <style>
            body { font-family: Arial; max-width: 600px; margin: 50px auto; }
            input, textarea { width: 100%; padding: 5px; margin: 5px 0; }
            button { padding: 5px 10px; cursor: pointer; }
        </style>
        </head>
        <body>
            <h1>Edytuj: ${mountain.name}</h1>
            <form method="POST" action="/mountain/${mountain.id}/edit">
                <p><input type="text" name="name" value="${mountain.name}" required></p>
                <p><input type="number" name="height" value="${mountain.height}" required></p>
                <p><input type="date" name="date_climbed" value="${dateValue}"></p>
                <p><textarea name="notes" rows="3">${notesValue}</textarea></p>
                <button type="submit">Zapisz</button>
                <a href="/">Anuluj</a>
            </form>
        </body>
        </html>
    `);
});

app.post('/mountain/:id/edit', requireLogin, (req, res) => {
    const user = req.session.user;
    const mountain = db.prepare('SELECT * FROM mountains WHERE id = ?').get(req.params.id);

    if (!mountain) {
        res.send('Góra nie znaleziona');
        return;
    }
    if (!user.is_admin && mountain.user_id !== user.id) {
        res.send('Brak dostępu');
        return;
    }

    const { name, height, date_climbed, notes } = req.body;

    db.prepare(`
        UPDATE mountains SET name = ?, height = ?, date_climbed = ?, notes = ?
        WHERE id = ?
    `).run(name, height, date_climbed, notes, req.params.id);

    res.redirect('/');
});

app.post('/mountain/:id/delete', requireLogin, (req, res) => {
    const user = req.session.user;
    const mountain = db.prepare('SELECT * FROM mountains WHERE id = ?').get(req.params.id);
    
    if (!mountain) {
        res.send('Góra nie znaleziona');
        return;
    }
    if (!user.is_admin && mountain.user_id !== user.id) {
        res.send('Brak dostępu');
        return;
    }

    db.prepare('DELETE FROM mountains WHERE id = ?').run(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});