# V0.9.4 — Świat w dwóch językach

Wybór **Polski / English** znajduje się w menu. Przycisk **PL → EN / EN → PL** na górnym pasku pozwala przełączyć język również podczas wyprawy. Osobny klucz `forbidden_deck_language_v1` zachowuje wybór. Domyślnym językiem pozostaje polski. Menu, mapa, walka, opisy kart i ulepszeń, przedmioty, wydarzenia, tutorial, historia, relacje i pięć wspólnych opowieści korzystają z lokalnego katalogu angielskiego. Nazwy własne Kael/Lyra i terminologia Trust, Marked, Momentum, Synergy pozostają wspólne.

## Zachowanie zapisów i decyzji

Lokalizacja działa wyłącznie na prezentacji tekstu. Kanoniczne nazwy przeciwników, identyfikatory kart, statystyki, oferty sklepu i nagród oraz zapisane wybory nie są tłumaczone ani ponownie tworzone. Jest to istotne, ponieważ dotychczasowy wybór celu używa także długości nazwy przeciwnika. Zmiana języka nie zmienia więc zachowania AI. Oryginalne treści węzłów i atrybutów są zachowywane w WeakMap; przełączenie z powrotem odtwarza polski tekst. MutationObserver lokalizuje późniejsze aktualizacje i dynamiczne moduły bez zmiany callbacków przycisków.

Katalog `js/21-english.js` zawiera pełne zdania narracyjne, opisy kart i fragmenty komunikatów ze zmiennymi. Przy dodawaniu nowych treści trzeba dopisać ich tłumaczenia. To lekka warstwa dla istniejącego projektu bez bibliotek; nie zastępuje docelowej migracji rendererów do kluczy tłumaczeń. `data-no-translate` wyłącza lokalizację danego elementu. Teksty technicznych ostrzeżeń konsoli pozostają polskie.

## Ilustracje

- 12 portretów archetypów z Pogranicza i lasu: bandyta, łuczniczka, wilk, kultystka, strażnik, alchemiczka, skrytobójca, wiedźma, pająk, korzenna bestia i dwie władczynie.
- 4 portrety Cytadeli: golem, kapłanka, Królowa Popiołu i strażnik pieczęci.
- 10 ilustracji przedmiotów: sześć pancerzy/amuletów i cztery mikstury.
- Nowa panorama mostu z kapliczką i porzuconym wozem; tło walk Pogranicza oraz ilustracja sklepu i wydarzenia mostu. Las i Cytadela używają własnych istniejących panoram.

Portrety są przypisane do archetypów: warianty wrogów mogą dzielić ilustrację. Nie wprowadzono nowych statystyk ani nowych przeciwników. Niezilustrowane istoty nadal mają dotychczasowe symbole. Przedmioty w ekwipunku, nagrodach, sklepie i odkrytym Codexie otrzymują ilustracje. Nieodkryte przedmioty zachowują tajemnicę. Awaria obrazu usuwa samą ilustrację i pozostawia tekst oraz sterowanie.

Grafiki wygenerowano wbudowanym imagegen z panoramą Pogranicza jako referencją stylistyczną; źródła i prompty: `assets/bilingual-world-prompts.md`. Trzy atlasy ograniczają liczbę plików i są odczytywane przez CSS, bez przycinania i generowania osobnych miniatur.

## Sprawdzenie

Nowy `tests/bilingual-world-smoke.mjs` sprawdza zapamiętywanie języka, niezmienność stanu i celowania, rzeczywiste zagranie karty, koniec tury, zachowanie wylosowanej oferty i callbacku nagrody, sklep, ilustracje ekwipunku/Codexu, kontynuację dialogu po zmianie języka i odświeżeniu, odczyt atlasów oraz szerokości 1440/390/320 px. Audyt tłumaczeń sprawdza treści podstawowych ekranów, wszystkie opisy kart/przedmiotów i dane pięciu historii. Nadal obowiązują dotychczasowe testy walk, zapisów, bossów i scen.

`node scripts/build-preview.mjs` osadza wszystkie ilustracje i tłumaczenia w jednym pliku HTML. Testy podglądu obejmują także uruchomienie w odizolowanej ramce. Nie dodano usługi tłumaczeniowej, konta ani zależności sieciowej do samej gry.

Wynik lokalny: **17/17 zestawów** (16 testów przeglądarkowych wraz z wejściem offline + audyt tłumaczeń), Node 24.19.0 / Playwright 1.56.1 / Chromium 141. Po korekcie kadrowania tła ponownie zaliczono test PL/EN, układ 1440/390/320 px, audyt i podgląd offline. Składnia nowych modułów i `git diff --check` poprawne. Obejrzano zrzuty walki na komputerze i telefonie; nie przeprowadzono pełnego, naturalnie rozegranego runu w języku angielskim.
