const $=i=>document.getElementById(i),V=THREE.Vector3,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const cv=$('cv'),renderer=new THREE.WebGLRenderer({canvas:cv,powerPreference:'high-performance',antialias:(()=>{try{const x=JSON.parse(localStorage.getItem('dd')||'{}');if(x.aa!==undefined)return x.aa;return !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)}catch(e){return true}})()});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(70,1,.1,700);
const SKYC=new THREE.Color(0x8fd3f4),C1=new THREE.Color(0x1d8bb5),C2=new THREE.Color(0x020b16),TMP=new THREE.Color();
scene.background=SKYC.clone();scene.fog=new THREE.Fog(0x8fd3f4,80,380);
scene.add(new THREE.HemisphereLight(0xffffff,0x2a6f8a,1));
const sun=new THREE.DirectionalLight(0xfff2cc,.8);sun.position.set(50,100,30);scene.add(sun);
const lamp=new THREE.PointLight(0xbfefff,0,50);scene.add(lamp);
function resize(){renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

const ZONES=[[-110,60],[90,-100],[120,110],[-60,-120],[230,-20],[-230,-20],[20,230],[-40,-240],[-190,-170]];
const TINTS=[[.18,.08,.3],[.12,.16,.35],[.1,.09,.09],[.08,.25,.12],[.35,.38,.4],[.04,.08,.14],[.45,.25,.35],[.5,.4,.2],[.12,.2,.2]];

function depthAt(x,z){let d=-6;for(const[a,b]of ZONES){const k=clamp(1-(Math.hypot(x-a,z-b)-26)/22,0,1);d=Math.min(d,-6-39*k*k*(3-2*k))}return d}


// Drop sequence and parachute runtime, retained verbatim from the original runtime order.
// ===== airdrop: plane, skydive, parachute, cinematic splashdown =====
const PL={m:null,pos:new V(),d:new V(1,0,0),s:new V(),e:new V(),t:0,spd:26,alt:115,len:640,on:false},FCH=[],COLS=[],_v1=new V(),_v2=new V();let TS=1,cinSlow=0,cinShake=0;
function mkPlane(){const g=new THREE.Group(),M=c=>new THREE.MeshStandardMaterial({color:c,metalness:.3,roughness:.55}),W=M(0xf4f7f6),O=M(0xff7a3d),Dk=M(0x2a3037),
 add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o},pr=[];
 add(new THREE.CylinderGeometry(1,.8,9,14).rotateX(Math.PI/2),W,0,0,0);add(new THREE.ConeGeometry(1,2,14).rotateX(-Math.PI/2),O,0,0,-5.5);add(new THREE.ConeGeometry(.8,3,12).rotateX(Math.PI/2),W,0,0,6);
 add(new THREE.BoxGeometry(15,.25,2.6),W,0,.7,-.5);for(const s of[1,-1]){add(new THREE.BoxGeometry(1.4,.26,2.62),O,s*7.3,.7,-.5);
  add(new THREE.CylinderGeometry(.4,.4,1.6,10).rotateX(Math.PI/2),Dk,s*3.5,.55,-1.8);const p=new THREE.Group();p.position.set(s*3.5,.55,-2.7);p.add(new THREE.Mesh(new THREE.BoxGeometry(2.6,.18,.05),Dk),new THREE.Mesh(new THREE.BoxGeometry(.18,2.6,.05),Dk));g.add(p);pr.push(p);
  add(new THREE.CylinderGeometry(.4,.4,7,10).rotateX(Math.PI/2),W,s*2.6,-1.7,0);add(new THREE.BoxGeometry(.15,1.4,.15),Dk,s*2.6,-.9,-1.5);add(new THREE.BoxGeometry(.15,1.4,.15),Dk,s*2.6,-.9,1.5);add(new THREE.BoxGeometry(.9,.12,.12),Dk,s*1.3,-.35,-1.5)}
 const np=new THREE.Group();np.position.set(0,0,-6.6);np.add(new THREE.Mesh(new THREE.BoxGeometry(2.6,.18,.05),Dk),new THREE.Mesh(new THREE.BoxGeometry(.18,2.6,.05),Dk));g.add(np);pr.push(np);
 add(new THREE.BoxGeometry(.18,2.4,1.8),O,0,1.9,5.2);add(new THREE.BoxGeometry(5,.18,1.2),W,0,.6,5.3);
 add(new THREE.BoxGeometry(1.5,.6,.1),new THREE.MeshStandardMaterial({color:0x66c8e8,emissive:0x2a8fb8,emissiveIntensity:.4,roughness:.1}),0,.65,-3.7);
 g.userData.pr=pr;g.scale.setScalar(1.4);return g}
function mkChute(c){const g=new THREE.Group(),can=new THREE.SphereGeometry(2.8,18,8,0,Math.PI*2,0,Math.PI*.52),pa=can.attributes.position,col=[],c1=new THREE.Color(c),c2=new THREE.Color(0xf4f7f6);
 for(let i=0;i<pa.count;i++){const a=Math.atan2(pa.getZ(i),pa.getX(i)),s=Math.floor((a+Math.PI)/(Math.PI*2)*10)%2?c1:c2;col.push(s.r,s.g,s.b)}
 can.setAttribute('color',new THREE.Float32BufferAttribute(col,3));can.scale(1,.75,1);can.translate(0,3.8,0);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true});g.add(new THREE.Mesh(can,mat));
 const pts=[];for(let k=0;k<12;k++){const a=k/12*6.283;pts.push(Math.cos(a)*2.78,3.65,Math.sin(a)*2.78,k%2?.25:-.25,.7,0)}
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const lm=new THREE.LineBasicMaterial({color:0xdddddd,transparent:true});g.add(new THREE.LineSegments(lg,lm));
 g.scale.setScalar(.15);return{g,mats:[mat,lm],age:0}}
function detach(ch,pos){if(!ch)return;ch.g.position.copy(pos);FCH.push({g:ch.g,mats:ch.mats,v:new V(rnd(-2,2),2.5,rnd(-2,2)),t:0})}
function trailB(p){if(PRT.length>=(PMAX*1.6|0))return;const m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}));m.position.set(p.x+rnd(-.5,.5),p.y+rnd(-.8,.5),p.z+rnd(-.5,.5));m.scale.setScalar(rnd(.4,.9));scene.add(m);PRT.push({m,v:new V(rnd(-.3,.3),rnd(.5,2),rnd(-.3,.3)),l:rnd(.8,1.4),t:0})}
function splashFx(p,big){const n=big?80:36;
 for(let i=0;i<n&&PRT.length<(PMAX*1.6|0);i++){const a=rnd(0,6.283),r=rnd(0,big?4:2),m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:i%3?0xdff6ff:0x7fd8ff,transparent:true,opacity:.9}));
  m.position.set(p.x+Math.cos(a)*.4,.1,p.z+Math.sin(a)*.4);m.scale.setScalar(rnd(.6,1.5)*(big?1.2:.8));scene.add(m);PRT.push({m,v:new V(Math.cos(a)*r,rnd(5,big?15:9),Math.sin(a)*r),l:rnd(1,1.8),t:0,g:-16})}
 const c=new THREE.Mesh(new THREE.CylinderGeometry(.5,1.4,1,20,1,true),new THREE.MeshBasicMaterial({color:0xeafcff,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}));c.position.set(p.x,0,p.z);scene.add(c);COLS.push({m:c,t:0,h:big?8:4,w:big?1:.6});
 for(let i=0;i<3;i++)setTimeout(()=>ripple(p.x,p.z),i*140);for(let i=0;i<(big?36:12);i++)trailB(new V(p.x,-rnd(.5,4),p.z))}
function startDrop(){const th=rnd(0,6.283),d=new V(Math.cos(th),0,Math.sin(th)),pr=new V(-d.z,0,d.x),off=rnd(-90,90),h=400;
 PL.d=d;PL.s=d.clone().multiplyScalar(-h).addScaledVector(pr,off);PL.e=d.clone().multiplyScalar(h).addScaledVector(pr,off);PL.len=2*h;PL.t=0;PL.on=true;PL.pos.copy(PL.s).setY(PL.alt);planeLookActive=false;P.yaw=Math.atan2(-PL.d.x,-PL.d.z);P.pitch=-.1;
 if(!PL.m){PL.m=mkPlane();scene.add(PL.m)}PL.m.visible=true;P.ph='plane';P.vy=0;P.m.visible=false;P.pos.copy(PL.pos);T=-30;
 for(const b of bots){if(!b.alive)continue;b.ph='plane';b.vy=0;b.m.visible=false;const z=Math.random()<.6?ZONES[(Math.random()*ZONES.length)|0]:null,tx=z?z[0]+rnd(-25,25):rnd(-220,220),tz=z?z[1]+rnd(-25,25):rnd(-220,220);
  b.tgt=new V(tx,0,tz);const tc=clamp(((tx-PL.s.x)*d.x+(tz-PL.s.z)*d.z)/PL.spd,0,PL.len/PL.spd);b.jt=Math.max(1.5,tc-rnd(.5,2.5))}}
function planeUpdate(dt,t){if(!PL.on)return;PL.t+=dt;PL.pos.copy(PL.s).addScaledVector(PL.d,PL.spd*PL.t).setY(PL.alt+Math.sin(t*.8)*.6);PL.m.position.copy(PL.pos);
 PL.m.rotation.y=Math.atan2(-PL.d.x,-PL.d.z);PL.m.rotation.z=Math.sin(t*.7)*.04;PL.m.userData.pr.forEach(p=>p.rotation.z+=dt*40);
 if(PL.t>PL.len/PL.spd+6){PL.on=false;PL.m.visible=false}}
function camPlane(){const t=performance.now()/1000,a=t*.25+1.2;if(!planeLookActive){cam.position.set(PL.pos.x+Math.cos(a)*26,PL.pos.y+8+Math.sin(t*.4)*3,PL.pos.z+Math.sin(a)*26);cam.lookAt(PL.pos.x,PL.pos.y,PL.pos.z);return}const cp=Math.cos(P.pitch),dir=_cd.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp),pos=_ct.copy(PL.pos);pos.x-=dir.x*26;pos.y+=8;pos.z-=dir.z*26;cam.position.lerp(pos,.14);cam.lookAt(PL.pos.x+dir.x*30,PL.pos.y+dir.y*30,PL.pos.z+dir.z*30)}
function jumpPlayer(){P.ph='fall';P.vy=0;P.hx=PL.d.x*PL.spd;P.hz=PL.d.z*PL.spd;P.pos.copy(PL.pos);P.pos.y-=2.5;P.m.visible=true;P.pitch=-.45;P.yaw=Math.atan2(-PL.d.x,-PL.d.z);P.hint=6;P.cr=0;auJump()}
function impact(){const p=P.pos.clone();p.y=0;splashFx(p,true);P.ph='play';P.vy=0;P.pos.y=-.2;cinSlow=.9;cinShake=1.3;auImpact(true);
 const f=$('flash');f.style.transition='none';f.style.opacity=.8;setTimeout(()=>{f.style.transition='opacity .9s';f.style.opacity=0},40);msg('Splashdown!')}
function phaseUpdate(dt,t){
 if(P.ph==='plane'){P.pos.copy(PL.pos);P.m.visible=false;msg('Press SPACE to jump over your drop spot');if(keys.Space||TUP||PL.t>=PL.len/PL.spd)jumpPlayer();return}
 const k=keys,fall=P.ph==='fall',sx=clamp((k.KeyD?1:0)-(k.KeyA?1:0)+JOY.x,-1,1),sz=clamp((k.KeyW?1:0)-(k.KeyS?1:0)+JOY.y,-1,1),shift=k.ShiftLeft||k.ShiftRight||TDN;
 const sp=fall?(shift?9:20):P.ph==='chute'?16:3,vyT=fall?(shift?-48:-30):P.ph==='chute'?-6.5:-17,rate=fall?2.5:3.5;
 P.vy+=(vyT-P.vy)*Math.min(1,dt*rate);const fw=_v1.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),rt=_v2.set(Math.cos(P.yaw),0,-Math.sin(P.yaw));
 const tx=(fw.x*sz+rt.x*sx)*sp,tz=(fw.z*sz+rt.z*sx)*sp,hr=Math.min(1,dt*(fall?1.3:2.2));P.hx+=(tx-P.hx)*hr;P.hz+=(tz-P.hz)*hr;
 P.pos.x+=P.hx*dt;P.pos.z+=P.hz*dt;P.pos.y+=P.vy*dt;const r=Math.hypot(P.pos.x,P.pos.z);if(r>370){P.pos.x*=370/r;P.pos.z*=370/r}
 if(fall&&(P.cr||P.pos.y<55)){P.cr=0;P.ph='chute';P.ch=mkChute(SUITS[cfg.suit]);scene.add(P.ch.g);auChute();msg('Parachute open: steer to your landing spot')}
 if(P.ph==='chute'&&P.pos.y<16){P.ph='dive';detach(P.ch,P.pos);P.ch=null;msg('Dive!')}
 if(P.ph==='dive'&&P.pos.y<10)cinSlow=.15;
 if(P.ph==='chute'&&P.ch){P.ch.age+=dt;P.ch.g.position.copy(P.pos);P.ch.g.scale.setScalar(Math.min(1,.15+.85*P.ch.age/.6));P.ch.g.rotation.set(0,P.yaw,Math.sin(t*1.3)*.07)}
 if(fall&&P.hint>0){P.hint-=dt;msg('WASD steer, Shift dive faster, Space parachute')}
 P.m.position.copy(P.pos);P.m.rotation.y=P.yaw;pose(P.m,fall?4:P.ph==='chute'?5:6,false,0,1,t,dt);P.m.rotation.z=fall?-sx*.35:0;
 if(P.pos.y<=.3&&P.ph!=='fall')impact()}
function botDrop(b,dt){const t=performance.now()/1000;
 if(b.ph==='plane'){b.m.visible=false;b.pos.copy(PL.pos);if(PL.t>=b.jt||PL.t>=PL.len/PL.spd){b.ph='fall';b.pos.y-=2.5;b.hx=PL.d.x*PL.spd;b.hz=PL.d.z*PL.spd;b.vy=0;b.m.visible=true}return}
 const dx=b.tgt.x-b.pos.x,dz=b.tgt.z-b.pos.z,dh=Math.hypot(dx,dz)||1,fall=b.ph==='fall',sp=fall?20:b.ph==='chute'?16:3,vyT=fall?-32:b.ph==='chute'?-6.5:-17,k=Math.min(1,dh/(sp*.6));
 b.vy+=(vyT-b.vy)*Math.min(1,dt*(fall?2.5:3.5));b.hx*=Math.max(0,1-1.2*dt);b.hz*=Math.max(0,1-1.2*dt);
 b.pos.x+=(dx/dh*sp*k+b.hx)*dt;b.pos.z+=(dz/dh*sp*k+b.hz)*dt;b.pos.y+=b.vy*dt;
 if(fall&&b.pos.y<55){b.ph='chute';b.ch=mkChute(b.col);scene.add(b.ch.g);auChute(b.pos)}
 if(b.ph==='chute'&&b.pos.y<16){b.ph='dive';detach(b.ch,b.pos);b.ch=null}
 if(b.ph==='chute'&&b.ch){b.ch.age+=dt;b.ch.g.position.copy(b.pos);b.ch.g.scale.setScalar(Math.min(1,.15+.85*b.ch.age/.6));b.ch.g.rotation.set(0,0,Math.sin(t*1.3+b.pos.x)*.07)}
 b.m.position.copy(b.pos);b.m.rotation.y=Math.atan2(-dx,-dz);pose(b.m,fall?4:b.ph==='chute'?5:6,false,0,1,t,dt);
 if(b.pos.y<=.3){splashFx(new V(b.pos.x,0,b.pos.z),false);auImpact(false,b.pos);b.ph='play';b.pos.y=-2}}
function cineUpdate(dt,t){
 for(let i=COLS.length-1;i>=0;i--){const c=COLS[i];c.t+=dt;const k=c.t/.8;c.m.scale.set((1+k*1.5)*c.w,c.h*Math.sin(Math.min(1,k)*Math.PI)+.01,(1+k*1.5)*c.w);c.m.position.y=c.m.scale.y/2;c.m.material.opacity=.55*(1-Math.min(1,k));
  if(k>=1){scene.remove(c.m);c.m.material.dispose();c.m.geometry.dispose();COLS.splice(i,1)}}
 for(let i=FCH.length-1;i>=0;i--){const c=FCH[i];c.t+=dt;c.g.position.addScaledVector(c.v,dt);c.v.y-=4*dt;c.g.rotation.z+=dt*.6;for(const m of c.mats)m.opacity=Math.max(0,1-c.t/2.5);
  if(c.t>2.5||c.g.position.y<.3){scene.remove(c.g);FCH.splice(i,1)}}
 if(P.ph==='play'&&P.vy<-1.2&&P.pos.y<-.3)for(let i=0;i<3;i++)trailB(P.pos)}
