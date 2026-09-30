(()=>{
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
  hongbao:{e:'🧧',price:40},candybox:{e:'🍬',price:32},mooncake:{e:'🥮',price:38},oillamp:{e:'🪔',price:30},gift:{e:'🎁',price:45}};
const FESTS=[{k:'cny',n:'春节',e:'🧧',item:'hongbao',c1:0xe53935,c2:0xffc107},{k:'raya',n:'开斋节',e:'🌙',item:'candybox',c1:0x2ec27e,c2:0xffd54f},{k:'moon',n:'中秋节',e:'🥮',item:'mooncake',c1:0xff8f00,c2:0xfff176},{k:'diwali',n:'屠妖节',e:'🪔',item:'oillamp',c1:0xff6d00,c2:0xab47bc},{k:'xmas',n:'圣诞节',e:'🎄',item:'gift',c1:0x2e7d32,c2:0xe53935}];
const FEST_ITEMS=FESTS.map(f=>f.item);
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
let LANG='zh';try{const nl=(navigator.language||'').toLowerCase();LANG=localStorage.getItem('fm-lang')||(nl.startsWith('zh')?'zh':nl.startsWith('ms')||nl.startsWith('id')?'ms':'en');}catch(_){}
const TRL=LANG==='zh'?[]:(window.FM_I18N||[]).map(r=>[r[0],LANG==='en'?r[1]:r[2]]).sort((a,b)=>b[0].length-a[0].length);
const HAS_ZH=/[\u4e00-\u9fff「」（）：，！？、]/;
function L(s){if(LANG==='zh'||s==null)return s;s=String(s);if(!HAS_ZH.test(s))return s;for(const [a,b] of TRL)if(s.includes(a))s=s.split(a).join(b);return s;}
const TT=(zh,en,ms)=>LANG==='en'?en:LANG==='ms'?ms:zh;
function trDom(root){if(LANG==='zh'||!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(HAS_ZH.test(n.nodeValue))n.nodeValue=L(n.nodeValue);
  if(root.querySelectorAll)root.querySelectorAll('[placeholder],[aria-label]').forEach(e=>{if(e.placeholder&&HAS_ZH.test(e.placeholder))e.placeholder=L(e.placeholder);const al=e.getAttribute('aria-label');if(al&&HAS_ZH.test(al))e.setAttribute('aria-label',L(al));});}
document.documentElement.lang=LANG==='zh'?'zh-CN':LANG;
const CFG=window.FM_CONFIG||{};
const sb=(CFG.supabaseUrl&&CFG.supabaseAnonKey&&window.supabase&&window.supabase.createClient)?window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}}):null;
const NET={mode:'solo',room:null,code:'',nick:'',col:0,myPeer:null,lastHost:null,hostSeenAt:0,sendT:0,remote:new Map(),avatars:new Map(),emo:null,ver:0,bootT:0};
const ACH_STATE={};

const VIPS=[{n:'陈奶奶',hi:0},{n:'阿明',hi:1},{n:'小丽',hi:2},{n:'王叔',hi:3},{n:'Aisyah',hi:4},{n:'Raj',hi:5}];

const vipState={};let vipT=60;

const DECOR={
  floor:[{n:'奶油',c:0xf7c99c,cost:0},{n:'薄荷',c:0xc9f0dc,cost:500},{n:'樱花',c:0xf9d3dd,cost:500},{n:'天空',c:0xcfe6fa,cost:500},{n:'原木',c:0xe3b98a,cost:800},{n:'星空',c:0xcfc8f2,cost:1200}],
  shelf:[{n:'原木',c:[0xc98b52,0xe0a86f,0xb37542],cost:0},{n:'薄荷',c:[0x6fd3a8,0xa8ecd0,0x3fae7a],cost:800},{n:'樱花',c:[0xf29bb5,0xf9c9d8,0xd96a8f],cost:800},{n:'海蓝',c:[0x6fa8e8,0xa9cdf5,0x3f7bc2],cost:800},{n:'柠檬',c:[0xf2d15b,0xf8e79a,0xd4aa2a],cost:1000}],
  hat:[{n:'不戴',k:'none',cost:0},{n:'草帽',k:'straw',cost:300},{n:'厨师帽',k:'chef',cost:500},{n:'棒球帽',k:'cap',cost:500},{n:'兔耳朵',k:'bunny',cost:1000},{n:'皇冠',k:'crown',cost:3000}]};
const legacy={n:0};
const decor={owned:{'floor:0':1,'shelf:0':1,'hat:0':1},floor:0,shelf:0,hat:0};

const JOIN={get(){try{return sessionStorage.getItem('fm-join');}catch(_){return null;}},set(v){try{sessionStorage.setItem('fm-join',v);}catch(_){}},del(){try{sessionStorage.removeItem('fm-join');}catch(_){}}};
try{localStorage.removeItem('fm-join');}catch(_){}
{const j=JOIN.get();if(j){NET.mode='guest';NET.code=j;NET.col=1+((Math.random()*4)|0);}}
const EMOJI='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

/* ---------- renderer / scene ---------- */
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd96b);
scene.fog=new THREE.Fog(0x8fd96b,45,95);
const camera=new THREE.PerspectiveCamera(34,1,0.5,170);
const hemi=new THREE.HemisphereLight(0xffffff,0xa9c79a,0.85);scene.add(hemi);
const lampMat=new THREE.MeshLambertMaterial({color:0xfff3c4,emissive:0xffd27a,emissiveIntensity:0});
const winMat=new THREE.MeshLambertMaterial({color:0x9fd3ff,emissive:0xffd88a,emissiveIntensity:0});
const sun=new THREE.DirectionalLight(0xffffff,0.55);
sun.position.set(-3,24,11);sun.target.position.set(7,0,-1);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:80});
sun.shadow.bias=-0.0008;scene.add(sun);

const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
function add(geo,c,x,y,z,parent,cast=true){const m=new THREE.Mesh(geo,typeof c==='number'?M(c):c);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;(parent||scene).add(m);return m;}
const box=(w,h,d,c,x,y,z,p,cast)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p,cast);
const sph=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,14,10),c,x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,s=12)=>add(new THREE.CylinderGeometry(rt,rb,h,s),c,x,y,z,p);
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
  const g=new THREE.Group();const m=new THREE.Mesh(geo,VCMAT);m.castShadow=true;m.receiveShadow=true;g.add(m);return g;}
let iceK=0;
function makeItem(type){if(type==='icecream'){iceK=(Math.random()*4)|0;return mergedGroup('i:icecream'+iceK,()=>makeItemRaw(type));}return mergedGroup('i:'+type,()=>makeItemRaw(type));}
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
  else {gm(g,GEO.bill,0x6fcf4f,0,0.045,0);gm(g,GEO.band,0xdaf7c9,0,0.045,0);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;
}

/* ---------- canvas sprites ---------- */
function canvasSprite(w,h,sx,sy){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);
  const mat=new THREE.SpriteMaterial({map:tex,depthTest:false,depthWrite:false,transparent:true});const s=new THREE.Sprite(mat);s.scale.set(sx,sy,1);s.renderOrder=20;return {s,ctx,tex,mat};}
function outlined(x,t,px,py){x.lineJoin='round';x.lineWidth=7;x.strokeStyle='#27352b';x.strokeText(t,px,py);x.fillStyle='#fff';x.fillText(t,px,py);}
function drawBubble(b,emoji,text,warn,ring){
  const x=b.ctx;x.clearRect(0,0,128,144);
  x.fillStyle='rgba(0,0,0,.16)';x.beginPath();x.arc(66,62,52,0,7);x.fill();
  const rc=ring||(warn?'#ff5a4d':null);x.fillStyle=rc||'#fff';x.beginPath();x.arc(64,58,52,0,7);x.fill();if(rc){x.fillStyle='#fff';x.beginPath();x.arc(64,58,44,0,7);x.fill();x.fillStyle=rc;}
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
const CG={body:new THREE.CylinderGeometry(0.3,0.36,0.6,14),hip:new THREE.SphereGeometry(0.36,14,10),head:new THREE.SphereGeometry(0.3,16,12),
  eye:new THREE.SphereGeometry(0.045,8,6),cheek:new THREE.SphereGeometry(0.055,8,6),leg:new THREE.CylinderGeometry(0.1,0.09,0.4,8),
  arm:new THREE.CylinderGeometry(0.075,0.07,0.42,8),hat:new THREE.SphereGeometry(0.33,14,8,0,Math.PI*2,0,Math.PI/2),pom:new THREE.SphereGeometry(0.09,8,6)};
function part(geo,c,x,y,z,p){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;}
function makeChar(color,o={}){
  const g=new THREE.Group();const skin=o.skin||0xffe2c2;
  const body=mergedGroup('c:'+color+':'+JSON.stringify(o),()=>{const t=new THREE.Group();charStatic(t,color,skin,o);return t;});g.add(body.children[0]);
  const limb=(geo,x,y,len)=>{const p=new THREE.Group();p.position.set(x,y,0);part(geo,color,0,-len/2,0,p);g.add(p);return p;};
  const legL=limb(CG.leg,-0.15,0.38,0.4),legR=limb(CG.leg,0.15,0.38,0.4),armL=limb(CG.arm,-0.37,1.02,0.42),armR=limb(CG.arm,0.37,1.02,0.42);
  return {g,legL,legR,armL,armR};
}
function charStatic(g,color,skin,o){
  part(CG.hip,color,0,0.45,0,g).scale.y=0.55;part(CG.body,color,0,0.8,0,g);part(CG.head,skin,0,1.38,0,g);
  part(CG.eye,0x222222,-0.1,1.42,0.27,g);part(CG.eye,0x222222,0.1,1.42,0.27,g);
  part(CG.cheek,0xff9aa8,-0.19,1.32,0.23,g).scale.set(1,0.6,0.5);part(CG.cheek,0xff9aa8,0.19,1.32,0.23,g).scale.set(1,0.6,0.5);
  if(o.backpack){box(0.42,0.46,0.2,o.backpack,0,0.86,-0.36,g);box(0.3,0.16,0.06,0xffffff,0,0.8,-0.47,g);}
  if(o.elder){part(CG.hat,0xdedede,0,1.4,-0.02,g).scale.set(1,0.8,1);}
  if(o.sprout){cyl(0.025,0.03,0.22,0x3f9f3a,0,1.78,0,g,6);const l1=sph(0.1,0x5ccf4f,-0.11,1.88,0,g);l1.scale.set(1.6,0.35,0.8);l1.rotation.z=0.5;const l2=sph(0.1,0x5ccf4f,0.11,1.88,0,g);l2.scale.set(1.6,0.35,0.8);l2.rotation.z=-0.5;}
  if(o.apron)box(0.46,0.42,0.06,0xffffff,0,0.8,0.33,g);
  if(o.hat){part(CG.hat,o.hat,0,1.42,0,g);part(CG.pom,0xffffff,0,1.76,0,g);}
  if(o.straw){cyl(0.52,0.52,0.04,o.straw,0,1.6,0,g,16);cyl(0.24,0.27,0.2,o.straw,0,1.71,0,g,14);cyl(0.275,0.275,0.05,0xd9534f,0,1.64,0,g,14);}
  if(o.visor){part(CG.hat,o.visor,0,1.42,0,g);box(0.34,0.03,0.22,o.visor,0,1.45,0.34,g);}
}
function animChar(ch,moving,t,carrying,riding){
  const s=moving?Math.sin(t*14):0;
  ch.legL.rotation.x=s*0.7;ch.legR.rotation.x=-s*0.7;
  if(carrying){ch.armL.rotation.x=ch.armR.rotation.x=-1.25;}else{ch.armL.rotation.x=-s*0.6;ch.armR.rotation.x=s*0.6;}
  if(!riding)ch.g.position.y=floorY(ch.g.position.x)+(moving?Math.abs(Math.sin(t*14))*0.06:0);
}
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
function pop(o,s0=0.15){o.scale.setScalar(s0);pops.push({o,s0,t:0});}
function updFx(dt){
  for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const k=Math.min(1,w.t/w.dur);w.mesh.position.lerpVectors(w.from,w.toFn(),k);w.mesh.position.y+=Math.sin(k*Math.PI)*w.arc;
    if(k>=1){tweens.splice(i,1);w.done&&w.done();}}
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt;const k=Math.min(1,p.t/0.28),q=k-1;const e=1+2.70158*q*q*q+1.70158*q*q;p.o.scale.setScalar(Math.max(0.01,p.s0+(1-p.s0)*e));if(k>=1){p.o.scale.setScalar(1);pops.splice(i,1);}}
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
function makeBin(type,max,slotPos,parent){
  const b={type,count:0,incoming:0,max,unlocked:false,slotPos,slots:[]};
  for(let i=0;i<max;i++){const m=makeItem(type);m.position.copy(slotPos(i));m.visible=false;parent.add(m);b.slots.push(m);}
  b.refresh=()=>b.slots.forEach((m,i)=>m.visible=i<b.count);
  b.space=()=>b.max-b.count-b.incoming;
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
const fhGateMesh=box(0.4,2.4,6,0xe6ddf2,100.2,F2Y+1.2,-6.5,f2G);
const glassM=new THREE.MeshLambertMaterial({color:0xcfeaff,transparent:true,opacity:0.35});
box(42.4,0.9,0.08,glassM,79,F2Y+0.45,0.2,f2G,false);box(42.4,0.08,0.14,0xb0b8c4,79,F2Y+0.92,0.2,f2G);
box(5.8,0.9,0.06,glassM,60.9,F2Y+0.45,-9.1,f2G,false);box(5.8,0.9,0.06,glassM,60.9,F2Y+0.45,-4.9,f2G,false);
[[64,-13.3],[99,-13.3],[99,-0.8],[64.5,-0.8]].forEach(([x,z])=>{cyl(0.3,0.24,0.45,0xc4703f,x,F2Y+0.23,z,f2G);sph(0.42,0x49b545,x,F2Y+0.7,z,f2G).scale.set(1,0.8,1);});
box(2.2,0.4,0.6,0xc98b52,84,F2Y+0.25,-0.8,f2G);box(2.2,0.4,0.6,0xc98b52,74,F2Y+0.25,-0.8,f2G);
// freight elevator on the back wall
box(2.6,2.2,0.2,0x8a93a3,92,F2Y+1.1,-14.1,f2G);
const elevL=box(0.62,1.9,0.06,0xc0c7d2,91.68,F2Y+0.95,-13.98,f2G),elevR=box(0.62,1.9,0.06,0xc0c7d2,92.32,F2Y+0.95,-13.98,f2G);
{const sg=canvasSprite(128,144,0.8,0.9);drawBubble(sg,'🛗','');sg.s.position.set(92,F2Y+2.9,-14);f2G.add(sg.s);}
{const c=document.createElement('canvas');c.width=512;c.height=128;const k=c.getContext('2d');rrect(k,6,6,500,116,40);k.fillStyle='#9b59b6';k.fill();k.lineWidth=8;k.strokeStyle='#fff';k.stroke();
  k.fillStyle='#fff';k.font='900 64px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('二楼 生活馆',256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(75,F2Y+3.3,-14.3);f2G.add(m);}
// escalators: 1F (x 12.3..16.7) and 2F well (x 59.6..63.8); up lane z=-8.2, down lane z=-5.8
const escG=new THREE.Group();scene.add(escG);escG.visible=false;
const UPZ=-8.2,DNZ=-5.8;
const escSteps=[];
function ramp(x0,y0,x1,y1,z,parent){
  const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0);
  const r=box(len,0.3,1.1,0x5b616b,(x0+x1)/2,(y0+y1)/2-0.12,z,parent);r.rotation.z=ang;
  for(const side of [-0.6,0.6]){const gl=box(len,0.7,0.05,glassM,(x0+x1)/2,(y0+y1)/2+0.35,z+side,parent,false);gl.rotation.z=ang;const rl=box(len,0.07,0.1,0x2b2b2b,(x0+x1)/2,(y0+y1)/2+0.72,z+side,parent);rl.rotation.z=ang;}
  for(let k=0;k<6;k++){const st=box(0.35,0.04,1.0,0xb8bec8,x0,y0,z,parent,false);escSteps.push({st,x0,y0,x1,y1,k});}
}
ramp(12.3,0,16.7,2.4,UPZ,escG);ramp(16.7,2.4,12.3,0,DNZ,escG);
box(3.6,0.4,4.4,0xebe6f3,17.9,2.75,-7,escG);box(3.6,0.08,4.5,0xb07bdc,17.9,2.98,-7,escG);
cyl(0.18,0.18,2.6,0xd8d2e6,19.5,1.3,-8.9,escG,10);cyl(0.18,0.18,2.6,0xd8d2e6,19.5,1.3,-5.1,escG,10);
{const sg=canvasSprite(256,120,1.6,0.75);const x=sg.ctx;rrect(x,6,6,244,108,40);x.fillStyle='#9b59b6';x.fill();x.textAlign='center';x.textBaseline='middle';x.font='900 52px system-ui,sans-serif';x.fillStyle='#fff';x.fillText('⬆ 2F',128,62);sg.tex.needsUpdate=true;sg.s.position.set(14.5,3.3,-7);escG.add(sg.s);}
ramp(59.6,3.6,63.8,F2Y,UPZ,escG);ramp(63.8,F2Y,59.6,3.6,DNZ,escG);
const escSol=solid(12.5,-8.95,19.75,-5.05,false);
const UP_ENTRY=V3(11.7,0,UPZ),UP_EXIT=V3(64.3,0,UPZ),DN_ENTRY=V3(64.3,0,DNZ),DN_EXIT=V3(11.7,0,DNZ);
const UP_NODE={ride:true,legs:[[V3(11.7,0,UPZ),V3(12.3,0,UPZ),0.2],[V3(12.3,0,UPZ),V3(16.7,2.4,UPZ),1.6],[V3(59.6,3.6,UPZ),V3(63.8,F2Y,UPZ),1.4],[V3(63.8,F2Y,UPZ),V3(64.3,F2Y,UPZ),0.2]]};
const DN_NODE={ride:true,legs:[[V3(64.3,F2Y,DNZ),V3(63.8,F2Y,DNZ),0.2],[V3(63.8,F2Y,DNZ),V3(59.6,3.6,DNZ),1.4],[V3(16.7,2.4,DNZ),V3(12.3,0,DNZ),1.6],[V3(12.3,0,DNZ),V3(11.7,0,DNZ),0.2]]};
let f2Open=false;
function openFloor2(anim){f2Open=true;f2G.visible=true;escG.visible=true;escSol.active=true;if(anim){pop(escG,0.3);}}
function updEscalators(dt){if(!f2Open)return;for(const e of escSteps){const k=((T*0.45+e.k/6)%1);e.st.position.set(e.x0+(e.x1-e.x0)*k,e.y0+(e.y1-e.y0)*k+0.05,e.st.position.z);}}
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
  k.fillStyle='#fff';k.font='900 66px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('美食广场',256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(111,F2Y+3.6,-14.3);fhG.add(m);}
const seats=[],fhTableSol=[];
for(const tx of [104,110,116])for(const tz of [-7.2,-3.4]){
  cyl(0.6,0.6,0.08,0xffffff,tx,F2Y+0.78,tz,fhG,16);cyl(0.08,0.12,0.75,0x9aa0a6,tx,F2Y+0.38,tz,fhG,8);fhTableSol.push(solid(tx-0.5,tz-0.5,tx+0.5,tz+0.5,false));
  for(const [sx,sz] of [[1,0],[-1,0],[0,1],[0,-1]]){cyl(0.22,0.2,0.42,0xff8a3d,tx+sx*1.0,F2Y+0.21,tz+sz*1.0,fhG,10);seats.push({x:tx+sx*1.0,z:tz+sz*1.0,tx,tz,face:Math.atan2(-sx,-sz),occ:null});}}
function makePile(px,pz,Y,parent){
  const o={pile:V3(px,0,pz),stack:[],bills:[],unlocked:false};
  cyl(0.8,0.8,0.05,0xffffff,px,0.12+Y,pz,parent,24);
  o.billSlot=i=>{const l=Math.floor(i/6),k=i%6;return V3(px+((k%2)-0.5)*0.52,0.15+Y+l*0.1,pz+(Math.floor(k/2)-1)*0.32);};
  for(let i=0;i<60;i++){const b=makeItem('bill');b.position.copy(o.billSlot(i));b.visible=false;parent.add(b);o.bills.push(b);}
  o.refresh=()=>o.bills.forEach((b,i)=>b.visible=i<o.stack.length);
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
const fountainDrops=[];for(let i=0;i<10;i++){const d=add(new THREE.SphereGeometry(0.07,6,5),0xbfe6ff,-17,1.5,3,null,false);fountainDrops.push({d,a:i/10*Math.PI*2,t:Math.random()});}
function bench(x,z,r=0){const g=new THREE.Group();box(1.6,0.08,0.5,0xc98b52,0,0.45,0,g);box(1.6,0.4,0.06,0xc98b52,0,0.7,-0.22,g);for(const px of [-0.7,0.7])box(0.08,0.45,0.45,0x6b7280,px,0.22,0,g);g.position.set(x,0,z);g.rotation.y=r;scene.add(g);}
bench(-14.2,6.5,Math.PI/2);bench(-19.8,6.5,-Math.PI/2);bench(46,6,Math.PI/2);bench(-14,-1.5,Math.PI/2);
function flowers(x,z,w,d){box(w,0.25,d,0x9a6a43,x,0.12,z,null,false);const cols=[0xff7eb6,0xffd166,0xffffff,0xc3a6ff,0xff5a4d];for(let i=0;i<Math.round(w*d*3);i++){sph(0.08,cols[i%5],x+(Math.random()-0.5)*(w-0.2),0.3,z+(Math.random()-0.5)*(d-0.2)).castShadow=false;}}
flowers(-12.6,-11,1,5);flowers(44.6,-3,1,5);flowers(-12.6,-2.2,1,3);flowers(-20,12,3,1);
{const pz=16.5;box(22,0.04,5,0x9aa0a6,-24,0.02,10,null,false);for(let i=0;i<5;i++)box(0.12,0.05,2,0xffffff,-33+i*4,0.05,10,null,false);
  [[0xff5a4d,-31],[0x4a90e2,-27],[0xffd166,-23]].forEach(([col,x])=>{const g=new THREE.Group();box(1.6,0.6,3,col,0,0.5,0,g);box(1.4,0.55,1.6,0xdff1ff,0,1.05,-0.1,g);for(const [wx,wz] of [[-0.8,1],[0.8,1],[-0.8,-1],[0.8,-1]]){const w=cyl(0.28,0.28,0.2,0x333333,wx,0.28,wz,g,10);w.rotation.z=Math.PI/2;}g.position.set(x,0,10);scene.add(g);solid(x-0.9,8.4,x+0.9,11.6);});}
const birds=[];for(let i=0;i<4;i++){const g=new THREE.Group();const b=box(0.3,0.12,0.14,0x555555,0,0,0,g,false);const w1=box(0.1,0.03,0.4,0x555555,0,0.03,0.2,g,false),w2=box(0.1,0.03,0.4,0x555555,0,0.03,-0.2,g,false);scene.add(g);birds.push({g,w1,w2,a:Math.random()*6,r:10+i*4,cx:8+i*6,cz:-2+i*3,h:7+i});}
const walkers=[];const WALK_COLS=[0x7ec8ff,0xffd166,0xb8e986,0xf7b2d0];
for(let i=0;i<4;i++){const ch=makeChar(WALK_COLS[i],{skin:[0xffe2c2,0xf5cfa6,0xe0ac7e,0xc68a5e][i],hat:i%2?[0xff7eb6,0x7ec8ff,0xffd166,0x9ee39e][i]:null});scene.add(ch.g);const dir=i%2?1:-1;ch.g.position.set(-30+i*20,0,dir>0?18.2:19.4);walkers.push({ch,dir,sp:1.6+i*0.2});}
function updTown(dt){
  for(const d of fountainDrops){d.t+=dt*0.9;if(d.t>1)d.t-=1;const r=0.2+d.t*1.0;d.d.position.set(-17+Math.cos(d.a)*r,1.5+Math.sin(d.t*Math.PI)*0.9-d.t*0.6,3+Math.sin(d.a)*r);}
  for(const b of birds){b.a+=dt*(0.25+b.r*0.005);b.g.position.set(b.cx+Math.cos(b.a)*b.r,b.h+Math.sin(b.a*3)*0.4,b.cz+Math.sin(b.a)*b.r*0.6);b.g.rotation.y=-b.a;const f=Math.sin(T*14+b.r)*0.6;b.w1.rotation.x=f;b.w2.rotation.x=-f;}
  for(const w of walkers){w.ch.g.position.x+=w.dir*w.sp*dt;if(w.ch.g.position.x>55)w.ch.g.position.x=-35;if(w.ch.g.position.x<-35)w.ch.g.position.x=55;w.ch.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;animChar(w.ch,true,T+w.sp*3,false);}
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
  for(let i=0;i<60;i++){const b=makeItem('bill');b.position.copy(co.billSlot(i));b.visible=false;g.add(b);co.bills.push(b);}
  co.refresh=()=>co.bills.forEach((b,i)=>b.visible=i<co.stack.length);
  co.push=v=>{if(co.stack.length>=60)co.stack[(Math.random()*60)|0]+=v;else co.stack.push(v);co.refresh();};
  g.visible=false;checkouts.push(co);return co;
}
buildCheckout(-8.2,1);buildCheckout(20,-1);buildCheckout(30,1);buildCheckout(90,-1);
function unlockCheckout(i,anim){const co=checkouts[i];co.unlocked=true;co.g.visible=true;co.sol.active=true;if(anim)pop(co.g,0.2);}

/* ---------- producers ---------- */
const PROD={carrot:{x:-6,z:11.5,iv:1.3},strawberry:{x:0,z:11.5,iv:1.6},tomato:{x:-6,z:5,iv:1.5},egg:{x:0,z:5,iv:2.1},milk:{x:6,z:5,iv:2.8},wheat:{x:13,z:9,iv:1.2},apple:{x:21,z:9,iv:1.7}};
const producers={};
function buildProducer(type){
  const {x,z,iv}=PROD[type],g=new THREE.Group();scene.add(g);
  const patch=new THREE.Mesh(new THREE.CircleGeometry(3.3,28),M(0x7fcf5c));patch.rotation.x=-Math.PI/2;patch.position.set(x,0.012,z);patch.receiveShadow=true;g.add(patch);
  let sol;
  if(type==='tomato'){
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
  const body=new THREE.Group();body.position.set(x,Y,zc);g.add(body);
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
  g.visible=false;machines[outT]=m;
}
Object.keys(MACH).forEach(buildMachine);
function unlockMachine(t,anim){const m=machines[t];if(m.fh&&anim&&m.inp.count<6){m.inp.count=6;m.inp.refresh();}m.unlocked=m.inp.unlocked=m.out.unlocked=true;m.g.visible=true;m.sol.active=true;if(anim)pop(m.g,0.2);}

/* ---------- shelves ---------- */
const SHELF_POS={tomato:[-5,-11.5],egg:[0,-11.5],milk:[5,-11.5],carrot:[-3,-6.5],jam:[3,-6.5],bread:[14.5,-11.5],cheese:[18.5,-11.5],juice:[22.5,-11.5],
  soda:[27,-11.5],cookies:[30.4,-11.5],noodles:[33.8,-11.5],chocolate:[37.2,-11.5],tissue:[40.6,-11.5],shampoo:[28.7,-6.5],icecream:[33.8,-6.5],canned:[38.9,-6.5],
  hongbao:[6,-2.4],candybox:[6,-2.4],mooncake:[6,-2.4],oillamp:[6,-2.4],gift:[6,-2.4],
  tshirt:[68,-11.5],book:[72,-11.5],ball:[76,-11.5],umbrella:[80,-11.5],teddy:[70,-6.5],headphones:[78,-6.5]};
const SHELF_COL={soda:[0x7fb8e8,0xa9d2f5,0x4a90e2],icecream:[0xeaf4ff,0xffffff,0x9fc9ee],milk:[0xa9d2f5,0xd4e9fb,0x7fb8e8]};
const shelfMats=[new THREE.MeshLambertMaterial({color:0xc98b52}),new THREE.MeshLambertMaterial({color:0xe0a86f}),new THREE.MeshLambertMaterial({color:0xb37542})];
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
  Object.assign(sh,{kind:'shelf',x,z,g,dep:V3(x,0,z+1.3),spotZ:z+1.45,island:z>-10,sol:solid(x-1.55,z-0.6,x+1.55,z+0.55,false)});
  g.visible=false;shelves[type]=sh;
}
SELL.forEach(buildShelf);FEST_ITEMS.forEach(buildShelf);
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
function route(a,b){
  navCheck();
  const A=V3(a.x,0,a.z),B=V3(b.x,0,b.z);
  if(los(A,B))return [B];
  const W=NAV.W,N=W*NAV.H;
  const [si,sj]=nearestFree(...cellOf(A.x,A.z)),[gi,gj]=nearestFree(...cellOf(B.x,B.z));
  const start=sj*W+si,goal=gj*W+gi;
  const gs=new Float32Array(N).fill(1e9),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const hx=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return Math.max(dx,dz)+0.414*Math.min(dx,dz);};
  const heap=[];const push=(f,n)=>{heap.push([f,n]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p;}};
  const popH=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m;}}return top;};
  gs[start]=0;push(hx(si,sj),start);let found=false,iter=0;
  while(heap.length&&iter++<25000){
    const [,n]=popH();if(closed[n])continue;closed[n]=1;if(n===goal){found=true;break;}
    const i=n%W,j=(n/W)|0;
    for(const [di,dj,c] of DIRS){const ni=i+di,nj=j+dj;if(!freeCell(ni,nj))continue;if(di&&dj&&(!freeCell(i+di,j)||!freeCell(i,j+dj)))continue;
      const m=nj*W+ni;const ng=gs[n]+c;if(ng<gs[m]){gs[m]=ng;came[m]=n;push(ng+hx(ni,nj),m);}}
  }
  if(!found)return [B];
  const cells=[];for(let n=goal;n!==-1;n=came[n]){cells.push(cellPt(n%W,(n/W)|0));if(n===start)break;}
  cells.reverse();
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
        fly(m,V3(92,F2Y+0.8,-13.7),()=>p.slotPos(idx),0.4,()=>{scene.remove(m);p.incoming--;p.count=Math.min(p.max,p.count+1);p.refresh();},1.0);}
      else{e.state='closed';e.t=10*Math.pow(0.7,padById.truck.lvl);}}}
  elevL.position.x=91.68-e.open*0.6;elevR.position.x=92.32+e.open*0.6;
}
const truck=new THREE.Group();scene.add(truck);truck.visible=false;
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
        fly(m,V3(37.2,1.5,7.5),()=>p.slotPos(idx),0.4,()=>{scene.remove(m);p.incoming--;p.count=Math.min(p.max,p.count+1);p.refresh();},1.6);}
      else{tr.state='leave';truck.rotation.y=Math.PI;}}}
  else if(tr.state==='leave'){truck.position.x+=dt*16;if(truck.position.x>74){tr.state='away';tr.t=9*Math.pow(0.7,padById.truck.lvl);truck.visible=false;}}
}

const sourceOf0=null;
const sourceOf=t=>producers[t]||(machines[t]&&machines[t].out)||pallets[t];
const allSources=()=>[...Object.values(producers),...Object.values(machines).map(m=>m.out),...Object.values(pallets)].filter(b=>b.unlocked&&b.kind!=='serve');
const allDests=()=>[...SELL.map(t=>shelves[t]),...Object.values(machines).map(m=>m.inp),...(order&&order.dst?[order.dst]:[])].filter(b=>b.unlocked);
let order=null;
function lines(){const l=SELL.filter(t=>shelves[t].unlocked&&sourceOf(t).unlocked);if(curFest&&shelves[curFest.item].unlocked)l.push(curFest.item);return l;}
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
  mesh.rotation.x=-Math.PI/2;mesh.position.set(d.x,floorY(d.x)+(d.z<0.3?0.125:0.03),d.z);mesh.renderOrder=2;scene.add(mesh);
  const p={...d,lvl:0,paid:0,done:false,stand:0,visible:false,mesh,ctx,tex,dirty:true,flyT:0};
  pads.push(p);padById[p.id]=p;
});
const padCost=p=>p.costs[p.lvl];
const TOTAL_STEPS=pads.reduce((s,p)=>s+p.costs.length,0);
function drawPad(p){
  const x=p.ctx;x.clearRect(0,0,256,256);const cost=padCost(p),prog=Math.min(1,p.paid/cost);
  rrect(x,14,14,228,228,34);x.fillStyle='rgba(20,50,25,.32)';x.fill();
  if(prog>0){x.save();x.clip();x.fillStyle='rgba(110,235,110,.8)';x.fillRect(14,242-228*prog,228,228*prog);x.restore();rrect(x,14,14,228,228,34);}
  x.setLineDash([26,16]);x.lineWidth=9;x.strokeStyle='#fff';x.stroke();x.setLineDash([]);
  x.textAlign='center';x.textBaseline='middle';
  x.font='66px '+EMOJI;x.fillText(p.e,128,76);
  x.font='900 29px system-ui,sans-serif';outlined(x,L(p.name)+(p.costs.length>1?' Lv.'+(p.lvl+1):''),128,140);
  x.font='900 40px system-ui,sans-serif';outlined(x,'💵'+Math.ceil(cost-p.paid),128,196);
  p.tex.needsUpdate=true;
}
function updatePadVis(){pads.forEach(p=>{p.visible=!p.done&&(!p.req||padById[p.req].done);p.mesh.visible=p.visible;});}
const cap=()=>4+2*padById.cap.lvl;
const speed=()=>4.6+0.8*padById.speed.lvl;
const boost=()=>Math.pow(0.8,padById.boost.lvl);
const price=t=>ITEM[t].price*(1+0.25*padById.price.lvl)*(promo&&promo.type===t?0.8:1)*(1+0.25*(legacy.n||0));
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
function purchase(p){
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
  const bub=canvasSprite(128,144,1.0,1.125);bub.s.position.y=2.3;ch.g.add(bub.s);return {ch,bub};}
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
  const ls=((l2.length&&(Math.random()<0.3||!l1.length))?l2:l1).sort(()=>Math.random()-0.5);
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
  const vr=vip>=0?0:[0,0,0,1,2,3][(Math.random()*6)|0];
  const {ch,bub}=newShopper(ci,si,hi,door,vr);
  const c={vr,spd:vr===1?1.15:vr===2?0.8:1,vip,id:++custId,ci,si,hi,rideLeg:-1,ch,g:ch.g,wants,wi:0,state:'toShelf',path:[door.d.clone()],t:0,phase:Math.random()*6,bub,bubKey:'',arrived:false,co:null,bought:0,cart};
  if(Math.random()<0.12&&vip<0)addDog(c);
  if(vip>=0){addCrown(ch.g);const tg=nameTag('⭐'+VIPS[vip].n,0xd4a017);tg.s.position.y=2.95;ch.g.add(tg.s);c.bub.s.position.y=2.3;toast('⭐ 常客「'+VIPS[vip].n+'」来了！好好招待会有惊喜',2400);}
  if(cart)makeCart(c);else{const bk=new THREE.Mesh(GEO.basket,M(BASKET_COLS[(Math.random()*4)|0]));bk.position.set(0,0.72,0.46);bk.castShadow=true;ch.g.add(bk);}
  c.path.push(...routeTo(door.d,shelfSpot(wants[0].type,c)));
  customers.push(c);
}
function addToBasket(c,type){const k=c.bought++;if(c.cart){if(k>=18)return;const m=makeItem(type);m.scale.setScalar(0.55);m.position.copy(cartSlot(k));c.g.add(m);return;}if(k>=9)return;const m=makeItem(type);m.scale.setScalar(0.45);m.position.set(-0.15+(k%3)*0.15,0.8+Math.floor(k/3)*0.12,0.4+((k%2)?0.06:-0.06));c.g.add(m);}
function setBubble(c,e,t='',warn=false,ring=null){const k=e+t+(warn?'!':'')+(ring||'');if(c.bubKey!==k){c.bubKey=k;drawBubble(c.bub,e,t,warn,ring);}}
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
    if(m.out.count>0&&c.t>0.4){m.out.count--;m.out.refresh();const it=makeItem(c.dish);fly(it,m.out.slotPos(m.out.count),()=>c.g.position.clone().add(V3(0,1.1,0.4)),0.3,()=>scene.remove(it),0.5);
      c.hasDish=true;const p=price(c.dish);for(let i=0;i<3;i++){const b=makeItem('bill');fly(b,m.out.slotPos(0).clone().add(V3(0,0.4,0)),()=>fhPile.billSlot(Math.min(fhPile.stack.length,59)),0.6+i*0.08,()=>{scene.remove(b);fhPile.push(p/3);},1.4);}
      onSale(c.dish,1);onServed(p,true);blip(880,0.08);
      let best=null,bd=1e9;for(const st of seats){if(st.occ)continue;const d=Math.hypot(st.x-c.g.position.x,st.z-c.g.position.z);if(d<bd){bd=d;best=st;}}
      if(best){best.occ=c;c.seat=best;c.state='toSeat';c.path=routeTo(c.g.position,V3(best.x,0,best.z));}else{c.state='leave';const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    else if(m.out.count===0){c.wait+=dt;if(c.wait>20){c.state='leave';c.sad=true;const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    setBubble(c,c.wait>8?'😕':ITEM[c.dish].e);return true;}
  if(c.state==='toSeat'){setBubble(c,ITEM[c.dish].e);if(!busy){c.state='eat';c.eatT=6+Math.random()*4;c.sit=true;c.g.position.x=c.seat.x;c.g.position.z=c.seat.z;c.g.rotation.y=c.seat.face;
      const dm=makeItem(c.dish);dm.position.set(c.seat.x+(c.seat.tx-c.seat.x)*0.45,F2Y+0.82,c.seat.z+(c.seat.tz-c.seat.z)*0.45);scene.add(dm);c.dishMesh=dm;}return true;}
  if(c.state==='eat'){setBubble(c,'😋');c.eatT-=dt;if(c.eatT<=0){c.sit=false;if(c.dishMesh){scene.remove(c.dishMesh);c.dishMesh=null;}if(c.seat){c.seat.occ=null;c.seat=null;}
      c.state='leave';const door=nearestDoor(UP_ENTRY.x);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}return true;}
  if(c.state==='leave'){setBubble(c,c.sad?'😞':'😊');if(!busy)c.dead=true;return true;}
  return true;
}
function checkout(co,c){
  co.queue.shift();
  let total=c.wants.reduce((s,w)=>s+w.need*price(w.type),0);
  const waited=T-(c.qT||T);let tip=0;
  if(waited<6){combo=(T-lastFastT<14)?combo+1:1;lastFastT=T;tip=Math.round(total*0.1*Math.min(combo,5));stats.tips=(stats.tips||0)+tip;
    if(combo>=2&&T-comboToastT>1.2){comboToastT=T;toast(L('🔥 连击')+' ×'+combo+'  '+L('小费')+' +💵'+tip,1400);}sparkle(V3(co.cx,co.Y+1.6,-2),4,0xffd24a,0.8);}
  else if(waited>9)combo=0;
  total+=tip;
  for(const a of actors())if(a.id!=='me'&&near(a.g.position,co.reg,1.3))a.contrib=(a.contrib||0)+total*0.06;if(c.vip>=0){total=Math.round(total*2+50);vipHeart(c.vip,+1);stats.vip=(stats.vip||0)+1;}
  const n=Math.min(8,Math.max(1,Math.round(total/6)));
  for(let i=0;i<n;i++){const b=makeItem('bill');fly(b,V3(co.cx+0.5*co.dir,1.4+co.Y,-2),()=>co.billSlot(Math.min(co.stack.length,59)),0.28+i*0.05,()=>{scene.remove(b);co.push(total/n);},0.8);}
  for(const w of c.wants)if(w.need>0)onSale(w.type,w.need);onServed(total,false);
  const door=nearestDoor(co.cx);
  c.state='leave';c.path=[...routeTo(c.g.position,door.d),door.o.clone()];blip(880,0.08);blip(1320,0.1,'sine',0.05);
}
function updCustomers(dt){
  for(const c of customers){
    if(c.state==='queue'){const slot=c.co.slot(c.co.queue.indexOf(c));if(lastPt(c).distanceTo(slot)>0.01||!c.path.length&&c.g.position.distanceTo(slot)>0.05)c.path=routeTo(c.g.position,slot);}
    c.bub.s.visible=c.vip>=0||Math.hypot(c.g.position.x-camT.x,c.g.position.z-camT.z)<13;
    const fr=followPath(c,(c.cart?2.4:2.8)*(c.spd||1),dt);const moving=fr===true,riding=fr==='ride';
    animChar(c.ch,moving,T+c.phase,!c.diner||c.hasDish,riding);
    if(c.sit){c.ch.legL.rotation.x=c.ch.legR.rotation.x=-1.4;c.g.position.y=floorY(c.g.position.x)+0.06;}
    if(c.diner&&updDiner(c,dt,moving||riding))continue;
    if(c.state==='toShelf'){const w=c.wants[c.wi];setBubble(c,ITEM[w.type].e,w.got+'/'+w.need);if(!moving&&!riding)c.state='shop';}
    else if(c.state==='shop'){
      faceTo(c.g,Math.PI,dt);const w=c.wants[c.wi],sh=shelves[w.type];c.t+=dt;
      if(sh.count===0&&w.got<w.need){c.wait=(c.wait||0)+dt;
        if(c.wait>(c.vip>=0?25:14)){c.wait=0;w.need=w.got;}}
      if(w.got<w.need&&sh.count>0&&c.t>0.4){c.t=0;c.wait=0;sh.count--;sh.refresh();const it=makeItem(w.type);const tp=w.type;
        fly(it,sh.slotPos(sh.count),()=>c.g.position.clone().add(V3(0,1,0)),0.3,()=>{scene.remove(it);addToBasket(c,tp);},0.6);w.got++;}
      if((c.wait||0)>6)setBubble(c,'😕','',true);else setBubble(c,ITEM[w.type].e,w.got+'/'+w.need,sh.count===0&&w.got<w.need);
      if(w.got>=w.need){c.wi++;
        if(c.wi<c.wants.length){c.state='toShelf';c.path=routeTo(c.g.position,shelfSpot(c.wants[c.wi].type,c));}
        else if(c.wants.some(x=>x.got>0))joinQueue(c);
        else{const door=nearestDoor(c.g.position.x);c.state='leave';c.sad=true;if(c.vip>=0)vipHeart(c.vip,-1);c.path=[...routeTo(c.g.position,door.d),door.o.clone()];}}
    }
    else if(c.state==='queue'){c.arrived=!moving&&!riding&&c.path.length===0;if(c.arrived)faceTo(c.g,0,dt);const w=T-(c.qT||T);setBubble(c,c.co.queue[0]===c&&c.arrived?'💳':'🛒','',false,RINGS[w<3?0:w<6?1:w<9?2:3]);}
    else if(c.state==='leave'){setBubble(c,c.sad?'😞':'😊');if(!moving&&!riding)c.dead=true;}
  }
  for(const c of customers)if(c.dog)dogFollow(c.dog,c.g,dt);
  for(let i=customers.length-1;i>=0;i--){const c=customers[i];if(c.dead){if(c.dog)scene.remove(c.dog);if(c.seat)c.seat.occ=null;if(c.dishMesh)scene.remove(c.dishMesh);scene.remove(c.g);c.bub.tex.dispose();c.bub.mat.dispose();customers.splice(i,1);}}
}

/* ---------- item transfers ---------- */
function takeFrom(src,carrier){
  src.count--;src.refresh();const m=makeItem(src.type);carrier.incoming++;
  vib(5);fly(m,src.slotPos(src.count),()=>carrier.slotWorld(carrier.carry.length),0.22,()=>{carrier.incoming--;scene.remove(m);carrier.add(src.type,m);},0.9);
}
function depositTo(dst,carrier){
  const r=carrier.removeType(dst.type);if(!r)return;dst.incoming++;const idx=Math.min(dst.max-1,dst.count+dst.incoming-1);
  fly(r.mesh,r.pos,()=>dst.slotPos(idx),0.22,()=>{scene.remove(r.mesh);dst.incoming--;dst.count=Math.min(dst.max,dst.count+1);dst.refresh();},0.9);
}

/* ---------- helpers AI ---------- */
function tasks(){
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
    const idx=helpers.indexOf(h);
    if(h.state==='idle'){
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
      else{h.task=null;h.idleT=(h.idleT||0)+dt;
        if(!h.path.length&&h.idleT>2.5){h.idleT=0;const a=Math.random()*Math.PI*2;helperGo(h,h.home.clone().add(V3(Math.cos(a)*0.8,0,Math.sin(a)*0.6)));}}
    }
    // move along path
    const before=h.g.position.clone();
    const fr=followPath(h,4.3,dt);const moving=fr===true,riding=fr==='ride';
    if(!riding)collide(h.g.position,0.36);
    // keep a little personal space from other helpers and the player
    for(const o of [...helpers.map(x=>x.g.position),player.position]){if(riding||o===h.g.position||Math.abs(o.y-h.g.position.y)>1)continue;const dx=h.g.position.x-o.x,dz=h.g.position.z-o.z,d=Math.hypot(dx,dz);if(d>0.01&&d<0.75){const k=(0.75-d)*0.5;h.g.position.x+=dx/d*k;h.g.position.z+=dz/d*k;}}
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
const speedEps=dt=>3.9*dt*0.15;

/* ---------- guide arrow ---------- */
const arrow=new THREE.Group();const cone=add(new THREE.ConeGeometry(0.34,0.7,4),0xffd23f,0,0,0,arrow,false);cone.rotation.x=Math.PI;scene.add(arrow);
let guideOverride=null;
function guide(){if(guideOverride&&T>guideOverride.until)guideOverride=null;const g=guideOverride?guideOverride.p:guide0();if(g&&f2Open&&floorOf(g.x)!==floorOf(player.position.x))return floorOf(player.position.x)===1?UP_ENTRY:DN_ENTRY;return g;}
function guide0(){
  const pp=player.position;
  if(pc.carry.length){let best=null,bd=1e9;for(const d of allDests()){if(pc.has(d.type)&&d.space()>0){const dd=d.dep.distanceTo(pp);if(dd<bd){bd=dd;best=d;}}}if(best)return best.dep;}
  for(const co of checkouts)if(co.unlocked&&!co.cashier&&coWaiting(co))return co.reg;
  for(const co of allPiles())if(co.stack.length)return co.pile;
  let best=null;for(const p of pads){if(p.visible&&money>=padCost(p)-p.paid-0.01&&(!best||padCost(p)<padCost(best)))best=p;}
  if(best)return V3(best.x,0,best.z);
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
canvas.addEventListener('pointerdown',e=>{pinch.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch.pts.size===2){const [a,b]=[...pinch.pts.values()];pinch.d0=Math.hypot(a.x-b.x,a.y-b.y)||1;pinch.z0=userZoom;joy.active=false;joy.dx=joy.dy=0;showFixedJoy();return;}
  if(pinch.pts.size>2)return;
  initAudio();joy.active=true;joy.id=e.pointerId;const hm=joyHome();joy.ox=hm?hm.x:e.clientX;joy.oy=hm?hm.y:e.clientY;joy.dx=joy.dy=0;joyEl.style.opacity=1;
  joyEl.style.left=joy.ox+'px';joyEl.style.top=joy.oy+'px';joyEl.style.display='block';knob.style.transform='';try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(pinch.pts.has(e.pointerId))pinch.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch.pts.size===2){const [a,b]=[...pinch.pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y)||1;userZoom=Math.max(0.65,Math.min(1.6,pinch.z0*pinch.d0/d));return;}
  if(!joy.active||e.pointerId!==joy.id)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),R=48;if(d>R){dx*=R/d;dy*=R/d;}
  joy.dx=dx/R;joy.dy=dy/R;knob.style.transform=`translate(${dx}px,${dy}px)`;});
const endJoy=e=>{pinch.pts.delete(e.pointerId);if(e.pointerId!==joy.id)return;joy.active=false;joy.dx=joy.dy=0;joyEl.style.display='none';knob.style.transform='';showFixedJoy();};
canvas.addEventListener('wheel',e=>{userZoom=Math.max(0.65,Math.min(1.6,userZoom*(e.deltaY>0?1.08:0.93)));},{passive:true});
canvas.addEventListener('pointerup',endJoy);canvas.addEventListener('pointercancel',endJoy);
let hinted=false;

/* ---------- sound ---------- */
let AC=null,soundOn=true;const lastB={};
function initAudio(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{AC=new (window.AudioContext||window.webkitAudioContext)();musicInit();}catch(_){}}
function blip(f=600,d=0.06,type='triangle',vol=0.07){if(!soundOn||!AC)return;const k=f|0,now=AC.currentTime;if(lastB[k]&&now-lastB[k]<0.045)return;lastB[k]=now;
  const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(0.0001,now+d);o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+d+0.02);}
function chord(){if(!soundOn||!AC)return;[523,659,784,1046].forEach((f,i)=>setTimeout(()=>blip(f,0.18,'sine',0.07),i*70));}
const sndBtn=document.getElementById('snd');sndBtn.onclick=()=>{soundOn=!soundOn;sndBtn.textContent=soundOn?'🔊 音效：开':'🔇 音效：关';saveSettings();};
const rstBtn=document.getElementById('rst');let rstArm=0,resetting=false;
rstBtn.onclick=()=>{if(Date.now()-rstArm<2500){try{localStorage.removeItem(KEY);localStorage.removeItem(KEY1);}catch(_){}resetting=true;location.reload();}else{rstArm=Date.now();rstBtn.textContent='⚠️ 再点一次确认重开';setTimeout(()=>rstBtn.textContent='↺ 重新开始（清空本机进度）',2500);}};

/* ---------- HUD ---------- */
const mval=document.getElementById('mval'),mpill=document.getElementById('money'),pval=document.getElementById('pval'),toastEl=document.getElementById('toast');
let shownMoney=-1,toastTimer=0,shownProg='';
function toast(t,ms=1600){toastEl.textContent=L(t);toastEl.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('on'),ms);}
function updHud(){const m=Math.floor(money+1e-6);if(m!==shownMoney){if(m>shownMoney&&shownMoney>=0){mpill.classList.remove('pulse');void mpill.offsetWidth;mpill.classList.add('pulse');}shownMoney=m;mval.textContent=m;}
  const pr=(f2Open?(floorOf(player.position.x)===2?'2F · ':'1F · '):'')+pads.reduce((s,p)=>s+p.lvl,0)+'/'+TOTAL_STEPS;if(pr!==shownProg){shownProg=pr;pval.textContent=pr;}}

/* ---------- save / load ---------- */
let money=20;
function binKeys(){const o={};for(const t in producers)o['p:'+t]=producers[t];for(const t in shelves)o['s:'+t]=shelves[t];for(const t in machines){o['mi:'+t]=machines[t].inp;o['mo:'+t]=machines[t].out;}for(const t in pallets)o['pl:'+t]=pallets[t];return o;}
function saveObj(){const ach=ACH_STATE,vipS=vipState;const counts={};const bk=binKeys();for(const k in bk)counts[k]=bk[k].count;
  return ({savedAt:Date.now(),money,banks:checkouts.map(co=>co.stack.reduce((a,b)=>a+b,0)),pads:pads.map(p=>({id:p.id,lvl:p.lvl,paid:p.paid})),counts,fhBank:fhPile.stack.reduce((a,b)=>a+b,0),day:{t:dayT,n:dayN},stats,daily,story,ach,vip:vipS,decor});}
const progressNow=()=>pads.reduce((s,p)=>s+p.lvl,0);
function save(){if(resetting||NET.mode==='guest')return;try{localStorage.setItem(KEY,JSON.stringify(saveObj()));}catch(_){}cloudSoon();}
function load(){
  unlockProducer('tomato');unlockShelf('tomato');unlockCheckout(0);producers.tomato.count=3;
  if(NET.mode==='guest'){const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();return;}
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(_){}
  if(!s){try{const o=JSON.parse(localStorage.getItem(KEY1));if(o){s={money:o.money,pads:o.pads,banks:[o.bank||0],counts:{}};
    ['tomato','egg','milk'].forEach((t,i)=>{if(o.prod)s.counts['p:'+t]=o.prod[i];if(o.shelf)s.counts['s:'+t]=o.shelf[i];});}}catch(_){}}
  if(s){money=+s.money||0;
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
    hinted=true;hint.style.opacity=0;offlineFrom=+s.savedAt||0;if(s.legacy)Object.assign(legacy,s.legacy);}
  const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();
}

/* ---------- day & night ---------- */
const DAY_LEN=240;let dayT=0.04,dayN=1,wasNight=false;
const dayBg=new THREE.Color(0x8fd96b),nightBg=new THREE.Color(0x1b2a44),tmpC=new THREE.Color();
function hourOf(t){return (6+t*24)%24;}
function lightK(h){if(h>=7&&h<18)return 1;if(h>=18&&h<20)return 1-(h-18)/2;if(h>=20||h<4.5)return 0;return Math.min(1,(h-4.5)/2.5);}
function isNight(){return lightK(hourOf(dayT))<0.35;}
function updDay(dt){
  if(NET.mode!=='guest'){dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;newDay();}}
  const k=lightK(hourOf(dayT))*(isRaining()?0.72:1);
  hemi.intensity=0.3+0.55*k;hemi.color.setRGB(0.72+0.28*k,0.78+0.22*k,1);sun.intensity=0.06+0.49*k;sun.color.setRGB(1,0.82+0.18*k,0.65+0.35*k);
  tmpC.copy(nightBg).lerp(dayBg,k);scene.background.copy(tmpC);scene.fog.color.copy(tmpC);
  lampMat.emissiveIntensity=(1-k)*1.3;winMat.emissiveIntensity=(1-k)*0.9;
  for(const m of litFloors()){m.emissive.setHex(0xffeccc);m.emissiveIntensity=(1-k)*0.42;}
  const n=k<0.35;if(n!==wasNight){wasNight=n;if(T>2)toast(n?'🌙 天黑了：客人少一些，但每人买得更多':'☀️ 天亮了',2200);}
}
const litFloors=()=>[westFloorMat,eastFloorMat,wingFloorMat,fhFloorM,M(0xebe6f3),M(0xfbdab7),M(0xdbe9f7),M(0xf6f2fb),...shelfMats];
function clockText(){const h=hourOf(dayT),hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return (isNight()?'🌙':'☀️')+' '+TT('第'+dayN+'天 ','Day '+dayN+' ','Hari '+dayN+' ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');}

/* ---------- stats, daily goals, story ---------- */
const stats={sold:{},served:0,diners:0,earned:0,night:0,rate:0};let offlineFrom=0;
const daily={goals:[],d:{sold:{},served:0,diners:0,earned:0},day:0};
function onSale(t,n){if(promo&&promo.type===t)stats.promoSold=(stats.promoSold||0)+n;if(curFest&&curFest.item===t)stats.fest=(stats.fest||0)+n;stats.sold[t]=(stats.sold[t]||0)+n;daily.d.sold[t]=(daily.d.sold[t]||0)+n;}
function onServed(earn,diner){if(diner){stats.diners++;daily.d.diners++;}else{stats.served++;daily.d.served++;}if(isNight())stats.night++;stats.earned+=earn;daily.d.earned+=earn;}
const GOAL_TXT={sell:g=>TT('卖出 '+g.n+' 个','Sell '+g.n+' ','Jual '+g.n+' ')+ITEM[g.t].e,served:g=>TT('服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers','Layan '+g.n+' pelanggan'),
  diners:g=>TT('招待 '+g.n+' 位食客','Serve '+g.n+' diners','Layan '+g.n+' pengunjung makan'),earn:g=>TT('赚到','Earn','Peroleh')+' 💵'+g.n,night:g=>TT('夜里服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers at night','Layan '+g.n+' pelanggan waktu malam'),
  pad:g=>TT('解锁「'+padById[g.id].name+'」','Unlock "'+L(padById[g.id].name)+'"','Buka "'+L(padById[g.id].name)+'"'),all:g=>L('建好全部设施')};
function genDaily(){const ls=lines(),L=Math.max(1,ls.length);const g=[];
  if(ls.length){const t=ls[(Math.random()*ls.length)|0];g.push({k:'sell',t,n:Math.max(4,Math.round(90/ITEM[t].price))+L});}
  g.push(fhOpen&&Math.random()<0.5?{k:'diners',n:6+stallsOpen().length*3}:{k:'served',n:8+L*3});
  g.push({k:'earn',n:Math.round((120+L*110)/10)*10});
  const rw=Math.round((50+L*40)/10)*10;daily.goals=g.map(x=>({...x,done:false,reward:rw}));daily.d={sold:{},served:0,diners:0,earned:0};daily.day=dayN;}
function dailyProg(g){const d=daily.d;return g.k==='sell'?(d.sold[g.t]||0):g.k==='served'?d.served:g.k==='diners'?d.diners:d.earned;}
function newDay(){genDaily();toast('☀️ 第'+dayN+'天开始，今日目标更新啦',2400);}
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
];
const story={mode:null,on:false,ch:0,base:null,done:false};
const statsCopy=()=>JSON.parse(JSON.stringify(stats));
function storyProg(g){const b=story.base||stats;
  switch(g.k){case 'sell':return [(stats.sold[g.t]||0)-(b.sold[g.t]||0),g.n];case 'served':return [stats.served-b.served,g.n];case 'diners':return [stats.diners-b.diners,g.n];
    case 'earn':return [stats.earned-b.earned,g.n];case 'night':return [stats.night-(b.night||0),g.n];case 'pad':return [padById[g.id].lvl>0?1:0,1];case 'all':return [pads.filter(p=>p.done).length,pads.length];}return [0,1];}
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
const clockEl=document.getElementById('clock'),cardBd=document.getElementById('cardBd'),cardTg=document.getElementById('cardTg'),storyBox=document.getElementById('storyBox'),dailyBox=document.getElementById('dailyBox');
let cardOpen=innerWidth>=520;try{const v=localStorage.getItem('fm-card');if(v)cardOpen=v!=='0';}catch(_){}
document.getElementById('cardHd').onclick=()=>{cardOpen=!cardOpen;try{localStorage.setItem('fm-card',cardOpen?'1':'0');}catch(_){}renderCard();};
function goalLine(txt,a,b,done){const v=Math.max(0,Math.min(a,b));return '<div class="goal'+(done?' ok':'')+'">'+txt+' <b>'+Math.floor(v)+'/'+b+'</b><div class="bar"><i style="width:'+Math.min(100,v/b*100)+'%"></i></div></div>';}
function renderCard(){renderCard0();trDom(cardBd);}
function renderCard0(){clockEl.textContent=clockText();cardTg.textContent=cardOpen?'▾':'▸';cardBd.hidden=!cardOpen;
  if(NET.mode==='guest'){storyBox.innerHTML='';stockBox.innerHTML=stockHtml();dailyBox.innerHTML=orderHtml()+teamHtml()+'<div class="sec">'+L('👥 在朋友的店里帮忙')+'</div>';return;}
  let h='';if(story.on){if(story.done)h='<div class="sec">📖 故事完成 🎉</div>';else{const C=STORY[story.ch];h='<div class="sec">'+chTitle(story.ch+1,C.t)+'</div>'+C.goals.map(g=>{const [a,b]=storyProg(g);return goalLine(GOAL_TXT[g.k](g),a,b,a>=b);}).join('');}}
  storyBox.innerHTML=h;
  stockBox.innerHTML=stockHtml();
  dailyBox.innerHTML=orderHtml()+teamHtml()+'<div class="sec">📋 今日目标'+(daily.goals[0]?'（每项 +💵'+daily.goals[0].reward+'）':'')+'</div>'+daily.goals.map(g=>goalLine(GOAL_TXT[g.k](g),g.done?g.n:dailyProg(g),g.n,g.done)).join('');}
let cardT=0;function cardTick(dt){festUpdate(dt);eventsTick(dt);orderTick(dt);teamTick(dt);cardT-=dt;if(cardT<=0){cardT=0.5;checkGoals();checkAch();vipTick(0.5);scoreTick(0.5);rateTick(0.5);tipsTick();renderCard();}musicTick();}

load();
if(NET.mode!=='guest'){if(!daily.goals.length)genDaily();if(!story.mode)setTimeout(showMenu,400);}
wasNight=isNight();
setInterval(save,2500);
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
  const moving=mag>0.12&&!riding;
  if(moving){const sp=speed()*mag;player.position.x+=ix/mag*sp*dt;player.position.z+=iz/mag*sp*dt;faceTo(player,Math.atan2(ix,iz),dt);
    if(!hinted){hinted=true;hint.style.opacity=0;}}
  if(!riding){collide(player.position,0.4);
    if(floorOf(player.position.x)===2){player.position.x=Math.max(58.4,Math.min(119.6,player.position.x));player.position.z=Math.max(-13.8,Math.min(-0.3,player.position.z));}
    else{player.position.x=Math.max(-13,Math.min(46,player.position.x));player.position.z=Math.max(-13.8,Math.min(15.5,player.position.z));}}
  animChar(pch,moving,T,pc.carry.length>0,riding);
  pc.sway+=((moving?mag:0)-pc.sway)*Math.min(1,dt*6);pc.layout();
  maxTag.s.visible=pc.total()>=cap();maxTag.s.position.set(0,0.95+pc.carry.length*0.42+0.45,0.52);
  if(NET.mode==='guest'){guestUpdate(dt);updSparks(dt);updTown(dt);updDay(dt);cardTick(dt);updEscalators(dt);updFx(dt);updGuide(dt);updCamera(dt);updHud();netTick(dt);return;}

  // production
  for(const k in producers){const pr=producers[k];if(!pr.unlocked||pr.count>=pr.max)continue;
    pr.t+=dt;if(pr.t>=pr.iv*boost()){pr.t=0;pr.count++;pr.refresh();pop(pr.slots[pr.count-1],0.1);}}
  for(const k in machines){const m=machines[k];if(!m.unlocked)continue;
    if(m.fh){m.sup=(m.sup||0)+dt;if(m.sup>5&&m.inp.count+m.inp.incoming<m.inp.max){m.sup=0;m.inp.count++;m.inp.refresh();}}
    const working=m.inp.count>0&&m.out.count<m.out.max;
    if(working){m.t+=dt;if(m.t>=m.time*boost()){m.t=0;m.inp.count--;m.inp.refresh();m.out.count++;m.out.refresh();pop(m.out.slots[m.out.count-1],0.1);}}
    m.body.scale.y=working?1+Math.sin(T*22)*0.03:1;if(m.chef){m.chef.armL.rotation.x=working?-1.2+Math.sin(T*14)*0.4:0;m.chef.armR.rotation.x=working?-1.2-Math.sin(T*14)*0.4:0;}m.glowMat.emissiveIntensity=working?0.7+Math.sin(T*8)*0.3:0;}

  for(const a of actors())actorInteract(a,dt);
  for(const co of checkouts){if(!co.unlocked)continue;
    const front=co.queue[0];
    if(front&&front.arrived){const staffed=co.cashier||actors().some(a=>near(a.g.position,co.reg,1.2));
      if(staffed){co.checkT+=dt;if(co.checkT>(co.cashier?0.85:0.5)){co.checkT=0;checkout(co,front);}}else co.checkT=0;}
    if(co.cashier)co.cashier.armL.rotation.x=front&&front.arrived?-1+Math.sin(T*16)*0.3:0;
    co.ring.material.opacity=0.55+Math.sin(T*5)*0.25;
  }
  for(const p of pads){if(p.dirty&&p.visible){drawPad(p);p.dirty=false;}if(p.visible){const ok=money>=padCost(p)-p.paid;p.mesh.scale.setScalar(ok?1+Math.sin(T*5)*0.04:1);}}
  updPromo(dt);updDay(dt);cardTick(dt);

  // customers
  const ls=lines().length;spawnT+=dt;
  const active=customers.filter(c=>c.state!=='leave').length;
  const interval=Math.max(0.55,3.4-0.25*ls-0.3*adsLvl())*(promo?0.7:1)*(isNight()?1.6:1)*(curFest?0.75:1)*(isRaining()?1.25:1);
  if(ls&&spawnT>interval&&active<Math.min(24,2+2*ls+2*adsLvl())){spawnT=0;spawnCustomer();}
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
  sun.target.position.set(camT.x,camT.y,camT.z-2);sun.position.set(camT.x-10,camT.y+24,camT.z+10);
}

/* ---------- actors: you + friends standing in this shop ---------- */
const LOCAL={id:'me',g:player,c:pc,stand:{},collectT:0,get riding(){return pRide.path.length>0;}};
function actors(){return [LOCAL,...NET.remote.values()];}
function actorInteract(a,dt){
  if(a.riding)return;
  const c=a.c,pp=a.g.position,me=a.id==='me';c.t+=dt;
  eventInteract(a,dt);
  for(const src of allSources()){if(near(pp,src.pick,src.kind==='mout'?1.0:src.kind==='pallet'?0.9:1.4)&&src.count>0&&c.total()<cap()&&c.t>0.11){c.t=0;takeFrom(src,c);if(me)blip(620+c.total()*20,0.05);}}
  for(const dst of allDests()){if(near(pp,dst.dep,dst.kind==='min'?1.0:1.5)&&c.has(dst.type)&&dst.space()>0&&c.t>0.09){c.t=0;depositTo(dst,c);if(!me)a.contrib=(a.contrib||0)+2;vib(6);if(me)blip(520,0.05,'square',0.035);}}
  if(c.carry.length&&near(pp,TRASH,1.1)&&c.t>0.08){c.t=0;const it=c.carry[c.carry.length-1];const r=c.removeType(it.type);
    if(r)fly(r.mesh,r.pos,()=>V3(TRASH.x,0.8,TRASH.z),0.2,()=>scene.remove(r.mesh),0.6);if(me)blip(300,0.05,'square',0.03);}
  for(const co of allPiles()){
    if(co.stack.length&&near(pp,co.pile,1.5)){a.collectT+=dt;
      while(a.collectT>0.03&&co.stack.length){a.collectT-=0.03;const v=co.stack.pop();const b=makeItem('bill');
        fly(b,co.billSlot(co.stack.length),()=>a.g.position.clone().add(V3(0,1.2,0)),0.2,()=>{scene.remove(b);money+=v;if(me&&sparkCool<=0){sparkCool=0.15;sparkle(a.g.position.clone().add(V3(0,1.4,0)),3,0x9cf27a,0.7);}},0.6);if(me)blip(1100,0.04,'sine',0.05);}
      co.refresh();}}
  for(const p of pads){if(!p.visible)continue;
    if(Math.abs(pp.x-p.x)<1&&Math.abs(pp.z-p.z)<1){a.stand[p.id]=(a.stand[p.id]||0)+dt;
      if(a.stand[p.id]>0.25&&money>=0.5){const cost=padCost(p),rate=Math.max(cost/1.3,40);const amt=Math.min(rate*dt,money,cost-p.paid);p.paid+=amt;money-=amt;p.dirty=true;
        p.flyT+=dt;if(p.flyT>0.07){p.flyT=0;const b=makeItem('bill');fly(b,a.g.position.clone().add(V3(0,1.2,0)),()=>V3(p.x,floorY(p.x)+0.1,p.z),0.22,()=>scene.remove(b),0.7);if(me)blip(760,0.03,'sine',0.04);}
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
    x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.font='900 50px system-ui,sans-serif';x.fillText('🔥 特价',128,58);promoTag.tex.needsUpdate=true;scene.add(promoTag.s);}
  promoTag.s.visible=!!promo&&!!shelves[promo.type];
  if(promoTag.s.visible){const sh=shelves[promo.type];promoTag.s.position.set(sh.x,floorY(sh.x)+3.6+Math.sin(T*4)*0.12,sh.z-0.5);}
}

/* ---------- online co-op (room capability) ---------- */
const PCOLS=[0xff9b3d,0x4aa3ff,0xff5d8f,0x9b6bff,0x2ec27e];
const ALLT=Object.keys(ITEM);const tcode=t=>ALLT.indexOf(t).toString(36);const tdec=ch=>ALLT[parseInt(ch,36)];
const r1=v=>Math.round(v*10)/10;
const carryStr=c=>c.carry.map(i=>tcode(i.type)).join('');
function binList(){return Object.values(binKeys());}
const cleanName=t=>String(t||'').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f]/g,'').trim().slice(0,8)||'玩家';
function nameTag(text,col){const s=canvasSprite(256,64,1.7,0.42);const x=s.ctx;x.textAlign='center';x.textBaseline='middle';x.font='900 34px system-ui,sans-serif';x.lineJoin='round';x.lineWidth=9;
  x.strokeStyle='#'+col.toString(16).padStart(6,'0');x.strokeText(text,128,34);x.fillStyle='#fff';x.fillText(text,128,34);s.tex.needsUpdate=true;return s;}
function makeAvatar(nick,ci){const ch=makeChar(PCOLS[ci%5],{sprout:true,apron:true});scene.add(ch.g);const tag=nameTag(nick,PCOLS[ci%5]);tag.s.position.y=2.35;ch.g.add(tag.s);
  const emo=canvasSprite(128,144,0.9,1.0);emo.s.position.y=3.1;emo.s.visible=false;ch.g.add(emo.s);
  return {id:'r',ch,g:ch.g,c:new Carrier(ch.g),tag,nick,ci,emoS:emo,emoKey:'',emoUntil:0,tx:0,ty:0,tz:0,tr:0,ride:false,stand:{},collectT:0,get riding(){return this.ride;},last:null};}
function avatarSet(a,nick,ci){if(a.nick!==nick||a.ci!==ci){a.nick=nick;a.ci=ci;a.ch.g.remove(a.tag.s);a.tag=nameTag(nick,PCOLS[ci%5]);a.tag.s.position.y=2.35;a.ch.g.add(a.tag.s);}}
function showEmo(a,emo){if(!emo||!emo.e)return;const k=emo.e+emo.t;if(a.emoKey===k)return;a.emoKey=k;drawBubble(a.emoS,String(emo.e).slice(0,4),'');a.emoS.visible=true;a.emoUntil=T+2.5;}
function moveAvatar(a,dt){const p=a.g.position;const k=Math.min(1,dt*12);const before=p.clone();
  p.x+=(a.tx-p.x)*k;p.z+=(a.tz-p.z)*k;p.y+=(a.ty-p.y)*k;if(Math.hypot(a.tx-p.x,a.tz-p.z)>4){p.set(a.tx,a.ty,a.tz);}
  let d=a.tr-a.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));a.g.rotation.y+=d*k;
  const mv=before.distanceTo(p)>0.004;animChar(a.ch,mv&&!a.ride,T,a.c.carry.length>0,true);a.c.layout();
  if(a.emoS.visible&&T>a.emoUntil)a.emoS.visible=false;}
function setCarry(c,str){const cur=carryStr(c);if(cur===str)return;
  if(str.startsWith(cur)){for(const ch of str.slice(cur.length)){const t=tdec(ch);if(t)c.add(t,makeItem(t));}return;}
  for(const it of c.carry)c.g.remove(it.mesh);c.carry.length=0;for(const ch of str){const t=tdec(ch);if(t)c.add(t,makeItem(t));}}
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
  o.gr={};for(const [k,a] of NET.remote)o.gr[k]=Math.floor(a.contrib||0);o.ev=evSnap();o.od=order?[tcode(order.type),order.got,order.n,Math.ceil(order.t),order.who]:null;o.tg=team?[team.n,team.got,Math.ceil(team.t)]:null;o.lg=legacy.n||0;
  pads.forEach((p,i)=>{if(p.paid>0.5)o.pp.push([i,Math.round(p.paid)]);});
  let list=customers.map(c=>[c.id,r1(c.g.position.x),r1(c.g.position.y),r1(c.g.position.z),r1(c.g.rotation.y),c.ci,c.si,c.hi,c.bubKey,Math.min(18,c.bought),c.sit?1:0,c.cart?1:0,c.diner?1:0,c.vip>=0?c.vip:-1,c.vr||0,c.dog?1:0].join(','));
  o.c=list.join('|');
  while(JSON.stringify(o).length>3800&&list.length){list=list.slice(0,list.length-2);o.c=list.join('|');}
  return o;
}
const gHelpers=[],gCust=new Map();
function puppet(ch,bubScale){scene.add(ch.g);const bub=canvasSprite(128,144,bubScale,bubScale*1.125);bub.s.position.y=2.3;ch.g.add(bub.s);return {ch,g:ch.g,c:new Carrier(ch.g),bub,bubKey:'',tx:0,ty:0,tz:0,tr:0,fresh:true};}
function puppetMove(p,dt,carrying){const g=p.g.position;if(p.fresh){g.set(p.tx,p.ty,p.tz);p.g.rotation.y=p.tr;p.fresh=false;}
  const k=Math.min(1,dt*10),b=g.clone();g.x+=(p.tx-g.x)*k;g.y+=(p.ty-g.y)*k;g.z+=(p.tz-g.z)*k;if(Math.hypot(p.tx-g.x,p.tz-g.z)>4)g.set(p.tx,p.ty,p.tz);
  let d=p.tr-p.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));p.g.rotation.y+=d*k;animChar(p.ch,b.distanceTo(g)>0.004,T+(p.phase||0),carrying,true);}
function guestApply(P){
  money=+P.m||0;
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
  const myGr=(P.gr||{})[NET.myPeer]||0;if(myGr>0){try{const hb=JSON.parse(localStorage.getItem('fm-helpbank')||'null');if(!hb||hb.code!==NET.code||hb.v<myGr)localStorage.setItem('fm-helpbank',JSON.stringify({code:NET.code,v:myGr}));}catch(_){}}
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
      p.cart=f[11]==='1';if(+f[13]>=0&&VIPS[+f[13]]){addCrown(p.g);const tg=nameTag('⭐'+VIPS[+f[13]].n,0xd4a017);tg.s.position.y=2.95;p.g.add(tg.s);}if(p.cart)makeCart(p);else if(f[12]!=='1'){const bk=new THREE.Mesh(GEO.basket,M(BASKET_COLS[(+id)%4]));bk.position.set(0,0.72,0.46);p.g.add(bk);}
      p.bought=0;p.phase=+id;gCust.set(id,p);}
    p.sit=f[10]==='1';
    p.tx=+f[1];p.ty=+f[2];p.tz=+f[3];p.tr=+f[4];
    const bk=f[8]||'';if(bk!==p.bubKey){p.bubKey=bk;const m=bk.match(/^(.*?)(\d+\/\d+)?$/);drawBubble(p.bub,m?m[1]:bk,m&&m[2]?m[2]:'');}
    const nb=+f[9]||0;while(p.bought<nb){const k=p.bought++;const it=makeItem(ALLT[(k*7+(+id))%11]);if(p.cart){it.scale.setScalar(0.55);it.position.copy(cartSlot(k));}else{it.scale.setScalar(0.45);it.position.set(-0.15+(k%3)*0.15,0.8+Math.floor(k/3)*0.12,0.4);}p.g.add(it);}}
  for(const [id,p] of gCust)if(!seen.has(id)){if(p.dog)scene.remove(p.dog);scene.remove(p.g);p.bub.tex.dispose();gCust.delete(id);}
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
  for(const [k,a] of NET.avatars)if(!alive.has(k)){scene.remove(a.g);NET.avatars.delete(k);}
  for(const a of NET.avatars.values())moveAvatar(a,dt);
  for(const p of gHelpers)puppetMove(p,dt,p.c.carry.length>0),p.c.layout();
  for(const p of gCust.values()){if(p.dog)dogFollow(p.dog,p.g,dt);p.bub.s.visible=Math.hypot(p.g.position.x-camT.x,p.g.position.z-camT.z)<13;puppetMove(p,dt,true);if(p.sit){p.ch.legL.rotation.x=p.ch.legR.rotation.x=-1.4;}}
  for(const p of pads)if(p.dirty&&p.visible){drawPad(p);p.dirty=false;}
  updPromo(dt);
  const f=Math.floor(money);if(f!==shownMoney)updHud();
}
function hostPeers(){
  const room=NET.room;if(!room)return;const alive=new Set();let n=0;
  for(const pr of room.peers()){if(pr.isMe||!pr.presence||pr.presence.role!=='guest')continue;if(++n>4)break;alive.add(pr.peer);
    let a=NET.remote.get(pr.peer);const P=pr.presence;
    if(!a){a=makeAvatar(cleanName(P.nick),+P.col||1);a.id=pr.peer;a.tx=+P.x||0;a.ty=+P.y||0;a.tz=+P.z||0;a.g.position.set(a.tx,a.ty,a.tz);NET.remote.set(pr.peer,a);toast('👋 '+cleanName(P.nick)+' 来帮忙了');}
    avatarSet(a,cleanName(P.nick),+P.col||1);setAvatarHat(a,P.hat);a.tx=+P.x||0;a.ty=+P.y||0;a.tz=+P.z||0;a.tr=+P.r||0;a.ride=!!P.ride;showEmo(a,P.emo);}
  for(const [k,a] of NET.remote)if(!alive.has(k)){scene.remove(a.g);NET.remote.delete(k);toast('👋 '+a.nick+' 离开了');}
}
function netTick(dt){
  if(!NET.room)return;NET.sendT-=dt;
  if(NET.mode==='host'){hostPeers();if(NET.sendT<=0){NET.sendT=sb&&!window.claude?0.2:0.1;NET.room.presence(snapshot()).catch(()=>{});}}
  else if(NET.mode==='guest'){if(NET.sendT<=0){NET.sendT=sb&&!window.claude?0.2:0.08;const p=player.position;
    NET.room.presence({role:'guest',nick:NET.nick,col:NET.col,x:r1(p.x),y:r1(p.y),z:r1(p.z),r:r1(player.rotation.y),ride:pRide.path.length?1:0,emo:NET.emo,hat:myHat()}).catch(()=>{});}}
  if(mpEl&&!mpEl.hidden&&(T*4|0)%2===0)renderPlayers();
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
let roomApi=null;const roomReady=(window.claude&&window.claude.use?window.claude.use('room'):Promise.resolve(sb?supaRoomApi():null)).then(r=>{roomApi=r;return r;}).catch(()=>null);
function showPanel(){setTimeout(()=>trDom(mpEl),0);mpEl.hidden=false;document.getElementById('mpIdle').hidden=!!NET.room;document.getElementById('mpIn').hidden=!NET.room;
  document.getElementById('mpCodeShow').textContent=NET.code.toUpperCase();renderPlayers();
  if(!NET.room)roomReady.then(r=>{if(!r)mpStatus('联机还没配置：请按 README 在 config.js 填好 Supabase 地址和密钥。');});}
function renderPlayers(){const el=document.getElementById('mpPlayers');if(!el)return;const list=[];
  if(NET.room){for(const pr of NET.room.peers()){const P=pr.presence||{};if(P.role!=='host'&&P.role!=='guest')continue;list.push({n:(pr.isMe?'你 · ':'')+cleanName(P.nick)+(P.role==='host'?' 👑':''),c:PCOLS[(+P.col||0)%5]});}}
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
  if(NET.room)NET.room.leave().catch(()=>{});NET.room=null;NET.mode='solo';for(const a of NET.remote.values())scene.remove(a.g);NET.remote.clear();emoBar.style.display='none';showPanel();mpStatus('已离开房间');}
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
let last=performance.now();
let lastDraw=0;function loop(now){requestAnimationFrame(loop);if(GFX.fps30&&now-lastDraw<30)return;lastDraw=now;let dt=(now-last)/1000;last=now;if(dt>0.05)dt=0.05;if(dt<0)dt=0;T+=dt;update(dt);renderer.render(scene,camera);}
requestAnimationFrame(loop);
/* ---------- offline earnings ---------- */
let rateLastEarned=null,rateAcc=0;
function rateTick(dt){rateAcc+=dt;if(rateAcc<10)return;if(rateLastEarned!=null){const perMin=(stats.earned-rateLastEarned)*(60/rateAcc);stats.rate=stats.rate?stats.rate*0.85+perMin*0.15:perMin;}rateLastEarned=stats.earned;rateAcc=0;}
function staffCount(){return helpers.length+checkouts.filter(c=>c.cashier).length;}
function grantOffline(ms,why){
  if(NET.mode==='guest'||!(ms>120000))return;const mins=Math.min(480,ms/60000);const staff=staffCount();if(!staff||!(stats.rate>0))return;
  const amt=Math.floor(stats.rate*mins*0.3*Math.min(1,staff/4));if(amt<10)return;money+=amt;
  const h=Math.floor(mins/60),m=Math.floor(mins%60);say(['🧺',L('店员们')],[L('你离开了')+' '+(h?h+L('小时'):'')+m+L('分钟')+L('，店员们帮你赚了')+' 💵'+amt+'！'+(mins>=480?L('（最多累计 8 小时）'):'')]);}
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt){grantOffline(Date.now()-hiddenAt);hiddenAt=0;}});
setTimeout(()=>{if(offlineFrom)grantOffline(Date.now()-offlineFrom);
  try{const hb=JSON.parse(localStorage.getItem('fm-helpbank')||'null');if(hb&&hb.v>0&&NET.mode!=='guest'){const v=Math.floor(hb.v);money+=v;localStorage.removeItem('fm-helpbank');setTimeout(()=>toast(L('👥 你在朋友店里帮忙，带回了')+' 💵'+v,3000),1200);}}catch(_){}},1800);

/* ---------- random events: rain, tour group, spill, lost child ---------- */
let ev=null,evT=150;
const rainG=new THREE.Group();scene.add(rainG);rainG.visible=false;
const rainGeo=new THREE.BufferGeometry();{const n=600,p=new Float32Array(n*6);for(let i=0;i<n;i++){const x=(Math.random()-0.5)*40,y=Math.random()*14,z=(Math.random()-0.5)*40;p.set([x,y,z,x-0.08,y-0.6,z],i*6);}rainGeo.setAttribute('position',new THREE.BufferAttribute(p,3));}
const rainLines=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xcfe6ff,transparent:true,opacity:0.55}));rainG.add(rainLines);
const spillM=new THREE.Mesh(new THREE.CircleGeometry(0.75,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthWrite:false}));spillM.rotation.x=-Math.PI/2;spillM.visible=false;scene.add(spillM);
const spillTag=canvasSprite(128,144,0.8,0.9);drawBubble(spillTag,'🧽','');spillTag.s.visible=false;scene.add(spillTag.s);
let kid=null,parentNpc=null;
function evSnap(){if(!ev)return null;const o={k:ev.k};if(ev.k==='spill'){o.x=r1(ev.x);o.z=r1(ev.z);}if(ev.k==='lost'&&kid){o.kx=r1(kid.g.position.x);o.kz=r1(kid.g.position.z);o.kr=r1(kid.g.rotation.y);o.px=r1(parentNpc.g.position.x);o.pz=r1(parentNpc.g.position.z);o.f=ev.follow?1:0;}return o;}
function evApply(o){const k=o?o.k:null;rainG.visible=k==='rain';spillM.visible=spillTag.s.visible=k==='spill';if(k==='spill'){spillM.position.set(o.x,0.12,o.z);spillTag.s.position.set(o.x,1.2,o.z);}
  if(k==='lost'){if(!kid)makeLost();kid.tx=o.kx;kid.tz=o.kz;kid.g.rotation.y=o.kr;parentNpc.g.position.set(o.px,0,o.pz);drawBubble(kid.bub,o.f?'🙂':'😢','');}else if(kid)clearLost();
  if(k!==(ev&&ev.k)&&k)toast(EV_TXT[k]||'',2600);ev=o;}
function makeLost(){const ci=(Math.random()*CC.length)|0;const ch=makeChar(CC[ci],{skin:SKINS[(ci+2)%5],hat:CC[(ci+4)%CC.length]});ch.g.scale.setScalar(0.66);scene.add(ch.g);
  const bub=canvasSprite(128,144,1.0,1.125);bub.s.position.y=2.4;ch.g.add(bub.s);drawBubble(bub,'😢','');kid={ch,g:ch.g,bub,tx:0,tz:0};
  const pa=makeChar(CC[(ci+1)%CC.length],{skin:SKINS[(ci+2)%5]});scene.add(pa.g);const pb=canvasSprite(128,144,1.0,1.125);pb.s.position.y=2.3;pa.g.add(pb.s);drawBubble(pb,'❓','');parentNpc={ch:pa,g:pa.g,bub:pb};}
function clearLost(){if(kid){scene.remove(kid.g);scene.remove(parentNpc.g);kid=parentNpc=null;}}
const EV_TXT={rain:'🌧️ 下雨了！客人少一点，二楼的雨伞会卖得特别好',tour:'🚌 旅游团来了！一大群客人马上进店',spill:'🥛 有人打翻了牛奶！走过去站一会儿就能清理干净',lost:'😢 有个小朋友走丢了！走到他身边，带他去门口找爸爸妈妈'};
function eventsTick(dt){
  if(kid){const k=kid.g.position;if(NET.mode==='guest'){k.x+=(kid.tx-k.x)*Math.min(1,dt*8);k.z+=(kid.tz-k.z)*Math.min(1,dt*8);animChar(kid.ch,Math.hypot(kid.tx-k.x,kid.tz-k.z)>0.03,T,false);}}
  if(ev&&ev.k==='rain'&&rainG.visible){rainG.position.set(camT.x,camT.y,camT.z-4);const p=rainGeo.attributes.position.array;for(let i=0;i<p.length;i+=6){p[i+1]-=dt*16;p[i+4]-=dt*16;if(p[i+4]<0){p[i+1]+=14;p[i+4]+=14;}}rainGeo.attributes.position.needsUpdate=true;}
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
  const opts=['rain','tour','spill','lost'];const k=opts[(Math.random()*opts.length)|0];
  if(k==='rain'){ev={k,t:70};rainG.visible=true;}
  else if(k==='tour'){ev={k,t:10,left:8,sp:0};}
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
  if(team){team.t-=dt;team.got=stats.served-team.base;if(team.got>=team.n){const rw=300*(NET.remote.size+1)+team.n*10;money+=rw;for(const a of NET.remote.values())a.contrib=(a.contrib||0)+rw*0.15;toast(L('🤝 团队目标完成！大家一起赚了')+' 💵'+rw,2800);chord();team=null;teamT=120;}
    else if(team.t<=0){toast(L('🤝 团队目标没完成，再来一次吧'),2000);team=null;teamT=90;}return;}
  teamT-=dt;if(teamT<=0){const n=12+8*NET.remote.size;team={n,got:0,t:300,base:stats.served};toast(L('🤝 团队目标：5 分钟内一起服务')+' '+n+' '+L('位顾客'),2800);}}
function teamHtml(){if(!team)return '';return '<div class="sec">🤝 '+L('团队目标')+' · ⏱'+Math.floor(team.t/60)+':'+String(Math.floor(team.t%60)).padStart(2,'0')+'</div>'+goalLine(L('一起服务顾客'),team.got,team.n,false);}

/* ---------- stock overview (tap to point the arrow) ---------- */
let stockList=[];
document.getElementById('stockBox').addEventListener('click',e=>{const b=e.target.closest('[data-si]');if(!b)return;const it=stockList[+b.dataset.si];if(it){guideOverride={p:it.p,until:T+25};toast('👉 '+it.e);}});
function stockHtml(){stockList=[];for(const t of lines()){const sh=shelves[t];if(sh.count===0&&sh.incoming===0)stockList.push({e:ITEM[t].e,p:sh.dep});}
  for(const m of Object.values(machines))if(m.unlocked&&m.inp.count===0&&m.inp.incoming===0&&!m.fh)stockList.push({e:'⚙️'+ITEM[m.inT].e,p:m.inp.dep});
  if(!stockList.length)return '';return '<div class="sec">⚠️ '+L('缺货（点一下带你去）')+'</div><div class="stock">'+stockList.slice(0,8).map((s,i)=>'<button class="chip2" data-si="'+i+'">'+s.e+'</button>').join('')+'</div>';}

/* ---------- tips for new players ---------- */
let tipsSeen={};try{tipsSeen=JSON.parse(localStorage.getItem('fm-tips')||'{}');}catch(_){}
const tipEl=document.getElementById('tip');let tipTimer=0,playT=0;
function showTip(id,text){if(tipsSeen[id])return false;tipsSeen[id]=1;try{localStorage.setItem('fm-tips',JSON.stringify(tipsSeen));}catch(_){}tipEl.textContent='💡 '+L(text);tipEl.classList.add('on');clearTimeout(tipTimer);tipTimer=setTimeout(()=>tipEl.classList.remove('on'),5200);return true;}
function tipsTick(){playT+=0.5;if(tipEl.classList.contains('on'))return;
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
function applyTheme(){const th=THEMES[(legacy.n||0)%THEMES.length];M(0x8fd96b).color.setHex(th.g);dayBg.setHex(th.sky);M(0x4fbf4a).color.setHex(th.t1);M(0x62d15a).color.setHex(th.t2);}
function openBranch(){
  const keep={savedAt:Date.now(),money:300,legacy:{n:(legacy.n||0)+1},ach:ACH_STATE,vip:vipState,decor,stats,story,day:{t:0.04,n:1},daily:{goals:[],d:{sold:{},served:0,diners:0,earned:0},day:0},pads:[],counts:{}};
  try{localStorage.setItem(KEY,JSON.stringify(keep));}catch(_){}resetting=true;cloudPushObj(keep).finally(()=>location.reload());}

/* ---------- sparkles & camera punch ---------- */
const sparkTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,236,150,.9)');gr.addColorStop(1,'rgba(255,220,80,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const sparks=[];let sparkCool=0;
function sparkle(p,n=6,col=0xffe27a,power=1){if(GFX.q==='low')n=Math.ceil(n/2);for(let i=0;i<n;i++){const m=new THREE.SpriteMaterial({map:sparkTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const s=new THREE.Sprite(m);s.scale.setScalar(0.35*power);s.position.copy(p);scene.add(s);const a=Math.random()*Math.PI*2,sp=(1+Math.random()*2)*power;sparks.push({s,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:2+Math.random()*2*power,t:0,life:0.6+Math.random()*0.3});}}
function updSparks(dt){sparkCool-=dt;for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.t+=dt;p.vy-=6*dt;p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;const k=p.t/p.life;p.s.material.opacity=1-k;
  if(k>=1){scene.remove(p.s);p.s.material.dispose();sparks.splice(i,1);}}}
let camZ=1,camZT=1,camZTimer=0,userZoom=1;
function camPunch(){camZT=0.72;camZTimer=1.3;}

/* ---------- background music (original, generated live) ---------- */
const MUS={on:true,gain:null,next:0,step:0};
function musicInit(){if(!AC||MUS.gain)return;MUS.gain=AC.createGain();MUS.gain.gain.value=0;MUS.gain.connect(AC.destination);MUS.next=AC.currentTime+0.3;}
const nf=n=>130.81*Math.pow(2,n/12);
function tone(f,t,d,type,vol){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+d+0.05);}
const PROG_DAY=[[0,4,7],[5,9,12],[9,12,16],[7,11,14]],PROG_NIGHT=[[9,12,16],[5,9,12],[0,4,7],[7,11,14]],PENTA=[0,2,4,7,9];
function musicTick(){
  if(!AC||!MUS.gain)return;MUS.gain.gain.setTargetAtTime(MUS.on?0.55:0,AC.currentTime,0.6);
  if(!MUS.on||AC.state!=='running'){MUS.next=AC.currentTime+0.2;return;}
  const night=isNight(),beat=60/(night?70:92)/2;
  while(MUS.next<AC.currentTime+0.35){const t=MUS.next,st=MUS.step,bar=Math.floor(st/8)%4,ch=(night?PROG_NIGHT:PROG_DAY)[bar];
    if(st%8===0){ch.forEach(n=>tone(nf(n+12),t,beat*8,'sine',0.035));tone(nf(ch[0]),t,beat*4,'triangle',0.06);}
    if(st%8===4)tone(nf(ch[0]+7),t,beat*3,'triangle',0.045);
    const h=Math.abs(Math.sin(st*12.9898+bar*78.233)*43758.5453)%1;
    if((!night||st%2===0)&&h>0.38){const deg=PENTA[Math.floor(h*97)%5];tone(nf(deg+(h>0.82?36:24)),t,beat*(night?2.4:1.5),night?'sine':'triangle',0.032);}
    if(curFest&&st%4===2)tone(nf(PENTA[st%5]+36),t,beat*0.8,'sine',0.018);
    MUS.step++;MUS.next+=beat;}
}

/* ---------- settings: graphics, audio, nickname ---------- */
const GFX={q:'high',fps30:false,vib:true,joy:'float'};
try{const g=JSON.parse(localStorage.getItem('fm-gfx')||'null');
  if(!g){const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||4,small=Math.min(screen.width,screen.height)<=420;
    GFX.q=(mem<=2||cores<=2)?'low':(mem<=4||cores<=4||small)?'mid':'high';}
  if(g){Object.assign(GFX,g);if(g.music===false)MUS.on=false;if(g.sfx===false)soundOn=false;}}catch(_){}
function saveSettings(){try{localStorage.setItem('fm-gfx',JSON.stringify({q:GFX.q,fps30:GFX.fps30,music:MUS.on,sfx:soundOn,vib:GFX.vib,joy:GFX.joy}));}catch(_){}}
function applyGfx(){const dpr=window.devicePixelRatio||1;renderer.setPixelRatio(GFX.q==='high'?Math.min(dpr,2):GFX.q==='mid'?Math.min(dpr,1.5):1);
  sun.castShadow=GFX.q!=='low';const ms=GFX.q==='high'?2048:1024;if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}resize();}
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

/* ---------- festivals (every 5th in-game day) ---------- */
const festMatA=new THREE.MeshLambertMaterial({color:0xe53935,emissive:0xe53935,emissiveIntensity:0.5}),festMatB=new THREE.MeshLambertMaterial({color:0xffc107,emissive:0xffc107,emissiveIntensity:0.5});
const festG=new THREE.Group();scene.add(festG);festG.visible=false;
for(let x=-10.5;x<=42.5;x+=1.2){const m=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),((x*10|0)%2)?festMatA:festMatB);m.position.set(x,2.55+Math.sin(x*1.3)*0.12,0.5);m.scale.y=1.3;festG.add(m);}
box(53.6,0.03,0.03,0x555555,16,2.62,0.5,festG,false);
const festBanner=canvasSprite(512,128,4.2,1.05);festBanner.s.position.set(0,3.6,0.6);festG.add(festBanner.s);
let festRefill=0,festAnnounced=0;
function festOf(n){return n%5===0?FESTS[((n/5)-1)%FESTS.length]:null;}
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
  const sc=(DECOR.shelf[decor.shelf]||DECOR.shelf[0]).c;shelfMats.forEach((m,i)=>m.color.setHex(sc[i]));}
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
const hubEl=document.getElementById('hub'),hubBody=document.getElementById('hubBody'),hubSet=document.getElementById('hubSet'),hubStatus=document.getElementById('hubStatus');
let hubTab='rank',rankKind='earned';
function hubMsg(t){hubStatus.textContent=L(t);}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'K':String(Math.floor(v));
async function renderRank(){
  const kinds=[['weekly','📅 本周收入'],['earned','💵 累计收入'],['progress','🏪 解锁进度'],['story','📖 故事进度']];
  let h='<div class="row">'+kinds.map(([k,n])=>'<button class="sbtn'+(k===rankKind?'':' ghost')+'" data-rk="'+k+'">'+n+'</button>').join('')+'</div><div id="rankList"><p class="sub">读取中…</p></div>';
  hubBody.innerHTML=h;hubBody.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{rankKind=b.dataset.rk;renderRank();});
  const el=document.getElementById('rankList');
  if(!sb){el.innerHTML='<p class="sub">排行榜需要站长配置 Supabase（看 README）。</p>';return;}
  await submitScore();
  try{const {data,error}=await sb.rpc('fm_top',{p_kind:rankKind});if(error)throw error;
    let mine=null;if(cloud){const r=await sb.rpc('fm_rank',{p_id:cloud.id,p_kind:rankKind});if(!r.error)mine=r.data;}
    const unit=(rankKind==='earned'||rankKind==='weekly')?v=>'💵'+fmtN(v):rankKind==='progress'?v=>v+'/'+TOTAL_STEPS:v=>(v>=STORY.length?L('通关 🎉'):TT('第'+(v+1)+'章','Ch. '+(v+1),'Bab '+(v+1)));
    setTimeout(()=>trDom(el),0);el.innerHTML=(mine?'<p class="sub">我的排名：<b>#'+mine+'</b>（'+esc(NET.nick)+'）</p>':'')+((data||[]).map(r=>'<div class="li"><div class="e">'+(r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank)+'</div><div class="t"><b>'+esc(r.nickname||'玩家')+'</b><small>…'+esc(r.tag||'')+'</small></div><div>'+unit(+r.value)+'</div></div>').join('')||'<p class="sub">还没有人上榜，快来当第一名！</p>');}
  catch(e){el.innerHTML='<p class="sub">排行榜暂时连不上：'+esc(e.message||'网络问题')+'</p>';}
}
function renderHub(){renderHub0();trDom(hubEl);}
function renderHub0(){
  hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===hubTab));
  hubSet.hidden=hubTab!=='set';hubBody.hidden=hubTab==='set';
  if(hubTab==='rank'){renderRank();return;}
  if(hubTab==='book'){const cl=stats.bookClaimed||(stats.bookClaimed={});
    hubBody.innerHTML=bookPages().map(p=>{const got=p.items.filter(i=>i.ok).length,all=got===p.items.length;
      return '<div class="sec" style="font-weight:900;margin:10px 0 4px">'+p.n+' '+got+'/'+p.items.length+'</div><div class="stock">'+p.items.map(i=>'<span class="chip2" style="'+(i.ok?'':'opacity:.25;filter:grayscale(1)')+'" title="'+esc(i.t||'')+'">'+i.e+(i.t?'<small style="font-size:10px;display:block">'+esc(i.t)+'</small>':'')+'</span>').join('')+'</div>'+
        '<div class="row"><button class="sbtn'+(cl[p.id]||!all?' ghost':'')+'" data-bk="'+p.id+'"'+(cl[p.id]||!all?' disabled':'')+'>'+(cl[p.id]?'已领取':all?'领取奖励 💵'+p.r:'集齐这一页奖励 💵'+p.r)+'</button></div>';}).join('');
    hubBody.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const p=bookPages().find(x=>x.id===b.dataset.bk);if(!p||cl[p.id]||NET.mode==='guest')return;cl[p.id]=1;money+=p.r;chord();toast('📚 '+L(p.n)+' +💵'+p.r);save();renderHub();});return;}
  if(hubTab==='branch'){const th=THEMES[(legacy.n||0)%THEMES.length],nx=THEMES[((legacy.n||0)+1)%THEMES.length];const ok=pads.every(p=>p.done)&&NET.mode!=='guest';
    hubBody.innerHTML='<div class="sec" style="font-weight:900;margin:6px 0">🏪 '+TT('当前：第 '+((legacy.n||0)+1)+' 号店 · ','Now: branch #'+((legacy.n||0)+1)+' · ','Kini: cawangan #'+((legacy.n||0)+1)+' · ')+th.n+'</div>'+
      '<p class="sub">'+TT('收入加成','Income bonus','Bonus pendapatan')+' +'+(legacy.n||0)*25+'%</p><p class="sub">开分店会重新开始建店（金钱、设施、货架清零），但保留成就、常客好感、装扮、图鉴和故事，并永久增加 25% 收入。</p>'+
      '<p class="sub">下一家：'+nx.n+'</p><div class="row"><button class="big'+(ok?'':' ghost')+'" id="brBtn"'+(ok?'':' disabled')+'>'+(ok?'开分店！':'先建好全部设施才能开分店')+'</button></div>';
    const bb=document.getElementById('brBtn');if(bb&&ok)bb.onclick=()=>{if(bb.dataset.arm){openBranch();}else{bb.dataset.arm='1';bb.textContent=L('再点一次确认开分店');}};return;}
  if(hubTab==='ach'){const n=ACH.filter(a=>ACH_STATE[a.id]).length;
    hubBody.innerHTML='<p class="sub">已达成 '+n+'/'+ACH.length+'</p>'+ACH.map(a=>{const [x,y]=a.v();const ok=!!ACH_STATE[a.id];const v=Math.max(0,Math.min(x,y));
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
  document.getElementById('nick2').value=NET.nick;}
document.getElementById('hubBtn').onclick=()=>{hubMsg('');hubEl.hidden=false;renderSettings();renderHub();};
document.getElementById('hubClose').onclick=()=>{hubEl.hidden=true;};
hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.onclick=()=>{hubTab=b.dataset.t;hubMsg('');renderSettings();renderHub();});
document.getElementById('musBtn').onclick=()=>{MUS.on=!MUS.on;initAudio();saveSettings();renderSettings();};
['high','mid','low'].forEach(q=>document.getElementById('gfx-'+q).onclick=()=>{GFX.q=q;applyGfx();saveSettings();renderSettings();hubMsg(q==='low'?'已切到流畅画质（关闭阴影）':'画质已更新');});
document.getElementById('vibBtn').onclick=()=>{GFX.vib=!GFX.vib;saveSettings();renderSettings();vib(20);};
document.getElementById('joyBtn').onclick=()=>{GFX.joy={float:'left',left:'right',right:'float'}[GFX.joy||'float'];saveSettings();renderSettings();showFixedJoy();};
['zh','en','ms'].forEach(l=>document.getElementById('lang-'+l).onclick=()=>{if(l===LANG)return;try{localStorage.setItem('fm-lang',l);}catch(_){}save();resetting=true;location.reload();});
document.getElementById('fpsBtn').onclick=()=>{GFX.fps30=!GFX.fps30;saveSettings();renderSettings();};
document.getElementById('nick2').addEventListener('input',e=>{NET.nick=cleanName(e.target.value);nickEl.value=NET.nick;try{localStorage.setItem('fm-nick',NET.nick);}catch(_){}});
if(NET.mode==='guest'){try{const h=+localStorage.getItem('fm-hat');if(h>0&&DECOR.hat[h])decor.hat=h;}catch(_){}}
applyDecor();applyHat();applyTheme();trDom(document.body);showFixedJoy();
if(stats.coop==null)stats.coop=0;

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
  if(!sb||!cloud||cloudBusy||NET.mode==='guest')return false;cloudBusy=true;
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
    if(row&&(row.progress||0)>progressNow()){showAccount();acMsg('云端有更多进度（'+row.progress+'/'+TOTAL_STEPS+'），本机是 '+progressNow()+'/'+TOTAL_STEPS+'。点「用云端进度」找回。');cloudPending=row;renderAccount();}
    else await cloudPush(false);
  }catch(e){acMsg('云存档暂时连不上：'+(e.message||'网络问题'));}
}
let cloudPending=null;
function renderAccount(){
  if(!acBody)return;
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
if(sb){setTimeout(cloudStart,1500);document.addEventListener('visibilitychange',()=>{if(document.hidden&&cloud)cloudPush(false);});}
if('serviceWorker' in navigator&&location.protocol==='https:'){const hadCtl=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').then(reg=>{setInterval(()=>reg.update().catch(()=>{}),10*60*1000);}).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl)return;const u=document.getElementById('upd');u.textContent=L('🆕 有新版本，点这里更新');u.hidden=false;u.onclick=()=>{save();resetting=true;location.reload();};});}
})();
