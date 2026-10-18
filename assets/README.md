# Ilustracje — W świetle ognia / Szlak i bliskość

Obrazy wygenerowano narzędziem OpenAI Image Generation 14 i 15 października 2026 na potrzeby projektu. Nie korzystają z banków zdjęć ani zewnętrznych pakietów graficznych. Portret Lyry powstał z portretem Kaela jako referencją stylu; ognisko i wspólna scena z oboma portretami jako referencjami. Regiony korzystają z pierwszego ogniska jako odniesienia do oprawy. Oryginały PNG pozostają w środowisku roboczym poza repozytorium. Do gry zapisano WebP z jakością 80–82, bez zmiany kompozycji.

| Zasób | Rozmiar obrazu | Rozmiar pliku | Zastosowanie |
| --- | --- | --- | --- |
| `portraits/kael.webp` | 1024 × 1536 | około 159 KB | menu, mapa, profil, dialog |
| `portraits/lyra.webp` | 1024 × 1536 | około 171 KB | menu, mapa, profil, dialog |
| `scenes/campfire.webp` | 1672 × 941 | około 305 KB | tło menu i scena |
| `regions/borderlands.webp` | 1672 × 941 | około 314 KB | mapa i ognisko Pogranicza |
| `regions/tainted-forest.webp` | 1672 × 941 | około 293 KB | mapa i ognisko Skażonego Lasu |
| `regions/ash-citadel.webp` | 1672 × 941 | około 278 KB | mapa i ognisko Cytadeli |
| `scenes/shared-cloak.webp` | 1672 × 941 | około 199 KB | wybrane romantyczne zakończenia scen 40/60 Trust |

## Specyfikacja postaci i oprawy

- **Kael, 32 lata**, fikcyjny dorosły obrońca: ciemne falowane włosy, krótka broda, piwne oczy, drobna blizna przy brwi, stalowy pancerz i bordowy płaszcz. Spokojny, uważny wyraz twarzy.
- **Lyra, 29 lat**, fikcyjna dorosła łuczniczka: miedziane włosy z warkoczem, piegi, szarozielone oczy, skórzany pancerz i chłodny zielony płaszcz. Samodzielna, przenikliwa, lekko rozbawiona.
- **Ognisko**: dwa miejsca odpoczynku wśród ruin, ciepły bursztynowy ogień i chłodny las o zmierzchu. Bez postaci, żeby wspólne portrety i dialog mogły opowiadać różne warianty tej samej sceny.
- Malarskie dark fantasy, czytelne twarze, ciepłe światło na chłodnym tle. Postacie są w pełni ubrane; ilustracje nie przedstawiają czynności seksualnych.
- Wspólna scena przedstawia Kaela (32 lata) i Lyrę (29 lat), w ubraniu, pod jednym płaszczem, z dłońmi splecionymi przy ogniu. Jest widoczna wyłącznie po opcjonalnym wyborze bliskości.

## Pochodzenie i warunki użycia

Zasoby są wynikami generowania dla właściciela projektu, a nie materiałami na licencji stock lub Creative Commons. Korzystanie z wyników generowania podlega [warunkom OpenAI](https://openai.com/policies/terms-of-use/). Nie deklarujemy wyłączności ani odrębnej licencji CC. Repozytorium nie zawiera ogólnego pliku `LICENSE`; ta iteracja nie wprowadza licencji dla całego projektu.

Wszystkie obrazy są lokalne. Ich brak pozostawia czytelny tekst i działające przyciski; załadowanie obrazu nie jest warunkiem ukończenia sceny.

## V0.9.3 — Wspólne chwile (17 października 2026)

- `scenes/bread-at-dawn.webp`: nowa ilustracja przyjacielskiego śniadania Kaela i Lyry na moście (1672 × 941, około 278 KB).
- `portraits/expressions.webp`: atlas 3 × 2, trzy wyrazy twarzy każdego bohatera (1536 × 1024, około 283 KB). Górny rząd: Kael; dolny: Lyra. Kolumny: skupienie, uśmiech, niepokój. Kadry są wybierane przez CSS, bez dodatkowego przetwarzania twarzy.

Oba obrazy powstały w OpenAI Image Generation z `scenes/shared-cloak.webp` jako referencją tożsamości i stylu. Wykorzystano wbudowane narzędzie, bez wywołań API i bez zasobów stock. PNG przekonwertowano do WebP, bez zmiany kompozycji. [Prompty](living-companions-prompts.md). Warunki użycia i brak deklaracji wyłączności pozostają jak wyżej.

Efekty kamery/światła i przełączanie portretów są prezentacją ilustracji w CSS. Ta iteracja nie zawiera generowanych filmów ani animacji ust.

## V0.9.4

Atlasy przeciwników i przedmiotów oraz most: [pochodzenie, ścieżki i pełne prompty](bilingual-world-prompts.md). Wbudowany imagegen, referencja panoramy Pogranicza, WebP quality=83.

## V0.9.6

38 ilustracji działań kart, trzy atlasy; [pełne prompty, ścieżki i pochodzenie](card-art-prompts.md). Wbudowany imagegen, referencja tożsamości Kaela i Lyry, WebP quality=85.
