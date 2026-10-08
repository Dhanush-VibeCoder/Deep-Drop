// ===== dynamic safe zone =====
// The original radial zone remains the authority for damage and timing. These
// phases only add controlled center relocation and a smooth visual transition.
const ZONE_PHASES=[
 {at:0,moveAt:15},
 {at:50,moveAt:65},
 {at:95,moveAt:110},
 {at:140,moveAt:153},
 {at:180,moveAt:190},
 {at:210,moveAt:210}
],ZONE_CANDIDATES=[[0,0]];
let zoneStartX=0,zoneStartZ=0,zoneStartR=300;
function zoneRadiusAt(clock){return Math.max(40,300-Math.min(210,Math.max(0,clock))*(260/210))}
function zoneDistance(x,z){return Math.hypot(x-zoneCX,z-zoneCZ)}
function zoneOutside(x,z,r=zoneR){return Math.hypot(x-zoneCX,z-zoneCZ)>r}
function zonePickNext(){
 const targetR=nextZoneR,currentR=zoneR,minD=Math.max(18,Math.min(58,currentR*.18)),maxD=Math.min(155,Math.max(55,currentR*.55)),maxCenter=260;
 const pool=[...ZONE_CANDIDATES,...ZONES].filter(([x,z])=>{const d=Math.hypot(x-zoneCX,z-zoneCZ);return d>=minD&&d<=maxD&&Math.hypot(x,z)<=maxCenter&&d<currentR*.75+targetR*.75});
 if(pool.length){const p=pool[Math.floor(Math.random()*pool.length)];nextZoneCX=p[0];nextZoneCZ=p[1];return}
 for(let i=0;i<16;i++){const a=rnd(0,6.283),d=rnd(minD,maxD),x=zoneCX+Math.cos(a)*d,z=zoneCZ+Math.sin(a)*d;if(Math.hypot(x,z)<=maxCenter){nextZoneCX=x;nextZoneCZ=z;return}}
 nextZoneCX=clamp(zoneCX,-maxCenter,maxCenter);nextZoneCZ=clamp(zoneCZ,-maxCenter,maxCenter);
}
function zoneReset(){
 zoneCX=zoneCZ=0;zoneR=zoneRadiusAt(0);zonePhase=0;zoneClock=0;zoneState='initial';zoneHasNext=true;zoneNoticePhase=-1;zoneMoveNoticePhase=-1;
 zoneStartX=zoneStartZ=0;zoneStartR=zoneR;nextZoneR=zoneRadiusAt(ZONE_PHASES[1].at);zoneMoveAt=ZONE_PHASES[0].moveAt;zonePickNext();
 zoneM.position.set(zoneCX,10,zoneCZ);zoneM.scale.set(zoneR,1,zoneR);V0.set(zoneCX,0,zoneCZ);dfx=0;zin=false;if(typeof AU!=='undefined')AU.zh=0;drainOff();
}
function zoneUpdate(){
 const clock=Math.max(0,T-30);zoneClock=clock;zoneR=zoneRadiusAt(clock);
 while(zonePhase<ZONE_PHASES.length-1&&clock>=ZONE_PHASES[zonePhase+1].at){
  zoneStartX=nextZoneCX;zoneStartZ=nextZoneCZ;zoneStartR=zoneR;zoneCX=zoneStartX;zoneCZ=zoneStartZ;zonePhase++;
  if(zonePhase<ZONE_PHASES.length-1){zoneHasNext=true;nextZoneR=zoneRadiusAt(ZONE_PHASES[zonePhase+1].at);zoneMoveAt=ZONE_PHASES[zonePhase].moveAt;zonePickNext()}else{zoneHasNext=false;nextZoneCX=zoneCX;nextZoneCZ=zoneCZ;nextZoneR=zoneR;zoneMoveAt=ZONE_PHASES[zonePhase].at}
  zoneState='hold';
 }
 if(T<30){zoneState='initial';zoneCX=zoneStartX=0;zoneCZ=zoneStartZ=0;zoneR=zoneStartR=zoneRadiusAt(0)}
 else if(zoneHasNext){const phase=ZONE_PHASES[zonePhase],next=ZONE_PHASES[zonePhase+1],remain=next.at-zoneMoveAt;
  if(zoneClock>=phase.moveAt){const k=clamp((zoneClock-phase.moveAt)/Math.max(1,remain),0,1),e=k*k*(3-2*k);zoneCX=zoneStartX+(nextZoneCX-zoneStartX)*e;zoneCZ=zoneStartZ+(nextZoneCZ-zoneStartZ)*e;zoneState='moving';if(zoneMoveNoticePhase!==zonePhase){zoneMoveNoticePhase=zonePhase;msg('SAFE ZONE MOVING')}}
  else if(zoneClock>=phase.moveAt-15){zoneState='warning';if(zoneNoticePhase!==zonePhase){zoneNoticePhase=zonePhase;msg('NEXT SAFE ZONE MOVING IN '+Math.ceil(phase.moveAt-zoneClock)+'s')}}
  else zoneState='hold';
 }
 zoneM.position.set(zoneCX,10,zoneCZ);zoneM.scale.set(zoneR,1,zoneR);V0.set(zoneCX,0,zoneCZ);
}
function zoneHudText(){
 if(T<30)return 'Zone closes in '+Math.ceil(30-T)+'s';
 if(!zoneHasNext)return 'Final safe zone: '+Math.round(zoneR)+' m';
 if(zoneState==='warning')return 'NEXT SAFE ZONE MOVING IN '+Math.ceil(Math.max(0,ZONE_PHASES[zonePhase].moveAt-zoneClock))+'s';
 if(zoneState==='moving')return 'SAFE ZONE MOVING';
 return 'Safe zone phase '+(zonePhase+1)+' - '+Math.round(zoneR)+' m';
}

// ===== coral glow walls & air-pocket domes =====
const WALLS=[],PRT=[],TEAL=new THREE.Color(.18,.95,.82),ORG=new THREE.Color(1,.55,.1),RED=new THREE.Color(1,.15,.1),DOMEC=new THREE.Color(.62,.91,1),PG=new THREE.SphereGeometry(.12,6,5);
function burst(p,n,c,sp=1.5){for(let i=0;i<n&&PRT.length<PMAX;i++){const m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:i%3?c:0xffffff,transparent:true,opacity:.8}));
 m.position.copy(p).add(new V(rnd(-sp,sp),rnd(-sp*.8,sp*.8),rnd(-sp,sp)));scene.add(m);PRT.push({m,v:new V(rnd(-1,1),rnd(.2,2),rnd(-1,1)),l:rnd(.8,1.6),t:0})}}
function mkWallMesh(kind){const g=new THREE.Group(),mats=[];
 if(kind==='wall'){const mat=new THREE.MeshStandardMaterial({color:0x2ef2d0,emissive:0x12b8a0,emissiveIntensity:.8,roughness:.5,metalness:.1,transparent:true,opacity:.92});mats.push(mat);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(4.2,3.2,.5),mat));
  for(let i=0;i<24;i++){const h=rnd(.4,1.1),s=i%2?1:-1,c=new THREE.Mesh(new THREE.ConeGeometry(rnd(.1,.22),h,6),mat);c.rotation.set(s*Math.PI/2+rnd(-.25,.25),0,rnd(-.25,.25));c.position.set(rnd(-1.9,1.9),rnd(-1.4,1.4),s*(.2+h/2));g.add(c)}
  for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(rnd(.12,.2),rnd(.5,.9),6),mat);c.position.set(-1.9+i*.54,1.85,0);g.add(c)}}
 else{const a=new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}),b=new THREE.MeshBasicMaterial({color:0xcffaff,wireframe:true,transparent:true,opacity:.4});mats.push(a,b);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(3.2,24,16),a),new THREE.Mesh(new THREE.IcosahedronGeometry(3.22,2),b))}
 return{g,mats}}
function spawnWall(kind,pos,dir,own){const{g,mats}=mkWallMesh(kind),p=pos.clone();if(kind==='wall')p.y=clamp(p.y,depthAt(p.x,p.z)+1.7,3);g.position.copy(p);
 if(kind==='wall'){const z=dir.clone().negate(),x=new V().crossVectors(dir,UPV);if(x.lengthSq()<.04)x.set(Math.cos(P.yaw),0,-Math.sin(P.yaw));x.normalize();
  const y=new V().crossVectors(z,x);g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z))}
 g.scale.setScalar(.05);scene.add(g);while(WALLS.length>=24){scene.remove(WALLS.shift().g)}
 const hp=kind==='dome'?320:260;WALLS.push({kind,g,mats,pos:p,qi:g.quaternion.clone().conjugate(),hp,max:hp,life:kind==='dome'?22:25,age:0,own,R:3.2,dead:false,c:new THREE.Color()});auWall(kind)}
function deployWall(kind){const n=kind==='dome'?'domes':'walls';if(!running||P.ph!=='play'||P.wcd>0||P[n]<=0)return;const d=new V();cam.getWorldDirection(d);P[n]--;P.wcd=.6;
 spawnWall(kind,kind==='dome'?P.pos.clone():P.pos.clone().addScaledVector(d,3.4),d,P);msg(kind==='dome'?'Air-pocket dome up: breathe easy':'Coral wall growing')}
function inDome(p){for(const w of WALLS)if(w.kind==='dome'&&!w.dead&&p.distanceTo(w.pos)<w.R-.2)return w;return null}
function wallHit(o,d,mx,ref){let best=null;
 for(const w of WALLS){if(w.dead)continue;let t=-1;
  if(w.kind==='dome'){if((ref||o).distanceTo(w.pos)<w.R)continue;const oc=o.clone().sub(w.pos),b=oc.dot(d),c=oc.lengthSq()-w.R*w.R,disc=b*b-c;if(c>0&&disc>=0){const tt=-b-Math.sqrt(disc);if(tt>=0)t=tt}}
  else{const ol=o.clone().sub(w.pos).applyQuaternion(w.qi),dl=d.clone().applyQuaternion(w.qi);let t0=0,t1=mx;
   for(const[k,h]of[['x',2.1],['y',1.6],['z',.25]]){if(Math.abs(dl[k])<1e-6){if(Math.abs(ol[k])>h){t1=-1;break}}
    else{let a=(-h-ol[k])/dl[k],b2=(h-ol[k])/dl[k];if(a>b2){const q=a;a=b2;b2=q}t0=Math.max(t0,a);t1=Math.min(t1,b2);if(t0>t1)break}}
   if(t0<=t1)t=t0}
  if(t>=0&&t<mx&&(!best||t<best.t))best={t,w}}
 return best}
function hitWall(w,dmg,p){w.hp-=dmg;auWallHit();if(p&&Math.random()<.5)burst(p,2,0x2ef2d0,.25)}
function breakWall(w){w.dead=true;scene.remove(w.g);burst(w.pos,w.kind==='dome'?36:26,w.kind==='dome'?0x9fe8ff:0x2ef2d0);auWallBreak()}
function wallsUpdate(dt,t){
 for(let i=WALLS.length-1;i>=0;i--){const w=WALLS[i];if(w.dead){WALLS.splice(i,1);continue}
  w.age+=dt;w.life-=dt;const k=Math.min(1,w.age/.45);w.g.scale.setScalar(Math.max(.05,1-Math.pow(1-k,3)));
  const r=clamp(w.hp/w.max,0,1),base=w.kind==='dome'?DOMEC:TEAL;if(r>.5)w.c.copy(base).lerp(ORG,(1-r)*2);else w.c.copy(ORG).lerp(RED,(.5-r)*2);
  for(const m of w.mats){m.color.copy(w.c);if(m.emissive){m.color.multiplyScalar(.5);m.emissive.copy(w.c);m.emissiveIntensity=.7+.3*Math.sin(t*3+w.age)}}
  w.g.visible=w.life>3||Math.sin(t*18)>-.2;if(w.hp<=0||w.life<=0)breakWall(w)}
 for(let i=PRT.length-1;i>=0;i--){const p=PRT[i];p.t+=dt;p.m.position.addScaledVector(p.v,dt);p.v.y+=dt*(p.g===undefined?1.2:p.g);if(p.g&&p.m.position.y<0)p.t+=p.l;p.m.material.opacity=Math.max(0,.8*(1-p.t/p.l));
  if(p.t>p.l){scene.remove(p.m);p.m.material.dispose();PRT.splice(i,1)}}}
// ===== solid walls (collision) + red-zone drain effect =====
const _pp=new V(),_bp=new V(),_dv=new V();
function wallCollide(p,r,prev,boat,who){let hit=false;
 for(const w of WALLS){if(w.dead)continue;
  if(w.kind==='dome'){if(boat||!prev||w.own===who||prev.distanceTo(w.pos)<w.R)continue;const d=p.distanceTo(w.pos);
   if(d<w.R+r){_dv.copy(p).sub(w.pos);if(_dv.lengthSq()<1e-6)_dv.set(1,0,0);p.copy(w.pos).addScaledVector(_dv.normalize(),w.R+r);hit=true}}
  else{const s=w.g.scale.x,hx=2.1*s,hy=1.6*s,hz=.25*s,l=p.clone().sub(w.pos).applyQuaternion(w.qi),c=new V(clamp(l.x,-hx,hx),clamp(l.y,-hy,hy),clamp(l.z,-hz,hz)),dl=l.clone().sub(c),dist=dl.length();
   if(dist<r){let push;if(dist>1e-5)push=dl.multiplyScalar((r-dist)/dist);
    else{const px=hx-Math.abs(l.x),py=hy-Math.abs(l.y),pz=hz-Math.abs(l.z);
     if(pz<=px&&pz<=py)push=new V(0,0,(l.z>=0?1:-1)*(pz+r));else if(py<=px)push=new V(0,(l.y>=0?1:-1)*(py+r),0);else push=new V((l.x>=0?1:-1)*(px+r),0,0)}
    p.add(push.applyQuaternion(w.g.quaternion));hit=true}}}
 return hit}
const aura=new THREE.Mesh(new THREE.SphereGeometry(1.5,16,12),new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})),
 ring=new THREE.Mesh(new THREE.TorusGeometry(1.35,.035,8,36),new THREE.MeshBasicMaterial({color:0xff4040,transparent:true,opacity:.8}));
aura.visible=ring.visible=false;scene.add(aura,ring);let dfx=0,zin=false;
function drainP(p,v){if(PRT.length>=PMAX)return;const m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:0xff2d2d,transparent:true,opacity:.85})),a=rnd(0,6.28);
 m.position.set(p.x+Math.cos(a)*1.2,p.y+rnd(-.9,.7),p.z+Math.sin(a)*1.2);m.scale.setScalar(rnd(.5,1.1));scene.add(m);PRT.push({m,v:new V(-Math.sin(a)*1.3,.9*v,Math.cos(a)*1.3),l:rnd(.7,1.2),t:0})}
function drainOff(){aura.visible=ring.visible=false;$('zfx').style.opacity=0}
function drainFx(dt,t){const out=P.ph==='play'&&zoneOutside(P.pos.x,P.pos.z)&&P.hp>0;
 if(out!==zin){zin=out;if(out)msg('Red zone! Your health is draining, get inside the circle')}
 aura.visible=ring.visible=out;$('zfx').style.opacity=out?.55+.35*Math.sin(t*5):0;
 if(out){aura.position.copy(P.pos);ring.position.copy(P.pos);aura.scale.setScalar(1+.08*Math.sin(t*6));aura.material.opacity=.14+.1*Math.sin(t*6);ring.rotation.set(t*2,t*1.3,0);
  dfx-=dt;if(dfx<=0){dfx=.05;drainP(P.pos,1);drainP(P.pos,1)}}
 for(const b of bots)if(b.alive&&zoneOutside(b.pos.x,b.pos.z)){b.dfx=(b.dfx||0)-dt;if(b.dfx<=0){b.dfx=.15;drainP(b.pos,1)}}}
