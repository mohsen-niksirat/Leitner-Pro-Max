// READING MODE (upgraded)
// ═══════════════════════════════════════════
let readingText='';
let readingDoc=null;
let readingViewMode='raw';
let readingCurrentPage=0;
let readingSearchQuery='';
let readingFilterMode='all';
let readingSelectedWords=new Set();
let readingTransCache={};
let readingDashboardVisible=true;
let readingFontSize=1.05;
let readingLineHeight=2.2;
let readingContentTheme='default';
function readingNormalizeWord(text){return String(text||'').trim().toLowerCase().replace(/^[^a-zA-Z]+|[^a-zA-Z']+$/g,'').replace(/'+/g,"'")}

// ── Translation Cache ──────────────────────
function getCachedTrans(word){
  const key=readingNormalizeWord(word);
  return readingTransCache[key]||null;
}
function cacheTrans(word,data){
  const key=readingNormalizeWord(word);
  readingTransCache[key]=data;
}
async function translateBatch(words){
  const unique=[...new Set(words.map(w=>readingNormalizeWord(w)).filter(w=>w&&w.length>=2))];
  const toTranslate=unique.filter(w=>!readingTransCache[w]);
  for(let i=0;i<toTranslate.length;i+=5){
    const batch=toTranslate.slice(i,i+5);
    const results=await Promise.all(batch.map(async w=>{
      try{
        const [trans,dict]=await Promise.all([fetchTranslation(w),fetchDictionary(w)]);
        const data={translation:trans||'',ipa:'',pos:'',definitions:[],examples:[],synonyms:[],audioUs:'',audioBr:''};
        if(dict){
          data.ipa=dict.phoneticBr||dict.phoneticUs||dict.phonetic||'';
          data.pos=dict.meanings[0]?dict.meanings[0].partOfSpeech:'';
          data.definitions=dict.meanings.flatMap(m=>m.definitions).slice(0,4);
          data.examples=dict.meanings.flatMap(m=>m.examples).slice(0,3);
          data.synonyms=dict.meanings.flatMap(m=>m.synonyms).slice(0,5);
          data.audioUs=dict.audioUs||'';
          data.audioBr=dict.audioBr||'';
        }
        return data;
      }catch(e){return{translation:'',ipa:'',pos:'',definitions:[],examples:[],synonyms:[],audioUs:'',audioBr:''}}
    }));
    batch.forEach((w,i)=>{readingTransCache[w]=results[i]});
  }
}

// ── Tokenizer: split text into proper words ──
function tokenizeText(text){
  // Split into words and punctuation tokens
  // "quick, brown" -> ["quick", ",", " ", "brown"]
  // "don't" stays as one word (internal apostrophe)
  var tokens=[];
  var re=/[a-zA-Z][a-zA-Z']*|[^a-zA-Z\s]+|\s+/g;
  var m;
  while((m=re.exec(text))!==null){tokens.push(m[0])}
  return tokens;
}
function extractCleanWords(text){
  // Extract only clean alphabetic words (no punctuation) for analysis
  return text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)*/g)||[];
}

// ── Document Model Builder ─────────────────
function buildReadingDoc(pages,title,sourceType){
  const doc={id:uid(),title,sourceType,pages:[],rawText:'',totalPages:pages.length,totalWords:0,uniqueWords:0,occurrences:{},avgWordsPerPage:0,sentenceCount:0,paragraphCount:0,longestWords:[],mostFrequentWords:[],readingDifficulty:'متوسط',pageStats:[]};
  const allWords=[];const allNormalized=[];
  pages.forEach((p,pi)=>{
    const engWords=extractCleanWords(p.text);
    const normalized=engWords;
    allWords.push(...engWords);allNormalized.push(...normalized);
    const unique=[...new Set(normalized)];
    const pageOcc={};
    normalized.forEach(w=>{pageOcc[w]=(pageOcc[w]||0)+1});
    const topWords=Object.entries(pageOcc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([word,count])=>({word,count}));
    doc.pages.push({pageNumber:pi+1,text:p.text,words:engWords,totalWords:engWords.length,uniqueWords:unique.length,topWords});
  });
  doc.rawText=pages.map(p=>p.text).join('\n\n');
  doc.occurrences={};
  allNormalized.forEach(w=>{if(!doc.occurrences[w])doc.occurrences[w]={count:0,pages:[]};doc.occurrences[w].count++});
  doc.pages.forEach((p,pi)=>{
    const pageNorm=extractCleanWords(p.text);
    [...new Set(pageNorm)].forEach(w=>{if(doc.occurrences[w]&&!doc.occurrences[w].pages.includes(pi+1))doc.occurrences[w].pages.push(pi+1)});
  });
  doc.totalWords=allNormalized.length;
  doc.uniqueWords=[...new Set(allNormalized)].length;
  doc.avgWordsPerPage=doc.totalPages?Math.round(doc.totalWords/doc.totalPages):0;
  doc.sentenceCount=(doc.rawText.match(/[.!?]+/g)||[]).length;
  doc.paragraphCount=doc.rawText.split(/\n\s*\n/).filter(p=>p.trim()).length;
  const sorted=Object.entries(doc.occurrences).sort((a,b)=>b[1].count-a[1].count);
  doc.mostFrequentWords=sorted.slice(0,20).map(([word,o])=>({word,count:o.count,pages:o.pages}));
  doc.longestWords=[...new Set(allNormalized)].sort((a,b)=>b.length-a.length).slice(0,15);
  const complexWords=[...new Set(allNormalized)].filter(w=>w.length>7&&!FREQ_T1.has(w)&&!FREQ_T2.has(w)).length;
  const uniqueAll=[...new Set(allNormalized)];const complexRatio=uniqueAll.length?complexWords/uniqueAll.length:0;
  doc.readingDifficulty=complexRatio>0.3?'سخت':complexRatio>0.15?'متوسط':'آسان';
  doc.pageStats=doc.pages.map(p=>{
    const pNorm=extractCleanWords(p.text);
    const pOcc={};pNorm.forEach(w=>{pOcc[w]=(pOcc[w]||0)+1});
    return{pageNumber:p.pageNumber,totalWords:p.totalWords,uniqueWords:p.uniqueWords,topWords:Object.entries(pOcc).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w,c])=>({word:w,count:c}))};
  });
  return doc;
}

// ── File Extraction ────────────────────────
async function extractPDFForReading(file){
  await ensurePdfJs();
  toast('در حال استخراج متن PDF...','info');
  if(!pdfjsLib.GlobalWorkerOptions.workerSrc||pdfjsLib.GlobalWorkerOptions.workerSrc.includes('cdnjs')){
    try{const wr=await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');const wb=await wr.blob();pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(wb)}catch(x){pdfjsLib.GlobalWorkerOptions.workerSrc=''}
  }
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf,disableFontFace:false,useSystemFonts:true,cMapUrl:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',cMapPacked:true}).promise;
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++){
    const p=await pdf.getPage(i);
    const tc=await p.getTextContent();
    pages.push({text:tc.items.map(x=>x.str).join(' ')});
    if(i%5===0)await new Promise(r=>setTimeout(r,0));
  }
  return pages;
}
function extractTXTForReading(text,charsPerPage){
  charsPerPage=charsPerPage||3000;
  const pages=[];let remaining=text;
  while(remaining.length>0){
    let cut=remaining.lastIndexOf('\n\n',charsPerPage);
    if(cut<charsPerPage*0.3)cut=remaining.lastIndexOf('. ',charsPerPage);
    if(cut<charsPerPage*0.3)cut=charsPerPage;
    else cut+=2;
    pages.push({text:remaining.slice(0,cut).trim()});
    remaining=remaining.slice(cut).trim();
  }
  return pages.length?pages:[{text:text||''}];
}

// ── Render Reading ─────────────────────────
function renderReading(c){
  if(!readingDoc){
    c.innerHTML='<div style="max-width:800px;margin:0 auto">'
    +'<div class="card" style="margin-bottom:16px;text-align:center;padding:32px">'
    +'<div style="font-size:2.5rem;margin-bottom:12px">📰</div>'
    +'<h3 style="margin-bottom:8px;color:var(--accent)">خواندن و تحلیل متن</h3>'
    +'<p style="color:var(--text2);font-size:.85rem;margin-bottom:20px">متن را بچسبانید یا فایل PDF/TXT را آپلود کنید</p>'
    +'<textarea id="readingInput" class="input" rows="6" placeholder="متن انگلیسی را اینجا بچسبانید..." style="width:100%;resize:vertical;margin-bottom:12px">'+esc(readingText)+'</textarea>'
    +'<div style="display:flex;gap:8px;margin-bottom:16px;justify-content:center;flex-wrap:wrap">'
    +'<button type="button" class="btn btn-primary" id="readingStartBtn">📖 شروع خواندن</button>'
    +'<button type="button" class="btn btn-ghost" id="readingClearBtn">پاک کردن</button>'
    +'</div>'
    +'<div style="border-top:1px solid var(--border);padding-top:16px">'
    +'<p style="color:var(--text2);font-size:.8rem;margin-bottom:10px">یا فایل آپلود کنید:</p>'
    +'<div class="reading-upload-zone" id="readingUploadZone">'
    +'<div class="icon">📁</div>'
    +'<p><strong>فایل را اینجا بکشید</strong> یا کلیک کنید</p>'
    +'<p style="font-size:.75rem;margin-top:4px">PDF, TXT</p>'
    +'<input type="file" id="readingFileInput" accept=".pdf,.txt" style="display:none">'
    +'</div></div></div></div>';
    document.getElementById('readingStartBtn').onclick=()=>{
      readingText=document.getElementById('readingInput').value.trim();
      if(!readingText){toast('متنی وارد نشده','error');return}
      const pages=extractTXTForReading(readingText);
      readingDoc=buildReadingDoc(pages,'متن چسبانده شده','paste');
      readingCurrentPage=0;readingViewMode='raw';
      saveReadingSession();renderReading(c);
      preloadReadingTranslations();
    };
    document.getElementById('readingClearBtn').onclick=()=>{readingText='';document.getElementById('readingInput').value=''};
    const zone=document.getElementById('readingUploadZone');
    const fi=document.getElementById('readingFileInput');
    zone.onclick=()=>fi.click();
    zone.ondragover=e=>{e.preventDefault();zone.classList.add('dragover')};
    zone.ondragleave=()=>zone.classList.remove('dragover');
    zone.ondrop=e=>{e.preventDefault();zone.classList.remove('dragover');if(e.dataTransfer.files[0])handleReadingFile(e.dataTransfer.files[0],c)};
    fi.onchange=e=>{if(e.target.files[0])handleReadingFile(e.target.files[0],c)};
    return;
  }
  const doc=readingDoc;
  const page=doc.pages[readingCurrentPage];
  let h='';
  const prog=doc.totalPages>1?Math.round((readingCurrentPage+1)/doc.totalPages*100):100;
  h+='<div class="reading-progress-bar"><div class="reading-progress-fill" style="width:'+prog+'%"></div></div>';
  h+='<div class="reading-toolbar">';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdNewFile" title="فایل جدید">📂</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdClose" title="بستن" style="color:var(--danger)">✕</button>';
  h+='<div class="sep"></div>';
  h+='<span style="color:var(--text2);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px" title="'+esc(doc.title)+'">'+esc(doc.title)+'</span>';
  h+='<div class="sep"></div>';
  h+='<button type="button" class="btn btn-sm '+(readingViewMode==='raw'?'active':'')+'" data-rmode="raw">📄 متن</button>';
  h+='<button type="button" class="btn btn-sm '+(readingViewMode==='split'?'active':'')+'" data-rmode="split">🔤 کلمات</button>';
  h+='<button type="button" class="btn btn-sm '+(readingViewMode==='vocab'?'active':'')+'" data-rmode="vocab">📊 واژگان</button>';
  if(doc.totalPages>1){
    h+='<div class="sep"></div>';
    // First page (RTL: points right ⏭)
    h+='<button type="button" class="btn btn-ghost btn-sm" id="rdFirstPage" title="صفحه اول" '+(readingCurrentPage===0?'disabled':'')+'><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg></button>';
    // Previous page (RTL: points right ▶)
    h+='<button type="button" class="btn btn-ghost btn-sm" id="rdPrevPage" title="صفحه قبل" '+(readingCurrentPage===0?'disabled':'')+'><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>';
    // Page indicator (clickable)
    h+='<button type="button" class="btn btn-ghost btn-sm" id="rdPageIndicator" title="کلیک برای رفتن به صفحه" style="font-size:.85rem;font-weight:600;color:var(--accent);padding:6px 10px;border-radius:8px">'+(readingCurrentPage+1)+' / '+doc.totalPages+'</button>';
    // Next page (RTL: points left ◀)
    h+='<button type="button" class="btn btn-ghost btn-sm" id="rdNextPage" title="صفحه بعد" '+(readingCurrentPage>=doc.totalPages-1?'disabled':'')+'><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>';
    // Last page (RTL: points left ⏮)
    h+='<button type="button" class="btn btn-ghost btn-sm" id="rdLastPage" title="صفحه آخر" '+(readingCurrentPage>=doc.totalPages-1?'disabled':'')+'><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg></button>';
    // Page slider
    h+='<input type="range" id="rdPageSlider" min="0" max="'+(doc.totalPages-1)+'" value="'+readingCurrentPage+'" style="width:100px;accent-color:var(--accent);cursor:pointer" title="اسلایدر صفحات">';
  }
  h+='<div style="flex:1"></div>';
  h+='<input type="text" class="search-box" id="rdSearch" placeholder="جستجو..." value="'+esc(readingSearchQuery)+'">';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdBatchAdd" title="افزودن گروهی">📥</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdExportVocab" title="خروجی واژگان">💾</button>';
  h+='<div class="sep"></div>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdToggleDash" title="نمایش/مخفی پنل اطلاعات" style='+(readingDashboardVisible?'':'opacity:.5')+'>📊</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="rdOptionsBtn" title="گزینه‌های نمایش">⚙️</button>';
  h+='</div>';
  h+='<div id="rdDashboardWrap"'+(readingDashboardVisible?'':' style="display:none"')+'>';
  h+=renderReadingDashboard(doc);
  h+='</div>';
  h+='<div class="reading-filter-bar">';
  h+='<button type="button" class="btn btn-ghost btn-sm '+(readingFilterMode==='all'?'active':'')+'" data-rfilter="all">همه ('+doc.uniqueWords+')</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm '+(readingFilterMode==='unknown'?'active':'')+'" data-rfilter="unknown">ناشناخته</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm '+(readingFilterMode==='repeated'?'active':'')+'" data-rfilter="repeated">تکراری‌ها</button>';
  h+='</div>';
  if(readingViewMode==='vocab'){
    h+=renderReadingVocabView(doc);
  }else if(doc.totalPages>1){
    h+='<div class="reading-page-marker"><strong>📄 صفحه '+page.pageNumber+'</strong> — '+page.totalWords+' کلمه، '+page.uniqueWords+' منحصربفرد</div>';
    const contentThemeStyles={
    default:'',
    sepia:'background:#f5edd6;color:#433422;border-color:#d4c5a9',
    night:'background:#1a1a2e;color:#c8c8d4;border-color:#333355',
    forest:'background:#1a2e1a;color:#c8e6c8;border-color:#335533',
    ocean:'background:#1a2230;color:#c8d8e8;border-color:#334858'
  };
  const contentStyle='font-size:'+readingFontSize+'rem;line-height:'+readingLineHeight+(contentThemeStyles[readingContentTheme]?';'+contentThemeStyles[readingContentTheme]:'')+'"';
  h+='<div class="reading-content-area" id="rdContentArea" style="'+contentStyle+'">'+renderReadingPageContent(page,doc)+'</div>';
    h+=renderPageSummary(page,doc);
  }else{
    h+='<div class="reading-content-area" id="rdContentArea" style="'+contentStyle+'">'+renderReadingPageContent(page,doc)+'</div>';
  }
  c.innerHTML=h;
  bindReadingEvents(c,doc);
}

function renderReadingDashboard(doc){
  const wordCountForWPM=doc.totalWords;
  const estimatedMinutes=Math.ceil(wordCountForWPM/200);
  const estimatedSec=estimatedMinutes<1?'< 1 دقیقه':estimatedMinutes+' دقیقه';
  const charCount=doc.rawText.length;
  const unknownCount=Object.keys(doc.occurrences).filter(function(w){return !wordExists(w)}).length;
  const knownCount=doc.uniqueWords-unknownCount;
  const knownPct=doc.uniqueWords>0?Math.round(knownCount/doc.uniqueWords*100):0;
  const avgWordLen=doc.totalWords>0?(doc.rawText.replace(/\s+/g,'').length/doc.totalWords).toFixed(1):0;
  const longestWord=doc.longestWords&&doc.longestWords.length?doc.longestWords[0]:'—';
  const avgSentenceLen=doc.sentenceCount>0?Math.round(doc.totalWords/doc.sentenceCount):0;
  const fileSizeKB=doc.rawText.length>0?(new Blob([doc.rawText]).size/1024).toFixed(1):0;
  const fileSizeMB=fileSizeKB>1024?(fileSizeKB/1024).toFixed(2)+' MB':fileSizeKB+' KB';
  const difficultyColor=doc.readingDifficulty==='سخت'?'var(--danger)':doc.readingDifficulty==='متوسط'?'var(--warning)':'var(--success)';

  let h='<div class="reading-dashboard">';
  // Row 1: core stats
  h+='<div class="reading-doc-card"><div class="val">'+doc.totalWords.toLocaleString()+'</div><div class="lbl">کل کلمات</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+doc.uniqueWords.toLocaleString()+'</div><div class="lbl">واژه منحصربفرد</div></div>';
  if(doc.totalPages>1)h+='<div class="reading-doc-card"><div class="val">'+doc.totalPages+'</div><div class="lbl">صفحه</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+fileSizeMB+'</div><div class="lbl">حجم متن</div></div>';
  // Row 2: reading metrics
  h+='<div class="reading-doc-card"><div class="val">⏱️ '+estimatedSec+'</div><div class="lbl">زمان مطالعه (~200 wpm)</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+doc.avgWordsPerPage+'</div><div class="lbl">میانگین کلمه/صفحه</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+doc.sentenceCount.toLocaleString()+'</div><div class="lbl">جمله</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+doc.paragraphCount+'</div><div class="lbl">پاراگراف</div></div>';
  // Row 3: analysis
  h+='<div class="reading-doc-card"><div class="val" style="color:'+difficultyColor+'">'+doc.readingDifficulty+'</div><div class="lbl">سطح دشواری</div></div>';
  h+='<div class="reading-doc-card"><div class="val" style="font-size:1.1rem">'+esc(doc.mostFrequentWords[0]?doc.mostFrequentWords[0].word:'—')+'</div><div class="lbl">پرتکرارترین</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+avgWordLen+'</div><div class="lbl">میانگین طول کلمه</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+avgSentenceLen+'</div><div class="lbl">کلمه/جمله</div></div>';
  // Row 4: vocabulary analysis
  h+='<div class="reading-doc-card"><div class="val" style="color:var(--success)">'+knownPct+'%</div><div class="lbl">واژگان شناخته‌شده</div></div>';
  h+='<div class="reading-doc-card"><div class="val" style="color:var(--danger)">'+unknownCount+'</div><div class="lbl">کلمه ناشناخته</div></div>';
  h+='<div class="reading-doc-card"><div class="val" style="font-size:1rem">'+esc(longestWord)+'</div><div class="lbl">طولانی‌ترین کلمه</div></div>';
  h+='<div class="reading-doc-card"><div class="val">'+charCount.toLocaleString()+'</div><div class="lbl">کاراکتر</div></div>';
  // Row 5: top 5 frequent words as tags
  if(doc.mostFrequentWords&&doc.mostFrequentWords.length>1){
    h+='<div class="reading-doc-card" style="grid-column:span 2;text-align:right"><div class="lbl" style="margin-bottom:6px">🔝 پرتکرارترین کلمات</div><div style="display:flex;flex-wrap:wrap;gap:4px">'+doc.mostFrequentWords.slice(0,8).map(function(fw){return '<span class="top-word-tag">'+esc(fw.word)+' <small>('+fw.count+')</small></span>'}).join('')+'</div></div>';
  }
  h+='</div>';
  return h;
}

function renderReadingPageContent(page,doc){
  const tokens=tokenizeText(page.text);
  let searchLower=readingSearchQuery.toLowerCase();
  return tokens.map(w=>{
    if(!w.trim())return w;
    // Check if this token is pure punctuation (no letters)
    if(!/[a-zA-Z]/.test(w))return esc(w);
    const nw=readingNormalizeWord(w);
    if(!nw||nw.length<2)return esc(w);
    const exists=S.words.some(x=>x.word.toLowerCase()===nw)||S.longTerm.some(x=>x.word.toLowerCase()===nw);
    const occ=doc.occurrences[nw];
    const isUnknown=!exists;
    const isRepeated=occ&&occ.count>2;
    const isSearch=searchLower&&nw.includes(searchLower);
    const isSelected=readingSelectedWords.has(nw);
    let cls='reading-word';
    if(isUnknown)cls+=' unknown';
    if(isRepeated)cls+=' repeated';
    if(isSearch)cls+=' search-match';
    if(isSelected)cls+=' selected-word';
    if(exists)cls+=' known';
    const title=occ?nw+' ('+occ.count+'x)':nw;
    return'<span class="'+cls+'" data-word="'+esc(nw)+'" title="'+esc(title)+'">'+esc(w)+'</span>';
  }).join('');
}

function renderPageSummary(page,doc){
  const pageStats=doc.pageStats[page.pageNumber-1];
  if(!pageStats)return'';
  let h='<div class="reading-page-summary">';
  h+='<h4>📊 خلاصه صفحه '+page.pageNumber+'</h4>';
  h+='<div class="stats-row">';
  h+='<span>📝 '+page.totalWords+' کلمه</span>';
  h+='<span>🔤 '+page.uniqueWords+' منحصربفرد</span>';
  h+='</div>';
  if(pageStats.topWords.length){
    h+='<div class="top-words">';
    pageStats.topWords.forEach(tw=>{h+='<span class="top-word-tag">'+esc(tw.word)+' ('+tw.count+')</span>'});
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function renderReadingVocabView(doc){
  const items=doc.mostFrequentWords;
  let h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';
  h+='<div class="reading-vocab-panel">';
  h+='<h3>🎯 واژگان کلیدی (پرتکرار)</h3>';
  if(!items.length){h+='<p style="color:var(--text2);font-size:.85rem">داده‌ای موجود نیست</p>'}
  items.slice(0,15).forEach((item,i)=>{
    const exists=S.words.some(x=>x.word.toLowerCase()===item.word)||S.longTerm.some(x=>x.word.toLowerCase()===item.word);
    h+='<div class="reading-vocab-item" data-vword="'+esc(item.word)+'">';
    h+='<span style="color:var(--text2);font-size:.75rem;min-width:20px">'+(i+1)+'.</span>';
    h+='<span class="word">'+esc(item.word)+'</span>';
    h+='<span class="count">'+item.count+'x</span>';
    if(exists)h+='<span class="badge-sm badge-success" style="font-size:.6rem">✅</span>';
    h+='</div>';
  });
  h+='</div>';
  h+='<div>';
  h+='<div class="reading-vocab-panel" style="margin-bottom:14px">';
  h+='<h3>🗺️ نقشه واژگان صفحات</h3>';
  h+='<div class="reading-heatmap">';
  doc.pages.forEach((p,pi)=>{
    const density=p.totalWords>0?p.uniqueWords/p.totalWords:0;
    const level=density>0.8?4:density>0.6?3:density>0.4?2:density>0.2?1:0;
    const colors=['rgba(108,92,231,.1)','rgba(108,92,231,.25)','rgba(108,92,131,.4)','rgba(108,92,231,.6)','rgba(108,92,231,.85)'];
    h+='<div class="reading-heatmap-cell" style="background:'+colors[level]+'" title="صفحه '+(pi+1)+': '+p.totalWords+' کلمه, '+p.uniqueWords+' منحصربفرد" data-hpage="'+pi+'">'+(pi+1)+'</div>';
  });
  h+='</div></div>';
  const unknownWords=Object.entries(doc.occurrences).sort((a,b)=>b[1].count-a[1].count).filter(function(entry){return !wordExists(entry[0])});
  h+='<div class="reading-vocab-panel">';
  h+='<h3>❓ کلمات ناشناخته ('+unknownWords.length+')</h3>';
  if(!unknownWords.length){h+='<p style="color:var(--success);font-size:.85rem">همه کلمات شناخته شده‌اند! ✅</p>'}
  unknownWords.slice(0,15).forEach(function(entry){
    var w=entry[0],o=entry[1];
    h+='<div class="reading-vocab-item" data-vword="'+esc(w)+'">';
    h+='<span class="word">'+esc(w)+'</span>';
    h+='<span class="count">'+o.count+'x</span>';
    h+='<span style="font-size:.7rem;color:var(--text2)">صفحه '+o.pages.join(', ')+'</span>';
    h+='</div>';
  });
  h+='</div></div></div>';
  return h;
}

async function handleReadingFile(file,c){
  const ext=file.name.split('.').pop().toLowerCase();
  try{
    let pages,title;
    if(ext==='pdf'){
      pages=await extractPDFForReading(file);
      title=file.name;
    }else if(ext==='txt'){
      const text=await file.text();
      pages=extractTXTForReading(text);
      title=file.name;
    }else{toast('فرمت فایل پشتیبانی نمی‌شود','error');return}
    readingDoc=buildReadingDoc(pages,title,ext);
    readingCurrentPage=0;readingViewMode='raw';
    saveReadingSession();renderReading(c);
    toast(file.name+' بارگذاری شد ('+readingDoc.totalPages+' صفحه)','success');
    preloadReadingTranslations();
  }catch(e){toast('خطا در خواندن فایل: '+e.message,'error')}
}

async function preloadReadingTranslations(){
  if(!readingDoc)return;
  const page=readingDoc.pages[readingCurrentPage];
  if(!page)return;
  const words=[...new Set(page.words.map(w=>readingNormalizeWord(w)).filter(w=>w&&w.length>=2))];
  const unknown=words.filter(w=>!readingTransCache[w]&&!S.words.some(x=>x.word.toLowerCase()===w)&&!S.longTerm.some(x=>x.word.toLowerCase()===w));
  if(unknown.length>0)await translateBatch(unknown.slice(0,30));
}

function saveReadingSession(){
  try{if(readingDoc)localStorage.setItem('leitner_reading_session',JSON.stringify({title:readingDoc.title,sourceType:readingDoc.sourceType,page:readingCurrentPage,view:readingViewMode}))}catch(e){}
}

function bindReadingEvents(c,doc){
  var newFileBtn=document.getElementById('rdNewFile');
  if(newFileBtn)newFileBtn.onclick=function(){readingDoc=null;readingText='';readingCurrentPage=0;renderReading(c)};
  var closeBtn=document.getElementById('rdClose');
  if(closeBtn)closeBtn.onclick=function(){readingDoc=null;readingText='';readingCurrentPage=0;renderReading(c)};
  c.querySelectorAll('[data-rmode]').forEach(function(btn){
    btn.onclick=function(){readingViewMode=btn.dataset.rmode;renderReading(c)};
  });
  c.querySelectorAll('[data-rfilter]').forEach(function(btn){
    btn.onclick=function(){readingFilterMode=btn.dataset.rfilter;renderReading(c)};
  });
  // Page navigation helper
  function goToReadingPage(idx){
    if(idx<0||idx>=doc.totalPages||idx===readingCurrentPage)return;
    readingCurrentPage=idx;
    saveReadingSession();
    renderReading(c);
    preloadReadingTranslations();
    // Smooth scroll to content area top
    var ca=document.getElementById('rdContentArea');
    if(ca)ca.scrollTop=0;
  }
  var prevBtn=document.getElementById('rdPrevPage');
  if(prevBtn)prevBtn.onclick=function(){goToReadingPage(readingCurrentPage-1)};
  var nextBtn=document.getElementById('rdNextPage');
  if(nextBtn)nextBtn.onclick=function(){goToReadingPage(readingCurrentPage+1)};
  var firstBtn=document.getElementById('rdFirstPage');
  if(firstBtn)firstBtn.onclick=function(){goToReadingPage(0)};
  var lastBtn=document.getElementById('rdLastPage');
  if(lastBtn)lastBtn.onclick=function(){goToReadingPage(doc.totalPages-1)};
  // Page slider
  var pageSlider=document.getElementById('rdPageSlider');
  if(pageSlider){
    pageSlider.oninput=function(){
      var idx=parseInt(this.value);
      if(idx!==readingCurrentPage)goToReadingPage(idx);
    };
  }
  // Page indicator click -> jump to page modal
  var pageIndicator=document.getElementById('rdPageIndicator');
  if(pageIndicator)pageIndicator.onclick=function(){showPageJumpModal(doc,goToReadingPage)};
  // Keyboard shortcuts for page navigation
  document.onkeydown=function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();goToReadingPage(readingCurrentPage+1)}
    else if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();goToReadingPage(readingCurrentPage-1)}
    else if(e.key==='Home'){e.preventDefault();goToReadingPage(0)}
    else if(e.key==='End'){e.preventDefault();goToReadingPage(doc.totalPages-1)}
  };
  var searchInput=document.getElementById('rdSearch');
  if(searchInput){var st;searchInput.oninput=function(){clearTimeout(st);st=setTimeout(function(){readingSearchQuery=searchInput.value;renderReading(c);var si=document.getElementById('rdSearch');if(si){si.focus();si.selectionStart=si.selectionEnd=si.value.length}},300)}}
  var contentArea=document.getElementById('rdContentArea');
  if(contentArea){
    contentArea.onclick=async function(e){
      var span=e.target.closest('.reading-word');
      if(!span)return;
      var word=span.dataset.word;
      showReadingWordDetail(word,span,doc);
    };
  }
  // Close word detail popup when clicking anywhere outside it
  if(window._readingClickOutside)document.removeEventListener('click',window._readingClickOutside);
  window._readingClickOutside=function(e){
    var wdPopup=document.getElementById('readingWordDetail');
    if(!wdPopup||!wdPopup.classList.contains('visible'))return;
    if(e.target.closest('.reading-word-detail')||e.target.closest('.reading-word'))return;
    wdPopup.classList.remove('visible');
  };
  document.addEventListener('click',window._readingClickOutside);
  c.querySelectorAll('[data-vword]').forEach(function(item){
    item.onclick=function(){readingSearchQuery=item.dataset.vword;readingViewMode='raw';renderReading(c)};
  });
  c.querySelectorAll('[data-hpage]').forEach(function(cell){
    cell.onclick=function(){readingCurrentPage=parseInt(cell.dataset.hpage);readingViewMode='raw';saveReadingSession();renderReading(c);preloadReadingTranslations()};
  });
  var batchBtn=document.getElementById('rdBatchAdd');
  if(batchBtn)batchBtn.onclick=function(){showBatchAddPanel(doc)};
  var exportBtn=document.getElementById('rdExportVocab');
  if(exportBtn)exportBtn.onclick=function(){exportReadingVocab(doc)};
  // Toggle dashboard visibility
  var toggleDashBtn=document.getElementById('rdToggleDash');
  if(toggleDashBtn)toggleDashBtn.onclick=function(){
    readingDashboardVisible=!readingDashboardVisible;
    var wrap=document.getElementById('rdDashboardWrap');
    if(wrap)wrap.style.display=readingDashboardVisible?'':'none';
    toggleDashBtn.style.opacity=readingDashboardVisible?'1':'.5';
    try{localStorage.setItem('leitner_reading_dashVisible',readingDashboardVisible?'1':'0')}catch(e){}
  };
  // Options button
  var optionsBtn=document.getElementById('rdOptionsBtn');
  if(optionsBtn)optionsBtn.onclick=function(){showReadingOptionsModal(c,doc)};
}

async function showReadingWordDetail(word,spanEl,doc){
  var popup=document.getElementById('readingWordDetail');
  if(!popup){popup=document.createElement('div');popup.id='readingWordDetail';popup.className='reading-word-detail';document.body.appendChild(popup)}
  var rect=spanEl.getBoundingClientRect();
  popup.innerHTML='<div class="wd-drag-handle"><span class="wd-drag-dots">⠿</span><span style="flex:1;text-align:center;font-size:.8rem;color:var(--text2)">در حال جستجو...</span><button type="button" id="rdDetailClose" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:1rem;padding:2px 6px">✕</button></div><div class="wd-body"></div>';
  popup.classList.add('visible');
  // Close on outside click
  setTimeout(function(){
    function closeRdPopup(e){
      if(!popup.contains(e.target)){
        popup.classList.remove('visible');
        document.removeEventListener('mousedown',closeRdPopup);
      }
    }
    document.addEventListener('mousedown',closeRdPopup);
  },100);
  popup.style.width='400px';popup.style.height='auto';
  var top=rect.bottom+10;var left=rect.left;
  if(left+420>window.innerWidth-16)left=window.innerWidth-420;
  if(left<16)left=16;
  if(top+400>window.innerHeight-16)top=rect.top-410;
  if(top<16)top=16;
  popup.style.top=top+'px';popup.style.left=left+'px';
  var handle=popup.querySelector('.wd-drag-handle');
  var isDragging=false,dragOffX=0,dragOffY=0;
  handle.onmousedown=function(e){
    if(e.target.id==='rdDetailClose')return;
    isDragging=true;
    var pRect=popup.getBoundingClientRect();
    dragOffX=e.clientX-pRect.left;dragOffY=e.clientY-pRect.top;
    popup.style.transition='none';
    document.onmousemove=function(ev){
      if(!isDragging)return;
      var nx=ev.clientX-dragOffX;var ny=ev.clientY-dragOffY;
      nx=Math.max(0,Math.min(nx,window.innerWidth-popup.offsetWidth-4));
      ny=Math.max(0,Math.min(ny,window.innerHeight-popup.offsetHeight-4));
      popup.style.left=nx+'px';popup.style.top=ny+'px';
    };
    document.onmouseup=function(){isDragging=false;document.onmousemove=null;document.onmouseup=null;popup.style.transition=''};
    e.preventDefault();
  };
  var nw=readingNormalizeWord(word);
  var occ=doc.occurrences[nw]||{count:1,pages:[]};
  // Smart lookup: check existing library first
  var existingCard=S.words.find(function(x){return x.word.toLowerCase()===word.toLowerCase()})
    ||S.longTerm.find(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var exists=S.words.some(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var inLT=S.longTerm.some(function(x){return x.word.toLowerCase()===word.toLowerCase()});
  var cached=getCachedTrans(word);
  if(!cached){
    // If word exists in library, use its data as base
    if(existingCard){
      cached={
        translation:existingCard.translation||'',
        ipa:existingCard.ipa||'',
        pos:existingCard.partOfSpeech||'',
        definitions:existingCard.definitions||[],
        examples:existingCard.examples||[],
        synonyms:existingCard.synonyms||[],
        antonyms:existingCard.antonyms||[],
        audioUs:existingCard.audioUs||'',
        audioBr:existingCard.audioBr||'',
        coreMeaning:existingCard.coreMeaning||'',
        note:existingCard.note||'',
        trap:existingCard.trap||'',
        collocations:existingCard.collocations||[],
        wordFamily:existingCard.wordFamily||[],
        context:existingCard.context||'',
        _fromLibrary:true
      };
      // Check if fields are empty and need enrichment
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
        // Translate the first English definition to Persian (not the word itself)
        if(!cached.translation){
          var defToTranslate='';
          if(cached.definitions.length){
            var fd=cached.definitions[0];
            defToTranslate=typeof fd==='string'?fd:(fd.definition||'');
          }
          if(defToTranslate){
            var persianMeaning=await fetchTranslation(defToTranslate);
            if(persianMeaning)cached.translation=persianMeaning;
          }
          if(!cached.translation){
            // Fallback: translate the word itself
            cached.translation=await fetchTranslation(word)||'';
          }
        }
        if(!cached.coreMeaning&&cached.definitions.length){
          var firstDef=cached.definitions[0];
          cached.coreMeaning=typeof firstDef==='string'?firstDef:(firstDef.definition||'');
        }
        cached._needsEnrich=true;
      }
    }else{
      // Word not in library - fetch from API
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
        if(cached.definitions.length){
          var firstDef=cached.definitions[0];
          cached.coreMeaning=typeof firstDef==='string'?firstDef:(firstDef.definition||'');
        }
      }
      // Translate the first definition to Persian (more accurate than translating the word)
      if(cached.coreMeaning){
        var persianMeaning=await fetchTranslation(cached.coreMeaning);
        if(persianMeaning)cached.translation=persianMeaning;
      }
      if(!cached.translation){
        cached.translation=await fetchTranslation(word)||'';
      }
    }
    cacheTrans(word,cached);
  }
  var body=popup.querySelector('.wd-body');
  var h='';
  h+='<div style="text-align:center;margin-bottom:12px">';
  h+='<div style="font-size:1.5rem;font-weight:800;color:var(--accent);margin-bottom:4px">'+esc(word)+'</div>';
  if(cached.ipa)h+='<div style="color:var(--text2);font-size:.9rem;margin-bottom:2px">/'+esc(cached.ipa)+'/</div>';
  h+='<div style="display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap">';
  if(cached.pos)h+='<span class="badge badge-accent">'+esc(cached.pos)+'</span>';
  h+='<span style="font-size:.75rem;color:var(--text2)">'+occ.count+'x در متن</span>';
  if(exists)h+='<span class="badge badge-success">✅ لایتنر</span>';
  if(inLT)h+='<span class="badge badge-warning">🧠 حافظه بلندمدت</span>';
  h+='</div></div>';
  // Show dictionary core meaning first (not contextual translation)
  if(cached.coreMeaning)h+='<div style="text-align:center;font-size:1rem;font-weight:600;color:var(--text);margin-bottom:8px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);direction:ltr;text-align:left">'+esc(cached.coreMeaning)+'</div>';
  if(cached.translation)h+='<div style="text-align:center;font-size:1.1rem;font-weight:700;color:var(--success);margin-bottom:12px;padding:8px;background:var(--bg);border-radius:10px" title="ترجمه فارسی">'+esc(cached.translation)+'</div>';
  h+='<div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:10px">';
  h+='<button type="button" class="wd-tab active" data-wtab="info" style="flex:1;padding:6px;border:none;background:none;color:var(--accent);font:inherit;font-size:.78rem;font-weight:600;cursor:pointer;border-bottom:2px solid var(--accent)">📖 تعریف</button>';
  h+='<button type="button" class="wd-tab" data-wtab="examples" style="flex:1;padding:6px;border:none;background:none;color:var(--text2);font:inherit;font-size:.78rem;cursor:pointer;border-bottom:2px solid transparent">💬 مثال</button>';
  h+='<button type="button" class="wd-tab" data-wtab="related" style="flex:1;padding:6px;border:none;background:none;color:var(--text2);font:inherit;font-size:.78rem;cursor:pointer;border-bottom:2px solid transparent">🔗 مرتبط</button>';
  h+='<button type="button" class="wd-tab" data-wtab="trick" style="flex:1;padding:6px;border:none;background:none;color:var(--text2);font:inherit;font-size:.78rem;cursor:pointer;border-bottom:2px solid transparent">🧠 حفظ</button>';
  h+='</div>';
  h+='<div class="wd-tab-content" data-wtab="info">';
  if(cached.definitions.length){
    cached.definitions.forEach(function(d){
      var def=typeof d==='string'?d:d.definition||'';
      h+='<div style="font-size:.85rem;line-height:1.7;margin-bottom:6px;padding:6px 10px;background:var(--bg);border-radius:8px;border-right:3px solid var(--accent)">'+esc(def)+'</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">تعریفی یافت نشد</div>'}
  h+='</div>';
  h+='<div class="wd-tab-content" data-wtab="examples" style="display:none">';
  if(cached.examples.length){
    cached.examples.forEach(function(ex){
      h+='<div style="font-size:.85rem;font-style:italic;line-height:1.7;margin-bottom:8px;padding:8px 12px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">\"'+esc(ex)+'\"</div>';
    });
  }else{h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">مثالی یافت نشد</div>'}
  h+='</div>';
  h+='<div class="wd-tab-content" data-wtab="related" style="display:none">';
  if(cached.synonyms.length){
    h+='<div style="margin-bottom:10px"><div style="font-size:.75rem;color:var(--success);font-weight:600;margin-bottom:6px">🔄 مترادف‌ها</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
    cached.synonyms.forEach(function(s){h+='<span style="padding:4px 10px;border-radius:8px;font-size:.8rem;background:rgba(0,184,148,.1);color:var(--success);border:1px solid rgba(0,184,148,.2)">'+esc(s)+'</span>'});
    h+='</div></div>';
  }
  if(cached.antonyms&&cached.antonyms.length){
    h+='<div><div style="font-size:.75rem;color:var(--danger);font-weight:600;margin-bottom:6px">⚡ متضادها</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
    cached.antonyms.forEach(function(a){h+='<span style="padding:4px 10px;border-radius:8px;font-size:.8rem;background:rgba(225,112,85,.1);color:var(--danger);border:1px solid rgba(225,112,85,.2)">'+esc(a)+'</span>'});
    h+='</div></div>';
  }
  if(!cached.synonyms.length&&!(cached.antonyms&&cached.antonyms.length)){h+='<div style="color:var(--text2);font-size:.85rem;text-align:center;padding:12px">مورد مرتبطی یافت نشد</div>'}
  h+='</div>';
  h+='<div class="wd-tab-content" data-wtab="trick" style="display:none">';
  h+='<div style="background:var(--bg);border-radius:10px;padding:12px;border-right:3px solid var(--accent)">';
  h+='<div style="font-size:.78rem;color:var(--accent);font-weight:600;margin-bottom:6px">🧠 ترفند حفظ کردن</div>';
  h+='<div style="font-size:.85rem;color:var(--text);line-height:1.8">'+getMemoryTrick(word,cached.translation||'',cached.pos||'')+'</div>';
  h+='</div>';
  if(cached.pos){
    h+='<div style="background:var(--bg);border-radius:10px;padding:12px;margin-top:8px;border-right:3px solid var(--success)">';
    h+='<div style="font-size:.78rem;color:var(--success);font-weight:600;margin-bottom:6px">📝 نکته استفاده</div>';
    h+='<div style="font-size:.85rem;color:var(--text);line-height:1.8">'+getUsageTip(word,cached.translation||'',cached.pos||'')+'</div>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">';
  h+='<button type="button" class="trans-audio-btn" data-speak="'+esc(word)+'" title="شنیدن">🔊</button>';
  if(cached.audioUs)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioUs)+'" title="American">🇺🇸</button>';
  if(cached.audioBr)h+='<button type="button" class="trans-audio-btn" data-audio="'+esc(cached.audioBr)+'" title="British">🇬🇧</button>';
  if(!exists&&!inLT){
    h+='<button type="button" class="btn btn-sm btn-primary" id="rdAddWord">＋ لایتنر</button>';
    h+='<button type="button" class="btn btn-sm btn-success" id="rdAddLT" style="font-size:.75rem;padding:6px 12px">＋ حافظه بلندمدت</button>';
  }else if(exists||inLT){
    var loc=exists?'لایتنر':'حافظه بلندمدت';
    h+='<span style="font-size:.78rem;color:var(--success);padding:4px 8px">✅ موجود در '+loc+'</span>';
    // Show update button if enrichment happened
    if(cached._needsEnrich||cached._fromLibrary){
      h+='<button type="button" class="btn btn-sm btn-ghost" id="rdUpdateCard" style="font-size:.75rem;padding:6px 12px;border-color:var(--accent)">🔄 بروزرسانی فیلدهای خالی</button>';
    }
    // Show view in library button
    h+='<button type="button" class="btn btn-sm btn-ghost" id="rdViewInLib" style="font-size:.75rem;padding:6px 12px">📚 مشاهده در کتابخانه</button>';
  }
  h+='</div>';
  // Show enrichment notification if word existed and we fetched missing data
  if(cached._needsEnrich){
    h+='<div style="margin-top:8px;padding:8px 12px;background:rgba(108,92,231,.08);border:1px solid rgba(108,92,231,.2);border-radius:10px;font-size:.78rem;color:var(--text2);text-align:center">'
    +'💡 این کلمه در کتابخانه موجود است. فیلدهای خالی از اینترنت واکشی شدند. دکمه «بروزرسانی» را بزنید تا ذخیره شوند.'
    +'</div>';
  }
  body.innerHTML=h;
  popup.querySelectorAll('.wd-tab').forEach(function(tab){
    tab.onclick=function(){
      popup.querySelectorAll('.wd-tab').forEach(function(t){t.style.color='var(--text2)';t.style.borderBottomColor='transparent';t.style.fontWeight='400';t.classList.remove('active')});
      tab.style.color='var(--accent)';tab.style.borderBottomColor='var(--accent)';tab.style.fontWeight='600';tab.classList.add('active');
      popup.querySelectorAll('.wd-tab-content').forEach(function(c){c.style.display='none'});
      var target=popup.querySelector('.wd-tab-content[data-wtab="'+tab.dataset.wtab+'"]');
      if(target)target.style.display='block';
    };
  });
  popup.querySelectorAll('[data-audio]').forEach(function(btn){btn.onclick=function(){playAudioUrl(btn.dataset.audio)}});
  popup.querySelectorAll('[data-speak]').forEach(function(btn){btn.onclick=function(){speakWord(btn.dataset.speak)}});
  document.getElementById('rdDetailClose').onclick=function(){popup.classList.remove('visible')};
  // Add to Leitner button
  var addBtn=document.getElementById('rdAddWord');
  if(addBtn)addBtn.onclick=function(){
    var allDefs=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
    var cardData={
      word:word,
      translation:cached.translation||'',
      ipa:cached.ipa||'',
      category:'پیش\u200cفرض',
      favorite:false,
      context:'',
      definitions:allDefs,
      examples:Array.isArray(cached.examples)?cached.examples:[],
      synonyms:Array.isArray(cached.synonyms)?cached.synonyms:[],
      antonyms:Array.isArray(cached.antonyms)?cached.antonyms:[],
      partOfSpeech:cached.pos||'',
      audioUs:cached.audioUs||'',
      audioBr:cached.audioBr||'',
      coreMeaning:cached.coreMeaning||'',
      collocations:Array.isArray(cached.collocations)?cached.collocations:[],
      wordFamily:Array.isArray(cached.wordFamily)?cached.wordFamily:[],
      note:cached.note||'',
      trap:cached.trap||'',
      tags:[],
      source:'reading-mode'
    };
    const _r=window.repoAdd?window.repoAdd(createCard(cardData),'words'):null;
    if(_r&&_r.added){trackWordAdded();save();toast(word+' به لایتنر اضافه شد','success')}else{toast('کلمه تکراری بود','info')}
    popup.classList.remove('visible');renderReading(document.getElementById('content'));
  };
  // Add to Long-term button
  var ltBtn=document.getElementById('rdAddLT');
  if(ltBtn)ltBtn.onclick=function(){
    var allDefs=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
    var cardData={
      word:word,
      translation:cached.translation||'',
      ipa:cached.ipa||'',
      category:'پیش\u200cفرض',
      favorite:false,
      context:'',
      definitions:allDefs,
      examples:Array.isArray(cached.examples)?cached.examples:[],
      synonyms:Array.isArray(cached.synonyms)?cached.synonyms:[],
      antonyms:Array.isArray(cached.antonyms)?cached.antonyms:[],
      partOfSpeech:cached.pos||'',
      audioUs:cached.audioUs||'',
      audioBr:cached.audioBr||'',
      coreMeaning:cached.coreMeaning||'',
      collocations:Array.isArray(cached.collocations)?cached.collocations:[],
      wordFamily:Array.isArray(cached.wordFamily)?cached.wordFamily:[],
      note:cached.note||'',
      trap:cached.trap||'',
      tags:[],
      source:'reading-mode'
    };
    const _r=window.repoAdd?window.repoAdd(createCard(cardData),'longTerm'):null;
    if(_r&&_r.added){save();toast(word+' به حافظه بلندمدت اضافه شد','success')}else{toast('کلمه تکراری بود','info')}
    popup.classList.remove('visible');renderReading(document.getElementById('content'));
  };
  // Update existing card with enriched fields
  var updateBtn=document.getElementById('rdUpdateCard');
  if(updateBtn)updateBtn.onclick=function(){
    var card=existingCard;
    if(!card){toast('کلمه یافت نشد','error');return}
    var updated=false;
    if(!card.translation&&cached.translation){card.translation=cached.translation;updated=true}
    if(!card.ipa&&cached.ipa){card.ipa=cached.ipa;updated=true}
    if(!card.partOfSpeech&&cached.pos){card.partOfSpeech=cached.pos;updated=true}
    if((!card.definitions||!card.definitions.length)&&cached.definitions.length){
      card.definitions=cached.definitions.map(function(d){return typeof d==='string'?d:(d.definition||'')});
      updated=true;
    }
    if((!card.examples||!card.examples.length)&&cached.examples.length){card.examples=cached.examples;updated=true}
    if((!card.synonyms||!card.synonyms.length)&&cached.synonyms.length){card.synonyms=cached.synonyms;updated=true}
    if((!card.antonyms||!card.antonyms.length)&&cached.antonyms.length){card.antonyms=cached.antonyms;updated=true}
    if(!card.audioUs&&cached.audioUs){card.audioUs=cached.audioUs;updated=true}
    if(!card.audioBr&&cached.audioBr){card.audioBr=cached.audioBr;updated=true}
    if(!card.coreMeaning&&cached.coreMeaning){card.coreMeaning=cached.coreMeaning;updated=true}
    if(updated){
      save();toast('فیلدهای خالی '+word+' بروزرسانی شد ✅','success');
    }else{
      toast('همه فیلدها از قبل پر هستند','info');
    }
    popup.classList.remove('visible');
    renderReading(document.getElementById('content'));
  };
  // View in library
  var viewBtn=document.getElementById('rdViewInLib');
  if(viewBtn)viewBtn.onclick=function(){
    popup.classList.remove('visible');
    currentTab='library';
    readingSearchQuery=word;
    render();
  };
  setTimeout(function(){body.scrollTop=0},50);
}

function showBatchAddPanel(doc){
  var unknown=Object.entries(doc.occurrences).filter(function(entry){return !wordExists(entry[0])}).sort(function(a,b){return b[1].count-a[1].count});
  if(!unknown.length){toast('همه کلمات در کتابخانه موجود هستند','info');return}
  var ov=document.createElement('div');ov.className='modal-overlay';
  var selected=new Set(unknown.map(function(e){return e[0]}));
  function renderBatchModal(){
    ov.innerHTML='<div class="modal" style="max-width:560px">'
      +'<h3 style="margin-bottom:12px">📥 افزودن گروهی کلمات ('+selected.size+' انتخاب شده)</h3>'
      +'<p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">کلمات ناشناخته با تکرار بالا. روی کلمات کلیک کنید تا انتخاب/لغو شوند.</p>'
      +'<div style="max-height:400px;overflow-y:auto">'
      +unknown.map(function(entry){
        var w=entry[0],o=entry[1];
        return'<div class="import-word-item'+(selected.has(w)?'':' existing')+'" data-bword="'+esc(w)+'" style="justify-content:space-between">'
          +'<div><strong>'+esc(w)+'</strong> <span style="color:var(--text2);font-size:.78rem">'+o.count+'x — صفحه '+o.pages.join(', ')+'</span></div>'
          +'<input type="checkbox" '+(selected.has(w)?'checked':'')+' data-bcheck="'+esc(w)+'" style="accent-color:var(--accent)"></div>';
      }).join('')
      +'</div>'
      +'<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">'
      +'<button type="button" class="btn btn-ghost" id="batchClose">بستن</button>'
      +'<button type="button" class="btn btn-primary" id="batchAddLeitner">افزودن به لایتنر ('+selected.size+')</button>'
      +'<button type="button" class="btn btn-success" id="batchAddLT" style="font-size:.8rem">افزودن به حافظه بلندمدت ('+selected.size+')</button>'
      +'</div></div>';
    ov.querySelector('#batchClose').onclick=function(){ov.remove()};
    ov.querySelectorAll('[data-bcheck]').forEach(function(cb){
      cb.onchange=function(){var w=cb.dataset.bcheck;if(cb.checked)selected.add(w);else selected.delete(w);renderBatchModal()};
    });
    ov.querySelectorAll('[data-bword]').forEach(function(item){
      item.onclick=function(){var w=item.dataset.bword;if(selected.has(w))selected.delete(w);else selected.add(w);renderBatchModal()};
    });
    ov.querySelector('#batchAddLeitner').onclick=async function(){
      var words=[...selected];
      toast('در حال ترجمه '+words.length+' کلمه...','info');
      await translateBatch(words);
      var added=0;
      words.forEach(function(w){
        if(wordExists(w))return;
        var c2=getCachedTrans(w)||{};
        const _r=window.repoAdd?window.repoAdd(createCard({word:w,translation:c2.translation||'',ipa:c2.ipa||'',definitions:c2.definitions||[],examples:c2.examples||[],synonyms:c2.synonyms||[],partOfSpeech:c2.pos||'',audioUs:c2.audioUs||'',audioBr:c2.audioBr||'',source:'reading-mode'}),'words'):null;
        if(_r&&_r.added)added++;
      });
      save();ov.remove();toast(added+' کلمه به لایتنر اضافه شد','success');renderReading(document.getElementById('content'));
    };
    ov.querySelector('#batchAddLT').onclick=async function(){
      var words=[...selected];
      toast('در حال ترجمه '+words.length+' کلمه...','info');
      await translateBatch(words);
      var added=0;
      words.forEach(function(w){
        if(wordExists(w))return;
        var c2=getCachedTrans(w)||{};
        const _r=window.repoAdd?window.repoAdd(createCard({word:w,translation:c2.translation||'',ipa:c2.ipa||'',definitions:c2.definitions||[],examples:c2.examples||[],synonyms:c2.synonyms||[],partOfSpeech:c2.pos||'',audioUs:c2.audioUs||'',audioBr:c2.audioBr||'',source:'reading-mode'}),'longTerm'):null;
        if(_r&&_r.added)added++;
      });
      save();ov.remove();toast(added+' کلمه به حافظه بلندمدت اضافه شد','success');renderReading(document.getElementById('content'));
    };
  }
  renderBatchModal();
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove()};
}

function showPageJumpModal(doc,callback){
  var ov=document.createElement('div');ov.className='modal-overlay';
  // Build page list with preview
  var pagesHtml='';
  for(var i=0;i<doc.pages.length;i++){
    var p=doc.pages[i];
    var preview=p.text.slice(0,80).replace(/\s+/g,' ').trim();
    if(p.text.length>80)preview+='...';
    var isCurrent=i===readingCurrentPage;
    pagesHtml+='<div class="import-word-item" data-jpage="'+i+'" style="justify-content:space-between;'+(isCurrent?'background:var(--accent-glow);border-color:var(--accent)':'')+'">'
      +'<div style="flex:1;min-width:0">'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<strong style="color:'+(isCurrent?'var(--accent)':'var(--text)')+';min-width:40px">صفحه '+(i+1)+'</strong>'
      +'<span style="font-size:.75rem;color:var(--text2)">'+p.totalWords+' کلمه • '+p.uniqueWords+' منحصربفرد</span>'
      +'</div>'
      +'<div style="font-size:.78rem;color:var(--text2);margin-top:4px;direction:ltr;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(preview)+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:4px;align-items:center">'+(p.topWords.length?'<span style="font-size:.65rem;color:var(--text2)">'+p.topWords[0].word+'</span>':'')+'</div>'
      +'</div>';
  }
  ov.innerHTML='<div class="modal" style="max-width:500px">'
    +'<h3 style="margin-bottom:8px">📄 رفتن به صفحه</h3>'
    +'<p style="color:var(--text2);font-size:.82rem;margin-bottom:12px">'+doc.totalPages+' صفحه • صفحه فعلی: '+(readingCurrentPage+1)+'</p>'
    +'<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">'
    +'<label style="font-size:.85rem;color:var(--text2);white-space:nowrap">شماره صفحه:</label>'
    +'<input type="number" id="jumpPageInput" class="input" min="1" max="'+doc.totalPages+'" value="'+(readingCurrentPage+1)+'" style="width:80px;text-align:center;font-weight:700">'
    +'<button type="button" class="btn btn-primary btn-sm" id="jumpPageGo">برو</button>'
    +'<span style="font-size:.78rem;color:var(--text2)">/ '+doc.totalPages+'</span>'
    +'</div>'
    +'<div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:12px">'
    +pagesHtml
    +'</div>'
    +'<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">'
    +'<button type="button" class="btn btn-ghost" id="jumpPageClose">بستن</button>'
    +'</div></div>';
  ov.querySelector('#jumpPageClose').onclick=function(){ov.remove()};
  ov.querySelector('#jumpPageGo').onclick=function(){
    var val=parseInt(ov.querySelector('#jumpPageInput').value);
    if(val>=1&&val<=doc.totalPages){callback(val-1);ov.remove()}
    else toast('شماره صفحه نامعتبر','error');
  };
  ov.querySelector('#jumpPageInput').onkeydown=function(e){
    if(e.key==='Enter'){e.preventDefault();ov.querySelector('#jumpPageGo').click()}
  };
  ov.querySelectorAll('[data-jpage]').forEach(function(item){
    item.onclick=function(){callback(parseInt(item.dataset.jpage));ov.remove()};
  });
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove()};
  // Focus input
  setTimeout(function(){var inp=ov.querySelector('#jumpPageInput');if(inp)inp.focus();inp.select()},100);
}

function showReadingOptionsModal(c,doc){
  var ov=document.createElement('div');ov.className='modal-overlay';
  function renderOptionsModal(){
    var themeNames={default:'پیش‌فرض',sepia:'سپیا',night:'شب',forest:'جنگل',ocean:'اقیانوس'};
    var themeColors={default:'var(--card)',sepia:'#f5edd6',night:'#1a1a2e',forest:'#1a2e1a',ocean:'#1a2230'};
    ov.innerHTML='<div class="modal" style="max-width:480px">'
      +'<h3 style="margin-bottom:16px">⚙️ گزینه‌های نمایش خواندن</h3>'
      // Font size
      +'<div style="margin-bottom:18px">'
      +'<label style="font-size:.85rem;color:var(--text2);display:block;margin-bottom:6px">🔤 اندازه فونت: <strong style="color:var(--accent)">'+readingFontSize.toFixed(2)+'rem</strong></label>'
      +'<input type="range" id="rdFontSize" min="0.7" max="2" step="0.05" value="'+readingFontSize+'" style="width:100%;accent-color:var(--accent)">'
      +'<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text2)"><span>کوچک</span><span>بزرگ</span></div>'
      +'</div>'
      // Line height
      +'<div style="margin-bottom:18px">'
      +'<label style="font-size:.85rem;color:var(--text2);display:block;margin-bottom:6px">📏 فاصله خطوط: <strong style="color:var(--accent)">'+readingLineHeight.toFixed(1)+'</strong></label>'
      +'<input type="range" id="rdLineHeight" min="1.4" max="3.5" step="0.1" value="'+readingLineHeight+'" style="width:100%;accent-color:var(--accent)">'
      +'<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text2)"><span>فشرده</span><span>باز</span></div>'
      +'</div>'
      // Content theme
      +'<div style="margin-bottom:18px">'
      +'<label style="font-size:.85rem;color:var(--text2);display:block;margin-bottom:8px">🎨 تم رنگی محتوا</label>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +Object.keys(themeNames).map(function(k){
        var isActive=readingContentTheme===k;
        return '<button type="button" class="btn btn-sm '+(isActive?'btn-primary':'btn-ghost')+'" data-ctheme="'+k+'" style="background:'+(isActive?'':themeColors[k])+';color:'+(isActive?'':'var(--text)')+';border:2px solid '+(isActive?'var(--accent)':'var(--border)')+'">'+themeNames[k]+'</button>';
      }).join('')
      +'</div></div>'
      // Quick actions
      +'<div style="margin-bottom:16px;padding-top:12px;border-top:1px solid var(--border)">'
      +'<label style="font-size:.85rem;color:var(--text2);display:block;margin-bottom:8px">⚡ دسترسی سریع</label>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
      +'<button type="button" class="btn btn-ghost btn-sm" id="rdOptResetFont" style="font-size:.75rem">🔄 بازنشانی فونت</button>'
      +'<button type="button" class="btn btn-ghost btn-sm" id="rdOptExportTxt" style="font-size:.75rem">📄 خروجی TXT</button>'
      +'<button type="button" class="btn btn-ghost btn-sm" id="rdOptCopyText" style="font-size:.75rem">📋 کپی متن</button>'
      +'<button type="button" class="btn btn-ghost btn-sm" id="rdOptReadingStats" style="font-size:.75rem">📊 آمار خواندن</button>'
      +'</div></div>'
      // Document info
      +'<div style="margin-bottom:16px;padding:12px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">'
      +'<div style="font-size:.78rem;color:var(--accent);font-weight:600;margin-bottom:6px">📁 اطلاعات فایل</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.8rem;color:var(--text2)">'
      +'<div>عنوان: <strong style="color:var(--text)">'+esc(doc.title)+'</strong></div>'
      +'<div>نوع: <strong style="color:var(--text)">'+esc(doc.sourceType)+'</strong></div>'
      +'<div>تاریخ: <strong style="color:var(--text)">'+new Date().toLocaleDateString('fa-IR')+'</strong></div>'
      +'<div>شناسه: <small style="color:var(--text2)">'+doc.id.slice(0,8)+'</small></div>'
      +'</div></div>'
      +'<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">'
      +'<button type="button" class="btn btn-primary" id="rdOptClose">بستن</button>'
      +'</div></div>';

    ov.querySelector('#rdOptClose').onclick=function(){ov.remove()};
    // Font size slider
    ov.querySelector('#rdFontSize').oninput=function(){
      readingFontSize=parseFloat(this.value);
      ov.querySelector('#rdFontSize').previousElementSibling.querySelector('strong').textContent=readingFontSize.toFixed(2)+'rem';
      var ca=document.getElementById('rdContentArea');
      if(ca)ca.style.fontSize=readingFontSize+'rem';
      try{localStorage.setItem('leitner_reading_fontSize',readingFontSize)}catch(e){}
    };
    // Line height slider
    ov.querySelector('#rdLineHeight').oninput=function(){
      readingLineHeight=parseFloat(this.value);
      ov.querySelector('#rdLineHeight').previousElementSibling.querySelector('strong').textContent=readingLineHeight.toFixed(1);
      var ca=document.getElementById('rdContentArea');
      if(ca)ca.style.lineHeight=readingLineHeight;
      try{localStorage.setItem('leitner_reading_lineHeight',readingLineHeight)}catch(e){}
    };
    // Content theme buttons
    ov.querySelectorAll('[data-ctheme]').forEach(function(btn){
      btn.onclick=function(){
        readingContentTheme=btn.dataset.ctheme;
        try{localStorage.setItem('leitner_reading_contentTheme',readingContentTheme)}catch(e){}
        renderOptionsModal();
        // Apply theme to content area immediately
        var themeStyles={default:'',sepia:'background:#f5edd6;color:#433422;border-color:#d4c5a9',night:'background:#1a1a2e;color:#c8c8d4;border-color:#333355',forest:'background:#1a2e1a;color:#c8e6c8;border-color:#335533',ocean:'background:#1a2230;color:#c8d8e8;border-color:#334858'};
        var ca=document.getElementById('rdContentArea');
        if(ca){
          if(themeStyles[readingContentTheme])ca.style.cssText+=';'+themeStyles[readingContentTheme];
          else{ca.style.background='';ca.style.color='';ca.style.borderColor=''}
        }
      };
    });
    // Reset font
    var resetBtn=ov.querySelector('#rdOptResetFont');
    if(resetBtn)resetBtn.onclick=function(){
      readingFontSize=1.05;readingLineHeight=2.2;readingContentTheme='default';
      try{localStorage.setItem('leitner_reading_fontSize',readingFontSize);localStorage.setItem('leitner_reading_lineHeight',readingLineHeight);localStorage.setItem('leitner_reading_contentTheme',readingContentTheme)}catch(e){}
      renderOptionsModal();
      renderReading(c);
    };
    // Export TXT
    var exportTxtBtn=ov.querySelector('#rdOptExportTxt');
    if(exportTxtBtn)exportTxtBtn.onclick=function(){
      var blob=new Blob([doc.rawText],{type:'text/plain;charset=utf-8'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download=doc.title.replace(/[^a-z0-9\u0600-\u06FF]/gi,'_')+'.txt';a.click();URL.revokeObjectURL(url);
      toast('فایل TXT دانلود شد','success');
    };
    // Copy text
    var copyBtn=ov.querySelector('#rdOptCopyText');
    if(copyBtn)copyBtn.onclick=function(){
      navigator.clipboard.writeText(doc.rawText).then(function(){toast('متن کپی شد','success')}).catch(function(){toast('خطا در کپی','error')});
    };
    // Reading stats
    var statsBtn=ov.querySelector('#rdOptReadingStats');
    if(statsBtn)statsBtn.onclick=function(){
      ov.remove();
      showReadingStatsModal(doc);
    };
  }
  renderOptionsModal();
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove()};
}

function showReadingStatsModal(doc){
  var ov=document.createElement('div');ov.className='modal-overlay';
  var unknownWords=Object.entries(doc.occurrences).filter(function(e){return !wordExists(e[0])}).sort(function(a,b){return b[1].count-a[1].count});
  var knownWords=Object.entries(doc.occurrences).filter(function(e){return wordExists(e[0])}).sort(function(a,b){return b[1].count-a[1].count});
  var wordLens=Object.keys(doc.occurrences).map(function(w){return w.length});
  var avgLen=wordLens.length?(wordLens.reduce(function(a,b){return a+b},0)/wordLens.length).toFixed(1):0;
  var maxLen=wordLens.length?Math.max.apply(null,wordLens):0;
  var minLen=wordLens.length?Math.min.apply(null,wordLens):0;
  // Word length distribution
  var lenDist={};wordLens.forEach(function(l){lenDist[l]=(lenDist[l]||0)+1});
  var lenDistHtml=Object.entries(lenDist).sort(function(a,b){return parseInt(a[0])-parseInt(b[0])}).slice(0,12).map(function(e){
    var pct=Math.round(e[1]/wordLens.length*100);
    return '<div style="display:flex;align-items:center;gap:6px;font-size:.78rem"><span style="min-width:24px;text-align:center;color:var(--accent)">'+e[0]+'</span><div style="flex:1;height:14px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px"></div></div><span style="min-width:30px;color:var(--text2)">'+e[1]+'</span></div>';
  }).join('');
  // Frequency distribution
  var t1Count=Object.keys(doc.occurrences).filter(function(w){return FREQ_T1.has(w)}).length;
  var t2Count=Object.keys(doc.occurrences).filter(function(w){return FREQ_T2.has(w)}).length;
  var t3Count=Object.keys(doc.occurrences).filter(function(w){return FREQ_T3.has(w)}).length;
  var advCount=Object.keys(doc.occurrences).length-t1Count-t2Count-t3Count;

  ov.innerHTML='<div class="modal" style="max-width:560px">'
    +'<h3 style="margin-bottom:16px">📊 آمار تفصیلی خواندن</h3>'
    // Word length distribution
    +'<div style="margin-bottom:18px">'
    +'<div style="font-size:.85rem;font-weight:600;color:var(--accent);margin-bottom:8px">📏 توزیع طول کلمات</div>'
    +'<div style="font-size:.78rem;color:var(--text2);margin-bottom:8px">میانگین: '+avgLen+' | کوتاه‌ترین: '+minLen+' | بلندترین: '+maxLen+' کاراکتر</div>'
    +lenDistHtml
    +'</div>'
    // Frequency tier distribution
    +'<div style="margin-bottom:18px">'
    +'<div style="font-size:.85rem;font-weight:600;color:var(--accent);margin-bottom:8px">📊 توزیع فراوانی واژگان</div>'
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'
    +'<div style="padding:10px;background:rgba(0,184,148,.08);border-radius:8px;text-align:center"><div style="font-size:1.3rem;font-weight:700;color:var(--success)">'+t1Count+'</div><div style="font-size:.7rem;color:var(--text2)">پرکاربرد (T1)</div></div>'
    +'<div style="padding:10px;background:rgba(108,92,231,.08);border-radius:8px;text-align:center"><div style="font-size:1.3rem;font-weight:700;color:var(--accent)">'+t2Count+'</div><div style="font-size:.7rem;color:var(--text2)">رایج (T2)</div></div>'
    +'<div style="padding:10px;background:rgba(253,203,110,.08);border-radius:8px;text-align:center"><div style="font-size:1.3rem;font-weight:700;color:var(--warning)">'+t3Count+'</div><div style="font-size:.7rem;color:var(--text2)">مفید (T3)</div></div>'
    +'<div style="padding:10px;background:rgba(225,112,85,.08);border-radius:8px;text-align:center"><div style="font-size:1.3rem;font-weight:700;color:var(--danger)">'+advCount+'</div><div style="font-size:.7rem;color:var(--text2)">پیشرفته</div></div>'
    +'</div></div>'
    // Known vs Unknown
    +'<div style="margin-bottom:18px">'
    +'<div style="font-size:.85rem;font-weight:600;color:var(--accent);margin-bottom:8px">✅ وضعیت واژگان</div>'
    +'<div style="display:flex;gap:12px;margin-bottom:8px">'
    +'<div style="flex:1;padding:12px;background:rgba(0,184,148,.08);border-radius:8px;text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--success)">'+knownWords.length+'</div><div style="font-size:.75rem;color:var(--text2)">شناخته‌شده</div></div>'
    +'<div style="flex:1;padding:12px;background:rgba(225,112,85,.08);border-radius:8px;text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--danger)">'+unknownWords.length+'</div><div style="font-size:.75rem;color:var(--text2)">ناشناخته</div></div>'
    +'</div>'
    +'<div class="progress-bar"><div class="progress-fill" style="width:'+(doc.uniqueWords>0?Math.round(knownWords.length/doc.uniqueWords*100):0)+'%;background:linear-gradient(90deg,var(--success),#00d2a0)"></div></div>'
    +'<div style="font-size:.75rem;color:var(--text2);text-align:center;margin-top:4px">'+(doc.uniqueWords>0?Math.round(knownWords.length/doc.uniqueWords*100):0)+'% شناخته‌شده</div>'
    +'</div>'
    // Top unknown words
    +'<div style="margin-bottom:16px">'
    +'<div style="font-size:.85rem;font-weight:600;color:var(--danger);margin-bottom:8px">❓ پرتکرارترین ناشناخته‌ها</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:4px">'
    +unknownWords.slice(0,15).map(function(e){return '<span style="padding:3px 10px;border-radius:8px;font-size:.78rem;background:rgba(225,112,85,.1);color:var(--danger);border:1px solid rgba(225,112,85,.2)">'+esc(e[0])+' <small>('+e[1].count+')</small></span>'}).join('')
    +'</div></div>'
    +'<div style="display:flex;justify-content:flex-end;margin-top:12px">'
    +'<button type="button" class="btn btn-primary" id="rdStatsClose">بستن</button>'
    +'</div></div>';
  ov.querySelector('#rdStatsClose').onclick=function(){ov.remove()};
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove()};
}

function exportReadingVocab(doc){
  var vocab=Object.entries(doc.occurrences).sort(function(a,b){return b[1].count-a[1].count}).map(function(entry){
    var word=entry[0],o=entry[1];
    var cached=getCachedTrans(word)||{};
    return{word:word,translation:cached.translation||'',ipa:cached.ipa||'',count:o.count,pages:o.pages,inLeitner:wordExists(word)};
  });
  var blob=new Blob([JSON.stringify(vocab,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='reading-vocab-'+doc.title.replace(/[^a-z0-9]/gi,'_')+'.json';a.click();URL.revokeObjectURL(url);
  toast(vocab.length+' واژه خروجی گرفته شد','success');
}



