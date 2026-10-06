# AGENTS.md — Forbidden Deck

## Cel

Rozwijaj Forbidden Deck jako grywalny roguelike deckbuilder. Priorytetem jest jakość pętli rozgrywki, czytelność decyzji i balans, a nie liczba funkcji.

## Źródło prawdy

- `index.html` jest aktualną grywalną wersją.
- Nie twórz kolejnych plików `v0.x.html`.
- Git/GitHub przechowuje historię wersji.
- Przed większą zmianą sprawdź `README.md` i `docs/PROJECT_STATUS.md`.

## Zasady implementacji

1. Zachowuj możliwość uruchomienia gry lokalnie przez otwarcie `index.html`.
2. Nie dodawaj bibliotek ani frameworków bez wyraźnej potrzeby.
3. Jedna zmiana / Issue powinna być możliwa do osobnego przetestowania.
4. Nie usuwaj istniejących mechanik bez wskazania powodu.
5. Preferuj prosty, czytelny interfejs zamiast ścian tekstu.
6. W walce ważne informacje mają być widoczne przed decyzją gracza: cel, typ obrażeń, nadchodzące obrażenia, Block, statusy.
7. Każda nowa karta musi mieć wyraźną rolę w buildzie.
8. Każdy nowy przeciwnik powinien zmieniać decyzje gracza, a nie być tylko większym paskiem HP.

## Kluczowe mechaniki

- Kael: tank / Block / Prowokacja / Momentum.
- Lyra: Marked / dystans / unik.
- Duo: Trust + Synergy + współpraca.
- Utrata Kaela lub Lyry kończy run.
- Ekwipunek pomaga przygotować się pod typ zagrożenia.
- Trust rozwija wachlarz kart Duo.

## Test przed mergem

Minimum:

- można rozpocząć nowy run,
- mapa pozwala wejść do walki,
- karty dają się zagrywać,
- zakończenie tury działa,
- mikstury działają,
- ekwipunek da się otworzyć i zamknąć,
- można pokonać bossów na poziomie Standard,
- przejście między aktami działa,
- konsola przeglądarki nie zgłasza błędów krytycznych.

## Kierunek treści 18+

Treść dla dorosłych nie jest rdzeniem rozgrywki. Najpierw gra musi być satysfakcjonująca bez niej. Wszystkie postacie romantyczne/erotyczne muszą być jednoznacznie dorosłe i fikcyjne.
