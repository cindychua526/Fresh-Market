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

