# V0.9.3 — Wspólne chwile

## Cel i baza

Dodać bohaterom zwyczaje, obawy i wspólną pamięć, widoczne podczas grania. Baza: otwarta iteracja V0.9.2 `feat/atmospheric-journey` (PR #29), oparta na #28. Nowa zmiana nie scala ani nie publikuje wcześniejszych prac.

## Co gracz otrzymuje

Menu i mapa prowadzą do albumu pięciu opcjonalnych opowieści. „Okruchy świtu” są dostępne od początku. „Rysa na tarczy” odblokowuje się po rzeczywistym przechwyceniu ataku w Lyrę, „Dwa kubki” po zwycięstwie, „Zanim wróci oddech” po przeżyciu trafienia z najwyżej 30% HP, a „Po drugiej stronie bramy” po bossie Aktu I. Nie rekonstruujemy tych zdarzeń z dawnych statystyk; dotychczasowy gracz może odkryć je w kolejnej walce.

Każda rozmowa ma dwie odpowiedzi i krótkie zakończenie. Pierwszy ukończony wybór jest zapisywany; można obejrzeć drugą drogę bez nadpisywania pamięci. Decyzja o marzeniu Lyry z rozmowy śniadaniowej wraca w kwestii przed następną walką. Ponowne otwarcie sceny po odświeżeniu przywraca konkretną kwestię. Zamknięcie zachowuje miejsce; pominięcie porzuca bieżącą rozmowę i nie oznacza jej jako obejrzanej.

Nowy atlas dodaje skupienie, uśmiech i niepokój obu bohaterów. Portrety reagują na wsparcie, ciężkie obrażenia, combo i wynik walki. Kwestie nie blokują sterowania, nie przewijają się automatycznie i są ograniczone do jednego wystąpienia danego rodzaju na walkę. Ruch kamery i światła można wyłączyć; ustawienie urządzenia `prefers-reduced-motion` ma pierwszeństwo. Są to animowane ilustracje, nie wygenerowane filmy.

## Integralność gry

Rozmowy nie dają Trust, złota, kart ani bonusów bojowych. Stare relacje, romans, kolekcja, historia i run zachowują klucze i schematy. Osobiste wspomnienia korzystają z nowego `forbidden_deck_companions_v1`. Krótki stan reakcji walki jest opcjonalnym polem istniejącego runu. Zepsuty zapis wspomnień nie usuwa pozostałego postępu.

W ekranie nagrody pierwsze zwycięstwo pokazuje informację o nowej historii. Dopiero po odebraniu nagrody gracz przechodzi do albumu z mapy; nie tworzymy nowego obowiązkowego kroku w rozliczeniu walki.

## Weryfikacja

Test `tests/companions-smoke.mjs` sprawdza pięć opowieści i obie gałęzie każdej, rzeczywiste zdarzenia walki, równe statystyki przed/po dialogu, pamięć wyboru, wznowienie po odświeżeniu, powrót z dialogu, ustawienia, odrębność uszkodzonego zapisu i widoki 1440/390/320 px. Dotychczasowe testy pozostają w pipeline; nowy test dołącza do CI.

Lokalnie zaliczono wszystkie 15 zestawów przeglądarkowych (Node 24.19.0, Playwright 1.56.1, Chromium 141), w tym bezpośrednie otwarcie index.html. Po końcowych poprawkach powtórzono testy wspomnień, jednoplikowego podglądu, układów ekranu i historii. Składnia JavaScript i kontrola whitespace przechodzą. Test podglądu obejmuje nowy album, atlas i scenę także w ramce o nieprzezroczystym originie, bez zapytań do zewnętrznych zasobów. Test wspomnień sprawdza również brak atlasu i powrót do portretu awaryjnego.

Ilustracje i widoki albumu/sceny obejrzano na desktopie i wąskim ekranie. Pełny naturalnie rozwijany run oraz wpływ scen na przywiązanie graczy wymagają jeszcze testów graczy. Ta iteracja nie dodaje dźwięku, głosów ani klipów z poruszającymi się postaciami.

## Uruchomienie

Otwórz `index.html` z sąsiednimi katalogami. Dla jednoplikowego podglądu: `node scripts/build-preview.mjs`, następnie `dist/Forbidden-Deck-preview.html`. W menu wybierz **Kael i Lyra · Wspólne chwile → Okruchy świtu**.
