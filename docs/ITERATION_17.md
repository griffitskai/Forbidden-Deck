# Kolejność spotkań na trasie

Baza: PR #44, commit 07d8fd1e3dd9ac51c0fbd56425c7dbeb30459ded. Oba workflow GitHub zakończone sukcesem. Sprawdzono AGENTS.md, README, PROJECT_STATUS, ITERATION_16 i najnowsze otwarte PR. Gałąź test/roadside-route-coverage.

Dodano tests/roadside-route-smoke.mjs do CI. Test przechodzi przez wiersze tras wszystkich trzech aktów i uruchamia wydarzenia kliknięciem na mapie. 36 scenariuszy obejmuje cztery duety, pierwszą rozmowę odłożoną do dowolnego aktu, obie odpowiedzi oraz pominięcie. Kontroluje dokładny rejestr scen, brak powtórzeń, zapamiętanie wyboru, brak zużycia etapu przez dialog i pojedyncze przesunięcie po oryginalnym wydarzeniu. Brak krytycznych błędów konsoli.

Wynik dla obecnych tras (numery aktów i etapów od 1):

| Pierwsza rozmowa | Kontynuacja po odpowiedzi | Po pominięciu |
| --- | --- | --- |
| Akt I, etap 6 | Akt II, etap 1 | Brak |
| Akt II, etap 1 | Akt III, etap 1 | Brak |
| Akt III, etap 1 | Brak późniejszego aktu | Brak |

Test celowo omija węzły inne niż wydarzenia i ustawia współrzędne trasy. Nie jest pełnym przejściem gry, testem balansu ani pomiarem czasu między scenami. Dotychczasowy test roadside-followup nadal sprawdza zapisy, PL/EN i kronikę. Ten etap nie zmienia kodu gry, dialogów ani formatu zapisów.

PASS lokalnie: roadside-route-smoke (36 scenariuszy). PASS: gameplay-standard-smoke (nowy run, mapa, karty, tury, ekwipunek, dwie mikstury, bossowie I/II na Standard i przejścia aktów); preview-smoke (samodzielny HTML, zapisy, izolowana ramka, zero żądań zasobów zewnętrznych); node --check i git diff --check. CI nowego PR jeszcze niepotwierdzone.

Następny krok: ocena odstępu między rozmowami podczas rzeczywistego przejścia Aktu I–II, z walkami i ogniskami, przed zmianą częstotliwości scen. Bez scalania ani publicznego wdrożenia.
