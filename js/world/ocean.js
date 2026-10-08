// water, seabed, deep-zone markers
// ---- realistic sea: layered waves (swell + mid + chop + ripples), fresnel, sun glint, foam, depth colour, sky dome ----
const WV=[[1,.3,90,.45],[-.6,1,60,.28],[.5,-.8,28,.15],[-1,-.2,17,.08]];
function waveY(x,z,t){let h=0;for(const[dx,dz,wl,a]of WV){const l=Math.hypot(dx,dz),k=6.2831853/wl,w=Math.sqrt(9.8*k)*.9;h+=a*Math.sin(k*((x*dx+z*dz)/l)-w*t)}return h}
const WAVE_GLSL=`float wv(vec2 p,vec2 d,float wl,float amp,float t,inout vec2 g){float k=6.2831853/wl,w=sqrt(9.8*k)*.9,th=k*dot(p,d)-w*t;g+=d*amp*k*cos(th);return amp*sin(th);}
float waveH(vec2 p,float t,inout vec2 g){float h=0.;h+=wv(p,normalize(vec2(1.,.3)),90.,.45,t,g);h+=wv(p,normalize(vec2(-.6,1.)),60.,.28,t,g);h+=wv(p,normalize(vec2(.5,-.8)),28.,.15,t,g);h+=wv(p,normalize(vec2(-1.,-.2)),17.,.08,t,g);return h;}`;
const NOISE_GLSL=`#ifndef FBM_O
#define FBM_O 4
#endif
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<FBM_O;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}`;
const WU={uT:{value:0},uUnder:{value:0},uFog:{value:new THREE.Color()},uFogNear:{value:80},uFogFar:{value:380},uSun:{value:new V(50,100,30).normalize()},uSkyH:{value:SKYC.clone()},uSkyZ:{value:new THREE.Color(.16,.42,.8)},uShal:{value:new THREE.Color(.1,.62,.68)},uDeep:{value:new THREE.Color(.01,.12,.28)},uZ:{value:ZONES.map(z=>new THREE.Vector2(z[0],z[1]))}};
const waterMat=new THREE.ShaderMaterial({defines:{WQ:2,FBM_O:4},uniforms:WU,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 vertexShader:`uniform float uT;varying vec3 vW;\n`+WAVE_GLSL+`\nvoid main(){vec4 wp=modelMatrix*vec4(position,1.);vec2 g=vec2(0.);wp.y+=waveH(wp.xz,uT,g);vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
 fragmentShader:`uniform float uT,uUnder,uFogNear,uFogFar;uniform vec3 uSun,uSkyH,uSkyZ,uFog,uShal,uDeep;uniform vec2 uZ[9];varying vec3 vW;\n`+WAVE_GLSL+'\n'+NOISE_GLSL+`
#if WQ>=1
#define FB1(x) fbm(x)
#else
#define FB1(x) .5
#endif
void chopG(vec2 p,float t,inout vec2 g){wv(p,normalize(vec2(.8,.6)),8.,.05,t,g);wv(p,normalize(vec2(-.3,.9)),4.5,.03,t,g);wv(p,normalize(vec2(.2,-1.)),2.4,.015,t,g);wv(p,normalize(vec2(-.9,-.4)),1.3,.008,t,g);
#if WQ>=2
g+=(vec2(noise(p*1.7+t*.3),noise(p*1.7-t*.25+7.))-.5)*.12;
#endif
}
float seaDepth(vec2 p){float d=-6.;for(int i=0;i<9;i++){float k=clamp(1.-(distance(p,uZ[i])-26.)/22.,0.,1.);d=min(d,-6.-39.*k*k*(3.-2.*k));}return d;}
void main(){vec2 g=vec2(0.);float t=uT;vec2 p=vW.xz;float h=waveH(p,t,g);
#if WQ>=1
chopG(p,t,g);
#endif

 vec3 N=normalize(vec3(-g.x*2.2,1.,-g.y*2.2));vec3 toC=cameraPosition-vW;float dist=length(toC);vec3 V=toC/dist;float fogF=smoothstep(uFogNear,uFogFar,dist);vec3 col;float alpha;
 if(uUnder>.5){vec3 up=-V;float win=smoothstep(.62,.78,up.y);vec3 dark=uFog*.55,bright=uFog*1.6+vec3(.08,.22,.2);
  col=mix(dark,bright*(.8+.4*FB1(p*.5+t*.08)),win);col+=vec3(1.,.95,.8)*pow(max(dot(up,uSun),0.),200.)*1.2*win;alpha=.92;}
 else{float fres=.02+.98*pow(1.-max(dot(N,V),0.),5.);vec3 R=reflect(-V,N);R.y=abs(R.y);float sk=pow(1.-clamp(R.y,0.,1.),2.2);vec3 refl=mix(uSkyZ,uSkyH,sk);
  float sd=max(dot(R,uSun),0.);refl+=vec3(1.,.93,.78)*(pow(sd,700.)*4.+pow(sd,28.)*.3);
  float dep=seaDepth(p),dk=smoothstep(-5.,-40.,dep);vec3 body=mix(uShal,uDeep,dk);float crest=clamp((h-.12)*1.6,0.,1.);body+=vec3(.04,.28,.24)*crest*(1.-.6*dk);
  
#if WQ>=1
float fn=fbm(p*.8+vec2(t*.05,-t*.03)),fn2=fbm(p*3.2-vec2(t*.12,t*.07));float foam=smoothstep(.58,.9,h*1.3+fn*.5-.35)*(.45+.55*fn2);foam+=smoothstep(.78,.95,fn2)*.1;
#else
float foam=smoothstep(.7,1.,h*1.5-.2);
#endif
foam=clamp(foam,0.,1.);

  col=mix(body,refl,fres);col=mix(col,vec3(.96,.99,1.),foam);alpha=mix(.72,.97,dk);alpha=mix(alpha,1.,fres);alpha=max(alpha,foam);}
 col=mix(col,uFog,fogF);gl_FragColor=vec4(col,alpha);}`});
const waterA=new THREE.Mesh(new THREE.RingGeometry(.1,300,160,100).rotateX(-Math.PI/2),waterMat),waterB=new THREE.Mesh(new THREE.RingGeometry(300,1300,96,10).rotateX(-Math.PI/2),waterMat);
waterA.frustumCulled=waterB.frustumCulled=false;scene.add(waterA,waterB);
const SKU={uT:{value:0},uSun:WU.uSun,uSkyH:WU.uSkyH,uSkyZ:WU.uSkyZ};
const sky=new THREE.Mesh(new THREE.SphereGeometry(600,32,16),new THREE.ShaderMaterial({defines:{CLOUDS:1,FBM_O:4},uniforms:SKU,side:THREE.BackSide,depthWrite:false,depthTest:false,
 vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uT;uniform vec3 uSun,uSkyH,uSkyZ;varying vec3 vP;\n`+NOISE_GLSL+`
void main(){vec3 d=normalize(vP);float y=d.y;vec3 c=mix(uSkyH,uSkyZ,pow(clamp(y,0.,1.),.55));if(y<0.)c=uSkyH;float s=max(dot(d,uSun),0.);c+=vec3(1.,.9,.7)*(pow(s,1800.)*8.+pow(s,50.)*.45+pow(s,6.)*.1);
 
#if CLOUDS
float cl=fbm(d.xz/(max(y,0.)+.3)*1.4+vec2(uT*.012,0.));cl=smoothstep(.52,.82,cl)*smoothstep(0.,.25,y);c=mix(c,vec3(1.),cl*.8);
#endif
gl_FragColor=vec4(c,1.);}`}));
sky.frustumCulled=false;sky.renderOrder=-10;scene.add(sky);
function waterUpdate(t){const un=cam.position.y<-.3?1:0;WU.uT.value=t;SKU.uT.value=t;WU.uUnder.value=un;WU.uFog.value.copy(scene.fog.color);WU.uFogNear.value=scene.fog.near;WU.uFogFar.value=scene.fog.far;
 waterA.position.set(cam.position.x,0,cam.position.z);waterB.position.copy(waterA.position);waterA.renderOrder=waterB.renderOrder=un?-1:1;sky.visible=!un;sky.position.copy(cam.position)}

const sg=new THREE.PlaneGeometry(960,960,150,150);sg.rotateX(-Math.PI/2);
{const p=sg.attributes.position,c=new Float32Array(p.count*3);
for(let i=0;i<p.count;i++){const d=depthAt(p.getX(i),p.getZ(i)),k=clamp((-d-6)/39,0,1);p.setY(i,d);let r0=.8-.7*k,g0=.7-.42*k,b0=.48-.1*k;const x0=p.getX(i),z0=p.getZ(i);let bz=0,bd=1e9;ZONES.forEach(([a,b],zi)=>{const dd=Math.hypot(x0-a,z0-b);if(dd<bd){bd=dd;bz=zi}});const w0=clamp(1-bd/50,0,1)*.85,tt=TINTS[bz];r0+=(tt[0]-r0)*w0;g0+=(tt[1]-g0)*w0;b0+=(tt[2]-b0)*w0;c[i*3]=r0;c[i*3+1]=g0;c[i*3+2]=b0}
sg.setAttribute('color',new THREE.BufferAttribute(c,3));sg.computeVertexNormals()}
const sbm=new THREE.MeshLambertMaterial({vertexColors:true});
sbm.onBeforeCompile=sh=>{sh.uniforms.uT=FT;sh.uniforms.uCau=CAUU;sh.vertexShader='varying vec3 vWp;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);vWp=(modelMatrix*vec4(position,1.)).xyz;');
 sh.fragmentShader='uniform float uT,uCau;varying vec3 vWp;\nfloat cau(vec2 p,float t){vec2 a=p*.5;float v=0.;for(int i=0;i<3;i++){a+=vec2(sin(a.y*1.3+t*.7),cos(a.x*1.1-t*.6))*.7;v+=sin(a.x*3.)*sin(a.y*3.);}v=1.-abs(v/3.);return pow(v,6.);}\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(uCau>.5)diffuseColor.rgb+=vec3(.22,.5,.5)*cau(vWp.xz,uT)*clamp(1.+vWp.y/32.,0.,1.);')};
scene.add(new THREE.Mesh(sg,sbm));
for(const[a,b]of ZONES){
 const d=new THREE.Mesh(new THREE.CircleGeometry(46,40),new THREE.MeshBasicMaterial({color:0x021b30,transparent:true,opacity:.5}));
 d.rotation.x=-Math.PI/2;d.position.set(a,-.9,b);scene.add(d);
 const bc=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,70,12,1,true),new THREE.MeshBasicMaterial({color:0x7ff0ff,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));
 bc.position.set(a,34,b);scene.add(bc);
 for(let i=0;i<20;i++){const ang=rnd(0,6.28),r=rnd(6,44),x=a+Math.cos(ang)*r,z=b+Math.sin(ang)*r,h=rnd(1.5,5);
  const m=new THREE.Mesh(new THREE.ConeGeometry(rnd(.6,1.4),h,6),new THREE.MeshLambertMaterial({color:[0xff7a9c,0xffa84a,0xb48cff,0x6fe3c1][i%4]}));
  m.position.set(x,depthAt(x,z)+h/2,z);scene.add(m)}}
const zoneM=new THREE.Mesh(new THREE.CylinderGeometry(1,1,120,64,1,true),new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));
zoneM.position.y=10;scene.add(zoneM);

// bubbles
const NB=100,bp=new Float32Array(NB*3),bg=new THREE.BufferGeometry();
bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
const bub=new THREE.Points(bg,new THREE.PointsMaterial({color:0xffffff,size:.4,transparent:true,opacity:.6}));bub.frustumCulled=false;scene.add(bub);
function rb(i){bp[i*3]=cam.position.x+rnd(-25,25);bp[i*3+1]=cam.position.y+rnd(-15,5);bp[i*3+2]=cam.position.z+rnd(-25,25)}

// builders
