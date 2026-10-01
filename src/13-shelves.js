/* ---------- shelves ---------- */
const SHELF_POS={tomato:[-5,-11.5],egg:[0,-11.5],milk:[5,-11.5],carrot:[-3,-6.5],jam:[3,-6.5],bread:[14.5,-11.5],cheese:[18.5,-11.5],juice:[22.5,-11.5],
  soda:[27,-11.5],cookies:[30.4,-11.5],noodles:[33.8,-11.5],chocolate:[37.2,-11.5],tissue:[40.6,-11.5],shampoo:[28.7,-6.5],icecream:[33.8,-6.5],canned:[38.9,-6.5],
  hongbao:[6,-2.4],candybox:[6,-2.4],mooncake:[6,-2.4],oillamp:[6,-2.4],gift:[6,-2.4],
  tshirt:[68,-11.5],book:[72,-11.5],ball:[76,-11.5],umbrella:[80,-11.5],teddy:[70,-6.5],headphones:[78,-6.5],
  corn:[-18,-10.6],shrimp:[-18,-10.6],cocoa:[-18,-10.6],dango:[-18,-10.6]};
const SHELF_COL={soda:[0x7fb8e8,0xa9d2f5,0x4a90e2],icecream:[0xeaf4ff,0xffffff,0x9fc9ee],milk:[0xa9d2f5,0xd4e9fb,0x7fb8e8]};
const shelfMats=[new THREE.MeshLambertMaterial({color:0xc98b52}),new THREE.MeshLambertMaterial({color:0xe0a86f}),new THREE.MeshLambertMaterial({color:0xb37542})];
const SHELF_VC=new THREE.MeshLambertMaterial({vertexColors:true}),SHELF_GEOS=[];
function recolorShelves(){for(const g of SHELF_GEOS){const c=g.attributes.color,sl=g.userData.slots;for(let i=0;i<sl.length;i++){const m=shelfMats[sl[i]].color;c.setXYZ(i,m.r,m.g,m.b);}c.needsUpdate=true;}}
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
  Object.assign(sh,{kind:'shelf',sign,x,z,g,dep:V3(x,0,z+1.3),spotZ:z+1.45,island:z>-10,sol:solid(x-1.55,z-0.6,x+1.55,z+0.55,false)});
  g.visible=false;shelves[type]=sh;
}
SELL.forEach(buildShelf);FEST_ITEMS.forEach(buildShelf);SIG_ITEMS.forEach(buildShelf);
function unlockShelf(t,anim){const s=shelves[t];s.unlocked=true;s.g.visible=true;s.sol.active=true;if(anim)pop(s.g,0.2);}

