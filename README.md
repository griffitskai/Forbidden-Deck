# Forbidden Deck

**Forbidden Deck** to przeglądarkowy roguelike deckbuilder rozwijany iteracyjnie w HTML/CSS/JavaScript.

## 🎮 Zagraj w aktualną wersję

### **[▶️ URUCHOM FORBIDDEN DECK](https://griffitskai.github.io/Forbidden-Deck/)**

Wersja z gałęzi `main` jest automatycznie publikowana przez GitHub Pages po każdej zaakceptowanej zmianie.

## Aktualny stan

Wersja robocza: **V0.10.1 — Ślady wspólnej drogi**.

Bohaterowie wracają do poprzednich decyzji. Album pokazuje kronikę relacji, a zwycięstwo i porażka otrzymują osobiste epilogi czterech duetów. Historia wypraw przechowuje niezmienną kopię ówczesnych wyborów. [Raport V0.10.1](docs/ITERATION_10.md).

Wybierz jednego bohatera (**Kael / Varyn**) i jedną bohaterkę (**Lyra / Selene**). Każdy z czterech duetów ma własną talię współpracy i niezależny postęp relacji. Selene przygotowuje Runy, Varyn buduje Cień, a nowe duety łączą te zasoby z obroną i Marked. Dodano 18 kart bazowych z ulepszeniami, portrety, ilustracje kart oraz 12 rozmów dla nowych par. [Raport V0.10.0](docs/ITERATION_09.md).

Dialogi rozwijają osobiste konflikty wszystkich czterech bohaterów. Opcjonalny romans zawiera flirt, pocałunki i intymność zakończoną wygaszeniem sceny; nie zawiera graficznych opisów seksu ani nagości.

Model postaci i drużyny jest oddzielony od nazw w interfejsie. Każdy bohater ma własne statystyki, statusy, zasób i pancerz, a karty należą do postaci lub konkretnego duetu. Starsze zapisy są migrowane do nowego formatu. W V0.10.0 model obsługuje wszystkie cztery grywalne postacie i duety. [Raport V0.9.8](docs/ITERATION_08.md) i [architektura](docs/PARTY_ARCHITECTURE.md).

Tło całego pola walki odpowiada miejscu wybranemu na mapie: trakt, most, ruiny, las, bagno, mury Cytadeli, kuźnia lub sala tronowa. Miniatury na trasie i podgląd po najechaniu lub wybraniu klawiszem Tab zapowiadają scenerię. Cztery nowe panoramy uzupełniają istniejące ilustracje; zapis, język i układ walki w jednym oknie pozostają zgodne. [Raport V0.9.7](docs/ITERATION_07.md).

Każda z 38 kart bazowych ma teraz własną ilustrację działania, także w talii, nagrodach i podglądzie. Cztery nowe zagrania rozwijają wydawanie Momentum, Marked i Synergy oraz ochronę Lyry. Talia startowa pozostaje bez zmian; nowe karty zdobędziesz w nagrodach. [Analiza kart i raport V0.9.6](docs/ITERATION_06.md).

Walka na komputerze mieści bohaterów, przeciwników, rękę i akcje w jednym oknie. HP i Block są przy portretach, energia nad kartami, a koniec tury zawsze po prawej. Szczegóły zasad otworzysz osobno; pełny opis karty zobaczysz po najechaniu lub wybraniu klawiszem Tab. [Raport V0.9.5](docs/ITERATION_05.md).

W menu wybierzesz **Polski / English**, a na pasku gry przełączysz język bez utraty miejsca w wyprawie. Nowe ilustracje pokazują 16 archetypów przeciwników, 10 przedmiotów i most na Pograniczu; walka ma tło swojej krainy. [Raport V0.9.4](docs/ITERATION_04.md).

Nowy przycisk **Kael i Lyra · Wspólne chwile** otwiera album pięciu ilustrowanych, opcjonalnych opowieści. Pierwszą poznasz od razu; kolejne odblokowują się po zwycięstwie, przechwyceniu ciosu, przeżyciu ciężkiego trafienia i pokonaniu pierwszego bossa. Bohaterowie mają trzy wyrazy twarzy i reagują na przebieg walki. Sceny używają ruchu kamery i światła; nie są generowanymi filmami ani animacją ust. Ruch i krótkie reakcje można wyłączyć. Rozmowy nie dają bonusów; pierwszy osobisty wybór jest pamiętany, a odświeżenie pozwala wznowić dialog. [Raport V0.9.3](docs/ITERATION_03.md).

Mapa prowadzi teraz przez trzy ilustrowane krainy: gasnące Pogranicze, mglisty Skażony Las i żarzącą się Cytadelę. Połączenia pokazują możliwe dalsze kroki, a odwiedzone miejsca są zapisywane w bieżącym runie. Ogniska mają regionalny nastrój i zachowują wszystkie cztery czynności.

Przy 60 Trust czeka kolejna ilustrowana rozmowa, „Bez rozkazu”. Pamięta wcześniejszą bliskość, lecz nie wymaga jej. Przyjaźń, romans i pominięcie dają +9 Trust oraz jednorazowo Ochronę i +10 Synergy. Wspólna ilustracja pojawia się po wybraniu romansu; samo Trust jej nie uruchamia. Starsze sceny można odwiedzić ponownie przez ekran relacji, bez drugiej nagrody.

Pierwsza iteracja oprawy dodaje ilustrowane portrety Kaela (32 lata) i Lyry (29 lat), ognisko oraz krótką scenę przy 40 Trust. Romantyczne sceny można włączyć w menu lub ekranie relacji; domyślnie są wyłączone. Przyjaźń, romans i pominięcie dają identyczną korzyść: +6 Trust i +1 energii w pierwszej turze następnej walki. Trust oznacza współpracę, a wybór bliskości jest zapisywany osobno.

Starsze zapisy zachowują postęp. Po przeżyciu dawnej sceny 40 Trust nową prezentację można obejrzeć przez **Relacja Kael–Lyra → Odwiedź ognisko ponownie**, bez dodatkowej nagrody. [Changelog](docs/CHANGELOG.md) i [pochodzenie ilustracji](assets/README.md) opisują zakres tej iteracji.

Gra zawiera obecnie:

- czterech bohaterów i cztery duety: **Kael / Varyn + Lyra / Selene**, z osobnymi punktami życia,
- osobiste talie czterech postaci oraz karty duetów **Duo / Synergy**,
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
