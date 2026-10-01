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
