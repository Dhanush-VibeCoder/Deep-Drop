// loot
const loot=[];
function spawnLoot(type,p,k,v){const m=mkLoot(type,k);m.position.copy(p);scene.add(m);loot.push({type,k,m,dyn:!!v,v:v||null,pos:p.clone(),alive:true,ph:Math.random()*6})}
ZONES.forEach(([a,b],zi)=>{for(let i=0;i<12;i++){const ang=rnd(0,6.28),r=Math.sqrt(Math.random())*30,x=a+Math.cos(ang)*r,z=b+Math.sin(ang)*r;
 spawnLoot(i<3?'gun':i<6?'kit':'coin',new V(x,depthAt(x,z)+rnd(2,18),z),KS[(zi+i)%4])}
 for(let i=0;i<3;i++){const ang=rnd(0,6.28),r=Math.sqrt(Math.random())*30,x=a+Math.cos(ang)*r,z=b+Math.sin(ang)*r;spawnLoot('wall',new V(x,depthAt(x,z)+rnd(2,12),z))}
 {const ang=rnd(0,6.28),r=rnd(2,10),x=a+Math.cos(ang)*r,z=b+Math.sin(ang)*r;spawnLoot('dome',new V(x,depthAt(x,z)+rnd(1.5,4),z))}});

