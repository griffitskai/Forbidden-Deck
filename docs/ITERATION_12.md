# Po trudnym zwycięstwie

Baza: PR #39, commit 6a7680c4d238a393a792db5d3b9b7ba2684bd054. Oba workflow bazy zakończyły się sukcesem. Sprawdzono AGENTS.md, README, PROJECT_STATUS oraz otwarte PR.

Każdy z czterech duetów ma własną dwukwestiową reakcję przy ognisku po trudnym zwycięstwie. Scena dotyczy strachu, potrzeby obecności i przyjmowania pomocy, bez wymuszania romansu. Jest zwykłą częścią widoku ogniska, bez dodatkowego kliknięcia i bez nagrody.

Warunek: oboje żyją, wszyscy przeciwnicy zostali pokonani, a przynajmniej jedna postać ma nie więcej niż 30% maksymalnego HP i mniej HP niż na początku tej walki. Sprawdzenie następuje przed leczeniem po zwycięstwie. Dawne rany bez dalszej utraty HP nie wystarczą. Jest to porównanie początku i końca walki; nie wykrywa chwilowego spadku, jeśli postać została uleczona przed końcem.

Początkowe HP i fakt trudnego zwycięstwa są zapisane w bieżącym runie. Wczytanie podczas walki zachowuje punkt odniesienia. Nowy run zeruje dane; stare zapisy bez tych pól nie dostają wymyślonych przeżyć. Reakcja pozostaje przy kolejnych ogniskach tej wyprawy. Ten mały etap nie dodaje jeszcze wyborów ani wpisu do archiwum zakończonych wypraw.

Lokalne moduły 33/34, dokładne PL/EN, bez nowych zależności produkcyjnych. Układ walki i dotychczasowe nagrody pozostają bez zmian. Test hard-won-smoke dodano do CI.

## Weryfikacja

PASS: hard-won-smoke przez HTTP i samodzielny HTML file:// (cztery duety, nowe obrażenia, brak fałszywego warunku od starych ran/śmierci, zapis w walce i na mapie, PL/EN, niezależność od romansu, reset); gameplay-standard-smoke (bossowie, przejścia aktów, mikstury, ekwipunek); persistence-smoke; combat-table-smoke (osiem rozmiarów); preview-smoke (offline i izolowana ramka, brak żądań zewnętrznych). Składnia JS i git diff --check poprawne. Testowy cios uwzględnia odporność i Block, aby pozostawić dokładnie 8 HP. Pełny zestaw CI uruchomi PR; nie jest tu deklarowany jako ukończony.

Następny etap: opcjonalna odpowiedź na takie przeżycie i jej późniejsze konsekwencje, z archiwizacją w historii runu.
