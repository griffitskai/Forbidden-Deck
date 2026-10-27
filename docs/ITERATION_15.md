# Drugie spotkanie na szlaku

Baza: PR #42, commit 51e0bce6b41d9a305d7cf79f1dc961cb0abf28de. Syntax check i Browser smoke test bazy zakończone sukcesem. Sprawdzono AGENTS.md, README, PROJECT_STATUS, ostatni raport i otwarte PR. Gałąź feat/roadside-followup.

Drugie spotkanie na szlaku ma osiem wariantów zależnych od pierwszej odpowiedzi (po dwa dla każdego duetu). Pojawia się raz, przed pierwszym odwiedzonym wydarzeniem w późniejszym akcie. Pominięcie pierwszej rozmowy wyłącza jej kontynuację. Po krótkiej wymianie zdań wraca zwykłe wydarzenie z dotychczasowymi nagrodami. Zapis wznawia rozmowę, a potwierdzone spotkanie trafia do wspomnień przy ognisku i kroniki zakończonej wyprawy. PL/EN, bez premii i bez wymogu romansu.

Kael i Lyra wracają do proszenia o pomoc albo wspólnej nauki napraw. Kael i Selene sprawdzają umowę o odpoczynku albo uczą się mówić o potrzebach. Lyra i Varyn dopracowują sygnały powrotu albo wspólną obserwację. Selene i Varyn zauważają powrót dawnych odruchów związanych z długiem albo uczą się dzielić ciężarem.

Stan followup jest opcjonalnym polem w istniejącym wspomnieniu roadside. Walidator kopiuje tylko poprawne dane późniejszego aktu; stare historie nie dostają sztucznych spotkań. Wczytanie po potwierdzeniu wraca do pierwotnego wydarzenia. Pierwsze spotkanie dopiero w ostatnim akcie nie otrzyma kontynuacji. Nie ma nowej decyzji ani nagrody w drugiej scenie; można od razu przejść dalej.

Nowy test roadside-followup-smoke dodano do CI: wszystkie duety i odpowiedzi oraz pominięcie, wejście do wydarzenia Aktu II z mapy, zapis/wczytanie, brak powtarzania, oryginalne nagrody i postęp, PL/EN, kopia historii po nowej wyprawie oraz stare i błędne dane.

Następny krok: sprawdzić tempo i różnorodność spotkań podczas pełnej wyprawy, zanim dodamy kolejne sceny.

Weryfikacja lokalna: PASS roadside-followup-smoke przez HTTP; roadside-smoke przez file:// (cztery duety, odpowiedzi/pominięcie, oryginalne nagrody, zapis, PL/EN, wąskie widoki i historia); gameplay-standard-smoke (karty, tury, mikstury, ekwipunek, bossowie I/II i przejścia aktów); preview-smoke (samodzielny HTML, izolowana ramka i zero zewnętrznych zasobów). Składnia JS i git diff --check poprawne. Środowisko wymagało świeżej instalacji Chromium po błędzie startu; nie był to błąd gry. Pełne CI nowej gałęzi zostanie uruchomione po utworzeniu PR. Bez scalenia do main lub publicznego wdrożenia.
Dodatkowo PASS: wszystkie warianty roadside-followup-smoke w wygenerowanym samodzielnym HTML przez file://.
