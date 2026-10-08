// state + input
let running=false,over=false,T=0,zoneR=300,zoneCX=0,zoneCZ=0,nextZoneCX=0,nextZoneCZ=0,nextZoneR=300,zonePhase=0,zoneState='initial',zoneClock=0,zoneMoveAt=0,zoneHasNext=false,zoneNoticePhase=-1,zoneMoveNoticePhase=-1,locked=false,wasLocked=false,firing=false,drag=false,ads=false,started=false,msgT=0,swimActive=false,diveAction=0,planeLookActive=false;
const keys={},D=new V(),V0=new V(),tr=[];
function msg(t){if(IS_TOUCH)t=T2(t);$('msg').textContent=t;msgT=2.5}
function syncSwimUi(){
 const on=!!swimActive;
 const desktop=$('swimBtn'),mobile=$('bSwim');
 if(desktop){desktop.classList.toggle('swim-on',on);desktop.setAttribute('aria-pressed',String(on));desktop.firstChild.textContent=on?'SWIM ON':'SWIM'}
 if(mobile){mobile.classList.toggle('swim-on',on);mobile.setAttribute('aria-pressed',String(on));mobile.textContent=on?'SWIM ON':'SWIM'}
}
function setSwim(on){swimActive=!!on;syncSwimUi()}
function toggleSwim(){setSwim(!swimActive)}
function resetSwim(){setSwim(false)}
function markPlaneLook(){if(P.ph==='plane')planeLookActive=true}
function contextualDive(){if(!running||over||P.ph!=='play'||P.boat)return;diveAction=P.pos.y<-1.2?-1:1}
function updateDiveAction(){if(diveAction===1&&P.pos.y<-1.2)diveAction=0;else if(diveAction===-1&&P.pos.y>=-.3)diveAction=0}
function resetDiveAction(){diveAction=0}
