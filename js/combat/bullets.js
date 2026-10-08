function tracer(a,b,c){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:c}));scene.add(l);tr.push({l,t:.07})}
