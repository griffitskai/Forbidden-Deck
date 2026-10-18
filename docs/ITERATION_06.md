# V0.9.6 — Ilustrowane zagrania

Wszystkie **38 kart bazowych** mają własną ilustrację działania. Warianty ulepszone dzielą grafikę bazowej karty i zachowują złotą ramkę. Ilustracje są widoczne w ręce, pełnym podglądzie, talii i stosach, nagrodach, wyborze ulepszenia/usunięcia oraz odkrytym Codexie. Nieodkryte karty nadal nie pokazują nazwy ani obrazu.

Ilustracje powstały we wbudowanym imagegen z referencją istniejącej sceny Kaela i Lyry. Trzy atlasy przechowują 40 pól; 38 ma przypisania, dwa są zapasowe. Różne akcje mają osobne kadry, a role otrzymują także podpis i kolor: atak, obrona, przygotowanie i współpraca. Odbiór funkcji karty nie zależy wyłącznie od barwy. Koszt energii jest na osobnej ciemnej plakietce, tekst na przyciemnionym tle. Niskie okna nadal skracają opis; pełny tekst jest w podglądzie po najechaniu lub wybraniu klawiszem Tab. Nie dodano ruchomych obrazów w samych grafikach; pozostają dotychczasowe efekty zagrania i uniesienie karty.

## Analiza puli i cztery nowe karty

W dotychczasowej puli Momentum służyło przede wszystkim atakom Kaela. Prowokacja i Ochrona nie zatrzymują części ciosów skrytobójców. Marked najczęściej wzmacniało bezpośrednie obrażenia, a Synergy miało główny koszt dopiero przy Back to Back. Nowe karty dodają sposoby wykorzystania tych zasobów i wymagają rezygnacji z innej korzyści.

| Karta | Koszt | Efekt bazowy | Decyzja i koszt alternatywny |
|---|---:|---|---|
| Zaprzyj się · Kael | 1 | +4 Block. Przy co najmniej 2 Momentum zużywa 2, dając zamiast tego +12 Block. | Przeżycie teraz kosztem przygotowania Brutal Finish. Bez zasobu słabsza od Guard (+7). |
| Zatruty trop · Lyra | 1 | 3 obrażenia i 2 Trucizny. Jeśli cel ma Marked, zużywa jeden znacznik i dokłada 2 Osłabienia. | Mniej obrażeń i trucizny od Jadowitej strzały; oznaczenie można wydać na ograniczenie odwetu zamiast na Heavy Strike. |
| Zmiana warty · Duo, Trust 20 | 1 | Przenosi do 6 istniejącego Block z Kaela na Lyrę; dobiera 1 kartę. | Bezpośrednia obrona Lyry przed ciosem omijającym Ochronę. Nie tworzy Block, więc może odsłonić Kaela. Bez Block jest tylko drogą wymianą karty. |
| Wspólny nacisk · Duo, Trust 40 | 2 + 20 Synergy | 12 obrażeń i 2 Marked na celu. | Wcześniejsze wydanie Synergy na przygotowanie celu zamiast odkładania całego zasobu na Back to Back. |

Ulepszenia: Zaprzyj się 6/16 Block, Zatruty trop 5 obrażeń/3 Trucizny (Osłabienie nadal 2), Zmiana warty do 9 przeniesionego Block, Wspólny nacisk 15 obrażeń/3 Marked. Limity statusów i Marked pozostają dotychczasowe. Koszt 20 Synergy jest faktycznie odejmowany, a karta jest zablokowana przy zbyt małej Synergy/energii/Trust.

Nowe karty trafiają do zwykłych nagród i mogą być ulepszane przy ognisku. W Akcie III mogą pojawić się jako jedna nagroda ogólna obok dwóch kart aktu. **Talia startowa pozostaje taka sama: 19 kart.** Stare zapisy nie otrzymują kart automatycznie i nie tracą poprzednich. Rozszerzenie zwykłej puli z 25 do 29 pozycji rozcieńcza dostępność dawnych kart; wpływ na spójność buildów wymaga oceny w runach graczy. Cztery pozycje są świadomie małym pierwszym pakietem.

## Implementacja

- `js/24-tactical-cards.js`: definicje, ulepszenia, nagrody, rozgrywanie i zapis nowych kart. Osłabienie Lyry wpływa na obrażenia nowego ataku tak jak na istniejące ataki. Transfer Block zachowuje łączną ilość i dobiera przed odrzuceniem własnej karty.
- `js/25-card-illustrations.js`: pełne mapowanie identyfikatorów do pól atlasów. Dane mechanik nie są modyfikowane przez dekorację. Nowe i ulepszone karty, PL/EN i dynamiczne okna korzystają z tej samej grafiki.
- `css/card-illustrations.css`: kadrowanie bez rozciągania, warstwy czytelności i role. Każda karta ma jeden obszar kliknięcia. Podgląd i duch zagrywanej karty zachowują pozycję fixed, aby ilustracja nie powodowała przewijania.
- `assets/card-art-prompts.md`: ścieżki, pochodzenie i pełne prompty. Obrazy zapisane lokalnie jako WebP quality=85, bez edycji kompozycji.

Uszkodzenie grafiki usuwa tylko ilustrację; nazwa, koszt, opis i zagrywanie pozostają dostępne. Podgląd jednoplikowy osadza wszystkie trzy atlasy, nie wymaga zewnętrznej usługi.

## Weryfikacja

Nowy test mechanik sprawdza: Momentum poniżej/progu/powyżej progu, oba warianty ulepszeń, atak z Marked i bez, zmniejszenie intencji przeciwnika przez Osłabienie, wpływ Osłabienia Lyry, limit Trucizny, częściowy/pełny/pusty transfer Block przeciw skrytobójcy omijającemu Ochronę, blokady kosztów, odejmowanie Synergy i połączenie Wspólny nacisk → Heavy Strike. Zapis i kontynuacja zachowują nową kartę oraz stan po jej zagraniu.

Nowy test oprawy sprawdza wszystkie 76 wariantów, rękę, podgląd, realny wybór ulepszenia i nagrody, odkryty/zablokowany Codex, PL/EN, 1366×768 / 1024×560 / 390×844 / 320×844 i brak ilustracji. Test podglądu sprawdza trzy nowe atlasy jako data URI również w ramce bez originu. Dotychczasowy test stołu nadal mierzy osiem okien, bossów i duże ręce. Testy dawnych bossów Standard i trzech starych buildów pozostały w zestawie regresji.

Automatyczne konfiguracje sprawdzają reguły, koszty i integrację; nie ustalają win rate nowych kart ani balansu pełnej, losowej wyprawy. Nowy pakiet wymaga oceny przez graczy.

Wynik lokalny: **20/20 zestawów** — 19 testów przeglądarkowych/offline i audyt tłumaczeń (Node 24.19.0 / Playwright 1.56.1 / Chromium 141). Po zachowaniu naturalnych proporcji pól atlasu ponownie zaliczono test oprawy, samodzielnego podglądu i audyt. Składnia nowych modułów i `git diff --check` poprawne. Obejrzano ekran z ilustracjami i pełny podgląd, w tym układ 1024×560.
