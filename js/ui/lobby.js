// lobby
const SUITS=[0x2ec4b6,0xff5a4d,0x4da6ff,0xffd23f,0xb36bff,0x3ddc97];
function rebuild(){scene.remove(P.m);P.m=mkDiver(SUITS[cfg.suit],SK[cfg.skin]);setHeld(P.m,P.sl[P.cur].k);scene.add(P.m)}
function sync(){[['suits','suit'],['skins','skin']].forEach(([id,k])=>[...$(id).children].forEach((b,i)=>b.classList.toggle('on',cfg[k]===i)));
 [['dif','diff'],['cnt','bots']].forEach(([id,k])=>[...$(id).children].forEach(b=>b.classList.toggle('on',+b.dataset.v===cfg[k])));
 $('stat').innerHTML=[['Matches',cfg.played],['Wins',cfg.wins],['Best eliminations',cfg.best],['Fish coins banked',cfg.coins]].map(([a,b])=>'<div><b>'+b+'</b>'+a+'</div>').join('')}
function swatches(id,arr,key){arr.forEach((c,i)=>{const b=document.createElement('button');b.className='sw';b.style.background='#'+c.toString(16).padStart(6,'0');b.setAttribute('aria-label',key+' '+(i+1));
 b.onclick=()=>{cfg[key]=i;sync();rebuild();save()};$(id).appendChild(b)})}
swatches('suits',SUITS,'suit');swatches('skins',SK,'skin');
$('dif').onclick=e=>{if(e.target.dataset.v){cfg.diff=+e.target.dataset.v;sync();save()}};
$('cnt').onclick=e=>{if(e.target.dataset.v){cfg.bots=+e.target.dataset.v;sync();save()}};
$('nm').value=cfg.name;$('nm').oninput=e=>{cfg.name=e.target.value.slice(0,14);save()};
$('lc').innerHTML=$('ctl').innerHTML;rebuild();sync();
 $('start').onclick=()=>{resetSwim();resetDiveAction();zoneReset();auInit();auStart();if(IS_TOUCH)goFull();cfg.name=cfg.name.trim()||'Diver';save();
 bots.forEach((b,i)=>{if(i>=cfg.bots){b.alive=false;scene.remove(b.m);b.tag.style.display='none'}});
 started=true;running=true;startDrop();$('lobby').style.display='none';$('hud').style.display='block';
 try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}};
$('quit').onclick=()=>{resetSwim();resetDiveAction();location.reload()};
let playAgainOnLoad=false;try{playAgainOnLoad=sessionStorage.getItem('ddPlayAgain')==='1';if(playAgainOnLoad)sessionStorage.removeItem('ddPlayAgain')}catch(e){}if(playAgainOnLoad)setTimeout(()=>$('start').click(),0);
function lobbyCam(t,dt){const b=boats[0],h=b.h+Math.sin(t*.3)*.9,ty=b.pos.y+2.1,o=innerWidth>700?1.7:0;
 P.m.position.set(b.pos.x,b.pos.y+1.85,b.pos.z);P.m.rotation.y=b.h;pose(P.m,3,false,0,0,t,dt);
 cam.position.set(b.pos.x-Math.sin(h)*6.5,ty+.2,b.pos.z-Math.cos(h)*6.5);cam.lookAt(b.pos.x+Math.cos(h)*o,ty-.2,b.pos.z-Math.sin(h)*o)}
