# Forbidden Deck

**Forbidden Deck** to przeglądarkowy roguelike deckbuilder rozwijany iteracyjnie w HTML/CSS/JavaScript.

## 🎮 Zagraj w aktualną wersję

### **[▶️ URUCHOM FORBIDDEN DECK](https://griffitskai.github.io/Forbidden-Deck/)**

Wersja z gałęzi `main` jest automatycznie publikowana przez GitHub Pages po każdej zaakceptowanej zmianie.

## Aktualny stan

Wersja robocza: **V0.9.3 — Wspólne chwile**.

Nowy przycisk **Kael i Lyra · Wspólne chwile** otwiera album pięciu ilustrowanych, opcjonalnych opowieści. Pierwszą poznasz od razu; kolejne odblokowują się po zwycięstwie, przechwyceniu ciosu, przeżyciu ciężkiego trafienia i pokonaniu pierwszego bossa. Bohaterowie mają trzy wyrazy twarzy i reagują na przebieg walki. Sceny używają ruchu kamery i światła; nie są generowanymi filmami ani animacją ust. Ruch i krótkie reakcje można wyłączyć. Rozmowy nie dają bonusów; pierwszy osobisty wybór jest pamiętany, a odświeżenie pozwala wznowić dialog. [Raport V0.9.3](docs/ITERATION_03.md).

Mapa prowadzi teraz przez trzy ilustrowane krainy: gasnące Pogranicze, mglisty Skażony Las i żarzącą się Cytadelę. Połączenia pokazują możliwe dalsze kroki, a odwiedzone miejsca są zapisywane w bieżącym runie. Ogniska mają regionalny nastrój i zachowują wszystkie cztery czynności.

Przy 60 Trust czeka kolejna ilustrowana rozmowa, „Bez rozkazu”. Pamięta wcześniejszą bliskość, lecz nie wymaga jej. Przyjaźń, romans i pominięcie dają +9 Trust oraz jednorazowo Ochronę i +10 Synergy. Wspólna ilustracja pojawia się po wybraniu romansu; samo Trust jej nie uruchamia. Starsze sceny można odwiedzić ponownie przez ekran relacji, bez drugiej nagrody.

Pierwsza iteracja oprawy dodaje ilustrowane portrety Kaela (32 lata) i Lyry (29 lat), ognisko oraz krótką scenę przy 40 Trust. Romantyczne sceny można włączyć w menu lub ekranie relacji; domyślnie są wyłączone. Przyjaźń, romans i pominięcie dają identyczną korzyść: +6 Trust i +1 energii w pierwszej turze następnej walki. Trust oznacza współpracę, a wybór bliskości jest zapisywany osobno.

Starsze zapisy zachowują postęp. Po przeżyciu dawnej sceny 40 Trust nową prezentację można obejrzeć przez **Relacja Kael–Lyra → Odwiedź ognisko ponownie**, bez dodatkowej nagrody. [Changelog](docs/CHANGELOG.md) i [pochodzenie ilustracji](assets/README.md) opisują zakres tej iteracji.

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

### Podgląd pojedynczego pliku w Codex

`index.html` w repozytorium korzysta z sąsiednich katalogów `css/`, `js/` i `assets/`. Podgląd samego tego pliku w Codex może pokazać surowy HTML bez działającej gry. Dla takiego podglądu wygeneruj samodzielną wersję:

```sh
node scripts/build-preview.mjs
```

Otwórz lub pobierz **`dist/Forbidden-Deck-preview.html`**. Zawiera style, wszystkie moduły gry i ilustracje; nie wymaga pozostałych plików. Jest też dostępny jako artefakt `forbidden-deck-preview` w workflow Browser smoke test. `index.html` pozostaje źródłem prawdy, a `dist/` jest generowane i ignorowane przez Git.

W osadzonym podglądzie blokującym pamięć przeglądarki gra korzysta z pamięci bieżącej sesji i wyświetla informację o tym ograniczeniu. Do zachowywania postępu między otwarciami użyj pobranego pliku w zwykłej przeglądarce albo pełnej strony gry.

## Zasada projektu

`main` ma zawsze zawierać **najlepszą aktualną grywalną wersję**. Nie utrzymujemy równoległych plików `v0_1.html`, `v0_2.html` itd. Historia wersji należy do Git/GitHub.

Nowe prace prowadzimy przez GitHub Issues i małe, testowalne zmiany.

## Najbliższy kierunek

Ekran startowy, historia wypraw i cztery progi relacji są już wdrożone. Po ocenie pierwszej ilustrowanej sceny kolejne kierunki do **V1.0** to:

- rozwój ilustracji i kolejnych scen relacji Kael–Lyra,
- wyraźniejsza tożsamość biomów i mapa,
- dalszy balans ekonomii, sprzętu i poziomów trudności,
- polish oprawy walki.

Warstwa romantyczna/18+ pozostaje opcjonalnym dodatkiem do pełnoprawnej gry i nie zastępuje gameplayu.

## Dokumentacja

- `AGENTS.md` — zasady pracy z repozytorium,
- `docs/PROJECT_STATUS.md` — aktualny stan mechanik,
- `docs/ROADMAP.md` — plan dalszego rozwoju,
- `docs/DECISIONS.md` — najważniejsze decyzje projektowe.
