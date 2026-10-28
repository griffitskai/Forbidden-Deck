# Jasna konsekwencja pominięcia rozmowy

Baza: PR #45, commit baf3a623f4179f016515c9786e3c337c51d34e6a. Sprawdzono aktualne otwarte PR, AGENTS.md, README, PROJECT_STATUS oraz ITERATION_17. Oba workflow PR #45 zakończyły się sukcesem. Gałąź fix/roadside-skip-clarity.

Opis przycisku „Pomiń rozmowę” mówił tylko o przejściu do wydarzenia, choć wybór wyłącza także późniejszy ciąg rozmowy w tej wyprawie. Gracz poznaje teraz obie konsekwencje przed kliknięciem: pominięcie kontynuacji oraz zachowanie nagród wydarzenia. Dodano równoważne tłumaczenie EN. Bez nowego potwierdzenia, zmian logiki, dialogów, romansu lub formatu zapisów.

Weryfikacja: ręcznie przez Playwright potwierdzono oba języki i brak poziomego przepełnienia przy szerokości 320 px w index.html przez file://. Istniejący roadside-smoke przeszedł dla czterech duetów, obu odpowiedzi i pominięcia; obejmuje zapisy, nagrody, kronikę, stare dane i wąskie ekrany. Składnia zmienionych modułów i git diff --check poprawne.

PASS także: roadside-route-smoke (36 scenariuszy), gameplay-standard-smoke (nowy run, mapa, karty, tury, ekwipunek, mikstury, bossowie I/II Standard i przejścia), preview-smoke (samodzielny HTML, zapis, izolowana ramka, brak zewnętrznych zasobów). CI nowego PR jeszcze niepotwierdzone.

Ten etap poprawia czytelność decyzji; nie jest pomiarem tempa wyprawy. Następny krok pozostaje bez zmian: ocena odstępów między rozmowami podczas przejścia z walkami i ogniskami. Bez scalania i publicznego wdrożenia.
