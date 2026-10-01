/* ---------- hub panel (rank / achievements / VIP / decor / settings) ---------- */
const hubBtnEl=document.getElementById('hubBtn'),hubEl=document.getElementById('hub'),hubBody=document.getElementById('hubBody'),hubSet=document.getElementById('hubSet'),hubStatus=document.getElementById('hubStatus');
let hubTab='rank',rankKind='earned';
function hubMsg(t){hubStatus.textContent=L(t);}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'K':String(Math.floor(v));
async function renderRank(){
  const kinds=[['weekly','📅 本周收入'],['earned','💵 累计收入'],['progress','🏪 解锁进度'],['story','📖 故事进度']];
  let h='<div class="row">'+kinds.map(([k,n])=>'<button class="sbtn'+(k===rankKind?'':' ghost')+'" data-rk="'+k+'">'+n+'</button>').join('')+'</div><div id="rankList"><p class="sub">读取中…</p></div>';
  hubBody.innerHTML=h;hubBody.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{rankKind=b.dataset.rk;renderRank();});
  const el=document.getElementById('rankList');
  if(!sb&&CFG.supabaseUrl&&CFG.supabaseAnonKey){await sbReady;}
  if(!sb){el.innerHTML='<p class="sub">排行榜需要站长配置 Supabase（看 README）。</p>';trDom(el);return;}
  await submitScore();
  try{const {data,error}=await sb.rpc('fm_top',{p_kind:rankKind});if(error)throw error;
    let mine=null;if(cloud){const r=await sb.rpc('fm_rank',{p_id:cloud.id,p_kind:rankKind});if(!r.error)mine=r.data;}
    const unit=(rankKind==='earned'||rankKind==='weekly')?v=>'💵'+fmtN(v):rankKind==='progress'?v=>v+'/'+TOTAL_STEPS:v=>(v>=STORY.length?L('通关 🎉'):TT('第'+(v+1)+'章','Ch. '+(v+1),'Bab '+(v+1)));
    setTimeout(()=>trDom(el),0);el.innerHTML=(mine?'<p class="sub">我的排名：<b>#'+mine+'</b>（'+esc(NET.nick)+'）</p>':'')+((data||[]).map(r=>'<div class="li"><div class="e">'+(r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank)+'</div><div class="t"><b>'+esc(r.nickname||'玩家')+'</b><small>…'+esc(r.tag||'')+'</small></div><div>'+unit(+r.value)+'</div></div>').join('')||'<p class="sub">还没有人上榜，快来当第一名！</p>');trDom(el);}
  catch(e){el.innerHTML='<p class="sub">排行榜暂时连不上：'+esc(e.message||'网络问题')+'</p>';trDom(el);}
}
const HUB_GROUPS={grow:['up','town','branch'],coll:['ach','book','vip']},hubLast={grow:'up',coll:'ach'};
const hubGroupOf=t=>{for(const g in HUB_GROUPS)if(HUB_GROUPS[g].includes(t))return g;return t;};
const SUB_LBL={up:TT('⬆️ 升星','⬆️ Stars','⬆️ Bintang'),town:TT('🏙️ 小镇','🏙️ Town','🏙️ Pekan'),branch:TT('🏪 分店','🏪 Branch','🏪 Cawangan'),
  ach:TT('🎖️ 挑战与成就','🎖️ Goals','🎖️ Cabaran'),book:TT('📚 图鉴','📚 Book','📚 Koleksi'),vip:TT('⭐ 常客','⭐ Regulars','⭐ Pelanggan tetap')};
function renderHub(){renderHub0();const g=hubGroupOf(hubTab);
  if(HUB_GROUPS[g]){hubLast[g]=hubTab;hubBody.insertAdjacentHTML('afterbegin','<div class="subtabs" role="tablist">'+HUB_GROUPS[g].map(t=>'<button type="button" role="tab" aria-selected="'+(t===hubTab)+'" class="'+(t===hubTab?'on':'')+'" data-sub="'+t+'">'+SUB_LBL[t]+'</button>').join('')+'</div>');
    hubBody.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{hubTab=b.dataset.sub;hubMsg('');renderHub();hubBody.scrollTop=0;});}
  trDom(hubEl);}
function renderHub0(){
  hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===hubGroupOf(hubTab)));
  hubSet.hidden=hubTab!=='set';hubBody.hidden=hubTab==='set';
  if(hubTab==='rank'){renderRank();return;}
  if(hubTab==='book'){const cl=stats.bookClaimed||(stats.bookClaimed={});
    hubBody.innerHTML=bookPages().map(p=>{const got=p.items.filter(i=>i.ok).length,all=got===p.items.length;
      return '<div class="sec" style="font-weight:900;margin:10px 0 4px">'+p.n+' '+got+'/'+p.items.length+'</div><div class="stock">'+p.items.map(i=>'<span class="chip2" style="'+(i.ok?'':'opacity:.25;filter:grayscale(1)')+'" title="'+esc(i.t||'')+'">'+i.e+(i.t?'<small style="font-size:10px;display:block">'+esc(i.t)+'</small>':'')+'</span>').join('')+'</div>'+
        '<div class="row"><button class="sbtn'+(cl[p.id]||!all?' ghost':'')+'" data-bk="'+p.id+'"'+(cl[p.id]||!all?' disabled':'')+'>'+(cl[p.id]?'已领取':all?'领取奖励 💵'+p.r:'集齐这一页奖励 💵'+p.r)+'</button></div>';}).join('');
    hubBody.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const p=bookPages().find(x=>x.id===b.dataset.bk);if(!p||cl[p.id]||NET.mode==='guest')return;cl[p.id]=1;money+=p.r;chord();toast('📚 '+L(p.n)+' +💵'+p.r);save();renderHub();});return;}
  if(hubTab==='up'){
    if(NET.mode==='guest'){hubBody.innerHTML='<p class="sub">'+TT('联机时由房主升级店铺。','The host upgrades the shop during co-op.','Semasa main bersama, hanya hos yang boleh menaik taraf kedai.')+'</p>';return;}
    const list=stations(),row=s=>{const lv=stLv[s.k]||0,mx=lv>=BAL.stMax,c=mx?0:stCost(s.k,lv),ok=!mx&&money>=c;
      const eff=s.kind==='s'?TT('售价','Price','Harga')+' +'+lv*10+'%':TT('速度','Speed','Kelajuan')+' ×'+(1/Math.pow(BAL.stSpeed,lv)).toFixed(2);
      return '<div class="li"><div class="e">'+s.e+'</div><div class="t"><b><span class="stars">★'+lv+'</span><small>/'+BAL.stMax+'</small> · '+eff+'</b><div class="bar"><i style="width:'+lv*10+'%"></i></div></div><button class="sbtn'+(ok?'':' ghost')+'" data-st="'+s.k+'"'+(ok?'':' disabled')+'>'+(mx?'✅':'💵'+fmtN(c))+'</button></div>';};
    const sec=(kind,title)=>{const it=list.filter(s=>s.kind===kind);return it.length?'<div class="sec" style="font-weight:900;margin:10px 0 2px">'+title+'</div>'+it.map(row).join(''):'';};
    hubBody.innerHTML='<p class="sub">'+TT('每颗星：货架售价 +10%，田地和机器快 11%。最多 10 星。','Each star: shelf price +10%, fields and machines 11% faster. Up to 10 stars.','Setiap bintang: harga rak +10%, ladang dan mesin 11% lebih laju. Maksimum 10 bintang.')+' <b>'+TT('本店共','This shop:','Kedai ini:')+' ★'+totalStars()+'</b></p>'+
      sec('s',TT('🗄️ 货架','🗄️ Shelves','🗄️ Rak'))+sec('p',TT('🌱 田地','🌱 Fields','🌱 Ladang'))+sec('m',TT('⚙️ 机器','⚙️ Machines','⚙️ Mesin'));
    hubBody.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>buyStation(b.dataset.st));return;}
  if(hubTab==='town'){const done=pads.every(p=>p.done);
    let h='<p class="sub">'+TT('镇长的委托：出钱建设小镇，吸引新的客人。每个项目都有永久效果（开分店后重新建设）。','The mayor\'s requests: fund town projects that bring new shoppers. Each has a lasting effect (rebuilt in each branch).','Permintaan datuk bandar: biayai projek pekan yang menarik pelanggan baharu. Setiap projek memberi kesan kekal (dibina semula di setiap cawangan).')+'</p>';
    if(!done)h+='<p class="sub"><b>🔒 '+TT('先建好店里全部设施','Finish every upgrade square in the shop first','Siapkan semua petak naik taraf di kedai dahulu')+'</b> ('+pads.filter(p=>p.done).length+'/'+pads.length+')</p>';
    h+=TOWN.map(t=>{const own=hasT(t.id),c=townCost(t),ok=done&&!own&&money>=c&&NET.mode!=='guest';
      return '<div class="li"'+(own?' style="opacity:.65"':'')+'><div class="e">'+t.e+'</div><div class="t"><b>'+t.n+'</b><small>'+t.d+'</small></div><button class="sbtn'+(ok?'':' ghost')+'" data-tw="'+t.id+'"'+(ok?'':' disabled')+'>'+(own?'✅':'💵'+fmtN(c))+'</button></div>';}).join('');
    hubBody.innerHTML=h;hubBody.querySelectorAll('[data-tw]').forEach(b=>b.onclick=()=>buildTown(b.dataset.tw));return;}
  if(hubTab==='branch'){const th=THEMES[(legacy.n||0)%THEMES.length],nx=THEMES[((legacy.n||0)+1)%THEMES.length];const ok=pads.every(p=>p.done)&&NET.mode!=='guest';
    hubBody.innerHTML='<div class="sec" style="font-weight:900;margin:6px 0">🏪 '+TT('当前：第 '+((legacy.n||0)+1)+' 号店 · ','Now: branch #'+((legacy.n||0)+1)+' · ','Kini: cawangan #'+((legacy.n||0)+1)+' · ')+th.n+'</div>'+
      '<p class="sub">'+TT('收入加成','Income bonus','Bonus pendapatan')+' +'+(legacy.n||0)*25+'%</p><p class="sub">开分店会重新开始建店（金钱、设施、货架清零），但保留成就、常客好感、装扮、图鉴和故事，并永久增加 25% 收入。</p>'+
      '<p class="sub">'+THEME_INFO[(legacy.n||0)%4]+'</p>'+
      '<div class="sec" style="font-weight:900;margin:10px 0 2px">⭐ '+TT('店长星星：','Manager stars: ','Bintang pengurus: ')+(legacy.stars||0)+'</div><p class="sub">'+TT('开分店、每周挑战和连续签到都能得到星星，用来买永久加成（开分店后也保留）。','Earn stars from branches, weekly challenges and login streaks, and spend them on permanent perks that carry over.','Dapatkan bintang daripada cawangan, cabaran mingguan dan log masuk berturut, untuk faedah kekal.')+'</p>'+
      PERKS.map(pk=>{const lv=PK(pk.k),mx=lv>=pk.max,c=lv+1,ok=!mx&&(legacy.stars||0)>=c&&NET.mode!=='guest';return '<div class="li"><div class="e">'+pk.e+'</div><div class="t"><b>'+pk.n+' <span class="stars">'+lv+'/'+pk.max+'</span></b><small>'+pk.d+'</small></div><button class="sbtn'+(ok?'':' ghost')+'" data-pk="'+pk.k+'"'+(ok?'':' disabled')+'>'+(mx?'✅':'⭐'+c)+'</button></div>';}).join('')+
      '<div class="sec" style="font-weight:900;margin:10px 0 2px">'+TT('下一家：','Next: ','Seterusnya: ')+nx.n+'</div><p class="sub">'+THEME_INFO[((legacy.n||0)+1)%4]+' '+TT('建设成本 ×','Build costs ×','Kos bina ×')+(1+BAL.branchCost*((legacy.n||0)+1)).toFixed(1)+'。'+TT('这次开店可得 ⭐','Opening now earns ⭐','Buka sekarang untuk dapat ⭐')+branchStars()+'</p><div class="row"><button class="big'+(ok?'':' ghost')+'" id="brBtn"'+(ok?'':' disabled')+'>'+(ok?'开分店！':'先建好全部设施才能开分店')+'</button></div>';
    hubBody.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>buyPerk(b.dataset.pk));
    const bb=document.getElementById('brBtn');if(bb&&ok)bb.onclick=()=>{if(bb.dataset.arm){openBranch();}else{bb.dataset.arm='1';bb.textContent=L('再点一次确认开分店');}};return;}
  if(hubTab==='ach'){const n=ACH.filter(a=>ACH_STATE[a.id]).length;
    hubBody.innerHTML=weeklyHtml()+'<p class="sub" style="margin-top:10px">已达成 '+n+'/'+ACH.length+'</p>'+ACH.map(a=>{const [x,y]=a.v();const ok=!!ACH_STATE[a.id];const v=Math.max(0,Math.min(x,y));
      return '<div class="li" style="'+(ok?'':'opacity:.75')+'"><div class="e">'+(ok?a.e:'🔒')+'</div><div class="t"><b>'+a.n+'</b><small>'+a.d+' · 奖励 💵'+a.r+'</small><div class="bar"><i style="width:'+(ok?100:v/y*100)+'%"></i></div></div><div>'+(ok?'✅':fmtN(v)+'/'+fmtN(y))+'</div></div>';}).join('');return;}
  if(hubTab==='vip'){hubBody.innerHTML='<p class="sub">常客会不定期来店里，买得多、付双倍。让他们买齐东西就能加好感，好感到 3、6、10 颗心会送你谢礼。</p>'+
    VIPS.map(v=>{const h=vipState[v.n]||0;return '<div class="li"><div class="e">⭐</div><div class="t"><b>'+v.n+'</b><small>'+(h?'❤️'.repeat(Math.min(h,10)):'还不熟')+'</small></div><div>'+h+'/10</div></div>';}).join('');return;}
  if(hubTab==='decor'){const sec=(kind,title)=>'<div class="sec" style="font-weight:900;margin:8px 0 4px">'+title+'</div>'+DECOR[kind].map((it,i)=>{const own=decor.owned[kind+':'+i],use=decor[kind]===i;
      const sw=kind==='hat'?'':'<span style="display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:middle;margin-right:6px;background:#'+(kind==='floor'?it.c:it.c[0]).toString(16).padStart(6,'0')+'"></span>';
      return '<div class="li"><div class="t"><b>'+sw+it.n+'</b></div><button class="sbtn'+(use?' ghost':'')+'" data-dk="'+kind+'" data-di="'+i+'"'+(use?' disabled':'')+'>'+(use?'使用中':own?'使用':'💵'+it.cost)+'</button></div>';}).join('');
    hubBody.innerHTML=sec('floor','🟫 地板颜色')+sec('shelf','🗄️ 货架颜色')+sec('hat','🎩 帽子');
    hubBody.querySelectorAll('[data-dk]').forEach(b=>b.onclick=()=>buyDecor(b.dataset.dk,+b.dataset.di));return;}
}
function renderSettings(){setTimeout(()=>trDom(hubSet),0);
  document.getElementById('vibBtn').textContent=GFX.vib?'📳 震动：开':'📳 震动：关';document.getElementById('joyBtn').textContent={float:'🕹️ 摇杆：跟随手指',left:'🕹️ 摇杆：固定左下',right:'🕹️ 摇杆：固定右下'}[GFX.joy||'float'];
  ['zh','en','ms'].forEach(l=>document.getElementById('lang-'+l).classList.toggle('ghost',LANG!==l));document.getElementById('musBtn').textContent=MUS.on?'🎵 音乐：开':'🎵 音乐：关';sndBtn.textContent=soundOn?'🔊 音效：开':'🔇 音效：关';
  ['high','mid','low'].forEach(q=>document.getElementById('gfx-'+q).classList.toggle('ghost',GFX.q!==q));document.getElementById('fpsBtn').textContent=GFX.fps30?'🔋 省电 30 帧：开':'🔋 省电 30 帧：关';
  document.getElementById('tapBtn').textContent=TT('👆 点地面走过去：','👆 Tap to walk: ','👆 Ketik untuk berjalan: ')+(GFX.tap?TT('开','on','hidup'):TT('关','off','mati'));
  document.getElementById('nick2').value=NET.nick;}
document.getElementById('hubBtn').onclick=()=>{hubMsg('');hubEl.hidden=false;renderSettings();renderHub();};
document.getElementById('hubClose').onclick=()=>{hubEl.hidden=true;};
hubEl.querySelectorAll('#hubTabs button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;hubTab=HUB_GROUPS[t]?hubLast[t]:t;hubMsg('');renderSettings();renderHub();});
document.getElementById('musBtn').onclick=()=>{MUS.on=!MUS.on;initAudio();saveSettings();renderSettings();};
['high','mid','low'].forEach(q=>document.getElementById('gfx-'+q).onclick=()=>{GFX.q=q;applyGfx();saveSettings();renderSettings();hubMsg(q==='low'?'已切到流畅画质（关闭阴影）':'画质已更新');});
document.getElementById('vibBtn').onclick=()=>{GFX.vib=!GFX.vib;saveSettings();renderSettings();vib(20);};
document.getElementById('joyBtn').onclick=()=>{GFX.joy={float:'left',left:'right',right:'float'}[GFX.joy||'float'];saveSettings();renderSettings();showFixedJoy();};
['zh','en','ms'].forEach(l=>document.getElementById('lang-'+l).onclick=()=>{if(l===LANG)return;try{localStorage.setItem('fm-lang',l);}catch(_){}save();resetting=true;location.reload();});
document.getElementById('fpsBtn').onclick=()=>{GFX.fps30=!GFX.fps30;saveSettings();renderSettings();};
document.getElementById('tapBtn').onclick=()=>{GFX.tap=!GFX.tap;tapPath.length=0;saveSettings();renderSettings();};
document.getElementById('nick2').addEventListener('input',e=>{NET.nick=cleanName(e.target.value);nickEl.value=NET.nick;try{localStorage.setItem('fm-nick',NET.nick);}catch(_){}});
if(NET.mode==='guest'){try{const h=+localStorage.getItem('fm-hat');if(h>0&&DECOR.hat[h])decor.hat=h;}catch(_){}}
applyDecor();applyHat();applyTheme();trDom(document.body);showFixedJoy();

