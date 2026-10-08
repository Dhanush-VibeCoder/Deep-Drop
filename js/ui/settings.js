// ===== performance & settings (part B: apply quality, adaptive resolution, auto tier, settings panel) =====
function recomputeQ(){const b=cfg.q==='auto'?PRE[cfg.autoT||(IS_TOUCH?'med':'high')]:cfg.q==='custom'?cfg:(PRE[cfg.q]||PRE.high);
 Q={res:b.res,adapt:b.adapt,fps:b.fps,water:b.water,clouds:b.clouds,caust:b.caust,lights:b.lights,grass:b.grass,fish:b.fish,fx:b.fx,dist:b.dist}}
function applyRes(){renderer.setPixelRatio(clamp(Math.min(devicePixelRatio,IS_TOUCH?1.5:2)*(Q.res/100)*DYN,.35,2));resize()}
function applyQ(){recomputeQ();
 if(waterMat.defines.WQ!==Q.water){waterMat.defines.WQ=Q.water;waterMat.defines.FBM_O=Q.water>=2?4:2;waterMat.needsUpdate=true}
 if(WL!==Q.water){const R=[[48,32,40],[96,60,64],[160,100,96]][Q.water];waterA.geometry.dispose();waterB.geometry.dispose();
  waterA.geometry=new THREE.RingGeometry(.1,300,R[0],R[1]).rotateX(-Math.PI/2);waterB.geometry=new THREE.RingGeometry(300,1300,R[2],10).rotateX(-Math.PI/2);WL=Q.water}
 const cl=Q.clouds?1:0;if(sky.material.defines.CLOUDS!==cl){sky.material.defines.CLOUDS=cl;sky.material.needsUpdate=true}
 CAUU.value=Q.caust?1:0;
 if(WEED.sg){WEED.sg.count=Math.round(WEED.sgN*Q.grass/100);WEED.sg.visible=WEED.sg.count>0}
 if(WEED.fm)WEED.fm.count=Math.max(8,Math.round(WEED.wm.length*Math.max(.3,Q.fx/100)));
 MOTES.forEach(m=>m.g.setDrawRange(0,Math.round(m.n*Math.max(.15,Q.fx/100))));
 FQ=Q.fish/100;PMAX=Math.round(40+80*Q.fx/100);lamp.visible=Q.lights;XL.forEach(l=>{l.visible=Q.lights});
 FOGM=[.7,1,1.3][Q.dist];cam.far=Math.max(450,380*FOGM+120);sky.scale.setScalar((cam.far-30)/600);cam.updateProjectionMatrix();
 DYN=Math.min(1,Math.max(DYN,45/Q.res));applyRes();$('fps').style.display=cfg.fpsShow?'block':'none'}
// frame-time monitor: shows FPS, scales render resolution to hold the target, and (in Auto) steps the quality tier down/up
let FPSM=16.7,pfT=0,pfN=0,warm=0,lowT=0,hiT=0,slowT=0,upT=0;
function perfTick(ms){if(ms>250||ms<=0)return;FPSM=FPSM*.94+ms*.06;pfN++;pfT+=ms;warm++;
 if(pfT>=500){if(cfg.fpsShow)$('fps').textContent=Math.round(pfN*1000/pfT)+' fps \u00B7 '+Math.round(Q.res*DYN)+'%';pfN=0;pfT=0}
 if(warm<60)return;const target=1000/Q.fps,minD=Math.min(1,45/Q.res);
 if(Q.adapt){if(FPSM>target*1.18){lowT+=ms;hiT=0}else if(FPSM<target*1.08){hiT+=ms;lowT=0}else{lowT=0;hiT=0}
  if(lowT>1200&&DYN>minD){DYN=Math.max(minD,DYN*.9);lowT=0;applyRes()}else if(hiT>6000&&DYN<1){DYN=Math.min(1,DYN*1.05);hiT=0;applyRes()}}
 if(cfg.q==='auto'){const cur=cfg.autoT||(IS_TOUCH?'med':'high');
  if(DYN<=minD+.01&&FPSM>target*1.3){slowT+=ms;if(slowT>4000&&cur!=='low'){cfg.autoT=cur==='high'?'med':'low';save();slowT=0;DYN=1;warm=0;applyQ()}}else slowT=0;
  if(cur!=='high'&&DYN>=1&&FPSM<target*.7&&!IS_TOUCH){upT+=ms;if(upT>12000){cfg.autoT=cur==='low'?'med':'high';save();upT=0;warm=0;applyQ()}}else upT=0}}
const SETS=[
 {k:'q',l:'Quality preset',t:'seg',o:[['auto','Auto'],['low','Low'],['med','Medium'],['high','High']]},
 {k:'res',l:'Render resolution',t:'range',min:50,max:100,step:5,f:v=>v+'%'},
 {k:'adapt',l:'Adaptive resolution',t:'tg'},
 {k:'fps',l:'Target FPS',t:'seg',o:[[30,'30'],[60,'60']]},
 {k:'water',l:'Water detail',t:'seg',o:[[0,'Low'],[1,'Medium'],[2,'High']]},
 {k:'clouds',l:'Sky clouds',t:'tg'},{k:'caust',l:'Seabed caustics',t:'tg'},{k:'lights',l:'Extra lights',t:'tg'},
 {k:'grass',l:'Seagrass amount',t:'range',min:0,max:100,step:10,f:v=>v+'%'},
 {k:'fish',l:'Fish amount',t:'range',min:0,max:100,step:10,f:v=>v+'%'},
 {k:'fx',l:'Particles and effects',t:'range',min:20,max:100,step:10,f:v=>v+'%'},
 {k:'dist',l:'View distance',t:'seg',o:[[0,'Short'],[1,'Normal'],[2,'Far']]},
 {k:'aa',l:'Anti-aliasing (restart)',t:'tg'},{k:'fpsShow',l:'Show FPS counter',t:'tg'}];
const aaOn=()=>cfg.aa!==undefined?cfg.aa:!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const sval=d=>d.k==='aa'?aaOn():d.k==='fpsShow'?!!cfg.fpsShow:d.k==='q'?cfg.q:Q[d.k];
function setQ(k,v){if(k==='q')cfg.q=v;else if(k==='aa'||k==='fpsShow')cfg[k]=v;else{if(cfg.q!=='custom'){Object.assign(cfg,Q);cfg.q='custom'}cfg[k]=v}applyQ();save();syncSet()}
(function buildSet(){const box=$('sgfx');SETS.forEach(d=>{const r=document.createElement('div');r.className='srow';const lb=document.createElement('span');lb.textContent=d.l;r.appendChild(lb);let c;
 if(d.t==='seg'){c=document.createElement('div');c.className='seg';d.o.forEach(([v,n])=>{const b=document.createElement('button');b.textContent=n;b.dataset.v=v;c.appendChild(b)});c.onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(v!==undefined)setQ(d.k,d.k==='q'?v:+v)}}
 else if(d.t==='tg'){c=document.createElement('button');c.className='tg';c.onclick=()=>setQ(d.k,!sval(d))}
 else{c=document.createElement('input');c.type='range';c.min=d.min;c.max=d.max;c.step=d.step;c.oninput=()=>setQ(d.k,+c.value)}
 d.c=c;d.lb=lb;r.appendChild(c);box.appendChild(r)})})();
function syncSet(){SETS.forEach(d=>{const v=sval(d);if(d.t==='seg')[...d.c.children].forEach(b=>b.classList.toggle('on',String(v)===b.dataset.v));
 else if(d.t==='tg'){d.c.classList.toggle('on',!!v);d.c.textContent=v?'On':'Off'}else{d.c.value=v;d.lb.textContent=d.l+' '+d.f(v)}})}
const openSet=()=>{syncSet();$('set').style.display='flex'};$('setBtn').onclick=openSet;$('setBtn2').onclick=openSet;$('setDone').onclick=()=>{$('set').style.display='none'};syncSet();
