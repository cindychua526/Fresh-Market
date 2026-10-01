/* ---------- mini-games: shared full-screen 2D canvas (the 3D shop pauses while one is open) ---------- */
const MINI={on:null,el:document.getElementById('mini'),cv:document.getElementById('mcv'),ui:document.getElementById('mui'),ctx:null,dpr:1,sc:1,ox:0,oy:0};
function miniOpen(kind){if(NET.mode==='guest'){toast(TT('帮朋友看店时不能玩小游戏（房主可以）','Mini-games are for the shop owner during co-op','Permainan mini untuk pemilik kedai semasa main bersama'));return false;}
  hubEl.hidden=true;playEl.hidden=true;save();MINI.on=kind;MINI.el.hidden=false;miniResize();return true;}
function miniClose(){MINI.on=null;MINI.el.hidden=true;MINI.ui.innerHTML='';last=performance.now();save();renderCard();}
function miniResize(){const w=innerWidth,h=innerHeight,d=Math.min(devicePixelRatio||1,2);MINI.dpr=d;MINI.cv.width=Math.round(w*d);MINI.cv.height=Math.round(h*d);
  MINI.sc=Math.min(w/400,h/720);MINI.ox=(w-400*MINI.sc)/2;MINI.oy=Math.max(0,(h-720*MINI.sc)/2);MINI.ctx=MINI.cv.getContext('2d');}
function miniFrame(dt){musicTick();const c=MINI.ctx;if(!c)return;c.setTransform(1,0,0,1,0,0);if(MINI.on==='k')kFrame(dt,c);else if(MINI.on==='f')fFrame(dt,c);}
function miniXf(c){c.setTransform(MINI.dpr*MINI.sc,0,0,MINI.dpr*MINI.sc,MINI.dpr*MINI.ox,MINI.dpr*MINI.oy);}
MINI.cv.addEventListener('pointerdown',e=>{const x=(e.clientX-MINI.ox)/MINI.sc,y=(e.clientY-MINI.oy)/MINI.sc;if(MINI.on==='k')kTap(x,y);else if(MINI.on==='f')fTap(x,y);});
addEventListener('resize',()=>{if(MINI.on)miniResize();});
const inR=(x,y,r)=>x>=r[0]&&y>=r[1]&&x<=r[0]+r[2]&&y<=r[1]+r[3];
const inC=(x,y,cx,cy,r)=>(x-cx)*(x-cx)+(y-cy)*(y-cy)<=r*r;
function mText(c,t,x,y,size,col,w=700,al='center'){c.font=w+' '+size+'px '+PAD_FONT;c.fillStyle=col;c.textAlign=al;c.textBaseline='middle';c.fillText(t,x,y);}
function mEmoji(c,e,x,y,size){c.font=size+'px '+EMOJI;c.textAlign='center';c.textBaseline='middle';c.fillText(e,x,y);}
function mRnd(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

/* ---------- 🍳 food court challenge: Cooking-Fever-style timed levels ----------
   Grill patties (take them off before they burn), put them on buns, add cheese, pour drinks, fry fries,
   and serve each customer's whole order before their patience runs out. 30 levels, 1-3 stars each. */
const KDISH={burger:{p:10},cheese:{p:14},drink:{p:6},fries:{p:8}};
const KSKIN=['#f1d3b3','#e3b58f','#c98f65','#9c6a48','#f5dcc4'],KHAIR=['#3b2a20','#5a3a26','#2a2522','#7a4a2a','#bdb6ab','#9a7048'],KSHIRT=['#3db34a','#2b8be0','#e8452e','#ffb81c','#8e5bd6','#ff7a3c'];
const KUPS=[{k:'grill',e:'🔥',max:3,n:TT('猛火烤炉','Hot grill','Gril panas'),d:TT('烤得快 15%','Cooks 15% faster','Masak 15% lebih cepat')},
 {k:'slot',e:'🍳',max:1,n:TT('第四个烤位','4th grill spot','Tempat gril ke-4'),d:TT('同时烤 4 块','Grill 4 at once','Panggang 4 serentak')},
 {k:'plate',e:'🍽️',max:1,n:TT('第四个盘子','4th plate','Pinggan ke-4'),d:TT('多一个装盘位','One more plate','Satu pinggan lagi')},
 {k:'drink',e:'🥤',max:3,n:TT('快速饮料机','Fast drinks','Minuman pantas'),d:TT('倒饮料快 15%','Pours 15% faster','Tuang 15% lebih cepat')},
 {k:'decor',e:'🪴',max:3,n:TT('温馨装修','Cosy decor','Hiasan selesa'),d:TT('客人耐心 +12%','Customers wait 12% longer','Pelanggan sanggup menunggu 12% lebih lama')}];
const kSave=()=>stats.kitchen||(stats.kitchen={stars:{},up:{},best:{}});
const kUp=k=>kSave().up[k]||0;
const kUpCost=(u,l)=>Math.round(1500*Math.pow(2.3,l)*(u.max===1?2.5:1)*(1+BAL.branchCost*(legacy.n||0))/100)*100;
function kStarsTotal(){const s=kSave().stars;let n=0;for(const k in s)n+=s[k];return n;}
const K={st:null,L:1};if(DBG){window.__K=K;window.__kStart=L=>kStart(L);}   // ?debug only: lets automated play-tests read the level state
function kLevel(L){const r=mRnd(L*7919+13),has={drink:L>=3,cheese:L>=6,fries:L>=9};const kinds=['burger',...(has.drink?['drink']:[]),...(has.cheese?['cheese']:[]),...(has.fries?['fries']:[])];
  const n=6+Math.floor(Math.min(L,22)*0.9)+Math.floor(Math.max(0,L-22)*0.35),orders=[];   /* late levels: fewer, not endless, customers */let pot=0;
  for(let i=0;i<n;i++){const m=1+(L>=4&&r()<0.55?1:0)+(L>=10&&r()<0.45?1:0)+(L>=18&&r()<(L>22?0.22:0.35)?1:0);const o=[];for(let j=0;j<m;j++)o.push(kinds[(r()*kinds.length)|0]);orders.push(o);pot+=o.reduce((a,k)=>a+KDISH[k].p,0)*1.35;}
  return {L,n,orders,has,slots:L>=8?4:3,patience:Math.max(17,32-L*0.5),gap:Math.max(L>22?3.7:2.7,6.2-L*0.14),goals:[0.45,0.65,0.85].map(f=>Math.round(pot*f)),seed:L};}
function kStart(L){if(DBG)window.__kStart=kStart;const cfg=kLevel(L),g=3+kUp('slot'),pl=3+kUp('plate');
  miniResize();for(const st of ['raw','ok','burnt'])pattyPix(st);[null,{patty:0},{patty:1},{patty:1,cheese:true}].forEach(kBurgerSpr);['fry','ok','burnt'].forEach(kFriesSpr);for(let q=0;q<=8;q++)kDrinkSpr(q/8);
  K.L=L;K.st={cfg,t:0,coins:0,next:0,spawn:0.6,cust:Array(cfg.slots).fill(null),plates:Array(pl).fill(null),grill:Array(g).fill(0).map(()=>({s:null,t:0})),
    cups:[{s:'empty',t:0},{s:'empty',t:0}],fry:[{s:'empty',t:0},{s:'empty',t:0}],fx:[],done:false,combo:0,lastServe:-9,msg:'',msgT:0,lost:0,served:0,lastPlateTap:[-9,-1],rnd:mRnd(L*31+7)};
  MINI.ui.innerHTML='<button class="mclose" id="kQuit" aria-label="'+TT('退出','Quit','Keluar')+'">✕</button>';document.getElementById('kQuit').onclick=()=>kMenu();}
const KT={cook:()=>4*Math.pow(0.85,kUp('grill')),burn:()=>kT.cook()+5,pour:()=>2.6*Math.pow(0.85,kUp('drink')),fry:3.4,fburn:9.5};const kT=KT;
/* layout (logical 400 x 720) */
const KL={custY:170,plateY:300,grill:[14,368,246,124],bun:[272,368,114,56],cheese:[272,436,114,56],drink:[14,506,184,118],fryer:[208,506,178,118]};
const kCustX=(i,n)=>32+(336/n)*(i+0.5);const kPlateX=(i,n)=>30+(340/n)*(i+0.5);
const kGrillX=(i,n)=>KL.grill[0]+28+i*((KL.grill[2]-56)/Math.max(1,n-1));
function kMsg(t){K.st.msg=t;K.st.msgT=1.8;}
function kFx(e,x,y,tx,ty,col){K.st.fx.push({e,x,y,tx,ty,t:0,col});}
function kServe(kind,fx,fy){const s=K.st;for(let i=0;i<s.cust.length;i++){const c=s.cust[i];if(!c||c.leave)continue;const it=c.order.find(o=>o.k===kind&&!o.ok);if(!it)continue;
    it.ok=true;const cx=kCustX(i,s.cust.length);kFx(kind,fx,fy,cx,KL.custY,null);blip(880,0.05,'sine',0.05);
    if(c.order.every(o=>o.ok)){const base=c.order.reduce((a,o)=>a+KDISH[o.k].p,0),tip=Math.round(base*0.5*Math.max(0,c.left/c.max));
      s.combo=s.t-s.lastServe<5?s.combo+1:1;s.lastServe=s.t;const cb=s.combo>=2?Math.round(base*0.1*Math.min(s.combo,5)):0;const pay=base+tip+cb;
      s.coins+=pay;s.served++;c.leave=0.6;c.happy=true;kFx('+'+pay+(cb?' 🔥'+s.combo:''),cx,KL.custY-40,cx,KL.custY-90,'#5f7f4f');blip(1320,0.08,'sine',0.05);}
    return true;}
  kMsg(TT('现在没有人点这个','Nobody ordered that right now','Tiada siapa yang memesan itu sekarang'));return false;}
function kTap(x,y){const s=K.st;if(!s||s.done)return;initAudio();
  // grill
  for(let i=0;i<s.grill.length;i++){const g=s.grill[i],gx=kGrillX(i,s.grill.length),gy=KL.grill[1]+64;if(!inC(x,y,gx,gy,27))continue;
    if(!g.s){g.s='raw';g.t=0;blip(420,0.05,'square',0.03);}
    else if(g.s==='ok'){const p=s.plates.findIndex(p=>p&&!p.patty);if(p<0){kMsg(TT('先点面包放到盘子上','Tap the buns to put one on a plate first','Ketik roti untuk meletakkannya di atas pinggan dahulu'));return;}
      s.plates[p].patty=1;g.s=null;kFx('patty',gx,gy,kPlateX(p,s.plates.length),KL.plateY,null);}
    else if(g.s==='burnt'){g.s=null;s.coins=Math.max(0,s.coins-2);kFx('-2',gx,gy,gx,gy-40,'#b8583a');}
    else kMsg(TT('还没熟','Not cooked yet','Belum masak'));return;}
  if(inR(x,y,KL.bun)){const p=s.plates.findIndex(p=>!p);if(p<0){kMsg(TT('盘子满了','All plates are full','Semua pinggan penuh'));return;}s.plates[p]={patty:0,cheese:false};blip(520,0.04);return;}
  if(inR(x,y,KL.cheese)){if(!s.cfg.has.cheese)return;const p=s.plates.findIndex(p=>p&&p.patty&&!p.cheese);if(p<0){kMsg(TT('芝士要放在有肉饼的汉堡上','Cheese goes on a burger with a patty','Keju diletakkan pada burger yang sudah ada daging'));return;}s.plates[p].cheese=true;blip(620,0.04);return;}
  for(let i=0;i<s.plates.length;i++){if(!inC(x,y,kPlateX(i,s.plates.length),KL.plateY,40))continue;const p=s.plates[i];if(!p)return;
    if(p.patty){if(kServe(p.cheese?'cheese':'burger',kPlateX(i,s.plates.length),KL.plateY))s.plates[i]=null;}
    else if(s.lastPlateTap[1]===i&&s.t-s.lastPlateTap[0]<0.45){s.plates[i]=null;kFx('×',kPlateX(i,s.plates.length),KL.plateY,kPlateX(i,s.plates.length),KL.plateY+40,null);}
    else{s.lastPlateTap=[s.t,i];kMsg(TT('还要放肉饼（点两下可以丢掉）','It still needs a patty (double-tap to throw away)','Perlu daging lagi (ketik dua kali untuk buang)'));}return;}
  if(s.cfg.has.drink&&inR(x,y,KL.drink)){const i=x<KL.drink[0]+KL.drink[2]/2?0:1,cu=s.cups[i];
    if(cu.s==='empty'){cu.s='pour';cu.t=0;blip(700,0.04);}else if(cu.s==='ready'){if(kServe('drink',KL.drink[0]+46+i*92,KL.drink[1]+62))cu.s='empty';}return;}
  if(s.cfg.has.fries&&inR(x,y,KL.fryer)){const i=x<KL.fryer[0]+KL.fryer[2]/2?0:1,f=s.fry[i];
    if(f.s==='empty'){f.s='fry';f.t=0;blip(380,0.05,'square',0.03);}else if(f.s==='ok'){if(kServe('fries',KL.fryer[0]+45+i*88,KL.fryer[1]+62))f.s='empty';}
    else if(f.s==='burnt'){f.s='empty';s.coins=Math.max(0,s.coins-2);}return;}}
function kUpdate(dt){const s=K.st;if(s.done)return;s.t+=dt;if(s.msgT>0)s.msgT-=dt;
  for(const g of s.grill)if(g.s){g.t+=dt;if(g.s==='raw'&&g.t>=kT.cook())g.s='ok';if(g.s==='ok'&&g.t>=kT.burn())g.s='burnt';}
  for(const c of s.cups)if(c.s==='pour'){c.t+=dt;if(c.t>=kT.pour())c.s='ready';}
  for(const f of s.fry)if(f.s==='fry'||f.s==='ok'){f.t+=dt;if(f.s==='fry'&&f.t>=kT.fry)f.s='ok';if(f.s==='ok'&&f.t>=kT.fburn)f.s='burnt';}
  const pat=s.cfg.patience*(1+0.12*kUp('decor'));
  for(let i=0;i<s.cust.length;i++){const c=s.cust[i];if(!c)continue;if(c.leave!=null){c.leave-=dt;if(c.leave<=0)s.cust[i]=null;continue;}
    c.left-=dt;if(c.left<=0){c.leave=0.8;c.happy=false;s.lost++;blip(220,0.12,'triangle',0.05);}}
  s.spawn-=dt;if(s.next<s.cfg.n&&s.spawn<=0){const free=s.cust.findIndex(c=>!c);if(free>=0){s.cust[free]={order:s.cfg.orders[s.next].map(k=>({k,ok:false})),max:pat,left:pat,look:[KSKIN[(s.rnd()*KSKIN.length)|0],KHAIR[(s.rnd()*KHAIR.length)|0],KSHIRT[(s.rnd()*KSHIRT.length)|0],(s.rnd()*4)|0]};s.next++;kFaceBase(s.cust[free].look);s.spawn=s.cfg.gap*(0.75+s.rnd()*0.5);}}
  for(let i=s.fx.length-1;i>=0;i--){const f=s.fx[i];f.t+=dt*2.6;if(f.t>=1)s.fx.splice(i,1);}
  if(s.next>=s.cfg.n&&s.cust.every(c=>!c))kFinish();}
function kFinish(){const s=K.st;s.done=true;const sv=kSave(),L=s.cfg.L,stars=s.coins>=s.cfg.goals[2]?3:s.coins>=s.cfg.goals[1]?2:s.coins>=s.cfg.goals[0]?1:0;
  const prev=sv.stars[L]||0,first=!sv.best[L];sv.best[L]=Math.max(sv.best[L]||0,s.coins);let cash=Math.round(s.coins*(first&&stars?6:2)*rewardMul()/10)*10,gotStar=0;
  if(stars>prev){sv.stars[L]=stars;if(stars===3){legacy.stars=(legacy.stars||0)+1;gotStar=1;}}
  if(stars)money+=cash;else cash=0;save();if(stars)chord();
  MINI.ui.innerHTML='<div class="mcard"><h3>'+(stars?TT('营业结束！','Shift complete!','Syif selesai!'):TT('差一点点…','So close…','Hampir…'))+'</h3><div class="mstars">'+starStr(stars)+'</div>'+
    '<p>'+TT('赚了','Earned','Diperoleh')+' $'+s.coins+' · '+TT('目标','Goals','Sasaran')+' '+s.cfg.goals.join(' / ')+'</p><p>'+TT('服务','Served','Dilayan')+' '+s.served+' · '+TT('走掉','Walked out','Beredar')+' '+s.lost+'</p>'+
    (stars?'<p class="mrew">+💵'+fmtN(cash)+(gotStar?'  ⭐+1':'')+'</p>':'<p>'+TT('需要 $','Need $','Perlu $')+s.cfg.goals[0]+' '+TT('才能过关','to pass','untuk lulus')+'</p>')+
    '<div class="row"><button class="big ghost" id="kBack">'+TT('选关','Levels','Tahap')+'</button><button class="big alt" id="kAgain">'+TT('再来一次','Retry','Cuba lagi')+'</button>'+(stars&&L<30?'<button class="big" id="kNext">'+TT('下一关','Next','Seterusnya')+'</button>':'')+'</div></div>';
  trDom(MINI.ui);document.getElementById('kBack').onclick=kMenu;document.getElementById('kAgain').onclick=()=>kStart(L);const nx=document.getElementById('kNext');if(nx)nx.onclick=()=>kStart(L+1);}
function kMenu(){K.st=null;const sv=kSave();let h='<div class="msheet"><div class="mhead"><b>🍳 '+TT('美食广场挑战','Food court challenge','Cabaran medan selera')+'</b><span>⭐ '+kStarsTotal()+'/90</span><button class="mclose2" id="kX">✕</button></div>'+
  '<p class="sub">'+TT('点烤架放肉饼，熟了再点它放到面包上；做好整份订单再端给客人。三星奖励店长星星。','Tap the grill to add a patty, tap it again when cooked to put it on a bun, and serve each whole order. 3 stars earns a manager star.','Ketik gril untuk meletakkan daging, ketik lagi apabila masak untuk meletakkannya di atas roti, kemudian hidangkan pesanan penuh. 3 bintang memberi satu bintang pengurus.')+'</p><div class="lvgrid">';
  for(let L=1;L<=30;L++){const st=sv.stars[L]||0,open=L===1||(sv.stars[L-1]||0)>0;h+='<button class="lv'+(open?'':' lock')+'" data-l="'+L+'"'+(open?'':' disabled')+'><b>'+(open?L:'🔒')+'</b><small>'+starStr(st)+'</small></button>';}
  h+='</div><div class="sec" style="font-weight:900;margin:12px 0 4px">'+TT('🧰 厨房升级（用店里的钱）','🧰 Kitchen upgrades (shop money)','🧰 Naik taraf dapur (wang kedai)')+'</div>'+
    KUPS.map(u=>{const l=kUp(u.k),mx=l>=u.max,c=mx?0:kUpCost(u,l),ok=!mx&&money>=c;return '<div class="li"><div class="e">'+u.e+'</div><div class="t"><b>'+u.n+' <span class="stars">'+l+'/'+u.max+'</span></b><small>'+u.d+'</small></div><button class="sbtn'+(ok?'':' ghost')+'" data-ku="'+u.k+'"'+(ok?'':' disabled')+'>'+(mx?'✅':'💵'+fmtN(c))+'</button></div>';}).join('')+'</div>';
  MINI.ui.innerHTML=h;trDom(MINI.ui);document.getElementById('kX').onclick=miniClose;
  MINI.ui.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>kStart(+b.dataset.l));
  MINI.ui.querySelectorAll('[data-ku]').forEach(b=>b.onclick=()=>{const u=KUPS.find(x=>x.k===b.dataset.ku),l=kUp(u.k),c=kUpCost(u,l);if(l>=u.max||money<c)return;money-=c;sv.up[u.k]=l+1;chord();save();kMenu();});}
function openKitchen(){if(miniOpen('k'))kMenu();}
/* drawing: illustrated food & stations, pre-rendered into a sprite cache (redrawn only on resize) */
const KS={cache:new Map(),res:0};
function kSprite(key,w,h,draw){const res=MINI.dpr*MINI.sc;if(KS.res!==res){KS.cache.clear();KS.res=res;}let cv=KS.cache.get(key);
  if(!cv){cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w*res));cv.height=Math.max(1,Math.ceil(h*res));const x=cv.getContext('2d');x.scale(res,res);x.translate(w/2,h/2);draw(x);KS.cache.set(key,cv);}return cv;}
function kBlit(c,spr,x,y,w,h,a=1){if(a<=0)return;const o=c.globalAlpha;c.globalAlpha=o*a;c.drawImage(spr,x-w/2,y-h/2,w,h);c.globalAlpha=o;}
const kN=(i,k=1)=>Math.sin(i*12.9898*k+k*78.233)*0.5+Math.sin(i*4.1+k)*0.5;       // deterministic wobble
const INK='#3a2010';
function blob(x,r,n,wob,seed){x.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,rr=r*(1+wob*kN(i%n,seed));const px=Math.cos(a)*rr,py=Math.sin(a)*rr*0.86;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();}
/* ---- realistic food: per-pixel height maps lit by one top-left light (computed once, cached) ---- */
const kH=(i,j,sd)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(sd,1442695041);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
function vn(x,y,sd){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=kH(i,j,sd),b=kH(i+1,j,sd),c=kH(i,j+1,sd),d=kH(i+1,j+1,sd);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y,sd,o=3){let t=0,a=0.5,f=1,n=0;for(let k=0;k<o;k++){t+=a*vn(x*f,y*f,sd+k*17);n+=a;f*=2;a*=0.5;}return t/n;}
const mix=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
const sstep=(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
let KTOON=true;
const LV=(()=>{const l=[-0.45,-0.62,0.64],n=Math.hypot(...l);return l.map(v=>v/n);})();const HV=(()=>{const h=[LV[0],LV[1],LV[2]+1],n=Math.hypot(...h);return h.map(v=>v/n);})();
/* fn(x,y) -> null or [r,g,b, alpha, height, specular, shininess]; heights in logical px */
function kPix(key,w,h,fn,bump=1,soft=false){return kSprite(key,w,h,x=>{const res=KS.res,W=Math.max(1,Math.ceil(w*res)),Hh=Math.max(1,Math.ceil(h*res)),N=W*Hh;
  const al=new Float32Array(N),hm=new Float32Array(N),cr=new Float32Array(N*3),sp=new Float32Array(N),sh=new Float32Array(N);
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const r=fn((i+0.5)/res-w/2,(j+0.5)/res-h/2);if(!r)continue;const k=j*W+i;cr[k*3]=r[0];cr[k*3+1]=r[1];cr[k*3+2]=r[2];al[k]=r[3];hm[k]=r[4];sp[k]=r[5];sh[k]=r[6];}
  if(KTOON){const R=Math.max(1,Math.round(res*1.1)),tmp=new Float32Array(N);for(let pass=0;pass<2;pass++){for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k0=j*W+i;if(al[k0]<=0){tmp[k0]=hm[k0];continue;}let sum=0,n=0;
      for(let q=-R;q<=R;q++){const ii=pass?i:i+q,jj=pass?j+q:j;if(ii<0||jj<0||ii>=W||jj>=Hh)continue;const kk=jj*W+ii;if(al[kk]>0){sum+=hm[kk];n++;}}tmp[k0]=sum/n;}hm.set(tmp);}}
  const img=x.createImageData(W,Hh),d=img.data,st=2/res;
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k=j*W+i;if(al[k]<=0)continue;
    const hl=i>0&&al[k-1]>0?hm[k-1]:hm[k]-0.6,hr=i<W-1&&al[k+1]>0?hm[k+1]:hm[k]-0.6,hu=j>0&&al[k-W]>0?hm[k-W]:hm[k]-0.6,hd=j<Hh-1&&al[k+W]>0?hm[k+W]:hm[k]-0.6;
    let nx=-(hr-hl)/st*bump,ny=-(hd-hu)/st*bump,nz=1;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
    const df=Math.max(0,nx*LV[0]+ny*LV[1]+nz*LV[2]),sc=Math.pow(Math.max(0,nx*HV[0]+ny*HV[1]+nz*HV[2]),sh[k]||20)*sp[k];
    let lit,sq=sc,r0=cr[k*3],g0=cr[k*3+1],b0=cr[k*3+2];
    if(KTOON){lit=soft?0.62+0.5*df:df>0.74?1.1:df>0.42?0.9:0.68;sq=sc>0.42?0.9:sc>0.22?0.22:0;const gy=0.3*r0+0.59*g0+0.11*b0;r0=gy+(r0-gy)*1.3;g0=gy+(g0-gy)*1.3;b0=gy+(b0-gy)*1.3;}else lit=0.38+0.8*df;
    d[k*4]=Math.max(0,Math.min(255,r0*lit+255*sq));d[k*4+1]=Math.max(0,Math.min(255,g0*lit+250*sq));d[k*4+2]=Math.max(0,Math.min(255,b0*lit+240*sq));d[k*4+3]=Math.round(255*Math.min(1,al[k]));}
  if(KTOON){const R=Math.max(1,Math.round(res*1.35)),m=new Uint8Array(N),mh=new Uint8Array(N);for(let q=0;q<N;q++)m[q]=al[q]>0.5?1:0;
    for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){let v=0;for(let q=-R;q<=R&&!v;q++){const ii=i+q;if(ii>=0&&ii<W&&m[j*W+ii])v=1;}mh[j*W+i]=v;}
    for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k0=j*W+i;if(m[k0])continue;let v=0;for(let q=-R;q<=R&&!v;q++){const jj=j+q;if(jj>=0&&jj<Hh&&mh[jj*W+i])v=1;}
      if(v){d[k0*4]=58;d[k0*4+1]=32;d[k0*4+2]=14;d[k0*4+3]=255;}}}
  x.setTransform(1,0,0,1,0,0);x.putImageData(img,0,0);});}
/* patty from above, on the grill */
function pattyPix(st){return kPix('pp:'+st,50,44,(x,y)=>{const ang=Math.atan2(y,x),edge=1+0.08*(fbm(Math.cos(ang)*1.8+5,Math.sin(ang)*1.8+5,7,3)-0.5)*2,d=Math.hypot(x/21,y/18)/edge;if(d>1.03)return null;
  const a=Math.min(1,(1.03-d)/0.07),dome=Math.sqrt(Math.max(0,1-d*d))*3.4,grain=(fbm(x*0.5,y*0.5,11,3)-0.5)*1.9+(vn(x*1.6,y*1.6,5)-0.5)*0.6,n1=fbm(x*0.2,y*0.2,21,3);let c,hh=dome+grain,spc,shn;
  if(st==='raw'){c=mix([214,62,74],[244,122,126],n1);const fat=vn(x*0.95,y*0.95,31);if(fat>0.7)c=mix(c,[255,226,220],Math.min(1,(fat-0.7)*5));const dk=vn(x*1.2,y*1.2,41);if(dk>0.8)c=mix(c,[110,26,40],0.55);spc=0.5;shn=34;}
  else if(st==='ok'){c=mix([128,62,24],[176,98,44],n1);const cr=vn(x*1.1,y*1.1,51);if(cr>0.72)c=mix(c,[184,122,72],(cr-0.72)*2.4);c=mix(c,[84,38,14],sstep(0.72,1.02,d)*0.7);
    const t=(((x+y)*0.62)/8.6+100)%1,m=1-sstep(0.1,0.17,Math.abs(t-0.5));if(m>0){c=mix(c,[30,14,6],m*0.88);hh-=m*0.9;}spc=0.32;shn=24;}
  else{c=mix([30,22,18],[64,48,38],n1);if(vn(x*1.3,y*1.3,61)>0.8)c=mix(c,[120,114,108],0.6);hh+=(vn(x*0.8,y*0.8,71)-0.5)*1.2;spc=0.05;shn=10;}
  return [c[0],c[1],c[2],a,hh,spc,shn];});}
function kPatty(c,x,y,st){kBlit(c,pattyPix(st),x,y,50,44);}
/* burger parts, side view */
const SEEDS_B=[[-15,-5],[-8,-10],[0,-12],[8,-10],[15,-5],[-11,-1],[-3,-5],[5,-5],[12,0],[-19,1],[20,1],[1,-1]];
function bunTopPix(){return kPix('bt2',56,32,(x,y)=>{const yy=y-5;const e=(x/25.5)*(x/25.5)+(yy/19)*(yy/19);const bot=5+1.2*(x/25.5)*(x/25.5);if(e>1||y>bot)return null;
  const a=Math.min(1,(1-e)/0.05,(bot-y)/0.9);let hh=9*Math.sqrt(Math.max(0,1-e))+(fbm(x*0.9,y*0.9,81,2)-0.5)*0.35,c=mix([252,188,82],[206,112,30],sstep(-20,6,y)*0.35+sstep(0.45,1,e)*0.5);
  c=mix(c,[150,84,30],Math.max(0,(-yy/19))*0.3);let spc=0.55,shn=36;
  for(const [sx,sy] of SEEDS_B){const dx=(x-sx)/1.9,dy=(y-sy)/1.05,q=dx*dx+dy*dy;if(q<1){c=mix(c,[246,234,204],0.92);hh+=0.9*Math.sqrt(1-q);spc=0.3;shn=20;break;}}
  if(y>bot-1.6)c=mix(c,[226,188,128],0.5);return [c[0],c[1],c[2],a,hh,spc,shn];},1.1);}
function bunBotPix(open){return kPix('bb'+(open?'o':''),56,20,(x,y)=>{const w=24.5-Math.max(0,y-2)*0.35;if(Math.abs(x)>w||y<-4||y>8.5)return null;
  const cx=Math.max(0,Math.abs(x)-(w-4)),cy=Math.max(0,y-4.5),r=Math.hypot(cx,cy);if(r>4)return null;const a=Math.min(1,(4-r)/0.8,(w-Math.abs(x))/0.8);
  let c=mix([250,186,86],[204,118,40],sstep(-4,8.5,y)),hh=4*Math.sqrt(Math.max(0,1-(x/w)*(x/w)))+(fbm(x,y,91,2)-0.5)*0.3,spc=0.3,shn=24;
  if(y<-1.2){const face=open;c=face?[244,222,176]:mix(c,[222,168,104],0.5);if(face){const pr=vn(x*1.4,y*2.2,101);if(pr>0.68)c=mix(c,[206,168,112],0.6);hh=5+(pr-0.5)*0.8;spc=0.05;}}
  return [c[0],c[1],c[2],a,hh,spc,shn];});}
function pattySidePix(){return kPix('ps2',58,18,(x,y)=>{const top=-5.5-1.3*fbm(x*0.4,1,111,2),bot=5.5+1.1*fbm(x*0.4,5,121,2),hw=26+0.8*(vn(y*0.6,3,131)-0.5);if(y<top||y>bot||Math.abs(x)>hw)return null;
  const a=Math.min(1,(y-top)/0.8,(bot-y)/0.8,(hw-Math.abs(x))/0.8);let hh=5*Math.sqrt(Math.max(0,1-(x/hw)*(x/hw)))+(fbm(x*0.7,y*0.7,141,3)-0.5)*1.5;
  let c=mix([112,52,20],[168,90,40],fbm(x*0.3,y*0.5,151,3));const cr=vn(x*1.2,y*1.2,161);if(cr>0.74)c=mix(c,[178,118,70],(cr-0.74)*2.5);if(cr<0.2)c=mix(c,[34,16,6],0.5);
  c=mix(c,[40,20,8],sstep(3,6.5,y)*0.4);return [c[0],c[1],c[2],a,hh,0.34,26];},1.2);}
function cheesePix(){return kPix('ch',58,16,(x,y)=>{if(Math.abs(x)>26.5)return null;let bot=-1.5;for(const [dx,dl] of [[-17,6],[-4,4.5],[9,7],[20,3.5]]){const t=1-Math.abs(x-dx)/4.2;if(t>0)bot=Math.max(bot,-1.5+dl*Math.sqrt(t));}
  if(y<-4||y>bot)return null;const a=Math.min(1,(y+4)/0.6,(bot-y)/0.7+0.2);const c=mix([255,214,60],[250,160,20],sstep(-4,bot,y));return [c[0],c[1],c[2],a,1.2+(vn(x*0.8,y,171)-0.5)*0.25,0.7,40];});}
function lettucePix(){return kPix('le',60,14,(x,y)=>{if(Math.abs(x)>28)return null;const bot=1.8+2.6*Math.sin(x*0.52+1)+0.8*Math.sin(x*1.3),top=-3.2+0.8*Math.sin(x*0.9);if(y<top||y>bot)return null;
  const a=Math.min(1,(y-top)/0.7,(bot-y)/0.7);const vein=Math.abs(Math.sin((x+y*0.4)*0.9));let c=mix([70,170,50],[140,220,80],fbm(x*0.25,y*0.6,181,2));if(vein<0.12)c=mix(c,[204,226,160],0.55);
  return [c[0],c[1],c[2],a,2+Math.sin(x*0.52+1)*1.2+(vn(x,y,191)-0.5)*0.4,0.35,18];});}
function kBurgerSpr(p){const key='b2:'+(p?(p.patty?1:0)+(p.cheese?'c':''):'x');return kSprite(key,64,50,x=>{x.translate(0,4);
  const sd=(ww,yy)=>{const g=x.createRadialGradient(0,yy,2,0,yy,ww);g.addColorStop(0,'rgba(40,24,12,.3)');g.addColorStop(1,'rgba(40,24,12,0)');x.fillStyle=g;x.beginPath();x.ellipse(0,yy,ww,5,0,0,7);x.fill();};
  const put=(spr,w,h,dx,dy,rot=0,sc=1)=>{x.save();x.translate(dx,dy);x.rotate(rot);x.scale(sc,sc);x.drawImage(spr,-w/2,-h/2,w,h);x.restore();};
  if(!p){sd(24,12);put(bunTopPix(),56,32,0,2);return;}
  if(!p.patty){sd(26,17);put(bunBotPix(true),56,20,-7,11);put(bunTopPix(),56,32,14,-1,0.3,0.7);return;}
  sd(27,19);put(bunBotPix(false),56,20,0,14.5);put(pattySidePix(),58,18,0,7);if(p.cheese)put(cheesePix(),58,16,0,3);put(lettucePix(),60,14,0,1);put(bunTopPix(),56,32,0,-6.5);});}
function kBurger(c,x,y,s,p){const spr=kBurgerSpr(p);kBlit(c,spr,x,y-2*s,64*s,50*s);}
function kDrinkSpr(f){const q=Math.round(f*8);return kSprite('d:'+q,40,64,x=>{const top=-22,bot=26;
  x.beginPath();x.moveTo(-14,top);x.lineTo(14,top);x.lineTo(10.5,bot);x.lineTo(-10.5,bot);x.closePath();x.fillStyle='rgba(240,246,244,.55)';x.fill();
  if(q>0){const lv=bot-(bot-top-3)*q/8,wl=10.5+3.5*(bot-lv)/(bot-top);x.save();x.beginPath();x.moveTo(-wl,lv);x.lineTo(wl,lv);x.lineTo(10.5,bot);x.lineTo(-10.5,bot);x.closePath();x.clip();
    const g=x.createLinearGradient(0,lv,0,bot);g.addColorStop(0,'#c77a3c');g.addColorStop(0.6,'#8e4a1f');g.addColorStop(1,'#5a2a10');x.fillStyle=g;x.fillRect(-15,lv,30,bot-lv);for(let i=0;i<7;i++){x.fillStyle='rgba(255,230,190,.35)';x.beginPath();x.arc(-7+Math.abs(kN(i,4))*14,lv+4+Math.abs(kN(i,8))*(bot-lv-6),0.7+Math.abs(kN(i,2))*0.8,0,7);x.fill();}
    if(q>=5){x.fillStyle='rgba(235,245,248,.7)';x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=0.8;[[-5,lv+6,0.2],[4,lv+9,-0.3],[-1,lv+14,0.5]].forEach(([a,b,r])=>{x.save();x.translate(a,b);x.rotate(r);x.fillRect(-3.5,-3.5,7,7);x.strokeRect(-3.5,-3.5,7,7);x.restore();});}
    x.fillStyle='rgba(255,240,215,.55)';x.fillRect(-wl,lv,wl*2,1.6);x.restore();}
  if(q>=8){x.strokeStyle='#5f7f4f';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(3,top+18);x.lineTo(9,top-10);x.stroke();x.fillStyle='#e8d36a';x.beginPath();x.arc(12,top+1,6,Math.PI*0.9,Math.PI*1.9);x.fill();x.strokeStyle='rgba(120,100,20,.6)';x.lineWidth=1;x.stroke();}
  x.beginPath();x.moveTo(-14,top);x.lineTo(14,top);x.lineTo(10.5,bot);x.lineTo(-10.5,bot);x.closePath();x.strokeStyle=INK;x.lineWidth=1.3;x.lineCap='butt';x.stroke();
  x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-11,top+4,2.2,bot-top-10);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(6,top+6,1.4,bot-top-16);
  for(let i=0;i<14;i++){const px=-11+Math.abs(kN(i,13))*21,py=top+6+Math.abs(kN(i,17))*(bot-top-10),r=0.6+Math.abs(kN(i,19))*0.9;x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(px,py,r,0,7);x.fill();x.fillStyle='rgba(60,40,30,.18)';x.beginPath();x.arc(px+0.4,py+0.5,r*0.6,0,7);x.fill();}});}
function kDrink(c,x,y,s,f){kBlit(c,kDrinkSpr(Math.max(0,Math.min(1,f))),x,y,40*s,64*s);}
function kFriesSpr(st){return kSprite('f:'+st,46,56,x=>{const pal=st==='burnt'?[[92,62,36],[40,26,14]]:st==='fry'?[[242,230,184],[214,196,138]]:[[255,214,90],[236,160,40]];
  const sticks=[...Array(10)].map((_,i)=>({cx:-13.5+i*3,len:21+Math.abs(kN(i,3))*10,rot:kN(i,6)*0.18,hw:1.9}));
  const spr=kPix('fs:'+st,46,56,(px,py)=>{for(const s2 of sticks){const cs=Math.cos(-s2.rot),sn=Math.sin(-s2.rot),lx=(px-s2.cx)*cs-(py-8)*sn,ly=(px-s2.cx)*sn+(py-8)*cs;
      if(Math.abs(lx)<=s2.hw&&ly<=0&&ly>=-s2.len){const u=lx/s2.hw,tip=sstep(-s2.len+4,-s2.len,ly);let c=mix(pal[0],pal[1],0.35+0.3*u);if(st==='ok')c=mix(c,[160,94,32],tip*0.7);
        if(vn(px*2.2,py*2.2,201)>0.9)c=mix(c,[252,250,244],0.8);return [c[0],c[1],c[2],1,2*Math.sqrt(Math.max(0,1-u*u))+(vn(px,py*0.6,211)-0.5)*0.3,st==='ok'?0.35:0.1,22];}}return null;});
  x.drawImage(spr,-23,-28,46,56);
  x.beginPath();x.moveTo(-17,-1);x.quadraticCurveTo(0,5,17,-1);x.lineTo(12,25);x.lineTo(-12,25);x.closePath();const g=x.createLinearGradient(-17,0,17,0);g.addColorStop(0,'#cf7050');g.addColorStop(0.45,'#b85a3c');g.addColorStop(1,'#8e4129');x.fillStyle=g;x.fill();
  x.strokeStyle='rgba(60,30,15,.55)';x.lineWidth=1;x.stroke();x.fillStyle='rgba(255,240,225,.2)';x.beginPath();x.moveTo(-15,1);x.quadraticCurveTo(-8,4,-5,4.5);x.lineTo(-7,24);x.lineTo(-11,24);x.closePath();x.fill();
  x.fillStyle='#efe3c8';x.beginPath();x.moveTo(-14.3,9);x.quadraticCurveTo(0,13,14.3,9);x.lineTo(13.5,13.5);x.quadraticCurveTo(0,17.5,-13.5,13.5);x.closePath();x.fill();});}
function kFries(c,x,y,s,st){kBlit(c,kFriesSpr(st),x,y-6*s,46*s,56*s);}
function kIcon(c,k,x,y,s){if(k==='burger')kBurger(c,x,y,s*0.5,{patty:1});else if(k==='cheese')kBurger(c,x,y,s*0.5,{patty:1,cheese:true});else if(k==='drink')kDrink(c,x,y,s*0.48,1);else kFries(c,x,y+3,s*0.52,'ok');}
function kRing(c,x,y,r,f,col){c.lineWidth=4;c.lineCap='round';c.strokeStyle='rgba(0,0,0,.18)';c.beginPath();c.arc(x,y,r,0,7);c.stroke();c.strokeStyle=col;c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,Math.min(1,f)));c.stroke();c.lineCap='butt';}
function kLock(c,x,y,txt){c.save();c.translate(x,y-8);c.strokeStyle='#8a8074';c.lineWidth=2.4;c.beginPath();c.arc(0,-5,5.5,Math.PI,0);c.stroke();c.fillStyle='#8a8074';rrect(c,-8,-5,16,12,3);c.fill();c.restore();mText(c,txt,x,y+16,12,'#8a8074',600);}
/* customer portrait: lit like the food (skin, hair strands, fabric), cached per look (LRU of 40) */
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const FACES=new Map();
function kFaceBase(look){const key=look.join();let cv=FACES.get(key);if(cv&&KS.faceRes===KS.res){FACES.delete(key);FACES.set(key,cv);return cv;}
  if(KS.faceRes!==KS.res){FACES.clear();KS.faceRes=KS.res;}
  const [sk0,hr0,sh0,hs]=look,SK=hexRgb(sk0),HR=hexRgb(hr0),SH=hexRgb(sh0);
  cv=kPix('face2:'+key,64,74,(x,y)=>{
    const ex=x/15.5,ey=(y+10)/17.5,eh=ex*ex+ey*ey;                                   // head
    const hx=x/(hs===1?19:16.8),hy=(y+(hs===1?9:11))/(hs===1?20.5:18.8),ho=hx*hx+hy*hy; // hair outer
    let hair=false;
    if(hs===0)hair=ho<1&&y<-10+6*(x/16)*(x/16);
    else if(hs===1){const fx=x/12.5,fy=(y+4)/13.5;hair=ho<1&&y<8&&!(fx*fx+fy*fy<1&&y>-14);}
    else if(hs===2){const bx=x/7,by=(y+29)/6.5;hair=(ho<1&&y<-10+6*(x/16)*(x/16))||bx*bx+by*by<1;}
    else hair=ho<1&&eh>0.62&&Math.abs(x)>8.5&&y>-13&&y<-1.5;
    if(hair){const str=vn(x*0.5,y*1.2+x*0.2,301),hh=(eh<1?12*Math.sqrt(1-eh):4)+2.2+str*0.5;
      const c=mix(HR.map(v=>v*0.82),HR.map(v=>Math.min(255,v*1.12+8)),str);return [c[0],c[1],c[2],1,hh,0.4,30];}
    if(eh<1){const hh=12*Math.sqrt(1-eh);let c=SK.slice();c=mix(c,[SK[0]*0.78,SK[1]*0.66,SK[2]*0.62],sstep(0.55,1,eh)*0.45);
      
      return [c[0],c[1],c[2],Math.min(1,(1-eh)/0.04),hh,0.22,18];}
    for(const s2 of [-1,1]){const ax=(x-s2*15.5)/3.2,ay=(y+8)/4.6,ae=ax*ax+ay*ay;if(ae<1){const c=mix(SK,[SK[0]*0.8,SK[1]*0.68,SK[2]*0.64],0.35);return [c[0],c[1],c[2],1,3*Math.sqrt(1-ae),0.1,12];}}
    if(Math.abs(x)<5.5&&y>2&&y<14){const c=mix(SK,[SK[0]*0.72,SK[1]*0.6,SK[2]*0.56],0.4+0.3*sstep(2,8,y));return [c[0],c[1],c[2],1,4*Math.sqrt(1-(x/5.5)*(x/5.5)),0.1,12];}
    const sw=27*Math.sqrt(Math.max(0,Math.min(1,(y-9)/12)));if(y>9&&y<38&&Math.abs(x)<sw){const u=x/28;let c=SH.slice();
      const collar=Math.abs(x)<8-(y-11)*0.9&&y>10&&y<19;if(collar)c=[240,232,214];
      const fab=0;c=mix(c,c.map(v=>v*0.7),sstep(26,38,y));
      return [c[0],c[1],c[2],Math.min(1,(sw-Math.abs(x))/0.9,(38-y)/0.8),7*Math.sqrt(Math.max(0,1-u*u))+(collar?1.2:0)+fab*0.35,collar?0.1:0.12,12];}
    return null;},0.8,true);
  FACES.set(key,cv);while(FACES.size>40){const k0=FACES.keys().next().value;FACES.delete(k0);KS.cache.delete('face2:'+k0);}return cv;}
function kFace(c,x,y,cu){const mood=cu.leave!=null?(cu.happy?1:-1):cu.left/cu.max<0.3?-1:0;kBlit(c,kFaceBase(cu.look),x,y+2,64,74);
  c.save();c.translate(x,y+2-2.5);
  for(const ex of [-5.6,5.6]){c.fillStyle='#ffffff';c.beginPath();c.ellipse(ex,-7,2.9,3.2,0,0,7);c.fill();c.strokeStyle='#3a2010';c.lineWidth=0.9;c.stroke();c.fillStyle='#2a1d16';c.beginPath();c.arc(ex+0.3,-6.6,1.8,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+0.9,-7.4,0.65,0,7);c.fill();}
  c.strokeStyle='rgba(50,30,20,.7)';c.lineWidth=1.3;c.lineCap='round';c.beginPath();if(mood<0){c.moveTo(-8.5,-12);c.lineTo(-3.5,-10.8);c.moveTo(8.5,-12);c.lineTo(3.5,-10.8);}else{c.moveTo(-8.5,-11.2);c.quadraticCurveTo(-6,-12.4,-3.5,-11.5);c.moveTo(8.5,-11.2);c.quadraticCurveTo(6,-12.4,3.5,-11.5);}c.stroke();
  c.strokeStyle='rgba(110,62,40,.45)';c.lineWidth=1.1;c.beginPath();c.moveTo(0,-5.5);c.quadraticCurveTo(-1.8,-1.5,0.4,-1);c.stroke();
  c.strokeStyle='#7a3f30';c.lineWidth=1.5;c.beginPath();if(mood>0)c.arc(0,1.5,4.2,0.3,Math.PI-0.3);else if(mood<0){c.moveTo(-3.8,5);c.quadraticCurveTo(0,2.8,3.8,5);}else{c.moveTo(-3.2,3.8);c.quadraticCurveTo(0,4.6,3.2,3.8);}c.stroke();c.lineCap='butt';c.restore();
  if(cu.leave!=null)mText(c,cu.happy?'♥':'…',x+24,y-24,15,cu.happy?'#b8583a':'#3a2e24');}
function kBg(c){const k2=kSprite('bg2',400,720,x=>{x.translate(-200,-360);
    x.fillStyle='#ffd983';x.fillRect(0,56,400,184);for(let i=0;i<20;i++){x.fillStyle=i%2?'#ffe3a0':'#ffd46f';x.fillRect(i*20,56,20,184);}
    x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<4;i++){rrect(x,40+i*90,96,56,34,8);x.fill();}
    for(let i=0;i<10;i++){x.fillStyle=i%2?'#ffffff':'#e8452e';x.beginPath();x.moveTo(i*40,48);x.lineTo(i*40+40,48);x.lineTo(i*40+40,66);x.arc(i*40+20,66,20,0,Math.PI);x.closePath();x.fill();x.strokeStyle='#8a2a14';x.lineWidth=1.5;x.stroke();}
    const ct=x.createLinearGradient(0,232,0,262);ct.addColorStop(0,'#e0904a');ct.addColorStop(0.35,'#b8672e');ct.addColorStop(1,'#7a3f18');x.fillStyle=ct;x.fillRect(0,232,400,30);x.fillStyle='rgba(255,255,255,.45)';x.fillRect(0,234,400,3);
    x.strokeStyle='#4a2410';x.lineWidth=2;x.beginPath();x.moveTo(0,232);x.lineTo(400,232);x.moveTo(0,262);x.lineTo(400,262);x.stroke();
    for(let yy=262;yy<732;yy+=34)for(let xx=0;xx<400;xx+=34){x.fillStyle=((xx+yy)/34|0)%2?'#fdf0d6':'#f3dcae';x.fillRect(xx,yy,34,34);}});
  kBlit(c,k2,200,360,400,720);}
function kPanel(c,r,top,bot){const g=c.createLinearGradient(0,r[1],0,r[1]+r[3]);g.addColorStop(0,top);g.addColorStop(1,bot);rrect(c,r[0],r[1],r[2],r[3],14);c.fillStyle=g;c.fill();c.strokeStyle='#3a2010';c.lineWidth=2.2;c.stroke();
  rrect(c,r[0]+4,r[1]+3,r[2]-8,7,4);c.fillStyle='rgba(255,255,255,.28)';c.fill();}
function kFrame(dt,c){c.fillStyle='#f3dcae';c.fillRect(0,0,MINI.cv.width,MINI.cv.height);if(!K.st)return;kUpdate(dt);const s=K.st;miniXf(c);kBg(c);
  rrect(c,8,6,384,40,20);c.fillStyle='#fff8ea';c.fill();c.strokeStyle='#8a5a2b';c.lineWidth=2.5;c.stroke();mText(c,TT('第 '+s.cfg.L+' 关','Level '+s.cfg.L,'Tahap '+s.cfg.L),56,26,16,'#8a3a10',800);
  const g3=s.cfg.goals[2],fw=150,fx0=116;rrect(c,fx0,19,fw,14,7);c.fillStyle='rgba(58,46,36,.1)';c.fill();rrect(c,fx0,19,Math.max(14,fw*Math.min(1,s.coins/g3)),14,7);const pgb=c.createLinearGradient(0,19,0,33);pgb.addColorStop(0,'#6fdc6f');pgb.addColorStop(1,'#2a9444');c.fillStyle=pgb;c.fill();
  s.cfg.goals.forEach(gv=>{const gx=fx0+fw*gv/g3;mText(c,s.coins>=gv?'★':'☆',Math.min(gx,fx0+fw-4),12,15,'#ffb81c');});mText(c,'$'+s.coins,300,26,17,'#1f7a38',800);
  const nC=s.cust.length;for(let i=0;i<nC;i++){const cu=s.cust[i];if(!cu)continue;const x=kCustX(i,nC);let y=KL.custY;if(cu.leave!=null)y+=(0.8-cu.leave)*50;
    c.globalAlpha=cu.leave!=null?Math.max(0,cu.leave/0.8):1;kFace(c,x,y,cu);
    const bw=Math.min(92,24+cu.order.length*30);rrect(c,x-bw/2,y-92,bw,42,14);c.fillStyle='#ffffff';c.fill();c.strokeStyle='#5a3418';c.lineWidth=2.2;c.stroke();
    c.beginPath();c.moveTo(x-7,y-51);c.lineTo(x,y-42);c.lineTo(x+7,y-51);c.fillStyle='#ffffff';c.fill();c.strokeStyle='#5a3418';c.lineWidth=2;c.beginPath();c.moveTo(x-7,y-50);c.lineTo(x,y-42);c.lineTo(x+7,y-50);c.stroke();
    cu.order.forEach((o,j)=>{const ix=x-bw/2+27+j*30;const a=c.globalAlpha;if(o.ok)c.globalAlpha=a*0.35;kIcon(c,o.k,ix,y-72,1);c.globalAlpha=a;if(o.ok)mText(c,'✓',ix+9,y-62,13,'#5f7f4f');});
    const f=cu.left/cu.max;rrect(c,x-28,y+38,56,6,3);c.fillStyle='rgba(58,46,36,.15)';c.fill();rrect(c,x-28,y+38,Math.max(4,56*f),6,3);c.fillStyle=f>0.6?'#35c24a':f>0.3?'#ffb81c':'#f04a3a';c.fill();c.globalAlpha=1;}
  s.plates.forEach((p,i)=>{const x=kPlateX(i,s.plates.length),y=KL.plateY;c.fillStyle='rgba(60,40,20,.14)';c.beginPath();c.ellipse(x+2,y+15,42,13,0,0,7);c.fill();
    const pg=c.createRadialGradient(x-10,y+6,4,x,y+10,42);pg.addColorStop(0,'#ffffff');pg.addColorStop(1,'#e2dccf');c.fillStyle=pg;c.beginPath();c.ellipse(x,y+11,40,13,0,0,7);c.fill();c.strokeStyle='rgba(52,30,18,.35)';c.lineWidth=1.2;c.stroke();
    c.strokeStyle='rgba(160,150,135,.5)';c.beginPath();c.ellipse(x,y+11,28,8,0,0,7);c.stroke();if(p)kBurger(c,x,y-4,1.05,p);});
  const G=KL.grill;kPanel(c,G,'#6b7078','#3a3e44');mText(c,TT('烤架','Grill','Gril'),G[0]+30,G[1]+14,11,'#d9c3a3',600);
  s.grill.forEach((g,i)=>{const x=kGrillX(i,s.grill.length),y=G[1]+66;
    if(g.s&&g.s!=='burnt'){const eg=c.createRadialGradient(x,y,4,x,y,30);eg.addColorStop(0,'rgba(255,150,60,.55)');eg.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=eg;c.beginPath();c.arc(x,y,30,0,7);c.fill();}
    c.fillStyle='#232528';c.beginPath();c.arc(x,y,26,0,7);c.fill();c.save();c.beginPath();c.arc(x,y,25,0,7);c.clip();c.strokeStyle='#6a6e74';c.lineWidth=2.2;for(let k=-3;k<=3;k++){c.beginPath();c.moveTo(x-26,y+k*7);c.lineTo(x+26,y+k*7);c.stroke();}c.restore();
    c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.3;c.beginPath();c.arc(x,y,26,0,7);c.stroke();
    if(g.s){if(g.s==='raw'){const k=Math.min(1,g.t/kT.cook());kPatty(c,x,y,'ok');
          c.save();c.globalAlpha=1-k;kPatty(c,x,y,'raw');c.restore();kRing(c,x,y,29,k,'#c9973a');
          for(let q=0;q<3;q++){const ph=(s.t*3+q*0.37+i)%1;c.fillStyle='rgba(255,236,200,'+(0.7*(1-ph))+')';c.beginPath();c.arc(x-12+q*12+kN(q+i,3)*4,y-8-ph*16,1.4,0,7);c.fill();}}
      else if(g.s==='ok'){kPatty(c,x,y,'ok');kRing(c,x,y,29,1-(g.t-kT.cook())/(kT.burn()-kT.cook()),'#6f9a5a');}
      else{kPatty(c,x,y,'burnt');c.fillStyle='rgba(120,110,100,.45)';for(let q=0;q<3;q++){c.beginPath();c.arc(x-8+q*8,y-24-q*5-Math.sin(s.t*4+q)*3,5+q,0,7);c.fill();}}}
    else mText(c,'+',x,y,20,'rgba(255,255,255,.35)');});
  const B=KL.bun;kPanel(c,B,'#fff4d6','#ffd88a');kBurger(c,B[0]+36,B[1]+36,0.62,null);kBurger(c,B[0]+78,B[1]+36,0.62,null);mText(c,TT('面包','Buns','Roti'),B[0]+57,B[1]+11,11,'#7a5a3a',600);
  const Q=KL.cheese;if(s.cfg.has.cheese){kPanel(c,Q,'#fff3b8','#ffd24a');c.save();c.translate(Q[0]+60,Q[1]+36);for(let k=0;k<3;k++){c.save();c.translate(-12+k*5,-k*3);c.rotate(-0.12+k*0.08);c.fillStyle='#ffc93c';c.fillRect(-15,-7,30,15);c.strokeStyle='#8a5a08';c.lineWidth=1.8;c.strokeRect(-15,-7,30,15);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-13,-5,12,2.5);c.restore();}c.restore();mText(c,TT('芝士','Cheese','Keju'),Q[0]+57,Q[1]+11,11,'#7a5a3a',600);}
  else{kPanel(c,Q,'#e9e2d7','#ddd4c6');kLock(c,Q[0]+57,Q[1]+24,TT('第 6 关','Level 6','Tahap 6'));}
  const D=KL.drink;if(s.cfg.has.drink){kPanel(c,D,'#e6f4ff','#9cc9ea');mText(c,TT('饮料','Drinks','Minuman'),D[0]+92,D[1]+12,11,'#4a5a5a',600);
    s.cups.forEach((cu,i)=>{const x=D[0]+46+i*92,y=D[1]+68;c.fillStyle='#8a9290';c.fillRect(x-7,D[1]+22,14,8);if(cu.s==='pour'){c.fillStyle='rgba(140,75,35,.8)';c.fillRect(x-1.5,D[1]+30,3,y-D[1]-40);}
      if(cu.s==='empty'){c.strokeStyle='rgba(74,90,90,.35)';c.setLineDash([4,3]);c.strokeRect(x-12,y-18,24,40);c.setLineDash([]);mText(c,'+',x,y+2,18,'rgba(74,90,90,.5)');}else kDrink(c,x,y,1,cu.s==='ready'?1:cu.t/kT.pour());});}
  else{kPanel(c,D,'#e9e2d7','#ddd4c6');kLock(c,D[0]+92,D[1]+56,TT('第 3 关','Level 3','Tahap 3'));}
  const F=KL.fryer;if(s.cfg.has.fries){kPanel(c,F,'#e3e3e3','#a8adb3');mText(c,TT('薯条','Fries','Kentang goreng'),F[0]+89,F[1]+12,11,'#4a4238',600);
    s.fry.forEach((f,i)=>{const x=F[0]+45+i*88,y=F[1]+68;c.fillStyle='rgba(190,140,50,.55)';c.beginPath();c.ellipse(x,y+18,30,9,0,0,7);c.fill();c.strokeStyle='rgba(60,45,25,.5)';c.lineWidth=1.2;c.stroke();
      if(f.s==='empty'){mText(c,'+',x,y,18,'rgba(74,66,56,.5)');return;}kFries(c,x,y,1,f.s);
      if(f.s==='fry'){kRing(c,x,y,32,f.t/kT.fry,'#c9973a');for(let q=0;q<4;q++){const ph=(s.t*2.5+q*0.25)%1;c.strokeStyle='rgba(255,245,220,'+(0.6*(1-ph))+')';c.lineWidth=1;c.beginPath();c.arc(x-15+q*10,y+16,2+ph*3,0,7);c.stroke();}}
      else if(f.s==='ok')kRing(c,x,y,32,1-(f.t-kT.fry)/(kT.fburn-kT.fry),'#6f9a5a');});}
  else{kPanel(c,F,'#e9e2d7','#ddd4c6');kLock(c,F[0]+89,F[1]+56,TT('第 9 关','Level 9','Tahap 9'));}
  for(const f of s.fx){const k=f.t,x=f.x+(f.tx-f.x)*k,y=f.y+(f.ty-f.y)*k-Math.sin(k*Math.PI)*30;c.globalAlpha=1-k*0.3;
    if(KDISH[f.e])kIcon(c,f.e,x,y,1.2);else if(f.e==='patty')kPatty(c,x,y,'ok');else if(f.col)mText(c,f.e,x,y,17,f.col);else mText(c,f.e,x,y,20,'#3a2e24');c.globalAlpha=1;}
  if(s.msgT>0){c.globalAlpha=Math.min(1,s.msgT*2);rrect(c,40,648,320,36,18);c.fillStyle='#3a2210';c.fill();mText(c,s.msg,200,666,13,'#ffffff',700);c.globalAlpha=1;}
  else mText(c,TT('还剩 ','Customers left: ','Baki pelanggan: ')+(s.cfg.n-s.next+s.cust.filter(Boolean).length),200,666,13,'rgba(58,46,36,.55)',600);}
