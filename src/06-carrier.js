/* ---------- carrier ---------- */
class Carrier{
  constructor(g){this.g=g;this.carry=[];this.incoming=0;this.t=0;this.sway=0;}
  total(){return this.carry.length+this.incoming;}
  has(t){return this.carry.some(i=>i.type===t);}
  local(i){return V3(0,0.95+i*0.42,0.52);}
  slotWorld(i){this.g.updateMatrixWorld(true);return this.g.localToWorld(this.local(i));}
  add(type,m){m.rotation.set(0,0,0);m.position.copy(this.local(this.carry.length));this.g.add(m);this.carry.push({type,mesh:m});pop(m,0.5);}
  removeType(type){this.g.updateMatrixWorld(true);
    for(let i=this.carry.length-1;i>=0;i--){if(this.carry[i].type===type){const it=this.carry[i];const pos=new THREE.Vector3();it.mesh.getWorldPosition(pos);this.g.remove(it.mesh);this.carry.splice(i,1);this.layout();return {mesh:it.mesh,pos};}}
    return null;}
  layout(){this.carry.forEach((it,i)=>{const p=this.local(i);it.mesh.position.set(0,p.y,p.z-this.sway*i*0.045);it.mesh.rotation.x=-this.sway*i*0.03;});}
}
/* a "bin" is anything that holds items: producer piles, shelves, machine trays */
function instGeo(key,sphere){const src=mergeCache.get(key);const g=new THREE.BufferGeometry();for(const k in src.attributes)g.setAttribute(k,src.attributes[k]);if(src.index)g.setIndex(src.index);g.boundingSphere=sphere;g.boundingBox=null;return g;}
const IM_Q=new THREE.Quaternion(),IM_S=new THREE.Vector3(),IM_M=new THREE.Matrix4();
function makeBin(type,max,slotPos,parent){
  const b={type,count:0,incoming:0,max,unlocked:false,slotPos,slots:[]};
  const keys=[],pts=[];for(let i=0;i<max;i++){const it=makeItem(type);keys.push(it.userData.mk);freeItem(it);pts.push(slotPos(i));}
  const sph=new THREE.Sphere().setFromPoints(pts);sph.radius+=0.7;
  const groups=new Map();keys.forEach((k,i)=>{let g=groups.get(k);if(!g)groups.set(k,g={idx:[]});g.pos=g.idx.length;g.idx.push(i);});
  const slotIn=[];for(const [k,g] of groups){g.im=new THREE.InstancedMesh(instGeo(k,sph),VCMAT,g.idx.length);g.im.castShadow=g.im.receiveShadow=true;g.im.userData.nb=1;g.im.visible=false;parent.add(g.im);g.idx.forEach((i,j)=>slotIn[i]=[g,j]);}
  const sc=new Float32Array(max).fill(1);
  const write=i=>{const [g,j]=slotIn[i];const s=Math.max(0.01,sc[i]);IM_S.set(s,s,s);IM_M.compose(pts[i],IM_Q,IM_S);g.im.setMatrixAt(j,IM_M);g.im.instanceMatrix.needsUpdate=true;};
  for(let i=0;i<max;i++)write(i);
  // slots fill in order, so drawing the first n instances of each group draws exactly the stocked ones
  b.refresh=()=>{for(const g of groups.values()){let n=0;while(n<g.idx.length&&g.idx[n]<b.count)n++;g.im.count=n;g.im.visible=n>0;}};
  b.slots=pts.map((_,i)=>({userData:{},scale:{setScalar:v=>{sc[i]=v;write(i);}}}));
  b.space=()=>b.max-b.count-b.incoming;
  b.refresh();
  return b;
}

