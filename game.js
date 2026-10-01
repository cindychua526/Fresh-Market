(()=>{
const LIMB={sets:new Map(),chars:new Set(),m4:new THREE.Matrix4(),offs:new Map(),MAX:360};   // batched arms & legs (see limbsTick)

const KEY='tiny-fresh-market-v2',KEY1='tiny-fresh-market-v1';
const WING_GOODS=['soda','cookies','noodles','chocolate','tissue','shampoo','icecream','canned'];
const F2_GOODS=['tshirt','book','ball','umbrella','teddy','headphones'];
const SELL=['tomato','egg','milk','carrot','jam','bread','cheese','juice',...WING_GOODS,...F2_GOODS];
const F2X=55;const floorOf=x=>x>F2X?2:1;const floorY=x=>x>F2X?6:0;
const ITEM={tomato:{e:'🍅',price:4},egg:{e:'🥚',price:7},milk:{e:'🥛',price:11},wheat:{e:'🌾'},apple:{e:'🍏'},strawberry:{e:'🍓'},
  carrot:{e:'🥕',price:6},jam:{e:'🍯',price:18},bread:{e:'🍞',price:16},cheese:{e:'🧀',price:22},juice:{e:'🧃',price:19},
  soda:{e:'🥤',price:9},cookies:{e:'🍪',price:10},noodles:{e:'🍜',price:12},chocolate:{e:'🍫',price:14},
  tissue:{e:'🧻',price:13},shampoo:{e:'🧴',price:20},icecream:{e:'🍦',price:18},canned:{e:'🥫',price:15},
  tshirt:{e:'👕',price:28},book:{e:'📚',price:22},ball:{e:'⚽',price:24},umbrella:{e:'🌂',price:26},teddy:{e:'🧸',price:35},headphones:{e:'🎧',price:45},
  burger:{e:'🍔',price:30},soup:{e:'🍲',price:34},drink:{e:'🍹',price:26},
  hongbao:{e:'🧧',price:40},candybox:{e:'🍬',price:32},mooncake:{e:'🥮',price:38},oillamp:{e:'🪔',price:30},gift:{e:'🎁',price:45},
  corn:{e:'🌽',price:24},shrimp:{e:'🦐',price:34},cocoa:{e:'☕',price:30},dango:{e:'🍡',price:32}};
const FESTS=[{k:'cny',n:'春节',e:'🧧',item:'hongbao',c1:0xe53935,c2:0xffc107},{k:'raya',n:'开斋节',e:'🌙',item:'candybox',c1:0x2ec27e,c2:0xffd54f},{k:'moon',n:'中秋节',e:'🥮',item:'mooncake',c1:0xff8f00,c2:0xfff176},{k:'diwali',n:'屠妖节',e:'🪔',item:'oillamp',c1:0xff6d00,c2:0xab47bc},{k:'xmas',n:'圣诞节',e:'🎄',item:'gift',c1:0x2e7d32,c2:0xe53935}];
const FEST_ITEMS=FESTS.map(f=>f.item);
/* each town (branch theme) has its own specialty, sold at an outdoor stall west of the shop */
const SIG_ITEMS=['corn','shrimp','cocoa','dango'];
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

/* ---------- renderer / scene ---------- */
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const scene=new THREE.Scene();scene.autoUpdate=false;   /* the frame loop updates matrices once, batches limbs, then renders */
scene.background=new THREE.Color(0x8fd96b);
scene.fog=new THREE.Fog(0x8fd96b,45,95);
const camera=new THREE.PerspectiveCamera(34,1,0.5,170);
const hemi=new THREE.HemisphereLight(0xffffff,0xa9c79a,0.85);scene.add(hemi);
const lampMat=new THREE.MeshLambertMaterial({color:0xfff3c4,emissive:0xffd27a,emissiveIntensity:0});
const winMat=new THREE.MeshLambertMaterial({color:0x9fd3ff,emissive:0xffd88a,emissiveIntensity:0});
const sun=new THREE.DirectionalLight(0xffffff,0.55);
sun.position.set(-3,24,11);sun.target.position.set(7,0,-1);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:80});
sun.shadow.bias=-0.0008;scene.add(sun);sun.userData.dyn=sun.target.userData.dyn=1;

const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
function add(geo,c,x,y,z,parent,cast=true){const m=new THREE.Mesh(geo,typeof c==='number'?M(c):c);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;(parent||scene).add(m);return m;}
const box=(w,h,d,c,x,y,z,p,cast)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p,cast);
const sph=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,r<0.12?7:r<0.3?10:14,r<0.12?5:r<0.3?7:10),c,x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,s=12)=>add(new THREE.CylinderGeometry(rt,rb,h,Math.max(rt,rb)<0.1?Math.min(s,6):s),c,x,y,z,p);
const solids=[];
const solid=(x0,z0,x1,z1,active=true)=>{const s={x0,z0,x1,z1,active};solids.push(s);return s;};

/* ---------- item meshes ---------- */
const GEO={tomato:new THREE.SphereGeometry(0.2,12,10),tomTop:new THREE.ConeGeometry(0.09,0.09,5),
  egg:new THREE.SphereGeometry(0.16,12,10),milk:new THREE.BoxGeometry(0.28,0.36,0.28),milkCap:new THREE.BoxGeometry(0.3,0.07,0.3),
  bill:new THREE.BoxGeometry(0.5,0.09,0.3),band:new THREE.BoxGeometry(0.12,0.095,0.31),
  stalk:new THREE.CylinderGeometry(0.03,0.03,0.46,5),ear:new THREE.SphereGeometry(0.065,6,5),tie:new THREE.CylinderGeometry(0.1,0.1,0.06,8),
  apple:new THREE.SphereGeometry(0.18,12,10),stem:new THREE.CylinderGeometry(0.018,0.018,0.1,4),leaf:new THREE.SphereGeometry(0.06,6,4),
  loaf:new THREE.BoxGeometry(0.44,0.2,0.28),crust:new THREE.BoxGeometry(0.4,0.08,0.24),
  cheese:new THREE.CylinderGeometry(0.26,0.26,0.2,3),hole:new THREE.SphereGeometry(0.045,6,5),
  bottle:new THREE.CylinderGeometry(0.1,0.12,0.34,10),bcap:new THREE.CylinderGeometry(0.06,0.06,0.07,8),label:new THREE.CylinderGeometry(0.113,0.118,0.12,10),
  carrot:new THREE.ConeGeometry(0.1,0.4,8),cleaf:new THREE.ConeGeometry(0.05,0.18,5),berry:new THREE.SphereGeometry(0.14,10,8),bhat:new THREE.ConeGeometry(0.1,0.06,6),
  jar:new THREE.CylinderGeometry(0.14,0.14,0.28,12),lid:new THREE.CylinderGeometry(0.15,0.15,0.06,12),jarL:new THREE.CylinderGeometry(0.143,0.143,0.1,12),
  can:new THREE.CylinderGeometry(0.11,0.11,0.32,12),canTop:new THREE.CylinderGeometry(0.1,0.1,0.02,12),
  pack:new THREE.BoxGeometry(0.4,0.14,0.3),packS:new THREE.BoxGeometry(0.41,0.05,0.31),
  cup:new THREE.CylinderGeometry(0.16,0.12,0.26,12),cupB:new THREE.CylinderGeometry(0.155,0.14,0.08,12),cupL:new THREE.CylinderGeometry(0.17,0.17,0.03,12),
  bar:new THREE.BoxGeometry(0.42,0.07,0.22),foil:new THREE.BoxGeometry(0.1,0.075,0.225),
  tbox:new THREE.BoxGeometry(0.4,0.2,0.26),tuft:new THREE.SphereGeometry(0.08,8,6),
  sbot:new THREE.BoxGeometry(0.2,0.34,0.12),scap:new THREE.CylinderGeometry(0.05,0.05,0.08,8),
  icone:new THREE.ConeGeometry(0.11,0.3,8),scoop:new THREE.SphereGeometry(0.13,10,8),
  tin:new THREE.CylinderGeometry(0.13,0.13,0.24,12),tinL:new THREE.CylinderGeometry(0.133,0.133,0.14,12),
  basket:new THREE.BoxGeometry(0.5,0.2,0.36),
  shirt:new THREE.BoxGeometry(0.34,0.07,0.36),sleeve:new THREE.BoxGeometry(0.14,0.069,0.14),
  bookB:new THREE.BoxGeometry(0.34,0.1,0.26),pages:new THREE.BoxGeometry(0.3,0.08,0.27),
  ball:new THREE.SphereGeometry(0.17,12,10),dot:new THREE.SphereGeometry(0.05,6,5),
  umb:new THREE.ConeGeometry(0.09,0.42,8),umbH:new THREE.CylinderGeometry(0.015,0.015,0.14,5),
  tbody:new THREE.SphereGeometry(0.15,10,8),thead:new THREE.SphereGeometry(0.11,10,8),tear:new THREE.SphereGeometry(0.045,6,5),
  band2:new THREE.TorusGeometry(0.13,0.025,6,14,Math.PI),cupH:new THREE.CylinderGeometry(0.07,0.07,0.06,10),
  bunTop:new THREE.SphereGeometry(0.2,12,8,0,Math.PI*2,0,Math.PI/2),bunBot:new THREE.CylinderGeometry(0.2,0.2,0.07,12),patty:new THREE.CylinderGeometry(0.21,0.21,0.06,12),lettuce:new THREE.CylinderGeometry(0.225,0.225,0.02,12),
  bowl:new THREE.CylinderGeometry(0.2,0.13,0.16,12),soupTop:new THREE.CylinderGeometry(0.185,0.185,0.02,12),glass:new THREE.CylinderGeometry(0.11,0.09,0.3,10),straw:new THREE.CylinderGeometry(0.012,0.012,0.24,4),
  cartBox:new THREE.BoxGeometry(0.64,0.4,0.56),cartHandle:new THREE.CylinderGeometry(0.025,0.025,0.66,6),wheel:new THREE.SphereGeometry(0.06,6,5),cartLeg:new THREE.BoxGeometry(0.03,0.42,0.03),
  env:new THREE.BoxGeometry(0.34,0.06,0.24),mcake:new THREE.CylinderGeometry(0.17,0.17,0.12,14),giftB:new THREE.BoxGeometry(0.32,0.28,0.32),rib:new THREE.BoxGeometry(0.34,0.29,0.07),
  lampB:new THREE.CylinderGeometry(0.14,0.08,0.1,10),flame:new THREE.ConeGeometry(0.05,0.14,6)};
function gm(g,geo,c,x,y,z){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);g.add(m);return m;}
const VCMAT=new THREE.MeshLambertMaterial({vertexColors:true});
const mergeCache=new Map();
function mergeMeshes(meshes,root){
  root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  const pos=[],nor=[],col=[],m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),c=new THREE.Color(),v=new THREE.Vector3();
  for(const me of meshes){let g=me.geometry;if(g.index)g=g.toNonIndexed();m4.multiplyMatrices(inv,me.matrixWorld);nm.getNormalMatrix(m4);
    const p=g.attributes.position,n=g.attributes.normal;c.copy(me.material.color);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);}}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));bg.computeBoundingSphere();return bg;
}
function mergedGroup(key,build){let geo=mergeCache.get(key);if(!geo){const raw=build();const ms=[];raw.traverse(o=>{if(o.isMesh)ms.push(o);});geo=mergeMeshes(ms,raw);mergeCache.set(key,geo);}
  const g=new THREE.Group();const m=new THREE.Mesh(geo,VCMAT);m.castShadow=true;m.receiveShadow=true;g.add(m);g.userData.nb=1;g.userData.mk=key;return g;}
let iceK=0;
/* Items fly around constantly (every coin, every stocked product). Re-using the little
   Group+Mesh pairs instead of allocating new ones keeps the garbage collector quiet. */
const itemPool=new Map();
function makeItem(type){const key=type==='icecream'?'i:icecream'+((Math.random()*4)|0):'i:'+type;
  const pool=itemPool.get(key);if(pool&&pool.length){const g=pool.pop();g.children[0].castShadow=true;g.children[0].userData.cs0=undefined;g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);g.visible=true;return g;}
  if(type==='icecream')iceK=+key.slice(-1);return mergedGroup(key,()=>makeItemRaw(type));}
function freeItem(g){if(!g)return;if(g.parent)g.parent.remove(g);for(let i=pops.length-1;i>=0;i--)if(pops[i].o===g)pops.splice(i,1);
  const k=g.userData.mk;if(!k||k[0]!=='i'||g.userData.frozen)return;let p=itemPool.get(k);if(!p)itemPool.set(k,p=[]);if(p.length<64)p.push(g);}
function makeItemRaw(type){
  const g=new THREE.Group();
  if(type==='tomato'){gm(g,GEO.tomato,0xe8413b,0,0.19,0).scale.set(1,0.88,1);gm(g,GEO.tomTop,0x3fae3a,0,0.38,0);}
  else if(type==='egg'){gm(g,GEO.egg,0xfff4e0,0,0.21,0).scale.set(1,1.3,1);}
  else if(type==='milk'){gm(g,GEO.milk,0xffffff,0,0.18,0);gm(g,GEO.milkCap,0x4a90e2,0,0.36,0);}
  else if(type==='wheat'){[[-0.07,0],[0.07,0],[0,0.07]].forEach(([x,z],i)=>{const s=gm(g,GEO.stalk,0xe2bb45,x,0.23,z);s.rotation.z=x*1.5;s.rotation.x=z*1.5;gm(g,GEO.ear,0xf2cf5b,x*2,0.48,z*2).scale.set(1,1.8,1);});gm(g,GEO.tie,0xb5773a,0,0.18,0);}
  else if(type==='apple'){gm(g,GEO.apple,0x9bd13b,0,0.18,0).scale.set(1,0.92,1);gm(g,GEO.stem,0x7a4a2a,0,0.37,0);gm(g,GEO.leaf,0x3fae3a,0.06,0.38,0).scale.set(1.4,0.4,0.8);}
  else if(type==='bread'){gm(g,GEO.loaf,0xe0a45a,0,0.1,0);gm(g,GEO.crust,0xb8702f,0,0.23,0);}
  else if(type==='cheese'){const c=gm(g,GEO.cheese,0xffd23f,0,0.1,0);c.rotation.y=Math.PI/6;gm(g,GEO.hole,0xe0a800,0.08,0.2,0.02);gm(g,GEO.hole,0xe0a800,-0.06,0.2,-0.07);}
  else if(type==='juice'){gm(g,GEO.bottle,0xff9f1c,0,0.17,0);gm(g,GEO.label,0xffffff,0,0.16,0);gm(g,GEO.bcap,0x3fae3a,0,0.37,0);}
  else if(type==='carrot'){const c=gm(g,GEO.carrot,0xff8a1c,0,0.2,0);c.rotation.x=Math.PI;gm(g,GEO.cleaf,0x3fae3a,0,0.48,0);const l=gm(g,GEO.cleaf,0x3fae3a,0.05,0.46,0);l.rotation.z=-0.5;const r=gm(g,GEO.cleaf,0x3fae3a,-0.05,0.46,0);r.rotation.z=0.5;}
  else if(type==='strawberry'){gm(g,GEO.berry,0xe8304a,0,0.16,0).scale.set(1,1.15,1);gm(g,GEO.bhat,0x3fae3a,0,0.33,0);}
  else if(type==='jam'){gm(g,GEO.jar,0xc2185b,0,0.14,0);gm(g,GEO.jarL,0xfff3c4,0,0.13,0);gm(g,GEO.lid,0xffffff,0,0.31,0);}
  else if(type==='soda'){gm(g,GEO.can,0x2f80ed,0,0.16,0);gm(g,GEO.canTop,0xd0d6dc,0,0.33,0);}
  else if(type==='cookies'){gm(g,GEO.pack,0xf2994a,0,0.07,0);gm(g,GEO.packS,0x8b4513,0,0.12,0);}
  else if(type==='noodles'){gm(g,GEO.cup,0xffffff,0,0.13,0);gm(g,GEO.cupB,0xe53935,0,0.13,0);gm(g,GEO.cupL,0xf2c94c,0,0.275,0);}
  else if(type==='chocolate'){gm(g,GEO.bar,0x6d3b1f,0,0.035,0);gm(g,GEO.foil,0xf2c94c,0.17,0.036,0);}
  else if(type==='tissue'){gm(g,GEO.tbox,0x9ad0f5,0,0.1,0);gm(g,GEO.tuft,0xffffff,0,0.22,0).scale.set(1.5,0.6,1);}
  else if(type==='shampoo'){gm(g,GEO.sbot,0x9b59b6,0,0.17,0);gm(g,GEO.scap,0xffffff,0,0.38,0);}
  else if(type==='icecream'){const c=gm(g,GEO.icone,0xe8b36a,0,0.15,0);c.rotation.x=Math.PI;gm(g,GEO.scoop,[0xffb6c8,0xfff1c9,0x8fd3a8,0x9b6a4a][iceK],0,0.33,0).scale.setScalar(1.15);}
  else if(type==='canned'){gm(g,GEO.tin,0xc0c6cc,0,0.12,0);gm(g,GEO.tinL,0xeb5757,0,0.12,0);}
  else if(type==='tshirt'){gm(g,GEO.shirt,0x56ccf2,0,0.035,0);gm(g,GEO.sleeve,0x56ccf2,-0.22,0.035,-0.1);gm(g,GEO.sleeve,0x56ccf2,0.22,0.035,-0.1);gm(g,GEO.dot,0xffffff,0,0.07,-0.02).scale.set(1.4,0.3,1.4);}
  else if(type==='book'){gm(g,GEO.bookB,0xd64545,0,0.05,0);gm(g,GEO.pages,0xfffbe9,0.03,0.05,0);}
  else if(type==='ball'){gm(g,GEO.ball,0xffffff,0,0.17,0);[[0,0.34,0],[0.15,0.2,0.07],[-0.13,0.22,0.08],[0.02,0.2,-0.16]].forEach(([x,y,z])=>gm(g,GEO.dot,0x222222,x,y,z));}
  else if(type==='umbrella'){const u=gm(g,GEO.umb,0x9b51e0,0,0.3,0);gm(g,GEO.umbH,0x6b3a2a,0,0.04,0);}
  else if(type==='teddy'){gm(g,GEO.tbody,0xb07a4a,0,0.15,0);gm(g,GEO.thead,0xb07a4a,0,0.36,0);gm(g,GEO.tear,0xb07a4a,-0.08,0.45,0);gm(g,GEO.tear,0xb07a4a,0.08,0.45,0);gm(g,GEO.tear,0xf2d2b0,0,0.34,0.09);}
  else if(type==='headphones'){const b=gm(g,GEO.band2,0x333333,0,0.12,0);gm(g,GEO.cupH,0xeb5757,-0.13,0.1,0).rotation.z=Math.PI/2;gm(g,GEO.cupH,0xeb5757,0.13,0.1,0).rotation.z=Math.PI/2;}
  else if(type==='burger'){gm(g,GEO.bunBot,0xe0a45a,0,0.035,0);gm(g,GEO.patty,0x6d3b1f,0,0.1,0);gm(g,GEO.lettuce,0x5ccf4f,0,0.14,0);gm(g,GEO.bunTop,0xe8a85a,0,0.15,0).scale.y=0.8;}
  else if(type==='soup'){gm(g,GEO.bowl,0xffffff,0,0.08,0);gm(g,GEO.soupTop,0xf2994a,0,0.155,0);}
  else if(type==='drink'){gm(g,GEO.glass,0xff8fb1,0,0.15,0);const st=gm(g,GEO.straw,0xffffff,0.05,0.36,0);st.rotation.z=0.3;}
  else if(type==='hongbao'){gm(g,GEO.env,0xe53935,0,0.03,0);gm(g,GEO.tuft,0xffc107,0,0.07,0).scale.set(0.8,0.3,0.8);}
  else if(type==='candybox'){gm(g,GEO.giftB,0xf48fb1,0,0.14,0).scale.set(1,0.6,1);gm(g,GEO.rib,0x2ec27e,0,0.14,0).scale.set(1,0.62,1);}
  else if(type==='mooncake'){gm(g,GEO.mcake,0xc98b3a,0,0.06,0);gm(g,GEO.lettuce,0xe0a45a,0,0.125,0).scale.set(0.7,1,0.7);}
  else if(type==='oillamp'){gm(g,GEO.lampB,0xc0643c,0,0.05,0);gm(g,GEO.flame,0xffb300,0,0.16,0);}
  else if(type==='gift'){gm(g,GEO.giftB,0x2e7d32,0,0.14,0);gm(g,GEO.rib,0xe53935,0,0.14,0);gm(g,GEO.rib,0xe53935,0,0.14,0).rotation.y=Math.PI/2;}
  else if(type==='corn'){gm(g,GEO.bottle,0xf2c94c,0,0.17,0);const a=gm(g,GEO.cleaf,0x5ccf4f,0.07,0.2,0);a.rotation.z=-0.35;a.scale.set(1.2,2.2,1.2);const b=gm(g,GEO.cleaf,0x5ccf4f,-0.07,0.2,0);b.rotation.z=0.35;b.scale.set(1.2,2.2,1.2);}
  else if(type==='shrimp'){gm(g,GEO.band2,0xff8a65,0,0.05,0).scale.set(1.2,1.4,2.4);const t=gm(g,GEO.cleaf,0xff7043,0.17,0.08,0);t.rotation.z=-2.2;}
  else if(type==='cocoa'){gm(g,GEO.cup,0xffffff,0,0.13,0);gm(g,GEO.cupL,0x8d5a3b,0,0.265,0);const h=gm(g,GEO.cupH,0xffffff,0.17,0.14,0);h.rotation.z=Math.PI/2;}
  else if(type==='dango'){gm(g,GEO.stalk,0xd9b37a,0,0.23,0);[[0xf8a5c2,0.14],[0xfff5ec,0.28],[0x9ed98f,0.42]].forEach(([c,y])=>gm(g,GEO.tuft,c,0,y,0));}
  else {gm(g,GEO.bill,0x6fcf4f,0,0.045,0);gm(g,GEO.band,0xdaf7c9,0,0.045,0);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;
}

/* ---------- canvas sprites ---------- */
const spritePool=new Map();
function canvasSprite(w,h,sx,sy,pooled){const pk=w+'x'+h;
  if(pooled){const p=spritePool.get(pk);if(p&&p.length){const o=p.pop();o.s.scale.set(sx,sy,1);o.s.position.set(0,0,0);o.s.visible=true;o.ctx.clearRect(0,0,w,h);o.tex.needsUpdate=true;return o;}}
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;
  const mat=new THREE.SpriteMaterial({map:tex,depthTest:false,depthWrite:false,transparent:true});const s=new THREE.Sprite(mat);s.scale.set(sx,sy,1);s.renderOrder=20;return {s,ctx,tex,mat,pk};}
function releaseSprite(o){if(!o)return;if(o.s.parent)o.s.parent.remove(o.s);let p=spritePool.get(o.pk);if(!p)spritePool.set(o.pk,p=[]);if(p.length<48)p.push(o);else disposeSprite(o);}
function disposeSprite(o){if(!o)return;if(o.s.parent)o.s.parent.remove(o.s);o.tex.dispose();o.mat.dispose();}
function outlined(x,t,px,py){x.lineJoin='round';x.lineWidth=7;x.strokeStyle='#173a2b';x.strokeText(t,px,py);x.fillStyle='#fff';x.fillText(t,px,py);}
function drawBubble(b,emoji,text,warn,ring,left){
  const x=b.ctx;x.clearRect(0,0,128,144);
  x.fillStyle='rgba(0,0,0,.16)';x.beginPath();x.arc(66,62,52,0,7);x.fill();
  const rc=ring||(warn?'#ff5a4d':null);
  if(ring&&left!=null){x.fillStyle='#fff';x.beginPath();x.arc(64,58,52,0,7);x.fill();x.lineWidth=9;x.strokeStyle='rgba(23,58,43,.14)';x.beginPath();x.arc(64,58,47,0,7);x.stroke();
    x.strokeStyle=rc;x.lineCap='round';x.beginPath();x.arc(64,58,47,-Math.PI/2,-Math.PI/2+Math.PI*2*left);x.stroke();x.lineCap='butt';x.fillStyle=rc;}
  else{x.fillStyle=rc||'#fff';x.beginPath();x.arc(64,58,52,0,7);x.fill();if(rc){x.fillStyle='#fff';x.beginPath();x.arc(64,58,44,0,7);x.fill();x.fillStyle=rc;}}
  x.beginPath();x.moveTo(50,100);x.lineTo(78,100);x.lineTo(64,126);x.closePath();x.fill();
  x.textAlign='center';x.textBaseline='middle';
  if(text){x.font='46px '+EMOJI;x.fillText(emoji,64,40);x.font='900 32px system-ui,sans-serif';outlined(x,text,64,82);}
  else{x.font='62px '+EMOJI;x.fillText(emoji,64,60);}
  b.tex.needsUpdate=true;
}
function rrect(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function recipeSign(inE,outE){const s=canvasSprite(256,120,1.9,0.9);const x=s.ctx;rrect(x,6,6,244,108,40);x.fillStyle='rgba(255,255,255,.95)';x.fill();
  x.textAlign='center';x.textBaseline='middle';x.font='58px '+EMOJI;x.fillText(inE,62,62);x.fillText(outE,194,62);x.font='900 44px system-ui,sans-serif';x.fillStyle='#3a8f4a';x.fillText('➜',128,60);s.tex.needsUpdate=true;return s;}

/* ---------- characters ---------- */
const CG={body:new THREE.CylinderGeometry(0.3,0.36,0.6,12),hip:new THREE.SphereGeometry(0.36,12,8),head:new THREE.SphereGeometry(0.3,14,10),
  eye:new THREE.SphereGeometry(0.045,6,4),cheek:new THREE.SphereGeometry(0.055,6,4),leg:new THREE.CylinderGeometry(0.1,0.09,0.4,7),
  arm:new THREE.CylinderGeometry(0.075,0.07,0.42,7),hat:new THREE.SphereGeometry(0.33,12,6,0,Math.PI*2,0,Math.PI/2),pom:new THREE.SphereGeometry(0.09,7,5)};
/* Every new shopper look (colour x skin x hat x variant, ~900 combinations) used to bake and keep
   its own ~100 KB geometry forever. Geometry is now reference-counted: a small set of recently
   used looks stays cached, the rest is freed from GPU memory when nobody wears it. */
const charRef=new Map(),charIdle=[];
function releaseChar(g){const k=g&&g.userData.ck;if(!k||g.userData.released)return;g.userData.released=1;const n=(charRef.get(k)||1)-1;charRef.set(k,n);
  if(n<=0){charIdle.push(k);while(charIdle.length>28){const old=charIdle.shift();if((charRef.get(old)||0)>0)continue;const geo=mergeCache.get(old);if(geo){geo.dispose();mergeCache.delete(old);}charRef.delete(old);}}}
function part(geo,c,x,y,z,p){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;}
function makeChar(color,o={}){
  const g=new THREE.Group();const skin=o.skin||0xffe2c2;const ck='c:'+color+':'+JSON.stringify(o);
  const body=mergedGroup(ck,()=>{const t=new THREE.Group();charStatic(t,color,skin,o);return t;});g.add(body.children[0]);
  g.userData.live=1;g.userData.ck=ck;charRef.set(ck,(charRef.get(ck)||0)+1);
  const limb=(geo,x,y,len)=>{const p=new THREE.Group();p.position.set(x,y,0);p.userData.limb={geo,len};g.add(p);return p;};
  const legL=limb(CG.leg,-0.15,0.38,0.4),legR=limb(CG.leg,0.15,0.38,0.4),armL=limb(CG.arm,-0.37,1.02,0.42),armR=limb(CG.arm,0.37,1.02,0.42);
  const ch={g,legL,legR,armL,armR,col:new THREE.Color(color)};g.userData.chr=ch;LIMB.chars.add(ch);return ch;
}
function charStatic(g,color,skin,o){
  part(CG.hip,color,0,0.45,0,g).scale.y=0.55;part(CG.body,color,0,0.8,0,g);part(CG.head,skin,0,1.38,0,g);
  part(CG.eye,0x222222,-0.1,1.42,0.27,g);part(CG.eye,0x222222,0.1,1.42,0.27,g);
  if(o.backpack){box(0.42,0.46,0.2,o.backpack,0,0.86,-0.36,g);box(0.3,0.16,0.06,0xffffff,0,0.8,-0.47,g);}
  if(o.elder){part(CG.hat,0xdedede,0,1.4,-0.02,g).scale.set(1,0.8,1);}
  if(o.sprout){part(CG.hat,0x3f9f3a,0,1.42,0,g).scale.set(1,0.55,1);box(0.36,0.035,0.22,0x3f9f3a,0,1.46,0.3,g);}
  if(o.apron)box(0.46,0.42,0.06,0xffffff,0,0.8,0.33,g);
  if(o.hat){part(CG.hat,o.hat,0,1.42,0,g);part(CG.pom,0xffffff,0,1.76,0,g);}
  if(o.straw){cyl(0.52,0.52,0.04,o.straw,0,1.6,0,g,16);cyl(0.24,0.27,0.2,o.straw,0,1.71,0,g,14);cyl(0.275,0.275,0.05,0xd9534f,0,1.64,0,g,14);}
  if(o.visor){part(CG.hat,o.visor,0,1.42,0,g);box(0.34,0.03,0.22,o.visor,0,1.45,0.34,g);}
}
function limbSet(geo){let s=LIMB.sets.get(geo);if(!s){const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),LIMB.MAX);im.setColorAt(0,new THREE.Color(0xffffff));im.count=0;im.frustumCulled=false;   // allocate the full colour buffer while count===MAX
  im.castShadow=false;im.receiveShadow=true;im.userData.live=1;scene.add(im);s={im,n:0};LIMB.sets.set(geo,s);}return s;}
function limbOff(len){let m=LIMB.offs.get(len);if(!m){m=new THREE.Matrix4().makeTranslation(0,-len/2,0);LIMB.offs.set(len,m);}return m;}
/* called once per frame after matrices are up to date: writes every visible character's limbs into the batches */
function limbsTick(){for(const s of LIMB.sets.values())s.n=0;
  for(const ch of LIMB.chars){const g=ch.g;if(!g.parent){LIMB.chars.delete(ch);continue;}
    if(!g.visible||g.userData.lodOn===false||(g.parent!==scene&&!g.parent.visible))continue;
    for(const p of [ch.legL,ch.legR,ch.armL,ch.armR]){const L0=p.userData.limb,s=limbSet(L0.geo);if(s.n>=LIMB.MAX)continue;
      LIMB.m4.multiplyMatrices(p.matrixWorld,limbOff(L0.len));s.im.setMatrixAt(s.n,LIMB.m4);s.im.setColorAt(s.n,ch.col);s.n++;}}
  for(const s of LIMB.sets.values()){s.im.count=s.n;s.im.instanceMatrix.needsUpdate=true;if(s.im.instanceColor)s.im.instanceColor.needsUpdate=true;}}
function animChar(ch,moving,t,carrying,riding){
  const s=moving?Math.sin(t*14):0;
  ch.legL.rotation.x=s*0.7;ch.legR.rotation.x=-s*0.7;
  if(carrying){ch.armL.rotation.x=ch.armR.rotation.x=-1.25;}else{ch.armL.rotation.x=-s*0.6;ch.armR.rotation.x=s*0.6;}
  if(!riding)ch.g.position.y=floorY(ch.g.position.x)+(moving?Math.abs(Math.sin(t*14))*0.06:0);
}
const FRU=new THREE.Frustum(),FRM=new THREE.Matrix4(),FSP=new THREE.Sphere(new THREE.Vector3(),1.7);
function setCast(g,on){g.traverse(o=>{if(!o.isMesh)return;if(o.userData.cs0===undefined)o.userData.cs0=o.castShadow;o.castShadow=on&&o.userData.cs0;});}
function lodChar(g){FSP.center.set(g.position.x,g.position.y+1,g.position.z);const on=FRU.intersectsSphere(FSP);if(g.userData.lodOn!==on){g.userData.lodOn=on;setCast(g,on);}return on;}
/* The shadow camera covers more of the town than the screen does, so shoppers just outside the view
   were still drawn into the shadow map and animated every frame. Now only on-screen ones are. */
function charLOD(){camera.updateMatrixWorld();FRM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FRU.setFromProjectionMatrix(FRM);
  for(const c of customers)lodChar(c.g);for(const h of helpers)lodChar(h.g);for(const w of walkers)lodChar(w.ch.g);for(const p of gCust.values())lodChar(p.g);for(const p of gHelpers)lodChar(p.g);}
const onScreen=g=>g.userData.lodOn!==false;
function faceTo(g,ang,dt){let d=ang-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*Math.min(1,dt*12);}
function stepToward(g,tg,speed,dt){const dx=tg.x-g.position.x,dz=tg.z-g.position.z,d=Math.hypot(dx,dz);if(d<0.04)return false;const s=Math.min(d,speed*dt);g.position.x+=dx/d*s;g.position.z+=dz/d*s;faceTo(g,Math.atan2(dx,dz),dt);return true;}
function collide(p,r){
  for(const s of solids){if(!s.active)continue;
    const cx=Math.max(s.x0,Math.min(p.x,s.x1)),cz=Math.max(s.z0,Math.min(p.z,s.z1));
    const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-6){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}
      else{const l=p.x-s.x0,rr=s.x1-p.x,t=p.z-s.z0,b=s.z1-p.z,m=Math.min(l,rr,t,b);
        if(m===l)p.x=s.x0-r;else if(m===rr)p.x=s.x1+r;else if(m===t)p.z=s.z0-r;else p.z=s.z1+r;}}
  }
}
const near=(p,q,r)=>Math.hypot(p.x-q.x,p.z-q.z)<r;

/* ---------- tweens & pops ---------- */
const tweens=[],pops=[];
function fly(mesh,from,toFn,dur,done,arc=1.2){mesh.position.copy(from);mesh.rotation.set(0,0,0);scene.add(mesh);tweens.push({mesh,from:from.clone(),toFn,t:0,dur,done,arc});}
function pop(o,s0=0.15){o.scale.setScalar(s0);if(o.userData.frozen)o.matrixAutoUpdate=true;pops.push({o,s0,t:0});}
function updFx(dt){
  for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const k=Math.min(1,w.t/w.dur);w.mesh.position.lerpVectors(w.from,w.toFn(),k);w.mesh.position.y+=Math.sin(k*Math.PI)*w.arc;
    if(k>=1){tweens.splice(i,1);w.done&&w.done();}}
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt;const k=Math.min(1,p.t/0.28),q=k-1;const e=1+2.70158*q*q*q+1.70158*q*q;p.o.scale.setScalar(Math.max(0.01,p.s0+(1-p.s0)*e));if(k>=1){p.o.scale.setScalar(1);if(p.o.userData.frozen){p.o.updateMatrix();p.o.matrixAutoUpdate=false;}pops.splice(i,1);}}
}

/* ---------- carrier ---------- */
class Carrier{
  constructor(g){this.g=g;this.carry=[];this.incoming=0;this.t=0;this.sway=0;}
  total(){return this.carry.length+this.incoming;}
  has(t){return this.carry.some(i=>i.type===t);}
  local(i){return V3(0,0.95+i*0.42,0.52);}
  slotWorld(i){this.g.updateMatrixWorld(true);return this.g.localToWorld(this.local(i));}
  add(type,m){m.rotation.set(0,0,0);m.position.copy(this.local(this.carry.length));this.g.add(m);this.carry.push({type,mesh:m});pop(m,0.5);}
  removeType(type){this.g.updateMatrixWorld(true);
    for(let i=this.carry.length-1;i>=0;i--){if(this.carry[i].type===type){const it=this.carry[i];const pos=new THREE.Vector3();it.mesh.getWorldPosition(pos);this.g.remove(it.mesh);this.carry.splice(i,1);this.layout();return {mesh:it.mesh,pos};}}
    return null;}
  layout(){this.carry.forEach((it,i)=>{const p=this.local(i);it.mesh.position.set(0,p.y,p.z-this.sway*i*0.045);it.mesh.rotation.x=-this.sway*i*0.03;});}
}
/* a "bin" is anything that holds items: producer piles, shelves, machine trays */
function instGeo(key,sphere){const src=mergeCache.get(key);const g=new THREE.BufferGeometry();for(const k in src.attributes)g.setAttribute(k,src.attributes[k]);if(src.index)g.setIndex(src.index);g.boundingSphere=sphere;g.boundingBox=null;return g;}
const IM_Q=new THREE.Quaternion(),IM_S=new THREE.Vector3(),IM_M=new THREE.Matrix4();
function makeBin(type,max,slotPos,parent){
  const b={type,count:0,incoming:0,max,unlocked:false,slotPos,slots:[]};
  const keys=[],pts=[];for(let i=0;i<max;i++){const it=makeItem(type);keys.push(it.userData.mk);freeItem(it);pts.push(slotPos(i));}
  const sph=new THREE.Sphere().setFromPoints(pts);sph.radius+=0.7;
  const groups=new Map();keys.forEach((k,i)=>{let g=groups.get(k);if(!g)groups.set(k,g={idx:[]});g.pos=g.idx.length;g.idx.push(i);});
  const slotIn=[];for(const [k,g] of groups){g.im=new THREE.InstancedMesh(instGeo(k,sph),VCMAT,g.idx.length);g.im.castShadow=g.im.receiveShadow=true;g.im.userData.nb=1;g.im.visible=false;parent.add(g.im);g.idx.forEach((i,j)=>slotIn[i]=[g,j]);}
  const sc=new Float32Array(max).fill(1);
  const write=i=>{const [g,j]=slotIn[i];const s=Math.max(0.01,sc[i]);IM_S.set(s,s,s);IM_M.compose(pts[i],IM_Q,IM_S);g.im.setMatrixAt(j,IM_M);g.im.instanceMatrix.needsUpdate=true;};
  for(let i=0;i<max;i++)write(i);
  // slots fill in order, so drawing the first n instances of each group draws exactly the stocked ones
  b.refresh=()=>{for(const g of groups.values()){let n=0;while(n<g.idx.length&&g.idx[n]<b.count)n++;g.im.count=n;g.im.visible=n>0;}};
  b.slots=pts.map((_,i)=>({userData:{},scale:{setScalar:v=>{sc[i]=v;write(i);}}}));
  b.space=()=>b.max-b.count-b.incoming;
  b.refresh();
  return b;
}

/* ---------- world ---------- */
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),M(0x8fd96b));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box(130,0.04,5,0x8e949a,16,0.02,-18.6,null,false);
for(let x=-40;x<=72;x+=4)box(1.6,0.05,0.2,0xf4f4f4,x,0.04,-18.6,null,false);
box(130,0.07,1.3,0xd9d2c5,16,0.035,-15.5,null,false);
box(7.5,0.06,2.2,0xe6d3b3,-15,0.03,-6,null,false);
box(7.5,0.06,2.2,0xe6d3b3,29,0.03,-6,null,false);
box(7.5,0.06,2.2,0xe6d3b3,47,0.03,-8.5,null,false);
// west store
const westFloorMat=new THREE.MeshLambertMaterial({color:0xf7c99c});box(22.4,0.1,14.4,westFloorMat,0,0.05,-7,null,false);
box(19,0.02,2.6,0xfbdab7,0,0.11,-10.2,null,false);
box(12,0.02,2.2,0xfbdab7,-3,0.11,-3.3,null,false);
box(22.4,0.16,0.3,0x5fcf8a,0,0.08,0.25,null,false);
// middle store (first expansion)
const eastFloorMat=new THREE.MeshLambertMaterial({color:0xcfcac2});
box(14,0.1,14.4,eastFloorMat,18.2,0.05,-7,null,false);
const eastDecor=new THREE.Group();scene.add(eastDecor);eastDecor.visible=false;
box(12.6,0.02,2.6,0xfbdab7,18.2,0.11,-10.2,eastDecor,false);box(10,0.02,2.2,0xfbdab7,16,0.11,-3.3,eastDecor,false);
box(14,0.16,0.3,0x5fcf8a,18.2,0.08,0.25,null,false);
// wing (second expansion)
const wingFloorMat=new THREE.MeshLambertMaterial({color:0xcfcac2});
box(18,0.1,14.4,wingFloorMat,34.2,0.05,-7,null,false);
const wingDecor=new THREE.Group();scene.add(wingDecor);wingDecor.visible=false;
box(17,0.02,2.6,0xdbe9f7,34.2,0.11,-10.2,wingDecor,false);box(17,0.02,1.6,0xdbe9f7,34.2,0.11,-4.9,wingDecor,false);box(10,0.02,2.0,0xdbe9f7,34,0.11,-3.2,wingDecor,false);
box(18,0.16,0.3,0x5fcf8a,34.2,0.08,0.25,null,false);
function makeTape(x){const g=new THREE.Group();scene.add(g);for(let z=-13.5;z<0;z+=1.6){const t=box(0.9,0.03,0.25,0xffc93c,x,0.12,z,g,false);t.rotation.y=0.6;const u=box(0.9,0.03,0.25,0x333333,x+0.6,0.12,z+0.5,g,false);u.rotation.y=0.6;}return g;}
const tape=makeTape(12),tape2=makeTape(26);
const WALL=0xeef1f3;
box(54.8,2.4,0.4,WALL,16,1.2,-14.4);box(54.8,0.26,0.42,0x4a90e2,16,1.95,-14.4);box(54.8,0.16,0.44,0x5fcf5a,16,2.33,-14.4);
solid(-11.4,-14.6,43.4,-14.2);
box(0.4,2.4,7.2,WALL,-11.2,1.2,-10.6);solid(-11.4,-14.2,-11.0,-7);
box(0.4,2.4,5.2,WALL,-11.2,1.2,-2.4);solid(-11.4,-5,-11.0,0.2);
const divider2=new THREE.Group();scene.add(divider2);
box(0.4,2.4,7.2,WALL,25.2,1.2,-10.6,divider2);box(0.4,2.4,5.2,WALL,25.2,1.2,-2.4,divider2);
const div2Sol=[solid(25.0,-14.2,25.4,-7),solid(25.0,-5,25.4,0.2)];
box(0.4,2.4,5.6,WALL,43.2,1.2,-12.2);solid(43.0,-14.2,43.4,-9.4);
box(0.4,2.4,7.8,WALL,43.2,1.2,-3.7);solid(43.0,-7.6,43.4,0.2);
const divider=new THREE.Group();scene.add(divider);
box(0.4,2.4,14.4,WALL,11.2,1.2,-7,divider);box(0.42,0.26,14.4,0x4a90e2,11.2,1.95,-7,divider);
const dividerSol=solid(11.0,-14.2,11.4,0.2);
box(1.4,0.03,1.8,0xd96a4a,-10.3,0.12,-6,null,false);box(1.4,0.03,1.8,0xd96a4a,24.3,0.12,-6,divider2,false);box(1.4,0.03,1.8,0xd96a4a,42.3,0.12,-8.5,null,false);
function wallSign(text,x,bg){text=L(text);const c=document.createElement('canvas');c.width=512;c.height=128;const k=c.getContext('2d');rrect(k,6,6,500,116,40);k.fillStyle=bg;k.fill();
  k.lineWidth=8;k.strokeStyle='#fff';k.stroke();k.fillStyle='#fff';let fs=72;k.font='900 '+fs+'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';const tw=k.measureText(text).width;if(tw>450){fs=Math.floor(72*450/tw);k.font='900 '+fs+'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';}k.textAlign='center';k.textBaseline='middle';k.fillText(text,256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(x,3.3,-14.3);scene.add(m);
  box(0.12,1.0,0.12,0x9aa0a6,x-2,2.6,-14.4);box(0.12,1.0,0.12,0x9aa0a6,x+2,2.6,-14.4);return m;}
wallSign('小镇鲜市',0,'#2fae5a');wallSign('烘焙乳品',18.2,'#e0893a');wallSign('百货区',34.2,'#3a7bd5');
function plant(x,z){cyl(0.3,0.24,0.45,0xc4703f,x,0.33,z);const l=sph(0.42,0x49b545,x,0.8,z);l.scale.set(1,0.8,1);}
plant(10.3,-0.7);plant(10.3,-13.4);plant(-10.3,-13.4);plant(24.3,-13.4);plant(42.3,-13.4);plant(42.3,-0.7);
function tree(x,z,s=1){cyl(0.15*s,0.2*s,0.8*s,0x9a6a43,x,0.4*s,z,null,6);add(new THREE.ConeGeometry(0.95*s,1.6*s,7),0x4fbf4a,x,1.5*s,z);add(new THREE.ConeGeometry(0.72*s,1.25*s,7),0x62d15a,x,2.25*s,z);}
[[-14,3],[-15.5,9],[-14,15],[-7,17],[0,17.5],[7,17],[16,15.5],[23,15.5],[10,15.5],[-15,-11],[48,3],[49,12],[48,-2],[47,-12],[31,15],[39,15],[44,15.5]].forEach(([x,z],i)=>tree(x,z,0.9+(i%3)*0.2));
for(let x=-9;x<=9;x+=1.5)box(0.14,0.62,0.14,0xd9a066,x,0.31,14.6);
box(18.2,0.1,0.08,0xd9a066,0,0.45,14.6);box(18.2,0.1,0.08,0xd9a066,0,0.22,14.6);
for(let x=10;x<=25;x+=1.5)box(0.14,0.62,0.14,0xd9a066,x,0.31,12.6);
box(15.2,0.1,0.08,0xd9a066,17.5,0.45,12.6);box(15.2,0.1,0.08,0xd9a066,17.5,0.22,12.6);

/* ---------- second floor (2F) ---------- */
const f2G=new THREE.Group();scene.add(f2G);f2G.visible=false;const F2Y=6;
// building shell under 2F
box(42.4,5.9,0.4,0xe4e8ec,79,2.95,0.2);box(42.4,5.9,0.4,0xe4e8ec,79,2.95,-14.4);box(0.4,5.9,14.6,0xe4e8ec,57.8,2.95,-7.1);box(0.4,5.9,14.6,0xe4e8ec,100.2,2.95,-7.1);
for(let x=62;x<=118;x+=4){box(2.4,1.6,0.08,winMat,x,3.2,0.44,null,false);}
box(42.4,0.35,0.5,0x4a90e2,79,5.75,0.25);
// floor slab with an opening for the escalators
const slabM=0xebe6f3;
box(36.2,0.2,14.6,slabM,82,F2Y-0.1,-7.1,null,false);box(5.8,0.2,5.1,slabM,60.9,F2Y-0.1,-11.65,null,false);box(5.8,0.2,5.3,slabM,60.9,F2Y-0.1,-2.45,null,false);
box(5.8,0.1,4,0x6b6f76,60.9,3.4,-7,null,false);box(5.8,2.6,0.1,0xd8d2e6,60.9,4.7,-9.05,null,false);box(5.8,2.6,0.1,0xd8d2e6,60.9,4.7,-4.95,null,false);
box(34,0.02,2.6,0xf6f2fb,82,F2Y+0.01,-10.2,null,false);box(30,0.02,1.6,0xf6f2fb,80,F2Y+0.01,-4.9,null,false);
solid(57.6,-14.6,100.4,-14.2);solid(57.6,-14.2,58.0,0.4);solid(100.0,-14.2,100.4,-9.5);solid(100.0,-3.5,100.4,0.4);const fhGate=solid(100.0,-9.5,100.4,-3.5);solid(57.6,0.0,100.4,0.4);solid(58.0,-9.1,63.4,-4.9);
// 2F walls, glass railing
box(42.8,2.4,0.4,0xf4f0fa,79,F2Y+1.2,-14.4,f2G);box(42.8,0.26,0.42,0xb07bdc,79,F2Y+1.95,-14.4,f2G);
box(0.4,2.4,14.6,0xf4f0fa,57.8,F2Y+1.2,-7.1,f2G);box(0.4,2.4,4.8,0xf4f0fa,100.2,F2Y+1.2,-11.9,f2G);box(0.4,2.4,4.0,0xf4f0fa,100.2,F2Y+1.2,-1.5,f2G);
const fhGateMesh=box(0.4,2.4,6,0xe6ddf2,100.2,F2Y+1.2,-6.5,f2G);fhGateMesh.userData.nb=1;
const glassM=new THREE.MeshLambertMaterial({color:0xcfeaff,transparent:true,opacity:0.35});
box(42.4,0.9,0.08,glassM,79,F2Y+0.45,0.2,f2G,false);box(42.4,0.08,0.14,0xb0b8c4,79,F2Y+0.92,0.2,f2G);
box(5.8,0.9,0.06,glassM,60.9,F2Y+0.45,-9.1,f2G,false);box(5.8,0.9,0.06,glassM,60.9,F2Y+0.45,-4.9,f2G,false);
[[64,-13.3],[99,-13.3],[99,-0.8],[64.5,-0.8]].forEach(([x,z])=>{cyl(0.3,0.24,0.45,0xc4703f,x,F2Y+0.23,z,f2G);sph(0.42,0x49b545,x,F2Y+0.7,z,f2G).scale.set(1,0.8,1);});
box(2.2,0.4,0.6,0xc98b52,84,F2Y+0.25,-0.8,f2G);box(2.2,0.4,0.6,0xc98b52,74,F2Y+0.25,-0.8,f2G);
// freight elevator on the back wall
box(2.6,2.2,0.2,0x8a93a3,92,F2Y+1.1,-14.1,f2G);
const elevL=box(0.62,1.9,0.06,0xc0c7d2,91.68,F2Y+0.95,-13.98,f2G),elevR=box(0.62,1.9,0.06,0xc0c7d2,92.32,F2Y+0.95,-13.98,f2G);elevL.userData.live=elevR.userData.live=1;
{const sg=canvasSprite(128,144,0.8,0.9);drawBubble(sg,'🛗','');sg.s.position.set(92,F2Y+2.9,-14);f2G.add(sg.s);}
{const c=document.createElement('canvas');c.width=512;c.height=128;const k=c.getContext('2d');rrect(k,6,6,500,116,40);k.fillStyle='#9b59b6';k.fill();k.lineWidth=8;k.strokeStyle='#fff';k.stroke();
  k.fillStyle='#fff';k.font='900 64px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(L('二楼 生活馆'),256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(75,F2Y+3.3,-14.3);f2G.add(m);}
// escalators: 1F (x 12.3..16.7) and 2F well (x 59.6..63.8); up lane z=-8.2, down lane z=-5.8
const escG=new THREE.Group();scene.add(escG);escG.visible=false;
const UPZ=-8.2,DNZ=-5.8;
const escSteps=[];
function ramp(x0,y0,x1,y1,z,parent){
  const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0);
  const r=box(len,0.3,1.1,0x5b616b,(x0+x1)/2,(y0+y1)/2-0.12,z,parent);r.rotation.z=ang;
  for(const side of [-0.6,0.6]){const gl=box(len,0.7,0.05,glassM,(x0+x1)/2,(y0+y1)/2+0.35,z+side,parent,false);gl.rotation.z=ang;const rl=box(len,0.07,0.1,0x2b2b2b,(x0+x1)/2,(y0+y1)/2+0.72,z+side,parent);rl.rotation.z=ang;}
  for(let k=0;k<6;k++)escSteps.push({z,x0,y0,x1,y1,k});
}
ramp(12.3,0,16.7,2.4,UPZ,escG);ramp(16.7,2.4,12.3,0,DNZ,escG);
box(3.6,0.4,4.4,0xebe6f3,17.9,2.75,-7,escG);box(3.6,0.08,4.5,0xb07bdc,17.9,2.98,-7,escG);
cyl(0.18,0.18,2.6,0xd8d2e6,19.5,1.3,-8.9,escG,10);cyl(0.18,0.18,2.6,0xd8d2e6,19.5,1.3,-5.1,escG,10);
{const sg=canvasSprite(256,120,1.6,0.75);const x=sg.ctx;rrect(x,6,6,244,108,40);x.fillStyle='#9b59b6';x.fill();x.textAlign='center';x.textBaseline='middle';x.font='900 52px system-ui,sans-serif';x.fillStyle='#fff';x.fillText('⬆ 2F',128,62);sg.tex.needsUpdate=true;sg.s.position.set(14.5,3.3,-7);escG.add(sg.s);}
ramp(59.6,3.6,63.8,F2Y,UPZ,escG);ramp(63.8,F2Y,59.6,3.6,DNZ,escG);
const stepIM=new THREE.InstancedMesh(new THREE.BoxGeometry(0.35,0.04,1.0),M(0xb8bec8),escSteps.length);stepIM.frustumCulled=false;stepIM.receiveShadow=true;stepIM.userData.live=1;escG.add(stepIM);
const escSol=solid(12.5,-8.95,19.75,-5.05,false);
const UP_ENTRY=V3(11.7,0,UPZ),UP_EXIT=V3(64.3,0,UPZ),DN_ENTRY=V3(64.3,0,DNZ),DN_EXIT=V3(11.7,0,DNZ);
const UP_NODE={ride:true,legs:[[V3(11.7,0,UPZ),V3(12.3,0,UPZ),0.2],[V3(12.3,0,UPZ),V3(16.7,2.4,UPZ),1.6],[V3(59.6,3.6,UPZ),V3(63.8,F2Y,UPZ),1.4],[V3(63.8,F2Y,UPZ),V3(64.3,F2Y,UPZ),0.2]]};
const DN_NODE={ride:true,legs:[[V3(64.3,F2Y,DNZ),V3(63.8,F2Y,DNZ),0.2],[V3(63.8,F2Y,DNZ),V3(59.6,3.6,DNZ),1.4],[V3(16.7,2.4,DNZ),V3(12.3,0,DNZ),1.6],[V3(12.3,0,DNZ),V3(11.7,0,DNZ),0.2]]};
let f2Open=false;
function openFloor2(anim){f2Open=true;f2G.visible=true;escG.visible=true;escSol.active=true;if(anim){pop(escG,0.3);}}
function updEscalators(dt){if(!f2Open)return;escSteps.forEach((e,i)=>{const k=((T*0.45+e.k/6)%1);IM_M.makeTranslation(e.x0+(e.x1-e.x0)*k,e.y0+(e.y1-e.y0)*k+0.05,e.z);stepIM.setMatrixAt(i,IM_M);});stepIM.instanceMatrix.needsUpdate=true;}
// entities (customers, helpers, player) follow paths that may contain an escalator ride node
function followPath(e,speed,dt){
  while(e.path.length){const n=e.path[0];
    if(n.ride){if(!(e.rideLeg>=0)){e.rideLeg=0;e.rideT=0;e.g.position.copy(n.legs[0][0]);}
      const [p0,p1,dur]=n.legs[e.rideLeg];e.rideT+=dt/dur;const k=Math.min(1,e.rideT);
      e.g.position.lerpVectors(p0,p1,k);faceTo(e.g,Math.atan2(p1.x-p0.x,p1.z-p0.z),dt*2);
      if(k>=1){e.rideLeg++;e.rideT=0;
        if(e.rideLeg>=n.legs.length){e.rideLeg=-1;e.path.shift();continue;}
        const q=n.legs[e.rideLeg][0];if(q.distanceTo(e.g.position)>1){e.g.position.copy(q);e.onTeleport&&e.onTeleport();}}
      return 'ride';}
    if(stepToward(e.g,n,speed,dt))return true;e.path.shift();}
  return false;
}
function routeTo(a,b){
  const fa=floorOf(a.x),fb=floorOf(b.x);
  if(fa===fb)return route(a,b);
  if(fa===1)return [...route(a,UP_ENTRY),UP_NODE,...route(UP_EXIT,b)];
  return [...route(a,DN_ENTRY),DN_NODE,...route(DN_EXIT,b)];
}
const travelDist=(a,b)=>floorOf(a.x)===floorOf(b.x)?a.distanceTo(b):a.distanceTo(floorOf(a.x)===1?UP_ENTRY:DN_ENTRY)+14+(floorOf(b.x)===2?UP_EXIT:DN_EXIT).distanceTo(b);

/* ---------- food hall (2F, east side) ---------- */
const fhG=new THREE.Group();scene.add(fhG);fhG.visible=false;let fhOpen=false;
box(20.2,5.9,0.4,0xe4e8ec,110.3,2.95,0.2);box(20.2,5.9,0.4,0xe4e8ec,110.3,2.95,-14.4);box(0.4,5.9,14.6,0xe4e8ec,120.4,2.95,-7.1);
box(20.2,0.35,0.5,0xff8a3d,110.3,5.75,0.25);
const fhFloorM=new THREE.MeshLambertMaterial({color:0xcfcac2});box(20.2,0.2,14.6,fhFloorM,110.3,F2Y-0.1,-7.1,null,false);
solid(100.2,-14.6,120.6,-14.2);solid(120.2,-14.2,120.6,0.4);solid(100.2,0.0,120.6,0.4);
box(20.4,2.4,0.4,0xfff4e6,110.3,F2Y+1.2,-14.4,fhG);box(20.4,0.26,0.42,0xff8a3d,110.3,F2Y+1.95,-14.4,fhG);box(0.4,2.4,14.6,0xfff4e6,120.2,F2Y+1.2,-7.1,fhG);
box(20,0.9,0.08,glassM,110.2,F2Y+0.45,0.2,fhG,false);box(20,0.08,0.14,0xb0b8c4,110.2,F2Y+0.92,0.2,fhG);
{const c=document.createElement('canvas');c.width=512;c.height=128;const k=c.getContext('2d');rrect(k,6,6,500,116,40);k.fillStyle='#ff8a3d';k.fill();k.lineWidth=8;k.strokeStyle='#fff';k.stroke();
  k.fillStyle='#fff';k.font='900 66px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(L('美食广场'),256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(111,F2Y+3.6,-14.3);fhG.add(m);}
const seats=[],fhTableSol=[];
for(const tx of [104,110,116])for(const tz of [-7.2,-3.4]){
  cyl(0.6,0.6,0.08,0xffffff,tx,F2Y+0.78,tz,fhG,16);cyl(0.08,0.12,0.75,0x9aa0a6,tx,F2Y+0.38,tz,fhG,8);fhTableSol.push(solid(tx-0.5,tz-0.5,tx+0.5,tz+0.5,false));
  for(const [sx,sz] of [[1,0],[-1,0],[0,1],[0,-1]]){cyl(0.22,0.2,0.42,0xff8a3d,tx+sx*1.0,F2Y+0.21,tz+sz*1.0,fhG,10);seats.push({x:tx+sx*1.0,z:tz+sz*1.0,tx,tz,face:Math.atan2(-sx,-sz),occ:null});}}
function billStack(slot,parent){freeItem(makeItem('bill'));const pts=[];for(let i=0;i<60;i++)pts.push(slot(i));const sph=new THREE.Sphere().setFromPoints(pts);sph.radius+=0.5;
  const im=new THREE.InstancedMesh(instGeo('i:bill',sph),VCMAT,60);const m4=new THREE.Matrix4();
  for(let i=0;i<60;i++){const p=pts[i];m4.makeTranslation(p.x,p.y,p.z);im.setMatrixAt(i,m4);}im.instanceMatrix.needsUpdate=true;
  im.count=0;im.visible=false;im.castShadow=im.receiveShadow=true;im.userData.nb=1;parent.add(im);
  return {im,set(n){n=Math.min(60,n);if(im.count!==n){im.count=n;im.visible=n>0;}}};}
function makePile(px,pz,Y,parent){
  const o={pile:V3(px,0,pz),stack:[],bills:[],unlocked:false};
  cyl(0.8,0.8,0.05,0xffffff,px,0.12+Y,pz,parent,24);
  o.billSlot=i=>{const l=Math.floor(i/6),k=i%6;return V3(px+((k%2)-0.5)*0.52,0.15+Y+l*0.1,pz+(Math.floor(k/2)-1)*0.32);};
  o.bills=billStack(o.billSlot,parent);o.refresh=()=>o.bills.set(o.stack.length);
  o.push=v=>{if(o.stack.length>=60)o.stack[(Math.random()*60)|0]+=v;else o.stack.push(v);o.refresh();};
  return o;
}
const fhPile=makePile(102.6,-1.4,F2Y,fhG);box(0.9,0.9,0.5,0xff8a3d,102.6,F2Y+0.45,-0.35,fhG);
function openFoodHall(anim){fhOpen=true;fhG.visible=true;fhGate.active=false;fhGateMesh.visible=false;fhTableSol.forEach(s=>s.active=true);fhPile.unlocked=true;fhFloorM.color.setHex(0xfff1dc);if(anim)pop(fhG,0.3);}
const allPiles=()=>[...checkouts.filter(c=>c.unlocked),...(fhPile.unlocked?[fhPile]:[])];
// street lamps (glow at night)
function lamp(x,z,Y=0,parent){cyl(0.07,0.09,2.8,0x6b7280,x,Y+1.4,z,parent,8);const b=add(new THREE.SphereGeometry(0.22,12,10),lampMat,x,Y+2.9,z,parent,false);return b;}
[-9,-3,3,9,15,21,27,33,39].forEach(x=>lamp(x,1.1));[-3,3].forEach(x=>lamp(x,8.6));[14,22].forEach(x=>lamp(x,6.6));[30,38].forEach(x=>lamp(x,9.4));

/* ---------- town life ---------- */
{const fx=-17,fz=3;cyl(1.6,1.8,0.5,0xd9d2c5,fx,0.25,fz,null,20);cyl(1.35,1.35,0.06,0x7fc4f0,fx,0.5,fz,null,20);cyl(0.2,0.3,1.1,0xd9d2c5,fx,0.8,fz,null,10);cyl(0.6,0.5,0.15,0xd9d2c5,fx,1.35,fz,null,14);
  solid(fx-1.8,fz-1.8,fx+1.8,fz+1.8);}
const fountainDrops=[];for(let i=0;i<10;i++)fountainDrops.push({a:i/10*Math.PI*2,t:Math.random()});
const dropIM=new THREE.InstancedMesh(new THREE.SphereGeometry(0.07,6,5),M(0xbfe6ff),10);dropIM.frustumCulled=false;dropIM.userData.live=1;scene.add(dropIM);
function bench(x,z,r=0){const g=new THREE.Group();box(1.6,0.08,0.5,0xc98b52,0,0.45,0,g);box(1.6,0.4,0.06,0xc98b52,0,0.7,-0.22,g);for(const px of [-0.7,0.7])box(0.08,0.45,0.45,0x6b7280,px,0.22,0,g);g.position.set(x,0,z);g.rotation.y=r;g.userData.flat=1;scene.add(g);}
bench(-14.2,6.5,Math.PI/2);bench(-19.8,6.5,-Math.PI/2);bench(46,6,Math.PI/2);bench(-14,-1.5,Math.PI/2);
function flowers(x,z,w,d){box(w,0.25,d,0x9a6a43,x,0.12,z,null,false);const cols=[0xff7eb6,0xffd166,0xffffff,0xc3a6ff,0xff5a4d];for(let i=0;i<Math.round(w*d*3);i++){sph(0.08,cols[i%5],x+(Math.random()-0.5)*(w-0.2),0.3,z+(Math.random()-0.5)*(d-0.2)).castShadow=false;}}
flowers(-12.6,-11,1,5);flowers(44.6,-3,1,5);flowers(-12.6,-2.2,1,3);flowers(-20,12,3,1);
{const pz=16.5;box(22,0.04,5,0x9aa0a6,-24,0.02,10,null,false);for(let i=0;i<5;i++)box(0.12,0.05,2,0xffffff,-33+i*4,0.05,10,null,false);
  [[0xff5a4d,-31],[0x4a90e2,-27],[0xffd166,-23]].forEach(([col,x])=>{const g=new THREE.Group();box(1.6,0.6,3,col,0,0.5,0,g);box(1.4,0.55,1.6,0xdff1ff,0,1.05,-0.1,g);for(const [wx,wz] of [[-0.8,1],[0.8,1],[-0.8,-1],[0.8,-1]]){const w=cyl(0.28,0.28,0.2,0x333333,wx,0.28,wz,g,10);w.rotation.z=Math.PI/2;}g.position.set(x,0,10);g.userData.flat=1;scene.add(g);solid(x-0.9,8.4,x+0.9,11.6);});}
const birds=[];for(let i=0;i<4;i++){const g=new THREE.Group();const b=box(0.3,0.12,0.14,0x555555,0,0,0,g,false);const w1=box(0.1,0.03,0.4,0x555555,0,0.03,0.2,g,false),w2=box(0.1,0.03,0.4,0x555555,0,0.03,-0.2,g,false);g.userData.live=1;scene.add(g);birds.push({g,w1,w2,a:Math.random()*6,r:10+i*4,cx:8+i*6,cz:-2+i*3,h:7+i});}
const walkers=[];const WALK_COLS=[0x7ec8ff,0xffd166,0xb8e986,0xf7b2d0];
for(let i=0;i<4;i++){const ch=makeChar(WALK_COLS[i],{skin:[0xffe2c2,0xf5cfa6,0xe0ac7e,0xc68a5e][i],hat:i%2?[0xff7eb6,0x7ec8ff,0xffd166,0x9ee39e][i]:null});scene.add(ch.g);const dir=i%2?1:-1;ch.g.position.set(-30+i*20,0,dir>0?18.2:19.4);walkers.push({ch,dir,sp:1.6+i*0.2});}
function updTown(dt){
  fountainDrops.forEach((d,i)=>{d.t+=dt*0.9;if(d.t>1)d.t-=1;const r=0.2+d.t*1.0;IM_M.makeTranslation(-17+Math.cos(d.a)*r,1.5+Math.sin(d.t*Math.PI)*0.9-d.t*0.6,3+Math.sin(d.a)*r);dropIM.setMatrixAt(i,IM_M);});dropIM.instanceMatrix.needsUpdate=true;
  for(const b of birds){b.a+=dt*(0.25+b.r*0.005);b.g.position.set(b.cx+Math.cos(b.a)*b.r,b.h+Math.sin(b.a*3)*0.4,b.cz+Math.sin(b.a)*b.r*0.6);b.g.rotation.y=-b.a;const f=Math.sin(T*14+b.r)*0.6;b.w1.rotation.x=f;b.w2.rotation.x=-f;}
  for(const w of walkers){w.ch.g.position.x+=w.dir*w.sp*dt;if(w.ch.g.position.x>55)w.ch.g.position.x=-35;if(w.ch.g.position.x<-35)w.ch.g.position.x=55;w.ch.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;if(onScreen(w.ch.g))animChar(w.ch,true,T+w.sp*3,false);}
}
box(100,0.06,2.4,0xe6ddcc,10,0.03,18.8,null,false);

/* ---------- trash can ---------- */
const TRASH=V3(-3.2,0,1.4);
cyl(0.36,0.3,0.8,0x5cae4f,TRASH.x,0.4,TRASH.z,null,12);cyl(0.4,0.4,0.08,0x4a9440,TRASH.x,0.84,TRASH.z,null,12);
const trashTag=canvasSprite(128,144,0.8,0.9);drawBubble(trashTag,'🗑️','');trashTag.s.position.set(TRASH.x,1.8,TRASH.z);scene.add(trashTag.s);
solid(TRASH.x-0.35,TRASH.z-0.35,TRASH.x+0.35,TRASH.z+0.35);

/* ---------- checkouts ---------- */
const checkouts=[];
function buildCheckout(cx,dir){
  const g=new THREE.Group();scene.add(g);const Y=floorY(cx);
  box(2.8,1.0,0.8,0x6fe3b5,cx,0.6+Y,-2,g);box(2.95,0.12,0.92,0xa9f2d6,cx,1.16+Y,-2,g);
  box(0.62,0.35,0.46,0x7b8088,cx+0.5*dir,1.39+Y,-2,g);box(0.52,0.36,0.06,0x9fd3ff,cx+0.5*dir,1.72+Y,-2.12,g);
  const reg=V3(cx,0,-0.8),pile=V3(cx+dir*2.1,0,-2);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.72,0.9,36),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.8,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.set(reg.x,0.13+Y,reg.z);g.add(ring);
  cyl(0.8,0.8,0.05,0xffffff,pile.x,0.12+Y,pile.z,g,24);
  const co={cx,dir,Y,floor:floorOf(cx),g,reg,pile,ring,queue:[],cashier:null,stack:[],bills:[],unlocked:false,checkT:0,collectT:0,sol:solid(cx-1.45,-2.45,cx+1.45,-1.55,false)};
  co.slot=i=>V3(cx+dir*i*1.1,0,-3.3);
  co.billSlot=i=>{const l=Math.floor(i/6),k=i%6;return V3(pile.x+((k%2)-0.5)*0.52,0.15+Y+l*0.1,pile.z+(Math.floor(k/2)-1)*0.32);};
  co.bills=billStack(co.billSlot,g);co.refresh=()=>co.bills.set(co.stack.length);
  co.push=v=>{if(co.stack.length>=60)co.stack[(Math.random()*60)|0]+=v;else co.stack.push(v);co.refresh();};
  g.visible=false;checkouts.push(co);return co;
}
buildCheckout(-8.2,1);buildCheckout(20,-1);buildCheckout(30,1);buildCheckout(90,-1);
function unlockCheckout(i,anim){const co=checkouts[i];co.unlocked=true;co.g.visible=true;co.sol.active=true;if(anim)pop(co.g,0.2);}

/* ---------- producers ---------- */
const PROD={corn:{x:-18,z:-1.6,iv:2,sig:1},shrimp:{x:-18,z:-1.6,iv:2,sig:1},cocoa:{x:-18,z:-1.6,iv:2,sig:1},dango:{x:-18,z:-1.6,iv:2,sig:1},carrot:{x:-6,z:11.5,iv:1.3},strawberry:{x:0,z:11.5,iv:1.6},tomato:{x:-6,z:5,iv:1.5},egg:{x:0,z:5,iv:2.1},milk:{x:6,z:5,iv:2.8},wheat:{x:13,z:9,iv:1.2},apple:{x:21,z:9,iv:1.7}};
const producers={};
function buildProducer(type){
  const {x,z,iv}=PROD[type],g=new THREE.Group();scene.add(g);
  const patch=new THREE.Mesh(new THREE.CircleGeometry(PROD[type].sig?1.9:3.3,28),M(0x7fcf5c));patch.rotation.x=-Math.PI/2;patch.position.set(x,0.012,z);patch.receiveShadow=true;g.add(patch);
  let sol;
  if(PROD[type].sig){const col={corn:0xf2c94c,shrimp:0xff8a65,cocoa:0x8d5a3b,dango:0xf8a5c2}[type];
    box(2.3,0.1,1.2,0xe0a86f,x,0.06,z-1.45,g);box(2.6,0.9,1.0,0xc98b52,x,0.45,z+0.5,g);box(2.7,0.08,1.1,0xe0a86f,x,0.94,z+0.5,g);
    for(const px of [-1.2,1.2])cyl(0.06,0.06,2.2,0x8a5a36,x+px,1.1,z+0.05,g,6);
    for(let k=0;k<5;k++)box(0.56,0.08,1.4,k%2?0xffffff:col,x-1.12+k*0.56,2.25,z+0.4,g);
    for(let k=0;k<4;k++)sph(0.16,col,x-0.75+k*0.5,1.1,z+0.45,g).scale.set(1,0.8,1);
    sol=solid(x-1.4,z,x+1.4,z+1.05,false);}
  else if(type==='tomato'){
    box(3.2,0.3,2,0x9a6a43,x,0.15,z+0.4,g);box(2.3,0.1,1.2,0xc98b52,x,0.06,z-1.45,g);
    for(let i=0;i<6;i++){const px=x-1.05+(i%3)*1.05,pz=z-0.05+Math.floor(i/3)*0.9;
      cyl(0.05,0.06,0.9,0x3c9a3c,px,0.75,pz,g,6);const l=sph(0.28,0x49b545,px,1.0,pz,g);l.scale.set(1,0.7,1);
      sph(0.13,0xe8413b,px+0.2,0.8,pz+0.14,g);sph(0.12,0xe8413b,px-0.16,1.08,pz+0.12,g);}
    sol=solid(x-1.6,z-0.6,x+1.6,z+1.4,false);
  }else if(type==='egg'){
    box(2.3,0.1,1.2,0xf2d16b,x,0.06,z-1.45,g);
    box(2,1.4,1.6,0xd9534f,x,0.7,z+0.6,g);const roof=add(new THREE.ConeGeometry(1.45,0.9,4),0xf4f1ea,x,1.85,z+0.6,g);roof.rotation.y=Math.PI/4;roof.scale.set(1.05,1,0.85);
    box(0.6,0.8,0.05,0x6b3a2a,x,0.45,z-0.21,g);
    const hen=(hx,hz)=>{sph(0.3,0xffffff,hx,0.32,hz,g).scale.set(1,0.85,1.2);sph(0.17,0xffffff,hx,0.62,hz+0.25,g);box(0.06,0.12,0.14,0xe23b3b,hx,0.8,hz+0.25,g);const b=add(new THREE.ConeGeometry(0.05,0.12,5),0xf5a623,hx,0.6,hz+0.44,g);b.rotation.x=Math.PI/2;};
    hen(x-1.55,z-0.4);hen(x+1.6,z+0.9);
    sol=solid(x-1.05,z-0.25,x+1.05,z+1.45,false);
  }else if(type==='milk'){
    box(2.3,0.1,1.2,0x7fb8e8,x,0.06,z-1.45,g);
    const cz=z+0.6;box(1.7,0.9,0.95,0xffffff,x,0.95,cz,g);
    box(0.5,0.5,0.97,0x2b2b2b,x-0.3,1.05,cz,g);box(0.35,0.35,0.97,0x2b2b2b,x+0.45,0.85,cz,g);
    box(0.62,0.58,0.62,0xffffff,x+1.05,1.2,cz,g);box(0.2,0.3,0.46,0xffa0b4,x+1.4,1.08,cz,g);
    box(0.08,0.18,0.08,0xf4f1ea,x+1.05,1.58,cz-0.22,g);box(0.08,0.18,0.08,0xf4f1ea,x+1.05,1.58,cz+0.22,g);
    [[-0.6,-0.3],[-0.6,0.3],[0.6,-0.3],[0.6,0.3]].forEach(([lx,lz])=>box(0.2,0.55,0.2,0xffffff,x+lx,0.27,cz+lz,g));
    box(1.2,0.5,0.9,0xf2d16b,x-1.9,0.25,z+1.2,g);
    sol=solid(x-0.95,z+0.05,x+1.45,z+1.15,false);
  }else if(type==='wheat'){
    box(2.3,0.1,1.2,0xe8cf86,x,0.06,z-1.45,g);box(3.4,0.25,2.2,0x9a6a43,x,0.12,z+0.4,g);
    for(let i=0;i<15;i++){const px=x-1.3+(i%5)*0.65,pz=z-0.35+Math.floor(i/5)*0.7;
      const s=cyl(0.03,0.04,0.8,0xd8b040,px,0.65,pz,g,5);s.rotation.z=(i%2?0.1:-0.1);const e=sph(0.09,0xf2cf5b,px,1.1,pz,g);e.scale.set(1,2,1);}
    sol=solid(x-1.7,z-0.7,x+1.7,z+1.5,false);
  }else if(type==='carrot'||type==='strawberry'){
    const car=type==='carrot';
    box(2.3,0.1,1.2,car?0xe0a86f:0xf2c6cf,x,0.06,z-1.45,g);box(3.4,0.25,2.2,0x9a6a43,x,0.12,z+0.4,g);
    for(let i=0;i<12;i++){const px=x-1.2+(i%4)*0.8,pz=z-0.25+Math.floor(i/4)*0.65;
      if(car){sph(0.09,0xff8a1c,px,0.28,pz,g);for(let k=-1;k<=1;k++){const l=add(new THREE.ConeGeometry(0.05,0.35,4),0x3fae3a,px+k*0.06,0.48,pz,g);l.rotation.z=k*0.4;}}
      else{const b=sph(0.26,0x3c9a3c,px,0.38,pz,g);b.scale.set(1,0.6,1);sph(0.08,0xe8304a,px+0.14,0.4,pz+0.12,g);sph(0.07,0xe8304a,px-0.12,0.42,pz+0.1,g);}}
    sol=solid(x-1.7,z-0.7,x+1.7,z+1.5,false);
  }else{
    box(2.3,0.1,1.2,0xc98b52,x,0.06,z-1.45,g);
    [[-1.1,0.4],[1.1,0.4],[0,1.2]].forEach(([tx,tz])=>{cyl(0.14,0.18,1.1,0x8a5a36,x+tx,0.55,z+tz,g,7);const c=sph(0.7,0x55b84a,x+tx,1.45,z+tz,g);c.scale.set(1,0.85,1);
      for(let k=0;k<4;k++){const a=k*1.7;sph(0.1,0x9bd13b,x+tx+Math.cos(a)*0.55,1.3+(k%2)*0.3,z+tz+Math.sin(a)*0.55,g);}});
    sol=solid(x-1.7,z-0.1,x+1.7,z+1.8,false);
  }
  const bin=makeBin(type,8,i=>V3(x-0.75+(i%4)*0.5,0.12,z-1.7+Math.floor(i/4)*0.5),g);
  Object.assign(bin,{kind:'prod',x,z,iv,t:0,g,sol,pick:V3(x,0,z-2.55)});
  g.visible=false;producers[type]=bin;
}
Object.keys(PROD).forEach(buildProducer);
function unlockProducer(t,anim){const p=producers[t];p.unlocked=true;p.g.visible=true;p.sol.active=true;if(anim)pop(p.g,0.2);}

/* ---------- machines ---------- */
const MACH={bread:{inT:'wheat',x:14.5,z:3.6,time:1.8,col:0xc0643c},cheese:{inT:'milk',x:18.5,z:3.6,time:2.4,col:0xf5d76e},juice:{inT:'apple',x:22.5,z:3.6,time:2.0,col:0x7ccf6a},jam:{inT:'strawberry',x:6,z:11.6,time:2.2,col:0xff8fab},
  burger:{inT:'bread',x:105,z:-12.4,time:2.0,col:0xffb347,fh:true,face:1},soup:{inT:'noodles',x:111,z:-12.4,time:2.4,col:0xe57373,fh:true,face:1},drink:{inT:'juice',x:117,z:-12.4,time:1.8,col:0x7ec8e3,fh:true,face:1}};
const machines={};
function buildMachine(outT){
  const d=MACH[outT],{x,z}=d,Y=floorY(x),F=d.face||-1,zc=z-0.2*F,g=new THREE.Group();scene.add(g);
  const body=new THREE.Group();body.position.set(x,Y,zc);body.userData.moves=1;g.add(body);
  box(1.8,1.3,1.2,d.col,0,0.65,0,body);
  const glowMat=new THREE.MeshLambertMaterial({color:0x442211,emissive:0xff8a1c,emissiveIntensity:0});
  if(d.fh){box(1.9,0.12,1.3,0xffffff,0,1.36,0,body);box(2.1,0.1,0.9,0xff5a4d,0,2.3,0.25*F,body);for(const px of [-0.95,0.95])box(0.07,1.0,0.07,0xdddddd,px,1.85,0.55*F,body);sph(0.1,glowMat,0.6,1.1,0.61*F,body);}
  else if(outT==='bread'){box(1.9,0.14,1.3,0x8a3e22,0,1.36,0,body);box(0.9,0.5,0.05,glowMat,0,0.6,-0.61,body);cyl(0.16,0.16,0.8,0x7b8088,0.55,1.8,0.2,body,8);}
  else if(outT==='cheese'){cyl(0.45,0.45,0.2,0x9a6a43,0,1.42,0,body,16);cyl(0.06,0.06,0.6,0x7b8088,0,1.8,0,body,6);box(0.8,0.06,0.06,0x7b8088,0,2.1,0,body);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  else if(outT==='jam'){cyl(0.5,0.5,0.9,0xd8d2cc,0,1.75,0,body,16);cyl(0.52,0.52,0.1,0xc2185b,0,2.2,0,body,16);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  else{cyl(0.42,0.36,0.7,new THREE.MeshLambertMaterial({color:0xffb347,transparent:true,opacity:0.8}),0,1.65,0,body,14);cyl(0.2,0.2,0.1,0x3fae3a,0,2.05,0,body,10);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  body.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  box(1.2,0.08,1.1,0xb9b1a6,x-0.9,Y+0.04,z+1.2*F,g);box(1.2,0.08,1.1,0xe0a86f,x+0.9,Y+0.04,z+1.2*F,g);
  const sign=recipeSign(ITEM[d.inT].e,ITEM[outT].e);sign.s.position.set(x,Y+2.9+(d.fh?0.4:0),zc);g.add(sign.s);
  const tray=ox=>i=>V3(x+ox-0.36+(i%3)*0.36,Y+0.08,z+1.2*F-0.36+Math.floor(i/3)*0.36);
  const inp=makeBin(d.inT,8,tray(-0.9),g);inp.dep=V3(x-0.9,0,z+2.1*F);inp.kind='min';inp.fh=!!d.fh;
  const out=makeBin(outT,8,tray(0.9),g);out.pick=V3(x+0.9,0,z+2.1*F);out.kind=d.fh?'serve':'mout';
  let chef=null;if(d.fh){chef=makeChar(0xffffff,{hat:0xffffff});chef.g.position.set(x,Y,zc-1.0*F);chef.g.rotation.y=F>0?0:Math.PI;g.add(chef.g);}
  const m={outT,inT:d.inT,time:d.time,x,z,g,body,glowMat,inp,out,chef,fh:!!d.fh,t:0,unlocked:false,sol:solid(x-0.95,zc-0.65,x+0.95,zc+0.65,false)};
  out.mach=m;m.freshAt=-99;const fs=canvasSprite(128,144,0.62,0.7);drawBubble(fs,'✨','');fs.s.position.set(x+0.9,Y+1.25,z+1.2*F);fs.s.visible=false;fs.s.userData.live=1;g.add(fs.s);m.freshS=fs;
  g.visible=false;machines[outT]=m;
}
Object.keys(MACH).forEach(buildMachine);
function unlockMachine(t,anim){const m=machines[t];if(m.fh&&anim&&m.inp.count<6){m.inp.count=6;m.inp.refresh();}m.unlocked=m.inp.unlocked=m.out.unlocked=true;m.g.visible=true;m.sol.active=true;if(anim)pop(m.g,0.2);}

/* ---------- shelves ---------- */
const SHELF_POS={tomato:[-5,-11.5],egg:[0,-11.5],milk:[5,-11.5],carrot:[-3,-6.5],jam:[3,-6.5],bread:[14.5,-11.5],cheese:[18.5,-11.5],juice:[22.5,-11.5],
  soda:[27,-11.5],cookies:[30.4,-11.5],noodles:[33.8,-11.5],chocolate:[37.2,-11.5],tissue:[40.6,-11.5],shampoo:[28.7,-6.5],icecream:[33.8,-6.5],canned:[38.9,-6.5],
  hongbao:[6,-2.4],candybox:[6,-2.4],mooncake:[6,-2.4],oillamp:[6,-2.4],gift:[6,-2.4],
  tshirt:[68,-11.5],book:[72,-11.5],ball:[76,-11.5],umbrella:[80,-11.5],teddy:[70,-6.5],headphones:[78,-6.5],
  corn:[-18,-10.6],shrimp:[-18,-10.6],cocoa:[-18,-10.6],dango:[-18,-10.6]};
const SHELF_COL={soda:[0x7fb8e8,0xa9d2f5,0x4a90e2],icecream:[0xeaf4ff,0xffffff,0x9fc9ee],milk:[0xa9d2f5,0xd4e9fb,0x7fb8e8]};
const shelfMats=[new THREE.MeshLambertMaterial({color:0xc98b52}),new THREE.MeshLambertMaterial({color:0xe0a86f}),new THREE.MeshLambertMaterial({color:0xb37542})];
const SHELF_VC=new THREE.MeshLambertMaterial({vertexColors:true}),SHELF_GEOS=[];
function recolorShelves(){for(const g of SHELF_GEOS){const c=g.attributes.color,sl=g.userData.slots;for(let i=0;i<sl.length;i++){const m=shelfMats[sl[i]].color;c.setXYZ(i,m.r,m.g,m.b);}c.needsUpdate=true;}}
const SX={};for(const t in SHELF_POS)SX[t]=SHELF_POS[t][0];
const shelves={};
function buildShelf(type){
  const [x,z]=SHELF_POS[type],g=new THREE.Group();scene.add(g);const Y=floorY(x);const col=SHELF_COL[type]||(Y?[0xf2f0f7,0xffffff,0xb07bdc]:shelfMats);
  box(3,0.9,1,col[0],x,0.55+Y,z,g);box(3.1,0.08,1.1,col[1],x,1.04+Y,z,g);box(3,1.2,0.12,col[2],x,1.64+Y,z-0.5,g);
  if(type==='icecream'){const glass=box(3.02,0.5,1.02,new THREE.MeshLambertMaterial({color:0xcfeaff,transparent:true,opacity:0.35}),x,1.32,z,g,false);glass.renderOrder=3;
    box(3.06,0.06,1.06,0x7fb8e8,x,1.58,z,g);box(3.06,0.14,1.06,0x7fb8e8,x,0.17,z,g);
    for(let k=0;k<5;k++){const f=box(0.35,0.04,0.02,0xffffff,x-1.2+k*0.6,0.7,z+0.51,g,false);f.rotation.z=0.3;}}
  const sign=canvasSprite(128,144,0.95,1.07);drawBubble(sign,ITEM[type].e,'');sign.s.position.set(x,2.75+Y,z-0.5);g.add(sign.s);
  const sh=makeBin(type,8,i=>V3(x-1.05+(i%4)*0.7,1.08+Y,z-0.2+Math.floor(i/4)*0.45),g);
  Object.assign(sh,{kind:'shelf',sign,x,z,g,dep:V3(x,0,z+1.3),spotZ:z+1.45,island:z>-10,sol:solid(x-1.55,z-0.6,x+1.55,z+0.55,false)});
  g.visible=false;shelves[type]=sh;
}
SELL.forEach(buildShelf);FEST_ITEMS.forEach(buildShelf);SIG_ITEMS.forEach(buildShelf);
function unlockShelf(t,anim){const s=shelves[t];s.unlocked=true;s.g.visible=true;s.sol.active=true;if(anim)pop(s.g,0.2);}

/* ---------- navigation grid (A*) so NPCs walk around every obstacle ---------- */
const NAV={x0:-20,z0:-16,cs:0.5,W:290,H:68,grid:null,sig:-1};
function navRebuild(){
  const {x0,z0,cs,W,H}=NAV,g=new Uint8Array(W*H),inf=0.42;
  for(const s of solids){if(!s.active)continue;
    const i0=Math.max(0,Math.floor((s.x0-inf-x0)/cs)),i1=Math.min(W-1,Math.floor((s.x1+inf-x0)/cs));
    const j0=Math.max(0,Math.floor((s.z0-inf-z0)/cs)),j1=Math.min(H-1,Math.floor((s.z1+inf-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=x0+(i+0.5)*cs,cz=z0+(j+0.5)*cs;if(cx>s.x0-inf&&cx<s.x1+inf&&cz>s.z0-inf&&cz<s.z1+inf)g[j*W+i]=1;}}
  NAV.grid=g;
}
function navCheck(){let sig=0;for(let k=0;k<solids.length;k++)if(solids[k].active)sig+=(k+1)*(k+7);if(sig!==NAV.sig){NAV.sig=sig;navRebuild();}}
const cellOf=(x,z)=>[Math.floor((x-NAV.x0)/NAV.cs),Math.floor((z-NAV.z0)/NAV.cs)];
const freeCell=(i,j)=>i>=0&&j>=0&&i<NAV.W&&j<NAV.H&&NAV.grid[j*NAV.W+i]===0;
function blockedAt(x,z){const [i,j]=cellOf(x,z);return !freeCell(i,j);}
function los(a,b){const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(d/0.2);for(let k=1;k<n;k++){const t=k/n;if(blockedAt(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;}
function nearestFree(i,j){if(freeCell(i,j))return [i,j];for(let r=1;r<10;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(freeCell(i+di,j+dj))return [i+di,j+dj];}return [i,j];}
const cellPt=(i,j)=>V3(NAV.x0+(i+0.5)*NAV.cs,0,NAV.z0+(j+0.5)*NAV.cs);
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
const AS={N:0,gs:null,came:null,stamp:null,shut:null,gen:0,hf:null,hn:null,hl:0,cache:new Map()};
function asInit(N){AS.N=N;AS.gs=new Float32Array(N);AS.came=new Int32Array(N);AS.stamp=new Uint32Array(N);AS.shut=new Uint32Array(N);const H=Math.max(N*4,200016);AS.hf=new Float32Array(H);AS.hn=new Int32Array(H);}
function hPush(f,n){if(AS.hl>=AS.hf.length)return;let k=AS.hl++;while(k>0){const p=(k-1)>>1;if(AS.hf[p]<=f)break;AS.hf[k]=AS.hf[p];AS.hn[k]=AS.hn[p];k=p;}AS.hf[k]=f;AS.hn[k]=n;}
function hPop(){const top=AS.hn[0],l=--AS.hl;if(l>0){const f=AS.hf[l],n=AS.hn[l];let k=0;for(;;){let c=2*k+1;if(c>=l)break;if(c+1<l&&AS.hf[c+1]<AS.hf[c])c++;if(AS.hf[c]>=f)break;AS.hf[k]=AS.hf[c];AS.hn[k]=AS.hn[c];k=c;}AS.hf[k]=f;AS.hn[k]=n;}return top;}
function aStar(si,sj,gi,gj){
  const W=NAV.W,N=W*NAV.H;if(AS.N!==N)asInit(N);
  const ck=NAV.sig+':'+(sj*W+si)+':'+(gj*W+gi),hit=AS.cache.get(ck);if(hit!==undefined){AS.cache.delete(ck);AS.cache.set(ck,hit);return hit;}
  const start=sj*W+si,goal=gj*W+gi,gen=++AS.gen,gs=AS.gs,came=AS.came,st=AS.stamp,shut=AS.shut;
  const hx=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return Math.max(dx,dz)+0.414*Math.min(dx,dz);};
  AS.hl=0;st[start]=gen;gs[start]=0;came[start]=-1;hPush(hx(si,sj),start);let found=false,iter=0;
  while(AS.hl&&iter++<25000){
    const n=hPop();if(shut[n]===gen)continue;shut[n]=gen;if(n===goal){found=true;break;}
    const i=n%W,j=(n/W)|0,gn=gs[n];
    for(let d=0;d<8;d++){const D=DIRS[d],di=D[0],dj=D[1],ni=i+di,nj=j+dj;if(!freeCell(ni,nj))continue;if(di&&dj&&(!freeCell(i+di,j)||!freeCell(i,j+dj)))continue;
      const m=nj*W+ni;if(shut[m]===gen)continue;const ng=gn+D[2];if(st[m]!==gen||ng<gs[m]){st[m]=gen;gs[m]=ng;came[m]=n;hPush(ng+hx(ni,nj),m);}}
  }
  let cells=null;
  if(found){cells=[];for(let n=goal;n!==-1;n=came[n]){cells.push(n);if(n===start)break;}cells.reverse();}
  AS.cache.set(ck,cells);if(AS.cache.size>400)AS.cache.delete(AS.cache.keys().next().value);return cells;
}
function route(a,b){
  navCheck();
  const A=V3(a.x,0,a.z),B=V3(b.x,0,b.z);
  if(los(A,B))return [B];
  const W=NAV.W;
  const [si,sj]=nearestFree(...cellOf(A.x,A.z)),[gi,gj]=nearestFree(...cellOf(B.x,B.z));
  const ids=aStar(si,sj,gi,gj);
  if(!ids)return [B];
  const cells=ids.map(n=>cellPt(n%W,(n/W)|0));
  const out=[];let cur=A,k=0;
  while(k<cells.length){let j=cells.length-1;while(j>k&&!los(cur,cells[j]))j--;out.push(cells[j]);cur=cells[j];k=j+1;}
  out.push(B);return out;
}

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

/* ---------- input ---------- */
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;initAudio();});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
const joyEl=document.getElementById('joy'),knob=document.getElementById('knob'),hint=document.getElementById('hint');
const joy={active:false,id:null,ox:0,oy:0,dx:0,dy:0};
const pinch={pts:new Map(),d0:0,z0:1};
function joyHome(){const m=GFX.joy||'float';if(m==='float')return null;return {x:m==='left'?90:innerWidth-90,y:innerHeight-120};}
function showFixedJoy(){const h=joyHome();if(h){joyEl.style.left=h.x+'px';joyEl.style.top=h.y+'px';joyEl.style.display='block';joyEl.style.opacity=0.55;}else if(!joy.active)joyEl.style.display='none';}
const TAP={id:null,x:0,y:0,t:0,far:false,multi:false};
canvas.addEventListener('pointerdown',e=>{if(pinch.pts.size===0){TAP.id=e.pointerId;TAP.x=e.clientX;TAP.y=e.clientY;TAP.t=performance.now();TAP.far=false;TAP.multi=false;}else TAP.multi=true;
  pinch.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch.pts.size===2){const [a,b]=[...pinch.pts.values()];pinch.d0=Math.hypot(a.x-b.x,a.y-b.y)||1;pinch.z0=userZoom;joy.active=false;joy.dx=joy.dy=0;showFixedJoy();return;}
  if(pinch.pts.size>2)return;
  initAudio();joy.active=true;joy.id=e.pointerId;const hm=joyHome();joy.ox=hm?hm.x:e.clientX;joy.oy=hm?hm.y:e.clientY;joy.dx=joy.dy=0;joyEl.style.opacity=1;
  joyEl.style.left=joy.ox+'px';joyEl.style.top=joy.oy+'px';joyEl.style.display='block';knob.style.transform='';try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===TAP.id&&Math.hypot(e.clientX-TAP.x,e.clientY-TAP.y)>12)TAP.far=true;if(pinch.pts.has(e.pointerId))pinch.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch.pts.size===2){const [a,b]=[...pinch.pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y)||1;userZoom=Math.max(0.65,Math.min(1.6,pinch.z0*pinch.d0/d));return;}
  if(!joy.active||e.pointerId!==joy.id)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),R=48;if(d>R){dx*=R/d;dy*=R/d;}
  joy.dx=dx/R;joy.dy=dy/R;knob.style.transform=`translate(${dx}px,${dy}px)`;});
const endJoy=e=>{if(e.type==='pointerup'&&e.pointerId===TAP.id&&!TAP.far&&!TAP.multi&&performance.now()-TAP.t<260)tapWalk(e.clientX,e.clientY);if(e.pointerId===TAP.id)TAP.id=null;pinch.pts.delete(e.pointerId);if(e.pointerId!==joy.id)return;joy.active=false;joy.dx=joy.dy=0;joyEl.style.display='none';knob.style.transform='';showFixedJoy();};
canvas.addEventListener('wheel',e=>{userZoom=Math.max(0.65,Math.min(1.6,userZoom*(e.deltaY>0?1.08:0.93)));},{passive:true});
canvas.addEventListener('pointerup',endJoy);canvas.addEventListener('pointercancel',endJoy);
let hinted=false;
const tapPath=[],TRC=new THREE.Raycaster(),TNDC=new THREE.Vector2(),TPL=new THREE.Plane(new THREE.Vector3(0,1,0),0),TPT=new THREE.Vector3();let tapT=0;
const tapMark=new THREE.Mesh(new THREE.RingGeometry(0.32,0.5,28),new THREE.MeshBasicMaterial({color:0xffc93c,transparent:true,opacity:0.9,depthWrite:false}));
tapMark.rotation.x=-Math.PI/2;tapMark.visible=false;tapMark.renderOrder=3;tapMark.userData.live=1;scene.add(tapMark);
function tapWalk(cx,cy){if(!GFX.tap||pRide.path.length)return;const r=canvas.getBoundingClientRect();TNDC.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);
  TRC.setFromCamera(TNDC,camera);const fy=floorY(player.position.x);TPL.constant=-fy;if(!TRC.ray.intersectPlane(TPL,TPT))return;
  if(fy){TPT.x=Math.max(58.4,Math.min(119.6,TPT.x));TPT.z=Math.max(-13.8,Math.min(-0.3,TPT.z));}else{TPT.x=Math.max(-20.3,Math.min(46,TPT.x));TPT.z=Math.max(-13.8,Math.min(15.5,TPT.z));}
  tapPath.length=0;tapPath.push(...route(player.position,TPT));tapT=0;tapMark.position.set(TPT.x,fy+0.14,TPT.z);tapMark.visible=true;tapMark.scale.setScalar(1.4);
  if(!hinted){hinted=true;hint.style.opacity=0;}initAudio();}

/* ---------- sound ---------- */
let AC=null,soundOn=true;const lastB={};
/* Audio unlock that works on Android and iPhone: any tap / click / key (not only on the 3D view) starts or
   resumes audio; a 1-sample silent buffer fully unlocks iOS; 'interrupted' (iOS after a call/app switch)
   is resumed too; and on iOS 17+ audio plays with the ringer switch on silent, like a game app. */
let audioUnlocked=false;
function initAudio(){try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';}catch(_){}
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();musicInit();}catch(_){return;}}
  if(AC.state!=='running'){const p=AC.resume&&AC.resume();if(p&&p.catch)p.catch(()=>{});}
  if(!audioUnlocked){try{const b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);audioUnlocked=true;}catch(_){}}}
['pointerdown','pointerup','touchend','click','keydown'].forEach(ev=>addEventListener(ev,()=>{if(!AC||AC.state!=='running')initAudio();},{capture:true,passive:true}));
function blip(f=600,d=0.06,type='triangle',vol=0.07){if(!soundOn||!AC)return;const k=f|0,now=AC.currentTime;if(lastB[k]&&now-lastB[k]<0.045)return;lastB[k]=now;
  const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(0.0001,now+d);o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+d+0.02);}
function chord(){if(!soundOn||!AC)return;[523,659,784,1046].forEach((f,i)=>setTimeout(()=>blip(f,0.18,'sine',0.07),i*70));}
const sndBtn=document.getElementById('snd');sndBtn.onclick=()=>{soundOn=!soundOn;sndBtn.textContent=soundOn?'🔊 音效：开':'🔇 音效：关';saveSettings();};
const rstBtn=document.getElementById('rst');let rstArm=0,resetting=false;
rstBtn.onclick=()=>{if(Date.now()-rstArm<2500){try{localStorage.removeItem(KEY);localStorage.removeItem(KEY1);}catch(_){}resetting=true;location.reload();}else{rstArm=Date.now();rstBtn.textContent='⚠️ 再点一次确认重开';setTimeout(()=>rstBtn.textContent='↺ 重新开始（清空本机进度）',2500);}};

/* ---------- HUD ---------- */
const mval=document.getElementById('mval'),mpill=document.getElementById('money'),pval=document.getElementById('pval'),toastEl=document.getElementById('toast');
let shownMoney=-1,toastTimer=0,shownProg='',hudT=0,pulseAt=0;const RMOT=matchMedia('(prefers-reduced-motion: reduce)');
const fmtMoney=v=>v>=1e7?(v/1e6).toFixed(1)+'M':v>=1e6?(v/1e6).toFixed(2)+'M':String(v).replace(/\B(?=(\d{3})+(?!\d))/g,',');
function toast(t,ms=1600){toastEl.textContent=L(t);toastEl.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('on'),ms);}
function updHud(){const now=performance.now();if(now-hudT<90)return;hudT=now;
  const m=Math.floor(money+1e-6);if(m!==shownMoney){if(m>shownMoney&&shownMoney>=0&&now-pulseAt>320&&!RMOT.matches&&mpill.animate){pulseAt=now;mpill.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});}shownMoney=m;mval.textContent=fmtMoney(m);}
  const pr=(f2Open?(floorOf(player.position.x)===2?'2F · ':'1F · '):'')+pads.reduce((s,p)=>s+p.lvl,0)+'/'+TOTAL_STEPS;if(pr!==shownProg){shownProg=pr;pval.textContent=pr;}}

/* ---------- save / load ---------- */
let money=20;
function binKeys(){const o={};for(const t in producers)o['p:'+t]=producers[t];for(const t in shelves)o['s:'+t]=shelves[t];for(const t in machines){o['mi:'+t]=machines[t].inp;o['mo:'+t]=machines[t].out;}for(const t in pallets)o['pl:'+t]=pallets[t];return o;}
function saveObj(){const ach=ACH_STATE,vipS=vipState;const counts={};const bk=binKeys();for(const k in bk)counts[k]=bk[k].count;
  return ({savedAt:Date.now(),money,banks:checkouts.map(co=>co.stack.reduce((a,b)=>a+b,0)),pads:pads.map(p=>({id:p.id,lvl:p.lvl,paid:p.paid})),counts,fhBank:fhPile.stack.reduce((a,b)=>a+b,0),day:{t:dayT,n:dayN},stats,daily,story,ach,vip:vipS,decor,legacy,stLv,town,weekly,streak,v:SAVE_VER});}
const progressNow=()=>pads.reduce((s,p)=>s+p.lvl,0);
const SAVE_VER=2;let bakAt=0;
/* every 5 minutes the previous save is kept as a backup, used if the main save is ever unreadable */
function save(){if(resetting||NET.mode==='guest')return;try{if(Date.now()-bakAt>300000){const prev=localStorage.getItem(KEY);if(prev)localStorage.setItem(KEY+'-bak',prev);bakAt=Date.now();}
  localStorage.setItem(KEY,JSON.stringify(saveObj()));}catch(_){}cloudSoon();}
/* upgrades old save formats step by step; add a case here whenever the format changes */
function migrate(s){if(!s||typeof s!=='object')return null;const v=s.v|0;if(v<2){s.legacy=s.legacy||{n:0};s.v=2;}return s;}
function load(){
  unlockProducer('tomato');unlockShelf('tomato');unlockCheckout(0);producers.tomato.count=3;
  if(NET.mode==='guest'){const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();return;}
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(_){}if(!s){try{s=JSON.parse(localStorage.getItem(KEY+'-bak'));if(s)setTimeout(()=>toast(TT('已从备份恢复进度','Progress restored from backup','Kemajuan dipulihkan daripada sandaran'),2600),2000);}catch(_){}}
  if(!s){try{const o=JSON.parse(localStorage.getItem(KEY1));if(o){s={money:o.money,pads:o.pads,banks:[o.bank||0],counts:{}};
    ['tomato','egg','milk'].forEach((t,i)=>{if(o.prod)s.counts['p:'+t]=o.prod[i];if(o.shelf)s.counts['s:'+t]=o.shelf[i];});}}catch(_){}}
  s=migrate(s);if(s){money=+s.money||0;if(s.legacy)Object.assign(legacy,s.legacy);if(!legacy.perks)legacy.perks={};
    (s.pads||[]).forEach(ps=>{const p=padById[ps.id];if(!p)return;p.lvl=Math.min(ps.lvl|0,p.costs.length);p.paid=Math.min(+ps.paid||0,p.lvl<p.costs.length?padCost(p)-1:0);p.done=p.lvl>=p.costs.length;
      if(p.id==='helpers'||p.id==='staff2')for(let i=0;i<p.lvl;i++)applyPad(p,false);else if(p.lvl>0&&p.costs.length===1)applyPad(p,false);});
    const bk=binKeys();for(const k in (s.counts||{}))if(bk[k])bk[k].count=Math.max(0,Math.min(bk[k].max,s.counts[k]|0));
    (s.banks||[]).forEach((v,i)=>{const co=checkouts[i];if(!co||!(v>0))return;const n=Math.min(60,Math.ceil(v/5));for(let j=0;j<n;j++)co.stack.push(v/n);});
    if(s.fhBank>0){const n=Math.min(60,Math.ceil(s.fhBank/5));for(let j=0;j<n;j++)fhPile.stack.push(s.fhBank/n);fhPile.refresh();}
    if(s.day){dayT=+s.day.t||0.04;dayN=+s.day.n||1;}
    if(s.stats)Object.assign(stats,s.stats);
    if(s.daily&&s.daily.goals)Object.assign(daily,s.daily);
    if(s.story)Object.assign(story,s.story);
    if(s.ach)Object.assign(ACH_STATE,s.ach);if(s.vip)Object.assign(vipState,s.vip);if(s.decor)Object.assign(decor,s.decor);
    if(s.stLv)Object.assign(stLv,s.stLv);if(s.town)Object.assign(town,s.town);if(s.weekly)Object.assign(weekly,s.weekly);if(s.streak)Object.assign(streak,s.streak);
    if(story.done&&story.ch<STORY.length){story.done=false;story.base=JSON.parse(JSON.stringify(stats));story.reopen=1;}
    hinted=true;hint.style.opacity=0;offlineFrom=+s.savedAt||0;if(s.legacy)Object.assign(legacy,s.legacy);}
  const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();
}

/* ---------- day & night ---------- */
const DAY_LEN=240;let dayT=0.04,dayN=1,wasNight=false,DAYK=-1;
const dayBg=new THREE.Color(0x8fd96b),nightBg=new THREE.Color(0x1b2a44),tmpC=new THREE.Color();
function hourOf(t){return (6+t*24)%24;}
function lightK(h){if(h>=7&&h<18)return 1;if(h>=18&&h<20)return 1-(h-18)/2;if(h>=20||h<4.5)return 0;return Math.min(1,(h-4.5)/2.5);}
function isNight(){return lightK(hourOf(dayT))<0.35;}
const RUSH={t:0,last:null};
function updDay(dt){
  if(NET.mode!=='guest'){dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;newDay();}
    const hh=hourOf(dayT);if(RUSH.last===null)RUSH.last=hh;   // first frame after loading: no false rush
    if(lines().length>=2&&((RUSH.last<12&&hh>=12&&hh<14)||(RUSH.last<18&&hh>=18&&hh<20))){RUSH.t=20;toast('🔥 '+(hh<15?TT('午间高峰！','Lunch rush!','Waktu puncak tengah hari!'):TT('晚高峰！','Dinner rush!','Waktu puncak malam!'))+' '+TT('客人一下子涌进来，小费 ×1.5','Shoppers pour in, tips ×1.5','Pelanggan berpusu-pusu masuk, tip ×1.5'),2600);blip(990,0.12,'sine',0.06);}
    RUSH.last=hh;if(RUSH.t>0)RUSH.t-=dt;}
  const k=Math.round(lightK(hourOf(dayT))*(isRaining()?0.72:1)*400)/400;
  if(k!==DAYK){DAYK=k;
  hemi.intensity=0.3+0.55*k;hemi.color.setRGB(0.72+0.28*k,0.78+0.22*k,1);sun.intensity=0.06+0.49*k;sun.color.setRGB(1,0.82+0.18*k,0.65+0.35*k);
  tmpC.copy(nightBg).lerp(dayBg,k);scene.background.copy(tmpC);scene.fog.color.copy(tmpC);
  lampMat.emissiveIntensity=(1-k)*1.3;winMat.emissiveIntensity=(1-k)*0.9;
  for(const m of litFloors()){m.emissive.setHex(0xffeccc);m.emissiveIntensity=(1-k)*0.42;}}
  const n=k<0.35;if(n!==wasNight){wasNight=n;if(T>2)toast(n?'🌙 天黑了：客人少一些，但每人买得更多':'☀️ 天亮了',2200);}
}
let LITF=null;const litFloors=()=>LITF||(LITF=[westFloorMat,eastFloorMat,wingFloorMat,fhFloorM,M(0xebe6f3),M(0xfbdab7),M(0xdbe9f7),M(0xf6f2fb),...shelfMats,SHELF_VC]);
function clockText(){const h=hourOf(dayT),hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return (RUSH.t>0?'🔥':isNight()?'🌙':'☀️')+' '+TT('第'+dayN+'天 ','Day '+dayN+' ','Hari '+dayN+' ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');}

/* ---------- stats, daily goals, story ---------- */
const stats={sold:{},served:0,diners:0,earned:0,night:0,rate:0};let offlineFrom=0;
const daily={goals:[],d:{sold:{},served:0,diners:0,earned:0},day:0};
function onSale(t,n){if(promo&&promo.type===t)stats.promoSold=(stats.promoSold||0)+n;if(curFest&&curFest.item===t)stats.fest=(stats.fest||0)+n;stats.sold[t]=(stats.sold[t]||0)+n;daily.d.sold[t]=(daily.d.sold[t]||0)+n;}
function onServed(earn,diner){if(diner){stats.diners++;daily.d.diners++;}else{stats.served++;daily.d.served++;}if(isNight())stats.night++;stats.earned+=earn;daily.d.earned+=earn;}
const GOAL_TXT={sell:g=>TT('卖出 '+g.n+' 个','Sell '+g.n+' ','Jual '+g.n+' ')+ITEM[g.t].e,served:g=>TT('服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers','Layan '+g.n+' pelanggan'),
  diners:g=>TT('招待 '+g.n+' 位食客','Serve '+g.n+' diners','Layan '+g.n+' pengunjung makan'),earn:g=>TT('赚到','Earn','Peroleh')+' 💵'+g.n,night:g=>TT('夜里服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers at night','Layan '+g.n+' pelanggan waktu malam'),
  pad:g=>TT('解锁「'+padById[g.id].name+'」','Unlock "'+L(padById[g.id].name)+'"','Buka "'+L(padById[g.id].name)+'"'),all:g=>L('建好全部设施'),
  town:g=>TT('建好','Build','Bina')+' '+(TOWN.find(t=>t.id===g.id)||{}).e+' '+(TOWN.find(t=>t.id===g.id)||{}).n,
  stars:g=>TT('店里升星到 '+g.n+' 颗','Reach '+g.n+' upgrade stars in this shop','Capai '+g.n+' bintang naik taraf di kedai ini'),
  rating:g=>TT('拿到 '+g.n+' 次三星好评','Get '+g.n+' three-star days','Dapat '+g.n+' hari tiga bintang'),
  branch:g=>TT('开一家分店','Open a branch','Buka cawangan')};
function genDaily(){const ls=lines(),L=Math.max(1,ls.length);const g=[];
  if(ls.length){const t=ls[(Math.random()*ls.length)|0];g.push({k:'sell',t,n:Math.max(4,Math.round(90/ITEM[t].price))+L});}
  g.push(fhOpen&&Math.random()<0.5?{k:'diners',n:6+stallsOpen().length*3}:{k:'served',n:8+L*3});
  g.push({k:'earn',n:Math.round((120+L*110)/10)*10});
  const rw=Math.round((50+L*40)*rewardMul()/10)*10;daily.goals=g.map(x=>({...x,done:false,reward:rw}));daily.d={sold:{},served:0,diners:0,earned:0};daily.day=dayN;}
function dailyProg(g){const d=daily.d;return g.k==='sell'?(d.sold[g.t]||0):g.k==='served'?d.served:g.k==='diners'?d.diners:d.earned;}
function newDay(){rateDay();genDaily();toast(TT('☀️ 第'+dayN+'天开始，今日目标更新啦','☀️ Day '+dayN+' begins — new daily goals!','☀️ Hari '+dayN+' bermula — matlamat harian baharu!'),2400);}
const GRANNY=['👵','阿婆'],MAYOR=['🧑‍💼','镇长'],MEI=['👧','小美'];
const STORY=[
 {t:'回到小镇',who:GRANNY,intro:['你终于回来啦！小时候你最爱在这片番茄地里跑。','阿婆年纪大了，这间小菜摊就交给你吧。','去地里摘番茄摆上货架，再到收银台给客人结账。跟着黄色箭头走就行。'],goals:[{k:'sell',t:'tomato',n:12}],reward:60,outro:'做得真好！客人都夸番茄新鲜。'},
 {t:'清晨的鸡蛋',who:GRANNY,intro:['一大早来买菜的客人，总会问有没有鸡蛋。','我们也养几只母鸡吧，再摆个鸡蛋货架。'],goals:[{k:'pad',id:'eggFarm'},{k:'pad',id:'eggShelf'},{k:'sell',t:'egg',n:10}],reward:120,outro:'鸡蛋一摆出来就卖光了，母鸡们也很开心。'},
 {t:'请个帮手',who:MAYOR,intro:['你好，我是镇长！听说老菜摊重新开张，镇上的人都很高兴。','客人越来越多，一个人收银忙不过来吧？请个收银员试试。'],goals:[{k:'pad',id:'cashier'},{k:'served',n:25}],reward:200,outro:'有了收银员，排队的人少多了。'},
 {t:'小美的牛奶',who:MEI,intro:['店长店长！我每天早上都要喝一杯牛奶。','店里能卖牛奶吗？我可以天天来买！'],goals:[{k:'pad',id:'cowFarm'},{k:'pad',id:'milkShelf'},{k:'sell',t:'milk',n:10}],reward:250,outro:'太好喝啦！我要告诉班上所有同学。'},
 {t:'一起搬货',who:GRANNY,intro:['货架多了，一个人跑来跑去太累啦。','请个搬运工帮忙，再种点胡萝卜，炖汤最香。'],goals:[{k:'pad',id:'helper'},{k:'pad',id:'carrotShelf'}],reward:300,outro:'搬运工干活真麻利，阿婆放心多了。'},
 {t:'扩建店面',who:MAYOR,intro:['镇上的面包店关门了，大家都很想念刚出炉的面包。','把店面扩大一点，自己种麦子烤面包怎么样？'],goals:[{k:'pad',id:'expand'},{k:'pad',id:'breadShelf'},{k:'sell',t:'bread',n:12}],reward:500,outro:'整条街都飘着面包香，大家都来排队了！'},
 {t:'集市日',who:MAYOR,intro:['这个周末是小镇集市日，全镇的人都会来逛。','多开一个收银台，好好赚一笔吧！'],goals:[{k:'pad',id:'checkout2'},{k:'earn',n:3000}],reward:800,outro:'集市日大成功！你的店成了全镇最热闹的地方。'},
 {t:'什么都有的百货区',who:MEI,intro:['店长，我想买零食和冰淇淋，还要帮妈妈买纸巾！','要是店里什么都能买到就好了……'],goals:[{k:'pad',id:'wing'},{k:'pad',id:'depot'},{k:'pad',id:'sh_soda'},{k:'pad',id:'sh_cookies'}],reward:1200,outro:'哇，汽水和饼干！以后放学我都来这里。'},
 {t:'夜市灯火',who:GRANNY,intro:['以前镇上一到晚上就黑漆漆的。','现在路灯亮了，晚上也有人出来逛。晚上的客人虽然少，买得可多啦。'],goals:[{k:'night',n:25}],reward:1500,outro:'看着一家家人晚上来买东西，阿婆心里暖暖的。'},
 {t:'登上二楼',who:MAYOR,intro:['隔壁那栋楼空了好久，楼上正好租给你。','装个扶梯，开个卖衣服、图书和玩具的生活馆吧！'],goals:[{k:'pad',id:'floor2'},{k:'pad',id:'elevator'},{k:'pad',id:'sh2_tshirt'},{k:'sell',t:'tshirt',n:8}],reward:2500,outro:'二楼开张那天，镇上的人都坐着扶梯上去看新鲜。'},
 {t:'美食广场',who:MEI,intro:['逛街逛饿了怎么办？','店长，在二楼开个美食广场吧！我想吃汉堡！'],goals:[{k:'pad',id:'foodhall'},{k:'pad',id:'stallBurger'},{k:'diners',n:15}],reward:4000,outro:'汉堡真好吃！美食广场每天都坐满了人。'},
 {t:'小镇之光',who:GRANNY,intro:['谁能想到，当年的小菜摊能变成今天的样子。','把剩下的设施都建好吧，让小镇鲜市成为全镇的骄傲！'],goals:[{k:'all'}],reward:10000,outro:'你做到了！小镇鲜市成了全镇的骄傲。谢谢你回来，孩子。'},
 {t:TT('镇长的请求','The mayor\'s request','Permintaan datuk bandar'),who:MAYOR,intro:[TT('店这么热闹，镇上却连个散步的地方都没有。','The shop is buzzing, but the town has nowhere to take a walk.','Kedai sangat meriah, tetapi pekan tiada tempat untuk bersiar.'),TT('给货架和田地升升星，再帮我们建个公园吧！','Add some stars to your shelves and fields, then help us build a park!','Naik taraf rak dan ladang anda, kemudian bantu kami membina taman!')],goals:[{k:'stars',n:15},{k:'town',id:'park'}],reward:20000,outro:TT('公园开放了，周末全家人都来逛街买菜。','The park is open, and families come shopping every weekend.','Taman dibuka, keluarga datang membeli-belah setiap hujung minggu.')},
 {t:TT('小美的学校','Mei\'s school','Sekolah Mei'),who:MEI,intro:[TT('店长！我们学校太旧了，下雨天还漏水……','Boss! Our school is so old the roof leaks when it rains…','Bos! Sekolah kami sangat lama, bumbung bocor bila hujan…'),TT('要是能盖新学校，同学们放学都来你这里买零食！','If we get a new school, everyone will buy snacks here after class!','Kalau ada sekolah baharu, semua murid akan membeli snek di sini selepas sekolah!')],goals:[{k:'town',id:'school'},{k:'sell',t:'cookies',n:60}],reward:30000,outro:TT('新学校好漂亮！饼干一下子就卖光了。','The new school is beautiful! The cookies sold out right away.','Sekolah baharu sangat cantik! Biskut habis dijual serta-merta.')},
 {t:TT('照顾老街坊','Caring for neighbours','Menjaga jiran'),who:GRANNY,intro:[TT('镇上的老人家看病要坐很久的车。','The town\'s elders ride a long way to see a doctor.','Warga emas di pekan ini terpaksa pergi jauh untuk berjumpa doktor.'),TT('建个诊所吧。也要把店打理好，让每位客人都满意。','Let\'s build a clinic, and run the shop so well that every shopper leaves happy.','Mari bina klinik, dan uruskan kedai dengan baik supaya setiap pelanggan berpuas hati.')],goals:[{k:'town',id:'clinic'},{k:'rating',n:3}],reward:40000,outro:TT('老街坊们都说，这是全镇最贴心的店。','The neighbours say this is the kindest shop in town.','Jiran-jiran kata ini kedai paling prihatin di pekan.')},
 {t:TT('远方的客人','Visitors from afar','Pelawat dari jauh'),who:MAYOR,intro:[TT('越来越多外地人听说了小镇鲜市。','More and more people from other towns have heard of Tiny Fresh Market.','Semakin ramai orang dari pekan lain mengenali Pasar Segar Pekan.'),TT('建个公交站，再立一座钟楼，让小镇成为大家想来的地方！','Build a bus stop and a clock tower, and make this a town people want to visit!','Bina hentian bas dan menara jam, jadikan pekan ini tempat yang orang mahu lawati!')],goals:[{k:'town',id:'busstop'},{k:'town',id:'tower'}],reward:80000,outro:TT('钟声响起的那天，整条街都挤满了游客。','The day the bell first rang, the whole street was full of visitors.','Hari loceng pertama berbunyi, seluruh jalan penuh dengan pelawat.')},
 {t:TT('新的小镇','A new town','Pekan baharu'),who:GRANNY,intro:[TT('孩子，这里已经很好了。别的小镇也需要一间这样的店。','This town is in good hands now. Other towns need a shop like this too.','Pekan ini sudah berada di tangan yang baik. Pekan lain juga memerlukan kedai seperti ini.'),TT('去开一家分店吧，阿婆会一直为你骄傲。','Go and open a branch. Granny will always be proud of you.','Pergilah buka cawangan. Nenek akan sentiasa bangga dengan anda.')],goals:[{k:'branch'}],reward:30000,outro:TT('新的小镇，新的故事。谢谢你，店长。','A new town, a new story. Thank you, boss.','Pekan baharu, cerita baharu. Terima kasih, bos.')},
];
const story={mode:null,on:false,ch:0,base:null,done:false};
const statsCopy=()=>JSON.parse(JSON.stringify(stats));
function storyProg(g){const b=story.base||stats;
  switch(g.k){case 'sell':return [(stats.sold[g.t]||0)-(b.sold[g.t]||0),g.n];case 'served':return [stats.served-b.served,g.n];case 'diners':return [stats.diners-b.diners,g.n];
    case 'earn':return [stats.earned-b.earned,g.n];case 'night':return [stats.night-(b.night||0),g.n];case 'pad':return [padById[g.id].lvl>0?1:0,1];case 'all':return [pads.filter(p=>p.done).length,pads.length];
    case 'town':return [hasT(g.id)?1:0,1];case 'stars':return [totalStars(),g.n];case 'rating':return [(stats.day3||0)-(b.day3||0),g.n];case 'branch':return [(legacy.n||0)>0?1:0,1];}return [0,1];}
function checkGoals(){
  if(NET.mode==='guest')return;
  for(const g of daily.goals){if(!g.done&&dailyProg(g)>=g.n){g.done=true;money+=g.reward;toast('📋 今日目标完成！+💵'+g.reward,2200);chord();}}
  if(story.on&&!story.done){const C=STORY[story.ch];
    if(C&&C.goals.every(g=>{const [a,b]=storyProg(g);return a>=b;})){money+=C.reward;say(C.who,[C.outro+'（奖励 💵'+C.reward+'）']);story.ch++;story.base=statsCopy();
      if(story.ch>=STORY.length){story.done=true;say(GRANNY,['🎉 故事完成！之后你可以继续自由经营，每天都有新的今日目标。']);}else startChapter();chord();save();}}
}
const dlg=document.getElementById('dlg'),dlgFace=document.getElementById('dlgFace'),dlgWho=document.getElementById('dlgWho'),dlgTxt=document.getElementById('dlgTxt');const dlgQ=[];
function say(who,lines){for(const l of lines)dlgQ.push({face:who[0],who:L(who[1]),t:L(l)});if(dlg.hidden)nextLine();}
function nextLine(){const d=dlgQ.shift();if(!d){dlg.hidden=true;return;}dlg.hidden=false;hint.style.opacity=0;dlgFace.textContent=d.face;dlgWho.textContent=d.who;dlgTxt.textContent=d.t;}
document.getElementById('dlgNext').onclick=nextLine;
const chTitle=(n,t)=>'📖 '+TT('第'+n+'章','Chapter '+n,'Bab '+n)+' · '+L(t);
function startChapter(){const C=STORY[story.ch];say(C.who,[chTitle(story.ch+1,C.t),...C.intro]);}
const menuEl=document.getElementById('menu'),mStory=document.getElementById('mStory');
function showMenu(){if(NET.mode==='guest'){toast('联机时由房主决定玩法');return;}
  mStory.firstChild.nodeValue=story.mode==='story'&&!story.done&&story.base?'📖 '+TT('继续故事（第'+(story.ch+1)+'章）','Continue story (Chapter '+(story.ch+1)+')','Sambung cerita (Bab '+(story.ch+1)+')'):L('📖 故事模式');menuEl.hidden=false;}
mStory.onclick=()=>{menuEl.hidden=true;story.mode='story';story.on=true;
  if(!story.base){let ch=0;for(let i=STORY.length-1;i>=0;i--){const pg=STORY[i].goals.filter(g=>g.k==='pad');if(pg.length&&pg.every(g=>padById[g.id].lvl>0)){ch=i+1;break;}}
    story.ch=Math.min(ch,STORY.length-1);story.base=statsCopy();}
  if(story.done)say(GRANNY,['故事已经完成啦，谢谢你！继续好好经营吧。']);else startChapter();renderCard();save();};
document.getElementById('mFree').onclick=()=>{menuEl.hidden=true;story.mode='free';story.on=false;renderCard();save();};
document.getElementById('storyBtn').onclick=showMenu;
document.getElementById('saveBtn').onclick=()=>{if(NET.mode==='guest'){toast('联机时进度保存在房主那边');return;}save();toast('💾 已保存');blip(700,0.08,'sine',0.06);};
const cardEl=document.getElementById('card'),stockBox=document.getElementById('stockBox'),clockEl=document.getElementById('clock'),cardBd=document.getElementById('cardBd'),cardTg=document.getElementById('cardTg'),storyBox=document.getElementById('storyBox'),dailyBox=document.getElementById('dailyBox');
let cardOpen=innerWidth>=520;try{const v=localStorage.getItem('fm-card');if(v)cardOpen=v!=='0';}catch(_){}
document.getElementById('cardHd').onclick=()=>{cardOpen=!cardOpen;try{localStorage.setItem('fm-card',cardOpen?'1':'0');}catch(_){}renderCard();};
function goalLine(txt,a,b,done){const v=Math.max(0,Math.min(a,b));return '<div class="goal'+(done?' ok':'')+'">'+txt+' <b>'+Math.floor(v)+'/'+b+'</b><div class="bar"><i style="width:'+Math.min(100,v/b*100)+'%"></i></div></div>';}
const boxHtml=new Map();
function setBox(el,h){if(boxHtml.get(el)===h)return;boxHtml.set(el,h);el.innerHTML=h;trDom(el);}
function setText(el,t){if(el.textContent!==t)el.textContent=t;}
function renderCard(){setText(clockEl,clockText());setText(cardTg,cardOpen?'▾':'▸');if(cardBd.hidden!==!cardOpen)cardBd.hidden=!cardOpen;cardEl.classList.toggle('open',cardOpen);if(!cardOpen)return;
  if(NET.mode==='guest'){setBox(storyBox,'');setBox(stockBox,stockHtml());setBox(dailyBox,orderHtml()+teamHtml()+'<div class="sec">'+L('👥 在朋友的店里帮忙')+'</div>');return;}
  let h='';if(story.on){if(story.done)h='<div class="sec">📖 故事完成 🎉</div>';else{const C=STORY[story.ch];h='<div class="sec">'+chTitle(story.ch+1,C.t)+'</div>'+C.goals.map(g=>{const [a,b]=storyProg(g);return goalLine(GOAL_TXT[g.k](g),a,b,a>=b);}).join('');}}
  setBox(storyBox,h);
  setBox(stockBox,stockHtml());
  setBox(dailyBox,farmHtml()+orderHtml()+teamHtml()+'<div class="sec">📋 今日目标'+(daily.goals[0]?'（每项 +💵'+daily.goals[0].reward+'）':'')+(dayRating(daily.d)?' <span class="stars" title="'+TT('今日评价','Today\'s rating','Penarafan hari ini')+'">'+starStr(dayRating(daily.d))+'</span>':'')+'</div>'+daily.goals.map(g=>goalLine(GOAL_TXT[g.k](g),g.done?g.n:dailyProg(g),g.n,g.done)).join(''));}
/* 🎮 play chooser + reminders */
const playEl=document.getElementById('play'),playBtnEl=document.getElementById('playBtn');
function renderPlay(){const fs=fStatus();document.getElementById('playK').textContent='⭐ '+kStarsTotal()+'/90';
  document.getElementById('playF').textContent=fs.ripe?TT(fs.ripe+' 块地可以收了',fs.ripe+' ready to harvest',fs.ripe+' sedia dituai'):fs.care?TT(fs.care+' 块地需要照顾',fs.care+' need care',fs.care+' perlu dijaga'):'Lv '+fSave().lvl;trDom(playEl);}
playBtnEl.onclick=()=>{if(NET.mode==='guest'){toast(TT('帮朋友看店时不能玩小游戏（房主可以）','Mini-games are for the shop owner during co-op','Permainan mini untuk pemilik kedai semasa main bersama'));return;}hubEl.hidden=true;renderPlay();playEl.hidden=false;};
document.getElementById('playClose').onclick=()=>{playEl.hidden=true;};
document.getElementById('goKitchen').onclick=openKitchen;document.getElementById('goFarm').onclick=openFarm;
function farmHtml(){if(NET.mode==='guest')return '';const s=fStatus();if(!s.ripe&&!s.care)return '';
  return '<div class="sec farmline" data-go="farm">🌱 '+(s.ripe?TT(s.ripe+' 块地可以收了',s.ripe+' plots ready to harvest',s.ripe+' petak sedia dituai'):TT(s.care+' 块地需要照顾',s.care+' plots need care',s.care+' petak perlu dijaga'))+' ›</div>';}
let cardT=0;function cardTick(dt){festUpdate(dt);eventsTick(dt);orderTick(dt);teamTick(dt);cardT-=dt;if(cardT<=0){cardT=0.5;checkGoals();checkWeekly();checkStreak();updBadge();dbgTick();farmTick(0.5);if(NET.mode!=='guest'){const fs=fStatus();playBtnEl.classList.toggle('dot',fs.ripe+fs.care>0);}checkAch();vipTick(0.5);scoreTick(0.5);rateTick(0.5);tipsTick();renderCard();}musicTick();}

load();
if(NET.mode!=='guest'){if(!daily.goals.length)genDaily();if(!story.mode)setTimeout(showMenu,400);else if(story.reopen&&story.on){delete story.reopen;setTimeout(startChapter,1400);}}
wasNight=isNight();
setInterval(()=>{if(!document.hidden)save();},4000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

/* ---------- main update ---------- */
let T=0,spawnT=2;
const camT=player.position.clone();
const pRide={g:player,path:[],rideLeg:-1,onTeleport:()=>{camT.copy(player.position);flash();}};let rideCool=0;
const fadeEl=document.createElement('div');fadeEl.style.cssText='position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4';document.body.appendChild(fadeEl);
function flash(){fadeEl.style.transition='none';fadeEl.style.opacity=0.85;requestAnimationFrame(()=>{fadeEl.style.transition='opacity .45s';fadeEl.style.opacity=0;});toast(floorOf(player.position.x)===2?'🛗 二楼 · 生活馆':'🛗 一楼 · 小镇鲜市');}
function update(dt){
  rideCool-=dt;localEmoTick();
  if(!pRide.path.length&&rideCool<=0&&f2Open){const pp=player.position;
    if(floorOf(pp.x)===1&&near(pp,UP_ENTRY,0.6))pRide.path=[UP_NODE];else if(floorOf(pp.x)===2&&near(pp,DN_ENTRY,0.6))pRide.path=[DN_NODE];}
  const riding=pRide.path.length>0;
  if(riding){followPath(pRide,0,dt);if(!pRide.path.length){rideCool=1.2;}}
  let ix=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0),iz=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0);
  if(joy.active){ix+=joy.dx;iz+=joy.dy;}
  let mag=Math.hypot(ix,iz);if(mag>1){ix/=mag;iz/=mag;mag=1;}
  if(mag>0.12||riding){tapPath.length=0;}
  else if(tapPath.length){tapT+=dt;const n=tapPath[0],dx=n.x-player.position.x,dz=n.z-player.position.z,d=Math.hypot(dx,dz);
    if(d<0.3){tapPath.shift();}else{ix=dx/d;iz=dz/d;mag=Math.min(1,d/0.6+0.35);}if(tapT>15)tapPath.length=0;}
  if(tapMark.visible){const k=tapMark.scale.x;tapMark.scale.setScalar(k+(1-k)*Math.min(1,dt*10));if(!tapPath.length)tapMark.visible=false;}
  const moving=mag>0.12&&!riding;if(moving||riding||tapPath.length||joy.active)PACE.idle=0;
  if(moving){const sp=speed()*mag;player.position.x+=ix/mag*sp*dt;player.position.z+=iz/mag*sp*dt;faceTo(player,Math.atan2(ix,iz),dt);
    if(!hinted){hinted=true;hint.style.opacity=0;}}
  if(!riding){collide(player.position,0.4);
    if(floorOf(player.position.x)===2){player.position.x=Math.max(58.4,Math.min(119.6,player.position.x));player.position.z=Math.max(-13.8,Math.min(-0.3,player.position.z));}
    else{player.position.x=Math.max(-20.3,Math.min(46,player.position.x));player.position.z=Math.max(-13.8,Math.min(15.5,player.position.z));}}
  animChar(pch,moving,T,pc.carry.length>0,riding);
  pc.sway+=((moving?mag:0)-pc.sway)*Math.min(1,dt*6);pc.layout();
  maxTag.s.visible=pc.total()>=cap();maxTag.s.position.set(0,0.95+pc.carry.length*0.42+0.45,0.52);
  rhyTick();
  if(NET.mode==='guest'){guestUpdate(dt);updSparks(dt);updTown(dt);updDay(dt);cardTick(dt);updEscalators(dt);updFx(dt);updGuide(dt);updCamera(dt);updHud();netTick(dt);return;}

  // production
  for(const k in producers){const pr=producers[k];if(!pr.unlocked||pr.count>=pr.max)continue;
    pr.t+=dt;if(pr.t>=pr.iv*boost()*Math.pow(BAL.stSpeed,stLv['p:'+k]||0)){pr.t=0;pr.count++;pr.refresh();pop(pr.slots[pr.count-1],0.1);}}
  for(const k in machines){const m=machines[k];if(!m.unlocked)continue;
    if(m.fh){m.sup=(m.sup||0)+dt;if(m.sup>5&&m.inp.count+m.inp.incoming<m.inp.max){m.sup=0;m.inp.count++;m.inp.refresh();}}
    const working=m.inp.count>0&&m.out.count<m.out.max;
    if(working){m.t+=dt;if(m.t>=m.time*boost()*Math.pow(BAL.stSpeed,stLv['m:'+k]||0)){m.t=0;m.inp.count--;m.inp.refresh();m.out.count++;m.out.refresh();pop(m.out.slots[m.out.count-1],0.1);m.freshAt=T;}}
    m.freshS.s.visible=!m.fh&&m.out.count>0&&T-m.freshAt<FRESH_S;
    m.body.scale.y=working?1+Math.sin(T*22)*0.03:1;if(m.chef){m.chef.armL.rotation.x=working?-1.2+Math.sin(T*14)*0.4:0;m.chef.armR.rotation.x=working?-1.2-Math.sin(T*14)*0.4:0;}m.glowMat.emissiveIntensity=working?0.7+Math.sin(T*8)*0.3:0;}

  for(const a of actors())actorInteract(a,dt);
  for(const co of checkouts){if(!co.unlocked)continue;
    const front=co.queue[0];
    if(front&&front.arrived){const meHere=!co.cashier&&!LOCAL.riding&&floorOf(player.position.x)===co.floor&&near(player.position,co.reg,1.2);
      const staffed=co.cashier||meHere||actors().some(a=>near(a.g.position,co.reg,1.2));
      if(staffed){co.checkT+=dt;if(meHere){rhyShow();if(RHY.hit!=null){const q=RHY.hit;RHY.hit=null;co.checkT=0;checkout(co,front,q);}else if(co.checkT>1.2){co.checkT=0;checkout(co,front,0);}}
        else if(co.checkT>(co.cashier?0.85:0.5)){co.checkT=0;checkout(co,front);}}else co.checkT=0;}
    if(co.cashier)co.cashier.armL.rotation.x=front&&front.arrived?-1+Math.sin(T*16)*0.3:0;
    co.ring.material.opacity=0.55+Math.sin(T*5)*0.25;
  }
  for(const p of pads){if(p.dirty&&p.visible&&T-(p.drawT||-9)>0.08){drawPad(p);p.dirty=false;p.drawT=T;}if(p.visible){const ok=money>=padCost(p)-p.paid;p.mesh.scale.setScalar(ok?1+Math.sin(T*5)*0.04:1);}}
  updPromo(dt);updDay(dt);cardTick(dt);

  // customers
  const ls=lines().length;spawnT+=dt;
  const active=customers.filter(c=>c.state!=='leave').length;
  const interval=Math.max(0.55,3.4-0.25*ls-0.3*adsLvl())*(promo?0.7:1)*(isNight()?1.6:1)*(curFest?0.75:1)*(isRaining()?1.25:1)*(TW()===1?0.9:1)*(hasT('park')?0.88:1)*(RUSH.t>0?0.35:1);
  const parkCap=(hasT('park')?3:0)+(RUSH.t>0?6:0);
  if(ls&&spawnT>interval&&active<Math.min(24+parkCap,2+2*ls+2*adsLvl()+parkCap)){spawnT=0;spawnCustomer();}
  updCustomers(dt);updHelpers(dt);updSparks(dt);updTown(dt);updTruck(dt);updElevator(dt);updEscalators(dt);updFx(dt);

  remoteUpdate(dt);updGuide(dt);updCamera(dt);updHud();netTick(dt);
}
function updGuide(dt){
  const g=guide();arrow.visible=!!g;
  if(g){arrow.position.x+=(g.x-arrow.position.x)*Math.min(1,dt*8);arrow.position.z+=(g.z-arrow.position.z)*Math.min(1,dt*8);arrow.position.y=floorY(g.x)+2.3+Math.sin(T*5)*0.25;arrow.rotation.y+=dt*2.5;}
}
function updCamera(dt){
  camT.lerp(player.position,Math.min(1,dt*6));
  camZTimer-=dt;if(camZTimer<=0)camZT=1;camZ+=(camZT*userZoom-camZ)*Math.min(1,dt*3);
  const f=(camera.aspect<0.75?1.75:1.1)*camZ;
  camera.position.set(camT.x,camT.y+16*f,camT.z+12*f);camera.lookAt(camT.x,camT.y+0.5,camT.z-0.5);
  placeSun(camT.x,camT.y,camT.z-2);
}
const SUN_OFF=V3(-10,24,12),SUN_Z=SUN_OFF.clone().normalize(),SUN_X=new THREE.Vector3().crossVectors(V3(0,1,0),SUN_Z).normalize(),SUN_Y=new THREE.Vector3().crossVectors(SUN_Z,SUN_X),SUN_T=new THREE.Vector3();
function placeSun(x,y,z){const tx=48/sun.shadow.mapSize.x;SUN_T.set(x,y,z);const a=SUN_T.dot(SUN_X),b=SUN_T.dot(SUN_Y);
  SUN_T.addScaledVector(SUN_X,Math.round(a/tx)*tx-a).addScaledVector(SUN_Y,Math.round(b/tx)*tx-b);sun.target.position.copy(SUN_T);sun.position.copy(SUN_T).add(SUN_OFF);}

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

/* ---------- lobby UI ---------- */
const mpEl=document.getElementById('mp'),mpStatusEl=document.getElementById('mpStatus'),nickEl=document.getElementById('nick'),codeEl=document.getElementById('mpCode');
const emoBar=document.getElementById('emoBar');
function mpStatus(t){mpStatusEl.textContent=L(t);}
try{NET.nick=cleanName(localStorage.getItem('fm-nick')||('玩家'+(100+Math.random()*900|0)));}catch(_){NET.nick='玩家';}
nickEl.value=NET.nick;
nickEl.addEventListener('input',()=>{NET.nick=cleanName(nickEl.value);try{localStorage.setItem('fm-nick',NET.nick);}catch(_){}});
function supaRoomApi(){return {join:name=>new Promise((res,rej)=>{
  const me=Math.random().toString(36).slice(2,10);const ch=sb.channel('fm-'+name,{config:{broadcast:{self:false,ack:false}}});
  const peers=new Map();let mine={},last=0,pending=false,done=false;const subs=[];
  const snap=()=>Object.freeze([{peer:me,isMe:true,sameTab:true,presence:mine},...[...peers].map(([k,v])=>({peer:k,isMe:false,sameTab:false,presence:v.p}))]);
  let cached=snap();const fire=()=>{cached=snap();subs.forEach(f=>{try{f({peers:cached});}catch(_){}});};
  const send=()=>{last=Date.now();ch.send({type:'broadcast',event:'p',payload:{from:me,p:mine}}).catch(()=>{});};
  ch.on('broadcast',{event:'p'},({payload})=>{if(!payload||payload.from===me)return;const had=peers.get(payload.from);peers.set(payload.from,{p:Object.freeze(payload.p||{}),at:Date.now()});fire();});
  ch.on('broadcast',{event:'bye'},({payload})=>{if(payload&&peers.delete(payload.from))fire();});
  ch.on('broadcast',{event:'hello'},()=>send());
  const iv=setInterval(()=>{const now=Date.now();let c=false;for(const [k,v] of peers)if(now-v.at>5000){peers.delete(k);c=true;}if(c)fire();if(now-last>1000)send();},1000);
  const api={name,presence:async patch=>{mine=Object.freeze({...mine,...patch});cached=snap();const now=Date.now();
      if(now-last>=120)send();else if(!pending){pending=true;setTimeout(()=>{pending=false;send();},120-(now-last));}},
    peers:()=>cached,onPeers:f=>{subs.push(f);return ()=>{};},connected:()=>true,
    leave:async()=>{clearInterval(iv);try{await ch.send({type:'broadcast',event:'bye',payload:{from:me}});}catch(_){}sb.removeChannel(ch);}};
  ch.subscribe((st,err)=>{if(done)return;if(st==='SUBSCRIBED'){done=true;ch.send({type:'broadcast',event:'hello',payload:{from:me}}).catch(()=>{});res(api);}
    else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){done=true;rej({code:st,message:err&&err.message});}});
  setTimeout(()=>{if(!done){done=true;rej({code:'timeout'});}},10000);
})};}
let roomApi=null;const roomReady=(window.claude&&window.claude.use?window.claude.use('room'):sbReady.then(c=>c?supaRoomApi():null)).then(r=>{roomApi=r;return r;}).catch(()=>null);
function showPanel(){setTimeout(()=>trDom(mpEl),0);mpEl.hidden=false;document.getElementById('mpIdle').hidden=!!NET.room;document.getElementById('mpIn').hidden=!NET.room;
  document.getElementById('mpCodeShow').textContent=NET.code.toUpperCase();renderPlayers();
  if(!NET.room)roomReady.then(r=>{if(!r)mpStatus('联机还没配置：请按 README 在 config.js 填好 Supabase 地址和密钥。');});}
function renderPlayers(){const el=document.getElementById('mpPlayers');if(!el)return;const list=[];
  if(NET.room){for(const pr of NET.room.peers()){const P=pr.presence||{};if(P.role!=='host'&&P.role!=='guest')continue;list.push({n:(pr.isMe?'你 · ':'')+cleanName(P.nick)+(P.role==='host'?' 👑':''),c:PCOLS[(+P.col||0)%5]});}}
  const key=list.map(p=>p.n+p.c).join('|');if(el.dataset.k===key)return;el.dataset.k=key;
  el.replaceChildren(...list.map(p=>{const d=document.createElement('span');d.className='chip';d.style.background='#'+p.c.toString(16).padStart(6,'0');d.textContent=p.n;return d;}));}
document.getElementById('mpBtn').onclick=showPanel;
document.getElementById('mpClose').onclick=()=>{mpEl.hidden=true;};
const genCode=()=>{const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<4;i++)s+=a[(Math.random()*a.length)|0];return s;};
async function enterRoom(code,mode){
  const r=roomApi||await roomReady;if(!r){mpStatus('联机还没配置：请按 README 在 config.js 填好 Supabase 地址和密钥。');return false;}
  mpStatus('连接中…');
  try{NET.room=await r.join('fm-'+code);}catch(e){NET.lastErr=(e&&(e.message||e.code))||'network';mpStatus(L('进房间失败：')+NET.lastErr+'。'+L('点「🔧 联机测试」看看哪里有问题'));return false;}
  NET.code=code;NET.mode=mode;
  const me=NET.room.peers().find(p=>p.sameTab);NET.myPeer=me?me.peer:null;
  NET.room.onPeers(()=>{const m=NET.room.peers().find(p=>p.sameTab);if(m)NET.myPeer=m.peer;});
  if(mode==='host'){NET.col=0;await NET.room.presence(snapshot()).catch(()=>{});}
  if(mode==='host')stats.coop=1;emoBar.style.display='flex';mpStatus(mode==='host'?'把房间号告诉朋友：他们在自己的页面点 👥 输入房间号就能加入。':'已加入朋友的店！');showPanel();return true;
}
document.getElementById('mpHost').onclick=()=>{enterRoom(genCode(),'host');};
document.getElementById('mpJoin').onclick=()=>{const c=(codeEl.value||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(c.length!==4){mpStatus('房间号是 4 位');return;}
  save();JOIN.set(c);resetting=true;location.reload();};
function leaveRoom(){JOIN.del();
  if(NET.mode==='guest'){resetting=true;location.reload();return;}
  if(NET.room)NET.room.leave().catch(()=>{});NET.room=null;NET.mode='solo';for(const a of NET.remote.values())dropAvatar(a);NET.remote.clear();actorsDirty=true;emoBar.style.display='none';showPanel();mpStatus('已离开房间');}
document.getElementById('mpLeave').onclick=leaveRoom;
document.getElementById('mpTest').onclick=async()=>{
  if(!sb){mpStatus('联机还没配置：请按 README 在 config.js 填好 Supabase 地址和密钥。');return;}
  mpStatus('🔧 '+L('测试中…'));const name='fm-test-'+Math.random().toString(36).slice(2,8);let got=false,st='';
  const ch=sb.channel(name,{config:{broadcast:{self:true,ack:true}}});ch.on('broadcast',{event:'ping'},()=>{got=true;});
  const res=await new Promise(r=>{const to=setTimeout(()=>r({st:'TIMEOUT'}),10000);ch.subscribe((s2,err)=>{st=s2;if(s2==='SUBSCRIBED'){clearTimeout(to);r({st:s2});}else if(s2!=='CLOSED'||!got){if(s2==='CHANNEL_ERROR'||s2==='TIMED_OUT'){clearTimeout(to);r({st:s2,err});}}});});
  if(res.st!=='SUBSCRIBED'){mpStatus('❌ '+L('连不上 Supabase Realtime：')+res.st+(res.err&&res.err.message?' ('+res.err.message+')':'')+'。'+L('请看 README 的「联机连不上」一节'));sb.removeChannel(ch);return;}
  const ack=await ch.send({type:'broadcast',event:'ping',payload:{t:Date.now()}});await new Promise(r=>setTimeout(r,1500));sb.removeChannel(ch);
  mpStatus(got?'✅ '+L('联机正常！可以创建房间了'):'❌ '+L('能连上，但消息发不出去：')+ack+'。'+L('请看 README 的「联机连不上」一节'));};
emoBar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;NET.emo={e:b.dataset.e,t:Date.now()};showEmo(LOCAL_EMO,NET.emo);});
const LOCAL_EMO=(()=>{const emo=canvasSprite(128,144,0.9,1.0);emo.s.position.y=3.1;emo.s.visible=false;player.add(emo.s);return {emoS:emo,emoKey:'',emoUntil:0};})();
function localEmoTick(){if(LOCAL_EMO.emoS.visible&&T>LOCAL_EMO.emoUntil)LOCAL_EMO.emoS.visible=false;}
function guestFail(msg){showPanel();document.getElementById('mpFail').hidden=false;mpStatus(msg);}
document.getElementById('mpRetry').onclick=()=>{resetting=true;location.reload();};
document.getElementById('mpBack').onclick=()=>leaveRoom();
if(NET.mode==='guest'){hint.style.opacity=0;
  roomReady.then(async r=>{if(!r){guestFail('联机还没配置：请按 README 在 config.js 填好 Supabase 地址和密钥。');return;}
    const ok=await enterRoom(NET.code,'guest');if(!ok){guestFail(mpStatusEl.textContent);return;}mpEl.hidden=true;});}

function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
/* Frame pacing: capped at 60 fps (on 90/120 Hz screens the whole simulation used to run up to twice
   as often), 30 fps in battery mode, shadow map refreshed every other frame, and a render
   resolution that steps down a little when the device can't keep up (and back up when it can). */
const PACE={raw:16.7,prev:0,acc:0,cnt:0,scale:1,good:0,need:10,lastDown:-1e9,idle:0,low:false};
const PANEL_ELS=[...document.querySelectorAll('.panel')];
const uiCovered=()=>{for(const p of PANEL_ELS)if(!p.hidden)return true;return false;};
const wake=()=>{PACE.idle=0;};
addEventListener('pointerdown',wake,{passive:true,capture:true});addEventListener('keydown',wake,{capture:true});addEventListener('wheel',wake,{passive:true,capture:true});
let last=performance.now(),lastDraw=0;
function loop(now){requestAnimationFrame(loop);
  const raw=now-PACE.prev;PACE.prev=now;if(raw>0&&raw<100)PACE.raw+=(raw-PACE.raw)*0.05;
  /* Idle-aware frame rate: 60 fps while you play; 30 fps after 2.5 s without input or when a panel covers
     the shop; 20 fps on the (mostly still) farm; 10 fps on mini-game menus. Input restores 60 fps at once. */
  if(raw>0&&raw<250)PACE.idle+=raw/1000;
  const low=GFX.fps30||(!MINI.on&&(PACE.idle>2.5||uiCovered()));
  const gap=MINI.on==='f'?48:MINI.on==='k'?((!K.st||K.st.done)?95:(PACE.raw<11?14:0)):low?30:(PACE.raw<11?14:0);
  if(low!==PACE.low){PACE.low=low;PACE.acc=PACE.cnt=0;}
  if(now-lastDraw<gap)return;const iv=now-lastDraw;lastDraw=now;
  let dt=(now-last)/1000;last=now;if(dt>0.05)dt=0.05;if(dt<0)dt=0;if(MINI.on){if(NET.room){T+=dt;FRAME++;update(dt);}miniFrame(dt);return;}T+=dt;FRAME++;
  const c0=performance.now();update(dt);if(FRAME%3===0)charLOD();
  if(sun.castShadow&&(GFX.fps30||(FRAME&1)===0))renderer.shadowMap.needsUpdate=true;
  scene.updateMatrixWorld();limbsTick();renderer.render(scene,camera);
  const cpu=performance.now()-c0;PACE.cpu=(PACE.cpu||cpu)+(cpu-(PACE.cpu||cpu))*0.05;PACE.iv=(PACE.iv||iv)+(iv-(PACE.iv||iv))*0.05;
  PACE.calls=renderer.info.render.calls;PACE.tris=renderer.info.render.triangles;
  adapt(iv,now);
}
function adapt(iv,now){if(iv>250)return;PACE.acc+=iv;PACE.cnt++;if(PACE.acc<2000)return;const avg=PACE.acc/PACE.cnt;PACE.acc=PACE.cnt=0;
  const target=PACE.low?34:(PACE.raw<11?17:PACE.raw+1);
  if(avg>target*1.35&&PACE.scale>0.6){if(now-PACE.lastDown<30000)PACE.need=Math.min(120,PACE.need*2);PACE.lastDown=now;PACE.scale=Math.max(0.6,PACE.scale-0.1);PACE.good=0;applyRes();}
  else if(avg<target*1.08&&PACE.scale<1){PACE.good+=2;if(PACE.good>=PACE.need){PACE.good=0;PACE.scale=Math.min(1,PACE.scale+0.1);applyRes();}}
  else PACE.good=0;}
document.addEventListener('visibilitychange',()=>{PACE.acc=PACE.cnt=0;last=performance.now();});
requestAnimationFrame(loop);
/* ---------- offline earnings ---------- */
let rateLastEarned=null,rateAcc=0;
function rateTick(dt){rateAcc+=dt;if(rateAcc<10)return;if(rateLastEarned!=null){const perMin=(stats.earned-rateLastEarned)*(60/rateAcc);stats.rate=stats.rate?stats.rate*0.85+perMin*0.15:perMin;}rateLastEarned=stats.earned;rateAcc=0;}
function offlineCapMin(){return Math.min(BAL.offMaxMin,BAL.offBaseMin+BAL.offPerTenStars*Math.floor(totalStars()/10))+120*PK('offline');}
function staffCount(){return helpers.length+checkouts.filter(c=>c.cashier).length;}
function grantOffline(ms,why){
  if(NET.mode==='guest'||!(ms>120000))return;const capMin=offlineCapMin();const mins=Math.min(capMin,ms/60000);const staff=staffCount();if(!staff||!(stats.rate>0))return;
  const amt=Math.floor(stats.rate*mins*(BAL.offRate+0.05*PK('offline'))*Math.min(1,staff/4));if(amt<10)return;money+=amt;
  const h=Math.floor(mins/60),m=Math.floor(mins%60);say(['🧺',L('店员们')],[L('你离开了')+' '+(h?h+L('小时'):'')+m+L('分钟')+L('，店员们帮你赚了')+' 💵'+amt+'！'+(mins>=capMin?TT('（最多累计 '+Math.round(capMin/60)+' 小时）',' (max '+Math.round(capMin/60)+' h)',' (maks '+Math.round(capMin/60)+' jam)'):'')]);}
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(AC){if(document.hidden){if(AC.state==='running')AC.suspend().catch(()=>{});}else if(AC.state!=='running'&&AC.state!=='closed')AC.resume().catch(()=>{});}if(document.hidden)hiddenAt=Date.now();else if(hiddenAt){grantOffline(Date.now()-hiddenAt);hiddenAt=0;}});
setTimeout(()=>{if(offlineFrom)grantOffline(Date.now()-offlineFrom);setTimeout(checkStreak,2600);
  try{const hb=JSON.parse(localStorage.getItem('fm-helpbank')||'null');if(hb&&hb.v>0&&NET.mode!=='guest'){const v=Math.floor(hb.v),hs=Math.max(0,Math.min(3,hb.st|0));money+=v;legacy.stars=(legacy.stars||0)+hs;localStorage.removeItem('fm-helpbank');save();setTimeout(()=>toast(L('👥 你在朋友店里帮忙，带回了')+' 💵'+v+(hs?'  ⭐+'+hs:''),3000),1200);}}catch(_){}},1800);

/* ---------- random events: rain, tour group, spill, lost child ---------- */
let ev=null,evT=150;
const rainG=new THREE.Group();rainG.userData.live=1;scene.add(rainG);rainG.visible=false;
const rainGeo=new THREE.BufferGeometry();{const n=600,p=new Float32Array(n*12);for(let i=0;i<n;i++){const x=(Math.random()-0.5)*40,y=Math.random()*14,z=(Math.random()-0.5)*40;p.set([x,y,z,x-0.08,y-0.6,z,x,y+14,z,x-0.08,y+13.4,z],i*12);}rainGeo.setAttribute('position',new THREE.BufferAttribute(p,3));}
const rainClip=[new THREE.Plane(V3(0,-1,0),14),new THREE.Plane(V3(0,1,0),0)];renderer.localClippingEnabled=true;
const rainLines=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xcfe6ff,transparent:true,opacity:0.55,clippingPlanes:rainClip}));rainLines.frustumCulled=false;rainG.add(rainLines);
const spillM=new THREE.Mesh(new THREE.CircleGeometry(0.75,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthWrite:false}));spillM.rotation.x=-Math.PI/2;spillM.visible=false;spillM.userData.live=1;scene.add(spillM);
const spillTag=canvasSprite(128,144,0.8,0.9);drawBubble(spillTag,'🧽','');spillTag.s.visible=false;spillTag.s.userData.live=1;scene.add(spillTag.s);
let kid=null,parentNpc=null;
function evSnap(){if(!ev)return null;const o={k:ev.k};if(ev.k==='spill'){o.x=r1(ev.x);o.z=r1(ev.z);}if(ev.k==='lost'&&kid){o.kx=r1(kid.g.position.x);o.kz=r1(kid.g.position.z);o.kr=r1(kid.g.rotation.y);o.px=r1(parentNpc.g.position.x);o.pz=r1(parentNpc.g.position.z);o.f=ev.follow?1:0;}return o;}
function evApply(o){const k=o?o.k:null;rainG.visible=k==='rain';spillM.visible=spillTag.s.visible=k==='spill';if(k==='spill'){spillM.position.set(o.x,0.12,o.z);spillTag.s.position.set(o.x,1.2,o.z);}
  if(k==='lost'){if(!kid)makeLost();kid.tx=o.kx;kid.tz=o.kz;kid.g.rotation.y=o.kr;parentNpc.g.position.set(o.px,0,o.pz);drawBubble(kid.bub,o.f?'🙂':'😢','');}else if(kid)clearLost();
  if(k!==(ev&&ev.k)&&k)toast(EV_TXT[k]||'',2600);ev=o;}
function makeLost(){const ci=(Math.random()*CC.length)|0;const ch=makeChar(CC[ci],{skin:SKINS[(ci+2)%5],hat:CC[(ci+4)%CC.length]});ch.g.scale.setScalar(0.66);scene.add(ch.g);
  const bub=canvasSprite(128,144,1.0,1.125,true);bub.s.position.y=2.4;ch.g.add(bub.s);drawBubble(bub,'😢','');kid={ch,g:ch.g,bub,tx:0,tz:0};
  const pa=makeChar(CC[(ci+1)%CC.length],{skin:SKINS[(ci+2)%5]});scene.add(pa.g);const pb=canvasSprite(128,144,1.0,1.125,true);pb.s.position.y=2.3;pa.g.add(pb.s);drawBubble(pb,'❓','');parentNpc={ch:pa,g:pa.g,bub:pb};}
function clearLost(){if(kid){dropChar(kid);dropChar(parentNpc);kid=parentNpc=null;}}
const EV_TXT={rain:'🌧️ 下雨了！客人少一点，二楼的雨伞会卖得特别好',tour:'🚌 旅游团来了！一大群客人马上进店',spill:'🥛 有人打翻了牛奶！走过去站一会儿就能清理干净',lost:'😢 有个小朋友走丢了！走到他身边，带他去门口找爸爸妈妈'};
function eventsTick(dt){
  if(kid){const k=kid.g.position;if(NET.mode==='guest'){k.x+=(kid.tx-k.x)*Math.min(1,dt*8);k.z+=(kid.tz-k.z)*Math.min(1,dt*8);animChar(kid.ch,Math.hypot(kid.tx-k.x,kid.tz-k.z)>0.03,T,false);}}
  if(ev&&ev.k==='rain'&&rainG.visible){rainG.position.set(camT.x,camT.y,camT.z-4);rainLines.position.y=-((T*16)%14);rainClip[0].constant=camT.y+14;rainClip[1].constant=-camT.y;}
  if(NET.mode==='guest')return;
  if(ev){ev.t-=dt;
    if(ev.k==='tour'&&ev.left>0){ev.sp-=dt;if(ev.sp<=0){ev.sp=0.5;ev.left--;spawnCustomer(-1,true);}}
    if(ev.k==='lost'&&kid){const k=kid.g.position;
      if(ev.follow){const f=ev.follow.g.position;const d=Math.hypot(f.x-k.x,f.z-k.z);let mv=false;if(d>1.1){const s=Math.min(d-1.1,4.5*dt);k.x+=(f.x-k.x)/d*s;k.z+=(f.z-k.z)/d*s;faceTo(kid.g,Math.atan2(f.x-k.x,f.z-k.z),dt);mv=true;}animChar(kid.ch,mv,T,false);
        if(near(k,parentNpc.g.position,1.6)){const rw=200+60*lines().length;money+=rw;sparkle(parentNpc.g.position.clone().add(V3(0,1.5,0)),16,0xff8fb1,1.2);toast(L('💖 小朋友找到爸爸妈妈了！谢礼')+' 💵'+rw,2600);chord();stats.helped=(stats.helped||0)+1;clearLost();ev=null;return;}}
      else animChar(kid.ch,false,T,false);}
    if(ev&&ev.t<=0){if(ev.k==='lost')clearLost();ev=null;rainG.visible=false;spillM.visible=spillTag.s.visible=false;}
    return;}
  evT-=dt;if(evT>0||lines().length<2)return;evT=150+Math.random()*90;
  const opts=['rain','tour','spill','lost',...(TW()===1?['tour']:[]),...(hasT('busstop')?['tour']:[])];const k=opts[(Math.random()*opts.length)|0];
  if(k==='rain'){ev={k,t:70};rainG.visible=true;}
  else if(k==='tour'){ev={k,t:10,left:8+(TW()===1?4:0)+(hasT('busstop')?6:0),sp:0};}
  else if(k==='spill'){const spots=[[-2,-8],[2,-4],[-6,-6],[4,-8]];if(expanded)spots.push([16,-7],[21,-5]);const [x,z]=spots[(Math.random()*spots.length)|0];ev={k,t:60,x,z,clean:0};spillM.position.set(x,0.12,z);spillTag.s.position.set(x,1.2,z);spillM.visible=spillTag.s.visible=true;}
  else{makeLost();const spots=[[3,-8],[-3,-9],[7,-5]];const [x,z]=spots[(Math.random()*3)|0];kid.g.position.set(x,0,z);parentNpc.g.position.set(-10.9,0,-4.4);parentNpc.g.rotation.y=Math.PI/2;ev={k,t:100,follow:null};}
  toast(L(EV_TXT[k]),2800);blip(660,0.12,'sine',0.06);
}
function eventInteract(a,dt){
  if(!ev||NET.mode==='guest')return;const pp=a.g.position;
  if(ev.k==='spill'&&near(pp,V3(ev.x,0,ev.z),1.0)){ev.clean+=dt;spillM.material.opacity=0.9*(1-ev.clean/1.2);if(ev.clean>=1.2){const rw=60+20*lines().length;money+=rw;sparkle(V3(ev.x,0.6,ev.z),12,0xbfe6ff,1);toast(L('✨ 地板擦干净了！')+' +💵'+rw,1800);stats.cleaned=(stats.cleaned||0)+1;spillM.visible=spillTag.s.visible=false;spillM.material.opacity=0.9;ev=null;}}
  else if(ev&&ev.k==='lost'&&kid&&!ev.follow&&near(pp,kid.g.position,1.2)){ev.follow=a;drawBubble(kid.bub,'🙂','');toast(L('🙂 小朋友跟着你走了，带他去左边门口'),2200);}
}
function isRaining(){return !!(ev&&ev.k==='rain');}

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

/* ---------- background music (original, generated live) ---------- */
const MUS={on:true,gain:null,next:0,step:0};
function musicInit(){if(!AC||MUS.gain)return;MUS.gain=AC.createGain();MUS.gain.gain.value=0;MUS.gain.connect(AC.destination);MUS.next=AC.currentTime+0.3;}
const nf=n=>130.81*Math.pow(2,n/12);
function tone(f,t,d,type,vol){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+d+0.05);}
/* farm: bright triangle lead · beach: quicker, sunny sine · snow: slow with bells · sakura: gentle yo-scale */
const THEME_MUS=[{d:92,n:70,key:0,sc:[0,2,4,7,9],lead:'triangle'},{d:104,n:78,key:2,sc:[0,2,4,7,9],lead:'sine'},{d:76,n:62,key:-3,sc:[0,2,4,7,11],lead:'sine',bell:1},{d:84,n:66,key:5,sc:[0,2,5,7,9],lead:'triangle'}];
const PROG_DAY=[[0,4,7],[5,9,12],[9,12,16],[7,11,14]],PROG_NIGHT=[[9,12,16],[5,9,12],[0,4,7],[7,11,14]],PENTA=[0,2,4,7,9];
function musicTick(){
  if(!AC||!MUS.gain)return;MUS.gain.gain.setTargetAtTime(MUS.on?0.55:0,AC.currentTime,0.6);
  if(!MUS.on||AC.state!=='running'){MUS.next=AC.currentTime+0.2;return;}
  const night=isNight(),TM=THEME_MUS[TW()],beat=60/(night?TM.n:TM.d)/2;
  while(MUS.next<AC.currentTime+0.35){const t=MUS.next,st=MUS.step,bar=Math.floor(st/8)%4,ch=(night?PROG_NIGHT:PROG_DAY)[bar];
    const K=TM.key,SC=TM.sc;
    if(st%8===0){ch.forEach(n=>tone(nf(n+12+K),t,beat*8,'sine',0.035));tone(nf(ch[0]+K),t,beat*4,'triangle',0.06);}
    if(st%8===4)tone(nf(ch[0]+7+K),t,beat*3,'triangle',0.045);
    const h=Math.abs(Math.sin(st*12.9898+bar*78.233)*43758.5453)%1;
    if((!night||st%2===0)&&h>0.38){const deg=SC[Math.floor(h*97)%5];tone(nf(deg+K+(h>0.82?36:24)),t,beat*(night?2.4:1.5),night?'sine':TM.lead,0.032);}
    if(TM.bell&&st%16===10)tone(nf(SC[(st>>4)%5]+K+48),t,beat*6,'sine',0.014);
    if(curFest&&st%4===2)tone(nf(SC[st%5]+K+36),t,beat*0.8,'sine',0.018);
    MUS.step++;MUS.next+=beat;}
}

/* ---------- settings: graphics, audio, nickname ---------- */
const GFX={q:'high',fps30:false,vib:true,joy:'float',tap:true};
try{const g=JSON.parse(localStorage.getItem('fm-gfx')||'null');
  if(!g){const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||4,small=Math.min(screen.width,screen.height)<=420;
    GFX.q=(mem<=2||cores<=2)?'low':(mem<=4||cores<=4||small)?'mid':'high';}
  if(g){Object.assign(GFX,g);if(g.music===false)MUS.on=false;if(g.sfx===false)soundOn=false;}}catch(_){}
function saveSettings(){try{localStorage.setItem('fm-gfx',JSON.stringify({q:GFX.q,fps30:GFX.fps30,music:MUS.on,sfx:soundOn,vib:GFX.vib,joy:GFX.joy,tap:GFX.tap}));}catch(_){}}
function applyRes(){const dpr=window.devicePixelRatio||1,base=GFX.q==='high'?Math.min(dpr,2):GFX.q==='mid'?Math.min(dpr,1.5):Math.min(dpr,1);
  const pr=Math.max(0.75,+(base*PACE.scale).toFixed(2));if(renderer.getPixelRatio()!==pr){renderer.setPixelRatio(pr);resize();}}
function applyGfx(){PACE.scale=1;PACE.need=10;applyRes();renderer.shadowMap.type=GFX.q==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  sun.castShadow=GFX.q!=='low';renderer.shadowMap.needsUpdate=true;const ms=GFX.q==='high'?2048:1024;if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}resize();}
applyGfx();

/* ---------- achievements ---------- */
const allHelpers=()=>helpers.length;
const ACH=[
 {id:'first',e:'💵',n:'第一桶金',d:'累计赚到 💵100',v:()=>[stats.earned,100],r:30},
 {id:'boss',e:'💼',n:'小老板',d:'累计赚到 💵10,000',v:()=>[stats.earned,1e4],r:300},
 {id:'tycoon',e:'💰',n:'小镇首富',d:'累计赚到 💵1,000,000',v:()=>[stats.earned,1e6],r:5000},
 {id:'tomato',e:'🍅',n:'番茄达人',d:'卖出 500 个番茄',v:()=>[stats.sold.tomato||0,500],r:300},
 {id:'bakery',e:'🍞',n:'面包飘香',d:'卖出 300 个面包',v:()=>[stats.sold.bread||0,300],r:600},
 {id:'serve500',e:'🙋',n:'顾客至上',d:'服务 500 位顾客',v:()=>[stats.served,500],r:500},
 {id:'serve5k',e:'🎉',n:'千客万来',d:'服务 5,000 位顾客',v:()=>[stats.served,5000],r:3000},
 {id:'night',e:'🌙',n:'夜猫子',d:'夜里服务 100 位顾客',v:()=>[stats.night||0,100],r:600},
 {id:'foodie',e:'🍽️',n:'美食家',d:'招待 200 位食客',v:()=>[stats.diners,200],r:1500},
 {id:'promo',e:'🔥',n:'特价狂欢',d:'特价期间卖出 100 件',v:()=>[stats.promoSold||0,100],r:500},
 {id:'fest',e:'🏮',n:'节日快乐',d:'节日商品卖出 50 件',v:()=>[stats.fest||0,50],r:800},
 {id:'vip',e:'⭐',n:'常客之友',d:'招待常客 10 次',v:()=>[stats.vip||0,10],r:800},
 {id:'wing',e:'🏬',n:'应有尽有',d:'百货区 8 个货架全部开张',v:()=>[WING_GOODS.filter(t=>shelves[t].unlocked).length,8],r:1000},
 {id:'f2',e:'🏢',n:'更上一层楼',d:'开放二楼',v:()=>[padById.floor2.lvl,1],r:1000},
 {id:'team',e:'🧺',n:'团队力量',d:'雇到 6 个搬运工',v:()=>[allHelpers(),6],r:800},
 {id:'week',e:'📅',n:'坚持营业',d:'经营到第 7 天',v:()=>[dayN,7],r:400},
 {id:'coop',e:'👥',n:'好朋友',d:'开一次联机房间',v:()=>[stats.coop||0,1],r:200},
 {id:'style',e:'🎨',n:'时尚店长',d:'买下 3 件装扮',v:()=>[Object.keys(decor.owned).length-3,3],r:500},
 {id:'story',e:'📖',n:'小镇之光',d:'完成故事模式',v:()=>[story.done?1:0,1],r:3000},
 {id:'max',e:'👑',n:'满级小镇',d:'建好全部设施',v:()=>[pads.filter(p=>p.done).length,pads.length],r:10000},
 {id:'up20',e:'⬆️',n:TT('精益求精','Getting better','Semakin baik'),d:TT('累计升星 20 次','Buy 20 upgrade stars','Beli 20 bintang naik taraf'),v:()=>[stats.upgrades||0,20],r:2000},
 {id:'up150',e:'🌟',n:TT('全星店铺','All-star shop','Kedai serba bintang'),d:TT('累计升星 150 次','Buy 150 upgrade stars','Beli 150 bintang naik taraf'),v:()=>[stats.upgrades||0,150],r:20000},
 {id:'day3',e:'⭐',n:TT('五星好评','Top rated','Penarafan tertinggi'),d:TT('拿到 10 次三星好评','Get 10 three-star days','Dapat 10 hari tiga bintang'),v:()=>[stats.day3||0,10],r:3000},
 {id:'streak7',e:'📅',n:TT('天天来','Regular','Pelawat tetap'),d:TT('连续签到 7 天','7-day login streak','Log masuk 7 hari berturut'),v:()=>[stats.bestStreak||0,7],r:2000},
 {id:'town5',e:'🏙️',n:TT('小镇建设者','Town builder','Pembina pekan'),d:TT('完成全部 5 个小镇项目','Finish all 5 town projects','Siapkan semua 5 projek pekan'),v:()=>[TOWN.filter(t=>hasT(t.id)).length,5],r:25000},
 {id:'br1',e:'🏪',n:TT('第二家店','Second shop','Kedai kedua'),d:TT('开一家分店','Open a branch','Buka cawangan'),v:()=>[legacy.n||0,1],r:3000},
 {id:'fresh',e:'✨',n:TT('新鲜达人','Fresh picker','Sentiasa segar'),d:TT('拿到 100 次新鲜出炉','Grab 100 fresh items','Ambil 100 barang segar'),v:()=>[stats.fresh||0,100],r:1500},
 {id:'perfect',e:'🎯',n:TT('神准收银','Perfect timing','Masa tepat'),d:TT('收银完美 50 次','50 perfect checkouts','50 kali bayaran sempurna'),v:()=>[stats.perfect||0,50],r:1500},
 {id:'chef',e:'🍳',n:TT('大厨','Head chef','Cef utama'),d:TT('美食挑战拿到 45 颗星','Earn 45 stars in the food court challenge','Dapat 45 bintang dalam cabaran medan selera'),v:()=>[kStarsTotal(),45],r:8000},
 {id:'farmer',e:'🧑‍🌾',n:TT('开心农夫','Happy farmer','Petani gembira'),d:TT('农场升到 8 级','Reach farm level 8','Capai tahap ladang 8'),v:()=>[(stats.farm&&stats.farm.lvl)||1,8],r:5000},
 {id:'br4',e:'🗺️',n:TT('连锁品牌','Chain brand','Jenama rangkaian'),d:TT('开到第 5 家店','Run your 5th shop','Buka kedai ke-5'),v:()=>[legacy.n||0,4],r:30000},
];
function checkAch(){if(NET.mode==='guest')return;for(const a of ACH){if(ACH_STATE[a.id])continue;const [x,y]=a.v();if(x>=y){ACH_STATE[a.id]=Date.now();money+=a.r;toast('🎖️ 成就达成：'+a.e+' '+a.n+'  +💵'+a.r,2600);chord();}}}

/* ---------- VIP regulars ---------- */
const VIP_GIFT={3:500,6:1500,10:5000};
function vipHeart(i,d){const v=VIPS[i];if(!v)return;const old=vipState[v.n]||0;const nw=Math.max(0,Math.min(10,old+d));vipState[v.n]=nw;
  if(d>0){toast('⭐ '+v.n+'很满意！好感 '+'❤️'.repeat(Math.min(nw,5))+(nw>5?'×'+nw:''),2200);if(VIP_GIFT[nw]&&nw>old){money+=VIP_GIFT[nw];setTimeout(()=>{toast('🎁 '+v.n+'送你一份谢礼：💵'+VIP_GIFT[nw],2600);chord();},1600);}}
  else toast('💔 '+v.n+'没买到想要的东西，有点失望',2200);}
function vipTick(dt){if(NET.mode==='guest')return;vipT-=dt;if(vipT>0)return;vipT=70+Math.random()*50;
  if(lines().length<3||customers.some(c=>c.vip>=0&&!c.dead))return;spawnCustomer((Math.random()*VIPS.length)|0);}
function addCrown(g){const cr=new THREE.Group();cr.position.y=1.66;const band=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.22,0.12,10,1,true),M(0xf2c94c));cr.add(band);
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const sp=new THREE.Mesh(GEO.cleaf,M(0xf2c94c));sp.position.set(Math.cos(a)*0.19,0.1,Math.sin(a)*0.19);cr.add(sp);}g.add(cr);}

/* ---------- town projects: late-game money sink with lasting effects ---------- */
const TOWN=[
 {id:'park',e:'🌳',cost:60000,n:TT('中央公园','Central park','Taman pusat'),d:TT('客人更多：上限 +3，来得更快','More shoppers: cap +3 and they arrive faster','Lebih ramai pelanggan: had +3, datang lebih cepat')},
 {id:'school',e:'🏫',cost:90000,n:TT('小镇学校','Town school','Sekolah pekan'),d:TT('学生更多，每样多买 1 件','More students; each buys 1 more of everything','Lebih ramai pelajar; mereka membeli 1 lagi bagi setiap barang')},
 {id:'clinic',e:'🏥',cost:130000,n:TT('社区诊所','Clinic','Klinik'),d:TT('老人家更多，付钱 +25%','More seniors, and they pay +25%','Lebih ramai warga emas, dan mereka membayar +25%')},
 {id:'busstop',e:'🚏',cost:180000,n:TT('公交站','Bus stop','Hentian bas'),d:TT('旅游团更常来，人也更多','Tour groups come more often and bigger','Kumpulan pelancong lebih kerap dan lebih besar')},
 {id:'tower',e:'🕰️',cost:260000,n:TT('钟楼','Clock tower','Menara jam'),d:TT('小镇出名了：所有售价 +10%','Town fame: all prices +10%','Pekan terkenal: semua harga +10%')}];
const townCost=t=>Math.round(t.cost*(1+BAL.branchCost*(legacy.n||0))/100)*100;
const townG={};
{let g;const mk=id=>{g=townG[id]=new THREE.Group();g.visible=false;scene.add(g);return g;};
 mk('park');cyl(5,5,0.06,0x7fcf5c,-2,0.04,-26,g,32);cyl(1.4,1.4,0.1,0x7fc4f0,-2,0.1,-26,g,20);box(1.6,0.08,0.5,0xc98b52,-2,0.45,-23.4,g);
 for(const [x,z] of [[-5.5,-24],[1.5,-24.5],[-4.5,-28.5],[2,-28]]){cyl(0.15,0.2,0.8,0x9a6a43,x,0.4,z,g,6);add(new THREE.ConeGeometry(0.9,1.6,7),0x4fbf4a,x,1.5,z,g);add(new THREE.ConeGeometry(0.7,1.2,7),0x62d15a,x,2.2,z,g);}
 mk('school');box(9,3.6,5,0xf2d16b,14,1.8,-27,g);box(9.4,0.5,5.4,0xd9534f,14,3.85,-27,g);for(let i=0;i<4;i++)box(1.2,0.9,0.08,winMat,10.6+i*2.3,2.3,-24.46,g,false);
 box(1.4,1.8,0.1,0x8a5a36,14,0.9,-24.46,g);cyl(0.05,0.05,3,0x9aa0a6,19.2,1.5,-24,g,6);box(0.9,0.55,0.04,0xe53935,19.65,2.7,-24,g,false);
 mk('clinic');box(7,3.2,5,0xffffff,29,1.6,-26.5,g);box(7.3,0.3,5.3,0x4fc3a1,29,3.35,-26.5,g);box(1.4,0.4,0.1,0xe53935,29,2.5,-23.95,g,false);box(0.4,1.4,0.1,0xe53935,29,2.5,-23.94,g,false);
 for(const px of [-2.3,2.3])box(1.2,0.9,0.08,winMat,29+px,1.8,-23.96,g,false);box(1.3,1.8,0.1,0x9fd3ff,29,0.9,-23.96,g);
 mk('busstop');for(const px of [-1.3,1.3])box(0.1,2.1,0.1,0x6b7280,8+px,1.05,-15.9,g);box(3,0.12,1.1,0x2f7fd1,8,2.15,-15.7,g);box(2.4,0.08,0.4,0xc98b52,8,0.5,-15.95,g);
 box(6,1.9,2.2,0xffc93c,0,1.2,-18.6,g);box(5.6,0.7,2.24,0x9fd3ff,0,1.55,-18.6,g,false);for(const [wx,wz] of [[-2,-17.5],[2,-17.5],[-2,-19.7],[2,-19.7]])cyl(0.35,0.35,0.3,0x333333,wx,0.35,wz,g,12).rotation.x=Math.PI/2;
 mk('tower');box(2.6,7,2.6,0xe6d3b3,44,3.5,-27,g);const rf=add(new THREE.ConeGeometry(2.2,2,4),0xd9534f,44,8,-27,g);rf.rotation.y=Math.PI/4;
 cyl(0.9,0.9,0.08,0xffffff,44,6,-25.66,g,20).rotation.x=Math.PI/2;box(0.08,0.6,0.03,0x333333,44,6.2,-25.6,g,false);box(0.45,0.08,0.03,0x333333,44.15,6,-25.6,g,false);}
function applyTownVis(){for(const t of TOWN)townG[t.id].visible=hasT(t.id);}
function buildTown(id){const t=TOWN.find(x=>x.id===id);if(!t||hasT(id)||NET.mode==='guest')return;const c=townCost(t);if(money<c||!pads.every(p=>p.done)){hubMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  paceLog('town:'+id,c);money-=c;town[id]=1;const g=townG[id];g.visible=true;pop(g,0.2);camPunch();toast('🏙️ '+t.n+' '+TT('建好了！','is built!','siap dibina!'),2600);chord();save();renderHub();}

/* ---------- station levels (every shelf, field and machine has 10 stars) ---------- */
const ST_PAD={};
{const S={egg:'eggShelf',milk:'milkShelf',carrot:'carrotShelf',jam:'jamShelf',bread:'breadShelf',cheese:'cheeseShelf',juice:'juiceShelf'};for(const t in S)ST_PAD['s:'+t]=S[t];
 WING_GOODS.forEach(t=>ST_PAD['s:'+t]='sh_'+t);F2_GOODS.forEach(t=>ST_PAD['s:'+t]='sh2_'+t);SIG_ITEMS.forEach(t=>{ST_PAD['s:'+t]='sigStall';ST_PAD['p:'+t]='sigStall';});
 const P={egg:'eggFarm',milk:'cowFarm',carrot:'carrotFarm',strawberry:'berryFarm',wheat:'wheatFarm',apple:'appleFarm'};for(const t in P)ST_PAD['p:'+t]=P[t];
 const Mc={bread:'oven',cheese:'press',juice:'juicer',jam:'jamMaker',burger:'stallBurger',soup:'stallSoup',drink:'stallDrink'};for(const t in Mc)ST_PAD['m:'+t]=Mc[t];}
function stations(){const out=[];
  for(const t of [...SELL,...SIG_ITEMS]){const o=shelves[t];if(o.unlocked)out.push({k:'s:'+t,kind:'s',e:ITEM[t].e,o});}
  for(const t in producers){const o=producers[t];if(o.unlocked)out.push({k:'p:'+t,kind:'p',e:ITEM[t].e,o});}
  for(const t in machines){const o=machines[t];if(o.unlocked)out.push({k:'m:'+t,kind:'m',e:ITEM[o.inT].e+'➜'+ITEM[t].e,o});}
  return out;}
function stCost(k,lv){const p=padById[ST_PAD[k]];const base=p?p.costs[0]*padMul(p):40;return Math.max(20,Math.round(base*BAL.stBase*Math.pow(BAL.stGrowth,lv)/10)*10);}
function refreshSigns(){for(const t in shelves){const sh=shelves[t];if(!sh.sign)continue;const lv=stLv['s:'+t]||0;const key=lv;if(sh.signLv===key)continue;sh.signLv=key;drawBubble(sh.sign,ITEM[t].e,lv?'★'+lv:'');}}
function buyStation(k){if(NET.mode==='guest')return;const lv=stLv[k]||0;if(lv>=BAL.stMax)return;const c=stCost(k,lv);if(money<c){hubMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  paceLog(k+' ★'+(lv+1),c);money-=c;stLv[k]=lv+1;stats.upgrades=(stats.upgrades||0)+1;const s=stations().find(x=>x.k===k);if(s)sparkle(V3(s.o.x,floorY(s.o.x)+1.6,s.o.z),14,0xffd24a,1);
  refreshSigns();chord();save();renderHub();}

/* ---------- permanent perks bought with manager stars ---------- */
const PERKS=[
 {k:'start',e:'💰',max:5,n:TT('开店资金','Starting cash','Modal permulaan'),d:TT('开分店时多带 💵500','+💵500 when you open a branch','+💵500 apabila membuka cawangan')},
 {k:'basket',e:'🎒',max:4,n:TT('大背篓','Bigger basket','Bakul lebih besar'),d:TT('每级多拿 1 件','Carry 1 more item per level','Boleh bawa 1 barang lagi bagi setiap tahap')},
 {k:'walk',e:'👟',max:4,n:TT('轻快步伐','Quick feet','Langkah pantas'),d:TT('你走得快 5%','You move 5% faster','Anda bergerak 5% lebih laju')},
 {k:'staff',e:'🏃',max:5,n:TT('勤快店员','Busy staff','Pekerja rajin'),d:TT('搬运工快 8%','Porters move 8% faster','Pengangkut 8% lebih laju')},
 {k:'tips',e:'🔥',max:3,n:TT('好口碑','Good word','Nama baik'),d:TT('小费 +25%','Tips +25%','Tip +25%')},
 {k:'offline',e:'🌙',max:4,n:TT('夜班','Night shift','Syif malam'),d:TT('离线收益多 2 小时、+5%','Offline earnings +2 h and +5%','Pendapatan luar talian +2 jam dan +5%')}];
function buyPerk(k){if(NET.mode==='guest')return;const pk=PERKS.find(p=>p.k===k);const lv=PK(k);if(!pk||lv>=pk.max)return;const c=lv+1;if((legacy.stars||0)<c)return;
  legacy.stars-=c;legacy.perks[k]=lv+1;chord();toast('⭐ '+pk.n+' Lv.'+(lv+1),1800);save();renderHub();}
const THEME_INFO=[TT('招牌特产 🌽 玉米。经典小镇，没有特别规则。','Specialty: 🌽 corn. The classic town, no special rules.','Istimewa: 🌽 jagung. Pekan klasik, tiada peraturan khas.'),
 TT('招牌特产 🦐 鲜虾。旅游团更常来、人更多，客人来得更快。','Specialty: 🦐 shrimp. More and bigger tour groups; shoppers arrive faster.','Istimewa: 🦐 udang. Lebih banyak kumpulan pelancong yang lebih besar; pelanggan datang lebih cepat.'),
 TT('招牌特产 ☕ 热可可。客人走得慢，但每样多买 1 件。','Specialty: ☕ hot cocoa. Shoppers walk slowly but buy 1 more of everything.','Istimewa: ☕ koko panas. Pelanggan berjalan perlahan tetapi membeli 1 lagi bagi setiap barang.'),
 TT('招牌特产 🍡 团子。每 3 天就有一次节日。','Specialty: 🍡 dango. A festival every 3 days.','Istimewa: 🍡 dango. Perayaan setiap 3 hari.')];

/* ---------- day rating, login streak, weekly challenges ---------- */
function dayRating(d){const n=(d.served||0)+(d.diners||0);if(n<5)return 0;const bad=((d.sad||0)+0.5*(d.miss||0))/(n+(d.sad||0));const w=d.waitN?d.waitSum/d.waitN:0;return (bad<0.08&&w<9)?3:(bad<0.2&&w<14)?2:1;}
const starStr=r=>'★'.repeat(r)+'☆'.repeat(3-r);
function rateDay(){const r=dayRating(daily.d);if(!r)return;stats.lastRating=r;if(r===3)stats.day3=(stats.day3||0)+1;
  const cash=Math.round(r*(40+lines().length*25)*rewardMul()/10)*10;money+=cash;setTimeout(()=>toast(TT('昨日评价 ','Yesterday ','Semalam ')+starStr(r)+'  +💵'+cash,2600),2800);}
const dayKey=(off=0)=>{const d=new Date(Date.now()-off*86400000);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function checkStreak(){if(NET.mode==='guest')return;const t=dayKey();if(streak.last===t)return;streak.n=streak.last===dayKey(1)?streak.n+1:1;streak.last=t;
  const cash=Math.round((150+100*Math.min(streak.n,7))*rewardMul()/10)*10;money+=cash;let msg='📅 '+TT('连续签到第 '+streak.n+' 天','Login streak: day '+streak.n,'Log masuk berturut: hari '+streak.n)+'  +💵'+cash;
  if(streak.n%7===0){legacy.stars=(legacy.stars||0)+1;msg+='  ⭐+1';}stats.bestStreak=Math.max(stats.bestStreak||0,streak.n);toast(msg,3200);save();}
const weekNo=()=>{const d=new Date();return Math.floor(((d.getTime()-d.getTimezoneOffset()*60000)/86400000+3)/7);};
const WEEK_TXT={served:g=>TT('服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers','Layan '+g.n+' pelanggan'),earn:g=>TT('赚到 💵'+fmtN(g.n),'Earn 💵'+fmtN(g.n),'Peroleh 💵'+fmtN(g.n)),
  up:g=>TT('升级 '+g.n+' 次','Buy '+g.n+' upgrade stars','Beli '+g.n+' bintang naik taraf'),day3:g=>TT('拿到 '+g.n+' 次三星好评','Get '+g.n+' three-star days','Dapat '+g.n+' hari tiga bintang')};
function weekCur(k){return k==='served'?stats.served:k==='earn'?stats.earned:k==='up'?(stats.upgrades||0):(stats.day3||0);}
function genWeekly(){const L=Math.max(1,lines().length),m=rewardMul();weekly.wk=weekNo();weekly.base={served:stats.served,earn:stats.earned,up:stats.upgrades||0,day3:stats.day3||0};
  const cash=Math.round(300*m*(1+L/5)/50)*50;weekly.goals=[{k:'served',n:100+10*L},{k:'earn',n:Math.round(5000*m*(1+L/5)/500)*500},{k:'up',n:6},{k:'day3',n:3}].map(g=>({...g,done:false,cash}));}
const weekProg=g=>Math.max(0,weekCur(g.k)-((weekly.base||{})[g.k]||0));
function checkWeekly(){if(NET.mode==='guest')return;if(weekly.wk!==weekNo())genWeekly();
  for(const g of weekly.goals){if(!g.done&&weekProg(g)>=g.n){g.done=true;legacy.stars=(legacy.stars||0)+1;money+=g.cash;toast('📅 '+TT('本周挑战完成！','Weekly challenge done!','Cabaran mingguan selesai!')+'  ⭐+1  💵+'+g.cash,2800);chord();save();}}}
function weeklyHtml(){if(NET.mode==='guest'||!weekly.goals.length)return '';const left=7-((Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000)+3)%7);
  return '<div class="sec" style="font-weight:900;margin:4px 0">📅 '+TT('本周挑战','This week','Cabaran minggu ini')+' <small style="opacity:.7">'+TT('还剩 '+left+' 天，每项 ⭐1',left+' days left · ⭐1 each',left+' hari lagi · ⭐1 setiap satu')+'</small></div>'+
    weekly.goals.map(g=>{const v=Math.min(weekProg(g),g.n);return '<div class="li" style="'+(g.done?'opacity:.6':'')+'"><div class="e">'+(g.done?'✅':'📌')+'</div><div class="t"><b>'+WEEK_TXT[g.k](g)+'</b><small>+💵'+fmtN(g.cash)+' ⭐1</small><div class="bar"><i style="width:'+(v/g.n*100)+'%"></i></div></div><div>'+fmtN(v)+'/'+fmtN(g.n)+'</div></div>';}).join('')+
    '<p class="sub" style="margin-top:8px">🔥 '+TT('连续签到 '+streak.n+' 天（每 7 天送 ⭐1）','Login streak: '+streak.n+(streak.n===1?' day':' days')+' (⭐1 every 7 days)','Log masuk berturut: '+streak.n+' hari (⭐1 setiap 7 hari)')+
    (stats.lastRating?' · '+TT('昨日评价','Yesterday','Semalam')+' '+starStr(stats.lastRating):'')+'</p>';}
/* badge on ⭐ when something can be bought, and live refresh of open shop tabs */
let affKey='';
function updBadge(){if(NET.mode==='guest'){hubBtnEl.classList.remove('dot');return;}let k='';
  for(const s of stations()){const lv=stLv[s.k]||0;if(lv<BAL.stMax&&money>=stCost(s.k,lv))k+=s.k+',';}
  const allDone=pads.every(p=>p.done);for(const t of TOWN)if(allDone&&!hasT(t.id)&&money>=townCost(t))k+='t'+t.id;
  for(const pk of PERKS)if(PK(pk.k)<pk.max&&(legacy.stars||0)>PK(pk.k))k+='k'+pk.k;
  hubBtnEl.classList.toggle('dot',!!k);if(k!==affKey){affKey=k;if(!hubEl.hidden&&(hubTab==='up'||hubTab==='town'||hubTab==='branch'))renderHub();}}

/* ---------- festivals (every 5th in-game day) ---------- */
const festMatA=new THREE.MeshLambertMaterial({color:0xe53935,emissive:0xe53935,emissiveIntensity:0.5}),festMatB=new THREE.MeshLambertMaterial({color:0xffc107,emissive:0xffc107,emissiveIntensity:0.5});
const festG=new THREE.Group();scene.add(festG);festG.visible=false;
for(let x=-10.5;x<=42.5;x+=1.2){const m=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),((x*10|0)%2)?festMatA:festMatB);m.position.set(x,2.55+Math.sin(x*1.3)*0.12,0.5);m.scale.y=1.3;festG.add(m);}
box(53.6,0.03,0.03,0x555555,16,2.62,0.5,festG,false);
const festBanner=canvasSprite(512,128,4.2,1.05);festBanner.s.position.set(0,3.6,0.6);festG.add(festBanner.s);
let festRefill=0,festAnnounced=0;
function festOf(n){const P=TW()===3?3:5;return n%P===0?FESTS[((n/P)-1)%FESTS.length]:null;}
function festUpdate(dt){
  const f=festOf(dayN);
  if(f!==curFest){
    if(curFest){const sh=shelves[curFest.item];sh.unlocked=false;sh.g.visible=false;sh.sol.active=false;sh.count=0;sh.refresh();}
    curFest=f;festG.visible=!!f;
    if(f){unlockShelf(f.item,NET.mode!=='guest');if(NET.mode!=='guest'){shelves[f.item].count=5;shelves[f.item].refresh();}festMatA.color.setHex(f.c1);festMatA.emissive.setHex(f.c1);festMatB.color.setHex(f.c2);festMatB.emissive.setHex(f.c2);
      const x=festBanner.ctx;x.clearRect(0,0,512,128);rrect(x,6,6,500,116,50);x.fillStyle='#'+f.c1.toString(16).padStart(6,'0');x.fill();x.lineWidth=8;x.strokeStyle='#fff';x.stroke();
      x.fillStyle='#fff';x.font='900 60px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(f.e+' '+TT(f.n+'快乐',L(f.n),'Selamat '+L(f.n))+' '+f.e,256,68);festBanner.tex.needsUpdate=true;
      if(T>2)toast(f.e+' 今天是'+f.n+'！门口的节日货架卖'+ITEM[f.item].e+'，客人特别多',3000);}
  }
  if(NET.mode!=='guest'){
    if(curFest){festRefill+=dt;const sh=shelves[curFest.item];if(festRefill>1.4&&sh.count+sh.incoming<sh.max){festRefill=0;sh.count++;sh.refresh();}}
    const nx=festOf(dayN+1);if(nx&&festAnnounced!==dayN&&hourOf(dayT)>=19){festAnnounced=dayN;toast('📅 明天是'+nx.n+' '+nx.e+'，记得多备货！',2600);}
  }
  festMatA.emissiveIntensity=festMatB.emissiveIntensity=0.35+0.3*Math.abs(Math.sin(T*2));
}

/* ---------- decorations: floor, shelves, hats ---------- */
function makeHat(k){const g=new THREE.Group();g.position.y=1.62;
  if(k==='straw'){cyl(0.5,0.5,0.04,0xf2d16b,0,0.02,0,g,16);cyl(0.24,0.27,0.2,0xf2d16b,0,0.12,0,g,14);cyl(0.275,0.275,0.05,0x4a90e2,0,0.06,0,g,14);}
  else if(k==='chef'){cyl(0.24,0.24,0.26,0xffffff,0,0.13,0,g,14);sph(0.3,0xffffff,0,0.36,0,g).scale.set(1,0.6,1);}
  else if(k==='cap'){const d=new THREE.Mesh(CG.hat,M(0xe53935));d.position.y=-0.2;g.add(d);box(0.34,0.03,0.24,0xe53935,0,-0.08,0.34,g);}
  else if(k==='bunny'){for(const x of [-0.12,0.12]){const e=sph(0.08,0xffffff,x,0.25,0,g);e.scale.set(0.8,3,0.5);const i=sph(0.05,0xffb6c8,x,0.25,0.03,g);i.scale.set(0.7,2.6,0.3);}}
  else if(k==='crown'){g.position.y=1.64;addCrown(g);g.children[0].position.y=0.02;}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
let playerHat=null;
function myHat(){return DECOR.hat[decor.hat]?DECOR.hat[decor.hat].k:'none';}
function applyHat(){if(playerHat){player.remove(playerHat);playerHat=null;}const k=myHat();if(k!=='none'){playerHat=makeHat(k);player.add(playerHat);}try{localStorage.setItem('fm-hat',String(decor.hat));}catch(_){}}
function setAvatarHat(a,k){k=k||'none';if(a.hatK===k)return;a.hatK=k;if(a.hatG){a.g.remove(a.hatG);a.hatG=null;}if(k!=='none'&&DECOR.hat.some(h=>h.k===k)){a.hatG=makeHat(k);a.g.add(a.hatG);}}
function applyDecor(){const f=DECOR.floor[decor.floor]||DECOR.floor[0];westFloorMat.color.setHex(f.c);if(expanded)eastFloorMat.color.setHex(f.c);
  const sc=(DECOR.shelf[decor.shelf]||DECOR.shelf[0]).c;shelfMats.forEach((m,i)=>m.color.setHex(sc[i]));recolorShelves();}
function buyDecor(kind,i){const it=DECOR[kind][i];const key=kind+':'+i;
  if(!decor.owned[key]){if(NET.mode==='guest'){hubMsg('联机时只能换已拥有的帽子');return;}if(money<it.cost){hubMsg('钱不够：需要 💵'+it.cost);return;}money-=it.cost;decor.owned[key]=1;chord();}
  if(NET.mode==='guest'&&kind!=='hat'){hubMsg('联机时店铺装修由房主决定');return;}
  decor[kind]=i;if(kind==='hat')applyHat();else applyDecor();save();renderHub();}

/* ---------- leaderboard (Supabase) ---------- */
let scoreT=5,lastScoreKey='';
function scoreTick(dt){scoreT-=dt;if(scoreT>0)return;scoreT=60;submitScore();}
async function submitScore(){if(!sb||!cloud||NET.mode==='guest')return;const key=[NET.nick,Math.floor(stats.earned),progressNow(),story.done?12:story.ch].join('|');if(key===lastScoreKey)return;
  try{await sb.rpc('fm_score',{p_id:cloud.id,p_secret:cloud.secret,p_name:NET.nick,p_earned:Math.floor(stats.earned),p_progress:progressNow(),p_story:story.done?STORY.length:story.ch});lastScoreKey=key;}catch(_){}}

/* ---------- hub panel (rank / achievements / VIP / decor / settings) ---------- */
const hubBtnEl=document.getElementById('hubBtn'),hubEl=document.getElementById('hub'),hubBody=document.getElementById('hubBody'),hubSet=document.getElementById('hubSet'),hubStatus=document.getElementById('hubStatus');
let hubTab='rank',rankKind='earned';
function hubMsg(t){hubStatus.textContent=L(t);}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'K':String(Math.floor(v));
async function renderRank(){
  const kinds=[['weekly','📅 本周收入'],['earned','💵 累计收入'],['progress','🏪 解锁进度'],['story','📖 故事进度']];
  let h='<div class="row">'+kinds.map(([k,n])=>'<button class="sbtn'+(k===rankKind?'':' ghost')+'" data-rk="'+k+'">'+n+'</button>').join('')+'</div><div id="rankList"><p class="sub">读取中…</p></div>';
  hubBody.innerHTML=h;hubBody.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{rankKind=b.dataset.rk;renderRank();});
  const el=document.getElementById('rankList');
  if(!sb&&CFG.supabaseUrl&&CFG.supabaseAnonKey){await sbReady;}
  if(!sb){el.innerHTML='<p class="sub">排行榜需要站长配置 Supabase（看 README）。</p>';trDom(el);return;}
  await submitScore();
  try{const {data,error}=await sb.rpc('fm_top',{p_kind:rankKind});if(error)throw error;
    let mine=null;if(cloud){const r=await sb.rpc('fm_rank',{p_id:cloud.id,p_kind:rankKind});if(!r.error)mine=r.data;}
    const unit=(rankKind==='earned'||rankKind==='weekly')?v=>'💵'+fmtN(v):rankKind==='progress'?v=>v+'/'+TOTAL_STEPS:v=>(v>=STORY.length?L('通关 🎉'):TT('第'+(v+1)+'章','Ch. '+(v+1),'Bab '+(v+1)));
    setTimeout(()=>trDom(el),0);el.innerHTML=(mine?'<p class="sub">我的排名：<b>#'+mine+'</b>（'+esc(NET.nick)+'）</p>':'')+((data||[]).map(r=>'<div class="li"><div class="e">'+(r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank)+'</div><div class="t"><b>'+esc(r.nickname||'玩家')+'</b><small>…'+esc(r.tag||'')+'</small></div><div>'+unit(+r.value)+'</div></div>').join('')||'<p class="sub">还没有人上榜，快来当第一名！</p>');trDom(el);}
  catch(e){el.innerHTML='<p class="sub">排行榜暂时连不上：'+esc(e.message||'网络问题')+'</p>';trDom(el);}
}
const HUB_GROUPS={grow:['up','town','branch'],coll:['ach','book','vip']},hubLast={grow:'up',coll:'ach'};
const hubGroupOf=t=>{for(const g in HUB_GROUPS)if(HUB_GROUPS[g].includes(t))return g;return t;};
const SUB_LBL={up:TT('⬆️ 升星','⬆️ Stars','⬆️ Bintang'),town:TT('🏙️ 小镇','🏙️ Town','🏙️ Pekan'),branch:TT('🏪 分店','🏪 Branch','🏪 Cawangan'),
  ach:TT('🎖️ 挑战与成就','🎖️ Goals','🎖️ Cabaran'),book:TT('📚 图鉴','📚 Book','📚 Koleksi'),vip:TT('⭐ 常客','⭐ Regulars','⭐ Pelanggan tetap')};
function renderHub(){renderHub0();const g=hubGroupOf(hubTab);
  if(HUB_GROUPS[g]){hubLast[g]=hubTab;hubBody.insertAdjacentHTML('afterbegin','<div class="subtabs" role="tablist">'+HUB_GROUPS[g].map(t=>'<button type="button" role="tab" aria-selected="'+(t===hubTab)+'" class="'+(t===hubTab?'on':'')+'" data-sub="'+t+'">'+SUB_LBL[t]+'</button>').join('')+'</div>');
    hubBody.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{hubTab=b.dataset.sub;hubMsg('');renderHub();hubBody.scrollTop=0;});}
  trDom(hubEl);}
function renderHub0(){
  hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===hubGroupOf(hubTab)));
  hubSet.hidden=hubTab!=='set';hubBody.hidden=hubTab==='set';
  if(hubTab==='rank'){renderRank();return;}
  if(hubTab==='book'){const cl=stats.bookClaimed||(stats.bookClaimed={});
    hubBody.innerHTML=bookPages().map(p=>{const got=p.items.filter(i=>i.ok).length,all=got===p.items.length;
      return '<div class="sec" style="font-weight:900;margin:10px 0 4px">'+p.n+' '+got+'/'+p.items.length+'</div><div class="stock">'+p.items.map(i=>'<span class="chip2" style="'+(i.ok?'':'opacity:.25;filter:grayscale(1)')+'" title="'+esc(i.t||'')+'">'+i.e+(i.t?'<small style="font-size:10px;display:block">'+esc(i.t)+'</small>':'')+'</span>').join('')+'</div>'+
        '<div class="row"><button class="sbtn'+(cl[p.id]||!all?' ghost':'')+'" data-bk="'+p.id+'"'+(cl[p.id]||!all?' disabled':'')+'>'+(cl[p.id]?'已领取':all?'领取奖励 💵'+p.r:'集齐这一页奖励 💵'+p.r)+'</button></div>';}).join('');
    hubBody.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const p=bookPages().find(x=>x.id===b.dataset.bk);if(!p||cl[p.id]||NET.mode==='guest')return;cl[p.id]=1;money+=p.r;chord();toast('📚 '+L(p.n)+' +💵'+p.r);save();renderHub();});return;}
  if(hubTab==='up'){
    if(NET.mode==='guest'){hubBody.innerHTML='<p class="sub">'+TT('联机时由房主升级店铺。','The host upgrades the shop during co-op.','Semasa main bersama, hanya hos yang boleh menaik taraf kedai.')+'</p>';return;}
    const list=stations(),row=s=>{const lv=stLv[s.k]||0,mx=lv>=BAL.stMax,c=mx?0:stCost(s.k,lv),ok=!mx&&money>=c;
      const eff=s.kind==='s'?TT('售价','Price','Harga')+' +'+lv*10+'%':TT('速度','Speed','Kelajuan')+' ×'+(1/Math.pow(BAL.stSpeed,lv)).toFixed(2);
      return '<div class="li"><div class="e">'+s.e+'</div><div class="t"><b><span class="stars">★'+lv+'</span><small>/'+BAL.stMax+'</small> · '+eff+'</b><div class="bar"><i style="width:'+lv*10+'%"></i></div></div><button class="sbtn'+(ok?'':' ghost')+'" data-st="'+s.k+'"'+(ok?'':' disabled')+'>'+(mx?'✅':'💵'+fmtN(c))+'</button></div>';};
    const sec=(kind,title)=>{const it=list.filter(s=>s.kind===kind);return it.length?'<div class="sec" style="font-weight:900;margin:10px 0 2px">'+title+'</div>'+it.map(row).join(''):'';};
    hubBody.innerHTML='<p class="sub">'+TT('每颗星：货架售价 +10%，田地和机器快 11%。最多 10 星。','Each star: shelf price +10%, fields and machines 11% faster. Up to 10 stars.','Setiap bintang: harga rak +10%, ladang dan mesin 11% lebih laju. Maksimum 10 bintang.')+' <b>'+TT('本店共','This shop:','Kedai ini:')+' ★'+totalStars()+'</b></p>'+
      sec('s',TT('🗄️ 货架','🗄️ Shelves','🗄️ Rak'))+sec('p',TT('🌱 田地','🌱 Fields','🌱 Ladang'))+sec('m',TT('⚙️ 机器','⚙️ Machines','⚙️ Mesin'));
    hubBody.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>buyStation(b.dataset.st));return;}
  if(hubTab==='town'){const done=pads.every(p=>p.done);
    let h='<p class="sub">'+TT('镇长的委托：出钱建设小镇，吸引新的客人。每个项目都有永久效果（开分店后重新建设）。','The mayor\'s requests: fund town projects that bring new shoppers. Each has a lasting effect (rebuilt in each branch).','Permintaan datuk bandar: biayai projek pekan yang menarik pelanggan baharu. Setiap projek memberi kesan kekal (dibina semula di setiap cawangan).')+'</p>';
    if(!done)h+='<p class="sub"><b>🔒 '+TT('先建好店里全部设施','Finish every upgrade square in the shop first','Siapkan semua petak naik taraf di kedai dahulu')+'</b> ('+pads.filter(p=>p.done).length+'/'+pads.length+')</p>';
    h+=TOWN.map(t=>{const own=hasT(t.id),c=townCost(t),ok=done&&!own&&money>=c&&NET.mode!=='guest';
      return '<div class="li"'+(own?' style="opacity:.65"':'')+'><div class="e">'+t.e+'</div><div class="t"><b>'+t.n+'</b><small>'+t.d+'</small></div><button class="sbtn'+(ok?'':' ghost')+'" data-tw="'+t.id+'"'+(ok?'':' disabled')+'>'+(own?'✅':'💵'+fmtN(c))+'</button></div>';}).join('');
    hubBody.innerHTML=h;hubBody.querySelectorAll('[data-tw]').forEach(b=>b.onclick=()=>buildTown(b.dataset.tw));return;}
  if(hubTab==='branch'){const th=THEMES[(legacy.n||0)%THEMES.length],nx=THEMES[((legacy.n||0)+1)%THEMES.length];const ok=pads.every(p=>p.done)&&NET.mode!=='guest';
    hubBody.innerHTML='<div class="sec" style="font-weight:900;margin:6px 0">🏪 '+TT('当前：第 '+((legacy.n||0)+1)+' 号店 · ','Now: branch #'+((legacy.n||0)+1)+' · ','Kini: cawangan #'+((legacy.n||0)+1)+' · ')+th.n+'</div>'+
      '<p class="sub">'+TT('收入加成','Income bonus','Bonus pendapatan')+' +'+(legacy.n||0)*25+'%</p><p class="sub">开分店会重新开始建店（金钱、设施、货架清零），但保留成就、常客好感、装扮、图鉴和故事，并永久增加 25% 收入。</p>'+
      '<p class="sub">'+THEME_INFO[(legacy.n||0)%4]+'</p>'+
      '<div class="sec" style="font-weight:900;margin:10px 0 2px">⭐ '+TT('店长星星：','Manager stars: ','Bintang pengurus: ')+(legacy.stars||0)+'</div><p class="sub">'+TT('开分店、每周挑战和连续签到都能得到星星，用来买永久加成（开分店后也保留）。','Earn stars from branches, weekly challenges and login streaks, and spend them on permanent perks that carry over.','Dapatkan bintang daripada cawangan, cabaran mingguan dan log masuk berturut, untuk faedah kekal.')+'</p>'+
      PERKS.map(pk=>{const lv=PK(pk.k),mx=lv>=pk.max,c=lv+1,ok=!mx&&(legacy.stars||0)>=c&&NET.mode!=='guest';return '<div class="li"><div class="e">'+pk.e+'</div><div class="t"><b>'+pk.n+' <span class="stars">'+lv+'/'+pk.max+'</span></b><small>'+pk.d+'</small></div><button class="sbtn'+(ok?'':' ghost')+'" data-pk="'+pk.k+'"'+(ok?'':' disabled')+'>'+(mx?'✅':'⭐'+c)+'</button></div>';}).join('')+
      '<div class="sec" style="font-weight:900;margin:10px 0 2px">'+TT('下一家：','Next: ','Seterusnya: ')+nx.n+'</div><p class="sub">'+THEME_INFO[((legacy.n||0)+1)%4]+' '+TT('建设成本 ×','Build costs ×','Kos bina ×')+(1+BAL.branchCost*((legacy.n||0)+1)).toFixed(1)+'。'+TT('这次开店可得 ⭐','Opening now earns ⭐','Buka sekarang untuk dapat ⭐')+branchStars()+'</p><div class="row"><button class="big'+(ok?'':' ghost')+'" id="brBtn"'+(ok?'':' disabled')+'>'+(ok?'开分店！':'先建好全部设施才能开分店')+'</button></div>';
    hubBody.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>buyPerk(b.dataset.pk));
    const bb=document.getElementById('brBtn');if(bb&&ok)bb.onclick=()=>{if(bb.dataset.arm){openBranch();}else{bb.dataset.arm='1';bb.textContent=L('再点一次确认开分店');}};return;}
  if(hubTab==='ach'){const n=ACH.filter(a=>ACH_STATE[a.id]).length;
    hubBody.innerHTML=weeklyHtml()+'<p class="sub" style="margin-top:10px">已达成 '+n+'/'+ACH.length+'</p>'+ACH.map(a=>{const [x,y]=a.v();const ok=!!ACH_STATE[a.id];const v=Math.max(0,Math.min(x,y));
      return '<div class="li" style="'+(ok?'':'opacity:.75')+'"><div class="e">'+(ok?a.e:'🔒')+'</div><div class="t"><b>'+a.n+'</b><small>'+a.d+' · 奖励 💵'+a.r+'</small><div class="bar"><i style="width:'+(ok?100:v/y*100)+'%"></i></div></div><div>'+(ok?'✅':fmtN(v)+'/'+fmtN(y))+'</div></div>';}).join('');return;}
  if(hubTab==='vip'){hubBody.innerHTML='<p class="sub">常客会不定期来店里，买得多、付双倍。让他们买齐东西就能加好感，好感到 3、6、10 颗心会送你谢礼。</p>'+
    VIPS.map(v=>{const h=vipState[v.n]||0;return '<div class="li"><div class="e">⭐</div><div class="t"><b>'+v.n+'</b><small>'+(h?'❤️'.repeat(Math.min(h,10)):'还不熟')+'</small></div><div>'+h+'/10</div></div>';}).join('');return;}
  if(hubTab==='decor'){const sec=(kind,title)=>'<div class="sec" style="font-weight:900;margin:8px 0 4px">'+title+'</div>'+DECOR[kind].map((it,i)=>{const own=decor.owned[kind+':'+i],use=decor[kind]===i;
      const sw=kind==='hat'?'':'<span style="display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:middle;margin-right:6px;background:#'+(kind==='floor'?it.c:it.c[0]).toString(16).padStart(6,'0')+'"></span>';
      return '<div class="li"><div class="t"><b>'+sw+it.n+'</b></div><button class="sbtn'+(use?' ghost':'')+'" data-dk="'+kind+'" data-di="'+i+'"'+(use?' disabled':'')+'>'+(use?'使用中':own?'使用':'💵'+it.cost)+'</button></div>';}).join('');
    hubBody.innerHTML=sec('floor','🟫 地板颜色')+sec('shelf','🗄️ 货架颜色')+sec('hat','🎩 帽子');
    hubBody.querySelectorAll('[data-dk]').forEach(b=>b.onclick=()=>buyDecor(b.dataset.dk,+b.dataset.di));return;}
}
function renderSettings(){setTimeout(()=>trDom(hubSet),0);
  document.getElementById('vibBtn').textContent=GFX.vib?'📳 震动：开':'📳 震动：关';document.getElementById('joyBtn').textContent={float:'🕹️ 摇杆：跟随手指',left:'🕹️ 摇杆：固定左下',right:'🕹️ 摇杆：固定右下'}[GFX.joy||'float'];
  ['zh','en','ms'].forEach(l=>document.getElementById('lang-'+l).classList.toggle('ghost',LANG!==l));document.getElementById('musBtn').textContent=MUS.on?'🎵 音乐：开':'🎵 音乐：关';sndBtn.textContent=soundOn?'🔊 音效：开':'🔇 音效：关';
  ['high','mid','low'].forEach(q=>document.getElementById('gfx-'+q).classList.toggle('ghost',GFX.q!==q));document.getElementById('fpsBtn').textContent=GFX.fps30?'🔋 省电 30 帧：开':'🔋 省电 30 帧：关';
  document.getElementById('tapBtn').textContent=TT('👆 点地面走过去：','👆 Tap to walk: ','👆 Ketik untuk berjalan: ')+(GFX.tap?TT('开','on','hidup'):TT('关','off','mati'));
  document.getElementById('nick2').value=NET.nick;}
document.getElementById('hubBtn').onclick=()=>{hubMsg('');hubEl.hidden=false;renderSettings();renderHub();};
document.getElementById('hubClose').onclick=()=>{hubEl.hidden=true;};
hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;hubTab=HUB_GROUPS[t]?hubLast[t]:t;hubMsg('');renderSettings();renderHub();});
document.getElementById('musBtn').onclick=()=>{MUS.on=!MUS.on;initAudio();saveSettings();renderSettings();};
['high','mid','low'].forEach(q=>document.getElementById('gfx-'+q).onclick=()=>{GFX.q=q;applyGfx();saveSettings();renderSettings();hubMsg(q==='low'?'已切到流畅画质（关闭阴影）':'画质已更新');});
document.getElementById('vibBtn').onclick=()=>{GFX.vib=!GFX.vib;saveSettings();renderSettings();vib(20);};
document.getElementById('joyBtn').onclick=()=>{GFX.joy={float:'left',left:'right',right:'float'}[GFX.joy||'float'];saveSettings();renderSettings();showFixedJoy();};
['zh','en','ms'].forEach(l=>document.getElementById('lang-'+l).onclick=()=>{if(l===LANG)return;try{localStorage.setItem('fm-lang',l);}catch(_){}save();resetting=true;location.reload();});
document.getElementById('fpsBtn').onclick=()=>{GFX.fps30=!GFX.fps30;saveSettings();renderSettings();};
document.getElementById('tapBtn').onclick=()=>{GFX.tap=!GFX.tap;tapPath.length=0;saveSettings();renderSettings();};
document.getElementById('nick2').addEventListener('input',e=>{NET.nick=cleanName(e.target.value);nickEl.value=NET.nick;try{localStorage.setItem('fm-nick',NET.nick);}catch(_){}});
if(NET.mode==='guest'){try{const h=+localStorage.getItem('fm-hat');if(h>0&&DECOR.hat[h])decor.hat=h;}catch(_){}}
applyDecor();applyHat();applyTheme();trDom(document.body);showFixedJoy();

/* ---------- static batching ----------
   The town is built from ~1,900 little boxes, cones and spheres, each its own draw call and each
   matrix-updated every frame. Once everything is built we merge meshes that never move into a
   few big meshes per area (vertex colours carry the original colours), then freeze their
   matrices. Spatial cells keep frustum culling useful. Materials that change at runtime (floor
   and shelf decor, night glow, branch themes, glass, festival lights) keep their own material. */
function bakeStatic(){
  const THEMED=new Set([0x8fd96b,0x4fbf4a,0x62d15a]),LIT=new Set([0xebe6f3,0xfbdab7,0xdbe9f7,0xf6f2fb]);
  const plain=new Set();for(const k in mats){const h=+k;if(!THEMED.has(h)&&!LIT.has(h))plain.add(mats[k]);}
  const shared=new Set([...Object.values(GEO),...Object.values(CG),padGeo,...mergeCache.values()]);
  const ok=m=>m.isMesh&&!m.isInstancedMesh&&m.visible&&m.renderOrder===0&&m.material&&!Array.isArray(m.material)&&!m.material.map&&!m.children.length&&m.geometry.attributes.normal;
  const collect=(root,out)=>{for(const c of root.children){const u=c.userData;if(u.live||u.nb||!c.visible)continue;if(u.moves){bakeRoot(c);continue;}if(ok(c))out.push(c);else if(c.children.length)collect(c,out);}};
  const bakeRoot=r=>{const out=[];collect(r,out);mergeInto(r,out);};
  const tv=new THREE.Vector3(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3();
  function bakeGeo(list,inv,vc,shelf){let nv=0,ni=0;for(const m of list){const g=m.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=vc?new Float32Array(nv*3):null,idx=new (nv>65535?Uint32Array:Uint16Array)(ni);let vo=0,io=0;
    for(const m of list){const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,cr=m.material.color;m4.multiplyMatrices(inv,m.matrixWorld);nm.getNormalMatrix(m4);
      for(let i=0;i<p.count;i++){const j=(vo+i)*3;tv.fromBufferAttribute(p,i).applyMatrix4(m4);pos[j]=tv.x;pos[j+1]=tv.y;pos[j+2]=tv.z;
        tv.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor[j]=tv.x;nor[j+1]=tv.y;nor[j+2]=tv.z;if(col){col[j]=cr.r;col[j+1]=cr.g;col[j+2]=cr.b;}}
      if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io+i]=a[i]+vo;io+=a.length;}else{for(let i=0;i<p.count;i++)idx[io+i]=vo+i;io+=p.count;}vo+=p.count;}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    if(shelf){const sl=new Uint8Array(nv);let o2=0;for(const m of list){const n=m.geometry.attributes.position.count;sl.fill(shelfMats.indexOf(m.material),o2,o2+n);o2+=n;}bg.userData.slots=sl;SHELF_GEOS.push(bg);}
    if(col)bg.setAttribute('color',new THREE.BufferAttribute(col,3));bg.setIndex(new THREE.BufferAttribute(idx,1));bg.computeBoundingSphere();return bg;}
  function mergeInto(root,list,cell=14){if(list.length<2)return;root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const buckets=new Map();
    for(const m of list){const sh=shelfMats.includes(m.material),vc=sh||plain.has(m.material);const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();tv.copy(g.boundingSphere.center).applyMatrix4(m.matrixWorld);
      const key=(sh?'sh':vc?'vc':m.material.uuid)+(m.castShadow?'|c|':'|n|')+Math.floor(tv.x/cell)+','+Math.floor(tv.z/cell);let b=buckets.get(key);
      if(!b)buckets.set(key,b={vc,sh,mat:sh?SHELF_VC:m.material,cast:m.castShadow,list:[]});b.list.push(m);}
    // a lone non-shadow mesh joins its shadow-casting neighbour rather than costing its own draw
    for(const [k,b] of buckets){if(b.list.length!==1||b.cast)continue;const o=buckets.get(k.replace('|n|','|c|'));if(o){o.list.push(b.list[0]);b.list=[];}}
    for(const b of buckets.values()){if(b.list.length<(b.sh?1:2))continue;let chunk=[],nv=0;
      const flush=()=>{if(chunk.length>(b.sh?0:1)){const mm=new THREE.Mesh(bakeGeo(chunk,inv,b.vc,b.sh),b.sh?SHELF_VC:b.vc?VCMAT:b.mat);mm.castShadow=b.cast;mm.receiveShadow=true;root.add(mm);
          for(const o of chunk){o.parent.remove(o);if(!shared.has(o.geometry))o.geometry.dispose();}}chunk=[];nv=0;};
      for(const m of b.list){const n=m.geometry.attributes.position.count;if(nv+n>65000)flush();chunk.push(m);nv+=n;}flush();}}
  scene.updateMatrixWorld(true);const loose=[];
  for(const c of [...scene.children]){const u=c.userData;if(u.live||u.nb||!c.visible&&c.isMesh)continue;
    if(u.flat)collect(c,loose);else if(c.isMesh){if(ok(c))loose.push(c);}else if(c.children.length)bakeRoot(c);}
  mergeInto(scene,loose,24);
  // freeze local matrices of everything that never moves (pop() re-enables them briefly)
  const freeze=o=>{for(const c of o.children){const u=c.userData;if(u.live)continue;if(!u.moves){c.updateMatrix();c.matrixAutoUpdate=false;u.frozen=1;}freeze(c);}};
  freeze(scene);
}
bakeStatic();applyTownVis();refreshSigns();
if(stats.coop==null)stats.coop=0;

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
/* ---------- 🌱 my farm: real-time crops, care, levels, and visiting friends (Happy-Farm-style) ----------
   Crops grow on the real clock (they keep growing while the game is closed). Each crop may get thirsty,
   weedy or buggy partway through; each problem left unfixed at harvest cuts the yield. Harvesting a crop
   the shop also sells refills that field in the shop ("farm fresh"). With cloud save on, friends can visit,
   help (water / weed / catch bugs) for a small reward, or take a little from ripe crops (server-limited). */
const SEEDS=[{k:'tomato',e:'🍅',min:3,val:40,lv:1},{k:'carrot',e:'🥕',min:10,val:110,lv:1},{k:'corn',e:'🌽',min:30,val:280,lv:2},
 {k:'strawberry',e:'🍓',min:60,val:520,lv:3},{k:'pumpkin',e:'🎃',min:240,val:1700,lv:4},{k:'watermelon',e:'🍉',min:480,val:3000,lv:6}];
const NEED_E={water:'💧',weed:'🌿',bug:'🐛'},FARM_MAX=12;
const fSave=()=>{const f=stats.farm||(stats.farm={lvl:1,xp:0,plots:[],guard:false,friends:[],log:[],since:null});while(f.plots.length<FARM_MAX)f.plots.push(null);return f;};
const fPlots=()=>Math.min(FARM_MAX,3+fSave().lvl);
const fNeedXp=l=>Math.round(60*Math.pow(l,1.6));
const seedOf=k=>SEEDS.find(s=>s.k===k);
const fProg=(p,now)=>Math.min(1,(now-p.at)/p.dur);
const fNeed=(p,now)=>{const g=fProg(p,now);if(g>=1)return null;return (p.nd||[]).find(n=>!n.ok&&g>=n.thr)||null;};
function fStatus(){const f=fSave(),now=Date.now();let ripe=0,care=0;for(let i=0;i<fPlots();i++){const p=f.plots[i];if(!p)continue;if(fProg(p,now)>=1)ripe++;else if(fNeed(p,now))care++;}return {ripe,care};}
const FM={view:null,sheet:null,pubT:0,markT:0,msg:'',msgT:0};
function fMsg(t){FM.msg=t;FM.msgT=2.2;}
function fPlant(i,k){const f=fSave(),sd=seedOf(k),cost=Math.round(sd.val*0.25*rewardMul());if(money<cost){fMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  money-=cost;const r=Math.random,nd=[{k:'water',thr:0.3+r()*0.1,ok:false}];if(r()<0.55)nd.push({k:'weed',thr:0.5+r()*0.1,ok:false});if(r()<0.4)nd.push({k:'bug',thr:0.7+r()*0.1,ok:false});
  f.plots[i]={s:k,at:Date.now(),dur:sd.min*60000,nd,stolen:0};FM.sheet=null;fDirty();blip(520,0.05);fRenderUI();}
function fHarvest(i,quiet){const f=fSave(),p=f.plots[i],sd=seedOf(p.s),now=Date.now();const miss=(p.nd||[]).filter(n=>!n.ok).length,st=Math.min(2,p.stolen||0);
  const mult=Math.max(0.35,1-0.2*miss-0.12*st),cash=Math.round(sd.val*mult*rewardMul());money+=cash;f.xp+=Math.round(sd.min*1.5+5);f.plots[i]=null;
  let lvUp=false;while(f.xp>=fNeedXp(f.lvl)){f.xp-=fNeedXp(f.lvl);f.lvl++;lvUp=true;}
  const pr=producers[sd.k];if(pr&&pr.unlocked&&NET.mode!=='guest'){pr.count=pr.max;pr.refresh();}
  stats.harvests=(stats.harvests||0)+1;if(!quiet)fMsg(sd.e+' +💵'+fmtN(cash)+(miss?'  ('+TT('没照顾好','missed care','kurang dijaga')+' -'+Math.round(miss*20)+'%)':''));
  if(lvUp){toast('🌱 '+TT('农场升到 '+f.lvl+' 级！','Farm level '+f.lvl+'!','Ladang tahap '+f.lvl+'!'),2400);chord();}fDirty();return cash;}
function fFix(i){const p=fSave().plots[i],n=fNeed(p,Date.now());if(!n)return;n.ok=true;blip(760,0.05,'sine',0.05);fDirty();}
function fDirty(){FM.pubT=Math.min(FM.pubT||5,5);save();}
/* cloud: publish my farm, pull what visitors did */
function fPublic(){const f=fSave();return {l:f.lvl,g:!!f.guard,p:f.plots.slice(0,fPlots()).map(p=>p?{s:p.s,at:p.at,dur:p.dur,n:Object.fromEntries((p.nd||[]).filter(n=>!n.ok).map(n=>[n.k,+n.thr.toFixed(3)]))}:null)};}
async function fPublish(){if(!sb||!cloud)return;try{await rpc('fm_farm_put',{p_id:cloud.id,p_secret:cloud.secret,p_name:NET.nick,p_farm:fPublic()});}catch(_){}}
async function fPullMarks(){if(!sb||!cloud)return;const f=fSave();try{const rows=await rpc('fm_farm_marks',{p_id:cloud.id,p_secret:cloud.secret,p_since:f.since});
  for(const r of rows||[]){const p=f.plots[r.plot];f.since=r.at;if(!p||+p.at!==+r.planted_at)continue;const who=r.by_name||'?';
    if(r.kind==='steal'){p.stolen=(p.stolen||0)+1;f.log.unshift('🥷 '+who+' '+TT('拿走了一点','took a little','ambil sedikit')+' '+seedOf(p.s).e);}
    else{const n=(p.nd||[]).find(x=>x.k===r.kind);if(n)n.ok=true;f.log.unshift('🤝 '+who+' '+TT('帮你','helped with','bantu')+' '+NEED_E[r.kind]);}}
  f.log=f.log.slice(0,12);if((rows||[]).length){save();fRenderUI();}}catch(_){}}
function farmTick(dt){if(!sb||!cloud||NET.mode==='guest')return;if(FM.pubT>0){FM.pubT-=dt;if(FM.pubT<=0)fPublish();}FM.markT-=dt;if(FM.markT<=0){FM.markT=MINI.on==='f'?30:180;fPullMarks();}}
async function fVisit(id){if(!sb){fMsg(TT('需要先配置云存档','Cloud save needs to be set up first','Simpanan awan perlu disediakan dahulu'));return;}
  try{const rows=await rpc('fm_farm_get',{p_target:id});const r=Array.isArray(rows)?rows[0]:rows;if(!r){fMsg(TT('找不到这个农场','Farm not found','Ladang tidak dijumpai'));return;}
    FM.view={id,name:r.nickname||id,farm:r.farm||{p:[]}};FM.sheet=null;const f=fSave();if(!f.friends.includes(id)&&id!==(cloud&&cloud.id)){f.friends.unshift(id);f.friends=f.friends.slice(0,20);save();}fRenderUI();}
  catch(e){fMsg(e.message||'network');}}
async function fAct(i,kind,p){if(!cloud){fMsg(TT('需要先有玩家ID','You need a player ID first','Anda perlukan ID pemain dahulu'));return;}
  try{const r=await rpc('fm_farm_act',{p_id:cloud.id,p_secret:cloud.secret,p_name:NET.nick,p_target:FM.view.id,p_plot:i,p_planted:p.at,p_kind:kind});const sd=seedOf(p.s);
    const M={ok:null,limit:TT('今天的次数用完了','Daily limit reached','Had harian dicapai'),done:TT('你已经帮过/拿过这块地了','You already did that here','Anda sudah melakukannya di sini'),empty:TT('被拿光了，或者有稻草人守着','Nothing left, or a scarecrow is guarding it','Sudah habis, atau dijaga orang-orang'),notripe:TT('还没熟','Not ripe yet','Belum masak'),noneed:TT('现在不需要帮忙','No help needed right now','Tiada bantuan diperlukan'),gone:TT('这块地已经变了','That plot changed','Petak itu sudah berubah')};
    if(r==='ok'){if(kind==='steal'){const c=Math.round(sd.val*0.15*rewardMul());money+=c;fMsg('🥷 '+sd.e+' +💵'+fmtN(c));delete p.s;}else{const c=Math.round(25*rewardMul());money+=c;fSave().xp+=3;fMsg('🤝 '+NEED_E[kind]+' +💵'+fmtN(c));delete p.n[kind];}save();}
    else fMsg(M[r]||r);}catch(e){fMsg(e.message||'network');}}
/* layout: 3 columns x 4 rows of plots */
const FL={x0:18,y0:150,w:112,h:92,gx:10,gy:12};
const fRect=i=>[FL.x0+(i%3)*(FL.w+FL.gx),FL.y0+Math.floor(i/3)*(FL.h+FL.gy),FL.w,FL.h];
function fTap(x,y){initAudio();if(FM.sheet)return;const now=Date.now();
  for(let i=0;i<FARM_MAX;i++){if(!inR(x,y,fRect(i)))continue;
    if(FM.view){const p=(FM.view.farm.p||[])[i];if(!p||!p.s)return;const g=Math.min(1,(now-p.at)/p.dur);if(g>=1){fAct(i,'steal',p);return;}
      const nk=Object.keys(p.n||{}).find(k=>g>=p.n[k]);if(nk)fAct(i,nk,p);else fMsg(TT('长得很好，不需要帮忙','Growing fine, no help needed','Tumbuh dengan baik, tiada bantuan diperlukan'));return;}
    if(i>=fPlots()){fMsg(TT('农场升级后解锁','Unlocks at a higher farm level','Dibuka pada tahap ladang lebih tinggi'));return;}
    const p=fSave().plots[i];if(!p){FM.sheet={i};fRenderUI();return;}
    if(fProg(p,now)>=1){fHarvest(i);return;}if(fNeed(p,now)){fFix(i);return;}
    const left=Math.ceil((p.dur-(now-p.at))/60000);fMsg(seedOf(p.s).e+' '+TT('还要 '+fmtDur(left),fmtDur(left)+' to go',fmtDur(left)+' lagi'));return;}}
const fmtDur=m=>m>=60?Math.floor(m/60)+TT(' 小时',' h',' jam')+(m%60?' '+(m%60)+TT(' 分',' m',' min'):''):m+TT(' 分钟',' min',' min');
function fRenderUI(){const f=fSave(),v=FM.view;let h='<button class="mclose" id="fX" aria-label="'+TT('关闭','Close','Tutup')+'">✕</button><div class="fbar">';
  if(v)h+='<button class="big" id="fHome">🏡 '+TT('回我的农场','Back to my farm','Kembali ke ladang saya')+'</button>';
  else h+='<button class="big" id="fAll">🧺 '+TT('全部收获','Harvest all','Tuai semua')+'</button><button class="big alt" id="fCare">💧 '+TT('全部照顾','Tend all','Jaga semua')+'</button><button class="big ghost" id="fFriends">👥</button>'+
    (f.guard?'':'<button class="big ghost" id="fGuard" title="'+TT('稻草人','Scarecrow','Orang-orang')+'">🧿</button>');
  h+='</div>';
  if(FM.sheet&&!v){h+='<div class="msheet fs"><div class="mhead"><b>'+TT('选种子','Pick a seed','Pilih benih')+'</b><button class="mclose2" id="fSx">✕</button></div>'+SEEDS.map(sd=>{const ok=f.lvl>=sd.lv,c=Math.round(sd.val*0.25*rewardMul());
    return '<div class="li"><div class="e">'+sd.e+'</div><div class="t"><b>'+fmtDur(sd.min)+' · +💵'+fmtN(Math.round(sd.val*rewardMul()))+'</b><small>'+(ok?TT('种子','Seed','Benih')+' 💵'+fmtN(c):'🔒 '+TT('农场 '+sd.lv+' 级','Farm level '+sd.lv,'Ladang tahap '+sd.lv))+'</small></div><button class="sbtn'+(ok&&money>=c?'':' ghost')+'" data-sd="'+sd.k+'"'+(ok&&money>=c?'':' disabled')+'>'+TT('种','Plant','Tanam')+'</button></div>';}).join('')+'</div>';}
  if(FM.sheet==='friends'){h+='<div class="msheet fs"><div class="mhead"><b>👥 '+TT('拜访朋友的农场','Visit friends\' farms','Lawat ladang kawan')+'</b><button class="mclose2" id="fSx">✕</button></div>';
    if(!sb||!cloud)h+='<p class="sub">'+TT('拜访朋友需要云存档（点 👤 查看玩家ID）。','Visiting friends needs cloud save (see 👤 for your player ID).','Untuk melawat kawan, simpanan awan diperlukan (lihat 👤 untuk ID pemain anda).')+'</p>';
    else{h+='<p class="sub">'+TT('你的农场ID：','Your farm ID: ','ID ladang anda: ')+'<b>'+cloud.id+'</b>。'+TT('帮忙浇水除虫有奖励；熟了的菜每块最多被拿 2 次（有稻草人只能 1 次），每天有次数上限。','Helping earns a reward. Each ripe crop can be taken from at most twice (once with a scarecrow), with a daily limit.','Membantu memberi ganjaran. Setiap tanaman masak boleh diambil paling banyak dua kali (sekali jika dijaga orang-orang), dengan had harian.')+'</p>'+
      '<div class="row"><input id="fId" placeholder="FM-XXXXXX" autocomplete="off"><button class="sbtn" id="fGo">'+TT('拜访','Visit','Lawat')+'</button></div>'+
      f.friends.map(id=>'<div class="li"><div class="e">🧑‍🌾</div><div class="t"><b>'+esc(id)+'</b></div><button class="sbtn" data-fv="'+esc(id)+'">'+TT('拜访','Visit','Lawat')+'</button></div>').join('')+
      '<div class="sec" style="font-weight:900;margin:10px 0 4px">'+TT('🏘️ 附近的农场','🏘️ Nearby farms','🏘️ Ladang berdekatan')+'</div><div id="fNear"><p class="sub">…</p></div>';}
    h+=(f.log.length?'<div class="sec" style="font-weight:900;margin:10px 0 4px">'+TT('📜 农场日记','📜 Farm log','📜 Log ladang')+'</div>'+f.log.map(l=>'<p class="sub" style="margin:2px 0">'+esc(l)+'</p>').join(''):'')+'</div>';}
  MINI.ui.innerHTML=h;const q=id=>document.getElementById(id);
  q('fX').onclick=()=>{FM.view=null;FM.sheet=null;miniClose();};
  if(q('fHome'))q('fHome').onclick=()=>{FM.view=null;fRenderUI();};
  if(q('fAll'))q('fAll').onclick=()=>{let n=0,c=0;const now=Date.now();for(let i=0;i<fPlots();i++){const p=f.plots[i];if(p&&fProg(p,now)>=1){c+=fHarvest(i,true);n++;}}fMsg(n?'🧺 ×'+n+' +💵'+fmtN(c):TT('还没有熟的','Nothing is ripe yet','Belum ada yang masak'));if(n)chord();};
  if(q('fCare'))q('fCare').onclick=()=>{let n=0;const now=Date.now();for(let i=0;i<fPlots();i++){const p=f.plots[i];if(p&&fNeed(p,now)){fFix(i);n++;}}fMsg(n?'💧🌿🐛 ×'+n:TT('大家都很好','Everything is fine','Semua baik'));};
  if(q('fFriends'))q('fFriends').onclick=()=>{FM.sheet='friends';fRenderUI();if(sb&&cloud)rpc('fm_farm_random',{p_id:cloud.id}).then(rows=>{const el=q('fNear');if(!el)return;el.innerHTML=(rows||[]).map(r=>'<div class="li"><div class="e">🏡</div><div class="t"><b>'+esc(r.nickname||r.player_id)+'</b><small>'+esc(r.player_id)+'</small></div><button class="sbtn" data-fv="'+esc(r.player_id)+'">'+TT('拜访','Visit','Lawat')+'</button></div>').join('')||'<p class="sub">'+TT('附近还没有别的农场','No other farms yet','Belum ada ladang lain')+'</p>';el.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>fVisit(b.dataset.fv));}).catch(()=>{});};
  if(q('fGuard'))q('fGuard').onclick=()=>{const c=Math.round(5000*rewardMul()/100)*100;if(q('fGuard').dataset.arm){if(money<c){fMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}money-=c;f.guard=true;fDirty();chord();fRenderUI();}else{q('fGuard').dataset.arm=1;q('fGuard').textContent='🧿 💵'+fmtN(c)+'?';}};
  if(q('fSx'))q('fSx').onclick=()=>{FM.sheet=null;fRenderUI();};
  if(q('fGo'))q('fGo').onclick=()=>{const id=norm(q('fId').value).replace(/^FM(?!-)/,'FM-');if(id)fVisit(id);};
  MINI.ui.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>fPlant(FM.sheet.i,b.dataset.sd));
  MINI.ui.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>fVisit(b.dataset.fv));
  trDom(MINI.ui);}
function openFarm(){if(!miniOpen('f'))return;FM.view=null;FM.sheet=null;FM.markT=0;fRenderUI();}
function fFrame(dt,c){if(FM.msgT>0)FM.msgT-=dt;farmTick(dt);const now=Date.now(),f=fSave(),v=FM.view;
  c.fillStyle='#bfe6a8';c.fillRect(0,0,MINI.cv.width,MINI.cv.height);miniXf(c);
  const sky=c.createLinearGradient(0,0,0,120);sky.addColorStop(0,'#a8dcf5');sky.addColorStop(1,'#dff3d0');c.fillStyle=sky;c.fillRect(-400,0,1200,120);
  c.fillStyle='#8fd96b';c.fillRect(-400,110,1200,700);c.fillStyle='#fff';for(let i=0;i<3;i++){c.beginPath();c.ellipse(60+i*140+Math.sin(now/4000+i)*8,40+i*8,26,10,0,0,7);c.fill();}
  rrect(c,8,6,330,58,20);c.fillStyle='#fffefa';c.fill();
  if(v){mText(c,'🏡 '+v.name,20,26,16,'#173a2b',900,'left');mText(c,TT('帮忙：点有 💧🌿🐛 的地 · 熟了可以拿一点','Help: tap 💧🌿🐛 · ripe crops: take a little','Bantu: ketik 💧🌿🐛 · tanaman masak: ambil sedikit'),20,48,11,'#5b6b62',700,'left');}
  else{mText(c,'🌱 '+TT('我的农场','My farm','Ladang saya')+'  Lv '+f.lvl,20,26,16,'#173a2b',900,'left');const need=fNeedXp(f.lvl);rrect(c,20,42,200,9,5);c.fillStyle='rgba(23,58,43,.12)';c.fill();rrect(c,20,42,Math.max(9,200*f.xp/need),9,5);c.fillStyle='#1e8c55';c.fill();
    mText(c,f.xp+'/'+need,228,47,11,'#5b6b62',700,'left');if(f.guard)mEmoji(c,'🧿',318,34,22);mText(c,'💵'+fmtN(Math.floor(money)),20,86,14,'#173a2b',800,'left');}
  const plots=v?(v.farm.p||[]):f.plots,open=v?(v.farm.p||[]).length:fPlots();
  for(let i=0;i<FARM_MAX;i++){const r=fRect(i);rrect(c,r[0],r[1],r[2],r[3],16);
    if(i>=open){c.fillStyle='rgba(120,100,80,.25)';c.fill();if(!v)mText(c,'🔒 Lv '+(i-2),r[0]+r[2]/2,r[1]+r[3]/2,12,'rgba(60,50,40,.6)',800);continue;}
    c.fillStyle='#9a6a43';c.fill();c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(r[0]+10,r[1]+k*r[3]/4);c.lineTo(r[0]+r[2]-10,r[1]+k*r[3]/4);c.stroke();}
    const p=plots[i],cx=r[0]+r[2]/2,cy=r[1]+r[3]/2;if(!p||!p.s){if(!v)mText(c,'+',cx,cy,26,'rgba(255,255,255,.55)');continue;}
    const sd=seedOf(p.s),g=Math.min(1,(now-p.at)/p.dur);
    if(g>=1){mEmoji(c,sd.e,cx,cy-2,40+Math.sin(now/300+i)*2);mEmoji(c,'✨',cx+32,cy-26,16);const st=v?0:(p.stolen||0);if(st)mText(c,'-'+st,r[0]+14,r[1]+14,12,'#fff',900);}
    else{mEmoji(c,g<0.34?'🌱':g<0.67?'🌿':sd.e,cx,cy-4,g<0.67?30:24);rrect(c,r[0]+12,r[1]+r[3]-14,r[2]-24,6,3);c.fillStyle='rgba(0,0,0,.2)';c.fill();rrect(c,r[0]+12,r[1]+r[3]-14,Math.max(6,(r[2]-24)*g),6,3);c.fillStyle='#ffe07a';c.fill();
      const nk=v?Object.keys(p.n||{}).find(k=>g>=p.n[k]):(fNeed(p,now)||{}).k;if(nk){const b=1+Math.sin(now/180)*0.08;c.fillStyle='#fff';c.beginPath();c.arc(r[0]+r[2]-18,r[1]+18,15*b,0,7);c.fill();mEmoji(c,NEED_E[nk],r[0]+r[2]-18,r[1]+18,17);}}}
  if(FM.msgT>0){c.globalAlpha=Math.min(1,FM.msgT*2);rrect(c,30,580,340,38,19);c.fillStyle='#173a2b';c.fill();mText(c,FM.msg,200,599,13,'#fff',700);c.globalAlpha=1;}}
/* ---------- cloud save: player ID + recovery code (no email) ---------- */
let cloud=null,cloudT=null,cloudBusy=false,lastCloudAt=0,showCode=false;
try{cloud=JSON.parse(localStorage.getItem('fm-cloud')||'null');}catch(_){}
const acEl=document.getElementById('ac'),acBody=document.getElementById('acBody'),acStatus=document.getElementById('acStatus');
function acMsg(t){acStatus.textContent=L(t);}
const CODE_ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode(){const a=new Uint32Array(10);crypto.getRandomValues(a);return [...a].map(v=>CODE_ABC[v%CODE_ABC.length]).join('');}
const norm=t=>String(t||'').toUpperCase().replace(/[\s-]/g,'');
const fmtCode=c=>c&&c.length===10&&[...c].every(ch=>CODE_ABC.includes(ch))?c.slice(0,4)+'-'+c.slice(4,8)+'-'+c.slice(8):c;
function storeCloud(c){cloud=c;try{localStorage.setItem('fm-cloud',JSON.stringify(c));}catch(_){}}
function cloudSoon(){if(!sb||!cloud||NET.mode==='guest'||cloudT)return;const wait=Math.max(0,20000-(Date.now()-lastCloudAt));cloudT=setTimeout(()=>{cloudT=null;cloudPush(false);},wait);}
async function rpc(fn,args){const {data,error}=await sb.rpc(fn,args);if(error)throw error;return data;}
async function cloudRegister(){const code=newCode();const id=await rpc('fm_register',{p_secret:code});storeCloud({id,secret:code});return cloud;}
async function cloudPush(manual){
  if(!sb||!cloud||cloudBusy||NET.mode==='guest')return false;if(cloudPending&&!manual)return false;cloudBusy=true;if(manual)cloudPending=null;
  try{await rpc('fm_save',{p_id:cloud.id,p_secret:cloud.secret,p_data:saveObj(),p_progress:progressNow()});lastCloudAt=Date.now();if(manual)toast('☁️ 已备份到云端');const te=document.getElementById('acTime');if(te)te.textContent=new Date(lastCloudAt).toLocaleString();return true;}
  catch(e){if(manual)toast('☁️ 备份失败：'+(e.message||'网络问题'));return false;}finally{cloudBusy=false;}
}
async function cloudLoad(id,secret){const rows=await rpc('fm_load',{p_id:id,p_secret:secret});return Array.isArray(rows)?rows[0]:rows;}
function cloudRestore(row){if(!row||!row.data)return;try{localStorage.setItem(KEY,JSON.stringify(row.data));JOIN.del();}catch(_){}resetting=true;toast('☁️ 正在恢复进度…');setTimeout(()=>location.reload(),500);}
async function cloudStart(){
  if(!sb||NET.mode==='guest')return;
  try{
    if(!cloud){await cloudRegister();await cloudPush(false);toast('☁️ 已为你创建玩家ID，点 👤 查看',2600);if(!acEl.hidden)renderAccount();return;}
    const row=await cloudLoad(cloud.id,cloud.secret);
    /* progress score counts branches first (a new branch resets the upgrade count), then upgrades;
       if the cloud copy is ahead, or is newer and different, ask instead of overwriting either one */
    const score=o=>(((o&&o.legacy&&o.legacy.n)||0)*1000)+((o&&o.pads)||[]).reduce((a,p)=>a+(p.lvl||0),0);
    const cd=row&&row.data,loc=saveObj(),cs=cd?score(cd):(row&&row.progress)||0,ls=score(loc);
    const cNewer=cd&&(cd.savedAt||0)>(offlineFrom||0)+60000;
    if(row&&(cs>ls||(cNewer&&cs!==ls))){const when=t=>t?new Date(t).toLocaleString():'?';cloudPending=row;showAccount();
      acMsg(TT('云端和本机的进度不一样。云端：','Cloud and this device differ. Cloud: ','Kemajuan di awan dan di peranti ini berbeza. Awan: ')+TT('第 '+(((cd&&cd.legacy&&cd.legacy.n)||0)+1)+' 家店','shop #'+(((cd&&cd.legacy&&cd.legacy.n)||0)+1),'kedai #'+(((cd&&cd.legacy&&cd.legacy.n)||0)+1))+' · '+(row.progress||0)+'/'+TOTAL_STEPS+' · '+when(cd&&cd.savedAt)+
        TT('；本机：','; this device: ','; peranti ini: ')+TT('第 '+((legacy.n||0)+1)+' 家店','shop #'+((legacy.n||0)+1),'kedai #'+((legacy.n||0)+1))+' · '+progressNow()+'/'+TOTAL_STEPS+' · '+when(offlineFrom)+'。'+
        TT('点「⬇ 用云端进度」找回，或点「⬆ 立即备份」保留本机（会覆盖云端）。','Tap "⬇ Use cloud save" to restore it, or "⬆ Back up now" to keep this device (overwrites the cloud).','Tekan "⬇ Guna kemajuan awan" untuk pulihkan, atau "⬆ Sandarkan sekarang" untuk kekalkan peranti ini (menimpa awan).'));renderAccount();}
    else await cloudPush(false);
  }catch(e){acMsg('云存档暂时连不上：'+(e.message||'网络问题'));}
}
let cloudPending=null;
document.getElementById('acCheck').onclick=serverCheck;
async function serverCheck(){const out=document.getElementById('acCheckOut');if(!out)return;
  if(!sb){out.textContent=TT('还没有配置 Supabase（config.js），只能单机玩。','Supabase is not configured (config.js); the game runs offline only.','Supabase belum disediakan (config.js); permainan hanya luar talian.');return;}
  out.textContent='…';const tests=[['fm_load',{p_id:'FM-CHECK',p_secret:'x'}],['fm_top',{p_kind:'earned',p_limit:1}],['fm_farm_get',{p_target:'FM-CHECK'}],['fm_farm_random',{p_id:'FM-CHECK'}],['fm_farm_act',{p_id:'FM-CHECK',p_secret:'x',p_name:'x',p_target:'FM-X',p_plot:0,p_planted:0,p_kind:'water'}]];
  const res=[];for(const [fn,args] of tests){try{await sb.rpc(fn,args).then(r=>{if(r.error)throw r.error;});res.push('✅ '+fn);}
    catch(e){const m=String((e&&(e.message||e.details||e.code))||e||'');
      const missing=e&&(e.code==='PGRST202'||e.code==='42883'||/could not find the function|does not exist/i.test(m));
      const offline=!missing&&(!e||!e.code||/fetch|network|load failed|timeout/i.test(m));        // no database reply at all
      res.push((missing?'❌ ':offline?'⚠️ ':'✅ ')+fn+(missing?' — '+TT('缺少','missing','tiada'):offline?' — '+TT('连不上','no reply','tiada jawapan'):''));}}
  const bad=res.some(r=>r.startsWith('❌')),off=res.some(r=>r.startsWith('⚠️'));
  out.textContent=res.join('\n')+'\n'+(bad?TT('请在 Supabase 的 SQL Editor 里重新运行 supabase/schema.sql','Re-run supabase/schema.sql in the Supabase SQL Editor','Jalankan semula supabase/schema.sql dalam SQL Editor Supabase')
    :off?TT('连不上服务器：检查网络，以及 config.js 里的网址和 key','Cannot reach the server: check the network and the URL / key in config.js','Tidak dapat menghubungi pelayan: semak rangkaian serta URL / kunci dalam config.js')
    :TT('服务器设置完整 ✔','Server setup is complete ✔','Persediaan pelayan lengkap ✔'));}
function renderAccount(){
  if(!acBody)return;
  if(!sb&&CFG.supabaseUrl&&CFG.supabaseAnonKey){acBody.innerHTML='<p class="sub">'+L('连接云存档中…')+'</p>';sbReady.then(()=>{if(!acEl.hidden)renderAccount();});return;}
  if(!sb){acBody.innerHTML='<p class="sub">云存档还没配置。站长请按 README 在 <b>config.js</b> 填好 Supabase 地址和 anon key。</p>'+exportHtml();bindExport();trDom(acBody);return;}
  const t=lastCloudAt?new Date(lastCloudAt).toLocaleString():'还没有';
  let h='';
  if(cloud){h+='<p class="sub" style="margin-bottom:2px">你的玩家ID</p><div class="row"><div class="code" style="font-size:24px;letter-spacing:2px;flex:1;margin:0">'+cloud.id+'</div></div>'+
    '<p class="sub" style="margin:6px 0 2px">恢复码（像密码一样保管）</p><div class="row"><div class="code" style="font-size:20px;letter-spacing:1px;flex:1;margin:0">'+(showCode?fmtCode(cloud.secret):'••••-••••-••')+'</div>'+
    '<button class="big ghost" id="acShow" style="flex:0 0 auto">'+(showCode?'隐藏':'显示')+'</button><button class="big ghost" id="acCopy" style="flex:0 0 auto">复制</button></div>'+
    '<p class="sub">📸 请截图或抄下ID和恢复码。换手机、清缓存、误删游戏后，用它们就能找回进度，不需要邮箱。<br>最近一次云备份：<span id="acTime">'+t+'</span></p>'+
    '<div class="row"><button class="big" id="acUp">⬆ 立即备份</button>'+(cloudPending?'<button class="big alt" id="acUse">⬇ 用云端进度</button>':'')+'</div>'+
    '<details style="margin:6px 0"><summary style="cursor:pointer;font-weight:800">🔑 改成自己好记的密码</summary><div class="row"><input id="acNew" placeholder="至少 6 位（不分大小写）" autocomplete="new-password"><button class="big" id="acSet" style="flex:0 0 auto">保存</button></div></details>';}
  h+='<details style="margin:6px 0"'+(cloud?'':' open')+'><summary style="cursor:pointer;font-weight:800">📲 用ID找回进度</summary>'+
    '<div class="row"><input id="acId" placeholder="玩家ID，例如 FM-3A9F2C" autocomplete="username"></div>'+
    '<div class="row"><input id="acCode" placeholder="恢复码或密码" autocomplete="current-password"><button class="big alt" id="acFind" style="flex:0 0 auto">找回</button></div></details>';
  h+=exportHtml()+(cloud?'<details style="margin:6px 0" id="acHist"><summary style="cursor:pointer;font-weight:800">🕘 云端历史版本</summary><div id="acHistList"><p class="sub">…</p></div></details>':'');
  acBody.innerHTML=h;bindExport();const hd=document.getElementById('acHist');if(hd)hd.addEventListener('toggle',()=>{if(hd.open)loadHistory();});setTimeout(()=>trDom(acBody),0);
  const q=id=>document.getElementById(id);
  if(q('acShow'))q('acShow').onclick=()=>{showCode=!showCode;renderAccount();};
  if(q('acCopy'))q('acCopy').onclick=async()=>{const txt='小镇鲜市 玩家ID：'+cloud.id+'  恢复码：'+fmtCode(cloud.secret);try{await navigator.clipboard.writeText(txt);acMsg('已复制，贴到备忘录里保存吧');}catch(_){showCode=true;renderAccount();acMsg('复制不了，请手动抄下来');}};
  if(q('acUp'))q('acUp').onclick=()=>cloudPush(true);
  if(q('acUse'))q('acUse').onclick=()=>cloudRestore(cloudPending);
  if(q('acSet'))q('acSet').onclick=async()=>{const nw=norm(q('acNew').value);if(nw.length<6){acMsg('密码至少 6 位');return;}
    try{await rpc('fm_set_secret',{p_id:cloud.id,p_secret:cloud.secret,p_new:nw});storeCloud({id:cloud.id,secret:nw});acMsg('✅ 密码已更新，以后用ID＋这个密码找回');renderAccount();}catch(e){acMsg('修改失败：'+(e.message||''));}};
  q('acFind').onclick=async()=>{const id=norm(q('acId').value).replace(/^FM(?!-)/,'FM-'),sec=norm(q('acCode').value);if(!id||!sec){acMsg('请填玩家ID和恢复码');return;}
    acMsg('查找中…');try{const row=await cloudLoad(id,sec);if(!row){acMsg('ID或恢复码不对');return;}
      const b=q('acFind');if(b.dataset.arm){storeCloud({id,secret:sec});cloudRestore(row);}else{b.dataset.arm='1';b.textContent='确认找回';acMsg('找到了：进度 '+row.progress+'/'+TOTAL_STEPS+'（'+new Date(row.updated_at).toLocaleString()+'）。再点一次会用它替换本机进度。');}}
    catch(e){acMsg(/invalid|wrong|denied/i.test(e.message||'')?'ID或恢复码不对':'找回失败：'+(e.message||'网络问题'));}};
}
function exportHtml(){return '<details style="margin:6px 0"><summary style="cursor:pointer;font-weight:800">📤 导出存档码 / 📥 导入存档码</summary>'+
  '<div class="row"><button class="big ghost" id="exBtn">📤 导出存档码</button></div><div class="row"><textarea id="exBox" rows="3" style="flex:1;border-radius:12px;border:2px solid rgba(0,0,0,.12);padding:8px;font:12px monospace;background:transparent;color:inherit" placeholder="把存档码粘贴到这里"></textarea></div>'+
  '<div class="row"><button class="big alt" id="imBtn">📥 导入存档码</button></div></details>';}
function bindExport(){const ex=document.getElementById('exBtn');if(!ex)return;
  ex.onclick=async()=>{const code='FM1:'+btoa(unescape(encodeURIComponent(JSON.stringify(saveObj()))));document.getElementById('exBox').value=code;try{await navigator.clipboard.writeText(code);acMsg('存档码已复制，贴到备忘录里保存吧');}catch(_){acMsg('复制不了，请手动抄下来');}};
  const im=document.getElementById('imBtn');im.onclick=()=>{const v=document.getElementById('exBox').value.trim();let o=null;try{if(v.startsWith('FM1:'))o=JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))));}catch(_){}
    if(!o||typeof o!=='object'||!Array.isArray(o.pads)){acMsg('存档码不对');return;}if(!im.dataset.arm){im.dataset.arm='1';im.textContent=L('再点一次确认导入（会替换本机进度）');return;}
    try{localStorage.setItem(KEY,JSON.stringify(o));}catch(_){}resetting=true;location.reload();};}
async function loadHistory(){const el=document.getElementById('acHistList');if(!el||!cloud)return;
  try{const rows=await rpc('fm_history',{p_id:cloud.id,p_secret:cloud.secret});
    if(!rows||!rows.length){el.innerHTML='<p class="sub">'+L('还没有历史版本（每 10 分钟保存一份，保留最近 3 份）')+'</p>';return;}
    el.innerHTML=rows.map((r,i)=>'<div class="li"><div class="t"><b>'+new Date(r.saved_at).toLocaleString()+'</b><small>🏪 '+r.progress+'/'+TOTAL_STEPS+'</small></div><button class="sbtn" data-h="'+esc(r.saved_at)+'">'+L('恢复这个版本')+'</button></div>').join('');
    el.querySelectorAll('[data-h]').forEach(b=>b.onclick=async()=>{if(!b.dataset.arm){b.dataset.arm='1';b.textContent=L('确认找回');return;}try{const d=await rpc('fm_history_load',{p_id:cloud.id,p_secret:cloud.secret,p_at:b.dataset.h});cloudRestore({data:d});}catch(e){acMsg('找回失败：'+(e.message||''));}});}
  catch(e){el.innerHTML='<p class="sub">'+esc(e.message||'')+'</p>';}}
async function cloudPushObj(o){if(!sb||!cloud)return;try{await rpc('fm_save',{p_id:cloud.id,p_secret:cloud.secret,p_data:o,p_progress:0});}catch(_){}}
function showAccount(){acEl.hidden=false;renderAccount();}
document.getElementById('acBtn').onclick=()=>{acMsg('');showAccount();};
document.getElementById('acClose').onclick=()=>{acEl.hidden=true;};
sbReady.then(c=>{if(!c)return;setTimeout(cloudStart,1500);document.addEventListener('visibilitychange',()=>{if(document.hidden&&cloud)cloudPush(false);});});
if('serviceWorker' in navigator&&location.protocol==='https:'){const hadCtl=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').then(reg=>{setInterval(()=>reg.update().catch(()=>{}),10*60*1000);}).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl)return;const u=document.getElementById('upd');u.textContent=L('🆕 有新版本，点这里更新');u.hidden=false;u.onclick=()=>{save();resetting=true;location.reload();};});}
})();
