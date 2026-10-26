# Panel wspomnień przy ognisku

Baza: PR #41 / 4442d8e7b7914a1182b2d5857e044ccccaeab9cd. Oba workflow GitHub zakończone sukcesem. Sprawdzono AGENTS.md, README, PROJECT_STATUS, raport poprzedniego etapu i najnowsze otwarte PR. Osobna gałąź feat/camp-memory-panel.

Wspomnienia są grupowane pod podstawowymi akcjami obozu w natywnym details. Nowa rozmowa jest od razu rozwinięta, z nagłówkiem informującym o niej. Przeczytane wspomnienia zaczynają zwinięte, a brak wspomnień nie tworzy pustego panelu. Stan rozwinięcia nie jest zapisywany. Decyzje, nagrody, romans i archiwum nie zmieniają zasad.

Ciepłe tło CSS, większy tekst, odstępy między odpowiedziami i oddzielone podpowiedzi. Nagłówek ma fokus klawiatury; po wyborze usuwany przycisk przekazuje fokus na odpowiedź postaci. PL/EN, brak nowych zasobów sieciowych lub zależności produkcyjnych. Kronika zachowuje dotychczasowy układ.

## Weryfikacja

Nowy test camp-memories-layout: cztery duety × dwa języki × trzy szerokości (1366/390/320), zwijanie klawiaturą, fokus po odpowiedzi, akcje obozu przed panelem, brak poziomego przepełnienia, brak premii i brak pustego panelu. Dodany do CI. Istniejące hard-won-smoke i roadside-smoke otwierają teraz panel przed asercjami tekstu, nadal sprawdzając te same decyzje i prywatność.

Następny krok: drugie spotkanie na szlaku, nawiązujące do wcześniejszej odpowiedzi duetu.

PASS lokalnie: camp-memories-layout przez HTTP i samodzielny plik file://; hard-won-smoke; roadside-smoke; gameplay-standard-smoke (bossowie Aktów I/II, przejścia, karty, tury, mikstury i ekwipunek); combat-table-smoke (8 rozmiarów); preview-smoke (również izolowana ramka i brak zasobów zewnętrznych). Obejrzano zrzut nowego panelu na komputerze. Składnia zmienionych JS i git diff --check poprawne. Pełny workflow nowej gałęzi uruchomi się po utworzeniu PR. Bez scalenia lub publicznego wdrożenia.
