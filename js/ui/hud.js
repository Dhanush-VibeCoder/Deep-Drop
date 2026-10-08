// Navigation HUD presentation. World position, heading, zone radius, boats, and zones remain authoritative elsewhere.
const NAV_DIRS=['N','NE','E','SE','S','SW','W','NW'],NAV_ARROWS=['&#8593;','&#8599;','&#8594;','&#8600;','&#8595;','&#8601;','&#8592;','&#8598;'];
const NAV_ZONE_COLORS=['#5ff3ff','#b86bff','#ff8a30','#6fd889','#d5e7ed','#7892ff','#ff9ac0','#ffc928','#9dffd0'];
function navBearing(){return ((-P.yaw*180/Math.PI)%360+360)%360}
function navDelta(a){return (a+540)%360-180}
function navMapPoint(x,z,sx,sz,scale){return[75+(x-sx)*scale,75+(z-sz)*scale]}
function navZoneIcon(c,x,y,i){const col=NAV_ZONE_COLORS[i%NAV_ZONE_COLORS.length];c.save();c.translate(x,y);c.fillStyle=col;c.strokeStyle='#dffcff';c.lineWidth=1;
 if(i%4===0){c.beginPath();c.arc(0,0,3.2,0,6.283);c.fill();c.stroke()}
 else if(i%4===1){c.rotate(.785);c.fillRect(-3, -3,6,6)}
 else if(i%4===2){c.beginPath();c.moveTo(0,-4);c.lineTo(4,3);c.lineTo(-4,3);c.closePath();c.fill();c.stroke()}
 else{c.beginPath();c.moveTo(-4,0);c.lineTo(0,-4);c.lineTo(4,0);c.lineTo(0,4);c.closePath();c.fill();c.stroke()}c.restore()}
function navBoatIcon(c,x,y,h){const dx=-Math.sin(h),dz=-Math.cos(h);c.save();c.translate(x,y);c.rotate(Math.atan2(dz,dx));c.fillStyle='#7ff0ff';c.strokeStyle='#e6ffff';c.lineWidth=1;c.beginPath();c.moveTo(5,0);c.lineTo(-3,-3);c.lineTo(-2,3);c.closePath();c.fill();c.stroke();c.restore()}
function navDrawMap(){const c=$('mm').getContext('2d'),scale=.22,sx=zoneM.position.x,sz=zoneM.position.z,t=performance.now()/1000,rad=71;
 c.clearRect(0,0,150,150);c.save();c.beginPath();c.arc(75,75,rad,0,6.283);c.clip();c.fillStyle='#031c2b';c.fillRect(0,0,150,150);
 c.fillStyle='rgba(255,64,70,.14)';c.beginPath();c.arc(75,75,rad,0,6.283);c.fill();
 const zr=clamp(zoneR*scale,2,rad);c.fillStyle='rgba(20,101,135,.42)';c.beginPath();c.arc(75,75,zr,0,6.283);c.fill();
 c.strokeStyle='rgba(92,214,255,.72)';c.lineWidth=1;c.beginPath();c.arc(75,75,zr,0,6.283);c.stroke();
 c.strokeStyle='rgba(255,75,70,'+(.58+.25*Math.sin(t*4))+')';c.lineWidth=2.5;c.setLineDash([5,3]);c.beginPath();c.arc(75,75,zr,0,6.283);c.stroke();c.setLineDash([]);
 if(zoneHasNext){const np=navMapPoint(nextZoneCX,nextZoneCZ,sx,sz,scale),nr=clamp(nextZoneR*scale,2,rad);c.strokeStyle='rgba(255,210,63,.9)';c.lineWidth=1.5;c.setLineDash([4,3]);c.beginPath();c.arc(np[0],np[1],nr,0,6.283);c.stroke();c.setLineDash([]);c.fillStyle='rgba(255,210,63,.9)';c.beginPath();c.arc(np[0],np[1],2.5,0,6.283);c.fill()}
 for(let i=0;i<ZONES.length;i++){const p=navMapPoint(ZONES[i][0],ZONES[i][1],sx,sz,scale);if(Math.hypot(p[0]-75,p[1]-75)<rad-3)navZoneIcon(c,p[0],p[1],i)}
 if(PL.on){const a=navMapPoint(PL.s.x,PL.s.z,sx,sz,scale),b=navMapPoint(PL.e.x,PL.e.z,sx,sz,scale);c.strokeStyle='rgba(255,210,63,.72)';c.lineWidth=1.5;c.setLineDash([5,4]);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([])}
 for(const b of boats){if(b.rider&&b.rider!==P)continue;const p=navMapPoint(b.pos.x,b.pos.z,sx,sz,scale);if(Math.hypot(p[0]-75,p[1]-75)<rad-3)navBoatIcon(c,p[0],p[1],b.h)}
 c.fillStyle='#ff5a4d';for(const b of bots)if(b.alive&&b.pos.distanceTo(P.pos)<75){const p=navMapPoint(b.pos.x,b.pos.z,sx,sz,scale);c.fillRect(p[0]-2,p[1]-2,4,4)}
 const pp=navMapPoint(P.pos.x,P.pos.z,sx,sz,scale),fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);c.strokeStyle='#fff';c.fillStyle='#ffd23f';c.lineWidth=1.5;c.beginPath();c.arc(pp[0],pp[1],4,0,6.283);c.fill();c.stroke();c.beginPath();c.moveTo(pp[0]+fx*13,pp[1]+fz*13);c.lineTo(pp[0]-fz*4-fx*2,pp[1]+fz*2-fx*4);c.lineTo(pp[0]+fz*4-fx*2,pp[1]-fz*2-fx*4);c.closePath();c.fill();
 const target=zoneHasNext?navMapPoint(nextZoneCX,nextZoneCZ,sx,sz,scale):[75,75];c.strokeStyle='rgba(127,240,255,.62)';c.lineWidth=1;c.beginPath();c.moveTo(pp[0],pp[1]);c.lineTo(target[0],target[1]);c.stroke();c.restore();c.strokeStyle='#5cd6ff99';c.lineWidth=1.5;c.beginPath();c.arc(75,75,rad,0,6.283);c.stroke()}
function navUpdateCompass(){const bearing=navBearing(),active=Math.round(bearing/45)%8,els=$('compassTicks').children;for(let i=0;i<els.length;i++)els[i].classList.toggle('active',i===active);$('navCompass').setAttribute('data-heading',NAV_DIRS[active])}
function navUpdateSafe(){const targetX=zoneHasNext?nextZoneCX:zoneCX,targetZ=zoneHasNext?nextZoneCZ:zoneCZ,dx=targetX-P.pos.x,dz=targetZ-P.pos.z,d=Math.hypot(dx,dz),el=$('safeNav'),inside=!zoneHasNext&&zoneDistance(P.pos.x,P.pos.z)<=zoneR;el.style.display=started&&!over?'flex':'none';$('safeNavLabel').textContent=zoneHasNext?'NEXT SAFE ZONE':'SAFE ZONE';$('safeNavDist').textContent=inside?'SAFE':d>=1000?(d/1000).toFixed(1)+'km':Math.round(d)+'m';if(inside){$('safeNavDir').innerHTML='&#8226;';return}const target=((Math.atan2(dx,-dz)*180/Math.PI)%360+360)%360,delta=navDelta(target-navBearing()),i=Math.round((delta+360)%360/45)%8;$('safeNavDir').innerHTML=NAV_ARROWS[i]}
function navUpdateStatus(){const underwater=P.ph==='play'&&P.pos.y<-1.2,air=P.ph!=='play';$('navState').textContent=air?'AIR':underwater?'UNDERWATER':'SURFACE';$('navDepth').textContent=underwater?Math.max(0,Math.round(-P.pos.y))+'m':''}
function navHudUpdate(){if(!started)return;navDrawMap();navUpdateCompass();navUpdateSafe();navUpdateStatus()}
