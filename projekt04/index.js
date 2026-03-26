import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import argon2 from 'argon2';
import { queries } from './queries.js';
import { requireLogin, csrfMiddleware, checkCsrf, isValidHeight, isValidPastDate, canEdit } from './middleware.js';
import { mainPage, loginPage, registerPage, editPage, errorPage } from './templates.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict'
    }
}));

app.use(csrfMiddleware);

app.get('/', requireLogin, (req, res) => {
    const user = req.session.user;
    const mountains = user.is_admin 
        ? queries.mountains.findAllWithUsers.all()
        : queries.mountains.findByUser.all(user.id);
    
    res.send(mainPage(user, mountains, req.session.csrfToken));
});

app.get('/login', (req, res) => {
    res.send(loginPage(req.session.csrfToken));
});

app.post('/login', async (req, res) => {
    if (!checkCsrf(req, res)) return;

    const { username, password } = req.body;

    if (!username || !password || username.length > 50) {
        return res.send(errorPage('Nieprawidłowe dane'));
    }

    const user = queries.users.findByUsername.get(username);
    
    if (!user || !(await argon2.verify(user.password, password))) {
        return res.send(errorPage('Błędny login lub hasło'));
    }
    
    req.session.user = { 
        id: user.id, 
        username: user.username, 
        is_admin: user.is_admin 
    };
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(registerPage(req.session.csrfToken));
});

app.post('/register', async (req, res) => {
    if (!checkCsrf(req, res)) return;

    const { username, password, password2 } = req.body;

    if (!username || !password || username.length < 3 || username.length > 50 || password.length < 6) {
        return res.send(errorPage('Login (3-50 znaków) i hasło (min 6 znaków) wymagane'));
    }
    
    if (password !== password2) {
        return res.send(errorPage('Hasła nie są identyczne'));
    }

    const existing = queries.users.findByUsername.get(username);
    if (existing) {
        return res.send(errorPage('Login już zajęty'));
    }
    
    const hash = await argon2.hash(password);
    queries.users.insertRegular.run(username, hash);
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    if (!checkCsrf(req, res)) return;
    req.session.destroy();
    res.redirect('/login');
});

app.post('/mountain', requireLogin, (req, res) => {
    if (!checkCsrf(req, res)) return;

    const { name, height, date_climbed, notes } = req.body;

    if (!name || name.length > 100) {
        return res.send(errorPage('Nazwa wymagana (max 100 znaków)'));
    }
    if (!isValidHeight(height)) {
        return res.send(errorPage('Wysokość musi być między 1 a 8900m'));
    }
    if (date_climbed && !isValidPastDate(date_climbed)) {
        return res.send(errorPage('Data musi być w przeszłości'));
    }
    
    queries.mountains.insert.run(
        name, 
        height, 
        date_climbed || null, 
        notes || null, 
        req.session.user.id
    );

    res.redirect('/');
});

app.get('/mountain/:id/edit', requireLogin, (req, res) => {
    const mountain = queries.mountains.findById.get(req.params.id);

    if (!mountain) {
        return res.send(errorPage('Góra nie znaleziona'));
    }
    if (!canEdit(req.session.user, mountain)) {
        return res.send(errorPage('Brak dostępu'));
    }

    res.send(editPage(mountain, req.session.csrfToken));
});

app.post('/mountain/:id/edit', requireLogin, (req, res) => {
    if (!checkCsrf(req, res)) return;

    const mountain = queries.mountains.findById.get(req.params.id);

    if (!mountain) {
        return res.send(errorPage('Góra nie znaleziona'));
    }
    if (!canEdit(req.session.user, mountain)) {
        return res.send(errorPage('Brak dostępu'));
    }

    const { name, height, date_climbed, notes } = req.body;

    if (!name || name.length > 100) {
        return res.send(errorPage('Nazwa wymagana (max 100 znaków)'));
    }
    if (!isValidHeight(height)) {
        return res.send(errorPage('Wysokość musi być między 1 a 8900m'));
    }
    if (date_climbed && !isValidPastDate(date_climbed)) {
        return res.send(errorPage('Data musi być w przeszłości'));
    }

    queries.mountains.update.run(
        name, 
        height, 
        date_climbed || null, 
        notes || null, 
        req.params.id
    );

    res.redirect('/');
});

app.post('/mountain/:id/delete', requireLogin, (req, res) => {
    if (!checkCsrf(req, res)) return;

    const mountain = queries.mountains.findById.get(req.params.id);
    
    if (!mountain) {
        return res.send(errorPage('Góra nie znaleziona'));
    }
    if (!canEdit(req.session.user, mountain)) {
        return res.send(errorPage('Brak dostępu'));
    }

    queries.mountains.delete.run(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});