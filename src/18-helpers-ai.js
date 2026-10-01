/* ---------- helpers AI ---------- */
const tasks=memo(tasks0);
function tasks0(){
  const out=[];
  for(const t of lines()){const src=sourceOf(t);if(src)out.push({src,dst:shelves[t]});}
  if(order&&order.dst){const src=sourceOf(order.type);if(src&&src.unlocked&&src.kind!=='serve')out.push({src,dst:order.dst});}
  for(const m of Object.values(machines)){if(!m.unlocked)continue;const src=sourceOf(m.inT);if(src&&src.unlocked&&src.kind!=='serve')out.push({src,dst:m.inp});}
  return out;
}
function reservedFor(dst,except){let r=0;for(const o of helpers){if(o===except||!o.task||o.task.dst!==dst)continue;r+=o.state==='toSrc'?Math.max(o.want,o.c.total()):o.c.total();}return r;}
function claimedFrom(src,except){let r=0;for(const o of helpers){if(o===except||!o.task||o.task.src!==src||o.state!=='toSrc')continue;r+=Math.max(0,o.want-o.c.total());}return r;}
function helperGo(h,target){h.goal=target.clone();h.path=routeTo(h.g.position,target);h.stuckT=0;}
function setHelperBubble(h,e){if(h.bubE!==e){h.bubE=e;drawBubble(h.bub,e,'');}}
function updHelpers(dt){
  const all=tasks();
  for(const h of helpers){
    const idx=helpers.indexOf(h);if(h.scanT===undefined)h.scanT=idx*0.05;
    h.scanT=(h.scanT||0)-dt;
    if(h.state==='idle'&&h.scanT<=0){h.scanT=0.25;
      let best=null,bs=1e9,bw=0;
      const carrying=h.c.carry.length?h.c.carry[0].type:null;
      for(const tk of all){
        if(carrying&&tk.dst.type!==carrying)continue;
        const avail=tk.dst.space()-reservedFor(tk.dst,h);if(avail<=0)continue;
        const stock=carrying?1:tk.src.count-claimedFrom(tk.src,h);if(stock<=0)continue;
        const fill=(tk.dst.count+tk.dst.incoming+reservedFor(tk.dst,h))/tk.dst.max;
        const d=(carrying?0:travelDist(h.g.position,tk.src.pick))+travelDist(tk.src.pick,tk.dst.dep);
        const sc=fill*2+d/30+(tk.dst.kind==='min'?(tk.dst.fh?-0.2:0.3):0);
        if(sc<bs){bs=sc;best=tk;bw=Math.min(5,avail,carrying?5:stock);}
      }
      if(best){h.task=best;h.want=bw;
        if(carrying){h.state='toDst';helperGo(h,best.dst.dep.clone().add(V3((idx%3-1)*0.4,0,0)));}
        else{h.state='toSrc';helperGo(h,best.src.pick.clone().add(V3((idx%3-1)*0.4,0,0)));}}
      else{h.task=null;h.idleT=(h.idleT||0)+0.25;
        if(!h.path.length&&h.idleT>2.5){h.idleT=0;const a=Math.random()*Math.PI*2;helperGo(h,h.home.clone().add(V3(Math.cos(a)*0.8,0,Math.sin(a)*0.6)));}}
    }
    // move along path
    const before=HB.copy(h.g.position);
    const fr=followPath(h,4.3*(1+0.08*PK('staff')),dt);const moving=fr===true,riding=fr==='ride';
    if(!riding)collide(h.g.position,0.36);
    // keep a little personal space from other helpers and the player
    if(!riding)for(let q=0;q<=helpers.length;q++){const o=q<helpers.length?helpers[q].g.position:player.position;if(o===h.g.position||Math.abs(o.y-h.g.position.y)>1)continue;const dx=h.g.position.x-o.x,dz=h.g.position.z-o.z,d=Math.hypot(dx,dz);if(d>0.01&&d<0.75){const k=(0.75-d)*0.5;h.g.position.x+=dx/d*k;h.g.position.z+=dz/d*k;}}
    // stuck recovery
    if(moving&&h.g.position.distanceTo(before)<speedEps(dt)){h.stuckT+=dt;if(h.stuckT>1.2&&h.goal){h.stuckT=0;h.path=routeTo(h.g.position,h.goal);if(++h.retries>3){h.retries=0;h.path=[];h.state=h.c.total()?'idle':'idle';h.task=null;}}}else{h.stuckT=0;}
    animChar(h.ch,moving,T*0.95+idx,h.c.carry.length>0,riding);h.c.layout();
    const tk=h.task;
    setHelperBubble(h,!tk?'💤':(h.state==='toSrc'?ITEM[tk.src.type].e:ITEM[tk.dst.type].e));
    if(moving||riding)continue;h.t+=dt;if(h.t<0.16)continue;h.t=0;h.retries=0;
    if(!tk)continue;
    if(h.state==='toSrc'){
      if(tk.src.count>0&&h.c.total()<h.want)takeFrom(tk.src,h.c);
      else if(h.c.incoming===0&&h.c.carry.length>0){h.state='toDst';helperGo(h,tk.dst.dep.clone().add(V3((idx%3-1)*0.4,0,0)));}
      else if(h.c.total()===0){h.waitT=(h.waitT||0)+0.16;if(h.waitT>2){h.waitT=0;h.state='idle';h.task=null;}}
    }else if(h.state==='toDst'){
      if(h.c.has(tk.dst.type)&&tk.dst.space()>0){depositTo(tk.dst,h.c);h.waitT=0;}
      else if(h.c.carry.length===0){h.state='idle';h.task=null;}
      else{h.waitT=(h.waitT||0)+0.16;if(h.waitT>4){h.waitT=0;h.state='idle';h.task=null;}}
    }
  }
}
const speedEps=dt=>3.9*dt*0.15;const HB=new THREE.Vector3();

/* ---------- guide arrow ---------- */
const arrow=new THREE.Group();const cone=add(new THREE.ConeGeometry(0.34,0.7,4),0xffd23f,0,0,0,arrow,false);cone.rotation.x=Math.PI;arrow.userData.live=1;scene.add(arrow);
let guideOverride=null;
function guide(){if(guideOverride&&T>guideOverride.until)guideOverride=null;const g=guideOverride?guideOverride.p:guide0();if(g&&f2Open&&floorOf(g.x)!==floorOf(player.position.x))return floorOf(player.position.x)===1?UP_ENTRY:DN_ENTRY;return g;}
function guide0(){
  const pp=player.position;
  if(pc.carry.length){let best=null,bd=1e9;for(const d of allDests()){if(pc.has(d.type)&&d.space()>0){const dd=d.dep.distanceTo(pp);if(dd<bd){bd=dd;best=d;}}}if(best)return best.dep;}
  for(const co of checkouts)if(co.unlocked&&!co.cashier&&coWaiting(co))return co.reg;
  for(const co of allPiles())if(co.stack.length)return co.pile;
  let best=null;for(const p of pads){if(p.visible&&money>=padCost(p)-p.paid-0.01&&(!best||padCost(p)<padCost(best)))best=p;}
  if(best)return best.pt||(best.pt=V3(best.x,0,best.z));
  if(pc.total()<cap()){let bt=null,bs=1e9;for(const tk of tasks()){if(tk.src.count>0&&tk.dst.space()>0){const s=tk.dst.count/tk.dst.max;if(s<bs){bs=s;bt=tk;}}}if(bt)return bt.src.pick;}
  return null;
}

