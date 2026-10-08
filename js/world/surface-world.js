// Static procedural coastline: presentation only, with a shared low-cost land collider.
// The ocean remains the playable space; the terrain is never a walkable surface.
const SURFACE_WORLD=new THREE.Group();SURFACE_WORLD.name='Surface coastline';scene.add(SURFACE_WORLD);
const SW_MAT={
 shelf:new THREE.MeshLambertMaterial({color:0x4a9b99,transparent:true,opacity:.46,side:THREE.DoubleSide}),
 wet:new THREE.MeshLambertMaterial({color:0x9ebd83,side:THREE.DoubleSide}),
 sand:new THREE.MeshLambertMaterial({color:0xd0b878,side:THREE.DoubleSide}),
 land:new THREE.MeshLambertMaterial({color:0x476b43,side:THREE.DoubleSide}),
 rock:new THREE.MeshLambertMaterial({color:0x52616a,flatShading:true}),
 rockLight:new THREE.MeshLambertMaterial({color:0x718080,flatShading:true}),
 hill:new THREE.MeshLambertMaterial({color:0x355d3b,flatShading:true}),
 hillDark:new THREE.MeshLambertMaterial({color:0x29483a,flatShading:true}),
 mountain:new THREE.MeshLambertMaterial({color:0x40525c,flatShading:true}),
 distant:new THREE.MeshLambertMaterial({color:0x293d4b,flatShading:true}),
 trunk:new THREE.MeshLambertMaterial({color:0x5b402b,flatShading:true}),
 foliage:new THREE.MeshLambertMaterial({color:0x2f7048,flatShading:true})
};
const SW_SECTIONS=[
 {a:-2.88,w:.68,o:-2,h:1},{a:-2.18,w:.54,o:5,h:0},{a:-1.38,w:.78,o:-1,h:2},{a:-.56,w:.59,o:3,h:1},
 {a:.32,w:.74,o:-3,h:0},{a:1.15,w:.57,o:4,h:2},{a:2.02,w:.72,o:1,h:1},{a:2.73,w:.52,o:-4,h:0}
];
const SW_DUMMY=new THREE.Object3D();
function swf(n){const x=Math.sin(n*91.173+17.31)*43758.5453;return x-Math.floor(x)}
function swSector(r0,r1,a0,a1,yt,yb,n){
 const v=[],ix=[],q=(a,b,c,d)=>ix.push(a,b,c,a,c,d),N=n+1;
 const ring=(r,y)=>{for(let i=0;i<N;i++){const a=a0+(a1-a0)*i/n;v.push(Math.cos(a)*r,y,Math.sin(a)*r)}};
 ring(r0,yt);ring(r1,yt);ring(r1,yb);ring(r0,yb);
 for(let i=0;i<n;i++){q(i,N+i,N+i+1,i+1);q(2*N+i,3*N+i,3*N+i+1,2*N+i+1);q(N+i,2*N+i,2*N+i+1,N+i+1);q(i,i+1,3*N+i+1,3*N+i)}
 const t=0,oi=N,ob=2*N,ib=3*N;q(t,oi,ob,ib);q(n,ib+n,ob+n,oi+n);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g
}
function swMesh(geo,mat,parent=SURFACE_WORLD){const m=new THREE.Mesh(geo,mat);parent.add(m);return m}
function swRockItems(){const a=[];SW_SECTIONS.forEach((s,si)=>{for(let i=0;i<9;i++){const u=swf(si*31+i*3),v=swf(si*47+i*5),ang=s.a+(u-.5)*s.w*.95,r=316+s.o+v*27;a.push({x:Math.cos(ang)*r,z:Math.sin(ang)*r,s:.8+swf(si*71+i)*1.8,ry:swf(si*83+i)*6.283,sy:.65+swf(si*97+i)*.8,c:i%4===0?0x718080:0x52616a})}});return a}
function swTrees(){const a=[];SW_SECTIONS.forEach((s,si)=>{for(let i=0;i<8;i++){const u=swf(si*113+i*7),v=swf(si*127+i*11),ang=s.a+(u-.5)*s.w*.82,r=323+s.o+v*18,h=3.2+swf(si*139+i)*3.2;a.push({x:Math.cos(ang)*r,z:Math.sin(ang)*r,h,s:.75+swf(si*151+i)*.6,ry:swf(si*163+i)*6.283})}});return a}
function addSurfaceMeshes(){
 SW_SECTIONS.forEach((s,si)=>{const a0=s.a-s.w/2,a1=s.a+s.w/2,base=306+s.o;
  swMesh(swSector(base-9,base+2,a0,a1,-.22,-8,8),SW_MAT.shelf);
  swMesh(swSector(base-2,base+13,a0,a1,.02,-5.2,8),SW_MAT.wet);
  swMesh(swSector(base+8,base+29,a0,a1,.2,-6.5,8),SW_MAT.sand);
  swMesh(swSector(base+23,base+42,a0,a1,.65,-7.5,7),SW_MAT.land);
  for(let j=0;j<3;j++){const u=swf(si*181+j*13),ang=s.a+(u-.5)*s.w*.72,r=base+31+u*10,h=20+swf(si*193+j)*25+s.h*7,rad=13+swf(si*211+j)*9,g=new THREE.ConeGeometry(1,1,6+(j%2),1,false),m=swMesh(g,j===0?SW_MAT.hill:SW_MAT.mountain);m.position.set(Math.cos(ang)*r,h*.5-.05,Math.sin(ang)*r);m.scale.set(rad,h,rad);m.rotation.y=swf(si*223+j)*6.283}
  for(let j=0;j<2;j++){const u=swf(si*239+j*17),ang=s.a+(u-.5)*s.w*.9,r=351+s.o+u*12,h=47+swf(si*251+j)*30,rad=21+swf(si*263+j)*11,g=new THREE.ConeGeometry(1,1,7,1,false),m=swMesh(g,SW_MAT.distant);m.position.set(Math.cos(ang)*r,h*.5-1,Math.sin(ang)*r);m.scale.set(rad,h,rad);m.rotation.y=swf(si*277+j)*6.283}
 });
 const rocks=swRockItems(),rg=new THREE.DodecahedronGeometry(1,0),rm=new THREE.InstancedMesh(rg,SW_MAT.rock,rocks.length);rm.frustumCulled=false;rocks.forEach((it,i)=>{SW_DUMMY.position.set(it.x,it.s*.42,it.z);SW_DUMMY.rotation.set(swf(i*3)*.5,it.ry,swf(i*5)*.4);SW_DUMMY.scale.set(it.s,it.s*it.sy,it.s*.8);SW_DUMMY.updateMatrix();rm.setMatrixAt(i,SW_DUMMY.matrix);if(rm.setColorAt)rm.setColorAt(i,new THREE.Color(it.c))});rm.instanceMatrix.needsUpdate=true;if(rm.instanceColor)rm.instanceColor.needsUpdate=true;SURFACE_WORLD.add(rm);
 const trees=swTrees(),tg=new THREE.CylinderGeometry(.34,.55,1,6),lg=new THREE.ConeGeometry(1,1,7),tm=new THREE.InstancedMesh(tg,SW_MAT.trunk,trees.length),lm=new THREE.InstancedMesh(lg,SW_MAT.foliage,trees.length);tm.frustumCulled=lm.frustumCulled=false;trees.forEach((it,i)=>{SW_DUMMY.position.set(it.x,it.h*.5+.5,it.z);SW_DUMMY.rotation.set(0,it.ry,0);SW_DUMMY.scale.set(it.s,it.h,it.s);SW_DUMMY.updateMatrix();tm.setMatrixAt(i,SW_DUMMY.matrix);SW_DUMMY.position.set(it.x,it.h+2.1,it.z);SW_DUMMY.scale.set(it.s*1.8,3.9+it.s,it.s*1.8);SW_DUMMY.updateMatrix();lm.setMatrixAt(i,SW_DUMMY.matrix)});tm.instanceMatrix.needsUpdate=true;lm.instanceMatrix.needsUpdate=true;SURFACE_WORLD.add(tm,lm)
}
LAND.push({t:'shore',r0:304,a1:4.6,a2:2.8,p1:.7,p2:2.2,y0:-52,y1:22});
addSurfaceMeshes();
