(function(){
if(typeof THREE==='undefined'){document.getElementById('wrap').style.display='none';document.getElementById('err').style.display='block';return}
// Wereld: 1 eenheid = 1 m, y omhoog, nulpunt = kaderand voor kraanvoet, water op y=0, +z = richting water.
// Kijkend naar het water is rechts -x: de pont staat dus op negatieve x, de Kadoelenbrug op positieve x (links).
const canvas=document.getElementById('c'),wrap=document.getElementById('wrap');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
const TELEFOON=matchMedia('(pointer:coarse)').matches||Math.min(screen.width,screen.height)<820;renderer.setPixelRatio(Math.min(devicePixelRatio,TELEFOON?1.5:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();const SKY=0xf2c7a6;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,90,480);
// zon laag uit het noordwesten (zomeravond, gouden uur): art direction-keuze, aanname
const zonDir=(el)=>new THREE.Vector3(.948*Math.cos(el),Math.sin(el),-.319*Math.cos(el)).normalize();
const lucht=new THREE.Mesh(new THREE.SphereGeometry(700,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,
 uniforms:{top:{value:new THREE.Color(0x8fa9cc)},hor:{value:new THREE.Color(0xf6cfae)},glow:{value:new THREE.Color(0xffb46a)},grond:{value:new THREE.Color(0x4f4a44)},sunDir:{value:zonDir(.24)},amt:{value:1}},
 vertexShader:'varying vec3 d;void main(){d=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 d;uniform vec3 top,hor,glow,sunDir,grond;uniform float amt;'+
 'float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
 'float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}'+
 'float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=a*ns(p);p=p*2.03+7.1;a*=.5;}return v;}'+
 'void main(){vec3 n=normalize(d);float h=clamp(n.y,0.,1.);vec3 c=mix(hor,top,pow(h,.5));float s=max(dot(n,sunDir),0.);'+
 'vec2 q=n.xz/(n.y+.18);float cl=fbm(q*vec2(.9,2.2)+3.)*smoothstep(-.02,.2,n.y);cl=smoothstep(.42,.8,cl);'+
 'vec3 cc=mix(mix(hor,top,.35)*.92,glow*1.15+.1,pow(s,2.5));c=mix(c,cc,cl*.6);'+
 'c+=glow*(pow(s,5.)*.14+pow(s,50.)*.2+pow(s,1200.)*1.4)*amt;c=mix(c,grond,smoothstep(0.,-.12,n.y));gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}'}));
scene.add(lucht);
const camera=new THREE.PerspectiveCamera(48,16/9,.5,1200);
// de kraan staat in de punt van een bocht: noordkant (+x) en zuidkant (-x) van de kade draaien beide van het water af (aanname uit satellietbeeld)
const noord=new THREE.Group(),zuid=new THREE.Group();noord.rotation.y=.28;zuid.rotation.y=-.14;scene.add(noord,zuid);

const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,envMapIntensity:.9},o||{}));
const mat={
 rood:M(0xCF2515,{roughness:.4}),logo:M(0xDE413A,{roughness:.45}),wit:M(0xE9E5DF,{roughness:.5}),
 houtDek:M(0x9C6B43),houtLicht:M(0xC9A27A),houtDonker:M(0x5A3E2B),
 kraan:M(0x46525e,{roughness:.5,metalness:.55}),staalWit:M(0xE8E6E3,{roughness:.35,metalness:.35}),staalDonker:M(0x2A2A2A,{roughness:.5,metalness:.5}),
 glas:M(0x93a3ab,{roughness:.05,metalness:1,envMapIntensity:1.1,emissive:0xff9d55,emissiveIntensity:.1}),beton:M(0xA7A29C),gras:M(0x7C9A55),asfalt:M(0xA2574B),
 water:(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,256,256);for(let i=0;i<2600;i++){const v=110+Math.random()*90|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(Math.random()*256,Math.random()*256,3+Math.random()*14,1+Math.random()*2)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,35);return new THREE.MeshPhongMaterial({color:0x5c747c,specular:0xffc48a,shininess:70,bumpMap:t,bumpScale:.35})})(),
 doek:M(0x4b4b4f),rubber:M(0x1E1E1E),touw:M(0xC8B48A),
 lamp:M(0xFFC877,{emissive:0xFFB04A,emissiveIntensity:0}),
 naam:null
};
function box(w,h,d,m,x,y,z,parent){const geo=new THREE.BoxGeometry(w,h,d);if(m.userData.tex){const k=m.userData.tex,uv=geo.attributes.uv,dm=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*dm[f][0]/k,uv.getY(i)*dm[f][1]/k)}}
 const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(parent||scene).add(o);return o}
function beam(a,b,r,m,parent){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,6),m);o.position.copy(A.clone().add(B).multiplyScalar(.5));
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;(parent||scene).add(o);return o}
function cyl(r,h,m,x,y,z,parent){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),m);o.position.set(x,y,z);o.castShadow=true;(parent||scene).add(o);return o}


const blad0=M(0x5e7f3e,{roughness:1});
// procedurele texturen (1 tegel = k meter), in grijswaarden zodat de kleur van het materiaal blijft
function maakTex(k,teken){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');teken(g);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
const ruis=(g,n,a,b,w1,w2)=>{for(let i=0;i<n;i++){const v=(a+Math.random()*(b-a))|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(Math.random()*512,Math.random()*512,w1+Math.random()*w2,w1+Math.random()*w2)}};
function houtTex(){return maakTex(2,g=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,512,512);const n=8;for(let p=0;p<n;p++){const y=p*64,t=185+Math.random()*60|0;g.fillStyle='rgb('+t+','+t+','+t+')';g.fillRect(0,y,512,64);for(let i=0;i<40;i++){const v=(150+Math.random()*80)|0;g.fillStyle='rgba('+v+','+v+','+v+',.35)';g.fillRect(Math.random()*512,y+Math.random()*60,40+Math.random()*200,1)}g.fillStyle='#5a5a5a';g.fillRect(0,y,512,3);g.fillRect(((p*173)%480),y,3,64)}})}
function korrelTex(k,a,b,n){return maakTex(k,g=>{g.fillStyle='rgb('+((a+b)>>1)+','+((a+b)>>1)+','+((a+b)>>1)+')';g.fillRect(0,0,512,512);ruis(g,n,a,b,2,7)})}
mat.houtDek.map=houtTex();mat.houtDek.userData.tex=2;mat.houtDek.needsUpdate=true;
mat.houtLicht.map=houtTex();mat.houtLicht.userData.tex=2;
mat.beton.map=korrelTex(3,150,245,2600);mat.beton.userData.tex=3;
mat.asfalt.map=korrelTex(3,140,250,3200);mat.asfalt.userData.tex=3;
mat.gras.map=korrelTex(3,170,255,5200);mat.gras.userData.tex=3;
mat.gras.bumpMap=mat.gras.map;mat.gras.bumpScale=1.2;
// licht: zon uit het zuidwesten, schuin (aanname)
scene.add(new THREE.HemisphereLight(0xffdcc0,0x5d5348,.18));
const sun=new THREE.DirectionalLight(0xffae6e,1.25);sun.target.position.set(-25,0,5);sun.position.copy(sun.target.position).addScaledVector(zonDir(.24),170);
const vul=new THREE.DirectionalLight(0xffd9c4,.2);vul.position.set(-70,40,60);scene.add(vul); // zacht invullicht vanaf het water
sun.castShadow=true;sun.shadow.mapSize.set(TELEFOON?1024:2048,TELEFOON?1024:2048);sun.shadow.bias=-.0005;sun.shadow.normalBias=.06;const sc=sun.shadow.camera;sc.left=-95;sc.right=95;sc.top=70;sc.bottom=-70;sc.near=10;sc.far=420;
scene.add(sun,sun.target);

// water en oevers
function golfNormals(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),W=[];
 for(let i=0;i<30;i++){const fx=(Math.random()*16|0)-8,fy=(Math.random()*16|0)-8;if(!fx&&!fy)continue;W.push([fx,fy,Math.random()*6.28,1/Math.pow(Math.hypot(fx,fy),1.1)])}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let dx=0,dy=0;for(const w of W){const cz=Math.cos(6.2832*(w[0]*x+w[1]*y)/N+w[2])*w[3];dx+=cz*w[0];dy+=cz*w[1]}
  const nx=-dx*.15,ny=-dy*.15,l=Math.hypot(nx,ny,1),i=(y*N+x)*4;im.data[i]=(nx/l*.5+.5)*255;im.data[i+1]=(ny/l*.5+.5)*255;im.data[i+2]=(1/l*.5+.5)*255;im.data[i+3]=255}
 g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const water=new THREE.Water(new THREE.PlaneGeometry(900,340),{textureWidth:768,textureHeight:768,waterNormals:golfNormals(),sunDirection:zonDir(.24),sunColor:0xffb878,waterColor:0x3a5258,distortionScale:.55,fog:true});
water.material.uniforms.size.value=30;water.rotation.x=-Math.PI/2;water.position.set(0,0,95);water.receiveShadow=true;scene.add(water);
// hemel als reflectiebron voor glas, staal en lak
const pmrem=new THREE.PMREMGenerator(renderer),envScene=new THREE.Scene();envScene.add(new THREE.Mesh(lucht.geometry,lucht.material));
function maakEnv(){const oud=scene.environment;scene.environment=pmrem.fromScene(envScene,0,1,1000).texture;if(oud)oud.dispose()}
maakEnv();
// kademuur: donkere stalen damwand met betonnen deklaag (naar de foto's), fietspad met witte streep
const damwand=(()=>{const t=maakTex(1,g=>{g.fillStyle='#777';g.fillRect(0,0,512,512);for(let x=0;x<512;x+=64){const gr=g.createLinearGradient(x,0,x+64,0);gr.addColorStop(0,'#555');gr.addColorStop(.5,'#9a9a9a');gr.addColorStop(1,'#555');g.fillStyle=gr;g.fillRect(x,0,64,512)}ruis(g,900,60,150,2,6)});const m=M(0x4a4440,{map:t,roughness:.7,metalness:.35});m.userData.tex=1.2;return m})();
for(const [gr,sx] of [[noord,1],[zuid,-1]]){box(300,3,.6,damwand,sx*150,-.5,.3,gr);box(300,.35,1.1,mat.beton,sx*150,1.05,.25,gr);box(300,1.2,60,mat.gras,sx*150,.6,-30.6,gr);box(300,.08,3,mat.asfalt,sx*150,1.24,-8.5,gr)} // kaderand, gras, fietspad
{const wit=M(0xf2efe8,{roughness:.6});for(const [gr,sx] of [[noord,1],[zuid,-1]]){const n=60,im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.02,.12),wit,n),d=new THREE.Object3D();for(let i=0;i<n;i++){d.position.set(sx*(2+i*4.5),1.29,-8.5);d.updateMatrix();im.setMatrixAt(i,d.matrix)}gr.add(im)}}
box(600,1.2,60,mat.gras,0,.6,152);                    // overkant (z 122..182)
// beschoeiing
for(let x=-80;x<=80;x+=2)cyl(.12,2,mat.houtDonker,x,.3,1,x>=0?noord:zuid);

// kraan Paard van Noord (naar Kais foto's): portaal op rails, bordes, machinehuis met VB-logo, rechte vakwerkmast, lange schuine giek
const kr=new THREE.Group();kr.position.set(0,1.2,-4);scene.add(kr);
const kStaal=M(0x4d5b6b,{roughness:.55,metalness:.5}),kGrijs=M(0x8e969e,{roughness:.6,metalness:.3}),geel=M(0xE0B020,{roughness:.5,metalness:.3});
// balk met vierkante doorsnede tussen twee punten
function strut(a,b,w,m,parent){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,L,w),m);o.position.copy(A.clone().add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;(parent||scene).add(o);return o}
// vakwerk met vierkante doorsnede van A naar B, breedte wA -> wB, n vakken
function vakwerk(a,b,wA,wB,n,r,m,parent){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A).normalize();
 const u=new THREE.Vector3(1,0,0);if(Math.abs(d.dot(u))>.9)u.set(0,0,1);u.sub(d.clone().multiplyScalar(d.dot(u))).normalize();const v=d.clone().cross(u);
 const hoek=(t,i)=>{const w=(wA+(wB-wA)*t)/2,c=A.clone().lerp(B,t),s=[[1,1],[-1,1],[-1,-1],[1,-1]][i];return c.add(u.clone().multiplyScalar(s[0]*w)).add(v.clone().multiplyScalar(s[1]*w)).toArray()};
 for(let i=0;i<4;i++)beam(hoek(0,i),hoek(1,i),r,m,parent);
 for(let k=0;k<=n;k++){const t=k/n;for(let i=0;i<4;i++){beam(hoek(t,i),hoek(t,(i+1)%4),r*.5,m,parent);if(k<n)beam(hoek(t,(k%2)?i:(i+1)%4),hoek((k+1)/n,(k%2)?(i+1)%4:i),r*.42,m,parent)}}}
box(20,.12,11,mat.beton,0,.02,-.6,kr); // betonplaat onder de kraan
// rails en portaal (4 schuine kokerpoten, onderwagens met wielen)
for(const z of [-3.6,3.6]){box(16,.25,.5,mat.staalDonker,0,.12,z,kr);for(const x of [-3.4,3.4]){box(2.6,1,1.1,kStaal,x,.75,z,kr);for(const wx of [-.8,.8])cyl(.38,.3,mat.staalDonker,x+wx,.45,z,kr).rotation.x=Math.PI/2}}
for(const sx of [-1,1])for(const sz of [-1,1])strut([sx*3.4,1.2,sz*3.6],[sx*2.3,6.4,sz*2.5],.75,kStaal,kr);
for(const sz of [-1,1]){box(5.4,.8,.8,kStaal,0,6.3,sz*2.5,kr);strut([-3.1,2.2,sz*3.4],[3.1,2.2,sz*3.4],.3,kStaal,kr)}
for(const sx of [-1,1]){box(.8,.8,5.8,kStaal,sx*2.3,6.3,0,kr);strut([sx*3.2,2.2,-3.4],[sx*3.2,2.2,3.4],.3,kStaal,kr)}
// bordes met reling
box(7.6,.25,7.6,kStaal,0,6.85,0,kr);
{const P=[[-3.7,-3.7],[3.7,-3.7],[3.7,3.7],[-3.7,3.7]];for(let k=0;k<4;k++){const A=P[k],B=P[(k+1)%4];for(const y of [7.5,8.0])beam([A[0],y,A[1]],[B[0],y,B[1]],.035,kStaal,kr);for(let t=0;t<=1;t+=.25)beam([A[0]+(B[0]-A[0])*t,7,A[1]+(B[1]-A[1])*t],[A[0]+(B[0]-A[0])*t,8.02,A[1]+(B[1]-A[1])*t],.03,kStaal,kr)}}
for(let i=0;i<14;i++)box(.5,.04,.06,kStaal,3.75,.6+i*.45,1.2,kr); // ladder langs de poot
// draaiend bovendeel; arm.rotation bepaalt de richting van de giek (langs de kade)
const arm=new THREE.Group();arm.position.y=0;kr.add(arm);arm.rotation.y=Math.PI/2;
cyl(2.4,.6,mat.staalDonker,0,7.3,0,arm);
// machinehuis: grijze golfplaat, rode rand, VB-logo op beide zijkanten en achterkant
{const c=document.createElement('canvas');c.width=512;c.height=384;const g=c.getContext('2d');g.fillStyle='#b9bec3';g.fillRect(0,0,512,384);for(let x=0;x<512;x+=10){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x,0,3,384)}
 const gp=new THREE.CanvasTexture(c);const huis=M(0xffffff,{map:gp,roughness:.6,metalness:.25});
 const l=document.createElement('canvas');l.width=512;l.height=384;const q=l.getContext('2d');q.drawImage(c,0,0);q.fillStyle='#CF2515';q.fillRect(14,14,484,356);q.fillStyle='#e8e6e2';q.fillRect(42,40,428,304);
 q.fillStyle='#CF2515';q.beginPath();q.moveTo(70,200);q.lineTo(160,70);q.lineTo(250,200);q.closePath();q.fill(); // driehoek (V-vorm, vereenvoudigd)
 q.beginPath();q.moveTo(70,220);q.lineTo(160,220);q.lineTo(200,320);q.lineTo(120,320);q.closePath();q.fill();
 q.fillRect(270,70,70,250);q.fillRect(340,70,110,60);q.fillRect(340,165,100,55);q.fillRect(340,262,110,58);q.fillStyle='#e8e6e2';q.fillRect(380,110,50,30);q.fillRect(380,208,50,40);
 const lg=M(0xffffff,{map:new THREE.CanvasTexture(l),roughness:.55,metalness:.15});
 const mh=box(5,4.6,7.4,huis,0,9.9,-1,arm);mh.material=[lg,lg,huis,huis,huis,lg];}
box(5.1,.25,7.5,mat.rood,0,12.3,-1,arm);box(5.15,.5,7.55,kStaal,0,7.85,-1,arm);
for(const sx of [-1,1])cyl(1.1,.35,mat.staalDonker,sx*2.6,9,2,arm).rotation.z=Math.PI/2; // tandwiel/lier aan de zijkant
// bestuurderscabine voor op het huis, rood met ramen
box(2.4,2.5,2.2,mat.rood,1.2,13.6,2.2,arm);box(2.2,1.1,.06,mat.glas,1.2,14,3.32,arm);box(.06,1.1,1.8,mat.glas,2.42,14,2.2,arm);box(2.6,.15,2.4,mat.wit,1.2,14.9,2.2,arm);
// rechte mast (vakwerk 2 m) met ladder, bordes en kop
vakwerk([0,12.4,-2.2],[0,31,-1.2],2.2,1.6,11,.12,kStaal,arm);
box(2.8,.2,2.8,kStaal,0,31.1,-1.2,arm);for(const [x,z] of [[-1.4,-2.6],[1.4,-2.6],[1.4,.2],[-1.4,.2]])beam([x,31.1,z],[x,32.1,z],.03,kStaal,arm);
box(1.6,1.2,1.8,kStaal,0,31.8,-1.2,arm); // schijvenkop
// tegengewicht in het frame achter de mast
box(1.8,4,1.6,kGrijs,0,17,-4.4,arm);strut([0,19,-4.4],[0,23,-2.2],.25,kStaal,arm);strut([0,15,-4.4],[0,12.6,-3.5],.25,kStaal,arm);
// A-bok tussen huis en mast
for(const sx of [-1,1])strut([sx*2.2,12.4,2.2],[sx*.8,22,-1.6],.3,kStaal,arm);
// lange giek: voet bij het huis, ± 27 graden uit het lood, geel uiteinde
const gVoet=[0,12.6,2.9],gTop=[0,38.6,16.2];
vakwerk(gVoet,gTop,2.1,.7,16,.11,kStaal,arm);
box(1.1,1.2,1.5,geel,0,38.8,16.6,arm);cyl(.5,.35,geel,0,38.5,17.1,arm).rotation.z=Math.PI/2;
beam([0,32,-1.2],[0,38.6,16.2],.035,mat.staalDonker,arm);beam([.4,32,-1.2],[.3,38.4,16],.035,mat.staalDonker,arm); // topkabels
beam([0,38.3,17.1],[0,27,17.1],.025,mat.staalDonker,arm);box(.6,.9,.4,geel,0,26.6,17.1,arm); // hijskabel en gele haak

const roodKraan=mat.rood;mat.rood=M(0x1d3f87,{roughness:.4}); // pont is blauw (Pont 13); de kraan houdt Paard-van-Noord-rood // vanaf hier gebruikt de pont mat.rood; de kraan houdt zijn eigen rood
// steiger (x 8..24 naar -x), loopbrug
const S=x=>-x;
box(45,.3,4,mat.houtDek,S(52.5),.4,5,zuid);          // steiger ± 45 x 4 m, los van de kade, vanaf x 30 (aanname uit satellietbeeld)
for(let i=0;i<13;i++)for(const z of [3.2,6.8])cyl(.15,2.4,mat.houtDonker,S(31+i*3.6),-.4,z,zuid);
box(2.4,.25,3.2,mat.houtDek,S(38),.85,1.6,zuid);     // loopbrug van de kade naar de steiger
box(1.6,.2,1.5,mat.houtDek,S(53.6),.8,7.3,zuid);box(1.6,.2,1.5,mat.houtDek,S(67.1),.8,7.4,zuid); // loopplanken naar de horeca-ingang en het achterdek
// tweede steiger aan de kraankant: steekt dieper het water in voor zwemruimte (aanname 4 m breed, 16 m diep + T-kop)
box(4,.3,16,mat.houtDek,S(16),.4,8.3,zuid);box(10,.3,4,mat.houtDek,S(16),.4,17,zuid);
for(let i=0;i<5;i++)for(const x of [14.2,17.8])cyl(.15,2.4,mat.houtDonker,S(x),-.4,1.5+i*3.8,zuid);
for(const x of [11.5,20.5]){cyl(.15,2.4,mat.houtDonker,S(x),-.4,16,zuid);cyl(.15,2.4,mat.houtDonker,S(x),-.4,18.5,zuid)}
for(const x of [11.2,20.8]){beam([S(x),.55,17.5],[S(x),-.8,17.5],.05,mat.staalWit,zuid);box(.05,.05,.8,mat.staalWit,S(x),.3,17.9,zuid)} // zwemtrappen
// pont (lokaal: x langs de kade, 34 m, 9 m breed, midden op x=-43,4 z=7,5)
const pont=new THREE.Group();pont.position.set(S(52.5),0,12.1);pont.rotation.y=Math.PI;zuid.add(pont);
pont.name='De Koffieboot';
// OPBOUW (v0.29): de boot bestaat uit 9 benoemde hoofdgroepen; elk onderdeel is een eigen benoemde subgroep (klikbaar voor de website)
const GROEPEN=['Romp','Loketplein','Buurtloket','Productie','Horeca','Dakterras','Stuurhuis','Achterdek','Mensen'],BOOT={};
GROEPEN.forEach(n=>{const g=new THREE.Group();g.name=n;g.userData.niveau='groep';pont.add(g);BOOT[n]={g,d:{}}});
function deel(gr,ond){const G=BOOT[gr];if(!G.d[ond]){const o=new THREE.Group();o.name=ond;o.userData.niveau='onderdeel';G.g.add(o);G.d[ond]=o}return G.d[ond]}
let OND=pont;
// kajuitramen met een beeld van het interieur (houten wand, hanglampen, tafels met mensen, planten) achter een licht spiegelend glas
const binnenTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
 let gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#5a3f2c');gr.addColorStop(.55,'#7a5536');gr.addColorStop(1,'#3a2a20');g.fillStyle=gr;g.fillRect(0,0,256,256);
 for(let x=0;x<256;x+=16){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,0,2,150)}                         // houten wand
 g.fillStyle='#2b211b';g.fillRect(0,0,256,22);for(let x=0;x<256;x+=48)g.fillRect(x,0,10,30);              // platte balken
 for(const x of [50,140,215]){g.strokeStyle='#222';g.beginPath();g.moveTo(x,22);g.lineTo(x,70);g.stroke();const r=g.createRadialGradient(x,78,2,x,78,40);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=r;g.fillRect(x-40,40,80,80);g.fillStyle='#e8c38a';g.beginPath();g.arc(x,74,9,Math.PI,0);g.fill()}
 for(const [x,w] of [[30,70],[150,80]]){g.fillStyle='#c9a27a';g.fillRect(x,170,w,8);g.fillStyle='#3b2c22';g.fillRect(x+8,178,5,60);g.fillRect(x+w-13,178,5,60);
  for(const px of [x-6,x+w-10]){g.fillStyle=['#2f3a4a','#cf2515','#d9d3cb','#3e5e52'][(px*7)%4];g.fillRect(px,140,22,40);g.fillStyle='#e2b894';g.beginPath();g.arc(px+11,128,10,0,7);g.fill()}}
 g.fillStyle='#4f7038';for(let k=0;k<14;k++){g.beginPath();g.arc(235+Math.random()*20,150+Math.random()*60,8+Math.random()*8,0,7);g.fill()}g.fillStyle='#6b4a34';g.fillRect(228,200,26,40);
 const t=new THREE.CanvasTexture(c);return t})();
mat.raam=new THREE.MeshStandardMaterial({map:binnenTex,emissive:0xffffff,emissiveMap:binnenTex,emissiveIntensity:.18,roughness:.12,metalness:.35,envMapIntensity:.8});
// ===== PONT v0.28: pontvorm naar Blueprint schets 0.4 (Pont 13) =====
// hoge blauwe rompwand met de ramen erin, omhoog zwaaiende einden, witte borstwering, stuurhuis als brug op een salon,
// voorklep omlaag op een ponton (loketplein) met klepbok, achter geen klep. Romp loopt pas vanaf x ±12,5 taps toe.
const glasH=new THREE.MeshStandardMaterial({color:0xcfe0e6,roughness:.05,metalness:.6,transparent:true,opacity:.18,envMapIntensity:1.2,depthWrite:false});
const staalM=M(0xb9bdc2,{roughness:.35,metalness:.8}),tegel=M(0xdad5cb,{roughness:.6}),koper=M(0xb87333,{roughness:.4,metalness:.7});
const blauwD=mat.rood.clone();blauwD.side=THREE.DoubleSide;const witD=mat.wit.clone();witD.side=THREE.DoubleSide;
const klepM=M(0x3a3f45,{roughness:.6,metalness:.5}),dakM=M(0x1f2733,{roughness:.6});
const HW=x=>{const a=Math.abs(x);return a<=12.5?4.5:4.5-.9*(a-12.5)/4.7};
function bez(p0,p1,p2,p3,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]])}return o}
function interp(P,x){if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const a=P[i-1],b=P[i],t=(x-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*t}return P[P.length-1][1]}
const blauwP=[[0,3.9],...bez([12.5,3.9],[12.9,3.0],[13.6,2.0],[14.4,2.0],14),[15.3,2.0],...bez([15.3,2.0],[16.4,2.0],[16.9,2.2],[17.2,2.5],6).slice(1)];
const witP=[[0,5.1],...bez([10.3,5.1],[12.1,5.1],[13.3,2.2],[14.4,2.0],16)];
const blauwTop=x=>interp(blauwP,Math.abs(x)),witTop=x=>Math.abs(x)>=14.4?0:interp(witP,Math.abs(x));
function strip(A,B,m){const P=[],I=[];for(let i=0;i<A.length;i++)P.push(...A[i],...B[i]);for(let i=0;i<A.length-1;i++){const a=i*2;I.push(a,a+2,a+1,a+1,a+2,a+3)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;OND.add(o);return o}
// wand langs de romp met variabele onder- en bovenkant (buitenvlak op de rompkant, 0,3 m dik, met bovenkap)
function wand(x0,x1,side,bot,top,m){const N=Math.max(2,Math.ceil(Math.abs(x1-x0)/.2)),Ob=[],Ot=[],Ib=[],It=[];
 for(let i=0;i<=N;i++){const x=x0+(x1-x0)*i/N,zo=side*HW(x),zi=side*(HW(x)-.3),b=bot(x),t=Math.max(top(x),b+.001);Ob.push([x,b,zo]);Ot.push([x,t,zo]);Ib.push([x,b,zi]);It.push([x,t,zi])}
 strip(Ob,Ot,m);strip(Ib,It,m);strip(Ot,It,m)}
// romp onder het dek, stootrand en dek (vlak met toelopende einden)
OND=deel('Romp','Rompschaal');{const sh=new THREE.Shape();const L=17.2,W=4.5,E=3.6,T=12.5;sh.moveTo(-L,-E);sh.lineTo(-T,-W);sh.lineTo(T,-W);sh.lineTo(L,-E);sh.lineTo(L,E);sh.lineTo(T,W);sh.lineTo(-T,W);sh.lineTo(-L,E);sh.closePath();
 const ex=(d,m,y,s)=>{const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,m);o.position.y=y;if(s)o.scale.set(s,1,s);o.castShadow=o.receiveShadow=true;OND.add(o);return o};
 ex(2.6,mat.rood,-1.6);ex(.26,mat.staalDonker,.3,1.012);ex(.4,mat.staalDonker,-.3,1.004);ex(.12,mat.houtDek,1.0,.99)}
// blauwe rompwand: einden als doorlopende wand met zwaai, midden (x -12,5..12,5) met ramen, etalage en deur
for(const sd of [1,-1]){OND=deel('Romp','Rompwand');wand(-17.2,-12.5,sd,()=>1.0,blauwTop,blauwD);wand(12.5,17.2,sd,()=>1.0,blauwTop,blauwD);
 OND=deel('Romp','Borstwering');wand(-14.4,14.4,sd,blauwTop,witTop,witD)}                                             // witte borstwering met afzwaaiende schouders
const OPEN={1:[[-12.25,-9.05,1.4,3.4,'e'],[-8.45,-5.25,1.4,3.4,'e'],[-4.6,-2.2,2.0,3.2,'r'],[-1.8,0.6,2.0,3.2,'r'],[.7,1.7,1.12,3.2,'d'],[2.0,4.4,2.0,3.2,'r'],[4.8,7.2,2.0,3.2,'r'],[7.6,10.0,2.0,3.2,'r'],[10.6,11.5,2.6,3.2,'r']],
 '-1':[[-12.25,-9.05,1.4,3.4,'e'],[-8.45,-5.25,1.4,3.4,'e'],[-4.6,-2.2,2.0,3.2,'r'],[-1.8,0.6,2.0,3.2,'r'],[1.0,3.4,2.0,3.2,'r'],[3.8,6.2,2.0,3.2,'r'],[6.6,9.0,2.0,3.2,'r'],[9.4,11.8,2.0,3.2,'r']]};
for(const sd of [1,-1]){const zc=sd*4.35,ops=OPEN[sd];let cur=-12.5;
 for(const [a,b,y0,y1,k] of ops){if(a>cur)box(a-cur,2.9,.3,mat.rood,(a+cur)/2,2.45,zc,deel('Romp','Rompwand'));if(y0>1.0)box(b-a,y0-1.0,.3,mat.rood,(a+b)/2,(y0+1.0)/2,zc,deel('Romp','Rompwand'));box(b-a,3.9-y1,.3,mat.rood,(a+b)/2,(y1+3.9)/2,zc,deel('Romp','Rompwand'));cur=b;
  const w=b-a,h=y1-y0,cx=(a+b)/2,cy=(y0+y1)/2;
  if(k==='e'){box(w,h,.04,glasH,cx,cy,zc,deel('Productie','Etalageramen'))}
  else if(k==='d'){box(w,h,.08,mat.houtDonker,cx,cy,zc+sd*.05,deel('Horeca','Ingang'))}
  else{const r=box(w-.04,h-.04,.06,mat.raam,cx,cy,zc,deel('Romp','Ramen'));if(((cx*7)|0)%2)r.scale.x=-1}
  if(k!=='d'){box(w+.12,.08,.1,mat.wit,cx,y1+.04,zc+sd*.13,deel('Romp','Kozijnen'));box(w+.12,.1,.12,mat.wit,cx,y0-.03,zc+sd*.14,deel('Romp','Kozijnen'));box(.07,h,.1,mat.wit,a-.02,cy,zc+sd*.13,deel('Romp','Kozijnen'));box(.07,h,.1,mat.wit,b+.02,cy,zc+sd*.13,deel('Romp','Kozijnen'));if(k==='e')box(.07,h,.1,mat.wit,cx,cy,zc+sd*.13,deel('Romp','Kozijnen'))}}
 if(cur<12.5)box(12.5-cur,2.9,.3,mat.rood,(12.5+cur)/2,2.45,zc,deel('Romp','Rompwand'));
 for(let x=-12.3;x<=12.3;x+=.25)box(.04,.04,.03,mat.staalDonker,x,3.82,sd*4.51,deel('Romp','Klinknagels'));           // klinknagels onder de witte rand
 box(.45,1.5,.04,mat.staalDonker,sd>0?9.9:-3.9,2.25,sd*4.51,deel('Romp','Roosters'))}                                // rooster
// kajuit: eindwanden, plafond en dakterras (+4,0)
box(.2,2.63,8.4,mat.wit,-12.5,2.44,0,deel('Productie','Wanden'));box(.2,2.63,8.4,mat.wit,12.5,2.44,0,deel('Achterdek','Achterwand'));box(.1,2.05,1.0,mat.houtDonker,12.62,2.15,-.8,deel('Achterdek','Achterwand')); // achterdeur
for(const [m,y,h] of [[mat.wit,3.875,.25],[mat.houtDek,4.03,.06]]){const D=deel('Dakterras','Dakvloer');box(19.9,h,8.4,m,-2.55,y,0,D);box(2.4,h,8.4,m,11.3,y,0,D);box(2.7,h,1.4,m,8.75,y,-3.5,D);box(2.7,h,5.9,m,8.75,y,1.25,D)} // opening voor de binnentrap
// reling boven de schouders en aan de dakeinden (open naar de einddekken), opening voor de loopbrug achter
for(const sd of [1,-1])for(const sx of [1,-1]){beam([sx*10.3,5.1,sd*4.35],[sx*12.5,5.1,sd*4.35],.035,mat.staalWit,deel('Dakterras','Reling'));beam([sx*12.5,5.1,sd*4.35],[sx*12.5,4.05,sd*4.35],.03,mat.staalWit,deel('Dakterras','Reling'));beam([sx*11.4,5.1,sd*4.35],[sx*11.4,4.6,sd*4.35],.03,mat.staalWit,deel('Dakterras','Reling'))}
beam([-12.5,5.1,-4.35],[-12.5,5.1,4.35],.035,mat.staalWit,deel('Dakterras','Reling'));beam([-12.5,4.6,-4.35],[-12.5,4.6,4.35],.03,mat.staalWit,deel('Dakterras','Reling'));
beam([12.5,5.1,-2.3],[12.5,5.1,4.35],.035,mat.staalWit,deel('Dakterras','Reling'));beam([12.5,4.6,-2.3],[12.5,4.6,4.35],.03,mat.staalWit,deel('Dakterras','Reling'));
for(let z=-4;z<=4.1;z+=1.3){beam([-12.5,4.05,z],[-12.5,5.1,z],.025,mat.staalWit,deel('Dakterras','Reling'));if(z>-2.4)beam([12.5,4.05,z],[12.5,5.1,z],.025,mat.staalWit,deel('Dakterras','Reling'))}
// reling op de einddekken (achter rondom, voor langs de zijden)
for(const sd of [1,-1]){for(const sx of [1,-1]){const P=[];for(let x=14.4;x<=17.21;x+=.7)P.push(x);
 for(let i=0;i<P.length-1;i++)beam([sx*P[i],blauwTop(P[i])+.95,sd*(HW(P[i])-.1)],[sx*P[i+1],blauwTop(P[i+1])+.95,sd*(HW(P[i+1])-.1)],.03,mat.staalWit,deel(sx<0?'Buurtloket':'Achterdek','Reling'));
 for(const x of P)beam([sx*x,blauwTop(x),sd*(HW(x)-.1)],[sx*x,blauwTop(x)+.95,sd*(HW(x)-.1)],.025,mat.staalWit,deel(sx<0?'Buurtloket':'Achterdek','Reling'))}}
box(.25,1.5,7.2,mat.rood,17.08,1.75,0,deel('Achterdek','Achterspiegel'));beam([17.1,3.45,-3.5],[17.1,3.45,3.5],.035,mat.staalWit,deel('Achterdek','Reling'));for(let z=-3.3;z<=3.4;z+=1.1)beam([17.1,2.5,z],[17.1,3.45,z],.025,mat.staalWit,deel('Achterdek','Reling'));
// stuurhuis als brug: witte salon op het dak (6 x 5,6 m) met daarop het stuurhuis (5 x 4,4 m) met schuin glas en donker overstekend dak
{const SX=8;{const SL=deel('Stuurhuis','Salon'),y0=4.03,y1=6.63,wy=(a,b)=>(a+b)/2;
 for(const sd of [1,-1]){const z=sd*2.75;box(.45,2.6,.1,mat.wit,SX-2.78,5.33,z,SL);box(1.3,2.6,.1,mat.wit,SX,5.33,z,SL);box(.45,2.6,.1,mat.wit,SX+2.78,5.33,z,SL);for(const x of [6.4,9.6]){box(1.9,1.27,.1,mat.wit,x,wy(y0,5.3),z,SL);box(1.9,.43,.1,mat.wit,x,wy(6.2,y1),z,SL)}}
 box(.1,2.6,5.6,mat.wit,SX+3,5.33,0,SL);box(.1,2.6,1.25,mat.wit,SX-3,5.33,-2.18,SL);box(.1,1.27,2.2,mat.wit,SX-3,wy(y0,5.3),0,SL);box(.1,.43,2.2,mat.wit,SX-3,wy(6.2,y1),0,SL);box(.1,.55,.9,mat.wit,SX-3,6.355,1.9,SL);box(.1,2.6,.45,mat.wit,SX-3,5.33,2.575,SL);
 box(6,.12,5.6,mat.wit,SX,6.6,0,SL)}
 for(const sd of [1,-1])for(const x of [6.4,9.6])box(1.9,.9,.06,mat.raam,x,5.75,sd*2.82,deel('Stuurhuis','Salon'));
 box(.06,.9,2.2,mat.raam,SX-3.02,5.75,0,deel('Stuurhuis','Salon'));box(.06,2.05,.9,mat.houtDonker,SX-3.02,5.05,1.9,deel('Stuurhuis','Salon'));
 box(5,.5,4.4,mat.wit,SX,6.88,0,deel('Stuurhuis','Stuurhut'));
 const gm=M(0x7f98a6,{roughness:.04,metalness:.9,transparent:true,opacity:.55,envMapIntensity:1.2,side:THREE.DoubleSide});
 const p1=box(.05,1.25,4.5,gm,SX-2.62,7.72,0,deel('Stuurhuis','Stuurhut'));p1.rotation.z=.2;const p2=box(.05,1.25,4.5,gm,SX+2.62,7.72,0,deel('Stuurhuis','Stuurhut'));p2.rotation.z=-.2;
 const p3=box(5.1,1.25,.05,gm,SX,7.72,2.32,deel('Stuurhuis','Stuurhut'));p3.rotation.x=.2;const p4=box(5.1,1.25,.05,gm,SX,7.72,-2.32,deel('Stuurhuis','Stuurhut'));p4.rotation.x=-.2;
 for(const sx of [-1,1])for(const sz of [-1,1])beam([SX+sx*2.5,7.12,sz*2.2],[SX+sx*2.75,8.33,sz*2.45],.05,mat.wit,deel('Stuurhuis','Stuurhut'));
 for(const sx of [-1,1])for(const k of [-1,1])beam([SX+sx*2.5,7.12,k*.75],[SX+sx*2.75,8.33,k*.8],.03,mat.wit,deel('Stuurhuis','Stuurhut'));
 
 // balkon rondom op de salon
 const B=[[SX-3,-2.8],[SX+3,-2.8],[SX+3,2.8],[SX-3,2.8],[SX-3,-2.8]];for(let i=0;i<4;i++){beam([B[i][0],7.6,B[i][1]],[B[i+1][0],7.6,B[i+1][1]],.035,mat.staalWit,deel('Stuurhuis','Balkon'));beam([B[i][0],6.63,B[i][1]],[B[i][0],7.6,B[i][1]],.03,mat.staalWit,deel('Stuurhuis','Balkon'))}
 for(const z of [2.35,2.75])beam([3.6,4.06,z],[5.0,6.63,z],.04,mat.staalWit,deel('Stuurhuis','Trap'));for(let k=1;k<9;k++){const t=k/9;beam([3.6+1.4*t,4.06+2.57*t,2.35],[3.6+1.4*t,4.06+2.57*t,2.75],.02,mat.staalWit,deel('Stuurhuis','Trap'))} // steile trap
 cyl(.07,1.6,mat.staalWit,SX+.6,9.4,0,deel('Stuurhuis','Mast'));const ml=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),mat.lamp);ml.position.set(SX+.6,10.25,0);deel('Stuurhuis','Mast').add(ml);
 box(.9,.5,.7,mat.staalWit,SX+2,8.9,-1.2,deel('Stuurhuis','Mast'))}
// buitentrap op het achterdek met loopbrug naar het dak
for(let k=0;k<10;k++)box(1.1,.06,.27,mat.houtDek,15.95,1.2+k*.17,.15-k*.27,deel('Achterdek','Buitentrap'));
box(1.1,.08,1.1,mat.houtDek,15.95,2.82,-2.95,deel('Achterdek','Buitentrap'));
for(let k=0;k<6;k++)box(.27,.06,1.1,mat.houtDek,15.25-k*.27,2.98+k*.17,-2.95,deel('Achterdek','Buitentrap'));
box(1.3,.08,1.1,mat.houtDek,13.15,4.02,-2.95,deel('Achterdek','Buitentrap'));
for(const z of [-2.35,-3.55])beam([13.8,4.95,z],[15.4,3.75,z],.03,mat.staalWit,deel('Achterdek','Buitentrap'));beam([16.55,2.0,.3],[16.55,3.75,-2.4],.03,mat.staalWit,deel('Achterdek','Buitentrap'));beam([12.5,4.95,-2.35],[13.8,4.95,-2.35],.03,mat.staalWit,deel('Achterdek','Buitentrap'));beam([12.5,4.95,-3.55],[13.8,4.95,-3.55],.03,mat.staalWit,deel('Achterdek','Buitentrap'));
// --- PRODUCTIE (x -12,5..-5): tegelvloer, glazen wand naar de zaal; ovens, deegtafel en rekken staan verderop
box(7.4,.06,8.3,tegel,-8.75,1.13,0,deel('Productie','Vloer'));
box(.12,.9,8.4,mat.wit,-5.05,1.55,0,deel('Productie','Glaswand'));box(.06,1.75,8.4,glasH,-5.05,2.87,0,deel('Productie','Glaswand'));for(let z=-4;z<=4.1;z+=1.6)box(.1,1.75,.1,mat.wit,-5.05,2.87,z,deel('Productie','Glaswand'));
// --- KIOSK / BUURTLOKET op het voordek (x -15,5..-12,5): luik naar voren, naar de klep
{box(3,2.28,.12,mat.wit,-14,2.26,3.4,deel('Buurtloket','Wanden'));box(3,2.28,.12,mat.wit,-14,2.26,-3.4,deel('Buurtloket','Wanden'));
 box(.12,.88,6.8,mat.wit,-15.5,1.56,0,deel('Buurtloket','Wanden'));box(.12,.4,6.8,mat.wit,-15.5,3.2,0,deel('Buurtloket','Wanden'));for(const s of [1,-1])box(.12,1.0,2.0,mat.wit,-15.5,2.5,s*2.4,deel('Buurtloket','Wanden'));
 box(3.3,.12,7.0,mat.wit,-14,3.46,0,deel('Buurtloket','Dak'));box(3.34,.1,7.04,mat.rood,-14,3.56,0,deel('Buurtloket','Dak'));
 box(.7,.07,3.0,koper,-15.65,2.03,0,deel('Buurtloket','Toonbank'));box(.15,.85,2.9,mat.houtDonker,-15.6,1.56,0,deel('Buurtloket','Toonbank'));                      // toonbank
 {const l=box(1.3,.06,3.4,mat.rood,-16.1,3.2,0,deel('Buurtloket','Luifel'));l.rotation.z=-.3;for(let k=0;k<7;k++){const s=box(1.3,.07,.46,k%2?mat.rood:mat.wit,-16.1,3.22,-1.4+k*.47,deel('Buurtloket','Luifel'));s.rotation.z=-.3}} // luifel blauw-wit
 const bord=(w,h,fs)=>{const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d');g.fillStyle='#1d3f87';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='900 '+fs+'px "Arial Black",Arial,sans-serif';g.fillText('HET BUURTLOKET',512,c.height/2+4,960);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.6})};
 const bz=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.5),bord(2.8,.5,140));bz.position.set(-14,3.05,3.47);deel('Buurtloket','Naambord').add(bz);
 const bz2=bz.clone();bz2.position.z=-3.47;bz2.rotation.y=Math.PI;deel('Buurtloket','Naambord').add(bz2);
 // klepbok: stalen portaal boven het voordek met kettingen naar de klep, bord BUURTLOKET aan de dwarsbalk
 for(const s of [1,-1]){box(.35,4.6,.35,klepM,-16.6,3.4,s*3.35,deel('Loketplein','Klepportaal'));beam([-16.6,5.5,s*3.2],[-20.85,1.0,s*3.15],.03,mat.staalDonker,deel('Loketplein','Klepportaal'));cyl(.22,.5,klepM,-16.6,5.95,s*3.35,deel('Loketplein','Klepportaal'))}
 box(.5,.4,7.1,klepM,-16.6,5.85,0,deel('Loketplein','Klepportaal'));
 const bk=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.65),bord(3.6,.65,150));bk.position.set(-16.88,5.1,0);bk.rotation.y=-Math.PI/2;deel('Loketplein','Klepportaal').add(bk);
 for(const s of [1,-1])beam([-16.6,5.62,s*1.6],[-16.6,5.42,s*1.6],.015,mat.staalDonker,deel('Loketplein','Klepportaal'));
 // voorklep omlaag (4 x 6,5 m) op een ponton (7 x 10 m) dat aansluit op de steiger
 const kg=new THREE.Group();kg.position.set(-17.05,1.02,0);kg.rotation.z=.04;deel('Loketplein','Klep').add(kg);
 box(4,.22,6.5,klepM,-2,-.11,0,kg);for(let k=0;k<8;k++)box(.07,.05,6.3,M(0x50565d,{roughness:.5,metalness:.5}),-.25-k*.5,.02,0,kg);
 for(const s of [1,-1]){box(4,.3,.1,klepM,-2,-.05,s*3.25,kg);cyl(.12,.6,klepM,0,-.05,s*2.6,kg).rotation.x=Math.PI/2}
 box(6.8,.9,10.05,M(0x6a4a3a,{roughness:.8,metalness:.3}),-20.6,.25,-.075,deel('Loketplein','Ponton'));box(6.8,.06,10.05,mat.houtDek,-20.6,.73,-.075,deel('Loketplein','Ponton'));
 for(const [a,b] of [[[-24,-5.1],[-24,4.9]],[[-24,-5.1],[-17.3,-5.1]]]){beam([a[0],1.75,a[1]],[b[0],1.75,b[1]],.03,mat.staalWit,deel('Loketplein','Reling'));const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/1.4);for(let i=0;i<=n;i++){const t=i/n;beam([a[0]+(b[0]-a[0])*t,.76,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,1.75,a[1]+(b[1]-a[1])*t],.025,mat.staalWit,deel('Loketplein','Reling'))}}
 box(.45,.45,3.2,mat.houtLicht,-23.55,.98,-2.6,deel('Loketplein','Meubels'));box(3.2,.45,.45,mat.houtLicht,-21.8,.98,-4.7,deel('Loketplein','Meubels'));           // bankjes
 for(const [x,z] of [[-22.6,2.6],[-21.2,-3.4],[-23.2,.6]]){cyl(.04,1.05,mat.staalDonker,x,1.28,z,deel('Loketplein','Meubels'));cyl(.32,.04,mat.houtLicht,x,1.82,z,deel('Loketplein','Meubels'))} // statafels
 for(const [x,z] of [[-23.9,4.85],[-23.9,-5.0]])cyl(.05,2.6,mat.staalWit,x,2.05,z,deel('Loketplein','Lantaarns'))}
// naam op de rompwand (beide zijden), wit op blauw
{const c=document.createElement('canvas');c.width=1024;c.height=96;const g=c.getContext('2d');g.fillStyle='#ffffff';g.font='900 80px Impact,"Arial Black",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DE KOFFIEBOOT',512,52);
 const nm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,roughness:.7});
 for(const sgn of [1,-1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(8,.75),nm);p.position.set(sgn>0?2.6:2.6,3.53,sgn*4.515);if(sgn<0){p.rotation.y=Math.PI;p.position.x=4.6}deel('Romp','Naam').add(p)}}
// plaatnaden, bolders, keukenafvoer, reddingsboeien
{const naad=M(0x14285a,{roughness:.5});for(const zz of [4.51,-4.51]){for(const y of [-.55])box(25,.05,.03,naad,0,y,zz,deel('Romp','Plaatnaden'));for(let x=-12;x<=12;x+=3)box(.04,1.2,.03,naad,x,-.75,zz,deel('Romp','Plaatnaden'))}}
for(const x of [-16.2,16.2])for(const z of [-3.0,3.0]){if(x<0&&Math.abs(z)<3.3)continue;cyl(.17,.5,mat.staalDonker,x,1.38,z,deel(x<0?'Buurtloket':'Achterdek','Bolders'));cyl(.24,.06,mat.staalDonker,x,1.65,z,deel(x<0?'Buurtloket':'Achterdek','Bolders'))}
for(const x of [-16.2,16.2])for(const z of [-3.1,3.1]){if(x<0)continue;}
cyl(.16,1.3,mat.staalWit,-7,4.7,-1.9,deel('Productie','Afvoer'));cyl(.24,.12,mat.staalWit,-7,5.4,-1.9,deel('Productie','Afvoer'));
for(const [x,z] of [[-9,4.53],[9,4.53],[-9,-4.53],[9,-4.53]]){const t=new THREE.Mesh(new THREE.TorusGeometry(.38,.1,8,16),M(0xE8E6E3,{roughness:.5}));t.position.set(x,4.5,z);deel('Romp','Reddingsboeien').add(t);const t2=new THREE.Mesh(new THREE.TorusGeometry(.38,.1,8,16,Math.PI/2),M(0xCF2515,{roughness:.45}));t2.position.copy(t.position);t2.position.z+=Math.sign(z)*.005;deel('Romp','Reddingsboeien').add(t2)}
// lichtsnoeren boven het dakterras en over het loketplein
for(const [x,z] of [[-12.4,4.2],[12.4,4.2],[-12.4,-4.2],[12.4,-4.2],[0,4.2],[0,-4.2]])cyl(.05,2.2,mat.staalWit,x,6.2,z,deel('Dakterras','Lichtsnoeren'));
const snoer=(A,B,sag)=>{for(let i=0;i<=12;i++){const t=i/12;const bl=new THREE.Mesh(new THREE.SphereGeometry(.12,6,4),mat.lamp);bl.position.set(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-Math.sin(Math.PI*t)*sag,A[2]+(B[2]-A[2])*t);OND.add(bl)}};
OND=deel('Dakterras','Lichtsnoeren');for(const zz of [4.2,-4.2]){snoer([-12.4,7.3,zz],[0,7.3,zz],.5);snoer([0,7.3,zz],[12.4,7.3,zz],.5)}
OND=deel('Loketplein','Lichtsnoeren');snoer([-16.6,5.9,3.2],[-23.9,3.35,4.85],.5);snoer([-16.6,5.9,-3.2],[-23.9,3.35,-5.0],.5);
OND=pont;
// ===== UITERLIJK v0.33: details zoals de gekozen stills =====
{// witte waterlijn rondom de romp (net boven het water)
 const sh=new THREE.Shape(),L=17.2,W=4.5,E=3.6,T=12.5;sh.moveTo(-L,-E);sh.lineTo(-T,-W);sh.lineTo(T,-W);sh.lineTo(L,-E);sh.lineTo(L,E);sh.lineTo(T,W);sh.lineTo(-T,W);sh.lineTo(-L,E);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:.09,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,mat.wit);o.name='waterlijn · wit';o.position.y=.12;o.scale.set(1.008,1,1.008);deel('Romp','Waterlijn').add(o)}
{// overstekend stuurhuisdak: breder dak met blauwe dakrand en blauw-witte streepjesrand (zoals de markies)
 const SX=8,DW=7.6,DD=6.8,y=8.5,G=deel('Stuurhuis','Dak');
 box(DW,.14,DD,mat.wit,SX,y+.2,0,G);box(DW+.08,.32,DD+.08,mat.rood,SX,y,0,G);box(DW-.2,.06,DD-.2,mat.wit,SX,y-.17,0,G);
 const bl=[],wi=[],h=.32,yy=y-.32;
 const rand=(x0,z0,x1,z1)=>{const Lr=Math.hypot(x1-x0,z1-z0),n=Math.round(Lr/.42);for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,langs=Math.abs(x1-x0)>Math.abs(z1-z0);(i%2?wi:bl).push(langs?[Lr/n,h,.03,x,yy,z]:[.03,h,Lr/n,x,yy,z])}};
 const a=DW/2+.05,b=DD/2+.05;rand(SX-a,-b,SX+a,-b);rand(SX-a,b,SX+a,b);rand(SX-a,-b,SX-a,b);rand(SX+a,-b,SX+a,b);
 for(const [lijst,m,nm] of [[bl,mat.rood,'streepjesrand blauw'],[wi,mat.wit,'streepjesrand wit']]){const o=new THREE.Mesh(blokken(lijst),m);o.name=nm;o.castShadow=true;G.add(o)}
 // ronde golfjes onder de rand (schulprand)
 // mast iets hoger zodat de vlaggetjeslijn vrij loopt
 cyl(.05,1.4,mat.staalWit,SX+.6,10.9,0,deel('Stuurhuis','Mast'))}
{// vlaggetjeslijn van de mast naar het klepportaal en naar de achtersteven
 const P=[],Cl=[],kl=[new THREE.Color(0x1E4FA8),new THREE.Color(0xF2EEE6),new THREE.Color(0xF2B33D)];
 const lijn=(A,B,sag,n)=>{let vorige=null;for(let i=0;i<=n;i++){const t=i/n,p=new THREE.Vector3(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-Math.sin(Math.PI*t)*sag,A[2]+(B[2]-A[2])*t);
   if(vorige){const m=vorige.clone().lerp(p,.5),c=kl[i%3];const tip=m.clone();tip.y-=.42;P.push(vorige.x,vorige.y,vorige.z,p.x,p.y,p.z,tip.x,tip.y,tip.z);for(let k=0;k<3;k++)Cl.push(c.r,c.g,c.b)}vorige=p}
   const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...A),new THREE.Vector3(...B)]);};
 lijn([8.6,11.55,0],[-16.6,6.1,0],1.6,34);lijn([8.6,11.55,0],[17.0,6.4,0],.7,14);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cl,3));g.computeVertexNormals();
 const o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.8}));o.name='vlaggetjes · doek';o.castShadow=true;deel('Stuurhuis','Vlaggetjes').add(o);
 // het koord zelf
 const koord=(A,B,sag,n)=>{const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(new THREE.Vector3(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-Math.sin(Math.PI*t)*sag,A[2]+(B[2]-A[2])*t))}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x333333}));l.name='koord';deel('Stuurhuis','Vlaggetjes').add(l)};
 koord([8.6,11.55,0],[-16.6,6.1,0],1.6,34);koord([8.6,11.55,0],[17.0,6.4,0],.7,14)}
{// vlaggenstok met Amsterdamse vlag op de achtersteven
 const G=deel('Achterdek','Vlag');cyl(.04,3.2,mat.staalWit,17.0,4.85,0,G);
 const c=document.createElement('canvas');c.width=192;c.height=128;const x=c.getContext('2d');x.fillStyle='#C8102E';x.fillRect(0,0,192,128);x.fillStyle='#111';x.fillRect(0,128/3,192,128/3);
 x.strokeStyle='#fff';x.lineWidth=7;for(const cx of [56,96,136]){x.beginPath();x.moveTo(cx-12,52);x.lineTo(cx+12,76);x.moveTo(cx+12,52);x.lineTo(cx-12,76);x.stroke()}
 const vg=new THREE.PlaneGeometry(1.35,.9,8,1);const pos=vg.attributes.position;for(let i=0;i<pos.count;i++){const px=pos.getX(i);pos.setZ(i,Math.sin((px+.675)*4)*.07*(px+.675))}vg.computeVertexNormals();
 const v=new THREE.Mesh(vg,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide,roughness:.8}));v.name='vlag · Amsterdam';v.position.set(17.0+.7,5.95,0);v.rotation.y=-.35;v.position.z=.24;G.add(v)}
{// naam en thuishaven op de achtersteven
 const c=document.createElement('canvas');c.width=1024;c.height=200;const x=c.getContext('2d');x.fillStyle='#fff';x.textAlign='center';x.font='900 92px Impact,"Arial Black",sans-serif';x.fillText('DE KOFFIEBOOT',512,100);x.font='700 52px "Arial Black",sans-serif';x.fillText('AMSTERDAM',512,170);
 const p=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.9),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,roughness:.7}));p.name='naam achtersteven';p.position.set(17.215,1.75,0);p.rotation.y=Math.PI/2;deel('Achterdek','Achterspiegel').add(p)}
{// scheepsdetails: patrijspoorten in de witte borstwering aan de achterzijde en lampen bij het naambord van het portaal
 const ring=M(0xC9A24A,{roughness:.3,metalness:.8}),g=new THREE.TorusGeometry(.17,.04,8,16),gl=new THREE.CircleGeometry(.15,16);
 for(const sd of [1,-1])for(const x of [13.6,14.6,15.6]){const z=sd*(HW(x)+.01);const r=new THREE.Mesh(g,ring);r.position.set(x,1.55,z);deel('Romp','Patrijspoorten').add(r);const q=new THREE.Mesh(gl,mat.raam);q.position.set(x,1.55,z-sd*.005);if(sd<0)q.rotation.y=Math.PI;deel('Romp','Patrijspoorten').add(q)}
 for(const s of [1,-1]){beam([-16.75,5.6,s*1.2],[-17.25,5.75,s*1.2],.025,mat.staalDonker,deel('Loketplein','Klepportaal'));const k=new THREE.Mesh(new THREE.ConeGeometry(.16,.18,12,1,true),mat.staalDonker);k.position.set(-17.28,5.66,s*1.2);deel('Loketplein','Klepportaal').add(k);const b=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),mat.lamp);b.position.set(-17.28,5.58,s*1.2);deel('Loketplein','Klepportaal').add(b)}}

const nacht=[];for(const [x,y,z] of [[-8,5.6,0],[6,5.6,0],[-20,2.6,0],[-8,2.2,4.6],[-14,2.8,0]]){const pl=new THREE.PointLight(0xffb26a,0,16,2);pl.position.set(x,y,z);pont.add(pl);nacht.push(pl)}
function parasol(x,y,z,gr,open){cyl(.04,2.6,mat.staalDonker,x,y+1.3,z,gr);const c=new THREE.Mesh(new THREE.ConeGeometry(open?1.7:.22,open?.6:1.7,10),mat.doek);c.position.set(x,y+(open?2.5:1.9),z);c.castShadow=true;gr.add(c);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,12),mat.houtLicht);t.position.set(x+.2,y+.76,z+.1);t.castShadow=true;gr.add(t);cyl(.04,.75,mat.staalDonker,x+.2,y+.38,z+.1,gr)}
for(let i=2;i<7;i++)parasol(S(42+i*4.6),.55,4.6+(i%2)*.8,zuid,i%3!==2);

// mensen en stoelen: eenvoudige gezichtsloze figuren (tijdelijk, later te vervangen door gratis GLB-modellen)
const SK=[0xe2b894,0xc98e68,0x8d5a3c,0xf0cfae],CL=[0x2f3a4a,0xd9d3cb,0x7a5a45,0x3e5e52,0xCF2515,0xE8E6E3,0x5b6b8a,0xc9a27a],pm={};
const pmat=c=>pm[c]||(pm[c]=M(c,{roughness:.9}));
// mensen: gezichtsloos maar met lichaamsbouw (benen, heupen, taps bovenlijf, armen, nek, hoofd met haar), lengte en kleding wisselen
const HAAR=[0x2a1d14,0x5a3a22,0xb08a55,0x111111,0x8a8a8a,0x6b2e1a],romp=new THREE.CylinderGeometry(.19,.15,.58,10),hoofdG=new THREE.SphereGeometry(.105,12,10),haarG=new THREE.SphereGeometry(.112,12,8,0,Math.PI*2,0,Math.PI*.55);
function lid(a,b,r1,r2,m,g){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),7),m);o.position.copy(A.clone().add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o}
function person(gr,x,y,z,ry,ci,seated,sc){if(!person.aan)return new THREE.Group(); // oude stand-in figuren zijn vervangen door Rocketbox-mensen (alleen fietsers houden ze)
const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;g.scale.setScalar((sc||1)*(.93+((ci*37)%11)/80));
 const cl=pmat(CL[ci%CL.length]),sk=pmat(SK[ci%SK.length]),pa=pmat([0x2b2b30,0x3b4a66,0x6b6258,0x1e1e22][ci%4]),sh=pmat(0x1a1a1a),hr=pmat(HAAR[(ci*5)%HAAR.length]);
 const st=((ci*13)%7-3)*.03;
 if(seated){for(const sx of [-.09,.09]){lid([sx,.5,0],[sx,.5,.42],.075,.065,pa,g);lid([sx,.5,.42],[sx,.06,.46],.06,.05,pa,g);box(.1,.07,.22,sh,sx,.04,.52,g)}
  box(.32,.16,.24,pa,0,.55,0,g);const t=new THREE.Mesh(romp,cl);t.scale.z=.68;t.position.set(0,.92,0);g.add(t);
  for(const sx of [-1,1]){lid([sx*.21,1.15,0],[sx*.24,.86,.18],.05,.045,cl,g);lid([sx*.24,.86,.18],[sx*.16,.8,.42],.042,.038,cl,g);const hd=new THREE.Mesh(new THREE.SphereGeometry(.04,6,4),sk);hd.position.set(sx*.15,.8,.45);g.add(hd)}
  cyl(.045,.1,sk,0,1.24,0,g);const h=new THREE.Mesh(hoofdG,sk);h.scale.set(1,1.15,1.05);h.position.set(0,1.38,0);g.add(h);const ha=new THREE.Mesh(haarG,hr);ha.position.set(0,1.4,-.01);ha.scale.set(1,1.1,1.08);g.add(ha)}
 else{for(const sx of [-1,1]){const zz=sx*st;lid([sx*.09,.88,0],[sx*.09,.46,zz*.6],.08,.065,pa,g);lid([sx*.09,.46,zz*.6],[sx*.09,.06,zz],.06,.05,pa,g);box(.1,.08,.25,sh,sx*.09,.04,zz+.05,g)}
  box(.32,.18,.22,pa,0,.92,0,g);const t=new THREE.Mesh(romp,cl);t.scale.z=.66;t.position.set(0,1.28,0);g.add(t);
  for(const sx of [-1,1]){lid([sx*.21,1.52,0],[sx*.25,1.2,-sx*st*.5],.052,.046,cl,g);lid([sx*.25,1.2,-sx*st*.5],[sx*.25,.92,-sx*st],.042,.036,cl,g);const hd=new THREE.Mesh(new THREE.SphereGeometry(.042,6,4),sk);hd.position.set(sx*.25,.88,-sx*st);g.add(hd)}
  cyl(.045,.1,sk,0,1.6,0,g);const h=new THREE.Mesh(hoofdG,sk);h.scale.set(1,1.15,1.05);h.position.set(0,1.74,0);g.add(h);const ha=new THREE.Mesh(haarG,hr);ha.position.set(0,1.76,-.01);ha.scale.set(1,1.1,1.08);g.add(ha)}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});gr.add(g);return g}
function sit(gr,x,y,z,ry,who,ci){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;gr.add(g);
 box(.45,.05,.45,mat.houtLicht,0,.45,0,g);box(.45,.5,.05,mat.houtLicht,0,.72,-.22,g);for(const a of [-.19,.19])for(const b of [-.19,.19])box(.04,.44,.04,mat.houtLicht,a,.22,b,g);
 if(who)person(g,0,0,.02,0,ci,true);return g}
function tafel(gr,x,y,z,ci,fill){sit(gr,x,y,z-.8,0,fill[0],ci);sit(gr,x,y,z+.8,Math.PI,fill[1],ci+3)}
// op de pont: bij elke parasol twee stoelen

// op de steiger
for(let i=2;i<7;i++)tafel(zuid,S(42+i*4.6)-.2,.55,4.6+(i%2)*.8+.1,i*3+1,[i%2===0,i%3!==0]);
// wachtrij bij het loket op het voordek en iemand bij de reling
// binnenin de winkel: ovens, deegtafel, broodrekken, koffiebar, bakkers
{const brood=M(0xb77a3c,{roughness:.9}),deeg=M(0xe9d9b8,{roughness:.9}),vuur=M(0xff8a30,{roughness:.4,emissive:0xff6a10,emissiveIntensity:.7});
 // oven-bank tegen de achterwand (x -5): drie dekovens met gloeiend raam, afzuigkap
 for(const z of [-2.3,-.7,.9]){box(1.5,1.9,1.3,staalM,-5.9,2.05,z,deel('Productie','Ovens'));box(.05,.8,.9,vuur,-5.14+.05-.62,2.05,z,deel('Productie','Ovens'));for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),brood);b.scale.set(1.3,.6,.8);b.position.set(-5.9+.4,1.85+k*.3,z);deel('Productie','Ovens').add(b)}}
 box(1.3,.45,5.4,staalM,-5.9,3.5,-.7,deel('Productie','Ovens'));
 // deegtafel in het midden met deegballen en deegrol, zichtbaar vanuit voor- en zijglas
 box(2.6,.1,1.2,staalM,-8.6,1.95,-1.3,deel('Productie','Deegtafel'));for(const x of [-9.6,-7.6])for(const z of [-1.8,-.8])box(.08,.8,.08,staalM,x,1.55,z,deel('Productie','Deegtafel'));box(2.4,.05,1,staalM,-8.6,1.2,-1.3,deel('Productie','Deegtafel'));
 for(let k=0;k<6;k++){const d=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),deeg);d.position.set(-9.4+k*.32,2.1,-1.1+(k%2)*.35);d.scale.y=.7;deel('Productie','Deegtafel').add(d)}
 // broodrekken tegen de -z wand met vers brood
 for(const x of [-12.3,-11.1,-9.9]){for(const z of [-3.3]){box(.05,2.6,.05,mat.houtDonker,x-.5,2.3,z+.3,deel('Productie','Broodrekken'));box(.05,2.6,.05,mat.houtDonker,x+.5,2.3,z+.3,deel('Productie','Broodrekken'));for(let r=0;r<4;r++){box(1.1,.05,.55,mat.houtDonker,x,1.5+r*.55,z,deel('Productie','Broodrekken'));for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),brood);b.scale.set(1.5,.65,.8);b.position.set(x-.4+k*.27,1.66+r*.55,z);deel('Productie','Broodrekken').add(b)}}}}
 // kiosk-inrichting: koffiemachine, bekers en broodmanden op de voortoonbank (luik naar de klep), broodwand achterin
 box(.55,.6,.8,staalM,-15.25,2.35,-1.0,deel('Buurtloket','Inrichting'));box(.2,.1,.18,mat.staalDonker,-15.5,2.1,-1.0,deel('Buurtloket','Inrichting'));
 for(let k=0;k<4;k++)cyl(.05,.13,mat.wit,-15.6,2.12,-.2+k*.2,deel('Buurtloket','Inrichting'));
 for(const z of [.7,1.3]){box(.45,.2,.55,M(0x9c6b43,{roughness:.9}),-15.55,2.17,z,deel('Buurtloket','Inrichting'));for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),brood);b.scale.set(.8,.65,1.4);b.position.set(-15.55,2.32,z-.17+k*.17);deel('Buurtloket','Inrichting').add(b)}}
 for(const r of [0,1,2,3]){box(.45,.05,5.6,mat.houtDonker,-12.85,1.5+r*.55,0,deel('Buurtloket','Broodwand'));for(let k=0;k<12;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),brood);b.scale.set(.8,.65,1.4);b.position.set(-12.85,1.66+r*.55,-2.6+k*.47);deel('Buurtloket','Broodwand').add(b)}}
 // hanglampen en 's avonds warm licht
 for(const [x,z] of [[-11.5,-1.5],[-9,1.5],[-7,-1.5],[-11.5,1.5]]){beam([x,3.75,z],[x,3.3,z],.01,mat.staalDonker,deel('Productie','Lampen'));const l=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),mat.lamp);l.position.set(x,3.2,z);deel('Productie','Lampen').add(l)}
 const pl=new THREE.PointLight(0xffc880,0,10,2);pl.position.set(-9,3.0,0);pont.add(pl);nacht.push(pl);
 // bakkers (wit) en bediening
 person(deel('Mensen','Personeel'),-8.6,1.12,-.5,Math.PI,5,false);person(deel('Mensen','Personeel'),-10.4,1.12,-2.3,0,5,false);person(deel('Mensen','Personeel'),-7.2,1.12,1.6,Math.PI/2,5,false);
 person(deel('Mensen','Personeel'),-14.6,1.12,-.6,-Math.PI/2,5,false);person(deel('Mensen','Personeel'),-14.6,1.12,.9,-Math.PI/2,5,false);   // verkopers in het kiosk
 // wachtrij op het voordek en de klep, mensen op het loketplein
 [[-16.3,1.12,.1,0],[-17.4,1.02,-.2,.1],[-18.3,.98,.3,-.1],[-19.2,.95,0,.2],[-20.1,.92,-.4,0]].forEach(([x,y,z,r],i)=>person(deel('Mensen','Wachtrij'),x,y,z,Math.PI/2+r,i+2,false));
 [[-22.6,2.0,2.5],[-23.0,3.2,-.3],[-21.6,-4.0,.8],[-21.9,-3.3,-2.6],[-22.5,1.1,1.9]].forEach(([x,z,r],i)=>person(deel('Mensen','Loketplein'),x,.76,z,r,i+8,false));
}
person(deel('Mensen','Dakterras'),11.8,4.06,3.6,Math.PI,5,false);person(deel('Mensen','Dakterras'),-5,4.06,-3.6,0,7,false);person(deel('Mensen','Dakterras'),6,4.06,-3.5,0.3,1,false);
// op de kade: groepje bij de kraan en bij de zwemsteiger
[[-9,-2.5,1.2],[-8.2,-2.2,3.8],[-17,-1.5,2.4],[-18,-2,3.9],[-15.5,-2.4,0.6]].forEach(([x,z,ry],i)=>person(zuid,x,1.2,z,ry,i+4,false));
// zwemmers (alleen hoofden) bij de zwemsteiger
[[-20,20.5],[-22.5,19.5],[-12,21],[-9.5,22.5]].forEach(([x,z],i)=>{const h=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),pmat(i%2?0xCF2515:0xF4F1EE));h.position.set(x,-.02,z);zuid.add(h)});
// fietsers op het fietspad
const fiets=[];
function fietser(gr,x,dir,ci){const g=new THREE.Group();g.position.set(x,1.28,-8.5);g.rotation.y=dir>0?0:Math.PI;
 for(const bx of [-.55,.55]){const w=new THREE.Mesh(new THREE.TorusGeometry(.34,.03,6,16),mat.staalDonker);w.position.set(bx,.36,0);g.add(w)}
 beam([-.55,.36,0],[0,.62,0],.025,mat.staalDonker,g);beam([0,.62,0],[.45,.7,0],.025,mat.staalDonker,g);beam([-.55,.36,0],[.55,.36,0],.025,mat.staalDonker,g);
 person.aan=true;const p=person(g,-.05,0,0,Math.PI/2,ci,true);person.aan=false;p.position.set(-.05,.2,0);p.scale.set(.95,.95,.95);gr.add(g);fiets.push({g,dir,x0:x,sp:2.2+ci*.3,lim:gr===noord?[5,95]:[-95,-5]});return g}
fietser(zuid,-40,1,3);fietser(noord,60,-1,6);
// fenders en trossen
for(let i=-14;i<=14;i+=7)cyl(.35,1.2,mat.rubber,i,.6,4.7,deel('Romp','Fenders'));
box(34,.05,.05,mat.touw,0,.9,4.6,deel('Romp','Fenders'));
// ===== INTERIEUR v0.31 (oud-Amsterdams bruin café): volledig binnenwerk (horeca, buurtloket, productie, toiletten, binnentrap, salon) =====
// vloerpeil binnen +1,12; plafond onderkant +3,75; binnenkant rompwand op z ±4,2
const BV=1.12,BP=3.75,BZ=4.2;
const eik=M(0x7a4e2c,{roughness:.6}),eikDonker=M(0x4a2c1a,{roughness:.55}),velours=M(0x5b2219,{roughness:.55}),thonet=M(0x2b1a10,{roughness:.45}),creme=M(0xe6d2a8,{roughness:.85}),marmer=M(0xeeeae2,{roughness:.25}),gietijzer=M(0x1a1a1a,{roughness:.5,metalness:.5}),opaal=M(0xf6efe0,{roughness:.3,emissive:0xffd9a0,emissiveIntensity:.25}),messing=M(0xb08d57,{roughness:.3,metalness:.85}),
 zwartStaal=M(0x1d1e20,{roughness:.45,metalness:.6}),steen=M(0xe6e1d8,{roughness:.35}),porselein=M(0xf4f4f2,{roughness:.2}),plantM=M(0x3f6b35,{roughness:.9}),potM=M(0xc56b45,{roughness:.8}),
 lambris=M(0x4e301d,{roughness:.6});
Object.entries({thonet,creme,marmer,gietijzer,opaal,eik,eikDonker,velours,messing,zwartStaal,steen,porselein,plantM,potM,lambris}).forEach(([k,m])=>m.name=k);
// samengevoegde vorm uit blokken (één mesh per meubel-type), en instanties per type
function blokken(parts){const P=[],N=[],U=[];for(const [w,h,d,x,y,z] of parts){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);U.push(...g.attributes.uv.array)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return g}
function reeks(geo,m,lijst,parent,naam){const im=new THREE.InstancedMesh(geo,m,lijst.length),d=new THREE.Object3D();lijst.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.rotation.set(0,p[3]||0,0);d.scale.setScalar(p[4]||1);d.updateMatrix();im.setMatrixAt(i,d.matrix)});
 im.castShadow=im.receiveShadow=true;im.name=naam;parent.add(im);return im}
const stoelG=blokken([[.44,.04,.44,0,.45,0],[.44,.4,.035,0,.68,-.2],[.035,.45,.035,-.19,.225,-.19],[.035,.45,.035,.19,.225,-.19],[.035,.45,.035,-.19,.225,.19],[.035,.45,.035,.19,.225,.19],[.035,.25,.035,-.19,.6,-.2],[.035,.25,.035,.19,.6,-.2]]);
const kussenG=blokken([[.4,.05,.4,0,.495,.01]]);
const kruk=blokken([[.36,.05,.36,0,.76,0],[.04,.74,.04,-.14,.37,-.14],[.04,.74,.04,.14,.37,-.14],[.04,.74,.04,-.14,.37,.14],[.04,.74,.04,.14,.37,.14],[.32,.03,.03,0,.28,.14],[.32,.03,.03,0,.28,-.14]]);
const tafelVk=blokken([[.75,.04,.75,0,.74,0]]),tafelPoot=blokken([[.06,.72,.06,0,.36,0],[.5,.03,.08,0,.015,0],[.08,.03,.5,0,.015,0]]);
// vorm uit losse onderdelen samenvoegen (alle soorten geometrie), voor instanties
function samen(list){const P=[],N=[],U=[];for(const [g0,x,y,z,rx,ry,rz] of list){const g=g0.index?g0.toNonIndexed():g0.clone();if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x,y,z);
 P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);U.push(...(g.attributes.uv?g.attributes.uv.array:new Float32Array(g.attributes.position.count*2)))}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return g}
const C=(r,h,n)=>new THREE.CylinderGeometry(r,r,h,n||8),TRS=(r,t,a)=>new THREE.TorusGeometry(r,t,6,18,a||Math.PI*2);
// Thonet-caféstoel (gebogen hout, ronde zitting): zitter kijkt naar +z
const thonetG=samen([[C(.21,.035,18),0,.46,0],[TRS(.205,.016),0,.44,0,Math.PI/2],[TRS(.165,.01),0,.2,0,Math.PI/2],
 ...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[C(.016,.46),a*.15,.23,b*.15]),
 [C(.016,.5),-.16,.7,-.2,-.12],[C(.016,.5),.16,.7,-.2,-.12],[TRS(.16,.017,Math.PI),0,.8,-.23,-.12],[TRS(.1,.012,Math.PI),0,.8,-.225,-.12]]);
// bistrotafel: rond marmeren blad op gietijzeren voet
const bistroBlad=samen([[C(.3,.03,24),0,.75,0]]),bistroVoet=samen([[C(.03,.7),0,.38,0],[C(.24,.03,16),0,.015,0],[C(.07,.05,10),0,.72,0]]);
// klein vierkant tafeltje met Perzisch kleedje (bruin-café-klassieker)
const kleedTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#7b1d1a';g.fillRect(0,0,256,256);
 g.strokeStyle='#1f2a52';g.lineWidth=18;g.strokeRect(14,14,228,228);g.strokeStyle='#d9b26a';g.lineWidth=4;g.strokeRect(30,30,196,196);g.strokeRect(6,6,244,244);
 g.fillStyle='#1f2a52';g.beginPath();g.moveTo(128,62);g.lineTo(194,128);g.lineTo(128,194);g.lineTo(62,128);g.closePath();g.fill();g.fillStyle='#d9b26a';g.beginPath();g.moveTo(128,92);g.lineTo(164,128);g.lineTo(128,164);g.lineTo(92,128);g.closePath();g.fill();
 g.fillStyle='#e8dcc0';for(const [x,y] of [[52,52],[204,52],[52,204],[204,204]]){g.beginPath();g.arc(x,y,10,0,7);g.fill()}
 for(let i=0;i<900;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.15+')';g.fillRect(Math.random()*256,Math.random()*256,2,2)}return new THREE.CanvasTexture(c)})();
const kleedM=M(0xffffff,{map:kleedTex,roughness:.95});kleedM.name='perzischKleedje';
const kleedTafelG=samen([[new THREE.BoxGeometry(.6,.04,.6),0,.72,0],...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[new THREE.BoxGeometry(.045,.7,.045),a*.26,.35,b*.26])]);
const kleedG=samen([[new THREE.BoxGeometry(.7,.012,.7),0,.746,0],[new THREE.BoxGeometry(.7,.14,.01),0,.68,.35],[new THREE.BoxGeometry(.7,.14,.01),0,.68,-.35],[new THREE.BoxGeometry(.01,.14,.7),.35,.68,0],[new THREE.BoxGeometry(.01,.14,.7),-.35,.68,0]]);
// ramen worden echt glas: het interieurplaatje verdwijnt, je kijkt nu naar binnen
mat.raam.map=null;mat.raam.emissiveMap=null;mat.raam.color.set(0xd4e2e8);mat.raam.emissive.set(0xffc27a);mat.raam.transparent=true;mat.raam.opacity=.2;mat.raam.depthWrite=false;mat.raam.roughness=.04;mat.raam.metalness=.4;mat.raam.envMapIntensity=1.3;mat.raam.needsUpdate=true;
// --- wandbekleding binnen: lambrisering onder de ramen (horeca hout, productie tegel), wit erboven en tussen de ramen
for(const sd of [1,-1]){const zc=sd*(BZ-.02),ops=OPEN[sd];let cur=-12.4;const kl=x=>x<-5.05?tegel:lambris;
 const W=deel('Horeca','Wandbekleding'),WP=deel('Productie','Wanden');const wg=x=>x<-5.05?WP:W;
 const vak=(a,b,y0,y1,m)=>{if(m===mat.wit&&(a+b)/2>-5.05)m=creme;if(b-a>.01&&y1-y0>.01)box(b-a,y1-y0,.04,m,(a+b)/2,(y0+y1)/2,zc,wg((a+b)/2))};
 for(const [a,b,y0,y1,k] of ops){if(a<-5.05&&b>-5.05){}vak(cur,a,BV,BP,mat.wit);if(k!=='d')vak(a,b,BV,y0,kl(a));vak(a,b,y1,BP,mat.wit);cur=b}
 vak(cur,12.4,BV,BP,mat.wit);
 box(17.3,.12,.05,eikDonker,3.75,2.0-.06+.0,sd*(BZ-.05),W)}                                       // vensterbank in de horeca
// --- horeca: vloer, plafondbalken
box(17.4,.03,8.38,M(0x5c3a22,{roughness:.6,name:'vloerEik'}),3.75,BV+.015,0,deel('Horeca','Vloer'));box(17.4,.02,8.38,creme,3.75,BP-.01,0,deel('Horeca','Plafond'));
for(let x=-4.5;x<=12;x+=1.5)box(.14,.16,8.4,eikDonker,x,BP-.08,0,deel('Horeca','Plafond'));
// --- bar tegen de -z wand, met zicht op de bakkerij achter de glazen wand
{const B=deel('Horeca','Bar');box(4,.98,.6,eikDonker,-2.6,BV+.49,-2.75,B);box(4.2,.05,.78,steen,-2.6,BV+1.02,-2.8,B);box(4,.04,.04,messing,-2.6,BV+.12,-2.43,B);
 box(4,.85,.55,eikDonker,-2.6,BV+.425,-3.9,B);box(4.05,.04,.6,steen,-2.6,BV+.87,-3.9,B);
 box(.7,.45,.5,staalM,-3.9,BV+1.12,-3.9,B);box(.5,.08,.3,zwartStaal,-3.9,BV+1.38,-3.88,B);                         // espressomachine
 for(let k=0;k<3;k++){cyl(.025,.32,messing,-1.4+k*.18,BV+1.2,-2.85,B);cyl(.05,.05,zwartStaal,-1.4+k*.18,BV+1.38,-2.85,B)} // tap
 const fles=new THREE.CylinderGeometry(.035,.04,.28,8),FL=[];for(let k=0;k<16;k++)FL.push([-2.4+k*.12,BV+1.04,-3.95]);const fm=reeks(fles,M(0x3d5a2c,{roughness:.15,metalness:.2}),FL,B,'flessen');
 0}
// --- banken (ossenbloed leer) langs de -z wand en bij het raam achterin

// --- veel kleine zitplekken: tafeltjes met kleedje aan de bank en bij het raam, ronde marmeren bistrotafels in het midden
const KT=[],BT=[],ST=[];
for(const x of [.55,1.95,3.35,4.75]){KT.push([x,BV,-3.25]);ST.push([x,BV,-2.55,Math.PI])}
for(const x of [2.6,4.0,5.4]){KT.push([x,BV,3.75]);ST.push([x-.48,BV,3.75,Math.PI/2]);ST.push([x+.48,BV,3.75,-Math.PI/2])}
KT.push([8.0,BV,3.25]);ST.push([8.0,BV,2.55,0]);
for(const [x,z] of [[1.0,-.6],[2.9,-.6],[4.8,-.6],[7.7,-.55],[1.95,1.2],[3.85,1.2],[5.75,1.2],[7.6,1.3]]){BT.push([x,BV,z]);ST.push([x-.48,BV,z,Math.PI/2]);ST.push([x+.48,BV,z,-Math.PI/2])}
{const TF=deel('Horeca','Tafels');reeks(kleedTafelG,eikDonker,KT,TF,'tafeltjes');reeks(kleedG,kleedM,KT,TF,'kleedjes');reeks(bistroBlad,marmer,BT,TF,'bistrobladen');reeks(bistroVoet,gietijzer,BT,TF,'bistrovoeten');
 const kaars=[...KT,...BT].map(p=>[p[0]+.08,p[1]+.76,p[2]-.05]);const km=M(0xf3ead8,{roughness:.6});km.name='kaars';reeks(C(.035,.09),km,kaars,TF,'theelichtjes');
 reeks(thonetG,thonet,ST,deel('Horeca','Stoelen'),'thonetstoelen')}
// --- verlichting: opaline bollampen boven de tafels, wandlampjes tussen de ramen
{const HL=deel('Horeca','Lampen'),bol=new THREE.SphereGeometry(.15,16,12),kap=C(.05,.06,10);const P=[[-3.6,-2.8],[-1.6,-2.8],[1.25,-3.25],[4.05,-3.25],[1.0,-.6],[2.9,-.6],[4.8,-.6],[7.7,-.55],[1.95,1.2],[3.85,1.2],[5.75,1.2],[7.6,1.3],[3.3,3.6],[5.4,3.6],[8.0,3.25]];
 P.forEach(([x,z])=>{beam([x,BP,z],[x,BP-.7,z],.005,zwartStaal,HL);const k=new THREE.Mesh(kap,messing);k.position.set(x,BP-.72,z);HL.add(k);const b=new THREE.Mesh(bol,opaal);b.position.set(x,BP-.88,z);HL.add(b)});
 const half=new THREE.SphereGeometry(.08,12,8,0,Math.PI*2,0,Math.PI/2);
 for(const sd of [1,-1]){let cur=-5.05;for(const [a,b] of OPEN[sd]){if(a>-5&&a-cur>.25){const x=(cur+a)/2,z=sd*(BZ-.08);box(.08,.12,.06,messing,x,2.85,z,HL);const h=new THREE.Mesh(half,opaal);h.position.set(x,2.95,z-sd*.02);HL.add(h)}cur=Math.max(cur,b)}}}
// planten
/* oude planten vervangen in GEZELLIG */
// --- toiletten achterin aan de +z kant: mindervalidentoilet en gewoon toilet
{const TO=deel('Horeca','Toiletten'),H=2.45;box(.1,H,3.2,mat.wit,9.6,BV+H/2,2.6,TO);box(2.8,H,.1,mat.wit,11.0,BV+H/2,1.0,TO);box(2.8,H,.08,mat.wit,11.0,BV+H/2,2.75,TO);box(2.9,.08,3.2,mat.wit,11.0,BV+H,2.6,TO);
 const bord=t=>{const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#1d3f87';g.fillRect(0,0,128,128);g.fillStyle='#fff';g.font='700 46px Arial';g.textAlign='center';g.fillText('WC',64,58);if(t){g.beginPath();g.arc(64,86,16,0,7);g.lineWidth=6;g.strokeStyle='#fff';g.stroke();g.fillRect(58,62,6,22)}return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.6,name:'wcBord'})};
 for(const [z,t] of [[1.9,1],[3.5,0]]){box(.06,2.05,.9,eikDonker,9.56,BV+1.025,z,TO);const p=new THREE.Mesh(new THREE.PlaneGeometry(.22,.22),bord(t));p.position.set(9.52,BV+1.6,z+.3);p.rotation.y=-Math.PI/2;TO.add(p);box(.05,.05,.12,messing,9.5,BV+1.0,z-.3,TO)}
 for(const [z,x] of [[1.5,12.1],[3.6,12.1]]){box(.5,.4,.38,porselein,x,BV+.2,z,TO);box(.2,.4,.4,porselein,x+.15,BV+.6,z,TO);box(.45,.12,.35,porselein,10.3,BV+.85,z+.55,TO)}
 box(.6,.04,.04,messing,11.6,BV+.8,1.1,TO)}                                                                        // beugel mindervaliden
// --- binnentrap naar de salon op het dak (stijgt naar achteren, landt in de salon)
{const TR=deel('Horeca','Binnentrap');const n=16;for(let k=0;k<n;k++){box(.27,.05,1.0,eik,6.15+k*.25,BV+.17*(k+1),-2.25,TR);box(.03,.17,1.0,eikDonker,6.02+k*.25,BV+.17*(k+.5),-2.25,TR)}
 const sl=box(4.2,.12,.06,eikDonker,8.1,BV+1.4,-1.72,TR);sl.rotation.z=Math.atan2(.17,.25);
 for(let k=0;k<5;k++){const x=6.3+k*.5;beam([x,BV+.17*((x-6.15)/.25+1),-1.72],[x,BV+.17*((x-6.15)/.25+1)+.9,-1.72],.012,zwartStaal,TR)}
 beam([6.2,BV+1.05,-1.72],[8.5,BV+.17*10.4+.9,-1.72],.025,messing,TR);
 const TG=deel('Stuurhuis','Salon-inrichting');for(const [A,B] of [[[7.4,-1.7],[10.05,-1.7]],[[7.4,-2.75],[7.4,-1.7]]]){beam([A[0],5.0,A[1]],[B[0],5.0,B[1]],.025,messing,TG);for(let t=0;t<=1.001;t+=.25)beam([A[0]+(B[0]-A[0])*t,4.06,A[1]+(B[1]-A[1])*t],[A[0]+(B[0]-A[0])*t,5.0,A[1]+(B[1]-A[1])*t],.015,zwartStaal,TG)}}
// --- productie: werkbank met spoelbak, koelkasten, afzuigkap boven de ovens is er al
{const PR=deel('Productie','Werkbank');box(5.0,.9,.65,staalM,-9.2,BV+.45,3.75,PR);box(5.05,.04,.7,staalM,-9.2,BV+.92,3.75,PR);box(.6,.05,.45,zwartStaal,-7.6,BV+.95,3.75,PR);cyl(.02,.3,staalM,-7.6,BV+1.1,4.0,PR);
 const KO=deel('Productie','Koelkasten');for(const x of [-12.0,-11.25])box(.7,2.1,.7,staalM,x,BV+1.05,3.65,KO);
 for(let k=0;k<5;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),M(0xe0b070,{roughness:.9}));b.scale.set(1.3,.7,1);b.position.set(-10.6+k*.35,BV+1.0,3.7);PR.add(b)}}
// --- buurtloket: schappen met boodschappen langs beide zijwanden, kassa op de toonbank
{const SC=deel('Buurtloket','Schappen'),PD=deel('Buurtloket','Boodschappen');const L=[];
 for(const sz of [1,-1]){box(2.1,2.1,.04,eikDonker,-14.15,BV+1.05,sz*3.32,SC);for(let r=0;r<5;r++){box(2.1,.03,.38,eik,-14.15,BV+.2+r*.42,sz*3.13,SC);for(let k=0;k<11;k++)L.push([-15.05+k*.18,BV+.22+r*.42,sz*3.12,(k*7+r*3)%6])}}
 const pal=[0xcf3b2b,0xf2c14e,0x2f6db3,0x3e8e4f,0xf4efe6,0x7a4b2a];const pg=new THREE.BoxGeometry(.13,.2,.13);pg.translate(0,.1,0);const im=new THREE.InstancedMesh(pg,M(0xffffff,{roughness:.6,name:'verpakking'}),L.length),d=new THREE.Object3D(),c=new THREE.Color();
 L.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.scale.set(1,.7+((i*13)%5)*.15,1);d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,c.set(pal[p[3]]))});im.name='producten';im.castShadow=true;PD.add(im);
 box(.35,.25,.3,zwartStaal,-15.55,BV+1.06,-.65,deel('Buurtloket','Toonbank'))}
// --- salon op het dak: open gemaakt met echte ramen, bank en tafels; plafondopening voor de binnentrap
{const SA=deel('Stuurhuis','Salon-inrichting'),SX=8,Y=4.06;box(5.9,.03,5.5,eik,SX,Y+.015,0,SA);
 
 const T2=[[SX+1.85,Y,1.6],[SX+1.85,Y,.2]];reeks(bistroBlad,marmer,T2,SA,'salontafels');reeks(bistroVoet,gietijzer,T2,SA,'salontafelvoeten');
 const S2=[[SX+1.37,Y,1.6,Math.PI/2],[SX+1.37,Y,.2,Math.PI/2]];reeks(thonetG,thonet,S2,SA,'salonstoelen');
 {const b=new THREE.Mesh(new THREE.SphereGeometry(.15,16,12),opaal);for(const [x,z] of [[SX+1.85,.9],[7.6,.45]]){const k=b.clone();k.position.set(x,6.0,z);SA.add(k);beam([x,6.54,z],[x,6.15,z],.005,zwartStaal,SA)}}
 box(.6,.6,.5,eikDonker,SX-2.6,Y+.3,-.4,SA);cyl(.18,.3,potM,SX-2.6,Y+.75,-.4,SA);
 const ST=deel('Stuurhuis','Stuurconsole');box(.8,.95,3.2,M(0x2a2f38,{roughness:.6,name:'consoleGrijs'}),SX-1.9,7.13+.475,0,ST);const w=new THREE.Mesh(new THREE.TorusGeometry(.32,.03,8,24),eikDonker);w.position.set(SX-1.45,7.13+1.05,0);w.rotation.y=Math.PI/2;ST.add(w);
 box(.6,.05,.5,zwartStaal,SX-1.9,7.13+1.0,-1,ST);reeks(stoelG,M(0x222222,{roughness:.6,name:'stuurstoel'}),[[SX-.9,7.13,0,-Math.PI/2,1.1]],ST,'stuurstoel')}
// binnenlicht: overdag zacht aan, 's avonds warm en fel
const binnen=[];for(const [x,y,z] of [[-2,3.2,-1.5],[3.5,3.2,0],[8,3.2,1.5],[8,6.2,0],[-14,3.0,0]]){const l=new THREE.PointLight(0xffc98a,.55,9,2);l.position.set(x,y,z);pont.add(l);binnen.push(l)}

// mensen en meubels volgen later; hier een vlag als maatpunt
// woonblokken achter het gras (kadezijde), naar Kais locatiefoto: oranjerode baksteen, 7-9 lagen, betonnen balkonplaten met zwarte hekken,
// bakstenen plint (parkeerlaag met hof erboven), een lager beige blok ertussen, teruggezette bovenste laag
const VL=3,TRAV=3.6; // verdiepingshoogte en traveebreedte in m
function gevelTex(basis,voeg){const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=c.height=e.width=e.height=512;const x=c.getContext('2d'),y=e.getContext('2d');
 const px=512/(4*TRAV),py=512/(4*VL);x.fillStyle=basis;x.fillRect(0,0,512,512);
 for(let r=0;r<96;r++)for(let k=0;k<24;k++){const v=Math.random();x.fillStyle='rgba('+(v>.5?'50,18,10':'215,120,90')+','+(.05+Math.random()*.13)+')';x.fillRect(k*22+(r%2)*11,r*5.33,21,4.5)}
 x.fillStyle=voeg;for(let r=0;r<96;r++)x.fillRect(0,r*5.33+4.6,512,.7);
 y.fillStyle='#000';y.fillRect(0,0,512,512);
 for(let f=0;f<4;f++)for(let k=0;k<4;k++){const deur=(k+f)%2===0,ww=(deur?2.2:1.7)*px,wh=(deur?2.55:2.05)*py,wx=k*TRAV*px+(TRAV*px-ww)/2,wy=(f*VL+(deur?.25:.55))*py;
  x.fillStyle='#24211f';x.fillRect(wx-4,wy-4,ww+8,wh+8);const g=x.createLinearGradient(0,wy,0,wy+wh);g.addColorStop(0,'#8a9aa4');g.addColorStop(.5,'#4a565e');g.addColorStop(1,'#262d32');x.fillStyle=g;x.fillRect(wx,wy,ww,wh);
  x.fillStyle='#24211f';x.fillRect(wx+ww*.5-2,wy,4,wh);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(wx-4,wy+wh+4,ww+8,5); // stijl en lateischaduw
  if(Math.random()<.32){y.fillStyle=['#ffcf8a','#ffe2b0','#ffb86a'][Math.random()*3|0];y.globalAlpha=.5+Math.random()*.5;y.fillRect(wx,wy,ww,wh);y.globalAlpha=1}}
 const mk=cv=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};return [mk(c),mk(e)]}
const facB=gevelTex('#b05a3e','rgba(220,205,190,.35)'),facL=gevelTex('#d6c8b2','rgba(150,140,125,.35)'),gevels=[];
const plint=M(0x7e3b2a,{roughness:.95}),balkPlaat=M(0xc9c6c0,{roughness:.8}),hekMat=M(0x1d1d1f,{roughness:.6,metalness:.3,transparent:true,opacity:.82});
const balk={noord:[],zuid:[]},hek={noord:[],zuid:[]};
function gevelMat(fac,w,h){const t=fac[0].clone(),e=fac[1].clone();t.needsUpdate=e.needsUpdate=true;t.repeat.set(w/(4*TRAV),h/(4*VL));e.repeat.set(w/(4*TRAV),h/(4*VL));
 const gm=new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:e,emissiveIntensity:0,roughness:.92,envMapIntensity:.5});gevels.push(gm);return gm}
function blok(x,w,lagen,licht){const gr=x>=0?noord:zuid,k=x>=0?'noord':'zuid',fac=licht?facL:facB,Z=-44,D=16,y0=3.6,h=lagen*VL;
 box(w+6,2.4,D+8,plint,x,2.4,Z+1,gr);box(w+6.2,.3,D+8.2,mat.beton,x,3.75,Z+1,gr); // plint met dekrand
 const top=new THREE.MeshStandardMaterial({color:0x8d8a85,roughness:.9}),zm=gevelMat(fac,D,h),vm=gevelMat(fac,w,h);
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,D),[zm,zm,top,top,vm,vm]);o.position.set(x,y0+h/2,Z);o.castShadow=o.receiveShadow=true;gr.add(o);
 box(w+.4,.45,D+.4,balkPlaat,x,y0+h+.22,Z,gr); // dakrand
 // teruggezette bovenste laag met dakterras
 const w2=w*.62,pm=gevelMat(fac,w2,VL);const p2=new THREE.Mesh(new THREE.BoxGeometry(w2,VL,D-4),[gevelMat(fac,D-4,VL),gevelMat(fac,D-4,VL),top,top,pm,pm]);p2.position.set(x-w*.12,y0+h+VL/2+.45,Z-1);p2.castShadow=true;gr.add(p2);
 box(w2+.3,.35,D-3.7,balkPlaat,x-w*.12,y0+h+VL+.6,Z-1,gr);hek[k].push([x,y0+h+.95,Z+D/2-.05,w-.6,1,.04]);
 // balkons: hoekbalkons op elke laag, in het midden om en om
 const n=Math.floor(w/TRAV),x0=x-n*TRAV/2+TRAV/2;
 for(let f=1;f<lagen;f++)for(let i=0;i<n;i++){if(!(i===0||i===n-1||(i+f)%3===0))continue;const bx=x0+i*TRAV,by=y0+f*VL,bz=Z+D/2+.75;
  balk[k].push([bx,by,bz,TRAV-.1,.22,1.5]);hek[k].push([bx,by+.6,bz+.73,TRAV-.1,1,.04]);}}
[[-100,34,7,0],[-60,30,8,0],[-28,20,4,1],[10,32,9,0],[50,36,8,0],[92,30,7,0]].forEach(([x,w,l,li])=>blok(x,w,l,li));
// balkonplaten en hekken als instanties (veel stuks, weinig rekenwerk)
for(const [k,gr] of [['noord',noord],['zuid',zuid]])for(const [lijst,m] of [[balk[k],balkPlaat],[hek[k],hekMat]]){if(!lijst.length)continue;
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,lijst.length),d=new THREE.Object3D();
 lijst.forEach((b,i)=>{d.position.set(b[0],b[1],b[2]);d.scale.set(b[3],b[4],b[5]);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.castShadow=im.receiveShadow=true;gr.add(im)}
// woonboten aan de overkant (naar Kais foto's): ze liggen IN het water langs een groene oever met beschoeiing en loopplankjes;
// mix van klassieke witte arken met rood zadeldak, lage moderne arken (hout, wit, donker) en een paar met een verdieping
{const gevelM=[mat.wit,M(0xb79f80,{roughness:.9}),M(0x2c2c2e,{roughness:.8}),M(0x7a5a45,{roughness:.9}),M(0xe7e2d6,{roughness:.7})],bak=M(0x4a4744,{roughness:.9}),dakRood=M(0xa8402e,{roughness:.7}),Zb=118.4;
 const zadel=(L,B,h,x,y,z)=>{const sh=new THREE.Shape();sh.moveTo(-B/2-.3,0);sh.lineTo(B/2+.3,0);sh.lineTo(0,h);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:L+.4,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-(L+.4)/2,0,0);const o=new THREE.Mesh(g,dakRood);o.position.set(x,y,z);o.castShadow=true;scene.add(o)};
 box(600,1.6,.4,mat.houtDonker,0,.2,122,scene);                                     // beschoeiing van de oever
 for(let i=0;i<22;i++){const x=-190+i*17+(i%3)*2.4,L=12+(i*7%5),B=5.4,type=i%5,hH=type===3?5:2.7,g=gevelM[(i*3)%5],y0=.55;
  box(L,1.4,B,bak,x,-.15,Zb,scene);                                                 // drijvende betonbak, deels onder water
  box(L+.1,.12,B+.1,mat.staalDonker,x,.57,Zb,scene);
  if(type===0||type===2){box(L-1,hH,B-.5,mat.wit,x,y0+hH/2,Zb,scene);zadel(L-1,B-.5,1.5,x,y0+hH,Zb);for(let k=0;k<Math.floor((L-2)/2.2);k++)box(1.2,1.1,.06,mat.glas,x-(L-1)/2+1.4+k*2.2,y0+1.5,Zb-(B-.5)/2-.03,scene)}
  else{box(L-2.5,hH,B-.6,g,x+.8,y0+hH/2,Zb,scene);box(L-3.5,1.4,.06,mat.glas,x+.9,y0+1.3,Zb-(B-.6)/2-.03,scene);if(hH>3)box(L-5,1.3,.06,mat.glas,x+1.5,y0+3.6,Zb-(B-.6)/2-.03,scene);box(L-2,.22,B+.1,mat.staalDonker,x+.8,y0+hH+.11,Zb,scene);
   box(2.2,.1,B-.6,mat.houtDek,x-L/2+1.1,y0+.05,Zb,scene);for(let k=0;k<3;k++){const pl=new THREE.Mesh(new THREE.IcosahedronGeometry(.4,0),blad0);pl.position.set(x-L/2+.6+k*.6,y0+.45,Zb-1.6);scene.add(pl)}}
  box(1,.08,2.4,mat.houtDek,x+L/2-2,.75,Zb+B/2+1.1,scene);                          // loopplank naar de oever
  if(i%4===1){box(4.4,.55,1.7,[mat.wit,mat.staalDonker][i%2],x-2,.15,Zb-B/2-1.6,scene)}  // bootje voor de ark
 }
 for(let i=0;i<40;i++){const x=-200+i*10+Math.random()*4;for(let k=0;k<6;k++){const r=new THREE.Mesh(new THREE.ConeGeometry(.12,1.4+Math.random(),4),blad0);r.position.set(x+Math.random()*2,.5,121.4+Math.random()*.4);scene.add(r)}} // riet langs de oever
}

// lantaarnpalen en bomen
const lampen=[],lampGrijs=M(0x8a8f94,{roughness:.5,metalness:.5});
// slanke grijze lantaarnpalen met platte kap (naar de foto's), langs het fietspad en langs de kade
for(const [z,st] of [[-6.4,22],[-1.6,30]])for(let x=-110;x<=110;x+=st){if(Math.abs(x)<9)continue;const gr=x>=0?noord:zuid;cyl(.07,4.6,lampGrijs,x,3.5,z,gr);cyl(.38,.16,lampGrijs,x,5.88,z,gr);const bl=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.04,12),mat.lamp);bl.position.set(x,5.79,z);gr.add(bl)}
const blad=[M(0x4f7038,{roughness:1,envMapIntensity:.3}),M(0x5e7f3e,{roughness:1,envMapIntensity:.3}),M(0x6f8f48,{roughness:1,envMapIntensity:.3})],bladGeos=[0,1,2].map(k=>{const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);const n=1+.28*Math.sin(v.x*5.1+k)*Math.cos(v.y*4.3-k)+.12*Math.sin(v.z*9.7+k*2);p.setXYZ(i,v.x*n,v.y*n,v.z*n)}g.computeVertexNormals();return g});
function boom(x,z,s,gr0){const gr=gr0||(x>=0?noord:zuid),H=3.2*s;cyl(.2*s,H,mat.houtDonker,x,1.2+H/2,z,gr);
 const tak=[];for(let k=0;k<3;k++){const a=k*2.1+Math.random(),e=[x+Math.cos(a)*1.4*s,1.2+H+1.4*s,z+Math.sin(a)*1.4*s];beam([x,1.2+H*.8,z],e,.09*s,mat.houtDonker,gr);tak.push(e)}
 const n=gr0?7:11;for(let i=0;i<n;i++){const r=(.75+Math.random()*.7)*s,t=new THREE.Mesh(bladGeos[i%3],blad[i%3]),c=tak[i%3];t.scale.set(r,r*.8,r);
  t.position.set(c[0]*.6+x*.4+(Math.random()-.5)*2.4*s,c[1]+(Math.random()-.2)*1.8*s,c[2]*.6+z*.4+(Math.random()-.5)*2.4*s);t.rotation.set(Math.random(),Math.random()*6,Math.random());t.castShadow=!gr0;t.receiveShadow=true;gr.add(t)}}
for(let i=0;i<46;i++)boom(-270+i*12+Math.random()*6,137+Math.random()*14,1.2+Math.random()*.9,scene);
[[-70,-14,1],[-30,-16,1.1],[22,-13,1.2],[55,-15,1],[-120,-18,1.3],[-48,-12,.8],[-86,-15,.9],[-12,-20,.85],[14,-21,.8],[36,-12,.9],[78,-14,1],[-100,-12,.8]].forEach(a=>boom(...a));
for(let x=-104;x<=104;x+=7){if(Math.abs(x)<12)continue;const gr=x>=0?noord:zuid;for(let k=0;k<2;k++){const b=new THREE.Mesh(bladGeos[k],blad[(k+1)%3]);b.scale.set(1.3,.8,1.1);b.position.set(x+k*2.2,4.1,-33.5);b.receiveShadow=true;gr.add(b)}} // hagen langs de plint
const bankM=M(0x7a5a40,{roughness:.8});for(const x of [-74,-44,-20,28,62,96]){const gr=x>=0?noord:zuid;box(1.8,.08,.45,bankM,x,1.65,-10.6,gr);box(1.8,.4,.06,bankM,x,1.95,-10.85,gr);for(const bx of [-.75,.75])box(.06,.45,.45,lampGrijs,x+bx,1.42,-10.65,gr)}
// Kadoelenbrug links (+x), over het water
{const br=new THREE.Group();br.position.set(80,0,0);noord.add(br);
 box(5,.6,125,mat.beton,0,4.5,60,br);box(.2,1.2,125,mat.staalWit,2.4,5.4,60,br);box(.2,1.2,125,mat.staalWit,-2.4,5.4,60,br);
 for(const z of [20,60,100]){box(2,5,2.5,mat.beton,0,2,z,br)}}


// dag- en avondstand
const hemi=scene.children.find(o=>o.isHemisphereLight);
function setNight(n){const U=lucht.material.uniforms;U.top.value.set(n?0x24305c:0x8fa9cc);U.hor.value.set(n?0xe59a78:0xf6cfae);U.glow.value.set(n?0xff7a4a:0xffb46a);U.sunDir.value.copy(zonDir(n?-.03:.24));U.amt.value=n?.8:1;
 const fog=n?0x7d6f8c:0xf2c7a6;scene.background.set(fog);scene.fog.color.set(fog);scene.fog.near=n?70:90;scene.fog.far=n?420:480;
 hemi.intensity=n?.2:.18;hemi.color.set(n?0x8090d8:0xffdcc0);hemi.groundColor.set(n?0x2a2835:0x5d5348);sun.intensity=n?.22:1.25;sun.color.set(n?0xff8a5c:0xffae6e);
 sun.position.copy(sun.target.position).addScaledVector(zonDir(n?.12:.24),170);
 mat.lamp.emissiveIntensity=n?2.4:0;mat.glas.emissive.set(n?0xffb060:0xff9d55);mat.glas.emissiveIntensity=n?1.1:.12;mat.raam.emissiveIntensity=n?1.15:.18;
 vul.intensity=n?.1:.2;if(bloom){bloom.strength=n?.55:.3;bloom.threshold=n?.82:.97}if(grade)grade.uniforms.vig.value=n?.5:.42;const WU=water.material.uniforms;WU.sunDirection.value.copy(zonDir(n?.06:.24));WU.sunColor.value.set(n?0xff8050:0xffb878);WU.waterColor.value.set(n?0x141e36:0x3a5258);U.grond.value.set(n?0x1c1c24:0x4f4a44);gevels.forEach(g=>g.emissiveIntensity=n?.95:0);maakEnv();
 nacht.forEach(l=>l.intensity=n?1.7:0);wrap.style.background=n?'#7d6f8c':'#f2c7a6'}
{const b=document.createElement('button');b.type='button';b.textContent='Schoon beeld';b.title='Verbergt het hulptekstje, handig voor een screenshot';b.onclick=()=>{const h=document.getElementById('hint');h.hidden=!h.hidden;b.classList.toggle('on',h.hidden)};document.getElementById('views').appendChild(b)}
{const b=document.createElement('button');b.type='button';b.textContent='Avond';let n=false;b.onclick=()=>{n=!n;setNight(n);b.textContent=n?'Dag':'Avond';b.classList.toggle('on',n)};document.getElementById('views').appendChild(b)}

// filmlook: gloed, zachte focus aan boven- en onderrand, kleurcorrectie (warme lichten, koele schaduwen), vignet, korrel
let composer=null,bloom=null,grade=null;
try{const dpr=renderer.getPixelRatio();const rt=new THREE.WebGLRenderTarget(16,16,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,samples:TELEFOON?2:4});
 composer=new THREE.EffectComposer(renderer,rt);composer.setPixelRatio(dpr);composer.addPass(new THREE.RenderPass(scene,camera));
 bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.3,.55,.97);composer.addPass(bloom);
 grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0},res:{value:new THREE.Vector2(1,1)},vig:{value:.42},grain:{value:.05},focus:{value:.56}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 vUv;uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,vig,grain,focus;'+
  'vec3 s(vec2 uv){return texture2D(tDiffuse,uv).rgb;}'+
  'void main(){vec2 uv=vUv,d=uv-.5;float r=dot(d,d);float bl=smoothstep(.22,.75,abs(uv.y-focus))*2.;vec2 px=bl/res;'+
  'vec3 c=s(uv)*.3;c+=(s(uv+vec2(px.x,0.))+s(uv-vec2(px.x,0.))+s(uv+vec2(0.,px.y))+s(uv-vec2(0.,px.y)))*.1;c+=(s(uv+px)+s(uv-px)+s(uv+vec2(px.x,-px.y))+s(uv+vec2(-px.x,px.y)))*.0750;'+
  'c.r=mix(c.r,texture2D(tDiffuse,uv+d*.004*r*4.).r,.7);c.b=mix(c.b,texture2D(tDiffuse,uv-d*.004*r*4.).b,.7);'+
  'c*=1.3;c=c*(1.+c*.18)/(1.+c*.55);float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.1);c*=mix(vec3(.94,.98,1.05),vec3(1.06,1.,.92),smoothstep(.15,.8,l));'+
  'c=(c-.5)*1.1+.5;c*=1.-vig*smoothstep(.25,.95,length(d)*1.45);'+
  'float n=fract(sin(dot(uv*res+time,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*grain;gl_FragColor=vec4(clamp(c,0.,1.),1.);}'});
 composer.addPass(grade);
}catch(e){composer=null;console.warn('filmlook uit',e)}
// camera: eenvoudige draai/zoom/schuif-besturing (bol rond een doel)
const view={t:new THREE.Vector3(-30.8,3,4),r:55,th:Math.PI*.12,ph:Math.PI*.4};
const goal={t:view.t.clone(),r:view.r,th:view.th,ph:view.ph};
const VIEWS={
 'Gouden uur':{t:[-42,5,7],r:58,th:-2.0,ph:1.46},
 'Start':{t:[-30.8,6,4],r:38,th:.35,ph:1.38},
 'Dakterras':{t:[-53.2,5.5,4.7],r:26,th:-.35,ph:1.05},
 'Kraan':{t:[0,18,-4],r:52,th:2.75,ph:1.42},
 'Boven':{t:[-30.8,0,4],r:95,th:0,ph:.35},'Zwemsteiger':{t:[-17.5,1,9.7],r:34,th:-.4,ph:1.2}
};
{scene.updateMatrixWorld(true);const V=(n,tp,op)=>{const t=pont.localToWorld(new THREE.Vector3(...tp)),o=pont.localToWorld(new THREE.Vector3(...op)).sub(t),r=o.length();VIEWS[n]={t:t.toArray(),r,th:Math.atan2(o.x,-o.z),ph:Math.acos(o.y/r)}};
 V('Buurtloket',[-17.5,2.2,0],[-29,5,8]);V('Productie',[-8.75,2.4,0],[-5.5,3.4,12.5]);V('Zijaanzicht',[-4,3.6,0],[-4,4.4,-31]);V('Klep',[-19,1.5,0],[-27.5,7.5,-6]);V('Binnen',[-1.5,1.9,-.4],[9.3,2.25,.35]);V('Salon',[10.4,4.9,.6],[5.5,5.9,-2.1])}
// Rocketbox-avatars: Microsoft Rocketbox Avatar Library, MIT-licentie (github.com/microsoft/Microsoft-Rocketbox)
// ===== MENSEN (Rocketbox, MIT): vooraf geposeerd en bevroren; hier alleen uitpakken en neerzetten =====
const MENS=(()=>{const bin=Uint8Array.from(atob(MENS_BIN),c=>c.charCodeAt(0)).buffer,TL=new THREE.TextureLoader(),tex={},mats={},geos={};
 const T=(n,s)=>{if(!MENS_TEX[n])return null;if(!tex[n]){const t=TL.load(MENS_TEX[n]);t.encoding=THREE.sRGBEncoding;t.flipY=true;tex[n]=t}return tex[n]};
 function mat(naam,deel){const k=naam+'/'+deel;if(mats[k])return mats[k];let m;
  if(deel==='opacity'){const t=T(naam+'/opacity_color');m=new THREE.MeshStandardMaterial({map:t,alphaTest:.4,transparent:false,side:THREE.DoubleSide,roughness:.85})}
  else m=new THREE.MeshStandardMaterial({map:T(naam+'/'+deel+'_color'),roughness:deel==='head'?.6:.8});
  m.name=naam+' '+deel;return mats[k]=m}
 const deq=(o,n,cnt,mn,mx)=>{const q=new Uint16Array(bin,o,cnt*n),f=new Float32Array(cnt*n);for(let i=0;i<f.length;i++){const k=i%n;f[i]=mn[k]+q[i]/65535*(mx[k]-mn[k])}return f};
 for(const h of MENS_HDR){geos[h.naam+'/'+h.pose]=h.delen.map(d=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(deq(d.p[0],3,d.n,d.p[1],d.p[2]),3));
  g.setAttribute('uv',new THREE.BufferAttribute(deq(d.u[0],2,d.n,d.u[1],d.u[2]),2));g.setIndex(new THREE.BufferAttribute(d.i32?new Uint32Array(bin,d.i,d.ni):new Uint16Array(bin,d.i,d.ni),1));g.computeVertexNormals();g.computeBoundingSphere();return {g,deel:d.mat}})}
 const schaduw=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),r=x.createRadialGradient(32,32,2,32,32,30);r.addColorStop(0,'rgba(0,0,0,.45)');r.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=r;x.fillRect(0,0,64,64);
  return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})})(),sg=new THREE.PlaneGeometry(.75,.75);sg.rotateX(-Math.PI/2);
 // zet een mens neer: naam (avatar), pose, plek [x,y,z], draaiing, ouder-groep
 function zet(naam,pose,p,ry,ouder,label){const G=geos[naam+'/'+pose];if(!G)return null;const g=new THREE.Group();g.name=label||naam.replace(/_/g,' ');g.userData.soort='persoon';g.position.set(p[0],p[1],p[2]);g.rotation.y=ry||0;
  for(const {g:geo,deel} of G){const m=new THREE.Mesh(geo,mat(naam,deel));m.castShadow=true;m.name=deel;g.add(m)}
  if(pose!=='zitten'){const s=new THREE.Mesh(sg,schaduw);s.position.y=.012;s.renderOrder=1;g.add(s)}
  ouder.add(g);return g}
 return {zet}})();
const mensenBuiten=new THREE.Group();mensenBuiten.name='Mensen buiten';zuid.add(mensenBuiten);
[
["Female_Adult_01", "zitten", [0.55, 1.12, -3.75], 0, deel('Mensen','Horeca')],
["Male_Adult_03", "zitten", [1.95, 1.12, -3.75], 0, deel('Mensen','Horeca')],
["Female_Adult_06", "zitten", [3.35, 1.12, -3.75], 0, deel('Mensen','Horeca')],
["Male_Adult_08", "zitten", [0.55, 1.12, -2.55], 3.1416, deel('Mensen','Horeca')],
["Female_Adult_03", "zitten", [3.35, 1.12, -2.55], 3.1416, deel('Mensen','Horeca')],
["Male_Adult_05", "zitten", [4.75, 1.12, -2.55], 3.1416, deel('Mensen','Horeca')],
["Female_Adult_08", "zitten", [0.52, 1.12, -0.6], 1.5708, deel('Mensen','Horeca')],
["Male_Adult_02", "zitten", [1.48, 1.12, -0.6], -1.5708, deel('Mensen','Horeca')],
["Female_Adult_05", "zitten", [4.32, 1.12, -0.6], 1.5708, deel('Mensen','Horeca')],
["Male_Adult_07", "zitten", [5.28, 1.12, -0.6], -1.5708, deel('Mensen','Horeca')],
["Female_Adult_02", "zitten", [1.47, 1.12, 1.2], 1.5708, deel('Mensen','Horeca')],
["Male_Adult_04", "zitten", [2.43, 1.12, 1.2], -1.5708, deel('Mensen','Horeca')],
["Female_Adult_07", "zitten", [5.27, 1.12, 1.2], 1.5708, deel('Mensen','Horeca')],
["Male_Adult_01", "zitten", [6.23, 1.12, 1.2], -1.5708, deel('Mensen','Horeca')],
["Female_Adult_04", "zitten", [2.12, 1.12, 3.75], 1.5708, deel('Mensen','Horeca')],
["Male_Adult_06", "zitten", [3.08, 1.12, 3.75], -1.5708, deel('Mensen','Horeca')],
["Female_Adult_01", "zitten", [8.0, 1.12, 3.75], 3.1416, deel('Mensen','Horeca')],
["Male_Adult_03", "zitten", [8.0, 1.12, 2.55], 0, deel('Mensen','Horeca')],
["Female_Adult_06", "zitten", [-4.1, 1.43, -2.05], 3.1416, deel('Mensen','Horeca')],
["Male_Adult_08", "zitten", [-2.7, 1.43, -2.05], 3.1416, deel('Mensen','Horeca')],
["Female_Adult_03", "zitten", [-1.3, 1.43, -2.05], 3.1416, deel('Mensen','Horeca')],
["Male_Adult_05", "staan", [-2.6, 1.12, -3.45], 0, deel('Mensen','Personeel')],
["Female_Adult_08", "staan", [-14.6, 1.12, -0.6], -1.5708, deel('Mensen','Personeel')],
["Male_Adult_02", "kop", [-14.6, 1.12, 0.9], -1.5708, deel('Mensen','Personeel')],
["Chef_Female_01", "staan", [-8.6, 1.12, -0.5], 3.1416, deel('Mensen','Personeel')],
["Female_Adult_05", "staan", [-10.4, 1.12, -2.3], 0, deel('Mensen','Personeel')],
["Male_Adult_07", "staan", [-16.3, 1.12, 0.1], 1.5708, deel('Mensen','Wachtrij')],
["Female_Adult_02", "kop", [-17.3, 1.03, -0.2], 1.5708, deel('Mensen','Wachtrij')],
["Male_Adult_04", "staan", [-18.2, 0.99, 0.3], 1.5708, deel('Mensen','Wachtrij')],
["Female_Adult_07", "praat", [-19.1, 0.96, -0.1], 1.5708, deel('Mensen','Wachtrij')],
["Male_Child_01", "staan", [-19.1, 0.96, 0.5], 1.5708, deel('Mensen','Wachtrij')],
["Male_Adult_01", "praat", [-22.6, 0.76, 2.4], 1.5708, deel('Mensen','Loketplein')],
["Female_Adult_04", "kop", [-21.8, 0.76, 2.4], -1.5708, deel('Mensen','Loketplein')],
["Female_Child_01", "staan", [-22.2, 0.76, 1.85], 3.1416, deel('Mensen','Loketplein')],
["Male_Adult_06", "kop", [-21.5, 0.76, -3.6], 0, deel('Mensen','Loketplein')],
["Female_Adult_01", "praat", [-21.5, 0.76, -2.8], 3.1416, deel('Mensen','Loketplein')],
["Male_Adult_03", "kop", [-23.2, 0.76, 0], 0, deel('Mensen','Loketplein')],
["Female_Adult_06", "praat", [-22.65, 0.76, 0.85], -2.2, deel('Mensen','Loketplein')],
["Male_Adult_08", "staan", [-23.75, 0.76, 0.95], 2.2, deel('Mensen','Loketplein')],
["Female_Adult_03", "zitten", [-10.9, 4.06, -1.71], 0, deel('Mensen','Dakterras')],
["Male_Adult_05", "zitten", [-11.96, 4.06, 0.3], 1.5708, deel('Mensen','Dakterras')],
["Female_Adult_08", "zitten", [-6.6, 4.06, 0.83], 0, deel('Mensen','Dakterras')],
["Male_Adult_02", "zitten", [-5.3, 4.06, 2.27], 3.1416, deel('Mensen','Dakterras')],
["Female_Adult_05", "zitten", [-4.4, 4.06, 0.83], 0, deel('Mensen','Dakterras')],
["Male_Adult_07", "zitten", [-1.0, 4.06, -1.1], 3.1416, deel('Mensen','Dakterras')],
["Female_Adult_02", "kop", [11.8, 4.06, 3.6], 0, deel('Mensen','Dakterras')],
["Male_Adult_04", "praat", [-1.6, 4.06, 2.6], 0, deel('Mensen','Dakterras')],
["Female_Adult_07", "zitten", [6.95, 4.06, 1.3], 1.5708, deel('Mensen','Salon')],
["Male_Adult_01", "zitten", [8.25, 4.06, 1.3], -1.5708, deel('Mensen','Salon')],
["Female_Adult_04", "zitten", [10.53, 4.06, 0.2], -1.5708, deel('Mensen','Salon')],
["Male_Adult_06", "zitten", [-51.4, 0.55, 3.9], 0, mensenBuiten],
["Female_Adult_01", "zitten", [-51.4, 0.55, 5.5], 3.1416, mensenBuiten],
["Male_Adult_03", "zitten", [-60.6, 0.55, 3.9], 0, mensenBuiten],
["Female_Adult_06", "zitten", [-60.6, 0.55, 5.5], 3.1416, mensenBuiten],
["Male_Adult_08", "praat", [-9, 1.2, -2.5], 1.2, mensenBuiten],
["Female_Adult_03", "kop", [-8.3, 1.2, -2.25], -1.9, mensenBuiten],
["Male_Adult_05", "staan", [-17, 1.2, -1.5], 2.4, mensenBuiten]
].forEach(([a,p,pos,ry,o])=>MENS.zet(a,p,pos,ry,o));
// ===== GEZELLIG v0.34: chesterfield, leeshoek, kleden, visgraatvloer, schilderijen, bar, salon en dakterras =====
const GZ=(()=>{
 const Mn=(c,o,n)=>{const m=M(c,o||{});m.name=n;return m};
 const leerGroen=Mn(0x24402f,{roughness:.42},'leerGroen'),leerCognac=Mn(0x7a3f1f,{roughness:.4},'leerCognac'),knoop=Mn(0x140b07,{roughness:.5},'knoop'),
  goud=Mn(0xb8913f,{roughness:.28,metalness:.9},'goud'),teak=Mn(0x8f6239,{roughness:.6},'teak'),rotan=Mn(0xb48a55,{roughness:.75},'rotan'),
  kussen=Mn(0xe8dcc3,{roughness:.9},'kussenCreme'),kussenBlauw=Mn(0x2f4f8c,{roughness:.9},'kussenBlauw'),kussenOker=Mn(0xd29a3a,{roughness:.9},'kussenOker'),
  groen2=Mn(0x5d8a45,{roughness:.85},'bladLicht'),groen3=Mn(0x2f5a2e,{roughness:.85},'bladDonker'),lavendel=Mn(0x8a78c0,{roughness:.9},'lavendel'),bloemRood=Mn(0xc8443a,{roughness:.8},'bloemRood'),bloemGeel=Mn(0xe7b83f,{roughness:.8},'bloemGeel'),
  terracotta=Mn(0xb8603e,{roughness:.85},'terracotta'),spiegel=Mn(0xa9b2b4,{roughness:.04,metalness:1,envMapIntensity:1.2},'spiegel'),
  krijt=Mn(0x1c211f,{roughness:.9},'krijtbord'),glasM=new THREE.MeshStandardMaterial({color:0xdfe9ea,roughness:.05,metalness:.1,transparent:true,opacity:.35,depthWrite:false,name:'glaswerk'}),
  amber=Mn(0x7a3d10,{roughness:.12,metalness:.15},'flesAmber'),flesGroen=Mn(0x2f5a2a,{roughness:.12,metalness:.15},'flesGroen'),flesHelder=Mn(0xcfd8d0,{roughness:.08,metalness:.2,transparent:true,opacity:.6},'flesHelder');
 // hulpjes: stuk = groep met eigen positie/draaiing; m(...) = mesh in een groep
 const stuk=(p,x,y,z,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;p.add(g);return g};
 const m=(geo,mt,p,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(geo,mt);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CY=(r,h,n,r2)=>new THREE.CylinderGeometry(r,r2===undefined?r:r2,h,n||12),SP=(r)=>new THREE.SphereGeometry(r,8,6);
 // afgerond blok (kussens, leren bekleding): doos waarvan de hoeken naar een straal r zijn getrokken
 const RB=(w,h,d,r)=>{r=Math.min(r,w/2,h/2,d/2);const g=new THREE.BoxGeometry(w,h,d,4,4,4),p=g.attributes.position,nm=g.attributes.normal,v=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));v.sub(c);if(v.lengthSq()>1e-10){v.normalize();nm.setXYZ(i,v.x,v.y,v.z);v.multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z)}}
  return g};
 const rol=(len,r)=>{const g=CY(r,len,16);g.rotateZ(Math.PI/2);return g};
 const knoopG=new THREE.SphereGeometry(.017,6,4);
 // CHESTERFIELD: kijkt naar +z; zitvlak boven +.47; voorkant rugkussen op z=-.16 (zitter staat op z≈+.02)
 function chesterfield(p,x,y,z,ry,len,leer,armen){const g=stuk(p,x,y,z,ry),d=.78,bz=-d/2;
  m(B(len-.06,.1,d-.06),eikDonker,g,0,.05,0);                         // plint
  m(RB(len,.27,d,.035),leer,g,0,.235,0);                                  // onderstel
  m(RB(len-(armen?.36:.04),.13,d-.22,.05),leer,g,0,.415,.08);              // zitkussen
  m(RB(len,.5,.22,.07),leer,g,0,.6,bz+.11);                               // rug
  m(rol(len+.02,.11),leer,g,0,.85,bz+.12);                           // gerolde rugrand
  if(armen)for(const s of [-1,1]){m(RB(.2,.42,d,.05),leer,g,s*(len/2-.1),.5,0);const a=m(new THREE.CylinderGeometry(.11,.11,d,16),leer,g,s*(len/2-.1),.72,0);a.rotation.x=Math.PI/2;
   for(let k=0;k<3;k++)m(knoopG,knoop,g,s*(len/2-.21),.38+k*.12,.2+(k%2)*.12-.12)}
  const n=Math.max(2,Math.floor((len-(armen?.4:.1))/.17));for(let r=0;r<3;r++)for(let i=0;i<n-(r%2);i++){const xx=-(n-1)*.17/2+i*.17+(r%2)*.085;m(knoopG,knoop,g,xx,.5+r*.11,bz+.225)}
  for(const s of [-1,1])for(const t of [-1,1])m(CY(.03,.08,8,.022),eikDonker,g,s*(len/2-.08),.04,t*(d/2-.08));
  return g}
 // fauteuil (club-chesterfield), kijkt naar +z, zitter op z≈+.02
 const fauteuil=(p,x,y,z,ry,leer)=>chesterfield(p,x,y,z,ry,.95,leer,true);
 // PERZISCH TAPIJT als canvas
 function tapijt(seed,veld,rand,accent){const c=document.createElement('canvas');c.width=512;c.height=340;const g=c.getContext('2d');let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  g.fillStyle=veld;g.fillRect(0,0,512,340);g.fillStyle=rand;g.fillRect(0,0,512,40);g.fillRect(0,300,512,40);g.fillRect(0,0,40,340);g.fillRect(472,0,40,340);
  g.strokeStyle=accent;g.lineWidth=3;g.strokeRect(46,46,420,248);g.strokeRect(8,8,496,324);
  for(let i=0;i<26;i++){const x=20+i*18.6;g.fillStyle=i%2?accent:veld;g.beginPath();g.moveTo(x,20);g.lineTo(x+7,12);g.lineTo(x+14,20);g.lineTo(x+7,28);g.fill();g.beginPath();g.moveTo(x,320);g.lineTo(x+7,312);g.lineTo(x+14,320);g.lineTo(x+7,328);g.fill()}
  g.save();g.translate(256,170);for(const [r,k] of [[110,rand],[78,accent],[48,veld],[26,accent]]){g.fillStyle=k;g.beginPath();for(let a=0;a<16;a++){const rr=a%2?r*.72:r;g.lineTo(Math.cos(a*Math.PI/8)*rr*1.35,Math.sin(a*Math.PI/8)*rr)}g.closePath();g.fill()}g.restore();
  for(const [x,y] of [[60,60],[452,60],[60,280],[452,280]]){g.fillStyle=rand;g.beginPath();g.moveTo(x,y);g.lineTo(x+(x<256?70:-70),y);g.lineTo(x,y+(y<170?50:-50));g.fill()}
  for(let i=0;i<120;i++){g.fillStyle=[accent,rand,'#e9dcc0'][i%3];const x=70+rnd()*372,y=60+rnd()*220;if(Math.hypot((x-256)/1.35,y-170)<120)continue;g.fillRect(x,y,4,4)}
  for(let i=0;i<4000;i++){g.fillStyle='rgba('+(rnd()>.5?'255,240,220':'0,0,0')+','+rnd()*.08+')';g.fillRect(rnd()*512,rnd()*340,2,1)}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return Mn(0xffffff,{map:t,roughness:.97},'tapijt')}
 const loperTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#6e1c18';g.fillRect(0,0,256,128);g.fillStyle='#1e2b55';g.fillRect(0,0,256,18);g.fillRect(0,110,256,18);g.strokeStyle='#d8b46a';g.lineWidth=3;g.beginPath();g.moveTo(0,24);g.lineTo(256,24);g.moveTo(0,104);g.lineTo(256,104);g.stroke();
  for(const cx of [64,192]){g.fillStyle='#1e2b55';g.beginPath();g.moveTo(cx,30);g.lineTo(cx+44,64);g.lineTo(cx,98);g.lineTo(cx-44,64);g.fill();g.fillStyle='#d8b46a';g.beginPath();g.moveTo(cx,46);g.lineTo(cx+22,64);g.lineTo(cx,82);g.lineTo(cx-22,64);g.fill()}
  g.fillStyle='#e9dcc0';for(let x=8;x<256;x+=16){g.fillRect(x,6,5,5);g.fillRect(x,117,5,5)}for(let i=0;i<2500;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.08+')';g.fillRect(Math.random()*256,Math.random()*128,2,1)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,1);t.encoding=THREE.sRGBEncoding;return t})();
 const kleden=[tapijt(7,'#7d1f1b','#1e2b55','#d8b46a'),tapijt(19,'#1f3358','#7d1f1b','#d6b06c'),tapijt(31,'#9a5a2a','#2d2a3a','#e3c78e'),tapijt(43,'#6b2a3f','#2a3d2c','#d9b874')];
 const kleed=(p,x,y,z,w,d,i,ry)=>{const o=m(B(w,.012,d),kleden[i%4],p,x,y+.006,z,0,ry||0);o.castShadow=false;return o};
 // PLANTEN (art direction ronde 1): echte bladvormen in plaats van bolletjes. Alle bladeren van één plant zitten in één vorm met
 // kleur per hoekpunt, en alle planten delen één materiaal ('blad'), zodat het licht blijft voor de telefoon.
 const bladM=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.78,metalness:0,envMapIntensity:.5,name:'blad'});
 const V3=THREE.Vector3,OP=new V3(0,1,0);
 function bladBouw(seed){const P=[],C=[],I=[];let n=0,sd=seed||7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;const k1=new THREE.Color(),k2=new THREE.Color();
  const v=(p,c)=>{P.push(p.x,p.y,p.z);C.push(c.r,c.g,c.b);return n++};
  // groot blad: voet a, richting d, zijrichting s, lengte L, breedte W, doorzakken b; K delen over de lengte; kleur c1 (voet) naar c2 (punt)
  function blad(a,d,s,L,W,b,c1,c2,K){K=K||3;const up=new V3().crossVectors(s,d).normalize();if(up.y<0)up.negate();k1.set(c1);k2.set(c2);const f=.85+rnd()*.3;let vorige=null;
   for(let k=0;k<=K;k++){const t=k/K,w=W*Math.pow(Math.sin(Math.PI*(.06+t*.94)),.75)*.5,m=a.clone().addScaledVector(d,L*t).addScaledVector(OP,-b*L*t*t),c=k1.clone().lerp(k2,t).multiplyScalar(f);
    const rij=[v(m.clone().addScaledVector(s,-w).addScaledVector(up,w*.35),c),v(m,c.clone().multiplyScalar(.8)),v(m.clone().addScaledVector(s,w).addScaledVector(up,w*.35),c)];
    if(vorige)for(let j=0;j<2;j++)I.push(vorige[j],rij[j],vorige[j+1],vorige[j+1],rij[j],rij[j+1]);vorige=rij}}
  // klein blaadje (ruit van twee driehoeken)
  function blaadje(a,d,s,L,W,c1){k1.set(c1).multiplyScalar(.8+rnd()*.4);const i0=v(a,k1),i1=v(a.clone().addScaledVector(d,L*.5).addScaledVector(s,W*.5),k1),i2=v(a.clone().addScaledVector(d,L),k1),i3=v(a.clone().addScaledVector(d,L*.5).addScaledVector(s,-W*.5),k1);I.push(i0,i1,i2,i0,i2,i3)}
  // lint (steel of nerf) langs punten
  function lint(pts,w,c1){k1.set(c1);let vorige=null;for(let i=0;i<pts.length;i++){const d=(pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)])).normalize(),s=new V3().crossVectors(d,OP);if(s.lengthSq()<1e-4)s.set(1,0,0);s.normalize();
    const rij=[v(pts[i].clone().addScaledVector(s,-w),k1),v(pts[i].clone().addScaledVector(s,w),k1)];if(vorige)I.push(vorige[0],rij[0],vorige[1],vorige[1],rij[0],rij[1]);vorige=rij}}
  function mesh(p){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
   const o=new THREE.Mesh(g,bladM);o.castShadow=o.receiveShadow=true;o.name='bladeren';p.add(o);return o}
  return {blad,blaadje,lint,mesh,rnd}}
 const GROEN=[0x2f5a2e,0x3f7036,0x5d8a45,0x79a04e];
 const potG=(s)=>new THREE.LatheGeometry([[0,0],[.12,0],[.135,.02],[.17,.3],[.185,.31],[.185,.345],[.16,.345],[.15,.32],[0,.32]].map(([a,b])=>new THREE.Vector2(a*s,b*s)),16);
 function plant(p,x,y,z,s,pot,soort){const g=stuk(p,x,y,z,0),B=bladBouw(Math.floor(Math.abs(x*97+z*31))%1021+7),rnd=B.rnd;
  if(pot!==false)m(potG(s),pot||terracotta,g,0,0,0);
  const top=pot===false?0:.33*s;
  if(soort==='palm'){ // kentiapalm: overhangende veren met smalle blaadjes
   const nv=9;for(let i=0;i<nv;i++){const az=i*2.4+rnd()*.5,L=(.85+rnd()*.5)*s,N=11,pts=[];let th=.12+rnd()*.25,pos=new V3(0,top,0);const rad=new V3(Math.cos(az),0,Math.sin(az)),zij=new V3(-Math.sin(az),0,Math.cos(az));
    for(let k=0;k<=N;k++){pts.push(pos.clone());const dir=rad.clone().multiplyScalar(Math.sin(th)).addScaledVector(OP,Math.cos(th));if(k>2){const t=(k-2)/(N-2),bl=(.2+.22*Math.sin(Math.PI*Math.min(1,t*.9+.1)))*s;
      for(const sg of [-1,1]){const d=dir.clone().multiplyScalar(.55).addScaledVector(zij,sg*.8).addScaledVector(OP,-.25-.2*t).normalize();B.blad(pos.clone(),d,dir.clone(),bl,.034*s,.25,GROEN[1],GROEN[(i+k)%2?2:3],2)}}
     pos.addScaledVector(dir,L/N);th+=(1.5+rnd()*.5)/N*(.5+k/N)}
    B.lint(pts,.006*s,0x4a6a30)}}
  else if(soort==='hang'){ // hangplant: slierten met blaadjes over de potrand
   for(let i=0;i<11;i++){const az=i*2.4+rnd(),rad=new V3(Math.cos(az),0,Math.sin(az)),zij=new V3(-Math.sin(az),0,Math.cos(az)),L=(.35+rnd()*.55)*s,N=7,pts=[];let pos=rad.clone().multiplyScalar(.1*s).setY(top);
    for(let k=0;k<=N;k++){pts.push(pos.clone());const t=k/N,dir=rad.clone().multiplyScalar(Math.max(0,.9-t*2.2)).addScaledVector(OP,k<1?.3:-(.3+t)).normalize();
     const d=rad.clone().multiplyScalar(.6).addScaledVector(zij,(k%2?1:-1)*.7).addScaledVector(OP,-.35).normalize();B.blad(pos.clone(),d,OP.clone().cross(d).normalize(),.085*s,.06*s,.2,GROEN[(i+k)%3],GROEN[2+(k%2)],2);
     pos.addScaledVector(dir,L/N)}
    B.lint(pts,.004*s,0x466a30)}
   for(let i=0;i<8;i++){const az=i*.8+rnd(),d=new V3(Math.cos(az)*.5,1,Math.sin(az)*.5).normalize();B.blad(new V3(0,top,0),d,new V3(-Math.sin(az),0,Math.cos(az)),.2*s,.09*s,.5,GROEN[1],GROEN[3],2)}}
  else{ // bladplant (vioolbladplant): een paar stelen met grote ovale bladeren
   for(let st=0;st<3;st++){const az0=st*2.1+rnd(),H=(.55+rnd()*.45)*s,lean=new V3(Math.cos(az0)*.18,1,Math.sin(az0)*.18).normalize(),pts=[];
    for(let k=0;k<=7;k++){const t=k/7,pos=lean.clone().multiplyScalar(H*t).setY(top+H*t*lean.y);pts.push(pos);if(k<1)continue;const az=az0+k*2.4,rad=new V3(Math.cos(az),0,Math.sin(az)),d=rad.clone().addScaledVector(OP,.55-.2*t).normalize();
     B.blad(pos.clone(),d,new V3(-Math.sin(az),0,Math.cos(az)),(.2+.1*Math.sin(t*3))*s,(.12+.05*Math.sin(t*3))*s,.35,GROEN[(k+st)%2],GROEN[2+(k%2)],3)}
    B.lint(pts,.007*s,0x4a3a22)}}
  B.mesh(g);return g}
 // OLIJFBOOMPJE in grote terracotta pot: kromme stam, takken en vele kleine zilvergroene blaadjes
 const OLIJF=[0x6f8457,0x8a9a72,0x586e46,0xa2ad8c,0x7b8f60];
 function olijf(p,x,y,z,s){s=s||1;const g=stuk(p,x,y,z,0),B=bladBouw(Math.floor(Math.abs(x*53+z*17))%997+11),rnd=B.rnd;
  m(potG(1.55*s),terracotta,g,0,0,0);m(CY(.25*s,.02,16),Mn(0x3a2a1c,{roughness:1},'aarde'),g,0,.5*s,0);
  const buis=(pts,r)=>{const o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,r,6),eikDonker);o.castShadow=true;g.add(o)};
  const kruin=new V3(.02*s,1.3*s,0);buis([new V3(0,.45*s,0),new V3(.05*s,.8*s,.03*s),new V3(-.03*s,1.08*s,-.02*s),kruin],.035*s);
  for(let i=0;i<6;i++){const az=i*1.05+rnd()*.5,el=.5+rnd()*.7,L=(.38+rnd()*.25)*s,rad=new V3(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)),eind=kruin.clone().addScaledVector(rad,L);
   buis([kruin.clone().addScaledVector(OP,-.08*s),kruin.clone().addScaledVector(rad,L*.5).addScaledVector(OP,.03*s),eind],.014*s);
   for(let t=0;t<14;t++){const a2=rnd()*6.28,e2=-.3+rnd()*1.5,td=new V3(Math.cos(a2)*Math.cos(e2),Math.sin(e2),Math.sin(a2)*Math.cos(e2)),t0=kruin.clone().addScaledVector(rad,L*(.35+rnd()*.7)),TL=(.2+rnd()*.2)*s,zij=new V3().crossVectors(td,OP).normalize();
    B.lint([t0,t0.clone().addScaledVector(td,TL)],.003*s,0x5a5038);
    for(let k=0;k<11;k++){const b0=t0.clone().addScaledVector(td,TL*(.1+k/11*.95)),sg=k%2?1:-1,ro=rnd()*6.28,d=td.clone().multiplyScalar(.6).addScaledVector(zij,sg*Math.cos(ro)).addScaledVector(OP,Math.sin(ro)*.8+.2).normalize();
     B.blaadje(b0,d,new V3().crossVectors(d,td).normalize(),(.085+rnd()*.04)*s,.026*s,OLIJF[(k+t+i)%5])}}}
  B.mesh(g);return g}
 // SCHILDERIJ in gouden lijst (canvas: Hollands landschap, stilleven of portret)
 function doek(soort,seed){const c=document.createElement('canvas');c.width=192;c.height=144;const g=c.getContext('2d');let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  if(soort==='land'){const lg=g.createLinearGradient(0,0,0,144);lg.addColorStop(0,'#8fa3b0');lg.addColorStop(.55,'#e2d2a6');lg.addColorStop(.6,'#5b6b45');lg.addColorStop(1,'#2e2a1c');g.fillStyle=lg;g.fillRect(0,0,192,144);
   for(let i=0;i<14;i++){g.fillStyle='rgba(255,250,235,'+(.2+rnd()*.3)+')';g.beginPath();g.ellipse(rnd()*192,15+rnd()*45,20+rnd()*30,6+rnd()*8,0,0,7);g.fill()}
   g.fillStyle='#2a2418';g.fillRect(120,58,10,30);g.save();g.translate(125,60);g.rotate(rnd());for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.fillRect(-1.5,0,3,26)}g.restore();g.fillStyle='#4a6a7a';g.fillRect(0,100,192,10)}
  else if(soort==='stil'){g.fillStyle='#1c140c';g.fillRect(0,0,192,144);g.fillStyle='#4a3420';g.fillRect(0,100,192,44);
   for(const [x,y,r,k] of [[70,92,16,'#c8a23a'],[96,96,13,'#a63b2a'],[120,90,18,'#d9cfb3'],[84,70,10,'#6a8a3a'],[140,98,9,'#e0b050']]){const rg=g.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);rg.addColorStop(0,'#fff6d8');rg.addColorStop(.25,k);rg.addColorStop(1,'#120c06');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
  else{g.fillStyle='#17110b';g.fillRect(0,0,192,144);const rg=g.createRadialGradient(96,58,4,96,64,34);rg.addColorStop(0,'#f0d2b0');rg.addColorStop(.7,'#b98a66');rg.addColorStop(1,'#17110b');g.fillStyle=rg;g.beginPath();g.ellipse(96,62,24,30,0,0,7);g.fill();
   g.fillStyle='#0d0a07';g.beginPath();g.ellipse(96,130,52,36,0,0,7);g.fill();g.fillStyle='#efe9dc';g.beginPath();g.ellipse(96,98,30,8,0,0,7);g.fill()}
  for(let i=0;i<1500;i++){g.fillStyle='rgba(30,20,5,'+rnd()*.12+')';g.fillRect(rnd()*192,rnd()*144,2,2)}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return Mn(0xffffff,{map:t,roughness:.7},'schilderij')}
 const doeken=[doek('land',3),doek('stil',5),doek('port',9),doek('land',13),doek('stil',17),doek('port',21)];
 // lijst in het vlak; normaal wijst naar +z (draai met ry)
 function lijst(p,x,y,z,ry,w,h,i){const g=stuk(p,x,y,z,ry);m(B(w+.12,h+.12,.04),goud,g,0,0,0);const v=m(new THREE.PlaneGeometry(w,h),doeken[i%doeken.length],g,0,0,.022);v.castShadow=false;return g}
 // BOEKENKAST met gekleurde ruggen
 function boekenkast(p,x,y,z,ry,w,h){const g=stuk(p,x,y,z,ry),d=.32;m(B(w,h,.03),eikDonker,g,0,h/2,-d/2+.015);for(const s of [-1,1])m(B(.04,h,d),eikDonker,g,s*(w/2-.02),h/2,0);
  const pl=Math.round(h/.36);const kl=[0x6b1f1a,0x23402c,0x1f2f55,0x8a6a2a,0x3c2a1c,0xb59a6a,0x4a1a2a].map((c,i)=>Mn(c,{roughness:.8},'boek'+i));let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<=pl;i++){const yy=i*h/pl;m(B(w-.06,.025,d-.02),eikDonker,g,0,yy+.012,0);if(i===pl)break;let xx=-w/2+.06;
   while(xx<w/2-.12){const bw=.025+rnd()*.035,bh=.2+rnd()*.1;if(rnd()<.06){xx+=.12;continue}m(B(bw,bh,.2+rnd()*.06),kl[Math.floor(rnd()*kl.length)],g,xx+bw/2,yy+.025+bh/2,.02);xx+=bw+.004}}
  return g}
 // STAANDE LEESLAMP en tafellamp
 function leeslamp(p,x,y,z){const g=stuk(p,x,y,z,0);m(CY(.14,.03,16),messing,g,0,.015,0);m(CY(.012,1.45,8),messing,g,0,.74,0);const k=m(CY(.11,.2,16,.2),Mn(0x2d4a33,{roughness:.6,side:THREE.DoubleSide},'lampkap'),g,0,1.5,0);
  const b=m(SP(.05),opaal,g,0,1.44,0);const l=new THREE.PointLight(0xffb870,.0,3.2,2);l.position.set(0,1.35,0);g.add(l);GZ_lampen.push(l);return g}
 const GZ_lampen=[];
 // lage salontafel
 function salontafel(p,x,y,z,ry,w,d,top){const g=stuk(p,x,y,z,ry);m(B(w,.05,d),top||eikDonker,g,0,.42,0);for(const s of [-1,1])for(const t of [-1,1])m(CY(.02,.4,8),messing,g,s*(w/2-.06),.2,t*(d/2-.06));m(B(w-.1,.02,d-.1),eikDonker,g,0,.12,0);return g}
 // kopje met schotel / glaasje / vaasje
 const kopG=CY(.04,.07,12,.032),schotelG=CY(.07,.01,14),glasG=CY(.035,.11,10,.03);
 const tafelSpul=(p,x,y,z,k)=>{if(k%3===0){m(schotelG,porselein,p,x,y+.005,z);m(kopG,porselein,p,x,y+.045,z)}else if(k%3===1){m(glasG,glasM,p,x,y+.055,z)}else{m(CY(.03,.14,10,.04),glasM,p,x,y+.07,z);const b=m(SP(.035),k%2?bloemRood:bloemGeel,p,x,y+.17,z)}};
 return {leerGroen,leerCognac,goud,teak,rotan,kussen,kussenBlauw,kussenOker,lavendel,bloemRood,bloemGeel,terracotta,spiegel,krijt,glasM,amber,flesGroen,flesHelder,groen2,groen3,
  loperTex,stuk,m,B,RB,CY,SP,rol,chesterfield,fauteuil,kleed,plant,olijf,bladBouw,bladM,lijst,boekenkast,leeslamp,salontafel,tafelSpul,GZ_lampen,Mn}})();

// ---------- HORECA ----------
{const G=GZ,H=deel('Horeca','Banken'),Z=deel('Horeca','Zithoeken'),K=deel('Horeca','Kleden'),W=deel('Horeca','Wandbekleding'),D=deel('Horeca','Decoratie');
 // chesterfield-bank langs de -z wand (zelfde plek als de oude bank: zitters blijven zitten) en bij het raam achterin
 G.chesterfield(H,2.95,BV,-3.78,0,5.6,velours,true);
 G.chesterfield(H,8.0,BV,3.78,Math.PI,1.8,G.leerGroen,true);
 // visgraatparket
 {const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#2a180c';g.fillRect(0,0,512,512);let s=5;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  // visgraat als punt-patroon: kolommen van schuine planken, links omhoog en rechts omlaag
  const a=64,tw=24;for(let col=0;col<4;col++){const x0=col*2*a;for(let y=-2*a;y<512+2*a;y+=tw){for(const k of [0,1]){const v=88+rnd()*46|0,r=v+46,gg=v+10,b=v-26;g.fillStyle='rgb('+r+','+gg+','+b+')';
    g.beginPath();if(!k){g.moveTo(x0,y);g.lineTo(x0+a,y-a);g.lineTo(x0+a,y-a+tw-1.5);g.lineTo(x0,y+tw-1.5)}else{g.moveTo(x0+a+1,y-a);g.lineTo(x0+2*a,y);g.lineTo(x0+2*a,y+tw-1.5);g.lineTo(x0+a+1,y-a+tw-1.5)}g.closePath();g.fill();
    for(let n=0;n<6;n++){g.strokeStyle='rgba(40,20,5,'+rnd()*.25+')';g.lineWidth=1;g.beginPath();const o=rnd()*tw;if(!k){g.moveTo(x0,y+o);g.lineTo(x0+a,y-a+o)}else{g.moveTo(x0+a,y-a+o);g.lineTo(x0+2*a,y+o)}g.stroke()}}}}
  for(let i=0;i<5000;i++){g.fillStyle='rgba('+(rnd()>.5?'255,220,170':'20,10,0')+','+rnd()*.05+')';g.fillRect(rnd()*512,rnd()*512,rnd()*8,1)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(17.4/1.0,8.38/1.0);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
  deel('Horeca','Vloer').traverse(o=>{if(o.isMesh&&o.geometry.parameters&&o.geometry.parameters.width>17){o.material=o.material.clone();o.material.map=t;o.material.color.set(0xffffff);o.material.roughness=.45;o.material.name='visgraatParket';o.material.needsUpdate=true}})}
 // kleden: loper door het middenpad, kleden bij de raamtafels en in de leeshoek
 {const lm=G.Mn(0xffffff,{roughness:.97},'loper');lm.map=G.loperTex;const o=G.m(G.B(7.4,.012,1.0),lm,K,4.3,BV+.036,.32);o.castShadow=false}G.kleed(K,4.0,BV+.03,3.55,3.6,1.15,0);G.kleed(K,11.25,BV+.03,-1.7,2.0,2.6,2);G.kleed(K,-2.5,BV+.03,-1.25,3.2,1.2,3);G.kleed(K,2.65,BV+.03,-2.6,4.6,1.0,2);
 // leeshoek achterin: twee groene fauteuils, boekenkast tegen de achterwand, leeslamp, salontafeltje
 G.fauteuil(Z,10.95,BV,-3.1,0,G.leerGroen);G.fauteuil(Z,10.95,BV,-.45,Math.PI,G.leerCognac);G.salontafel(Z,11.0,BV,-1.75,0,.8,.5);G.leeslamp(Z,12.0,BV,-3.6);
 G.boekenkast(Z,12.2,BV,-1.7,-Math.PI/2,2.6,2.3);G.tafelSpul(Z,10.8,BV+.45,-1.7,0);G.tafelSpul(Z,11.2,BV+.45,-1.85,1);
 G.plant(Z,10.2,BV,-3.85,1.5,null,'palm');
 // tweede zithoekje bij de ingang (+z, voor de toiletten): cognac fauteuil + bijzettafel
 G.fauteuil(Z,8.95,BV,1.15,-Math.PI/2+.25,G.leerCognac);
 // schilderijen: salonhang op de toiletwand (kijkt naar -z, de leeshoek in) en boven de bank
 [[10.3,2.55,.6,.45,0],[11.05,2.75,.55,.7,2],[11.8,2.5,.6,.45,1],[10.35,3.25,.45,.35,4],[11.75,3.2,.5,.38,3]].forEach(([x,y,w,h,i])=>G.lijst(D,x,y,.93,Math.PI,w,h,i));
 [[1.2,2.7,.5,.38,3],[4.6,2.75,.42,.55,5]].forEach(([x,y,w,h,i])=>{});
 // planten: grote palmen en hangplanten aan de balken
 G.plant(D,-4.5,BV,3.7,1.4,null,'palm');G.plant(D,6.0,BV,3.95,1.1,null,'palm');G.plant(D,-.2,BV,-3.95,1.0,null);
 for(const [x,z] of [[.0,-3.55],[2.65,-3.55],[2.0,3.65],[4.7,3.65],[-4.0,3.3]]){const g=G.stuk(D,x,BP-.05,z,0);beam([x,BP,z],[x,BP-.3,z],.004,zwartStaal,D);G.plant(g,0,-.42,0,.75,G.terracotta,'hang');
}
 // tafelspul op de bistrotafels en tafeltjes
 [[1.0,-.6],[2.9,-.6],[4.8,-.6],[7.7,-.55],[1.95,1.2],[3.85,1.2],[5.75,1.2],[7.6,1.3]].forEach(([x,z],i)=>{G.tafelSpul(D,x-.12,BV+.765,z+.1,i);G.tafelSpul(D,x+.14,BV+.765,z-.08,i+1)});
 [.55,1.95,3.35,4.75].forEach((x,i)=>G.tafelSpul(D,x+.15,BV+.752,-3.2,i+2));
 // BAR: spiegel met gouden lijst achter de achterbar, glazen planken met flessen, glazenrek boven de bar, krijtbord, nieuwe barkrukken
 {const BR=deel('Horeca','Bar');G.m(G.B(3.6,1.0,.03),G.goud,BR,-2.6,2.62,-4.17);G.m(G.B(3.45,.88,.02),G.spiegel,BR,-2.6,2.62,-4.15);
  for(const y of [2.28,2.72]){G.m(G.B(3.3,.025,.24),G.glasM,BR,-2.6,y,-4.02);for(const s of [-1,1])G.m(G.B(.03,.03,.24),messing,BR,-2.6+s*1.6,y-.03,-4.02)}
  const fles=(r,h)=>{const g=new THREE.LatheGeometry([[0,0],[r,0],[r,h*.62],[r*.4,h*.78],[r*.32,h],[0,h]].map(([a,b])=>new THREE.Vector2(a,b)),10);return g};
  const fg=[fles(.036,.3),fles(.04,.26),fles(.03,.32)],fm=[G.amber,G.flesGroen,G.flesHelder];
  for(const [y,n] of [[2.295,22],[2.735,20]])for(let i=0;i<n;i++){const k=(i*7+Math.round(y*10))%3;G.m(fg[(i*5)%3],fm[k],BR,-4.1+i*(3.0/n),y+.0,-4.02+((i%2)?.05:-.04))}
  // glazenrek boven de bar met hangende wijnglazen
  G.m(G.B(2.4,.06,.5),eikDonker,BR,-2.4,3.38,-2.75);for(const s of [-1,1])beam([-2.4+s*1.1,BP,-2.75],[-2.4+s*1.1,3.4,-2.75],.012,messing,BR);
  const wijn=new THREE.LatheGeometry([[0,0],[.035,0],[.004,.01],[.004,.09],[.03,.11],[.042,.16],[.036,.2]].map(([a,b])=>new THREE.Vector2(a,b)),10);
  for(let i=0;i<14;i++)for(const zz of [-2.88,-2.62]){const o=G.m(wijn,G.glasM,BR,-3.5+i*.165,3.35,zz,Math.PI,0,0);o.castShadow=false}
  // krijtbord met kaart, hangend aan de balk boven de bar (kant van de zaal)
  {const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle='#1d2320';g.fillRect(0,0,512,256);g.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<400;i++)g.fillRect(Math.random()*512,Math.random()*256,Math.random()*30,1);
   g.fillStyle='#f3efe4';g.textAlign='left';g.font='700 34px "Comic Sans MS","Segoe Print",cursive';g.fillText('DE KOFFIEBOOT',22,44);g.font='26px "Comic Sans MS","Segoe Print",cursive';
   [['Koffie','3,20'],['Verse tosti','6,50'],['Bitterballen','7,-'],['Appeltaart','4,50']].forEach(([a,b],i)=>{g.fillText(a,30,92+i*36);g.fillText(b,400,92+i*36)});g.fillStyle='#e7b83f';g.fillText('Vrijdag: buurtborrel!',30,240);
   const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const bd=G.stuk(BR,-.35,2.95,-2.75,Math.PI/2);G.m(G.B(1.12,.6,.03),eikDonker,bd,0,0,0);const v=G.m(new THREE.PlaneGeometry(1.04,.52),G.Mn(0xffffff,{map:t,roughness:.95},'krijtbordKaart'),bd,0,0,.017);v.castShadow=false;
   for(const s of [-1,1])beam([-.35,BP,-2.75+s*.45],[-.35,3.25,-2.75+s*.45],.004,zwartStaal,BR)}
  // taartenstolp en broodjes op de bar
  G.m(G.CY(.17,.02,20),porselein,BR,-1.0,BV+1.06,-2.8);G.m(new THREE.SphereGeometry(.17,16,8,0,Math.PI*2,0,Math.PI/2),G.glasM,BR,-1.0,BV+1.07,-2.8);G.m(G.CY(.13,.09,16),G.Mn(0xc58a4a,{roughness:.8},'taart'),BR,-1.0,BV+1.115,-2.8);
  for(let i=0;i<5;i++){const b=G.m(new THREE.SphereGeometry(1,10,6),G.Mn(0xc98a45,{roughness:.75},'croissant'),BR,-1.8+i*.13,BV+1.08,-2.72);b.scale.set(.055,.03,.04)}}
 // nieuwe barkrukken: cognac leren ronde zitting met lage rug en messing voetring (afwisselend met en zonder rug)
 {const BK=deel('Horeca','Barkrukken');[-4.1,-3.4,-2.7,-2.0,-1.3].forEach((x,i)=>{const g=G.stuk(BK,x,BV,-2.05,Math.PI);G.m(G.CY(.2,.07,18),G.leerCognac,g,0,.745,0);G.m(G.CY(.2,.02,18),messing,g,0,.705,0);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const o=G.m(G.CY(.018,.72,6),eikDonker,g,Math.cos(a)*.13,.36,Math.sin(a)*.13);o.rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12)}
  const r=G.m(new THREE.TorusGeometry(.17,.012,6,20),messing,g,0,.3,0,Math.PI/2);
  if(i%2===0){const lm=G.leerCognac.clone();lm.side=THREE.DoubleSide;lm.name='leerCognac2';G.m(new THREE.CylinderGeometry(.2,.2,.17,18,1,true,Math.PI*.6,Math.PI*.8),lm,g,0,.865,0)}})}
}
// ---------- SALON (stuurhuis) ----------
{const G=GZ,S=deel('Stuurhuis','Salon-inrichting'),SX=8,Y=4.06;
 G.chesterfield(S,SX+2.55,Y,.3,-Math.PI/2,4.4,G.leerGroen,true);
 G.fauteuil(S,6.95,Y,1.3,Math.PI/2,velours);G.fauteuil(S,8.25,Y,1.3,-Math.PI/2,G.leerCognac);
 G.fauteuil(S,6.95,Y,-.45,Math.PI/2,G.leerCognac);G.fauteuil(S,8.25,Y,-.45,-Math.PI/2,velours);
 G.salontafel(S,7.6,Y,1.3,0,.36,.6);G.salontafel(S,7.6,Y,-.45,0,.36,.6);
 G.kleed(S,SX-.4,Y+.03,.5,2.6,3.0,0);G.kleed(S,SX+1.9,Y+.03,.4,1.3,3.6,1);
 G.boekenkast(S,SX-2.75,Y,-1.8,Math.PI/2,1.1,1.9);G.leeslamp(S,SX+2.6,Y,-2.2);G.plant(S,SX+2.55,Y,2.55,1.1,null,'palm');
 G.tafelSpul(S,7.6,Y+.45,1.2,0);G.tafelSpul(S,7.6,Y+.45,-.4,1);G.tafelSpul(S,SX+1.85,Y+.765,1.6,2);G.tafelSpul(S,SX+1.85,Y+.765,.2,0);
 G.lijst(S,SX+2.94,Y+1.75,-1.7,-Math.PI/2,.6,.45,0)}
// ---------- DAKTERRAS ----------
{const G=GZ,T=deel('Dakterras','Terrasmeubels'),P=deel('Dakterras','Planten'),Y=4.06;
 // buitenkleed met blauw-witte strepen
 const streep=(a,b,n)=>{const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');for(let i=0;i<n;i++){g.fillStyle=i%2?a:b;g.fillRect(i*256/n,0,256/n,256)}for(let i=0;i<3000;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.05+')';g.fillRect(Math.random()*256,Math.random()*256,2,2)}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t};
 const buitenKleed=G.Mn(0xffffff,{map:streep('#2f4f8c','#efe6d2',10),roughness:.95},'buitenkleed'),zeil=G.Mn(0xffffff,{map:streep('#1E4FA8','#f4efe4',14),roughness:.85,side:THREE.DoubleSide},'zeildoek');
 const zeilWit=G.Mn(0xf4efe4,{roughness:.85},'zeilWit'),zeilBlauw=G.Mn(0x1E4FA8,{roughness:.85},'zeilBlauw'),ligDoek=G.Mn(0xffffff,{map:streep('#2f4f8c','#f4efe4',6),roughness:.9},'ligstoeldoek'),aardeM=G.Mn(0x3a2a1c,{roughness:1},'aarde');
 // A. LOUNGE voorop (boven het loket): U van teakhouten loungebanken met crèmekleurige kussens rond een lage tafel
 {const L=G.stuk(T,0,0,0,0);
  const lounge=(x,z,ry,len)=>{const g=G.stuk(L,x,Y,z,ry),d=.82;G.m(G.B(len,.06,d),G.teak,g,0,.27,0);G.m(G.B(len-.1,.05,d-.1),G.teak,g,0,.1,0);for(const sx of [-1,1])for(const sz of [-1,1])G.m(G.B(.08,.3,.08),G.teak,g,sx*(len/2-.14),.15,sz*(d/2-.06));G.m(G.RB(len-.04,.17,d-.16,.07),G.kussen,g,0,.37,.06);for(let i=0;i<4;i++)G.m(G.RB(len,.09,.035,.012),G.teak,g,0,.37+i*.135,-d/2+.03);// latten in plaats van blokken
   
   for(let i=0;i<Math.round(len/.6);i++){const k=G.m(G.RB(.5,.38,.16,.07),[G.kussenBlauw,G.kussen,G.kussenOker][i%3],g,-len/2+.32+i*.6,.62,-d/2+.2);k.rotation.x=-.2}
   for(const s of [-1,1]){G.m(G.RB(.11,.05,d,.02),G.teak,g,s*(len/2-.05),.56,0);for(const t of [-1,1])G.m(G.B(.08,.55,.08),G.teak,g,s*(len/2-.05),.275,t*(d/2-.05))}return g};
  lounge(-12.0,0,Math.PI/2,2.6);lounge(-10.6,-1.75,0,2.0);lounge(-10.6,1.75,Math.PI,2.0);
  G.m(G.B(4.0,.012,3.2),buitenKleed,L,-10.75,Y+.006,0).castShadow=false;
  G.salontafel(L,-10.55,Y,0,0,1.1,.7,G.teak);for(const [x,z] of [[-10.8,.1],[-10.3,-.15]]){const l=G.m(G.CY(.07,.18,8),G.Mn(0x1d1e20,{roughness:.4,metalness:.6},'lantaarn'),L,x,Y+.54,z);G.m(G.SP(.04),mat.lamp,L,x,Y+.53,z)}
  G.tafelSpul(L,-10.4,Y+.45,.15,0);G.tafelSpul(L,-10.7,Y+.45,-.2,1)}
 // B. LANGE BUURTTAFEL onder een blauw-wit zonnezeil (zoals de markies)
 {const g=G.stuk(T,-5.6,Y,1.55,0),Lt=4.2;G.m(G.B(Lt,.06,.95),G.teak,g,0,.75,0);for(const s of [-1,1])for(const t of [-1,1])G.m(G.B(.08,.72,.08),G.teak,g,s*(Lt/2-.2),.36,t*.36);
  for(const t of [-1,1]){G.m(G.B(Lt,.05,.32),G.teak,g,0,.45,t*.72);for(const s of [-1,1])G.m(G.B(.06,.43,.26),G.teak,g,s*(Lt/2-.25),.215,t*.72)}
  for(let i=0;i<6;i++)G.tafelSpul(g,-1.6+i*.62,.78,(i%2?.18:-.18),i);
  for(const x of [-1.2,0,1.2]){G.m(G.CY(.06,.14,10),G.terracotta,g,x,.85,0);for(let k=0;k<5;k++)G.m(G.SP(.04),k%2?G.lavendel:G.groen2,g,x+Math.cos(k)*.04,.95+k*.015,Math.sin(k)*.04)}
  // zeil op vier palen
  const zp=[[-2.6,-1.5],[2.6,-1.5],[-2.6,1.6],[2.6,1.6]];zp.forEach(([x,z])=>G.m(G.CY(.04,2.6,8),G.teak,g,x,1.3,z));
  const zg=new THREE.PlaneGeometry(5.4,3.3,8,4);const ps=zg.attributes.position;for(let i=0;i<ps.count;i++){const xx=ps.getX(i),yy=ps.getY(i);ps.setZ(i,-.18*(1-(xx/2.7)**2)*(1-(yy/1.65)**2))}zg.computeVertexNormals();
  const z=G.m(zg,zeil,g,0,2.55,.05,-Math.PI/2,0,0);z.rotation.z=0;
  for(let i=0;i<18;i++){const v=G.m(G.B(.3,.22,.01),i%2?zeilWit:zeilBlauw,g,-2.55+i*.3,2.44,-1.6)}
  for(let i=0;i<18;i++){G.m(G.B(.3,.22,.01),i%2?zeilWit:zeilBlauw,g,-2.55+i*.3,2.44,1.7)}}
 // C. LIGSTOELEN aan de waterkant (-z), gestreept doek
 for(const x of [-7.3,-6.2,-5.1,-4.0]){const g=G.stuk(T,x,Y,-3.35,Math.PI);G.m(G.B(.6,.04,1.3),G.teak,g,0,.32,.1);const r=G.m(G.B(.6,.04,.75),G.teak,g,0,.6,-.55,-.85);
  const doekM=ligDoek;G.m(G.B(.52,.02,1.2),doekM,g,0,.35,.1);const rd=G.m(G.B(.52,.02,.7),doekM,g,0,.62,-.53,-.85);
  for(const s of [-1,1])for(const t of [-.5,.6])G.m(G.B(.04,.32,.04),G.teak,g,s*.27,.16,t)}
 // D. BISTRO bij de salon: twee ronde tafeltjes met witte metalen stoelen en een parasol met franje
 {const wit=G.Mn(0xf1ede4,{roughness:.4,metalness:.4},'tuinMetaalWit');
  for(const [x,z] of [[-1.0,-1.9],[1.6,-2.2],[1.4,1.9]]){G.m(G.CY(.33,.03,20),marmer,T,x,Y+.75,z);G.m(G.CY(.03,.72,8),wit,T,x,Y+.38,z);G.m(G.CY(.22,.03,14),wit,T,x,Y+.015,z);G.tafelSpul(T,x+.1,Y+.765,z,Math.round(x*3+z))}
  reeks(thonetG,wit,[[-1.0,Y,-1.1,Math.PI],[-1.0,Y,-2.7,0],[1.6,Y,-1.4,Math.PI],[1.6,Y,-3.0,0],[0.9,Y,1.9,Math.PI/2],[1.9,Y,1.9,-Math.PI/2]],T,'tuinstoelen');
  const pg=G.stuk(T,.3,Y,-.1,0);G.m(G.CY(.04,2.5,8),G.teak,pg,0,1.25,0);G.m(new THREE.ConeGeometry(1.6,.55,16,1,true),zeil,pg,0,2.45,0);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const f=G.m(G.B(.6,.18,.01),i%2?zeilWit:zeilBlauw,pg,Math.cos(a)*1.56,2.1,Math.sin(a)*1.56,0,-a+Math.PI/2,0)}}
 // E. STATAFEL met wijnvat bij de trap (+z achter)
 {const g=G.stuk(T,-1.6,Y,3.3,0);G.m(G.CY(.3,.9,14,.27),G.Mn(0x6b4528,{roughness:.7},'vat'),g,0,.45,0);for(const y of [.15,.75])G.m(new THREE.TorusGeometry(.3,.015,6,20),zwartStaal,g,0,y,0,Math.PI/2);G.m(G.CY(.42,.04,20),G.teak,g,0,.92,0);G.tafelSpul(g,.1,.94,0,1);G.tafelSpul(g,-.12,.94,.1,2)}
 // F. PLANTENBAKKEN langs de reling met lavendel, gras en geraniums
 const bak=(x,z,ry,len)=>{const g=G.stuk(P,x,Y,z,ry);G.m(G.B(len,.5,.42),G.teak,g,0,.25,0);G.m(G.B(len-.06,.04,.36),aardeM,g,0,.49,0);
  // beplanting met echte bladvormen: lavendel, siergras en geraniums (één vorm per bak, kleur per hoekpunt)
  const Bb=G.bladBouw(Math.round(Math.abs(x*31+z*7))+5),V=THREE.Vector3;
  for(let i=0;i<Math.round(len/.11);i++){const xx=-len/2+.07+i*.11,k=i%5,a=new V(xx,.5,(Bb.rnd()-.5)*.2);
   if(k<2){for(let j=0;j<6;j++){const d=new V((Bb.rnd()-.5)*.5,1,(Bb.rnd()-.5)*.5).normalize(),L=.3+Bb.rnd()*.14,e=a.clone().addScaledVector(d,L);Bb.lint([a,e],.004,0x6f8457);
      for(let q=0;q<4;q++)Bb.blaadje(e.clone().addScaledVector(d,-.02+q*.022),d,new V(Math.cos(q*1.6),0,Math.sin(q*1.6)),.05,.028,k?0x8a78c0:0x7462b4)}
     for(let j=0;j<5;j++){const az=Bb.rnd()*6.28;Bb.blad(a.clone(),new V(Math.cos(az)*.7,.7,Math.sin(az)*.7).normalize(),new V(-Math.sin(az),0,Math.cos(az)),.16,.022,.2,0x6f8457,0x9aa884,2)}}
   else if(k<4){for(let j=0;j<9;j++){const az=Bb.rnd()*6.28,sp=.25+Bb.rnd()*.5;Bb.blad(a.clone(),new V(Math.cos(az)*sp,1,Math.sin(az)*sp).normalize(),new V(-Math.sin(az),0,Math.cos(az)),.38+Bb.rnd()*.25,.02,.35,0x5d8a45,0xb9c46a,3)}}
   else{for(let j=0;j<8;j++){const az=j*.8+Bb.rnd(),d=new V(Math.cos(az)*.8,.6,Math.sin(az)*.8).normalize();Bb.blad(a.clone(),d,new V(-Math.sin(az),0,Math.cos(az)),.16,.12,.4,0x2f5a2e,0x5d8a45,2)}
     for(let j=0;j<3;j++){const e=a.clone().add(new V((Bb.rnd()-.5)*.12,.2+Bb.rnd()*.06,(Bb.rnd()-.5)*.12));Bb.lint([a,e],.004,0x3f7036);for(let q=0;q<5;q++){const az=q*1.26;Bb.blaadje(e.clone(),new V(Math.cos(az),.35,Math.sin(az)).normalize(),new V(-Math.sin(az),0,Math.cos(az)),.06,.05,j%2?0xd6453a:0xe9603f)}}}}
  Bb.mesh(g)};
 for(const [x,z,len] of [[-9.0,3.95,2.0],[-9.4,-3.95,1.6],[-2.6,-3.95,1.4],[-1.7,3.95,.01],[3.3,3.95,2.6],[-12.2,-3.0,.01]])if(len>.1)bak(x,z,0,len);
 bak(-12.25,-3.2,Math.PI/2,1.4);bak(-12.25,3.2,Math.PI/2,1.4);
 // grote potten met olijfboompjes op de hoeken van de lange tafel
 for(const [x,z,sc] of [[-7.6,3.7,1.05],[-2.8,3.7,.95],[-8.4,-.6,1.1]])G.olijf(P,x,Y,z,sc);
}
// 's avonds gaan de leeslampen aan
{const sn=setNight;setNight=function(n){sn(n);GZ.GZ_lampen.forEach(l=>l.intensity=n?1.2:.25)}}

// ===== ART DIRECTION v0.34 (ronde 1): licht, lucht, water en kleurcorrectie naar de zes stills (gouache/poster, gouden uur) =====
// Opzet: de bestaande setNight() blijft werken; hierna zetten we per stand (dag/avond) onze eigen waarden eroverheen.
const AD=(()=>{
 // zon overdag: van de waterkant (schuin van voren op de zichtzijde van de pont, zoals in het hoofdbeeld en het zijaanzicht);
 // 's avonds blijft de gloed achter de kraan (oude richting), zoals in de avondstill.
 const adZon=(el,az)=>new THREE.Vector3(Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)).normalize();
 const DAG_EL=.42,DAG_AZ=.72;
 // --- lucht: lichte turquoise hemel naar crème horizon, stapelwolken met scherpe (geschilderde) randen ---
 const LU=lucht.material.uniforms;LU.wolkL={value:new THREE.Color(0xfff4dc)};LU.wolkS={value:new THREE.Color(0xcfd6cb)};LU.dek={value:.5};
 lucht.material.fragmentShader='varying vec3 d;uniform vec3 top,hor,glow,sunDir,grond,wolkL,wolkS;uniform float amt,dek;'+
  'float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}'+
  'float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=a*ns(p);p=p*2.03+7.1;a*=.5;}return v;}'+
  'float bil(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*abs(ns(p)*2.-1.);p=p*2.1+3.7;a*=.5;}return v;}'+
  'void main(){vec3 n=normalize(d);float h=clamp(n.y,0.,1.);vec3 c=mix(hor,top,pow(h,.42));float s=max(dot(n,sunDir),0.);'+
  'vec2 q=n.xz/(n.y+.2)*vec2(1.3,2.3)+3.;float f=fbm(q)*.72+bil(q*1.7)*.3,f2=fbm(q+vec2(.05,.16))*.72+bil(q*1.7+vec2(.08,.27))*.3;'+
  'float m=smoothstep(dek,dek+.045,f)*smoothstep(.015,.11,n.y);'+              // wolkmasker met vrij harde rand
  'float li=smoothstep(dek-.02,dek+.2,f2);li=li*.45+smoothstep(.4,.5,li)*.55;'+                                     // lichte bovenkant, schaduw aan de onderkant
  'vec3 cc=mix(wolkS,wolkL,li);cc=mix(cc,glow*1.1+.08,pow(s,3.)*.55);c=mix(c,cc,m*.92);'+
  'c+=glow*(pow(s,6.)*.1+pow(s,60.)*.14+pow(s,1400.)*1.1)*amt;c=mix(c,grond,smoothstep(0.,-.1,n.y));gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}';
 lucht.material.needsUpdate=true;
 // --- water: rustiger, groter golfpatroon, turquoise eigen kleur en verticaal uitgerekte spiegeling (geschilderde banen) ---
 {const wm=water.material;let fs=wm.fragmentShader;const ver=(a,b)=>{if(fs.indexOf(a)<0)console.warn('AD water: tekst niet gevonden',a);fs=fs.replace(a,b)};
  ver('vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;','vec2 distortion = surfaceNormal.xz * vec2(.45,1.5) * ( 0.001 + 1.0 / distance ) * distortionScale;');
  ver('float rf0 = 0.3;','float rf0 = 0.22;');
  ver('vec3 albedo = mix(','reflectionSample = mix( reflectionSample, waterColor * 1.5, 0.22 );\n\t\t\t\t\tvec3 albedo = mix(');
  ver('sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );','sunLight( surfaceNormal, eyeDirection, 60.0, 1.1, 0.5, diffuseLight, specularLight );');
  ver('vec3 outgoingLight = albedo;','float streep = texture2D( normalSampler, worldPosition.xz * vec2( 0.011, 0.09 ) + vec2( time * 0.004, 0.0 ) ).r;\n\t\t\t\t\tvec3 outgoingLight = albedo * ( 0.95 + 0.1 * smoothstep( 0.42, 0.58, streep ) );');
  wm.fragmentShader=fs;wm.uniforms.size.value=17;wm.uniforms.distortionScale.value=.34;wm.needsUpdate=true}
 // --- schaduw: scherper door een kleiner schaduwvlak rond pont, steiger en kraan ---
 {const c=sun.shadow.camera;c.left=-66;c.right=66;c.top=48;c.bottom=-48;c.near=20;c.far=400;c.updateProjectionMatrix();sun.shadow.bias=-.0004;sun.shadow.normalBias=.045}
 // --- kleurcorrectie: lichter en helderder, geen kleurrandjes meer, warm licht/koele schaduw, zachte posterisatie en papierkorrel (gouache) ---
 if(grade){const U=grade.uniforms;U.expo={value:1.2};U.sat={value:1.2};U.poster={value:.4};U.warm={value:1};
  grade.material.fragmentShader='varying vec2 vUv;uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,vig,grain,focus,expo,sat,poster,warm;'+
  'vec3 s(vec2 uv){return texture2D(tDiffuse,uv).rgb;}'+
  'float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}'+
  'void main(){vec2 uv=vUv,d=uv-.5;float bl=smoothstep(.3,.8,abs(uv.y-focus))*.9;vec2 px=bl/res;'+
  'vec3 c=s(uv)*.4;c+=(s(uv+vec2(px.x,0.))+s(uv-vec2(px.x,0.))+s(uv+vec2(0.,px.y))+s(uv-vec2(0.,px.y)))*.15;'+
  'c*=expo;c=c*(1.+c*.04)/(1.+c*.62);float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);'+
  'c*=mix(vec3(1.),mix(vec3(.93,1.,1.05),vec3(1.06,1.01,.92),smoothstep(.12,.85,l)),warm);'+
  'l=max(dot(c,vec3(.299,.587,.114)),.001);float q=10.,lq=(floor(l*q)+smoothstep(.3,.7,fract(l*q)))/q;c*=mix(1.,lq/l,poster);'+    // zachte kleurvlakken
  'c=(c-.5)*1.1+.5;'+
  'float pap=ns(uv*res*.45)*.6+ns(uv*res*.12)*.4;c*=1.+(pap-.5)*.05;'+                                                             // papierstructuur (staat stil)
  'c*=1.-vig*smoothstep(.3,1.,length(d)*1.4);'+
  'float n=fract(sin(dot(uv*res+time,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*grain;gl_FragColor=vec4(clamp(c,0.,1.),1.);}';
  grade.material.needsUpdate=true}
 // --- de standen ---
 const basis=setNight;
 function stand(n){basis(n);
  LU.top.value.set(n?0x35606c:0x7ab9c6);LU.hor.value.set(n?0xf2b070:0xf4e7c6);LU.glow.value.set(n?0xff8444:0xffd9a2);LU.grond.value.set(n?0x1a2a30:0x77705f);
  LU.wolkL.value.set(n?0xffa860:0xfff4dc);LU.wolkS.value.set(n?0x56707a:0xddd8c4);LU.dek.value=n?.5:.58;LU.amt.value=n?.8:.7;
  LU.sunDir.value.copy(n?zonDir(-.03):adZon(DAG_EL,DAG_AZ));
  const mist=n?0x5f7f86:0xe6dcc2;scene.background.set(mist);scene.fog.color.set(mist);scene.fog.near=n?80:130;scene.fog.far=n?460:640;wrap.style.background=n?'#5f7f86':'#e6dcc2';
  hemi.color.set(n?0x7fa4b4:0xdcefee);hemi.groundColor.set(n?0x2c3438:0xc9a57c);hemi.intensity=n?.3:.4;
  sun.color.set(n?0xff9a66:0xffd9a8);sun.intensity=n?.28:1.15;sun.target.position.set(-46,0,8);sun.target.updateMatrixWorld();
  sun.position.copy(sun.target.position).addScaledVector(n?zonDir(.12):adZon(DAG_EL,DAG_AZ),170);
  vul.color.set(n?0x88a8c0:0xfff0dc);vul.intensity=n?.12:.22;vul.position.set(-60,50,-70);
  const WU=water.material.uniforms;WU.sunDirection.value.copy(n?zonDir(.06):adZon(DAG_EL,DAG_AZ));WU.sunColor.value.set(n?0xff8a50:0xffe6c0);WU.waterColor.value.set(n?0x0f3d47:0x2f8f86);WU.distortionScale.value=n?.55:.34;
  // ramen en binnenlicht: overdag al warm zichtbaar, 's avonds stralend
  mat.raam.emissive.set(n?0xffb860:0xffc27a);mat.raam.emissiveIntensity=n?1.5:.3;mat.glas.emissiveIntensity=n?1.2:.16;
  binnen.forEach(l=>{l.intensity=n?1.05:(l.position.y>5?.3:.55);l.color.set(n?0xffbe78:0xffcf96)});
  mat.lamp.emissiveIntensity=n?2.4:.35;nacht.forEach(l=>{if(l.position.x===-9&&l.position.y===3)l.intensity=n?1.0:.4}); // hanglampen gloeien overdag zacht; bakkerij is ook overdag warm verlicht
  if(bloom){bloom.strength=n?.6:.22;bloom.threshold=n?.8:.96;bloom.radius=n?.6:.5}
  if(grade){const U=grade.uniforms;U.vig.value=n?.38:.16;U.grain.value=.022;U.expo.value=n?1.55:1.4;U.sat.value=n?1.18:1.22;U.poster.value=n?.3:.4}
  maakEnv()}
 setNight=stand;stand(false);
 return {adZon,stand}})();

// --- bomen, hagen en riet: lichte zonkant boven, koele donkere onderkant (geschilderde boomkruinen in twee tinten) ---
for(const bm of [...blad,blad0]){bm.onBeforeCompile=sh=>{
  sh.vertexShader='varying float adH;\n'+sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n adH=normalize(mat3(modelMatrix)*objectNormal).y;');
  sh.fragmentShader='varying float adH;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=mix(vec3(.5,.68,.74),vec3(1.32,1.26,.78),smoothstep(-.55,.85,adH));')};bm.needsUpdate=true}
blad[0].name='boomblad donker';blad[1].name='boomblad';blad[2].name='boomblad licht';blad0.name='struikblad';
mat.gras.color.set(0x8a9c58); // iets warmer, minder fel gras

// --- ETALAGE van de bakkerij (waterkant, tweede etalageraam): houten trapje vol brood, zoals in de productie-still ---
{const G=GZ,E=deel('Productie','Etalage'),z0=-3.98,xa=-8.3,xb=-5.42,L=xb-xa,xm=(xa+xb)/2;
 const korst=G.Mn(0xc8873c,{roughness:.8},'broodkorst'),korstD=G.Mn(0x9c5a26,{roughness:.8},'broodkorstDonker'),korstL=G.Mn(0xe2b266,{roughness:.85},'broodkorstLicht');
 const bolG=new THREE.SphereGeometry(1,12,8);
 const brood=(x,y,z,sx,sy,sz,mt,ry)=>{const b=G.m(bolG,mt,E,x,y+sy,z,0,ry||0,0);b.scale.set(sx,sy,sz);return b};
 AD.korst=[korst,korstD,korstL];AD.bolG=bolG;
 // drie treden met zijwangen
 for(let t=0;t<3;t++){G.m(G.B(L,.035,.24),G.teak,E,xm,1.47+t*.26,z0+t*.22);G.m(G.B(L,.24,.02),G.teak,E,xm,1.34+t*.26,z0+t*.22+.11)}
 for(const x of [xa,xb])G.m(G.B(.03,.95,.7),G.teak,E,x,1.5,z0+.22);
 // onderste trede: ronde bollen en vloerbroden; midden: lange broden; boven: manden met stokbrood en croissants
 for(let i=0;i<11;i++){const x=xa+.16+i*(L-.32)/10;if(i%3===2)brood(x,1.49,z0,.085,.06,.1,korstL,.3);else brood(x,1.49,z0,.115,.075,.105,i%2?korst:korstD,i*.7)}
 for(let i=0;i<8;i++){const x=xa+.2+i*(L-.4)/7;brood(x,1.75,z0+.22,.16,.07,.085,i%3?korst:korstL,(i%2?.25:-.2))}
 for(const [x,soort] of [[xa+.3,0],[xa+1.02,1],[xm,0],[xb-1.02,1],[xb-.3,0]]){
  const mand=G.m(new THREE.CylinderGeometry(.17,.13,.2,14,1,true),G.rotan,E,x,2.01+.1,z0+.44);mand.material.side=THREE.DoubleSide;G.m(G.CY(.13,.015,14),G.rotan,E,x,2.02,z0+.44);
  if(soort===0)for(let k=0;k<6;k++){const s=G.m(bolG,k%2?korst:korstL,E,x+Math.cos(k*1.05)*.07,2.3,z0+.44+Math.sin(k*1.05)*.07,(k%2-.5)*.25,0,(k%3-1)*.14);s.scale.set(.035,.26,.035)}
  else for(let k=0;k<7;k++)brood(x+Math.cos(k*.9)*.08,2.13+(k>4?.05:0),z0+.44+Math.sin(k*.9)*.08,.07,.035,.045,korst,k*1.3)}
 // prijskaartjes (kleine witte kaartjes) voor de onderste rij
 for(let i=0;i<4;i++){const k=G.m(G.B(.1,.07,.004),porselein,E,xa+.5+i*.72,1.525,z0-.115,-.3,0,0);k.castShadow=false}
 // de stalen deegtafel krijgt een warm houten werkblad
 deel('Productie','Deegtafel').traverse(o=>{if(o.isMesh&&o.geometry.parameters&&o.geometry.parameters.height===.1)o.material=G.teak});
 // warme opaline bollen boven de etalage (zoals de hanglampen in de still); ze gloeien overdag al zacht
 for(const x of [xa+.5,xm,xb-.5]){beam([x,3.75,z0+.3],[x,3.12,z0+.3],.006,zwartStaal,E);G.m(G.SP(.11),mat.lamp,E,x,3.02,z0+.3).castShadow=false}}

// --- achterkant van de bar (twee ramen aan de waterkant keken tegen de kale kastrug aan): donker houten etalagewand met affiche en krijtbord ---
{const G=GZ,A=deel('Horeca','Raamaffiches');
 G.m(G.B(3.85,2.1,.012),eikDonker,A,-2.68,2.17,-4.213).castShadow=false;
 const c=document.createElement('canvas');c.width=768;c.height=384;const g=c.getContext('2d');
 g.fillStyle='#f1e4c4';g.fillRect(0,0,768,384);g.fillStyle='#8fc2c2';g.fillRect(0,0,768,150);g.fillStyle='#fff3d8';for(const [x,y,r] of [[120,70,34],[165,60,44],[215,74,30],[560,50,30],[600,44,38],[645,58,26]]){g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 g.fillStyle='#3f9a90';g.fillRect(0,150,768,60);g.fillStyle='#1d3f87';g.beginPath();g.moveTo(170,170);g.lineTo(600,170);g.lineTo(575,128);g.lineTo(200,128);g.closePath();g.fill();   // pont als silhouet
 g.fillStyle='#fbf6ea';g.fillRect(230,98,330,32);g.fillRect(420,66,110,34);g.fillStyle='#1d3f87';g.fillRect(414,60,122,8);g.fillStyle='#f3c56a';for(let i=0;i<8;i++)g.fillRect(245+i*38,105,24,16);
 g.fillStyle='#1d3f87';g.textAlign='center';g.font='900 78px "Arial Black",Arial,sans-serif';g.fillText('DE KOFFIEBOOT',384,292,700);g.fillStyle='#b5562c';g.font='700 34px Georgia,serif';g.fillText('koffie  ·  vers brood  ·  buurt',384,346);
 g.strokeStyle='#1d3f87';g.lineWidth=10;g.strokeRect(8,8,752,368);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;const af=G.m(new THREE.PlaneGeometry(2.2,1.1),G.Mn(0xffffff,{map:t,roughness:.9},'affiche'),A,-3.4,2.58,-4.222,0,Math.PI,0);af.castShadow=false;
 const k=document.createElement('canvas');k.width=256;k.height=320;const q=k.getContext('2d');q.fillStyle='#232a27';q.fillRect(0,0,256,320);q.strokeStyle='#c9a36a';q.lineWidth=10;q.strokeRect(5,5,246,310);
 q.fillStyle='#f3efe4';q.textAlign='center';q.font='700 34px "Comic Sans MS","Segoe Print",cursive';q.fillText('Vandaag',128,62);q.fillText('vers:',128,100);q.font='26px "Comic Sans MS","Segoe Print",cursive';['desembrood','croissants','appeltaart','koffie!'].forEach((w,i)=>q.fillText(w,128,150+i*40));
 const kt=new THREE.CanvasTexture(k);const kb=G.m(new THREE.PlaneGeometry(.8,1.0),G.Mn(0xffffff,{map:kt,roughness:.95},'krijtbordRaam'),A,-1.3,2.6,-4.222,0,Math.PI,0);kb.castShadow=false}

mat.doek.color.set(0xeadfc6);mat.doek.name='parasoldoek'; // parasols op de steiger: crème, zoals in de dakterras-still

// ventilatieroosters stonden dwars voor een raam: nu laag onder de ramen
deel('Romp','Roosters').children.forEach(o=>{o.scale.y=.42;o.position.y=1.5});

// ===================== RONDE 2 =====================
// --- 1. BUURTLOKET als blikvanger: grote gestreepte luifel met volant en lampjes, broodrekken naast het luik, gebak op de toonbank ---
{const G=GZ,L=deel('Buurtloket','Luifel');L.children.slice().forEach(o=>L.remove(o));
 const doekTex=(volant)=>{const c=document.createElement('canvas');c.width=1024;c.height=volant?64:128;const g=c.getContext('2d'),n=16,w=1024/n;
  for(let i=0;i<n;i++){g.fillStyle=i%2?'#f6efdc':'#1d4fa0';if(volant){g.fillRect(i*w,0,w,34);g.beginPath();g.arc(i*w+w/2,32,w/2-1,0,Math.PI);g.fill()}else g.fillRect(i*w,0,w,128)}
  if(!volant)for(let i=0;i<2500;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.05+')';g.fillRect(Math.random()*1024,Math.random()*128,3,2)}
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
 const doek=new THREE.MeshStandardMaterial({map:doekTex(false),side:THREE.DoubleSide,roughness:.85,name:'luifeldoek'}),vol=new THREE.MeshStandardMaterial({map:doekTex(true),side:THREE.DoubleSide,roughness:.85,alphaTest:.5,name:'luifelvolant'});
 const vlak=(P,mt)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P.flat(),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=new THREE.Mesh(g,mt);o.castShadow=o.receiveShadow=true;L.add(o);return o};
 const xa=-15.58,ya=3.42,xb=-17.15,yb=3.06,hz=3.05;
 vlak([[xa,ya,-hz],[xa,ya,hz],[xb,yb,hz],[xb,yb,-hz]],doek);vlak([[xb,yb,-hz],[xb,yb,hz],[xb-.02,yb-.24,hz],[xb-.02,yb-.24,-hz]],vol);
 for(const s of [-1,1]){beam([xa,2.75,s*(hz-.05)],[xb,yb-.01,s*(hz-.05)],.018,mat.staalWit,L);beam([xa,ya-.02,s*(hz-.05)],[xb,yb-.01,s*(hz-.05)],.014,mat.staalWit,L)}
 beam([xb,yb-.01,-hz],[xb,yb-.01,hz],.016,mat.staalWit,L);
 for(let i=0;i<9;i++){const z=-2.6+i*.65;G.m(G.SP(.055),mat.lamp,L,xb+.25,yb-.1,z).castShadow=false}beam([xb+.25,yb-.03,-2.8],[xb+.25,yb-.03,2.8],.005,zwartStaal,L);
 // broodrekken links en rechts van het luik (schuine schappen met opstaande rand)
 const R=deel('Buurtloket','Broodrekken'),[korst,korstD,korstL]=AD.korst;
 for(const s of [-1,1]){const zc=s*2.32,x0=-15.76;for(const dz of [-.8,.8])G.m(G.B(.4,1.55,.03),G.teak,R,x0,1.12+.775,zc+dz);G.m(G.B(.02,1.55,1.6),G.teak,R,-15.575,1.895,zc);
  for(let k=0;k<3;k++){const y=1.5+k*.42,sh=G.m(G.B(.4,.025,1.58),G.teak,R,x0,y,zc,0,0,.33);G.m(G.B(.025,.07,1.58),G.teak,R,x0-.19,y-.035,zc,0,0,.33);
   for(let i=0;i<(k===1?5:7);i++){const z=zc-.66+i*(k===1?.33:.22),mt=[korst,korstD,korstL][(i+k)%3],b=G.m(AD.bolG,mt,R,x0-.03,y+.065,z,0,k===1?0:1.57,.33);if(k===1)b.scale.set(.1,.065,.15);else if(k===0)b.scale.set(.1,.07,.1);else b.scale.set(.095,.045,.06)}}}
 // gebak op de toonbank: taartstolp, etagère met croissants, plateau met koeken
 const T=deel('Buurtloket','Toonbank'),ty=2.065,taart=G.Mn(0xb5683a,{roughness:.7},'taartbodem'),room=G.Mn(0xf3e6cc,{roughness:.6},'slagroom');
 G.m(G.CY(.05,.012,12),porselein,T,-15.86,ty+.006,-.42);G.m(G.CY(.012,.08,8),porselein,T,-15.86,ty+.05,-.42);G.m(G.CY(.15,.012,20),porselein,T,-15.86,ty+.095,-.42);G.m(G.CY(.115,.07,18),taart,T,-15.86,ty+.135,-.42);G.m(G.CY(.118,.015,18),room,T,-15.86,ty+.177,-.42);
 const st=G.m(new THREE.SphereGeometry(.15,16,8,0,Math.PI*2,0,Math.PI/2),G.glasM,T,-15.86,ty+.1,-.42);st.castShadow=false;
 for(const [y,r] of [[.0,.15],[.14,.11]]){G.m(G.CY(r,.01,18),porselein,T,-15.86,ty+.012+y,.28);for(let i=0;i<(y?4:6);i++){const a=i*(y?1.57:1.05),b=G.m(AD.bolG,korst,T,-15.86+Math.cos(a)*r*.6,ty+.04+y,.28+Math.sin(a)*r*.6,0,a,0);b.scale.set(.055,.028,.035)}}G.m(G.CY(.01,.2,6),messing,T,-15.86,ty+.1,.28);
 G.m(G.B(.24,.012,.4),G.teak,T,-15.86,ty+.006,-.06);for(let i=0;i<6;i++){const b=G.m(G.CY(.045,.018,12),i%2?korstL:korstD,T,-15.92+(i%2)*.12,ty+.022,-.2+Math.floor(i/2)*.14)}
}

// --- 2. BINNENLICHT: binnenmaterialen krijgen minder vlak hemellicht, lampen worden de hoofdbron; lichtpoelen onder de hanglampen; salon warm bekleed ---
{const G=GZ,S=deel('Stuurhuis','Salon-bekleding'),warmWand=G.Mn(0xdcc08e,{roughness:.9},'salonwand');
 for(const sd of [1,-1]){box(5.88,1.22,.02,lambris,8,4.67,sd*2.69,S);box(1.28,.92,.02,warmWand,8,5.75,sd*2.69,S);box(5.88,.36,.02,warmWand,8,6.37,sd*2.69,S);for(const x of [5.25,10.75])box(.42,.92,.02,warmWand,x,5.75,sd*2.69,S);box(5.88,.05,.04,eikDonker,8,5.29,sd*2.68,S)}
 box(.012,1.22,5.36,lambris,10.943,4.67,0,S);box(.012,1.27,5.36,warmWand,10.943,5.915,0,S);box(.03,.05,5.36,eikDonker,10.93,5.29,0,S);box(5.86,.015,5.36,warmWand,8,6.53,0,S);
 S.traverse(o=>{if(o.isMesh)o.castShadow=false});
 // minder hemellicht op alles wat alleen binnen voorkomt
 const verz=g=>{const st=new Set();g.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material))st.add(o.material)});return st};
 const binnenM=new Set([...verz(BOOT.Horeca.g),...verz(BOOT.Productie.g),...verz(deel('Stuurhuis','Salon-inrichting')),...verz(S),...verz(deel('Buurtloket','Inrichting'))]);
 const buitenM=new Set([...Object.values(mat),blauwD,witD,glasH,G.bladM,...verz(BOOT.Dakterras.g),...verz(BOOT.Romp.g),...verz(BOOT.Loketplein.g),...verz(BOOT.Achterdek.g),...verz(deel('Stuurhuis','Salon')),...verz(deel('Stuurhuis','Stuurhut'))]);
 const oud='irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );',chunk=THREE.ShaderChunk.lights_fragment_begin;
 if(chunk.indexOf(oud)>=0){const nieuw=chunk.replace(oud,'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry ) * 0.38;');
  binnenM.forEach(m=>{if(buitenM.has(m)||!m.isMeshStandardMaterial||m.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile)return;m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',nieuw)};m.envMapIntensity*=.55;m.needsUpdate=true})}
 else console.warn('AD: hemellicht-regel niet gevonden');
 // lichtpoelen: warme vlekken op vloer en plafond bij elke opaline hanglamp (geen extra lampen nodig)
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,196,120,1)');r.addColorStop(.45,'rgba(255,170,90,.45)');r.addColorStop(1,'rgba(255,150,70,0)');g.fillStyle=r;g.fillRect(0,0,128,128);
 const poelM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.3,fog:false,name:'lichtpoel'});AD.poelM=poelM;
 const PG=new THREE.PlaneGeometry(1,1),poel=(par,x,y,z,s,op)=>{const o=new THREE.Mesh(PG,poelM);o.position.set(x,y,z);o.rotation.x=op?Math.PI/2:-Math.PI/2;o.scale.setScalar(s);o.renderOrder=2;par.add(o)};
 const HP=deel('Horeca','Lichtpoelen'),SP2=deel('Stuurhuis','Lichtpoelen');
 [[BOOT.Horeca.g,HP,BV+.062,BP-.012],[BOOT.Stuurhuis.g,SP2,4.06+.05,6.515]].forEach(([gr,par,yv,yp])=>{const L=[];gr.traverse(o=>{if(o.isMesh&&o.material===opaal&&o.geometry.type==='SphereGeometry'&&o.position.y>yv+1.2&&o.parent.userData.niveau==='onderdeel')L.push(o.position.clone())});
  L.forEach(p=>{poel(par,p.x,yv,p.z,2.6,false);poel(par,p.x,yp,p.z,1.5,true)})});
 // na de laatste setNight-omhulling (staat verderop in de code) zetten wij de binnenlampen op onze waarden
 AD.binnenlicht=n=>{binnen.forEach(l=>{l.intensity=n?.8:(l.position.y>5?.75:1.0);l.color.set(n?0xffa864:0xffc890);l.distance=11});opaal.emissiveIntensity=n?1.4:.7;poelM.opacity=n?.5:.26};
 setTimeout(()=>{const s=setNight;setNight=function(n){s(n);AD.binnenlicht(n)};AD.binnenlicht(false)},0)}

// --- 3. KADE EN STEIGER: bakstenen kademuur met overhangend groen, bolders en trossen, plantenbakken op het steigerterras, lichtjes aan de kraan ---
{const G=GZ,V=THREE.Vector3;
 damwand.map=maakTex(1.2,g=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,512,512);for(let r=0;r<8;r++)for(let k=-1;k<4;k++){const v=150+Math.random()*90|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(k*128+(r%2)*64+3,r*64+3,122,58)}ruis(g,1500,120,230,2,5)});
 damwand.color.set(0xb4633f);damwand.metalness=0;damwand.roughness=.9;damwand.name='kademuur baksteen';damwand.needsUpdate=true;
 // overhangend groen en struiken langs de kaderand
 let sd=23;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let x=-118;x<=118;x+=4+rnd()*7){if(Math.abs(x)<11)continue;const gr=x>=0?noord:zuid,k=Math.floor(rnd()*3);
  const h=new THREE.Mesh(bladGeos[k],blad[(k+1)%3]);h.scale.set(.6+rnd()*.7,.4+rnd()*.25,.22);h.position.set(x,.55-rnd()*.2,.72);h.receiveShadow=true;gr.add(h);
  if(rnd()<.6){const s=new THREE.Mesh(bladGeos[(k+1)%3],blad[k]);const r=.32+rnd()*.3;s.scale.set(r*1.4,r,r);s.position.set(x+1+rnd()*2,1.25+r*.6,-1.4-rnd()*1.2);s.castShadow=s.receiveShadow=true;gr.add(s)}}
 // bolders op de steiger met trossen naar de pont
 const ijzer=G.Mn(0x1c1d1f,{roughness:.5,metalness:.6},'bolderijzer');
 for(const x of [-67.5,-57,-46.5,-37]){G.m(G.CY(.1,.3,12,.13),ijzer,zuid,x,.7,6.72);G.m(G.CY(.17,.06,12,.12),ijzer,zuid,x,.88,6.72);
  const o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V(x,.8,6.72),new V(x+.5,.72,7.15),new V(x+1.1,1.25,7.62)]),8,.022,5),mat.touw);o.castShadow=true;zuid.add(o);
  G.m(new THREE.TorusGeometry(.14,.022,5,14),mat.touw,zuid,x,.76,6.72,Math.PI/2)}
 // plantenbakken met siergras en lavendel langs de kadekant van het steigerterras
 for(const x of [-48.6,-53.6,-58.2,-62.8,-67.4]){const g=G.stuk(zuid,x,.55,3.32,0),len=1.7;G.m(G.B(len,.42,.36),G.teak,g,0,.21,0);const B=G.bladBouw(Math.round(-x*13));
  for(let i=0;i<14;i++){const a=new V(-len/2+.1+i*.115,.42,(B.rnd()-.5)*.16);
   if(i%3<2)for(let j=0;j<8;j++){const az=B.rnd()*6.28,sp=.25+B.rnd()*.5;B.blad(a.clone(),new V(Math.cos(az)*sp,1,Math.sin(az)*sp).normalize(),new V(-Math.sin(az),0,Math.cos(az)),.4+B.rnd()*.3,.022,.35,0x5d8a45,0xc2c873,3)}
   else for(let j=0;j<6;j++){const d=new V((B.rnd()-.5)*.5,1,(B.rnd()-.5)*.5).normalize(),e=a.clone().addScaledVector(d,.32+B.rnd()*.14);B.lint([a,e],.004,0x6f8457);for(let q=0;q<4;q++)B.blaadje(e.clone().addScaledVector(d,-.02+q*.022),d,new V(Math.cos(q*1.6),0,Math.sin(q*1.6)),.05,.028,0x8a78c0)}}
  B.mesh(g)}
 // lichtjes aan de kraan: snoer langs de giek en langs de hijskabel (gloeien 's avonds, zoals in de avondstill)
 for(let i=0;i<13;i++){const t=.06+i/13*.92,x=0,y=12.6+(38.6-12.6)*t,z=2.9+(16.2-2.9)*t;const b=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),mat.lamp);b.position.set(x,y-1.5,z);arm.add(b)}
 for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),mat.lamp);b.position.set(0,36-i*2,17.1);arm.add(b)}
 beam([0,12.9,3.2],[0,37.2,16.2],.012,mat.staalDonker,arm)}

// --- 4. PONTDETAIL: plaatnaden met klinknagels, crème bies, lattenbanken op het loketplein ---
{const G=GZ,N=deel('Romp','Plaatnaden'),naadM=G.Mn(0x163270,{roughness:.5},'plaatnaad'),klinkM=G.Mn(0x2a55a8,{roughness:.35,metalness:.2},'klinknagel');
 const NA={1:[-8.75,-4.92,-2.0,4.6,7.4,10.3,12.05],'-1':[-8.75,-4.92,-2.0,.8,3.6,6.4,9.2,12.15]},pl=[];
 for(const sd of [1,-1]){const z=sd*4.506;for(const x of NA[sd]){box(.022,2.3,.008,naadM,x,2.15,z,N).castShadow=false;for(let y=1.12;y<3.3;y+=.17)for(const dx of [-.055,.055])pl.push([x+dx,y,z])}
  for(let x=-12.4;x<=12.4;x+=.2)pl.push([x,1.07,z]);
  box(25,.035,.01,mat.wit,0,1.275,sd*4.507,deel('Romp','Bies')).castShadow=false}
 const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.016,6,4),klinkM,pl.length),d=new THREE.Object3D();pl.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.name='klinknagels';deel('Romp','Klinknagels').add(im);
 // loketplein: de twee blokbanken worden lattenbanken met rugleuning op stalen poten
 const MB=deel('Loketplein','Meubels');MB.children.slice().forEach(o=>{const p=o.geometry&&o.geometry.parameters;if(p&&(p.depth===3.2||p.width===3.2)&&p.height===.45)MB.remove(o)});
 const bank=(x,z,ry)=>{const g=G.stuk(MB,x,.76,z,ry);for(let i=0;i<4;i++)G.m(G.RB(3.2,.035,.095,.012),G.teak,g,0,.44,-.17+i*.113);for(let i=0;i<3;i++)G.m(G.RB(3.2,.085,.03,.012),G.teak,g,0,.6+i*.115,-.25-i*.02,-.12,0,0);
  for(const xx of [-1.35,0,1.35]){G.m(G.B(.04,.42,.04),zwartStaal,g,xx,.21,.14);G.m(G.B(.04,.86,.04),zwartStaal,g,xx,.43,-.22,-.1,0,0);G.m(G.B(.04,.03,.42),zwartStaal,g,xx,.415,-.03)}};
 bank(-23.55,-2.6,Math.PI/2);bank(-21.8,-4.7,0)}

// ===================== RONDE 3 =====================
// --- 1. AVOND BINNEN: ramen gloeien alleen van buiten gezien; binnen minder bloom en zwakkere bakkerij-/loketlampen, zodat het donker-gezellig blijft ---
{AD.inn=false;AD.nacht=false;
 AD.zetRaam=()=>{const n=AD.nacht,i=AD.inn;mat.raam.emissiveIntensity=i?.04:(n?1.5:.3);if(bloom){bloom.strength=n?(i?.22:.5):.22;bloom.threshold=n?(i?.95:.84):.96}if(grade){grade.uniforms.expo.value=n?(i?1.22:1.55):1.4;grade.uniforms.vig.value=n?(i?.5:.38):.16}
  nacht.forEach(l=>{if(l.position.x<=-9&&l.position.y<3.5)l.intensity=n?(i?.35:.9):(l.position.x===-9&&l.position.y===3?.2:0)});binnen.forEach(l=>{if(l.position.x<-12)l.intensity=n?(i?.4:.9):.8})};
 const oudB=AD.binnenlicht;AD.binnenlicht=n=>{oudB(n);AD.nacht=n;AD.zetRaam()};
 const q=new THREE.Vector3();(function lus(){q.copy(camera.position);pont.worldToLocal(q);
  const i=(q.x>-12.6&&q.x<12.6&&Math.abs(q.z)<4.35&&q.y>1&&q.y<3.8)||(q.x>5&&q.x<11&&Math.abs(q.z)<2.75&&q.y>4&&q.y<6.6);if(i!==AD.inn){AD.inn=i;AD.zetRaam()}requestAnimationFrame(lus)})()}

// --- 2. MENSEN BINNEN: zelfde demping van het hemellicht als de binnenmaterialen (eigen kopie van het materiaal, buitenmensen blijven zoals ze waren) ---
{const oud='irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );',chunk=THREE.ShaderChunk.lights_fragment_begin;
 if(chunk.indexOf(oud)>=0){const nieuw=chunk.replace(oud,'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry ) * 0.45;'),demp=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',nieuw)},mk=new Map();
  for(const nm of ['Horeca','Personeel','Salon'])deel('Mensen',nm).traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial){let c=mk.get(o.material);if(!c){c=o.material.clone();c.name=o.material.name+' (binnen)';c.envMapIntensity=.5;c.onBeforeCompile=demp;mk.set(o.material,c)}o.material=c}})}}

// --- 3. KADE: heesters (hortensia's), bloemperken langs de kaderand, lattenbanken met uitzicht op het water, fietsenrek met fietsen ---
{const G=GZ,V=THREE.Vector3,GR=[0x2f5a2e,0x3f7036,0x5d8a45,0x79a04e];
 const heester=(gr,x,z,s,bloem)=>{const g=G.stuk(gr,x,1.2,z,0),B=G.bladBouw(Math.round(Math.abs(x*7+z*3))+3);
  for(let i=0;i<64;i++){const az=B.rnd()*6.28,el=B.rnd()*1.35,r=(.3+B.rnd()*.5)*s,d=new V(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)),a=d.clone().multiplyScalar(r);a.y=a.y*.9+.12*s;
   B.blad(a,d.clone().setY(d.y+.3).normalize(),new V(-Math.sin(az),0,Math.cos(az)),(.3+B.rnd()*.15)*s,(.13+B.rnd()*.05)*s,.3,GR[i%2],GR[2+i%2],2);
   if(bloem&&i%3===0){const e=a.clone().addScaledVector(d,.32*s);for(let k=0;k<5;k++){const aq=k*1.26;B.blaadje(e,new V(Math.cos(aq),.45,Math.sin(aq)).normalize(),new V(-Math.sin(aq),0,Math.cos(aq)),.12*s,.1*s,bloem)}}}
  B.mesh(g)};
 const HK=[0xd98aa8,0x8fa6dc,0xf2ead8,0];
 [[-98,-4.5,1.3],[-90,-3.2,1],[-79,-4.8,1.4],[-72,-3.4,1.1],[-64.5,-4.6,1.3],[-56,-3.3,1],[-49,-4.9,1.4],[-41.5,-3.5,1.1],[-28,-4.4,1.2],[-23,-3.3,.9]].forEach(([x,z,s],i)=>heester(zuid,x,z,s,HK[i%4]));
 [[14,-3.6,1.2],[21,-4.8,1],[34,-3.4,1.3],[46,-4.6,1.1],[60,-3.5,1.3]].forEach(([x,z,s],i)=>heester(noord,x,z,s,HK[(i+1)%4]));
 // bloemperken: gras met bloemen op steeltjes in rood, geel, wit en lavendel
 const BK=[0xd6453a,0xf0c23c,0xf6f0e2,0x8a78c0,0xe9703f];
 for(const x0 of [-71,-63.5,-56,-48.5,-29.5]){const g=G.stuk(zuid,x0,1.2,-.95,0),B=G.bladBouw(Math.round(-x0*5));
  for(let i=0;i<46;i++){const a=new V(-2.6+i*.113+B.rnd()*.05,0,(B.rnd()-.5)*.55);for(let j=0;j<4;j++){const az=B.rnd()*6.28,sp=.3+B.rnd()*.5;B.blad(a.clone(),new V(Math.cos(az)*sp,1,Math.sin(az)*sp).normalize(),new V(-Math.sin(az),0,Math.cos(az)),.28+B.rnd()*.2,.03,.35,GR[1],GR[3],2)}
   const e=a.clone().add(new V((B.rnd()-.5)*.1,.3+B.rnd()*.22,(B.rnd()-.5)*.1));B.lint([a,e],.005,0x3f7036);const kl=BK[(i*7+(i>>2))%5];for(let k=0;k<6;k++){const aq=k*1.05;B.blaadje(e,new V(Math.cos(aq),.5,Math.sin(aq)).normalize(),new V(-Math.sin(aq),0,Math.cos(aq)),.085,.07,kl)}}
  B.mesh(g)}
 // lattenbanken aan de kaderand
 const bank=(gr,x,y,z,ry,len)=>{const g=G.stuk(gr,x,y,z,ry);for(let i=0;i<4;i++)G.m(G.RB(len,.035,.095,.012),G.teak,g,0,.44,-.17+i*.113);for(let i=0;i<3;i++)G.m(G.RB(len,.085,.03,.012),G.teak,g,0,.6+i*.115,-.25-i*.02,-.12,0,0);
  for(const xx of [-len/2+.2,len/2-.2]){G.m(G.B(.04,.42,.04),zwartStaal,g,xx,.21,.14);G.m(G.B(.04,.86,.04),zwartStaal,g,xx,.43,-.22,-.1,0,0);G.m(G.B(.04,.03,.42),zwartStaal,g,xx,.415,-.03)}};
 for(const x of [-67,-52.3,-44.6])bank(zuid,x,1.2,-2.3,0,1.9);bank(noord,24,1.2,-2.3,0,1.9);
 // fietsenrek (nietjes) met vier fietsen
 const FR=G.stuk(zuid,-34.5,1.2,-4.3,0),frame=[G.Mn(0x2f7f86,{roughness:.4,metalness:.3},'fietsframe petrol'),G.Mn(0xd9a13a,{roughness:.4,metalness:.3},'fietsframe oker')];
 for(let i=0;i<6;i++){const x=i*.75;beam([x,0,-.35],[x,.8,-.35],.022,lampGrijs,FR);beam([x,0,.35],[x,.8,.35],.022,lampGrijs,FR);beam([x,.8,-.35],[x,.8,.35],.022,lampGrijs,FR)}
 const wiel=new THREE.TorusGeometry(.32,.018,5,18);
 [[.18,0],[.93,1],[2.43,0],[3.18,1]].forEach(([x,k],n)=>{const f=G.stuk(FR,x,0,(n%2?.08:-.06),0);f.rotation.z=n%2?-.07:.06;const fm=frame[k];
  for(const z of [-.52,.52])G.m(wiel,zwartStaal,f,0,.34,z,0,Math.PI/2,0);
  beam([0,.34,-.52],[0,.62,-.12],.016,fm,f);beam([0,.62,-.12],[0,.36,.08],.016,fm,f);beam([0,.36,.08],[0,.34,-.52],.014,fm,f);beam([0,.36,.08],[0,.82,.3],.016,fm,f);beam([0,.62,-.12],[0,.78,.3],.016,fm,f);beam([0,.34,.52],[0,.92,.3],.014,fm,f);
  beam([0,.62,-.12],[0,.84,-.18],.014,fm,f);G.m(G.B(.1,.04,.22),zwartStaal,f,0,.86,-.2);beam([-.2,.94,.3],[.2,.94,.3],.012,zwartStaal,f)})}

// --- 4. STEIGERTERRAS: bistrosets (marmeren blad op gietijzeren voet, witte terrasstoelen) met tafelspul; stoelen op exact dezelfde plek als voorheen ---
{const G=GZ,P=[];for(let i=2;i<7;i++)P.push([S(42+i*4.6),4.6+(i%2)*.8]);
 zuid.children.slice().forEach(o=>{const p=o.position;if(o===mensenBuiten||o===pont)return;
  if(o.type==='Group'&&Math.abs(p.y-.55)<1e-6&&P.some(([x,z])=>Math.abs(p.x-(x-.2))<.01&&Math.abs(Math.abs(p.z-(z+.1))-.8)<.01))zuid.remove(o);
  else if(o.isMesh&&o.geometry.type==='CylinderGeometry'){const q=o.geometry.parameters;if((q.radiusTop===.5&&q.height===.06)||(q.radiusTop===.04&&q.height===.75&&Math.abs(p.y-.93)<.01))zuid.remove(o)}});
 const stoelM=G.Mn(0xf1ede4,{roughness:.4,metalness:.4},'terrasstoel wit'),TL=P.map(([x,z])=>[x,.55,z]),SL=[];
 P.forEach(([x,z],i)=>{SL.push([x-.2,.55,z+.1-.8,0],[x-.2,.55,z+.1+.8,Math.PI]);G.tafelSpul(zuid,x-.14,.55+.765,z-.12,i);G.tafelSpul(zuid,x+.12,.55+.765,z+.14,i+1);G.tafelSpul(zuid,x+.16,.55+.765,z-.1,i+2)});
 reeks(bistroBlad,marmer,TL,zuid,'steigertafels');reeks(bistroVoet,gietijzer,TL,zuid,'steigertafelvoeten');reeks(thonetG,stoelM,SL,zuid,'steigerstoelen')}

// --- 5. PRODUCTIE warmer: hout en koper, broodwand, meelzakken, meer deeg en bakplaten ---
{const G=GZ,PR=deel('Productie','Bakkerij-aankleding'),[korst,korstD,korstL]=AD.korst,deeg=G.Mn(0xecdcb8,{roughness:.9},'deeg'),jute=G.Mn(0xc9ad7c,{roughness:1},'jute'),ovenM=G.Mn(0x9c5a3a,{roughness:.85},'ovensteen');
 tegel.color.set(0xb88c64);tegel.name='plavuizen';
 deel('Productie','Wanden').traverse(o=>{if(o.isMesh&&o.material===mat.wit&&o.geometry.parameters&&o.geometry.parameters.depth===.04)o.material=creme});
 deel('Productie','Werkbank').traverse(o=>{const p=o.isMesh&&o.geometry.parameters;if(p&&o.material===staalM&&p.height===.9)o.material=G.teak});
 deel('Productie','Ovens').traverse(o=>{const p=o.isMesh&&o.geometry.parameters;if(!p||o.material!==staalM)return;if(p.height===1.9)o.material=ovenM;else if(p.height===.45)o.material=koper});
 // broodwand tegen de wand naar het loket
 for(const z of [-2.35,0,2.45])G.m(G.B(.36,2.3,.04),G.teak,PR,-12.2,BV+1.15,z);
 for(let r=0;r<4;r++){G.m(G.B(.36,.035,4.8),G.teak,PR,-12.2,BV+.5+r*.5,.05);for(let k=0;k<13;k++){const z=-2.15+k*.365;if(Math.abs(z)<.12)continue;const b=G.m(AD.bolG,[korst,korstD,korstL][(k+r)%3],PR,-12.18,BV+.52+r*.5+(r%2?.07:.085),z,0,r%2?0:1.57,0);if(r%2)b.scale.set(.1,.07,.15);else b.scale.set(.12,.085,.12)}}
 // meelzakken
 for(const [x,z,ry,l] of [[-11.5,2.35,.2,0],[-11.05,2.7,-.3,0],[-11.3,2.5,.9,1]]){const zk=G.m(G.RB(.5,.26,.34,.11),jute,PR,x,BV+.13+l*.24,z,0,ry,0)}
 // koperen pannen aan een rail boven de deegtafel
 beam([-9.7,3.1,-1.3],[-7.5,3.1,-1.3],.012,zwartStaal,PR);for(const x of [-9.7,-7.5])beam([x,BP,-1.3],[x,3.1,-1.3],.008,zwartStaal,PR);
 for(let i=0;i<6;i++){const x=-9.5+i*.36,r=.09+(i%3)*.02;G.m(G.CY(r,.1,14),koper,PR,x,2.9-r*.3,-1.3);beam([x,3.1,-1.3],[x,2.95,-1.3],.006,koper,PR)}
 // extra deeg, deegrol en bakplaat met croissants op de deegtafel
 for(let k=0;k<5;k++){const d=G.m(AD.bolG,deeg,PR,-8.05+k*.2,2.05,-1.6+(k%2)*.22);d.scale.set(.1,.06,.1)}
 G.m(G.CY(.035,.5,10),G.teak,PR,-8.9,2.04,-1.72,0,.4,Math.PI/2);G.m(G.B(.6,.02,.4),zwartStaal,PR,-7.75,2.01,-.95);for(let k=0;k<8;k++){const b=G.m(AD.bolG,korstL,PR,-7.96+(k%4)*.14,2.045,-1.05+Math.floor(k/4)*.2,0,.6,0);b.scale.set(.055,.028,.035)}
 // broodmanden op de houten werkbank aan de kadekant (zichtbaar door de etalage aan de steiger)
 for(const x of [-10.9,-9.9,-8.9]){const mand=G.m(new THREE.CylinderGeometry(.2,.16,.16,14,1,true),G.rotan,PR,x,BV+1.02,3.72);for(let k=0;k<5;k++){const b=G.m(AD.bolG,k%2?korst:korstD,PR,x+Math.cos(k*1.26)*.09,BV+1.08+(k===4?.05:0),3.72+Math.sin(k*1.26)*.09,0,k,0);b.scale.set(.09,.06,.07)}}}

// ===== STIJLRONDE v0.35: dichter bij de Midjourney-stills (gouache-poster, gedempt aards palet, geen glans) =====
// Wat hier gebeurt: 1) materialen mat en zonder spiegeling, 2) gedempte kleuren (gras, bomen, vlaggen, mensen),
// 3) geschilderde lucht en rustig spiegelend water, 4) kleinere lampjes, 5) Het Buurtloket als Nederlands straatnaambord,
// 6) een schilder-filter (Kuwahara) met aards palet vóór de bestaande kleurcorrectie.
const STIJL=(()=>{
 const S={};
 // --- 1. materialen: mat, geen metaalglans, minder omgevingsspiegeling (behalve glas en water) ---
 const glans=/glas|raam|water|koper|lamp|bol/i;
 S.matteer=()=>{const gezien=new Set();scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
  if(!m||gezien.has(m)||!m.isMeshStandardMaterial)return;gezien.add(m);if(glans.test(m.name||''))return;if(m===mat.glas||m===mat.raam)return;
  m.roughness=Math.max(m.roughness,.82);m.metalness=Math.min(m.metalness,.08);m.envMapIntensity=Math.min(m.envMapIntensity,.35)})})};
 // --- 2. gedempte kleuren ---
 const demp=(m,f,warm)=>{if(!m||!m.color)return;const h={};m.color.getHSL(h);m.color.setHSL(h.h+(warm||0),h.s*f,h.l)};
 mat.gras.color.set(0x9b9a63);mat.gras.bumpScale=.5;                                    // olijf-oker gras zoals de kade in het hoofdbeeld
 S.dempNatuur=()=>{const gezien=new Set();scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m||Array.isArray(m)||gezien.has(m))return;gezien.add(m);const n=m.name||'';
  if(/blad|haag|riet|struik|plant|lavendel|siergras|geranium|bloem/i.test(n)){demp(m,.55,-.015)}
  else if(/vlag/i.test(n)||(o.name||'').indexOf('vlaggetjes')===0){m.color&&m.color.set(0xcfc3a8)}}) };
 // mensen: Rocketbox-texturen minder fel en iets warmer, platter licht (als geschilderde figuurtjes)
 S.mensen=()=>{const gezien=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material||!o.material.map)return;const m=o.material;if(gezien.has(m)||!/(body|head|opacity)$/.test(m.name||''))return;gezien.add(m);
  m.roughness=1;m.envMapIntensity=.2;m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',
   '#include <map_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=mix(vec3(l),diffuseColor.rgb,.55)*vec3(1.06,1.,.88);diffuseColor.rgb=floor(diffuseColor.rgb*7.+.5)/7.;}')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n reflectedLight.indirectDiffuse*=1.35;')};m.needsUpdate=true})};
 // --- 3. lucht: stapelwolken groter en meer, turquoise-grijze hemel; water: groot rustig patroon, groen-grijs, zachte zon ---
 if(lucht.material.fragmentShader.indexOf('vec2(1.3,2.3)')<0)console.warn('STIJL: luchtschaal niet gevonden');lucht.material.fragmentShader=lucht.material.fragmentShader.replace('vec2(1.3,2.3)','vec2(.62,1.15)');lucht.material.needsUpdate=true;
 // --- 4. lampjes: kleiner (lichtsnoeren, slingers, kraan) ---
 S.lampjes=()=>{scene.traverse(o=>{if(o.isMesh&&o.material===mat.lamp&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius<.2)o.scale.multiplyScalar(.55)})};
 // --- 5. HET BUURTLOKET als straatnaambord: blauw, afgeronde hoeken, witte binnenrand, naam in gewone schrijfwijze, ondertekst eronder ---
 const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
 S.straatbord=(w,h)=>{const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d'),W=c.width,H=c.height,t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
  const teken=()=>{g.clearRect(0,0,W,H);g.fillStyle='#1d3f87';rr(g,0,0,W,H,H*.16);g.fill();
   g.strokeStyle='#f7f8f6';g.lineWidth=H*.045;rr(g,H*.09,H*.09,W-H*.18,H*.62,H*.1);g.stroke();
   g.fillStyle='#f7f8f6';g.textAlign='center';g.textBaseline='middle';let fs=H*.44;g.font='600 '+fs+'px "Barlow Condensed","Arial Narrow",Arial,sans-serif';
   while(g.measureText('Het Buurtloket').width>W-H*.6&&fs>10){fs-=2;g.font='600 '+fs+'px "Barlow Condensed","Arial Narrow",Arial,sans-serif'}
   g.fillText('Het Buurtloket',W/2,H*.41);g.font='500 '+(H*.15)+'px "Barlow Condensed","Arial Narrow",Arial,sans-serif';g.fillText('Halen · Eten · Blijven',W/2,H*.86);t.needsUpdate=true};
  teken();if(document.fonts&&document.fonts.load)document.fonts.load('600 40px "Barlow Condensed"').then(teken).catch(()=>{});
  return new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,fog:true})};
 {const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&display=swap';document.head.appendChild(l)}
 S.borden=()=>{const W2=[];scene.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.material&&o.material.map&&o.material.map.image&&o.material.map.image.tagName==='CANVAS'){
   const p=o.geometry.parameters,ok=(Math.abs(p.width-2.8)<.01&&Math.abs(p.height-.5)<.01)||(Math.abs(p.width-3.6)<.01&&Math.abs(p.height-.65)<.01);if(ok)W2.push(o)}});
  W2.forEach(o=>{const p=o.geometry.parameters,h=p.width*.3;o.geometry=new THREE.PlaneGeometry(p.width,h);o.position.y+=(h-p.height)/2-.05;o.material=S.straatbord(p.width,h)});return W2.length};
 // --- 6. schilderfilter: Kuwahara (vlakken met behouden randen, als gouache) + aards palet ---
 const R=(typeof TELEFOON!=='undefined'&&TELEFOON)?2:3;
 S.pass=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},res:{value:new THREE.Vector2(1,1)},stap:{value:1},sat:{value:.8},aard:{value:1},nacht:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'#define R '+R+'\nvarying vec2 vUv;uniform sampler2D tDiffuse;uniform vec2 res;uniform float stap,sat,aard,nacht;'+
  'void main(){vec2 px=stap/res;vec3 m0=vec3(0.),m1=m0,m2=m0,m3=m0,s0=m0,s1=m0,s2=m0,s3=m0;'+
  'for(int j=-R;j<=R;j++)for(int i=-R;i<=R;i++){vec3 c=texture2D(tDiffuse,vUv+vec2(float(i),float(j))*px).rgb,c2=c*c;'+
  'if(i<=0&&j<=0){m0+=c;s0+=c2;}if(i>=0&&j<=0){m1+=c;s1+=c2;}if(i<=0&&j>=0){m2+=c;s2+=c2;}if(i>=0&&j>=0){m3+=c;s3+=c2;}}'+
  'float n=float((R+1)*(R+1));m0/=n;m1/=n;m2/=n;m3/=n;'+
  'vec3 v0=s0/n-m0*m0,v1=s1/n-m1*m1,v2=s2/n-m2*m2,v3=s3/n-m3*m3;'+
  'float w0=1./(1e-5+pow(v0.r+v0.g+v0.b,1.6)),w1=1./(1e-5+pow(v1.r+v1.g+v1.b,1.6)),w2=1./(1e-5+pow(v2.r+v2.g+v2.b,1.6)),w3=1./(1e-5+pow(v3.r+v3.g+v3.b,1.6));'+
  'vec3 c=(m0*w0+m1*w1+m2*w2+m3*w3)/(w0+w1+w2+w3);'+
  // aards palet: gedempt, blauw blijft herkenbaar (pont), warme schaduw (olijf-bruin) en crème licht, matte zwarten
  'float l=dot(c,vec3(.299,.587,.114));float blauw=smoothstep(.04,.18,c.b-max(c.r,c.g));c=mix(vec3(l),c,mix(sat,.94,blauw));'+
  'vec3 sch=mix(vec3(.30,.27,.21),vec3(.2,.28,.28),nacht),lic=mix(vec3(1.05,.98,.84),vec3(1.,.9,.78),nacht);'+
  'c=mix(c,c*mix(sch/.26,lic,smoothstep(.15,.85,l)),.32*aard);'+
  'c=(c-.42)*1.12+.42;c=c*.95+mix(vec3(.03,.026,.016),vec3(.035,.05,.05),nacht);'+
  'gl_FragColor=vec4(c,1.);}'});
 S.pass.material.name='stijl schilderfilter';
 S.plaats=()=>{if(!composer||!grade)return false;const i=composer.passes.indexOf(grade);if(i<0)return false;composer.passes.splice(i,0,S.pass);S.maat();return true};
 S.maat=()=>{const p=renderer.getPixelRatio();S.pass.uniforms.res.value=grade.uniforms.res.value;S.pass.uniforms.stap.value=Math.max(1,p*.75)};
 addEventListener('resize',()=>setTimeout(S.maat,0));
 // --- per stand (dag/avond) ---
 S.stand=n=>{const LU=lucht.material.uniforms;
  LU.top.value.set(n?0x4f8890:0x5f9fb4);LU.hor.value.set(n?0xf4bc7c:0xf2dfb6);LU.wolkL.value.set(n?0xffa860:0xfffaee);LU.wolkS.value.set(n?0x56707a:0xb8c4c2);LU.glow.value.set(n?0xff8444:0xffe2b8);LU.dek.value=n?.5:.43;
  const WU=water.material.uniforms;WU.waterColor.value.set(n?0x1f5a58:0x3f8a72);WU.sunColor.value.set(n?0xff8a50:0xc8b894);WU.distortionScale.value=n?.1:.13;WU.size.value=n?4:3.5;
  if(!n){hemi.intensity=.5;sun.intensity=1.2;sun.color.set(0xffd49a)}
  mat.lamp.emissiveIntensity=n?2.0:.12;
  if(grade){grade.uniforms.sat.value=1.0;grade.uniforms.poster.value=n?.3:.45}
  S.pass.uniforms.nacht.value=n?1:0;S.pass.uniforms.sat.value=n?.88:.9};
 S.matteer();S.dempNatuur();S.mensen();S.lampjes();S.aantalBorden=S.borden();S.geplaatst=S.plaats();
 setTimeout(()=>{const s=setNight;setNight=function(n){s(n);S.stand(n)};S.stand(false)},0);
 return S})();

// ===== OPBOUW: namen voor materialen en vormen, paneel "Opbouw" en klikken op de boot =====
{const MN={rood:'pontblauw'};for(const k in mat)if(mat[k]&&mat[k].isMaterial&&!mat[k].name)mat[k].name=MN[k]||k;
 Object.entries({glasH,staalM,tegel,koper,blauwD,witD,klepM,dakM}).forEach(([k,m])=>{if(!m.name)m.name=k});
 const GN={BoxGeometry:'blok',CylinderGeometry:'cilinder',SphereGeometry:'bol',TorusGeometry:'ring',PlaneGeometry:'vlak',ExtrudeGeometry:'profiel',BufferGeometry:'wandvlak',ConeGeometry:'kegel',IcosahedronGeometry:'bolvorm'};
 pont.traverse(o=>{if(!o.isMesh||o.name)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m.name)m.name='kleur #'+m.color.getHexString();o.name=(GN[o.geometry.type]||o.geometry.type)+' · '+m.name})}
const opbouw=(()=>{
 const st=document.createElement('style');st.textContent=
 '#opb{position:absolute;top:8px;right:8px;bottom:8px;width:min(270px,62%);overflow:auto;background:rgba(255,255,255,.93);color:#1c1b1b;border:1px solid #e3dddb;font:13px Inter,system-ui,sans-serif;padding:8px 0;display:none}'+
 '#opb.open{display:block}#opb h3{font:700 13px "Space Grotesk",system-ui,sans-serif;margin:2px 12px 6px}#opb p{font-size:11.5px;margin:0 12px 8px;color:#6d6663;line-height:1.4}'+
 '#opb button{display:flex;width:100%;justify-content:space-between;gap:8px;border:0;border-top:1px solid #eee;padding:6px 12px;background:none;color:inherit;font:600 12.5px Inter,system-ui,sans-serif;text-align:left}'+
 '#opb button[hidden]{display:none}#opb button.sub{font-weight:400;padding-left:26px;background:#faf8f7}#opb button small{color:#8a817d;font-weight:400}#opb button.on{color:#1d3f87;background:#e9eef8}'+
 '#opbLabel{position:absolute;left:10px;top:8px;background:rgba(29,63,135,.92);color:#fff;font:600 12.5px Inter,system-ui,sans-serif;padding:5px 9px;display:none;pointer-events:none}';
 document.head.appendChild(st);
 const pan=document.createElement('div');pan.id='opb';wrap.appendChild(pan);const lab=document.createElement('div');lab.id='opbLabel';wrap.appendChild(lab);
 const kader=new THREE.Box3Helper(new THREE.Box3(),0xffc533);kader.visible=false;kader.material.depthTest=false;kader.renderOrder=9;scene.add(kader);
 const tel=o=>{let n=0;o.traverse(c=>{if(c.isMesh)n++});return n};
 const knoppen=new Map();let gekozen=null;
 function kies(o,zoom){gekozen=o;knoppen.forEach((b,k)=>b.classList.toggle('on',k===o));
  if(!o){kader.visible=false;lab.style.display='none';return}
  scene.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(o);kader.box.copy(bx);kader.visible=true;
  const pad=[];for(let p=o;p&&p!==pont;p=p.parent)pad.unshift(p.name);lab.textContent=pad.join(' › ')+' · '+tel(o)+' vormen';lab.style.display='block';
  if(zoom){const c=bx.getCenter(new THREE.Vector3()),s=bx.getSize(new THREE.Vector3()).length();goal.t.copy(c);goal.r=Math.max(7,s*1.25+3);document.querySelectorAll('#views button').forEach(b=>{if(VIEWS[b.textContent])b.classList.remove('on')})}}
 pan.innerHTML='<h3>Opbouw van De Koffieboot</h3><p>9 hoofdgroepen. Klik een groep of onderdeel om erop in te zoomen, of klik op de boot zelf.</p>';
 for(const n of GROEPEN){const g=BOOT[n].g;const b=document.createElement('button');b.type='button';b.innerHTML=n+' <small>'+g.children.length+' onderdelen</small>';pan.appendChild(b);knoppen.set(g,b);
  const subs=[];b.onclick=()=>{const open=!subs[0]||subs[0].hidden;subs.forEach(s=>s.hidden=!open);kies(g,true)};
  for(const o of g.children){const s=document.createElement('button');s.type='button';s.className='sub';s.hidden=true;s.innerHTML=o.name+' <small>'+tel(o)+'</small>';s.onclick=()=>kies(o,true);pan.appendChild(s);subs.push(s);knoppen.set(o,s)}}
 const tb=document.createElement('button');tb.type='button';tb.textContent='Opbouw';tb.title='Toont de hiërarchie van de boot: groepen en onderdelen';
 tb.onclick=()=>{const o=pan.classList.toggle('open');tb.classList.toggle('on',o);if(!o)kies(null)};document.getElementById('views').appendChild(tb);
 // klikken (niet slepen) op de boot: kies het onderdeel; tweede klik op hetzelfde onderdeel kiest de hele groep
 const ray=new THREE.Raycaster(),ms=new THREE.Vector2();let dn=null;
 canvas.addEventListener('pointerdown',e=>{dn=[e.clientX,e.clientY]});
 canvas.addEventListener('pointerup',e=>{if(!dn||Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>5)return;const r=canvas.getBoundingClientRect();ms.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ms,camera);
  const hit=ray.intersectObject(pont,true).find(h=>h.object.visible);if(!hit){kies(null);return}
  let ond=null,grp=null;for(let p=hit.object;p;p=p.parent){if(p.userData.niveau==='onderdeel'&&!ond)ond=p;if(p.userData.niveau==='groep'){grp=p;break}}
  if(!grp){kies(null);return}kies(gekozen===ond?grp:(ond||grp),false)});
 return {BOOT,kies};
})();
{const sn=setNight;setNight=function(n){sn(n);binnen.forEach(l=>l.intensity=n?1.5:.55);opaal.emissiveIntensity=n?1.8:.25}}
window.koffieboot={pont,BOOT,kies:opbouw.kies,goal};
function place(){const s=Math.sin(view.ph),x=view.r*s*Math.sin(view.th),y=view.r*Math.cos(view.ph),z=-view.r*s*Math.cos(view.th);camera.position.set(view.t.x+x,view.t.y+y,view.t.z+z);camera.lookAt(view.t)}
function go(n){const v=VIEWS[n];goal.t.set(...v.t);goal.r=v.r;goal.th=v.th;goal.ph=v.ph;document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.textContent===n))}
const vb=document.getElementById('views');Object.keys(VIEWS).forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>go(n);vb.appendChild(b)});
go('Gouden uur');view.t.copy(goal.t);view.r=goal.r;view.th=goal.th;view.ph=goal.ph;
let drag=null,pts2=new Map(),pinch=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pts2.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,pan:e.shiftKey||e.button===2}});
canvas.addEventListener('pointerup',e=>{pts2.delete(e.pointerId);drag=null;pinch=0});
canvas.addEventListener('pointercancel',e=>{pts2.delete(e.pointerId);drag=null;pinch=0});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function panBy(dx,dy){const k=goal.r*.0018,right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1);goal.t.addScaledVector(right,-dx*k).addScaledVector(up,dy*k)}
canvas.addEventListener('pointermove',e=>{
 if(pts2.has(e.pointerId))pts2.set(e.pointerId,[e.clientX,e.clientY]);
 if(pts2.size===2){const [a,b]=[...pts2.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)goal.r=Math.min(160,Math.max(6,goal.r*pinch/d));pinch=d;
  return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.pan)panBy(dx,dy);else{goal.th-=dx*.006;goal.ph=Math.min(1.5,Math.max(.12,goal.ph-dy*.005))}});
canvas.addEventListener('wheel',e=>{e.preventDefault();goal.r=Math.min(160,Math.max(6,goal.r*(1+e.deltaY*.001)))},{passive:false});
function size(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(composer){composer.setSize(w,h);const p=renderer.getPixelRatio();grade.uniforms.res.value.set(w*p,h*p)}}
new ResizeObserver(size).observe(wrap);size();
// ===== SNELHEID: vaste onderdelen per materiaal samenvoegen (per onderdeel van de boot, omgeving per materiaal) =====
// Klikken blijft werken: elk samengevoegd stuk hangt nog onder zijn eigen onderdeel. Bewegende fietsers, mensen (los aanklikbaar), water en lucht blijven los.
(function samenvoegen(){
 scene.updateMatrixWorld(true);
 const uit=new Set();const sluitUit=o=>o&&o.traverse(c=>uit.add(c));
 fiets.forEach(f=>sluitUit(f.g));sluitUit(mensenBuiten);sluitUit(BOOT.Mensen.g);uit.add(water);
 const bak=new Map();const inv=new THREE.Matrix4();
 const houder=o=>{let a=o.parent;while(a){if(a.userData&&a.userData.niveau==='onderdeel')return a;if(a.userData&&a.userData.niveau==='groep')return a;if(a===pont)return pont;a=a.parent}return scene};
 scene.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||uit.has(o)||!o.visible||Array.isArray(o.material))return;
  const m=o.material;if(m.isShaderMaterial||m.isRawShaderMaterial||o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return;
  const g=o.geometry;if(!g||!g.attributes.position||g.morphAttributes&&Object.keys(g.morphAttributes).length)return;
  const at=Object.keys(g.attributes).filter(k=>['position','normal','uv','color'].includes(k)).sort().join(',');if(!at.includes('normal'))return;
  const h=houder(o),key=h.uuid+'|'+m.uuid+'|'+at+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+o.renderOrder;
  if(!bak.has(key))bak.set(key,{h,m,at:at.split(','),lijst:[],cs:o.castShadow,rs:o.receiveShadow,ro:o.renderOrder});bak.get(key).lijst.push(o)});
 let voor=0,na=0;
 for(const b of bak.values()){if(b.lijst.length<2)continue;voor+=b.lijst.length;na++;
  inv.copy(b.h.matrixWorld).invert();const delen=[];let nV=0,nI=0;
  for(const o of b.lijst){const g=o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));delen.push(g);nV+=g.attributes.position.count;nI+=g.index?g.index.count:g.attributes.position.count}
  const G=new THREE.BufferGeometry(),A={};for(const k of b.at){const s=delen[0].attributes[k].itemSize;A[k]=new Float32Array(nV*s)}
  const I=nV>65535?new Uint32Array(nI):new Uint16Array(nI);let vo=0,io=0;
  for(const g of delen){const n=g.attributes.position.count;for(const k of b.at){const a=g.attributes[k],s=a.itemSize;for(let i=0;i<n;i++)for(let j=0;j<s;j++)A[k][(vo+i)*s+j]=a.array[a.normalized?0:0]===undefined?0:(j===0?a.getX(i):j===1?a.getY(i):j===2?a.getZ(i):a.getW(i))}
   if(g.index){for(let i=0;i<g.index.count;i++)I[io++]=g.index.getX(i)+vo}else{for(let i=0;i<n;i++)I[io++]=i+vo}vo+=n;g.dispose()}
  for(const k of b.at)G.setAttribute(k,new THREE.BufferAttribute(A[k],delen[0].attributes[k].itemSize));G.setIndex(new THREE.BufferAttribute(I,1));G.computeBoundingSphere();G.computeBoundingBox();
  const M2=new THREE.Mesh(G,b.m);M2.name='samengevoegd · '+(b.m.name||'materiaal');M2.castShadow=b.cs;M2.receiveShadow=b.rs;M2.renderOrder=b.ro;M2.userData.samengevoegd=b.lijst.length;
  for(const o of b.lijst){o.parent.remove(o)}b.h.add(M2)}
 // lege groepjes zonder inhoud opruimen (maar nooit de benoemde groepen en onderdelen)
 const leeg=[];scene.traverse(o=>{if(o.type==='Group'&&!o.children.length&&!o.userData.niveau&&o!==pont&&!uit.has(o))leeg.push(o)});leeg.forEach(o=>o.parent&&o.parent.remove(o));
 scene.updateMatrixWorld(true);window.koffieboot&&(window.koffieboot.samengevoegd={voor,na})})();
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function tick(){const k=calm?1:.09;view.t.lerp(goal.t,k);view.r+=(goal.r-view.r)*k;view.th+=(goal.th-view.th)*k;view.ph+=(goal.ph-view.ph)*k;place();
 const nu=performance.now();const dt=Math.min(.1,(nu-(tick.t||nu))/1000);tick.t=nu;
 if(!calm)fiets.forEach(f=>{f.g.position.x+=f.dir*f.sp*dt;if(f.g.position.x>f.lim[1]||f.g.position.x<f.lim[0])f.g.position.x=f.dir>0?f.lim[0]:f.lim[1]});
 if(!calm)water.material.uniforms.time.value+=dt*.55;if(composer){grade.uniforms.time.value=(nu%1000)/1000;composer.render()}else renderer.render(scene,camera);requestAnimationFrame(tick)}
place();tick();
})();
