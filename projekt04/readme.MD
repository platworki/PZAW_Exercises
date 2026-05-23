## Aplikacja do śledzenia zdobytych gór

1. Skopiuj `.env.example` do `.env` (lub - do testów - usuń .example)
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

## Struktura projektu i opis plików

- `index.js` - Główny punkt wejściowy aplikacji. Odpowiada za konfigurację serwera Express, sesji, middleware oraz obsługę wszystkich ścieżek
- `database.js` - Inicjalizuje połączenie z bazą danych SQLite (`better-sqlite3`) oraz automatycznie tworzy wymagane tabele (`users` i `mountains`) jeśli nie istnieją
- `queries.js` - Zawiera scentralizowany zbiór przygotowanych zapytań SQL, co zapobiega SQL Injection i ułatwia zarządzanie operacjami na bazie danych
- `middleware.js` - Definiuje funkcje pomocnicze i pośredniczące odpowiedzialne za autoryzację, walidację danych wejściowych (data, wysokość) oraz zabezpieczenia (XSS za pomocą escapeHtml, generowanie i sprawdzanie tokenów CSRF)
- `templates.js` - Odpowiada za widoki HTML. Generuje strukturę stron za pomocą szablonów tekstowych
- `styles.js` - Przechowuje style CSS wykorzystywanych przez szablony do stylowania aplikacji
- `seed.js` - Skrypt zasilający bazę danych początkowymi danymi testowymi (tworzy konto administratora oraz pierwsze przykładowe wpisy gór)
- `.env` / `.env.example` - Pliki przechowujące zmienne środowiskowe, takie jak sekret sesji i port serwera