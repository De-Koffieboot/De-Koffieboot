// Overvloeien naar de Midjourney-stills: bij een hoofdstuk rijdt de camera naar het standpunt van de still;
// staat de camera stil, dan vloeit het beeld over in het schilderij. Draaien, scrollen of een andere knop: terug naar 3D.
(function(){const k=window.koffieboot;if(!k)return;
 const wrap=document.getElementById('wrap'),views=document.getElementById('views'),cv=document.getElementById('c');
 const lag=document.createElement('div');lag.id='still';lag.setAttribute('aria-hidden','true');
 const tip=document.createElement('div');tip.id='stilltip';tip.textContent='Illustratie · sleep of scroll om de boot in 3D te bekijken';
 wrap.insertBefore(lag,cv.nextSibling);wrap.appendChild(tip);
 const STILL={'Gouden uur':'stills/1-hoofdbeeld.jpg','Buurtloket':'stills/2-buurtloket.jpg','Productie':'stills/3-productie.jpg','Dakterras':'stills/4-dakterras.jpg','Zijaanzicht':'stills/6-zijaanzicht.jpg'};
 const AVOND={'Gouden uur':'stills/5-avond.jpg'};
 // vooraf laden zodat het overvloeien direct kan
 Object.values(STILL).concat(Object.values(AVOND)).forEach(s=>{const i=new Image();i.src=s});
 // dakterras: ooghoogte op het dek, zoals de still (in pont-coördinaten: kijkpunt t, camera o)
 const EIGEN={'Dakterras':{t:[4,4.3,-3.2],o:[-15.5,8.6,4.6]}};
 const avond=()=>[...views.querySelectorAll('button')].some(b=>b.textContent==='Dag');
 let wacht=null,laatste=null;
 function uit(){if(wacht)cancelAnimationFrame(wacht);wacht=null;wacht=null;lag.classList.remove('aan');tip.classList.remove('aan')}
 function zetEigen(e){const P=k.pont;P.updateMatrixWorld(true);const t=P.localToWorld(new THREE.Vector3(...e.t)),o=P.localToWorld(new THREE.Vector3(...e.o)).sub(t),r=o.length();
  k.goal.t.copy(t);k.goal.r=r;k.goal.th=Math.atan2(o.x,-o.z);k.goal.ph=Math.acos(o.y/r)}
 function kies(naam){uit();laatste=naam;const src=(avond()&&AVOND[naam])||STILL[naam];if(!src)return;
  if(EIGEN[naam])setTimeout(()=>zetEigen(EIGEN[naam]),0);
  // wacht tot de camera stilstaat (per beeld gemeten, dus ook goed op trage toestellen), dan overvloeien
  const C=k.camera,start=performance.now();let rust=0,id=0;
  const stap=()=>{const t=performance.now()-start;let klaar=!C&&t>2000;
   if(C){const g=k.goal,sp=Math.sin(g.ph),doel=new THREE.Vector3(g.t.x+g.r*sp*Math.sin(g.th),g.t.y+g.r*Math.cos(g.ph),g.t.z-g.r*sp*Math.cos(g.th));
    const d=C.position.distanceTo(doel);rust=d<Math.max(.06,g.r*.012)?rust+1:0;klaar=t>400&&rust>=3}
   if(klaar||t>15000){wacht=null;lag.style.backgroundImage='url('+src+')';lag.classList.add('aan');tip.classList.add('aan')}else wacht=id=requestAnimationFrame(stap)};
  wacht=requestAnimationFrame(stap)}
 views.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const n=b.textContent;
  if(n==='Avond'||n==='Dag'){setTimeout(()=>{if(laatste&&lag.classList.contains('aan'))kies(laatste)},50);return}
  kies(n)},true);
 for(const ev of ['pointerdown','wheel','touchstart'])cv.addEventListener(ev,uit,{passive:true});
 addEventListener('keydown',e=>{if(!e.target.closest||!e.target.closest('#views'))uit()});
})();
