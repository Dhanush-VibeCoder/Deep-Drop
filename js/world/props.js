// ===== marine life: instanced, procedurally modelled species with shader-driven swimming =====
const FT={value:0};
function fishMat(glsl,basic){const m=basic?new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=FT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);float ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.21;'+glsl)};return m}
function paint(g,c){const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c[0];a[i*3+1]=c[1];a[i*3+2]=c[2]}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g}
function merge(gs){const P_=[],N_=[],C_=[],I_=[];let o=0;for(const g of gs){P_.push(...g.attributes.position.array);N_.push(...g.attributes.normal.array);C_.push(...g.attributes.color.array);for(const i of g.index.array)I_.push(i+o);o+=g.attributes.position.count}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P_,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N_,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C_,3));r.setIndex(I_);return r}
function fishGeo(o){const b=new THREE.SphereGeometry(1,16,12),pa=b.attributes.position,col=[],tp=o.taper===undefined?1:o.taper;
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),p=(x+1)/2,f=1-(1-(.28+.72*Math.min(1,p*1.7)))*tp;col.push(...o.col(p,y,z));pa.setXYZ(i,x,y*o.H*f,z*o.W*f)}
 b.setAttribute('color',new THREE.Float32BufferAttribute(col,3));b.computeVertexNormals();
 const parts=[b],tc=o.tc,fin=(r,h)=>paint(new THREE.ConeGeometry(r,h,3),tc);
 const tl=fin(o.tail[0],o.tail[1]);tl.scale(1,1,.1);tl.rotateZ(-Math.PI/2);tl.translate(-.85-o.tail[1]/2,0,0);parts.push(tl);
 const dg=fin(o.dorsal[0],o.dorsal[1]);dg.scale(1,1,.1);dg.rotateZ(.35);dg.translate(-.05,o.H*.8+o.dorsal[1]*.35,0);parts.push(dg);
 if(o.pect)for(const s of[1,-1]){const pg=fin(.22,o.pect);pg.scale(1,1,.1);pg.rotateX(s*(Math.PI/2+.5));pg.translate(.25,-o.H*.35,s*o.W*.8);parts.push(pg)}
 for(const s of[1,-1]){const e=paint(new THREE.SphereGeometry(Math.max(.05,o.H*.14),6,5),[.02,.02,.04]);e.translate(.72,o.H*.25,s*o.W*.62);parts.push(e)}
 return merge(parts)}
function mantaGeo(){const b=new THREE.SphereGeometry(1,28,12),pa=b.attributes.position,col=[];
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),a=Math.abs(z);col.push(...(y>0?(a<.25&&x>0?[.9,.92,.95]:[.06,.1,.2]):[.92,.94,.97]));pa.setXYZ(i,x*.8-a*.45,y*.12*(1-.7*a),z*2)}
 b.setAttribute('color',new THREE.Float32BufferAttribute(col,3));b.computeVertexNormals();
 const t=paint(new THREE.ConeGeometry(.035,1.8,5),[.06,.1,.2]);t.rotateZ(Math.PI/2);t.translate(-1.6,0,0);return merge([b,t])}
function jellyGeo(){const parts=[paint(new THREE.SphereGeometry(.6,18,10,0,Math.PI*2,0,Math.PI*.55),[1,1,1])];
 for(let k=0;k<8;k++){const a=k/8*6.283,t=paint(new THREE.CylinderGeometry(.018,.01,1.3,5),[.9,.9,1]);t.translate(Math.cos(a)*.35,-.7,Math.sin(a)*.35);parts.push(t)}
 for(let k=0;k<3;k++){const a=k*2.1,t=paint(new THREE.CylinderGeometry(.05,.02,.9,6),[1,.95,1]);t.translate(Math.cos(a)*.1,-.5,Math.sin(a)*.1);parts.push(t)}return merge(parts)}
const FA=fishMat('float k=clamp(.5-position.x*.55,0.,1.);transformed.z+=sin(uT*9.-position.x*3.+ph)*.11*k*k;'),
 FB=fishMat('float k=clamp(.5-position.x*.55,0.,1.);transformed.z+=sin(uT*4.5-position.x*2.+ph)*.1*k*k;'),
 FW=fishMat('transformed.y+=sin(uT*1.8-abs(position.z)*1.5+ph)*abs(position.z)*.28;'),
 FJ=fishMat('float s=1.+.16*sin(uT*3.+ph);transformed.xz*=mix(1.,s,smoothstep(-.15,.3,position.y));transformed.xz+=vec2(sin(uT*2.5+position.y*5.+ph),cos(uT*2.2+position.y*4.+ph))*.05*smoothstep(0.,-1.,position.y);',true);
const SPC={
 sar:{geo:()=>fishGeo({H:.34,W:.2,col:(p,y)=>y>.15?[.2,.45,.62]:[.86,.9,.95],tail:[.3,.5],dorsal:[.15,.25],tc:[.75,.85,.92]}),mat:FA,sc:.3,sp:5.5,r:2.4,fo:3.5,flee:1},
 clo:{geo:()=>fishGeo({H:.5,W:.36,col:p=>(p>.6&&p<.7)||(p>.28&&p<.36)?[.96,.96,.94]:[1,.45,.08],tail:[.35,.5],dorsal:[.3,.4],tc:[1,.45,.08]}),mat:FA,sc:.17,sp:.9,r:1.4,fo:2,flee:1},
 tan:{geo:()=>fishGeo({H:.55,W:.22,col:(p,y)=>y<.2&&y>-.4&&p>.25?[.02,.05,.15]:[.1,.33,.95],tail:[.4,.5],dorsal:[.3,.4],tc:[1,.85,.1]}),mat:FA,sc:.32,sp:3,r:3,fo:3,flee:1},
 ang:{geo:()=>fishGeo({H:1.35,W:.28,col:(p,y)=>p>.62&&p<.74?[.05,.05,.08]:y>.5?[.95,.7,.1]:[1,.88,.2],tail:[.45,.5],dorsal:[.4,.8],tc:[.95,.75,.15]}),mat:FA,sc:.36,sp:1.5,r:1.8,fo:2.5,flee:1},
 pfr:{geo:()=>fishGeo({H:.95,W:.95,taper:.25,col:(p,y,z)=>y<-.45?[.97,.93,.8]:((Math.floor(p*9+(y+1)*3.3)+Math.floor((z+1)*3))%2?[.45,.33,.15]:[.92,.82,.5]),tail:[.3,.4],dorsal:[.2,.25],tc:[.7,.58,.3]}),mat:FA,sc:.38,sp:1.2,r:1,fo:2,flee:1},
 tun:{geo:()=>fishGeo({H:.38,W:.3,col:(p,y)=>y<-.05?[.82,.86,.9]:[.07,.15,.32],tail:[.6,.9],dorsal:[.18,.4],pect:.6,tc:[.07,.13,.28]}),mat:FB,sc:1.1,sp:9,r:0,fo:9,turn:.6},
 shk:{geo:()=>fishGeo({H:.24,W:.24,col:(p,y)=>y<-.2?[.92,.94,.95]:[.36,.41,.48],tail:[.7,1.1],dorsal:[.3,.7],pect:.9,tc:[.33,.38,.45]}),mat:FB,sc:2.4,sp:4,r:0,fo:9,turn:.45},
 man:{geo:mantaGeo,mat:FW,sc:1.1,sp:2.5,r:0,fo:9,turn:.4},
 jel:{geo:jellyGeo,mat:FJ,sc:.9,sp:.7,r:3,fo:5,jelly:1,turn:.5}};
const SPAWN=[['sar',18,'open',5],['clo',4,'reef',9],['tan',7,'open',5],['ang',3,'reef',9],['pfr',1,'open',9],['tun',1,'open',7],['shk',1,'open',4],['man',1,'open',3],['jel',3,'deep',9]];
const FG=[],FMesh={},fcnt={},JC=[0xff7ad9,0x66f0ff,0xa88bff,0xffd36b];
function pickT(reg,zi){let x,z,y;if(reg==='open'){const a=rnd(0,6.28),r=Math.sqrt(Math.random())*280;x=Math.cos(a)*r;z=Math.sin(a)*r}
 else{const[a,b]=ZONES[zi%ZONES.length],ang=rnd(0,6.28),r=Math.sqrt(Math.random())*(reg==='reef'?38:30);x=a+Math.cos(ang)*r;z=b+Math.sin(ang)*r}
 const d=depthAt(x,z);y=reg==='reef'?d+rnd(1.5,5):reg==='deep'?-rnd(6,Math.max(8,-d-2)):-rnd(4,28);y=Math.max(y,d+1.5);return new V(x,Math.min(y,-2),z)}
(function buildFish(){const tot={};SPAWN.forEach(([sp,n,,g])=>tot[sp]=(tot[sp]||0)+n*g);
 for(const sp in SPC){const S=SPC[sp],m=new THREE.InstancedMesh(S.geo(),S.mat,tot[sp]);m.frustumCulled=false;
  for(let i=0;i<tot[sp];i++){const b=rnd(.85,1.1),c=S.jelly?new THREE.Color(JC[i%4]):new THREE.Color(b,b,b*rnd(.95,1.05));m.setColorAt(i,c)}
  m.instanceColor.needsUpdate=true;scene.add(m);FMesh[sp]=m;fcnt[sp]=0}
 SPAWN.forEach(([sp,n,reg,gc])=>{for(let k=0;k<gc;k++){const S=SPC[sp],g={sp,reg,zi:k,c:pickT(reg,k),tgt:pickT(reg,k),d:new V(1,0,0),f:[],ang:0,q:Math.random(),hid:false};
  for(let i=0;i<n;i++){const o=new V(rnd(-1,1),rnd(-.6,.6),rnd(-1,1)).multiplyScalar(S.r);g.f.push({o,ph:rnd(0,6.28),p:g.c.clone().add(o),f:new V(1,0,0),sc:S.sc*rnd(.85,1.15),idx:fcnt[sp]++})}FG.push(g)}})})();
const _tg=new V(),_v=new V(),_u=new V(),_s=new V(),_sv=new V(),_m=new THREE.Matrix4(),_UP=new V(0,1,0);
function fishUpdate(dt,t){FT.value=t;if(dt<=0)return;
 for(const g of FG){const S=SPC[g.sp];if(g.q>FQ){if(!g.hid){g.hid=true;const mesh=FMesh[g.sp];_m.makeScale(0,0,0);for(const f of g.f)mesh.setMatrixAt(f.idx,_m);mesh.instanceMatrix.needsUpdate=true}continue}g.hid=false;let spd=S.sp;const dp=g.c.distanceTo(P.pos);
  if(S.flee&&dp<10){g.tgt.copy(g.c).sub(P.pos).setY(0).normalize().multiplyScalar(35).add(g.c);spd*=1.9}
  else if(g.sp==='shk'&&P.pos.y<-1.2&&dp<70){g.ang+=dt*.6;g.tgt.set(P.pos.x+Math.cos(g.ang)*16,P.pos.y+Math.sin(g.ang*.5)*3,P.pos.z+Math.sin(g.ang)*16)}
  else if(g.c.distanceToSquared(g.tgt)<16)g.tgt.copy(pickT(g.reg,g.zi));
  if(Math.hypot(g.c.x,g.c.z)>330)g.tgt.set(0,g.tgt.y,0);
  _tg.copy(g.tgt).sub(g.c).normalize();g.d.lerp(_tg,Math.min(1,dt*(S.turn||.9))).normalize();
  g.c.addScaledVector(g.d,spd*dt);g.c.y=clamp(g.c.y,depthAt(g.c.x,g.c.z)+1.2,-1.5);
  const mesh=FMesh[g.sp],w=S.r;
  for(const f of g.f){_tg.set(f.o.x+Math.sin(t*.7+f.ph)*w*.25,f.o.y+Math.sin(t*.9+f.ph*1.3)*w*.15,f.o.z+Math.cos(t*.6+f.ph)*w*.25).add(g.c);
   _v.copy(f.p);f.p.lerp(_tg,Math.min(1,dt*S.fo));f.p.y=Math.max(f.p.y,depthAt(f.p.x,f.p.z)+.6);fishPush(f.p);
   _sv.set(f.sc,f.sc,f.sc);
   if(S.jelly){_m.makeRotationY(f.ph+t*.1);_m.scale(_sv);_m.setPosition(f.p)}
   else{_v.subVectors(f.p,_v);const vl=_v.length()/dt;f.f.lerp(vl>.25?_v.normalize():g.d,Math.min(1,dt*6)).normalize();
    if(Math.abs(f.f.y)>.97)_u.set(1,0,0);else _u.copy(_UP).addScaledVector(f.f,-f.f.y).normalize();
    _s.crossVectors(f.f,_u);_m.makeBasis(f.f,_u,_s);_m.scale(_sv);_m.setPosition(f.p)}
   mesh.setMatrixAt(f.idx,_m)}
  mesh.instanceMatrix.needsUpdate=true}}

// Static collision, boat physics, entity collisions, corpses, and loot motion.
// ===== physics: terrain, props, ship hull, momentum, boats, ragdolls =====
const COL=[],COLZ=ZONES.map(()=>[]),LAND=[],corpses=[];
const _l=new V(),_l2=new V(),_n=new V(),_q=new V(),_rd=new V(),_ro=new V(),_cur=new V(),_tv=new V(),_rt2=new V(),_bf=new V(),_br=new V(),_q4=new THREE.Quaternion();
function zoneNear(x,z){let bi=-1,bd=85;for(let i=0;i<ZONES.length;i++){const d=Math.hypot(x-ZONES[i][0],z-ZONES[i][1]);if(d<bd){bd=d;bi=i}}return bi}
function addC(c){const zi=zoneNear(c.x!==undefined?c.x:c.cx,c.z!==undefined?c.z:c.cz);(zi<0?COL:COLZ[zi]).push(c)}
const cylC=(x,z,y0,y1,r)=>addC({t:'c',x,z,y0,y1,r}),sphC=(x,y,z,r)=>addC({t:'s',x,y,z,r}),boxC=(cx,cy,cz,hx,hy,hz)=>addC({t:'b',cx,cy,cz,hx,hy,hz});
const current=(x,z,t)=>_cur.set(Math.sin(z*.012+t*.12)*.8+Math.sin(x*.02-t*.05)*.4,0,Math.cos(x*.011+t*.1)*.8);
function slide(v,n){if(!v)return;const vn=v.dot(n);if(vn<0)v.addScaledVector(n,-vn*1.15)}
function pushShore(c,p,r){if(p.y<c.y0||p.y>c.y1)return false;const a=Math.atan2(p.z,p.x),R=c.r0+c.a1*Math.sin(a*2.1+c.p1)+c.a2*Math.sin(a*5.3+c.p2),d=Math.hypot(p.x,p.z),lim=Math.max(.1,R-r);if(d<=lim)return false;if(d<1e-5){p.x=lim;_n.set(-1,0,0);return true}p.x*=lim/d;p.z*=lim/d;_n.set(-p.x,0,-p.z).normalize();return true}
// push a sphere (p, r) out of a static collider; leaves the contact normal in _n
function pushC(c,p,r){if(c.t==='shore')return pushShore(c,p,r);let dx,dy,dz,d,k;
 if(c.t==='c'||c.t==='s'){const qy=c.t==='c'?clamp(p.y,c.y0,c.y1):c.y;dx=p.x-c.x;dy=p.y-qy;dz=p.z-c.z;d=Math.sqrt(dx*dx+dy*dy+dz*dz);const R=c.r+r;if(d>=R)return false;
  if(d<1e-5){dx=1;dy=0;dz=0;d=1}k=(R-d)/d;p.x+=dx*k;p.y+=dy*k;p.z+=dz*k;_n.set(dx,dy,dz).normalize();return true}
 const qx=clamp(p.x,c.cx-c.hx,c.cx+c.hx),qy=clamp(p.y,c.cy-c.hy,c.cy+c.hy),qz=clamp(p.z,c.cz-c.hz,c.cz+c.hz);dx=p.x-qx;dy=p.y-qy;dz=p.z-qz;d=Math.sqrt(dx*dx+dy*dy+dz*dz);
 if(d>=r)return false;
 if(d>1e-5){k=(r-d)/d;p.x+=dx*k;p.y+=dy*k;p.z+=dz*k;_n.set(dx,dy,dz).normalize();return true}
 const ex=c.hx-Math.abs(p.x-c.cx),ey=c.hy-Math.abs(p.y-c.cy),ez=c.hz-Math.abs(p.z-c.cz);
 if(ex<=ey&&ex<=ez){const s=p.x>=c.cx?1:-1;p.x+=s*(ex+r);_n.set(s,0,0)}else if(ey<=ez){const s=p.y>=c.cy?1:-1;p.y+=s*(ey+r);_n.set(0,s,0)}else{const s=p.z>=c.cz?1:-1;p.z+=s*(ez+r);_n.set(0,0,s)}return true}
// the old wreck: elliptical hull shell with the two breaches left open, plus a deck plate
function shipCollide(p,r,prev,v,boat,who){if(!SHIP)return false;const hl=35,B=9.5,D=8;_l.copy(p);SHIP.worldToLocal(_l);
 if(Math.abs(_l.x)>hl+3||_l.y>2.5||_l.y<-D-2||Math.abs(_l.z)>B+3)return false;
 const ux=_l.x/hl,f=1-Math.pow(Math.max(0,Math.min(1,ux)),2.6)*.92,hb=Math.max(B*f,.9);
 const divingOffDeck=!boat&&who===P&&diveAction===1&&v&&v.y<0;
 if(!divingOffDeck&&!boat&&_l.y>-r&&_l.y<.6&&(ux*ux+(_l.z/hb)*(_l.z/hb))<1){let below;if(prev){_l2.copy(prev);SHIP.worldToLocal(_l2);below=_l2.y<.05}else below=_l.y<.05;
  _l.y=below?-r:.05+r;SHIP.localToWorld(_l);p.copy(_l);if(v)v.y*=-.1;return true}
 if(_l.y>0)return false;
 const uy=_l.y/D,uz=_l.z/hb,m=Math.sqrt(ux*ux+uy*uy+uz*uz);if(m<1e-4)return false;
 const bx=ux/m,by=uy/m,bz=uz/m;
 if((bx>-.05&&bx<.46&&Math.abs(bz)>.42&&by>-.72&&by<-.05)||(bx>-.68&&bx<-.22&&bz>.38&&by>-.62&&by<-.03))return false;
 const sx=bx*hl,sy=by*D,sz=bz*hb,gap=Math.hypot(_l.x-sx,_l.y-sy,_l.z-sz);if(gap>=r)return false;
 const sd=m>1?1:-1;_n.set(ux/(hl*hl),uy/(D*D),uz/(hb*hb)).normalize();_l.set(sx+_n.x*sd*r,sy+_n.y*sd*r,sz+_n.z*sd*r);
 SHIP.localToWorld(_l);p.copy(_l);_n.multiplyScalar(sd).applyQuaternion(SHIP.quaternion);slide(v,_n);return true}
function collideWorld(p,r,v,prev,who,boat){let hit=false;
 if(!boat){for(const c of COL)if(pushC(c,p,r)){hit=true;slide(v,_n)}
  const zi=zoneNear(p.x,p.z);if(zi>=0){const L=COLZ[zi];for(let i=0;i<L.length;i++)if(pushC(L[i],p,r)){hit=true;slide(v,_n)}}
  const dm=depthAt(p.x,p.z)+1;if(p.y<dm){p.y=dm;if(v&&v.y<0)v.y*=-.1}}
 for(const c of LAND)if(pushC(c,p,r)){hit=true;slide(v,_n)}
 if(shipCollide(p,r,prev,v,boat,who))hit=true;
 _q.copy(p);if(wallCollide(p,r,prev,boat,who)){hit=true;if(v){_n.copy(p).sub(_q).normalize();slide(v,_n)}}
 return hit}
function fishPush(p){const zi=zoneNear(p.x,p.z);if(zi<0)return;const L=COLZ[zi];for(let i=0;i<L.length;i++)pushC(L[i],p,.6)}
// ---- ray queries so bullets stop on rocks, props, seabed and the ship ----
function rayC(c,o,d,mx){
 if(c.t==='shore'){const a=d.x*d.x+d.z*d.z;if(a<1e-8)return -1;const b=o.x*d.x+o.z*d.z,cc=o.x*o.x+o.z*o.z-c.r0*c.r0,disc=b*b-a*cc;if(disc<0)return -1;const t=(-b+Math.sqrt(disc))/a;return t>=0&&t<=mx&&o.y+d.y*t>=c.y0&&o.y+d.y*t<=c.y1?t:-1}
 if(c.t==='c'){const ox=o.x-c.x,oz=o.z-c.z,a=d.x*d.x+d.z*d.z;if(a<1e-8)return -1;const b=ox*d.x+oz*d.z,cc=ox*ox+oz*oz-c.r*c.r,disc=b*b-a*cc;if(disc<0)return -1;
  const t=(-b-Math.sqrt(disc))/a;if(t<0||t>mx)return -1;const y=o.y+d.y*t;return y>=c.y0&&y<=c.y1?t:-1}
 if(c.t==='s'){const ox=o.x-c.x,oy=o.y-c.y,oz=o.z-c.z,b=ox*d.x+oy*d.y+oz*d.z,cc=ox*ox+oy*oy+oz*oz-c.r*c.r,disc=b*b-cc;if(disc<0)return -1;const t=-b-Math.sqrt(disc);return t>=0&&t<=mx?t:-1}
 let t0=0,t1=mx;for(const[ax,oc,h]of[['x',o.x-c.cx,c.hx],['y',o.y-c.cy,c.hy],['z',o.z-c.cz,c.hz]]){const dd=d[ax];if(Math.abs(dd)<1e-8){if(Math.abs(oc)>h)return -1}
  else{let a=(-h-oc)/dd,b2=(h-oc)/dd;if(a>b2){const q=a;a=b2;b2=q}t0=Math.max(t0,a);t1=Math.min(t1,b2);if(t0>t1)return -1}}return t0}
function rayShip(o,d,mx){const hl=35,B=8.55,D=8;_ro.copy(o);SHIP.worldToLocal(_ro);_rd.copy(d).applyQuaternion(_q4.copy(SHIP.quaternion).conjugate());let best=-1;
 const ax=1/hl,ay=1/D,az=1/B,ox=_ro.x*ax,oy=_ro.y*ay,oz=_ro.z*az,dx=_rd.x*ax,dy=_rd.y*ay,dz=_rd.z*az,a=dx*dx+dy*dy+dz*dz,b=ox*dx+oy*dy+oz*dz,c=ox*ox+oy*oy+oz*oz-1,disc=b*b-a*c;
 if(disc>=0){const sq=Math.sqrt(disc);for(const t of[(-b-sq)/a,(-b+sq)/a]){if(t<0||t>mx)continue;const hx=_ro.x+_rd.x*t,hy=_ro.y+_rd.y*t,hz=_ro.z+_rd.z*t;if(hy>0)continue;
   const ux=hx/hl,uy=hy/D,uz=hz/(9.5*Math.max(.1,1-Math.pow(Math.max(0,Math.min(1,ux)),2.6)*.92));
   if(!((ux>0&&ux<.43&&Math.abs(uz)>.45&&uy>-.7&&uy<-.08)||(ux>-.65&&ux<-.25&&uz>.4&&uy>-.6&&uy<-.05))){best=t;break}}}
 if(Math.abs(_rd.y)>1e-6){const t=(.05-_ro.y)/_rd.y;if(t>=0&&t<mx&&(best<0||t<best)){const hx=_ro.x+_rd.x*t,hz=_ro.z+_rd.z*t;if((hx/hl)*(hx/hl)+(hz/9)*(hz/9)<1)best=t}}
 return best}
function rayWorld(o,d,mx){let best=-1;const test=t=>{if(t>=0&&t<mx&&(best<0||t<best))best=t};
 for(const c of COL)test(rayC(c,o,d,mx));
 for(const c of LAND)test(rayC(c,o,d,mx));
 for(let i=0;i<ZONES.length;i++){if(Math.hypot(o.x-ZONES[i][0],o.z-ZONES[i][1])<mx+85)for(const c of COLZ[i])test(rayC(c,o,d,mx))}
 for(let s=3;s<mx;s+=3){const x=o.x+d.x*s,y=o.y+d.y*s,z=o.z+d.z*s;if(y<depthAt(x,z)+.2){test(s-1.5);break}}
 if(SHIP)test(rayShip(o,d,mx));return best}
function impactFx(p){burst(p,3,0xcfeaf5,.15);auWallHit()}
// ---- boats: thrust, hull drag, keel, torque steering, wave buoyancy, current ----
function boatPhys(q,dt,thr,str){const t=performance.now()/1000,f=_bf.set(-Math.sin(q.h),0,-Math.cos(q.h)),rt=_br.set(Math.cos(q.h),0,-Math.sin(q.h));
 let vf=q.vel.dot(f),vl=q.vel.dot(rt);
 vf+=thr*(thr>0?15:8)*(vf<(thr>0?24:-6)?1:.2)*dt;vf-=vf*(.35+.012*Math.abs(vf))*dt;vl-=vl*Math.min(1,3.2*dt);
 q.vel.copy(f).multiplyScalar(vf).addScaledVector(rt,vl);const cu=current(q.pos.x,q.pos.z,t);q.vel.x+=cu.x*.25*dt;q.vel.z+=cu.z*.25*dt;
 q.av+=(str*1.5*clamp(Math.abs(vf)/9,0,1)*(vf>=0?1:-1)-q.av)*Math.min(1,dt*3);q.h+=q.av*dt;q.pos.addScaledVector(q.vel,dt);
 const r=Math.hypot(q.pos.x,q.pos.z);if(r>370){q.pos.x*=370/r;q.pos.z*=370/r;q.vel.multiplyScalar(.5)}
 if(collideWorld(q.pos,2.2,q.vel,null,null,true))q.av*=.7;
 const s=Math.sin(q.h),c=Math.cos(q.h),W=(lx,lf)=>waveY(q.pos.x+lx*c-lf*s,q.pos.z-lx*s-lf*c,t),wb=W(0,3.5),ws=W(0,-3.5),wp=W(-1.4,0),wt=W(1.4,0);
 const pt=Math.atan2(wb-ws,7)+thr*.03,rl=Math.atan2(wt-wp,2.8)-q.av*.08*Math.min(1,Math.abs(vf)/15);
 q.pt+=(pt-q.pt)*Math.min(1,dt*5);q.rl+=(rl-q.rl)*Math.min(1,dt*5);q.pos.y+=(.25+(wb+ws+wp+wt)/4-q.pos.y)*Math.min(1,dt*6);
 q.m.rotation.set(q.pt,q.h,q.rl);q.sp=q.vel.dot(f)}
// ---- body-to-body collisions: swimmers, boat hulls (ramming), boats ----
function entityCollide(dt){const ents=[];if(P.ph==='play'&&!P.boat)ents.push(P);for(const b of bots)if(b.alive&&b.ph==='play'&&!b.boat)ents.push(b);
 for(const e of ents)if(e.rm>0)e.rm-=dt;
 for(let i=0;i<ents.length;i++)for(let j=i+1;j<ents.length;j++){const a=ents[i],b=ents[j];_tv.copy(b.pos).sub(a.pos);const dd=_tv.length();if(dd>=1.8)continue;
  if(dd<1e-4)_tv.set(1,0,0);else _tv.divideScalar(dd);const ov=1.8-dd;a.pos.addScaledVector(_tv,-ov/2);b.pos.addScaledVector(_tv,ov/2);
  const vr=(b.v.x-a.v.x)*_tv.x+(b.v.y-a.v.y)*_tv.y+(b.v.z-a.v.z)*_tv.z;if(vr<0){const j2=-1.3*vr/2;a.v.addScaledVector(_tv,-j2);b.v.addScaledVector(_tv,j2)}}
 for(const q of boats){const cs=Math.cos(q.h),sn=Math.sin(q.h);
  for(const e of ents){const dx=e.pos.x-q.pos.x,dz=e.pos.z-q.pos.z,dy=e.pos.y-q.pos.y;if(Math.abs(dx)+Math.abs(dz)>9||dy>3.2||dy<-2.2)continue;
   const lx=dx*cs-dz*sn,lf=-dx*sn-dz*cs,R=.9,hx=1.5+R,lo=-3.5-R,hi=6.2+R;if(Math.abs(lx)>=hx||lf<=lo||lf>=hi)continue;
   const px=hx-Math.abs(lx),pf1=lf-lo,pf2=hi-lf,pf=Math.min(pf1,pf2);let nx,nz,pen;
   if(px<pf){nx=lx>=0?cs:-cs;nz=lx>=0?-sn:sn;pen=px}else{const sg=pf1<pf2?-1:1;nx=-sg*sn;nz=-sg*cs;pen=pf}
   e.pos.x+=nx*pen;e.pos.z+=nz*pen;const vrel=(e.v.x-q.vel.x)*nx+(e.v.z-q.vel.z)*nz;
   if(vrel<0){const j=-1.25*vrel/(1/80+1/500);e.v.x+=nx*j/80;e.v.z+=nz*j/80;q.vel.x-=nx*j/500;q.vel.z-=nz*j/500;
    const sp=-vrel;if(sp>9&&!(e.rm>0)){e.rm=.6;const dm=Math.round((sp-9)*2.4);if(e===P){hurt(dm);msg('Hit by a boat!')}else e.hp-=dm}}}}
 for(let i=0;i<boats.length;i++)for(let j=i+1;j<boats.length;j++){const a=boats[i],b=boats[j];_tv.set(b.pos.x-a.pos.x,0,b.pos.z-a.pos.z);const dd=_tv.length();if(dd>=7)continue;
  if(dd<1e-4)_tv.set(1,0,0);else _tv.divideScalar(dd);const ov=7-dd;a.pos.addScaledVector(_tv,-ov/2);b.pos.addScaledVector(_tv,ov/2);
  const vr=(b.vel.x-a.vel.x)*_tv.x+(b.vel.z-a.vel.z)*_tv.z;if(vr<0){const j2=-1.4*vr/2;a.vel.addScaledVector(_tv,-j2);b.vel.addScaledVector(_tv,j2);a.av+=rnd(-.4,.4);b.av+=rnd(-.4,.4);if(-vr>6)auBoat(0)}}}
// ---- ragdoll corpses and dropped loot ----
function makeCorpse(b){b.m.visible=true;pose(b.m,4,false,0,1,0,.016);corpses.push({m:b.m,v:(b.v?b.v.clone():new V()).add(new V(rnd(-1,1),rnd(.5,1.5),rnd(-1,1))),av:new V(rnd(-2.5,2.5),rnd(-1.5,1.5),rnd(-2.5,2.5)),t:0,rest:false})}
function corpseUpdate(dt,t){for(let i=corpses.length-1;i>=0;i--){const c=corpses[i],m=c.m,p=m.position;c.t+=dt;
  if(!c.rest){const inW=p.y<0;c.v.y+=(inW?-1.6:-16)*dt;if(inW){const dr=Math.max(0,1-2.2*dt);c.v.multiplyScalar(dr)}
   p.addScaledVector(c.v,dt);m.rotation.x+=c.av.x*dt;m.rotation.y+=c.av.y*dt;m.rotation.z+=c.av.z*dt;c.av.multiplyScalar(Math.max(0,1-1.2*dt));
   collideWorld(p,.7,c.v,null,null,false);if(inW&&Math.random()<dt*2)trailB(p);
   if(p.y<=depthAt(p.x,p.z)+1.05&&p.y<-.5){c.rest=true;c.v.set(0,0,0);c.av.set(0,0,0)}}
  else{m.rotation.x+=(-1.45-m.rotation.x)*Math.min(1,dt*2);m.rotation.z+=(0-m.rotation.z)*Math.min(1,dt*2)}
  if(c.t>25){m.scale.multiplyScalar(Math.max(0,1-dt*1.5));if(m.scale.x<.05){scene.remove(m);corpses.splice(i,1)}}}}
function lootPhys(dt){for(const l of loot){if(!l.alive||!l.dyn)continue;l.v.y-=1.8*dt;l.v.multiplyScalar(Math.max(0,1-1.6*dt));l.pos.addScaledVector(l.v,dt);
  collideWorld(l.pos,.45,l.v,null,null,false);if(l.pos.y>-.3){l.pos.y=-.3;if(l.v.y>0)l.v.y=0}
  if(l.pos.y<=depthAt(l.pos.x,l.pos.z)+1.02){l.v.x*=.7;l.v.z*=.7;if(l.v.length()<.3)l.dyn=false}}}
