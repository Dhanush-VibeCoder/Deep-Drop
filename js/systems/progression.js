// Shared quality/performance state. Preset aliases keep older saved settings valid.
const XL=[],MOTES=[],_cd=new V(),_ct=new V(),_bd=new V();let PMAX=120,FQ=1,FOGM=1,DYN=1,WL=2,HF=0,MF=0,Q;
const CAUU={value:1};
const PRE={performance:{res:60,adapt:true,fps:30,water:0,clouds:false,caust:false,lights:false,grass:15,fish:35,fx:40,dist:0},
 balanced:{res:80,adapt:true,fps:45,water:1,clouds:true,caust:true,lights:true,grass:45,fish:65,fx:70,dist:1},
 high:{res:100,adapt:true,fps:60,water:2,clouds:true,caust:true,lights:true,grass:100,fish:100,fx:100,dist:2}};
// low/med are the persisted values used by older builds and remain supported.
PRE.low=PRE.performance;PRE.med=PRE.balanced;
Q={res:PRE.high.res,adapt:PRE.high.adapt,fps:PRE.high.fps,water:PRE.high.water,clouds:PRE.high.clouds,caust:PRE.high.caust,lights:PRE.high.lights,grass:PRE.high.grass,fish:PRE.high.fish,fx:PRE.high.fx,dist:PRE.high.dist};
