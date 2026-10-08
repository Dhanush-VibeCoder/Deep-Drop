// boats, player, bots
const boats=[],BCOL=[0xff7a3d,0x3ddc97,0x4da6ff,0xffd23f,0xb36bff,0xff5a4d];
function addBoat(x,z,h){const m=mkBoat(BCOL[boats.length%6]);m.position.set(x,0,z);m.rotation.y=h;scene.add(m);m.rotation.order='YXZ';boats.push({m,pos:m.position,h,sp:0,rider:null,vel:new V(),av:0,pt:0,rl:0})}
[[5,178,.3],[-22,172,-.4],[-150,-20,1.2],[150,30,-1.8],[-20,-170,2.6],[-70,100,.8],[260,90,.5],[-250,100,2],[170,-220,-1],[-100,260,1.4],[0,-290,.2],[290,-100,3]].forEach(a=>addBoat(...a));
const P={pos:new V(0,0,185),yaw:0,pitch:-.1,hp:100,o2:100,sl:[null,null],cur:0,v:new V(),ph:'play',vy:0,hx:0,hz:0,cr:0,ch:null,hint:0,walls:0,domes:0,wcd:0,rel:0,bloom:0,fl:0,trig:false,coins:0,kits:0,kills:0,boat:null,cd:0,m:mkDiver(0x2ec4b6,SK[0])};scene.add(P.m);P.sl[0]={k:'pt',mag:15,res:45};setHeld(P.m,'pt');
const bots=[];const BC=[0xff5a4d,0xff9f1c,0xc77dff,0xf15bb5,0xb5e48c,0xffffff,0xff7b00];
for(let i=0;i<7;i++){const a=i/7*6.283+rnd(-.2,.2),r=rnd(110,190),m=mkDiver(BC[i],SK[i%4]),pos=new V(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(m);addBoat(pos.x+rnd(6,10),pos.z+rnd(6,10),rnd(0,6));setHeld(m,'pt');bots.push({m,pos,hp:100,o2:100,gun:true,k:'pt',alive:true,cd:1,tag:mkTag(i),boat:null,col:BC[i],ph:'play',vy:0,hx:0,hz:0,v:new V()})}

