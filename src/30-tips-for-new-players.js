/* ---------- tips for new players ---------- */
let tipsSeen={};try{tipsSeen=JSON.parse(localStorage.getItem('fm-tips')||'{}');}catch(_){}
const tipEl=document.getElementById('tip');let tipTimer=0,playT=0;
function showTip(id,text){if(tipsSeen[id])return false;tipsSeen[id]=1;try{localStorage.setItem('fm-tips',JSON.stringify(tipsSeen));}catch(_){}tipEl.textContent='💡 '+L(text);tipEl.classList.add('on');clearTimeout(tipTimer);tipTimer=setTimeout(()=>tipEl.classList.remove('on'),5200);return true;}
function tipsTick(){playT+=0.5;if(tipEl.classList.contains('on'))return;
  if(playT>180&&NET.mode!=='guest'&&stations().some(s=>(stLv[s.k]||0)===0&&money>=stCost(s.k,0))&&showTip('up',TT('右上角 ⭐ → 📈 可以给每个货架、田地和机器升星：卖得更贵、产得更快','Tap ⭐ → 📈 to add stars to every shelf, field and machine: higher prices, faster output','Ketik ⭐ → 📈 untuk menaik taraf setiap rak, ladang dan mesin: harga lebih tinggi, hasil lebih cepat')))return;
  if(playT>90&&NET.mode!=='guest'&&showTip('play',TT('右上角 🎮 里有「美食广场挑战」和「我的农场」','Tap 🎮 for the food court challenge and your own farm','Ketik 🎮 untuk cabaran medan selera dan ladang anda sendiri')))return;
  if(pads.every(p=>p.done)&&showTip('town',TT('店建好了！⭐ → 📈 → 🏙️ 帮镇长建设小镇，吸引新客人','The shop is complete! ⭐ → 📈 → 🏙️ to fund town projects that bring new shoppers','Kedai sudah lengkap! Ketik ⭐ → 📈 → 🏙️ untuk membiayai projek pekan yang menarik pelanggan baharu')))return;
  if(pc.carry.length&&showTip('carry','拿到了！把它送到黄色箭头指的货架上'))return;
  if(shelves.tomato.count>0&&showTip('shelf','摆好了！客人会自己拿货，然后去收银台排队'))return;
  if(!checkouts[0].cashier&&coWaiting(checkouts[0])&&showTip('reg','站到收银台后面的白圈里，帮客人结账。结得越快，小费越多！'))return;
  if(checkouts[0].stack.length&&showTip('money','结账的钱会放在收银台旁边，走过去就能收'))return;
  if(money>=30&&pads.some(p=>p.visible)&&showTip('pad','站到会跳动的方块上，就能花钱解锁新东西'))return;
  if(playT>150&&showTip('card','左上角是时间、今日目标和缺货提醒，点一下可以展开或收起'))return;
  if(pads.some(p=>p.lvl>0&&p.id!=='cap')&&showTip('hub','右上角 ⭐ 里有排行榜、成就、图鉴、装扮和设置'))return;
  if(playT>400&&showTip('zoom','两根手指捏合可以缩放画面，⚙️ 里还能换摇杆位置'))return;}

/* ---------- vibration ---------- */
function vib(ms){if(GFX.vib&&navigator.vibrate)try{navigator.vibrate(ms);}catch(_){}}

/* ---------- collection book ---------- */
function bookPages(){const soldT=[...SELL,...FEST_ITEMS,'burger','soup','drink'];
  return [{id:'goods',n:'商品图鉴',items:soldT.map(t=>({e:ITEM[t].e,ok:(stats.sold[t]||0)>0})),r:3000},
    {id:'vip',n:'常客图鉴',items:VIPS.map(v=>({e:'⭐',t:v.n,ok:vipState[v.n]!=null})),r:1500},
    {id:'fest',n:'节日图鉴',items:FESTS.map(f=>({e:f.e,t:L(f.n),ok:(stats.sold[f.item]||0)>0})),r:2000},
    {id:'hat',n:'帽子图鉴',items:DECOR.hat.slice(1).map((h,i)=>({e:'🎩',t:L(h.n),ok:!!decor.owned['hat:'+(i+1)]})),r:1000}];}

/* ---------- branches (prestige) + themes ---------- */
const THEMES=[{n:'田园小镇',g:0x8fd96b,sky:0x8fd96b,t1:0x4fbf4a,t2:0x62d15a},{n:'海边小镇',g:0xeedcaa,sky:0x9fd8f5,t1:0x2fae8a,t2:0x48c9a0},{n:'雪乡小镇',g:0xeef4f8,sky:0xc8dff0,t1:0x3f8f6a,t2:0xf4fbff},{n:'樱花小镇',g:0xb6e3a0,sky:0xffdbe6,t1:0xff9fc0,t2:0xffc4d8}];
function applyTheme(){DAYK=-1;if(padById.sigStall){padById.sigStall.e=ITEM[SIG_ITEMS[TW()]].e;padById.sigStall.dirty=true;}const th=THEMES[(legacy.n||0)%THEMES.length];M(0x8fd96b).color.setHex(th.g);dayBg.setHex(th.sky);M(0x4fbf4a).color.setHex(th.t1);M(0x62d15a).color.setHex(th.t2);}
function branchStars(){return 5+Math.floor(totalStars()/8)+2*TOWN.filter(t=>hasT(t.id)).length;}
function openBranch(){
  const keep={savedAt:Date.now(),money:300+500*PK('start'),legacy:{n:(legacy.n||0)+1,stars:(legacy.stars||0)+branchStars(),perks:legacy.perks||{}},ach:ACH_STATE,vip:vipState,decor,stats,story,weekly,streak,stLv:{},town:{},day:{t:0.04,n:1},daily:{goals:[],d:{sold:{},served:0,diners:0,earned:0},day:0},pads:[],counts:{}};
  try{localStorage.setItem(KEY,JSON.stringify(keep));}catch(_){}resetting=true;cloudPushObj(keep).finally(()=>location.reload());}

/* ---------- sparkles & camera punch ---------- */
const sparkTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,236,150,.9)');gr.addColorStop(1,'rgba(255,220,80,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const sparks=[];let sparkCool=0;
const sparkPool=[];
function sparkle(p,n=6,col=0xffe27a,power=1){if(GFX.q==='low')n=Math.ceil(n/2);n=Math.min(n,140-sparks.length);for(let i=0;i<n;i++){
  let s=sparkPool.pop();if(!s)s=new THREE.Sprite(new THREE.SpriteMaterial({map:sparkTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.material.color.setHex(col);s.material.opacity=1;s.scale.setScalar(0.35*power);s.position.copy(p);scene.add(s);const a=Math.random()*Math.PI*2,sp=(1+Math.random()*2)*power;sparks.push({s,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:2+Math.random()*2*power,t:0,life:0.6+Math.random()*0.3});}}
function updSparks(dt){sparkCool-=dt;for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.t+=dt;p.vy-=6*dt;p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;const k=p.t/p.life;p.s.material.opacity=1-k;
  if(k>=1){scene.remove(p.s);if(sparkPool.length<140)sparkPool.push(p.s);else p.s.material.dispose();sparks.splice(i,1);}}}
let camZ=1,camZT=1,camZTimer=0,userZoom=1;
function camPunch(){camZT=0.72;camZTimer=1.3;}

