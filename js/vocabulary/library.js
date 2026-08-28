// 2. LIBRARY (with frequency tier + pagination)
// ═══════════════════════════════════════════
let libFilter='',libCat='',libSort='',libPage=0,libTag='',_libSearchTimer=null;
const LIB_PAGE_SIZE=50;
let _libCache=null,_libCacheKey='';
function getLibFiltered(){
const key=libFilter+'|'+libCat+'|'+libSort+'|'+libTag;
if(_libCache&&_libCacheKey===key)return _libCache;
const words=S.words;
const filtered=words.filter(w=>{if(libCat&&w.category!==libCat)return false;if(libTag&&!(w.tags||[]).includes(libTag))return false;if(libFilter&&!w.word.toLowerCase().includes(libFilter.toLowerCase())&&!w.translation.toLowerCase().includes(libFilter.toLowerCase()))return false;return true});
if(libSort==='newest')filtered.sort((a,b)=>new Date(b.addedDate)-new Date(a.addedDate));
else if(libSort==='due')filtered.sort((a,b)=>{const da=a.nextReviewDate?new Date(a.nextReviewDate):new Date('2099-01-01');const db=b.nextReviewDate?new Date(b.nextReviewDate):new Date('2099-01-01');return da-db});
else if(libSort==='alpha')filtered.sort((a,b)=>a.word.localeCompare(b.word,'fa'));
else if(libSort==='freq')filtered.sort((a,b)=>getFrequencyTier(a.word)-getFrequencyTier(b.word));
_libCache=filtered;_libCacheKey=key;return filtered}
function invalidateLibCache(){_libCache=null;_libCacheKey=''}
// ═══════════════════════════════════════════
// SHARED LIST ENGINE
// ═══════════════════════════════════════════
function makePagerHtml(total,page,pageSize,pgClass,pgAttr){
const pages=Math.ceil(total/pageSize);if(pages<=1)return'';
let h='<div class="lib-pager '+pgClass+'">';
h+='<button type="button" class="btn btn-ghost btn-sm '+pgClass+'" data-'+pgAttr+'="prev" '+(page===0?'disabled':'')+'>◀</button>';
const s=Math.max(0,page-2),e=Math.min(pages,page+3);
if(s>0)h+='<button type="button" class="btn btn-ghost btn-sm '+pgClass+'" data-'+pgAttr+'="0">1</button>';
if(s>1)h+='<span class="lib-pg-ellipsis">…</span>';
for(let i=s;i<e;i++)h+='<button type="button" class="btn btn-sm '+pgClass+(i===page?' lib-pg-active':'')+'" data-'+pgAttr+'="'+i+'">'+(i+1)+'</button>';
if(e<pages-1)h+='<span class="lib-pg-ellipsis">…</span>';
if(e<pages)h+='<button type="button" class="btn btn-ghost btn-sm '+pgClass+'" data-'+pgAttr+'="'+(pages-1)+'">'+pages+'</button>';
h+='<button type="button" class="btn btn-ghost btn-sm '+pgClass+'" data-'+pgAttr+'="next" '+(page>=pages-1?'disabled':'')+'>▶</button>';
h+='</div>';return h}
function paginate(total,page,pageSize){const pages=Math.ceil(total/pageSize);if(page>=pages)page=Math.max(0,pages-1);const start=page*pageSize;return{start,end:start+pageSize,totalPages:pages}}
function bindPager(c,libPageFn,ltPageFn){c.onclick=function(e){var pgBtn=e.target.closest('[data-pg]');if(pgBtn&&!pgBtn.disabled){libPageFn(pgBtn.dataset.pg);return}var ltBtn=e.target.closest('[data-ltpg]');if(ltBtn&&!ltBtn.disabled){ltPageFn(ltBtn.dataset.ltpg);return}}}

function fsrsBadgeHtml(w){
  var st=(w&&w.fsrsState)||'new';
  var map={new:['جدید','#8b9bb4'],learning:['یادگیری','#f59e0b'],review:['تثبیت','#22c55e'],relearning:['بازآموزی','#ef4444']};
  var c=map[st]||map.new;
  return '<span class="badge" title="وضعیت FSRS" style="background:'+c[1]+'22;color:'+c[1]+';border:1px solid '+c[1]+'44;font-size:.62rem;margin-right:4px">'+c[0]+'</span>';
}
function libRowHtml(w,dueToday){
const tier=getFrequencyTier(w.word);
const tags=(w.tags||[]).map(t=>'<span class="tag" style="font-size:.6rem;cursor:pointer" onclick="libTag=\''+esc(t)+'\';invalidateLibCache();renderLibrary(document.getElementById(\'content\'))" title="فیلتر بر اساس این برچسب">'+esc(t)+'</span>').join(' ');
return '<tr><td><input type="checkbox" class="lib-sel" data-sel="'+w.id+'" '+(libSelected.has(w.id)?'checked':'')+' aria-label="انتخاب"></td><td><strong>'+esc(w.word)+'</strong> <button type="button" class="btn btn-ghost btn-sm" data-speak="'+esc(w.word)+'" style="padding:2px 6px;font-size:.75rem" title="شنیدن تلفظ">🔊</button>'+(w.ipa?'<br><small style="color:var(--text2)">'+esc(w.ipa)+'</small>':'')+(tier?'<br><span class="badge tier-'+tier+'" style="font-size:.6rem">'+tierLabel(tier)+'</span>':'')+'</td><td>'+esc(w.translation)+'</td><td><span class="tag">'+esc(w.category)+'</span>'+(w.favorite?' <span style="font-size:.9rem">⭐</span>':'')+'</td><td>'+(tags?tags:'<span style="color:var(--text2);font-size:.7rem">—</span>')+'</td><td>'+(dueToday.has(w.id)?'<span class="badge badge-warning">زودترین</span>':w.box)+'</td><td>'+fmtDate(w.nextReviewDate)+fsrsBadgeHtml(w)+'</td><td><button type="button" class="btn btn-ghost btn-sm" data-enrich="\'+w.id+\'" title="غنی‌سازی (تعریف/مثال/مترادف)" aria-label="غنی‌سازی">🔍</button><button type="button" class="btn btn-ghost btn-sm" data-translate="\'+w.id+\'" title="دریافت ترجمه" aria-label="ترجمه">🌐</button><button type="button" class="btn btn-ghost btn-sm" data-edit="'+w.id+'" aria-label="ویرایش">✏️</button><button type="button" class="btn btn-ghost btn-sm" data-fav="'+w.id+'" aria-label="'+(w.favorite?'حذف از علاقه‌مندی':'افزودن به علاقه‌مندی')+'">'+(w.favorite?'💔':'⭐')+'</button><button type="button" class="btn btn-ghost btn-sm" data-lt="'+w.id+'" aria-label="انتقال به حافظه بلندمدت">🧠</button><button type="button" class="btn btn-ghost btn-sm" data-del="'+w.id+'" aria-label="حذف" style="color:var(--danger)">🗑️</button></td></tr>'}
function libPagerHtml(total,page,pageSize){return makePagerHtml(total,page,pageSize,'lib-pg','pg')}
async function enrichLibraryWord(id,store,c){
  const arr=store==='long-term'?S.longTerm:S.words;
  const w=arr.find(function(x){return x.id===id});if(!w)return;
  const btn=c&&c.querySelector('[data-enrich="'+id+'"]');if(btn)btn.disabled=true;
  toast('در حال غنی‌سازی «'+w.word+'»...','info');
  try{
    let result=await fetchDictionary(w.word);
    if(!result){const stems=vfStem(w.word);for(let s=1;s<stems.length;s++){result=await fetchDictionary(stems[s]);if(result){w.baseForm=w.baseForm||stems[s];break}}}
    if(!result){toast('برای «'+w.word+'» نتیجه‌ای در دیکشنری نبود','error');if(btn)btn.disabled=false;return}
    w.ipa=result.phonetic||w.ipa;w.audioUs=result.audioUs||w.audioUs;w.audioBr=result.audioBr||w.audioBr;
    const meanings=result.meanings||[];
    const defs=[...new Set(meanings.flatMap(m=>m.definitions||[]))].filter(Boolean).slice(0,8);
    if(defs.length){w.definitions=defs;w.coreMeaning=defs[0]||w.coreMeaning}
    if(meanings[0]&&meanings[0].partOfSpeech)w.partOfSpeech=w.partOfSpeech||meanings[0].partOfSpeech;
    const exs=[...new Set(meanings.flatMap(m=>m.examples||[]))].filter(Boolean).slice(0,6);if(exs.length)w.examples=exs;
    const syns=[...new Set(meanings.flatMap(m=>m.synonyms||[]))].filter(Boolean).slice(0,8);if(syns.length)w.synonyms=syns;
    try{
      if(!w.antonyms||!w.antonyms.length){const r=await fetch('https://api.datamuse.com/words?rel_ant='+encodeURIComponent(w.word)+'&max=6');const d=await r.json();if(Array.isArray(d))w.antonyms=[...(w.antonyms||[]),...d.filter(x=>x&&x.word).map(x=>x.word)].filter((v,i,a)=>a.indexOf(v)===i).slice(0,6)}
      if(!w.wordFamily||!w.wordFamily.length)w.wordFamily=(getMorphologicalFamily(w.word)||[]).slice(0,8);
      if(!w.collocations||!w.collocations.length){const coll=suggestCollocations(w.word);if(coll&&coll.length)w.collocations=coll.slice(0,6)}
    }catch(e){}
    save();invalidateLibCache();invalidateLtCache();
    toast('«'+w.word+'» غنی‌سازی شد','success');
    render();
  }catch(e){toast('خطا در غنی‌سازی: '+e.message,'error')}
  if(btn)btn.disabled=false;
}
async function translateLibraryWord(id,store,c){
  const arr=store==='long-term'?S.longTerm:S.words;
  const w=arr.find(function(x){return x.id===id});if(!w)return;
  const btn=c&&c.querySelector('[data-translate="'+id+'"]');if(btn)btn.disabled=true;
  toast('در حال ترجمه «'+w.word+'»...','info');
  try{
    const t=await fetchTranslation(w.word);
    if(!t){toast('ترجمه ای برای «'+w.word+'» دریافت نشد','error')}
    else{w.translation=t;save();invalidateLibCache();invalidateLtCache();toast('ترجمه ذخیره شد','success')}
  }catch(e){toast('خطا در ترجمه: '+e.message,'error')}
  if(btn)btn.disabled=false;
  render();
}
function renderLibrary(c){
const filtered=getLibFiltered();
const total=filtered.length;
const p=paginate(total,libPage,LIB_PAGE_SIZE);libPage=Math.min(libPage,Math.max(0,p.totalPages-1));
const pageItems=filtered.slice(p.start,p.end);
const dueToday=new Set(getDue().map(w=>w.id));
var _lp=libPage,_tp=p.totalPages;
var _ph='';
if(_tp>1){
_ph='<div class="lib-pager">';
_ph+='<button type="button" class="btn btn-ghost btn-sm lib-pg" onclick="libPage=Math.max(0,'+(_lp-1)+');renderLibrary(document.getElementById(\'content\'))"'+(_lp===0?' disabled':'')+'>◀</button>';
var _s=Math.max(0,_lp-2),_e=Math.min(_tp,_lp+3);
if(_s>0)_ph+='<button type="button" class="btn btn-ghost btn-sm lib-pg" onclick="libPage=0;renderLibrary(document.getElementById(\'content\'))">1</button>';
if(_s>1)_ph+='<span class="lib-pg-ellipsis">…</span>';
for(var _i=_s;_i<_e;_i++)_ph+='<button type="button" class="btn btn-sm lib-pg'+(_i===_lp?' lib-pg-active':'')+'" onclick="libPage='+_i+';renderLibrary(document.getElementById(\'content\'))">'+(_i+1)+'</button>';
if(_e<_tp-1)_ph+='<span class="lib-pg-ellipsis">…</span>';
if(_e<_tp)_ph+='<button type="button" class="btn btn-ghost btn-sm lib-pg" onclick="libPage='+(_tp-1)+';renderLibrary(document.getElementById(\'content\'))">'+_tp+'</button>';
_ph+='<button type="button" class="btn btn-ghost btn-sm lib-pg" onclick="libPage=Math.min('+(_tp-1)+','+(_lp+1)+');renderLibrary(document.getElementById(\'content\'))"'+(_lp>=_tp-1?' disabled':'')+'>▶</button>';
_ph+='</div>'}
c.innerHTML='<div class="filter-bar"><input class="input" placeholder="جستجو..." style="max-width:250px" value="'+esc(libFilter)+'" id="libSearch"><select class="input" style="max-width:180px" id="libCat"><option value="">همه دسته‌ها</option>'+S.categories.map(function(c){return '<option value="'+esc(c)+'"'+(c===libCat?' selected':'')+'>'+esc(c)+'</option>'}).join('')+'</select><select class="input" style="max-width:150px" id="libTagFilter"><option value="">همه برچسب‌ها</option>'+([...new Set(S.words.flatMap(w=>w.tags||[]))].sort().map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+'</option>'}).join(''))+'</select><select class="input" style="max-width:180px" id="libSort"><option value="">مرتب‌سازی</option><option value="newest"'+(libSort==='newest'?' selected':'')+'>جدیدترین</option><option value="due"'+(libSort==='due'?' selected':'')+'>زودترین مرور</option><option value="alpha"'+(libSort==='alpha'?' selected':'')+'>الفبایی</option><option value="freq"'+(libSort==='freq'?' selected':'')+'>فراوانی</option></select><button type="button" class="btn btn-sm btn-ghost" id="manageDecksBtn">🗂️ مدیریت دسته‌ها</button><button type="button" class="btn btn-sm btn-ghost" id="manageTagsBtn" title="مدیریت برچسب‌ها">🏷️ برچسب‌ها</button><button type="button" class="btn btn-sm btn-ghost" id="flushCacheBtn" title="پاک کردن کش ترجمه و دیکشنری IndexedDB (فضای اشغال‌شده آزاد می‌شود)">🧹 تخلیه کش</button><span style="color:var(--text2);font-size:.85rem">'+total+' کلمه'+(total!==S.words.length?' (از '+S.words.length+')':'')+'</span></div><div class="bulk-bar" id="bulkBar" style="display:'+(libSelected.size?'flex':'none')+';align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;background:var(--accent-glow);border:1px solid var(--accent);border-radius:12px;margin-bottom:12px"><span style="font-size:.85rem;font-weight:600;color:var(--accent)" id="bulkCount">'+libSelected.size+' انتخاب</span><button type="button" class="btn btn-sm btn-primary" id="bulkAddTag">🏷️ افزودن برچسب</button><button type="button" class="btn btn-sm btn-ghost" id="bulkRemoveTag">♻️ حذف برچسب</button><button type="button" class="btn btn-sm btn-ghost" id="bulkClear">✕ پاک کردن انتخاب</button></div>'+_ph+'<div class="table-wrap card"><table><thead><tr><th style="width:28px"><input type="checkbox" id="libSelAll" style="accent-color:var(--accent)" aria-label="انتخاب همه صفحه"></th><th>کلمه</th><th>ترجمه</th><th>دسته</th><th>برچسب‌ها</th><th>جعبه</th><th>مرور بعدی</th><th>عملیات</th></tr></thead><tbody>'+(pageItems.length?pageItems.map(function(w){return libRowHtml(w,dueToday)}).join(''):'<tr><td colspan="6"><div class="empty"><div class="icon">📚</div><p>نتیجه‌ای یافت نشد</p></div></td></tr>')+'</tbody></table></div>';
document.getElementById('libSearch').oninput=function(e){clearTimeout(_libSearchTimer);_libSearchTimer=setTimeout(function(){libFilter=e.target.value;libPage=0;invalidateLibCache();renderLibrary(c);var si=document.getElementById('libSearch');if(si){si.focus();si.selectionStart=si.selectionEnd=si.value.length}},250)};
document.getElementById('libCat').onchange=function(e){libCat=e.target.value;libPage=0;invalidateLibCache();renderLibrary(c)};
document.getElementById('libTagFilter').onchange=function(e){libTag=e.target.value;libPage=0;invalidateLibCache();renderLibrary(c)};
document.getElementById('libSort').onchange=function(e){libSort=e.target.value;libPage=0;invalidateLibCache();renderLibrary(c)};
c.querySelector('tbody').onclick=function(e){
var btn=e.target.closest('button');if(!btn)return;
if(btn.dataset.speak){speakWord(btn.dataset.speak);return}
var id=btn.dataset.edit||btn.dataset.del||btn.dataset.fav||btn.dataset.lt;
if(btn.dataset.enrich){enrichLibraryWord(btn.dataset.enrich,"words",c);return}
if(btn.dataset.translate){translateLibraryWord(btn.dataset.translate,"words",c);return}
if(btn.dataset.del){var w=S.words.find(function(x){return x.id===id});var name=w?w.word:'';if(!confirm('\u062d\u0630\u0641 \u00ab'+name+'\u00bb\u061f'))return;var repo=window.cardRepository.get();var removed=repo.remove(id,'words');if(removed.removed){save();invalidateLibCache();renderLibrary(c);toast('\u062d\u0630\u0641 \u0634\u062f','success')}}
if(btn.dataset.fav){var w=S.words.find(function(x){return x.id===id});if(w){w.favorite=!w.favorite;save();invalidateLibCache();renderLibrary(c)}}
if(btn.dataset.lt){var w=S.words.find(function(x){return x.id===id});if(w){var repo=window.cardRepository.get();var removed=repo.remove(id,'words');if(removed.removed){w.box=0;w.nextReviewDate=null;var moved=repo.add(w,'longTerm');if(!moved.added){S.words.push(w);repo.rebuildIndex();toast('انتقال انجام نشد','error');return}save();invalidateLibCache();invalidateLtCache();renderLibrary(c);toast('\u0628\u0647 \u062d\u0627\u0641\u0638\u0647 \u0628\u0644\u0646\u062f\u0645\u062f \u062a\u0646\u0642\u0644 \u0634\u062f','success')}}}
if(btn.dataset.edit)editWord(id)};
var manageBtn=document.getElementById('manageDecksBtn');
if(manageBtn)manageBtn.onclick=function(){showDeckManager()};
var tagsBtn=document.getElementById('manageTagsBtn');
if(tagsBtn)tagsBtn.onclick=function(){openTagManager()};
var selAll=document.getElementById('libSelAll');
if(selAll)selAll.onchange=function(){c.querySelectorAll('.lib-sel').forEach(function(cb){if(cb.checked!==selAll.checked){cb.checked=selAll.checked;toggleLibSelect(cb.dataset.sel)}});updateBulkBar(c)};
c.querySelectorAll('.lib-sel').forEach(function(cb){cb.onchange=function(){toggleLibSelect(cb.dataset.sel);updateBulkBar(c)}});
var bAdd=document.getElementById('bulkAddTag');if(bAdd)bAdd.onclick=function(){bulkAddTagPrompt()};
var bRem=document.getElementById('bulkRemoveTag');if(bRem)bRem.onclick=function(){bulkRemoveTagPrompt()};
var bClr=document.getElementById('bulkClear');if(bClr)bClr.onclick=function(){libSelected.clear();updateBulkBar(c);invalidateLibCache();renderLibrary(c)};
var flushBtn=document.getElementById('flushCacheBtn');
if(flushBtn)flushBtn.onclick=function(){
  flushBtn.disabled=true;flushBtn.textContent='⏳ در حال محاسبه...';
  lookupCacheSizeBytes().then(function(info){
    flushBtn.disabled=false;flushBtn.textContent='🗑 تخلیه کش';
    var sizeTxt=fitBytes(info.bytes);
    if(!confirm('🧹 کش ترجمه/دیکشنری (IndexedDB) پاک شود؟\n\n• حجم تقریبی: '+sizeTxt+' ('+info.count+' آیتم)\n• کلمات و پیشرفت شما دست نمی‌خورد؛ فقط دفعه بعد از شبکه دوباره واکشی می‌شوند.'))return;
    flushBtn.disabled=true;flushBtn.textContent='⏳ در حال تخلیه...';
    flushLookupCaches().then(function(n){toast(info.count+' آیتم ('+sizeTxt+') پاک شد','success');if(flushBtn){flushBtn.disabled=false;flushBtn.textContent='🗑 تخلیه کش'}});
  });
};
}
// DECK MANAGEMENT
// ═══════════════════════════════════════════
function showDeckManager(){
  const ov=document.createElement('div');ov.className='modal-overlay';
  function renderDeckModal(){
    const deckStats=S.categories.map(cat=>{
      const words=S.words.filter(w=>w.category===cat);
      const due=words.filter(w=>w.nextReviewDate&&new Date(w.nextReviewDate)<=new Date()).length;
      const mastered=words.filter(w=>w.box>=5).length;
      return{name:cat,count:words.length,due,mastered};
    });
    ov.innerHTML=`<div class="modal" style="max-width:500px">
      <h3 style="margin-bottom:16px">🗂️ مدیریت دسته‌ها (Deck)</h3>
      <div style="margin-bottom:16px;display:flex;gap:8px">
        <input class="input" id="newDeckName" placeholder="نام دسته جدید" style="flex:1">
        <button type="button" class="btn btn-primary btn-sm" id="addDeckBtn">افزودن</button>
      </div>
      <div style="max-height:400px;overflow-y:auto">
        ${deckStats.map(d=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border)">
            <div>
              <strong>${esc(d.name)}</strong>
              <span style="color:var(--text2);font-size:.8rem;margin-right:8px">${d.count} کلمه ${d.due>0?`• <span style="color:var(--warning)">${d.due} قابل مرور</span>`:''} ${d.mastered>0?`• <span style="color:var(--success)">${d.mastered} تثبیت</span>`:''}</span>
            </div>
            <div style="display:flex;gap:4px">
              ${d.name!=='پیش‌فرض'?`<button type="button" class="btn btn-ghost btn-sm" data-rename="${esc(d.name)}" title="تغییر نام">✏️</button><button type="button" class="btn btn-ghost btn-sm" data-deldeck="${esc(d.name)}" title="حذف دسته" style="color:var(--danger)">🗑️</button>`:''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:16px;text-align:left">
        <button type="button" class="btn btn-ghost" id="closeDeckMgr">بستن</button>
      </div>
    </div>`;
    ov.querySelector('#addDeckBtn').onclick=()=>{
      const name=ov.querySelector('#newDeckName').value.trim();
      if(!name)return;
      if(S.categories.includes(name)){toast('این دسته قبلاً وجود دارد','error');return}
      S.categories.push(name);save();renderDeckModal();toast('دسته «'+name+'» اضافه شد','success');
    };
    ov.querySelector('#newDeckName').onkeydown=(e)=>{if(e.key==='Enter')ov.querySelector('#addDeckBtn').click()};
    ov.querySelectorAll('[data-deldeck]').forEach(btn=>{
      btn.onclick=()=>{
        const name=btn.dataset.deldeck;
        if(!confirm('حذف دسته «'+name+'»؟ کلمات آن به پیش‌فرض منتقل می‌شوند.'))return;
        S.words.forEach(w=>{if(w.category===name)w.category='پیش‌فرض'});
        S.categories=S.categories.filter(c=>c!==name);
        if(!S.categories.includes('پیش‌فرض'))S.categories.unshift('پیش‌فرض');
        save();renderDeckModal();toast('دسته حذف شد','success');
      };
    });
    ov.querySelectorAll('[data-rename]').forEach(btn=>{
      btn.onclick=()=>{
        const oldName=btn.dataset.rename;
        const newName=prompt('نام جدید برای «'+oldName+'»:',oldName);
        if(!newName||newName.trim()===oldName)return;
        S.categories=S.categories.map(c=>c===oldName?newName.trim():c);
        S.words.forEach(w=>{if(w.category===oldName)w.category=newName.trim()});
        save();renderDeckModal();toast('نام تغییر کرد','success');
      };
    });
    ov.querySelector('#closeDeckMgr').onclick=()=>{ov.remove();renderLibrary(document.getElementById('content'))};
  }
  renderDeckModal();
  document.body.appendChild(ov);
  ov.onclick=e=>{if(e.target===ov){ov.remove();renderLibrary(document.getElementById('content'))}};
}

function editWord(id,onClose,store){
const storeArr=store==='longTerm'?S.longTerm:S.words;
const w=storeArr.find(x=>x.id===id);if(!w)return;
const ov=document.createElement('div');ov.className='modal-overlay';
ov.innerHTML=`<div class="modal" style="max-width:560px"><h3>ویرایش کلمه</h3><div style="display:grid;gap:12px">
<label>کلمه</label><input class="input" id="eWord" value="${esc(w.word)}">
<label>ترجمه</label><input class="input" id="eTrans" value="${esc(w.translation)}">
<label>IPA</label><input class="input" id="eIpa" value="${esc(w.ipa||'')}">
<label>دسته</label><select class="input" id="eCat">${S.categories.map(c=>`<option${c===w.category?' selected':''}>${esc(c)}</option>`).join('')}</select>
<label>معنی اصلی</label><input class="input" id="eCoreMeaning" value="${esc(w.coreMeaning||'')}" placeholder="تعریف کوتاه / معنی محوری">
<div id="eEtymologyDisplay" style="font-size:.8rem;color:var(--text2);margin-top:4px;font-style:italic"></div>
<button type="button" class="btn btn-ghost btn-sm" id="eFetchEtymology" style="font-size:.75rem;margin-top:4px">📖 دریافت ریشه‌شناسی از Wiktionary</button>
<label>بخش کلام</label><input class="input" id="ePartOfSpeech" value="${esc(w.partOfSpeech||'')}" placeholder="verb, noun, adj, ...">
<button type="button" class="edit-advanced-toggle" id="eAdvToggle"><span>جزئیات پیشرفته ▼</span><span class="arrow">▼</span></button>
<div class="edit-advanced-fields" id="eAdvFields">
<div><label>تعاریف (هر خط یک تعریف)</label><textarea id="eDefinitions" rows="3">${(w.definitions||[]).join('\n')}</textarea></div>
<div><label>مثال‌ها (هر خط یک مثال) <button type="button" class="btn btn-sm btn-ghost" id="genExamplesBtn" style="font-size:.7rem;padding:2px 8px">تولید خودکار 🤖</button></label><textarea id="eExamples" rows="3">${(w.examples||[]).join('\n')}</textarea><div id="genExamplesStatus" style="font-size:.75rem;color:var(--text2);margin-top:4px"></div></div>
<div><label>بافت / همنشینی</label><textarea id="eContext" rows="2">${esc(w.context||'')}</textarea></div>
<div><label>همنشینی‌ها (با کاما جدا کنید) <button type="button" class="btn btn-ghost btn-sm" id="eAutoColloc" style="font-size:.7rem;padding:2px 8px">پیشنهاد خودکار 🤖</button></label><input class="input" id="eCollocations" value="${(w.collocations||[]).join(', ')}"></div>
<div><label>مترادف‌ها (با کاما جدا کنید)</label><input class="input" id="eSynonyms" value="${(w.synonyms||[]).join(', ')}"></div>
<div><label>متضادها (با کاما جدا کنید)</label><input class="input" id="eAntonyms" value="${(w.antonyms||[]).join(', ')}"></div>
<div><label>خانواده واژگانی (با کاما جدا کنید)</label><input class="input" id="eWordFamily" value="${(w.wordFamily||[]).join(', ')}"></div>
<div><label>یادداشت</label><textarea id="eNote" rows="2">${esc(w.note||'')}</textarea></div>
<div><label>نکته / هشدار</label><textarea id="eTrap" rows="2">${esc(w.trap||'')}</textarea></div>
<div><label>برچسب‌ها (با کاما جدا کنید)</label><input class="input" id="eTags" value="${(w.tags||[]).join(', ')}"></div>
<div><label>منبع</label><input class="input" id="eSource" value="${esc(w.source||'')}"></div>
</div>
<div class="flex"><button type="button" class="btn btn-primary" id="eSave">ذخیره</button><button type="button" class="btn btn-ghost" id="eCancel">لغو</button></div></div></div>`;
document.body.appendChild(ov);
const closeModal=()=>{ov.remove();if(onClose)onClose()};
ov.onclick=e=>{if(e.target===ov)closeModal()};
const onKey=e=>{if(e.key==='Escape'){document.removeEventListener('keydown',onKey);closeModal()}};
document.addEventListener('keydown',onKey);
// Advanced toggle
const advToggle=ov.querySelector('#eAdvToggle');
const advFields=ov.querySelector('#eAdvFields');
advToggle.onclick=()=>{advToggle.classList.toggle('open');advFields.classList.toggle('open')};
// Generate examples button
const genBtn=ov.querySelector('#genExamplesBtn');
const genStatus=ov.querySelector('#genExamplesStatus');
if(genBtn){
  genBtn.onclick=async()=>{
    genBtn.disabled=true;genStatus.textContent='در حال دریافت مثال‌ها...';
    try{
      const word=ov.querySelector('#eWord').value.trim();
      const resp=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if(resp.ok){
        const data=await resp.json();
        if(data[0]){
          const examples=data[0].meanings.flatMap(m=>m.definitions.filter(d=>d.example).map(d=>d.example)).slice(0,5);
          if(examples.length>0){
            const ta=ov.querySelector('#eExamples');
            const existing=ta.value.trim()?ta.value.trim().split('\n'):[];
            const newExamples=[...new Set([...existing,...examples])].slice(0,8);
            ta.value=newExamples.join('\n');
            genStatus.textContent=examples.length+' مثال جدید اضافه شد';
            genStatus.style.color='var(--success)';
          }else{
            genStatus.textContent='مثالی یافت نشد';
            genStatus.style.color='var(--warning)';
          }
        }
      }
    }catch(e){genStatus.textContent='خطا در دریافت';genStatus.style.color='var(--danger)'}
    genBtn.disabled=false;
  };
}
// Fetch etymology button
const etymBtn=ov.querySelector('#eFetchEtymology');
if(etymBtn){
  etymBtn.onclick=async()=>{
    const word=ov.querySelector('#eWord').value.trim();
    if(!word){toast('کلمه‌ای وارد نشده','error');return}
    etymBtn.disabled=true;etymBtn.textContent='در حال دریافت...';
    try{
      const etym=await fetchEtymology(word);
      const disp=ov.querySelector('#eEtymologyDisplay');
      if(etym){disp.textContent=etym;disp.style.color='var(--success)';toast('ریشه‌شناسی دریافت شد','success')}
      else{disp.textContent='ریشه‌شناسی یافت نشد';disp.style.color='var(--warning)'}
    }catch(e){toast('خطا در دریافت','error')}
    etymBtn.disabled=false;etymBtn.textContent='📖 دریافت ریشه‌شناسی از Wiktionary';
  }
// Auto-collocation button
const autoCollocBtn=ov.querySelector('#eAutoColloc');
if(autoCollocBtn){
  autoCollocBtn.onclick=()=>{
    const word=ov.querySelector('#eWord').value.trim();
    if(!word){toast('کلمه‌ای وارد نشده','error');return}
    const suggestions=suggestCollocations(word);
    if(suggestions.length){
      const existing=ov.querySelector('#eCollocations').value.split(',').map(s=>s.trim()).filter(Boolean);
      const merged=[...new Set([...existing,...suggestions])].slice(0,8);
      ov.querySelector('#eCollocations').value=merged.join(', ');
      toast(suggestions.length+' همنشینی پیشنهاد شد','success');
    }else{toast('همنشینی‌ای یافت نشد','info')}
  };
};
}
// Save handler
ov.querySelector('#eSave').onclick=()=>{
w.word=ov.querySelector('#eWord').value.trim();
w.translation=ov.querySelector('#eTrans').value.trim();
w.ipa=ov.querySelector('#eIpa').value.trim();
w.category=ov.querySelector('#eCat').value;
w.coreMeaning=ov.querySelector('#eCoreMeaning').value.trim();
w.partOfSpeech=ov.querySelector('#ePartOfSpeech').value.trim();
w.definitions=ov.querySelector('#eDefinitions').value.split('\n').map(s=>s.trim()).filter(Boolean);
w.examples=ov.querySelector('#eExamples').value.split('\n').map(s=>s.trim()).filter(Boolean);
w.context=ov.querySelector('#eContext').value.trim();
w.collocations=ov.querySelector('#eCollocations').value.split(',').map(s=>s.trim()).filter(Boolean);
w.synonyms=ov.querySelector('#eSynonyms').value.split(',').map(s=>s.trim()).filter(Boolean);
w.antonyms=ov.querySelector('#eAntonyms').value.split(',').map(s=>s.trim()).filter(Boolean);
w.wordFamily=ov.querySelector('#eWordFamily').value.split(',').map(s=>s.trim()).filter(Boolean);
w.note=ov.querySelector('#eNote').value.trim();
w.trap=ov.querySelector('#eTrap').value.trim();
w.tags=ov.querySelector('#eTags').value.split(',').map(s=>s.trim()).filter(Boolean);
w.source=ov.querySelector('#eSource').value.trim();
save();closeModal();if(!onClose)renderLibrary(document.getElementById('content'));else onClose();toast('ذخیره شد','success')};
ov.querySelector('#eCancel').onclick=()=>{document.removeEventListener('keydown',onKey);closeModal()}}

// ═══════════════════════════════════════════
// 3. LONG-TERM MEMORY (with pagination)
// ═══════════════════════════════════════════
let ltFilter='',ltTagFilter='',ltSourceFilter='',ltPage=0;
const LT_PAGE_SIZE=50;
let _ltCache=null,_ltCacheKey='';
function getLtFiltered(){
const key=ltFilter+'|'+ltTagFilter+'|'+ltSourceFilter;
if(_ltCache&&_ltCacheKey===key)return _ltCache;
const items=S.longTerm.filter(w=>{
  if(ltFilter&&!w.word.toLowerCase().includes(ltFilter.toLowerCase())&&!w.translation.toLowerCase().includes(ltFilter.toLowerCase()))return false;
  if(ltTagFilter&&!(w.tags||[]).includes(ltTagFilter))return false;
  if(ltSourceFilter&&w.source!==ltSourceFilter)return false;
  return true;
});
_ltCache=items;_ltCacheKey=key;return items}
function invalidateLtCache(){_ltCache=null;_ltCacheKey=''}
function ltRowHtml(w){
var tier=getFrequencyTier(w.word);
return '<tr><td><strong>'+esc(w.word)+'</strong> <button type="button" class="btn btn-ghost btn-sm" data-speak="'+esc(w.word)+'" style="padding:2px 6px;font-size:.75rem" title="شنیدن تلفظ">🔊</button>'+(w.ipa?'<br><small style="color:var(--text2)">'+esc(w.ipa)+'</small>':'')+(tier?'<br><span class="badge tier-'+tier+'" style="font-size:.6rem">'+tierLabel(tier)+'</span>':'')+'</td><td>'+esc(w.translation)+'</td><td>'+(w.tags||[]).map(function(t){return '<span class="tag" style="font-size:.6rem">'+esc(t)+'</span>'}).join(' ')+(w.source?'<br><small style="color:var(--text2);font-size:.65rem">'+esc(w.source)+'</small>':'')+'</td><td><button type="button" class="btn btn-ghost btn-sm" data-enrich="\'+w.id+\'" title="غنی‌سازی (تعریف/مثال/مترادف)" aria-label="غنی‌سازی">🔍</button><button type="button" class="btn btn-ghost btn-sm" data-translate="\'+w.id+\'" title="دریافت ترجمه" aria-label="ترجمه">🌐</button><button type="button" class="btn btn-ghost btn-sm" data-ltedit="'+w.id+'" aria-label="ویرایش">✏️</button><button type="button" class="btn btn-ghost btn-sm" data-back="'+w.id+'" aria-label="بازگشت به کتابخانه">↩️</button><button type="button" class="btn btn-ghost btn-sm" data-ltdel="'+w.id+'" aria-label="حذف" style="color:var(--danger)">🗑️</button></td></tr>'}
function ltPagerHtml(total,page,pageSize){return makePagerHtml(total,page,pageSize,'lt-pg','ltpg')}
function renderLongterm(c){
const allTags=new Set();const allSources=new Set();
S.longTerm.forEach(function(w){(w.tags||[]).forEach(function(t){allTags.add(t)});if(w.source)allSources.add(w.source)});
const items=getLtFiltered();
const tagOpts=[...allTags].sort().map(function(t){return '<option value="'+esc(t)+'"'+(t===ltTagFilter?' selected':'')+'>'+esc(t)+'</option>'}).join('');
const srcOpts=[...allSources].sort().map(function(s){return '<option value="'+esc(s)+'"'+(s===ltSourceFilter?' selected':'')+'>'+esc(s)+'</option>'}).join('');
const total=items.length;
const p=paginate(total,ltPage,LT_PAGE_SIZE);ltPage=Math.min(ltPage,Math.max(0,p.totalPages-1));
const pageItems=items.slice(p.start,p.end);
c.innerHTML='<div class="filter-bar"><input class="input" placeholder="جستجو..." style="max-width:250px" value="'+esc(ltFilter)+'" id="ltSearch"><select class="input" style="max-width:160px" id="ltTagFilter"><option value="">همه برچسب‌ها</option>'+tagOpts+'</select><select class="input" style="max-width:180px" id="ltSourceFilter"><option value="">همه منابع</option>'+srcOpts+'</select><button type="button" class="btn btn-sm btn-ghost" id="ltFlushCacheBtn" title="پاک کردن کش ترجمه و دیکشنری IndexedDB">🧹 تخلیه کش</button><span style="color:var(--text2);font-size:.85rem">'+total+' کلمه'+(total!==S.longTerm.length?' (از '+S.longTerm.length+')':'')+'</span></div>'+ltPagerHtml(total,ltPage,LT_PAGE_SIZE)+'<div class="table-wrap card"><table><thead><tr><th>کلمه</th><th>ترجمه</th><th>برچسب‌ها</th><th>عملیات</th></tr></thead><tbody>'+(pageItems.length?pageItems.map(ltRowHtml).join(''):'<tr><td colspan="4"><div class="empty"><div class="icon">🧠</div><p>هنوز کلمه‌ای به حافظه بلندمدت منتقل نشده</p><p style="color:var(--text2);font-size:.8rem;margin-top:8px">کلمات تثبیت شده را از کتابخانه به حافظه بلندمدت منتقل کنید</p></div></td></tr>')+'</tbody></table></div>';
document.getElementById('ltSearch').oninput=function(e){ltFilter=e.target.value;ltPage=0;invalidateLtCache();renderLongterm(c);var si=document.getElementById('ltSearch');if(si){si.focus();si.selectionStart=si.selectionEnd=si.value.length}};
document.getElementById('ltTagFilter').onchange=function(e){ltTagFilter=e.target.value;ltPage=0;invalidateLtCache();renderLongterm(c)};
document.getElementById('ltSourceFilter').onchange=function(e){ltSourceFilter=e.target.value;ltPage=0;invalidateLtCache();renderLongterm(c)};
var ltFlush=document.getElementById('ltFlushCacheBtn');
if(ltFlush)ltFlush.onclick=function(){
  ltFlush.disabled=true;ltFlush.textContent='⏳...';
  lookupCacheSizeBytes().then(function(info){
    ltFlush.disabled=false;ltFlush.textContent='🧹 تخلیه کش';
    if(!confirm('🧹 کش ترجمه/دیکشنری (IndexedDB) پاک شود؟\n\n• حجم تقریبی: '+fitBytes(info.bytes)+' ('+info.count+' آیتم)\n• کلمات و پیشرفت شما دست نمی‌خورد.'))return;
    flushLookupCaches().then(function(){toast(info.count+' آیتم ('+fitBytes(info.bytes)+') پاک شد','success')});
  });
};
c.querySelector('tbody').onclick=function(e){
var btn=e.target.closest('button');if(!btn)return;
if(btn.dataset.speak){speakWord(btn.dataset.speak);return}
if(btn.dataset.ltedit){editWord(btn.dataset.ltedit,function(){renderLongterm(c)},'longTerm');return}
if(btn.dataset.enrich){enrichLibraryWord(btn.dataset.enrich,"long-term",c);return}
if(btn.dataset.translate){translateLibraryWord(btn.dataset.translate,"long-term",c);return}
if(btn.dataset.back){var w=S.longTerm.find(function(x){return x.id===btn.dataset.back});if(w){var repo=window.cardRepository.get();var removed=repo.remove(w.id,'longTerm');if(removed.removed){w.box=1;w.nextReviewDate=null;var moved=repo.add(w,'words');if(!moved.added){S.longTerm.push(w);repo.rebuildIndex();toast('انتقال انجام نشد','error');return}save();invalidateLtCache();invalidateLibCache();renderLongterm(c);toast('بازگشت به کتابخانه','success')}}return}
if(btn.dataset.ltdel){var w=S.longTerm.find(function(x){return x.id===btn.dataset.ltdel});var name=w?w.word:'';if(!confirm('\u062d\u0630\u0641 \u00ab'+name+'\u00bb\u061f'))return;var removed=window.cardRepository.get().remove(btn.dataset.ltdel,'longTerm');if(removed.removed){save();invalidateLtCache();renderLongterm(c);toast('\u062d\u0630\u0641 \u0634\u062f','success')}}};
bindPager(c,null,function(v){ltPage=v==='prev'?Math.max(0,ltPage-1):v==='next'?ltPage+1:parseInt(v);renderLongterm(c)});
}

