// ===== audio (all synthesized with WebAudio) =====
const AU={ctx:null,st:{}},DD=new V(),UPV=new V(0,1,0),now=()=>AU.ctx.currentTime,A=fn=>(...a)=>AU.ctx&&fn(...a);
const mtof=m=>440*Math.pow(2,(m-69)/12),CH=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,64]];
function panOf(p){const rel=p.clone().sub(cam.position).normalize();cam.getWorldDirection(DD);return clamp(rel.dot(DD.clone().cross(UPV).normalize())*.9,-1,1)}
function bus(p,vol=1,wet=.2){const C=AU.ctx,g=C.createGain();let pan=0,lp=20000;
 if(typeof p==='number')pan=p;else if(p){const d=p.distanceTo(cam.position);pan=panOf(p);vol*=Math.min(1,1.6/(1+d/10));lp=Math.max(700,16000/(1+d/25))}
 g.gain.value=vol;let n=g;if(lp<20000){const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;n.connect(f);n=f}
 if(C.createStereoPanner){const s=C.createStereoPanner();s.pan.value=clamp(pan,-1,1);n.connect(s);n=s}
 n.connect(AU.m);const w=C.createGain();w.gain.value=wet;n.connect(w);w.connect(AU.rv);return g}
function nz(d,t,dur,f,q,type,vol,att=.002,f2){const C=AU.ctx,s=C.createBufferSource();s.buffer=AU.nb;s.loop=true;const fl=C.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);fl.Q.value=q;
 if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);const g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.connect(fl);fl.connect(g);g.connect(d);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function tn(d,t,dur,f0,f1,type,vol,att=.003){const C=AU.ctx,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(d);o.start(t);o.stop(t+dur+.05)}
const click=(d,t,f=2800,v=.5)=>{nz(d,t,.04,f,6,'bandpass',v);tn(d,t,.05,f*.5,f*.3,'triangle',v*.4)};
const blp=(d,t,v=.12)=>{const f=rnd(500,1100);tn(d,t,rnd(.06,.12),f,f*rnd(1.6,2.2),'sine',v,.01)};
// [crack hp, crack dur, crack vol, thump hz, thump dur, body hz, body dur, tail dur, tail vol]
const GS={pt:[2200,.07,.6,190,.1,1000,.12,.3,.15],ar:[2500,.08,.8,140,.15,1300,.16,.45,.22],smg:[3200,.06,.6,210,.09,1500,.1,.25,.15],sg:[1800,.1,.8,90,.35,800,.3,.7,.3],sn:[3400,.07,1,115,.45,600,.4,1.4,.35]};
const auShot=A((k,pos)=>{const g=GS[k],t=now(),r=rnd(.94,1.06),d=bus(pos,1,k==='sn'?.55:k==='sg'?.4:.25);
 nz(d,t,g[1],g[0]*r,.8,'highpass',g[2]);nz(d,t,g[6],g[5]*r,.9,'bandpass',g[2]*.7);tn(d,t,g[4],g[3]*r,g[3]*r*.35,'sine',1);nz(d,t+.01,g[7],500,.5,'lowpass',g[8]);
 if(k==='sg'){click(d,t+.5,1400,.5);click(d,t+.66,1900,.5)}if(k==='sn'){click(d,t+.75,1500,.5);click(d,t+.9,2100,.5)}});
const auEmpty=A(()=>{const t=now();if(t-(AU.le||0)<.3)return;AU.le=t;click(bus(0,.8,.1),t,1700,.35)});
const auReload=A(dur=>{const d=bus(0,.8,.2),t=now();click(d,t,1100,.5);nz(d,t+.03,.12,900,1,'bandpass',.2);
 tn(d,t+dur*.55,.08,220,90,'sine',.5);click(d,t+dur*.55,2600,.5);click(d,t+dur*.88,1700,.6);click(d,t+dur*.88+.08,2400,.6)});
const auHit=A((head,dead)=>{const d=bus(0,.9,.1),t=now();tn(d,t,.06,head?2400:1700,head?2000:1300,'sine',.35);tn(d,t,.09,150,70,'sine',.4);
 if(head){tn(d,t+.02,.4,1568,1560,'sine',.25);tn(d,t+.02,.3,3136,3100,'sine',.08)}
 if(dead){tn(d,t+.08,.35,330,165,'triangle',.3);for(let i=0;i<3;i++)blp(d,t+.12+i*.06,.12)}});
const auHurt=A(()=>{const d=bus(0,1,.15),t=now();tn(d,t,.25,110,45,'sine',.9);nz(d,t,.18,700,.6,'lowpass',.5)});
const auWhiz=A(()=>{tn(bus(rnd(-.8,.8),1,.1),now(),.14,rnd(2200,3000),rnd(700,1000),'sine',.1,.01)});
const auPick=A(type=>{const d=bus(0,.85,.35),t=now();
 if(type==='coin'){[[1318,0],[1976,.075]].forEach(([f,o])=>{tn(d,t+o,.5,f,f*.995,'sine',.35,.004);tn(d,t+o,.35,f*2.01,f*2,'sine',.12,.004);tn(d,t+o,.12,f*3.2,f*3,'triangle',.05)});nz(d,t,.03,6000,1,'highpass',.15)}
 else if(type==='gun'){click(d,t,2300,.6);click(d,t+.09,1500,.6);tn(d,t+.05,.18,380,820,'triangle',.18)}
 else if(type==='wall'){[392,587,784].forEach((f,i)=>tn(d,t+i*.07,.5,f,f*1.005,'triangle',.25,.005));nz(d,t,.1,4000,1,'highpass',.1)}else if(type==='dome'){for(let i=0;i<5;i++)blp(d,t+i*.05,.16);tn(d,t+.25,.6,1047,1047,'sine',.22,.01)}else[523,659,784].forEach((f,i)=>{tn(d,t+i*.06,.4,f,f,'sine',.22,.01);tn(d,t+i*.06,.25,f*2,f*2,'sine',.05)})});
const auUse=A(()=>{const d=bus(0,.9,.3),t=now();nz(d,t,.5,2400,.7,'bandpass',.18,.12);for(let i=0;i<4;i++)blp(d,t+.3+i*.08,.14);tn(d,t+.5,.5,880,880,'sine',.15,.01)});
const auBoat=A(on=>{const d=bus(0,.8,.2),t=now();tn(d,t,.15,130,60,'sine',.7);click(d,t,1800,.4);if(on)nz(d,t+.05,.4,300,.7,'lowpass',.3,.1)});
const auDive=A(()=>{const d=bus(0,1,.4),t=now();nz(d,t,.8,2200,.7,'bandpass',.55,.02,350);tn(d,t,.4,160,50,'sine',.6);for(let i=0;i<7;i++)blp(d,t+.1+i*.07,.12)});
const auSurface=A(()=>{const d=bus(0,1,.3),t=now();nz(d,t,.6,600,.6,'bandpass',.35,.05,2500);nz(d,t+.15,.5,3200,.8,'bandpass',.22,.15);for(let i=0;i<3;i++)tn(d,t+.5+i*.17,.09,1700,950,'sine',.07)});
const auUi=A(()=>tn(bus(0,.7,.1),now(),.05,700,1000,'sine',.15));
const auStart=A(()=>{const d=bus(0,.9,.4),t=now();nz(d,t,.8,300,.7,'bandpass',.4,.2,3000);[392,523,659].forEach((f,i)=>tn(d,t+.15+i*.07,1,f,f,'sine',.1,.02))});
const auHorn=A(()=>{const C=AU.ctx,t=now(),f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=500;f.connect(bus(0,1,.5));[98,123.5].forEach(h=>tn(f,t,2,h,h*.99,'sawtooth',.4,.2))});
const auWall=A(kind=>{const d=bus(0,.9,.35),t=now();tn(d,t,.35,90,45,'sine',.7);nz(d,t,.5,500,.8,'bandpass',.25,.15,2400);[880,1175,1568].forEach((f,i)=>tn(d,t+.1+i*.07,.45,f,f*1.01,'triangle',.12,.01));if(kind==='dome')for(let i=0;i<6;i++)blp(d,t+.1+i*.06,.1)});
const auWallHit=A(()=>{const t=now();if(t-(AU.lw||0)<.07)return;AU.lw=t;const d=bus(0,.6,.15);tn(d,t,.08,320,160,'triangle',.3);nz(d,t,.05,3500,2,'bandpass',.12)});
const auWallBreak=A(()=>{const d=bus(0,1,.45),t=now();nz(d,t,.5,1800,.6,'bandpass',.5,.005,300);tn(d,t,.4,140,50,'sine',.6);for(let i=0;i<8;i++)blp(d,t+.05+i*.04,.12)});
const auImpact=A((big,pos)=>{const v=big?1:.6,d=bus(pos||0,big?1:.8,.5),t=now();nz(d,t,.9,2600,.6,'bandpass',.7*v,.01,250);nz(d,t+.02,1.2,500,.5,'lowpass',.5*v,.05,120);tn(d,t,.8,110,28,'sine',.9*v);
 for(let i=0;i<(big?14:6);i++)blp(d,t+.15+i*.05,.12*v);if(big)nz(d,t+.1,.6,5000,1,'highpass',.12,.02)});
const auChute=A(pos=>{const d=bus(pos||0,.9,.3),t=now();nz(d,t,.5,350,.7,'lowpass',.6,.02,120);tn(d,t,.35,90,60,'sine',.4);nz(d,t+.1,.3,2000,.8,'bandpass',.12,.05)});
const auJump=A(()=>{const d=bus(0,.9,.2),t=now();nz(d,t,.8,500,.6,'bandpass',.35,.05,3000);click(d,t,900,.4)});
const auEnd=A(win=>{const d=bus(0,1,.5),t=now();
 if(win)[523,659,784,1047].forEach((f,i)=>{tn(d,t+i*.13,1.2,f,f,'sine',.28,.01);tn(d,t+i*.13,.8,f*2,f*2,'sine',.08,.01)});
 else{[392,330,262,196].forEach((f,i)=>tn(d,t+i*.22,.6,f,f*.98,'triangle',.3,.01));tn(d,t+.6,.7,90,40,'sine',.6)}});
const splash=A((pan=0,v=.14)=>nz(bus(pan,1,.25),now(),.25,2000,.8,'bandpass',v,.04,900));
const kick=A(()=>nz(bus(0,1,.2),now(),.35,500,.7,'lowpass',.16,.12,250));
const breath=A(()=>{const d=bus(0,.55,.3),t=now();nz(d,t,.55,3600,.9,'bandpass',.18,.3,2400);nz(d,t+.7,.7,1200,.5,'bandpass',.14,.02,500);for(let i=0;i<6;i++)blp(d,t+.75+i*rnd(.05,.12),.1)});
const beat=A(()=>{const d=bus(0,.8,.1),t=now();tn(d,t,.14,75,42,'sine',.7);tn(d,t+.2,.12,65,38,'sine',.5)});
const alarm=A(()=>{const d=bus(0,.6,.1),t=now();tn(d,t,.1,1700,1700,'square',.07);tn(d,t+.14,.1,1400,1400,'square',.07)});
const zbeep=A(()=>tn(bus(0,.6,.1),now(),.09,740,740,'square',.08));
function mkEng(){const C=AU.ctx,g=C.createGain();g.gain.value=0;const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=300;f.Q.value=2;
 const o1=C.createOscillator(),o2=C.createOscillator();o1.type='sawtooth';o2.type='square';o1.frequency.value=40;o2.frequency.value=80;
 const lf=C.createOscillator(),lg=C.createGain();lf.frequency.value=11;lg.gain.value=.03;lf.connect(lg);lg.connect(g.gain);
 const pn=C.createStereoPanner?C.createStereoPanner():null;o1.connect(f);o2.connect(f);f.connect(g);if(pn){g.connect(pn);pn.connect(AU.m)}else g.connect(AU.m);
 const s=C.createBufferSource();s.buffer=AU.nb;s.loop=true;const hp=C.createBiquadFilter();hp.type='highpass';hp.frequency.value=800;const wg=C.createGain();wg.gain.value=0;s.connect(hp);hp.connect(wg);wg.connect(AU.m);
 o1.start();o2.start();lf.start();s.start();return{o1,o2,f,g,pn,wg}}
function engUpd(e,sp,vol,pan,t){const a=Math.abs(sp);e.o1.frequency.setTargetAtTime(38+a*2.6,t,.1);e.o2.frequency.setTargetAtTime(76+a*5.2,t,.1);e.f.frequency.setTargetAtTime(260+a*28,t,.1);
 e.g.gain.setTargetAtTime(vol*(.09+.07*a/20),t,.12);e.wg.gain.setTargetAtTime(vol*Math.min(1,a/26)*.16,t,.15);if(e.pn)e.pn.pan.setTargetAtTime(pan,t,.1)}
function pad(f,t,dur){const C=AU.ctx;[-5,5].forEach(c=>{const o=C.createOscillator(),g=C.createGain();o.type='triangle';o.frequency.value=f;o.detune.value=c;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+1.5);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+dur+.1)})}
function bar(){if(!AU.ctx||started)return;const t=now()+.05,ch=CH[AU.bar++%4];ch.forEach(n=>pad(mtof(n),t,4.6));
 [0,1,2,3,2,1,2,3].forEach((j,i)=>{const f=mtof(ch[j]+12),tt=t+i*.5;tn(AU.mus,tt,1.4,f,f,'sine',.05,.01);tn(AU.mus,tt,.5,f*2.76,f*2.7,'sine',.015,.01)})}
function sndLabel(){$('snd').textContent=!AU.ctx?'Sound: click to enable':'Sound: '+(cfg.snd?'on (M)':'off (M)')}
function auInit(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
 const C=AU.ctx=new(window.AudioContext||window.webkitAudioContext)();
 AU.m=C.createGain();AU.m.gain.value=cfg.snd?.85:0;AU.uw=C.createBiquadFilter();AU.uw.type='lowpass';AU.uw.frequency.value=20000;
 const cp=C.createDynamicsCompressor();cp.threshold.value=-16;cp.ratio.value=5;AU.m.connect(AU.uw);AU.uw.connect(cp);cp.connect(C.destination);
 const len=C.sampleRate*1.8|0,ib=C.createBuffer(2,len,C.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
 AU.rv=C.createConvolver();AU.rv.buffer=ib;const rg=C.createGain();rg.gain.value=.5;AU.rv.connect(rg);rg.connect(AU.uw);
 const N=C.sampleRate*2|0,nbf=C.createBuffer(1,N,C.sampleRate),nd=nbf.getChannelData(0);for(let i=0;i<N;i++)nd[i]=Math.random()*2-1;AU.nb=nbf;
 const ln=(f,q,ty)=>{const s=C.createBufferSource();s.buffer=nbf;s.loop=true;const fl=C.createBiquadFilter();fl.type=ty;fl.frequency.value=f;fl.Q.value=q;const g=C.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(AU.m);s.start();return g};
 AU.aS=ln(550,.4,'bandpass');AU.aD=ln(160,.5,'lowpass');
 const lf=C.createOscillator(),lg=C.createGain();lf.frequency.value=.13;lg.gain.value=.03;lf.connect(lg);lg.connect(AU.aS.gain);lf.start();
 const dr=C.createOscillator(),dg=C.createGain();dr.frequency.value=52;dg.gain.value=.05;dr.connect(dg);dg.connect(AU.aD);dr.start();
 AU.e1=mkEng();AU.e2=mkEng();
 AU.mus=C.createGain();AU.mus.gain.value=.55;const mf=C.createBiquadFilter();mf.type='lowpass';mf.frequency.value=2600;AU.mus.connect(mf);mf.connect(AU.m);const ms=C.createGain();ms.gain.value=.6;mf.connect(ms);ms.connect(AU.rv);
 AU.bar=0;bar();setInterval(bar,4000);sndLabel()}
function auMute(){if(!AU.ctx){auInit();return}cfg.snd=!cfg.snd;AU.m.gain.setTargetAtTime(cfg.snd?.85:0,now(),.05);sndLabel();save()}
function auUpdate(dt){const C=AU.ctx;if(!C)return;const t=C.currentTime,S=AU.st,cy=cam.position.y,u=cy<-.3;
 AU.aS.gain.setTargetAtTime(u?0:.07,t,.3);AU.aD.gain.setTargetAtTime(u?.15:0,t,.3);AU.uw.frequency.setTargetAtTime(u?1100-clamp(-cy/45,0,1)*650:20000,t,.08);
 engUpd(AU.e1,P.boat?P.boat.sp:P.ph==='plane'?20:0,P.boat?1:P.ph==='plane'?.7:0,0,t);
 let nbt=null,nd=150;for(const q of boats){if(!q.rider||q.rider===P)continue;const d=q.pos.distanceTo(cam.position);if(d<nd){nd=d;nbt=q}}
 engUpd(AU.e2,nbt?nbt.sp:0,nbt?0.9/(1+nd/30):0,nbt?panOf(nbt.pos):0,t);
 if(!running)return;
 if(P.ph!=='play'){if(P.ph==='fall'||P.ph==='dive'){S.wd=(S.wd||0)-dt;if(S.wd<=0){S.wd=.18;nz(bus(0,.7,.1),t,.35,900+Math.abs(P.vy)*25,.6,'highpass',.05+Math.abs(P.vy)*.0045,.1)}}return}
 const sub=P.pos.y<-1.2&&!P.boat,mk=!!(swimActive||keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||keys.Space||keys.KeyC||JOY.m||TUP||TDN),md=P.boat?3:sub?2:mk?1:0;
 if(S.ws===undefined)S.ws=sub;if(sub&&!S.ws)auDive();if(!sub&&S.ws&&!P.boat)auSurface();S.ws=sub;
 const tk=(k,iv,fn)=>{S[k]=(S[k]||0)-dt;if(S[k]<=0){S[k]=iv;fn()}};
 if(md===1)tk('sw',.55,()=>{S.sd=-(S.sd||1);splash(S.sd*.3)});
 if(md===2&&mk)tk('kk',.6,kick);if(md===0)tk('tr',.9,()=>splash(0,.06));
 if(sub){tk('br',3.8,breath);tk('bb',2.2,()=>blp(bus(rnd(-.4,.4),.5,.3),now(),.1))}
 if(P.hp<35&&P.hp>0)tk('hb',.95,beat);if(sub&&P.o2<25)tk('al',.75,alarm);if(zoneOutside(P.pos.x,P.pos.z))tk('zb',.9,zbeep)}
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,e=>{if(e.target.id==='snd'||e.code==='KeyM')return;auInit()}));
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&AU.ctx&&b.id!=='start'&&b.id!=='snd')auUi()});
$('snd').onclick=()=>auMute();
