/* ---------- world ---------- */
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),M(0x8fd96b));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box(130,0.04,5,0x8e949a,16,0.02,-18.6,null,false);
for(let x=-40;x<=72;x+=4)box(1.6,0.05,0.2,0xf4f4f4,x,0.04,-18.6,null,false);
box(130,0.07,1.3,0xd9d2c5,16,0.035,-15.5,null,false);
box(7.5,0.06,2.2,0xe6d3b3,-15,0.03,-6,null,false);
box(7.5,0.06,2.2,0xe6d3b3,29,0.03,-6,null,false);
box(7.5,0.06,2.2,0xe6d3b3,47,0.03,-8.5,null,false);
// west store
const westFloorMat=new THREE.MeshLambertMaterial({color:0xf7c99c});box(22.4,0.1,14.4,westFloorMat,0,0.05,-7,null,false);
box(19,0.02,2.6,0xfbdab7,0,0.11,-10.2,null,false);
box(12,0.02,2.2,0xfbdab7,-3,0.11,-3.3,null,false);
box(22.4,0.16,0.3,0x5fcf8a,0,0.08,0.25,null,false);
// middle store (first expansion)
const eastFloorMat=new THREE.MeshLambertMaterial({color:0xcfcac2});
box(14,0.1,14.4,eastFloorMat,18.2,0.05,-7,null,false);
const eastDecor=new THREE.Group();scene.add(eastDecor);eastDecor.visible=false;
box(12.6,0.02,2.6,0xfbdab7,18.2,0.11,-10.2,eastDecor,false);box(10,0.02,2.2,0xfbdab7,16,0.11,-3.3,eastDecor,false);
box(14,0.16,0.3,0x5fcf8a,18.2,0.08,0.25,null,false);
// wing (second expansion)
const wingFloorMat=new THREE.MeshLambertMaterial({color:0xcfcac2});
box(18,0.1,14.4,wingFloorMat,34.2,0.05,-7,null,false);
const wingDecor=new THREE.Group();scene.add(wingDecor);wingDecor.visible=false;
box(17,0.02,2.6,0xdbe9f7,34.2,0.11,-10.2,wingDecor,false);box(17,0.02,1.6,0xdbe9f7,34.2,0.11,-4.9,wingDecor,false);box(10,0.02,2.0,0xdbe9f7,34,0.11,-3.2,wingDecor,false);
box(18,0.16,0.3,0x5fcf8a,34.2,0.08,0.25,null,false);
function makeTape(x){const g=new THREE.Group();scene.add(g);for(let z=-13.5;z<0;z+=1.6){const t=box(0.9,0.03,0.25,0xffc93c,x,0.12,z,g,false);t.rotation.y=0.6;const u=box(0.9,0.03,0.25,0x333333,x+0.6,0.12,z+0.5,g,false);u.rotation.y=0.6;}return g;}
const tape=makeTape(12),tape2=makeTape(26);
const WALL=0xeef1f3;
box(54.8,2.4,0.4,WALL,16,1.2,-14.4);box(54.8,0.26,0.42,0x4a90e2,16,1.95,-14.4);box(54.8,0.16,0.44,0x5fcf5a,16,2.33,-14.4);
solid(-11.4,-14.6,43.4,-14.2);
box(0.4,2.4,7.2,WALL,-11.2,1.2,-10.6);solid(-11.4,-14.2,-11.0,-7);
box(0.4,2.4,5.2,WALL,-11.2,1.2,-2.4);solid(-11.4,-5,-11.0,0.2);
const divider2=new THREE.Group();scene.add(divider2);
box(0.4,2.4,7.2,WALL,25.2,1.2,-10.6,divider2);box(0.4,2.4,5.2,WALL,25.2,1.2,-2.4,divider2);
const div2Sol=[solid(25.0,-14.2,25.4,-7),solid(25.0,-5,25.4,0.2)];
box(0.4,2.4,5.6,WALL,43.2,1.2,-12.2);solid(43.0,-14.2,43.4,-9.4);
box(0.4,2.4,7.8,WALL,43.2,1.2,-3.7);solid(43.0,-7.6,43.4,0.2);
const divider=new THREE.Group();scene.add(divider);
box(0.4,2.4,14.4,WALL,11.2,1.2,-7,divider);box(0.42,0.26,14.4,0x4a90e2,11.2,1.95,-7,divider);
const dividerSol=solid(11.0,-14.2,11.4,0.2);
box(1.4,0.03,1.8,0xd96a4a,-10.3,0.12,-6,null,false);box(1.4,0.03,1.8,0xd96a4a,24.3,0.12,-6,divider2,false);box(1.4,0.03,1.8,0xd96a4a,42.3,0.12,-8.5,null,false);
function wallSign(text,x,bg){text=L(text);const c=document.createElement('canvas');c.width=512;c.height=128;const k=c.getContext('2d');rrect(k,6,6,500,116,40);k.fillStyle=bg;k.fill();
  k.lineWidth=8;k.strokeStyle='#fff';k.stroke();k.fillStyle='#fff';let fs=72;k.font='900 '+fs+'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';const tw=k.measureText(text).width;if(tw>450){fs=Math.floor(72*450/tw);k.font='900 '+fs+'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';}k.textAlign='center';k.textBaseline='middle';k.fillText(text,256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(x,3.3,-14.3);scene.add(m);
  box(0.12,1.0,0.12,0x9aa0a6,x-2,2.6,-14.4);box(0.12,1.0,0.12,0x9aa0a6,x+2,2.6,-14.4);return m;}
wallSign('小镇鲜市',0,'#2fae5a');wallSign('烘焙乳品',18.2,'#e0893a');wallSign('百货区',34.2,'#3a7bd5');
function plant(x,z){cyl(0.3,0.24,0.45,0xc4703f,x,0.33,z);const l=sph(0.42,0x49b545,x,0.8,z);l.scale.set(1,0.8,1);}
plant(10.3,-0.7);plant(10.3,-13.4);plant(-10.3,-13.4);plant(24.3,-13.4);plant(42.3,-13.4);plant(42.3,-0.7);
function tree(x,z,s=1){cyl(0.15*s,0.2*s,0.8*s,0x9a6a43,x,0.4*s,z,null,6);add(new THREE.ConeGeometry(0.95*s,1.6*s,7),0x4fbf4a,x,1.5*s,z);add(new THREE.ConeGeometry(0.72*s,1.25*s,7),0x62d15a,x,2.25*s,z);}
[[-14,3],[-15.5,9],[-14,15],[-7,17],[0,17.5],[7,17],[16,15.5],[23,15.5],[10,15.5],[-15,-11],[48,3],[49,12],[48,-2],[47,-12],[31,15],[39,15],[44,15.5]].forEach(([x,z],i)=>tree(x,z,0.9+(i%3)*0.2));
for(let x=-9;x<=9;x+=1.5)box(0.14,0.62,0.14,0xd9a066,x,0.31,14.6);
box(18.2,0.1,0.08,0xd9a066,0,0.45,14.6);box(18.2,0.1,0.08,0xd9a066,0,0.22,14.6);
for(let x=10;x<=25;x+=1.5)box(0.14,0.62,0.14,0xd9a066,x,0.31,12.6);
box(15.2,0.1,0.08,0xd9a066,17.5,0.45,12.6);box(15.2,0.1,0.08,0xd9a066,17.5,0.22,12.6);

