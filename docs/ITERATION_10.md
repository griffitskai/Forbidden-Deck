# V0.10.1 — Ślady wspólnej drogi

Relacje mają dalszy ciąg: późniejsze rozmowy odwołują się do ostatniej wcześniejszej decyzji, a album zbiera pierwsze zapisane wybory. Dla Kaela i Lyry obejmuje także pięć wspomnień poza progami Trust. Odtwarzanie scen nie nadpisuje decyzji ani nie daje premii.

Każdy z czterech duetów otrzymał własny epilog porażki oraz trzy warianty zakończenia zwycięstwa: przyjaźń, wybrana bliskość i znajomość bez obietnic. To tekstowe rozwinięcia z istniejącymi ilustracjami, bez nowych filmów. Podsumowanie runu i historia pozwalają rozwinąć epilog.

Historia przechowuje identyfikatory decyzji z chwili zakończenia wyprawy. Późniejszy run ich nie zmienia. Romans nadal wymaga włączenia: wyłączenie preferencji maskuje jego teksty, lecz nie kasuje historii. Nie wnioskujemy o bliskości z samego Trust. Stare zakończone runy bez zapisu relacji nie otrzymują dopisanych wspomnień.

Naprawiono błąd ujawniony przez CI #36: podpowiedź samouczka blokowała koniec tury. Teraz pozycja uwzględnia przycisk, a wyłącznie przycisk zamknięcia podpowiedzi przechwytuje kliknięcia. Zamknięte dialogi nie otwierają się przy zmianie ustawienia romansu.

Nowe moduły: js/29-narrative-content.js (polskie teksty i katalog angielski), js/30-narrative.js (odczyt pamięci i prezentacja), css/narrative.css. Test narrative-smoke sprawdza cztery duety, trzy ścieżki, epilogi obu wyników, kopie zapisów, zmianę preferencji, stare/uszkodzone dane, język i wąskie widoki.
