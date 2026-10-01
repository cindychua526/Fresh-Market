/* ---------- stats, daily goals, story ---------- */
const stats={sold:{},served:0,diners:0,earned:0,night:0,rate:0};let offlineFrom=0;
const daily={goals:[],d:{sold:{},served:0,diners:0,earned:0},day:0};
function onSale(t,n){if(promo&&promo.type===t)stats.promoSold=(stats.promoSold||0)+n;if(curFest&&curFest.item===t)stats.fest=(stats.fest||0)+n;stats.sold[t]=(stats.sold[t]||0)+n;daily.d.sold[t]=(daily.d.sold[t]||0)+n;}
function onServed(earn,diner){if(diner){stats.diners++;daily.d.diners++;}else{stats.served++;daily.d.served++;}if(isNight())stats.night++;stats.earned+=earn;daily.d.earned+=earn;}
const GOAL_TXT={sell:g=>TT('卖出 '+g.n+' 个','Sell '+g.n+' ','Jual '+g.n+' ')+ITEM[g.t].e,served:g=>TT('服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers','Layan '+g.n+' pelanggan'),
  diners:g=>TT('招待 '+g.n+' 位食客','Serve '+g.n+' diners','Layan '+g.n+' pengunjung makan'),earn:g=>TT('赚到','Earn','Peroleh')+' 💵'+g.n,night:g=>TT('夜里服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers at night','Layan '+g.n+' pelanggan waktu malam'),
  pad:g=>TT('解锁「'+padById[g.id].name+'」','Unlock "'+L(padById[g.id].name)+'"','Buka "'+L(padById[g.id].name)+'"'),all:g=>L('建好全部设施'),
  town:g=>TT('建好','Build','Bina')+' '+(TOWN.find(t=>t.id===g.id)||{}).e+' '+(TOWN.find(t=>t.id===g.id)||{}).n,
  stars:g=>TT('店里升星到 '+g.n+' 颗','Reach '+g.n+' upgrade stars in this shop','Capai '+g.n+' bintang naik taraf di kedai ini'),
  rating:g=>TT('拿到 '+g.n+' 次三星好评','Get '+g.n+' three-star days','Dapat '+g.n+' hari tiga bintang'),
  branch:g=>TT('开一家分店','Open a branch','Buka cawangan')};
function genDaily(){const ls=lines(),L=Math.max(1,ls.length);const g=[];
  if(ls.length){const t=ls[(Math.random()*ls.length)|0];g.push({k:'sell',t,n:Math.max(4,Math.round(90/ITEM[t].price))+L});}
  g.push(fhOpen&&Math.random()<0.5?{k:'diners',n:6+stallsOpen().length*3}:{k:'served',n:8+L*3});
  g.push({k:'earn',n:Math.round((120+L*110)/10)*10});
  const rw=Math.round((50+L*40)*rewardMul()/10)*10;daily.goals=g.map(x=>({...x,done:false,reward:rw}));daily.d={sold:{},served:0,diners:0,earned:0};daily.day=dayN;}
function dailyProg(g){const d=daily.d;return g.k==='sell'?(d.sold[g.t]||0):g.k==='served'?d.served:g.k==='diners'?d.diners:d.earned;}
function newDay(){rateDay();genDaily();toast(TT('☀️ 第'+dayN+'天开始，今日目标更新啦','☀️ Day '+dayN+' begins — new daily goals!','☀️ Hari '+dayN+' bermula — matlamat harian baharu!'),2400);}
const GRANNY=['👵','阿婆'],MAYOR=['🧑‍💼','镇长'],MEI=['👧','小美'];
const STORY=[
 {t:'回到小镇',who:GRANNY,intro:['你终于回来啦！小时候你最爱在这片番茄地里跑。','阿婆年纪大了，这间小菜摊就交给你吧。','去地里摘番茄摆上货架，再到收银台给客人结账。跟着黄色箭头走就行。'],goals:[{k:'sell',t:'tomato',n:12}],reward:60,outro:'做得真好！客人都夸番茄新鲜。'},
 {t:'清晨的鸡蛋',who:GRANNY,intro:['一大早来买菜的客人，总会问有没有鸡蛋。','我们也养几只母鸡吧，再摆个鸡蛋货架。'],goals:[{k:'pad',id:'eggFarm'},{k:'pad',id:'eggShelf'},{k:'sell',t:'egg',n:10}],reward:120,outro:'鸡蛋一摆出来就卖光了，母鸡们也很开心。'},
 {t:'请个帮手',who:MAYOR,intro:['你好，我是镇长！听说老菜摊重新开张，镇上的人都很高兴。','客人越来越多，一个人收银忙不过来吧？请个收银员试试。'],goals:[{k:'pad',id:'cashier'},{k:'served',n:25}],reward:200,outro:'有了收银员，排队的人少多了。'},
 {t:'小美的牛奶',who:MEI,intro:['店长店长！我每天早上都要喝一杯牛奶。','店里能卖牛奶吗？我可以天天来买！'],goals:[{k:'pad',id:'cowFarm'},{k:'pad',id:'milkShelf'},{k:'sell',t:'milk',n:10}],reward:250,outro:'太好喝啦！我要告诉班上所有同学。'},
 {t:'一起搬货',who:GRANNY,intro:['货架多了，一个人跑来跑去太累啦。','请个搬运工帮忙，再种点胡萝卜，炖汤最香。'],goals:[{k:'pad',id:'helper'},{k:'pad',id:'carrotShelf'}],reward:300,outro:'搬运工干活真麻利，阿婆放心多了。'},
 {t:'扩建店面',who:MAYOR,intro:['镇上的面包店关门了，大家都很想念刚出炉的面包。','把店面扩大一点，自己种麦子烤面包怎么样？'],goals:[{k:'pad',id:'expand'},{k:'pad',id:'breadShelf'},{k:'sell',t:'bread',n:12}],reward:500,outro:'整条街都飘着面包香，大家都来排队了！'},
 {t:'集市日',who:MAYOR,intro:['这个周末是小镇集市日，全镇的人都会来逛。','多开一个收银台，好好赚一笔吧！'],goals:[{k:'pad',id:'checkout2'},{k:'earn',n:3000}],reward:800,outro:'集市日大成功！你的店成了全镇最热闹的地方。'},
 {t:'什么都有的百货区',who:MEI,intro:['店长，我想买零食和冰淇淋，还要帮妈妈买纸巾！','要是店里什么都能买到就好了……'],goals:[{k:'pad',id:'wing'},{k:'pad',id:'depot'},{k:'pad',id:'sh_soda'},{k:'pad',id:'sh_cookies'}],reward:1200,outro:'哇，汽水和饼干！以后放学我都来这里。'},
 {t:'夜市灯火',who:GRANNY,intro:['以前镇上一到晚上就黑漆漆的。','现在路灯亮了，晚上也有人出来逛。晚上的客人虽然少，买得可多啦。'],goals:[{k:'night',n:25}],reward:1500,outro:'看着一家家人晚上来买东西，阿婆心里暖暖的。'},
 {t:'登上二楼',who:MAYOR,intro:['隔壁那栋楼空了好久，楼上正好租给你。','装个扶梯，开个卖衣服、图书和玩具的生活馆吧！'],goals:[{k:'pad',id:'floor2'},{k:'pad',id:'elevator'},{k:'pad',id:'sh2_tshirt'},{k:'sell',t:'tshirt',n:8}],reward:2500,outro:'二楼开张那天，镇上的人都坐着扶梯上去看新鲜。'},
 {t:'美食广场',who:MEI,intro:['逛街逛饿了怎么办？','店长，在二楼开个美食广场吧！我想吃汉堡！'],goals:[{k:'pad',id:'foodhall'},{k:'pad',id:'stallBurger'},{k:'diners',n:15}],reward:4000,outro:'汉堡真好吃！美食广场每天都坐满了人。'},
 {t:'小镇之光',who:GRANNY,intro:['谁能想到，当年的小菜摊能变成今天的样子。','把剩下的设施都建好吧，让小镇鲜市成为全镇的骄傲！'],goals:[{k:'all'}],reward:10000,outro:'你做到了！小镇鲜市成了全镇的骄傲。谢谢你回来，孩子。'},
 {t:TT('镇长的请求','The mayor\'s request','Permintaan datuk bandar'),who:MAYOR,intro:[TT('店这么热闹，镇上却连个散步的地方都没有。','The shop is buzzing, but the town has nowhere to take a walk.','Kedai sangat meriah, tetapi pekan tiada tempat untuk bersiar.'),TT('给货架和田地升升星，再帮我们建个公园吧！','Add some stars to your shelves and fields, then help us build a park!','Naik taraf rak dan ladang anda, kemudian bantu kami membina taman!')],goals:[{k:'stars',n:15},{k:'town',id:'park'}],reward:20000,outro:TT('公园开放了，周末全家人都来逛街买菜。','The park is open, and families come shopping every weekend.','Taman dibuka, keluarga datang membeli-belah setiap hujung minggu.')},
 {t:TT('小美的学校','Mei\'s school','Sekolah Mei'),who:MEI,intro:[TT('店长！我们学校太旧了，下雨天还漏水……','Boss! Our school is so old the roof leaks when it rains…','Bos! Sekolah kami sangat lama, bumbung bocor bila hujan…'),TT('要是能盖新学校，同学们放学都来你这里买零食！','If we get a new school, everyone will buy snacks here after class!','Kalau ada sekolah baharu, semua murid akan membeli snek di sini selepas sekolah!')],goals:[{k:'town',id:'school'},{k:'sell',t:'cookies',n:60}],reward:30000,outro:TT('新学校好漂亮！饼干一下子就卖光了。','The new school is beautiful! The cookies sold out right away.','Sekolah baharu sangat cantik! Biskut habis dijual serta-merta.')},
 {t:TT('照顾老街坊','Caring for neighbours','Menjaga jiran'),who:GRANNY,intro:[TT('镇上的老人家看病要坐很久的车。','The town\'s elders ride a long way to see a doctor.','Warga emas di pekan ini terpaksa pergi jauh untuk berjumpa doktor.'),TT('建个诊所吧。也要把店打理好，让每位客人都满意。','Let\'s build a clinic, and run the shop so well that every shopper leaves happy.','Mari bina klinik, dan uruskan kedai dengan baik supaya setiap pelanggan berpuas hati.')],goals:[{k:'town',id:'clinic'},{k:'rating',n:3}],reward:40000,outro:TT('老街坊们都说，这是全镇最贴心的店。','The neighbours say this is the kindest shop in town.','Jiran-jiran kata ini kedai paling prihatin di pekan.')},
 {t:TT('远方的客人','Visitors from afar','Pelawat dari jauh'),who:MAYOR,intro:[TT('越来越多外地人听说了小镇鲜市。','More and more people from other towns have heard of Tiny Fresh Market.','Semakin ramai orang dari pekan lain mengenali Pasar Segar Pekan.'),TT('建个公交站，再立一座钟楼，让小镇成为大家想来的地方！','Build a bus stop and a clock tower, and make this a town people want to visit!','Bina hentian bas dan menara jam, jadikan pekan ini tempat yang orang mahu lawati!')],goals:[{k:'town',id:'busstop'},{k:'town',id:'tower'}],reward:80000,outro:TT('钟声响起的那天，整条街都挤满了游客。','The day the bell first rang, the whole street was full of visitors.','Hari loceng pertama berbunyi, seluruh jalan penuh dengan pelawat.')},
 {t:TT('新的小镇','A new town','Pekan baharu'),who:GRANNY,intro:[TT('孩子，这里已经很好了。别的小镇也需要一间这样的店。','This town is in good hands now. Other towns need a shop like this too.','Pekan ini sudah berada di tangan yang baik. Pekan lain juga memerlukan kedai seperti ini.'),TT('去开一家分店吧，阿婆会一直为你骄傲。','Go and open a branch. Granny will always be proud of you.','Pergilah buka cawangan. Nenek akan sentiasa bangga dengan anda.')],goals:[{k:'branch'}],reward:30000,outro:TT('新的小镇，新的故事。谢谢你，店长。','A new town, a new story. Thank you, boss.','Pekan baharu, cerita baharu. Terima kasih, bos.')},
];
const story={mode:null,on:false,ch:0,base:null,done:false};
const statsCopy=()=>JSON.parse(JSON.stringify(stats));
function storyProg(g){const b=story.base||stats;
  switch(g.k){case 'sell':return [(stats.sold[g.t]||0)-(b.sold[g.t]||0),g.n];case 'served':return [stats.served-b.served,g.n];case 'diners':return [stats.diners-b.diners,g.n];
    case 'earn':return [stats.earned-b.earned,g.n];case 'night':return [stats.night-(b.night||0),g.n];case 'pad':return [padById[g.id].lvl>0?1:0,1];case 'all':return [pads.filter(p=>p.done).length,pads.length];
    case 'town':return [hasT(g.id)?1:0,1];case 'stars':return [totalStars(),g.n];case 'rating':return [(stats.day3||0)-(b.day3||0),g.n];case 'branch':return [(legacy.n||0)>0?1:0,1];}return [0,1];}
function checkGoals(){
  if(NET.mode==='guest')return;
  for(const g of daily.goals){if(!g.done&&dailyProg(g)>=g.n){g.done=true;money+=g.reward;toast('📋 今日目标完成！+💵'+g.reward,2200);chord();}}
  if(story.on&&!story.done){const C=STORY[story.ch];
    if(C&&C.goals.every(g=>{const [a,b]=storyProg(g);return a>=b;})){money+=C.reward;say(C.who,[C.outro+'（奖励 💵'+C.reward+'）']);story.ch++;story.base=statsCopy();
      if(story.ch>=STORY.length){story.done=true;say(GRANNY,['🎉 故事完成！之后你可以继续自由经营，每天都有新的今日目标。']);}else startChapter();chord();save();}}
}
const dlg=document.getElementById('dlg'),dlgFace=document.getElementById('dlgFace'),dlgWho=document.getElementById('dlgWho'),dlgTxt=document.getElementById('dlgTxt');const dlgQ=[];
function say(who,lines){for(const l of lines)dlgQ.push({face:who[0],who:L(who[1]),t:L(l)});if(dlg.hidden)nextLine();}
function nextLine(){const d=dlgQ.shift();if(!d){dlg.hidden=true;return;}dlg.hidden=false;hint.style.opacity=0;dlgFace.textContent=d.face;dlgWho.textContent=d.who;dlgTxt.textContent=d.t;}
document.getElementById('dlgNext').onclick=nextLine;
const chTitle=(n,t)=>'📖 '+TT('第'+n+'章','Chapter '+n,'Bab '+n)+' · '+L(t);
function startChapter(){const C=STORY[story.ch];say(C.who,[chTitle(story.ch+1,C.t),...C.intro]);}
const menuEl=document.getElementById('menu'),mStory=document.getElementById('mStory');
function showMenu(){if(NET.mode==='guest'){toast('联机时由房主决定玩法');return;}
  mStory.firstChild.nodeValue=story.mode==='story'&&!story.done&&story.base?'📖 '+TT('继续故事（第'+(story.ch+1)+'章）','Continue story (Chapter '+(story.ch+1)+')','Sambung cerita (Bab '+(story.ch+1)+')'):L('📖 故事模式');menuEl.hidden=false;}
mStory.onclick=()=>{menuEl.hidden=true;story.mode='story';story.on=true;
  if(!story.base){let ch=0;for(let i=STORY.length-1;i>=0;i--){const pg=STORY[i].goals.filter(g=>g.k==='pad');if(pg.length&&pg.every(g=>padById[g.id].lvl>0)){ch=i+1;break;}}
    story.ch=Math.min(ch,STORY.length-1);story.base=statsCopy();}
  if(story.done)say(GRANNY,['故事已经完成啦，谢谢你！继续好好经营吧。']);else startChapter();renderCard();save();};
document.getElementById('mFree').onclick=()=>{menuEl.hidden=true;story.mode='free';story.on=false;renderCard();save();};
document.getElementById('storyBtn').onclick=showMenu;
document.getElementById('saveBtn').onclick=()=>{if(NET.mode==='guest'){toast('联机时进度保存在房主那边');return;}save();toast('💾 已保存');blip(700,0.08,'sine',0.06);};
const cardEl=document.getElementById('card'),stockBox=document.getElementById('stockBox'),clockEl=document.getElementById('clock'),cardBd=document.getElementById('cardBd'),cardTg=document.getElementById('cardTg'),storyBox=document.getElementById('storyBox'),dailyBox=document.getElementById('dailyBox');
let cardOpen=innerWidth>=520;try{const v=localStorage.getItem('fm-card');if(v)cardOpen=v!=='0';}catch(_){}
document.getElementById('cardHd').onclick=()=>{cardOpen=!cardOpen;try{localStorage.setItem('fm-card',cardOpen?'1':'0');}catch(_){}renderCard();};
function goalLine(txt,a,b,done){const v=Math.max(0,Math.min(a,b));return '<div class="goal'+(done?' ok':'')+'">'+txt+' <b>'+Math.floor(v)+'/'+b+'</b><div class="bar"><i style="width:'+Math.min(100,v/b*100)+'%"></i></div></div>';}
const boxHtml=new Map();
function setBox(el,h){if(boxHtml.get(el)===h)return;boxHtml.set(el,h);el.innerHTML=h;trDom(el);}
function setText(el,t){if(el.textContent!==t)el.textContent=t;}
function renderCard(){setText(clockEl,clockText());setText(cardTg,cardOpen?'▾':'▸');if(cardBd.hidden!==!cardOpen)cardBd.hidden=!cardOpen;cardEl.classList.toggle('open',cardOpen);if(!cardOpen)return;
  if(NET.mode==='guest'){setBox(storyBox,'');setBox(stockBox,stockHtml());setBox(dailyBox,orderHtml()+teamHtml()+'<div class="sec">'+L('👥 在朋友的店里帮忙')+'</div>');return;}
  let h='';if(story.on){if(story.done)h='<div class="sec">📖 故事完成 🎉</div>';else{const C=STORY[story.ch];h='<div class="sec">'+chTitle(story.ch+1,C.t)+'</div>'+C.goals.map(g=>{const [a,b]=storyProg(g);return goalLine(GOAL_TXT[g.k](g),a,b,a>=b);}).join('');}}
  setBox(storyBox,h);
  setBox(stockBox,stockHtml());
  setBox(dailyBox,farmHtml()+orderHtml()+teamHtml()+'<div class="sec">📋 今日目标'+(daily.goals[0]?'（每项 +💵'+daily.goals[0].reward+'）':'')+(dayRating(daily.d)?' <span class="stars" title="'+TT('今日评价','Today\'s rating','Penarafan hari ini')+'">'+starStr(dayRating(daily.d))+'</span>':'')+'</div>'+daily.goals.map(g=>goalLine(GOAL_TXT[g.k](g),g.done?g.n:dailyProg(g),g.n,g.done)).join(''));}
/* 🎮 play chooser + reminders */
const playEl=document.getElementById('play'),playBtnEl=document.getElementById('playBtn');
function renderPlay(){const fs=fStatus();document.getElementById('playK').textContent='⭐ '+kStarsTotal()+'/90';
  document.getElementById('playF').textContent=fs.ripe?TT(fs.ripe+' 块地可以收了',fs.ripe+' ready to harvest',fs.ripe+' sedia dituai'):fs.care?TT(fs.care+' 块地需要照顾',fs.care+' need care',fs.care+' perlu dijaga'):'Lv '+fSave().lvl;trDom(playEl);}
playBtnEl.onclick=()=>{if(NET.mode==='guest'){toast(TT('帮朋友看店时不能玩小游戏（房主可以）','Mini-games are for the shop owner during co-op','Permainan mini untuk pemilik kedai semasa main bersama'));return;}hubEl.hidden=true;renderPlay();playEl.hidden=false;};
document.getElementById('playClose').onclick=()=>{playEl.hidden=true;};
document.getElementById('goKitchen').onclick=openKitchen;document.getElementById('goFarm').onclick=openFarm;
function farmHtml(){if(NET.mode==='guest')return '';const s=fStatus();if(!s.ripe&&!s.care)return '';
  return '<div class="sec farmline" data-go="farm">🌱 '+(s.ripe?TT(s.ripe+' 块地可以收了',s.ripe+' plots ready to harvest',s.ripe+' petak sedia dituai'):TT(s.care+' 块地需要照顾',s.care+' plots need care',s.care+' petak perlu dijaga'))+' ›</div>';}
let cardT=0;function cardTick(dt){festUpdate(dt);eventsTick(dt);orderTick(dt);teamTick(dt);cardT-=dt;if(cardT<=0){cardT=0.5;checkGoals();checkWeekly();checkStreak();updBadge();dbgTick();farmTick(0.5);if(NET.mode!=='guest'){const fs=fStatus();playBtnEl.classList.toggle('dot',fs.ripe+fs.care>0);}checkAch();vipTick(0.5);scoreTick(0.5);rateTick(0.5);tipsTick();renderCard();}musicTick();}

load();
if(NET.mode!=='guest'){if(!daily.goals.length)genDaily();if(!story.mode)setTimeout(showMenu,400);else if(story.reopen&&story.on){delete story.reopen;setTimeout(startChapter,1400);}}
wasNight=isNight();
setInterval(()=>{if(!document.hidden)save();},4000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

