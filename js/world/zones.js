// ===== world: themed deep zones + haunted old ship =====
const ZN=['Bioluminescent Garden','Crystal Caverns','Thermal Vents','Kelp Forest & Whale Fall','Sunken Ruins','Orb Abyss','Coral Cathedral','Treasure Cove','Ghost Ship Graveyard'];
let SHIP=null,lastZn=-1;
const GLT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const _o=new THREE.Object3D(),NEON=[0x00ffe0,0xff3df0,0xa6ff3d,0x4d7dff,0xffb03d];
function zp(zi,a,b){const[zx,zz]=ZONES[zi],an=rnd(0,6.283),r=rnd(a,b);return{x:zx+Math.cos(an)*r,z:zz+Math.sin(an)*r}}
function inst(geo,mat,items,parent,rf){const m=new THREE.InstancedMesh(geo,mat,items.length);
 items.forEach((it,i)=>{const y=it.abs!==undefined?it.abs:depthAt(it.x,it.z)+(it.y||0);if(rf)rf(it,y);_o.position.set(it.x,y,it.z);_o.rotation.set(it.rx||0,it.ry||0,it.rz||0);const s=it.s===undefined?1:it.s;
  if(typeof s==='number')_o.scale.setScalar(s);else _o.scale.set(s[0],s[1],s[2]);_o.updateMatrix();m.setMatrixAt(i,_o.matrix);if(it.c!==undefined)m.setColorAt(i,new THREE.Color(it.c))});
 m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.frustumCulled=false;(parent||scene).add(m);return m}
function motes(cx,cz,base,n,H,cols,size,spread){const pos=new Float32Array(n*3),col=new Float32Array(n*3);
 for(let i=0;i<n;i++){pos[i*3]=rnd(-spread,spread);pos[i*3+1]=rnd(0,H);pos[i*3+2]=rnd(-spread,spread);const c=new THREE.Color(cols[i%cols.length]);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.PointsMaterial({size,map:GLT,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=FT;sh.uniforms.uH={value:H};sh.vertexShader='uniform float uT;uniform float uH;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);transformed.y=mod(position.y+uT*.8,uH);transformed.x+=sin(uT*.4+position.y*.3)*1.2;transformed.z+=cos(uT*.35+position.x*.2)*1.2;')};
 const p=new THREE.Points(g,m);p.position.set(cx,base,cz);p.frustumCulled=false;scene.add(p);MOTES.push({g,n})}
const mz=(zi,n,H,cols,size,spread)=>{const[cx,cz]=ZONES[zi],b=depthAt(cx,cz);motes(cx,cz,b,n,Math.min(H,-b-4),cols,size,spread)};
function halo(x,y,z,c,size){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([x,y,z],3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({size,map:GLT,color:c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.75})))}
const stripGeo=new THREE.BoxGeometry(.05,1,.015,1,8,1).translate(0,.5,0);
function strips(zi,n,rmax,h0,h1,cols,basic){const mat=basic?new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
 mat.onBeforeCompile=sh=>{sh.uniforms.uT=FT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);float ph=instanceMatrix[3].x*.5+instanceMatrix[3].z*.3;transformed.x+=sin(uT*.9+ph+position.y*3.)*.07*position.y*position.y;transformed.z+=cos(uT*.7+ph)*.04*position.y*position.y;')};
 const items=[];for(let i=0;i<n;i++){const p=zp(zi,2,rmax);items.push({x:p.x,z:p.z,y:-1,s:rnd(h0,h1),ry:rnd(0,6.28),c:cols[i%cols.length]})}return inst(stripGeo,mat,items)}
function mkSail(w,h){const s=new THREE.Shape(),n=7;s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2*.95,-h*.4);
 for(let i=0;i<=n;i++){const x=w/2*.95-(i/n)*w*.95,y=-h+rnd(-1.2,.6)*(i%2?1:.4)-(Math.random()<.2?h*.15:0);s.lineTo(x,y)}s.lineTo(-w/2*.95,-h*.4);s.lineTo(-w/2,0);
 const m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshLambertMaterial({color:0xd9cfb4,side:THREE.DoubleSide,transparent:true,opacity:.85}));m.rotation.y=Math.PI/2;return m}
function mkShip(){const g=new THREE.Group(),L=70,B=9.5,D=8,sails=[];g.rotation.order='YZX';
 const wood=new THREE.MeshStandardMaterial({color:0x5a3d22,roughness:.9}),dark=new THREE.MeshStandardMaterial({color:0x2a2d33,roughness:.7,metalness:.4}),
 ad=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};
 const hg=new THREE.SphereGeometry(1,40,16,0,Math.PI*2,Math.PI/2,Math.PI/2),pa=hg.attributes.position,n=pa.count,ox=new Float32Array(n),oy=new Float32Array(n),oz=new Float32Array(n),col=[];
 for(let i=0;i<n;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);ox[i]=x;oy[i]=y;oz[i]=z;const f=1-Math.pow(Math.max(0,x),2.6)*.92;pa.setXYZ(i,x*L/2,y*D,z*B*f);
  const ns=(Math.sin(x*53+z*31)*.5+.5)*.1,w=y>-.22?[.4+ns,.29+ns,.19]:[.2+ns,.27+ns,.24+ns];col.push(w[0],w[1],w[2])}
 hg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));const idx=hg.index.array,keep=[];
 for(let i=0;i<idx.length;i+=3){let cx=0,cy=0,cz=0;for(let k=0;k<3;k++){cx+=ox[idx[i+k]];cy+=oy[idx[i+k]];cz+=oz[idx[i+k]]}cx/=3;cy/=3;cz/=3;
  if((cx>.05&&cx<.38&&Math.abs(cz)>.5&&cy>-.65&&cy<-.12)||(cx>-.6&&cx<-.3&&cz>.45&&cy>-.55&&cy<-.1))continue;keep.push(idx[i],idx[i+1],idx[i+2])}
 hg.setIndex(keep);hg.computeVertexNormals();g.add(new THREE.Mesh(hg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.1,side:THREE.DoubleSide})));
 for(let i=0;i<7;i++){const u=-.75+i*.25,f=1-Math.pow(Math.max(0,u),2.6)*.92,R=Math.sqrt(1-u*u),rb=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,16,Math.PI).rotateZ(Math.PI),dark.clone());
  rb.material.color.set(0x3a2a1a);rb.scale.set(1,D*R,B*f*R);rb.rotation.y=Math.PI/2;rb.scale.set(B*f*R,D*R,1);rb.position.set(u*L/2,0,0);g.add(rb)}
 const sh=new THREE.Shape();for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,x=Math.cos(a),f=1-Math.pow(Math.max(0,x),2.6)*.92,px=x*L/2,pz=Math.sin(a)*B*f*.98;i?sh.lineTo(px,pz):sh.moveTo(px,pz)}
 const dg=new THREE.ShapeGeometry(sh);dg.rotateX(-Math.PI/2);dg.translate(0,.05,0);
 const cvs=document.createElement('canvas');cvs.width=cvs.height=64;const cc=cvs.getContext('2d');cc.fillStyle='#6b4a2a';cc.fillRect(0,0,64,64);cc.fillStyle='#3d2812';for(let i=0;i<8;i++)cc.fillRect(0,i*8,64,1.5);for(let i=0;i<14;i++)cc.fillRect(Math.random()*64,Math.floor(Math.random()*8)*8,1.5,8);
 const tx=new THREE.CanvasTexture(cvs);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(.12,.12);g.add(new THREE.Mesh(dg,new THREE.MeshStandardMaterial({map:tx,roughness:.9,side:THREE.DoubleSide})));
 const pl=[];for(let x=-32;x<=31;x+=2.4){const u=x/(L/2),f=1-Math.pow(Math.max(0,u),2.6)*.92,zz=Math.sqrt(Math.max(0,1-u*u))*B*f*.97;for(const s of[1,-1])if(Math.random()>.3)pl.push({x,z:s*zz,abs:.05,s:[1,rnd(.5,1.2),1],rz:rnd(-.2,.2)})}
 inst(new THREE.BoxGeometry(.14,1,.14).translate(0,.5,0),wood,pl,g);
 ad(new THREE.BoxGeometry(14,2.6,12),wood,-24,1.3,0);ad(new THREE.BoxGeometry(9,3,8),wood,-26,3.9,0);ad(new THREE.BoxGeometry(10,.4,9),dark,-26,5.6,0);
 for(let z=-3;z<=3;z+=2)ad(new THREE.BoxGeometry(.1,.9,.9),new THREE.MeshBasicMaterial({color:0xffc46a}),-30.55,4,z);
 ad(new THREE.TorusGeometry(.9,.07,6,14),dark,-18.5,1.9,0).rotation.y=Math.PI/2;
 const mast=(x,H,w,ns)=>{ad(new THREE.CylinderGeometry(.35,.55,H,8),wood,x,H/2,0);ad(new THREE.SphereGeometry(.35,8,6),new THREE.MeshBasicMaterial({color:0xa0ffb0}),x,H+.3,0);
  for(let i=0;i<ns;i++){const y=H*(.45+i*.28);ad(new THREE.CylinderGeometry(.2,.2,w,6).rotateX(Math.PI/2),wood,x,y,0);const s=mkSail(w*.93,H*.26);s.position.set(x,y,0);g.add(s);sails.push(s)}};
 mast(6,26,15,2);mast(-18,18,11,1);
 ad(new THREE.CylinderGeometry(.35,.55,12,8),wood,22,6,0);ad(new THREE.CylinderGeometry(.3,.4,10,6),wood,26,11,0).rotation.z=1.1;
 ad(new THREE.CylinderGeometry(.3,.4,16,6).rotateZ(Math.PI/2),wood,38,1.4,0).rotation.z=.15;
 for(const x of[-12,-6,0,6,12]){const u=x/(L/2),zz=Math.sqrt(1-u*u)*B*.9;for(const s of[1,-1])ad(new THREE.CylinderGeometry(.32,.4,2.4,8).rotateX(Math.PI/2),dark,x,.6,s*zz)}
 for(let i=0;i<9;i++)ad(new THREE.CylinderGeometry(.5,.5,.9,10),wood,rnd(-14,16),.5,rnd(-4.5,4.5));for(let i=0;i<6;i++)ad(new THREE.BoxGeometry(1,1,1),wood,rnd(-14,16),.55,rnd(-4.5,4.5)).rotation.y=rnd(0,3);
 ad(new THREE.CylinderGeometry(.08,.08,24,5),dark,34,-6,1.5);ad(new THREE.SphereGeometry(.4,8,6),new THREE.MeshBasicMaterial({color:0xa0ffb0}),-31,5.2,2);
 const lt=new THREE.PointLight(0x7dffa0,1.5,70);lt.position.set(-22,6,0);g.add(lt);XL.push(lt);g.userData.sails=sails;return g}
function worldUpdate(t){if(SHIP){SHIP.position.y=2.2+Math.sin(t*.6)*.18;SHIP.rotation.x=.1+Math.sin(t*.5)*.025;SHIP.userData.sails.forEach((s,i)=>{s.rotation.z=Math.sin(t*.8+i)*.04})}
 if(running&&P.ph==='play'){let bi=-1,bd=44;ZONES.forEach(([a,b],i)=>{const d=Math.hypot(P.pos.x-a,P.pos.z-b);if(d<bd){bd=d;bi=i}});
  if(bi!==lastZn){lastZn=bi;if(bi>=0){const z=$('zn');z.textContent=ZN[bi];z.style.opacity=1;clearTimeout(z._t);z._t=setTimeout(()=>{z.style.opacity=0},3000)}}}}
(function buildWorld(){
 const lam=c=>new THREE.MeshLambertMaterial({color:c}),bas=(c,o)=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,transparent:o!==undefined,opacity:o===undefined?1:o,depthWrite:o===undefined});
 // 0 Bioluminescent Garden: glowing mushrooms, neon tendrils
 {const st=[],cp=[];for(let i=0;i<46;i++){const p=zp(0,3,38),h=rnd(2,6),r=rnd(.9,2.4);st.push({x:p.x,z:p.z,y:-1,s:[rnd(.8,1.4),h,rnd(.8,1.4)]});cp.push({x:p.x,z:p.z,y:h-1,s:[r,r*.6,r],c:NEON[i%5]})}
  inst(new THREE.CylinderGeometry(.18,.3,1,8).translate(0,.5,0),lam(0x3a2a55),st,undefined,(it,y)=>cylC(it.x,it.z,y,y+it.s[1],.3*it.s[0]));inst(new THREE.SphereGeometry(1,14,8,0,6.283,0,Math.PI/2),bas(0xffffff),cp,undefined,(it,y)=>sphC(it.x,y,it.z,it.s[0]*.85));strips(0,60,36,8,18,NEON,true);mz(0,230,40,NEON,1.8,40)}
 // 1 Crystal Caverns
 {const items=[];for(let i=0;i<40;i++){const p=zp(1,1,36),h=rnd(3,15);items.push({x:p.x,z:p.z,y:-1,s:[h*.18,h,h*.18],rx:rnd(-.35,.35),rz:rnd(-.35,.35),ry:rnd(0,6.28),c:[0x5ff3ff,0xb86bff,0xff6bd6,0x7ab8ff][i%4]});if(i%7===0)halo(p.x,depthAt(p.x,p.z)+h*.6,p.z,[0x5ff3ff,0xb86bff][i%2],18)}
  items.push({x:ZONES[1][0],z:ZONES[1][1],y:-1,s:[4,26,4],c:0xcff6ff});halo(ZONES[1][0],depthAt(ZONES[1][0],ZONES[1][1])+12,ZONES[1][1],0xcff6ff,34);
  inst(new THREE.ConeGeometry(1,1,6).translate(0,.5,0),bas(0xffffff,.72),items,undefined,(it,y)=>cylC(it.x,it.z,y,y+it.s[1],it.s[0]*.5));mz(1,200,40,[0x5ff3ff,0xb86bff,0xffffff],1.6,40)}
 // 2 Thermal Vents
 {const ch=[],rm=[],gl=new THREE.MeshBasicMaterial({color:0xff7a22});for(let i=0;i<9;i++){const p=zp(2,2,26),h=rnd(5,14),w=rnd(1.2,2.4),by=depthAt(p.x,p.z);ch.push({x:p.x,z:p.z,y:-1,s:[w,h,w]});rm.push({x:p.x,z:p.z,y:h-1,s:w});halo(p.x,by+h,p.z,0xff8a30,16);
   const d=new THREE.Mesh(new THREE.CircleGeometry(w*2.2,16).rotateX(-Math.PI/2),gl);d.position.set(p.x,by+.15,p.z);scene.add(d)}
  inst(new THREE.CylinderGeometry(.55,1,1,10).translate(0,.5,0),lam(0x2a2d33),ch,undefined,(it,y)=>cylC(it.x,it.z,y,y+it.s[1],.75*it.s[0]));inst(new THREE.TorusGeometry(.55,.12,6,12).rotateX(Math.PI/2),gl,rm);mz(2,260,34,[0xff8a2a,0xffcc66,0x888888],2.4,30);
  const L=new THREE.PointLight(0xff7a22,1.6,45);L.position.set(ZONES[2][0],depthAt(ZONES[2][0],ZONES[2][1])+5,ZONES[2][1]);XL.push(L);scene.add(L)}
 // 3 Kelp Forest & Whale Fall
 {strips(3,110,38,9,22,[0x2f8f4a,0x5aa63a,0x7ab82f,0x1f7a5a],false);const bone=lam(0xe6dfc8),[wx,wz]=ZONES[3],by=depthAt(wx,wz)-.5;
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.5,.35,34,8).rotateZ(Math.PI/2),bone);sp.position.set(wx,by+1.2,wz);scene.add(sp);
  for(let i=0;i<11;i++){const R=6.5-Math.abs(i-4)*.45,rb=new THREE.Mesh(new THREE.TorusGeometry(R,.28,6,16,Math.PI),bone);rb.rotation.y=Math.PI/2;rb.position.set(wx-14+i*2.8,by+1.2,wz);scene.add(rb)}
  const sk=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,10),bone);sk.scale.set(1.3,.8,.9);sk.position.set(wx+19,by+2,wz);scene.add(sk);sphC(wx+19,by+2,wz,3.6);
  for(let i=0;i<5;i++){const v=new THREE.Mesh(new THREE.SphereGeometry(.55-i*.07,8,6),bone);v.position.set(wx-18-i*1.4,by+1.2,wz);scene.add(v)}mz(3,200,40,[0xa6ff7a,0xffe85a,0x7affd0],1.6,40)}
 // 4 Sunken Ruins
 {const[rx,rz]=ZONES[4],by=depthAt(rx,rz),stone=lam(0x9aa7ad),cs=[],cap=[];
  for(let i=0;i<16;i++){const x=rx+(i%8)*4.2-14.7,z=rz+(i<8?-9:9),br=Math.random()<.35,h=br?rnd(2,5):rnd(6,11);cs.push({x,z,abs:by+.5,s:[1,h,1],rz:br?rnd(-.3,.3):0});if(!br)cap.push({x,z,abs:by+.5+h,s:1.1})}
  inst(new THREE.CylinderGeometry(.8,.95,1,10).translate(0,.5,0),stone,cs,undefined,(it,y)=>cylC(it.x,it.z,y,y+it.s[1]*(it.rz?.9:1),.9));inst(new THREE.TorusGeometry(.95,.22,6,12).rotateX(Math.PI/2),stone,cap);
  const pf=new THREE.Mesh(new THREE.BoxGeometry(34,.8,24),stone);pf.position.set(rx,by+.1,rz);scene.add(pf);boxC(rx,by+.1,rz,17,.4,12);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.8,.9,rnd(5,8),10).rotateZ(Math.PI/2),stone);f.position.set(rx+rnd(-18,18),by+.9,rz+rnd(-14,14));f.rotation.y=rnd(0,3);scene.add(f)}
  for(const s of[-1,1]){const a=new THREE.Mesh(new THREE.TorusGeometry(5,.7,8,18,Math.PI),stone);a.position.set(rx+s*10,by+.5,rz);a.rotation.y=Math.PI/2;scene.add(a);cylC(rx+s*10,rz-5,by,by+3,.8);cylC(rx+s*10,rz+5,by,by+3,.8);sphC(rx+s*10,by+5.5,rz,1)}
  const rg=new THREE.Mesh(new THREE.RingGeometry(5,5.4,48).rotateX(-Math.PI/2),bas(0x5ff3ff));rg.position.set(rx,by+.55,rz);scene.add(rg);
  const r2=new THREE.Mesh(new THREE.RingGeometry(2.2,2.5,6).rotateX(-Math.PI/2),bas(0x5ff3ff));r2.position.set(rx,by+.56,rz);scene.add(r2);
  const oc=new THREE.Mesh(new THREE.OctahedronGeometry(1.4),bas(0x8ff8ff,.85));oc.position.set(rx,by+6,rz);scene.add(oc);halo(rx,by+6,rz,0x5ff3ff,30);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),stone);hd.position.set(rx+14,by+3.4,rz-9);scene.add(hd);sphC(rx+14,by+3.4,rz-9,1.7);mz(4,180,40,[0x5ff3ff,0xffffff],1.5,40)}
 // 5 Orb Abyss
 {const items=[];for(let i=0;i<26;i++){const p=zp(5,2,40),y=rnd(4,26);items.push({x:p.x,z:p.z,y,s:rnd(.8,2.6),c:NEON[i%5]});halo(p.x,depthAt(p.x,p.z)+y,p.z,NEON[i%5],rnd(9,16))}
  inst(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:0xffffff}),items,undefined,(it,y)=>sphC(it.x,y,it.z,it.s));strips(5,70,40,10,26,NEON,true);mz(5,240,40,NEON,1.8,40)}
 // 6 Coral Cathedral + god rays
 {const cols=[0xff7aa8,0xffa05a,0xb06bff,0xff5a8a],ar=[],cr=[];
  for(let i=0;i<7;i++){const p=zp(6,3,24),R=rnd(6,12);ar.push({x:p.x,z:p.z,y:-1,s:R,ry:rnd(0,6.28),c:cols[i%4]});halo(p.x,depthAt(p.x,p.z)+R*.9,p.z,cols[i%4],20)}
  for(let i=0;i<70;i++){const p=zp(6,2,36),h=rnd(2,8);cr.push({x:p.x,z:p.z,y:-1,s:[rnd(.8,2),h,rnd(.8,2)],c:cols[i%4]})}
  inst(new THREE.TorusGeometry(1,.16,8,20,Math.PI),lam(0xffffff),ar,undefined,(it,y)=>{const R=it.s,cx=Math.cos(it.ry)*R,cz=-Math.sin(it.ry)*R;cylC(it.x+cx,it.z+cz,y,y+R*.5,.2*R+.2);cylC(it.x-cx,it.z-cz,y,y+R*.5,.2*R+.2);sphC(it.x,y+R,it.z,.3*R)});inst(new THREE.ConeGeometry(.6,1,7).translate(0,.5,0),lam(0xffffff),cr,undefined,(it,y)=>cylC(it.x,it.z,y,y+it.s[1],.3*it.s[0]));
  const rm=new THREE.MeshBasicMaterial({color:0xa8e8ff,transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  for(let i=0;i<9;i++){const p=zp(6,0,34),r=new THREE.Mesh(new THREE.ConeGeometry(rnd(5,9),52,24,1,true),rm);r.position.set(p.x,-26,p.z);scene.add(r)}mz(6,200,40,[0xff9ac0,0xffc080,0xd0a0ff],1.7,40)}
 // 7 Treasure Cove
 {const co=[],gm=new THREE.MeshStandardMaterial({color:0xffc928,metalness:.55,roughness:.3,emissive:0x8a5a00,emissiveIntensity:.7});
  for(let m=0;m<4;m++){const mc=zp(7,4,22);halo(mc.x,depthAt(mc.x,mc.z)+2,mc.z,0xffc928,24);for(let i=0;i<65;i++){const a=rnd(0,6.28),r=rnd(0,5),x=mc.x+Math.cos(a)*r,z=mc.z+Math.sin(a)*r;co.push({x,z,abs:depthAt(x,z)+(1-r/5)*2.2+.1,rx:rnd(-.6,.6),rz:rnd(-.6,.6),ry:rnd(0,6.28)})}}
  inst(new THREE.CylinderGeometry(.4,.4,.09,10),gm,co);
  for(let i=0;i<5;i++){const p=zp(7,3,30),c=new THREE.Group();c.position.set(p.x,depthAt(p.x,p.z)+.5,p.z);c.rotation.y=rnd(0,6.28);
   const bs=new THREE.Mesh(new THREE.BoxGeometry(1.8,1,1.1),lam(0x7a4a2a));c.add(bs);const gd=new THREE.Mesh(new THREE.BoxGeometry(1.6,.2,.9),new THREE.MeshBasicMaterial({color:0xffd23f}));gd.position.y=.52;c.add(gd);
   const pv=new THREE.Group();pv.position.set(0,.5,-.55);pv.rotation.x=-1.1;const lid=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.8,10,1,false,0,Math.PI).rotateZ(Math.PI/2),lam(0x7a4a2a));lid.position.z=.55;pv.add(lid);c.add(pv);scene.add(c);halo(p.x,depthAt(p.x,p.z)+1.4,p.z,0xffd23f,12);boxC(p.x,depthAt(p.x,p.z)+.5,p.z,1,.6,1)}
  const gi=[];for(let i=0;i<26;i++){const p=zp(7,2,32);gi.push({x:p.x,z:p.z,y:.5,s:rnd(.6,1.3),ry:rnd(0,3),c:NEON[i%5]})}inst(new THREE.OctahedronGeometry(.45),new THREE.MeshBasicMaterial({color:0xffffff}),gi);mz(7,200,40,[0xffd23f,0xfff1a0],1.7,40)}
 // 8 Ghost Ship Graveyard: old ship on the surface above the deep zone
 {const[sx,sz]=ZONES[8],by=depthAt(sx,sz),g=mkShip();g.position.set(sx,2.2,sz);g.rotation.y=rnd(0,6.28);g.rotation.z=-.17;g.rotation.x=.1;scene.add(g);g.updateMatrixWorld(true);SHIP=g;
  const LT=(t,x,y,z,k)=>spawnLoot(t,g.localToWorld(new V(x,y,z)),k);
  LT('gun',4,-4,1,'sn');LT('gun',-6,-3,-2,'sg');LT('gun',14,-2.5,0,'ar');LT('gun',-14,-4,2,'smg');LT('dome',0,-5.5,0);LT('kit',-10,-2,3);LT('kit',10,-3,-3);LT('wall',16,-2,2);LT('wall',-4,-3.5,-1);
  [[24,.5,2],[28,.6,0],[20,.5,-3],[8,-2.5,2],[-2,-3,3],[-18,-3,0]].forEach(a=>LT('coin',a[0],a[1],a[2]));
  const wd=lam(0x3a2a1a);for(let i=0;i<7;i++){const rb=new THREE.Mesh(new THREE.TorusGeometry(rnd(6,8),.4,6,14,Math.PI),wd);rb.rotation.y=Math.PI/2;rb.position.set(sx-14+i*5,by,sz+18);scene.add(rb)}
  const kl=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,34,6).rotateZ(Math.PI/2),wd);kl.position.set(sx,by+.3,sz+18);scene.add(kl);
  for(let i=0;i<14;i++){const p=zp(8,4,36),b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.9,10),wd);b.position.set(p.x,depthAt(p.x,p.z)+.45,p.z);scene.add(b);cylC(p.x,p.z,depthAt(p.x,p.z),depthAt(p.x,p.z)+.9,.55)}
  motes(sx,sz,0,170,6,[0x9dffd0,0xffffff],4,48);mz(8,160,40,[0x9dffd0,0xe0ffe8],1.5,40)}
})();
// ===== sea life on and under the surface: floating seaweed mats + swaying seagrass meadows =====
const WEED={fm:null,wm:[]};
(function seaLife(){
 const gg=new THREE.PlaneGeometry(.2,1,1,5).translate(0,.5,0),gm=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
 gm.onBeforeCompile=sh=>{sh.uniforms.uT=FT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);float ph=instanceMatrix[3].x*.4+instanceMatrix[3].z*.27;transformed.x*=1.-position.y*.75;transformed.x+=sin(uT*1.6+ph+position.y*2.5)*.16*position.y*position.y;transformed.z+=cos(uT*1.2+ph)*.08*position.y*position.y;')};
 const items=[];let tries=0;
 while(items.length<6500&&tries<60000){tries++;const a=rnd(0,6.283),r=Math.sqrt(Math.random())*345,x=Math.cos(a)*r,z=Math.sin(a)*r;if(depthAt(x,z)<-7)continue;if(Math.sin(x*.045+1)*Math.sin(z*.05)<-.15&&Math.random()<.8)continue;
  const n=1+(Math.random()*5|0);for(let k=0;k<n&&items.length<6500;k++)items.push({x:x+rnd(-1,1),z:z+rnd(-1,1),y:-.2,s:rnd(1.1,3.2),ry:rnd(0,6.28),c:[0x2f9a4a,0x4db85a,0x7ac24a,0x1f7a45,0x9acd4a][items.length%5]})}
 WEED.sg=inst(gg,gm,items);WEED.sgN=items.length;
 const leafs=[];for(let i=0;i<14;i++){const L=rnd(1,2),lg=new THREE.PlaneGeometry(rnd(.14,.26),L,1,4),pa=lg.attributes.position,col=[];
  for(let j=0;j<pa.count;j++){const u=pa.getY(j)/L+.5;pa.setZ(j,Math.sin(u*Math.PI)*.1);col.push(.1+.4*u,.3+.2*u,.12+.04*u)}
  lg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));lg.computeVertexNormals();lg.rotateX(-Math.PI/2);lg.rotateY(rnd(0,6.28));lg.translate(rnd(-.8,.8),0,rnd(-.8,.8));leafs.push(lg)}
 const wm=WEED.wm;for(let m=0;m<14;m++){const a=rnd(0,6.28),r=rnd(30,320),cx=Math.cos(a)*r,cz=Math.sin(a)*r;for(let i=0;i<16;i++)wm.push({x:cx+rnd(-14,14),z:cz+rnd(-14,14),s:rnd(1,2.4),ry:rnd(0,6.28)})}
 for(let i=0;i<40;i++){const a=rnd(0,6.283),r=Math.sqrt(Math.random())*330;wm.push({x:Math.cos(a)*r,z:Math.sin(a)*r,s:rnd(.8,1.6),ry:rnd(0,6.28)})}
 const fm=new THREE.InstancedMesh(merge(leafs),new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),wm.length);fm.frustumCulled=false;
 wm.forEach((w,i)=>{const b=rnd(.8,1.1);fm.setColorAt(i,new THREE.Color(b,b,b))});fm.instanceColor.needsUpdate=true;scene.add(fm);WEED.fm=fm})();
function weedUpdate(dt,t){const fm=WEED.fm;if(!fm)return;WEED.k=(WEED.k||0)+1;if(Q.fx<60){if(WEED.k%2)return;dt*=2}WEED.wm.forEach((w,i)=>{if(i>=fm.count)return;const c=current(w.x,w.z,t);w.x+=c.x*.3*dt;w.z+=c.z*.3*dt;if(Math.hypot(w.x,w.z)>340){w.x*=-.9;w.z*=-.9}
  _o.position.set(w.x,waveY(w.x,w.z,t)+.04,w.z);_o.rotation.set(0,w.ry,0);_o.scale.setScalar(w.s);_o.updateMatrix();fm.setMatrixAt(i,_o.matrix)});fm.instanceMatrix.needsUpdate=true}
