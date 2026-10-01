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

