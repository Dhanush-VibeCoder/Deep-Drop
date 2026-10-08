 function playAgain(){try{sessionStorage.setItem('ddPlayAgain','1')}catch(e){}location.reload()}
 function requestGameplayLock(){
  if(IS_TOUCH||document.pointerLockElement===cv)return Promise.resolve(true);
  let req;try{req=cv.requestPointerLock()}catch(e){return Promise.resolve(false)}
  if(req&&typeof req.then==='function')return req.then(()=>true).catch(()=>false);
  return new Promise(resolve=>{let done=false,timer=0;const finish=ok=>{if(done)return;done=true;document.removeEventListener('pointerlockchange',changed);document.removeEventListener('pointerlockerror',failed);if(timer)clearTimeout(timer);resolve(ok)},changed=()=>{if(document.pointerLockElement===cv)finish(true)},failed=()=>finish(false);
   document.addEventListener('pointerlockchange',changed);document.addEventListener('pointerlockerror',failed);changed();if(!done)timer=setTimeout(()=>finish(document.pointerLockElement===cv),600)})
 }
 function resumeGameplay(){requestGameplayLock().then(ok=>{if(ok){running=true;$('ov').style.display='none'}else{running=false;showOv('Paused','Click Resume to restore mouse control.','Resume',true)}})}
 $('go').onclick=()=>{if(over){resetSwim();resetDiveAction();playAgain();return}resumeGameplay()};
function toggleBoat(){if(P.ph!=='play')return;if(P.boat){const b=P.boat;resetDiveAction();P.pos.set(b.pos.x+Math.cos(b.h)*3.5,0,b.pos.z-Math.sin(b.h)*3.5);P.v.copy(b.vel);b.rider=null;P.boat=null;msg('Left the boat');auBoat(0);return}
 let best=null,bd=9;for(const b of boats){if(b.rider)continue;const d=b.pos.distanceTo(P.pos);if(d<bd){bd=d;best=b}}
 if(best&&P.pos.y>-3){resetDiveAction();P.boat=best;best.rider=P;P.v.set(0,0,0);msg('Boat: W/S throttle, A/D steer');auBoat(1)}else msg('No boat within reach')}
function useKit(){if(P.kits>0&&(P.hp<100||P.o2<100)){P.kits--;P.hp=Math.min(100,P.hp+40);P.o2=Math.min(100,P.o2+60);auUse();msg('Kit used: +40 health, +60 oxygen')}}
