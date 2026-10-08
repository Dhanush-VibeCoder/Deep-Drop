// updates
function movePlayer(dt){const k=keys,sub=P.pos.y<-1.2;_pp.copy(P.pos);
 if(P.boat){const b=P.boat;boatPhys(b,dt,clamp((k.KeyW?1:0)-(k.KeyS?1:0)+JOY.y,-1,1),clamp((k.KeyA?1:0)-(k.KeyD?1:0)-JOY.x,-1,1));P.pos.set(b.pos.x,b.pos.y+1.85,b.pos.z)}
 else{const f=clamp((k.KeyW?1:0)-(k.KeyS?1:0)+JOY.y+(swimActive?1:0),-1,1),s=clamp((k.KeyD?1:0)-(k.KeyA?1:0)+JOY.x,-1,1),v=clamp((k.Space?1:0)-((k.KeyC||k.ControlLeft)?1:0)+(TUP?1:0)-(TDN?1:0)+(diveAction===-1?1:0)-(diveAction===1?1:0),-1,1);
  const sp=(sub?6:7.5)*((k.ShiftLeft||k.ShiftRight||JOY.sprint)?1.7:1),cp=Math.cos(P.pitch),full=sub||P.pitch<-.35||swimActive;
  const fw=full?new V(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp):new V(-Math.sin(P.yaw),0,-Math.cos(P.yaw));
  _tv.set(0,0,0).addScaledVector(fw,f*sp).addScaledVector(_rt2.set(Math.cos(P.yaw),0,-Math.sin(P.yaw)),s*sp);_tv.y+=v*sp;
  const cu=current(P.pos.x,P.pos.z,performance.now()/1000);_tv.x+=cu.x*.6;_tv.z+=cu.z*.6;
  P.v.lerp(_tv,1-Math.exp(-(sub?3.2:4.5)*dt));P.pos.addScaledVector(P.v,dt);
  if(P.vy<-.3){P.pos.y+=P.vy*dt;P.vy*=Math.max(0,1-1.8*dt)}else P.vy=0;
  {const wy=waveY(P.pos.x,P.pos.z,performance.now()/1000)*.75;if(P.pos.y>wy){P.pos.y=wy;if(P.v.y>0)P.v.y=0}}
  const r=Math.hypot(P.pos.x,P.pos.z);if(r>370){P.pos.x*=370/r;P.pos.z*=370/r}
  collideWorld(P.pos,.9,P.v,_pp,P,false)}
 updateDiveAction();
 const now=P.pos.y<-1.2&&!P.boat;
 if(now){P.o2-=2*dt;if(P.o2<20&&!P.warn){msg('Low oxygen, surface or use a kit (H)');P.warn=true}}else{P.o2=Math.min(100,P.o2+30*dt);if(P.o2>40)P.warn=false}
 if(inDome(P.pos))P.o2=Math.min(100,P.o2+16*dt);if(P.o2<=0){P.o2=0;P.hp-=8*dt}
 if(zoneOutside(P.pos.x,P.pos.z))P.hp-=4*dt;
  P.m.position.copy(P.pos);P.m.rotation.y=P.boat?P.boat.h:P.yaw;{const mk=!!(swimActive||k.KeyW||k.KeyA||k.KeyS||k.KeyD||k.Space||k.KeyC||JOY.m||TUP||TDN);pose(P.m,P.vy<-3?6:P.boat?3:now?2:mk?1:0,ads||performance.now()-P.lastShot<1200,P.pitch,mk?1:0,performance.now()/1000,dt)}
 pick(P.pos,P);P.wcd-=dt;if(P.cd>0)P.cd-=dt}
function botStep(b,dt){const tp=P.pos,dp=b.pos.distanceTo(tp),sub=b.pos.y<-1.2;let tg=null;
 _bp.copy(b.pos);b.wcd=(b.wcd||0)-dt;b.hurtT=Math.max(0,(b.hurtT||0)-dt);if(b.hp<(b.php||100)-.5)b.hurtT=2;b.php=b.hp;if(b.hide>0){b.hide-=dt;b.hp=Math.min(100,b.hp+6*dt)}
 if((b.walls||0)>0&&b.wcd<=0&&b.hurtT>0&&dp<55&&P.hp>0&&!b.boat){const dd=tp.clone().sub(b.pos).normalize();spawnWall('wall',b.pos.clone().addScaledVector(dd,3),dd,b);b.walls--;b.wcd=9;b.hide=5}
 if(zoneDistance(b.pos.x,b.pos.z)>zoneR-6)tg=V0;
 else if(b.o2<30)tg=new V(b.pos.x,0,b.pos.z);
 else if(b.gun&&dp<(b.k==='pt'?25:45)&&P.hp>0)tg=tp;
 else{let best=1e9;for(const pass of[1,2]){for(const l of loot){if(!l.alive||(pass===1&&b.k==='pt'&&l.type!=='gun'))continue;const d=l.pos.distanceToSquared(b.pos);if(d<best){best=d;tg=l.pos}}if(tg)break}if(!tg)tg=tp}
 const dir=_bd.copy(tg).sub(b.pos),dist=dir.length();dir.normalize();const hd=Math.hypot(tg.x-b.pos.x,tg.z-b.pos.z);
 if(!b.boat&&b.pos.y>-2&&hd>45&&b.o2>=30){let bb=null,bd=22;for(const q of boats){if(q.rider)continue;const d=q.pos.distanceTo(b.pos);if(d<bd){bd=d;bb=q}}if(bb){b.boat=bb;bb.rider=b}}
 if(b.boat){const q=b.boat;
  if(hd<(tg===tp?22:10)||(tg.y<-8&&hd<14)){q.rider=null;b.boat=null;b.v.copy(q.vel);b.pos.set(q.pos.x+Math.cos(q.h)*3.5,0,q.pos.z-Math.sin(q.h)*3.5)}
  else{let da=Math.atan2(-(tg.x-q.pos.x),-(tg.z-q.pos.z))-q.h;da=Math.atan2(Math.sin(da),Math.cos(da));boatPhys(q,dt,Math.abs(da)<1?1:.3,clamp(da*1.5,-1,1));b.pos.set(q.pos.x,q.pos.y+1.85,q.pos.z)}}
 else{_tv.set(0,0,0);if(!(b.hide>0)&&dist>(tg===tp?16:.5)){if(b.det>0){b.det-=dt;_dv.set(-dir.z,0,dir.x).multiplyScalar(b.dsg*1.6).add(dir).normalize();_tv.copy(_dv).multiplyScalar(5)}else _tv.copy(dir).multiplyScalar(5)}const cu=current(b.pos.x,b.pos.z,performance.now()/1000);_tv.x+=cu.x*.5;_tv.z+=cu.z*.5;b.v.lerp(_tv,1-Math.exp(-3*dt));b.pos.addScaledVector(b.v,dt);{const wy=waveY(b.pos.x,b.pos.z,performance.now()/1000)*.75;if(b.pos.y>wy){b.pos.y=wy;if(b.v.y>0)b.v.y=0}}if(collideWorld(b.pos,.9,b.v,_bp,b,false)){b.det=1.2;b.dsg=Math.random()<.5?1:-1}}
 if(sub)b.o2-=1.4*dt;else b.o2=Math.min(100,b.o2+25*dt);if(b.o2<=0){b.o2=0;b.hp-=6*dt}
 if(zoneOutside(b.pos.x,b.pos.z))b.hp-=4*dt;
 pick(b.pos,b);
 const bw=b.gun?WP[b.k]:null;if(bw&&P.hp>0&&!(b.hide>0)&&dp<bw.range*(sub?.35:.5)){b.cd-=dt;if(b.cd<=0){b.cd=rnd(.6,1.2);let h=Math.random()<[.18,.3,.45][cfg.diff];const bdir=tp.clone().sub(b.pos).normalize(),wx=rayWorld(b.pos,bdir,dp);let wk=wallHit(b.pos,bdir,wx>=0?wx:dp,b.pos);if(wk){h=false;hitWall(wk.w,bw.dmg,null)}else if(wx>=0){h=false;wk={t:wx}}auShot(b.k,b.pos);if(!h&&!wk)auWhiz();
  tracer(b.m.userData.hand.localToWorld(new V(0,0,bw.mz)),wk?b.pos.clone().addScaledVector(bdir,wk.t):h?tp.clone():tp.clone().add(new V(rnd(-3,3),rnd(-2,2),rnd(-3,3))),bw.col);if(h)hurt(Math.round(5+bw.dmg*.12))}}
 b.m.position.copy(b.pos);b.m.rotation.y=b.boat?b.boat.h:Math.atan2(-dir.x,-dir.z);pose(b.m,b.boat?3:sub?2:1,!!b.gun&&dp<WP[b.k].range*.5&&P.hp>0,Math.asin(clamp(dir.y,-1,1)),1,performance.now()/1000,dt);
 if(b.hp<=0&&b.alive)killBot(b)}
function updateCam(){if(P.ph==='plane'){camPlane();return}const d=P.boat?14:P.ph==='fall'?10:P.ph==='dive'?4.5:6,cp=Math.cos(P.pitch),dir=_cd.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp);
 const tg=_ct.copy(P.pos);tg.y+=P.boat?1.5:.9;cam.position.copy(tg).addScaledVector(dir,-d);
 cam.position.y=Math.max(cam.position.y,depthAt(cam.position.x,cam.position.z)+.5);
 if(tg.y>-.5&&cam.position.y<.8)cam.position.y=.8;cam.lookAt(tg.x+dir.x*20,tg.y+dir.y*20,tg.z+dir.z*20);
 const s=P.sl[P.cur],tf=P.ph!=='play'?(P.ph==='fall'?92:P.ph==='dive'?56:74):P.vy<-2?64:ads?(s&&s.k==='sn'?28:52):70;if(Math.abs(cam.fov-tf)>.1){cam.fov+=(tf-cam.fov)*.2;cam.updateProjectionMatrix()}if(cinShake>.02){cam.position.x+=rnd(-1,1)*cinShake*.35;cam.position.y+=rnd(-1,1)*cinShake*.35;cinShake*=.92}}
function env(dt){const cy=cam.position.y;
 if(cy<-.3){const k=Math.pow(clamp(-cy/45,0,1),.6);TMP.copy(C1).lerp(C2,k);scene.background.copy(TMP);scene.fog.color.copy(TMP);scene.fog.near=1;scene.fog.far=(80-35*k)*Math.max(.75,FOGM);
  lamp.intensity=1.2;lamp.position.copy(cam.position);bub.visible=true;
  for(let i=0;i<NB;i++){bp[i*3+1]+=dt*(1.5+i%3);const dx=bp[i*3]-cam.position.x,dz=bp[i*3+2]-cam.position.z;if(bp[i*3+1]>cam.position.y+15||dx*dx+dz*dz>1600)rb(i)}
  bg.attributes.position.needsUpdate=true}
 else{scene.background.copy(SKYC);scene.fog.color.copy(SKYC);scene.fog.near=80*FOGM;scene.fog.far=380*FOGM;lamp.intensity=0;bub.visible=false}}
function mini(){navHudUpdate()}
function hud(){$('hp').firstChild.style.width=clamp(P.hp,0,100)+'%';$('ox').firstChild.style.width=P.o2+'%';
 const alive=bots.filter(b=>b.alive).length+1,zt=zoneHudText();
 $('stats').innerHTML='Divers left <b>'+alive+'</b><br>Fish coins <b>'+P.coins+'</b><br>Kits <b>'+P.kits+'</b><br>Coral <b>'+P.walls+'</b>'+(IS_TOUCH?'':' (G)')+', Dome <b>'+P.domes+'</b>'+(IS_TOUCH?'':' (B)')+'<br>'+(P.pos.y>1.5?'Altitude <b>'+Math.round(P.pos.y)+' m':'Depth <b>'+Math.max(0,Math.round(-P.pos.y))+' m')+'</b><br>'+zt;weaponHud()}
function end(win){resetSwim();resetDiveAction();over=true;running=false;auEnd(win);drainOff();cfg.played++;if(win)cfg.wins++;cfg.best=Math.max(cfg.best,P.kills);cfg.coins+=P.coins;save();if(document.exitPointerLock)document.exitPointerLock();cinSlow=1.15;msg(win?'LAST DIVER AFLOAT':'DIVER DOWN');setTimeout(()=>{if(over)showResults(win)},700)}

let last=performance.now();
function loop(now){requestAnimationFrame(loop);perfTick(now-last);const dt0=Math.min(.05,(now-last)/1000);TS+=((cinSlow>0?.4:1)-TS)*Math.min(1,dt0*8);cinSlow-=dt0;const dt=dt0*TS;last=now;const t=now/1000;
 
 for(const b of boats)if(!b.rider)boatPhys(b,dt,0,0);
 for(const l of loot)if(l.alive){l.m.rotation.y+=dt*2;l.m.position.set(l.pos.x,l.pos.y+Math.sin(t*2+l.ph)*.25,l.pos.z)}
 fishUpdate(dt,t);worldUpdate(t);weedUpdate(dt,t);wallsUpdate(running?dt:0,t);cineUpdate(running?dt:0,t);
if(running){T+=dt;zoneUpdate();
  if(P.ph==='play')movePlayer(dt);else phaseUpdate(dt,t);planeUpdate(dt,t);drainFx(dt,t);if(!AU.zh&&T>=30){AU.zh=1;auHorn()}{const s=P.sl[P.cur],trg=firing||keys.KeyF||TFIRE>0;if(trg&&s&&(WP[s.k].auto||!P.trig))shoot();P.trig=trg;P.bloom=Math.max(0,P.bloom-dt*.07);
   if(P.rel>0&&(P.rel-=dt)<=0&&s){const w=WP[s.k],n=Math.min(w.mag-s.mag,s.res);s.mag+=n;s.res-=n}
   if(P.fl>0&&(P.fl-=dt)<=0)P.m.userData.hand.userData.fl.visible=false}for(const b of bots)if(b.alive){if(b.ph==='play')botStep(b,dt);else botDrop(b,dt)}entityCollide(dt);corpseUpdate(dt,t);lootPhys(dt);aimAssist(dt);
  if(msgT>0&&(msgT-=dt)<=0)$('msg').textContent='';
  if(P.hp<=0)end(false);else if(!bots.some(b=>b.alive))end(true)}
 tcUpdate();
 for(let i=rip.length-1;i>=0;i--){const r=rip[i];r.t+=dt;r.m.scale.setScalar(1+r.t*4);r.m.position.y=waveY(r.x,r.z,t)+.15;r.m.material.opacity=Math.max(0,.55-r.t*.5);if(r.t>1.1){scene.remove(r.m);r.m.geometry.dispose();r.m.material.dispose();rip.splice(i,1)}}
 for(let i=tr.length-1;i>=0;i--){tr[i].t-=dt;if(tr[i].t<0){scene.remove(tr[i].l);tr[i].l.geometry.dispose();tr.splice(i,1)}}
 if(started){updateCam();if((HF=(HF+1)%2)===0){hud();mini()}}else lobbyCam(t,dt);env(dt);waterUpdate(t);auUpdate(dt);renderer.render(scene,cam)}
