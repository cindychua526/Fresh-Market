/* ---------- pads ---------- */
const PAD_DEFS=[
  {id:'cap',e:'🎒',name:'大背篓',costs:[30,90,200,380,600,900],x:8.8,z:-4},
  {id:'eggFarm',e:'🐔',name:'鸡舍',costs:[80],x:0,z:5.2},
  {id:'eggShelf',e:'🥚',name:'鸡蛋货架',costs:[60],x:0,z:-11.3,req:'eggFarm'},
  {id:'speed',e:'👟',name:'跑鞋',costs:[70,160,320,550,900],x:8.8,z:-7.5,req:'eggFarm'},
  {id:'cashier',e:'🧾',name:'收银员',costs:[180],x:-9.6,z:1.6,req:'eggShelf'},
  {id:'cowFarm',e:'🐄',name:'奶牛',costs:[250],x:6,z:5.2,req:'eggShelf'},
  {id:'milkShelf',e:'🥛',name:'牛奶货架',costs:[160],x:5,z:-11.3,req:'cowFarm'},
  {id:'helper',e:'🧺',name:'搬运工',costs:[320],x:2.6,z:1.3,req:'milkShelf'},
  {id:'boost',e:'🌱',name:'农场增产',costs:[120,260,480,800,1300],x:-9.8,z:5,req:'cashier'},
  {id:'expand',e:'🏗️',name:'扩建店面',costs:[600],x:8.8,z:-1.0,req:'milkShelf'},
  {id:'carrotFarm',e:'🥕',name:'胡萝卜田',costs:[200],x:-6,z:11.7,req:'milkShelf'},
  {id:'carrotShelf',e:'🥕',name:'胡萝卜货架',costs:[150],x:-3,z:-6.3,req:'carrotFarm'},
  {id:'wheatFarm',e:'🌾',name:'麦田',costs:[300],x:13,z:9.2,req:'expand'},
  {id:'oven',e:'🔥',name:'面包烤炉',costs:[350],x:14.5,z:3.6,req:'wheatFarm'},
  {id:'breadShelf',e:'🍞',name:'面包货架',costs:[280],x:14.5,z:-11.3,req:'oven'},
  {id:'price',e:'✨',name:'店铺装修',costs:[400,900,1800,3500],x:-9.2,z:-11.2,req:'expand'},
  {id:'ads',e:'📣',name:'张贴广告',costs:[300,700,1400,2500],x:-9.2,z:-8.6,req:'expand'},
  {id:'sigStall',e:'🧺',name:'特产摊',costs:[900],x:-15.4,z:-8.4,req:'expand'},
  {id:'checkout2',e:'🛎️',name:'二号收银台',costs:[400],x:20,z:-1.9,req:'breadShelf'},
  {id:'press',e:'🧀',name:'奶酪机',costs:[500],x:18.5,z:3.6,req:'breadShelf'},
  {id:'berryFarm',e:'🍓',name:'草莓田',costs:[380],x:0,z:11.7,req:'breadShelf'},
  {id:'jamMaker',e:'🍯',name:'果酱机',costs:[450],x:6,z:11.6,req:'berryFarm'},
  {id:'jamShelf',e:'🍯',name:'果酱货架',costs:[350],x:3,z:-6.3,req:'jamMaker'},
  {id:'cheeseShelf',e:'🧀',name:'奶酪货架',costs:[420],x:18.5,z:-11.3,req:'press'},
  {id:'cashier2',e:'🧾',name:'二号收银员',costs:[500],x:23.2,z:-0.8,req:'checkout2'},
  {id:'helpers',e:'🧺',name:'更多搬运工',costs:[900,1600,2600,3800,5200],x:10.2,z:1.6,req:'cheeseShelf'},
  {id:'appleFarm',e:'🍏',name:'果园',costs:[650],x:21,z:9.2,req:'cheeseShelf'},
  {id:'juicer',e:'🧃',name:'榨汁机',costs:[700],x:22.5,z:3.6,req:'appleFarm'},
  {id:'juiceShelf',e:'🧃',name:'果汁货架',costs:[600],x:22.5,z:-11.3,req:'juicer'},
  {id:'wing',e:'🏬',name:'扩建百货区',costs:[1500],x:23.8,z:-8.2,req:'juiceShelf'},
  {id:'depot',e:'🚚',name:'进货仓库',costs:[800],x:34,z:5.6,req:'wing'},
  {id:'truck',e:'⏩',name:'加快送货',costs:[600,1200,2400],x:28,z:7.4,req:'depot'},
  ...WING_GOODS.map((t,i)=>({id:'sh_'+t,e:ITEM[t].e,name:{soda:'汽水',cookies:'饼干',noodles:'泡面',chocolate:'巧克力',tissue:'纸巾',shampoo:'洗发水',icecream:'冰淇淋',canned:'罐头'}[t]+'货架',
    costs:[[400,500,650,800,1000,1200,1500,1800][i]],x:SHELF_POS[t][0],z:SHELF_POS[t][1]+0.2,req:i?'sh_'+WING_GOODS[i-1]:'depot'})),
  {id:'checkout3',e:'🛎️',name:'三号收银台',costs:[900],x:30,z:-1.9,req:'sh_cookies'},
  {id:'cashier3',e:'🧾',name:'三号收银员',costs:[1000],x:27.8,z:-0.8,req:'checkout3'},
  {id:'floor2',e:'🏢',name:'开放二楼',costs:[3000],x:15.5,z:-7,req:'wing'},
  {id:'elevator',e:'🛗',name:'货梯',costs:[1500],x:92,z:-9.2,req:'floor2'},
  ...F2_GOODS.map((t,i)=>({id:'sh2_'+t,e:ITEM[t].e,name:{tshirt:'服装',book:'图书',ball:'运动',umbrella:'雨伞',teddy:'玩具',headphones:'数码'}[t]+'货架',
    costs:[[1200,1500,1800,2200,2600,3000][i]],x:SHELF_POS[t][0],z:SHELF_POS[t][1]+0.2,req:i?'sh2_'+F2_GOODS[i-1]:'elevator'})),
  {id:'cashier4',e:'🧾',name:'二楼收银员',costs:[1800],x:92.4,z:-0.8,req:'sh2_tshirt'},
  {id:'staff2',e:'🧺',name:'二楼店员',costs:[2500,4000,6000],x:66,z:-3.2,req:'sh2_book'},
  {id:'foodhall',e:'🍽️',name:'美食广场',costs:[4000],x:97.8,z:-6.4,req:'sh2_teddy'},
  {id:'stallBurger',e:'🍔',name:'汉堡摊',costs:[2500],x:105,z:-12.4,req:'foodhall'},
  {id:'stallSoup',e:'🍲',name:'面馆',costs:[3000],x:111,z:-12.4,req:'stallBurger'},
  {id:'stallDrink',e:'🍹',name:'饮品站',costs:[3500],x:117,z:-12.4,req:'stallSoup'},
];
const pads=[],padById={};
const padGeo=new THREE.PlaneGeometry(2,2);
PAD_DEFS.forEach(d=>{
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);
  const mesh=new THREE.Mesh(padGeo,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
  mesh.rotation.x=-Math.PI/2;mesh.position.set(d.x,floorY(d.x)+(d.z<0.3?0.125:0.03),d.z);mesh.renderOrder=2;mesh.userData.live=1;scene.add(mesh);
  const p={...d,idx:pads.length,lvl:0,paid:0,done:false,stand:0,visible:false,mesh,ctx,tex,dirty:true,flyT:0};
  pads.push(p);padById[p.id]=p;
});
const padMul=p=>Math.pow(BAL.padGrowth,p.idx)*(1+BAL.branchCost*(legacy.n||0));
const padCost=p=>{const c=p.costs[p.lvl];return c==null?c:Math.max(10,Math.round(c*padMul(p)/10)*10);};
const TOTAL_STEPS=pads.reduce((s,p)=>s+p.costs.length,0);
/* upgrade pads look like a paper price ticket on the floor that fills with green as you pay */
const PAD_FONT='ui-rounded,"SF Pro Rounded","PingFang SC","Microsoft YaHei",system-ui,sans-serif';
function drawPad(p){
  const x=p.ctx;x.clearRect(0,0,256,256);const cost=padCost(p),prog=Math.min(1,p.paid/cost);
  rrect(x,14,14,228,228,38);x.fillStyle='rgba(255,254,250,.9)';x.fill();
  if(prog>0){x.save();x.clip();x.fillStyle='rgba(30,140,85,.9)';x.fillRect(14,242-228*prog,228,228*prog);x.restore();}
  rrect(x,14,14,228,228,38);x.setLineDash([24,14]);x.lineWidth=8;x.strokeStyle='#1e8c55';x.stroke();x.setLineDash([]);
  x.textAlign='center';x.textBaseline='middle';
  x.font='62px '+EMOJI;x.fillText(p.e,128,72);
  let nm=L(p.name)+(p.costs.length>1?' Lv.'+(p.lvl+1):''),fs=28;x.font='900 '+fs+'px '+PAD_FONT;const tw=x.measureText(nm).width;if(tw>206){fs=Math.floor(28*206/tw);x.font='900 '+fs+'px '+PAD_FONT;}
  x.fillStyle=prog>0.45?'#fff':'#173a2b';x.fillText(nm,128,134);
  const pr='💵'+Math.ceil(cost-p.paid);x.font='900 34px '+PAD_FONT;const pw=Math.min(212,x.measureText(pr).width+36);
  rrect(x,128-pw/2,168,pw,50,25);x.fillStyle='#e5483b';x.fill();x.fillStyle='#fff';x.fillText(pr,128,195);
  p.tex.needsUpdate=true;
}
function updatePadVis(){pads.forEach(p=>{p.visible=!p.done&&(!p.req||padById[p.req].done);p.mesh.visible=p.visible;});}
const cap=()=>4+2*padById.cap.lvl+PK('basket');
const speed=()=>(4.6+0.8*padById.speed.lvl)*(1+0.05*PK('walk'));
const boost=()=>Math.pow(0.8,padById.boost.lvl);
const price=t=>ITEM[t].price*(1+0.25*padById.price.lvl)*(promo&&promo.type===t?0.8:1)*(1+0.25*(legacy.n||0))*(1+BAL.stPrice*(stLv['s:'+t]||0))*(hasT('tower')?1.1:1);
let promo=null,promoT=40;
const adsLvl=()=>padById.ads.lvl;
function applyPad(p,anim){
  switch(p.id){
    case 'eggFarm':unlockProducer('egg',anim);break;
    case 'eggShelf':unlockShelf('egg',anim);break;
    case 'cowFarm':unlockProducer('milk',anim);break;
    case 'milkShelf':unlockShelf('milk',anim);break;
    case 'cashier':hireCashier(0,anim);break;
    case 'helper':case 'helpers':addHelper(anim);break;
    case 'expand':expandStore(anim);break;
    case 'wheatFarm':unlockProducer('wheat',anim);break;
    case 'oven':unlockMachine('bread',anim);break;
    case 'breadShelf':unlockShelf('bread',anim);break;
    case 'checkout2':unlockCheckout(1,anim);break;
    case 'press':unlockMachine('cheese',anim);break;
    case 'cheeseShelf':unlockShelf('cheese',anim);break;
    case 'cashier2':hireCashier(1,anim);break;
    case 'appleFarm':unlockProducer('apple',anim);break;
    case 'juicer':unlockMachine('juice',anim);break;
    case 'juiceShelf':unlockShelf('juice',anim);break;
    case 'carrotFarm':unlockProducer('carrot',anim);break;
    case 'carrotShelf':unlockShelf('carrot',anim);break;
    case 'berryFarm':unlockProducer('strawberry',anim);break;
    case 'jamMaker':unlockMachine('jam',anim);break;
    case 'jamShelf':unlockShelf('jam',anim);break;
    case 'wing':expandWing(anim);break;
    case 'depot':unlockDepot(anim);break;
    case 'checkout3':unlockCheckout(2,anim);break;
    case 'cashier3':hireCashier(2,anim);break;
    case 'floor2':openFloor2(anim);unlockCheckout(3,anim);break;
    case 'elevator':elevOn=true;break;
    case 'sigStall':{const t=SIG_ITEMS[TW()];unlockProducer(t,anim);unlockShelf(t,anim);break;}
    case 'foodhall':openFoodHall(anim);break;
    case 'stallBurger':unlockMachine('burger',anim);break;
    case 'stallSoup':unlockMachine('soup',anim);break;
    case 'stallDrink':unlockMachine('drink',anim);break;
    case 'cashier4':hireCashier(3,anim);break;
    case 'staff2':addHelper(anim,true);break;
    default:if(p.id.startsWith('sh2_')){const t=p.id.slice(4);unlockShelf(t,anim);unlockPallet(t,anim);}
    else if(p.id.startsWith('sh_')){const t=p.id.slice(3);unlockShelf(t,anim);unlockPallet(t,anim);}
  }
}
/* ?debug in the URL shows a live overlay; every unlock is logged (with session minutes and cost)
   to localStorage 'fm-pace' so a real playthrough tells you exactly how to tune BAL */
const DBG=/[?&]debug\b/.test(location.search);let dbgEl=null;const SESS0=Date.now(),earnHist=[];
function paceLog(name,cost){try{const L0=JSON.parse(localStorage.getItem('fm-pace')||'[]');L0.push({min:+((Date.now()-SESS0)/60000).toFixed(1),day:dayN,br:legacy.n||0,name,cost:Math.round(cost),earned:Math.round(stats.earned)});
  while(L0.length>400)L0.shift();localStorage.setItem('fm-pace',JSON.stringify(L0));}catch(_){}PACE.lastUnlock=Date.now();}
function dbgTick(){if(!DBG)return;if(!dbgEl){dbgEl=document.createElement('div');dbgEl.id='dbg';dbgEl.innerHTML='<pre></pre><button type="button">'+TT('复制节奏数据 CSV','Copy pacing CSV','Salin data rentak (CSV)')+'</button>';document.body.appendChild(dbgEl);
    dbgEl.querySelector('button').onclick=async()=>{const L0=JSON.parse(localStorage.getItem('fm-pace')||'[]');const csv='min,day,branch,unlock,cost,earned\n'+L0.map(r=>[r.min,r.day,r.br,'"'+r.name+'"',r.cost,r.earned].join(',')).join('\n');try{await navigator.clipboard.writeText(csv);toast('📋 CSV');}catch(_){console.log(csv);toast('CSV → console');}};}
  earnHist.push([Date.now(),stats.earned]);while(earnHist.length>2&&Date.now()-earnHist[0][0]>60000)earnHist.shift();
  const [t0,e0]=earnHist[0],perMin=earnHist.length>1?(stats.earned-e0)/Math.max(1,(Date.now()-t0)/60000):0;
  const since=PACE.lastUnlock?Math.round((Date.now()-PACE.lastUnlock)/1000):'-';
  dbgEl.firstChild.textContent=['fps '+(1000/(PACE.iv||16.7)).toFixed(0)+'  cpu '+(PACE.cpu||0).toFixed(1)+' ms  res ×'+PACE.scale.toFixed(1),
    'draws '+PACE.calls+'  tris '+(PACE.tris/1000).toFixed(0)+'k  chars '+(customers.length+helpers.length),
    '💵/min '+fmtN(perMin)+'  earned '+fmtN(stats.earned),
    'pads '+pads.filter(p=>p.done).length+'/'+pads.length+'  ★'+totalStars()+'  ⭐'+(legacy.stars||0)+'  br '+(legacy.n||0),
    'pos '+player.position.x.toFixed(1)+','+player.position.z.toFixed(1)+'  last unlock '+since+'s ago  session '+((Date.now()-SESS0)/60000).toFixed(0)+' min'].join('\n');}
function purchase(p){paceLog(p.name+(p.costs.length>1?' Lv.'+(p.lvl+1):''),padCost(p));
  p.lvl++;p.paid=0;if(p.lvl>=p.costs.length)p.done=true;sparkle(V3(p.x,floorY(p.x)+0.6,p.z),22,0xfff1a0,1.4);camPunch();
  applyPad(p,true);updatePadVis();p.dirty=true;
  if(pads.every(q=>q.done))toast('🎉 全部解锁，小镇鲜市满级啦！',3500);
  else toast('✨ '+(p.costs.length>1?p.name+' Lv.'+p.lvl:'解锁 '+p.name));
  chord();save();
}

