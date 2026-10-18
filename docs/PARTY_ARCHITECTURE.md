# Model postaci i drużyny — etap 1, V0.9.8

## Źródło prawdy

`js/00-party.js` ładuje się przed danymi gry. `ForbiddenDeckParty.characters` zawiera niezmienne definicje postaci: ID, imię, płeć, pełnoletniość, klasę, bazowe HP, portret, zasób, początkowy pancerz i osobistą talię. Osobny katalog `duos` przechowuje skład, wspólne karty startowe i identyfikator relacji. Jedyny wydany zestaw to nadal Kael + Lyra.

Bieżące dane bohaterów są w jednym miejscu:

```js
S.party = {
  schema: 1,
  relationshipId: 'kael+lyra',
  members: [
    {id: 'kael', hp: 48, maxHp: 48, block: 0,
     status: {bleed: 0, poison: 0, burn: 0, weak: 0},
     resources: {momentum: 0}, equipment: {armor: 'ironArmor'}},
    {id: 'lyra', hp: 38, maxHp: 38, block: 0,
     status: {bleed: 0, poison: 0, burn: 0, weak: 0},
     resources: {}, equipment: {armor: null}}
  ],
  equipment: {amulet: 'arcaneCharm'}
};
```

Pancerz jest przypisany do postaci, amulet nadal chroni całą drużynę. Energia, Synergy, Trust, historia trasy i talia runu pozostają wspólne. Nie zmieniono ekonomii ani reguł istniejącego wyposażenia: Lyra rozpoczyna bez pancerza, a ekran ekwipunku nadal obsługuje dotychczasowe sloty.

## Reguły składu i talii

- Dwie różne, znane, pełnoletnie postacie: jedna męska, jedna żeńska.
- Kanoniczna kolejność modelu to mężczyzna, kobieta, niezależnie od kolejności wyboru. Nie jest to bonus statystyk ani automatyczna deklaracja romansu.
- `pairId(ids)` sortuje stabilne ID; `kael+lyra` jest tym samym duetem niezależnie od kolejności kliknięć. Ten identyfikator jest podstawą przyszłego rozdzielenia historii relacji.
- Talia startowa składa się z dwóch osobistych talii oraz kart danego duetu. Obecny skład daje dokładnie te same 19 kart w tej samej kolejności.
- Każda z 76 definicji kart ma `ownerId` albo `duoId`. `actor` pozostaje etykietą prezentacji; nie służy do własności, Osłabienia i naprzemiennego budowania Synergy.
- `playable()` i obie ścieżki nagród (zwykła i Akt III) sprawdzają zgodność karty ze składem. Niezgodne karty nie stają się grywalne ani nie trafiają do puli nagród.
- Talia dla nieopisanego duetu kończy się jawnym błędem, zamiast otrzymać karty Kaela i Lyry.

## Zintegrowane operacje

`member(id)`, `heal`, `healAll`, `addBlock`, `addBlockAll`, `defeated`, `resistance`, `damage` i `damagePreview` korzystają z danych członków drużyny. Leczenie miksturą buduje wybór z członków drużyny. Regeneracja po walce, obozy i przejścia aktów korzystają ze wspólnego API. Statusy są przypisane do postaci i rozpatrywane dla członków drużyny. Obrażenia zachowują dotychczasową kolejność: odporność zaokrąglana osobno dla każdego trafienia → Block → HP.

`lastActor` i `activeActor` przechowują ID postaci albo `duo:<pairId>`. Stare etykiety `Kael`, `Lyra`, `Duo` są zamieniane podczas migracji. `activeActor` jest chwilowym kontekstem obliczeń; zapisywany jest jako `null`, aby nie odtworzyć przerwanego efektu karty.

## Migracja i zgodność

Klucz `forbidden_deck_run_v1` pozostaje ten sam, ale payload otrzymuje `schema: 2`. Odczyt akceptuje stare `schema: 1` i nowy format. Płaskie HP, Block, statusy, Momentum i wyposażenie starego zapisu trafiają do `party`; pozostała talia, trasa i stan walki są zachowane. Zapis po wczytaniu jest już w formacie 2.

Stare nazwy `S.kaelHp`, `S.lyraBlock`, `S.heroStatus`, `S.momentum` i `S.equipment` są nieenumerowalnymi accessorami, a nie kopią wartości. Sceny, animacje i obecny HUD czytają te same dane co nowy model. Zapis JSON zawiera wyłącznie stan kanoniczny. Reset runu podmienia drużynę, a accessory nadal wskazują nową drużynę.

Metadane odkrytych kart i sprzętu zachowują niezależne `schema: 1`. Nie zmieniono zapisów historii, Trust, romansu ani albumu. Nieznany numer formatu lub nieznana postać nie są po cichu zamieniane na Kaela i Lyrę. Nieudany odczyt nie usuwa takiego zapisu.

## Granica tej iteracji i dalsza rozbudowa

To fundament domeny i migracji, nie gotowy ekran wyboru czterech postaci. Testowe definicje magini i skrytobójcy istnieją wyłącznie w testach. Nie są publikowaną zawartością i nie mają zastępczych kart, portretów ani scen.

Przed udostępnieniem innych składów trzeba jeszcze:

1. Dodać pełne definicje, karty, zasoby i ilustracje nowych postaci oraz talie każdego wspieranego duetu.
2. Zastąpić adaptery HUD i animacji widokami generowanymi z postaci. Przenieść specyficzne haki Kaela (`lastKaelThisTurn`, Prowokacja, Ochrona) do opisanych zdolności i celów; obecne karty nadal świadomie opisują jego i Lyrę.
3. Rozdzielić globalny postęp Trust, relacji i albumu według `relationshipId`, migrując obecny postęp wyłącznie do Kael–Lyra. Samo dodanie ID nie wykonuje tej migracji.
4. Przypisać dialogi, reakcje i sceny do konkretnych bohaterów i duetów, zamiast podmieniać imiona w obecnych opowieściach.
5. Dopiero wtedy udostępnić wybór postaci przed nowym runem i przejść wszystkimi czterema kombinacjami pierwszy akt.

## Testy

`tests/party-model.mjs`: cztery kombinacje na definicjach testowych, zasada składu, odwrócona kolejność wyboru, własność kart, osobiste statystyki, leczenie, obrażenia, sprzęt, serializacja i migracja.

`tests/party-foundation-smoke.mjs`: prawdziwy zapis schema 1 wczytany w przeglądarce, zachowanie stanu, format 2 po migracji, ponowne wczytanie, reset, własność nagród, PL/EN i brak usuwania przyszłych lub nieobsługiwanych zapisów.

`tests/fixtures/v097-party-run.json` pochodzi z uruchomienia oryginalnego kodu V0.9.7 (`a256514c8a60915a0b22720d088a8f1dae8e4d8d`). Przed zapisem ustawiono jawny stan środkowej walki (zranienia, ulepszone HP, statusy, Momentum, sprzęt i rękę), a payload wygenerował stary `ForbiddenDeckSave.save`. Nie zawiera danych osobowych ani sekretów.

Istniejące testy regresyjne nadal sprawdzają walkę, bossów Standard, przejścia aktów, relacje, ilustracje, układ bez przewijania, lokalizację i działanie offline. Testy przyszłych kombinacji są dowodem działania modelu danych, nie balansu nowych bohaterów ani kompletności ich kampanii.
