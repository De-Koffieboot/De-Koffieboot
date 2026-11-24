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
 // Zes hoofdstukken die de boot één keer doorlopen. Elk feit staat er één keer in.
 const HOOFDSTUKKEN=[
  {nr:1,id:'pont',naam:'Een pont voor de buurt',stappen:[
   {view:'Kraan',icoon:'pont',kop:'Een echte pont',tekst:'Aan de zwemsteiger aan Zijkanaal I, naast de kraan van Het Paard van Noord, ligt een blauw-witte IJ-pont afgemeerd. Geen nieuwbouw, maar een Amsterdamse pont die een plek voor de buurt wordt.',klein:'Dat een pont horeca kan zijn, bewijst Pont 13 (nu Ferry): een veerpont uit 1927, sinds 2005 een restaurant.'},
   {view:'Zwemsteiger',icoon:'mensen',kop:'Tussen nieuw en oud Noord',tekst:'De steiger ligt waar nieuw en oud Noord elkaar raken. Een buurtloket met daghoreca wordt de plek waar iedereen elkaar dagelijks tegenkomt.',lijst:[['Buren','boodschappen, koffie, iets voor de lunch'],['Zwemmers','iets halen in de zon en blijven hangen'],['Omfietsers','komen voor dat ene broodje of die ene avond']]},
   {view:'Boven',icoon:'kraan',kop:'Horeca aan het water',tekst:'In de aanbesteding Horeca aan het water (De Bongerd) zoekt de gemeente horeca bij de zwemsteiger. De Koffieboot is ons antwoord: van voor naar achter een loket, een keuken en een plek om te blijven.'}
  ]},
  {nr:2,id:'halen',naam:'Halen: Het Buurtloket',stappen:[
   {view:'Start',icoon:'loket',kop:'Voorop het loket',tekst:'Op het voordek haal je brood, koffie, boodschappen en broodjes. Het loket heeft een eigen rij aan de steigerkant, zodat je niet tussen de zittende gasten door hoeft. Wie vooraf bestelt, haalt op in een tijdvak.'},
   {view:'Buurtloket',icoon:'brood',kop:'De beste in hun vak',tekst:'Waar anderen aantoonbaar beter zijn, werken we samen. Divers: traditioneel, en soms vooruitstrevend en hip.',lijst:[['Brood','Westerbos'],['Koffie','een Amsterdamse branderij'],['IJs','een Amsterdamse ijsboer'],['Maaltijden','Mama\'s Koelkast, om mee te nemen, ook stamppotjes'],['Beleg','de beste en leukste Amsterdamse makers']]}
  ]},
  {nr:3,id:'keuken',naam:'De keuken',stappen:[
   {view:'Zijaanzicht',icoon:'keuken',kop:'Het hart van de boot',tekst:'In het midden van de boot zit de keuken, achter glas en zichtbaar vanaf de steiger. Hier wordt het brood afgebakken, worden de broodjes belegd en de snacks gemaakt. Zo verbindt de keuken het loket voorop met de kajuit achterin.'},
   {view:'Productie',icoon:'snack',kop:'Zelf gemaakt: de snacks',tekst:'Waar wij het verschil maken, doen we het zelf. Ouderwetse klassiekers in een nieuw jasje, zoals het kaneelbroodje dat Wimpie heet. Of nieuwe hits, zoals een half croissantje als hoorntje met ijs erin.'}
  ]},
  {nr:4,id:'blijven',naam:'Eten en blijven',stappen:[
   {view:'Dakterras',icoon:'broodje',kop:'Eten waar je wilt',tekst:'Aan het loket, op de steiger in de zon of aan boord: hetzelfde aanbod, op de plek die bij je moment past.'},
   {view:'Gouden uur',icoon:'blijven',kop:'Blijven, als je zin hebt',tekst:'Blijven hoeft niet, maar mag altijd. In de kajuit (naar schatting 80 tot 90 plekken) en op het terras aan het water, voor de gezelligheid van de boot.'},
   {view:'Zijaanzicht',icoon:'koffie',kop:'Van eerste koffie tot laatste glas',lijst:[['Ochtend','koffie en brood halen, koffie op het terras'],['Middag','broodjes en snacks, lunch binnen of buiten'],['Namiddag','snacks worden hapjes, met een korte kaart van wijn en pils uit de buurt']],klein:'We zijn daghoreca.'}
  ]},
  {nr:5,id:'jaar',naam:'Door het jaar',stappen:[
   {view:'Zwemsteiger',icoon:'ijs',kop:'Zomer',tekst:'In de zomer draait de boot om de zwemsteiger en het terras, met ijs na het zwemmen.'},
   {view:'Zijaanzicht',icoon:'maaltijd',kop:'Winter',tekst:'In de winter wordt de kajuit het warme hart, en neem je na het werk een stamppotje mee naar huis. De basis blijft het hele jaar: brood, koffie, broodjes en snacks.'},
   {view:'Dakterras',avond:true,icoon:'muziek',kop:'Soms: de buurt aan boord',tekst:'Zo nu en dan gooien we de deuren open.',lijst:[['Dak','een artiest, met bootjes in het water eromheen'],['Steiger','een foodfestival met de makers van ons beleg'],['Kajuit','bingo en de grootste quiz van Noord']]}
  ]},
  {nr:6,id:'werkt',naam:'Waarom het werkt',stappen:[
   {view:'Buurtloket',icoon:'loket',kop:'Het loket draait altijd',tekst:'Het loket bedient iedereen die langskomt, los van het aantal stoelen. Ochtend, regen of winter: halen gaat door, ook als de horeca stil is.'},
   {view:'Productie',icoon:'brood',kop:'Samen met de makers van de stad',tekst:'Westerbos levert het brood, Mama\'s Koelkast de maaltijden om mee te nemen. Zo hoeven we op de boot niets te bouwen wat ruimte en geld vreet en het concept smaller maakt. Door de kracht van makers in de stad te bundelen, kunnen we twee dingen tegelijk zijn: een buurtwinkel voor elk eet- en snackmoment van de dag, en een daghorecazaak.'},
   {view:'Gouden uur',icoon:'groei',kop:'Klein beginnen',lijst:[['Dag één','loket en daghoreca, met een simpel assortiment'],['Daarna','verrassendere producten uit de keuken, specialere collabs'],['Dan','de avonden met de buurt']],klein:'Kai en Hidde, met een team van buurtgenoten.'},
   {view:'Boven',icoon:'ster',kop:'Wat we willen bewijzen',lijst:[['Buurt','de buurt komt terug'],['Loket','het loket draait los van de horeca'],['Omfietsen','mensen komen er speciaal voor'],['Blijven','wie blijft, besteedt meer'],['Avonden','de specials bouwen aan de buurt']]}
  ]}
 ];

 const nav=$('#hoofdstukken'),paneel=$('#paneel'),opening=$('#opening'),titel=$('#titelkaart'),merk=$('#merk'),wrap=$('#wrap');
 const K=window.koffieboot;
 if(!K)return;                                    // scène niet geladen: index.html toont al een foutmelding
 let actief=null,stapNr=-1,timer=0,wachtId=0;
 const smal=()=>innerWidth<=700;
 const twee=n=>String(n).padStart(2,'0');
 wrap.classList.add('start');

 // ---- camera ----
 // De scène biedt camerastanden als knoppen in #views. We zoeken ze één keer op naam op en melden ontbrekende standen,
 // zodat een hernoemde stand opvalt in de console in plaats van stil een hoofdstuk te breken.
 const knop=naam=>[...views.querySelectorAll('button')].find(x=>x.textContent===naam);
 HOOFDSTUKKEN.forEach(h=>h.stappen.forEach(s=>{if(!knop(s.view))console.warn('[verhaal] camerastand ontbreekt in de scène:',s.view,'(hoofdstuk '+h.nr+')')}));

 // avond alleen voor stappen met avond:true; daarna terug naar dag. Zet de bezoeker zelf Avond aan, dan blijft dat zo.
 let gedwongen=false;
 function avond(aan){const b=knop('Avond')||knop('Dag');if(!b)return;const nu=b.textContent==='Dag';
  if(aan){if(!nu)b.click();gedwongen=true}else if(gedwongen){if(nu)b.click();gedwongen=false}}

 // stand kiezen en het doel opschuiven, zodat de boot naast het tekstvak valt (rechts op desktop, onderin op telefoon)
 function camera(naam,vrij,nacht){
  avond(nacht);
  const b=knop(naam);if(!b)return;b.click();
  if(vrij||!K.goal)return;
  const g=K.goal;
  if(smal())g.t.y-=g.r*.13;
  else{const f=g.r*.2;g.t.x-=Math.cos(g.th)*f;g.t.z-=Math.sin(g.th)*f}
 }
 // wacht tot de camera (bijna) bij het doel is, met een maximum, en roep dan klaar() aan
 function naAankomst(klaar,min=450,max=2600){
  cancelAnimationFrame(wachtId);const C=K.camera,g=K.goal,t0=performance.now();
  const stap=()=>{const t=performance.now()-t0,sp=Math.sin(g.ph);
   const doel=new THREE.Vector3(g.t.x+g.r*sp*Math.sin(g.th),g.t.y+g.r*Math.cos(g.ph),g.t.z-g.r*sp*Math.cos(g.th));
   if((t>min&&C.position.distanceTo(doel)<Math.max(.4,g.r*.08))||t>max)klaar();else wachtId=requestAnimationFrame(stap)};
  wachtId=requestAnimationFrame(stap);
 }

 function opruimen(){views.querySelectorAll('button').forEach(b=>{if(b.textContent!=='Avond'&&b.textContent!=='Dag')b.classList.add('verborgen')})}
 opruimen();new MutationObserver(opruimen).observe(views,{childList:true});

 // openingsbeeld: boot iets lager, zodat het bord in het midden boven de boot hangt
 function startBeeld(){camera('Gouden uur',true);K.goal.t.y+=K.goal.r*(smal()?.16:.11)}
 startBeeld();

 // ---- hoofdstukkenbalk ----
 HOOFDSTUKKEN.forEach(h=>{const b=document.createElement('button');b.type='button';b.dataset.nr=h.nr;b.title=h.naam;
  b.innerHTML='<span class="nr">'+twee(h.nr)+'</span><span class="naam">'+h.naam+'</span>';
  b.onclick=()=>naar(h,0);nav.appendChild(b)});

 function stapHtml(s,k){
  let inh='';
  if(s.tekst)inh+='<p>'+s.tekst+'</p>';
  if(s.lijst)inh+='<ul>'+s.lijst.map(r=>'<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>').join('')+'</ul>';
  if(s.klein)inh+='<p class="klein">'+s.klein+'</p>';
  return '<div class="stap" data-k="'+k+'">'+IC[s.icoon]+'<div><h3>'+s.kop+'</h3><div class="lijf"><div>'+inh+'</div></div></div></div>';
 }

 // ---- adres: #pont, #halen-2 enz. Zo kun je een link naar een hoofdstuk of stap sturen en werkt de terugknop ----
 const adres=(h,n)=>'#'+h.id+(n>0?'-'+(n+1):'');
 function leesAdres(){const m=location.hash.slice(1).match(/^([a-z]+)(?:-(\d+))?$/);if(!m)return null;
  const h=HOOFDSTUKKEN.find(x=>x.id===m[1]);if(!h)return null;return {h,n:Math.min(h.stappen.length-1,Math.max(0,(+m[2]||1)-1))}}
 function zetAdres(h,n,nieuw){const a=h?adres(h,n):location.pathname+location.search;if(location.hash===(h?a:''))return;
  history[nieuw?'pushState':'replaceState'](null,'',a)}

 function aanBoord(){opening.classList.add('weg');wrap.classList.remove('start');nav.hidden=false;merk.hidden=false}

 // naar hoofdstuk h, stap n. Eerst de titel, dan (als de camera er is) het tekstvak.
 function naar(h,n,vanAdres){
  aanBoord();
  if(actief===h){zet(n);if(!vanAdres)zetAdres(h,n,false);return}
  clearTimeout(timer);actief=h;stapNr=-1;
  if(!vanAdres)zetAdres(h,n,true);
  nav.querySelectorAll('button').forEach(b=>{const on=+b.dataset.nr===h.nr;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  titel.classList.remove('in');void titel.offsetWidth;
  titel.innerHTML='<div class="oog">Hoofdstuk '+twee(h.nr)+' van '+twee(HOOFDSTUKKEN.length)+'</div><h2>'+h.naam+'</h2>';titel.classList.add('in');
  paneel.classList.remove('open');paneel.hidden=true;
  camera(h.stappen[n].view,false,h.stappen[n].avond);
  naAankomst(()=>{
   if(actief!==h)return;
   paneel.innerHTML='<div class="p-voortgang"><i></i></div><button type="button" class="p-sluit" aria-label="Sluiten">×</button><div class="p-stappen"></div>'+
    '<div class="p-nav"><button type="button" class="terug">← Terug</button><span class="teller"></span><button type="button" class="volg"></button></div>';
   paneel.querySelector('.p-sluit').onclick=sluit;
   paneel.querySelector('.terug').onclick=()=>stap(-1);
   paneel.querySelector('.volg').onclick=()=>stap(1);
   paneel.querySelector('.p-stappen').onclick=e=>{const st=e.target.closest('.stap.dicht');if(st){zet(+st.dataset.k);zetAdres(h,+st.dataset.k,false)}};
   paneel.hidden=false;requestAnimationFrame(()=>paneel.classList.add('open'));
   zet(n,true);
  },700,1800);
 }

 // stap tonen: het vak groeit met een stap; eerdere stappen klappen in tot één regel (klik = terug naar die stap)
 function zet(n,eerste){
  const h=actief;if(!h||n<0||n>=h.stappen.length||n===stapNr)return;
  const st=paneel.querySelector('.p-stappen');if(!st)return;
  while(st.children.length>n+1)st.lastElementChild.remove();
  while(st.children.length<n+1){st.insertAdjacentHTML('beforeend',stapHtml(h.stappen[st.children.length],st.children.length));st.lastElementChild.classList.add('nieuw')}
  [...st.children].forEach((e,k)=>e.classList.toggle('dicht',k<n));
  stapNr=n;
  paneel.querySelector('.p-voortgang i').style.width=((n+1)/h.stappen.length*100)+'%';
  paneel.querySelector('.teller').textContent=twee(n+1)+' / '+twee(h.stappen.length);
  paneel.querySelector('.terug').disabled=n===0&&h.nr===1;
  const last=n>=h.stappen.length-1,nx=HOOFDSTUKKEN[h.nr];
  paneel.querySelector('.volg').innerHTML=(last?(nx?'Hoofdstuk '+twee(nx.nr):'Terug naar begin'):'Volgende')+' <span aria-hidden="true">→</span>';
  if(!eerste)camera(h.stappen[n].view,false,h.stappen[n].avond);
  setTimeout(()=>st.scrollTo({top:st.scrollHeight,behavior:'smooth'}),60);
 }
 // één stap verder of terug, ook over de grens van een hoofdstuk heen
 function stap(r){
  if(!actief)return;const h=actief,n=stapNr+r;
  if(n>=0&&n<h.stappen.length){zet(n);zetAdres(h,n,false);return}
  if(r>0){const nx=HOOFDSTUKKEN[h.nr];nx?naar(nx,0):naarBegin()}
  else{const vg=HOOFDSTUKKEN[h.nr-2];if(vg)naar(vg,vg.stappen.length-1)}
 }
 function sluit(){cancelAnimationFrame(wachtId);paneel.classList.remove('open');setTimeout(()=>{if(!actief)paneel.hidden=true},500);titel.innerHTML='';actief=null;stapNr=-1;
  nav.querySelectorAll('button').forEach(b=>{b.classList.remove('on');b.removeAttribute('aria-current')});avond(false);camera('Gouden uur',true)}
 function naarBegin(vanAdres){sluit();startBeeld();merk.hidden=true;nav.hidden=true;wrap.classList.add('start');opening.classList.remove('weg');if(!vanAdres)zetAdres(null,0,true)}

 $('#start').onclick=()=>naar(HOOFDSTUKKEN[0],0);
 merk.onclick=()=>naarBegin();

 // terugknop van de browser en gedeelde links
 addEventListener('popstate',()=>{const a=leesAdres();if(a)naar(a.h,a.n,true);else if(actief)naarBegin(true)});
 {const a=leesAdres();if(a)naar(a.h,a.n,true)}

 // toetsen
 addEventListener('keydown',e=>{
  if(!actief||e.target.closest('input,textarea'))return;
  if(e.key==='Escape')sluit();
  else if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();stap(1)}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();stap(-1)}
 });

 // scrollen door het verhaal: met het wiel ga je een stap verder of terug. Inzoomen blijft kan met Ctrl/⌘ + scrollen of knijpen.
 let wielSom=0,wielRust=0;
 wrap.addEventListener('wheel',e=>{
  if(!actief||e.ctrlKey||e.metaKey)return;
  if(e.target.closest('.p-stappen')){const s=e.target.closest('.p-stappen');if(s.scrollHeight>s.clientHeight+2)return}
  e.preventDefault();e.stopPropagation();
  const nu=performance.now();if(nu<wielRust)return;
  wielSom+=e.deltaY;if(Math.abs(wielSom)>60){stap(wielSom>0?1:-1);wielSom=0;wielRust=nu+900}
 },{capture:true,passive:false});

 // venster groter of kleiner: camera opnieuw naast het tekstvak zetten
 let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(actief&&stapNr>=0)camera(actief.stappen[stapNr].view,false,actief.stappen[stapNr].avond);else if(!actief)startBeeld()},250)});
})();
