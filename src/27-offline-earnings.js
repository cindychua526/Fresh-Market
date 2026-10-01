/* ---------- offline earnings ---------- */
let rateLastEarned=null,rateAcc=0;
function rateTick(dt){rateAcc+=dt;if(rateAcc<10)return;if(rateLastEarned!=null){const perMin=(stats.earned-rateLastEarned)*(60/rateAcc);stats.rate=stats.rate?stats.rate*0.85+perMin*0.15:perMin;}rateLastEarned=stats.earned;rateAcc=0;}
function offlineCapMin(){return Math.min(BAL.offMaxMin,BAL.offBaseMin+BAL.offPerTenStars*Math.floor(totalStars()/10))+120*PK('offline');}
function staffCount(){return helpers.length+checkouts.filter(c=>c.cashier).length;}
function grantOffline(ms,why){
  if(NET.mode==='guest'||!(ms>120000))return;const capMin=offlineCapMin();const mins=Math.min(capMin,ms/60000);const staff=staffCount();if(!staff||!(stats.rate>0))return;
  const amt=Math.floor(stats.rate*mins*(BAL.offRate+0.05*PK('offline'))*Math.min(1,staff/4));if(amt<10)return;money+=amt;
  const h=Math.floor(mins/60),m=Math.floor(mins%60);say(['🧺',L('店员们')],[L('你离开了')+' '+(h?h+L('小时'):'')+m+L('分钟')+L('，店员们帮你赚了')+' 💵'+amt+'！'+(mins>=capMin?TT('（最多累计 '+Math.round(capMin/60)+' 小时）',' (max '+Math.round(capMin/60)+' h)',' (maks '+Math.round(capMin/60)+' jam)'):'')]);}
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(AC){if(document.hidden){if(AC.state==='running')AC.suspend().catch(()=>{});}else if(AC.state!=='running'&&AC.state!=='closed')AC.resume().catch(()=>{});}if(document.hidden)hiddenAt=Date.now();else if(hiddenAt){grantOffline(Date.now()-hiddenAt);hiddenAt=0;}});
setTimeout(()=>{if(offlineFrom)grantOffline(Date.now()-offlineFrom);setTimeout(checkStreak,2600);
  try{const hb=JSON.parse(localStorage.getItem('fm-helpbank')||'null');if(hb&&hb.v>0&&NET.mode!=='guest'){const v=Math.floor(hb.v),hs=Math.max(0,Math.min(3,hb.st|0));money+=v;legacy.stars=(legacy.stars||0)+hs;localStorage.removeItem('fm-helpbank');save();setTimeout(()=>toast(L('👥 你在朋友店里帮忙，带回了')+' 💵'+v+(hs?'  ⭐+'+hs:''),3000),1200);}}catch(_){}},1800);

