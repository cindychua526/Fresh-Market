/* ---------- main update ---------- */
let T=0,spawnT=2;
const camT=player.position.clone();
const pRide={g:player,path:[],rideLeg:-1,onTeleport:()=>{camT.copy(player.position);flash();}};let rideCool=0;
const fadeEl=document.createElement('div');fadeEl.style.cssText='position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4';document.body.appendChild(fadeEl);
function flash(){fadeEl.style.transition='none';fadeEl.style.opacity=0.85;requestAnimationFrame(()=>{fadeEl.style.transition='opacity .45s';fadeEl.style.opacity=0;});toast(floorOf(player.position.x)===2?'🛗 二楼 · 生活馆':'🛗 一楼 · 小镇鲜市');}
function update(dt){
  rideCool-=dt;localEmoTick();
  if(!pRide.path.length&&rideCool<=0&&f2Open){const pp=player.position;
    if(floorOf(pp.x)===1&&near(pp,UP_ENTRY,0.6))pRide.path=[UP_NODE];else if(floorOf(pp.x)===2&&near(pp,DN_ENTRY,0.6))pRide.path=[DN_NODE];}
  const riding=pRide.path.length>0;
  if(riding){followPath(pRide,0,dt);if(!pRide.path.length){rideCool=1.2;}}
  let ix=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0),iz=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0);
  if(joy.active){ix+=joy.dx;iz+=joy.dy;}
  let mag=Math.hypot(ix,iz);if(mag>1){ix/=mag;iz/=mag;mag=1;}
  if(mag>0.12||riding){tapPath.length=0;}
  else if(tapPath.length){tapT+=dt;const n=tapPath[0],dx=n.x-player.position.x,dz=n.z-player.position.z,d=Math.hypot(dx,dz);
    if(d<0.3){tapPath.shift();}else{ix=dx/d;iz=dz/d;mag=Math.min(1,d/0.6+0.35);}if(tapT>15)tapPath.length=0;}
  if(tapMark.visible){const k=tapMark.scale.x;tapMark.scale.setScalar(k+(1-k)*Math.min(1,dt*10));if(!tapPath.length)tapMark.visible=false;}
  const moving=mag>0.12&&!riding;if(moving||riding||tapPath.length||joy.active)PACE.idle=0;
  if(moving){const sp=speed()*mag;player.position.x+=ix/mag*sp*dt;player.position.z+=iz/mag*sp*dt;faceTo(player,Math.atan2(ix,iz),dt);
    if(!hinted){hinted=true;hint.style.opacity=0;}}
  if(!riding){collide(player.position,0.4);
    if(floorOf(player.position.x)===2){player.position.x=Math.max(58.4,Math.min(119.6,player.position.x));player.position.z=Math.max(-13.8,Math.min(-0.3,player.position.z));}
    else{player.position.x=Math.max(-20.3,Math.min(46,player.position.x));player.position.z=Math.max(-13.8,Math.min(15.5,player.position.z));}}
  animChar(pch,moving,T,pc.carry.length>0,riding);
  pc.sway+=((moving?mag:0)-pc.sway)*Math.min(1,dt*6);pc.layout();
  maxTag.s.visible=pc.total()>=cap();maxTag.s.position.set(0,0.95+pc.carry.length*0.42+0.45,0.52);
  rhyTick();
  if(NET.mode==='guest'){guestUpdate(dt);updSparks(dt);updTown(dt);updDay(dt);cardTick(dt);updEscalators(dt);updFx(dt);updGuide(dt);updCamera(dt);updHud();netTick(dt);return;}

  // production
  for(const k in producers){const pr=producers[k];if(!pr.unlocked||pr.count>=pr.max)continue;
    pr.t+=dt;if(pr.t>=pr.iv*boost()*Math.pow(BAL.stSpeed,stLv['p:'+k]||0)){pr.t=0;pr.count++;pr.refresh();pop(pr.slots[pr.count-1],0.1);}}
  for(const k in machines){const m=machines[k];if(!m.unlocked)continue;
    if(m.fh){m.sup=(m.sup||0)+dt;if(m.sup>5&&m.inp.count+m.inp.incoming<m.inp.max){m.sup=0;m.inp.count++;m.inp.refresh();}}
    const working=m.inp.count>0&&m.out.count<m.out.max;
    if(working){m.t+=dt;if(m.t>=m.time*boost()*Math.pow(BAL.stSpeed,stLv['m:'+k]||0)){m.t=0;m.inp.count--;m.inp.refresh();m.out.count++;m.out.refresh();pop(m.out.slots[m.out.count-1],0.1);m.freshAt=T;}}
    m.freshS.s.visible=!m.fh&&m.out.count>0&&T-m.freshAt<FRESH_S;
    m.body.scale.y=working?1+Math.sin(T*22)*0.03:1;if(m.chef){m.chef.armL.rotation.x=working?-1.2+Math.sin(T*14)*0.4:0;m.chef.armR.rotation.x=working?-1.2-Math.sin(T*14)*0.4:0;}m.glowMat.emissiveIntensity=working?0.7+Math.sin(T*8)*0.3:0;}

  for(const a of actors())actorInteract(a,dt);
  for(const co of checkouts){if(!co.unlocked)continue;
    const front=co.queue[0];
    if(front&&front.arrived){const meHere=!co.cashier&&!LOCAL.riding&&floorOf(player.position.x)===co.floor&&near(player.position,co.reg,1.2);
      const staffed=co.cashier||meHere||actors().some(a=>near(a.g.position,co.reg,1.2));
      if(staffed){co.checkT+=dt;if(meHere){rhyShow();if(RHY.hit!=null){const q=RHY.hit;RHY.hit=null;co.checkT=0;checkout(co,front,q);}else if(co.checkT>1.2){co.checkT=0;checkout(co,front,0);}}
        else if(co.checkT>(co.cashier?0.85:0.5)){co.checkT=0;checkout(co,front);}}else co.checkT=0;}
    if(co.cashier)co.cashier.armL.rotation.x=front&&front.arrived?-1+Math.sin(T*16)*0.3:0;
    co.ring.material.opacity=0.55+Math.sin(T*5)*0.25;
  }
  for(const p of pads){if(p.dirty&&p.visible&&T-(p.drawT||-9)>0.08){drawPad(p);p.dirty=false;p.drawT=T;}if(p.visible){const ok=money>=padCost(p)-p.paid;p.mesh.scale.setScalar(ok?1+Math.sin(T*5)*0.04:1);}}
  updPromo(dt);updDay(dt);cardTick(dt);

  // customers
  const ls=lines().length;spawnT+=dt;
  const active=customers.filter(c=>c.state!=='leave').length;
  const interval=Math.max(0.55,3.4-0.25*ls-0.3*adsLvl())*(promo?0.7:1)*(isNight()?1.6:1)*(curFest?0.75:1)*(isRaining()?1.25:1)*(TW()===1?0.9:1)*(hasT('park')?0.88:1)*(RUSH.t>0?0.35:1);
  const parkCap=(hasT('park')?3:0)+(RUSH.t>0?6:0);
  if(ls&&spawnT>interval&&active<Math.min(24+parkCap,2+2*ls+2*adsLvl()+parkCap)){spawnT=0;spawnCustomer();}
  updCustomers(dt);updHelpers(dt);updSparks(dt);updTown(dt);updTruck(dt);updElevator(dt);updEscalators(dt);updFx(dt);

  remoteUpdate(dt);updGuide(dt);updCamera(dt);updHud();netTick(dt);
}
function updGuide(dt){
  const g=guide();arrow.visible=!!g;
  if(g){arrow.position.x+=(g.x-arrow.position.x)*Math.min(1,dt*8);arrow.position.z+=(g.z-arrow.position.z)*Math.min(1,dt*8);arrow.position.y=floorY(g.x)+2.3+Math.sin(T*5)*0.25;arrow.rotation.y+=dt*2.5;}
}
function updCamera(dt){
  camT.lerp(player.position,Math.min(1,dt*6));
  camZTimer-=dt;if(camZTimer<=0)camZT=1;camZ+=(camZT*userZoom-camZ)*Math.min(1,dt*3);
  const f=(camera.aspect<0.75?1.75:1.1)*camZ;
  camera.position.set(camT.x,camT.y+16*f,camT.z+12*f);camera.lookAt(camT.x,camT.y+0.5,camT.z-0.5);
  placeSun(camT.x,camT.y,camT.z-2);
}
const SUN_OFF=V3(-10,24,12),SUN_Z=SUN_OFF.clone().normalize(),SUN_X=new THREE.Vector3().crossVectors(V3(0,1,0),SUN_Z).normalize(),SUN_Y=new THREE.Vector3().crossVectors(SUN_Z,SUN_X),SUN_T=new THREE.Vector3();
function placeSun(x,y,z){const tx=48/sun.shadow.mapSize.x;SUN_T.set(x,y,z);const a=SUN_T.dot(SUN_X),b=SUN_T.dot(SUN_Y);
  SUN_T.addScaledVector(SUN_X,Math.round(a/tx)*tx-a).addScaledVector(SUN_Y,Math.round(b/tx)*tx-b);sun.target.position.copy(SUN_T);sun.position.copy(SUN_T).add(SUN_OFF);}

