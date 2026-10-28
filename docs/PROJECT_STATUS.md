# Project Status — V0.10.1

## Obsługa rozmów klawiaturą

Sceny na szlaku mają fokus na treści, nazwę grupy powiązaną z tytułem i cykl Tab/Shift+Tab obejmujący odpowiedzi oraz przypomnienie wcześniejszego wyboru. Po rozmowie fokus wraca do pierwszej decyzji wydarzenia. Test czterech duetów w PL/EN w CI. Bez zmiany danych zapisu. [ITERATION_19.md](ITERATION_19.md).

## Grywalny wybór postaci

Cztery postacie i cztery duety, osobne zasoby i osobiste wyposażenie. Selene: Runy i jedno leczenie w walce. Varyn: Cień, zasadzka i trucizna. Nowe duety: 18 kart bazowych z ulepszeniami, 12 rozmów, trzy sceny i osobne zapisy Trust, wyborów oraz albumów. Stary postęp Kaela i Lyry pozostaje przypisany wyłącznie do nich. Wszystkie duety ukończyły deterministyczną trasę Aktu I na Standardzie. [Architektura i granice testów](PARTY_ARCHITECTURE.md).

## Scenerie miejsc

Osiem scenerii dopasowanych do kanonicznej etykiety lub terenu węzła mapy, z regionalnym tłem awaryjnym dla starszych zapisów. Cztery nowe panoramy: ruiny opactwa, toksyczne mokradła, kuźnia i sala tronowa. Tło obejmuje całą arenę, a mapa pokazuje miniatury oraz podgląd dostępnych miejsc przez mysz i klawiaturę. Sceneria jest deterministyczna i nie zmienia stanu gry. Szczegóły: [ITERATION_07.md](ITERATION_07.md).

## Pętla runu

Ekran tytułowy → wybór runu → mapa → walka / wydarzenie / ognisko / sklep / elita → nagroda → rozwój → boss → kolejny akt → podsumowanie → historia wypraw.

## Bohaterowie

### Kael
- fikcyjny dorosły bohater, 32 lata,
- osobne HP,
- Block,
- Prowokacja,
- Ochrona Lyry,
- Momentum,
- odporności wynikające z pancerza i amuletu.

### Lyra
- fikcyjna dorosła bohaterka, 29 lat,
- osobne HP,
- własny Block/unik,
- Marked,
- ataki dystansowe,
- częstszy cel skrytobójców.

### Duo
- Trust zachowywany między runami,
- Synergy budowane podczas walki,
- karty współpracy odblokowywane wraz z Trust,
- cztery kamienie milowe relacji: 20 / 40 / 60 / 80 Trust,
- trwała pamięć wyborów relacyjnych i krótkie premie taktyczne do kolejnej walki.
- ilustrowana scena „W świetle ognia” przy 40 Trust: dialog, przyjaźń, opcjonalna wzajemna bliskość i pominięcie,
- identyczna premia za każdą ścieżkę nowej sceny (+6 Trust, +1 energia w pierwszej turze następnej walki),
- trwałe ustawienie romansu (domyślnie wyłączone) i osobna flaga wyboru, bez automatycznej zgody wynikającej z Trust,
- migracja dawnych scen, wznawianie rozmowy po odświeżeniu i odtwarzanie bez dodatkowych nagród.
- druga ilustrowana rozmowa przy 60 Trust, zależna od wcześniejszego wyboru; osobna flaga decyzji i wspólna ilustracja po wyborze bliskości,
- przyjaźń, romans i pominięcie nowej sceny 60 Trust dają tę samą premię: +9 Trust, Ochrona ×1 i +10 Synergy w następnej walce.

## Walka

- kilka przeciwników naraz,
- wybór celu,
- intencje przeciwników,
- realny podgląd spodziewanej straty HP po odporności i Blocku,
- jawne ostrzeżenie o atakach ignorujących Prowokację/Ochronę,
- fizyczne, magiczne i toksyczne obrażenia,
- krwawienie, trucizna, podpalenie i osłabienie,
- skrytobójcy i przeciwnicy wsparcia,
- boczny dziennik walki,
- animacje kart, obrażeń, Blocku, leczenia i combo.

## Talia i wyposażenie

- nagrody kart po walkach,
- ulepszanie kart przy ognisku,
- usuwanie kart w sklepie,
- podgląd talii / draw pile / discard pile,
- pancerze i amulety,
- mikstury,
- odporności i sprzęt zdobywany po elitach.

## Akty

Każdy akt ma własną ilustrację regionu i ogniska, krótki opis nastroju oraz czytelne połączenia etapów. Pamięć wybranych węzłów należy do bieżącego runu; stare zapisy bez tej informacji nie otrzymują wymyślonej historii trasy. Nowy run czyści tylko swoją trasę. Nie zmieniono dostępności kolejnych etapów ani ich nagród.

### Akt I — Pogranicze
Boss: Strażniczka Pogranicza + Zaklinaczka.

### Akt II — Skażony Las
Statusy, mieszane grupy przeciwników i Królowa Cierni.

### Akt III — Cytadela Popiołu
Własny biom, przygotowanie przed wejściem, nowe archetypy wrogów i Królowa Popiołu z dwiema fazami. Standard został sprawdzony automatycznie trzema archetypami talii: Obrona / Statusy / Duo.

## Meta-progresja

- zapis bieżącego runu w localStorage,
- `Kontynuuj run`,
- Codex odkrytych kart i wyposażenia,
- historia do 10 ostatnich wypraw,
- pamięć pokonanych bossów,
- rozpoznawanie ogólnego archetypu buildu,
- bez trwałych bonusów statystyk za grind.

## UI i onboarding

- ekran tytułowy,
- Codex,
- ekran Relacja Kael–Lyra,
- Historia wypraw,
- pełne podsumowanie zwycięstwa/porażki,
- kontekstowy tutorial pierwszego runu: Trust, typy obrażeń, Prowokacja/Ochrona, Marked, Momentum i Synergy,
- możliwość wyłączenia/resetu podpowiedzi.
- lokalne ilustracje w menu, na mapie, w profilach i scenie; scenę można ukończyć również przy braku obrazów.

## Testy

GitHub Actions uruchamia grę w Chromium i sprawdza regresyjnie:

- start / menu / Codex / pierwszą walkę,
- zapis i kontynuację,
- Akt III i zmianę faz bossa,
- trzy różne buildy przeciw Królowej Popiołu,
- historię runów,
- progres relacji Trust,
- podgląd intencji i obrażeń,
- tutorial kontekstowy.
- nagrody i ustawienia sceny ogniska, migrację oraz wznawianie dialogów,
- mikstury, ekwipunek, bossów Aktów I/II na Standardzie oraz przejścia między aktami,
- widoki 1440/390/320 px i start gry bez serwera przez `index.html`.

Testy bossów używają jawnych, deterministycznych konfiguracji talii i wyposażenia. Potwierdzają działanie walk i przejść; nie zastępują oceny balansu całego runu przez graczy.

## Aktualny kierunek do V1.0

1. balans ekonomii i długości runu,
2. balans trzech poziomów trudności,
3. tożsamość i kompromisy ekwipunku,
4. czytelność mapy,
5. rarity i lepsze ważenie nagród,
6. accessibility / ergonomia,
7. dalszy visual/audio polish,
8. eksport/import zapisu i przygotowanie desktopowe.

## Wspólne chwile — V0.9.3

Pięć opcjonalnych opowieści, trzy wyrazy twarzy każdej postaci, album odblokowywany przez rzeczywiste zdarzenia walki i reakcje bez blokowania sterowania. Osobny klucz `forbidden_deck_companions_v1` nie migruje ani nie zastępuje runów, Trust, historii i relacji. Dialogi mają kamerę i światło w CSS; nie zawierają generowanych klipów wideo. Podgląd offline osadza także ilustrację śniadania i atlas sześciu portretów.

## Świat w dwóch językach — V0.9.4

Trwały wybór polski/angielski, lokalizacja widoków i opowieści bez zmiany danych gry. 16 portretów archetypów, 10 ilustracji wyposażenia/mikstur, panorama mostu, regionalne tła walk. [Zakres i testy](ITERATION_04.md).

## Wspólny stół — V0.9.5

Tryb walki bez przewijania na komputerze od 1000×560 px CSS. Bohaterowie i przeciwnicy obok siebie, HP/Block przy portretach, zasoby nad ręką, stały pasek akcji. Duża ręka tworzy wachlarz, pełny opis w podglądzie, Tab/Enter/Spacja dla kart. Odporności i zasady pod Szczegóły; niskie okna przenoszą tam również krótkie kwestie. [Zakres i testy](ITERATION_05.md).

## Ilustrowane zagrania — V0.9.6

38 ilustrowanych kart bazowych / 76 wariantów. Cztery nowe karty w nagrodach: Zaprzyj się, Zatruty trop, Zmiana warty i Wspólny nacisk, każda z ulepszeniem. Startowe 19 kart i stare zapisy zachowane. [Reguły, analiza i testy](ITERATION_06.md).

## Ciągłość relacji

Kronika decyzji w albumie, odwołania do wcześniejszych rozmów i epilogi wszystkich czterech duetów są zaimplementowane. Zakończony run zapisuje kopię relacji z tego momentu. Stare runy bez tej kopii nie dostają fikcyjnych wspomnień. Wyłączenie romansu ukrywa bliskość bez kasowania wyborów.

## Rozmowy na szlaku — etap po V0.10.1

Cztery opcjonalne sceny poprzedzają pierwsze odwiedzone wydarzenie w runie: naprawa tarczy, odpoczynek bez poczucia winy, sygnał powrotu i pomoc bez długu. Każda ma dwie odpowiedzi oraz pominięcie; nie zmieniają HP, talii, złota ani Trust. Po rozmowie wraca dotychczasowe wydarzenie wraz z nagrodami. Zapis wznawia pytanie, odpowiedź lub pierwotne wydarzenie. Pamięć jest ograniczona do wyprawy, wraca przy ognisku i zostaje skopiowana do kroniki zakończonego runu. Nowy run ją zeruje. Brak wpisu w starym zapisie oznacza brak wspomnienia. PL/EN, bez nowych zależności i zasobów sieciowych.

### Niezależność wspomnień od ustawienia romansu

Przełączenie romansu usuwa z widoku wyłącznie nawiązania rozmów relacyjnych. Zwykłe wspomnienie ze szlaku pozostaje przy ognisku i w kronice; zapisane wybory nie zmieniają się. Test scen drogowych sprawdza przełączenie w obie strony dla czterech duetów i obu odpowiedzi. To poprawka prezentacji, bez nowych scen ani premii.

## Po trudnym zwycięstwie

Cztery reakcje duetów przy ognisku, uruchamiane po zwycięstwie z nową utratą zdrowia i końcowym HP do 30%. Zapis początku walki pozwala zachować warunek po wczytaniu. Wspomnienie należy do bieżącego runu, resetuje się z nową wyprawą i jest niezależne od romansu. Bez premii i dodatkowych okien. [Zakres i ograniczenia](ITERATION_12.md).

## Odpowiedzi po trudnym zwycięstwie

Każdy duet ma dwie odpowiedzi z własną reakcją i późniejszym echem przy ognisku. Wybór jest jednorazowy w wyprawie, zachowywany po wczytaniu i kolejnych trudnych walkach. Kronika kopiuje go do zakończonego runu. Brak odpowiedzi pozwala wrócić później, bez blokowania odpoczynku i bez utraty nagród. Stare zapisy wspomnienia bez wyboru otwierają pytanie; stare historie nie otrzymują wymyślonych decyzji. Pełne PL/EN, niezależnie od romansu. [Raport](ITERATION_13.md).

## Czytelność wspomnień przy ognisku

Wspólny panel details grupuje nawiązania pod akcjami obozu. Nierozstrzygnięta rozmowa po trudnej walce otwiera panel; zapisane wspomnienia zaczynają zwinięte. Enter/Spacja obsługują natywny summary, widoczny fokus pomaga nawigować, a wybranie odpowiedzi przenosi fokus na reakcję. Większe litery, odstępy i oddzielone podpowiedzi nagród; bez zmian zapisów, mechanik, treści rozmów lub układu walki. [Raport](ITERATION_14.md).

## Drugie spotkanie na szlaku

Drugie spotkanie na szlaku ma osiem wariantów zależnych od pierwszej odpowiedzi (po dwa dla każdego duetu). Pojawia się raz, przed pierwszym odwiedzonym wydarzeniem w późniejszym akcie. Pominięcie pierwszej rozmowy wyłącza jej kontynuację. Po krótkiej wymianie zdań wraca zwykłe wydarzenie z dotychczasowymi nagrodami. Zapis wznawia rozmowę, a potwierdzone spotkanie trafia do wspomnień przy ognisku i kroniki zakończonej wyprawy. PL/EN, bez premii i bez wymogu romansu.

## Przypomnienie decyzji

Kontynuacje rozmów i wspomnienia ze szlaku mają zwijane przypomnienie konkretnej wcześniejszej odpowiedzi wraz z tytułem pierwszego spotkania. Przypomnienie jest domyślnie zamknięte i działa klawiaturą; nie zmienia zapisów ani wyborów. PL/EN.

## Pokrycie kolejności spotkań

CI obejmuje 36 scenariuszy tras: cztery duety, pierwszy dialog w każdym z trzech aktów, dwie odpowiedzi i pominięcie. Weryfikuje brak powtórzeń i zachowanie oryginalnych wydarzeń. Węzły walk są pomijane; to kontrola kolejności, nie pomiar tempa pełnej rozgrywki. [Raport](ITERATION_17.md).

## Jasna konsekwencja pominięcia

Opis pominięcia rozmowy na szlaku informuje przed decyzją, że pominięta zostanie również jej kontynuacja w tej wyprawie, a nagrody wydarzenia nie zmienią się. PL/EN, bez zmiany zasad lub zapisów. [Raport](ITERATION_18.md).
