document.addEventListener('mousemove',e=>{if(!running||!(locked||drag))return;markPlaneLook();P.yaw-=e.movementX*.0025;P.pitch=clamp(P.pitch-e.movementY*.0025,-1.3,1.3)});
cv.addEventListener('mousedown',e=>{if(e.button===2){ads=true;return}if(locked)firing=true;else drag=true});cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mouseup',e=>{firing=false;drag=false;if(e.button===2)ads=false});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;
 if(wasLocked&&!locked&&running&&!over){firing=false;drag=false;ads=false;running=false;showOv('Paused','Click to get back in the water.','Resume',true)}wasLocked=locked});
