/* ---------- achievements ---------- */
const allHelpers=()=>helpers.length;
const ACH=[
 {id:'first',e:'💵',n:'第一桶金',d:'累计赚到 💵100',v:()=>[stats.earned,100],r:30},
 {id:'boss',e:'💼',n:'小老板',d:'累计赚到 💵10,000',v:()=>[stats.earned,1e4],r:300},
 {id:'tycoon',e:'💰',n:'小镇首富',d:'累计赚到 💵1,000,000',v:()=>[stats.earned,1e6],r:5000},
 {id:'tomato',e:'🍅',n:'番茄达人',d:'卖出 500 个番茄',v:()=>[stats.sold.tomato||0,500],r:300},
 {id:'bakery',e:'🍞',n:'面包飘香',d:'卖出 300 个面包',v:()=>[stats.sold.bread||0,300],r:600},
 {id:'serve500',e:'🙋',n:'顾客至上',d:'服务 500 位顾客',v:()=>[stats.served,500],r:500},
 {id:'serve5k',e:'🎉',n:'千客万来',d:'服务 5,000 位顾客',v:()=>[stats.served,5000],r:3000},
 {id:'night',e:'🌙',n:'夜猫子',d:'夜里服务 100 位顾客',v:()=>[stats.night||0,100],r:600},
 {id:'foodie',e:'🍽️',n:'美食家',d:'招待 200 位食客',v:()=>[stats.diners,200],r:1500},
 {id:'promo',e:'🔥',n:'特价狂欢',d:'特价期间卖出 100 件',v:()=>[stats.promoSold||0,100],r:500},
 {id:'fest',e:'🏮',n:'节日快乐',d:'节日商品卖出 50 件',v:()=>[stats.fest||0,50],r:800},
 {id:'vip',e:'⭐',n:'常客之友',d:'招待常客 10 次',v:()=>[stats.vip||0,10],r:800},
 {id:'wing',e:'🏬',n:'应有尽有',d:'百货区 8 个货架全部开张',v:()=>[WING_GOODS.filter(t=>shelves[t].unlocked).length,8],r:1000},
 {id:'f2',e:'🏢',n:'更上一层楼',d:'开放二楼',v:()=>[padById.floor2.lvl,1],r:1000},
 {id:'team',e:'🧺',n:'团队力量',d:'雇到 6 个搬运工',v:()=>[allHelpers(),6],r:800},
 {id:'week',e:'📅',n:'坚持营业',d:'经营到第 7 天',v:()=>[dayN,7],r:400},
 {id:'coop',e:'👥',n:'好朋友',d:'开一次联机房间',v:()=>[stats.coop||0,1],r:200},
 {id:'style',e:'🎨',n:'时尚店长',d:'买下 3 件装扮',v:()=>[Object.keys(decor.owned).length-3,3],r:500},
 {id:'story',e:'📖',n:'小镇之光',d:'完成故事模式',v:()=>[story.done?1:0,1],r:3000},
 {id:'max',e:'👑',n:'满级小镇',d:'建好全部设施',v:()=>[pads.filter(p=>p.done).length,pads.length],r:10000},
 {id:'up20',e:'⬆️',n:TT('精益求精','Getting better','Semakin baik'),d:TT('累计升星 20 次','Buy 20 upgrade stars','Beli 20 bintang naik taraf'),v:()=>[stats.upgrades||0,20],r:2000},
 {id:'up150',e:'🌟',n:TT('全星店铺','All-star shop','Kedai serba bintang'),d:TT('累计升星 150 次','Buy 150 upgrade stars','Beli 150 bintang naik taraf'),v:()=>[stats.upgrades||0,150],r:20000},
 {id:'day3',e:'⭐',n:TT('五星好评','Top rated','Penarafan tertinggi'),d:TT('拿到 10 次三星好评','Get 10 three-star days','Dapat 10 hari tiga bintang'),v:()=>[stats.day3||0,10],r:3000},
 {id:'streak7',e:'📅',n:TT('天天来','Regular','Pelawat tetap'),d:TT('连续签到 7 天','7-day login streak','Log masuk 7 hari berturut'),v:()=>[stats.bestStreak||0,7],r:2000},
 {id:'town5',e:'🏙️',n:TT('小镇建设者','Town builder','Pembina pekan'),d:TT('完成全部 5 个小镇项目','Finish all 5 town projects','Siapkan semua 5 projek pekan'),v:()=>[TOWN.filter(t=>hasT(t.id)).length,5],r:25000},
 {id:'br1',e:'🏪',n:TT('第二家店','Second shop','Kedai kedua'),d:TT('开一家分店','Open a branch','Buka cawangan'),v:()=>[legacy.n||0,1],r:3000},
 {id:'fresh',e:'✨',n:TT('新鲜达人','Fresh picker','Sentiasa segar'),d:TT('拿到 100 次新鲜出炉','Grab 100 fresh items','Ambil 100 barang segar'),v:()=>[stats.fresh||0,100],r:1500},
 {id:'perfect',e:'🎯',n:TT('神准收银','Perfect timing','Masa tepat'),d:TT('收银完美 50 次','50 perfect checkouts','50 kali bayaran sempurna'),v:()=>[stats.perfect||0,50],r:1500},
 {id:'chef',e:'🍳',n:TT('大厨','Head chef','Cef utama'),d:TT('美食挑战拿到 45 颗星','Earn 45 stars in the food court challenge','Dapat 45 bintang dalam cabaran medan selera'),v:()=>[kStarsTotal(),45],r:8000},
 {id:'farmer',e:'🧑‍🌾',n:TT('开心农夫','Happy farmer','Petani gembira'),d:TT('农场升到 8 级','Reach farm level 8','Capai tahap ladang 8'),v:()=>[(stats.farm&&stats.farm.lvl)||1,8],r:5000},
 {id:'br4',e:'🗺️',n:TT('连锁品牌','Chain brand','Jenama rangkaian'),d:TT('开到第 5 家店','Run your 5th shop','Buka kedai ke-5'),v:()=>[legacy.n||0,4],r:30000},
];
function checkAch(){if(NET.mode==='guest')return;for(const a of ACH){if(ACH_STATE[a.id])continue;const [x,y]=a.v();if(x>=y){ACH_STATE[a.id]=Date.now();money+=a.r;toast('🎖️ 成就达成：'+a.e+' '+a.n+'  +💵'+a.r,2600);chord();}}}

/* ---------- VIP regulars ---------- */
const VIP_GIFT={3:500,6:1500,10:5000};
function vipHeart(i,d){const v=VIPS[i];if(!v)return;const old=vipState[v.n]||0;const nw=Math.max(0,Math.min(10,old+d));vipState[v.n]=nw;
  if(d>0){toast('⭐ '+v.n+'很满意！好感 '+'❤️'.repeat(Math.min(nw,5))+(nw>5?'×'+nw:''),2200);if(VIP_GIFT[nw]&&nw>old){money+=VIP_GIFT[nw];setTimeout(()=>{toast('🎁 '+v.n+'送你一份谢礼：💵'+VIP_GIFT[nw],2600);chord();},1600);}}
  else toast('💔 '+v.n+'没买到想要的东西，有点失望',2200);}
function vipTick(dt){if(NET.mode==='guest')return;vipT-=dt;if(vipT>0)return;vipT=70+Math.random()*50;
  if(lines().length<3||customers.some(c=>c.vip>=0&&!c.dead))return;spawnCustomer((Math.random()*VIPS.length)|0);}
function addCrown(g){const cr=new THREE.Group();cr.position.y=1.66;const band=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.22,0.12,10,1,true),M(0xf2c94c));cr.add(band);
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const sp=new THREE.Mesh(GEO.cleaf,M(0xf2c94c));sp.position.set(Math.cos(a)*0.19,0.1,Math.sin(a)*0.19);cr.add(sp);}g.add(cr);}

