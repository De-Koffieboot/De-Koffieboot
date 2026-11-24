// Verhaallaag: hoofdstukken met titel, daarna een tekstvak dat per stap groeit terwijl de camera meebeweegt.
// Gebruikt alleen window.koffieboot (scène) en de bestaande camerastand-knoppen, dus werkt ook met een nieuwere scène.
(function(){
 const $=s=>document.querySelector(s);
 const views=$('#views');

 // --- iconen: wit pictogram op blauw vierkant met witte rand (Art Direction, stijlblad) ---
 const kader='<rect x="3" y="3" width="90" height="90" rx="10" fill="#1d3f87" stroke="#fff" stroke-width="4"/>';
 const ico=(inner)=>'<svg viewBox="0 0 96 96" aria-hidden="true">'+kader+inner+'</svg>';
 const IC={
  pont:ico('<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 52h64l-6 12H22z" fill="#fff"/><path d="M34 52V40h28v12"/><path d="M42 40v-7h12v7"/><path d="M16 74c6-4 10-4 16 0s10 4 16 0 10-4 16 0 10 4 16 0"/></g>'),
  brood:ico('<path d="M18 58c0-14 13-24 30-24s30 10 30 24c0 6-5 8-10 8H28c-5 0-10-2-10-8z" fill="#fff"/><g stroke="#1d3f87" stroke-width="4.5" stroke-linecap="round"><path d="M34 44l-4 12"/><path d="M50 42l-4 14"/><path d="M66 44l-4 12"/></g>'),
  koffie:ico('<path d="M24 44h40v8c0 11-9 18-20 18s-20-7-20-18z" fill="#fff"/><path d="M64 48h4a8 8 0 0 1 0 16h-6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M20 76h50" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M36 36c-4-5 4-8 0-14"/><path d="M48 36c-4-5 4-8 0-14"/></g>'),
  loket:ico('<path d="M16 22h64l-6 14H22z" fill="#fff"/><g stroke="#1d3f87" stroke-width="5"><path d="M33 23l-3 12"/><path d="M48 23v12"/><path d="M63 23l3 12"/></g><rect x="24" y="42" width="48" height="24" rx="2" fill="none" stroke="#fff" stroke-width="5"/><path d="M18 74h60" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'),
  blijven:ico('<path d="M14 30c12 16 22 20 34 20s22-4 34-20" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><g fill="#fff"><circle cx="24" cy="44" r="6"/><circle cx="40" cy="52" r="6"/><circle cx="56" cy="52" r="6"/><circle cx="72" cy="44" r="6"/></g><path d="M20 76h56" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M30 76v-8M48 76v-8M66 76v-8" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'),
  zwemmen:ico('<circle cx="62" cy="32" r="7" fill="#fff"/><path d="M24 54l16-14 14 8 10-4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 66c6-4 10-4 16 0s10 4 16 0 10-4 16 0 10 4 16 0M16 78c6-4 10-4 16 0s10 4 16 0 10-4 16 0 10 4 16 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'),
  // nieuwe iconen in dezelfde stijl (eerste schetsen)
  ijs:ico('<path d="M34 46h28L48 80z" fill="#fff"/><circle cx="48" cy="36" r="14" fill="#fff"/><path d="M40 52l8 20M56 52l-8 20" stroke="#1d3f87" stroke-width="3.5" stroke-linecap="round"/>'),
  maaltijd:ico('<path d="M20 48h56v6c0 12-10 20-28 20S20 66 20 54z" fill="#fff"/><path d="M28 48c0-8 6-14 20-14s20 6 20 14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M38 28c-3-4 3-6 0-10M52 28c-3-4 3-6 0-10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'),
  broodje:ico('<path d="M18 46c0-10 13-16 30-16s30 6 30 16z" fill="#fff"/><path d="M18 54h60" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M20 62c10 4 16-4 28 0s20 4 28 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M20 72h56c0 6-6 8-12 8H32c-6 0-12-2-12-8z" fill="#fff"/>'),
  snack:ico('<path d="M16 62c2-18 14-30 32-30 10 0 18 4 24 10l8-6-2 16c-4 14-16 22-32 22-14 0-26-4-30-12z" fill="#fff"/><g stroke="#1d3f87" stroke-width="4" stroke-linecap="round"><path d="M34 44l6 18"/><path d="M48 40l4 22"/><path d="M62 46l-2 18"/></g>'),
  kraan:ico('<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M34 78V34M44 78V34M34 46h10M34 60h10"/><path d="M30 78h20"/><path d="M40 34l36-18M44 40l32-24"/><path d="M76 16v30"/><path d="M72 46h8"/></g><rect x="30" y="28" width="18" height="12" fill="#fff"/>'),
  muziek:ico('<g fill="#fff"><ellipse cx="34" cy="66" rx="9" ry="7"/><ellipse cx="64" cy="60" rx="9" ry="7"/></g><path d="M42 66V28l31-6v38" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M42 36l31-6" stroke="#fff" stroke-width="5"/>'),
  ster:ico('<path d="M48 18l8.8 18 19.8 2.9-14.3 14 3.4 19.7L48 63.3 30.3 72.6l3.4-19.7-14.3-14 19.8-2.9z" fill="#fff"/>'),
  mensen:ico('<g fill="#fff"><circle cx="34" cy="34" r="9"/><circle cx="62" cy="34" r="9"/><path d="M18 74c0-12 7-22 16-22s16 10 16 22z"/><path d="M46 74c0-12 7-22 16-22s16 10 16 22z"/></g>'),
  groei:ico('<path d="M18 76h60" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g fill="#fff"><rect x="22" y="56" width="12" height="16" rx="1"/><rect x="42" y="44" width="12" height="28" rx="1"/><rect x="62" y="30" width="12" height="42" rx="1"/></g><path d="M22 44l18-14 12 6 20-16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'),
  keuken:ico('<rect x="18" y="38" width="60" height="34" rx="3" fill="none" stroke="#fff" stroke-width="5"/><path d="M28 38c0-8 6-12 12-12 3 0 6 1 8 3 2-2 5-3 8-3 6 0 12 4 12 12" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M30 56h36" stroke="#fff" stroke-width="5" stroke-linecap="round"/>')
 };

 // --- inhoud: hoofdstukken en stappen ---
 const HOOFDSTUKKEN=[
  {nr:1,naam:'Een pont voor de buurt',klaar:true,stappen:[
   {view:'Gouden uur',icoon:'pont',kop:'Een echte pont',tekst:'Een blauw-witte IJ-pont ligt afgemeerd aan de zwemsteiger aan Zijkanaal I, naast de kraan van Het Paard van Noord. Geen nieuwbouw: een Amsterdamse pont die weer een plek voor de buurt wordt.',klein:'Pont 13 (nu Ferry) bewijst dat een veerpont als horeca werkt: een pont uit 1927, sinds 2005 een restaurant.'},
   {view:'Buurtloket',icoon:'loket',kop:'Voorop: Het Buurtloket',tekst:'Op het voordek haal je boodschappen, brood en koffie. Het loket heeft een eigen lane aan de steigerzijde, zodat je niet door de zittende gasten loopt en toch de reuring voelt.'},
   {view:'Productie',icoon:'keuken',kop:'In het midden: de keuken achter glas',tekst:'Hier bakken we af en maken we de snacks, zichtbaar voor iedereen op de steiger en aan boord. Ambachtelijk aan de voorkant, efficiënt aan de achterkant.'},
   {view:'Dakterras',icoon:'blijven',kop:'Achterin en op het dak: blijven',tekst:'Kajuit en terras zijn voor wie zin heeft om te blijven, voor de gezelligheid van de hele boot. Het dak is er soms voor een avond met de buurt.'},
   {view:'Zijaanzicht',icoon:'pont',kop:'Snel genoeg om te halen, warm genoeg om te blijven',tekst:'Dat is de hele boot in één zin. Hoe dat werkt, lees je in de volgende hoofdstukken.'}
  ]},
  {nr:2,naam:'Waarom hier, waarom nu',klaar:true,stappen:[
   {view:'Kraan',icoon:'kraan',kop:'Tussen nieuw en oud Noord',tekst:'De steiger ligt waar het nieuwe Noord en het oude Noord elkaar raken. Een buurtloket met daghoreca maakt die verbinding: een plek waar iedereen dagelijks langskomt.'},
   {view:'Zwemsteiger',icoon:'zwemmen',kop:'Wie hier komt',lijst:[['Buren','dagelijkse boodschappen, koffie, iets voor de lunch'],['Zwemmers','iets halen in de zon en blijven hangen'],['Omfietsers','komen voor dat ene broodje of die ene avond']]},
   {view:'Buurtloket',icoon:'loket',kop:'Wat het oplost',lijst:[['Geen tijd','snel iets meenemen aan het loket'],['Wachten','eigen loket-lane, vooraf bestellen in een tijdvak'],['Geen buurtgevoel','buurtavonden, lokale makers, herkend worden'],['Zon en water','terras aan het water, kajuit bij slecht weer']]},
   {view:'Boven',icoon:'pont',kop:'De gemeente vraagt erom',tekst:'In de aanbesteding Horeca aan het water (De Bongerd) zoekt de gemeente horeca bij de zwemsteiger. De Koffieboot geeft daar een antwoord op dat bij de plek hoort.',klein:'Wat de buurt nu precies mist, vullen Kai en Hidde nog aan.'}
  ]},
  {nr:3,naam:'Het aanbod',klaar:true,stappen:[
   {view:'Gouden uur',icoon:'brood',kop:'Eén regel voor alles',tekst:'Waar anderen aantoonbaar beter in zijn, pakken we collabs. Waar wij het verschil kunnen maken, doen we het zelf. Alles is divers: traditioneel, en soms vooruitstrevend en hip.'},
   {view:'Buurtloket',icoon:'loket',kop:'Collabs: de beste in hun vak',lijst:[['Brood','Westerbos, hier afgebakken'],['Koffie','de beste branderij (nog te kiezen)'],['IJs','de beste Amsterdamse ijsboer (nog te kiezen)'],['Maaltijden','Mama\'s Koelkast, ook als afhaalmaaltijd en stamppotje'],['Beleg','de beste en leukste Amsterdamse makers']],klein:'Het loket start met een simpel assortiment. Leukere producten en bijzondere collabs volgen steeds.'},
   {view:'Productie',icoon:'snack',kop:'Zelf: de snacks',tekst:'Hier duiken we zelf in, om de tofste en uniekste dingen te maken. Ouderwetse klassiekers in een nieuw jasje, zoals het kaneelbroodje dat Wimpie heet. Of nieuwe hits, zoals een half croissantje als hoorntje met ijs erin.'},
   {view:'Zijaanzicht',icoon:'keuken',kop:'De keuken verbindt alles',tekst:'Alles loopt door de keuken in het midden. Wat je haalt bij het loket, komt daar vandaan. Wat je eet in de kajuit of op het terras ook. Zo is het aanbod één verhaal, van voordek tot terras.'}
  ]},
  {nr:4,naam:'Halen, eten, blijven',klaar:true,stappen:[
   {view:'Buurtloket',icoon:'loket',kop:'Halen',tekst:'Je loopt of fietst langs het loket aan de steiger en neemt mee wat je nodig hebt: brood, koffie, boodschappen of een broodje. Wie vooraf bestelt, haalt het op in een tijdvak.'},
   {view:'Zwemsteiger',icoon:'broodje',kop:'Eten',tekst:'Eten doe je waar je wilt: aan het loket, op de steiger in de zon of aan boord. Het is hetzelfde aanbod, op de plek die bij je moment past.'},
   {view:'Zijaanzicht',icoon:'blijven',kop:'Blijven, als je zin hebt',tekst:'Blijven hoeft niet, maar het mag altijd. In de kajuit (naar schatting 80 tot 90 plekken) en op het terras aan het water, voor de gezelligheid en knusheid van de boot.'},
   {view:'Gouden uur',icoon:'koffie',kop:'De dag op de boot',lijst:[['Ochtend','koffie en brood halen, koffie op het terras'],['Middag','broodjes en snacks, lunch binnen of buiten'],['Namiddag','snacks worden hapjes, een wijn of pils']],klein:'Van eerste koffie tot laatste glas. We blijven daghoreca.'}
  ]},
  {nr:5,naam:'Door het jaar',klaar:true,stappen:[
   {view:'Zwemsteiger',icoon:'ijs',kop:'Zomer: de zwemsteiger',tekst:'In de zomer draait de boot om de steiger en het terras. IJs van de beste Amsterdamse ijsboer, en uit onze eigen keuken het halve croissantje als hoorntje met ijs erin.'},
   {view:'Zijaanzicht',icoon:'maaltijd',kop:'Winter: de warme kajuit',tekst:'In de winter wordt de kajuit het warme hart van de boot, en het loket belangrijker. Je neemt een afhaalmaaltijd of stamppotje van Mama\'s Koelkast mee naar huis.'},
   {view:'Gouden uur',icoon:'brood',kop:'IJscuypje of stamppotje',tekst:'De basis blijft het hele jaar hetzelfde: brood, koffie, broodjes en snacks. De rest van de kaart gaat mee met het seizoen.'}
  ]},
  {nr:6,naam:'Specials',klaar:true,stappen:[
   {view:'Dakterras',avond:true,icoon:'muziek',kop:'Een artiest op het dak',tekst:'Zo nu en dan gooien we de deuren open voor de buurt. Een artiest speelt op het dak, met bootjes in het water eromheen, net als op het Grachtenfestival.'},
   {view:'Zwemsteiger',avond:true,icoon:'broodje',kop:'Foodfestival',tekst:'De steiger wordt een eetfestival met de makers van ons beleg, en broodjes die je vanaf het water haalt.'},
   {view:'Zijaanzicht',avond:true,icoon:'ster',kop:'Bingo en de grootste quiz',tekst:'In de kajuit: bingo-avonden en de grootste en meeslependste quizzen van Noord.'},
   {view:'Gouden uur',avond:true,icoon:'blijven',kop:'Hapjes bij de beste wijn en pils',tekst:'Richting de avond worden de snacks hapjes, met een korte kaart van wijn en pils uit de omgeving. De specials zijn bijzondere avonden: we blijven daghoreca.'}
  ]},
  {nr:7,naam:'Waarom het werkt',klaar:true,stappen:[
   {view:'Buurtloket',icoon:'loket',kop:'Het loket kent geen zitplekken',tekst:'Binnen zijn er naar schatting 80 tot 90 plekken, maar het loket bedient iedereen die langskomt. De omzet hangt dus niet af van het aantal stoelen.'},
   {view:'Start',icoon:'koffie',kop:'Het loket vult de rustige uren',tekst:'Ochtend, regen of winter: halen gaat altijd door. Zo is er klandizie op momenten dat de horeca stil is.'},
   {view:'Productie',icoon:'brood',kop:'Geen bakkerij bouwen',tekst:'Westerbos levert het brood, wij bakken het af. Dat scheelt investering en personeel. Ambachtelijk aan de voorkant, efficiënt aan de achterkant.'},
   {view:'Dakterras',icoon:'blijven',kop:'Van halen naar blijven',tekst:'Hapjes, wijn en pils maken van een kort bezoek een langer bezoek. Wie blijft, besteedt meer.'},
   {view:'Boven',icoon:'groei',kop:'Het model in het kort',lijst:[['Partners','Westerbos, Mama\'s Koelkast, branderij, ijsboer, Amsterdamse makers'],['Gasten','buren, zwemmers en recreanten, omfietsers'],['Omzet','loket, eten, blijven, specials'],['Kosten','personeel, boot en ombouw, ligplaats, inkoop, energie']],klein:'De cijfers volgen in de business case.'}
  ]},
  {nr:8,naam:'Klein beginnen',klaar:true,stappen:[
   {view:'Buurtloket',icoon:'loket',kop:'Dag één: loket en daghoreca',tekst:'Vanaf het begin zijn het loket en de daghoreca open, met een simpel assortiment.'},
   {view:'Productie',icoon:'snack',kop:'Daarna: steeds verrassender',tekst:'Uit de keuken komen steeds leukere en verrassendere producten, en de collabs worden specialer.'},
   {view:'Dakterras',icoon:'muziek',kop:'Dan: de specials',tekst:'Als de dag staat, volgen de avonden met de buurt.'},
   {view:'Zwemsteiger',icoon:'mensen',kop:'Wie het doet',tekst:'Kai en Hidde, aangevuld door een team van buurtgenoten.'},
   {view:'Gouden uur',icoon:'groei',kop:'Wat we willen bewijzen',lijst:[['Buurt','de buurt komt terug'],['Loket','het loket draait los van de horeca'],['Omfietsen','mensen komen er speciaal voor'],['Blijven','wie blijft, besteedt meer'],['Specials','de avonden bouwen aan de buurt']],klein:'De doelen per punt vullen we in met de business case.'}
  ]}
 ];

 const nav=$('#hoofdstukken'),paneel=$('#paneel'),opening=$('#opening'),titel=$('#titelkaart'),merk=$('#merk'),wrap=$('#wrap');
 const K=window.koffieboot;
 let actief=null,stapNr=0,timer=0;
 const smal=()=>innerWidth<=700;
 wrap.classList.add('start');

 // camera: de bestaande stand kiezen (scene.js beweegt), daarna het doel opschuiven zodat de boot naast het tekstvak valt
 // avond alleen aanzetten bij de specials; daarna terug naar dag. Zelf op Avond gezet? Dan blijft het avond.
 const BINNEN=new Set(['Binnen','Salon','Klep']);
 let gedwongen=false;
 function avond(aan){const b=[...views.querySelectorAll('button')].find(x=>x.textContent==='Avond'||x.textContent==='Dag');if(!b)return;const nu=b.textContent==='Dag';
  if(aan){if(!nu)b.click();gedwongen=true}else if(gedwongen){if(nu)b.click();gedwongen=false}}
 function camera(naam,vrij,nacht){
  avond(nacht);
  const b=[...views.querySelectorAll('button')].find(x=>x.textContent===naam);if(!b)return;b.click();
  if(vrij||BINNEN.has(naam)||!K||!K.goal)return;   // binnenstanden niet verschuiven, anders gaat de camera door de wand
  const g=K.goal;
  if(smal()){g.t.y-=g.r*.13}                       // tekstvak onderin: boot hoger in beeld
  else{const f=g.r*.2;g.t.x+=-Math.cos(g.th)*f;g.t.z+=-Math.sin(g.th)*f}  // tekstvak rechts: boot naar links
 }

 // camerastanden verbergen behalve Dag/Avond
 function opruimen(){views.querySelectorAll('button').forEach(b=>{if(b.textContent!=='Avond'&&b.textContent!=='Dag')b.classList.add('verborgen')})}
 opruimen();new MutationObserver(opruimen).observe(views,{childList:true});

 // openingsbeeld: boot iets lager, zodat het bord in het midden boven de boot hangt
 function startBeeld(){camera('Gouden uur',true);if(K&&K.goal)K.goal.t.y+=K.goal.r*(smal()?.16:.11)}
 startBeeld();

 const twee=n=>String(n).padStart(2,'0');
 HOOFDSTUKKEN.forEach(h=>{const b=document.createElement('button');b.type='button';b.disabled=!h.klaar;b.dataset.nr=h.nr;
  b.title=h.klaar?h.naam:h.naam+' (volgt)';b.innerHTML='<span class="nr">'+twee(h.nr)+'</span><span class="naam">'+h.naam+'</span>';
  b.onclick=()=>open(h);nav.appendChild(b)});

 function stapHtml(s,k){
  let inh='';
  if(s.tekst)inh+='<p>'+s.tekst+'</p>';
  if(s.lijst)inh+='<ul>'+s.lijst.map(r=>'<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>').join('')+'</ul>';
  if(s.klein)inh+='<p class="klein">'+s.klein+'</p>';
  return '<div class="stap" data-k="'+k+'">'+IC[s.icoon]+'<div><h3>'+s.kop+'</h3><div class="lijf"><div>'+inh+'</div></div></div></div>';
 }

 function open(h){
  clearTimeout(timer);actief=h;stapNr=-1;
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.nr===h.nr));
  // 1. eerst de titel, los op het beeld
  titel.classList.remove('in');void titel.offsetWidth;
  titel.innerHTML='<div class="oog">Hoofdstuk '+twee(h.nr)+'</div><h2>'+h.naam+'</h2>';titel.classList.add('in');
  paneel.classList.remove('open');paneel.hidden=true;
  camera(h.stappen[0].view,false,h.stappen[0].avond);
  // 2. dan het tekstvak
  timer=setTimeout(()=>{
   paneel.innerHTML='<div class="p-voortgang"><i></i></div><button type="button" class="p-sluit" aria-label="Sluiten">×</button><div class="p-stappen"></div>'+
    '<div class="p-nav"><button type="button" class="terug">← Terug</button><span class="teller"></span><button type="button" class="volg"></button></div>';
   paneel.querySelector('.p-sluit').onclick=sluit;
   paneel.querySelector('.terug').onclick=()=>zet(stapNr-1);
   paneel.querySelector('.volg').onclick=()=>stapNr>=h.stappen.length-1?naarVolgende():zet(stapNr+1);
   paneel.querySelector('.p-stappen').onclick=e=>{const st=e.target.closest('.stap.dicht');if(st)zet(+st.dataset.k)};
   paneel.hidden=false;requestAnimationFrame(()=>paneel.classList.add('open'));
   zet(0,true);
  },900);
 }

 // stap tonen: het vak groeit met een stap; eerdere stappen klappen in tot één regel (klik = terug naar die stap)
 function zet(n,eerste){
  const h=actief;if(!h||n<0||n>=h.stappen.length||n===stapNr)return;
  const st=paneel.querySelector('.p-stappen');
  // stappen bijmaken of weghalen zodat er precies n+1 staan
  while(st.children.length>n+1)st.lastElementChild.remove();
  while(st.children.length<n+1){st.insertAdjacentHTML('beforeend',stapHtml(h.stappen[st.children.length],st.children.length));st.lastElementChild.classList.add('nieuw')}
  [...st.children].forEach((e,k)=>e.classList.toggle('dicht',k<n));
  stapNr=n;
  paneel.querySelector('.p-voortgang i').style.width=((n+1)/h.stappen.length*100)+'%';
  paneel.querySelector('.teller').textContent=twee(n+1)+' / '+twee(h.stappen.length);
  paneel.querySelector('.terug').disabled=n===0;
  const last=n>=h.stappen.length-1,nx=HOOFDSTUKKEN.find(x=>x.nr>h.nr&&x.klaar);
  paneel.querySelector('.volg').innerHTML=(last?(nx?'Hoofdstuk '+twee(nx.nr):'Opnieuw'):'Volgende')+' <span aria-hidden="true">→</span>';
  if(!eerste)camera(h.stappen[n].view,false,h.stappen[n].avond);
  setTimeout(()=>st.scrollTo({top:st.scrollHeight,behavior:'smooth'}),60);
 }
 function naarVolgende(){const nx=HOOFDSTUKKEN.find(x=>x.nr>actief.nr&&x.klaar);open(nx||actief)}
 function sluit(){clearTimeout(timer);paneel.classList.remove('open');setTimeout(()=>paneel.hidden=true,500);titel.innerHTML='';actief=null;
  nav.querySelectorAll('button').forEach(b=>b.classList.remove('on'));camera('Gouden uur',true)}

 // opening: bord in het midden; "Stap aan boord" opent hoofdstuk 1. Het woordmerk linksboven brengt je terug.
 $('#start').onclick=()=>{opening.classList.add('weg');wrap.classList.remove('start');nav.hidden=false;merk.hidden=false;open(HOOFDSTUKKEN[0])};
 merk.onclick=()=>{sluit();startBeeld();merk.hidden=true;nav.hidden=true;wrap.classList.add('start');opening.classList.remove('weg')};
 addEventListener('keydown',e=>{
  if(!actief||e.target.closest('input,textarea'))return;
  if(e.key==='Escape')sluit();
  else if(e.key==='ArrowRight'){const v=paneel.querySelector('.volg');if(v)v.click()}
  else if(e.key==='ArrowLeft')zet(stapNr-1);
 });
})();
