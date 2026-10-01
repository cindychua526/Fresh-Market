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

