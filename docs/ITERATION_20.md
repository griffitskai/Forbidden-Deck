# Krótkie echa spotkań przy ognisku

Baza: PR #47, commit 527d4423f75d2a9a3dc6b56947171ad7a7264c06, oba workflow zielone. Sprawdzono AGENTS.md, README, PROJECT_STATUS, ITERATION_19, aktualny kod i otwarte PR. Dokończono zastane niezapisane zmiany na gałęzi feat/roadside-followup-echo.

Panel ogniska powtarzał całą drugą rozmowę ze szlaku. Teraz zawiera nową krótką kwestię: osiem wariantów zależnych od wyboru, po dwa dla każdego duetu, w PL/EN. Gesty obejmują wspólne naprawy, odpoczynek, zapowiadanie wyjścia i przyjmowanie pomocy. Echa pojawiają się tylko po potwierdzeniu drugiego spotkania. Kronika nadal pokazuje pełną wymianę zdań, a przypomnienie pierwszego wyboru pozostaje dostępne.

Bez zmiany formatu zapisów, częstotliwości scen, nagród lub wymogu romansu. To rozwój dialogów i ograniczenie powtórzeń przy ognisku, nie pomiar tempa pełnej wyprawy.

Rozszerzono istniejący test roadside-followup-smoke uruchamiany w CI: brak późniejszego echa przed spotkaniem, dokładna treść wszystkich ośmiu wariantów PL/EN, dwa krótkie akapity w obozie i pełna rozmowa w kronice. Lokalnie PASS przez HTTP i file://, wraz z zapisami, historią i nagrodami. PASS gameplay-standard-smoke: menu, mapa, karty, tury, mikstury, ekwipunek, bossowie I/II Standard i przejścia aktów. Kontrole składni zmienionych plików i git diff --check bez błędów.

PASS także preview-smoke (samodzielny HTML, izolowana ramka, zero zewnętrznych zasobów), combat-table-smoke (osiem rozmiarów pulpitu, bez przewijania walki) i camp-memories-layout (cztery duety, PL/EN, trzy szerokości, klawiatura i brak przepełnień). CI nowego PR jeszcze niepotwierdzone.

Następny krok: przejście Aktu I–II z walkami i ogniskami w celu oceny odstępów między scenami. Bez scalania i publicznego wdrożenia.
