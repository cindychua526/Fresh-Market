/* ---------- renderer / scene ---------- */
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const scene=new THREE.Scene();scene.autoUpdate=false;   /* the frame loop updates matrices once, batches limbs, then renders */
scene.background=new THREE.Color(0x8fd96b);
scene.fog=new THREE.Fog(0x8fd96b,45,95);
const camera=new THREE.PerspectiveCamera(34,1,0.5,170);
const hemi=new THREE.HemisphereLight(0xffffff,0xa9c79a,0.85);scene.add(hemi);
const lampMat=new THREE.MeshLambertMaterial({color:0xfff3c4,emissive:0xffd27a,emissiveIntensity:0});
const winMat=new THREE.MeshLambertMaterial({color:0x9fd3ff,emissive:0xffd88a,emissiveIntensity:0});
const sun=new THREE.DirectionalLight(0xffffff,0.55);
sun.position.set(-3,24,11);sun.target.position.set(7,0,-1);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:80});
sun.shadow.bias=-0.0008;scene.add(sun);sun.userData.dyn=sun.target.userData.dyn=1;

const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
function add(geo,c,x,y,z,parent,cast=true){const m=new THREE.Mesh(geo,typeof c==='number'?M(c):c);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;(parent||scene).add(m);return m;}
const box=(w,h,d,c,x,y,z,p,cast)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p,cast);
const sph=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,r<0.12?7:r<0.3?10:14,r<0.12?5:r<0.3?7:10),c,x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,s=12)=>add(new THREE.CylinderGeometry(rt,rb,h,Math.max(rt,rb)<0.1?Math.min(s,6):s),c,x,y,z,p);
const solids=[];
const solid=(x0,z0,x1,z1,active=true)=>{const s={x0,z0,x1,z1,active};solids.push(s);return s;};

