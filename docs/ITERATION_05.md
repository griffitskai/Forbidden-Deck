# V0.9.5 — Wspólny stół

Ekran walki na komputerze mieści przeciwników, bohaterów, rękę i akcje w wysokości okna przeglądarki. Tryb stołu działa od 1000 × 560 pikseli CSS; sprawdzono także typowe okna laptopów 1024 × 600, 1280 × 720 i 1366 × 768 oraz większe monitory. Wymiary oznaczają obszar strony, po odjęciu pasków przeglądarki. Nie wymaga to trybu pełnoekranowego ani oddalania strony. Mapa i pozostałe ekrany nadal mogą przewijać się normalnie. Przy mniejszym oknie lub dużym powiększeniu pozostaje układ pionowy.

## Hierarchia decyzji

1. Bohaterowie po lewej: osobne HP, Block, przewidywana strata HP i statusy bezpośrednio przy portretach.
2. Przeciwnicy po prawej: nazwa, portret, HP/Block, rodzaj ataku, cel, przewidywana strata HP oraz ostrzeżenia o omijaniu Prowokacji/Ochrony.
3. Stały pasek akcji pod polem: mikstury, stos dobierania/odrzucania, Szczegóły, Dziennik i koniec tury po prawej.
4. Zasoby nad kartami: energia wyróżniona pierwsza, następnie Synergy, Momentum, Trust i Prowokacja/Ochrona.
5. Ręka na dole; zwykłe pięć kart mieści się obok siebie. Duże ręce zachodzą na siebie, zamiast wymuszać przewijanie strony. Najedź lub wybierz kartę klawiszem Tab, aby przeczytać pełny opis w podglądzie. Enter/Spacja zagrywają dostępną kartę.

Dłuższe opisy kart w niskim oknie mają skrócony widok; pełny opis pozostaje w podglądzie. Szczegółowe odporności, zasady obrony i objaśnienie podglądu obrażeń są w oknie **Szczegóły**, zamykanym krzyżykiem albo Escape. Przy wysokości do 640 px trafiają tam również krótkie kwestie bohaterów. Nie wyłącza to reakcji ani pamięci opowieści. Ich portrety, HP i statusy pozostają widoczne. Powtarzający się opis fazy bossa jest scalony z jego wyróżnioną rolą; aktualny cel, typ obrażeń i ostrzeżenia nadal widać.

## Inspiracje

Punkt odniesienia: materiały [Slay the Spire — Mega Crit](https://www.megacrit.com/press-kits/slay-the-spire/) oraz [Griftlands — Klei](https://www.klei.com/games/griftlands). Zastosowana interpretacja dla Forbidden Deck: ręka przy dolnej krawędzi, budżet energii blisko kart, główna akcja w stałym miejscu, informacje taktyczne przy walczących, opisy pomocnicze na żądanie. Zachowano własne ilustracje, interfejs i mechaniki gry.

## Implementacja i zapis

`js/23-combat-table.js` przenosi istniejące elementy DOM, zachowując ich identyfikatory, mechanikę i działające przyciski. Nie zmienia statystyk ani zapisu S. Dołożono strukturę zasobów, dialog szczegółów, podgląd karty, dostęp klawiaturą i dopasowanie dużej ręki. `css/combat-table.css` odpowiada za tryb zależny od wymiarów okna. Nie dodano bibliotek. Nowe teksty mają wersje PL/EN. Po opuszczeniu walki wraca zwykłe przewijanie; modal nagród i reguły pozostają dostępne.

## Weryfikacja

Nowy `tests/combat-table-smoke.mjs` mierzy rzeczywiste prostokąty elementów i wysokość dokumentu w ośmiu oknach: 1920×1080, 1440×900, 1366×768, 1280×720, 1024×640, 1366×600, 1024×600, 1024×560. Sprawdza również zawartość kart przeciwników i portretów, aby samo ukrycie overflow nie mogło udawać poprawnego układu.

Dodatkowo test obejmuje bossów trzech aktów z pełnym zestawem statusów, fazy I/II w PL/EN w 1024×560, ręce 5/10/15 kart, podgląd karty, powrót fokusu po zamknięciu szczegółów, niezmienność stanu po ich otwarciu, faktyczne zagranie klawiaturą, koniec tury, zapis/odświeżenie/kontynuację i powrót do przewijanej mapy. Dotychczasowe testy sprawdzają również karty, mikstury, bossów Standard, zapisy, sceny, języki i podgląd offline.

Lokalnie zaliczono **18 zestawów**: 17 testów przeglądarkowych/offline oraz audyt tłumaczeń (Node 24.19.0, Playwright 1.56.1, Chromium 141). Po końcowym dopasowaniu fazy II ponownie zaliczono nowy test stołu. Składnia nowych modułów i kontrola whitespace poprawne. Obejrzano zrzuty 1366×768 i 1024×560. Nie przeprowadzono sesji z testerami ani testów w innych silnikach przeglądarek.
