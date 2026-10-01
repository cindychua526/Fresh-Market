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

