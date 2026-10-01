/* ---------- characters ---------- */
const CG={body:new THREE.CylinderGeometry(0.3,0.36,0.6,12),hip:new THREE.SphereGeometry(0.36,12,8),head:new THREE.SphereGeometry(0.3,14,10),
  eye:new THREE.SphereGeometry(0.045,6,4),cheek:new THREE.SphereGeometry(0.055,6,4),leg:new THREE.CylinderGeometry(0.1,0.09,0.4,7),
  arm:new THREE.CylinderGeometry(0.075,0.07,0.42,7),hat:new THREE.SphereGeometry(0.33,12,6,0,Math.PI*2,0,Math.PI/2),pom:new THREE.SphereGeometry(0.09,7,5)};
/* Every new shopper look (colour x skin x hat x variant, ~900 combinations) used to bake and keep
   its own ~100 KB geometry forever. Geometry is now reference-counted: a small set of recently
   used looks stays cached, the rest is freed from GPU memory when nobody wears it. */
const charRef=new Map(),charIdle=[];
function releaseChar(g){const k=g&&g.userData.ck;if(!k||g.userData.released)return;g.userData.released=1;const n=(charRef.get(k)||1)-1;charRef.set(k,n);
  if(n<=0){charIdle.push(k);while(charIdle.length>28){const old=charIdle.shift();if((charRef.get(old)||0)>0)continue;const geo=mergeCache.get(old);if(geo){geo.dispose();mergeCache.delete(old);}charRef.delete(old);}}}
function part(geo,c,x,y,z,p){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;}
function makeChar(color,o={}){
  const g=new THREE.Group();const skin=o.skin||0xffe2c2;const ck='c:'+color+':'+JSON.stringify(o);
  const body=mergedGroup(ck,()=>{const t=new THREE.Group();charStatic(t,color,skin,o);return t;});g.add(body.children[0]);
  g.userData.live=1;g.userData.ck=ck;charRef.set(ck,(charRef.get(ck)||0)+1);
  const limb=(geo,x,y,len)=>{const p=new THREE.Group();p.position.set(x,y,0);p.userData.limb={geo,len};g.add(p);return p;};
  const legL=limb(CG.leg,-0.15,0.38,0.4),legR=limb(CG.leg,0.15,0.38,0.4),armL=limb(CG.arm,-0.37,1.02,0.42),armR=limb(CG.arm,0.37,1.02,0.42);
  const ch={g,legL,legR,armL,armR,col:new THREE.Color(color)};g.userData.chr=ch;LIMB.chars.add(ch);return ch;
}
function charStatic(g,color,skin,o){
  part(CG.hip,color,0,0.45,0,g).scale.y=0.55;part(CG.body,color,0,0.8,0,g);part(CG.head,skin,0,1.38,0,g);
  part(CG.eye,0x222222,-0.1,1.42,0.27,g);part(CG.eye,0x222222,0.1,1.42,0.27,g);
  if(o.backpack){box(0.42,0.46,0.2,o.backpack,0,0.86,-0.36,g);box(0.3,0.16,0.06,0xffffff,0,0.8,-0.47,g);}
  if(o.elder){part(CG.hat,0xdedede,0,1.4,-0.02,g).scale.set(1,0.8,1);}
  if(o.sprout){part(CG.hat,0x3f9f3a,0,1.42,0,g).scale.set(1,0.55,1);box(0.36,0.035,0.22,0x3f9f3a,0,1.46,0.3,g);}
  if(o.apron)box(0.46,0.42,0.06,0xffffff,0,0.8,0.33,g);
  if(o.hat){part(CG.hat,o.hat,0,1.42,0,g);part(CG.pom,0xffffff,0,1.76,0,g);}
  if(o.straw){cyl(0.52,0.52,0.04,o.straw,0,1.6,0,g,16);cyl(0.24,0.27,0.2,o.straw,0,1.71,0,g,14);cyl(0.275,0.275,0.05,0xd9534f,0,1.64,0,g,14);}
  if(o.visor){part(CG.hat,o.visor,0,1.42,0,g);box(0.34,0.03,0.22,o.visor,0,1.45,0.34,g);}
}
function limbSet(geo){let s=LIMB.sets.get(geo);if(!s){const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),LIMB.MAX);im.setColorAt(0,new THREE.Color(0xffffff));im.count=0;im.frustumCulled=false;   // allocate the full colour buffer while count===MAX
  im.castShadow=false;im.receiveShadow=true;im.userData.live=1;scene.add(im);s={im,n:0};LIMB.sets.set(geo,s);}return s;}
function limbOff(len){let m=LIMB.offs.get(len);if(!m){m=new THREE.Matrix4().makeTranslation(0,-len/2,0);LIMB.offs.set(len,m);}return m;}
/* called once per frame after matrices are up to date: writes every visible character's limbs into the batches */
function limbsTick(){for(const s of LIMB.sets.values())s.n=0;
  for(const ch of LIMB.chars){const g=ch.g;if(!g.parent){LIMB.chars.delete(ch);continue;}
    if(!g.visible||g.userData.lodOn===false||(g.parent!==scene&&!g.parent.visible))continue;
    for(const p of [ch.legL,ch.legR,ch.armL,ch.armR]){const L0=p.userData.limb,s=limbSet(L0.geo);if(s.n>=LIMB.MAX)continue;
      LIMB.m4.multiplyMatrices(p.matrixWorld,limbOff(L0.len));s.im.setMatrixAt(s.n,LIMB.m4);s.im.setColorAt(s.n,ch.col);s.n++;}}
  for(const s of LIMB.sets.values()){s.im.count=s.n;s.im.instanceMatrix.needsUpdate=true;if(s.im.instanceColor)s.im.instanceColor.needsUpdate=true;}}
function animChar(ch,moving,t,carrying,riding){
  const s=moving?Math.sin(t*14):0;
  ch.legL.rotation.x=s*0.7;ch.legR.rotation.x=-s*0.7;
  if(carrying){ch.armL.rotation.x=ch.armR.rotation.x=-1.25;}else{ch.armL.rotation.x=-s*0.6;ch.armR.rotation.x=s*0.6;}
  if(!riding)ch.g.position.y=floorY(ch.g.position.x)+(moving?Math.abs(Math.sin(t*14))*0.06:0);
}
const FRU=new THREE.Frustum(),FRM=new THREE.Matrix4(),FSP=new THREE.Sphere(new THREE.Vector3(),1.7);
function setCast(g,on){g.traverse(o=>{if(!o.isMesh)return;if(o.userData.cs0===undefined)o.userData.cs0=o.castShadow;o.castShadow=on&&o.userData.cs0;});}
function lodChar(g){FSP.center.set(g.position.x,g.position.y+1,g.position.z);const on=FRU.intersectsSphere(FSP);if(g.userData.lodOn!==on){g.userData.lodOn=on;setCast(g,on);}return on;}
/* The shadow camera covers more of the town than the screen does, so shoppers just outside the view
   were still drawn into the shadow map and animated every frame. Now only on-screen ones are. */
function charLOD(){camera.updateMatrixWorld();FRM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FRU.setFromProjectionMatrix(FRM);
  for(const c of customers)lodChar(c.g);for(const h of helpers)lodChar(h.g);for(const w of walkers)lodChar(w.ch.g);for(const p of gCust.values())lodChar(p.g);for(const p of gHelpers)lodChar(p.g);}
const onScreen=g=>g.userData.lodOn!==false;
function faceTo(g,ang,dt){let d=ang-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*Math.min(1,dt*12);}
function stepToward(g,tg,speed,dt){const dx=tg.x-g.position.x,dz=tg.z-g.position.z,d=Math.hypot(dx,dz);if(d<0.04)return false;const s=Math.min(d,speed*dt);g.position.x+=dx/d*s;g.position.z+=dz/d*s;faceTo(g,Math.atan2(dx,dz),dt);return true;}
function collide(p,r){
  for(const s of solids){if(!s.active)continue;
    const cx=Math.max(s.x0,Math.min(p.x,s.x1)),cz=Math.max(s.z0,Math.min(p.z,s.z1));
    const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-6){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}
      else{const l=p.x-s.x0,rr=s.x1-p.x,t=p.z-s.z0,b=s.z1-p.z,m=Math.min(l,rr,t,b);
        if(m===l)p.x=s.x0-r;else if(m===rr)p.x=s.x1+r;else if(m===t)p.z=s.z0-r;else p.z=s.z1+r;}}
  }
}
const near=(p,q,r)=>Math.hypot(p.x-q.x,p.z-q.z)<r;

/* ---------- tweens & pops ---------- */
const tweens=[],pops=[];
function fly(mesh,from,toFn,dur,done,arc=1.2){mesh.position.copy(from);mesh.rotation.set(0,0,0);scene.add(mesh);tweens.push({mesh,from:from.clone(),toFn,t:0,dur,done,arc});}
function pop(o,s0=0.15){o.scale.setScalar(s0);if(o.userData.frozen)o.matrixAutoUpdate=true;pops.push({o,s0,t:0});}
function updFx(dt){
  for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const k=Math.min(1,w.t/w.dur);w.mesh.position.lerpVectors(w.from,w.toFn(),k);w.mesh.position.y+=Math.sin(k*Math.PI)*w.arc;
    if(k>=1){tweens.splice(i,1);w.done&&w.done();}}
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt;const k=Math.min(1,p.t/0.28),q=k-1;const e=1+2.70158*q*q*q+1.70158*q*q;p.o.scale.setScalar(Math.max(0.01,p.s0+(1-p.s0)*e));if(k>=1){p.o.scale.setScalar(1);if(p.o.userData.frozen){p.o.updateMatrix();p.o.matrixAutoUpdate=false;}pops.splice(i,1);}}
}

