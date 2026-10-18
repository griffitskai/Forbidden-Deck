# V0.9.8 — Fundament wyboru bohaterów

Dotychczas silnik utożsamiał stałe pola Kaela i Lyry z całym modelem bohaterów. Nowa warstwa `ForbiddenDeckParty` oddziela definicję postaci, bieżący stan postaci i definicję wspólnego duetu. Reguła składu wymaga dwóch różnych, dorosłych bohaterów — mężczyzny i kobiety.

HP, Block, statusy, osobisty zasób i pancerz należą do członka drużyny. Karty mają trwały identyfikator właściciela albo duetu. Talia startowa jest składana z tych części; pula nagród oraz możliwość zagrania sprawdzają skład. Nazwa wyświetlana na karcie nie steruje jej mechaniką.

Stare zapisy przechodzą do formatu 2 z zachowaniem aktualnej walki, statystyk i trasy. Adaptery zapewniają zgodność scen i interfejsu, bez dwóch kopii stanu. Metadane odkrytych kart i sprzętu pozostają w dotychczasowym formacie. Nowy format nie zapisuje chwilowego kontekstu wykonywanej karty.

W grze nadal dostępni są Kael i Lyra. Nowi bohaterowie i wybór składu są kolejnym etapem, po przeniesieniu widoków i rozdzieleniu pamięci relacji. [Architektura, API, migracja i pozostałe prace](PARTY_ARCHITECTURE.md).

## Weryfikacja

Dwa nowe testy obejmują kombinacje modelu oraz rzeczywistą migrację w przeglądarce. Zapis testowy został wygenerowany przez poprzednią wersję gry. Zmiana etykiety aktora na karcie nie zmienia skutków zagrania, Osłabienia ani Synergy. Testy obejmują też reset nowego runu, osobny pancerz i wspólny amulet, blokadę cudzych kart i nagród, PL/EN oraz zachowanie nieobsługiwanego zapisu.

Wszystkie dotychczasowe testy regresyjne należy uruchamiać razem z nowymi. Pełna kampania Kaela i Lyry pozostaje kryterium zgodności tej przebudowy. Talia startowa i liczby balansu nie są zmieniane.

Weryfikacja lokalna zakończona: wszystkie 23 skrypty testowe przeszły, w tym bossowie Standard i przejścia aktów, 8 rozmiarów ekranu walki, PL/EN, relacje, nowy model oraz migracja. Sprawdzenie składni modułów i `git diff --check` także zakończone poprawnie. Oba nowe testy zostały dodane do CI.

Przy regresji poprawiono też kolizję myszy z fokusem klawiatury w podglądzie mapy: wejście i wyjście kursora nie nadpisują miejsca wskazanego klawiaturą. Istniejący test scenerii obejmuje teraz ten przypadek jawnie.
