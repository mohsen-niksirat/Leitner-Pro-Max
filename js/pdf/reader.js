// 5. PDF READER (native iframe rendering)
// ═══════════════════════════════════════════
let pdfBlobUrl=null,pdfFileName='';
let pdfTextMode=false; // toggle between embed and text reflow
let pdfTextPages=[];   // extracted text per page
let pdfTotalPages=0;
let pdfCurrentPage=0;
let pdfScale=1.5;
let pdfRenderAbort=null;
let pdfBookmarks={};   // fileName -> {page,scrollY}
let pdfHighlightUnknown=false; // highlight words not in library/long-term
// PDF reader may be loaded before enrichment; keep lookup normalization local.
function pdfNormalizeWord(text){return String(text||'').trim().toLowerCase().replace(/^[^a-zA-Z]+|[^a-zA-Z']+$/g,'').replace(/'+/g,"'")}

// PDF persistence helpers
const PDF_STORAGE_KEY='leitner_pdf_state';
function savePdfState(){
try{const state={fileName:pdfFileName,page:pdfCurrentPage,scale:pdfScale};localStorage.setItem(PDF_STORAGE_KEY,JSON.stringify(state))}catch(e){}}
function loadPdfState(){try{return JSON.parse(localStorage.getItem(PDF_STORAGE_KEY))}catch(e){return null}}
function clearPdfState(){try{localStorage.removeItem(PDF_STORAGE_KEY)}catch(e){}}
function savePdfBookmark(){
  if(!pdfFileName)return;
  try{
    const bm=JSON.parse(localStorage.getItem('leitner_pdf_bm')||'{}');
    bm[pdfFileName]={page:pdfCurrentPage||0,scrollY:0,timestamp:Date.now()};
    // Keep max 20 bookmarks
    const keys=Object.keys(bm);
    if(keys.length>20){const oldest=keys.sort((a,b)=>(bm[a].timestamp||0)-(bm[b].timestamp||0))[0];delete bm[oldest]}
    localStorage.setItem('leitner_pdf_bm',JSON.stringify(bm));
  }catch(e){}
}
function loadPdfBookmark(){
  if(!pdfFileName)return null;
  try{const bm=JSON.parse(localStorage.getItem('leitner_pdf_bm')||'{}');return bm[pdfFileName]||null}catch(e){return null}
}
// ── Highlight unknown words (not in library / long-term) in the PDF text layer ──
function pdfKnownSet(){
  var known={};
  (S.words||[]).forEach(function(w){known[String(w.word||'').toLowerCase()]=1});
  (S.longTerm||[]).forEach(function(w){known[String(w.word||'').toLowerCase()]=1});
  return known;
}
function applyPdfUnknownMarksOnLayer(layer){
  if(!layer)return;
  var known=pdfKnownSet();
  var spans=layer.querySelectorAll('span[data-word]');
  for(var i=0;i<spans.length;i++){
    var w=spans[i].getAttribute('data-word').toLowerCase();
    if(pdfHighlightUnknown&&!known[w])spans[i].classList.add('pdf-unknown-word');
    else spans[i].classList.remove('pdf-unknown-word');
  }
}
function applyPdfUnknownMarksAll(){
  document.querySelectorAll('.pdf-canvas-textlayer').forEach(applyPdfUnknownMarksOnLayer);
}
async function extractPdfTextPages(file){
  await ensurePdfJs();
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const tc=await page.getTextContent();
    pages.push({pageNum:i,text:tc.items.map(x=>x.str).join(' '),items:tc.items});
  }
  return{pdf,pages};
}

function renderPDFReader(c){
if(!pdfBlobUrl){
c.innerHTML=`<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">📄</div><p>فایل PDF را باز کنید تا شروع به خواندن کنید</p><p style="color:var(--text2);font-size:.8rem;margin-top:8px">روی هر کلمه دابل‌کلیک کنید تا ترجمه و تلفظ آن را ببینید</p><div style="margin-top:16px"><input type="file" id="pdfFileInput" accept=".pdf" style="display:none"><button type="button" class="btn btn-primary" id="pdfOpen">📂 انتخاب فایل PDF</button></div></div></div>`;
document.getElementById('pdfOpen').onclick=()=>document.getElementById('pdfFileInput').click();
document.getElementById('pdfFileInput').onchange=async e=>{const f=e.target.files[0];if(f)await openPDF(f)};return}
const truncName=pdfFileName.length>35?pdfFileName.slice(0,32)+'...':pdfFileName;
c.innerHTML=`<div class="pdf-toolbar" id="pdfToolbar"><button type="button" class="btn btn-ghost btn-sm" id="pdfOpen2" title="فایل جدید">📂</button><input type="file" id="pdfFileInput2" accept=".pdf" style="display:none"><button type="button" class="btn btn-ghost btn-sm" id="pdfCloseBtn" title="بستن PDF" style="color:var(--danger)">✕ بستن</button><div class="pdf-sep"></div><span style="color:var(--text2);font-size:.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:250px" title="${esc(pdfFileName)}">${esc(truncName)}</span><div style="flex:1"></div><button type="button" class="btn btn-sm ${pdfTextMode?'btn-primary':'btn-ghost'}" id="pdfTextModeBtn" title="حالت متن">${pdfTextMode?'📄 متن':'📑 PDF'}</button><button type="button" class="btn btn-ghost btn-sm" id="pdfBookmarkBtn" title="نشانک صفحه">🔖</button>
<button type="button" class="btn btn-ghost btn-sm" id="pdfUnknownBtn" title="برجسته کردن کلمات ناشناخته">🆕</button>
<input type="text" id="pdfWordSearch" placeholder="🔍 جستجوی کلمه..." style="max-width:180px;padding:6px 10px;font-size:.8rem;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-family:var(--font)">
<div class="pdf-sep"></div>
<button type="button" class="btn btn-ghost btn-sm" id="pdfFirstPage" title="صفحه اول"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg></button>
<button type="button" class="btn btn-ghost btn-sm" id="pdfPrevPage" title="صفحه قبل"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
<button type="button" class="btn btn-ghost btn-sm" id="pdfPageIndicator" title="کلیک برای رفتن به صفحه" style="font-size:.82rem;font-weight:600;color:var(--accent);padding:6px 8px">—</button>
<button type="button" class="btn btn-ghost btn-sm" id="pdfNextPage" title="صفحه بعد"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<button type="button" class="btn btn-ghost btn-sm" id="pdfLastPage" title="صفحه آخر"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg></button>
<div class="pdf-sep"></div>
<button type="button" class="btn btn-primary btn-sm" id="pdfTranslateBtn">🔍 ترجمه</button></div>${pdfTextMode?`<div style="width:100%;height:calc(100vh - 140px);min-height:500px;overflow-y:auto;padding:24px;background:var(--bg2);border-radius:var(--radius);line-height:2;font-size:1rem" id="pdfTextContent">${pdfTextPages.length?pdfTextPages.map(p=>'<div class="pdf-text-page" data-page="'+p.pageNum+'" style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border)"><div style="color:var(--text2);font-size:.75rem;margin-bottom:8px">📄 صفحه '+p.pageNum+'</div><div style="white-space:pre-wrap;word-break:break-word;cursor:text;user-select:text">'+esc(p.text)+'</div></div>').join(''):'<div style="text-align:center;padding:40px;color:var(--text2)">در حال استخراج متن...</div>'}</div>`:`<div style="width:100%;height:calc(100vh - 140px);min-height:500px;overflow-y:auto;padding:16px;background:var(--bg2);border-radius:var(--radius)" id="pdfViewerWrap"><div id="pdfCanvasContainer" style="display:flex;flex-direction:column;align-items:center;gap:16px"><div style="text-align:center;padding:40px;color:var(--text2)">📄 در حال بارگذاری PDF...</div></div></div>`}`;
document.getElementById('pdfOpen2').onclick=()=>document.getElementById('pdfFileInput2').click();
document.getElementById('pdfFileInput2').onchange=async e=>{const f=e.target.files[0];if(f)await openPDF(f)};
document.getElementById('pdfCloseBtn').onclick=()=>{savePdfBookmark();pdfBlobUrl=null;pdfFileName='';pdfTextMode=false;pdfTextPages=[];clearPdfState();renderPDFReader(document.getElementById('content'));toast('PDF بسته شد','info')};
// Text mode toggle
var textModeBtn=document.getElementById('pdfTextModeBtn');
if(textModeBtn){textModeBtn.onclick=function(){
  pdfTextMode=!pdfTextMode;
  if(pdfTextMode&&pdfTextPages.length===0){
    toast('در حال استخراج متن...','info');
    fetch(pdfBlobUrl).then(r=>r.blob()).then(b=>extractPdfTextPages(b)).then(result=>{
      pdfTextPages=result.pages;pdfTotalPages=result.pages.length;
      renderPDFReader(document.getElementById('content'));
    }).catch(e=>toast('خطا در استخراج متن','error'));
    return;
  }
  renderPDFReader(document.getElementById('content'));
}}
// Bookmark button
var bookmarkBtn=document.getElementById('pdfBookmarkBtn');
if(bookmarkBtn){bookmarkBtn.onclick=function(){
  savePdfBookmark();
  toast('نشانک ذخیره شد (صفحه '+(pdfCurrentPage||0)+')','success');
}}
// Unknown-word highlight toggle
var unknownBtn=document.getElementById('pdfUnknownBtn');
if(unknownBtn){unknownBtn.onclick=function(){
  pdfHighlightUnknown=!pdfHighlightUnknown;
  unknownBtn.style.color=pdfHighlightUnknown?'var(--warning)':'';
  unknownBtn.style.background=pdfHighlightUnknown?'rgba(253,203,110,.15)':'';
  applyPdfUnknownMarksAll();
  toast(pdfHighlightUnknown?'کلمات ناشناخته برجسته شدند (خارج از کتابخانه)':'برجسته‌سازی کلمات ناشناخته غیرفعال شد','info');
}}
// Translate button always works
document.getElementById('pdfTranslateBtn').onclick=function(){
  var btn=document.getElementById('pdfTranslateBtn');
  var rect=btn.getBoundingClientRect();
  showPdfTranslateInput(rect.left,rect.bottom+8);
};
// Render PDF canvas pages if in PDF mode
if(!pdfTextMode&&pdfBlobUrl){
  renderPDFCanvasPages(pdfBlobUrl);
}
// PDF page navigation
function pdfGoToPage(pageNum){
  var container=document.getElementById('pdfCanvasContainer');
  if(!container)return;
  var target=container.querySelector('[data-page="'+pageNum+'"]');
  if(target){
    target.scrollIntoView({behavior:'smooth',block:'start'});
    pdfCurrentPage=pageNum;
    var indicator=document.getElementById('pdfPageIndicator');
    if(indicator)indicator.textContent=pageNum+'/'+pdfTotalPages;
  }
}
var pdfFirstBtn=document.getElementById('pdfFirstPage');
if(pdfFirstBtn)pdfFirstBtn.onclick=function(){pdfGoToPage(1)};
var pdfPrevBtn=document.getElementById('pdfPrevPage');
if(pdfPrevBtn)pdfPrevBtn.onclick=function(){pdfGoToPage(Math.max(1,(pdfCurrentPage||1)-1))};
var pdfNextBtn=document.getElementById('pdfNextPage');
if(pdfNextBtn)pdfNextBtn.onclick=function(){pdfGoToPage(Math.min(pdfTotalPages,(pdfCurrentPage||1)+1))};
var pdfLastBtn=document.getElementById('pdfLastPage');
if(pdfLastBtn)pdfLastBtn.onclick=function(){pdfGoToPage(pdfTotalPages)};
var pdfPageInd=document.getElementById('pdfPageIndicator');
if(pdfPageInd)pdfPageInd.onclick=function(){
  var num=prompt('شماره صفحه (1-'+pdfTotalPages+'):',pdfCurrentPage||1);
  if(num){var n=parseInt(num);if(n>=1&&n<=pdfTotalPages)pdfGoToPage(n);else toast('شماره صفحه نامعتبر','error')}
};
// Track current page on scroll
var pdfViewerWrap=document.getElementById('pdfViewerWrap');
if(pdfViewerWrap){
  pdfViewerWrap.addEventListener('scroll',function(){
    var container=document.getElementById('pdfCanvasContainer');
    if(!container)return;
    var pages=container.querySelectorAll('[data-page]');
    var scrollTop=pdfViewerWrap.scrollTop;
    var viewH=pdfViewerWrap.clientHeight;
    for(var i=0;i<pages.length;i++){
      var rect=pages[i].getBoundingClientRect();
      var wrapRect=pdfViewerWrap.getBoundingClientRect();
      var relTop=rect.top-wrapRect.top;
      if(relTop<=viewH*0.4&&relTop+rect.height>0){
        var pn=parseInt(pages[i].getAttribute('data-page'));
        if(pn&&pn!==pdfCurrentPage){
          pdfCurrentPage=pn;
          var indicator=document.getElementById('pdfPageIndicator');
          if(indicator)indicator.textContent=pn+'/'+pdfTotalPages;
        }
      }
    }
  });
}
// PDF word search
var pdfSearchInput=document.getElementById('pdfWordSearch');
if(pdfSearchInput){
  var pdfSearchTimer;
  pdfSearchInput.oninput=function(){
    clearTimeout(pdfSearchTimer);
    var query=this.value.trim().toLowerCase();
    if(!query||query.length<2){
      document.querySelectorAll('.pdf-search-highlight').forEach(function(el){
        el.style.background='';el.classList.remove('pdf-search-highlight');
      });
      return;
    }
    pdfSearchTimer=setTimeout(function(){
      if(pdfTextMode){
        var textContent=document.getElementById('pdfTextContent');
        if(!textContent)return;
        textContent.querySelectorAll('.pdf-search-match').forEach(function(el){
          el.style.background='';el.classList.remove('pdf-search-match');
        });
        var pages=textContent.querySelectorAll('.pdf-text-page');
        var found=false;
        for(var i=0;i<pages.length;i++){
          var text=pages[i].textContent.toLowerCase();
          if(text.includes(query)){
            pages[i].scrollIntoView({behavior:'smooth',block:'start'});
            pages[i].style.background='rgba(253,203,110,.15)';
            pages[i].classList.add('pdf-search-match');
            if(!found){found=true;toast('یافت شد در صفحه '+pages[i].getAttribute('data-page'),'success')}
          }else{
            pages[i].style.background='';
            pages[i].classList.remove('pdf-search-match');
          }
        }
        if(!found)toast('یافت نشد','info');
      }
    },300);
  };
  pdfSearchInput.onkeydown=function(e){
    if(e.key==='Enter'){
      clearTimeout(pdfSearchTimer);
      var query=this.value.trim().toLowerCase();
      if(!query||query.length<2)return;
      if(pdfTextMode){
        var textContent=document.getElementById('pdfTextContent');
        if(!textContent)return;
        var pages=textContent.querySelectorAll('.pdf-text-page');
        for(var i=0;i<pages.length;i++){
          if(pages[i].textContent.toLowerCase().includes(query)){
            pages[i].scrollIntoView({behavior:'smooth',block:'start'});
            toast('صفحه '+pages[i].getAttribute('data-page'),'success');
            return;
          }
        }
        toast('یافت نشد','info');
      }
    }
    if(e.key==='Escape')this.value='';
  };
}
// Text mode: double-click to translate word
var pdfTextContent=document.getElementById('pdfTextContent');
if(pdfTextContent){
  pdfTextContent.addEventListener('dblclick',function(e){
    var selection=window.getSelection();
    var selectedText=selection?selection.toString().trim():'';
    if(selectedText&&selectedText.length>=2&&selectedText.length<=50){
      var cleanWord=pdfNormalizeWord(selectedText);
      if(cleanWord&&cleanWord.length>=2){
        showPdfTranslateInput(e.clientX,e.clientY);
        setTimeout(function(){
          var input=document.getElementById('pdfTranslateInput');
          if(input){input.value=cleanWord;input.dispatchEvent(new Event('input'))}
        },100);
      }
    }
  });
  pdfTextContent.addEventListener('mouseup',function(e){
    setTimeout(function(){
      var selection=window.getSelection();
      var selectedText=selection?selection.toString().trim():'';
      if(selectedText&&selectedText.length>=2&&selectedText.length<=50){
        var cleanWord=pdfNormalizeWord(selectedText);
        if(cleanWord&&cleanWord.length>=2){
          showPdfSelectionHelper(e.clientX,e.clientY,cleanWord);
        }
      }
    },10);
  });
}
// Close popup when clicking outside
document.addEventListener('click',function(e){
  var popup=document.getElementById('pdfTranslatePopup');
  if(!popup)return;
  if(e.target.closest('#pdfTranslatePopup')||e.target.closest('#pdfTranslateBtn'))return;
  if(e.target.closest('#pdfSelectionHelper'))return;
  hidePdfTranslateInput();
});
var selHelper=document.getElementById('pdfSelectionHelper');
if(selHelper)selHelper.remove();
document.onkeydown=null;
}

function showPdfTranslateInput(x,y){
  hidePdfTranslateInput();
  var popup=document.createElement('div');
  popup.id='pdfTranslatePopup';
  popup.style.cssText='position:fixed;z-index:320;background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.5);backdrop-filter:blur(12px);width:400px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;font-family:var(--font);direction:ltr;text-align:left';
  var left=Math.min(x,window.innerWidth-420);
  var top=Math.min(y,window.innerHeight-200);
  if(left<16)left=16;
  if(top<16)top=16;
  popup.style.left=left+'px';
  popup.style.top=top+'px';
  popup.innerHTML='<div class="wd-drag-handle" style="display:flex;align-items:center;gap:6px;padding:10px 14px;cursor:move;background:var(--bg);border-bottom:1px solid var(--border);border-radius:16px 16px 0 0;flex-shrink:0"><span style="color:var(--text2);font-size:.7rem;letter-spacing:2px;user-select:none">⠿</span><span style="flex:1;text-align:center;font-size:.8rem;color:var(--text2)">در حال جستجو...</span><button type="button" id="pdfTranslateClose" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:1rem;padding:2px 6px;line-height:1">✕</button></div><div id="pdfTranslateResult" style="padding:14px;overflow-y:auto;flex:1"><div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو...</div></div>';
  document.body.appendChild(popup);
  // Make draggable
  var handle=popup.querySelector('.wd-drag-handle');
  var isDragging=false,dragOffX=0,dragOffY=0;
  handle.onmousedown=function(e){
    if(e.target.id==='pdfTranslateClose')return;
    isDragging=true;
    var pRect=popup.getBoundingClientRect();
    dragOffX=e.clientX-pRect.left;dragOffY=e.clientY-pRect.top;
    popup.style.transition='none';
    document.onmousemove=function(ev){
      if(!isDragging)return;
      var nx=ev.clientX-dragOffX,ny=ev.clientY-dragOffY;
      nx=Math.max(0,Math.min(nx,window.innerWidth-popup.offsetWidth-4));
      ny=Math.max(0,Math.min(ny,window.innerHeight-popup.offsetHeight-4));
      popup.style.left=nx+'px';popup.style.top=ny+'px';
    };
    document.onmouseup=function(){isDragging=false;document.onmousemove=null;document.onmouseup=null;popup.style.transition=''};
    e.preventDefault();
  };
  document.getElementById('pdfTranslateClose').onclick=hidePdfTranslateInput;
  // Auto-translate if word provided (from double-click/selection)
  var inputTimer=null;
  setTimeout(function(){
    var sel=window.getSelection();
    var selText=sel?sel.toString().trim():'';
    if(selText&&selText.length>=2&&selText.length<=50){
      var clean=pdfNormalizeWord(selText);
      if(clean&&clean.length>=2){
        doPdfTranslateSmart(clean);
        return;
      }
    }
    showPdfSearchInput(popup);
  },50);
}

function showPdfSearchInput(popup){
  var resultDiv=document.getElementById('pdfTranslateResult');
  if(!resultDiv)return;
  resultDiv.innerHTML='<div style="padding:8px 0"><input type="text" id="pdfSearchWordInput" class="input" placeholder="کلمه را تایپ کنید..." style="width:100%;padding:10px 14px;font-size:.9rem;direction:ltr;text-align:left" autocomplete="off" spellcheck="false"><div id="pdfSearchResult" style="margin-top:10px"></div></div>';
  var input=document.getElementById('pdfSearchWordInput');
  if(input){
    input.focus();
    var st;
    input.oninput=function(){
      clearTimeout(st);
      var w=pdfNormalizeWord(input.value);
      if(w&&w.length>=2){st=setTimeout(function(){doPdfTranslateSmart(w)},400)}
      else{document.getElementById('pdfSearchResult').innerHTML=''}
    };
    input.onkeydown=function(e){if(e.key==='Escape')hidePdfTranslateInput();if(e.key==='Enter'){clearTimeout(st);var w=pdfNormalizeWord(input.value);if(w&&w.length>=2)doPdfTranslateSmart(w)}};
  }
}

async function doPdfTranslateSmart(word){
  var resultDiv=document.getElementById('pdfTranslateResult');
  if(!resultDiv)return;
  // Guard: only ever look up/store a single word. Multi-word selections
  // (scanned/multi-column PDFs) must not become cards or be auto-added.
  word=pdfNormalizeWord(word).split(/[\s\u00A0]+/)[0]||'';
  if(word.length<2){hidePdfTranslateInput();return}
  resultDiv.innerHTML='<div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو...</div>';
  // Smart lookup: check existing library first
  var existingCard=S.words.find(function(x){return x.word.toLowerCase()===word.toLowerCase()})
    ||S.longTerm.find(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var exists=S.words.some(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var inLT=S.longTerm.some(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var cached=getCachedTrans(word);
  if(!cached){
    if(existingCard){
      cached={translation:existingCard.translation||'',ipa:existingCard.ipa||'',pos:existingCard.partOfSpeech||'',definitions:existingCard.definitions||[],examples:existingCard.examples||[],synonyms:existingCard.synonyms||[],antonyms:existingCard.antonyms||[],audioUs:existingCard.audioUs||'',audioBr:existingCard.audioBr||'',coreMeaning:existingCard.coreMeaning||''};
      var needsEnrich=!cached.definitions.length||!cached.translation||!cached.ipa;
      if(needsEnrich){
        var dict=await fetchDictionary(word);
        if(dict){
          if(!cached.ipa)cached.ipa=dict.phoneticBr||dict.phoneticUs||dict.phonetic||'';
          if(!cached.pos)cached.pos=dict.meanings[0]?dict.meanings[0].partOfSpeech:'';
          if(!cached.definitions.length)cached.definitions=dict.meanings.flatMap(function(m){return m.definitions}).slice(0,5);
          if(!cached.examples.length)cached.examples=dict.meanings.flatMap(function(m){return m.examples}).slice(0,4);
          if(!cached.synonyms.length)cached.synonyms=dict.meanings.flatMap(function(m){return m.synonyms}).slice(0,6);
          if(!cached.antonyms.length)cached.antonyms=dict.meanings.flatMap(function(m){return m.antonyms||[]}).slice(0,4);
          if(!cached.audioUs)cached.audioUs=dict.audioUs||'';
          if(!cached.audioBr)cached.audioBr=dict.audioBr||'';
        }
        if(!cached.translation){
          var defToTranslate='';
          if(cached.definitions.length){var fd=cached.definitions[0];defToTranslate=typeof fd==='string'?fd:(fd.definition||'')}
          if(defToTranslate)cached.translation=await fetchTranslation(defToTranslate)||'';
          if(!cached.translation)cached.translation=await fetchTranslation(word)||'';
        }
      }
    }else{
      var dict=await fetchDictionary(word);
      cached={translation:'',ipa:'',pos:'',definitions:[],examples:[],synonyms:[],antonyms:[],audioUs:'',audioBr:'',coreMeaning:''};
      if(dict){
        cached.ipa=dict.phoneticBr||dict.phoneticUs||dict.phonetic||'';
        cached.pos=dict.meanings[0]?dict.meanings[0].partOfSpeech:'';
        cached.definitions=dict.meanings.flatMap(function(m){return m.definitions}).slice(0,5);
        cached.examples=dict.meanings.flatMap(function(m){return m.examples}).slice(0,4);
        cached.synonyms=dict.meanings.flatMap(function(m){return m.synonyms}).slice(0,6);
        cached.antonyms=dict.meanings.flatMap(function(m){return m.antonyms||[]}).slice(0,4);
        cached.audioUs=dict.audioUs||'';
        cached.audioBr=dict.audioBr||'';
      }
      if(cached.definitions.length){var fd=cached.definitions[0];cached.coreMeaning=typeof fd==='string'?fd:(fd.definition||'')}
      if(cached.coreMeaning)cached.translation=await fetchTranslation(cached.coreMeaning)||'';
      if(!cached.translation)cached.translation=await fetchTranslation(word)||'';
    }
    cacheTrans(word,cached);
  }
  // Build rich popup content (same as reading section)
  var h='';
  var tier=getFrequencyTier(word);
  // Header
  h+='<div style="text-align:center;margin-bottom:12px">';
  h+='<div style="font-size:1.5rem;font-weight:800;color:var(--accent);margin-bottom:4px">'+esc(word)+'</div>';
  if(cached.ipa)h+='<div style="color:var(--text2);font-size:.9rem;margin-bottom:2px">/'+esc(cached.ipa)+'/</div>';
  h+='<div style="display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap">';
  if(cached.pos)h+='<span class="badge badge-accent">'+esc(cached.pos)+'</span>';
  if(tier)h+='<span class="badge tier-'+tier+'">'+tierLabel(tier)+'</span>';
  if(exists)h+='<span class="badge badge-success">✅ لایتنر</span>';
  if(inLT)h+='<span class="badge badge-warning">🧠 حافظه بلندمدت</span>';
  h+='</div></div>';
  // Core meaning
  if(cached.coreMeaning)h+='<div style="text-align:center;font-size:1rem;font-weight:600;color:var(--text);margin-bottom:8px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);direction:ltr;text-align:left">'+esc(cached.coreMeaning)+'</div>';
  // Persian translation
  if(cached.translation)h+='<div style="text-align:center;font-size:1.1rem;font-weight:700;color:var(--success);margin-bottom:12px;padding:8px;background:var(--bg);border-radius:10px" title="ترجمه فارسی">'+esc(cached.translation)+'</div>';
  // Audio buttons
  h+='<div style="display:flex;gap:6px;justify-content:center;margin-bottom:12px">';
  h+='<button type="button" class="trans-audio-btn" data-speak="'+esc(word)+'" title="شنیدن">🔊</button>';
  if(cached.audioUs)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioUs)+'" title="American">🇺🇸</button>';
  if(cached.audioBr)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioBr)+'" title="British">🇬🇧</button>';
  h+='</div>';
  // Tabs
  h+='<div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:10px">';
  h+='<button type="button" class="wd-tab active" data-wtab="info" style="flex:1;padding:6px;border:none;background:none;color:var(--accent);font:inherit;font-size:.78rem;font-weight:600;cursor:pointer;border-bottom:2px solid var(--accent)">📖 تعریف</button>';
  h+='<button type="button" class="wd-tab" data-wtab="examples" style="flex:1;padding:6px;border:none;background:none;color:var(--text2);font:inherit;font-size:.78rem;cursor:pointer;border-bottom:2px solid transparent">💬 مثال</button>';
  h+='<button type="button" class="wd-tab" data-wtab="related" style="flex:1;padding:6px;border:none;background:none;color:var(--text2);font:inherit;font-size:.78rem;cursor:pointer;border-bottom:2px solid transparent">🔗 مرتبط</button>';
  h+='</div>';
  // Definitions tab
  h+='<div class="wd-tab-content" data-wtab="info">';
  if(cached.definitions.length){
    cached.definitions.slice(0,5).forEach(function(d){
      var def=typeof d==='string'?d:(d.definition||'');
      h+='<div style="font-size:.85rem;line-height:1.7;margin-bottom:6px;padding:6px 10px;background:var(--bg);border-radius:8px;border-right:3px solid var(--accent);direction:ltr;text-align:left">'+esc(def)+'</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">تعریفی یافت نشد</div>'}
  h+='</div>';
  // Examples tab
  h+='<div class="wd-tab-content" data-wtab="examples" style="display:none">';
  if(cached.examples.length){
    cached.examples.slice(0,4).forEach(function(ex){
      h+='<div style="font-size:.85rem;font-style:italic;line-height:1.7;margin-bottom:8px;padding:8px 12px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success);direction:ltr;text-align:left">"'+esc(ex)+'"</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">مثالی یافت نشد</div>'}
  h+='</div>';
  // Related tab
  h+='<div class="wd-tab-content" data-wtab="related" style="display:none">';
  if(cached.synonyms.length){
    h+='<div style="margin-bottom:10px"><div style="font-size:.75rem;color:var(--success);font-weight:600;margin-bottom:6px">🔄 مترادفها</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
    cached.synonyms.slice(0,8).forEach(function(s){h+='<span style="padding:4px 10px;border-radius:8px;font-size:.8rem;background:rgba(0,184,148,.1);color:var(--success);border:1px solid rgba(0,184,148,.2)">'+esc(s)+'</span>'});
    h+='</div></div>';
  }
  if(cached.antonyms&&cached.antonyms.length){
    h+='<div><div style="font-size:.75rem;color:var(--danger);font-weight:600;margin-bottom:6px">⚡ متضادها</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
    cached.antonyms.slice(0,6).forEach(function(a){h+='<span style="padding:4px 10px;border-radius:8px;font-size:.8rem;background:rgba(225,112,85,.1);color:var(--danger);border:1px solid rgba(225,112,85,.2)">'+esc(a)+'</span>'});
    h+='</div></div>';
  }
  if(!cached.synonyms.length&&!(cached.antonyms&&cached.antonyms.length)){h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">مورد مرتبطی یافت نشد</div>'}
  h+='</div>';
  // Add to Leitner button
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">';
  if(!exists&&!inLT){
    h+='<button type="button" class="btn btn-sm btn-primary" id="pdfAddWord">＋ لایتنر</button>';
    h+='<button type="button" class="btn btn-sm btn-success" id="pdfAddLT" style="font-size:.75rem;padding:6px 12px">＋ حافظه بلندمدت</button>';
  }else{
    h+='<span style="font-size:.78rem;color:var(--success);padding:4px 8px">✅ موجود در '+(exists?'لایتنر':'حافظه بلندمدت')+'</span>';
  }
  h+='</div>';
  // Search input at bottom
  h+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">';
  h+='<input type="text" id="pdfSearchWordInput" class="input" placeholder="🔍 جستجوی کلمه دیگر..." style="width:100%;padding:8px 12px;font-size:.85rem;direction:ltr;text-align:left" autocomplete="off" spellcheck="false">';
  h+='</div>';
  resultDiv.innerHTML=h;
  // Tab switching
  var popup=document.getElementById('pdfTranslatePopup');
  if(popup){
    popup.querySelectorAll('.wd-tab').forEach(function(tab){
      tab.onclick=function(){
        popup.querySelectorAll('.wd-tab').forEach(function(t){t.style.color='var(--text2)';t.style.borderBottomColor='transparent';t.style.fontWeight='400';t.classList.remove('active')});
        tab.style.color='var(--accent)';tab.style.borderBottomColor='var(--accent)';tab.style.fontWeight='600';tab.classList.add('active');
        popup.querySelectorAll('.wd-tab-content').forEach(function(c){c.style.display='none'});
        var target=popup.querySelector('.wd-tab-content[data-wtab="'+tab.dataset.wtab+'"]');
        if(target)target.style.display='block';
      };
    });
  }
  // Audio
  resultDiv.querySelectorAll('[data-audio]').forEach(function(btn){btn.onclick=function(){playAudioUrl(btn.dataset.audio)}});
  resultDiv.querySelectorAll('[data-speak]').forEach(function(btn){btn.onclick=function(){speakWord(btn.dataset.speak)}});
  // Add to Leitner
  var addBtn=document.getElementById('pdfAddWord');
  if(addBtn)addBtn.onclick=function(){
    var allDefs=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
    window.cardRepository?.get()?.add(createCard({word:word,translation:cached.translation||'',ipa:cached.ipa||'',definitions:allDefs,examples:cached.examples||[],synonyms:cached.synonyms||[],antonyms:cached.antonyms||[],partOfSpeech:cached.pos||'',audioUs:cached.audioUs||'',audioBr:cached.audioBr||'',source:'pdf-reader'}),'words');
    trackWordAdded();save();toast(word+' به لایتنر اضافه شد','success');hidePdfTranslateInput();
  };
  var ltBtn=document.getElementById('pdfAddLT');
  if(ltBtn)ltBtn.onclick=function(){
    var allDefs=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
    window.cardRepository?.get()?.add(createCard({word:word,translation:cached.translation||'',ipa:cached.ipa||'',definitions:allDefs,examples:cached.examples||[],synonyms:cached.synonyms||[],antonyms:cached.antonyms||[],partOfSpeech:cached.pos||'',audioUs:cached.audioUs||'',audioBr:cached.audioBr||'',source:'pdf-reader'}),'longTerm');
    save();toast(word+' به حافظه بلندمدت اضافه شد','success');hidePdfTranslateInput();
  };
  // Search for another word
  var searchInput=document.getElementById('pdfSearchWordInput');
  if(searchInput){
    var st;
    searchInput.oninput=function(){clearTimeout(st);var w=pdfNormalizeWord(searchInput.value);if(w&&w.length>=2)st=setTimeout(function(){doPdfTranslateSmart(w)},400)};
    searchInput.onkeydown=function(e){if(e.key==='Escape')hidePdfTranslateInput();if(e.key==='Enter'){clearTimeout(st);var w=pdfNormalizeWord(searchInput.value);if(w&&w.length>=2)doPdfTranslateSmart(w)}};
  }
}

function pdfOpenWord(word,x,y){
  var helper=document.getElementById('pdfSelectionHelper');
  if(helper)helper.remove();
  showPdfTranslateInput(x,y);
  setTimeout(function(){doPdfTranslateSmart(word)},100);
}
function showPdfSelectionHelper(x,y,words){
  // words: single word string OR array of words (drag-selection over several)
  var old=document.getElementById('pdfSelectionHelper');
  if(old)old.remove();
  if(typeof words==='string')words=[words];
  if(!words||!words.length)return;
  var helper=document.createElement('div');
  helper.id='pdfSelectionHelper';
  var single=words.length===1;
  helper.style.cssText='position:fixed;z-index:315;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:'+(single?'6px 12px':'10px 12px')+';box-shadow:0 4px 16px rgba(0,0,0,.3);font-family:var(--font);cursor:pointer;transition:all .2s;max-width:340px'+(single?';display:flex;gap:6px;align-items:center':'') ;
  helper.style.left=Math.min(x,window.innerWidth-360)+'px';
  helper.style.top=Math.max(8,y-(single?40:words.length*34+60))+'px';
  if(single){
    helper.innerHTML='<span style="font-size:.85rem;font-weight:600;color:var(--accent)">🔍 '+esc(words[0])+'</span>';
    helper.onclick=function(e){
      e.stopPropagation();
      helper.remove();
      showPdfTranslateInput(x,y);
      setTimeout(function(){doPdfTranslateSmart(words[0])},100);
    };
  }else{
    var label=document.createElement('div');
    label.style.cssText='font-size:.72rem;color:var(--text2);margin-bottom:6px;font-weight:600'; 
    label.textContent=words.length+' کلمه انتخاب شد — روی هر کدام بزنید';
    helper.appendChild(label);
    var chips=document.createElement('div');
    chips.style.cssText='display:flex;flex-wrap:wrap;gap:4px;max-width:340px';
    words.slice(0,10).forEach(function(w){
      var chip=document.createElement('span');
      chip.style.cssText='padding:3px 9px;border-radius:8px;font-size:.78rem;background:var(--bg);border:1px solid var(--border);color:var(--accent);cursor:pointer';
      chip.textContent='🔍 '+w;
      chip.onclick=function(e){
        e.stopPropagation();
        helper.remove();
        showPdfTranslateInput(x,y);
        setTimeout(function(){doPdfTranslateSmart(w)},100);
      };
      chips.appendChild(chip);
    });
    helper.appendChild(chips);
    if(words.length>10){
      var more=document.createElement('div');
      more.style.cssText='font-size:.7rem;color:var(--text2);margin-top:4px';
      more.textContent='و '+(words.length-10)+' کلمه دیگر… (انتخاب را دوباره بکشید)';
      helper.appendChild(more);
    }
  }
  document.body.appendChild(helper);
  setTimeout(function(){if(helper.parentNode)helper.remove()},5000);
}
// Hit-test: find the exact word under (x,y) inside the rendered text layer.
// The official pdf.js TextLayer may bundle several words (or a whole column)
// into one span — we climb spans and split text into words, then pick the
// word whose character range contains the pointer.
function pdfWordAtPoint(x,y){
  var layers=document.elementsFromPoint?document.elementsFromPoint(x,y):[];
  var root=null;
  for(var li=0;li<layers.length;li++){
    var candidate=layers[li]&&layers[li].closest?layers[li].closest('.pdf-canvas-textlayer'):null;
    if(candidate){root=candidate;break}
  }
  if(!root){
    var el=document.elementFromPoint(x,y);
    root=el&&el.closest?el.closest('.pdf-canvas-textlayer'):null;
  }
  if(!root)return '';
  // Text-layer spans are transparent and can miss hit-testing in some PDF.js versions.
  // Only use the caret fallback when it belongs to the same layer under the pointer;
  // otherwise a nearby column can win the browser hit-test.
  if(document.caretRangeFromPoint){
    var caret=document.caretRangeFromPoint(x,y);
    if(caret&&root.contains(caret.startContainer)&&caret.startContainer.parentElement&&caret.startContainer.parentElement.closest('.pdf-canvas-textlayer')===root){
      var rawCaret=caret.startContainer.textContent||'';
      var before=rawCaret.slice(0,caret.startOffset), after=rawCaret.slice(caret.startOffset);
      var left=(before.match(/[A-Za-z][A-Za-z'’-]*$/)||[''])[0];
      var right=(after.match(/^[A-Za-z][A-Za-z'’-]*/)||[''])[0];
      var caretWord=pdfNormalizeWord(left+right);
      if(caretWord)return caretWord;
    }
  }
  var node=el;
  if(node.nodeType===3)node=node.parentElement;
  if(node&&node.nodeType===1&&node!==root){
    var directRange=document.createRange();
    var directWalker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    var directText;
    while((directText=directWalker.nextNode())){
      var directRaw=directText.nodeValue||'';
      var directMatch=/[A-Za-z][A-Za-z'’-]*/g, directPart;
      while((directPart=directMatch.exec(directRaw))){
        directRange.setStart(directText,directPart.index);directRange.setEnd(directText,directPart.index+directPart[0].length);
        var directRects=directRange.getClientRects();
        for(var di=0;di<directRects.length;di++){
          var dr=directRects[di];
          if(x>=dr.left-2&&x<=dr.right+2&&y>=dr.top-2&&y<=dr.bottom+2)return pdfNormalizeWord(directPart[0]);
        }
      }
    }
  }
  while(node&&node!==root&&node.nodeType===1){
    var range=document.createRange();
    var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    var textNode;
    while((textNode=walker.nextNode())){
      var raw=textNode.nodeValue||'';
      var re=/[A-Za-z][A-Za-z'’-]*/g, match;
      while((match=re.exec(raw))){
        range.setStart(textNode,match.index);range.setEnd(textNode,match.index+match[0].length);
        var rects=range.getClientRects();
        for(var i=0;i<rects.length;i++){
          var r=rects[i];
          if(x>=r.left-2&&x<=r.right+2&&y>=r.top-2&&y<=r.bottom+2)return pdfNormalizeWord(match[0]);
        }
      }
    }
    node=node.parentElement;
  }
  return '';
}
function hidePdfTranslateInput(){var p=document.getElementById('pdfTranslatePopup');if(p)p.remove();var h=document.getElementById('pdfSelectionHelper');if(h)h.remove()}

async function renderPDFCanvasPages(blobUrl){
  await ensurePdfJs();
  var container=document.getElementById('pdfCanvasContainer');
  if(!container)return;
  container.style.textAlign='center';
  container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2)"><div class="trans-spinner" style="margin:0 auto 8px"></div>در حال رندر صفحات...</div>';
  try{
    var resp=await fetch(blobUrl);
    var buf=await resp.arrayBuffer();
    var pdf=await pdfjsLib.getDocument({data:buf}).promise;
    pdfTotalPages=pdf.numPages;
    container.innerHTML='';
    var scale=pdfScale||1.5;
    for(var i=1;i<=pdf.numPages;i++){
      if(pdfRenderAbort&&pdfRenderAbort.signal.aborted)break;
      var page=await pdf.getPage(i);
      var viewport=page.getViewport({scale:scale});
      var pageWrap=document.createElement('div');
      pageWrap.className='pdf-canvas-page';
      pageWrap.setAttribute('data-page',i);
      pageWrap.style.cssText='position:relative;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.15);margin:0 auto auto;max-width:100%;display:inline-block';
      var canvas=document.createElement('canvas');
      canvas.width=viewport.width;
      canvas.height=viewport.height;
      canvas.style.cssText='display:block;width:100%;height:auto';
      var ctx=canvas.getContext('2d');
      await page.render({canvasContext:ctx,viewport:viewport}).promise;
      pageWrap.appendChild(canvas);
      // Use individually positioned PDF.js text items, matching the stable
      // Leitner-Pro reader. A single flex/flow text layer lets browser selection
      // jump across columns and is the source of the oversized selection bug.
      var textContent=await page.getTextContent();
      var textLayer=document.createElement('div');
      textLayer.className='pdf-canvas-textlayer';
      var textItems=textContent.items;
      var lastY=null;
      var lineDiv=null;
      for(var ti=0;ti<textItems.length;ti++){
        var item=textItems[ti];
        if(!item||!item.str)continue;
        var tx=pdfjsLib.Util.transform(viewport.transform,item.transform);
        var itemX=tx[4];
        var fontHeight=Math.sqrt(tx[2]*tx[2]+tx[3]*tx[3]);
        if(fontHeight<1)fontHeight=Math.abs(tx[0])||12;
        var baselineY=tx[5];
        var topY=baselineY-fontHeight;
        if(lastY===null||Math.abs(baselineY-lastY)>fontHeight*0.3){
          lineDiv=document.createElement('div');
          lineDiv.style.left=itemX+'px';
          lineDiv.style.top=topY+'px';
          lineDiv.style.fontSize=fontHeight+'px';
          lineDiv.style.lineHeight=fontHeight+'px';
          lineDiv.style.fontFamily=(item.fontName||'sans-serif')+', sans-serif';
          textLayer.appendChild(lineDiv);
          lastY=baselineY;
        }
        var itemSpan=document.createElement('span');
        itemSpan.textContent=item.str;
        if(lineDiv)lineDiv.appendChild(itemSpan);
      }
      var annotateLayerWords=function(container){
        // Tag inner-most text spans with the clean word(s) they display so
        // double-click can hit-test the exact word under the pointer.
        if(!container)return;
        var walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
        var nodes=[];var n;
        while(n=walker.nextNode()){
          var w=pdfNormalizeWord(n.nodeValue);
          if(w)nodes.push([n,w]);
        }
        var spans=container.querySelectorAll('span');
        for(var i=0;i<Math.min(spans.length,3000);i++){
          var sp=spans[i];
          if(sp.hasAttribute('data-word'))continue;
          var w2=pdfNormalizeWord(sp.textContent);
          if(w2&&w2.length>=2)sp.setAttribute('data-word',w2);
        }
        for(var j=0;j<nodes.length;j++){
          var textNode=nodes[j][0];var word=nodes[j][1];
          if(word&&word.length>=2){
            var parent=textNode.parentNode;
            if(parent&&parent.nodeType===1&&parent.firstChild===textNode&&parent.childNodes.length===1){
              parent.setAttribute('data-word',word);
            }
          }
        }
      };
      try{
        if(false&&pdfjsLib.TextLayer&&pdfjsLib.TextLayer.prototype&&pdfjsLib.TextLayer.prototype.render){
          (new pdfjsLib.TextLayer({textContentSource:textContent,container:textLayer,viewport:viewport})).render();
        }else if(pdfjsLib.renderTextLayer){
          pdfjsLib.renderTextLayer({textContent:textContent,container:textLayer,viewport:viewport});
        }else{
          throw new Error('no textlayer api');
        }
      }catch(tlErr){
        // Fallback: simple divs (best effort)
        textLayer.innerHTML='';
        var lastYF=null,lineDivF=null;
        textContent.items.forEach(function(item){
          if(!item||!item.str)return;
          var tx=pdfjsLib.Util.transform(viewport.transform,item.transform);
          var x=tx[4];
          var fontHeight=Math.sqrt(tx[2]*tx[2]+tx[3]*tx[3])||12;
          var baselineY=tx[5];
          var topY=baselineY-fontHeight;
          if(lastYF===null||Math.abs(baselineY-lastYF)>fontHeight*0.3){
            itemDiv=document.createElement('div');
            itemDiv.style.left=x+'px';itemDiv.style.top=topY+'px';
            itemDiv.style.fontSize=fontHeight+'px';itemDiv.style.lineHeight=fontHeight+'px';
            textLayer.appendChild(itemDiv);lastYF=baselineY;
          }
          var sp=document.createElement('span');sp.textContent=item.str;
          (itemDiv||textLayer).appendChild(sp);
        });
      }
      // Tag every text span with its exact word so hit-test works.
      // pdf.js may build spans asynchronously, so retag shortly after render.
      annotateLayerWords(textLayer);
      setTimeout(function(){
        annotateLayerWords(textLayer);
        if(pdfHighlightUnknown)applyPdfUnknownMarksOnLayer(textLayer);
      },250);
      // If highlighting is on (e.g. toggled before this page rendered), mark now
      if(pdfHighlightUnknown)applyPdfUnknownMarksOnLayer(textLayer);
      pageWrap.appendChild(textLayer);
      // Page number label
      var label=document.createElement('div');
      label.style.cssText='position:absolute;bottom:8px;right:12px;font-size:.7rem;color:rgba(0,0,0,.3);pointer-events:none';
      label.textContent='📄 '+i+'/'+pdf.numPages;
      pageWrap.appendChild(label);
      container.appendChild(pageWrap);
      // Add event listeners per page (works immediately, no need to wait for all pages)
      (function(pw){
        // Exact word under the pointer via hit-test on the tagged text layer.
        // Fixes scanned/multi-column PDFs where window.getSelection() grabs a
        // whole column (or the browser dblclick selection spans many lines),
        // which used to send multi-word strings straight into the library.
        function wordFromEvent(e){
          var hit=pdfWordAtPoint(e.clientX,e.clientY);
          if(hit&&hit.length>=2)return hit;
          // Fallback: manual selection (mouse drag) — keep only the first word
          var words=wordsFromSelection();
          return words.length?words[0]:'';
        }
        function wordsFromSelection(){
          var sel=window.getSelection();
          if(!sel||sel.rangeCount===0)return [];
          var range=sel.getRangeAt(0);
          if(!pw.contains(range.commonAncestorContainer))return [];
          var txt=sel.toString().trim();
          if(!txt)return [];
          var seen={},out=[];
          txt.split(/[\s\u00A0]+/).forEach(function(t){
            var w=pdfNormalizeWord(t);
            if(w&&w.length>=2&&!seen[w]){seen[w]=1;out.push(w)}
          });
          return out;
        }
        pw.addEventListener('dblclick',function(e){
          e.preventDefault();
          e.stopPropagation();
          window.getSelection()?.removeAllRanges();
          var cleanWord=wordFromEvent(e);
          var leftoverHelper=document.getElementById('pdfSelectionHelper');
          if(leftoverHelper)leftoverHelper.remove();
          // Always provide the lookup UI on a double-click. If the browser's
          // selection is unreliable (transparent text layer/scanned PDF), the
          // user can type the word instead of silently getting no response.
          showPdfTranslateInput(e.clientX,e.clientY);
          if(cleanWord&&cleanWord.length>=2&&cleanWord.length<=50){
            setTimeout(function(){doPdfTranslateSmart(cleanWord)},100);
          }
        });
        pw.addEventListener('mouseup',function(e){
          setTimeout(function(){
            if(document.getElementById('pdfTranslatePopup'))return;
            var words=wordsFromSelection();
            if(words.length>1){
              showPdfSelectionHelper(e.clientX,e.clientY,words);
            }else if(words.length===1){
              var cleanWord=words[0];
              if(cleanWord)showPdfSelectionHelper(e.clientX,e.clientY,cleanWord);
            }
          },30);
        });
      })(pageWrap);
    }
    // Restore bookmark
    var bm=loadPdfBookmark();
    if(bm&&bm.page>0){
      var targetPage=container.querySelector('[data-page="'+bm.page+'"]');
      if(targetPage)targetPage.scrollIntoView({behavior:'smooth'});
    }
    toast(pdf.numPages+' صفحه رندر شد','success');
  }catch(e){
    container.innerHTML='<div style="text-align:center;padding:40px;color:var(--danger)">❌ خطا در رندر PDF: '+esc(e.message)+'</div>';
  }
}

async function openPDF(file){
  await ensurePdfJs();
try{
pdfBlobUrl=URL.createObjectURL(file);
pdfFileName=file.name;
pdfTextMode=false;
pdfTextPages=[];
pdfTotalPages=0;
savePdfState();
// Extract text in background for text mode
extractPdfTextPages(file).then(result=>{
  pdfTextPages=result.pages;
  pdfTotalPages=result.pages.length;
}).catch(e=>{});
// Restore bookmark
const bm=loadPdfBookmark();
if(bm&&bm.page>0){pdfCurrentPage=bm.page}
renderPDFReader(document.getElementById('content'));
toast('PDF بارگذاری شد'+(bm&&bm.page>0?' (صفحه '+(bm.page+1)+')':''),'success')}
catch(e){toast('خطا در باز کردن فایل PDF','error');pdfBlobUrl=null}}
// ═══════════════════════════════════════════
