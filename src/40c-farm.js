/* ---------- 🌱 my farm: real-time crops, care, levels, and visiting friends (Happy-Farm-style) ----------
   Crops grow on the real clock (they keep growing while the game is closed). Each crop may get thirsty,
   weedy or buggy partway through; each problem left unfixed at harvest cuts the yield. Harvesting a crop
   the shop also sells refills that field in the shop ("farm fresh"). With cloud save on, friends can visit,
   help (water / weed / catch bugs) for a small reward, or take a little from ripe crops (server-limited). */
const SEEDS=[{k:'tomato',e:'🍅',min:3,val:40,lv:1},{k:'carrot',e:'🥕',min:10,val:110,lv:1},{k:'corn',e:'🌽',min:30,val:280,lv:2},
 {k:'strawberry',e:'🍓',min:60,val:520,lv:3},{k:'pumpkin',e:'🎃',min:240,val:1700,lv:4},{k:'watermelon',e:'🍉',min:480,val:3000,lv:6}];
const NEED_E={water:'💧',weed:'🌿',bug:'🐛'},FARM_MAX=12;
const fSave=()=>{const f=stats.farm||(stats.farm={lvl:1,xp:0,plots:[],guard:false,friends:[],log:[],since:null});while(f.plots.length<FARM_MAX)f.plots.push(null);return f;};
const fPlots=()=>Math.min(FARM_MAX,3+fSave().lvl);
const fNeedXp=l=>Math.round(60*Math.pow(l,1.6));
const seedOf=k=>SEEDS.find(s=>s.k===k);
const fProg=(p,now)=>Math.min(1,(now-p.at)/p.dur);
const fNeed=(p,now)=>{const g=fProg(p,now);if(g>=1)return null;return (p.nd||[]).find(n=>!n.ok&&g>=n.thr)||null;};
function fStatus(){const f=fSave(),now=Date.now();let ripe=0,care=0;for(let i=0;i<fPlots();i++){const p=f.plots[i];if(!p)continue;if(fProg(p,now)>=1)ripe++;else if(fNeed(p,now))care++;}return {ripe,care};}
const FM={view:null,sheet:null,pubT:0,markT:0,msg:'',msgT:0};
function fMsg(t){FM.msg=t;FM.msgT=2.2;}
function fPlant(i,k){const f=fSave(),sd=seedOf(k),cost=Math.round(sd.val*0.25*rewardMul());if(money<cost){fMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}
  money-=cost;const r=Math.random,nd=[{k:'water',thr:0.3+r()*0.1,ok:false}];if(r()<0.55)nd.push({k:'weed',thr:0.5+r()*0.1,ok:false});if(r()<0.4)nd.push({k:'bug',thr:0.7+r()*0.1,ok:false});
  f.plots[i]={s:k,at:Date.now(),dur:sd.min*60000,nd,stolen:0};FM.sheet=null;fDirty();blip(520,0.05);fRenderUI();}
function fHarvest(i,quiet){const f=fSave(),p=f.plots[i],sd=seedOf(p.s),now=Date.now();const miss=(p.nd||[]).filter(n=>!n.ok).length,st=Math.min(2,p.stolen||0);
  const mult=Math.max(0.35,1-0.2*miss-0.12*st),cash=Math.round(sd.val*mult*rewardMul());money+=cash;f.xp+=Math.round(sd.min*1.5+5);f.plots[i]=null;
  let lvUp=false;while(f.xp>=fNeedXp(f.lvl)){f.xp-=fNeedXp(f.lvl);f.lvl++;lvUp=true;}
  const pr=producers[sd.k];if(pr&&pr.unlocked&&NET.mode!=='guest'){pr.count=pr.max;pr.refresh();}
  stats.harvests=(stats.harvests||0)+1;if(!quiet)fMsg(sd.e+' +💵'+fmtN(cash)+(miss?'  ('+TT('没照顾好','missed care','kurang dijaga')+' -'+Math.round(miss*20)+'%)':''));
  if(lvUp){toast('🌱 '+TT('农场升到 '+f.lvl+' 级！','Farm level '+f.lvl+'!','Ladang tahap '+f.lvl+'!'),2400);chord();}fDirty();return cash;}
function fFix(i){const p=fSave().plots[i],n=fNeed(p,Date.now());if(!n)return;n.ok=true;blip(760,0.05,'sine',0.05);fDirty();}
function fDirty(){FM.pubT=Math.min(FM.pubT||5,5);save();}
/* cloud: publish my farm, pull what visitors did */
function fPublic(){const f=fSave();return {l:f.lvl,g:!!f.guard,p:f.plots.slice(0,fPlots()).map(p=>p?{s:p.s,at:p.at,dur:p.dur,n:Object.fromEntries((p.nd||[]).filter(n=>!n.ok).map(n=>[n.k,+n.thr.toFixed(3)]))}:null)};}
async function fPublish(){if(!sb||!cloud)return;try{await rpc('fm_farm_put',{p_id:cloud.id,p_secret:cloud.secret,p_name:NET.nick,p_farm:fPublic()});}catch(_){}}
async function fPullMarks(){if(!sb||!cloud)return;const f=fSave();try{const rows=await rpc('fm_farm_marks',{p_id:cloud.id,p_secret:cloud.secret,p_since:f.since});
  for(const r of rows||[]){const p=f.plots[r.plot];f.since=r.at;if(!p||+p.at!==+r.planted_at)continue;const who=r.by_name||'?';
    if(r.kind==='steal'){p.stolen=(p.stolen||0)+1;f.log.unshift('🥷 '+who+' '+TT('拿走了一点','took a little','ambil sedikit')+' '+seedOf(p.s).e);}
    else{const n=(p.nd||[]).find(x=>x.k===r.kind);if(n)n.ok=true;f.log.unshift('🤝 '+who+' '+TT('帮你','helped with','bantu')+' '+NEED_E[r.kind]);}}
  f.log=f.log.slice(0,12);if((rows||[]).length){save();fRenderUI();}}catch(_){}}
function farmTick(dt){if(!sb||!cloud||NET.mode==='guest')return;if(FM.pubT>0){FM.pubT-=dt;if(FM.pubT<=0)fPublish();}FM.markT-=dt;if(FM.markT<=0){FM.markT=MINI.on==='f'?30:180;fPullMarks();}}
async function fVisit(id){if(!sb){fMsg(TT('需要先配置云存档','Cloud save needs to be set up first','Simpanan awan perlu disediakan dahulu'));return;}
  try{const rows=await rpc('fm_farm_get',{p_target:id});const r=Array.isArray(rows)?rows[0]:rows;if(!r){fMsg(TT('找不到这个农场','Farm not found','Ladang tidak dijumpai'));return;}
    FM.view={id,name:r.nickname||id,farm:r.farm||{p:[]}};FM.sheet=null;const f=fSave();if(!f.friends.includes(id)&&id!==(cloud&&cloud.id)){f.friends.unshift(id);f.friends=f.friends.slice(0,20);save();}fRenderUI();}
  catch(e){fMsg(e.message||'network');}}
async function fAct(i,kind,p){if(!cloud){fMsg(TT('需要先有玩家ID','You need a player ID first','Anda perlukan ID pemain dahulu'));return;}
  try{const r=await rpc('fm_farm_act',{p_id:cloud.id,p_secret:cloud.secret,p_name:NET.nick,p_target:FM.view.id,p_plot:i,p_planted:p.at,p_kind:kind});const sd=seedOf(p.s);
    const M={ok:null,limit:TT('今天的次数用完了','Daily limit reached','Had harian dicapai'),done:TT('你已经帮过/拿过这块地了','You already did that here','Anda sudah melakukannya di sini'),empty:TT('被拿光了，或者有稻草人守着','Nothing left, or a scarecrow is guarding it','Sudah habis, atau dijaga orang-orang'),notripe:TT('还没熟','Not ripe yet','Belum masak'),noneed:TT('现在不需要帮忙','No help needed right now','Tiada bantuan diperlukan'),gone:TT('这块地已经变了','That plot changed','Petak itu sudah berubah')};
    if(r==='ok'){if(kind==='steal'){const c=Math.round(sd.val*0.15*rewardMul());money+=c;fMsg('🥷 '+sd.e+' +💵'+fmtN(c));delete p.s;}else{const c=Math.round(25*rewardMul());money+=c;fSave().xp+=3;fMsg('🤝 '+NEED_E[kind]+' +💵'+fmtN(c));delete p.n[kind];}save();}
    else fMsg(M[r]||r);}catch(e){fMsg(e.message||'network');}}
/* layout: 3 columns x 4 rows of plots */
const FL={x0:18,y0:150,w:112,h:92,gx:10,gy:12};
const fRect=i=>[FL.x0+(i%3)*(FL.w+FL.gx),FL.y0+Math.floor(i/3)*(FL.h+FL.gy),FL.w,FL.h];
function fTap(x,y){initAudio();if(FM.sheet)return;const now=Date.now();
  for(let i=0;i<FARM_MAX;i++){if(!inR(x,y,fRect(i)))continue;
    if(FM.view){const p=(FM.view.farm.p||[])[i];if(!p||!p.s)return;const g=Math.min(1,(now-p.at)/p.dur);if(g>=1){fAct(i,'steal',p);return;}
      const nk=Object.keys(p.n||{}).find(k=>g>=p.n[k]);if(nk)fAct(i,nk,p);else fMsg(TT('长得很好，不需要帮忙','Growing fine, no help needed','Tumbuh dengan baik, tiada bantuan diperlukan'));return;}
    if(i>=fPlots()){fMsg(TT('农场升级后解锁','Unlocks at a higher farm level','Dibuka pada tahap ladang lebih tinggi'));return;}
    const p=fSave().plots[i];if(!p){FM.sheet={i};fRenderUI();return;}
    if(fProg(p,now)>=1){fHarvest(i);return;}if(fNeed(p,now)){fFix(i);return;}
    const left=Math.ceil((p.dur-(now-p.at))/60000);fMsg(seedOf(p.s).e+' '+TT('还要 '+fmtDur(left),fmtDur(left)+' to go',fmtDur(left)+' lagi'));return;}}
const fmtDur=m=>m>=60?Math.floor(m/60)+TT(' 小时',' h',' jam')+(m%60?' '+(m%60)+TT(' 分',' m',' min'):''):m+TT(' 分钟',' min',' min');
function fRenderUI(){const f=fSave(),v=FM.view;let h='<button class="mclose" id="fX" aria-label="'+TT('关闭','Close','Tutup')+'">✕</button><div class="fbar">';
  if(v)h+='<button class="big" id="fHome">🏡 '+TT('回我的农场','Back to my farm','Kembali ke ladang saya')+'</button>';
  else h+='<button class="big" id="fAll">🧺 '+TT('全部收获','Harvest all','Tuai semua')+'</button><button class="big alt" id="fCare">💧 '+TT('全部照顾','Tend all','Jaga semua')+'</button><button class="big ghost" id="fFriends">👥</button>'+
    (f.guard?'':'<button class="big ghost" id="fGuard" title="'+TT('稻草人','Scarecrow','Orang-orang')+'">🧿</button>');
  h+='</div>';
  if(FM.sheet&&!v){h+='<div class="msheet fs"><div class="mhead"><b>'+TT('选种子','Pick a seed','Pilih benih')+'</b><button class="mclose2" id="fSx">✕</button></div>'+SEEDS.map(sd=>{const ok=f.lvl>=sd.lv,c=Math.round(sd.val*0.25*rewardMul());
    return '<div class="li"><div class="e">'+sd.e+'</div><div class="t"><b>'+fmtDur(sd.min)+' · +💵'+fmtN(Math.round(sd.val*rewardMul()))+'</b><small>'+(ok?TT('种子','Seed','Benih')+' 💵'+fmtN(c):'🔒 '+TT('农场 '+sd.lv+' 级','Farm level '+sd.lv,'Ladang tahap '+sd.lv))+'</small></div><button class="sbtn'+(ok&&money>=c?'':' ghost')+'" data-sd="'+sd.k+'"'+(ok&&money>=c?'':' disabled')+'>'+TT('种','Plant','Tanam')+'</button></div>';}).join('')+'</div>';}
  if(FM.sheet==='friends'){h+='<div class="msheet fs"><div class="mhead"><b>👥 '+TT('拜访朋友的农场','Visit friends\' farms','Lawat ladang kawan')+'</b><button class="mclose2" id="fSx">✕</button></div>';
    if(!sb||!cloud)h+='<p class="sub">'+TT('拜访朋友需要云存档（点 👤 查看玩家ID）。','Visiting friends needs cloud save (see 👤 for your player ID).','Untuk melawat kawan, simpanan awan diperlukan (lihat 👤 untuk ID pemain anda).')+'</p>';
    else{h+='<p class="sub">'+TT('你的农场ID：','Your farm ID: ','ID ladang anda: ')+'<b>'+cloud.id+'</b>。'+TT('帮忙浇水除虫有奖励；熟了的菜每块最多被拿 2 次（有稻草人只能 1 次），每天有次数上限。','Helping earns a reward. Each ripe crop can be taken from at most twice (once with a scarecrow), with a daily limit.','Membantu memberi ganjaran. Setiap tanaman masak boleh diambil paling banyak dua kali (sekali jika dijaga orang-orang), dengan had harian.')+'</p>'+
      '<div class="row"><input id="fId" placeholder="FM-XXXXXX" autocomplete="off"><button class="sbtn" id="fGo">'+TT('拜访','Visit','Lawat')+'</button></div>'+
      f.friends.map(id=>'<div class="li"><div class="e">🧑‍🌾</div><div class="t"><b>'+esc(id)+'</b></div><button class="sbtn" data-fv="'+esc(id)+'">'+TT('拜访','Visit','Lawat')+'</button></div>').join('')+
      '<div class="sec" style="font-weight:900;margin:10px 0 4px">'+TT('🏘️ 附近的农场','🏘️ Nearby farms','🏘️ Ladang berdekatan')+'</div><div id="fNear"><p class="sub">…</p></div>';}
    h+=(f.log.length?'<div class="sec" style="font-weight:900;margin:10px 0 4px">'+TT('📜 农场日记','📜 Farm log','📜 Log ladang')+'</div>'+f.log.map(l=>'<p class="sub" style="margin:2px 0">'+esc(l)+'</p>').join(''):'')+'</div>';}
  MINI.ui.innerHTML=h;const q=id=>document.getElementById(id);
  q('fX').onclick=()=>{FM.view=null;FM.sheet=null;miniClose();};
  if(q('fHome'))q('fHome').onclick=()=>{FM.view=null;fRenderUI();};
  if(q('fAll'))q('fAll').onclick=()=>{let n=0,c=0;const now=Date.now();for(let i=0;i<fPlots();i++){const p=f.plots[i];if(p&&fProg(p,now)>=1){c+=fHarvest(i,true);n++;}}fMsg(n?'🧺 ×'+n+' +💵'+fmtN(c):TT('还没有熟的','Nothing is ripe yet','Belum ada yang masak'));if(n)chord();};
  if(q('fCare'))q('fCare').onclick=()=>{let n=0;const now=Date.now();for(let i=0;i<fPlots();i++){const p=f.plots[i];if(p&&fNeed(p,now)){fFix(i);n++;}}fMsg(n?'💧🌿🐛 ×'+n:TT('大家都很好','Everything is fine','Semua baik'));};
  if(q('fFriends'))q('fFriends').onclick=()=>{FM.sheet='friends';fRenderUI();if(sb&&cloud)rpc('fm_farm_random',{p_id:cloud.id}).then(rows=>{const el=q('fNear');if(!el)return;el.innerHTML=(rows||[]).map(r=>'<div class="li"><div class="e">🏡</div><div class="t"><b>'+esc(r.nickname||r.player_id)+'</b><small>'+esc(r.player_id)+'</small></div><button class="sbtn" data-fv="'+esc(r.player_id)+'">'+TT('拜访','Visit','Lawat')+'</button></div>').join('')||'<p class="sub">'+TT('附近还没有别的农场','No other farms yet','Belum ada ladang lain')+'</p>';el.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>fVisit(b.dataset.fv));}).catch(()=>{});};
  if(q('fGuard'))q('fGuard').onclick=()=>{const c=Math.round(5000*rewardMul()/100)*100;if(q('fGuard').dataset.arm){if(money<c){fMsg(TT('钱不够','Not enough money','Wang tidak cukup'));return;}money-=c;f.guard=true;fDirty();chord();fRenderUI();}else{q('fGuard').dataset.arm=1;q('fGuard').textContent='🧿 💵'+fmtN(c)+'?';}};
  if(q('fSx'))q('fSx').onclick=()=>{FM.sheet=null;fRenderUI();};
  if(q('fGo'))q('fGo').onclick=()=>{const id=norm(q('fId').value).replace(/^FM(?!-)/,'FM-');if(id)fVisit(id);};
  MINI.ui.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>fPlant(FM.sheet.i,b.dataset.sd));
  MINI.ui.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>fVisit(b.dataset.fv));
  trDom(MINI.ui);}
function openFarm(){if(!miniOpen('f'))return;FM.view=null;FM.sheet=null;FM.markT=0;fRenderUI();}
function fFrame(dt,c){if(FM.msgT>0)FM.msgT-=dt;farmTick(dt);const now=Date.now(),f=fSave(),v=FM.view;
  c.fillStyle='#bfe6a8';c.fillRect(0,0,MINI.cv.width,MINI.cv.height);miniXf(c);
  const sky=c.createLinearGradient(0,0,0,120);sky.addColorStop(0,'#a8dcf5');sky.addColorStop(1,'#dff3d0');c.fillStyle=sky;c.fillRect(-400,0,1200,120);
  c.fillStyle='#8fd96b';c.fillRect(-400,110,1200,700);c.fillStyle='#fff';for(let i=0;i<3;i++){c.beginPath();c.ellipse(60+i*140+Math.sin(now/4000+i)*8,40+i*8,26,10,0,0,7);c.fill();}
  rrect(c,8,6,330,58,20);c.fillStyle='#fffefa';c.fill();
  if(v){mText(c,'🏡 '+v.name,20,26,16,'#173a2b',900,'left');mText(c,TT('帮忙：点有 💧🌿🐛 的地 · 熟了可以拿一点','Help: tap 💧🌿🐛 · ripe crops: take a little','Bantu: ketik 💧🌿🐛 · tanaman masak: ambil sedikit'),20,48,11,'#5b6b62',700,'left');}
  else{mText(c,'🌱 '+TT('我的农场','My farm','Ladang saya')+'  Lv '+f.lvl,20,26,16,'#173a2b',900,'left');const need=fNeedXp(f.lvl);rrect(c,20,42,200,9,5);c.fillStyle='rgba(23,58,43,.12)';c.fill();rrect(c,20,42,Math.max(9,200*f.xp/need),9,5);c.fillStyle='#1e8c55';c.fill();
    mText(c,f.xp+'/'+need,228,47,11,'#5b6b62',700,'left');if(f.guard)mEmoji(c,'🧿',318,34,22);mText(c,'💵'+fmtN(Math.floor(money)),20,86,14,'#173a2b',800,'left');}
  const plots=v?(v.farm.p||[]):f.plots,open=v?(v.farm.p||[]).length:fPlots();
  for(let i=0;i<FARM_MAX;i++){const r=fRect(i);rrect(c,r[0],r[1],r[2],r[3],16);
    if(i>=open){c.fillStyle='rgba(120,100,80,.25)';c.fill();if(!v)mText(c,'🔒 Lv '+(i-2),r[0]+r[2]/2,r[1]+r[3]/2,12,'rgba(60,50,40,.6)',800);continue;}
    c.fillStyle='#9a6a43';c.fill();c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(r[0]+10,r[1]+k*r[3]/4);c.lineTo(r[0]+r[2]-10,r[1]+k*r[3]/4);c.stroke();}
    const p=plots[i],cx=r[0]+r[2]/2,cy=r[1]+r[3]/2;if(!p||!p.s){if(!v)mText(c,'+',cx,cy,26,'rgba(255,255,255,.55)');continue;}
    const sd=seedOf(p.s),g=Math.min(1,(now-p.at)/p.dur);
    if(g>=1){mEmoji(c,sd.e,cx,cy-2,40+Math.sin(now/300+i)*2);mEmoji(c,'✨',cx+32,cy-26,16);const st=v?0:(p.stolen||0);if(st)mText(c,'-'+st,r[0]+14,r[1]+14,12,'#fff',900);}
    else{mEmoji(c,g<0.34?'🌱':g<0.67?'🌿':sd.e,cx,cy-4,g<0.67?30:24);rrect(c,r[0]+12,r[1]+r[3]-14,r[2]-24,6,3);c.fillStyle='rgba(0,0,0,.2)';c.fill();rrect(c,r[0]+12,r[1]+r[3]-14,Math.max(6,(r[2]-24)*g),6,3);c.fillStyle='#ffe07a';c.fill();
      const nk=v?Object.keys(p.n||{}).find(k=>g>=p.n[k]):(fNeed(p,now)||{}).k;if(nk){const b=1+Math.sin(now/180)*0.08;c.fillStyle='#fff';c.beginPath();c.arc(r[0]+r[2]-18,r[1]+18,15*b,0,7);c.fill();mEmoji(c,NEED_E[nk],r[0]+r[2]-18,r[1]+18,17);}}}
  if(FM.msgT>0){c.globalAlpha=Math.min(1,FM.msgT*2);rrect(c,30,580,340,38,19);c.fillStyle='#173a2b';c.fill();mText(c,FM.msg,200,599,13,'#fff',700);c.globalAlpha=1;}}
