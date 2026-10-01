/* ---------- navigation grid (A*) so NPCs walk around every obstacle ---------- */
const NAV={x0:-20,z0:-16,cs:0.5,W:290,H:68,grid:null,sig:-1};
function navRebuild(){
  const {x0,z0,cs,W,H}=NAV,g=new Uint8Array(W*H),inf=0.42;
  for(const s of solids){if(!s.active)continue;
    const i0=Math.max(0,Math.floor((s.x0-inf-x0)/cs)),i1=Math.min(W-1,Math.floor((s.x1+inf-x0)/cs));
    const j0=Math.max(0,Math.floor((s.z0-inf-z0)/cs)),j1=Math.min(H-1,Math.floor((s.z1+inf-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=x0+(i+0.5)*cs,cz=z0+(j+0.5)*cs;if(cx>s.x0-inf&&cx<s.x1+inf&&cz>s.z0-inf&&cz<s.z1+inf)g[j*W+i]=1;}}
  NAV.grid=g;
}
function navCheck(){let sig=0;for(let k=0;k<solids.length;k++)if(solids[k].active)sig+=(k+1)*(k+7);if(sig!==NAV.sig){NAV.sig=sig;navRebuild();}}
const cellOf=(x,z)=>[Math.floor((x-NAV.x0)/NAV.cs),Math.floor((z-NAV.z0)/NAV.cs)];
const freeCell=(i,j)=>i>=0&&j>=0&&i<NAV.W&&j<NAV.H&&NAV.grid[j*NAV.W+i]===0;
function blockedAt(x,z){const [i,j]=cellOf(x,z);return !freeCell(i,j);}
function los(a,b){const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(d/0.2);for(let k=1;k<n;k++){const t=k/n;if(blockedAt(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;}
function nearestFree(i,j){if(freeCell(i,j))return [i,j];for(let r=1;r<10;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(freeCell(i+di,j+dj))return [i+di,j+dj];}return [i,j];}
const cellPt=(i,j)=>V3(NAV.x0+(i+0.5)*NAV.cs,0,NAV.z0+(j+0.5)*NAV.cs);
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
const AS={N:0,gs:null,came:null,stamp:null,shut:null,gen:0,hf:null,hn:null,hl:0,cache:new Map()};
function asInit(N){AS.N=N;AS.gs=new Float32Array(N);AS.came=new Int32Array(N);AS.stamp=new Uint32Array(N);AS.shut=new Uint32Array(N);const H=Math.max(N*4,200016);AS.hf=new Float32Array(H);AS.hn=new Int32Array(H);}
function hPush(f,n){if(AS.hl>=AS.hf.length)return;let k=AS.hl++;while(k>0){const p=(k-1)>>1;if(AS.hf[p]<=f)break;AS.hf[k]=AS.hf[p];AS.hn[k]=AS.hn[p];k=p;}AS.hf[k]=f;AS.hn[k]=n;}
function hPop(){const top=AS.hn[0],l=--AS.hl;if(l>0){const f=AS.hf[l],n=AS.hn[l];let k=0;for(;;){let c=2*k+1;if(c>=l)break;if(c+1<l&&AS.hf[c+1]<AS.hf[c])c++;if(AS.hf[c]>=f)break;AS.hf[k]=AS.hf[c];AS.hn[k]=AS.hn[c];k=c;}AS.hf[k]=f;AS.hn[k]=n;}return top;}
function aStar(si,sj,gi,gj){
  const W=NAV.W,N=W*NAV.H;if(AS.N!==N)asInit(N);
  const ck=NAV.sig+':'+(sj*W+si)+':'+(gj*W+gi),hit=AS.cache.get(ck);if(hit!==undefined){AS.cache.delete(ck);AS.cache.set(ck,hit);return hit;}
  const start=sj*W+si,goal=gj*W+gi,gen=++AS.gen,gs=AS.gs,came=AS.came,st=AS.stamp,shut=AS.shut;
  const hx=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return Math.max(dx,dz)+0.414*Math.min(dx,dz);};
  AS.hl=0;st[start]=gen;gs[start]=0;came[start]=-1;hPush(hx(si,sj),start);let found=false,iter=0;
  while(AS.hl&&iter++<25000){
    const n=hPop();if(shut[n]===gen)continue;shut[n]=gen;if(n===goal){found=true;break;}
    const i=n%W,j=(n/W)|0,gn=gs[n];
    for(let d=0;d<8;d++){const D=DIRS[d],di=D[0],dj=D[1],ni=i+di,nj=j+dj;if(!freeCell(ni,nj))continue;if(di&&dj&&(!freeCell(i+di,j)||!freeCell(i,j+dj)))continue;
      const m=nj*W+ni;if(shut[m]===gen)continue;const ng=gn+D[2];if(st[m]!==gen||ng<gs[m]){st[m]=gen;gs[m]=ng;came[m]=n;hPush(ng+hx(ni,nj),m);}}
  }
  let cells=null;
  if(found){cells=[];for(let n=goal;n!==-1;n=came[n]){cells.push(n);if(n===start)break;}cells.reverse();}
  AS.cache.set(ck,cells);if(AS.cache.size>400)AS.cache.delete(AS.cache.keys().next().value);return cells;
}
function route(a,b){
  navCheck();
  const A=V3(a.x,0,a.z),B=V3(b.x,0,b.z);
  if(los(A,B))return [B];
  const W=NAV.W;
  const [si,sj]=nearestFree(...cellOf(A.x,A.z)),[gi,gj]=nearestFree(...cellOf(B.x,B.z));
  const ids=aStar(si,sj,gi,gj);
  if(!ids)return [B];
  const cells=ids.map(n=>cellPt(n%W,(n/W)|0));
  const out=[];let cur=A,k=0;
  while(k<cells.length){let j=cells.length-1;while(j>k&&!los(cur,cells[j]))j--;out.push(cells[j]);cur=cells[j];k=j+1;}
  out.push(B);return out;
}

