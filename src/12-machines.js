/* ---------- machines ---------- */
const MACH={bread:{inT:'wheat',x:14.5,z:3.6,time:1.8,col:0xc0643c},cheese:{inT:'milk',x:18.5,z:3.6,time:2.4,col:0xf5d76e},juice:{inT:'apple',x:22.5,z:3.6,time:2.0,col:0x7ccf6a},jam:{inT:'strawberry',x:6,z:11.6,time:2.2,col:0xff8fab},
  burger:{inT:'bread',x:105,z:-12.4,time:2.0,col:0xffb347,fh:true,face:1},soup:{inT:'noodles',x:111,z:-12.4,time:2.4,col:0xe57373,fh:true,face:1},drink:{inT:'juice',x:117,z:-12.4,time:1.8,col:0x7ec8e3,fh:true,face:1}};
const machines={};
function buildMachine(outT){
  const d=MACH[outT],{x,z}=d,Y=floorY(x),F=d.face||-1,zc=z-0.2*F,g=new THREE.Group();scene.add(g);
  const body=new THREE.Group();body.position.set(x,Y,zc);body.userData.moves=1;g.add(body);
  box(1.8,1.3,1.2,d.col,0,0.65,0,body);
  const glowMat=new THREE.MeshLambertMaterial({color:0x442211,emissive:0xff8a1c,emissiveIntensity:0});
  if(d.fh){box(1.9,0.12,1.3,0xffffff,0,1.36,0,body);box(2.1,0.1,0.9,0xff5a4d,0,2.3,0.25*F,body);for(const px of [-0.95,0.95])box(0.07,1.0,0.07,0xdddddd,px,1.85,0.55*F,body);sph(0.1,glowMat,0.6,1.1,0.61*F,body);}
  else if(outT==='bread'){box(1.9,0.14,1.3,0x8a3e22,0,1.36,0,body);box(0.9,0.5,0.05,glowMat,0,0.6,-0.61,body);cyl(0.16,0.16,0.8,0x7b8088,0.55,1.8,0.2,body,8);}
  else if(outT==='cheese'){cyl(0.45,0.45,0.2,0x9a6a43,0,1.42,0,body,16);cyl(0.06,0.06,0.6,0x7b8088,0,1.8,0,body,6);box(0.8,0.06,0.06,0x7b8088,0,2.1,0,body);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  else if(outT==='jam'){cyl(0.5,0.5,0.9,0xd8d2cc,0,1.75,0,body,16);cyl(0.52,0.52,0.1,0xc2185b,0,2.2,0,body,16);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  else{cyl(0.42,0.36,0.7,new THREE.MeshLambertMaterial({color:0xffb347,transparent:true,opacity:0.8}),0,1.65,0,body,14);cyl(0.2,0.2,0.1,0x3fae3a,0,2.05,0,body,10);sph(0.1,glowMat,0.6,1.1,-0.61,body);}
  body.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  box(1.2,0.08,1.1,0xb9b1a6,x-0.9,Y+0.04,z+1.2*F,g);box(1.2,0.08,1.1,0xe0a86f,x+0.9,Y+0.04,z+1.2*F,g);
  const sign=recipeSign(ITEM[d.inT].e,ITEM[outT].e);sign.s.position.set(x,Y+2.9+(d.fh?0.4:0),zc);g.add(sign.s);
  const tray=ox=>i=>V3(x+ox-0.36+(i%3)*0.36,Y+0.08,z+1.2*F-0.36+Math.floor(i/3)*0.36);
  const inp=makeBin(d.inT,8,tray(-0.9),g);inp.dep=V3(x-0.9,0,z+2.1*F);inp.kind='min';inp.fh=!!d.fh;
  const out=makeBin(outT,8,tray(0.9),g);out.pick=V3(x+0.9,0,z+2.1*F);out.kind=d.fh?'serve':'mout';
  let chef=null;if(d.fh){chef=makeChar(0xffffff,{hat:0xffffff});chef.g.position.set(x,Y,zc-1.0*F);chef.g.rotation.y=F>0?0:Math.PI;g.add(chef.g);}
  const m={outT,inT:d.inT,time:d.time,x,z,g,body,glowMat,inp,out,chef,fh:!!d.fh,t:0,unlocked:false,sol:solid(x-0.95,zc-0.65,x+0.95,zc+0.65,false)};
  out.mach=m;m.freshAt=-99;const fs=canvasSprite(128,144,0.62,0.7);drawBubble(fs,'✨','');fs.s.position.set(x+0.9,Y+1.25,z+1.2*F);fs.s.visible=false;fs.s.userData.live=1;g.add(fs.s);m.freshS=fs;
  g.visible=false;machines[outT]=m;
}
Object.keys(MACH).forEach(buildMachine);
function unlockMachine(t,anim){const m=machines[t];if(m.fh&&anim&&m.inp.count<6){m.inp.count=6;m.inp.refresh();}m.unlocked=m.inp.unlocked=m.out.unlocked=true;m.g.visible=true;m.sol.active=true;if(anim)pop(m.g,0.2);}

