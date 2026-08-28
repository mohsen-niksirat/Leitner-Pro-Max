// ═══════════════════════════════════════════
// TAG SYSTEM — برچسب‌گذاری چندگانه
// ═══════════════════════════════════════════
let libSelected=new Set(); // شناسه کلمات انتخاب‌شده برای عملیات گروهی
function toggleLibSelect(id){if(libSelected.has(id))libSelected.delete(id);else libSelected.add(id)}
function updateBulkBar(c){const bar=document.getElementById('bulkBar');if(!bar)return;bar.style.display=libSelected.size?'flex':'none';const cnt=document.getElementById('bulkCount');if(cnt)cnt.textContent=libSelected.size+' انتخاب'}
function getAllTags(){const s=new Set();S.words.forEach(w=>(w.tags||[]).forEach(t=>s.add(t)));S.longTerm.forEach(w=>(w.tags||[]).forEach(t=>s.add(t)));return[...s].sort()}
function tagCount(t){return S.words.filter(w=>(w.tags||[]).includes(t)).length+S.longTerm.filter(w=>(w.tags||[]).includes(t)).length}
function openTagManager(){
  const ov=document.createElement('div');ov.className='modal-overlay';
  function render(){
    const tags=getAllTags();
    ov.innerHTML=`<div class="modal" style="max-width:520px">
      <h3 style="margin-bottom:14px">🏷️ مدیریت برچسب‌ها</h3>
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <input class="input" id="newTagName" placeholder="نام برچسب جدید..." style="flex:1">
        <button type="button" class="btn btn-primary btn-sm" id="addTagBtn">افزودن</button>
      </div>
      <div style="max-height:380px;overflow-y:auto">
        ${tags.length?tags.map(t=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--border)">
          <div><span class="tag" style="font-size:.75rem">${esc(t)}</span> <span style="color:var(--text2);font-size:.75rem">(${tagCount(t)})</span></div>
          <div style="display:flex;gap:4px">
            <button type="button" class="btn btn-ghost btn-sm" data-tag-rename="${esc(t)}" style="font-size:.7rem">✏️</button>
            <button type="button" class="btn btn-ghost btn-sm" data-tag-del="${esc(t)}" style="font-size:.7rem;color:var(--danger)">🗑️</button>
          </div></div>`).join(''):'<div style="color:var(--text2);text-align:center;padding:20px">برچسبی وجود ندارد</div>'}
      </div>
      <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.75rem;color:var(--text2)">برچسب را از ویرایش کلمه یا عملیات گروهی به کلمات بدهید</span>
        <button type="button" class="btn btn-ghost" id="closeTagMgr">بستن</button>
      </div>
    </div>`;
    ov.querySelector('#addTagBtn').onclick=()=>{const n=ov.querySelector('#newTagName').value.trim();if(!n)return;if(getAllTags().includes(n)){toast('این برچسب وجود دارد','error');return}render();toast('برچسب «'+n+'» آماده است — از عملیات گروهی آن را به کلمات بدهید','success')};
    ov.querySelector('#newTagName').onkeydown=e=>{if(e.key==='Enter')ov.querySelector('#addTagBtn').click()};
    ov.querySelectorAll('[data-tag-rename]').forEach(btn=>{btn.onclick=()=>{const old=btn.dataset.tagRename;const nn=prompt('نام جدید برچسب:',old);if(!nn||nn.trim()===old)return;const name=nn.trim();S.words.forEach(w=>{if((w.tags||[]).includes(old)){const i=w.tags.indexOf(old);w.tags[i]=name}});S.longTerm.forEach(w=>{if((w.tags||[]).includes(old)){const i=w.tags.indexOf(old);w.tags[i]=name}});save();render();toast('برچسب تغییر نام یافت','success')}});
    ov.querySelectorAll('[data-tag-del]').forEach(btn=>{btn.onclick=()=>{const t=btn.dataset.tagDel;const n=tagCount(t);if(!confirm('حذف برچسب «'+t+'» از '+n+' کلمه؟'))return;S.words.forEach(w=>{if(w.tags)w.tags=w.tags.filter(x=>x!==t)});S.longTerm.forEach(w=>{if(w.tags)w.tags=w.tags.filter(x=>x!==t)});save();render();toast('برچسب حذف شد','success')}});
    ov.querySelector('#closeTagMgr').onclick=()=>{ov.remove();invalidateLibCache();renderLibrary(document.getElementById('content'))};
  }
  render();document.body.appendChild(ov);ov.onclick=e=>{if(e.target===ov){ov.remove();invalidateLibCache();renderLibrary(document.getElementById('content'))}};
}
function assignTagToIds(ids,tag){let n=0;ids.forEach(id=>{const w=S.words.find(x=>x.id===id);if(w){if(!(w.tags||[]).includes(tag)){w.tags=w.tags||[];w.tags.push(tag);n++}}});if(n){save();invalidateLibCache();toast(n+' کلمه برچسب «'+tag+'» گرفت','success')}else toast('چیزی تغییر نکرد','info')}
function removeTagFromIds(ids,tag){let n=0;ids.forEach(id=>{const w=S.words.find(x=>x.id===id);if(w&&(w.tags||[]).includes(tag)){w.tags=w.tags.filter(t=>t!==tag);n++}});if(n){save();invalidateLibCache();toast('برچسب از '+n+' کلمه حذف شد','success')}else toast('چیزی تغییر نکرد','info')}
function bulkAddTagPrompt(){const tag=(prompt('نام برچسب برای افزودن به '+libSelected.size+' کلمه انتخاب‌شده:')||'').trim();if(!tag)return;assignTagToIds([...libSelected],tag);invalidateLibCache();renderLibrary(document.getElementById('content'))}
function bulkRemoveTagPrompt(){const tag=(prompt('نام برچسب برای حذف از کلمات انتخاب‌شده:')||'').trim();if(!tag)return;removeTagFromIds([...libSelected],tag);invalidateLibCache();renderLibrary(document.getElementById('content'))}

// ═══════════════════════════════════════════
// ADAPTIVE QUIZ — نشانگر سختی + حالت تطبیقی
// ═══════════════════════════════════════════
function quizStrengthLabel(w){const s=getWordStrength(w);return s>=0.7?'قوی 💪':s>=0.4?'متوسط ⚖️':'ضعیف 🎯'}
function isAdaptiveQuiz(){return S.settings.quizAdaptive!==false}

// ═══════════════════════════════════════════
// GOOGLE DRIVE SYNC — همگام‌سازی ابری
// ═══════════════════════════════════════════
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const DRIVE_FILE='leitner-backup.json';
let _gisTokenClient=null;
function driveSettings(){if(!S.settings.drive)S.settings.drive={clientId:'1048349568529-5our29tuemgr642aqf5t1qqnfsf05ea0.apps.googleusercontent.com',connected:false,token:'',tokenExpiry:0,autoSync:false,lastSyncAt:null};return S.settings.drive}
function loadGisLib(){return new Promise((res,rej)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return res();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=()=>res();s.onerror=()=>rej(new Error('بارگذاری کتابخانه گوگل ناموفق'));document.head.appendChild(s)})}
function handleTokenResp(resp,res,rej){const d=driveSettings();if(resp.error){toast('خطا در اتصال: '+resp.error,'error');return rej(new Error(resp.error))}d.token=resp.access_token;d.tokenExpiry=Date.now()+resp.expires_in*1000;d.connected=true;save();toast('اتصال به گوگل درایو برقرار شد ✅','success');res(resp.access_token)}
function initTokenClient(cb){const d=driveSettings();_gisTokenClient=google.accounts.oauth2.initTokenClient({client_id:d.clientId,scope:DRIVE_SCOPE,callback:cb})}
function ensureDriveToken(){const d=driveSettings();if(!d.clientId)return Promise.reject('Client ID تنظیم نشده است');if(d.token&&d.tokenExpiry&&Date.now()<d.tokenExpiry-60000)return Promise.resolve(d.token);return new Promise((res,rej)=>{if(!_gisTokenClient)initTokenClient(resp=>handleTokenResp(resp,res,rej));else _gisTokenClient.callback=resp=>handleTokenResp(resp,res,rej);_gisTokenClient.requestAccessToken()})}
async function driveFindFile(token){const r=await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+encodeURIComponent("name='"+DRIVE_FILE+"'")+'&fields=files(id,name,modifiedTime,size)',{headers:{Authorization:'Bearer '+token}});const j=await r.json();return j&&j.files&&j.files.length?j.files[0]:null}
async function driveUpload(token,json){const file=await driveFindFile(token);if(file){const r=await fetch('https://www.googleapis.com/upload/drive/v3/files/'+file.id+'?uploadType=media',{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:json});if(!r.ok)throw new Error('آپلود ناموفق');return file.id}const meta={name:DRIVE_FILE,parents:['appDataFolder'],mimeType:'application/json'};const boundary='leitner'+Date.now();const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+json+'\r\n--'+boundary+'--\r\n';const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body:body});if(!r.ok)throw new Error('ایجاد ناموفق');const j=await r.json();return j.id}
async function driveDownload(token,fileId){const r=await fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?alt=media',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error('دانلود ناموفق');return r.text()}
async function syncNow(){const d=driveSettings();if(!d.clientId){toast('ابتدا Client ID را وارد کنید','error');return}try{const token=await ensureDriveToken();const json=exportStateSnapshot();await driveUpload(token,json);d.lastSyncAt=new Date().toISOString();save();toast('پشتیبان به گوگل درایو آپلود شد ✅','success')}catch(e){toast('خطا در همگام‌سازی: '+e.message,'error')}}
async function restoreFromDrive(){const d=driveSettings();if(!d.clientId){toast('ابتدا Client ID را وارد کنید','error');return}try{const token=await ensureDriveToken();const file=await driveFindFile(token);if(!file){toast('فایل پشتیبان در ابر یافت نشد','info');return}const text=await driveDownload(token,file.id);const data=JSON.parse(text);if(!data||!data.exportedAt){toast('فایل پشتیبان معتبر نیست','error');return}if(!confirm('بازیابی از نسخه ابری ('+new Date(data.exportedAt).toLocaleString('fa-IR')+')؟ کلمات برای انتخاب آماده می‌شوند.'))return;const result=importStateSnapshot(data);if(!result.ok)toast(result.msg,'error');else toast('نسخه ابری بارگذاری شد — در مرحله انتخاب ادامه دهید','success')}catch(e){toast('خطا در بازیابی: '+e.message,'error')}}
function disconnectDrive(){const d=driveSettings();d.connected=false;d.token='';d.tokenExpiry=0;save();toast('اتصال قطع شد','info')}
function maybeAutoSync(){const d=driveSettings();if(!d.autoSync||!d.clientId||!d.connected)return;if(!(d.token&&d.tokenExpiry&&Date.now()<d.tokenExpiry-60000))return;(async()=>{try{const json=exportStateSnapshot();await driveUpload(d.token,json);d.lastSyncAt=new Date().toISOString();save()}catch(e){}})()}
function checkDriveOnLoad(){const d=driveSettings();if(!d.autoSync||!d.clientId||!d.connected)return;if(!(d.token&&d.tokenExpiry&&Date.now()<d.tokenExpiry-60000))return;(async()=>{try{const file=await driveFindFile(d.token);if(!file)return;const text=await driveDownload(d.token,file.id);const data=JSON.parse(text);if(data&&data.exportedAt&&(!d.lastSyncAt||new Date(data.exportedAt)>new Date(d.lastSyncAt)))toast('نسخه جدیدی در ابر موجود است — از تنظیمات → همگام‌سازی بازیابی کنید','info')}catch(e){}})()}

