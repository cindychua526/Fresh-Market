/* ---------- day rating, login streak, weekly challenges ---------- */
function dayRating(d){const n=(d.served||0)+(d.diners||0);if(n<5)return 0;const bad=((d.sad||0)+0.5*(d.miss||0))/(n+(d.sad||0));const w=d.waitN?d.waitSum/d.waitN:0;return (bad<0.08&&w<9)?3:(bad<0.2&&w<14)?2:1;}
const starStr=r=>'★'.repeat(r)+'☆'.repeat(3-r);
function rateDay(){const r=dayRating(daily.d);if(!r)return;stats.lastRating=r;if(r===3)stats.day3=(stats.day3||0)+1;
  const cash=Math.round(r*(40+lines().length*25)*rewardMul()/10)*10;money+=cash;setTimeout(()=>toast(TT('昨日评价 ','Yesterday ','Semalam ')+starStr(r)+'  +💵'+cash,2600),2800);}
const dayKey=(off=0)=>{const d=new Date(Date.now()-off*86400000);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function checkStreak(){if(NET.mode==='guest')return;const t=dayKey();if(streak.last===t)return;streak.n=streak.last===dayKey(1)?streak.n+1:1;streak.last=t;
  const cash=Math.round((150+100*Math.min(streak.n,7))*rewardMul()/10)*10;money+=cash;let msg='📅 '+TT('连续签到第 '+streak.n+' 天','Login streak: day '+streak.n,'Log masuk berturut: hari '+streak.n)+'  +💵'+cash;
  if(streak.n%7===0){legacy.stars=(legacy.stars||0)+1;msg+='  ⭐+1';}stats.bestStreak=Math.max(stats.bestStreak||0,streak.n);toast(msg,3200);save();}
const weekNo=()=>{const d=new Date();return Math.floor(((d.getTime()-d.getTimezoneOffset()*60000)/86400000+3)/7);};
const WEEK_TXT={served:g=>TT('服务 '+g.n+' 位顾客','Serve '+g.n+' shoppers','Layan '+g.n+' pelanggan'),earn:g=>TT('赚到 💵'+fmtN(g.n),'Earn 💵'+fmtN(g.n),'Peroleh 💵'+fmtN(g.n)),
  up:g=>TT('升级 '+g.n+' 次','Buy '+g.n+' upgrade stars','Beli '+g.n+' bintang naik taraf'),day3:g=>TT('拿到 '+g.n+' 次三星好评','Get '+g.n+' three-star days','Dapat '+g.n+' hari tiga bintang')};
function weekCur(k){return k==='served'?stats.served:k==='earn'?stats.earned:k==='up'?(stats.upgrades||0):(stats.day3||0);}
function genWeekly(){const L=Math.max(1,lines().length),m=rewardMul();weekly.wk=weekNo();weekly.base={served:stats.served,earn:stats.earned,up:stats.upgrades||0,day3:stats.day3||0};
  const cash=Math.round(300*m*(1+L/5)/50)*50;weekly.goals=[{k:'served',n:100+10*L},{k:'earn',n:Math.round(5000*m*(1+L/5)/500)*500},{k:'up',n:6},{k:'day3',n:3}].map(g=>({...g,done:false,cash}));}
const weekProg=g=>Math.max(0,weekCur(g.k)-((weekly.base||{})[g.k]||0));
function checkWeekly(){if(NET.mode==='guest')return;if(weekly.wk!==weekNo())genWeekly();
  for(const g of weekly.goals){if(!g.done&&weekProg(g)>=g.n){g.done=true;legacy.stars=(legacy.stars||0)+1;money+=g.cash;toast('📅 '+TT('本周挑战完成！','Weekly challenge done!','Cabaran mingguan selesai!')+'  ⭐+1  💵+'+g.cash,2800);chord();save();}}}
function weeklyHtml(){if(NET.mode==='guest'||!weekly.goals.length)return '';const left=7-((Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000)+3)%7);
  return '<div class="sec" style="font-weight:900;margin:4px 0">📅 '+TT('本周挑战','This week','Cabaran minggu ini')+' <small style="opacity:.7">'+TT('还剩 '+left+' 天，每项 ⭐1',left+' days left · ⭐1 each',left+' hari lagi · ⭐1 setiap satu')+'</small></div>'+
    weekly.goals.map(g=>{const v=Math.min(weekProg(g),g.n);return '<div class="li" style="'+(g.done?'opacity:.6':'')+'"><div class="e">'+(g.done?'✅':'📌')+'</div><div class="t"><b>'+WEEK_TXT[g.k](g)+'</b><small>+💵'+fmtN(g.cash)+' ⭐1</small><div class="bar"><i style="width:'+(v/g.n*100)+'%"></i></div></div><div>'+fmtN(v)+'/'+fmtN(g.n)+'</div></div>';}).join('')+
    '<p class="sub" style="margin-top:8px">🔥 '+TT('连续签到 '+streak.n+' 天（每 7 天送 ⭐1）','Login streak: '+streak.n+(streak.n===1?' day':' days')+' (⭐1 every 7 days)','Log masuk berturut: '+streak.n+' hari (⭐1 setiap 7 hari)')+
    (stats.lastRating?' · '+TT('昨日评价','Yesterday','Semalam')+' '+starStr(stats.lastRating):'')+'</p>';}
/* badge on ⭐ when something can be bought, and live refresh of open shop tabs */
let affKey='';
function updBadge(){if(NET.mode==='guest'){hubBtnEl.classList.remove('dot');return;}let k='';
  for(const s of stations()){const lv=stLv[s.k]||0;if(lv<BAL.stMax&&money>=stCost(s.k,lv))k+=s.k+',';}
  const allDone=pads.every(p=>p.done);for(const t of TOWN)if(allDone&&!hasT(t.id)&&money>=townCost(t))k+='t'+t.id;
  for(const pk of PERKS)if(PK(pk.k)<pk.max&&(legacy.stars||0)>PK(pk.k))k+='k'+pk.k;
  hubBtnEl.classList.toggle('dot',!!k);if(k!==affKey){affKey=k;if(!hubEl.hidden&&(hubTab==='up'||hubTab==='town'||hubTab==='branch'))renderHub();}}

