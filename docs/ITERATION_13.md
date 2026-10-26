# Odpowiedzi po trudnym zwycięstwie

Baza: PR #40, commit 54324219a5a8e006ea78cf3b9b667e09244a7d64. Syntax check i Browser smoke test zakończone sukcesem. Sprawdzono lokalny stan, AGENTS.md, README, PROJECT_STATUS i otwarte PR #36–40; brak nowszego etapu. Praca na osobnej gałęzi feat/hard-won-responses.

Osiem odpowiedzi (dwie na duet), osiem bezpośrednich reakcji i osiem późniejszych nawiązań. Tematy: tempo marszu i mówienie o strachu; pomoc bez odbierania samodzielności; obecność zamiast znikania; towarzystwo bez długu. Wybór nie daje premii. Istniejące akcje ogniska pozwalają odłożyć rozmowę. Po odpowiedzi przy kolejnych ogniskach wyświetla się krótka konsekwencja narracyjna.

Naprawiono nadpisywanie wspomnienia przy każdym kolejnym trudnym zwycięstwie: pierwsza decyzja pozostaje do końca wyprawy. Snapshot kroniki zachowuje ją niezależnie od nowych runów. Dawny zapis wspomnienia bez choice jest traktowany jako pytanie bez odpowiedzi, błędne wartości są odrzucane. Stare historie nie dostają sztucznych przeżyć. Romans nie jest wymagany. PL/EN, bez zasobów zewnętrznych i nowych zależności produkcyjnych.

## Weryfikacja

Rozszerzony hard-won-smoke: cztery duety × obie odpowiedzi, brak premii, zapis w walce i po decyzji, kolejne zwycięstwo nie nadpisuje wyboru, echo przy ognisku, niezależna kopia kroniki po nowym runie, stare/błędne dane i komplet tłumaczeń. Test należy do istniejącego workflow.

Dalszy krok: dopracować czytelność i oprawę wspomnień w ognisku oraz kronice, zachowując krótkie sceny i dostęp do podstawowych akcji.

Lokalnie PASS: hard-won-smoke przez HTTP oraz samodzielny HTML file://, narrative-smoke, gameplay-standard-smoke (bossowie Aktów I/II, przejścia, karty, tury, mikstury i ekwipunek), persistence-smoke, combat-table-smoke (8 rozmiarów), preview-smoke (także izolowana ramka, zero zasobów zewnętrznych). Składnia zmienionych modułów i git diff --check poprawne. Pełne CI nowego PR będzie uruchomione osobno; nie deklarujemy go jako ukończonego. Bez scalania i publicznego wdrożenia.
