/* ---------- static batching ----------
   The town is built from ~1,900 little boxes, cones and spheres, each its own draw call and each
   matrix-updated every frame. Once everything is built we merge meshes that never move into a
   few big meshes per area (vertex colours carry the original colours), then freeze their
   matrices. Spatial cells keep frustum culling useful. Materials that change at runtime (floor
   and shelf decor, night glow, branch themes, glass, festival lights) keep their own material. */
function bakeStatic(){
  const THEMED=new Set([0x8fd96b,0x4fbf4a,0x62d15a]),LIT=new Set([0xebe6f3,0xfbdab7,0xdbe9f7,0xf6f2fb]);
  const plain=new Set();for(const k in mats){const h=+k;if(!THEMED.has(h)&&!LIT.has(h))plain.add(mats[k]);}
  const shared=new Set([...Object.values(GEO),...Object.values(CG),padGeo,...mergeCache.values()]);
  const ok=m=>m.isMesh&&!m.isInstancedMesh&&m.visible&&m.renderOrder===0&&m.material&&!Array.isArray(m.material)&&!m.material.map&&!m.children.length&&m.geometry.attributes.normal;
  const collect=(root,out)=>{for(const c of root.children){const u=c.userData;if(u.live||u.nb||!c.visible)continue;if(u.moves){bakeRoot(c);continue;}if(ok(c))out.push(c);else if(c.children.length)collect(c,out);}};
  const bakeRoot=r=>{const out=[];collect(r,out);mergeInto(r,out);};
  const tv=new THREE.Vector3(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3();
  function bakeGeo(list,inv,vc,shelf){let nv=0,ni=0;for(const m of list){const g=m.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=vc?new Float32Array(nv*3):null,idx=new (nv>65535?Uint32Array:Uint16Array)(ni);let vo=0,io=0;
    for(const m of list){const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,cr=m.material.color;m4.multiplyMatrices(inv,m.matrixWorld);nm.getNormalMatrix(m4);
      for(let i=0;i<p.count;i++){const j=(vo+i)*3;tv.fromBufferAttribute(p,i).applyMatrix4(m4);pos[j]=tv.x;pos[j+1]=tv.y;pos[j+2]=tv.z;
        tv.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor[j]=tv.x;nor[j+1]=tv.y;nor[j+2]=tv.z;if(col){col[j]=cr.r;col[j+1]=cr.g;col[j+2]=cr.b;}}
      if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io+i]=a[i]+vo;io+=a.length;}else{for(let i=0;i<p.count;i++)idx[io+i]=vo+i;io+=p.count;}vo+=p.count;}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    if(shelf){const sl=new Uint8Array(nv);let o2=0;for(const m of list){const n=m.geometry.attributes.position.count;sl.fill(shelfMats.indexOf(m.material),o2,o2+n);o2+=n;}bg.userData.slots=sl;SHELF_GEOS.push(bg);}
    if(col)bg.setAttribute('color',new THREE.BufferAttribute(col,3));bg.setIndex(new THREE.BufferAttribute(idx,1));bg.computeBoundingSphere();return bg;}
  function mergeInto(root,list,cell=14){if(list.length<2)return;root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const buckets=new Map();
    for(const m of list){const sh=shelfMats.includes(m.material),vc=sh||plain.has(m.material);const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();tv.copy(g.boundingSphere.center).applyMatrix4(m.matrixWorld);
      const key=(sh?'sh':vc?'vc':m.material.uuid)+(m.castShadow?'|c|':'|n|')+Math.floor(tv.x/cell)+','+Math.floor(tv.z/cell);let b=buckets.get(key);
      if(!b)buckets.set(key,b={vc,sh,mat:sh?SHELF_VC:m.material,cast:m.castShadow,list:[]});b.list.push(m);}
    // a lone non-shadow mesh joins its shadow-casting neighbour rather than costing its own draw
    for(const [k,b] of buckets){if(b.list.length!==1||b.cast)continue;const o=buckets.get(k.replace('|n|','|c|'));if(o){o.list.push(b.list[0]);b.list=[];}}
    for(const b of buckets.values()){if(b.list.length<(b.sh?1:2))continue;let chunk=[],nv=0;
      const flush=()=>{if(chunk.length>(b.sh?0:1)){const mm=new THREE.Mesh(bakeGeo(chunk,inv,b.vc,b.sh),b.sh?SHELF_VC:b.vc?VCMAT:b.mat);mm.castShadow=b.cast;mm.receiveShadow=true;root.add(mm);
          for(const o of chunk){o.parent.remove(o);if(!shared.has(o.geometry))o.geometry.dispose();}}chunk=[];nv=0;};
      for(const m of b.list){const n=m.geometry.attributes.position.count;if(nv+n>65000)flush();chunk.push(m);nv+=n;}flush();}}
  scene.updateMatrixWorld(true);const loose=[];
  for(const c of [...scene.children]){const u=c.userData;if(u.live||u.nb||!c.visible&&c.isMesh)continue;
    if(u.flat)collect(c,loose);else if(c.isMesh){if(ok(c))loose.push(c);}else if(c.children.length)bakeRoot(c);}
  mergeInto(scene,loose,24);
  // freeze local matrices of everything that never moves (pop() re-enables them briefly)
  const freeze=o=>{for(const c of o.children){const u=c.userData;if(u.live)continue;if(!u.moves){c.updateMatrix();c.matrixAutoUpdate=false;u.frozen=1;}freeze(c);}};
  freeze(scene);
}
bakeStatic();applyTownVis();refreshSigns();
if(stats.coop==null)stats.coop=0;

