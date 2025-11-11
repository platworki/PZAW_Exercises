import express from 'express';

const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: true }));
let messages = [];

app.get('/', (req, res) => {
  let messageList = '';
  for (let msg of messages) {
    messageList += `<li>${msg}</li>`;
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Projekt 02</title>
    </head>
    <body>
      <h1>Witaj!</h1>
      <p>Liczba wiadomości: ${messages.length}</p>
      
      <h2>Dodaj wiadomość:</h2>
      <form method="POST" action="/message">
        <input type="text" name="text" required>
        <button type="submit">Wyślij</button>
      </form>
      
      <h2>Wiadomości:</h2>
      <ul>${messageList}</ul>
    </body>
    </html>
  `);
});

app.post('/message', (req, res) => {
  const text = req.body.text;
  messages.push(text);
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>O stronie</title>
    </head>
    <body>
      <h1>O projekcie</h1>
      <p>Prosty serwer Express</p>
      <a href="/">Powrót</a>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});