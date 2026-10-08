# Forbidden Deck

**Forbidden Deck** to przeglądarkowy roguelike deckbuilder rozwijany iteracyjnie w HTML/CSS/JavaScript.

## 🎮 Zagraj w aktualną wersję

### **[▶️ URUCHOM FORBIDDEN DECK](https://griffitskai.github.io/Forbidden-Deck/)**

Wersja z gałęzi `main` jest automatycznie publikowana przez GitHub Pages po każdej zaakceptowanej zmianie.

## Aktualny stan

Wersja robocza: **V0.9**.

Gra zawiera obecnie:

- duet **Kael + Lyra** z osobnymi punktami życia,
- talie Kaela, Lyry i karty **Duo / Synergy**,
- system **Trust**, który odblokowuje nowe zagrania współpracy,
- **Momentum** Kaela i **Marked** Lyry,
- prowokację, ochronę, blok i skrytobójców,
- obrażenia fizyczne, magiczne i toksyczne oraz odporności,
- pancerze, amulety i mikstury,
- statusy: krwawienie, trucizna, podpalenie i osłabienie,
- ulepszanie i usuwanie kart,
- poziomy trudności: Odkrywca / Standard / Weteran,
- zapis bieżącego runu i przycisk **Kontynuuj run**,
- trzy akty: **Pogranicze**, **Skażony Las** i **Cytadela Popiołu**,
- mapę wyboru trasy, walki, elity, rzadsze ogniska/sklepy, wydarzenia i bossów,
- Królową Popiołu z dwiema fazami,
- wybór przygotowania przed Aktem III,
- animacje i feedback walki,
- automatyczne testy gry w Chromium.

## Testy regresji

GitHub Actions uruchamia obecnie prawdziwą przeglądarkę i sprawdza m.in.:

1. start gry → mapa → pierwsza walka → zagranie karty → koniec tury,
2. zapis → odświeżenie → kontynuację runu,
3. mechaniki Aktu III i zmianę fazy bossa,
4. różne archetypy buildów przeciw końcowemu bossowi Aktu III.

## Uruchomienie lokalne

Do zwykłego grania wystarczy otworzyć `index.html`. Do testów automatycznych używamy lokalnego serwera HTTP i Playwright/Chromium.

## Zasada projektu

`main` ma zawsze zawierać **najlepszą aktualną grywalną wersję**. Nie utrzymujemy równoległych plików `v0_1.html`, `v0_2.html` itd. Historia wersji należy do Git/GitHub.

Nowe prace prowadzimy przez GitHub Issues i małe, testowalne zmiany.

## Najbliższy kierunek

Najpierw domykamy **balans Aktu III (#10)**. Potem zaczynamy milestone prowadzący do **V1.0**:

- meta-progresja i historia runów,
- rozwój Trust i scen relacji Kael–Lyra,
- ekran startowy / Codex / lepsze podsumowanie runu,
- dalszy balans ekonomii, sprzętu i poziomów trudności,
- polish oprawy walki.

Warstwa romantyczna/18+ pozostaje opcjonalnym dodatkiem do pełnoprawnej gry i nie zastępuje gameplayu.

## Dokumentacja

- `AGENTS.md` — zasady pracy z repozytorium,
- `docs/PROJECT_STATUS.md` — aktualny stan mechanik,
- `docs/ROADMAP.md` — plan dalszego rozwoju,
- `docs/DECISIONS.md` — najważniejsze decyzje projektowe.
