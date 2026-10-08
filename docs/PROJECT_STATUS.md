# Project Status — V0.9

## Pętla runu

Ekran tytułowy → wybór runu → mapa → walka / wydarzenie / ognisko / sklep / elita → nagroda → rozwój → boss → kolejny akt → podsumowanie → historia wypraw.

## Bohaterowie

### Kael
- osobne HP,
- Block,
- Prowokacja,
- Ochrona Lyry,
- Momentum,
- odporności wynikające z pancerza i amuletu.

### Lyra
- osobne HP,
- własny Block/unik,
- Marked,
- ataki dystansowe,
- częstszy cel skrytobójców.

### Duo
- Trust zachowywany między runami,
- Synergy budowane podczas walki,
- karty współpracy odblokowywane wraz z Trust,
- cztery kamienie milowe relacji: 20 / 40 / 60 / 80 Trust,
- trwała pamięć wyborów relacyjnych i krótkie premie taktyczne do kolejnej walki.

## Walka

- kilka przeciwników naraz,
- wybór celu,
- intencje przeciwników,
- realny podgląd spodziewanej straty HP po odporności i Blocku,
- jawne ostrzeżenie o atakach ignorujących Prowokację/Ochronę,
- fizyczne, magiczne i toksyczne obrażenia,
- krwawienie, trucizna, podpalenie i osłabienie,
- skrytobójcy i przeciwnicy wsparcia,
- boczny dziennik walki,
- animacje kart, obrażeń, Blocku, leczenia i combo.

## Talia i wyposażenie

- nagrody kart po walkach,
- ulepszanie kart przy ognisku,
- usuwanie kart w sklepie,
- podgląd talii / draw pile / discard pile,
- pancerze i amulety,
- mikstury,
- odporności i sprzęt zdobywany po elitach.

## Akty

### Akt I — Pogranicze
Boss: Strażniczka Pogranicza + Zaklinaczka.

### Akt II — Skażony Las
Statusy, mieszane grupy przeciwników i Królowa Cierni.

### Akt III — Cytadela Popiołu
Własny biom, przygotowanie przed wejściem, nowe archetypy wrogów i Królowa Popiołu z dwiema fazami. Standard został sprawdzony automatycznie trzema archetypami talii: Obrona / Statusy / Duo.

## Meta-progresja

- zapis bieżącego runu w localStorage,
- `Kontynuuj run`,
- Codex odkrytych kart i wyposażenia,
- historia do 10 ostatnich wypraw,
- pamięć pokonanych bossów,
- rozpoznawanie ogólnego archetypu buildu,
- bez trwałych bonusów statystyk za grind.

## UI i onboarding

- ekran tytułowy,
- Codex,
- ekran Relacja Kael–Lyra,
- Historia wypraw,
- pełne podsumowanie zwycięstwa/porażki,
- kontekstowy tutorial pierwszego runu: Trust, typy obrażeń, Prowokacja/Ochrona, Marked, Momentum i Synergy,
- możliwość wyłączenia/resetu podpowiedzi.

## Testy

GitHub Actions uruchamia grę w Chromium i sprawdza regresyjnie:

- start / menu / Codex / pierwszą walkę,
- zapis i kontynuację,
- Akt III i zmianę faz bossa,
- trzy różne buildy przeciw Królowej Popiołu,
- historię runów,
- progres relacji Trust,
- podgląd intencji i obrażeń,
- tutorial kontekstowy.

## Aktualny kierunek do V1.0

1. balans ekonomii i długości runu,
2. balans trzech poziomów trudności,
3. tożsamość i kompromisy ekwipunku,
4. czytelność mapy,
5. rarity i lepsze ważenie nagród,
6. accessibility / ergonomia,
7. dalszy visual/audio polish,
8. eksport/import zapisu i przygotowanie desktopowe.
