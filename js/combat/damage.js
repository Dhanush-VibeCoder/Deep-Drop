const HEAD=new V(0,.75,0);
function rayS(o,d,c,r){const oc=c.clone().sub(o),t=oc.dot(d);if(t<0)return -1;const q=oc.lengthSq()-t*t;return q<r*r?t-Math.sqrt(r*r-q):-1}
function dmgNum(pt,v,head){const p=pt.clone().project(cam);if(p.z>1)return;const d=document.createElement('div');d.className='dn'+(head?' h':'');d.textContent=v;
 d.style.left=(p.x*.5+.5)*innerWidth+'px';d.style.top=(-p.y*.5+.5)*innerHeight+'px';$('hud').appendChild(d);setTimeout(()=>d.remove(),800)}
