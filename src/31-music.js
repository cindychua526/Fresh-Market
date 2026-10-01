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

