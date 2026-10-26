# Rozmowy na szlaku — etap po V0.10.1

Baza: `26eb6480bab9612b413835f95c27bae5a73d0639`, otwarty PR #37. Sprawdzono AGENTS.md, README, PROJECT_STATUS i otwarte PR; baza miała zaliczone oba workflow. Nowa gałąź `feat/roadside-memories` nie zmienia poprzednich gałęzi ani main.

Pierwsze odwiedzone wydarzenie w wyprawie otwiera krótką, opcjonalną rozmowę bieżącego duetu. Kael i Lyra naprawiają pasek tarczy; Kael i Selene uczą się odpoczywać; Lyra i Varyn ustalają, jak nie znikać bez słowa; Selene i Varyn rozmawiają o pomocy bez długu. Cztery sceny mają osiem osobnych odpowiedzi, osiem zakończeń i osiem późniejszych nawiązań, w PL/EN. Pominięcie jest osobną opcją.

Wybór wpływa na późniejszy tekst przy ognisku i wpis w kronice. Nie dodaje premii mechanicznych i nie zastępuje starego wydarzenia: po rozmowie gracz podejmuje dotychczasową decyzję z dotychczasowymi nagrodami. Jeśli omija węzły wydarzeń, nie dostaje sztucznie przypisanego wspomnienia. Romans pozostaje niezależny i opcjonalny.

Stan `S.roadside` należy do bieżącego runu. Zapis obejmuje pytanie, wybraną odpowiedź i przejście do oryginalnego wydarzenia. Po odświeżeniu nie trzeba ponownie wybierać odpowiedzi. Nowy run zeruje stan. Historia ukończonego runu dostaje kopię; starsze zapisy i historie bez tego pola nie dziedziczą żywego wspomnienia. Dane są sprawdzane według duetu, etapu i dozwolonych odpowiedzi. Callback starego przycisku nie może zmienić nowej sceny/runu.

Brak nowych bibliotek, grafik i połączeń sieciowych. Używany jest istniejący modal i styl kroniki; ekran walki pozostaje bez zmian. Samodzielny HTML osadza 34 moduły, 15 arkuszy i 27 obrazów.

## Weryfikacja

Zaliczone wszystkie 28 zestawów z workflow: pierwszy przebieg 27/28, następnie poprawiony sterownik testu Aktu I zaliczył wszystkie cztery duety. Sterownik nie rozpoznawał pojedynczego przycisku kontynuacji nowej sceny; dodano jego obsługę bez zmiany statystyk, strategii walki ani końcowych asercji. Osobno wszystkie 12 ścieżek nowej rozmowy przeszło również na samodzielnym HTML przez file://. Kontrola składni JS i git diff --check poprawne. Obejrzano scenę w 1366×768 i 390×844; oddzielono podpowiedzi skutków od wypowiadanych odpowiedzi. Środowisko: Node 24.22.1, Playwright 1.56.1, Chromium 141. Nowy `tests/roadside-smoke.mjs` jest częścią CI i sprawdza cztery duety × dwie odpowiedzi/pominięcie, prawdziwe wejście z mapy, niezmienność nagród podczas rozmowy, przejście starego wydarzenia, wznowienie trzech faz, PL/EN, szerokości 1366/390/320, nawiązania przy ognisku, kopię historii, nowy run i stare dane. `FD_ROADSIDE_URL` pozwala uruchomić ten sam test na samodzielnym HTML.

## Następny etap

Rozwinąć wydarzenia zależne od rzeczywistych przeżyć (np. ciężka walka), z dalszymi konsekwencjami wcześniejszych odpowiedzi. Ten etap dostarcza po jednej scenie na duet, nie system wielu losowych wydarzeń. Odbiór dialogów przez graczy pozostaje do oceny.

## Korekta widoczności wspomnień

Po zielonym CI PR #38 wykryto, że obsługa zmiany romansu usuwała wszystkie elementy `.narrative-callback`, także nieromantyczne wspomnienia ze szlaku. Nawiązania relacyjne otrzymują osobną klasę `relationship-callback`; czyszczenie nie obejmuje już wspomnień drogowych. Rozszerzony test sprawdza zachowanie treści i niezmienność zapisanych faktów przy trzykrotnym przełączeniu ustawienia dla każdego duetu i obu odpowiedzi. Dotychczasowy test narracji nadal kontroluje ukrywanie romantycznych epilogów.

Weryfikacja korekty: PASS roadside-smoke (cztery duety × dwie odpowiedzi/pominięcie oraz przełączanie romansu), narrative-smoke (prywatność, epilogi, stare zapisy, PL/EN), gameplay-standard-smoke (karty, tury, mikstury, ekwipunek, bossowie i przejścia aktów), składnia i git diff --check. Przebudowano podgląd offline. Pełny zestaw bazy PR #38 był zielony w GitHub Actions: 40239468529; CI poprawki jest oddzielne.
