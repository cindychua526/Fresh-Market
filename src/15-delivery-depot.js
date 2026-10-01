/* ---------- delivery depot (packaged goods) ---------- */
const pallets={};
const depotG=new THREE.Group();scene.add(depotG);depotG.visible=false;
box(17,0.05,6.6,0xd6d2cb,34,0.03,5.6,depotG,false);box(40,0.04,2.4,0x9aa0a6,54,0.02,7.5,depotG,false);
WING_GOODS.forEach((t,i)=>{
  const x=27+i*2,z=3.8,g=new THREE.Group();scene.add(g);
  box(1.5,0.12,1.3,0xc98b52,x,0.06,z,g);
  const sign=canvasSprite(128,144,0.7,0.79);drawBubble(sign,ITEM[t].e,'');sign.s.position.set(x,1.75,z+0.5);g.add(sign.s);
  const b=makeBin(t,8,k=>V3(x-0.4+(k%3)*0.4,0.12,z-0.4+Math.floor(k/3)*0.4),g);
  Object.assign(b,{kind:'pallet',g,pick:V3(x,0,2.55)});g.visible=false;pallets[t]=b;
});
F2_GOODS.forEach((t,i)=>{
  const x=87+i*2,z=-11.2,g=new THREE.Group();scene.add(g);
  box(1.5,0.12,1.3,0xb8bec8,x,F2Y+0.06,z,g);
  const sign=canvasSprite(128,144,0.7,0.79);drawBubble(sign,ITEM[t].e,'');sign.s.position.set(x,F2Y+1.75,z-0.5);g.add(sign.s);
  const b=makeBin(t,8,k=>V3(x-0.4+(k%3)*0.4,F2Y+0.12,z-0.4+Math.floor(k/3)*0.4),g);
  Object.assign(b,{kind:'pallet',g,pick:V3(x,0,z+1.25)});g.visible=false;pallets[t]=b;
});
const elevS={state:'closed',t:3,unT:0,open:0};let elevOn=false;
function updElevator(dt){
  if(!elevOn)return;const e=elevS;const need=()=>F2_GOODS.map(t=>pallets[t]).filter(p=>p.unlocked&&p.space()>0);
  if(e.state==='closed'){e.open=Math.max(0,e.open-dt*2);e.t-=dt;if(e.t<=0&&need().length){e.state='opening';}}
  else if(e.state==='opening'){e.open=Math.min(1,e.open+dt*2);if(e.open>=1){e.state='unload';e.unT=0;}}
  else if(e.state==='unload'){e.unT+=dt;if(e.unT>0.12){e.unT=0;const list=need();
      if(list.length){const p=list.sort((a,b)=>(a.count+a.incoming)-(b.count+b.incoming))[0];p.incoming++;const idx=Math.min(p.max-1,p.count+p.incoming-1);const m=makeItem(p.type);
        fly(m,V3(92,F2Y+0.8,-13.7),()=>p.slotPos(idx),0.4,()=>{freeItem(m);p.incoming--;p.count=Math.min(p.max,p.count+1);p.refresh();},1.0);}
      else{e.state='closed';e.t=10*Math.pow(0.7,padById.truck.lvl);}}}
  elevL.position.x=91.68-e.open*0.6;elevR.position.x=92.32+e.open*0.6;
}
const truck=new THREE.Group();truck.userData.moves=1;scene.add(truck);truck.visible=false;
box(3.2,1.6,1.5,0xffffff,0.6,1.2,0,truck);box(3.22,0.25,1.52,0x2fb35a,0.6,1.5,0,truck);box(1.2,1.2,1.45,0x2fb35a,-1.6,0.95,0,truck);
box(0.05,0.5,1.2,0x9fd3ff,-2.21,1.25,0,truck);
[[-1.5,0.7],[-1.5,-0.7],[1.3,0.7],[1.3,-0.7]].forEach(([wx,wz])=>{const w=cyl(0.32,0.32,0.25,0x333333,wx,0.32,wz,truck,12);w.rotation.x=Math.PI/2;});
const truckS={state:'away',t:2,unT:0};let depotOn=false;
function unlockDepot(anim){depotOn=true;depotG.visible=true;if(anim)pop(depotG,0.3);}
function unlockPallet(t,anim){const p=pallets[t];p.unlocked=true;p.g.visible=true;if(anim){p.count=Math.max(p.count,4);p.refresh();pop(p.g,0.2);}}
function updTruck(dt){
  if(!depotOn)return;const tr=truckS;const need=()=>WING_GOODS.map(t=>pallets[t]).filter(p=>p.unlocked&&p.space()>0);
  if(tr.state==='away'){tr.t-=dt;if(tr.t<=0&&need().length){tr.state='arrive';truck.position.set(74,0,7.5);truck.rotation.y=0;truck.visible=true;}}
  else if(tr.state==='arrive'){truck.position.x-=dt*16;if(truck.position.x<=35){truck.position.x=35;tr.state='unload';tr.unT=0;}}
  else if(tr.state==='unload'){tr.unT+=dt;if(tr.unT>0.1){tr.unT=0;const list=need();
      if(list.length){const p=list.sort((a,b)=>(a.count+a.incoming)-(b.count+b.incoming))[0];p.incoming++;const idx=Math.min(p.max-1,p.count+p.incoming-1);const m=makeItem(p.type);
        fly(m,V3(37.2,1.5,7.5),()=>p.slotPos(idx),0.4,()=>{freeItem(m);p.incoming--;p.count=Math.min(p.max,p.count+1);p.refresh();},1.6);}
      else{tr.state='leave';truck.rotation.y=Math.PI;}}}
  else if(tr.state==='leave'){truck.position.x+=dt*16;if(truck.position.x>74){tr.state='away';tr.t=9*Math.pow(0.7,padById.truck.lvl);truck.visible=false;}}
}

let FRAME=0;
/* memo(fn): recompute at most once per frame. Results are shared, callers only read them. */
const memo=fn=>{let f=-1,v;return ()=>{if(f!==FRAME){f=FRAME;v=fn();}return v;};};
const sourceOf=t=>producers[t]||(machines[t]&&machines[t].out)||pallets[t];
const ALL_SRC=()=>[...Object.values(producers),...Object.values(machines).map(m=>m.out),...Object.values(pallets)];
const allSources=memo(()=>ALL_SRC().filter(b=>b.unlocked&&b.kind!=='serve'));
const allDests=memo(()=>[...SELL.map(t=>shelves[t]),...SIG_ITEMS.map(t=>shelves[t]),...Object.values(machines).map(m=>m.inp),...(order&&order.dst?[order.dst]:[])].filter(b=>b.unlocked));
let order=null;
const lines=memo(()=>{const l=SELL.filter(t=>shelves[t].unlocked&&sourceOf(t).unlocked);if(curFest&&shelves[curFest.item].unlocked)l.push(curFest.item);for(const t of SIG_ITEMS)if(shelves[t].unlocked&&sourceOf(t).unlocked)l.push(t);return l;});
let curFest=null;

/* ---------- expansion ---------- */
let expanded=false,winged=false;
function expandStore(anim){expanded=true;divider.visible=false;dividerSol.active=false;tape.visible=false;eastDecor.visible=true;eastFloorMat.color.setHex(DECOR.floor[decor.floor].c);if(anim)pop(eastDecor,0.3);}
function expandWing(anim){winged=true;divider2.visible=false;div2Sol.forEach(s=>s.active=false);tape2.visible=false;wingDecor.visible=true;wingFloorMat.color.setHex(0xeef5fb);if(anim)pop(wingDecor,0.3);}

/* ---------- staff ---------- */
const CASH_COL=[[0xff6fa8,0x3a3f8f],[0x4fc3a1,0x2f6f8f],[0xffb14a,0x8f3a3a]];
function hireCashier(i,anim){const co=checkouts[i];const ch=makeChar(CASH_COL[i%3][0],{visor:CASH_COL[i%3][1]});ch.g.position.set(co.cx,co.Y,-1.05);ch.g.rotation.y=Math.PI;scene.add(ch.g);co.cashier=ch;co.ring.visible=false;if(anim)pop(ch.g,0.2);}
const helpers=[];const HOMES=[V3(2.6,0,1.3),V3(10.2,0,1.6),V3(11.6,0,1.6),V3(-1.6,0,1.8),V3(26,0,1.6),V3(24.4,0,1.6)];const HOMES2=[V3(66,0,-2),V3(68,0,-2),V3(95,0,-3)];
const HCOL=[0x8a6cff,0x5b9bff,0xff7a59,0x36b37e,0xe056a0,0x2bb3c0];
function addHelper(anim,f2){if(NET.mode==='guest')return;const i=helpers.length;const home=f2?HOMES2[helpers.filter(h=>h.f2).length%3].clone():HOMES[helpers.filter(h=>!h.f2).length%HOMES.length].clone();const ch=makeChar(HCOL[i%6],{straw:[0xf2d16b,0xffe38a,0xe8c06a,0xf7d774][i%4]});
  ch.g.position.copy(home);scene.add(ch.g);const bub=canvasSprite(128,144,0.6,0.68);bub.s.position.y=2.1;ch.g.add(bub.s);helpers.push({rideLeg:-1,f2:!!f2,ch,g:ch.g,c:new Carrier(ch.g),state:'idle',task:null,path:[],home,t:0,want:0,bub,bubE:'',stuckT:0,retries:0,goal:null});if(anim)pop(ch.g,0.2);}

/* ---------- player ---------- */
const pch=makeChar([0xff9b3d,0x4aa3ff,0xff5d8f,0x9b6bff,0x2ec27e][NET.col],{sprout:true,apron:true});const player=pch.g;player.position.set(0,0,-4);scene.add(player);
const pc=new Carrier(player);
const maxTag=canvasSprite(128,64,1.1,0.55);
(()=>{const x=maxTag.ctx;x.textAlign='center';x.textBaseline='middle';x.font='900 44px system-ui,sans-serif';x.lineJoin='round';x.lineWidth=9;x.strokeStyle='#b3261e';x.strokeText(L('满了'),64,34);x.fillStyle='#fff';x.fillText(L('满了'),64,34);maxTag.tex.needsUpdate=true;})();
maxTag.s.visible=false;player.add(maxTag.s);

