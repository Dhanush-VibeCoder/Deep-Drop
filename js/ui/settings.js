// ===== performance & settings (part B: apply quality, adaptive resolution, auto tier, settings panel) =====
const tierKey=k=>k==='low'?'performance':k==='med'?'balanced':k==='performance'||k==='balanced'||k==='high'?k:null;
function deviceTier(){
 const touch=typeof IS_TOUCH!=='undefined'&&IS_TOUCH;if(!touch)return'high';
 const cores=Math.max(1,Number(navigator.hardwareConcurrency)||4),mem=Number(navigator.deviceMemory)||4,dpr=Math.max(1,Number(devicePixelRatio)||1);
 // Combine independent signals; unsupported memory data falls back to a balanced tier.
 if((cores<=4&&mem<=3)||dpr>=3)return'performance';
 if(cores>=8&&mem>=6&&dpr<=2)return'high';
 return'balanced'
}
function autoTier(){return tierKey(cfg.autoT)||deviceTier()}
function recomputeQ(){const b=cfg.q==='auto'?PRE[autoTier()]:cfg.q==='custom'?cfg:(PRE[tierKey(cfg.q)]||PRE.high);
 Q={res:b.res,adapt:b.adapt,fps:b.fps,water:b.water,clouds:b.clouds,caust:b.caust,lights:b.lights,grass:b.grass,fish:b.fish,fx:b.fx,dist:b.dist}}
function dprCap(){if(!IS_TOUCH)return 2;const cores=Number(navigator.hardwareConcurrency)||4,mem=Number(navigator.deviceMemory)||4,dpr=Number(devicePixelRatio)||1;return((cores<=4&&mem<=3)||dpr>=3)?1.25:1.5}
function applyRes(){renderer.setPixelRatio(clamp(Math.min(devicePixelRatio,dprCap())*(Q.res/100)*DYN,.35,2));resize()}
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
// Frame-time monitor: adapts only after sustained trends and exposes lightweight
// renderer statistics through the existing optional FPS counter.
const PERF_SIZE=new THREE.Vector2(),RENDER_STATS={calls:0,triangles:0,lines:0,points:0};
let FPSM=16.7,pfT=0,pfN=0,pfCalls=0,pfTris=0,warm=0,lowT=0,hiT=0,slowT=0,upT=0,qCooldown=0;
function captureRenderStats(){const r=renderer.info&&renderer.info.render;if(r){RENDER_STATS.calls=r.calls||0;RENDER_STATS.triangles=r.triangles||0;RENDER_STATS.lines=r.lines||0;RENDER_STATS.points=r.points||0}if(renderer.info&&renderer.info.reset)renderer.info.reset()}
function perfText(fps){let w=renderer.domElement.width,h=renderer.domElement.height;if(renderer.getDrawingBufferSize){renderer.getDrawingBufferSize(PERF_SIZE);w=PERF_SIZE.x;h=PERF_SIZE.y}return fps+' fps | '+FPSM.toFixed(1)+' ms | '+Math.round(Q.res*DYN)+'% | '+Math.round(pfCalls/Math.max(1,pfN))+' calls | '+Math.round(pfTris/Math.max(1,pfN))+' tris | DPR '+renderer.getPixelRatio().toFixed(2)+' | '+w+'x'+h}
function changeAutoTier(next){if(!next||qCooldown>0)return false;cfg.autoT=next;save();qCooldown=9000;DYN=1;warm=0;applyQ();return true}
function perfTick(ms,active){if(!active){warm=0;lowT=0;hiT=0;slowT=0;upT=0;return}if(ms>250||ms<=0)return;qCooldown=Math.max(0,qCooldown-ms);FPSM=FPSM*.94+ms*.06;pfN++;pfT+=ms;pfCalls+=RENDER_STATS.calls;pfTris+=RENDER_STATS.triangles;warm++;
 if(pfT>=500){if(cfg.fpsShow)$('fps').textContent=perfText(Math.round(pfN*1000/pfT));pfN=0;pfT=0;pfCalls=0;pfTris=0}
 if(warm<60)return;const target=1000/Q.fps,minD=Math.min(1,45/Q.res);
 if(Q.adapt){if(FPSM>target*1.18){lowT+=ms;hiT=0}else if(FPSM<target*1.08){hiT+=ms;lowT=0}else{lowT=0;hiT=0}
  if(lowT>1200&&DYN>minD){DYN=Math.max(minD,DYN*.9);lowT=0;applyRes()}else if(hiT>6000&&DYN<1){DYN=Math.min(1,DYN*1.05);hiT=0;applyRes()}}
 if(cfg.q==='auto'){const cur=autoTier(),order=['performance','balanced','high'],i=order.indexOf(cur);
  if(DYN<=minD+.01&&FPSM>target*1.3){slowT+=ms;if(slowT>4000&&i>0){changeAutoTier(order[i-1]);slowT=0}}else slowT=0;
  if(cur!=='high'&&DYN>=1&&FPSM<target*.7){upT+=ms;if(upT>18000&&i>=0&&i<order.length-1){changeAutoTier(order[i+1]);upT=0}}else upT=0}}
const SETS=[
 {k:'q',l:'Quality preset',t:'seg',o:[['auto','Auto'],['low','Performance'],['med','Balanced'],['high','High']]},
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
