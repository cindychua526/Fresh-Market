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

