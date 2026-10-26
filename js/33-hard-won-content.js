(()=>{
 const pairs={
  'kael+lyra':[
   'Lyra: Po tamtej walce sprawdzałam, czy nadal słyszę twoje kroki. Nawet kiedy szedłeś obok.',
   'Kael: Ja liczyłem nasze oddechy. Dwa. Dzisiaj to wystarczy.'
  ],
  'kael+selene':[
   'Selene: Przy ogniu ręce znowu mi drżą. W walce potrafiłam je uspokoić.',
   'Kael: Nie musisz teraz niczego naprawiać. Potrzymam kubek, jeśli chcesz.'
  ],
  'lyra+varyn':[
   'Varyn: Mogę obejść obóz. Sprawdzić, czy nikt za nami nie szedł.',
   'Lyra: Za chwilę. Najpierw usiądź tam, gdzie cię widzę. Po tamtej walce potrzebuję czegoś więcej niż śladów.'
  ],
  'selene+varyn':[
   'Varyn: Chciałem zażartować, że wszystko było pod kontrolą. Nie przechodzi mi przez gardło.',
   'Selene: To nie żartuj. Ja też się bałam. Możemy przez chwilę po prostu posiedzieć.'
  ]
 };
 const english=[
  'Lyra: After that fight I kept checking whether I could still hear your footsteps. Even when you walked beside me.',
  'Kael: I was counting our breaths. Two. Today that is enough.',
  'Selene: My hands are shaking again by the fire. In the fight I could steady them.',
  'Kael: You do not have to fix anything now. I can hold the cup, if you want.',
  'Varyn: I could walk around the camp. Check that nobody followed us.',
  'Lyra: In a moment. First sit where I can see you. After that fight I need more than tracks.',
  'Varyn: I wanted to joke that everything was under control. The words will not come.',
  'Selene: Then do not joke. I was scared too. We can just sit here for a while.'
 ];
 Object.values(pairs).flat().forEach((line,i)=>ForbiddenDeckEnglish[line]=english[i]);
 ForbiddenDeckEnglish['Po trudnym zwycięstwie']='After a hard-won victory';
 const responses={
  'kael+lyra':[
   ['Kael: Jutro idziemy wolniej. Chcę słyszeć, kiedy potrzebujesz przerwy.','Kael: Tomorrow we go slower. I want to hear when you need a break.','Lyra: To słuchaj także wtedy, gdy będę udawała, że wszystko dobrze. Znam ten swój głupi uśmiech.','Lyra: Then listen even when I pretend I am fine. I know that stupid smile of mine.','Lyra zwalnia przy stromym podejściu. Tym razem nie musi wymyślać powodu, żeby Kael zaczekał.','Lyra slows on the steep climb. This time she does not need an excuse for Kael to wait.'],
   ['Lyra: Nie obiecuj, że nic nam nie grozi. Powiedz mi, kiedy się boisz.','Lyra: Do not promise we are safe. Tell me when you are afraid.','Kael: Teraz. Boję się teraz. Dziwnie powiedzieć to bez rozkazu na końcu.','Kael: Now. I am afraid now. Strange to say that without an order at the end.','Kael przyznaje, że nie podoba mu się następny odcinek szlaku. Lyra rozkłada mapę, zamiast go uspokajać.','Kael admits he dislikes the next stretch of trail. Lyra unfolds the map instead of reassuring him.']
  ],
  'kael+selene':[
   ['Selene: Potrzymaj. Tylko nie patrz na mnie jak na pęknięte szkło.','Selene: Hold it. Just do not look at me like cracked glass.','Kael: Dobrze. A ty powiedz, kiedy oddać. Nie zamierzam przejąć twojego życia razem z kubkiem.','Kael: All right. Tell me when to give it back. I am not taking over your life along with the cup.','Przy następnym postoju Kael pyta, zanim weźmie torbę Selene. Jej krótkie „tak” nie brzmi już jak przeprosiny.','At the next stop Kael asks before taking Selene\'s bag. Her brief yes no longer sounds like an apology.'],
   ['Selene: Zostaw kubek. Opowiedz mi coś zwyczajnego, żebym mogła tu wrócić.','Selene: Leave the cup. Tell me something ordinary so I can come back here.','Kael: Przypaliłem owsiankę. Znowu. Możesz być na mnie zła, kiedy przestaniesz się trząść.','Kael: I burned the porridge. Again. You can be angry with me once you stop shaking.','Zapach kolacji wywołuje u Selene podejrzliwe spojrzenie. Kael pokazuje cały garnek: tym razem nic nie przywarło.','The smell of supper earns a suspicious look from Selene. Kael shows her the pot: nothing stuck this time.']
  ],
  'lyra+varyn':[
   ['Varyn: Zostanę. Ale pozwól mi siedzieć twarzą do ścieżki.','Varyn: I will stay. But let me face the path.','Lyra: Możesz patrzeć. Nie musisz od razu znikać. Przesunę się trochę.','Lyra: You can watch. You do not have to disappear right away. I will move over.','Lyra zostawia obok siebie miejsce z widokiem na szlak. Varyn siada bez wymówki o sprawdzaniu obozu.','Lyra leaves a place beside her facing the trail. Varyn sits without an excuse about checking the camp.'],
   ['Lyra: Obejdziemy obóz razem. Cisza teraz za dużo mi przypomina.','Lyra: We can walk around the camp together. The silence reminds me of too much right now.','Varyn: Dobrze. Żadnego znikania między drzewami. Dzisiaj nawet ja mam dość własnego towarzystwa.','Varyn: All right. No vanishing between trees. Today even I have had enough of my own company.','Przed obchodem Varyn zatrzymuje się przy Lyrze i czeka na jej odpowiedź. Nie zakłada już, że woli zostać sama.','Before his round Varyn stops beside Lyra and waits for her answer. He no longer assumes she prefers to be alone.']
  ],
  'selene+varyn':[
   ['Varyn: Zostań. Nie mam dziś siły zasługiwać na to towarzystwo.','Varyn: Stay. I do not have the strength to earn your company today.','Selene: Dobrze się składa. Nie prowadzę rachunku. Przysuń tylko koc, bo marznę.','Selene: Good timing. I am not keeping score. Just move the blanket over; I am cold.','Varyn podaje Selene koc bez żartu o długu. Ona robi mu miejsce, nie pytając, czym zamierza się odwdzięczyć.','Varyn passes Selene the blanket without a joke about debt. She makes room without asking how he plans to repay her.'],
   ['Selene: Możesz żartować później. Teraz powiedz, co było najgorsze.','Selene: You can joke later. Now tell me what was worst.','Varyn: Ta sekunda, kiedy cię nie widziałem. Wiem, gdzie ukryć nóż. Z tym nie wiedziałem, co zrobić.','Varyn: That second when I could not see you. I know where to hide a knife. I did not know what to do with that.','Gdy Selene schodzi po wodę, mówi Varynowi, dokąd idzie. On przyznaje, że to pomaga, zamiast obracać ulgę w żart.','When Selene goes for water, she tells Varyn where she is going. He admits it helps instead of turning relief into a joke.']
  ]
 };
 window.ForbiddenDeckHardWonResponses=Object.fromEntries(Object.entries(responses).map(([id,rows])=>[id,rows.map(row=>{
  for(let i=0;i<row.length;i+=2)ForbiddenDeckEnglish[row[i]]=row[i+1];
  return {label:row[0],reply:row[2],echo:row[4]};
 })]));
 ForbiddenDeckEnglish['Bez premii. Odpowiedź zostanie zapamiętana.']='No bonus. Your answer will be remembered.';
 ForbiddenDeckEnglish['Możesz odpowiedzieć teraz albo wrócić do rozmowy przy kolejnym ognisku.']='You can answer now or return to this conversation at the next campfire.';
 window.ForbiddenDeckHardWonData=pairs;
})();
