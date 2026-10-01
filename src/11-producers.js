/* ---------- producers ---------- */
const PROD={corn:{x:-18,z:-1.6,iv:2,sig:1},shrimp:{x:-18,z:-1.6,iv:2,sig:1},cocoa:{x:-18,z:-1.6,iv:2,sig:1},dango:{x:-18,z:-1.6,iv:2,sig:1},carrot:{x:-6,z:11.5,iv:1.3},strawberry:{x:0,z:11.5,iv:1.6},tomato:{x:-6,z:5,iv:1.5},egg:{x:0,z:5,iv:2.1},milk:{x:6,z:5,iv:2.8},wheat:{x:13,z:9,iv:1.2},apple:{x:21,z:9,iv:1.7}};
const producers={};
function buildProducer(type){
  const {x,z,iv}=PROD[type],g=new THREE.Group();scene.add(g);
  const patch=new THREE.Mesh(new THREE.CircleGeometry(PROD[type].sig?1.9:3.3,28),M(0x7fcf5c));patch.rotation.x=-Math.PI/2;patch.position.set(x,0.012,z);patch.receiveShadow=true;g.add(patch);
  let sol;
  if(PROD[type].sig){const col={corn:0xf2c94c,shrimp:0xff8a65,cocoa:0x8d5a3b,dango:0xf8a5c2}[type];
    box(2.3,0.1,1.2,0xe0a86f,x,0.06,z-1.45,g);box(2.6,0.9,1.0,0xc98b52,x,0.45,z+0.5,g);box(2.7,0.08,1.1,0xe0a86f,x,0.94,z+0.5,g);
    for(const px of [-1.2,1.2])cyl(0.06,0.06,2.2,0x8a5a36,x+px,1.1,z+0.05,g,6);
    for(let k=0;k<5;k++)box(0.56,0.08,1.4,k%2?0xffffff:col,x-1.12+k*0.56,2.25,z+0.4,g);
    for(let k=0;k<4;k++)sph(0.16,col,x-0.75+k*0.5,1.1,z+0.45,g).scale.set(1,0.8,1);
    sol=solid(x-1.4,z,x+1.4,z+1.05,false);}
  else if(type==='tomato'){
    box(3.2,0.3,2,0x9a6a43,x,0.15,z+0.4,g);box(2.3,0.1,1.2,0xc98b52,x,0.06,z-1.45,g);
    for(let i=0;i<6;i++){const px=x-1.05+(i%3)*1.05,pz=z-0.05+Math.floor(i/3)*0.9;
      cyl(0.05,0.06,0.9,0x3c9a3c,px,0.75,pz,g,6);const l=sph(0.28,0x49b545,px,1.0,pz,g);l.scale.set(1,0.7,1);
      sph(0.13,0xe8413b,px+0.2,0.8,pz+0.14,g);sph(0.12,0xe8413b,px-0.16,1.08,pz+0.12,g);}
    sol=solid(x-1.6,z-0.6,x+1.6,z+1.4,false);
  }else if(type==='egg'){
    box(2.3,0.1,1.2,0xf2d16b,x,0.06,z-1.45,g);
    box(2,1.4,1.6,0xd9534f,x,0.7,z+0.6,g);const roof=add(new THREE.ConeGeometry(1.45,0.9,4),0xf4f1ea,x,1.85,z+0.6,g);roof.rotation.y=Math.PI/4;roof.scale.set(1.05,1,0.85);
    box(0.6,0.8,0.05,0x6b3a2a,x,0.45,z-0.21,g);
    const hen=(hx,hz)=>{sph(0.3,0xffffff,hx,0.32,hz,g).scale.set(1,0.85,1.2);sph(0.17,0xffffff,hx,0.62,hz+0.25,g);box(0.06,0.12,0.14,0xe23b3b,hx,0.8,hz+0.25,g);const b=add(new THREE.ConeGeometry(0.05,0.12,5),0xf5a623,hx,0.6,hz+0.44,g);b.rotation.x=Math.PI/2;};
    hen(x-1.55,z-0.4);hen(x+1.6,z+0.9);
    sol=solid(x-1.05,z-0.25,x+1.05,z+1.45,false);
  }else if(type==='milk'){
    box(2.3,0.1,1.2,0x7fb8e8,x,0.06,z-1.45,g);
    const cz=z+0.6;box(1.7,0.9,0.95,0xffffff,x,0.95,cz,g);
    box(0.5,0.5,0.97,0x2b2b2b,x-0.3,1.05,cz,g);box(0.35,0.35,0.97,0x2b2b2b,x+0.45,0.85,cz,g);
    box(0.62,0.58,0.62,0xffffff,x+1.05,1.2,cz,g);box(0.2,0.3,0.46,0xffa0b4,x+1.4,1.08,cz,g);
    box(0.08,0.18,0.08,0xf4f1ea,x+1.05,1.58,cz-0.22,g);box(0.08,0.18,0.08,0xf4f1ea,x+1.05,1.58,cz+0.22,g);
    [[-0.6,-0.3],[-0.6,0.3],[0.6,-0.3],[0.6,0.3]].forEach(([lx,lz])=>box(0.2,0.55,0.2,0xffffff,x+lx,0.27,cz+lz,g));
    box(1.2,0.5,0.9,0xf2d16b,x-1.9,0.25,z+1.2,g);
    sol=solid(x-0.95,z+0.05,x+1.45,z+1.15,false);
  }else if(type==='wheat'){
    box(2.3,0.1,1.2,0xe8cf86,x,0.06,z-1.45,g);box(3.4,0.25,2.2,0x9a6a43,x,0.12,z+0.4,g);
    for(let i=0;i<15;i++){const px=x-1.3+(i%5)*0.65,pz=z-0.35+Math.floor(i/5)*0.7;
      const s=cyl(0.03,0.04,0.8,0xd8b040,px,0.65,pz,g,5);s.rotation.z=(i%2?0.1:-0.1);const e=sph(0.09,0xf2cf5b,px,1.1,pz,g);e.scale.set(1,2,1);}
    sol=solid(x-1.7,z-0.7,x+1.7,z+1.5,false);
  }else if(type==='carrot'||type==='strawberry'){
    const car=type==='carrot';
    box(2.3,0.1,1.2,car?0xe0a86f:0xf2c6cf,x,0.06,z-1.45,g);box(3.4,0.25,2.2,0x9a6a43,x,0.12,z+0.4,g);
    for(let i=0;i<12;i++){const px=x-1.2+(i%4)*0.8,pz=z-0.25+Math.floor(i/4)*0.65;
      if(car){sph(0.09,0xff8a1c,px,0.28,pz,g);for(let k=-1;k<=1;k++){const l=add(new THREE.ConeGeometry(0.05,0.35,4),0x3fae3a,px+k*0.06,0.48,pz,g);l.rotation.z=k*0.4;}}
      else{const b=sph(0.26,0x3c9a3c,px,0.38,pz,g);b.scale.set(1,0.6,1);sph(0.08,0xe8304a,px+0.14,0.4,pz+0.12,g);sph(0.07,0xe8304a,px-0.12,0.42,pz+0.1,g);}}
    sol=solid(x-1.7,z-0.7,x+1.7,z+1.5,false);
  }else{
    box(2.3,0.1,1.2,0xc98b52,x,0.06,z-1.45,g);
    [[-1.1,0.4],[1.1,0.4],[0,1.2]].forEach(([tx,tz])=>{cyl(0.14,0.18,1.1,0x8a5a36,x+tx,0.55,z+tz,g,7);const c=sph(0.7,0x55b84a,x+tx,1.45,z+tz,g);c.scale.set(1,0.85,1);
      for(let k=0;k<4;k++){const a=k*1.7;sph(0.1,0x9bd13b,x+tx+Math.cos(a)*0.55,1.3+(k%2)*0.3,z+tz+Math.sin(a)*0.55,g);}});
    sol=solid(x-1.7,z-0.1,x+1.7,z+1.8,false);
  }
  const bin=makeBin(type,8,i=>V3(x-0.75+(i%4)*0.5,0.12,z-1.7+Math.floor(i/4)*0.5),g);
  Object.assign(bin,{kind:'prod',x,z,iv,t:0,g,sol,pick:V3(x,0,z-2.55)});
  g.visible=false;producers[type]=bin;
}
Object.keys(PROD).forEach(buildProducer);
function unlockProducer(t,anim){const p=producers[t];p.unlocked=true;p.g.visible=true;p.sol.active=true;if(anim)pop(p.g,0.2);}

