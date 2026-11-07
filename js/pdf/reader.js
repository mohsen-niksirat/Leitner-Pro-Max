// 5. PDF READER (High-Precision Word Layer + Canvas & Reflow Modes)
// ═══════════════════════════════════════════
export let pdfBlobUrl=null,pdfFileName='';
export let pdfTextMode=false; // toggle between canvas view and text reflow
export let pdfTextPages=[];   // extracted text per page
export let pdfTotalPages=0;
export let pdfCurrentPage=0;
export let pdfScale=1.5;
export let pdfRenderAbort=null;
export let pdfBookmarks={};   // fileName -> {page,scrollY}
export let pdfHighlightUnknown=false; // highlight words not in library/long-term
export let pdfInstantLookup=false;    // single-click instant dictionary popup toggle

const PDF_MIN_SCALE=0.75, PDF_MAX_SCALE=2.75, PDF_SCALE_STEP=0.25;
const PDF_WORKER_URL='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const PDF_CMAP_URL='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/';
const PDF_WORD_TOKEN_RE=/[A-Za-z\u00C0-\u024F]+(?:['’-][A-Za-z\u00C0-\u024F]+)*/g;

let _pdfMeasureCanvas=null;
let _pdfMeasureCtx=null;
let _pdfDocCache={blobUrl:null,bytes:null,doc:null};
let _pdfSearchMatches=[];
let _pdfSearchIdx=-1;
let _pdfOutsideClickBound=false;

// PDF reader may be loaded before enrichment; keep lookup normalization local.
export function pdfNormalizeWord(text){
  return String(text||'').trim().toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g,"'")
    .replace(/^[^a-zA-Z\u00C0-\u024F]+|[^a-zA-Z\u00C0-\u024F']+$/g,'')
    .replace(/'+/g,"'")
    .replace(/^'+|'+$/g,'');
}

function ensurePdfWorkerConfig(){
  try{
    if(typeof pdfjsLib!=='undefined'&&pdfjsLib.GlobalWorkerOptions){
      const ws=pdfjsLib.GlobalWorkerOptions.workerSrc||'';
      if(!ws||ws.indexOf('blob:')===0){
        pdfjsLib.GlobalWorkerOptions.workerSrc=PDF_WORKER_URL;
      }
    }
  }catch(_e){}
}

function measurePdfTextWidth(text,fontPx){
  if(!text)return 0;
  try{
    if(!_pdfMeasureCtx){
      _pdfMeasureCanvas=document.createElement('canvas');
      _pdfMeasureCtx=_pdfMeasureCanvas.getContext('2d');
    }
    const sz=Math.max(8,Math.round(fontPx||12));
    _pdfMeasureCtx.font=sz+'px sans-serif';
    return _pdfMeasureCtx.measureText(text).width||text.length*sz*0.52;
  }catch(_e){
    return text.length*(fontPx||12)*0.52;
  }
}

async function getPdfDocument(blobUrl){
  await ensurePdfJs();
  ensurePdfWorkerConfig();
  if(_pdfDocCache.blobUrl===blobUrl&&_pdfDocCache.doc){
    return _pdfDocCache.doc;
  }
  const resp=await fetch(blobUrl);
  const buf=await resp.arrayBuffer();
  const bytes=new Uint8Array(buf);
  const doc=await pdfjsLib.getDocument({
    data:bytes,
    cMapUrl:PDF_CMAP_URL,
    cMapPacked:true,
    enableXfa:false
  }).promise;
  _pdfDocCache={blobUrl,bytes:buf,doc};
  return doc;
}

// PDF persistence helpers
export const PDF_STORAGE_KEY='leitner_pdf_state';
export function savePdfState(){
  try{
    const state={fileName:pdfFileName,page:pdfCurrentPage,scale:pdfScale,instant:pdfInstantLookup};
    localStorage.setItem(PDF_STORAGE_KEY,JSON.stringify(state));
  }catch(e){}
}
export function loadPdfState(){
  try{return JSON.parse(localStorage.getItem(PDF_STORAGE_KEY))}catch(e){return null}
}
export function clearPdfState(){
  try{localStorage.removeItem(PDF_STORAGE_KEY)}catch(e){}
}
export function savePdfBookmark(){
  if(!pdfFileName)return;
  try{
    const bm=JSON.parse(localStorage.getItem('leitner_pdf_bm')||'{}');
    bm[pdfFileName]={page:pdfCurrentPage||1,scrollY:0,timestamp:Date.now()};
    const keys=Object.keys(bm);
    if(keys.length>20){
      const oldest=keys.sort((a,b)=>(bm[a].timestamp||0)-(bm[b].timestamp||0))[0];
      delete bm[oldest];
    }
    localStorage.setItem('leitner_pdf_bm',JSON.stringify(bm));
  }catch(e){}
}
export function loadPdfBookmark(){
  if(!pdfFileName)return null;
  try{
    const bm=JSON.parse(localStorage.getItem('leitner_pdf_bm')||'{}');
    return bm[pdfFileName]||null;
  }catch(e){return null}
}

// ── Highlight unknown words (not in library / long-term) in the PDF text layer ──
export function pdfKnownSet(){
  var known={};
  (S.words||[]).forEach(function(w){known[String(w.word||'').toLowerCase()]=1});
  (S.longTerm||[]).forEach(function(w){known[String(w.word||'').toLowerCase()]=1});
  return known;
}
export function applyPdfUnknownMarksOnLayer(layer){
  if(!layer)return;
  var known=pdfKnownSet();
  var spans=layer.querySelectorAll('span[data-word]');
  for(var i=0;i<spans.length;i++){
    var w=(spans[i].getAttribute('data-word')||'').toLowerCase();
    if(pdfHighlightUnknown&&w&&!known[w])spans[i].classList.add('pdf-unknown-word');
    else spans[i].classList.remove('pdf-unknown-word');
  }
}
export function applyPdfUnknownMarksAll(){
  document.querySelectorAll('.pdf-canvas-textlayer').forEach(applyPdfUnknownMarksOnLayer);
}

export async function extractPdfTextPages(file){
  await ensurePdfJs();
  ensurePdfWorkerConfig();
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf),cMapUrl:PDF_CMAP_URL,cMapPacked:true}).promise;
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const tc=await page.getTextContent();
    pages.push({pageNum:i,text:tc.items.map(x=>x.str).join(' '),items:tc.items});
  }
  return{pdf,pages};
}

// ── Precision Word-Level Text Layer Builder ──
// Splits every PDF text run into individual positioned word <span>s using
// percentage coordinates locked to the page viewport, eliminating column bleed,
// CSS resize drift, and multi-word span collisions.
export function buildPdfWordLayer(textContent,viewport,textLayer){
  if(!textLayer||!textContent||!Array.isArray(textContent.items))return;
  textLayer.innerHTML='';
  const vw=viewport.width||1;
  const vh=viewport.height||1;
  const rawItems=textContent.items;
  const runs=[];

  for(let i=0;i<rawItems.length;i++){
    const item=rawItems[i];
    if(!item||typeof item.str!=='string'||!item.str.trim())continue;
    const tx=pdfjsLib.Util.transform(viewport.transform,item.transform);
    let fontH=Math.hypot(tx[2],tx[3]);
    if(!fontH||fontH<1)fontH=Math.abs(tx[0])||12;
    const x=tx[4];
    const baselineY=tx[5];
    let w=(typeof item.width==='number'&&item.width>0)?(item.width*viewport.scale):0;
    if(!w||w<1)w=measurePdfTextWidth(item.str,fontH);
    runs.push({
      str:item.str,
      x:x,
      baselineY:baselineY,
      fontH:fontH,
      w:w,
      fontName:item.fontName||'sans-serif'
    });
  }

  // Merge adjacent kerned/split fragments that belong to the same word on the same baseline
  const mergedRuns=[];
  for(let i=0;i<runs.length;i++){
    const curr=runs[i];
    if(mergedRuns.length>0){
      const prev=mergedRuns[mergedRuns.length-1];
      const sameLine=Math.abs(curr.baselineY-prev.baselineY)<=Math.max(prev.fontH,curr.fontH)*0.32;
      const prevEnd=prev.x+prev.w;
      const gap=curr.x-prevEnd;
      const noBoundarySpace=!/\s$/.test(prev.str)&&!/^\s/.test(curr.str);
      if(sameLine&&noBoundarySpace&&gap>=-curr.fontH*0.35&&gap<=curr.fontH*0.14){
        prev.str+=curr.str;
        prev.w=Math.max(prev.w,(curr.x+curr.w)-prev.x);
        continue;
      }
    }
    mergedRuns.push({...curr});
  }

  // Emit individual word spans with exact percentage bounding boxes
  let lastLineY=null;
  for(let r=0;r<mergedRuns.length;r++){
    const run=mergedRuns[r];
    const text=run.str;
    const totalM=measurePdfTextWidth(text,run.fontH)||1;
    if(lastLineY!==null&&Math.abs(run.baselineY-lastLineY)>run.fontH*0.45){
      textLayer.appendChild(document.createTextNode('\n'));
    }
    lastLineY=run.baselineY;

    PDF_WORD_TOKEN_RE.lastIndex=0;
    let match;
    let matchedAny=false;
    while((match=PDF_WORD_TOKEN_RE.exec(text))!==null){
      const rawWord=match[0];
      const cleanWord=pdfNormalizeWord(rawWord);
      if(!cleanWord||cleanWord.length<1)continue;
      matchedAny=true;

      const preStr=text.slice(0,match.index);
      const preM=preStr?measurePdfTextWidth(preStr,run.fontH):0;
      const wordM=measurePdfTextWidth(rawWord,run.fontH);

      const wordX=run.x+(preM/totalM)*run.w;
      const wordW=Math.max(4,(wordM/totalM)*run.w);
      const wordTop=run.baselineY-run.fontH*0.85;
      const wordH=run.fontH*1.14;

      const leftPct=(wordX/vw)*100;
      const topPct=(wordTop/vh)*100;
      const widthPct=Math.max(0.35,(wordW/vw)*100);
      const heightPct=Math.max(0.5,(wordH/vh)*100);

      const sp=document.createElement('span');
      sp.className='pdf-word-span';
      if(cleanWord.length>=2){
        sp.setAttribute('data-word',cleanWord);
      }
      sp.textContent=rawWord;
      sp.style.cssText='position:absolute;right:auto;left:'+leftPct.toFixed(3)+'%;top:'+topPct.toFixed(3)+'%;width:'+widthPct.toFixed(3)+'%;height:'+heightPct.toFixed(3)+'%;font-size:'+Math.max(8,run.fontH*0.88).toFixed(1)+'px;line-height:1;';
      textLayer.appendChild(sp);
      textLayer.appendChild(document.createTextNode(' '));
    }

    // If a run had no Latin word tokens, still skip cleanly
    if(!matchedAny&&text.trim()){
      const sp=document.createElement('span');
      sp.className='pdf-word-span';
      const cw=pdfNormalizeWord(text);
      if(cw&&cw.length>=2)sp.setAttribute('data-word',cw);
      sp.textContent=text.trim();
      const leftPct=(run.x/vw)*100;
      const topPct=((run.baselineY-run.fontH*0.85)/vh)*100;
      const widthPct=Math.max(0.5,(run.w/vw)*100);
      const heightPct=Math.max(0.5,((run.fontH*1.14)/vh)*100);
      sp.style.cssText='position:absolute;right:auto;left:'+leftPct.toFixed(3)+'%;top:'+topPct.toFixed(3)+'%;width:'+widthPct.toFixed(3)+'%;height:'+heightPct.toFixed(3)+'%;font-size:'+Math.max(8,run.fontH*0.88).toFixed(1)+'px;line-height:1;';
      textLayer.appendChild(sp);
      textLayer.appendChild(document.createTextNode(' '));
    }
  }
}

export function renderPDFReader(c){
  if(!pdfBlobUrl){
    c.innerHTML=`<div class="card pdf-empty-card" style="text-align:center;padding:56px 28px">
      <div class="empty">
        <div class="icon" style="font-size:3.2rem;margin-bottom:12px">📄</div>
        <h3 style="font-size:1.2rem;font-weight:700;color:var(--text);margin-bottom:8px">خواننده هوشمند PDF</h3>
        <p style="color:var(--text2);font-size:.9rem;max-width:440px;margin:0 auto">فایل PDF خود را باز کنید؛ روی هر کلمه کلیک یا دابل‌کلیک کنید تا ترجمه دقیق، تلفظ صوتی، مترادف‌ها و افزودن آنی به جعبه لایتنر را ببینید.</p>
        <div style="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <input type="file" id="pdfFileInput" accept=".pdf" style="display:none">
          <button type="button" class="btn btn-primary" id="pdfOpen">📂 انتخاب فایل PDF</button>
        </div>
      </div>
    </div>`;
    document.getElementById('pdfOpen').onclick=()=>document.getElementById('pdfFileInput').click();
    document.getElementById('pdfFileInput').onchange=async e=>{const f=e.target.files[0];if(f)await openPDF(f)};
    return;
  }

  const truncName=pdfFileName.length>30?pdfFileName.slice(0,27)+'...':pdfFileName;
  const zoomPct=Math.round(((pdfScale||1.5)/1.5)*100);
  c.innerHTML=`<div class="pdf-toolbar" id="pdfToolbar">
    <button type="button" class="btn btn-ghost btn-sm" id="pdfOpen2" title="فایل جدید" aria-label="فایل جدید">📂</button>
    <input type="file" id="pdfFileInput2" accept=".pdf" style="display:none">
    <button type="button" class="btn btn-ghost btn-sm" id="pdfCloseBtn" title="بستن PDF" style="color:var(--danger)">✕ بستن</button>
    <div class="pdf-sep"></div>
    <span class="pdf-filename-badge" style="color:var(--text2);font-size:.76rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px" title="${esc(pdfFileName)}">${esc(truncName)}</span>
    <div style="flex:1"></div>
    <button type="button" class="btn btn-sm ${pdfInstantLookup?'btn-primary':'btn-ghost'}" id="pdfInstantBtn" title="با یک کلیک روی هر کلمه پنجره معنی باز شود">⚡ کلیک آنی</button>
    <button type="button" class="btn btn-sm ${pdfTextMode?'btn-primary':'btn-ghost'}" id="pdfTextModeBtn" title="تغییر بین نمای اصلی PDF و حالت متن">${pdfTextMode?'📄 متن':'📑 PDF'}</button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfBookmarkBtn" title="ذخیره نشانک صفحه فعلی" aria-label="نشانک صفحه">🔖</button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfUnknownBtn" title="برجسته کردن کلمات ناشناخته" aria-label="کلمات ناشناخته" style="${pdfHighlightUnknown?'color:var(--warning);background:rgba(253,203,110,.15)':''}">🆕</button>
    <div class="pdf-sep"></div>
    <div class="pdf-zoom-controls" style="display:inline-flex;align-items:center;gap:4px">
      <button type="button" class="btn btn-ghost btn-sm" id="pdfZoomOut" title="کوچک‌نمایی" aria-label="کوچک‌نمایی" style="padding:6px 10px">−</button>
      <button type="button" class="btn btn-ghost btn-sm" id="pdfZoomReset" title="بازنشانی بزرگ‌نمایی" style="font-size:.76rem;min-width:52px;padding:6px 8px;font-variant-numeric:tabular-nums">${zoomPct}%</button>
      <button type="button" class="btn btn-ghost btn-sm" id="pdfZoomIn" title="بزرگ‌نمایی" aria-label="بزرگ‌نمایی" style="padding:6px 10px">＋</button>
    </div>
    <div class="pdf-sep"></div>
    <div style="position:relative;display:inline-flex;align-items:center">
      <input type="text" id="pdfWordSearch" placeholder="🔍 جستجو در PDF..." style="max-width:165px;padding:6px 10px;font-size:.78rem;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-family:var(--font)">
      <span id="pdfSearchCount" style="font-size:.68rem;color:var(--text2);margin-right:6px;display:none"></span>
    </div>
    <div class="pdf-sep"></div>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfFirstPage" title="صفحه اول" aria-label="صفحه اول"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg></button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfPrevPage" title="صفحه قبل" aria-label="صفحه قبل"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfPageIndicator" title="کلیک برای رفتن به صفحه" style="font-size:.82rem;font-weight:600;color:var(--accent);padding:6px 8px;font-variant-numeric:tabular-nums">${pdfTotalPages?(pdfCurrentPage||1)+'/'+pdfTotalPages:'—'}</button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfNextPage" title="صفحه بعد" aria-label="صفحه بعد"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
    <button type="button" class="btn btn-ghost btn-sm" id="pdfLastPage" title="صفحه آخر" aria-label="صفحه آخر"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg></button>
    <div class="pdf-sep"></div>
    <button type="button" class="btn btn-primary btn-sm" id="pdfTranslateBtn">🔍 فرهنگ لغت</button>
  </div>
  ${pdfTextMode
    ? `<div style="width:100%;height:calc(100vh - 150px);min-height:500px;overflow-y:auto;padding:24px;background:var(--bg2);border-radius:var(--radius);line-height:2;font-size:1rem;direction:ltr;text-align:left" id="pdfTextContent">${pdfTextPages.length?pdfTextPages.map(p=>'<div class="pdf-text-page" data-page="'+p.pageNum+'" style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border)"><div style="color:var(--text2);font-size:.75rem;margin-bottom:8px">📄 صفحه '+p.pageNum+'</div><div class="pdf-reflow-body" style="white-space:pre-wrap;word-break:break-word;cursor:text;user-select:text">'+renderReflowWordsHtml(p.text)+'</div></div>').join(''):'<div style="text-align:center;padding:40px;color:var(--text2)">در حال استخراج متن...</div>'}</div>`
    : `<div style="width:100%;height:calc(100vh - 150px);min-height:500px;overflow:auto;padding:20px 12px;background:var(--bg2);border-radius:var(--radius)" id="pdfViewerWrap"><div id="pdfCanvasContainer" style="display:flex;flex-direction:column;align-items:center;gap:20px"><div style="text-align:center;padding:40px;color:var(--text2)">📄 در حال بارگذاری PDF...</div></div></div>`
  }`;

  document.getElementById('pdfOpen2').onclick=()=>document.getElementById('pdfFileInput2').click();
  document.getElementById('pdfFileInput2').onchange=async e=>{const f=e.target.files[0];if(f)await openPDF(f)};
  document.getElementById('pdfCloseBtn').onclick=()=>{
    savePdfBookmark();
    pdfBlobUrl=null;pdfFileName='';pdfTextMode=false;pdfTextPages=[];
    _pdfDocCache={blobUrl:null,bytes:null,doc:null};
    clearPdfState();
    renderPDFReader(document.getElementById('content'));
    toast('PDF بسته شد','info');
  };

  // Instant single-click lookup toggle
  var instantBtn=document.getElementById('pdfInstantBtn');
  if(instantBtn){
    instantBtn.onclick=function(){
      pdfInstantLookup=!pdfInstantLookup;
      instantBtn.className='btn btn-sm '+(pdfInstantLookup?'btn-primary':'btn-ghost');
      savePdfState();
      toast(pdfInstantLookup?'حالت کلیک آنی فعال شد — با یک کلیک روی هر کلمه معنی باز می‌شود':'حالت استاندارد فعال شد — دابل‌کلیک یا انتخاب کلمه','info');
    };
  }

  // Text mode toggle
  var textModeBtn=document.getElementById('pdfTextModeBtn');
  if(textModeBtn){
    textModeBtn.onclick=function(){
      pdfTextMode=!pdfTextMode;
      if(pdfTextMode&&pdfTextPages.length===0){
        toast('در حال استخراج متن...','info');
        fetch(pdfBlobUrl).then(r=>r.blob()).then(b=>extractPdfTextPages(b)).then(result=>{
          pdfTextPages=result.pages;pdfTotalPages=result.pages.length;
          renderPDFReader(document.getElementById('content'));
        }).catch(()=>toast('خطا در استخراج متن','error'));
        return;
      }
      renderPDFReader(document.getElementById('content'));
    };
  }

  // Bookmark button
  var bookmarkBtn=document.getElementById('pdfBookmarkBtn');
  if(bookmarkBtn){
    bookmarkBtn.onclick=function(){
      savePdfBookmark();
      toast('نشانک ذخیره شد (صفحه '+(pdfCurrentPage||1)+')','success');
    };
  }

  // Unknown-word highlight toggle
  var unknownBtn=document.getElementById('pdfUnknownBtn');
  if(unknownBtn){
    unknownBtn.onclick=function(){
      pdfHighlightUnknown=!pdfHighlightUnknown;
      unknownBtn.style.color=pdfHighlightUnknown?'var(--warning)':'';
      unknownBtn.style.background=pdfHighlightUnknown?'rgba(253,203,110,.15)':'';
      applyPdfUnknownMarksAll();
      toast(pdfHighlightUnknown?'کلمات ناشناخته برجسته شدند (خارج از کتابخانه)':'برجسته‌سازی کلمات ناشناخته غیرفعال شد','info');
    };
  }

  // Zoom controls
  function applyPdfZoom(nextScale){
    const clamped=Math.min(PDF_MAX_SCALE,Math.max(PDF_MIN_SCALE,Math.round(nextScale*100)/100));
    if(Math.abs(clamped-pdfScale)<0.01)return;
    pdfScale=clamped;
    savePdfState();
    const zLbl=document.getElementById('pdfZoomReset');
    if(zLbl)zLbl.textContent=Math.round((pdfScale/1.5)*100)+'%';
    if(!pdfTextMode&&pdfBlobUrl){
      renderPDFCanvasPages(pdfBlobUrl);
    }
  }
  var zoomOutBtn=document.getElementById('pdfZoomOut');
  if(zoomOutBtn)zoomOutBtn.onclick=()=>applyPdfZoom((pdfScale||1.5)-PDF_SCALE_STEP);
  var zoomInBtn=document.getElementById('pdfZoomIn');
  if(zoomInBtn)zoomInBtn.onclick=()=>applyPdfZoom((pdfScale||1.5)+PDF_SCALE_STEP);
  var zoomResetBtn=document.getElementById('pdfZoomReset');
  if(zoomResetBtn)zoomResetBtn.onclick=()=>applyPdfZoom(1.5);

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
    var container=document.getElementById(pdfTextMode?'pdfTextContent':'pdfCanvasContainer');
    if(!container)return;
    var target=container.querySelector('[data-page="'+pageNum+'"]');
    if(target){
      target.scrollIntoView({behavior:'smooth',block:'start'});
      pdfCurrentPage=pageNum;
      savePdfState();
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
      var viewH=pdfViewerWrap.clientHeight;
      var wrapRect=pdfViewerWrap.getBoundingClientRect();
      for(var i=0;i<pages.length;i++){
        var rect=pages[i].getBoundingClientRect();
        var relTop=rect.top-wrapRect.top;
        if(relTop<=viewH*0.45&&relTop+rect.height>0){
          var pn=parseInt(pages[i].getAttribute('data-page'));
          if(pn&&pn!==pdfCurrentPage){
            pdfCurrentPage=pn;
            var indicator=document.getElementById('pdfPageIndicator');
            if(indicator)indicator.textContent=pn+'/'+pdfTotalPages;
          }
          break;
        }
      }
    },{passive:true});
  }

  // PDF word search (works in BOTH Canvas mode and Text mode!)
  var pdfSearchInput=document.getElementById('pdfWordSearch');
  if(pdfSearchInput){
    var pdfSearchTimer;
    function clearPdfSearchHighlights(){
      _pdfSearchMatches=[];
      _pdfSearchIdx=-1;
      var cnt=document.getElementById('pdfSearchCount');
      if(cnt){cnt.style.display='none';cnt.textContent=''}
      document.querySelectorAll('.pdf-search-found,.pdf-search-match').forEach(function(el){
        el.classList.remove('pdf-search-found','pdf-search-match');
        if(el.classList.contains('pdf-text-page'))el.style.background='';
      });
    }
    function runPdfSearch(jumpNext){
      var query=pdfNormalizeWord(pdfSearchInput.value);
      if(!query||query.length<2){
        clearPdfSearchHighlights();
        return;
      }
      if(jumpNext&&_pdfSearchMatches.length>0){
        _pdfSearchIdx=(_pdfSearchIdx+1)%_pdfSearchMatches.length;
        var activeEl=_pdfSearchMatches[_pdfSearchIdx];
        if(activeEl){
          activeEl.scrollIntoView({behavior:'smooth',block:'center'});
          var cnt=document.getElementById('pdfSearchCount');
          if(cnt){cnt.style.display='inline';cnt.textContent=(_pdfSearchIdx+1)+'/'+_pdfSearchMatches.length}
        }
        return;
      }
      clearPdfSearchHighlights();
      if(!pdfTextMode){
        var spans=document.querySelectorAll('.pdf-canvas-textlayer span[data-word], .pdf-reflow-body span[data-word]');
        for(var i=0;i<spans.length;i++){
          var w=(spans[i].getAttribute('data-word')||'').toLowerCase();
          if(w.includes(query)){
            spans[i].classList.add('pdf-search-found');
            _pdfSearchMatches.push(spans[i]);
          }
        }
        var cnt=document.getElementById('pdfSearchCount');
        if(_pdfSearchMatches.length>0){
          _pdfSearchIdx=0;
          _pdfSearchMatches[0].scrollIntoView({behavior:'smooth',block:'center'});
          if(cnt){cnt.style.display='inline';cnt.textContent='1/'+_pdfSearchMatches.length}
        }else{
          if(cnt){cnt.style.display='inline';cnt.textContent='0'}
          toast('یافت نشد','info');
        }
      }else{
        var textContent=document.getElementById('pdfTextContent');
        if(!textContent)return;
        var wordSpans=textContent.querySelectorAll('span[data-word]');
        for(var j=0;j<wordSpans.length;j++){
          var tw=(wordSpans[j].getAttribute('data-word')||'').toLowerCase();
          if(tw.includes(query)){
            wordSpans[j].classList.add('pdf-search-found');
            _pdfSearchMatches.push(wordSpans[j]);
          }
        }
        if(_pdfSearchMatches.length>0){
          _pdfSearchIdx=0;
          _pdfSearchMatches[0].scrollIntoView({behavior:'smooth',block:'center'});
          var pageEl=_pdfSearchMatches[0].closest('.pdf-text-page');
          toast('یافت شد ('+_pdfSearchMatches.length+' مورد)'+(pageEl?' در صفحه '+pageEl.getAttribute('data-page'):''),'success');
        }else{
          toast('یافت نشد','info');
        }
      }
    }
    pdfSearchInput.oninput=function(){
      clearTimeout(pdfSearchTimer);
      pdfSearchTimer=setTimeout(function(){runPdfSearch(false)},250);
    };
    pdfSearchInput.onkeydown=function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        clearTimeout(pdfSearchTimer);
        runPdfSearch(true);
      }
      if(e.key==='Escape'){
        this.value='';
        clearPdfSearchHighlights();
      }
    };
  }

  // Text mode: click or double-click word to translate
  var pdfTextContent=document.getElementById('pdfTextContent');
  if(pdfTextContent){
    pdfTextContent.addEventListener('click',function(e){
      var sp=e.target.closest('span[data-word]');
      if(sp&&pdfInstantLookup){
        var w=sp.getAttribute('data-word');
        if(w)pdfOpenWord(w,e.clientX,e.clientY,sp);
      }
    });
    pdfTextContent.addEventListener('dblclick',function(e){
      var sp=e.target.closest('span[data-word]');
      if(sp){
        var w=sp.getAttribute('data-word');
        if(w){pdfOpenWord(w,e.clientX,e.clientY,sp);return}
      }
      var selection=window.getSelection();
      var selectedText=selection?selection.toString().trim():'';
      if(selectedText&&selectedText.length>=2&&selectedText.length<=50){
        var cleanWord=pdfNormalizeWord(selectedText);
        if(cleanWord&&cleanWord.length>=2){
          pdfOpenWord(cleanWord,e.clientX,e.clientY);
        }
      }
    });
    pdfTextContent.addEventListener('mouseup',function(e){
      setTimeout(function(){
        var selection=window.getSelection();
        var selectedText=selection?selection.toString().trim():'';
        if(selectedText&&selectedText.length>=2&&selectedText.length<=120){
          var words=[];
          var seen={};
          selectedText.split(/[\s\u00A0]+/).forEach(function(t){
            var w=pdfNormalizeWord(t);
            if(w&&w.length>=2&&!seen[w]){seen[w]=1;words.push(w)}
          });
          if(words.length){
            showPdfSelectionHelper(e.clientX,e.clientY,words.length===1?words[0]:words);
          }
        }
      },15);
    });
  }

  // Bind global outside-click handler once
  if(!_pdfOutsideClickBound){
    _pdfOutsideClickBound=true;
    document.addEventListener('click',function(e){
      var popup=document.getElementById('pdfTranslatePopup');
      if(!popup)return;
      if(e.target.closest('#pdfTranslatePopup')||e.target.closest('#pdfTranslateBtn'))return;
      if(e.target.closest('#pdfSelectionHelper'))return;
      if(e.target.closest('.pdf-word-span'))return;
      hidePdfTranslateInput();
    });
  }

  var selHelper=document.getElementById('pdfSelectionHelper');
  if(selHelper)selHelper.remove();
  document.onkeydown=null;
}

function renderReflowWordsHtml(text){
  if(!text)return '';
  return String(text).replace(/[A-Za-z\u00C0-\u024F]+(?:['’-][A-Za-z\u00C0-\u024F]+)*/g,function(m){
    const clean=pdfNormalizeWord(m);
    if(clean&&clean.length>=2){
      return '<span class="pdf-reflow-word" data-word="'+esc(clean)+'">'+esc(m)+'</span>';
    }
    return esc(m);
  });
}

export function highlightActivePdfWordSpan(spanEl){
  document.querySelectorAll('.pdf-word-span.pdf-word-active, .pdf-reflow-word.pdf-word-active').forEach(function(el){
    el.classList.remove('pdf-word-active');
  });
  if(spanEl&&spanEl.classList){
    spanEl.classList.add('pdf-word-active');
  }
}

export function showPdfTranslateInput(x,y,explicitWord){
  hidePdfTranslateInput();
  var popup=document.createElement('div');
  popup.id='pdfTranslatePopup';
  popup.style.cssText='position:fixed;z-index:320;background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.5);backdrop-filter:blur(14px);width:min(400px, calc(100vw - 24px));max-height:80vh;overflow:hidden;display:flex;flex-direction:column;font-family:var(--font);direction:ltr;text-align:left';
  var popW=Math.min(400,window.innerWidth-24);
  var left=Math.min(x,window.innerWidth-popW-12);
  var top=Math.min(y+14,window.innerHeight-260);
  if(left<12)left=12;
  if(top<12)top=12;
  popup.style.left=left+'px';
  popup.style.top=top+'px';
  popup.innerHTML='<div class="wd-drag-handle" style="display:flex;align-items:center;gap:6px;padding:10px 14px;cursor:move;background:var(--bg);border-bottom:1px solid var(--border);border-radius:16px 16px 0 0;flex-shrink:0"><span style="color:var(--text2);font-size:.7rem;letter-spacing:2px;user-select:none">⠿</span><span style="flex:1;text-align:center;font-size:.8rem;color:var(--text2);font-weight:600">فرهنگ لغت هوشمند</span><button type="button" id="pdfTranslateClose" aria-label="بستن" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:1rem;padding:2px 6px;line-height:1">✕</button></div><div id="pdfTranslateResult" style="padding:14px;overflow-y:auto;flex:1"><div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو...</div></div>';
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
      nx=Math.max(4,Math.min(nx,window.innerWidth-popup.offsetWidth-4));
      ny=Math.max(4,Math.min(ny,window.innerHeight-popup.offsetHeight-4));
      popup.style.left=nx+'px';popup.style.top=ny+'px';
    };
    document.onmouseup=function(){isDragging=false;document.onmousemove=null;document.onmouseup=null;popup.style.transition=''};
    e.preventDefault();
  };
  document.getElementById('pdfTranslateClose').onclick=hidePdfTranslateInput;

  // Auto-translate if explicitWord or text selection is present
  setTimeout(function(){
    if(!document.getElementById('pdfTranslatePopup'))return;
    if(explicitWord){
      var cleanExplicit=pdfNormalizeWord(explicitWord);
      if(cleanExplicit&&cleanExplicit.length>=2){
        doPdfTranslateSmart(cleanExplicit);
        return;
      }
    }
    var sel=window.getSelection();
    var selText=sel?sel.toString().trim():'';
    if(selText&&selText.length>=2&&selText.length<=50){
      var clean=pdfNormalizeWord(selText);
      if(clean&&clean.length>=2){
        doPdfTranslateSmart(clean);
        return;
      }
    }
    // Check if an input lookup is already running
    var resDiv=document.getElementById('pdfTranslateResult');
    if(resDiv&&resDiv.querySelector('.trans-loading')&&!resDiv.dataset.lookingUp){
      showPdfSearchInput(popup);
    }
  },40);
}

export function showPdfSearchInput(popup){
  var resultDiv=document.getElementById('pdfTranslateResult');
  if(!resultDiv)return;
  resultDiv.innerHTML='<div style="padding:8px 0"><input type="text" id="pdfSearchWordInput" class="input" placeholder="کلمه انگلیسی را تایپ کنید..." style="width:100%;padding:10px 14px;font-size:.9rem;direction:ltr;text-align:left" autocomplete="off" spellcheck="false"><div id="pdfSearchResult" style="margin-top:10px"></div></div>';
  var input=document.getElementById('pdfSearchWordInput');
  if(input){
    input.focus();
    var st;
    input.oninput=function(){
      clearTimeout(st);
      var w=pdfNormalizeWord(input.value);
      if(w&&w.length>=2){st=setTimeout(function(){doPdfTranslateSmart(w)},380)}
      else{var sr=document.getElementById('pdfSearchResult');if(sr)sr.innerHTML=''}
    };
    input.onkeydown=function(e){
      if(e.key==='Escape')hidePdfTranslateInput();
      if(e.key==='Enter'){clearTimeout(st);var w=pdfNormalizeWord(input.value);if(w&&w.length>=2)doPdfTranslateSmart(w)}
    };
  }
}

export async function doPdfTranslateSmart(word){
  var resultDiv=document.getElementById('pdfTranslateResult');
  if(!resultDiv)return;
  // Guard: only ever look up/store a single word. Multi-word selections
  // (scanned/multi-column PDFs) must not become cards or be auto-added.
  word=pdfNormalizeWord(String(word||'').trim().split(/[\s\u00A0]+/)[0]||'');
  if(word.length<2){hidePdfTranslateInput();return}
  resultDiv.dataset.lookingUp=word;
  resultDiv.innerHTML='<div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو برای «'+esc(word)+'»...</div>';
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
  if(!document.getElementById('pdfTranslateResult'))return;
  // Build rich popup content
  var h='';
  var tier=getFrequencyTier(word);
  // Header (Keep font-weight:800 on title div for E2E contract compatibility)
  h+='<div style="text-align:center;margin-bottom:12px">';
  h+='<div style="font-size:1.5rem;font-weight:800;color:var(--accent);margin-bottom:4px">'+esc(word)+'</div>';
  if(cached.ipa)h+='<div style="color:var(--text2);font-size:.9rem;margin-bottom:4px">/'+esc(cached.ipa)+'/</div>';
  h+='<div style="display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap">';
  if(cached.pos)h+='<span class="badge badge-accent">'+esc(cached.pos)+'</span>';
  if(tier)h+='<span class="badge tier-'+tier+'">'+tierLabel(tier)+'</span>';
  if(exists)h+='<span class="badge badge-success">✅ لایتنر</span>';
  if(inLT)h+='<span class="badge badge-warning">🧠 حافظه بلندمدت</span>';
  h+='</div></div>';
  // Core meaning
  if(cached.coreMeaning)h+='<div style="text-align:center;font-size:.95rem;font-weight:600;color:var(--text);margin-bottom:8px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);direction:ltr;text-align:left">'+esc(cached.coreMeaning)+'</div>';
  // Persian translation
  if(cached.translation)h+='<div style="text-align:center;font-size:1.08rem;font-weight:700;color:var(--success);margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:10px;direction:rtl" title="ترجمه فارسی">'+esc(cached.translation)+'</div>';
  // Audio buttons
  h+='<div style="display:flex;gap:6px;justify-content:center;margin-bottom:12px">';
  h+='<button type="button" class="trans-audio-btn" data-speak="'+esc(word)+'" title="شنیدن تلفظ">🔊</button>';
  if(cached.audioUs)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioUs)+'" title="تلفظ آمریکایی">🇺🇸</button>';
  if(cached.audioBr)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioBr)+'" title="تلفظ بریتانیایی">🇬🇧</button>';
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
      h+='<div style="font-size:.85rem;line-height:1.7;margin-bottom:6px;padding:6px 10px;background:var(--bg);border-radius:8px;border-left:3px solid var(--accent);direction:ltr;text-align:left">'+esc(def)+'</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">تعریفی یافت نشد</div>'}
  h+='</div>';
  // Examples tab
  h+='<div class="wd-tab-content" data-wtab="examples" style="display:none">';
  if(cached.examples.length){
    cached.examples.slice(0,4).forEach(function(ex){
      h+='<div style="font-size:.85rem;font-style:italic;line-height:1.7;margin-bottom:8px;padding:8px 12px;background:var(--bg);border-radius:8px;border-left:3px solid var(--success);direction:ltr;text-align:left">"'+esc(ex)+'"</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">مثالی یافت نشد</div>'}
  h+='</div>';
  // Related tab
  h+='<div class="wd-tab-content" data-wtab="related" style="display:none">';
  if(cached.synonyms.length){
    h+='<div style="margin-bottom:10px"><div style="font-size:.75rem;color:var(--success);font-weight:600;margin-bottom:6px">🔄 مترادف‌ها</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
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
    trackWordAdded();save();
    if(pdfHighlightUnknown)applyPdfUnknownMarksAll();
    toast(word+' به لایتنر اضافه شد','success');hidePdfTranslateInput();
  };
  var ltBtn=document.getElementById('pdfAddLT');
  if(ltBtn)ltBtn.onclick=function(){
    var allDefs=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
    window.cardRepository?.get()?.add(createCard({word:word,translation:cached.translation||'',ipa:cached.ipa||'',definitions:allDefs,examples:cached.examples||[],synonyms:cached.synonyms||[],antonyms:cached.antonyms||[],partOfSpeech:cached.pos||'',audioUs:cached.audioUs||'',audioBr:cached.audioBr||'',source:'pdf-reader'}),'longTerm');
    save();
    if(pdfHighlightUnknown)applyPdfUnknownMarksAll();
    toast(word+' به حافظه بلندمدت اضافه شد','success');hidePdfTranslateInput();
  };
  // Search for another word
  var searchInput=document.getElementById('pdfSearchWordInput');
  if(searchInput){
    var st;
    searchInput.oninput=function(){clearTimeout(st);var w=pdfNormalizeWord(searchInput.value);if(w&&w.length>=2)st=setTimeout(function(){doPdfTranslateSmart(w)},380)};
    searchInput.onkeydown=function(e){if(e.key==='Escape')hidePdfTranslateInput();if(e.key==='Enter'){clearTimeout(st);var w=pdfNormalizeWord(searchInput.value);if(w&&w.length>=2)doPdfTranslateSmart(w)}};
  }
}

export function pdfOpenWord(word,x,y,spanEl){
  var helper=document.getElementById('pdfSelectionHelper');
  if(helper)helper.remove();
  if(spanEl)highlightActivePdfWordSpan(spanEl);
  showPdfTranslateInput(x,y,word);
}

export function showPdfSelectionHelper(x,y,words){
  // words: single word string OR array of words (drag-selection over several)
  var old=document.getElementById('pdfSelectionHelper');
  if(old)old.remove();
  if(typeof words==='string')words=[words];
  if(!words||!words.length)return;
  var helper=document.createElement('div');
  helper.id='pdfSelectionHelper';
  var single=words.length===1;
  helper.style.cssText='position:fixed;z-index:315;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:'+(single?'6px 12px':'10px 12px')+';box-shadow:0 8px 24px rgba(0,0,0,.35);font-family:var(--font);cursor:pointer;transition:all .18s;max-width:340px'+(single?';display:flex;gap:6px;align-items:center':'');
  helper.style.left=Math.max(8,Math.min(x,window.innerWidth-356))+'px';
  helper.style.top=Math.max(8,y-(single?42:Math.min(words.length,10)*18+64))+'px';
  if(single){
    helper.innerHTML='<span style="font-size:.85rem;font-weight:600;color:var(--accent)">🔍 '+esc(words[0])+'</span>';
    helper.onclick=function(e){
      e.stopPropagation();
      helper.remove();
      showPdfTranslateInput(x,y,words[0]);
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
        showPdfTranslateInput(x,y,w);
      };
      chips.appendChild(chip);
    });
    helper.appendChild(chips);
    if(words.length>10){
      var more=document.createElement('div');
      more.style.cssText='font-size:.7rem;color:var(--text2);margin-top:4px';
      more.textContent='و '+(words.length-10)+' کلمه دیگر…';
      helper.appendChild(more);
    }
  }
  document.body.appendChild(helper);
  setTimeout(function(){if(helper.parentNode)helper.remove()},6000);
}

// Hit-test: find the exact word under (x,y) inside the rendered text layer.
export function pdfWordAtPoint(x,y){
  var layers=document.elementsFromPoint?document.elementsFromPoint(x,y):[];
  var root=null;
  var directWordSpan=null;
  for(var li=0;li<layers.length;li++){
    var nodeAtPt=layers[li];
    if(!nodeAtPt||!nodeAtPt.closest)continue;
    var candidate=nodeAtPt.closest('.pdf-canvas-textlayer');
    if(candidate){
      var cs=window.getComputedStyle?window.getComputedStyle(candidate):null;
      if(cs&&cs.pointerEvents==='none')continue;
      root=candidate;
      var ws=nodeAtPt.closest('span[data-word]');
      if(ws&&candidate.contains(ws))directWordSpan=ws;
      break;
    }
  }
  var el=document.elementFromPoint(x,y);
  if(!root){
    var elLayer=el&&el.closest?el.closest('.pdf-canvas-textlayer'):null;
    if(elLayer){
      var elCs=window.getComputedStyle?window.getComputedStyle(elLayer):null;
      if(!elCs||elCs.pointerEvents!=='none')root=elLayer;
    }
  }
  if(!root)return '';

  // 1) Fast & exact path: hit a tagged word span directly
  if(directWordSpan){
    var dw=pdfNormalizeWord(directWordSpan.getAttribute('data-word')||directWordSpan.textContent||'');
    if(dw)return dw;
  }
  if(el&&root.contains(el)){
    var closestTagged=el.closest?el.closest('span[data-word]'):null;
    if(closestTagged&&root.contains(closestTagged)){
      var cw=pdfNormalizeWord(closestTagged.getAttribute('data-word')||closestTagged.textContent||'');
      if(cw)return cw;
    }
  }

  // 2) Bounding-box hit-test against word spans inside `root` (handles tiny gaps between letters)
  var taggedSpans=root.querySelectorAll('span[data-word]');
  if(taggedSpans.length>0){
    var bestWord='',bestDist=Infinity;
    for(var si=0;si<taggedSpans.length;si++){
      var sp=taggedSpans[si];
      var r=sp.getBoundingClientRect();
      if(r.width<=0||r.height<=0)continue;
      if(x>=r.left-1&&x<=r.right+1&&y>=r.top-1&&y<=r.bottom+1){
        return pdfNormalizeWord(sp.getAttribute('data-word')||sp.textContent||'');
      }
      var dx=x<r.left?(r.left-x):(x>r.right?(x-r.right):0);
      var dy=y<r.top?(r.top-y):(y>r.bottom?(y-r.bottom):0);
      if(dx<=6&&dy<=4){
        var d=dx*dx+dy*dy;
        if(d<bestDist){
          bestDist=d;
          bestWord=pdfNormalizeWord(sp.getAttribute('data-word')||sp.textContent||'');
        }
      }
    }
    if(bestWord)return bestWord;
  }

  // 3) Caret range fallback when it belongs to the same active layer
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

  // 4) TreeWalker fallback for untagged spans inside `root`
  var searchStart=(el&&root.contains(el))?el:root;
  if(searchStart.nodeType===3)searchStart=searchStart.parentElement;
  var node=searchStart;
  while(node&&node.nodeType===1){
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
          var rr=rects[i];
          if(x>=rr.left-2&&x<=rr.right+2&&y>=rr.top-2&&y<=rr.bottom+2)return pdfNormalizeWord(match[0]);
        }
      }
    }
    if(node===root)break;
    node=node.parentElement;
  }
  return '';
}

export function hidePdfTranslateInput(){
  var p=document.getElementById('pdfTranslatePopup');
  if(p)p.remove();
  var h=document.getElementById('pdfSelectionHelper');
  if(h)h.remove();
  highlightActivePdfWordSpan(null);
}

export async function renderPDFCanvasPages(blobUrl){
  await ensurePdfJs();
  ensurePdfWorkerConfig();
  var container=document.getElementById('pdfCanvasContainer');
  if(!container)return;
  container.style.textAlign='center';
  container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2)"><div class="trans-spinner" style="margin:0 auto 8px"></div>در حال رندر صفحات با دقت بالا...</div>';
  try{
    var pdf=await getPdfDocument(blobUrl);
    pdfTotalPages=pdf.numPages;
    var ind=document.getElementById('pdfPageIndicator');
    if(ind)ind.textContent=(pdfCurrentPage||1)+'/'+pdfTotalPages;
    container.innerHTML='';
    var scale=pdfScale||1.5;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var extractedPages=[];

    for(var i=1;i<=pdf.numPages;i++){
      if(pdfRenderAbort&&pdfRenderAbort.signal.aborted)break;
      var page=await pdf.getPage(i);
      var viewport=page.getViewport({scale:scale});
      var pageWrap=document.createElement('div');
      pageWrap.className='pdf-canvas-page';
      pageWrap.setAttribute('data-page',i);
      pageWrap.style.cssText='position:relative;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.22);margin:0 auto;width:'+Math.round(viewport.width)+'px;max-width:100%;display:inline-block;direction:ltr;text-align:left;line-height:1';

      var canvas=document.createElement('canvas');
      canvas.width=Math.floor(viewport.width*dpr);
      canvas.height=Math.floor(viewport.height*dpr);
      canvas.style.cssText='display:block;width:100%;height:auto';
      var ctx=canvas.getContext('2d');
      var renderTransform=dpr!==1?[dpr,0,0,dpr,0,0]:null;
      await page.render({canvasContext:ctx,viewport:viewport,transform:renderTransform}).promise;
      pageWrap.appendChild(canvas);

      var textContent=await page.getTextContent();
      extractedPages.push({pageNum:i,text:textContent.items.map(function(x){return x.str}).join(' '),items:textContent.items});
      var textLayer=document.createElement('div');
      textLayer.className='pdf-canvas-textlayer';
      buildPdfWordLayer(textContent,viewport,textLayer);

      if(pdfHighlightUnknown)applyPdfUnknownMarksOnLayer(textLayer);
      pageWrap.appendChild(textLayer);

      // Page number label
      var label=document.createElement('div');
      label.style.cssText='position:absolute;bottom:8px;right:12px;font-size:.7rem;color:rgba(0,0,0,.35);pointer-events:none;font-family:var(--font)';
      label.textContent='📄 '+i+'/'+pdf.numPages;
      pageWrap.appendChild(label);
      container.appendChild(pageWrap);

      // Interactive word selection per page
      (function(pw,tl){
        var downX=0,downY=0;
        pw.addEventListener('mousedown',function(e){
          downX=e.clientX;downY=e.clientY;
        });

        function wordSpanAtEvent(e){
          if(e.target&&e.target.closest){
            var sp=e.target.closest('span[data-word]');
            if(sp&&pw.contains(sp))return sp;
          }
          return null;
        }

        function wordFromEvent(e){
          var sp=wordSpanAtEvent(e);
          if(sp){
            var sw=pdfNormalizeWord(sp.getAttribute('data-word')||sp.textContent||'');
            if(sw&&sw.length>=2)return sw;
          }
          var hit=pdfWordAtPoint(e.clientX,e.clientY);
          if(hit&&hit.length>=2)return hit;
          var words=wordsFromSelection();
          return words.length?words[0]:'';
        }

        function wordsFromSelection(){
          var sel=window.getSelection();
          if(!sel||sel.rangeCount===0)return [];
          var range=sel.getRangeAt(0);
          if(!pw.contains(range.commonAncestorContainer))return [];
          // Prefer exact intersected span[data-word] elements so column/line order is clean
          var spans=tl.querySelectorAll('span[data-word]');
          var out=[],seen={};
          for(var idx=0;idx<spans.length;idx++){
            var sp=spans[idx];
            try{
              if(range.intersectsNode(sp)){
                var w=pdfNormalizeWord(sp.getAttribute('data-word')||'');
                if(w&&w.length>=2&&!seen[w]){seen[w]=1;out.push(w)}
              }
            }catch(_e){}
          }
          if(out.length>0)return out;
          var txt=sel.toString().trim();
          if(!txt)return [];
          txt.split(/[\s\u00A0]+/).forEach(function(t){
            var w=pdfNormalizeWord(t);
            if(w&&w.length>=2&&!seen[w]){seen[w]=1;out.push(w)}
          });
          return out;
        }

        pw.addEventListener('dblclick',function(e){
          e.preventDefault();
          e.stopPropagation();
          var sp=wordSpanAtEvent(e);
          var cleanWord=wordFromEvent(e);
          window.getSelection()?.removeAllRanges();
          var leftoverHelper=document.getElementById('pdfSelectionHelper');
          if(leftoverHelper)leftoverHelper.remove();
          if(sp)highlightActivePdfWordSpan(sp);
          showPdfTranslateInput(e.clientX,e.clientY,cleanWord);
        });

        pw.addEventListener('mouseup',function(e){
          var moved=Math.hypot(e.clientX-downX,e.clientY-downY);
          setTimeout(function(){
            if(document.getElementById('pdfTranslatePopup'))return;
            var words=wordsFromSelection();
            if(words.length>1){
              showPdfSelectionHelper(e.clientX,e.clientY,words);
              return;
            }
            if(words.length===1&&moved>=4){
              showPdfSelectionHelper(e.clientX,e.clientY,words[0]);
              return;
            }
            // Single click without drag on a word span
            if(moved<5){
              var sp=wordSpanAtEvent(e);
              if(sp){
                var w=pdfNormalizeWord(sp.getAttribute('data-word')||'');
                if(w&&w.length>=2){
                  highlightActivePdfWordSpan(sp);
                  if(pdfInstantLookup){
                    pdfOpenWord(w,e.clientX,e.clientY,sp);
                  }else{
                    showPdfSelectionHelper(e.clientX,e.clientY,w);
                  }
                }
              }
            }
          },25);
        });
      })(pageWrap,textLayer);
    }

    if(extractedPages.length)pdfTextPages=extractedPages;
    // Restore bookmark
    var bm=loadPdfBookmark();
    if(bm&&bm.page>0){
      var targetPage=container.querySelector('[data-page="'+bm.page+'"]');
      if(targetPage)targetPage.scrollIntoView({behavior:'smooth'});
    }
    toast(pdf.numPages+' صفحه آماده مطالعه شد','success');
  }catch(e){
    container.innerHTML='<div style="text-align:center;padding:40px;color:var(--danger)">❌ خطا در رندر PDF: '+esc(e.message)+'</div>';
  }
}

export async function openPDF(file){
  await ensurePdfJs();
  ensurePdfWorkerConfig();
  try{
    if(pdfBlobUrl){
      try{URL.revokeObjectURL(pdfBlobUrl)}catch(_e){}
    }
    pdfBlobUrl=URL.createObjectURL(file);
    pdfFileName=file.name;
    pdfTextMode=false;
    pdfTextPages=[];
    pdfTotalPages=0;
    pdfCurrentPage=1;
    _pdfDocCache={blobUrl:null,bytes:null,doc:null};
    savePdfState();
    // Restore bookmark
    const bm=loadPdfBookmark();
    if(bm&&bm.page>0){pdfCurrentPage=bm.page}
    renderPDFReader(document.getElementById('content'));
    toast('PDF بارگذاری شد'+(bm&&bm.page>0?' (صفحه '+bm.page+')':''),'success');
  }catch(e){
    toast('خطا در باز کردن فایل PDF','error');
    pdfBlobUrl=null;
  }
}
// ═══════════════════════════════════════════

if(typeof window!=='undefined'){
  Object.defineProperty(window,'pdfFileName',{configurable:true,get:()=>pdfFileName,set:(v)=>{pdfFileName=v}});
  Object.defineProperty(window,'pdfBlobUrl',{configurable:true,get:()=>pdfBlobUrl,set:(v)=>{pdfBlobUrl=v}});
}
