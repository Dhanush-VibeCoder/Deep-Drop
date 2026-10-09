// ===== mobile: touch controls modelled on Free Fire (floating stick, drag-look, hold-fire + drag-aim, contextual buttons) =====
let IS_TOUCH=false,TFIRE=0,TUP=false,TDN=false,tcOn=false;const JOY={x:0,y:0,m:false,sprint:false},_aa=new V(),_ab=new V();
const T2R=[[/Press SPACE to jump over your drop spot/,'Tap JUMP over your drop spot'],[/WASD steer, Shift dive faster, Space parachute/,'Stick steers, hold \u25BC to dive faster, tap CHUTE to open'],[/Boat: W\/S throttle, A\/D steer/,'Stick to drive the boat'],[/press H/,'tap \u271A'],[/press G/,'tap \u25A6'],[/press B/,'tap \u25EF'],[/click or F to shoot/,'hold FIRE to shoot'],[/\(H\)/,'(tap \u271A)']];
function T2(t){for(const[r,x]of T2R)t=t.replace(r,x);return t}
function pauseGame(){if(!running||over)return;running=false;showOv('Paused','Tap resume to get back in the water.','Resume',true)}
function goFull(){const e=document.documentElement;try{const p=(e.requestFullscreen||e.webkitRequestFullscreen||function(){}).call(e,{navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(x){}}).catch(()=>{})}catch(x){}}
function chkRot(){const p=IS_TOUCH&&innerHeight>innerWidth*1.05;$('rot').style.display=p?'flex':'none';if(p)pauseGame()}
function setTouch(on){IS_TOUCH=on;document.body.classList.toggle('touch',on);applyQ();$('tc').classList.toggle('lh',!!cfg.lh);chkRot()}
function lookD(dx,dy){if(!running)return;markPlaneLook();const m=Math.hypot(dx,dy),c=m>120?120/m:1,acc=1+Math.min(m/16,1)*.5,s=cfg.sens*.001*acc*(ads?.6:1);P.yaw-=dx*c*s;P.pitch=clamp(P.pitch-dy*c*s*(cfg.inv?-1:1),-1.3,1.3)}
function bindBtn(id,down,up,drag){const el=$(id);let pid=null,lx=0,ly=0;
 el.addEventListener('pointerdown',e=>{if(pid!==null)return;pid=e.pointerId;el.setPointerCapture(pid);el.classList.add('on');lx=e.clientX;ly=e.clientY;if(down)down();e.preventDefault()});
 el.addEventListener('pointermove',e=>{if(e.pointerId!==pid||!drag)return;lookD(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY});
 const end=e=>{if(e.pointerId!==pid)return;pid=null;el.classList.remove('on');if(up)up()};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end)}
(function touchInit(){
 // floating move stick: appears under the thumb, follows it, push to the rim to sprint
 const z=$('tl'),jb=$('joy'),jk=jb.firstElementChild,R=58;let id=null,ox=0,oy=0;
 const upd=(cx,cy)=>{let dx=cx-ox,dy=cy-oy;const d=Math.hypot(dx,dy);if(d>R){const k=(d-R)/d;ox+=dx*k;oy+=dy*k;dx=cx-ox;dy=cy-oy;jb.style.left=ox-R+'px';jb.style.top=oy-R+'px'}
  const m=Math.min(1,Math.hypot(dx,dy)/R),mag=m<.12?0:Math.pow((m-.12)/.88,1.15),a=Math.atan2(dy,dx);JOY.x=Math.cos(a)*mag;JOY.y=-Math.sin(a)*mag;JOY.m=mag>0;JOY.sprint=JOY.sprint?m>.85:m>.97;jk.style.transform='translate('+dx+'px,'+dy+'px)'};
 const rel=()=>{id=null;JOY.x=JOY.y=0;JOY.m=JOY.sprint=false;jb.style.display='none'};
 z.addEventListener('pointerdown',e=>{if(id!==null)return;id=e.pointerId;z.setPointerCapture(id);ox=clamp(e.clientX,R+8,innerWidth-R-8);oy=clamp(e.clientY,R+8,innerHeight-R-8);jb.style.cssText='display:block;left:'+(ox-R)+'px;top:'+(oy-R)+'px';upd(e.clientX,e.clientY)});
 z.addEventListener('pointermove',e=>{if(e.pointerId===id)upd(e.clientX,e.clientY)});z.addEventListener('pointerup',e=>{if(e.pointerId===id)rel()});z.addEventListener('pointercancel',e=>{if(e.pointerId===id)rel()});
 // drag anywhere on the other side to look
 const lz=$('tr');let lid=null,lx=0,ly=0;lz.addEventListener('pointerdown',e=>{if(lid!==null)return;lid=e.pointerId;lz.setPointerCapture(lid);lx=e.clientX;ly=e.clientY});
 lz.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;lookD(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY});const lend=e=>{if(e.pointerId===lid)lid=null};lz.addEventListener('pointerup',lend);lz.addEventListener('pointercancel',lend);
 // buttons (hold-fire also aims while the thumb drags)
 bindBtn('bFire',()=>{TFIRE++},()=>{TFIRE=Math.max(0,TFIRE-1)},true);bindBtn('bFire2',()=>{TFIRE++},()=>{TFIRE=Math.max(0,TFIRE-1)},true);
 bindBtn('bSwim',()=>toggleSwim());bindBtn('bDive',()=>contextualDive());
 $('bAim').addEventListener('pointerdown',e=>{ads=!ads;e.preventDefault()});
 bindBtn('bUp',()=>{TUP=true;if(P.ph==='fall')P.cr=1},()=>{TUP=false});
 bindBtn('bRel',()=>reload());bindBtn('bBoat',()=>toggleBoat());bindBtn('bKit',()=>useKit());bindBtn('bWall',()=>deployWall('wall'));bindBtn('bDome',()=>deployWall('dome'));bindBtn('bPause',()=>pauseGame());
 $('wpn').addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.sl');if(!el||!IS_TOUCH)return;const i=[...$('wpn').querySelectorAll('.sl')].indexOf(el);if(i>=0)sw(i)});
 $('tc').addEventListener('contextmenu',e=>e.preventDefault());['gesturestart','gesturechange'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));document.addEventListener('dblclick',e=>e.preventDefault());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});addEventListener('resize',chkRot);addEventListener('orientationchange',()=>setTimeout(chkRot,200));
 // lobby touch settings
 $('sens').value=cfg.sens;$('sens').oninput=e=>{cfg.sens=+e.target.value;save()};$('tset').onclick=e=>{const k=e.target.dataset&&e.target.dataset.k;if(k){cfg[k]=!cfg[k];sync();$('tc').classList.toggle('lh',!!cfg.lh);save()}};
 const s0=sync;sync=function(){s0();[...$('tset').children].forEach(b=>b.classList.toggle('on',!!cfg[b.dataset.k]))};sync();
 setTouch(matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints>1&&/Mac|iPhone|iPad|Android/.test(navigator.userAgent))||/[?&]touch=1/.test(location.search));
 addEventListener('touchstart',()=>{if(!IS_TOUCH)setTouch(true)},{passive:true,once:true})})();
function sh(id,on){const e=$(id);if(e._o!==on){e._o=on;e.style.display=on?'flex':'none'}}
function tcUpdate(){const on=IS_TOUCH&&started&&running&&!over;if(on!==tcOn){tcOn=on;$('tc').style.display=on?'block':'none'}if(!on)return;
 const pl=P.ph==='play';if(!pl){TFIRE=0;ads=false}
 let near=false;if(pl){if(P.boat)near=true;else if(P.pos.y>-3)for(const b of boats)if(!b.rider&&b.pos.distanceTo(P.pos)<9){near=true;break}}
 sh('bFire',pl);sh('bFire2',pl);sh('bAim',pl);sh('bRel',pl);sh('bSwim',pl);sh('bDive',pl&&!P.boat);sh('bBoat',near);sh('bKit',pl&&P.kits>0&&(P.hp<100||P.o2<100));sh('bWall',pl&&P.walls>0);sh('bDome',pl&&P.domes>0);
 const up=P.ph==='plane'?'JUMP':P.ph==='fall'?'CHUTE':'';if($('bUp')._t!==up){$('bUp')._t=up;$('bUp').textContent=up}sh('bUp',up!=='');
 const bt=P.boat?'LEAVE':'BOAT';if($('bBoat')._t!==bt){$('bBoat')._t=bt;$('bBoat').textContent=bt}
 const diveText=P.pos.y<-1.2?'SURFACE':'DIVE';if($('bDive')._t!==diveText){$('bDive')._t=diveText;$('bDive').textContent=diveText}$('bKit').textContent='\u271A'+P.kits;$('bWall').textContent='\u25A6'+P.walls;$('bDome').textContent='\u25EF'+P.domes;$('bAim').classList.toggle('on',ads);$('bSwim').classList.toggle('swim-on',swimActive);$('bSwim').setAttribute('aria-pressed',String(swimActive))}
// gentle aim assist: pulls the view toward an enemy near the crosshair while aiming or firing on touch
function aimAssist(dt){if(!IS_TOUCH||P.ph!=='play'||!(TFIRE>0||ads))return;cam.getWorldDirection(_aa);let best=null,ba=.14;
 for(const b of bots){if(!b.alive||b.ph!=='play')continue;_ab.copy(b.pos);_ab.y+=.6;_ab.sub(cam.position);const d=_ab.length();if(d>75)continue;_ab.divideScalar(d);const ang=Math.acos(clamp(_aa.dot(_ab),-1,1));if(ang<ba){ba=ang;best=_ab.clone()}}
 if(best){let dy=Math.atan2(-best.x,-best.z)-P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));P.yaw+=dy*Math.min(1,dt*2.2);P.pitch+=(Math.asin(clamp(best.y,-1,1))-P.pitch)*Math.min(1,dt*2.2)}}
for(let i=0;i<NB;i++)rb(i);window.DeepDropStart=()=>{if(window.__deepDropStarted)return;window.__deepDropStarted=true;requestAnimationFrame(loop)};
// Keep direct file:// launches working if the deferred module entry is blocked by the browser.
setTimeout(()=>{if(!window.__deepDropStarted)window.DeepDropStart()},0);
