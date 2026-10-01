/* ---------- balance: every pacing number lives here so it can be tuned in one place ----------
   padGrowth   each upgrade square costs this much more than the one before it (compounding)
   branchCost  +50% building costs per branch opened (income also rises +25% per branch + perks)
   st*         station levels: 10 per shelf/field/machine; cost = unlock cost x stBase x stGrowth^level */
const BAL={padGrowth:1.055,branchCost:0.5,stMax:10,stBase:0.55,stGrowth:1.38,stPrice:0.1,stSpeed:0.9,
  offBaseMin:240,offPerTenStars:60,offMaxMin:720,offRate:0.3};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
let LANG='zh';try{const nl=(navigator.language||'').toLowerCase();LANG=localStorage.getItem('fm-lang')||(nl.startsWith('zh')?'zh':nl.startsWith('ms')||nl.startsWith('id')?'ms':'en');}catch(_){}
const TRL=LANG==='zh'?[]:(window.FM_I18N||[]).map(r=>[r[0],LANG==='en'?r[1]:r[2]]).sort((a,b)=>b[0].length-a[0].length);
const HAS_ZH=/[\u4e00-\u9fff「」（）：，！？、]/;
const LCACHE=new Map();
function L(s){if(LANG==='zh'||s==null)return s;s=String(s);if(!HAS_ZH.test(s))return s;const hit=LCACHE.get(s);if(hit!==undefined)return hit;const k=s;
  for(const [a,b] of TRL)if(s.includes(a))s=s.split(a).join(b);if(LCACHE.size>4000)LCACHE.clear();LCACHE.set(k,s);return s;}
const TT=(zh,en,ms)=>LANG==='en'?en:LANG==='ms'?ms:zh;
function trDom(root){if(LANG==='zh'||!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(HAS_ZH.test(n.nodeValue))n.nodeValue=L(n.nodeValue);
  if(root.querySelectorAll)root.querySelectorAll('[placeholder],[aria-label]').forEach(e=>{if(e.placeholder&&HAS_ZH.test(e.placeholder))e.placeholder=L(e.placeholder);const al=e.getAttribute('aria-label');if(al&&HAS_ZH.test(al))e.setAttribute('aria-label',L(al));});}
document.documentElement.lang=LANG==='zh'?'zh-CN':LANG;
const CFG=window.FM_CONFIG||{};
let sb=null;
const sbReady=(CFG.supabaseUrl&&CFG.supabaseAnonKey)?new Promise(res=>{
  const make=()=>{try{sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});}catch(_){sb=null;}res(sb);};
  if(window.supabase&&window.supabase.createClient)return make();
  const el=document.createElement('script');el.src='vendor/supabase.js';el.async=true;el.onload=make;el.onerror=()=>res(null);document.head.appendChild(el);}):Promise.resolve(null);
const NET={mode:'solo',room:null,code:'',nick:'',col:0,myPeer:null,lastHost:null,hostSeenAt:0,sendT:0,remote:new Map(),avatars:new Map(),emo:null,ver:0,bootT:0};
const ACH_STATE={};

const VIPS=[{n:'陈奶奶',hi:0},{n:'阿明',hi:1},{n:'小丽',hi:2},{n:'王叔',hi:3},{n:'Aisyah',hi:4},{n:'Raj',hi:5}];

const vipState={};let vipT=60;

const DECOR={
  floor:[{n:'奶油',c:0xf7c99c,cost:0},{n:'薄荷',c:0xc9f0dc,cost:500},{n:'樱花',c:0xf9d3dd,cost:500},{n:'天空',c:0xcfe6fa,cost:500},{n:'原木',c:0xe3b98a,cost:800},{n:'星空',c:0xcfc8f2,cost:1200}],
  shelf:[{n:'原木',c:[0xc98b52,0xe0a86f,0xb37542],cost:0},{n:'薄荷',c:[0x6fd3a8,0xa8ecd0,0x3fae7a],cost:800},{n:'樱花',c:[0xf29bb5,0xf9c9d8,0xd96a8f],cost:800},{n:'海蓝',c:[0x6fa8e8,0xa9cdf5,0x3f7bc2],cost:800},{n:'柠檬',c:[0xf2d15b,0xf8e79a,0xd4aa2a],cost:1000}],
  hat:[{n:'不戴',k:'none',cost:0},{n:'草帽',k:'straw',cost:300},{n:'厨师帽',k:'chef',cost:500},{n:'棒球帽',k:'cap',cost:500},{n:'兔耳朵',k:'bunny',cost:1000},{n:'皇冠',k:'crown',cost:3000}]};
const legacy={n:0,stars:0,perks:{}};
const stLv={},town={},weekly={wk:-1,base:null,goals:[]},streak={last:'',n:0};
const PK=k=>(legacy.perks&&legacy.perks[k])||0;          // permanent perk level
const TW=()=>(legacy.n||0)%4;                              // 0 farm, 1 beach, 2 snow, 3 sakura
const hasT=id=>!!town[id];                                 // town project built?
const totalStars=()=>{let n=0;for(const k in stLv)n+=stLv[k];return n;};
const rewardMul=()=>(1+0.25*(legacy.n||0))*(1+totalStars()/40);
const decor={owned:{'floor:0':1,'shelf:0':1,'hat:0':1},floor:0,shelf:0,hat:0};

const JOIN={get(){try{return sessionStorage.getItem('fm-join');}catch(_){return null;}},set(v){try{sessionStorage.setItem('fm-join',v);}catch(_){}},del(){try{sessionStorage.removeItem('fm-join');}catch(_){}}};
try{localStorage.removeItem('fm-join');}catch(_){}
{const j=JOIN.get();if(j){NET.mode='guest';NET.code=j;NET.col=1+((Math.random()*4)|0);}}
const EMOJI='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

