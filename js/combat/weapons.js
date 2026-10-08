function sw(i){if(i===P.cur||!P.sl[i])return;P.cur=i;P.rel=0;setHeld(P.m,P.sl[i].k);msg(WP[P.sl[i].k].n)}
function reload(){const s=P.sl[P.cur];if(!s||P.rel>0)return;const w=WP[s.k];if(s.mag>=w.mag)return;if(s.res<=0){if(s.mag<=0){msg('Out of ammo, find more');auEmpty()}return}P.rel=w.reload;msg('Reloading...');auReload(w.reload)}
function shoot(){const s=P.sl[P.cur];if(!s||P.ph!=='play'||P.cd>0||P.rel>0)return;const w=WP[s.k];if(s.mag<=0){reload();return}
 s.mag--;{const dm=inDome(P.pos);if(dm)dm.hp-=6}P.cd=w.rate;P.lastShot=performance.now();auShot(s.k);P.bloom=Math.min(.09,P.bloom+w.rec*.8);
 cam.getWorldDirection(D);const o=cam.position.clone(),range=w.range*(P.pos.y<-1.2?.55:1),mv=(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||JOY.m)?.012:0;
 const sp=(w.spread+P.bloom+mv)*(ads?.5:1),mz=P.m.userData.hand.localToWorld(new V(0,.03,w.mz));let tot=0,hb=null,hh=false,hp=null;
 for(let n=0;n<w.pel;n++){const d=D.clone().add(new V(rnd(-sp,sp),rnd(-sp,sp),rnd(-sp,sp))).normalize();let hit=null,ht=range,head=false;
  for(const b of bots){if(!b.alive||b.ph==='plane')continue;const th=rayS(o,d,b.pos.clone().add(HEAD),.36),tb=rayS(o,d,b.pos,.95);
   if(th>=0&&th<ht){hit=b;ht=th;head=true}else if(tb>=0&&tb<ht){hit=b;ht=tb;head=false}}
  const wt=rayWorld(o,d,ht);if(wt>=0){ht=wt;hit=null;impactFx(o.clone().addScaledVector(d,ht))}const wk=wallHit(o,d,ht,P.pos);if(wk){ht=wk.t;hit=null;hitWall(wk.w,w.dmg*(w.pel>1?1.4:1)*(w.dmg>60?1.6:1),o.clone().addScaledVector(d,ht))}const e=o.clone().addScaledVector(d,ht);tracer(mz,e,w.col);
  if(hit){tot+=Math.round(w.dmg*(head?2:1)*(1-.35*ht/range));hb=hit;hp=e;if(head)hh=true}}
 if(hb){hb.hp-=tot;if(hb.v)hb.v.addScaledVector(D,tot*.03);dmgNum(hp,tot,hh);auHit(hh,hb.hp<=0);const c=$('cross');c.classList.add('hit');if(hh)c.classList.add('head');setTimeout(()=>c.classList.remove('hit','head'),110);if(hb.hp<=0&&hb.alive)killBot(hb)}
 (P.boat?P.boat.vel:P.v).addScaledVector(D,-w.rec*(P.boat?4:14)*(P.pos.y<-1.2?1.5:.6));P.pitch=clamp(P.pitch+w.rec*(ads?.6:1),-1.3,1.3);P.yaw+=rnd(-.4,.4)*w.rec;
 const fl=P.m.userData.hand.userData.fl;fl.visible=true;P.fl=.045}
function weaponHud(){const el=$('cross'),s=P.sl[P.cur],w=s&&WP[s.k],sz=20+(P.bloom+(w?w.spread:.01))*500*(ads?.6:1);el.style.width=el.style.height=sz+'px';el.style.margin=-sz/2+'px';
 const hx=c=>'#'+c.toString(16).padStart(6,'0');
 $('wpn').innerHTML=P.sl.map((q,i)=>{const x=q&&WP[q.k];return '<div class="sl'+(i===P.cur?' on':'')+'">'+(x?'<b style="color:'+hx(x.col)+'">'+x.n+'</b>'+(i===P.cur?'<span>'+q.mag+' <small>/ '+q.res+'</small></span>':''):'<em>Empty</em>')+'</div>'}).join('')+(P.rel>0?'<u><i style="width:'+(100-P.rel/WP[s.k].reload*100)+'%"></i></u>':'');
 for(const b of bots){const t=b.tag;if(!b.alive||b.ph==='plane'){t.style.display='none';continue}const p=b.pos.clone();p.y+=1.3;p.project(cam);
  if(p.z>1||b.pos.distanceTo(cam.position)>70){t.style.display='none';continue}t.style.display='block';t.style.left=(p.x*.5+.5)*innerWidth+'px';t.style.top=(-p.y*.5+.5)*innerHeight+'px';t.firstElementChild.firstElementChild.style.width=clamp(b.hp,0,100)+'%'}}
function killBot(b){b.alive=false;if(b.ch){detach(b.ch,b.pos);b.ch=null}makeCorpse(b);b.tag.style.display='none';if(b.boat){b.boat.rider=null;b.boat.sp=0;b.boat=null}P.kills++;msg('Diver eliminated');
 const y=clamp(b.pos.y,depthAt(b.pos.x,b.pos.z)+1.5,0);const dv=()=>new V(rnd(-2,2),rnd(1,3),rnd(-2,2));spawnLoot('coin',new V(b.pos.x,y,b.pos.z),undefined,dv());spawnLoot('kit',new V(b.pos.x+1.5,y,b.pos.z),undefined,dv());if(b.k!=='pt')spawnLoot('gun',new V(b.pos.x-1.5,y,b.pos.z),b.k,dv())}
function pick(p,who){for(const l of loot){if(!l.alive||l.pos.distanceToSquared(p)>9)continue;if(who===P?((l.type==='wall'&&P.walls>=3)||(l.type==='dome'&&P.domes>=1)):(l.type==='dome'||(l.type==='wall'&&(who.walls||0)>=2)))continue;l.alive=false;scene.remove(l.m);if(who===P)auPick(l.type);
 if(who===P){if(l.type==='gun'){const w=WP[l.k],i=P.sl.findIndex(q=>q&&q.k===l.k);
   if(i>=0){P.sl[i].res+=w.mag*2;msg(w.n+': +'+w.mag*2+' ammo')}
   else{const s=!P.sl[P.cur]?P.cur:!P.sl[1-P.cur]?1-P.cur:P.cur;P.sl[s]={k:l.k,mag:w.mag,res:w.mag*2};P.cur=s;P.rel=0;setHeld(P.m,l.k);msg(w.n+' equipped')}}
  else if(l.type==='coin'){P.coins++;msg('Fish coin collected')}else if(l.type==='wall'){P.walls++;msg('Coral charge: press G to grow a wall')}else if(l.type==='dome'){P.domes++;msg('Air-pocket dome: press B to deploy')}else{P.kits++;msg('Oxygen and health kit: press H')}}
 else if(l.type==='gun'){if(who.k==='pt'){who.k=l.k;setHeld(who.m,l.k)}}else if(l.type==='kit')who.hp=Math.min(100,who.hp+35);else if(l.type==='wall')who.walls=(who.walls||0)+1}}
