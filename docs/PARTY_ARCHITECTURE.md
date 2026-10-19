# Postacie i drużyny — V0.10.0

## Definicje i stan

Moduł js/00-party.js zawiera niezmienne definicje czterech dorosłych, fikcyjnych postaci oraz czterech duetów. Postać określa bazowe HP, klasę, portret, zasoby, pancerz i osobistą talię. Duet określa wspólne karty i trwały identyfikator relacji.

| Postać | Wiek | Klasa | Bazowe HP | Zasób |
| --- | --- | --- | --- | --- |
| Kael | 32 | Wojownik | 48 | Momentum 0–5 |
| Lyra | 29 | Łuczniczka | 38 | Marked na przeciwnikach |
| Varyn | 34 | Skrytobójca | 44 | Cień 0–3 |
| Selene | 31 | Magini run | 38 | Runy 0–3, jedno leczenie na walkę |

Kanoniczny stan członka drużyny to S.party.members: id, hp, maxHp, block, status, resources, equipment. Nie kopiujemy statystyk do widoków. Pancerz należy do konkretnej postaci, amulet do drużyny. Przeniesienie jednego posiadanego pancerza usuwa go z poprzedniego nosiciela.

Skład wymaga dwóch różnych, znanych, pełnoletnich postaci: mężczyzny i kobiety. Model ustawia mężczyznę w pierwszym slocie, kobietę w drugim. To porządek interfejsu, nie premia ani deklaracja romansu. pairId sortuje ID, więc kolejność kliknięć nie tworzy drugiej kopii relacji.

## Cele i zdolności

S.party.combat przechowuje:
- acted: ID postaci, które zagrały w tej turze;
- taunt: jawne ID źródła i liczbę ładunków;
- guard: jawne ID osłaniającego, ID chronionej postaci i ładunki.

protect(source, target, charges) nie zależy od imion Kaela i Lyry. Podgląd intencji i faktyczne przechwycenie czytają te same cele. „Tarcza i runa” chroni Selene przez Kaela. Zmiana tury czyści listę zagrań; początek walki resetuje statusy, zasoby i zdolności bojowe.

Operacje heal, healAll, addBlock, addBlockAll, resistance, damage i defeated korzystają z identyfikatorów członków drużyny. Odporność jest zaokrąglana osobno dla każdego trafienia, następnie działa Block, potem HP. Osłabienie dotyczy właściciela karty lub obu członków konkretnego duetu.

## Karty

Każda karta ma ownerId albo duoId; actor to wyłącznie etykieta. Talia startowa składa się z 8 kart mężczyzny, 7 kart kobiety i 4 kart współpracy. Własność jest sprawdzana przy zagrywaniu i w nagrodach, również w Akcie III.

Dodano 18 kart bazowych i 18 ulepszonych: 5 Varyna, 4 Selene i po 3 dla każdego nowego duetu. Łącznie jest 56 kart bazowych / 112 wariantów. Każda baza ma własną ilustrację działania; ulepszenie zachowuje ilustrację. Opis ulepszenia podaje aktualne liczby efektów.

Selene leczy tylko raz podczas walki. Splot odnowy nadal daje Block po zużyciu leczenia; przy pełnym HP nie wydaje Run ani ładunku leczenia. Zaćmienie zużywa wyłącznie sparowane zasoby: przy 3 Cienia i 1 Runie pozostają 2 Cienia i 0 Run. Zasadzka i Detonacja zużywają cały właściwy zasób.

## Widoki i wejście do runu

Moduł js/28-roster-game.js obsługuje wybór pojedynczych postaci. Podgląd zmienia tylko lokalny wybór; bieżący run i zapis zostają zastąpione dopiero po naciśnięciu poziomu trudności. Można zamknąć wybór bez utraty podejścia.

Mapa, portrety, HP, zasoby, intencje, mikstury, awanse, wyposażenie, podsumowanie i historia odczytują wybranych bohaterów. Stare identyfikatory DOM, np. kaelField, oznaczają stabilny slot widoku dla animacji; data-hero przechowuje prawdziwe ID. Accessory dawnych nazw statystyk są adapterami slotów, nie drugim stanem ani tożsamością postaci. Nowe mechaniki używają ID.

## Zapisy i migracja

Run zachowuje schema 2 i klucz forbidden_deck_run_v1. Schema 1 migruje do oryginalnego duetu Kael–Lyra. Dotychczasowe zapisy schema 2 bez combat odzyskują stare flagi Prowokacji/Ochrony i zagrania Kaela. Nowy zapis zawiera stan kanoniczny. activeActor jest zapisywany jako null — to chwilowy kontekst obliczeń.

Klucze starego postępu Kaela i Lyry pozostają niezmienione:
- Trust: fd08_trust;
- relacja: forbidden_deck_relationship_v1;
- album: forbidden_deck_companions_v1.

Inne duety używają:
- forbidden_deck_trust_<pairId>;
- forbidden_deck_relationship_v1:<pairId>;
- forbidden_deck_companions_v1:<pairId>.

Ich początkowy postęp jest pusty; nie dziedziczą starych scen, Trust ani wyborów. Odkrycia kart/sprzętu i historia wypraw pozostają wspólne. Historia zapisuje ID i nazwy rzeczywistych członków, zachowując odczyt starych wpisów.

## Rozmowy i zgoda

Trzy nowe duety mają po cztery własne rozmowy na progach 20/40/60/80 Trust i własne reakcje w walce. Nie są podmianą imion w opowieściach Kaela i Lyry. Album pokazuje też osobowości wybranych bohaterów.

Pierwszy wybór jest pamiętany osobno dla pary i sceny. Przyjaźń, opcjonalna bliskość i pominięcie mają identyczną korzyść: +6 Trust i jednorazowo +6 Block dla obojga w następnej walce. Album nie daje korzyści bojowych ani nie nadpisuje decyzji. Rozmowę można zamknąć i wznowić na tej samej kwestii, również po odświeżeniu i zmianie PL/EN. Jeśli wyprawa ruszyła dalej podczas przerwy, dokończenie nie przeskakuje następnego etapu.

Romans wymaga włączenia ustawienia oraz osobnego wyboru, od 40 Trust. Zaufanie ani wybór w innej relacji nie stanowią zgody. Wyłączenie romansu przed zakończeniem cofa wybór do neutralnych opcji. Treść obejmuje flirt, troskę i dobrowolną bliskość, z wygaszeniem sceny; bez graficznych opisów seksu. Wyłączenie ruchu i systemowe ograniczenie animacji są respektowane.

## Weryfikacja i granice

roster-smoke.mjs: cztery składy w trzech aktach, zasoby, leczenie, przechwycenie, wyposażenie, zapis/odczyt, PL/EN oraz 1024×560, 1366×768 i 390×844. Portret nie zasłania HP; podgląd wyboru nie zmienia zapisanego runu.

roster-stories-smoke.mjs: wszystkie 12 rozmów, równoważne ścieżki, brak korzyści za odtwarzanie, zmiana języka, wznawianie i izolacja postępu.

roster-act1-smoke.mjs: rzeczywista ustalona trasa Aktu I na Standardzie każdym duetem. Kontroler używa kart, mikstur, odpoczynku i zdobywanych awansów; nie podnosi HP ani nie osłabia wrogów. Seed 27 jest przypadkiem regresji, nie estymacją win rate ani gwarancją zwycięstwa dla dowolnej talii i trasy.

Starsze testy nadal weryfikują kampanię Kaela i Lyry, bossów, migracje i układ. Samodzielny HTML osadza wszystkie nowe ilustracje, karty i rozmowy; nowy duet działa również bez sieci. Nowi bohaterowie mogą kontynuować w Aktach II/III, ale automatyczny pełny przebieg wszystkich kombinacji dotyczy Aktu I. Dalszy balans i ocena naturalności dialogów wymagają rozgrywek ludzi.
