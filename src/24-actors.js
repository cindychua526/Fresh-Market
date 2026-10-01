/* ---------- actors: you + friends standing in this shop ---------- */
const LOCAL={id:'me',g:player,c:pc,stand:{},collectT:0,get riding(){return pRide.path.length>0;}};
let actorsDirty=true,actorsList=[];
function actors(){if(actorsDirty){actorsDirty=false;actorsList=[LOCAL,...NET.remote.values()];}return actorsList;}
function actorInteract(a,dt){
  if(a.riding)return;
  const c=a.c,pp=a.g.position,me=a.id==='me';c.t+=dt;
  eventInteract(a,dt);
  for(const src of allSources()){if(near(pp,src.pick,src.kind==='mout'?1.0:src.kind==='pallet'?0.9:1.4)&&src.count>0&&c.total()<cap()&&c.t>0.11){c.t=0;takeFrom(src,c);if(me){blip(620+c.total()*20,0.05);if(src.mach&&!src.mach.fh)freshBonus(src.mach,a);}}}
  for(const dst of allDests()){if(near(pp,dst.dep,dst.kind==='min'?1.0:1.5)&&c.has(dst.type)&&dst.space()>0&&c.t>0.09){c.t=0;depositTo(dst,c);if(!me)a.contrib=(a.contrib||0)+2;vib(6);if(me)blip(520,0.05,'square',0.035);}}
  if(c.carry.length&&near(pp,TRASH,1.1)&&c.t>0.08){c.t=0;const it=c.carry[c.carry.length-1];const r=c.removeType(it.type);
    if(r)fly(r.mesh,r.pos,()=>V3(TRASH.x,0.8,TRASH.z),0.2,()=>freeItem(r.mesh),0.6);if(me)blip(300,0.05,'square',0.03);}
  for(const co of allPiles()){
    if(co.stack.length&&near(pp,co.pile,1.5)){a.collectT+=dt;
      while(a.collectT>0.03&&co.stack.length){a.collectT-=0.03;const v=co.stack.pop();const b=makeItem('bill');
        fly(b,co.billSlot(co.stack.length),()=>a.g.position.clone().add(V3(0,1.2,0)),0.2,()=>{freeItem(b);money+=v;if(me&&sparkCool<=0){sparkCool=0.15;sparkle(a.g.position.clone().add(V3(0,1.4,0)),3,0x9cf27a,0.7);}},0.6);if(me)blip(1100,0.04,'sine',0.05);}
      co.refresh();}}
  for(const p of pads){if(!p.visible)continue;
    if(Math.abs(pp.x-p.x)<1&&Math.abs(pp.z-p.z)<1){a.stand[p.id]=(a.stand[p.id]||0)+dt;
      if(a.stand[p.id]>0.25&&money>=0.5){const cost=padCost(p),rate=Math.max(cost/1.3,40);const amt=Math.min(rate*dt,money,cost-p.paid);p.paid+=amt;money-=amt;p.dirty=true;
        p.flyT+=dt;if(p.flyT>0.07){p.flyT=0;const b=makeItem('bill');fly(b,a.g.position.clone().add(V3(0,1.2,0)),()=>V3(p.x,floorY(p.x)+0.1,p.z),0.22,()=>freeItem(b),0.7);if(me)blip(760,0.03,'sine',0.04);}
        if(p.paid>=cost-1e-6)purchase(p);}}
    else a.stand[p.id]=0;}
}
function coWaiting(co){return NET.mode==='guest'?!!co.guestWait:!!(co.queue[0]&&co.queue[0].arrived);}

/* ---------- flash sale ---------- */
let promoTag=null;
function updPromo(dt){
  if(NET.mode!=='guest'){
    if(promo){promo.t-=dt;if(promo.t<=0)promo=null;}
    else{promoT-=dt;if(promoT<=0){const ls=lines();if(ls.length>=2){const t=ls[(Math.random()*ls.length)|0];promo={type:t,t:25};toast('🔥 限时特价：'+ITEM[t].e+' 八折，顾客抢着买！',2600);blip(990,0.12,'sine',0.06);}promoT=45+Math.random()*30;}}
  }
  if(!promoTag){promoTag=canvasSprite(256,110,1.9,0.82);const x=promoTag.ctx;rrect(x,6,6,244,98,40);x.fillStyle='#ff4d2e';x.fill();x.lineWidth=6;x.strokeStyle='#fff';x.stroke();
    x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.font='900 50px system-ui,sans-serif';x.fillText(TT('🔥 特价','🔥 SALE','🔥 JUALAN'),128,58);promoTag.tex.needsUpdate=true;scene.add(promoTag.s);}
  promoTag.s.visible=!!promo&&!!shelves[promo.type];
  if(promoTag.s.visible){const sh=shelves[promo.type];promoTag.s.position.set(sh.x,floorY(sh.x)+3.6+Math.sin(T*4)*0.12,sh.z-0.5);}
}

