# Rozmowy na szlaku dostępne z klawiatury

Baza: PR #46, commit 5e920e3b0ea55d5a3da74a804d52f184b5313b9b. Sprawdzono AGENTS.md, README, PROJECT_STATUS, ITERATION_18 i najnowsze otwarte PR. Oba workflow bazy zakończyły się sukcesem. Gałąź fix/roadside-keyboard.

Rozmowy wcześniej nie przenosiły fokusu z mapy, a odpowiedź usuwała aktywny przycisk bez wskazania kolejnego miejsca. Teraz fokus trafia na treść sceny po otwarciu, odpowiedzi i wczytaniu. Grupa treści ma dostępną nazwę powiązaną z tytułem. Tab i Shift+Tab poruszają się między odpowiedziami, pominięciem, kontynuacją oraz rozwijanym przypomnieniem; nie przechodzą do mapy pod sceną. Po zakończeniu rozmowy fokus trafia na pierwszą decyzję zwykłego wydarzenia. Obsługa jest ograniczona do scen na szlaku, bez zmiany pozostałych okien gry.

Dodano tests/roadside-keyboard-smoke.mjs do CI. PASS lokalnie przez HTTP i file://: cztery duety × PL/EN, pierwsza rozmowa, odpowiedź, wczytanie, kontynuacja w późniejszym akcie, otwieranie przypomnienia klawiaturą, oba kierunki Tab i powrót do wydarzenia. Bez błędów konsoli. To test nawigacji klawiaturą, nie audyt czytników ekranu.

PASS także: roadside-followup-smoke (wybory, zapisy, nagrody i historia), gameplay-standard-smoke (nowy run, mapa, karty, tury, mikstury, ekwipunek, bossowie I/II Standard i przejścia), preview-smoke (samodzielny HTML, zapis, izolowana ramka, brak zewnętrznych zasobów), składnia zmienionego modułu i testu oraz git diff --check. CI nowego PR jeszcze niepotwierdzone.

Bez zmian formatu zapisów, dialogów, zasad romansu, częstotliwości spotkań i układu walki. Następny krok: przejście Aktu I–II z walkami i ogniskami, aby ocenić odstępy między scenami; ten etap nie jest pomiarem tempa ani balansu. Bez scalania i publicznego wdrożenia.
