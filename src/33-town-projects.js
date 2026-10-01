/* ---------- town projects: late-game money sink with lasting effects ---------- */
const TOWN=[
 {id:'park',e:'🌳',cost:60000,n:TT('中央公园','Central park','Taman pusat'),d:TT('客人更多：上限 +3，来得更快','More shoppers: cap +3 and they arrive faster','Lebih ramai pelanggan: had +3, datang lebih cepat')},
 {id:'school',e:'🏫',cost:90000,n:TT('小镇学校','Town school','Sekolah pekan'),d:TT('学生更多，每样多买 1 件','More students; each buys 1 more of everything','Lebih ramai pelajar; mereka membeli 1 lagi bagi setiap barang')},
 {id:'clinic',e:'🏥',cost:130000,n:TT('社区诊所','Clinic','Klinik'),d:TT('老人家更多，付钱 +25%','More seniors, and they pay +25%','Lebih ramai warga emas, dan mereka membayar +25%')},
 {id:'busstop',e:'🚏',cost:180000,n:TT('公交站','Bus stop','Hentian bas'),d:TT('旅游团更常来，人也更多','Tour groups come more often and bigger','Kumpulan pelancong lebih kerap dan lebih besar')},
 {id:'tower',e:'🕰️',cost:260000,n:TT('钟楼','Clock tower','Menara jam'),d:TT('小镇出名了：所有售价 +10%','Town fame: all prices +10%','Pekan terkenal: semua harga +10%')}];
const townCost=t=>Math.round(t.cost*(1+BAL.branchCost*(legacy.n||0))/100)*100;
const townG={};
{let g;const mk=id=>{g=townG[id]=new THREE.Group();g.visible=false;scene.add(g);return g;};
 mk('park');cyl(5,5,0.06,0x7fcf5c,-2,0.04,-26,g,32);cyl(1.4,1.4,0.1,0x7fc4f0,-2,0.1,-26,g,20);box(1.6,0.08,0.5,0xc98b52,-2,0.45,-23.4,g);
 for(const [x,z] of [[-5.5,-24],[1.5,-24.5],[-4.5,-28.5],[2,-28]]){cyl(0.15,0.2,0.8,0x9a6a43,x,0.4,z,g,6);add(new THREE.ConeGeometry(0.9,1.6,7),0x4fbf4a,x,1.5,z,g);add(new THREE.ConeGeometry(0.7,1.2,7),0x62d15a,x,2.2,z,g);}
 mk('school');box(9,3.6,5,0xf2d16b,14,1.8,-27,g);box(9.4,0.5,5.4,0xd9534f,14,3.85,-27,g);for(let i=0;i<4;i++)box(1.2,0.9,0.08,winMat,10.6+i*2.3,2.3,-24.46,g,false);
 box(1.4,1.8,0.1,0x8a5a36,14,0.9,-24.46,g);cyl(0.05,0.05,3,0x9aa0a6,19.2,1.5,-24,g,6);box(0.9,0.55,0.04,0xe53935,19.65,2.7,-24,g,false);
 mk('clinic');box(7,3.2,5,0xffffff,29,1.6,-26.5,g);box(7.3,0.3,5.3,0x4fc3a1,29,3.35,-26.5,g);box(1.4,0.4,0.1,0xe53935,29,2.5,-23.95,g,false);box(0.4,1.4,0.1,0xe53935,29,2.5,-23.94,g,false);
 for(const px of [-2.3,2.3])box(1.2,0.9,0.08,winMat,29+px,1.8,-23.96,g,false);box(1.3,1.8,0.1,0x9fd3ff,29,0.9,-23.96,g);
 mk('busstop');for(const px of [-1.3,1.3])box(0.1,2.1,0.1,0x6b7280,8+px,1.05,-15.9,g);box(3,0.12,1.1,0x2f7fd1,8,2.15,-15.7,g);box(2.4,0.08,0.4,0xc98b52,8,0.5,-15.95,g);
 box(6,1.9,2.2,0xffc93c,0,1.2,-18.6,g);box(5.6,0.7,2.24,0x9fd3ff,0,1.55,-18.6,g,false);for(const [wx,wz] of [[-2,-17.5],[2,-17.5],[-2,-19.7],[2,-19.7]])cyl(0.35,0.35,0.3,0x333333,wx,0.35,wz,g,12).rotation.x=Math.PI/2;
 mk('tower');box(2.6,7,2.6,0xe6d3b3,44,3.5,-27,g);const rf=add(new THREE.ConeGeometry(2.2,2,4),0xd9534f,44,8,-27,g);rf.rotation.y=Math.PI/4;
 cyl(0.9,0.9,0.08,0xffffff,44,6,-25.66,g,20).rotation.x=Math.PI/2;box(0.08,0.6,0.03,0x333333,44,6.2,-25.6,g,false);box(0.45,0.08,0.03,0x333333,44.15,6,-25.6,g,false);}
function applyTownVis(){for(const t of TOWN)townG[t.id].visible=hasT(t.id);}
function buildTown(id){const t=TOWN.find(x=>x.id===id);if(!t||hasT(id)||NET.mode==='guest')return;const c=townCost(t);if(money<c||!pads.every(p=>p.done)){hubMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  paceLog('town:'+id,c);money-=c;town[id]=1;const g=townG[id];g.visible=true;pop(g,0.2);camPunch();toast('🏙️ '+t.n+' '+TT('建好了！','is built!','siap dibina!'),2600);chord();save();renderHub();}

