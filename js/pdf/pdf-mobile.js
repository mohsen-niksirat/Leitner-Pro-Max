// QUICK IMPORT (Bookmarklet + URL paste)
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// PDF-MOBILE — خواننده PDF مخصوص موبایل/تبلت (زیربخش جدا)
// از موتور خواندن موجود استفاده میکند ولی حالت canvas دسکتاپ را لمس نمیکند.
// ═══════════════════════════════════════════
let pdfmLoaded=false;
let pdfmFileName='';
function renderPDFMobile(c){
  if(currentTab!=='pdfmobile')return;
  if(!pdfmLoaded){
    c.innerHTML='<div style="max-width:600px;margin:0 auto">'
      +'<div class="card" style="text-align:center;padding:32px">'
      +'<div style="font-size:2.6rem;margin-bottom:12px">📱</div>'
      +'<h3 style="margin-bottom:8px;color:var(--accent)">خواننده PDF موبایل</h3>'
      +'<p style="color:var(--text2);font-size:.82rem;margin-bottom:20px">برای گوشی طراحی شده — روی کلمه ضربه بزنید تا ترجمه و معنی ببینید.</p>'
      +'<div style="background:var(--bg);border:1px dashed var(--border);border-radius:12px;padding:20px;cursor:pointer" id="pdfmDrop">'
      +'<div style="font-size:2rem;margin-bottom:8px">📂</div>'
      +'<p style="font-size:.85rem">فایل PDF را انتخاب کنید</p>'
      +'<p style="font-size:.72rem;color:var(--text2);margin-top:4px">PDF, TXT</p>'
      +'</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px;align-items:end">'
      +'<div style="text-align:right"><label style="font-size:.7rem;color:var(--text2)">محدوده صفحات (1-5)</label>'
      +'<input class="input" id="pdfmPages" style="max-width:120px;padding:6px 8px;font-size:.8rem" placeholder="همه صفحات"></div>'
      +'<div style="text-align:right"><label style="font-size:.7rem;color:var(--text2)">حداکثر کلمه</label>'
      +'<input class="input" type="number" id="pdfmMax" value="300" min="10" max="5000" style="max-width:90px;padding:6px 8px;font-size:.8rem"></div>'
      +'</div>'
      +'<div id="pdfmStatus" style="color:var(--text2);font-size:.78rem;margin-top:12px"></div>'
      +'<input type="file" id="pdfmFileInput" accept=".pdf,.txt" style="display:none">'
      +'</div></div>';
    var drop=c.querySelector('#pdfmDrop');
    var fi=c.querySelector('#pdfmFileInput');
    if(drop)drop.onclick=function(){fi.click()};
    if(fi)fi.onchange=async function(e){var f=e.target.files[0];if(f)await loadPDFMobile(f)};
    return;
  }
  renderPDFMobileLoaded(c);
}
function renderPDFMobileLoaded(c){
  const doc=readingDoc;
  if(!doc||!doc.pages||!doc.pages.length){
    c.innerHTML='<div class="card" style="text-align:center;padding:30px"><p style="color:var(--text2)">متن استخراج نشد.</p><button class="btn btn-ghost" id="pdfmBack" type="button">بازگشت</button></div>';
    const b=c.querySelector('#pdfmBack');if(b)b.onclick=function(){pdfmLoaded=false;renderPDFMobile(c)};
    return;
  }
  let h='<div class="pdfm-bar" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;padding:8px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">';
  h+='<button class="btn btn-ghost btn-sm" id="pdfmBack" type="button">📂</button>';
  h+='<button class="btn btn-danger btn-sm" id="pdfmClose" type="button">✕</button>';
  h+='<div style="flex:1;min-width:0"><span style="font-size:.78rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(pdfmFileName)+'</span></div>';
  h+='<span style="font-size:.75rem;color:var(--text2)">'+(readingCurrentPage+1)+' / '+doc.totalPages+'</span>';
  h+='<button class="btn btn-ghost btn-sm" id="pdfmPrev" type="button" '+(readingCurrentPage<=0?'disabled':'')+'>‹</button>';
  h+='<button class="btn btn-ghost btn-sm" id="pdfmNext" type="button" '+(readingCurrentPage>=doc.totalPages-1?'disabled':'')+'>›</button>';
  h+='<button class="btn btn-ghost btn-sm" id="pdfmAdd" type="button">📥 افزودن</button>';
  h+='<button class="btn btn-ghost btn-sm" id="pdfmVF" type="button">⚒️ به وکب فورج</button>';
  h+='</div>';
  c.innerHTML=h;
  const page=doc.pages[readingCurrentPage];
  c.innerHTML+='<div class="reading-content-area" id="rdMContent" style="font-size:1.05rem;line-height:2.1;padding:14px 16px;background:var(--bg2);border-radius:12px;min-height:300px;cursor:text">'+renderReadingPageContent(page,doc)+'</div>';
  const back=document.getElementById('pdfmBack');
  if(back)back.onclick=function(){attemptPdfmClose()};
  const close=document.getElementById('pdfmClose');
  if(close)close.onclick=function(){attemptPdfmClose();toast('PDF بسته شد','info')};
  const prev=document.getElementById('pdfmPrev');
  if(prev)prev.onclick=function(){readingCurrentPage=Math.max(0,readingCurrentPage-1);saveReadingSession();savePdfmBookmark();renderPDFMobile(c)};
  const next=document.getElementById('pdfmNext');
  if(next)next.onclick=function(){readingCurrentPage=Math.min(doc.totalPages-1,readingCurrentPage+1);saveReadingSession();savePdfmBookmark();renderPDFMobile(c)};
  const add=document.getElementById('pdfmAdd');
  if(add)add.onclick=function(){showBatchAddPanel(doc)};
  const toVF=document.getElementById('pdfmVF');
  if(toVF)toVF.onclick=function(){pdfmAddPageToVocabForge(page)};
  const content=document.getElementById('rdMContent');
  if(content)content.onclick=async function(e){
    const span=e.target.closest('.reading-word');
    if(!span)return;
    showReadingWordDetail(span.dataset.word,span,doc);
  };
  if(window._readingClickOutside)document.removeEventListener('click',window._readingClickOutside);
  window._readingClickOutside=function(e){
    const wd=document.getElementById('readingWordDetail');
    if(!wd||!wd.classList.contains('visible'))return;
    if(e.target.closest('.reading-word-detail')||e.target.closest('.reading-word'))return;
    wd.classList.remove('visible');
  };
  document.addEventListener('click',window._readingClickOutside);
}
function attemptPdfmClose(){
  pdfmLoaded=false;
  if(readingDoc&&readingDoc.sourceType==='pdf'){readingDoc=null}
  renderPDFMobile(document.getElementById('content'));
}
async function loadPDFMobile(file){
  const status=document.getElementById('pdfmStatus');
  if(status)status.textContent='در حال استخراج متن...';
  try{
    let pages;
    const ext=file.name.split('.').pop().toLowerCase();
    if(ext==='pdf'){
      pages=await extractPDFForReading(file);
    }else if(ext==='txt'){
      pages=extractTXTForReading(await file.text());
    }else{toast('فرمت پشتیبانی نمی‌شود','error');return}
    const rangeStr=document.getElementById('pdfmPages')?document.getElementById('pdfmPages').value.trim():'';
    if(rangeStr){
      const nums=[];
      rangeStr.split(/[,،]/).forEach(function(part){
        part=part.trim();if(!part)return;
        if(part.indexOf('-')>=0){
          const ab=part.split('-');const a=parseInt(ab[0]),b=parseInt(ab[1]);
          if(a&&b&&a<=b){for(let i=a;i<=b;i++)nums.push(i)}
        }else{const n=parseInt(part);if(n)nums.push(n)}
      });
      if(nums.length)pages=pages.filter(function(p,i){return nums.indexOf(i+1)>=0});
    }
    const maxWords=parseInt((document.getElementById('pdfmMax')||{}).value)||0;
    if(maxWords>0){
      let acc=0;
      pages=pages.filter(function(p){
        acc+=extractCleanWords(p.text).length;
        return acc<=maxWords;
      });
    }
    if(!pages.length){toast('هیچ صفحه‌ای در محدوده نیست','error');return}
    readingDoc=buildReadingDoc(pages,file.name,'pdf');
    readingViewMode='raw';
    pdfmFileName=file.name;
    readingCurrentPage=0;
    // Restore the bookmark only after the new document exists.
    pdfmLoaded=true;
    saveReadingSession();
    loadPdfmBookmark();
    renderPDFMobile(document.getElementById('content'));
    const bmPage=readingCurrentPage;
    toast('PDF بارگذاری شد ('+readingDoc.totalPages+' صفحه)'+(bmPage>0?' — ادامه از صفحه '+(bmPage+1):''),'success');
    preloadReadingTranslations();
  }catch(err){
    if(status)status.textContent='';
    toast('خطا در خواندن فایل: '+err.message,'error');
  }
}
function savePdfmBookmark(){
  if(!readingDoc||!pdfmFileName)return;
  try{
    const bm=JSON.parse(localStorage.getItem('leitner_pdfm_bm')||'{}');
    bm[pdfmFileName]={page:readingCurrentPage||0,timestamp:Date.now()};
    const keys=Object.keys(bm);
    if(keys.length>20){const oldest=keys.sort(function(a,b){return(bm[a].timestamp||0)-(bm[b].timestamp||0)})[keys.length-1];delete bm[oldest]}
    localStorage.setItem('leitner_pdfm_bm',JSON.stringify(bm));
  }catch(e){}
}
function loadPdfmBookmark(){
  if(!pdfmFileName||!readingDoc)return;
  try{
    const bm=JSON.parse(localStorage.getItem('leitner_pdfm_bm')||'{}');
    const saved=bm[pdfmFileName];
    if(saved&&typeof saved.page==='number'&&saved.page>0&&saved.page<readingDoc.totalPages)readingCurrentPage=saved.page;
  }catch(e){}
}
function pdfmAddPageToVocabForge(page){
  if(!page)return;
  const words=[...new Set((page.words||[]).map(function(w){return w.toLowerCase()}).filter(function(w){return w&&w.length>=3}))];
  const unknown=words.filter(function(w){return !wordExists(w)});
  if(!unknown.length){toast('همه کلمات این صفحه در کتابخانه موجودند','info');return}
  if(typeof vfAddCards==='function'){
    const added=vfAddCards(unknown.map(function(w){return{word:w,source:'PDF-Mobile: '+(pdfmFileName||'')}}));
    toast(added+' کلمه ناشناخته این صفحه به VocabForge افزوده شد'+(unknown.length-added?' ('+(unknown.length-added)+' تکراری/خارج از محدوده)':''),added?'success':'info');
  }else{
    toast('وکب فورج در دسترس نیست','error');
  }
}

function renderQuickImport(c){
  const bookmarkletCode=`javascript:void(window.open('${location.href.split('?')[0]}?quickimport=1','_blank'))`;
  c.innerHTML=`<div style="max-width:600px;margin:0 auto">
  <div class="card" style="margin-bottom:16px">
    <h3 style="margin-bottom:12px;color:var(--accent)">⚡ ورود سریع کلمات</h3>
    <p style="color:var(--text2);font-size:.85rem;margin-bottom:16px">کلمات انگلیسی را از هر صفحه وب سریع به لایتنر اضافه کنید.</p>
    <div style="margin-bottom:16px">
      <label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:6px">بوکمارکلت (آن را به نوار بوکمارک بکشید):</label>
      <a href="${esc(bookmarkletCode)}" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,var(--accent),#7c6cf0);color:#fff;border-radius:10px;font-weight:600;font-size:.85rem;cursor:grab" onclick="event.preventDefault()">📥 افزودن به لایتنر</a>
    </div>
    <div style="padding:12px;background:var(--bg);border-radius:8px;font-size:.8rem;color:var(--text2);line-height:1.8">
      <strong>راهنما:</strong><br>
      ۱. دکمه بالا را به نوار بوکمارک مرورگر بکشید<br>
      ۲. در هر صفحه انگلیسی، روی بوکمارک کلیک کنید<br>
      ۳. کلمات انتخاب شده مستقیماً به لایتنر اضافه می‌شوند
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <h3 style="margin-bottom:12px">📝 افزودن دستی کلمات</h3>
    <p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">کلمات را هر خط یکی وارد کنید (فرمت: word یا word=ترجمه)</p>
    <textarea id="quickImportText" class="input" rows="6" placeholder="hello=سلام&#10;world=دنیا&#10;book&#10;water=آب" style="width:100%;resize:vertical;font-family:monospace"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button type="button" class="btn btn-primary" id="quickImportBtn">افزودن کلمات</button>
      <button type="button" class="btn btn-ghost" id="quickImportClearBtn">پاک کردن</button>
    </div>
    <div id="quickImportResult" style="margin-top:12px"></div>
  </div>
  <div class="card">
    <h3 style="margin-bottom:12px">📋 کلمات اخیر وارد شده</h3>
    <div id="recentWordsList"></div>
  </div>
</div>`;

  // Show recent words
  const recentDiv=document.getElementById('recentWordsList');
  if(recentDiv){
    const recent=S.words.slice(-10).reverse();
    if(recent.length===0)recentDiv.innerHTML='<p style="color:var(--text2);font-size:.85rem">هنوز کلمه‌ای وارد نشده.</p>';
    else recentDiv.innerHTML=recent.map(w=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--border);font-size:.85rem"><span><strong>${esc(w.word)}</strong> ${w.translation?'— '+esc(w.translation):''}</span><span style="color:var(--text2)">${fmtDate(w.addedDate)}</span></div>`).join('');
  }

  // Bind quick import
  document.getElementById('quickImportBtn').onclick=async function(){
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
        try{
          const resp=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|fa`);
          const data=await resp.json();
          if(data.responseStatus===200&&data.responseData)autoTranslation=data.responseData.translatedText;
        }catch(e){}
      }
      const _r=window.repoAdd?window.repoAdd(createCard({word:word,translation:autoTranslation,source:'quick-import'}),'words'):null;
      if(_r&&_r.added)added++;
    }
    save();
    resultDiv.innerHTML=`<div style="padding:10px;background:${added>0?'var(--success)':'var(--warning)'};color:#fff;border-radius:8px;font-size:.85rem">${added>0?added+' کلمه اضافه شد!':'کلمه جدیدی یافت نشد (تکراری یا خالی)'}</div>`;
    document.getElementById('quickImportText').value='';
    renderQuickImport(c);
  };
  document.getElementById('quickImportClearBtn').onclick=()=>{document.getElementById('quickImportText').value='';document.getElementById('quickImportResult').innerHTML=''};
}
// ═══════════════════════════════════════════
