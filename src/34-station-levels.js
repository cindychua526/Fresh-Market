/* ---------- station levels (every shelf, field and machine has 10 stars) ---------- */
const ST_PAD={};
{const S={egg:'eggShelf',milk:'milkShelf',carrot:'carrotShelf',jam:'jamShelf',bread:'breadShelf',cheese:'cheeseShelf',juice:'juiceShelf'};for(const t in S)ST_PAD['s:'+t]=S[t];
 WING_GOODS.forEach(t=>ST_PAD['s:'+t]='sh_'+t);F2_GOODS.forEach(t=>ST_PAD['s:'+t]='sh2_'+t);SIG_ITEMS.forEach(t=>{ST_PAD['s:'+t]='sigStall';ST_PAD['p:'+t]='sigStall';});
 const P={egg:'eggFarm',milk:'cowFarm',carrot:'carrotFarm',strawberry:'berryFarm',wheat:'wheatFarm',apple:'appleFarm'};for(const t in P)ST_PAD['p:'+t]=P[t];
 const Mc={bread:'oven',cheese:'press',juice:'juicer',jam:'jamMaker',burger:'stallBurger',soup:'stallSoup',drink:'stallDrink'};for(const t in Mc)ST_PAD['m:'+t]=Mc[t];}
function stations(){const out=[];
  for(const t of [...SELL,...SIG_ITEMS]){const o=shelves[t];if(o.unlocked)out.push({k:'s:'+t,kind:'s',e:ITEM[t].e,o});}
  for(const t in producers){const o=producers[t];if(o.unlocked)out.push({k:'p:'+t,kind:'p',e:ITEM[t].e,o});}
  for(const t in machines){const o=machines[t];if(o.unlocked)out.push({k:'m:'+t,kind:'m',e:ITEM[o.inT].e+'➜'+ITEM[t].e,o});}
  return out;}
function stCost(k,lv){const p=padById[ST_PAD[k]];const base=p?p.costs[0]*padMul(p):40;return Math.max(20,Math.round(base*BAL.stBase*Math.pow(BAL.stGrowth,lv)/10)*10);}
function refreshSigns(){for(const t in shelves){const sh=shelves[t];if(!sh.sign)continue;const lv=stLv['s:'+t]||0;const key=lv;if(sh.signLv===key)continue;sh.signLv=key;drawBubble(sh.sign,ITEM[t].e,lv?'★'+lv:'');}}
function buyStation(k){if(NET.mode==='guest')return;const lv=stLv[k]||0;if(lv>=BAL.stMax)return;const c=stCost(k,lv);if(money<c){hubMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  paceLog(k+' ★'+(lv+1),c);money-=c;stLv[k]=lv+1;stats.upgrades=(stats.upgrades||0)+1;const s=stations().find(x=>x.k===k);if(s)sparkle(V3(s.o.x,floorY(s.o.x)+1.6,s.o.z),14,0xffd24a,1);
  refreshSigns();chord();save();renderHub();}

