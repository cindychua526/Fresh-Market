/* ---------- customers ---------- */
const customers=[];let custId=0;let combo=0,lastFastT=-99,comboToastT=0;
const DOOR_W={d:V3(-10.2,0,-6),o:V3(-17,0,-6)},DOOR_E={d:V3(24.2,0,-6),o:V3(31,0,-6)},DOOR_WING={d:V3(42.2,0,-8.5),o:V3(49,0,-8.5)};
const doors=()=>[DOOR_W,...(winged?[DOOR_WING]:expanded?[DOOR_E]:[])];
const nearestDoor=x=>doors().reduce((a,d)=>Math.abs(d.d.x-x)<Math.abs(a.d.x-x)?d:a);
const CC=[0xff7eb6,0x7ec8ff,0xffd166,0x9ee39e,0xc3a6ff,0xff9f80,0x80e0d0,0xf7b2d0,0xb8e986];
const SKINS=[0xffe2c2,0xf5cfa6,0xe0ac7e,0xc68a5e,0xffeedd];
const BASKET_COLS=[0xe53935,0x2f80ed,0x27ae60,0xf2994a];
function shelfSpot(type,self){
  const n=customers.filter(c=>c!==self&&(c.state==='toShelf'||c.state==='shop')&&c.wants[c.wi]&&c.wants[c.wi].type===type).length;
  const off=[0,-1,1,-1.6,1.6][n%5];return V3(SX[type]+off,0,shelves[type].spotZ);
}
const lastPt=c=>c.path.length?c.path[c.path.length-1]:c.g.position;
const stallsOpen=()=>['burger','soup','drink'].map(t=>machines[t]).filter(m=>m.unlocked);
function newShopper(ci,si,hi,door,vr=0){const o={skin:SKINS[si],hat:hi>=0?CC[hi]:null};if(vr===2){o.elder=1;o.hat=null;}if(vr===3)o.backpack=CC[(ci+3)%CC.length];
  const ch=makeChar(CC[ci],o);if(vr===1)ch.g.scale.setScalar(0.74);ch.g.position.copy(door.o);scene.add(ch.g);
  const bub=canvasSprite(128,144,1.0,1.125,true);bub.s.position.y=2.3;ch.g.add(bub.s);return {ch,bub};}
function spawnDiner(){const st=stallsOpen();if(!st.length)return false;const m=st[(Math.random()*st.length)|0];
  const ci=(Math.random()*CC.length)|0,si=(Math.random()*SKINS.length)|0,hi=Math.random()<0.5?(Math.random()*CC.length)|0:-1;
  const door=nearestDoor(UP_ENTRY.x);const {ch,bub}=newShopper(ci,si,hi,door);
  const c={id:++custId,ci,si,hi,rideLeg:-1,ch,g:ch.g,wants:[],wi:0,diner:true,dish:m.outT,stall:m,state:'toStall',path:[door.d.clone()],t:0,phase:Math.random()*6,bub,bubKey:'',arrived:false,co:null,bought:0,cart:false};
  c.path.push(...routeTo(door.d,m.out.pick.clone().add(V3((Math.random()-0.5)*1.2,0,0.4))));customers.push(c);return true;}
const DOG_COLS=[0xc98b52,0xf2e4c9,0x5b4636,0xffffff];
function addDog(c){const k=(Math.random()*4)|0;const d=mergedGroup('dog'+k,()=>{const g=new THREE.Group();const col=DOG_COLS[k];
    box(0.5,0.26,0.24,col,0,0.3,0,g);box(0.24,0.22,0.22,col,0.3,0.46,0,g);box(0.1,0.08,0.12,0x333333,0.44,0.44,0,g);
    box(0.06,0.14,0.08,col===0xffffff?0xf2c6a0:0x5b4636,0.28,0.6,0.08,g);box(0.06,0.14,0.08,col===0xffffff?0xf2c6a0:0x5b4636,0.28,0.6,-0.08,g);
    for(const [x,z] of [[-0.18,0.08],[-0.18,-0.08],[0.16,0.08],[0.16,-0.08]])box(0.07,0.2,0.07,col,x,0.1,z,g);box(0.18,0.05,0.05,col,-0.32,0.4,0,g);return g;});
  d.position.copy(c.g.position);scene.add(d);c.dog=d;}
function dogFollow(d,g,dt){const tx=g.position.x-Math.sin(g.rotation.y)*0.8+0.4,tz=g.position.z-Math.cos(g.rotation.y)*0.8;const dx=tx-d.position.x,dz=tz-d.position.z;const dd=Math.hypot(dx,dz);
  if(dd>0.05){const k=Math.min(1,dt*4);d.position.x+=dx*k;d.position.z+=dz*k;d.rotation.y=Math.atan2(dx,dz)-Math.PI/2;}d.position.y=g.position.y+(dd>0.1?Math.abs(Math.sin(T*16))*0.05:0);}
function makeCart(c){const mg=mergedGroup('cart',()=>makeCartRaw());mg.position.set(0,0,0.5);c.g.add(mg);return mg;}
function makeCartRaw(){const g=new THREE.Group();
  const b=new THREE.Mesh(GEO.cartBox,M(0xd5dde6));b.position.set(0,0.66,0.35);g.add(b);const inn=new THREE.Mesh(GEO.cartBox,M(0x8a94a0));inn.scale.set(0.9,0.2,0.9);inn.position.set(0,0.5,0.35);g.add(inn);
  const h=new THREE.Mesh(GEO.cartHandle,M(0xe53935));h.rotation.z=Math.PI/2;h.position.set(0,0.98,0.02);g.add(h);
  for(const [wx,wz] of [[-0.26,0.12],[0.26,0.12],[-0.26,0.58],[0.26,0.58]]){const w=new THREE.Mesh(GEO.wheel,M(0x333333));w.position.set(wx,0.06,wz);g.add(w);const l=new THREE.Mesh(GEO.cartLeg,M(0x9aa3ad));l.position.set(wx,0.27,wz);g.add(l);}
  return g;}
function cartSlot(k){return V3(-0.2+(k%3)*0.2,0.84+Math.floor(k/9)*0.16,0.7+(Math.floor(k/3)%3-1)*0.15);}
function spawnCustomer(vip=-1,tour=false){
  if(vip<0&&fhOpen&&stallsOpen().length&&Math.random()<0.28&&spawnDiner())return;
  const all=lines();if(!all.length)return;
  const l2=all.filter(t=>floorOf(SX[t])===2),l1=all.filter(t=>floorOf(SX[t])===1);
  const ls=((l2.length&&(Math.random()<0.3||!l1.length))?l2:l1).slice().sort(()=>Math.random()-0.5);
  const r=Math.random(),n=Math.min(ls.length,vip>=0?3:r<0.1?4:r<0.3?3:r<0.65?2:1);
  const chosen=ls.slice(0,n);
  if(curFest&&ls.includes(curFest.item)&&!chosen.includes(curFest.item)&&Math.random()<0.5)chosen[chosen.length-1]=curFest.item;
  if(isRaining()&&ls.includes('umbrella')&&!chosen.includes('umbrella')&&Math.random()<0.5)chosen[0]='umbrella';
  if(promo&&ls.includes(promo.type)&&!chosen.includes(promo.type)&&Math.random()<0.55)chosen[0]=promo.type;
  const up=floorOf(SX[chosen[0]])===2;const door=nearestDoor(up?UP_ENTRY.x:SX[chosen[0]]);
  const ref=up?UP_EXIT.x:door.d.x;chosen.sort((a,b)=>Math.abs(SX[a]-ref)-Math.abs(SX[b]-ref));
  const night=isNight();
  const wants=chosen.map(t=>({type:t,need:1+Math.floor(Math.random()*(n>2?2:3))+(promo&&promo.type===t?1:0)+(night?1:0),got:0}));
  const total=wants.reduce((a,w)=>a+w.need,0);const cart=vip>=0||n>=3||total>=5||(n>=2&&Math.random()<0.3);if(cart)wants.forEach(w=>w.need+=1);
  const ci=(Math.random()*CC.length)|0,si=(Math.random()*SKINS.length)|0,hi=tour?2:Math.random()<0.5?(Math.random()*CC.length)|0:-1;
  const VRS=[0,0,0,1,2,3,...(hasT('school')?[3,3]:[]),...(hasT('clinic')?[2,2]:[])];const vr=vip>=0?0:VRS[(Math.random()*VRS.length)|0];
  if(TW()===2||(vr===3&&hasT('school')))wants.forEach(w=>w.need++);   // snow town / students: buy one more of each
  const {ch,bub}=newShopper(ci,si,hi,door,vr);
  const c={vr,spd:(vr===1?1.15:vr===2?0.8:1)*(TW()===2?0.82:1),vip,id:++custId,ci,si,hi,rideLeg:-1,ch,g:ch.g,wants,wi:0,state:'toShelf',path:[door.d.clone()],t:0,phase:Math.random()*6,bub,bubKey:'',arrived:false,co:null,bought:0,cart};
  if(Math.random()<0.12&&vip<0)addDog(c);
  if(vip>=0){addCrown(ch.g);const tg=nameTag('⭐'+L(VIPS[vip].n),0xd4a017);tg.s.position.y=2.95;ch.g.add(tg.s);c.tag=tg;c.bub.s.position.y=2.3;toast('⭐ 常客「'+VIPS[vip].n+'」来了！好好招待会有惊喜',2400);}
  if(cart)makeCart(c);else{const bk=new THREE.Mesh(GEO.basket,M(BASKET_COLS[(Math.random()*4)|0]));bk.position.set(0,0.72,0.46);bk.castShadow=true;ch.g.add(bk);}
  c.path.push(...routeTo(door.d,shelfSpot(wants[0].type,c)));
  customers.push(c);
}
function noShadow(g){g.traverse(o=>{if(o.isMesh)o.castShadow=false;});return g;}
function addToBasket(c,type){const k=c.bought++;if(c.cart){if(k>=18)return;const m=noShadow(makeItem(type));m.scale.setScalar(0.55);m.position.copy(cartSlot(k));c.g.add(m);return;}if(k>=9)return;const m=noShadow(makeItem(type));m.scale.setScalar(0.45);m.position.set(-0.15+(k%3)*0.15,0.8+Math.floor(k/3)*0.12,0.4+((k%2)?0.06:-0.06));c.g.add(m);}
function setBubble(c,e,t='',warn=false,ring=null,left=null){const k=e+t+(warn?'!':'')+(ring||'')+(left!=null?'@'+left:'');if(c.bubKey!==k){c.bubKey=k;drawBubble(c.bub,e,t,warn,ring,left);}}
const RINGS=['#2fae5a','#9ccc3a','#ffb300','#ff5a4d'];
function joinQueue(c){
  let best=null;const fl=floorOf(c.g.position.x);for(const co of checkouts){if(!co.unlocked||co.floor!==fl)continue;
    const score=co.queue.length+Math.abs(co.cx-c.g.position.x)*0.08;if(!best||score<best.s)best={co,s:score};}
  if(!best){best={co:checkouts[0]};}
  c.co=best.co;c.co.queue.push(c);c.state='queue';c.path=[];c.qT=T;
}
function updDiner(c,dt,busy){
  const m=c.stall;
  if(c.state==='toStall'){setBubble(c,ITEM[c.dish].e);if(!busy){c.state='order';c.t=0;c.wait=0;}return true;}
  if(c.state==='order'){faceTo(c.g,Math.PI,dt);c.t+=dt;
    if(m.out.count>0&&c.t>0.4){m.out.count--;m.out.refresh();const it=makeItem(c.dish);fly(it,m.out.slotPos(m.out.count),()=>c.g.position.clone().add(V3(0,1.1,0.4)),0.3,()=>freeItem(it),0.5);
      c.hasDish=true;const p=price(c.dish);for(let i=0;i<3;i++){const b=makeItem('bill');fly(b,m.out.slotPos(0).clone().add(V3(0,0.4,0)),()=>fhPile.billSlot(Math.min(fhPile.stack.length,59)),0.6+i*0.08,()=>{freeItem(b);fhPile.push(p/3);},1.4);}
      onSale(c.dish,1);onServed(p,true);blip(880,0.08);
      let best=null,bd=1e9;for(const st of seats){if(st.occ)continue;const d=Math.hypot(st.x-c.g.position.x,st.z-c.g.position.z);if(d<bd){bd=d;best=st;}}
      if(best){best.occ=c;c.seat=best;c.state='toSeat';c.path=routeTo(c.g.position,V3(best.x,0,best.z));}else{c.state='leave';const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    else if(m.out.count===0){c.wait+=dt;if(c.wait>20){c.state='leave';c.sad=true;daily.d.sad=(daily.d.sad||0)+1;const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    setBubble(c,c.wait>8?'😕':ITEM[c.dish].e);return true;}
  if(c.state==='toSeat'){setBubble(c,ITEM[c.dish].e);if(!busy){c.state='eat';c.eatT=6+Math.random()*4;c.sit=true;c.g.position.x=c.seat.x;c.g.position.z=c.seat.z;c.g.rotation.y=c.seat.face;
      const dm=makeItem(c.dish);dm.position.set(c.seat.x+(c.seat.tx-c.seat.x)*0.45,F2Y+0.82,c.seat.z+(c.seat.tz-c.seat.z)*0.45);scene.add(dm);c.dishMesh=dm;}return true;}
  if(c.state==='eat'){setBubble(c,'😋');c.eatT-=dt;if(c.eatT<=0){c.sit=false;if(c.dishMesh){freeItem(c.dishMesh);c.dishMesh=null;}if(c.seat){c.seat.occ=null;c.seat=null;}
      c.state='leave';const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}return true;}
  if(c.state==='leave'){setBubble(c,c.sad?'😞':'😊');if(!busy)c.dead=true;return true;}
  return true;
}
/* timing bar: a needle sweeps back and forth; tap in the green for a bigger tip. Not tapping still checks out. */
const RHY={el:null,nd:null,fb:null,on:false,t0:0,seen:-1,hit:null};
function rhyInit(){if(RHY.el)return;RHY.el=document.getElementById('rhy');RHY.nd=RHY.el.querySelector('.nd');RHY.fb=RHY.el.querySelector('.fb');
  const hitFn=e=>{if(!RHY.on)return;e&&e.preventDefault&&e.preventDefault();const x=rhyPos(),d=Math.abs(x-0.5),q=d<0.07?2:d<0.17?1:0;RHY.hit=q;
    RHY.fb.textContent=q===2?TT('完美！','Perfect!','Sempurna!'):q===1?TT('不错','Good','Bagus'):TT('再准一点','A bit off','Hampir');RHY.fb.className='fb q'+q;void RHY.fb.offsetWidth;RHY.fb.classList.add('show');vib(q===2?20:8);blip(q===2?1320:q===1?990:600,0.07,'sine',0.06);};
  RHY.el.addEventListener('pointerdown',hitFn);addEventListener('keydown',e=>{if(e.code==='Space'&&RHY.on)hitFn(e);});}
const rhyPos=()=>{const p=((T-RHY.t0)/0.95)%2;return p<1?p:2-p;};
function rhyShow(){rhyInit();RHY.seen=FRAME;if(!RHY.on){RHY.on=true;RHY.t0=T;RHY.hit=null;RHY.el.hidden=false;showTip('rhythm',TT('在绿色区域点一下，小费更多！不点也会自动结账。','Tap when the needle is in the green for a bigger tip. It checks out on its own if you don\'t.','Ketik ketika jarum berada di zon hijau untuk tip lebih besar. Jika tidak, bayaran tetap dibuat secara automatik.'));}
  RHY.nd.style.transform='translateX('+(rhyPos()*100).toFixed(1)+'%)';}
function rhyTick(){if(RHY.on&&RHY.seen!==FRAME){RHY.on=false;RHY.el.hidden=true;}}
function checkout(co,c,q){
  co.queue.shift();
  let total=c.wants.reduce((s,w)=>s+w.need*price(w.type),0);
  const waited=T-(c.qT||T);let tip=0;
  if(waited<6){combo=(T-lastFastT<14)?combo+1:1;lastFastT=T;tip=Math.round(total*0.1*Math.min(combo,5)*(1+0.25*PK('tips')));stats.tips=(stats.tips||0)+tip;
    if(combo>=2&&T-comboToastT>1.2){comboToastT=T;if(combo%3===0||tip>=Math.max(20,total*0.25))toast(L('🔥 连击')+' ×'+combo+'  '+L('小费')+' +💵'+tip,1400);}sparkle(V3(co.cx,co.Y+1.6,-2),4,0xffd24a,0.8);}
  else if(waited>9)combo=0;
  if(q===2){const b=Math.round(total*0.25);tip+=b;stats.perfect=(stats.perfect||0)+1;sparkle(V3(co.cx,co.Y+1.8,-2),8,0x9cf27a,1);}else if(q===1)tip+=Math.round(total*0.1);
  if(RUSH.t>0)tip=Math.round(tip*1.5);
  total+=tip;if(c.vr===2&&hasT('clinic'))total=Math.round(total*1.25);
  daily.d.waitSum=(daily.d.waitSum||0)+waited;daily.d.waitN=(daily.d.waitN||0)+1;
  for(const a of actors())if(a.id!=='me'&&near(a.g.position,co.reg,1.3))a.contrib=(a.contrib||0)+total*0.06;if(c.vip>=0){total=Math.round(total*2+50);vipHeart(c.vip,+1);stats.vip=(stats.vip||0)+1;}
  const n=Math.min(8,Math.max(1,Math.round(total/6)));
  for(let i=0;i<n;i++){const b=makeItem('bill');fly(b,V3(co.cx+0.5*co.dir,1.4+co.Y,-2),()=>co.billSlot(Math.min(co.stack.length,59)),0.28+i*0.05,()=>{freeItem(b);co.push(total/n);},0.8);}
  for(const w of c.wants)if(w.need>0)onSale(w.type,w.need);onServed(total,false);
  const door=nearestDoor(co.cx);
  c.state='leave';c.path=[...routeTo(c.g.position,door.d),door.o.clone()];blip(880,0.08);blip(1320,0.1,'sine',0.05);
}
function updCustomers(dt){
  for(const c of customers){
    if(c.state==='queue'){const slot=c.co.slot(c.co.queue.indexOf(c));const lp=lastPt(c);if(Math.hypot(lp.x-slot.x,lp.z-slot.z)>0.01||!c.path.length&&Math.hypot(c.g.position.x-slot.x,c.g.position.z-slot.z)>0.05)c.path=routeTo(c.g.position,slot);}
    c.bub.s.visible=c.vip>=0||Math.hypot(c.g.position.x-camT.x,c.g.position.z-camT.z)<13;
    const fr=followPath(c,(c.cart?2.4:2.8)*(c.spd||1),dt);const moving=fr===true,riding=fr==='ride';
    if(onScreen(c.g))animChar(c.ch,moving,T+c.phase,!c.diner||c.hasDish,riding);
    if(c.sit){c.ch.legL.rotation.x=c.ch.legR.rotation.x=-1.4;c.g.position.y=floorY(c.g.position.x)+0.06;}
    if(c.diner&&updDiner(c,dt,moving||riding))continue;
    if(c.state==='toShelf'){const w=c.wants[c.wi];setBubble(c,ITEM[w.type].e,w.got+'/'+w.need);if(!moving&&!riding)c.state='shop';}
    else if(c.state==='shop'){
      faceTo(c.g,Math.PI,dt);const w=c.wants[c.wi],sh=shelves[w.type];c.t+=dt;
      if(sh.count===0&&w.got<w.need){c.wait=(c.wait||0)+dt;
        if(c.wait>(c.vip>=0?25:14)){c.wait=0;w.need=w.got;daily.d.miss=(daily.d.miss||0)+1;}}
      if(w.got<w.need&&sh.count>0&&c.t>0.4){c.t=0;c.wait=0;sh.count--;sh.refresh();const it=makeItem(w.type);const tp=w.type;
        fly(it,sh.slotPos(sh.count),()=>c.g.position.clone().add(V3(0,1,0)),0.3,()=>{freeItem(it);addToBasket(c,tp);},0.6);w.got++;}
      if((c.wait||0)>6)setBubble(c,'😕','',true);else setBubble(c,ITEM[w.type].e,w.got+'/'+w.need,sh.count===0&&w.got<w.need);
      if(w.got>=w.need){c.wi++;
        if(c.wi<c.wants.length){c.state='toShelf';c.path=routeTo(c.g.position,shelfSpot(c.wants[c.wi].type,c));}
        else if(c.wants.some(x=>x.got>0))joinQueue(c);
        else{const door=nearestDoor(c.g.position.x);c.state='leave';c.sad=true;daily.d.sad=(daily.d.sad||0)+1;if(c.vip>=0)vipHeart(c.vip,-1);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    }
    else if(c.state==='queue'){c.arrived=!moving&&!riding&&c.path.length===0;if(c.arrived)faceTo(c.g,0,dt);const w=T-(c.qT||T);setBubble(c,c.co.queue[0]===c&&c.arrived?'💳':'🛒','',false,RINGS[w<3?0:w<6?1:w<9?2:3],Math.max(1,8-Math.floor(w/1.5))/8);}
    else if(c.state==='leave'){setBubble(c,c.sad?'😞':'😊');if(!moving&&!riding)c.dead=true;}
  }
  for(const c of customers)if(c.dog)dogFollow(c.dog,c.g,dt);
  for(let i=customers.length-1;i>=0;i--){const c=customers[i];if(c.dead){if(c.dog)scene.remove(c.dog);if(c.seat)c.seat.occ=null;if(c.dishMesh)freeItem(c.dishMesh);dropChar(c);customers.splice(i,1);}}
}

function dropChar(c){releaseSprite(c.bub);if(c.tag){disposeSprite(c.tag);c.tag=null;}for(const o of [...c.g.children]){const k=o.userData.mk;if(k&&k[0]==='i')freeItem(o);}scene.remove(c.g);releaseChar(c.g);}
/* ---------- item transfers ---------- */
const FRESH_S=6;let freshToastT=-9;
function freshBonus(m,a){if(T-m.freshAt>=FRESH_S)return;const b=Math.max(1,Math.round(price(m.outT)*0.5));money+=b;stats.fresh=(stats.fresh||0)+1;
  if(T-freshToastT>1.6){freshToastT=T;toast('✨ '+TT('新鲜出炉','Fresh from the oven','Segar dari ketuhar')+' +💵'+b,1100);sparkle(a.g.position.clone().add(V3(0,1.6,0)),5,0xfff1a0,0.8);}}
function takeFrom(src,carrier){
  src.count--;src.refresh();const m=makeItem(src.type);carrier.incoming++;
  vib(5);fly(m,src.slotPos(src.count),()=>carrier.slotWorld(carrier.carry.length),0.22,()=>{carrier.incoming--;scene.remove(m);carrier.add(src.type,m);},0.9);
}
function depositTo(dst,carrier){
  const r=carrier.removeType(dst.type);if(!r)return;dst.incoming++;const idx=Math.min(dst.max-1,dst.count+dst.incoming-1);
  fly(r.mesh,r.pos,()=>dst.slotPos(idx),0.22,()=>{freeItem(r.mesh);dst.incoming--;dst.count=Math.min(dst.max,dst.count+1);dst.refresh();},0.9);
}

