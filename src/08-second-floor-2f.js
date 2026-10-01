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

