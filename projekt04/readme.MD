Aplikacja do śledzenia zdobytych gór

Instalacja:
npm install

Uruchomienie:
node index.js

Aplikacja uruchomi się na `http://localhost:8000`

Konto administratora:
Przy pierwszym uruchomieniu tworzone jest automatycznie konto admin

Login: admin
Hasło: admin123

Funkcje:
- Dodawanie nowych gór (nazwa, wysokość, data zdobycia, notatki)
- Przeglądanie listy wszystkich gór
- Edycja informacji o górze
- Usuwanie gór z listy
- Admin widzi i może edytować góry wszystkich użytkowników

Baza danych:
Aplikacja używa SQLite. Dane są przechowywane w pliku `mountains.db`, który tworzy się automatycznie

Dane testowe:
Przy pierwszym uruchomieniu aplikacji automatycznie dodane są 3 przykładowe góry (Rysy, Giewont, Kasprowy Wierch) 
do pliku `mountains.db` (rzeczywiście przydatne do testowania!)

Aplikacja używa 4 różnych modułów:
- express
- express-session
- better-sqlite3
- bcrypt
