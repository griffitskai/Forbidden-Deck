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
 window.ForbiddenDeckHardWonData=pairs;
})();
