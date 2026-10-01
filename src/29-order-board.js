/* ---------- order board: deliver a batch for a town customer ---------- */
const ORDER_WHO=['🏫 学校','🏥 医院','☕ 咖啡馆','🏠 邻居','🎂 生日派对','⚽ 足球队'];
const orderBox=new THREE.Group();scene.add(orderBox);box(1.1,0.7,0.9,0xc98b52,2.2,0.45,-1.2,orderBox);box(1.2,0.08,1.0,0x8a5a36,2.2,0.82,-1.2,orderBox);orderBox.visible=false;
const orderSol=solid(1.6,-1.7,2.8,-0.7,false);
const orderTag=canvasSprite(256,120,1.9,0.9);orderTag.s.position.set(2.2,2.2,-1.2);orderBox.add(orderTag.s);let orderT=40,orderTagKey='';
function drawOrderTag(){const k=order?order.type+order.got+'/'+order.n:'';if(k===orderTagKey)return;orderTagKey=k;const x=orderTag.ctx;x.clearRect(0,0,256,120);if(!order)return;
  rrect(x,6,6,244,108,36);x.fillStyle='#fff';x.fill();x.lineWidth=6;x.strokeStyle='#e0893a';x.stroke();x.textAlign='center';x.textBaseline='middle';x.font='50px '+EMOJI;x.fillText('📦'+ITEM[order.type].e,86,62);
  x.font='900 36px system-ui,sans-serif';x.fillStyle='#e0893a';x.fillText(order.got+'/'+order.n,190,62);orderTag.tex.needsUpdate=true;}
function makeOrderDst(type,n){const d={type,count:0,incoming:0,max:n,unlocked:true,kind:'order',dep:V3(2.2,0,0.1),slots:[]};d.slotPos=()=>V3(2.2,0.9,-1.2);d.space=()=>d.max-d.count-d.incoming;
  d.refresh=()=>{if(order){order.got=d.count;drawOrderTag();if(d.count>=d.max)finishOrder(true);}};return d;}
function finishOrder(ok){if(!order)return;if(ok){money+=order.reward;sparkle(V3(2.2,1.2,-1.2),20,0xffd24a,1.3);toast(L('📦 订单完成！')+ORDER_WHO[order.who]+' '+L('付了')+' 💵'+order.reward,2600);chord();stats.orders=(stats.orders||0)+1;}
  else toast(L('⌛ 订单超时了，下次加油'),2000);order=null;orderSol.active=false;orderBox.visible=false;orderT=80+Math.random()*60;}
function orderTick(dt){
  orderBox.visible=!!order;orderSol.active=!!order&&NET.mode!=='guest';if(order)drawOrderTag();
  if(NET.mode==='guest')return;
  if(order){order.t-=dt;if(order.t<=0)finishOrder(false);return;}
  orderT-=dt;if(orderT>0)return;const ls=lines().filter(t=>floorOf(SX[t])===1&&!FEST_ITEMS.includes(t));if(ls.length<2){orderT=30;return;}
  const t=ls[(Math.random()*ls.length)|0];const n=Math.max(6,Math.min(24,Math.round(140/ITEM[t].price)));
  order={type:t,n,got:0,t:150,who:(Math.random()*ORDER_WHO.length)|0,reward:Math.round(ITEM[t].price*n*2.2*(1+0.25*(legacy.n||0)))};order.dst=makeOrderDst(t,n);orderTagKey='';
  toast(ORDER_WHO[order.who]+' '+L('下了订单：')+n+' × '+ITEM[t].e+'，'+L('送到门口的📦箱子'),2800);
}
function orderHtml(){if(!order)return '';const m=Math.floor(order.t/60),sec=String(Math.floor(order.t%60)).padStart(2,'0');return '<div class="sec">📦 '+ORDER_WHO[order.who]+L('订单')+' · ⏱'+m+':'+sec+'</div>'+goalLine(ITEM[order.type].e+' × '+order.n+(order.reward?' · 💵'+order.reward:''),order.got,order.n,false);}

/* ---------- co-op team goal ---------- */
let team=null,teamT=60;
function teamTick(dt){if(NET.mode!=='host'||NET.remote.size<1){if(NET.mode!=='guest')team=null;return;}
  if(team){team.t-=dt;team.got=stats.served-team.base;if(team.got>=team.n){const rw=300*(NET.remote.size+1)+team.n*10;money+=rw;for(const a of NET.remote.values())a.contrib=(a.contrib||0)+rw*0.15;legacy.stars=(legacy.stars||0)+1;toast(L('🤝 团队目标完成！大家一起赚了')+' 💵'+rw+'  ⭐+1',2800);chord();team=null;teamT=120;}
    else if(team.t<=0){toast(L('🤝 团队目标没完成，再来一次吧'),2000);team=null;teamT=90;}return;}
  teamT-=dt;if(teamT<=0){const n=12+8*NET.remote.size;team={n,got:0,t:300,base:stats.served};toast(L('🤝 团队目标：5 分钟内一起服务')+' '+n+' '+L('位顾客'),2800);}}
function teamHtml(){if(!team)return '';return '<div class="sec">🤝 '+L('团队目标')+' · ⏱'+Math.floor(team.t/60)+':'+String(Math.floor(team.t%60)).padStart(2,'0')+'</div>'+goalLine(L('一起服务顾客'),team.got,team.n,false);}

/* ---------- stock overview (tap to point the arrow) ---------- */
let stockList=[];
document.getElementById('dailyBox').addEventListener('click',e=>{if(e.target.closest('[data-go="farm"]'))openFarm();});
document.getElementById('stockBox').addEventListener('click',e=>{const b=e.target.closest('[data-si]');if(!b)return;const it=stockList[+b.dataset.si];if(it){guideOverride={p:it.p,until:T+25};toast('👉 '+it.e);}});
function stockHtml(){stockList=[];for(const t of lines()){const sh=shelves[t];if(sh.count===0&&sh.incoming===0)stockList.push({e:ITEM[t].e,p:sh.dep});}
  for(const m of Object.values(machines))if(m.unlocked&&m.inp.count===0&&m.inp.incoming===0&&!m.fh)stockList.push({e:'⚙️'+ITEM[m.inT].e,p:m.inp.dep});
  if(!stockList.length)return '';return '<div class="sec">⚠️ '+L('缺货（点一下带你去）')+'</div><div class="stock">'+stockList.slice(0,8).map((s,i)=>'<button class="chip2" data-si="'+i+'">'+s.e+'</button>').join('')+'</div>';}

