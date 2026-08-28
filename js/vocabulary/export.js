// 6. EXPORT (with IndexedDB backup)
// ═══════════════════════════════════════════
function renderExport(c){
const dataSize=stateSnapshotSizeKB().toFixed(1);
const catCount=S.categories.length;
const lastBackup=S.stats.lastReviewDate?fmtDate(S.stats.lastReviewDate):'—';
c.innerHTML=`<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">📊 خلاصه داده‌ها</h3><div class="stat-grid"><div class="stat-card"><div class="val">${S.words.length}</div><div class="lbl">کلمه لایتنر</div></div><div class="stat-card"><div class="val">${S.longTerm.length}</div><div class="lbl">حافظه بلندمدت</div></div><div class="stat-card"><div class="val">${catCount}</div><div class="lbl">دسته‌بندی</div></div><div class="stat-card"><div class="val">${S.stats.reviewed}</div><div class="lbl">کل مرورها</div></div><div class="stat-card"><div class="val" style="font-size:1.1rem">${dataSize} KB</div><div class="lbl">حجم داده</div></div><div class="stat-card"><div class="val" style="font-size:.9rem">${lastBackup}</div><div class="lbl">آخرین مرور</div></div></div></div><div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">💾 پشتیبان‌گیری JSON</h3><p style="color:var(--text2);margin-bottom:16px;font-size:.9rem">تمام کلمات، حافظه بلندمدت، آمار و تنظیمات در یک فایل JSON ذخیره می‌شود.</p><div class="flex"><button type="button" class="btn btn-primary" id="exportBtn">دانلود پشتیبان (${S.words.length+S.longTerm.length} کلمه)</button><button type="button" class="btn btn-ghost" id="exportBackupBtn">بازیابی از پشتیبان خودکار</button></div></div><div class="card" style="margin-bottom:16px;border:1px solid var(--accent)"><h3 style="margin-bottom:12px;color:var(--accent)">🕐 پشتیبان‌های خودکار (بازگشت به گذشته)</h3><p style="color:var(--text2);margin-bottom:12px;font-size:.85rem">تا ۱۰ نسخه پشتیبان خودکار نگهداری می‌شود. هر ۲۰ بار ذخیره، یک نسخه جدید ایجاد می‌شود.</p><div id="snapshotList" style="max-height:300px;overflow-y:auto"><p style="color:var(--text2);font-size:.85rem">در حال بارگذاری...</p></div></div><div class="card" style="margin-bottom:16px;border:1px solid var(--accent)"><h3 style="margin-bottom:12px;color:var(--accent)">🔗 اشتراک‌گذاری دسته</h3><p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">دسته‌های واژگانی خود را با دیگران به اشتراک بگذارید.</p><div style="display:grid;gap:8px"><div class="flex"><select class="input" id="shareDeckSelect" style="max-width:250px"><option value="">همه کلمات</option>${S.categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+' ('+S.words.filter(w=>w.category===c).length+')</option>').join('')}</select><button type="button" class="btn btn-primary btn-sm" id="shareDeckBtn">دانلود دسته</button><button type="button" class="btn btn-ghost btn-sm" id="shareDeckLinkBtn">کپی لینک</button></div><div class="flex"><input type="file" id="importSharedDeckInput" accept=".json" style="display:none"><button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('importSharedDeckInput').click()">📂 وارد کردن دسته مشترک</button><input class="input" id="importSharedDeckUrl" placeholder="لینک دسته مشترک..." style="max-width:300px"><button type="button" class="btn btn-ghost btn-sm" id="importSharedDeckUrlBtn">دریافت از لینک</button></div></div></div><div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">📂 بازیابی از فایل</h3>
<p style="color:var(--text2);margin-bottom:12px;font-size:.85rem">فایل پشتیبان JSON قبلی را برای بازیابی انتخاب کنید.</p><div class="flex"><input type="file" id="importJsonInput" accept=".json" style="display:none"><button type="button" class="btn btn-ghost" onclick="document.getElementById('importJsonInput').click()">انتخاب فایل پشتیبان</button></div></div><div class="card" style="margin-bottom:16px;border:1px solid var(--warning)"><p style="color:var(--warning);font-size:.85rem">توصیه: به‌صورت دوره‌ای از داده‌ها پشتیبان‌گیری کنید تا در صورت پاک شدن مرورگر اطلاعات از بین نرود. پشتیبان خودکار در IndexedDB ذخیره می‌شود.</p></div><div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">📊 خروجی فرمت‌های مختلف</h3><p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">خروجی بگیرید با فرمت‌های مختلف برای استفاده در برنامه‌های دیگر.</p><div style="display:grid;gap:8px"><div class="flex" style="flex-wrap:wrap"><select class="input" id="exportCsvCat" style="max-width:200px;font-size:.85rem"><option value="">همه دسته‌ها</option>${S.categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('')}</select><button type="button" class="btn btn-ghost" id="exportCsvBtn">📄 خروجی CSV</button><button type="button" class="btn btn-ghost" id="exportAnkiBtn">📇 خروجی Anki</button><button type="button" class="btn btn-ghost" id="exportPrintBtn">🖨️ چاپ لیست</button></div><button type="button" class="btn btn-ghost btn-sm" id="exportStatsBtn">📊 خروجی آمار تفصیلی</button></div></div><div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">💾 مصرف حافظه</h3><div id="storageMeter"></div></div><div class="card" style="border:2px solid var(--danger)"><h3 style="margin-bottom:12px;color:var(--danger)">⚠️ پاکسازی کامل</h3><p style="color:var(--text2);margin-bottom:16px;font-size:.9rem">تمام داده‌ها شامل ${S.words.length} کلمه لایتنر، ${S.longTerm.length} کلمه حافظه بلندمدت و آمار پاک می‌شود. این عمل غیرقابل بازگشت است.</p><button type="button" class="btn btn-danger" id="resetBtn">پاکسازی کامل</button></div>`;
document.getElementById('exportBtn').onclick=()=>{const blob=new Blob([exportStateSnapshot()],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='leitner-backup-'+todayKey()+'.json';a.click();URL.revokeObjectURL(url);toast('پشتیبان دانلود شد — '+S.words.length+' لایتنر، '+S.longTerm.length+' حافظه بلندمدت','success')};
// Load and render snapshot list
(async()=>{
  const listEl=document.getElementById('snapshotList');
  if(!listEl)return;
  try{
    const snapshots=await listSnapshots();
    if(!snapshots.length){listEl.innerHTML='<p style="color:var(--text2);font-size:.85rem">هنوز پشتیبان خودکاری ایجاد نشده. پس از حدود ۲۰ بار ذخیره، اولین نسخه ایجاد می‌شود.</p>';return}
    let h='';
    snapshots.forEach((key,i)=>{
      const ts=key.replace('snap_','');
      const d=new Date(ts);
      const label=d.toLocaleDateString('fa-IR')+' — '+d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});
      h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);gap:8px">';
      h+='<span style="font-size:.85rem;color:var(--text)">'+label+'</span>';
      h+='<div style="display:flex;gap:4px">';
      h+='<button type="button" class="btn btn-ghost btn-sm" data-snap-restore="'+key+'" style="font-size:.75rem">بازگردانی</button>';
      h+='<button type="button" class="btn btn-ghost btn-sm" data-snap-download="'+key+'" style="font-size:.75rem">دانلود</button>';
      h+='<button type="button" class="btn btn-ghost btn-sm" data-snap-delete="'+key+'" style="font-size:.75rem;color:var(--danger)">🗑️</button>';
      h+='</div></div>';
    });
    listEl.innerHTML=h;
    // Bind events
    listEl.querySelectorAll('[data-snap-restore]').forEach(btn=>{
      btn.onclick=async()=>{
        const key=btn.dataset.snapRestore;
        if(!confirm('بازگردانی از این نسخه پشتیبان؟ تمام داده‌های فعلی جایگزین می‌شوند.'))return;
        const data=await restoreSnapshot(key);
        if(data){
          const result=importStateSnapshot(data);
          if(!result.ok)toast(result.msg,'error');
          else if(!result.staged)render();
        }else{toast('خطا در بازگردانی','error')}
      };
    });
    listEl.querySelectorAll('[data-snap-download]').forEach(btn=>{
      btn.onclick=async()=>{
        const key=btn.dataset.snapDownload;
        const data=await restoreSnapshot(key);
        if(data){
          const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a');a.href=url;a.download='leitner-snapshot-'+key.replace('snap_','').replace(/:/g,'-')+'.json';a.click();URL.revokeObjectURL(url);
          toast('نسخه پشتیبان دانلود شد','success');
        }
      };
    });
    listEl.querySelectorAll('[data-snap-delete]').forEach(btn=>{
      btn.onclick=async()=>{
        const key=btn.dataset.snapDelete;
        if(!confirm('حذف این نسخه پشتیبان؟'))return;
        await deleteSnapshot(key);
        btn.closest('div[style]').remove();
        toast('نسخه پشتیبان حذف شد','success');
      };
    });
  }catch(e){listEl.innerHTML='<p style="color:var(--danger);font-size:.85rem">خطا در بارگذاری پشتیبان‌ها</p>'}
})();
document.getElementById('exportBackupBtn').onclick=async()=>{const data=await exportBackup();if(data){const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='leitner-auto-backup-'+todayKey()+'.json';a.click();URL.revokeObjectURL(url);toast('پشتیبان خودکار دانلود شد','success')}else{toast('پشتیبان خودکاری یافت نشد','info')}};
const importJson=document.getElementById('importJsonInput');
if(importJson)importJson.onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const text=await file.text();const data=JSON.parse(text);const result=importStateSnapshot(data);if(!result.ok)toast(result.msg,'error')}catch(e){toast('خطا در خواندن فایل: '+e.message,'error')};e.target.value=''};
// Shared deck handlers
const shareBtn=document.getElementById('shareDeckBtn');
if(shareBtn)shareBtn.onclick=()=>{
  const cat=document.getElementById('shareDeckSelect').value||null;
  const json=exportSharedDeckJSON(cat);
  if(!json){toast('دسته‌ای برای اشتراک‌گذاری یافت نشد','error');return}
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='shared-deck-'+(cat||'all')+'.json';a.click();URL.revokeObjectURL(url);
  toast('دسته دانلود شد','success');
};
const shareLinkBtn=document.getElementById('shareDeckLinkBtn');
if(shareLinkBtn)shareLinkBtn.onclick=async()=>{
  const cat=document.getElementById('shareDeckSelect').value||null;
  const link=exportSharedDeckLink(cat);
  if(!link){toast('خطا در ساخت لینک','error');return}
  try{await navigator.clipboard.writeText(link);toast('لینک در کلیپبورد کپی شد ✅','success')}catch(e){prompt('لینک را کپی کنید:',link)}
};
const importSharedInput=document.getElementById('importSharedDeckInput');
if(importSharedInput)importSharedInput.onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{const text=await file.text();const deck=JSON.parse(text);const result=importSharedDeck(deck);toast(result.msg,result.ok?'success':'error');if(result.ok)render()}catch(e){toast('خطا در خواندن فایل','error')};
  e.target.value='';
};
const importUrlBtn=document.getElementById('importSharedDeckUrlBtn');
if(importUrlBtn)importUrlBtn.onclick=async()=>{
  const url=document.getElementById('importSharedDeckUrl')?.value?.trim();
  if(!url){toast('لینکی وارد نشده','error');return}
  try{
    // Extract deck from URL hash
    const hashIdx=url.indexOf('#deck=');
    if(hashIdx>=0){
      const encoded=url.slice(hashIdx+6);
      const json=decodeURIComponent(escape(atob(encoded)));
      const deck=JSON.parse(json);
      const result=importSharedDeck(deck);toast(result.msg,result.ok?'success':'error');if(result.ok)render();
    }else{
      // Try fetching as JSON
      const r=await fetch(url);const deck=await r.json();
      const result=importSharedDeck(deck);toast(result.msg,result.ok?'success':'error');if(result.ok)render();
    }
  }catch(e){toast('خطا در دریافت لینک','error')}
};

document.getElementById('resetBtn').onclick=()=>{if(confirm('آیا مطمئن هستید؟ تمام '+S.words.length+' کلمه لایتنر و '+S.longTerm.length+' کلمه حافظه بلندمدت پاک خواهد شد!')){S=defaultState();save();toast('تمام داده‌ها پاک شد','success');render()}};
// ── CSV Export ──
var csvBtn=document.getElementById('exportCsvBtn');
if(csvBtn)csvBtn.onclick=function(){
  var cat=document.getElementById('exportCsvCat')?document.getElementById('exportCsvCat').value:'';
  var words=cat?S.words.filter(function(w){return w.category===cat}):S.words;
  var allWords=words.concat(S.longTerm);
  var rows=[['Word','Translation','IPA','Part of Speech','Box','Category','Definitions','Examples','Synonyms','Frequency Tier','Last Reviewed','Next Review']];
  allWords.forEach(function(w){
    rows.push([
      w.word,
      w.translation||'',
      w.ipa||'',
      w.partOfSpeech||'',
      w.box||0,
      w.category||'',
      (w.definitions||[]).join('; '),
      (w.examples||[]).join('; '),
      (w.synonyms||[]).join(', '),
      tierLabel(getFrequencyTier(w.word)),
      w.lastReviewedAt?fmtDate(w.lastReviewedAt):'',
      w.nextReviewDate?fmtDate(w.nextReviewDate):''
    ]);
  });
  var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='leitner-words-'+todayKey()+'.csv';a.click();URL.revokeObjectURL(url);
  toast(rows.length-1+' کلمه خروجی CSV شد','success');
};
// ── Anki CSV Export ──
var ankiBtn=document.getElementById('exportAnkiBtn');
if(ankiBtn)ankiBtn.onclick=function(){
  var allWords=S.words.concat(S.longTerm);
  var rows=['#separator:tab','#html:true','#columns:Front\tBack\tTags'];
  allWords.forEach(function(w){
    var front='<b>'+esc(w.word)+'</b>'+(w.ipa?' <span style="color:gray">/'+esc(w.ipa)+'/</span>':'')+(w.partOfSpeech?' <span style="color:blue">('+esc(w.partOfSpeech)+')</span>':'');
    var back='<div style="font-size:1.2em;color:green;font-weight:bold">'+esc(w.translation||'')+'</div>';
    if(w.definitions&&w.definitions.length)back+='<hr>'+(w.definitions.slice(0,3).map(function(d){return '<div>• '+esc(typeof d==='string'?d:d.definition||'')+'</div>'}).join(''));
    if(w.examples&&w.examples.length)back+='<hr>'+(w.examples.slice(0,2).map(function(ex){return '<div style="font-style:italic;color:gray">"'+esc(ex)+'"</div>'}).join(''));
    var tags=[w.category||'default','box'+(w.box||0)];
    rows.push(front+'\t'+back+'\t'+tags.join(' '));
  });
  var blob=new Blob([rows.join('\n')],{type:'text/tab-separated-values;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='leitner-anki-'+todayKey()+'.tsv';a.click();URL.revokeObjectURL(url);
  toast(allWords.length+' کلمه فرمت Anki خروجی شد','success');
};
// ── Print-friendly export ──
var printBtn=document.getElementById('exportPrintBtn');
if(printBtn)printBtn.onclick=function(){
  var allWords=S.words.concat(S.longTerm).sort(function(a,b){return a.word.localeCompare(b.word)});
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>لایتنر - لیست واژگان</title><style>body{font-family:Arial,sans-serif;padding:20px;direction:rtl}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:right;font-size:12px}th{background:#6c5ce7;color:white}tr:nth-child(even){background:#f9f9f9}.box{display:inline-block;width:20px;height:20px;border-radius:50%;text-align:center;line-height:20px;font-size:10px;color:white;font-weight:bold}@media print{.no-print{display:none}}</style></head><body><h1>📖 لیست واژگان لایتنر</h1><p>تاریخ: '+new Date().toLocaleDateString('fa-IR')+' | کل: '+allWords.length+' کلمه</p><table><tr><th>#</th><th>کلمه</th><th>معنی</th><th>IPA</th><th>جعبه</th><th>دسته</th><th>تعریف</th></tr>';
  allWords.forEach(function(w,i){
    var boxColor=['#e17055','#fdcb6e','#ffeaa7','#55efc4','#00b894','#00cec9','#0984e3','#6c5ce7','#e84393','#fd79a8','#a29bfe'][Math.min(w.box||0,10)];
    html+='<tr><td>'+(i+1)+'</td><td><b>'+esc(w.word)+'</b>'+(w.ipa?' <small>/'+esc(w.ipa)+'/</small>':'')+'</td><td style="color:green">'+esc(w.translation||'')+'</td><td>'+esc(w.partOfSpeech||'')+'</td><td><span class="box" style="background:'+boxColor+'">'+(w.box||0)+'</span></td><td>'+esc(w.category||'')+'</td><td style="font-size:11px">'+(w.definitions||[]).slice(0,2).map(function(d){return esc(typeof d==='string'?d:d.definition||'')}).join('<br>')+'</td></tr>';
  });
  html+='</table><p style="margin-top:20px;text-align:center;color:gray">ساخته شده با لایتنر پرو</p></body></html>';
  var win=window.open('','_blank');
  win.document.write(html);win.document.close();
  setTimeout(function(){win.print()},500);
  toast('پنجره چاپ باز شد','success');
};
// ── Statistics export ──
var statsExportBtn=document.getElementById('exportStatsBtn');
if(statsExportBtn)statsExportBtn.onclick=function(){
  var statsData={
    exportDate:new Date().toISOString(),
    totalWords:S.words.length,
    totalLongTerm:S.longTerm.length,
    totalCategories:S.categories.length,
    categories:S.categories,
    reviewStats:S.stats,
    quizStats:S.quizStats,
    categoryBreakdown:{},
    boxDistribution:{},
    frequencyDistribution:{t1:0,t2:0,t3:0,advanced:0}
  };
  S.categories.forEach(function(cat){
    statsData.categoryBreakdown[cat]=S.words.filter(function(w){return w.category===cat}).length;
  });
  for(var i=0;i<=10;i++)statsData.boxDistribution['box'+i]=S.words.filter(function(w){return(w.box||0)===i}).length;
  S.words.forEach(function(w){
    var t=getFrequencyTier(w.word);
    if(t===1)statsData.frequencyDistribution.t1++;
    else if(t===2)statsData.frequencyDistribution.t2++;
    else if(t===3)statsData.frequencyDistribution.t3++;
    else statsData.frequencyDistribution.advanced++;
  });
  var blob=new Blob([JSON.stringify(statsData,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='leitner-stats-'+todayKey()+'.json';a.click();URL.revokeObjectURL(url);
  toast('آمار خروجی گرفته شد','success');
};
// ── Storage meter ──
var meterEl=document.getElementById('storageMeter');
if(meterEl){
  renderStorageMeter(meterEl);
}
}

// ═══════════════════════════════════════════
