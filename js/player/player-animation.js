const L=c=>new THREE.MeshLambertMaterial({color:c}),B=c=>new THREE.MeshBasicMaterial({color:c});
const WP={
 ar:{n:'M4 Rifle',col:0x4da6ff,rate:.1,dmg:20,mag:30,pel:1,spread:.012,rec:.012,range:110,reload:1.8,auto:1,mz:-1.25},
 smg:{n:'Vector SMG',col:0x5ee08a,rate:.065,dmg:12,mag:35,pel:1,spread:.02,rec:.008,range:70,reload:1.5,auto:1,mz:-.85},
 sg:{n:'Pump Shotgun',col:0xb36bff,rate:.85,dmg:11,mag:6,pel:8,spread:.06,rec:.05,range:38,reload:2.2,auto:0,mz:-1.2},
 pt:{n:'G18 Pistol',col:0xcfd8de,rate:.2,dmg:14,mag:15,pel:1,spread:.014,rec:.02,range:60,reload:1.2,auto:0,mz:-.7},
 sn:{n:'AWM Sniper',col:0xffa23a,rate:1.1,dmg:85,mag:5,pel:1,spread:.002,rec:.06,range:220,reload:2.5,auto:0,mz:-1.6}},KS=['ar','smg','sg','sn'];
const MM=(c,m=.5,r=.45,e=0,ec=0)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,emissive:ec,emissiveIntensity:e});
const PARTS={
 ar:[[0,.14,.2,.7,0,0,0,0],[0,.16,.15,.4,0,0,-.5,1],[1,.035,.55,0,0,.02,-.85,0],[1,.05,.1,0,0,.02,-1.15,1],[0,.12,.2,.38,0,-.02,.55,0,-.05],[0,.1,.24,.1,0,-.2,.15,0,.25],[0,.1,.32,.14,0,-.24,-.1,1,.15],[0,.08,.07,.2,0,.14,-.05,1],[0,.15,.04,.5,0,-.07,0,2]],
 smg:[[0,.14,.2,.5,0,0,0,0],[1,.05,.4,0,0,.02,-.5,1],[0,.09,.42,.12,0,-.28,0,1],[0,.1,.2,.1,0,-.2,.2,0,.25],[0,.04,.04,.4,0,.04,.45,0],[0,.1,.14,.08,0,.14,0,1],[0,.15,.04,.4,0,-.07,0,2]],
 sg:[[0,.14,.2,.45,0,0,0,0],[1,.05,.95,0,0,.03,-.65,1],[1,.04,.75,0,0,-.07,-.6,0],[0,.15,.12,.28,0,-.08,-.45,3],[0,.12,.2,.5,0,-.02,.5,3,-.1],[0,.15,.04,.3,0,-.08,0,2],[0,.03,.05,.04,0,.07,-1.12,2]],
 pt:[[0,.12,.16,.4,0,0,0,0],[1,.03,.28,0,0,.02,-.34,1],[0,.09,.24,.1,0,-.17,.12,0,.2],[0,.125,.03,.4,0,-.07,0,2],[0,.04,.04,.04,0,.1,-.1,1]],
 sn:[[0,.13,.2,.6,0,0,0,0],[1,.03,1.2,0,0,.03,-.9,1],[1,.045,.15,0,0,.03,-1.5,0],[1,.06,.5,0,0,.18,-.05,0],[1,.066,.04,0,0,.18,-.32,2],[0,.12,.22,.5,0,-.05,.55,3,-.05],[0,.1,.2,.14,0,-.17,.08,1],[0,.04,.04,.12,.1,.04,.1,1],[0,.15,.04,.5,0,-.07,0,2]]};
function mkGun(k){const g=new THREE.Group(),w=WP[k],M=[MM(0x3a424a,.5,.4),MM(0x8a96a0,.5,.4),MM(w.col,.3,.4,.9,w.col),MM(0x8a5a32,.1,.7)];
 for(const[t,a,b,c,x,y,z,mi,rx]of PARTS[k]){const m=new THREE.Mesh(t?new THREE.CylinderGeometry(a,a,b,10).rotateX(Math.PI/2):new THREE.BoxGeometry(a,b,c),M[mi]);m.position.set(x,y,z);if(rx)m.rotation.x=rx;g.add(m)}return g}
function setHeld(m,k){const h=m.userData.hand;h.clear();const fl=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),B(0xffd88a));fl.position.set(0,.03,WP[k].mz-.1);fl.visible=false;h.userData.fl=fl;h.add(mkGun(k),fl)}
function mkTag(i){const d=document.createElement('div');d.className='tag';d.innerHTML='Diver '+(i+1)+'<u><i></i></u>';$('hud').appendChild(d);return d}
const SK=[0xf2c9a0,0xc99266,0x8d5a3b,0xe8b88a];
const lp=(a,b,t)=>a+(b-a)*t,rip=[];
function ripple(x,z){if(rip.length>30)return;const m=new THREE.Mesh(new THREE.RingGeometry(.6,.75,28).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}));m.position.set(x,.2,z);scene.add(m);rip.push({m,x,z,t:0})}
// modes: 0 treading water, 1 surface crawl, 2 underwater flutter kick, 3 standing in boat
function pose(m,mode,aim,pit,mv,t,dt){const u=m.userData,PI=Math.PI;
 u.ph+=dt*(mode===1?9:mode===2?(mv?5:1.5):mode===0?3.2:1);const ph=u.ph;
 u.aim+=((aim?1:0)-u.aim)*Math.min(1,dt*8);const A=u.aim;
 u.tilt+=([.08,1.25,clamp(1.45-pit,.15,2.9),0,1.4,.05,2.9][mode]-u.tilt)*Math.min(1,dt*(mode>3?6:5));
 u.roll+=((mode===1?Math.sin(ph*.55)*.25:0)-u.roll)*Math.min(1,dt*10);m.rotation.x=-u.tilt;m.rotation.z=u.roll;
 if(mode===0)m.position.y+=Math.sin(t*2.2)*.05;
 if((mode===0||mode===1)&&(u.rt-=dt)<=0){u.rt=mode===1?.22:.8;ripple(m.position.x,m.position.z)}
 u.lg.forEach((l,i)=>{const s=i?-1:1,c=Math.cos(ph+i*PI),n=Math.sin(ph+i*PI);let lx=0,kx=.25,lz=0;
  if(mode===1){lx=n*.5;kx=.15+.35*Math.max(0,c)}else if(mode===2){lx=n*(mv?.38:.12);kx=.1+(mv?.25:.15)*Math.max(0,c)}
  else if(mode===0){lx=.55+.4*n;kx=.9+.5*c;lz=s*.18}else if(mode===4){lx=-.1+.1*n;kx=.35;lz=s*.18}else if(mode===5){lx=Math.sin(t*1.5+i*PI)*.15;kx=.15;lz=s*.05}else if(mode===6){lx=0;kx=0}
  l.rotation.x=lx;l.rotation.z=lz;l.userData.k.rotation.x=-kx});
 u.arms.forEach((a,i)=>{const s=i?-1:1;let rx=0,ry=0,rz=0,el=.2;
  if(mode===1){const th=-ph*.55+i*PI;rx=th;ry=s*.15;el=.3+.9*Math.max(0,-Math.cos(th))}
  else if(mode===2){rx=-.25+.12*Math.sin(ph*.9+i*PI);rz=s*.15;el=.35}
  else if(mode===0){rx=.25*Math.sin(ph*.9+i*PI);rz=s*(1+.15*Math.sin(ph*1.8));el=.5}else if(mode===4){rx=-.25;rz=s*1.35;el=.2}else if(mode===5){rx=Math.PI-.25;rz=s*.15;el=.3}else if(mode===6){rx=Math.PI;rz=s*.1;el=0}
  else{rx=.15;rz=s*.1}
  a.rotation.set(lp(rx,1.25,A),lp(ry,s*.4,A),lp(rz,0,A));a.userData.f.rotation.x=lp(el,0,A)});
 const h=u.hand;h.position.set(lp(.2,0,A),lp(0,.34,A),lp(.3,-.3,A));h.rotation.set(-1.5*(1-A),0,.2*(1-A))}
function mkDiver(c,sk){const g=new THREE.Group(),su=L(c),tr=L(new THREE.Color(c).multiplyScalar(.4).getHex()),skin=L(sk),dk=MM(0x20262c,.4,.5),
 add=(p,geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m},cy=(r,h,n=10)=>new THREE.CylinderGeometry(r,r*.85,h,n);
 add(g,cy(.27,.62,14),su,0,.25,0).scale.z=.65;add(g,new THREE.SphereGeometry(.3,12,8),su,0,.52,0).scale.set(1,.45,.65);
 add(g,cy(.23,.22,14),tr,0,-.14,0).scale.z=.7;add(g,cy(.07,.12),skin,0,.62,0);add(g,new THREE.SphereGeometry(.15,14,10),skin,0,.76,0);
 add(g,new THREE.SphereGeometry(.165,14,8,0,6.283,0,1.7),tr,0,.77,.01);
 add(g,new THREE.BoxGeometry(.24,.1,.06),dk,0,.77,-.14);
 add(g,new THREE.BoxGeometry(.19,.07,.05),new THREE.MeshStandardMaterial({color:0x66e0ff,emissive:0x2aa8d8,emissiveIntensity:.8,roughness:.15}),0,.77,-.165);
 add(g,new THREE.SphereGeometry(.035,8,6),dk,0,.69,-.15);add(g,cy(.02,.4,6),dk,.14,.92,-.02);
 add(g,new THREE.CylinderGeometry(.11,.11,.58,12),MM(0xc9d3d9,.5,.4),0,.3,.27);add(g,cy(.05,.1,8),dk,0,.64,.27);add(g,new THREE.BoxGeometry(.52,.07,.4),dk,0,.42,.02);
 g.userData.arms=[1,-1].map(s=>{const a=new THREE.Group();a.rotation.order='YXZ';a.position.set(s*.33,.5,0);
  add(a,new THREE.SphereGeometry(.075,8,6),su,0,0,0);add(a,cy(.065,.3),su,0,-.15,0);
  const f=new THREE.Group();f.position.y=-.3;add(f,cy(.055,.28),su,0,-.14,0);add(f,new THREE.SphereGeometry(.06,8,6),skin,0,-.3,0);a.add(f);a.userData.f=f;g.add(a);return a});
 g.userData.lg=[1,-1].map(s=>{const l=new THREE.Group();l.position.set(s*.12,-.22,0);add(l,cy(.09,.44),su,0,-.22,0);
  const k=new THREE.Group();k.position.set(0,-.44,0);add(k,cy(.07,.4),su,0,-.2,0);add(k,new THREE.BoxGeometry(.13,.03,.4),dk,0,-.43,-.12);l.add(k);l.userData.k=k;g.add(l);return l});
 Object.assign(g.userData,{aim:0,tilt:0,ph:0,rt:0,roll:0});
 const h=new THREE.Group();h.position.set(0,.34,-.3);h.scale.setScalar(.75);g.add(h);g.userData.hand=h;g.rotation.order='YXZ';return g}
function mkBoat(c=0xff7a3d){const g=new THREE.Group(),add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};
 add(new THREE.BoxGeometry(3,.8,7),L(0xf4f7f6),0,.4,0);add(new THREE.BoxGeometry(3.04,.22,7.04),L(c),0,.62,0);
 const bw=new THREE.ConeGeometry(2.12,3,4);bw.rotateY(Math.PI/4);bw.rotateX(-Math.PI/2);
 const bow=add(bw,L(0xf4f7f6),0,.4,-5);bow.scale.y=.27;
 add(new THREE.BoxGeometry(1.8,1.1,1.6),L(0xdfe9ee),0,1.3,1);add(new THREE.BoxGeometry(1.7,.5,.1),L(0x66c8e8),0,1.5,.18);return g}
function mkLoot(t,k){const g=new THREE.Group(),add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};
 const ac=t==='coin'?0xffd23f:t==='kit'?0x3ddc97:t==='wall'?0x2ef2d0:t==='dome'?0x9fe8ff:WP[k].col;
 if(t==='coin'){add(new THREE.CylinderGeometry(.8,.8,.1,28).rotateX(Math.PI/2),MM(0xffc928,.55,.3,.6,0x6a4300),0,0,0);add(new THREE.TorusGeometry(.8,.055,8,28),MM(0xd9a000,.55,.3,.5,0x4a3000),0,0,0);
  const s=new THREE.Shape();s.moveTo(-.6,0);s.bezierCurveTo(-.4,.38,.2,.4,.5,.05);s.lineTo(.9,.3);s.lineTo(.78,0);s.lineTo(.9,-.3);s.lineTo(.5,-.05);s.bezierCurveTo(.2,-.4,-.4,-.38,-.6,0);
  const fg=new THREE.ExtrudeGeometry(s,{depth:.06,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2});fg.translate(-.15,0,0);
  const f1=add(fg,MM(0xfff0a8,.5,.25,.7,0xaa7a00),0,0,.05);f1.scale.setScalar(.75);const f2=f1.clone();f2.rotation.y=Math.PI;f2.position.z=-.05;g.add(f2)}
 else if(t==='kit'){const gr=MM(0x3ddc97,.2,.4,.9,0x1fae70),dk=MM(0x39424a,.5,.4);add(new THREE.BoxGeometry(.95,.7,.45),MM(0xf2f5f5,.2,.5,.2,0x333333),0,0,0);
  for(const z of[.235,-.235]){add(new THREE.BoxGeometry(.5,.16,.04),gr,0,0,z);add(new THREE.BoxGeometry(.16,.5,.04),gr,0,0,z)}
  add(new THREE.TorusGeometry(.18,.035,8,14,Math.PI),dk,0,.35,0);for(const x of[-.3,.3])add(new THREE.BoxGeometry(.07,.72,.47),dk,x,0,0);
  add(new THREE.CylinderGeometry(.17,.17,.7,14),MM(0x3aa8ff,.5,.3,.5,0x0a4a88),.68,0,0);add(new THREE.CylinderGeometry(.06,.06,.14,8),MM(0xcfd8de,.6,.3),.68,.42,0);add(new THREE.CylinderGeometry(.18,.18,.07,14),MM(0xf2f5f5,.2,.5),.68,.1,0)}
 else if(t==='wall'){const cm=MM(0x2ef2d0,.2,.4,1,0x12b8a0);[[0,0,.9,.18],[.28,-.1,.6,.14],[-.25,-.05,.7,.15],[.1,.2,.5,.12],[-.1,-.22,.55,.12]].forEach(([x,z,h,r],i)=>{const m=add(new THREE.ConeGeometry(r,h,6),cm,x,h/2-.4,z);m.rotation.z=(i-2)*.12})}
 else if(t==='dome'){add(new THREE.SphereGeometry(.6,16,12),new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.28,depthWrite:false}),0,0,0);add(new THREE.SphereGeometry(.62,12,8),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.35}),0,0,0);for(let i=0;i<4;i++)add(new THREE.SphereGeometry(.09,8,6),B(0xffffff),rnd(-.25,.25),rnd(-.25,.25),rnd(-.25,.25))}
 else{const w=mkGun(k);w.scale.setScalar(1.7);g.add(w)}
 g.add(new THREE.Mesh(new THREE.TorusGeometry(1.1,.05,6,24).rotateX(Math.PI/2),B(ac)).translateY(-.8));
 const bm=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,6,12,1,true),new THREE.MeshBasicMaterial({color:ac,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));bm.position.y=2.2;g.add(bm);
 g.scale.setScalar(1.3);return g}

