# Decisions

## 2026-10 — HTML/JS pozostaje główną technologią
Karcianka nie wymaga na tym etapie migracji do Godota/Unity. Jeden kod ma pozostać grywalny w przeglądarce i możliwy do późniejszego opakowania jako aplikacja desktopowa.

## Gameplay przed treścią 18+
Warstwa erotyczna/romantyczna jest dodatkiem oraz nagrodą fabularną. Rdzeń gry musi działać bez niej.

## Bohater + towarzyszka jako duet
Kael i Lyra mają osobne HP i mechaniki, ale ich siła wynika z Trust i Synergy.

## Mapa jak roguelike deckbuilder
Walki dominują. Sklepy i ogniska są rzadsze i przez to ważniejsze.

## Trudność
Gra ma trzy poziomy trudności. Standard jest docelowym balansem; Odkrywca służy poznawaniu mechanik, a Weteran ma być wymagający.

## Repozytorium jako źródło prawdy
Nie utrzymujemy równolegle kolejnych plików z numerami wersji. `index.html` = aktualna wersja, historia = Git.

## 2026-10 — W świetle ognia

Pierwszy wycinek nowej oprawy obejmuje dwa lokalne portrety i jedną scenę ogniska. Kael ma 32 lata, Lyra 29; są fikcyjni i dorośli. Romantyczna ścieżka wymaga włączenia ustawienia i jawnego wyboru, a dialog pokazuje wzajemne zainteresowanie i zgodę. Trust nie jest zgodą na romans. Wszystkie ścieżki sceny, również pominięcie, dają tę samą premię mechaniczną.

Klucz zapisu relacji pozostaje `forbidden_deck_relationship_v1`, a jego wewnętrzny schemat przechodzi z 1 na 2. Dawne sceny i wybory są zachowane, bez interpretowania ich jako zgody romantycznej. Runy, Trust, kolekcja i historia zachowują dotychczasowe klucze. Ponowne obejrzenie nie daje drugiej nagrody i nie nadpisuje pierwszego wyboru nowej sceny.

## 2026-10 — Regiony i kolejna noc przy ogniu

Połączenia mapy obrazują dotychczasowe zasady: każdy dostępny węzeł następnego etapu pozostaje osiągalny. Nie dodajemy ograniczeń ukrytych w grafice. Historia drogi jest dodatkiem do zapisu runu; przy braku dawnych danych nie zgadujemy odwiedzonych miejsc.

Scena 60 Trust używa wspólnego mechanizmu zapisu, pomijania i odtwarzania ze sceną 40 Trust. Dodajemy opcjonalne pola do schematu 2, zachowując stare wybory i premie, w tym dawną premię Marked. Nowe ścieżki sceny 60 Trust mają identyczną premię. Dialog może pamiętać wcześniejszy romantyczny wybór, ale samo Trust nie stanowi zgody i nie pokazuje wspólnej ilustracji.
