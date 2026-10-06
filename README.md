# Forbidden Deck

**Forbidden Deck** to przeglądarkowy roguelike deckbuilder rozwijany iteracyjnie w HTML/CSS/JavaScript.

## Aktualny stan

Wersja robocza: **V0.8**.

Gra zawiera obecnie:

- duet **Kael + Lyra** z osobnymi punktami życia,
- talie Kaela, Lyry i karty **Duo / Synergy**,
- system **Trust**, który odblokowuje nowe zagrania współpracy,
- **Momentum** Kaela i **Marked** Lyry,
- prowokację, ochronę, blok i skrytobójców,
- trzy typy obrażeń: fizyczne, magiczne i toksyczne,
- pancerze, amulety i mikstury,
- poziomy trudności: Odkrywca / Standard / Weteran,
- rozwój drużyny w trakcie runu,
- dwa akty: **Pogranicze** i **Skażony Las**,
- mapę wyboru trasy, walki, elity, ogniska, sklepy, wydarzenia i bossów,
- boczny dziennik walki,
- kolejne karty i buildy oparte o Block, Marked, Momentum oraz Synergy.

## Uruchomienie

Nie jest potrzebna instalacja ani serwer.

1. Pobierz repozytorium.
2. Otwórz `index.html` w przeglądarce.
3. Rozpocznij nowy run.

## Zasada projektu

`main` ma zawsze zawierać **najlepszą aktualną grywalną wersję**. Nie tworzymy `v0_1.html`, `v0_2.html`, itd. Historia wersji należy do Git/GitHub.

Nowe prace prowadzimy przez GitHub Issues i małe, testowalne zmiany.

## Najbliższy kierunek

Priorytetem nadal jest **grywalność**. Kolejne duże obszary:

1. animacje i czytelniejsze efekty walki,
2. ulepszanie/usuwanie kart,
3. statusy (krwawienie, trucizna, podpalenie, osłabienie),
4. trzeci akt i kolejni przeciwnicy,
5. zapis/progresja pomiędzy sesjami.

Warstwa romantyczna/18+ pozostaje dodatkiem do pełnoprawnej gry i nie jest obecnie priorytetem.

## Dokumentacja

- `AGENTS.md` — zasady pracy z repozytorium,
- `docs/PROJECT_STATUS.md` — aktualny stan mechanik,
- `docs/ROADMAP.md` — plan dalszego rozwoju,
- `docs/DECISIONS.md` — najważniejsze decyzje projektowe.
