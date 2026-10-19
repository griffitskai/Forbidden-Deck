/* Dialogue data: scenes are optional, platonic and give no combat rewards. */
window.ForbiddenDeckStories=[
 {id:'bread',title:'Okruchy świtu',subtitle:'Zanim staną się bohaterami, muszą nauczyć się dzielić śniadanie.',place:'Pogranicze · pierwszy poranek',art:'assets/scenes/bread-at-dawn.webp',condition:'Dostępne od początku',opening:[
  ['Lyra','warm','Rozbawiona','Jeśli jeszcze raz powiesz „zjemy po następnym wzgórzu”, będę musiała zjeść ciebie.','Łamie chleb na dwie nierówne części. Większą bez słowa podaje Kaelowi.'],
  ['Kael','concerned','Zaskoczony','Dlaczego dostałem większą?','Patrzy na chleb, jakby nie był pewien, kiedy ostatnio ktoś pomyślał o nim pierwszy.'],
  ['Lyra','warm','Ciepła','Bo od rana burczy ci w brzuchu. Trudno mi nasłuchiwać niebezpieczeństwa.','Kael siada obok. Następne wzgórze może zaczekać.']
 ],question:'O co chcesz ją zapytać?',options:[
  {id:'home',label:'Co zrobisz, gdy skończy się ta droga?',hint:'Poznaj jej zwykłe marzenie.',lines:[
   ['Lyra','focused','Zamyślona','Otworzę piekarnię. Nie śmiej się. Chcę raz obudzić się, zanim ktoś zacznie na mnie polować.','Przesuwa kciukiem po skórce chleba. Tym razem nie ukrywa powagi za żartem.'],
   ['Kael','warm','Łagodny','W takim razie nauczę się przynosić drewno, zanim poprosisz.','Przez chwilę przyszłość nie przypomina kolejnego pola walki.']]},
  {id:'quiet',label:'Zostańmy tu jeszcze chwilę.',hint:'Nie każda bliskość potrzebuje wyznania.',lines:[
   ['Kael','warm','Spokojny','Następne wzgórze poczeka. Chciałbym usłyszeć rzekę.','Zdejmuje rękawicę. Po raz pierwszy tego ranka niczego nie trzyma w dłoni.'],
   ['Lyra','warm','Rozluźniona','Dobrze. Ale następne śniadanie organizujesz ty.','Siedzą, aż chleb znika, a zimne kamienie mostu nagrzewają się od słońca.']]}]},
 {id:'shield',title:'Rysa na tarczy',subtitle:'Pamiętają cios, który nie dosięgnął Lyry.',place:'Na skraju szlaku · po walce',art:'assets/regions/borderlands.webp',condition:'Przechwyć atak wymierzony w Lyrę',opening:[
  ['Lyra','concerned','Przejęta','Mogłeś powiedzieć, że boli.','Palcem zatrzymuje się nad świeżym wgnieceniem tarczy. Nie dotyka go.'],
  ['Kael','focused','Uparty','Mogłem. Ale wtedy musiałbym przestać udawać, że to był plan.','Próbuje wzruszyć ramionami i od razu tego żałuje.']
 ],question:'Jak przyjmiesz jej troskę?',options:[
  {id:'honest',label:'Bolało. Dobrze, że jesteś.',hint:'Pozwól mu przyznać się do słabości.',lines:[
   ['Kael','concerned','Szczery','Bolało. Przez moment nie wiedziałem, czy zdążę. Dobrze, że już jest po wszystkim.','Słowa przychodzą mu trudniej niż podniesienie tarczy.'],
   ['Lyra','warm','Uważna','Następnym razem nie dźwigaj tego sam. Mnie też można zaufać.','Zaciska poluzowany pasek jego pancerza. Dopiero potem wracają na szlak.']]},
  {id:'humour',label:'Tarcza ma teraz więcej charakteru.',hint:'Wspólny żart zamiast udawanej niezwyciężoności.',lines:[
   ['Kael','warm','Rozbawiony','Tarcza ma teraz więcej charakteru. Ja podobno też.','Lyra obraca tarczę. Przez chwilę ogląda ją z przesadną powagą.'],
   ['Lyra','warm','Zaczepna','Tarczy łatwiej to wybaczyć. Chodź, bohaterze. Dziś ja niosę zapasy.','Tym razem Kael nie protestuje.']]}]},
 {id:'cups',title:'Dwa kubki',subtitle:'Mały rytuał po pierwszej wspólnie wygranej walce.',place:'Przy ogniu · po starciu',art:'assets/scenes/campfire.webp',condition:'Wygraj jedną walkę',opening:[
  ['Kael','focused','Zaciekawiony','Zawsze nosisz dwa?','Lyra ustawia przy ogniu dwa poobijane kubki.'],
  ['Lyra','concerned','Ostrożna','Jeden był mojego brata. Nadal zabieram go w drogę.','Kael czeka. Po raz pierwszy nie próbuje od razu znaleźć właściwej odpowiedzi.'],
  ['Lyra','warm','Ciepła','Żyje. Prowadzi karczmę i uważa, że powinnam znaleźć porządne zajęcie.','Uśmiech wraca powoli, ale zostaje na dłużej.']
 ],question:'Co odpowiesz?',options:[
  {id:'visit',label:'Może kiedyś go odwiedzimy.',hint:'Daj im wspólny punkt na mapie przyszłości.',lines:[
   ['Kael','warm','Zaciekawiony','Może kiedyś go odwiedzimy. Chciałbym usłyszeć jego wersję twoich przygód.','Lyra nalewa do drugiego kubka, zanim Kael zdąży zapytać.'],
   ['Lyra','warm','Rozbawiona','W takim razie musimy wrócić. Sama nie zamierzam się z niego tłumaczyć.','Nie jest to przysięga. Na tę noc wystarcza jako plan.']]},
  {id:'listen',label:'Opowiedz o nim coś jeszcze.',hint:'Zainteresuj się jej życiem poza walką.',lines:[
   ['Kael','focused','Uważny','Jaka jest ta karczma?','Przysuwa własny kubek i pozwala jej mówić.'],
   ['Lyra','warm','Rozmarzona','Krzywe schody. Zupa, która nigdy się nie kończy. I drzwi, których nie trzeba ryglować w dzień.','Gdy kończy opowiadać, herbata już wystygła. Żadnemu z nich to nie przeszkadza.']]}]},
 {id:'fear',title:'Zanim wróci oddech',subtitle:'O tym, czego nie widać w pasku życia.',place:'Pod drzewami · chwila ciszy',art:'assets/regions/tainted-forest.webp',condition:'Przeżyj cios, po którym bohaterowi zostaje najwyżej 30% HP',opening:[
  ['Lyra','concerned','Zaniepokojona','Daj mi chwilę. Ręce jeszcze mi drżą.','Odkłada łuk. Kael odwraca tarczę, żeby mieć na nią oparcie.'],
  ['Kael','concerned','Przejęty','Mnie też. Myślałem, że kiedyś przestanie.','Między drzewami słychać krople spadające z liści.']
 ],question:'Jak dadzą sobie tę chwilę?',options:[
  {id:'breathe',label:'Nie musimy teraz być odważni.',hint:'Zostań przy nich bez szukania rozwiązania.',lines:[
   ['Kael','warm','Łagodny','Nie musimy teraz być odważni. Posiedzę tutaj.','Nie odlicza czasu. Nie sprawdza traktu.'],
   ['Lyra','warm','Spokojniejsza','Dziękuję, że nie mówisz „nic się nie stało”.','Jeszcze nie wstają, ale oddech przestaje się rwać.']]},
  {id:'ritual',label:'Policzmy pięć rzeczy, które słyszymy.',hint:'Wróćcie uwagą do świata wokół.',lines:[
   ['Kael','focused','Skupiony','Woda. Wiatr. Twój płaszcz. Moja nieszczęsna zbroja...','Lyra czeka na piąty dźwięk.'],
   ['Lyra','warm','Rozluźniona','I mój śmiech. To już pięć.','Miejsce nadal jest obce. Siedząca obok osoba — trochę mniej.']]}]},
 {id:'gate',title:'Po drugiej stronie bramy',subtitle:'Zwycięstwo ma znaczenie, gdy jest z kim o nim porozmawiać.',place:'Za bramą Pogranicza · po bossie',art:'assets/regions/borderlands.webp',condition:'Pokonaj bossa Aktu I',opening:[
  ['Lyra','focused','Zamyślona','Myślałam, że po drugiej stronie będzie inaczej.','Za bramą nadal wieje ten sam chłodny wiatr.'],
  ['Kael','warm','Zmęczony','Jest. Po tej stronie znam już kogoś, kto nie zostawia mnie za sobą.','Siada na stopniu. Tym razem nie próbuje ukryć zmęczenia.']
 ],question:'Co zabiorą ze sobą dalej?',options:[
  {id:'promise',label:'Wracamy także dla tych, którzy na nas czekają.',hint:'Przypomnij im dom i ich zwykłe plany.',lines:[
   ['Kael','focused','Szczery','Nie chcę, żeby nasza historia kończyła się na kolejnej bramie.','Patrzy na okruszki, które zostały przy klamrze jej pasa.'],
   ['Lyra','warm','Pełna nadziei','To dobrze. Mam jeszcze wiele rzeczy do zrobienia. Ty chyba też.','Ruszają, kiedy oboje są gotowi. Nikt nie musi nikogo wołać.']]},
  {id:'rest',label:'Dziś wystarczy, że dotarliśmy tutaj.',hint:'Pozwól im cieszyć się małym zwycięstwem.',lines:[
   ['Kael','warm','Spokojny','Możemy choć raz przestać myśleć o następnej walce?','Lyra opiera łuk o mur i siada obok.'],
   ['Lyra','warm','Rozbawiona','Możemy. Ale jeśli zaśniesz, nie będę niosła tej zbroi.','Kael przymyka oczy. Po chwili słyszy, że ona też się śmieje.']]}]}
];

// Deeper exchanges after the player chooses a topic; no new rewards.
(()=>{const exchanges={"bread": [["Kael", "focused", "Uważny", "Piekarnia to plan czy odpowiedź, którą dajesz ludziom, żeby przestali pytać?", "Przez chwilę obraca w dłoniach kawałek chleba."], ["Lyra", "concerned", "Szczera", "Trochę jedno i drugie. Nie wiem nic o prowadzeniu piekarni. Ale wiem, jak powinien pachnieć dom. Od tego mogę zacząć.", "Patrzy w stronę rzeki, zanim odpowie."]], "shield": [["Lyra", "focused", "Stanowcza", "Kiedy mówisz „nic mi nie jest”, odbierasz mi wybór. Zostaje mi patrzeć, jak zaciskasz zęby, i udawać, że wierzę.", "Odkłada tarczę, żeby nie oddzielała ich podczas rozmowy."], ["Kael", "concerned", "Szczery", "Wiem, co zrobić z tarczą. Z czyjąś troską radzę sobie gorzej. Pasek pod ramieniem — nie dosięgam go. Pomożesz?", "Po raz pierwszy wskazuje miejsce, które naprawdę boli."]], "cups": [["Lyra", "concerned", "Zamyślona", "Piszę do niego listy, których nie wysyłam. W każdym zapewniam, że wszystko dobrze. Może dlatego zostają w torbie.", "Dotyka klapy torby, w której trzyma listy."], ["Kael", "warm", "Uważny", "Napisz, że herbata była kiepska. To przynajmniej będzie prawda. Resztę możesz dopisać jutro.", "Krzywi się po następnym łyku. Tym razem rozśmiesza ich oboje."]], "fear": [["Kael", "concerned", "Szczery", "Najgorzej jest potem. W walce wiem, co robić. Potem przypominam sobie wszystkie rzeczy, których nie zdążyłem zauważyć.", "Opiera dłonie na kolanach. Nadal lekko drżą."], ["Lyra", "concerned", "Uważna", "Nie każ mi teraz szukać w tym lekcji. Wiem, że chciałbyś coś naprawić. Wystarczy, że nie będziesz mnie poganiał.", "Przysuwa łuk bliżej, ale jeszcze go nie podnosi."]], "gate": [["Lyra", "focused", "Szczera", "Boję się, że przyzwyczaję się do ciebie. A potem powiesz, że twoja droga prowadzi gdzie indziej, jakby chodziło o pogodę.", "Nie patrzy na drogę. Tym razem czeka na odpowiedź."], ["Kael", "concerned", "Szczery", "Nie wiem jeszcze, dokąd prowadzi. Ale jeśli będę chciał odejść, usiądę i ci powiem. Nie zostawię cię z pustym miejscem przy ogniu.", "Przesuwa się na stopniu, robiąc jej miejsce obok."]]};for(const scene of window.ForbiddenDeckStories){for(const option of scene.options){option.lines.push(...exchanges[scene.id]);}}})();
