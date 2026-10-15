# Przegląd frontendu — 15 października 2026

## Dlaczego podgląd wyglądał jak surowy dokument

Przekazany zrzut pokazuje treść `index.html` bez stylów, skryptów i ilustracji z sąsiednich katalogów. Widać oba ekrany jednocześnie, puste wskaźniki, niezaładowane obrazy i bazowe wartości HP sprzed inicjalizacji JavaScript. Otwieranie samego modularnego `index.html` w podglądzie pojedynczego załącznika nie dostarcza całej aplikacji.

Dodano `node scripts/build-preview.mjs`. Wynik `dist/Forbidden-Deck-preview.html` osadza wszystkie style, moduły, ładowany osobno moduł statusów i ilustracje. Test blokuje katalogi CSS/JS/zasobów i wymaga działającej gry bez żadnego żądania do plików obok. Osobny scenariusz uruchamia dokument w ramce `sandbox="allow-scripts"`, bez własnego originu pamięci, i przechodzi walkę oraz scenę relacji. W takim podglądzie zapis działa w pamięci sesji; informacja jest widoczna w menu. Zwykła strona i pobrany plik korzystają z dotychczasowego zapisu.

Nie mamy bezpośredniej kontroli nad rendererem interfejsu Codex. Sprawdzono osadzony wariant o tych ograniczeniach i przygotowano samodzielny dokument do otwarcia lub pobrania.

## Rzeczywisty błąd mobilny

W walce na ekranie 390 px przyciski wymuszały szerokość większą niż ekran, a wysoki przyklejony nagłówek zasłaniał treść. Dotychczasowy test nowych widoków sprawdzał menu i relację, a nie ten ekran walki.

Poprawiono minimalne szerokości paneli, zawijanie przycisków i statyczny nagłówek na telefonie. Test układu obejmuje teraz również walkę, brak poziomego przepełnienia, zagranie karty i kliknięcie końca tury w szerokościach 1440, 390 i 320 px. Nie zmieniono mechanik ani balansu.

## Co sprawdzono

- Wersja modularna z PR: menu, Codex, relacja, nowy Standard, mapa, ekwipunek, karta, koniec tury i odświeżenie/kontynuacja na 1440 i 390 px. Brak błędów JavaScript i niedostępnych zasobów w tych ścieżkach.
- Samodzielny dokument: wszystkie 12 zestawów HTTP, w tym bossowie, zapis, migracja, relacje i tutorial. W testach podmieniono wyłącznie odpowiedź serwera z głównym dokumentem na wygenerowany plik; kod testów i ich asercje pozostały aktywne.
- Osadzony dokument: działające style i portrety, start, ekwipunek, walka, karta, tura oraz romantyczny wariant ogniska i powrót na mapę. Zero żądań do zewnętrznych zasobów.
- Poprawiony układ walki: szerokości 1440, 390 i 320 px; zrzuty obejrzane wizualnie.

## Feedback o jakości

Menu i scena relacji mają spójne ilustracje i czytelną prezentację. Walka wciąż używa prostych sylwetek oraz symboli, więc wizualnie odstaje od nowego menu. Na telefonie dużo miejsca zajmują statystyki i objaśnienia; po usunięciu przepełnienia kolejnym zadaniem UX powinien być zwarty układ walki z łatwiejszym dostępem do ręki i intencji przeciwników.

Nie przeprowadzono pełnego naturalnie rozwiniętego runu ani oceny atrakcyjności przez graczy. Testy bossów korzystają z opisanych wcześniej deterministycznych konfiguracji.

## Publikacja

Przegląd dotyczy otwartego PR #28. W momencie sprawdzenia `main` i ostatnie udane wdrożenie Pages wskazywały `26d191e`; nowych zmian jeszcze tam nie było. Bezpośredni dostęp do publicznej strony ograniczała sieć środowiska. To oddzielny temat od brakujących zasobów w pojedynczym podglądzie Codex. Żadnych zmian nie scalono do `main`.
