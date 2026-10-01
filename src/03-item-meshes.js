/* ---------- item meshes ---------- */
const GEO={tomato:new THREE.SphereGeometry(0.2,12,10),tomTop:new THREE.ConeGeometry(0.09,0.09,5),
  egg:new THREE.SphereGeometry(0.16,12,10),milk:new THREE.BoxGeometry(0.28,0.36,0.28),milkCap:new THREE.BoxGeometry(0.3,0.07,0.3),
  bill:new THREE.BoxGeometry(0.5,0.09,0.3),band:new THREE.BoxGeometry(0.12,0.095,0.31),
  stalk:new THREE.CylinderGeometry(0.03,0.03,0.46,5),ear:new THREE.SphereGeometry(0.065,6,5),tie:new THREE.CylinderGeometry(0.1,0.1,0.06,8),
  apple:new THREE.SphereGeometry(0.18,12,10),stem:new THREE.CylinderGeometry(0.018,0.018,0.1,4),leaf:new THREE.SphereGeometry(0.06,6,4),
  loaf:new THREE.BoxGeometry(0.44,0.2,0.28),crust:new THREE.BoxGeometry(0.4,0.08,0.24),
  cheese:new THREE.CylinderGeometry(0.26,0.26,0.2,3),hole:new THREE.SphereGeometry(0.045,6,5),
  bottle:new THREE.CylinderGeometry(0.1,0.12,0.34,10),bcap:new THREE.CylinderGeometry(0.06,0.06,0.07,8),label:new THREE.CylinderGeometry(0.113,0.118,0.12,10),
  carrot:new THREE.ConeGeometry(0.1,0.4,8),cleaf:new THREE.ConeGeometry(0.05,0.18,5),berry:new THREE.SphereGeometry(0.14,10,8),bhat:new THREE.ConeGeometry(0.1,0.06,6),
  jar:new THREE.CylinderGeometry(0.14,0.14,0.28,12),lid:new THREE.CylinderGeometry(0.15,0.15,0.06,12),jarL:new THREE.CylinderGeometry(0.143,0.143,0.1,12),
  can:new THREE.CylinderGeometry(0.11,0.11,0.32,12),canTop:new THREE.CylinderGeometry(0.1,0.1,0.02,12),
  pack:new THREE.BoxGeometry(0.4,0.14,0.3),packS:new THREE.BoxGeometry(0.41,0.05,0.31),
  cup:new THREE.CylinderGeometry(0.16,0.12,0.26,12),cupB:new THREE.CylinderGeometry(0.155,0.14,0.08,12),cupL:new THREE.CylinderGeometry(0.17,0.17,0.03,12),
  bar:new THREE.BoxGeometry(0.42,0.07,0.22),foil:new THREE.BoxGeometry(0.1,0.075,0.225),
  tbox:new THREE.BoxGeometry(0.4,0.2,0.26),tuft:new THREE.SphereGeometry(0.08,8,6),
  sbot:new THREE.BoxGeometry(0.2,0.34,0.12),scap:new THREE.CylinderGeometry(0.05,0.05,0.08,8),
  icone:new THREE.ConeGeometry(0.11,0.3,8),scoop:new THREE.SphereGeometry(0.13,10,8),
  tin:new THREE.CylinderGeometry(0.13,0.13,0.24,12),tinL:new THREE.CylinderGeometry(0.133,0.133,0.14,12),
  basket:new THREE.BoxGeometry(0.5,0.2,0.36),
  shirt:new THREE.BoxGeometry(0.34,0.07,0.36),sleeve:new THREE.BoxGeometry(0.14,0.069,0.14),
  bookB:new THREE.BoxGeometry(0.34,0.1,0.26),pages:new THREE.BoxGeometry(0.3,0.08,0.27),
  ball:new THREE.SphereGeometry(0.17,12,10),dot:new THREE.SphereGeometry(0.05,6,5),
  umb:new THREE.ConeGeometry(0.09,0.42,8),umbH:new THREE.CylinderGeometry(0.015,0.015,0.14,5),
  tbody:new THREE.SphereGeometry(0.15,10,8),thead:new THREE.SphereGeometry(0.11,10,8),tear:new THREE.SphereGeometry(0.045,6,5),
  band2:new THREE.TorusGeometry(0.13,0.025,6,14,Math.PI),cupH:new THREE.CylinderGeometry(0.07,0.07,0.06,10),
  bunTop:new THREE.SphereGeometry(0.2,12,8,0,Math.PI*2,0,Math.PI/2),bunBot:new THREE.CylinderGeometry(0.2,0.2,0.07,12),patty:new THREE.CylinderGeometry(0.21,0.21,0.06,12),lettuce:new THREE.CylinderGeometry(0.225,0.225,0.02,12),
  bowl:new THREE.CylinderGeometry(0.2,0.13,0.16,12),soupTop:new THREE.CylinderGeometry(0.185,0.185,0.02,12),glass:new THREE.CylinderGeometry(0.11,0.09,0.3,10),straw:new THREE.CylinderGeometry(0.012,0.012,0.24,4),
  cartBox:new THREE.BoxGeometry(0.64,0.4,0.56),cartHandle:new THREE.CylinderGeometry(0.025,0.025,0.66,6),wheel:new THREE.SphereGeometry(0.06,6,5),cartLeg:new THREE.BoxGeometry(0.03,0.42,0.03),
  env:new THREE.BoxGeometry(0.34,0.06,0.24),mcake:new THREE.CylinderGeometry(0.17,0.17,0.12,14),giftB:new THREE.BoxGeometry(0.32,0.28,0.32),rib:new THREE.BoxGeometry(0.34,0.29,0.07),
  lampB:new THREE.CylinderGeometry(0.14,0.08,0.1,10),flame:new THREE.ConeGeometry(0.05,0.14,6)};
function gm(g,geo,c,x,y,z){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);g.add(m);return m;}
const VCMAT=new THREE.MeshLambertMaterial({vertexColors:true});
const mergeCache=new Map();
function mergeMeshes(meshes,root){
  root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  const pos=[],nor=[],col=[],m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),c=new THREE.Color(),v=new THREE.Vector3();
  for(const me of meshes){let g=me.geometry;if(g.index)g=g.toNonIndexed();m4.multiplyMatrices(inv,me.matrixWorld);nm.getNormalMatrix(m4);
    const p=g.attributes.position,n=g.attributes.normal;c.copy(me.material.color);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);}}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));bg.computeBoundingSphere();return bg;
}
function mergedGroup(key,build){let geo=mergeCache.get(key);if(!geo){const raw=build();const ms=[];raw.traverse(o=>{if(o.isMesh)ms.push(o);});geo=mergeMeshes(ms,raw);mergeCache.set(key,geo);}
  const g=new THREE.Group();const m=new THREE.Mesh(geo,VCMAT);m.castShadow=true;m.receiveShadow=true;g.add(m);g.userData.nb=1;g.userData.mk=key;return g;}
let iceK=0;
/* Items fly around constantly (every coin, every stocked product). Re-using the little
   Group+Mesh pairs instead of allocating new ones keeps the garbage collector quiet. */
const itemPool=new Map();
function makeItem(type){const key=type==='icecream'?'i:icecream'+((Math.random()*4)|0):'i:'+type;
  const pool=itemPool.get(key);if(pool&&pool.length){const g=pool.pop();g.children[0].castShadow=true;g.children[0].userData.cs0=undefined;g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);g.visible=true;return g;}
  if(type==='icecream')iceK=+key.slice(-1);return mergedGroup(key,()=>makeItemRaw(type));}
function freeItem(g){if(!g)return;if(g.parent)g.parent.remove(g);for(let i=pops.length-1;i>=0;i--)if(pops[i].o===g)pops.splice(i,1);
  const k=g.userData.mk;if(!k||k[0]!=='i'||g.userData.frozen)return;let p=itemPool.get(k);if(!p)itemPool.set(k,p=[]);if(p.length<64)p.push(g);}
function makeItemRaw(type){
  const g=new THREE.Group();
  if(type==='tomato'){gm(g,GEO.tomato,0xe8413b,0,0.19,0).scale.set(1,0.88,1);gm(g,GEO.tomTop,0x3fae3a,0,0.38,0);}
  else if(type==='egg'){gm(g,GEO.egg,0xfff4e0,0,0.21,0).scale.set(1,1.3,1);}
  else if(type==='milk'){gm(g,GEO.milk,0xffffff,0,0.18,0);gm(g,GEO.milkCap,0x4a90e2,0,0.36,0);}
  else if(type==='wheat'){[[-0.07,0],[0.07,0],[0,0.07]].forEach(([x,z],i)=>{const s=gm(g,GEO.stalk,0xe2bb45,x,0.23,z);s.rotation.z=x*1.5;s.rotation.x=z*1.5;gm(g,GEO.ear,0xf2cf5b,x*2,0.48,z*2).scale.set(1,1.8,1);});gm(g,GEO.tie,0xb5773a,0,0.18,0);}
  else if(type==='apple'){gm(g,GEO.apple,0x9bd13b,0,0.18,0).scale.set(1,0.92,1);gm(g,GEO.stem,0x7a4a2a,0,0.37,0);gm(g,GEO.leaf,0x3fae3a,0.06,0.38,0).scale.set(1.4,0.4,0.8);}
  else if(type==='bread'){gm(g,GEO.loaf,0xe0a45a,0,0.1,0);gm(g,GEO.crust,0xb8702f,0,0.23,0);}
  else if(type==='cheese'){const c=gm(g,GEO.cheese,0xffd23f,0,0.1,0);c.rotation.y=Math.PI/6;gm(g,GEO.hole,0xe0a800,0.08,0.2,0.02);gm(g,GEO.hole,0xe0a800,-0.06,0.2,-0.07);}
  else if(type==='juice'){gm(g,GEO.bottle,0xff9f1c,0,0.17,0);gm(g,GEO.label,0xffffff,0,0.16,0);gm(g,GEO.bcap,0x3fae3a,0,0.37,0);}
  else if(type==='carrot'){const c=gm(g,GEO.carrot,0xff8a1c,0,0.2,0);c.rotation.x=Math.PI;gm(g,GEO.cleaf,0x3fae3a,0,0.48,0);const l=gm(g,GEO.cleaf,0x3fae3a,0.05,0.46,0);l.rotation.z=-0.5;const r=gm(g,GEO.cleaf,0x3fae3a,-0.05,0.46,0);r.rotation.z=0.5;}
  else if(type==='strawberry'){gm(g,GEO.berry,0xe8304a,0,0.16,0).scale.set(1,1.15,1);gm(g,GEO.bhat,0x3fae3a,0,0.33,0);}
  else if(type==='jam'){gm(g,GEO.jar,0xc2185b,0,0.14,0);gm(g,GEO.jarL,0xfff3c4,0,0.13,0);gm(g,GEO.lid,0xffffff,0,0.31,0);}
  else if(type==='soda'){gm(g,GEO.can,0x2f80ed,0,0.16,0);gm(g,GEO.canTop,0xd0d6dc,0,0.33,0);}
  else if(type==='cookies'){gm(g,GEO.pack,0xf2994a,0,0.07,0);gm(g,GEO.packS,0x8b4513,0,0.12,0);}
  else if(type==='noodles'){gm(g,GEO.cup,0xffffff,0,0.13,0);gm(g,GEO.cupB,0xe53935,0,0.13,0);gm(g,GEO.cupL,0xf2c94c,0,0.275,0);}
  else if(type==='chocolate'){gm(g,GEO.bar,0x6d3b1f,0,0.035,0);gm(g,GEO.foil,0xf2c94c,0.17,0.036,0);}
  else if(type==='tissue'){gm(g,GEO.tbox,0x9ad0f5,0,0.1,0);gm(g,GEO.tuft,0xffffff,0,0.22,0).scale.set(1.5,0.6,1);}
  else if(type==='shampoo'){gm(g,GEO.sbot,0x9b59b6,0,0.17,0);gm(g,GEO.scap,0xffffff,0,0.38,0);}
  else if(type==='icecream'){const c=gm(g,GEO.icone,0xe8b36a,0,0.15,0);c.rotation.x=Math.PI;gm(g,GEO.scoop,[0xffb6c8,0xfff1c9,0x8fd3a8,0x9b6a4a][iceK],0,0.33,0).scale.setScalar(1.15);}
  else if(type==='canned'){gm(g,GEO.tin,0xc0c6cc,0,0.12,0);gm(g,GEO.tinL,0xeb5757,0,0.12,0);}
  else if(type==='tshirt'){gm(g,GEO.shirt,0x56ccf2,0,0.035,0);gm(g,GEO.sleeve,0x56ccf2,-0.22,0.035,-0.1);gm(g,GEO.sleeve,0x56ccf2,0.22,0.035,-0.1);gm(g,GEO.dot,0xffffff,0,0.07,-0.02).scale.set(1.4,0.3,1.4);}
  else if(type==='book'){gm(g,GEO.bookB,0xd64545,0,0.05,0);gm(g,GEO.pages,0xfffbe9,0.03,0.05,0);}
  else if(type==='ball'){gm(g,GEO.ball,0xffffff,0,0.17,0);[[0,0.34,0],[0.15,0.2,0.07],[-0.13,0.22,0.08],[0.02,0.2,-0.16]].forEach(([x,y,z])=>gm(g,GEO.dot,0x222222,x,y,z));}
  else if(type==='umbrella'){const u=gm(g,GEO.umb,0x9b51e0,0,0.3,0);gm(g,GEO.umbH,0x6b3a2a,0,0.04,0);}
  else if(type==='teddy'){gm(g,GEO.tbody,0xb07a4a,0,0.15,0);gm(g,GEO.thead,0xb07a4a,0,0.36,0);gm(g,GEO.tear,0xb07a4a,-0.08,0.45,0);gm(g,GEO.tear,0xb07a4a,0.08,0.45,0);gm(g,GEO.tear,0xf2d2b0,0,0.34,0.09);}
  else if(type==='headphones'){const b=gm(g,GEO.band2,0x333333,0,0.12,0);gm(g,GEO.cupH,0xeb5757,-0.13,0.1,0).rotation.z=Math.PI/2;gm(g,GEO.cupH,0xeb5757,0.13,0.1,0).rotation.z=Math.PI/2;}
  else if(type==='burger'){gm(g,GEO.bunBot,0xe0a45a,0,0.035,0);gm(g,GEO.patty,0x6d3b1f,0,0.1,0);gm(g,GEO.lettuce,0x5ccf4f,0,0.14,0);gm(g,GEO.bunTop,0xe8a85a,0,0.15,0).scale.y=0.8;}
  else if(type==='soup'){gm(g,GEO.bowl,0xffffff,0,0.08,0);gm(g,GEO.soupTop,0xf2994a,0,0.155,0);}
  else if(type==='drink'){gm(g,GEO.glass,0xff8fb1,0,0.15,0);const st=gm(g,GEO.straw,0xffffff,0.05,0.36,0);st.rotation.z=0.3;}
  else if(type==='hongbao'){gm(g,GEO.env,0xe53935,0,0.03,0);gm(g,GEO.tuft,0xffc107,0,0.07,0).scale.set(0.8,0.3,0.8);}
  else if(type==='candybox'){gm(g,GEO.giftB,0xf48fb1,0,0.14,0).scale.set(1,0.6,1);gm(g,GEO.rib,0x2ec27e,0,0.14,0).scale.set(1,0.62,1);}
  else if(type==='mooncake'){gm(g,GEO.mcake,0xc98b3a,0,0.06,0);gm(g,GEO.lettuce,0xe0a45a,0,0.125,0).scale.set(0.7,1,0.7);}
  else if(type==='oillamp'){gm(g,GEO.lampB,0xc0643c,0,0.05,0);gm(g,GEO.flame,0xffb300,0,0.16,0);}
  else if(type==='gift'){gm(g,GEO.giftB,0x2e7d32,0,0.14,0);gm(g,GEO.rib,0xe53935,0,0.14,0);gm(g,GEO.rib,0xe53935,0,0.14,0).rotation.y=Math.PI/2;}
  else if(type==='corn'){gm(g,GEO.bottle,0xf2c94c,0,0.17,0);const a=gm(g,GEO.cleaf,0x5ccf4f,0.07,0.2,0);a.rotation.z=-0.35;a.scale.set(1.2,2.2,1.2);const b=gm(g,GEO.cleaf,0x5ccf4f,-0.07,0.2,0);b.rotation.z=0.35;b.scale.set(1.2,2.2,1.2);}
  else if(type==='shrimp'){gm(g,GEO.band2,0xff8a65,0,0.05,0).scale.set(1.2,1.4,2.4);const t=gm(g,GEO.cleaf,0xff7043,0.17,0.08,0);t.rotation.z=-2.2;}
  else if(type==='cocoa'){gm(g,GEO.cup,0xffffff,0,0.13,0);gm(g,GEO.cupL,0x8d5a3b,0,0.265,0);const h=gm(g,GEO.cupH,0xffffff,0.17,0.14,0);h.rotation.z=Math.PI/2;}
  else if(type==='dango'){gm(g,GEO.stalk,0xd9b37a,0,0.23,0);[[0xf8a5c2,0.14],[0xfff5ec,0.28],[0x9ed98f,0.42]].forEach(([c,y])=>gm(g,GEO.tuft,c,0,y,0));}
  else {gm(g,GEO.bill,0x6fcf4f,0,0.045,0);gm(g,GEO.band,0xdaf7c9,0,0.045,0);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;
}

