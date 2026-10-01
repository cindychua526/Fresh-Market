/* ---------- cloud save: player ID + recovery code (no email) ---------- */
let cloud=null,cloudT=null,cloudBusy=false,lastCloudAt=0,showCode=false;
try{cloud=JSON.parse(localStorage.getItem('fm-cloud')||'null');}catch(_){}
const acEl=document.getElementById('ac'),acBody=document.getElementById('acBody'),acStatus=document.getElementById('acStatus');
function acMsg(t){acStatus.textContent=L(t);}
const CODE_ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode(){const a=new Uint32Array(10);crypto.getRandomValues(a);return [...a].map(v=>CODE_ABC[v%CODE_ABC.length]).join('');}
const norm=t=>String(t||'').toUpperCase().replace(/[\s-]/g,'');
const fmtCode=c=>c&&c.length===10&&[...c].every(ch=>CODE_ABC.includes(ch))?c.slice(0,4)+'-'+c.slice(4,8)+'-'+c.slice(8):c;
function storeCloud(c){cloud=c;try{localStorage.setItem('fm-cloud',JSON.stringify(c));}catch(_){}}
function cloudSoon(){if(!sb||!cloud||NET.mode==='guest'||cloudT)return;const wait=Math.max(0,20000-(Date.now()-lastCloudAt));cloudT=setTimeout(()=>{cloudT=null;cloudPush(false);},wait);}
async function rpc(fn,args){const {data,error}=await sb.rpc(fn,args);if(error)throw error;return data;}
async function cloudRegister(){const code=newCode();const id=await rpc('fm_register',{p_secret:code});storeCloud({id,secret:code});return cloud;}
async function cloudPush(manual){
  if(!sb||!cloud||cloudBusy||NET.mode==='guest')return false;if(cloudPending&&!manual)return false;cloudBusy=true;if(manual)cloudPending=null;
  try{await rpc('fm_save',{p_id:cloud.id,p_secret:cloud.secret,p_data:saveObj(),p_progress:progressNow()});lastCloudAt=Date.now();if(manual)toast('☁️ 已备份到云端');const te=document.getElementById('acTime');if(te)te.textContent=new Date(lastCloudAt).toLocaleString();return true;}
  catch(e){if(manual)toast('☁️ 备份失败：'+(e.message||'网络问题'));return false;}finally{cloudBusy=false;}
}
async function cloudLoad(id,secret){const rows=await rpc('fm_load',{p_id:id,p_secret:secret});return Array.isArray(rows)?rows[0]:rows;}
function cloudRestore(row){if(!row||!row.data)return;try{localStorage.setItem(KEY,JSON.stringify(row.data));JOIN.del();}catch(_){}resetting=true;toast('☁️ 正在恢复进度…');setTimeout(()=>location.reload(),500);}
async function cloudStart(){
  if(!sb||NET.mode==='guest')return;
  try{
    if(!cloud){await cloudRegister();await cloudPush(false);toast('☁️ 已为你创建玩家ID，点 👤 查看',2600);if(!acEl.hidden)renderAccount();return;}
    const row=await cloudLoad(cloud.id,cloud.secret);
    /* progress score counts branches first (a new branch resets the upgrade count), then upgrades;
       if the cloud copy is ahead, or is newer and different, ask instead of overwriting either one */
    const score=o=>(((o&&o.legacy&&o.legacy.n)||0)*1000)+((o&&o.pads)||[]).reduce((a,p)=>a+(p.lvl||0),0);
    const cd=row&&row.data,loc=saveObj(),cs=cd?score(cd):(row&&row.progress)||0,ls=score(loc);
    const cNewer=cd&&(cd.savedAt||0)>(offlineFrom||0)+60000;
    if(row&&(cs>ls||(cNewer&&cs!==ls))){const when=t=>t?new Date(t).toLocaleString():'?';cloudPending=row;showAccount();
      acMsg(TT('云端和本机的进度不一样。云端：','Cloud and this device differ. Cloud: ','Kemajuan di awan dan di peranti ini berbeza. Awan: ')+TT('第 '+(((cd&&cd.legacy&&cd.legacy.n)||0)+1)+' 家店','shop #'+(((cd&&cd.legacy&&cd.legacy.n)||0)+1),'kedai #'+(((cd&&cd.legacy&&cd.legacy.n)||0)+1))+' · '+(row.progress||0)+'/'+TOTAL_STEPS+' · '+when(cd&&cd.savedAt)+
        TT('；本机：','; this device: ','; peranti ini: ')+TT('第 '+((legacy.n||0)+1)+' 家店','shop #'+((legacy.n||0)+1),'kedai #'+((legacy.n||0)+1))+' · '+progressNow()+'/'+TOTAL_STEPS+' · '+when(offlineFrom)+'。'+
        TT('点「⬇ 用云端进度」找回，或点「⬆ 立即备份」保留本机（会覆盖云端）。','Tap "⬇ Use cloud save" to restore it, or "⬆ Back up now" to keep this device (overwrites the cloud).','Tekan "⬇ Guna kemajuan awan" untuk pulihkan, atau "⬆ Sandarkan sekarang" untuk kekalkan peranti ini (menimpa awan).'));renderAccount();}
    else await cloudPush(false);
  }catch(e){acMsg('云存档暂时连不上：'+(e.message||'网络问题'));}
}
let cloudPending=null;
document.getElementById('acCheck').onclick=serverCheck;
async function serverCheck(){const out=document.getElementById('acCheckOut');if(!out)return;
  if(!sb){out.textContent=TT('还没有配置 Supabase（config.js），只能单机玩。','Supabase is not configured (config.js); the game runs offline only.','Supabase belum disediakan (config.js); permainan hanya luar talian.');return;}
  out.textContent='…';const tests=[['fm_load',{p_id:'FM-CHECK',p_secret:'x'}],['fm_top',{p_kind:'earned',p_limit:1}],['fm_farm_get',{p_target:'FM-CHECK'}],['fm_farm_random',{p_id:'FM-CHECK'}],['fm_farm_act',{p_id:'FM-CHECK',p_secret:'x',p_name:'x',p_target:'FM-X',p_plot:0,p_planted:0,p_kind:'water'}]];
  const res=[];for(const [fn,args] of tests){try{await sb.rpc(fn,args).then(r=>{if(r.error)throw r.error;});res.push('✅ '+fn);}
    catch(e){const m=String((e&&(e.message||e.details||e.code))||e||'');
      const missing=e&&(e.code==='PGRST202'||e.code==='42883'||/could not find the function|does not exist/i.test(m));
      const offline=!missing&&(!e||!e.code||/fetch|network|load failed|timeout/i.test(m));        // no database reply at all
      res.push((missing?'❌ ':offline?'⚠️ ':'✅ ')+fn+(missing?' — '+TT('缺少','missing','tiada'):offline?' — '+TT('连不上','no reply','tiada jawapan'):''));}}
  const bad=res.some(r=>r.startsWith('❌')),off=res.some(r=>r.startsWith('⚠️'));
  out.textContent=res.join('\n')+'\n'+(bad?TT('请在 Supabase 的 SQL Editor 里重新运行 supabase/schema.sql','Re-run supabase/schema.sql in the Supabase SQL Editor','Jalankan semula supabase/schema.sql dalam SQL Editor Supabase')
    :off?TT('连不上服务器：检查网络，以及 config.js 里的网址和 key','Cannot reach the server: check the network and the URL / key in config.js','Tidak dapat menghubungi pelayan: semak rangkaian serta URL / kunci dalam config.js')
    :TT('服务器设置完整 ✔','Server setup is complete ✔','Persediaan pelayan lengkap ✔'));}
function renderAccount(){
  if(!acBody)return;
  if(!sb&&CFG.supabaseUrl&&CFG.supabaseAnonKey){acBody.innerHTML='<p class="sub">'+L('连接云存档中…')+'</p>';sbReady.then(()=>{if(!acEl.hidden)renderAccount();});return;}
  if(!sb){acBody.innerHTML='<p class="sub">云存档还没配置。站长请按 README 在 <b>config.js</b> 填好 Supabase 地址和 anon key。</p>'+exportHtml();bindExport();trDom(acBody);return;}
  const t=lastCloudAt?new Date(lastCloudAt).toLocaleString():'还没有';
  let h='';
  if(cloud){h+='<p class="sub" style="margin-bottom:2px">你的玩家ID</p><div class="row"><div class="code" style="font-size:24px;letter-spacing:2px;flex:1;margin:0">'+cloud.id+'</div></div>'+
    '<p class="sub" style="margin:6px 0 2px">恢复码（像密码一样保管）</p><div class="row"><div class="code" style="font-size:20px;letter-spacing:1px;flex:1;margin:0">'+(showCode?fmtCode(cloud.secret):'••••-••••-••')+'</div>'+
    '<button class="big ghost" id="acShow" style="flex:0 0 auto">'+(showCode?'隐藏':'显示')+'</button><button class="big ghost" id="acCopy" style="flex:0 0 auto">复制</button></div>'+
    '<p class="sub">📸 请截图或抄下ID和恢复码。换手机、清缓存、误删游戏后，用它们就能找回进度，不需要邮箱。<br>最近一次云备份：<span id="acTime">'+t+'</span></p>'+
    '<div class="row"><button class="big" id="acUp">⬆ 立即备份</button>'+(cloudPending?'<button class="big alt" id="acUse">⬇ 用云端进度</button>':'')+'</div>'+
    '<details style="margin:6px 0"><summary style="cursor:pointer;font-weight:800">🔑 改成自己好记的密码</summary><div class="row"><input id="acNew" placeholder="至少 6 位（不分大小写）" autocomplete="new-password"><button class="big" id="acSet" style="flex:0 0 auto">保存</button></div></details>';}
  h+='<details style="margin:6px 0"'+(cloud?'':' open')+'><summary style="cursor:pointer;font-weight:800">📲 用ID找回进度</summary>'+
    '<div class="row"><input id="acId" placeholder="玩家ID，例如 FM-3A9F2C" autocomplete="username"></div>'+
    '<div class="row"><input id="acCode" placeholder="恢复码或密码" autocomplete="current-password"><button class="big alt" id="acFind" style="flex:0 0 auto">找回</button></div></details>';
  h+=exportHtml()+(cloud?'<details style="margin:6px 0" id="acHist"><summary style="cursor:pointer;font-weight:800">🕘 云端历史版本</summary><div id="acHistList"><p class="sub">…</p></div></details>':'');
  acBody.innerHTML=h;bindExport();const hd=document.getElementById('acHist');if(hd)hd.addEventListener('toggle',()=>{if(hd.open)loadHistory();});setTimeout(()=>trDom(acBody),0);
  const q=id=>document.getElementById(id);
  if(q('acShow'))q('acShow').onclick=()=>{showCode=!showCode;renderAccount();};
  if(q('acCopy'))q('acCopy').onclick=async()=>{const txt='小镇鲜市 玩家ID：'+cloud.id+'  恢复码：'+fmtCode(cloud.secret);try{await navigator.clipboard.writeText(txt);acMsg('已复制，贴到备忘录里保存吧');}catch(_){showCode=true;renderAccount();acMsg('复制不了，请手动抄下来');}};
  if(q('acUp'))q('acUp').onclick=()=>cloudPush(true);
  if(q('acUse'))q('acUse').onclick=()=>cloudRestore(cloudPending);
  if(q('acSet'))q('acSet').onclick=async()=>{const nw=norm(q('acNew').value);if(nw.length<6){acMsg('密码至少 6 位');return;}
    try{await rpc('fm_set_secret',{p_id:cloud.id,p_secret:cloud.secret,p_new:nw});storeCloud({id:cloud.id,secret:nw});acMsg('✅ 密码已更新，以后用ID＋这个密码找回');renderAccount();}catch(e){acMsg('修改失败：'+(e.message||''));}};
  q('acFind').onclick=async()=>{const id=norm(q('acId').value).replace(/^FM(?!-)/,'FM-'),sec=norm(q('acCode').value);if(!id||!sec){acMsg('请填玩家ID和恢复码');return;}
    acMsg('查找中…');try{const row=await cloudLoad(id,sec);if(!row){acMsg('ID或恢复码不对');return;}
      const b=q('acFind');if(b.dataset.arm){storeCloud({id,secret:sec});cloudRestore(row);}else{b.dataset.arm='1';b.textContent='确认找回';acMsg('找到了：进度 '+row.progress+'/'+TOTAL_STEPS+'（'+new Date(row.updated_at).toLocaleString()+'）。再点一次会用它替换本机进度。');}}
    catch(e){acMsg(/invalid|wrong|denied/i.test(e.message||'')?'ID或恢复码不对':'找回失败：'+(e.message||'网络问题'));}};
}
function exportHtml(){return '<details style="margin:6px 0"><summary style="cursor:pointer;font-weight:800">📤 导出存档码 / 📥 导入存档码</summary>'+
  '<div class="row"><button class="big ghost" id="exBtn">📤 导出存档码</button></div><div class="row"><textarea id="exBox" rows="3" style="flex:1;border-radius:12px;border:2px solid rgba(0,0,0,.12);padding:8px;font:12px monospace;background:transparent;color:inherit" placeholder="把存档码粘贴到这里"></textarea></div>'+
  '<div class="row"><button class="big alt" id="imBtn">📥 导入存档码</button></div></details>';}
function bindExport(){const ex=document.getElementById('exBtn');if(!ex)return;
  ex.onclick=async()=>{const code='FM1:'+btoa(unescape(encodeURIComponent(JSON.stringify(saveObj()))));document.getElementById('exBox').value=code;try{await navigator.clipboard.writeText(code);acMsg('存档码已复制，贴到备忘录里保存吧');}catch(_){acMsg('复制不了，请手动抄下来');}};
  const im=document.getElementById('imBtn');im.onclick=()=>{const v=document.getElementById('exBox').value.trim();let o=null;try{if(v.startsWith('FM1:'))o=JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))));}catch(_){}
    if(!o||typeof o!=='object'||!Array.isArray(o.pads)){acMsg('存档码不对');return;}if(!im.dataset.arm){im.dataset.arm='1';im.textContent=L('再点一次确认导入（会替换本机进度）');return;}
    try{localStorage.setItem(KEY,JSON.stringify(o));}catch(_){}resetting=true;location.reload();};}
async function loadHistory(){const el=document.getElementById('acHistList');if(!el||!cloud)return;
  try{const rows=await rpc('fm_history',{p_id:cloud.id,p_secret:cloud.secret});
    if(!rows||!rows.length){el.innerHTML='<p class="sub">'+L('还没有历史版本（每 10 分钟保存一份，保留最近 3 份）')+'</p>';return;}
    el.innerHTML=rows.map((r,i)=>'<div class="li"><div class="t"><b>'+new Date(r.saved_at).toLocaleString()+'</b><small>🏪 '+r.progress+'/'+TOTAL_STEPS+'</small></div><button class="sbtn" data-h="'+esc(r.saved_at)+'">'+L('恢复这个版本')+'</button></div>').join('');
    el.querySelectorAll('[data-h]').forEach(b=>b.onclick=async()=>{if(!b.dataset.arm){b.dataset.arm='1';b.textContent=L('确认找回');return;}try{const d=await rpc('fm_history_load',{p_id:cloud.id,p_secret:cloud.secret,p_at:b.dataset.h});cloudRestore({data:d});}catch(e){acMsg('找回失败：'+(e.message||''));}});}
  catch(e){el.innerHTML='<p class="sub">'+esc(e.message||'')+'</p>';}}
async function cloudPushObj(o){if(!sb||!cloud)return;try{await rpc('fm_save',{p_id:cloud.id,p_secret:cloud.secret,p_data:o,p_progress:0});}catch(_){}}
function showAccount(){acEl.hidden=false;renderAccount();}
document.getElementById('acBtn').onclick=()=>{acMsg('');showAccount();};
document.getElementById('acClose').onclick=()=>{acEl.hidden=true;};
sbReady.then(c=>{if(!c)return;setTimeout(cloudStart,1500);document.addEventListener('visibilitychange',()=>{if(document.hidden&&cloud)cloudPush(false);});});
if('serviceWorker' in navigator&&location.protocol==='https:'){const hadCtl=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').then(reg=>{setInterval(()=>reg.update().catch(()=>{}),10*60*1000);}).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl)return;const u=document.getElementById('upd');u.textContent=L('🆕 有新版本，点这里更新');u.hidden=false;u.onclick=()=>{save();resetting=true;location.reload();};});}
})();
