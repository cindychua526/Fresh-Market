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

