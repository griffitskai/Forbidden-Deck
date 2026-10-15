# Iteracja 1 — W świetle ognia

## Zakres

V0.9.1 rozwija istniejący checkout z bazą `26d191e746e45f2a3cf0f045920edb380df9ef4c`. Nie zmienia stosu technologicznego ani pętli walki. Trzy wygenerowane ilustracje i scena 40 Trust są pierwszym wycinkiem oprawy i historii do oceny przez graczy. Dalsze biomy, ilustracje kart/przeciwników i audio pozostają poza zakresem.

Scena ma dwa dialogi wprowadzające, decyzję, dwie odpowiedzi oraz powrót na mapę. Romans jest domyślnie wyłączony. Po włączeniu scena pokazuje zaproszenie Lyry, świadomą odpowiedź Kaela i wzajemną bliskość, bez dosłownych treści seksualnych. Kael ma 32 lata, Lyra 29.

## Jak obejrzeć

W menu włącz „Romantyczne sceny Kaela i Lyry”, jeśli chcesz ten wariant. Podczas runu wybierz rozmowę przy ognisku po osiągnięciu 40 Trust i przeżyciu sceny 20 Trust. Po przeżyciu starszej wersji sceny 40 Trust nową prezentację można otworzyć z ekranu relacji. Nie daje to drugiej nagrody. Do obejrzenia nie jest potrzebna wcześniejsza romantyczna decyzja.

Wybór przyjacielski, romantyczny, wyłączony romans oraz pominięcie dają identyczną premię: +6 Trust i +1 energii w pierwszej turze następnej walki. Jedna wspólna premia zastępuje dwa różne dawne warianty sceny 40 Trust. Premie zapisane przed aktualizacją zachowują działanie.

## Zapis

Relacja migruje ze schematu 1 do 2 w dotychczasowym kluczu. Dawne wybory, statystyki, przeżyte sceny, wydarzenie na trakcie i oczekująca premia są zachowane. Osobna flaga `romance.campfireChoice` przechowuje `friendship`, `romance`, `skipped` albo brak decyzji. Wartość Trust nigdy nie ustawia tej flagi. Ustawienie romansu ma osobny klucz. Rozmowa w trakcie runu zapisuje etap w `state.relationshipScene`; kontynuacja po odświeżeniu wraca do tego etapu.

Ponowne obejrzenie zachowuje pierwszy zapisany wybór nowej prezentacji. Stary zapis może dokonać pierwszego wyboru w nowej scenie bez dopisywania drugiego starego milestone'u lub nagrody. Test migracji zachowuje też zapis runu, kolekcję i rzeczywistą historię wypraw.

## Weryfikacja

Bazowo przechodziło 7/8 dotychczasowych zestawów; tutorial błędnie narzucał kolejność podpowiedzi uruchamianych przez zagnieżdżone zdarzenia. Dostosowano test do kolejki, nadal wymagając wszystkich sześciu podpowiedzi.

Lokalna weryfikacja używa Node 22.22.0, Playwright 1.56.1, systemowego Chromium 154 i zwykłego `python3 -m http.server 8000 --bind 127.0.0.1`, zgodnie ze sposobem serwowania w CI. Dodatkowo [GitHub Actions](https://github.com/griffitskai/Forbidden-Deck/actions/runs/38627762066) zaliczył wszystkie 12 zestawów przeglądarkowych na Node 22 i Chromium 141 instalowanym przez Playwright, w tym test uruchomienia offline. Osobny workflow sprawdzania składni również przeszedł.

| Sprawdzenie | Wynik |
| --- | --- |
| Składnia wszystkich `js/*.js` | zaliczona |
| Osiem istniejących zestawów regresji | zaliczone po dostosowaniu testów relacji i kolejki tutoriala |
| Scena, cztery warianty korzyści, ustawienie i zapis | zaliczone |
| Migracja starej relacji/runu/historii, wznowienie dialogu, ponowne obejrzenie | zaliczone |
| Brak ilustracji i wyłączenie romansu podczas rozmowy | zaliczone |
| Menu, mapa, karta, tura, ekwipunek, leczenie i mikstura odporności | zaliczone |
| Bossowie Aktów I/II i oba przejścia między aktami | zaliczone na deterministycznych konfiguracjach Standard |
| Boss Aktu III | zaliczony trzema istniejącymi buildami: Obrona, Statusy, Duo |
| Widoki 1440, 390 i 320 px | testy układu i klikania zaliczone; zrzuty obejrzane w przeglądzie wizualnym |
| Bezpośrednie uruchomienie `index.html` przez `file://` | zaliczone w GitHub Actions; lokalnie zablokowane polityką administratora Chromium |
| GitHub Actions | wszystkie 12 zestawów przeglądarkowych i kontrola składni zaliczone |
| Ocena przez graczy, pełny naturalnie rozwinięty run | nieweryfikowane |

Polecenia CI znajdują się w `.github/workflows/browser-smoke.yml`. W chmurze testy HTTP można uruchomić z przygotowanym preloadem wybierającym systemowe Chromium: `node --import /workspace/forbidden-deck-tools/system-chromium.mjs tests/<nazwa>.mjs`. Wszystkie jedenaście zestawów HTTP jest obowiązkowych; `offline-check.mjs` ma osobny, jawny wynik. Nie wyłączamy polityki przeglądarki, aby go zaliczyć.

Testy potwierdzają funkcje i brak krytycznych błędów JavaScript w sprawdzonych ścieżkach. Nie stanowią oceny atrakcyjności gry ani pełnego balansu runu.
