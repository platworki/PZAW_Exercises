import express from 'express';
import db, { addTestData } from './database.js';

const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: true }));

addTestData();

app.get('/', (req, res) => {
    const mountains = db.prepare('SELECT * FROM mountains ORDER BY id DESC').all();
    
    let mountainList = '';
    for (let m of mountains) {
        mountainList += `
        <tr>
            <td>${m.name}</td>
            <td>${m.height} m</td>
            <td>${m.date_climbed || '-'}</td>
            <td>${m.notes || '-'}</td>
            <td>
            <a href="/mountain/${m.id}/edit">Edytuj</a>
            <form method="POST" action="/mountain/${m.id}/delete" style="display:inline">
                <button type="submit">Usuń</button>
            </form>
            </td>
        </tr>
        `;
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Góry</title>
            <style>
                body {
                    font-family: Arial;
                    max-width: 900px;
                    margin: 50px auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #aaaaaaff;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #4CAF50;
                    color: white;
                }
                input, textarea { 
                    width: 100%;
                    padding: 5px;
                }
                button {
                    padding: 5px 10px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
        <h1>Moje Góry</h1>
        
        <h2>Dodaj nową górę</h2>
        <form method="POST" action="/mountain">
            <p><input type="text" name="name" placeholder="Nazwa" required></p>
            <p><input type="number" name="height" placeholder="Wysokość (m)" required></p>
            <p><input type="date" name="date_climbed" placeholder="Data zdobycia" required></p>
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
            <th>Akcje</th>
            </tr>
            ${mountainList}
        </table>
        </body>
        </html>
    `);
});

app.post('/mountain', (req, res) => {
    const { name, height, date_climbed, notes } = req.body;
    
    db.prepare(`
        INSERT INTO mountains (name, height, date_climbed, notes)
        VALUES (?, ?, ?, ?)
    `).run(name, height, date_climbed, notes);
    
    res.redirect('/');
});

app.get('/mountain/:id/edit', (req, res) => {
    const mountain = db.prepare('SELECT * FROM mountains WHERE id = ?').get(req.params.id);
    
    if (!mountain) {
        return res.send('Góra nie znaleziona');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Edytuj górę</title>
        <style>
            body {
                font-family: Arial;
                max-width: 600px;
                margin: 50px auto;
            }
            input, textarea {
                width: 100%;
                padding: 5px;
                margin: 5px 0;
            }
            button {
                padding: 5px 10px;
                cursor: pointer;
            }
        </style>
        </head>
        <body>
        <h1>Edytuj: ${mountain.name}</h1>
        <form method="POST" action="/mountain/${mountain.id}/edit">
            <p><input type="text" name="name" value="${mountain.name}" required></p>
            <p><input type="number" name="height" value="${mountain.height}" required></p>
            <p><input type="date" name="date_climbed" value="${mountain.date_climbed || ''}"></p>
            <p><textarea name="notes" rows="3">${mountain.notes || ''}</textarea></p>
            <button type="submit">Zapisz</button>
            <a href="/">Anuluj</a>
        </form>
        </body>
        </html>
    `);
});

app.post('/mountain/:id/edit', (req, res) => {
    const { name, height, date_climbed, notes } = req.body;
    
    db.prepare(`
        UPDATE mountains 
        SET name = ?, height = ?, date_climbed = ?, notes = ?
        WHERE id = ?
    `).run(name, height, date_climbed, notes, req.params.id);
    
    res.redirect('/');
});

app.post('/mountain/:id/delete', (req, res) => {
    db.prepare('DELETE FROM mountains WHERE id = ?').run(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});