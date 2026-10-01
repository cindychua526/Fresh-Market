/* ---------- permanent perks bought with manager stars ---------- */
const PERKS=[
 {k:'start',e:'💰',max:5,n:TT('开店资金','Starting cash','Modal permulaan'),d:TT('开分店时多带 💵500','+💵500 when you open a branch','+💵500 apabila membuka cawangan')},
 {k:'basket',e:'🎒',max:4,n:TT('大背篓','Bigger basket','Bakul lebih besar'),d:TT('每级多拿 1 件','Carry 1 more item per level','Boleh bawa 1 barang lagi bagi setiap tahap')},
 {k:'walk',e:'👟',max:4,n:TT('轻快步伐','Quick feet','Langkah pantas'),d:TT('你走得快 5%','You move 5% faster','Anda bergerak 5% lebih laju')},
 {k:'staff',e:'🏃',max:5,n:TT('勤快店员','Busy staff','Pekerja rajin'),d:TT('搬运工快 8%','Porters move 8% faster','Pengangkut 8% lebih laju')},
 {k:'tips',e:'🔥',max:3,n:TT('好口碑','Good word','Nama baik'),d:TT('小费 +25%','Tips +25%','Tip +25%')},
 {k:'offline',e:'🌙',max:4,n:TT('夜班','Night shift','Syif malam'),d:TT('离线收益多 2 小时、+5%','Offline earnings +2 h and +5%','Pendapatan luar talian +2 jam dan +5%')}];
function buyPerk(k){if(NET.mode==='guest')return;const pk=PERKS.find(p=>p.k===k);const lv=PK(k);if(!pk||lv>=pk.max)return;const c=lv+1;if((legacy.stars||0)<c)return;
  legacy.stars-=c;legacy.perks[k]=lv+1;chord();toast('⭐ '+pk.n+' Lv.'+(lv+1),1800);save();renderHub();}
const THEME_INFO=[TT('招牌特产 🌽 玉米。经典小镇，没有特别规则。','Specialty: 🌽 corn. The classic town, no special rules.','Istimewa: 🌽 jagung. Pekan klasik, tiada peraturan khas.'),
 TT('招牌特产 🦐 鲜虾。旅游团更常来、人更多，客人来得更快。','Specialty: 🦐 shrimp. More and bigger tour groups; shoppers arrive faster.','Istimewa: 🦐 udang. Lebih banyak kumpulan pelancong yang lebih besar; pelanggan datang lebih cepat.'),
 TT('招牌特产 ☕ 热可可。客人走得慢，但每样多买 1 件。','Specialty: ☕ hot cocoa. Shoppers walk slowly but buy 1 more of everything.','Istimewa: ☕ koko panas. Pelanggan berjalan perlahan tetapi membeli 1 lagi bagi setiap barang.'),
 TT('招牌特产 🍡 团子。每 3 天就有一次节日。','Specialty: 🍡 dango. A festival every 3 days.','Istimewa: 🍡 dango. Perayaan setiap 3 hari.')];

