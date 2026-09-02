// 4. IMPORT (with Anki + URL import)
// ═══════════════════════════════════════════
let importStep=0,importRawText='',importWords=[],importExisting=new Set(),importSelected=new Set(),importTranslations=[],importCategory='پیش‌فرض',importFilter='all',importTransProgress={done:0,total:0};
let textRenderedWords=[];
let translatedItems=[];
let selectedTextItems=[];

// ═══ STAGED IMPORT — selection before adding ═══
let _stagedImportCards=[]; // cards waiting for user selection
let _stagedImportSource='';

function stageImportCards(cards,source){
  const existingWords=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));
  const fresh=cards.filter(w=>!existingWords.has((w.word||'').toLowerCase())).map(sanitizeCard);
  const dupCount=cards.length-fresh.length;
  if(!fresh.length){toast('همه '+cards.length+' کلمه تکراری بودند','info');return false}
  _stagedImportCards=fresh.map(c=>({...c,_selected:true}));
  _stagedImportSource=source||'import';
  currentTab='import';
  renderNav();
  document.getElementById('pageTitle').textContent='ورود';
  requestAnimationFrame(function(){
    renderStagedImport(document.getElementById('content'));
  });
  toast(fresh.length+' کلمه آماده انتخاب'+(dupCount?' ('+dupCount+' تکراری)':''),'success');
  return true;
}

async function commitStagedImport(dest){
  const selected=_stagedImportCards.filter(c=>c._selected);
  if(!selected.length){toast('کلمه‌ای انتخاب نشده','error');return}
  const cat=document.getElementById('stgCategory')?.value||'';
  const destLabel=dest==='longTerm'?'حافظه بلندمدت':'کتابخانه';
  const existingWords=new Set(S.words.map(w=>w.word.toLowerCase()));
  const existingLT=new Set(S.longTerm.map(w=>w.word.toLowerCase()));
  const BATCH=50;
  let totalAdded=0,totalSkipped=0;
  const statusEl=document.getElementById('stgProgress');
  for(let i=0;i<selected.length;i+=BATCH){
    const batch=selected.slice(i,i+BATCH);
    let batchAdded=0;
    batch.forEach(c=>{
      const w=c.word.toLowerCase();
      if(existingWords.has(w)||existingLT.has(w)){totalSkipped++;return}
      const card=sanitizeCard(c);
      if(cat)card.category=cat;
      if(dest==='longTerm'){card.box=0;card.nextReviewDate=null;const result=window.cardRepository?.get()?.add(card,'longTerm');if(!result?.added){totalSkipped++;return;}existingLT.add(w)}
      else{const result=window.cardRepository?.get()?.add(card,'words');if(!result?.added){totalSkipped++;return;}existingWords.add(w)}
      batchAdded++;
      totalAdded++;
    });
    if(statusEl)statusEl.textContent='در حال افزودن... '+totalAdded+'/'+selected.length;
    try{await saveForce();}
    catch(e){
      if(dest==='longTerm')S.longTerm.splice(S.longTerm.length-batchAdded,batchAdded);
      else S.words.splice(S.words.length-batchAdded,batchAdded);
      totalAdded-=batchAdded;
      toast('حافظه پر شد — '+totalAdded+' کلمه ذخیره شد','error');
      break;
    }
  }
  const addedWords=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));
  _stagedImportCards=_stagedImportCards.filter(c=>!addedWords.has(c.word.toLowerCase()));
  let msg=totalAdded+' کلمه به '+destLabel+' اضافه شد';
  if(totalSkipped)msg+=' ('+totalSkipped+' تکراری)';
  if(_stagedImportCards.length)msg+=' — '+_stagedImportCards.filter(c=>c._selected).length+' باقیمانده';
  if(statusEl)statusEl.textContent='';
  toast(msg,'success');
  if(!_stagedImportCards.length){
    // Import complete — go back to import tab (re-renders packs grid)
    currentTab='import';
    _stagedImportCards=[];
    render();
    return;
  }
  renderStagedImport(document.getElementById('content'));
}

function renderStagedImport(c){
  const cards=_stagedImportCards;
  const selCount=cards.filter(c=>c._selected).length;
  const existingWords=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));
  c.innerHTML=`
  <div class="card" style="margin-bottom:16px;border:1px solid var(--accent)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-size:1.3rem">📋</span>
      <h3 style="margin:0">انتخاب کلمات برای ورود</h3>
    </div>
    <p style="font-size:.82rem;color:var(--text2);margin-bottom:10px">${cards.length} کلمه یافت شد. کلمات مورد نظر را انتخاب کنید و مقصد را مشخص کنید.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <button type="button" class="btn btn-ghost btn-sm" id="stgSelAll">انتخاب همه</button>
      <button type="button" class="btn btn-ghost btn-sm" id="stgDeselAll">لغو همه</button>
      <input class="input" id="stgFilter" placeholder="🔍 فیلتر..." style="max-width:160px;font-size:.8rem;padding:6px 10px">
      <span style="color:var(--text2);font-size:.8rem;margin-right:auto">${selCount} انتخاب شده</span>
    </div>
    <div id="stgList" style="max-height:50vh;overflow-y:auto;background:var(--bg);border-radius:10px;padding:6px"></div>
    <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
      <select class="input" id="stgCategory" style="max-width:160px;padding:6px 10px;font-size:.82rem">
        <option value="">بدون تغییر دسته</option>
        ${S.categories.map(c=>'<option>'+esc(c)+'</option>').join('')}
      </select>
      <button type="button" class="btn btn-primary" id="stgAddLib" ${selCount===0?'disabled':''}>📚 کتابخانه (${selCount})</button>
      <button type="button" class="btn btn-success" id="stgAddLT" ${selCount===0?'disabled':''}>🧠 حافظه بلندمدت (${selCount})</button>
      <button type="button" class="btn btn-ghost" id="stgCancel">لغو</button>
    </div>
    <div id="stgProgress" style="margin-top:8px;font-size:.8rem;color:var(--accent);min-height:18px"></div>
  </div>`;

  function refreshList(){
    const filter=(document.getElementById('stgFilter')?.value||'').toLowerCase();
    const list=document.getElementById('stgList');
    const filtered=cards.filter(c=>!filter||c.word.toLowerCase().includes(filter));
    list.innerHTML=filtered.map((c)=>{
      const idx=cards.indexOf(c);
      const dup=existingWords.has(c.word.toLowerCase());
      return`<label style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:6px;cursor:pointer;transition:background .15s;${dup?'opacity:.4':''}" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" data-idx="${idx}" ${c._selected?'checked':''} ${dup?'disabled':''} style="accent-color:var(--accent);width:15px;height:15px">
        <span style="font-weight:600;min-width:90px;font-size:.85rem">${esc(c.word)}</span>
        ${c.partOfSpeech?`<span style="font-size:.7rem;color:var(--text3)">${esc(c.partOfSpeech)}</span>`:''}
        <span style="flex:1;font-size:.8rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((c.translation||c.coreMeaning||'').slice(0,50))}</span>
        ${dup?'<span style="font-size:.6rem;color:var(--warning);background:rgba(243,156,18,.1);padding:1px 5px;border-radius:4px">تکراری</span>':''}
      </label>`;
    }).join('');
    list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      cb.onchange=()=>{const idx=parseInt(cb.dataset.idx);cards[idx]._selected=cb.checked;updateSelCount()}
    });
  }
  function updateSelCount(){
    const cnt=cards.filter(c=>c._selected).length;
    const cntEl=document.querySelector('[style*="margin-right:auto"]');
    if(cntEl)cntEl.textContent=cnt+' انتخاب شده';
    const libBtn=document.getElementById('stgAddLib');
    const ltBtn=document.getElementById('stgAddLT');
    if(libBtn){libBtn.disabled=cnt===0;libBtn.innerHTML='📚 کتابخانه ('+cnt+')'}
    if(ltBtn){ltBtn.disabled=cnt===0;ltBtn.innerHTML='🧠 حافظه بلندمدت ('+cnt+')'}
  }
  refreshList();
  document.getElementById('stgFilter').oninput=refreshList;
  document.getElementById('stgSelAll').onclick=()=>{cards.forEach(c=>{if(!existingWords.has(c.word.toLowerCase()))c._selected=true});refreshList();updateSelCount()};
  document.getElementById('stgDeselAll').onclick=()=>{cards.forEach(c=>c._selected=false);refreshList();updateSelCount()};
  document.getElementById('stgCancel').onclick=()=>{_stagedImportCards=[];render()};
  document.getElementById('stgAddLib').onclick=()=>commitStagedImport('words');
  document.getElementById('stgAddLT').onclick=()=>commitStagedImport('longTerm');
}

function parseWords(t){return[...new Set(t.toLowerCase().replace(/[^\w\s'-]/g,' ').split(/\s+/).filter(w=>w.length>=2&&!/^\d+$/.test(w)&&!/^[^a-z]+$/.test(w)))]}

function calcImportStats(){
const unique=[...new Set(importWords)];
const newW=unique.filter(w=>!importExisting.has(w));
return{total:importWords.length,unique:unique.length,existing:unique.length-newW.length,newCount:newW.length}}

function renderImportSteps(){
const labels=['فایل و URL','انتخاب کلمات','ترجمه','عملیات'];
let h='<div class="import-steps">';
for(let i=0;i<4;i++){
const cls=i<importStep?'done':i===importStep?'active':'';
h+=`<div style="text-align:center"><div class="import-step-dot ${cls}">${i<importStep?'✓':i+1}</div><div class="import-step-label">${labels[i]}</div></div>`;
if(i<3)h+=`<div class="import-step-line${i<importStep?' done':''}"></div>`}
h+='</div>';return h}

function renderImport(c){
let h=renderImportSteps();
if(importStep===0)h+=renderImportStep0();
else if(importStep===1)h+=renderSelectableTextSection();
else if(importStep===2)h+=renderImportStep2();
else if(importStep===3)h+=renderTranslatedResults();
else if(importStep===4)h+=renderImportStep4();
c.innerHTML=h;bindImportEvents()}

function renderImportStep0(){
return`<div class="card" style="margin-bottom:16px">
  <h3 style="margin-bottom:10px">📂 ورود فایل</h3>
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <input type="file" id="fileInput" accept=".txt,.pdf,.docx,.json,.apkg" style="display:none">
    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('fileInput').click()">انتخاب فایل</button>
    <span style="color:var(--text2);font-size:.82rem">TXT, PDF, DOCX, JSON, Anki (.apkg)</span>
  </div>
</div>

<div class="card" style="margin-bottom:16px;border:1px solid var(--accent)">
  <h3 style="margin-bottom:8px;color:var(--accent);font-size:.95rem">📥 ورود هوشمند DOCX واژگان</h3>
  <p style="color:var(--text2);font-size:.82rem;margin-bottom:10px">فایل DOCX حاوی واژگان با ساختار غنی را وارد کنید. تعاریف، مثال‌ها، مترادف‌ها و متضادها خودکار استخراج می‌شوند.</p>
  <div style="display:flex;align-items:center;gap:8px">
    <input type="file" id="richDocxInput" accept=".docx" style="display:none">
    <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('richDocxInput').click()">📂 انتخاب فایل DOCX</button>
    <span style="color:var(--text2);font-size:.78rem">مانند Manhattan 500</span>
  </div>
</div>

<div class="card" style="margin-bottom:16px">
  <h3 style="margin-bottom:8px">🔗 ورود از URL</h3>
  <div style="display:flex;gap:6px">
    <input class="input" id="importUrl" placeholder="https://example.com/words.txt" style="flex:1;padding:7px 10px;font-size:.82rem">
    <button type="button" class="btn btn-ghost btn-sm" id="importUrlBtn">دریافت</button>
  </div>
</div>

<div class="card" style="margin-bottom:16px;border:1px solid var(--accent);background:linear-gradient(135deg,rgba(108,92,231,.06),rgba(162,155,254,.03))">
  <h3 style="margin-bottom:4px;color:var(--accent);font-size:.95rem">📦 بسته‌های لغت آماده</h3>
  <p style="color:var(--text2);font-size:.8rem;margin-bottom:12px">بسته را انتخاب کنید — کلمات قبل از ورود قابل انتخاب هستند</p>
  <div style="display:grid;gap:8px" id="ready-packs-grid"></div>
</div>

<div class="card" style="margin-bottom:16px">
  <h3 style="margin-bottom:8px;color:var(--accent);font-size:.95rem">⚡ افزودن سریع کلمات</h3>
  <p style="color:var(--text2);font-size:.82rem;margin-bottom:10px">هر خط یک کلمه (فرمت: word یا word=ترجمه)</p>
  <textarea id="quickImportText" class="input" rows="3" placeholder="hello=سلام&#10;world=دنیا&#10;book&#10;water=آب" style="width:100%;resize:vertical;font-family:monospace;font-size:.85rem"></textarea>
  <div style="display:flex;gap:6px;margin-top:8px">
    <button type="button" class="btn btn-primary btn-sm" id="quickImportBtn">افزودن</button>
    <button type="button" class="btn btn-ghost btn-sm" id="quickImportClearBtn">پاک کردن</button>
  </div>
  <div id="quickImportResult" style="margin-top:8px"></div>
</div>`}

function renderSelectableTextSection(){
if(!textRenderedWords.length){
  if(!importRawText.trim())return`<div class="card"><p style="color:var(--text2)">متنی وارد نشده است</p></div>`;
  textRenderedWords=parseWords(importRawText).map((w,i)=>({id:i,word:w,selected:false}));
}
const selCount=textRenderedWords.filter(w=>w.selected).length;
let h=`<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:10px">انتخاب کلمات</h3>`;
h+=`<p style="color:var(--text2);font-size:.85rem;margin-bottom:10px">بر روی کلمات کلیک کنید تا انتخاب شوند</p>`;
h+=`<div class="text-selectable">`;
textRenderedWords.forEach(w=>{
  h+=`<span class="text-word${w.selected?' selected':''}" data-wid="${w.id}">${esc(w.word)}</span> `;
});
h+=`</div>`;
h+=`<div class="sel-actions">`;
h+=`<button type="button" class="btn btn-ghost" id="tsBack">بازگشت</button>`;
h+=`<button type="button" class="btn btn-ghost btn-sm" id="tsSelectAll">انتخاب همه</button>`;
h+=`<button type="button" class="btn btn-ghost btn-sm" id="tsDeselectAll">لغو انتخاب</button>`;
h+=`<button type="button" class="btn btn-primary" id="tsTranslate"${selCount===0?' disabled':''}>ترجمه انتخاب شده (${selCount})</button>`;
h+=`</div></div>`;
return h}

function renderImportStep2(){
const pct=importTransProgress.total?Math.round(importTransProgress.done/importTransProgress.total*100):0;
return`<div class="card import-progress-card"><div class="trans-spinner" style="width:40px;height:40px;margin:0 auto 16px;border-width:3px"></div><h3 style="margin-bottom:8px">در حال ترجمه</h3><p style="color:var(--text2)">${importTransProgress.done} از ${importTransProgress.total}</p><div class="progress-bar import-progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`}

function renderTranslatedResults(){
let h=`<div class="card" style="margin-bottom:16px">`;
h+=`<h3 style="margin-bottom:10px">نتایج ترجمه</h3>`;
if(!translatedItems.length){
  h+=`<p style="color:var(--text2)">هیچ انتخاب ترجمه شده‌ای وجود ندارد</p>`;
  h+=`</div>`;return h;
}
const activeItems=translatedItems.filter(t=>!t.moved);
const selCount=activeItems.filter(t=>t.selected).length;
h+=`<div style="display:flex;justify-content:space-between;margin-bottom:10px"><div style="display:flex;gap:6px">`;
h+=`<button type="button" class="btn btn-ghost btn-sm" id="trSelAll">انتخاب همه</button>`;
h+=`<button type="button" class="btn btn-ghost btn-sm" id="trDeselAll">لغو انتخاب</button>`;
h+=`</div><span style="color:var(--text2);font-size:.85rem">${selCount} انتخاب شده</span></div>`;
translatedItems.forEach(t=>{
  h+=`<div class="translated-item${t.moved?' moved':''}" style="flex-direction:column;align-items:stretch;gap:6px">`;
  h+=`<div style="display:flex;align-items:center;gap:10px"><input type="checkbox" data-tid="${t.id}"${t.selected?' checked':''}${t.moved?' disabled':''}>`;
  h+=`<span class="tw">${esc(t.text)}</span>`;
  h+=`<input type="text" class="input" data-tid-trans="${t.id}" value="${esc(t.translation||'')}" style="flex:1;padding:6px 10px;font-size:.85rem;direction:rtl" placeholder="ترجمه را ویرایش کنید...">`;
  h+=`</div>`;
  if(t.definitions&&t.definitions.length){h+=`<div style="font-size:.78rem;color:var(--text2);padding-right:20px">${t.definitions.slice(0,2).map(d=>'• '+esc(d)).join(' ')}</div>`}
  if(t.examples&&t.examples.length){h+=`<div style="font-size:.75rem;color:var(--text2);font-style:italic;padding-right:20px;border-right:2px solid var(--accent);padding-left:8px;margin-top:2px">${t.examples.slice(0,1).map(ex=>'"'+esc(ex)+'"').join(' ')}</div>`}
  h+=`</div>`;
});
h+=`<div class="sel-actions">`;
h+=`<button type="button" class="btn btn-ghost" id="trNewText">متن جدید</button>`;
h+=`<button type="button" class="btn btn-danger btn-sm" id="trRemove"${selCount===0?' disabled':''}>حذف انتخاب شده</button>`;
h+=`<button type="button" class="btn btn-success" id="trAddLTM"${selCount===0?' disabled':''}>افزودن به حافظه بلندمدت (${selCount})</button>`;
h+=`<button type="button" class="btn btn-primary" id="trAddLeitner"${selCount===0?' disabled':''}>افزودن به لایتنر (${selCount})</button>`;
h+=`</div></div>`;
return h}

function renderImportStep4(){
const added=importTransProgress.added||0,skipped=importTransProgress.skipped||0,failed=importTransProgress.failed||0;
return`<div class="card import-done-card"><div style="font-size:3rem;margin-bottom:16px">✅</div><h2 style="margin-bottom:16px">ورود کامل شد</h2><div class="import-stat-grid" style="margin-bottom:20px"><div class="import-stat"><div class="val" style="color:var(--success)">${added}</div><div class="lbl">اضافه شد</div></div><div class="import-stat"><div class="val" style="color:var(--warning)">${skipped}</div><div class="lbl">تکراری رد شد</div></div>${failed?`<div class="import-stat"><div class="val" style="color:var(--danger)">${failed}</div><div class="lbl">ناموفق</div></div>`:''}</div><button type="button" class="btn btn-primary" id="impAgain">ورود مجدد</button></div>`}

async function translateSelectedItems(){
const toTranslate=textRenderedWords.filter(w=>w.selected);
if(!toTranslate.length)return;
importStep=2;importTransProgress={done:0,total:toTranslate.length};
renderImport(document.getElementById('content'));
translatedItems=[];
for(let i=0;i<toTranslate.length;i+=5){
const batch=toTranslate.slice(i,i+5);
const results=await Promise.all(batch.map(async w=>{try{
const arr=await Promise.all([fetchTranslation(w.word),fetchDictionary(w.word)]);
const transResult=arr[0],dictResult=arr[1];
const allDefs=dictResult?dictResult.meanings.flatMap(m=>m.definitions):[];
const allExamples=dictResult?dictResult.meanings.flatMap(m=>m.examples):[];
const allSynonyms=dictResult?dictResult.meanings.flatMap(m=>m.synonyms):[];
const pos=dictResult&&dictResult.meanings[0]?dictResult.meanings[0].partOfSpeech:'';
return{id:uid(),text:w.word,translation:transResult||'',ipa:dictResult?(dictResult.phoneticBr||dictResult.phoneticUs||dictResult.phonetic||''):'',definitions:allDefs,examples:allExamples,synonyms:allSynonyms,partOfSpeech:pos,audioUs:dictResult?dictResult.audioUs||'':'',audioBr:dictResult?dictResult.audioBr||'':'',selected:true,moved:false,createdAt:new Date().toISOString()};
}catch(e){return{id:uid(),text:w.word,translation:'',selected:true,moved:false,createdAt:new Date().toISOString()}}}));
translatedItems.push(...results);
importTransProgress.done=Math.min(i+5,toTranslate.length);
renderImport(document.getElementById('content'))}
importStep=3;textRenderedWords.forEach(w=>w.selected=false);
renderImport(document.getElementById('content'));
toast(translatedItems.filter(t=>t.translation).length+' کلمه ترجمه شد','success')}

function moveSelectedToLeitner(){
const toAdd=translatedItems.filter(t=>t.selected&&t.translation&&!t.moved);
let added=0,skipped=0;
toAdd.forEach(t=>{
if(wordExists(t.text)){skipped++;t.moved=true;return}
const card=createCard({word:t.text,translation:t.translation,ipa:t.ipa||'',category:importCategory,definitions:t.definitions||[],examples:t.examples||[],synonyms:t.synonyms||[],partOfSpeech:t.partOfSpeech||'',audioUs:t.audioUs||'',audioBr:t.audioBr||''});
if(!window.cardRepository?.get()?.add(card,'words')?.added){toast('کلمه تکراری بود','info');return;}
t.moved=true;added++});
save();
renderImport(document.getElementById('content'));
if(added)toast(added+' کلمه به لایتنر ضمیمه شد','success');
if(skipped)toast(skipped+' کلمه تکراری بود','info')}

function moveSelectedToLongTermMemory(){
const toAdd=translatedItems.filter(t=>t.selected&&t.translation&&!t.moved);
let added=0,skipped=0;
toAdd.forEach(t=>{
if(wordExists(t.text)){skipped++;t.moved=true;return}
const card=createCard({word:t.text,translation:t.translation,ipa:t.ipa||'',category:importCategory,definitions:t.definitions||[],examples:t.examples||[],synonyms:t.synonyms||[],partOfSpeech:t.partOfSpeech||'',audioUs:t.audioUs||'',audioBr:t.audioBr||''});
if(!window.cardRepository?.get()?.add(card,'longTerm')?.added){toast('کلمه تکراری بود','info');return;}
t.moved=true;added++});
save();
renderImport(document.getElementById('content'));
if(added)toast(added+' کلمه به حافظه بلندمدت ضمیمه شد','success');
if(skipped)toast(skipped+' کلمه تکراری بود','info')}

function removeSelectedItems(){
translatedItems=translatedItems.filter(t=>!t.selected||t.moved);
if(!translatedItems.filter(t=>!t.moved).length){translatedItems=[];importStep=1;textRenderedWords.forEach(w=>w.selected=false)}
renderImport(document.getElementById('content'));
toast('حذف شد','success')}

function refreshSelectionActions(){
const activeItems=translatedItems.filter(t=>!t.moved);
const selCount=activeItems.filter(t=>t.selected).length;
['trAddLeitner','trAddLTM','trRemove'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=selCount===0})}

function bindImportEvents(){
if(importStep===0){
const fi=document.getElementById('fileInput');
if(fi)fi.onchange=handleFileImport;
// Rich DOCX import handler
const richDocx=document.getElementById('richDocxInput');
if(richDocx)richDocx.onchange=async e=>{const file=e.target.files[0];if(!file)return;try{toast('در حال پردازش فایل DOCX...','info');await ensureJsZip();const buf=await file.arrayBuffer();const zip=await JSZip.loadAsync(buf);let cards=[];try{cards=await parseDocxTableStructured(zip)}catch(e){}if(!cards.length){const xml=await zip.file('word/document.xml').async('text');const parser=new DOMParser();const doc=parser.parseFromString(xml,'text/xml');const texts=doc.getElementsByTagName('w:t');let txt='';for(let i=0;i<texts.length;i++)txt+=texts[i].textContent+' ';cards=parseDocxToVocabJSON(txt)}if(!cards.length){toast('هیچ واژه‌ای از فایل استخراج نشد','error');return}toast(cards.length+' واژه استخراج شد','success');stageImportCards(cards,'docx')}catch(e){toast('خطا در پردازش فایل DOCX: '+e.message,'error')};e.target.value=''};const urlBtn=document.getElementById('importUrlBtn');if(urlBtn)urlBtn.onclick=async()=>{const url=document.getElementById('importUrl')?.value?.trim();if(!url){toast('URL وارد نشده','error');return}try{toast('در حال دریافت...','info');const r=await fetch(url);if(!r.ok)throw new Error(r.status);const txt=await r.text();importRawText=txt;textRenderedWords=parseWords(txt).map((w,i)=>({id:i,word:w,selected:false}));importStep=1;renderImport(document.getElementById('content'));toast('متن دریافت شد','success')}catch(e){toast('خطا در دریافت URL','error')}}
// Quick import handler
const qiBtn=document.getElementById('quickImportBtn');
if(qiBtn)qiBtn.onclick=async function(){
const text=document.getElementById('quickImportText').value.trim();
if(!text)return;
const lines=text.split('\n').map(l=>l.trim()).filter(l=>l);
const resultDiv=document.getElementById('quickImportResult');
let added=0;
for(const line of lines){
const parts=line.split('=');
const word=parts[0].trim().toLowerCase();
const translation=(parts[1]||'').trim();
if(!word||wordExists(word))continue;
let autoTranslation=translation;
if(!autoTranslation){
try{const resp=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(word)+'&langpair=en|fa');const data=await resp.json();if(data.responseStatus===200&&data.responseData)autoTranslation=data.responseData.translatedText;}catch(e){}}
window.cardRepository?.get()?.add(createCard({word:word,translation:autoTranslation,source:'quick-import'}),'words');
added++;}
save();
resultDiv.innerHTML='<div style="padding:10px;background:'+(added>0?'var(--success)':'var(--warning)')+';color:#fff;border-radius:8px;font-size:.85rem">'+(added>0?added+' کلمه اضافه شد!':'کلمه جدیدی یافت نشد (تکراری یا خالی)')+'</div>';
document.getElementById('quickImportText').value='';
};
const qiClear=document.getElementById('quickImportClearBtn');
if(qiClear)qiClear.onclick=()=>{document.getElementById('quickImportText').value='';document.getElementById('quickImportResult').innerHTML='';}
decorateImportHelp();
}
else if(importStep===1){
document.querySelectorAll('.text-word').forEach(el=>{
el.onclick=()=>{const wid=parseInt(el.dataset.wid);const w=textRenderedWords.find(x=>x.id===wid);if(w){w.selected=!w.selected;el.classList.toggle('selected');const selCount=textRenderedWords.filter(x=>x.selected).length;const btn=document.getElementById('tsTranslate');if(btn){btn.disabled=selCount===0;btn.textContent='ترجمه انتخاب شده ('+selCount+')'}}};
});
const back=document.getElementById('tsBack');
if(back)back.onclick=()=>{importStep=0;renderImport(document.getElementById('content'))};
const selAll=document.getElementById('tsSelectAll');
if(selAll)selAll.onclick=()=>{textRenderedWords.forEach(w=>w.selected=true);renderImport(document.getElementById('content'))};
const deselAll=document.getElementById('tsDeselectAll');
if(deselAll)deselAll.onclick=()=>{textRenderedWords.forEach(w=>w.selected=false);renderImport(document.getElementById('content'))};
const trans=document.getElementById('tsTranslate');
if(trans)trans.onclick=()=>{translateSelectedItems()}}
else if(importStep===3){
document.querySelectorAll('[data-tid]').forEach(cb=>{
cb.onchange=()=>{const tid=cb.dataset.tid;const item=translatedItems.find(t=>t.id===tid);if(item){item.selected=cb.checked;refreshSelectionActions()}};
});
document.querySelectorAll('[data-tid-trans]').forEach(inp=>{
inp.oninput=()=>{const tid=inp.dataset.tidTrans;const item=translatedItems.find(t=>t.id===tid);if(item){item.translation=inp.value}};
});
const sa=document.getElementById('trSelAll');
if(sa)sa.onclick=()=>{translatedItems.filter(t=>!t.moved).forEach(t=>t.selected=true);renderImport(document.getElementById('content'))};
const da=document.getElementById('trDeselAll');
if(da)da.onclick=()=>{translatedItems.forEach(t=>t.selected=false);renderImport(document.getElementById('content'))};
const back=document.getElementById('trNewText');
if(back)back.onclick=()=>{importStep=0;importRawText='';textRenderedWords=[];translatedItems=[];selectedTextItems=[];renderImport(document.getElementById('content'))};
const addLeitner=document.getElementById('trAddLeitner');
if(addLeitner)addLeitner.onclick=()=>{moveSelectedToLeitner()};
const addLTM=document.getElementById('trAddLTM');
if(addLTM)addLTM.onclick=()=>{moveSelectedToLongTermMemory()};
const removeBtn=document.getElementById('trRemove');
if(removeBtn)removeBtn.onclick=()=>{removeSelectedItems()}}
else if(importStep===4){
const again=document.getElementById('impAgain');
if(again)again.onclick=()=>{importStep=0;importWords=[];importSelected.clear();importTranslations=[];translatedItems=[];textRenderedWords=[];importRawText='';renderImport(document.getElementById('content'))}}}

// ═══════════════════════════════════════════
// FILE IMPORT HANDLER
// ═══════════════════════════════════════════
async function handleFileImport(e){
const file=e.target.files[0];if(!file)return;
const ext=file.name.split('.').pop().toLowerCase();
if(ext==='json'){const txt=await file.text();try{const d=JSON.parse(txt);const result=importStateSnapshot(d);if(!result.ok)toast(result.msg,'error')}catch(e){toast('خطا در خواندن JSON','error')}}
else if(ext==='txt'){const txt=await file.text();importRawText=txt;importWords=parseWords(txt);importExisting=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));importSelected=new Set(importWords.map((_,i)=>i).filter(i=>!importExisting.has(importWords[i])));importStep=1;renderImport(document.getElementById('content'))}
else if(ext==='pdf'){try{await ensurePdfJs();if(!pdfjsLib.GlobalWorkerOptions.workerSrc||pdfjsLib.GlobalWorkerOptions.workerSrc.includes('cdnjs')){try{const wr=await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');const wb=await wr.blob();pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(wb)}catch(x){pdfjsLib.GlobalWorkerOptions.workerSrc=''}}const buf=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf,disableFontFace:false,useSystemFonts:true,cMapUrl:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',cMapPacked:true}).promise;let txt='';for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const c=await p.getTextContent();txt+=c.items.map(x=>x.str).join(' ')+' '}importRawText=txt;importWords=parseWords(txt);importExisting=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));importSelected=new Set(importWords.map((_,i)=>i).filter(i=>!importExisting.has(importWords[i])));importStep=1;renderImport(document.getElementById('content'))}catch(e){toast('خطا در خواندن فایل PDF','error')}}
else if(ext==='docx'){try{await ensureJsZip();const buf=await file.arrayBuffer();const zip=await JSZip.loadAsync(buf);const xml=await zip.file('word/document.xml').async('text');const parser=new DOMParser();const doc=parser.parseFromString(xml,'text/xml');const texts=doc.getElementsByTagName('w:t');let txt='';for(let i=0;i<texts.length;i++)txt+=texts[i].textContent+' ';importRawText=txt;importWords=parseWords(txt);importExisting=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));importSelected=new Set(importWords.map((_,i)=>i).filter(i=>!importExisting.has(importWords[i])));importStep=1;renderImport(document.getElementById('content'))}catch(e){toast('خطا در خواندن فایل DOCX','error')}}
else if(ext==='apkg'){try{toast('در حال پردازش فایل Anki...','info');await ensureJsZip();const buf=await file.arrayBuffer();const zip=await JSZip.loadAsync(buf);const dbFile=zip.file('collection.anki21')||zip.file('collection.anki2');if(!dbFile){toast('فایل Anki معتبر نیست','error');return}const sqlBuf=await dbFile.async('arraybuffer');if(!window.initSqlJs){toast('در حال بارگذاری مفسر SQLite...','info');await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});window._sqlModule=await initSqlJs({locateFile:f=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/'+f})}const db=new window._sqlModule.Database(new Uint8Array(sqlBuf));const rows=db.exec('SELECT flds FROM notes');if(!rows.length||!rows[0].values.length){toast('هیچ کارتی یافت نشد','error');return}let txt='';rows[0].values.forEach(r=>{const fields=String(r[0]).split('\x1f');txt+=fields[0]+' '+fields[1]+' '});db.close();importRawText=txt;importWords=parseWords(txt);importExisting=new Set([...S.words,...S.longTerm].map(w=>w.word.toLowerCase()));importSelected=new Set(importWords.map((_,i)=>i).filter(i=>!importExisting.has(importWords[i])));importStep=1;renderImport(document.getElementById('content'));toast(`${importWords.length} کلمه استخراج شد`,'success')}catch(e){toast('خطا در خواندن فایل Anki','error')}}
e.target.value=''}

// ═══════════════════════════════════════════
// DOCX TABLE STRUCTURED PARSER
// ═══════════════════════════════════════════
const DOCX_NS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
function getDocxCellText(tc){
  const ns=DOCX_NS;
  const ps=tc.querySelectorAll('p');
  const lines=[];
  for(const p of ps){
    const runs=p.querySelectorAll('t');
    let line='';
    for(const t of runs) line+=t.textContent;
    lines.push(line.trim());
  }
  return lines.join('\n');
}
function parseDocxTableStructured(zip){
  return new Promise(async (resolve,reject)=>{
    try{
      const xml=await zip.file('word/document.xml').async('text');
      const parser=new DOMParser();
      const doc=parser.parseFromString(xml,'text/xml');
      const tables=doc.getElementsByTagName('w:tbl');
      if(!tables.length){resolve([]);return}
      const cards=[];
      for(let ti=0;ti<tables.length;ti++){
        const rows=tables[ti].getElementsByTagName('w:tr');
        for(let ri=0;ri<rows.length;ri++){
          const cells=rows[ri].getElementsByTagName('w:tc');
          if(cells.length<2)continue;
          const word=getDocxCellText(cells[0]).trim();
          const translation=getDocxCellText(cells[1]).trim();
          if(!word||!translation||word.length<2)continue;
          let ipa='',pos='',def='',ex='',syn='',ant='';
          if(cells.length>2)ipa=getDocxCellText(cells[2]).trim();
          if(cells.length>3)pos=getDocxCellText(cells[3]).trim();
          if(cells.length>4)def=getDocxCellText(cells[4]).trim();
          if(cells.length>5)ex=getDocxCellText(cells[5]).trim();
          if(cells.length>6)syn=getDocxCellText(cells[6]).trim();
          if(cells.length>7)ant=getDocxCellText(cells[7]).trim();
          cards.push({word,translation,ipa:ipa.replace(/[\/\[\]]/g,''),partOfSpeech:pos,definitions:def?def.split('\n').filter(d=>d):[],examples:ex?ex.split('\n').filter(e=>e):[],synonyms:syn?syn.split(/[,،]/).map(s=>s.trim()).filter(s=>s):[],antonyms:ant?ant.split(/[,،]/).map(a=>a.trim()).filter(a=>a):[]});
        }
      }
      resolve(cards);
    }catch(e){reject(e)}
  });
}
function parseDocxToVocabJSON(text){
  const lines=text.split('\n').map(l=>l.trim()).filter(l=>l);
  const cards=[];
  for(const line of lines){
    const parts=line.split(/[\t|,;،]/);
    if(parts.length>=2){
      const word=parts[0].trim();
      const translation=parts[1].trim();
      if(word.length>=2&&translation.length>=1){
        cards.push({word,translation,ipa:parts[2]||'',partOfSpeech:parts[3]||'',definitions:[],examples:[],synonyms:[],antonyms:[]});
      }
    }
  }
  return cards;
}
function ensureJsZip(){return new Promise((resolve,reject)=>{if(window.JSZip){resolve();return}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
function decorateImportHelp(){
  const el=document.querySelector('#import-help');
  if(el)el.innerHTML='<div style="font-size:.82rem;color:var(--text2);margin-top:10px"><b>💡 نکته:</b> فایل متنی باید هر خط شامل یک کلمه انگلیسی باشد. فرمت‌های پشتیبانی شده: TXT, CSV, JSON</div>';
}
