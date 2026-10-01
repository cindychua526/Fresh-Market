/* ---------- online co-op (room capability) ---------- */
const PCOLS=[0xff9b3d,0x4aa3ff,0xff5d8f,0x9b6bff,0x2ec27e];
const ALLT=Object.keys(ITEM);const TCH='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';const tcode=t=>TCH[ALLT.indexOf(t)];const tdec=ch=>ALLT[TCH.indexOf(ch)];
const r1=v=>Math.round(v*10)/10;
const carryStr=c=>c.carry.map(i=>tcode(i.type)).join('');
function binList(){return Object.values(binKeys());}
const cleanName=t=>String(t||'').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f]/g,'').trim().slice(0,8)||'玩家';
function nameTag(text,col){const s=canvasSprite(256,64,1.7,0.42);const x=s.ctx;x.textAlign='center';x.textBaseline='middle';x.font='900 34px system-ui,sans-serif';x.lineJoin='round';x.lineWidth=9;
  x.strokeStyle='#'+col.toString(16).padStart(6,'0');x.strokeText(text,128,34);x.fillStyle='#fff';x.fillText(text,128,34);s.tex.needsUpdate=true;return s;}
function makeAvatar(nick,ci){const ch=makeChar(PCOLS[ci%5],{sprout:true,apron:true});scene.add(ch.g);const tag=nameTag(nick,PCOLS[ci%5]);tag.s.position.y=2.35;ch.g.add(tag.s);
  const emo=canvasSprite(128,144,0.9,1.0);emo.s.position.y=3.1;emo.s.visible=false;ch.g.add(emo.s);
  return {id:'r',ch,g:ch.g,c:new Carrier(ch.g),tag,nick,ci,emoS:emo,emoKey:'',emoUntil:0,tx:0,ty:0,tz:0,tr:0,ride:false,stand:{},collectT:0,get riding(){return this.ride;},last:null};}
function dropAvatar(a){disposeSprite(a.tag);disposeSprite(a.emoS);scene.remove(a.g);releaseChar(a.g);}
function avatarSet(a,nick,ci){if(a.nick!==nick||a.ci!==ci){a.nick=nick;a.ci=ci;disposeSprite(a.tag);a.tag=nameTag(nick,PCOLS[ci%5]);a.tag.s.position.y=2.35;a.ch.g.add(a.tag.s);}}
function showEmo(a,emo){if(!emo||!emo.e)return;const k=emo.e+emo.t;if(a.emoKey===k)return;a.emoKey=k;drawBubble(a.emoS,String(emo.e).slice(0,4),'');a.emoS.visible=true;a.emoUntil=T+2.5;}
function moveAvatar(a,dt){const p=a.g.position;const k=Math.min(1,dt*12);const before=p.clone();
  p.x+=(a.tx-p.x)*k;p.z+=(a.tz-p.z)*k;p.y+=(a.ty-p.y)*k;if(Math.hypot(a.tx-p.x,a.tz-p.z)>4){p.set(a.tx,a.ty,a.tz);}
  let d=a.tr-a.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));a.g.rotation.y+=d*k;
  const mv=before.distanceTo(p)>0.004;animChar(a.ch,mv&&!a.ride,T,a.c.carry.length>0,true);a.c.layout();
  if(a.emoS.visible&&T>a.emoUntil)a.emoS.visible=false;}
function setCarry(c,str){const cur=carryStr(c);if(cur===str)return;
  if(str.startsWith(cur)){for(const ch of str.slice(cur.length)){const t=tdec(ch);if(t)c.add(t,makeItem(t));}return;}
  for(const it of c.carry)freeItem(it.mesh);c.carry.length=0;for(const ch of str){const t=tdec(ch);if(t)c.add(t,makeItem(t));}}
function remoteUpdate(dt){for(const a of NET.remote.values())moveAvatar(a,dt);for(const a of NET.avatars.values())moveAvatar(a,dt);}

function snapshot(){
  const o={role:'host',nick:NET.nick,col:NET.col,v:++NET.ver,m:Math.floor(money),
    hp:[r1(player.position.x),r1(player.position.y),r1(player.position.z),r1(player.rotation.y),carryStr(pc),pRide.path.length?1:0],
    gc:{},pd:pads.map(p=>p.lvl.toString(36)).join(''),pp:[],bn:binList().map(b=>Math.min(35,b.count).toString(36)).join(''),
    co:checkouts.map(co=>[co.stack.length,co.queue[0]&&co.queue[0].arrived?1:0]),
    h:helpers.map(h=>[r1(h.g.position.x),r1(h.g.position.y),r1(h.g.position.z),r1(h.g.rotation.y),h.bubE||'',carryStr(h.c)].join(',')).join('|'),
    c:'',tr:[r1(truck.position.x),truck.visible?1:0,truck.rotation.y>1?1:0],el:Math.round(elevS.open*10),
    pr:promo?[tcode(promo.type),Math.ceil(promo.t)]:null,emo:NET.emo,dt:Math.round(dayT*1000),dn:dayN,fh:fhPile.stack.length,dc:[decor.floor,decor.shelf],ht:myHat()};
  for(const [k,a] of NET.remote)o.gc[k]=carryStr(a.c);
  o.gr={};for(const [k,a] of NET.remote)o.gr[k]=Math.floor(a.contrib||0);o.ev=evSnap();o.od=order?[tcode(order.type),order.got,order.n,Math.ceil(order.t),order.who]:null;o.tg=team?[team.n,team.got,Math.ceil(team.t)]:null;o.lg=legacy.n||0;o.sl=stLv;o.tn=TOWN.filter(t=>hasT(t.id)).map(t=>t.id).join(',');
  pads.forEach((p,i)=>{if(p.paid>0.5)o.pp.push([i,Math.round(p.paid)]);});
  let list=customers.map(c=>[c.id,r1(c.g.position.x),r1(c.g.position.y),r1(c.g.position.z),r1(c.g.rotation.y),c.ci,c.si,c.hi,c.bubKey,Math.min(18,c.bought),c.sit?1:0,c.cart?1:0,c.diner?1:0,c.vip>=0?c.vip:-1,c.vr||0,c.dog?1:0].join(','));
  o.c='';let len=JSON.stringify(o).length;const keep=[];for(const s of list){if(len+s.length+1>3750)break;keep.push(s);len+=s.length+1;}o.c=keep.join('|');
  return o;
}
const gHelpers=[],gCust=new Map();
function puppet(ch,bubScale){scene.add(ch.g);const bub=canvasSprite(128,144,bubScale,bubScale*1.125,true);bub.s.position.y=2.3;ch.g.add(bub.s);return {ch,g:ch.g,c:new Carrier(ch.g),bub,bubKey:'',tx:0,ty:0,tz:0,tr:0,fresh:true};}
function puppetMove(p,dt,carrying){const g=p.g.position;if(p.fresh){g.set(p.tx,p.ty,p.tz);p.g.rotation.y=p.tr;p.fresh=false;}
  const k=Math.min(1,dt*10),b=g.clone();g.x+=(p.tx-g.x)*k;g.y+=(p.ty-g.y)*k;g.z+=(p.tz-g.z)*k;if(Math.hypot(p.tx-g.x,p.tz-g.z)>4)g.set(p.tx,p.ty,p.tz);
  let d=p.tr-p.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));p.g.rotation.y+=d*k;animChar(p.ch,b.distanceTo(g)>0.004,T+(p.phase||0),carrying,true);}
function guestApply(P){
  money=+P.m||0;if((P.lg||0)!==(legacy.n||0)){legacy.n=P.lg||0;applyTheme();}
  if(P.sl){const k=JSON.stringify(P.sl);if(k!==NET.slKey){NET.slKey=k;for(const x in stLv)delete stLv[x];Object.assign(stLv,P.sl);refreshSigns();}}
  if((P.tn||'')!==NET.tnKey){NET.tnKey=P.tn||'';for(const x in town)delete town[x];for(const id of NET.tnKey.split(','))if(id)town[id]=1;applyTownVis();}
  const lv=P.pd||'';let changed=false;
  const first=!NET.synced;NET.synced=true;
  pads.forEach((p,i)=>{const L=parseInt(lv[i]||'0',36)||0;while(p.lvl<L){p.lvl++;if(p.lvl>=p.costs.length)p.done=true;applyPad(p,!first);changed=true;
      if(!first)toast('✨ '+(p.costs.length>1?p.name+' Lv.'+p.lvl:'解锁 '+p.name));}});
  if(first){toast('👥 已进入 '+cleanName(P.nick)+' 的店',2200);player.position.set(0,0,-4);camT.copy(player.position);}
  const paid={};(P.pp||[]).forEach(([i,v])=>paid[i]=v);
  pads.forEach((p,i)=>{p.done=p.lvl>=p.costs.length;const v=paid[i]||0;if(Math.abs(v-p.paid)>0.5){p.paid=v;p.dirty=true;}});
  if(changed)updatePadVis();
  const bn=P.bn||'';binList().forEach((b,i)=>{const n=parseInt(bn[i]||'0',36)||0;if(n!==b.count){if(n>b.count&&b.slots[n-1])pop(b.slots[n-1],0.3);b.count=Math.min(b.max,n);b.refresh();}});
  (P.co||[]).forEach(([len,w],i)=>{const co=checkouts[i];if(!co)return;co.guestWait=!!w;if(co.stack.length!==len){co.stack.length=0;for(let k=0;k<Math.min(60,len);k++)co.stack.push(1);co.refresh();}});
  setCarry(pc,(P.gc||{})[NET.myPeer]||'');
  const myGr=(P.gr||{})[NET.myPeer]||0;if(myGr>0){try{const hb=JSON.parse(localStorage.getItem('fm-helpbank')||'null');if(!hb||hb.code!==NET.code||hb.v<myGr)localStorage.setItem('fm-helpbank',JSON.stringify({code:NET.code,v:myGr,st:Math.min(3,Math.floor(myGr/4000))}));}catch(_){}}
  evApply(P.ev);order=P.od?{type:tdec(P.od[0]),got:P.od[1],n:P.od[2],t:P.od[3],who:P.od[4]}:null;team=P.tg?{n:P.tg[0],got:P.tg[1],t:P.tg[2]}:null;if((P.lg||0)!==(legacy.n||0)){legacy.n=P.lg||0;applyTheme();}
  // staff puppets
  const hs=(P.h||'').split('|').filter(Boolean);
  while(gHelpers.length<hs.length){const i=gHelpers.length;const p=puppet(makeChar(HCOL[i%6],{straw:[0xf2d16b,0xffe38a,0xe8c06a,0xf7d774][i%4]}),0.6);p.bub.s.position.y=2.1;p.phase=i;gHelpers.push(p);}
  hs.forEach((str,i)=>{const [x,y,z,r,e,cs]=str.split(',');const p=gHelpers[i];p.tx=+x;p.ty=+y;p.tz=+z;p.tr=+r;if(e&&p.bubKey!==e){p.bubKey=e;drawBubble(p.bub,e,'');}setCarry(p.c,cs||'');});
  // customers
  const seen=new Set();
  for(const str of (P.c||'').split('|')){if(!str)continue;const f=str.split(',');const id=f[0];seen.add(id);let p=gCust.get(id);
    if(!p){const hi=+f[7],vr=+f[14]||0;const o={skin:SKINS[+f[6]%SKINS.length],hat:hi>=0?CC[hi%CC.length]:null};if(vr===2){o.elder=1;o.hat=null;}if(vr===3)o.backpack=CC[(+f[5]+3)%CC.length];
      p=puppet(makeChar(CC[+f[5]%CC.length],o),1.0);if(vr===1)p.g.scale.setScalar(0.74);if(f[15]==='1')addDog(p);
      p.cart=f[11]==='1';if(+f[13]>=0&&VIPS[+f[13]]){addCrown(p.g);const tg=nameTag('⭐'+L(VIPS[+f[13]].n),0xd4a017);tg.s.position.y=2.95;p.g.add(tg.s);p.tag=tg;}if(p.cart)makeCart(p);else if(f[12]!=='1'){const bk=new THREE.Mesh(GEO.basket,M(BASKET_COLS[(+id)%4]));bk.position.set(0,0.72,0.46);p.g.add(bk);}
      p.bought=0;p.phase=+id;gCust.set(id,p);}
    p.sit=f[10]==='1';
    p.tx=+f[1];p.ty=+f[2];p.tz=+f[3];p.tr=+f[4];
    const bk=f[8]||'';if(bk!==p.bubKey){p.bubKey=bk;const m=bk.match(/^(.*?)(\d+\/\d+)?$/);drawBubble(p.bub,m?m[1]:bk,m&&m[2]?m[2]:'');}
    const nb=+f[9]||0;while(p.bought<nb){const k=p.bought++;const it=noShadow(makeItem(ALLT[(k*7+(+id))%11]));if(p.cart){it.scale.setScalar(0.55);it.position.copy(cartSlot(k));}else{it.scale.setScalar(0.45);it.position.set(-0.15+(k%3)*0.15,0.8+Math.floor(k/3)*0.12,0.4);}p.g.add(it);}}
  for(const [id,p] of gCust)if(!seen.has(id)){if(p.dog)scene.remove(p.dog);dropChar(p);gCust.delete(id);}
  // truck, elevator, promo
  if(P.tr){truck.position.x=P.tr[0];truck.visible=!!P.tr[1];truck.rotation.y=P.tr[2]?Math.PI:0;}
  elevS.open=(P.el||0)/10;elevL.position.x=91.68-elevS.open*0.6;elevR.position.x=92.32+elevS.open*0.6;
  promo=P.pr?{type:tdec(P.pr[0]),t:P.pr[1]}:null;
  if(P.dt!=null){dayT=P.dt/1000;dayN=P.dn||1;}
  if(P.dc&&(P.dc[0]!==decor.floor||P.dc[1]!==decor.shelf)){decor.floor=P.dc[0]|0;decor.shelf=P.dc[1]|0;applyDecor();}
  if(P.fh!=null&&fhPile.stack.length!==P.fh){fhPile.stack.length=0;for(let k=0;k<Math.min(60,P.fh);k++)fhPile.stack.push(1);fhPile.refresh();}
}
function guestUpdate(dt){
  const room=NET.room;if(!room)return;
  let host=null;for(const pr of room.peers()){if(pr.presence&&pr.presence.role==='host'&&!pr.isMe){host=pr;break;}}
  if(host){if(NET.failShown){NET.failShown=false;document.getElementById('mpFail').hidden=true;mpEl.hidden=true;}if(NET.warned){NET.warned=false;toast(L('📶 已重新连上'),1500);}NET.hostSeenAt=T;if(host.presence!==NET.lastHost){NET.lastHost=host.presence;guestApply(host.presence);}
    let a=NET.avatars.get(host.peer);const P=host.presence;
    if(!a){a=makeAvatar(cleanName(P.nick),+P.col||0);NET.avatars.set(host.peer,a);}
    avatarSet(a,cleanName(P.nick),+P.col||0);setAvatarHat(a,P.ht);if(P.hp){a.tx=+P.hp[0];a.ty=+P.hp[1];a.tz=+P.hp[2];a.tr=+P.hp[3];a.ride=!!P.hp[5];setCarry(a.c,P.hp[4]||'');}showEmo(a,P.emo);}
  else if(NET.hostSeenAt&&T-NET.hostSeenAt>3&&T-NET.hostSeenAt<20){if(!NET.warned){NET.warned=true;toast(L('📶 和房主的连接中断，正在重连…'),3000);}}
  else if(!NET.failShown&&T-NET.hostSeenAt>(NET.hostSeenAt?45:25)){NET.failShown=true;guestFail(NET.hostSeenAt?'和房主断开太久了。可以点「重试」，或者回到自己的店。':'找不到房主：请确认房间号正确，而且房主的游戏还开着（手机不要锁屏或切到别的 App）。');}
  // other guests
  const gc=(NET.lastHost&&NET.lastHost.gc)||{};
  const alive=new Set(host?[host.peer]:[]);
  for(const pr of room.peers()){if(pr.isMe||!pr.presence||pr.presence.role!=='guest')continue;alive.add(pr.peer);
    let a=NET.avatars.get(pr.peer);const P=pr.presence;if(!a){a=makeAvatar(cleanName(P.nick),+P.col||1);NET.avatars.set(pr.peer,a);}
    avatarSet(a,cleanName(P.nick),+P.col||1);setAvatarHat(a,P.hat);a.tx=+P.x||0;a.ty=+P.y||0;a.tz=+P.z||0;a.tr=+P.r||0;a.ride=!!P.ride;setCarry(a.c,gc[pr.peer]||'');showEmo(a,P.emo);}
  for(const [k,a] of NET.avatars)if(!alive.has(k)){dropAvatar(a);NET.avatars.delete(k);}
  for(const a of NET.avatars.values())moveAvatar(a,dt);
  for(const p of gHelpers)puppetMove(p,dt,p.c.carry.length>0),p.c.layout();
  for(const p of gCust.values()){if(p.dog)dogFollow(p.dog,p.g,dt);p.bub.s.visible=Math.hypot(p.g.position.x-camT.x,p.g.position.z-camT.z)<13;puppetMove(p,dt,true);if(p.sit){p.ch.legL.rotation.x=p.ch.legR.rotation.x=-1.4;}}
  for(const p of pads)if(p.dirty&&p.visible&&T-(p.drawT||-9)>0.08){drawPad(p);p.dirty=false;p.drawT=T;}
  updPromo(dt);
  updHud();
}
function hostPeers(){
  const room=NET.room;if(!room)return;const alive=new Set();let n=0;
  for(const pr of room.peers()){if(pr.isMe||!pr.presence||pr.presence.role!=='guest')continue;if(++n>4)break;alive.add(pr.peer);
    let a=NET.remote.get(pr.peer);const P=pr.presence;
    if(!a){a=makeAvatar(cleanName(P.nick),+P.col||1);a.id=pr.peer;a.tx=+P.x||0;a.ty=+P.y||0;a.tz=+P.z||0;a.g.position.set(a.tx,a.ty,a.tz);NET.remote.set(pr.peer,a);actorsDirty=true;toast('👋 '+cleanName(P.nick)+' 来帮忙了');}
    avatarSet(a,cleanName(P.nick),+P.col||1);setAvatarHat(a,P.hat);a.tx=+P.x||0;a.ty=+P.y||0;a.tz=+P.z||0;a.tr=+P.r||0;a.ride=!!P.ride;showEmo(a,P.emo);}
  for(const [k,a] of NET.remote)if(!alive.has(k)){dropAvatar(a);NET.remote.delete(k);actorsDirty=true;toast('👋 '+a.nick+' 离开了');}
}
function netTick(dt){
  if(!NET.room)return;NET.sendT-=dt;
  if(NET.mode==='host'){hostPeers();if(NET.sendT<=0){NET.sendT=sb&&!window.claude?0.2:0.1;NET.room.presence(snapshot()).catch(()=>{});}}
  else if(NET.mode==='guest'){if(NET.sendT<=0){NET.sendT=sb&&!window.claude?0.2:0.08;const p=player.position;
    NET.room.presence({role:'guest',nick:NET.nick,col:NET.col,x:r1(p.x),y:r1(p.y),z:r1(p.z),r:r1(player.rotation.y),ride:pRide.path.length?1:0,emo:NET.emo,hat:myHat()}).catch(()=>{});}}
  if(mpEl&&!mpEl.hidden){NET.plT=(NET.plT||0)-dt;if(NET.plT<=0){NET.plT=0.5;renderPlayers();}}
}

