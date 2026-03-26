import { mainStyles } from './styles.js';
import { escapeHtml } from './middleware.js';

function layout(title, content) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>${mainStyles}</style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
}

export function mainPage(user, mountains, csrfToken) {
    const safeUsername = escapeHtml(user.username);
    const adminLabel = user.is_admin ? ' (admin)' : '';
    const adminHeader = user.is_admin ? '<th>Użytkownik</th>' : '';
    
    const mountainRows = mountains.map(m => {
        const safeName = escapeHtml(m.name);
        const safeHeight = escapeHtml(m.height);
        const safeDate = escapeHtml(m.date_climbed || '-');
        const safeNotes = escapeHtml(m.notes || '-');
        const safeUsername = escapeHtml(m.username || '-');
        const canEdit = user.is_admin || m.user_id === user.id;
        
        const userCol = user.is_admin ? `<td>${safeUsername}</td>` : '';
        const actions = canEdit ? `
            <a href="/mountain/${m.id}/edit">Edytuj</a>
            <form method="POST" action="/mountain/${m.id}/delete" style="display:inline">
                <input type="hidden" name="csrf" value="${csrfToken}">
                <button type="submit">Usuń</button>
            </form>
        ` : '-';
        
        return `
            <tr>
                <td>${safeName}</td>
                <td>${safeHeight} m</td>
                <td>${safeDate}</td>
                <td>${safeNotes}</td>
                ${userCol}
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
    
    const content = `
        <div class="topbar">
            <h1>Moje Góry</h1>
            <div>
                Zalogowany jako: <b>${safeUsername}</b>${adminLabel}
                <form method="POST" action="/logout" style="display:inline; margin-left: 10px;">
                    <input type="hidden" name="csrf" value="${csrfToken}">
                    <button type="submit">Wyloguj</button>
                </form>
            </div>
        </div>
        
        <h2>Dodaj nową górę</h2>
        <form method="POST" action="/mountain">
            <input type="hidden" name="csrf" value="${csrfToken}">
            <input type="text" name="name" placeholder="Nazwa" required maxlength="100">
            <input type="number" name="height" placeholder="Wysokość (m)" required min="1" max="8900">
            <input type="date" name="date_climbed" max="${new Date().toISOString().split('T')[0]}">
            <textarea name="notes" placeholder="Notatki" rows="3" maxlength="500"></textarea>
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
            ${mountainRows}
        </table>
    `;
    
    return layout('Góry', content);
}

export function loginPage(csrfToken) {
    const content = `
        <h1>Logowanie</h1>
        <form method="POST" action="/login">
            <input type="hidden" name="csrf" value="${csrfToken}">
            <input type="text" name="username" placeholder="Login" required maxlength="50">
            <input type="password" name="password" placeholder="Hasło" required>
            <button type="submit">Zaloguj</button>
        </form>
        <p>Nie masz konta? <a href="/register">Zarejestruj się</a></p>
    `;
    return layout('Logowanie', content);
}

export function registerPage(csrfToken) {
    const content = `
        <h1>Rejestracja</h1>
        <form method="POST" action="/register">
            <input type="hidden" name="csrf" value="${csrfToken}">
            <input type="text" name="username" placeholder="Login" required minlength="3" maxlength="50">
            <input type="password" name="password" placeholder="Hasło" required minlength="6">
            <input type="password" name="password2" placeholder="Powtórz hasło" required minlength="6">
            <button type="submit">Zarejestruj</button>
        </form>
        <p>Masz już konto? <a href="/login">Zaloguj się</a></p>
    `;
    return layout('Rejestracja', content);
}

export function editPage(mountain, csrfToken) {
    const safeName = escapeHtml(mountain.name);
    const safeHeight = escapeHtml(mountain.height);
    const dateValue = mountain.date_climbed || '';
    const safeNotes = escapeHtml(mountain.notes || '');
    
    const content = `
        <h1>Edytuj: ${safeName}</h1>
        <form method="POST" action="/mountain/${mountain.id}/edit">
            <input type="hidden" name="csrf" value="${csrfToken}">
            <input type="text" name="name" value="${safeName}" required maxlength="100">
            <input type="number" name="height" value="${safeHeight}" required min="1" max="8900">
            <input type="date" name="date_climbed" value="${dateValue}" max="${new Date().toISOString().split('T')[0]}">
            <textarea name="notes" rows="3" maxlength="500">${safeNotes}</textarea>
            <button type="submit">Zapisz</button>
            <a href="/" style="margin-left: 10px;">Anuluj</a>
        </form>
    `;
    return layout('Edytuj górę', content);
}

export function errorPage(message) {
    const content = `
        <div class="error">
            <h2>Błąd</h2>
            <p>${escapeHtml(message)}</p>
            <a href="/">Wróć do strony głównej</a>
        </div>
    `;
    return layout('Błąd', content);
}