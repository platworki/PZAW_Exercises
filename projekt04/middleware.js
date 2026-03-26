export function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined){
        return '';
    }
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function isValidPastDate(dateString) {
    if (!dateString){
        return true;
    }
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return ((date <= today) && !isNaN(date.getTime()));
}

export function isValidHeight(height) {
    const num = parseInt(height);
    return (num > 0 && num < 9000);
}

export function requireLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    next();
}

export function csrfMiddleware(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = Math.random().toString(36).substring(2);
    }
    next();
}

export function checkCsrf(req, res) {
    if (req.body.csrf !== req.session.csrfToken) {
        res.send('CSRF token invalid <a href="/">Wróć</a>');
        return false;
    }
    return true;
}

export function canEdit(user, resource) {
    return user.is_admin || resource.user_id === user.id;
}