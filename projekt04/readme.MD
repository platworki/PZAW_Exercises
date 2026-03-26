## Aplikacja do śledzenia zdobytych gór

1. Skopiuj `.env.example` do `.env` (lub po prostu usuń .example)
2. Edytuj `.env` i ustaw własny sekret sesji
3. Wpisz w terminalu: npm install
Przygotowanie bazy danych:
4. npm run seed
(Utworzy to konto administratora (login: `admin`, hasło: `admin123`) i przykładowe góry.)
Uruchomienie:
5. npm start

Aplikacja uruchomi się na `http://localhost:8000`

Funkcje:
- Rejestracja i logowanie użytkowników
- Potwierdzenie hasła przy rejestracji
- Dodawanie gór (nazwa, wysokość, data zdobycia, notatki)
- Edycja i usuwanie własnych gór
- Admin widzi i może edytować góry wszystkich użytkowników
- Walidacja danych (data w przeszłości, wysokość 1-8900m)
- Ochrona przed XSS i CSRF
- Hasła hashowane argon2

Baza danych:
Aplikacja używa SQLite. Dane są przechowywane w pliku `mountains.db`, który tworzy się automatycznie
