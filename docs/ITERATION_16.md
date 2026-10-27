# Przypomnienie wcześniejszej decyzji

Baza: PR #43, commit 19fc2393ba07d08352ea644de367f03b26545903, oba workflow zielone. Sprawdzono AGENTS.md, README, PROJECT_STATUS, raport poprzedniego etapu i najnowszy otwarty PR. Osobna gałąź feat/roadside-choice-recap.

Przegląd warunku spotkań: kontynuacja dopiero w późniejszym akcie, raz na wyprawę; pominięcie pierwszej rozmowy wyłącza kontynuację. Przy takim odstępie gracz może już nie pamiętać dokładnej odpowiedzi. Dodano zwijane przypomnienie tytułu pierwszej rozmowy i faktycznie wybranego tekstu w drugiej scenie, ognisku i kronice. Tekst pochodzi z zapisanej decyzji danego runu, bez odwołania do wyborów nowej wyprawy. Brak decyzji nadal nie tworzy wspomnienia.

Domyślnie zwinięte details nie wydłuża dialogu o obowiązkowy tekst. Natywna obsługa Enter/Spacja, widoczny fokus, PL/EN, bez nowych zależności, zasobów sieciowych czy zmiany formatu zapisu. Rozszerzono test wszystkich duetów i obu odpowiedzi o faktyczny tekst przypomnienia, klawiaturę i wersję angielską.

Następny krok: test pełnej trasy z rejestrem wystąpień scen, aby ocenić ich tempo obok walk i ognisk. Ten etap nie jest pomiarem tempa pełnej rozgrywki.

PASS lokalnie: rozszerzony roadside-followup-smoke (wszystkie duety i odpowiedzi, zapis, historia, PL/EN, klawiatura i poprawny tekst przypomnienia); gameplay-standard-smoke (bossowie I/II, przejścia, karty, tury, mikstury, ekwipunek); preview-smoke (samodzielny HTML, izolowana ramka, zero zewnętrznych zasobów). Dodatkowo obejrzano rozwinięte przypomnienie przez file:// przy szerokości 390 px; brak poziomego przepełnienia. Składnia JS i git diff --check poprawne. Pełne CI nowego PR jeszcze niepotwierdzone. Bez scalania i publicznego wdrożenia.
