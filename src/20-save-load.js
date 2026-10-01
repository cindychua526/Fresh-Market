/* ---------- save / load ---------- */
let money=20;
function binKeys(){const o={};for(const t in producers)o['p:'+t]=producers[t];for(const t in shelves)o['s:'+t]=shelves[t];for(const t in machines){o['mi:'+t]=machines[t].inp;o['mo:'+t]=machines[t].out;}for(const t in pallets)o['pl:'+t]=pallets[t];return o;}
function saveObj(){const ach=ACH_STATE,vipS=vipState;const counts={};const bk=binKeys();for(const k in bk)counts[k]=bk[k].count;
  return ({savedAt:Date.now(),money,banks:checkouts.map(co=>co.stack.reduce((a,b)=>a+b,0)),pads:pads.map(p=>({id:p.id,lvl:p.lvl,paid:p.paid})),counts,fhBank:fhPile.stack.reduce((a,b)=>a+b,0),day:{t:dayT,n:dayN},stats,daily,story,ach,vip:vipS,decor,legacy,stLv,town,weekly,streak,v:SAVE_VER});}
const progressNow=()=>pads.reduce((s,p)=>s+p.lvl,0);
const SAVE_VER=2;let bakAt=0;
/* every 5 minutes the previous save is kept as a backup, used if the main save is ever unreadable */
function save(){if(resetting||NET.mode==='guest')return;try{if(Date.now()-bakAt>300000){const prev=localStorage.getItem(KEY);if(prev)localStorage.setItem(KEY+'-bak',prev);bakAt=Date.now();}
  localStorage.setItem(KEY,JSON.stringify(saveObj()));}catch(_){}cloudSoon();}
/* upgrades old save formats step by step; add a case here whenever the format changes */
function migrate(s){if(!s||typeof s!=='object')return null;const v=s.v|0;if(v<2){s.legacy=s.legacy||{n:0};s.v=2;}return s;}
function load(){
  unlockProducer('tomato');unlockShelf('tomato');unlockCheckout(0);producers.tomato.count=3;
  if(NET.mode==='guest'){const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();return;}
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(_){}if(!s){try{s=JSON.parse(localStorage.getItem(KEY+'-bak'));if(s)setTimeout(()=>toast(TT('已从备份恢复进度','Progress restored from backup','Kemajuan dipulihkan daripada sandaran'),2600),2000);}catch(_){}}
  if(!s){try{const o=JSON.parse(localStorage.getItem(KEY1));if(o){s={money:o.money,pads:o.pads,banks:[o.bank||0],counts:{}};
    ['tomato','egg','milk'].forEach((t,i)=>{if(o.prod)s.counts['p:'+t]=o.prod[i];if(o.shelf)s.counts['s:'+t]=o.shelf[i];});}}catch(_){}}
  s=migrate(s);if(s){money=+s.money||0;if(s.legacy)Object.assign(legacy,s.legacy);if(!legacy.perks)legacy.perks={};
    (s.pads||[]).forEach(ps=>{const p=padById[ps.id];if(!p)return;p.lvl=Math.min(ps.lvl|0,p.costs.length);p.paid=Math.min(+ps.paid||0,p.lvl<p.costs.length?padCost(p)-1:0);p.done=p.lvl>=p.costs.length;
      if(p.id==='helpers'||p.id==='staff2')for(let i=0;i<p.lvl;i++)applyPad(p,false);else if(p.lvl>0&&p.costs.length===1)applyPad(p,false);});
    const bk=binKeys();for(const k in (s.counts||{}))if(bk[k])bk[k].count=Math.max(0,Math.min(bk[k].max,s.counts[k]|0));
    (s.banks||[]).forEach((v,i)=>{const co=checkouts[i];if(!co||!(v>0))return;const n=Math.min(60,Math.ceil(v/5));for(let j=0;j<n;j++)co.stack.push(v/n);});
    if(s.fhBank>0){const n=Math.min(60,Math.ceil(s.fhBank/5));for(let j=0;j<n;j++)fhPile.stack.push(s.fhBank/n);fhPile.refresh();}
    if(s.day){dayT=+s.day.t||0.04;dayN=+s.day.n||1;}
    if(s.stats)Object.assign(stats,s.stats);
    if(s.daily&&s.daily.goals)Object.assign(daily,s.daily);
    if(s.story)Object.assign(story,s.story);
    if(s.ach)Object.assign(ACH_STATE,s.ach);if(s.vip)Object.assign(vipState,s.vip);if(s.decor)Object.assign(decor,s.decor);
    if(s.stLv)Object.assign(stLv,s.stLv);if(s.town)Object.assign(town,s.town);if(s.weekly)Object.assign(weekly,s.weekly);if(s.streak)Object.assign(streak,s.streak);
    if(story.done&&story.ch<STORY.length){story.done=false;story.base=JSON.parse(JSON.stringify(stats));story.reopen=1;}
    hinted=true;hint.style.opacity=0;offlineFrom=+s.savedAt||0;if(s.legacy)Object.assign(legacy,s.legacy);}
  const bk=binKeys();for(const k in bk)bk[k].refresh();checkouts.forEach(co=>co.refresh());updatePadVis();
}

