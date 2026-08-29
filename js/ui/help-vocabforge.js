// Help and integrated VocabForge workflow.
const HELP_DICT={
 review:{title:'📖 مرور هوشمند',body:'<p>کلماتی که زمان مرورشان رسیده اینجا نمایش داده می‌شوند. پاسخ را حدس بزنید، کارت را برگردانید و امتیاز مناسب بدهید.</p>'},
 quiz:{title:'❓ آزمون',body:'<p>آزمون‌ها از کلمات کتابخانه ساخته می‌شوند و عملکرد شما را در آمار ثبت می‌کنند.</p>'},
 engquiz:{title:'🎯 تعیین سطح انگلیسی',body:'<p>سطح CEFR خود را با آزمون کوتاه تعیین کنید.</p>'},
 library:{title:'📚 کتابخانه واژگان',body:'<p>کلمات لایتنر را جستجو، فیلتر، ویرایش یا حذف کنید.</p>'},
 longterm:{title:'🧠 حافظه بلندمدت',body:'<p>کلمات تثبیت‌شده در این بخش نگهداری می‌شوند و امکان بازگشت یا حذف دارند.</p>'},
 wordweb:{title:'🗺️ نقشه واژگان',body:'<p>رابطه‌ی مترادف‌ها، متضادها و خانواده‌ی واژگان را ببینید.</p>'},
 import:{title:'📥 ورود کلمات',body:'<p>برای ورود معمولی از متن، فایل، JSON یا Anki استفاده کنید. برای استخراج و غنی‌سازی مرحله‌ای، VocabForge داخلی را باز کنید.</p>'},
 export:{title:'💾 خروج / پشتیبان',body:'<p>از کلمات و تنظیمات خود پشتیبان JSON بگیرید یا آن‌ها را به CSV و Anki خروجی بگیرید.</p>'},
 reading:{title:'📰 خواندن متن',body:'<p>متن انگلیسی را بخوانید و کلمات موردنظر را به لایتنر اضافه کنید.</p>'},
 pdfreader:{title:'📄 خواننده PDF',body:'<p>PDF را باز کنید، متن را انتخاب کنید و کلمات را به لایتنر اضافه کنید.</p>'},
 stats:{title:'📊 آمار و تقویم',body:'<p>مرورها، دقت، روند یادگیری و تقویم فعالیت را بررسی کنید.</p>'},
 aichat:{title:'🤖 چت با هوش مصنوعی',body:'<p>برای توضیح، مثال و تمرین واژگان از providerهای AI استفاده کنید.</p>'},
 vocabforge:{title:'⚒️ وکب فورج داخلی',body:'<p>VocabForge داخل همین برنامه اجرا می‌شود و iframe یا سایت جداگانه ندارد.</p><ol><li>متن یا فایل TXT/PDF/DOCX را وارد کنید.</li><li>کلمات را انتخاب کنید.</li><li>به غنی‌سازی بروید و تعریف و ترجمه بگیرید.</li><li>در خروجی، مقصد هر انتخاب را تعیین کنید.</li></ol><p>کارت‌های غنی‌شده تا زمان انتقال در IndexedDB باقی می‌مانند.</p>'},
 settings:{title:'⚙️ تنظیمات',body:'<p>پوسته، اعلان‌ها، صدا و تنظیمات AI را مدیریت کنید.</p>'},
 about:{title:'ℹ️ درباره',body:'<p>اطلاعات نسخه و امکانات برنامه.</p>'}
};
const IMPORT_HELPS={
 text:{title:'ورود از متن',body:'<p>متن را وارد کنید و نمایش متن را بزنید تا کلمات برای انتخاب آماده شوند.</p>'},
 file:{title:'ورود از فایل',body:'<p>TXT، PDF، DOCX، JSON و Anki پشتیبانی می‌شوند.</p>'},
 docx:{title:'ورود هوشمند DOCX',body:'<p>فایل‌های جدول‌دار واژگان مانند Manhattan با تعریف، مثال، مترادف و متضاد خوانده می‌شوند.</p>'},
 url:{title:'ورود از URL',body:'<p>لینک مستقیم فایل متنی را وارد کنید.</p>'},
 quick:{title:'افزودن سریع کلمات',body:'<p>هر خط یک کلمه یا word=ترجمه وارد کنید.</p>'},
 packs:{title:'بسته‌های لغت آماده',body:'<p>بسته‌های آماده را مستقیماً به کتابخانه اضافه کنید.'}
};
function helpModal(title,bodyHtml){
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML='<div class="modal" style="max-width:560px"><div class="help-section-title"><h3 style="margin:0;flex:1">'+title+'</h3><button type="button" class="btn btn-ghost btn-sm" id="helpCloseBtn">✕ بستن</button></div><div class="help-modal-body">'+bodyHtml+'</div></div>';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  document.body.appendChild(ov);
  ov.querySelector('#helpCloseBtn').addEventListener('click',()=>ov.remove());
}
function showHelp(key){const h=HELP_DICT[key]||HELP_DICT.about;helpModal(h.title,h.body)}
function showImportHelp(key){const h=IMPORT_HELPS[key];if(h)helpModal(h.title,h.body)}
function decorateImportHelp(){
  const headings=document.querySelectorAll('#content h3, #content h4');
  headings.forEach(heading=>{
    const text=heading.textContent.trim();
    const key=text.startsWith('ورود متن')?'text':text.startsWith('ورود فایل')?'file':text.includes('ورود هوشمند DOCX')?'docx':text.startsWith('ورود از URL')?'url':text.includes('افزودن سریع')?'quick':text.includes('بسته‌های لغت')?'packs':null;
    if(!key||heading.querySelector('.help-btn'))return;
    const button=document.createElement('button');button.type='button';button.className='help-btn';button.title='توضیح';button.textContent='؟';button.onclick=()=>showImportHelp(key);heading.appendChild(button);
  });
}

// ═══════════════════════════════════════════════════════════
// VOCABFORGE — سازنده فلش‌کارت (Wizard اسلایدی داخلی)
// ═══════════════════════════════════════════════════════════
let vfSelectedIds=new Set();
function vfToNumber(value,fallback){
  const normalized=String(value??'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^0-9]/g,'');
  const number=Number(normalized);
  return Number.isFinite(number)&&number>0?number:fallback;
}
function vfClampMaxWords(value){return Math.min(5000,Math.max(10,vfToNumber(value,300)))}
function vfMaxWordsControl(){
  return '<div class="vf-number-control"><label for="vfMaxWords">حداکثر کلمه</label><div class="vf-number-row"><button type="button" class="btn btn-ghost btn-sm" id="vfMaxWordsMinus" aria-label="کاهش ۵۰ کلمه">−۵۰</button><input class="input" type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*" id="vfMaxWords" value="300" aria-describedby="vfMaxWordsHint"><button type="button" class="btn btn-ghost btn-sm" id="vfMaxWordsPlus" aria-label="افزایش ۵۰ کلمه">+۵۰</button></div><small id="vfMaxWordsHint">حدود ۱۰ تا ۵۰۰۰ کلمه؛ مقدار دستی یا دکمه‌ای قابل تغییر است</small></div>';
}
function bindVfMaxWords(){
  const input=document.getElementById('vfMaxWords');if(!input)return;
  const update=value=>{input.value=String(vfClampMaxWords(value))};
  input.addEventListener('blur',()=>update(input.value));
  input.addEventListener('change',()=>update(input.value));
  document.getElementById('vfMaxWordsMinus')?.addEventListener('click',()=>update(vfClampMaxWords(input.value)-50));
  document.getElementById('vfMaxWordsPlus')?.addEventListener('click',()=>update(vfClampMaxWords(input.value)+50));
}
let vfSlide=1; // 1=ورود 2=انتخاب کلمات 3=غنی‌سازی/ترجمه 4=خروجی و انتقال
let vfSlideInit=false;
let vfInputType='text';
const VF_STEP_LABELS={1:'ورود',2:'انتخاب کلمات',3:'غنی‌سازی و ترجمه',4:'خروجی و انتقال'};
const VF_FA_DIGITS={1:'۱',2:'۲',3:'۳',4:'۴'};
function vfSetSlide(n){vfSlideInit=true;vfSlide=Math.max(1,Math.min(4,n))}
function vfEnsureSlide(){
  if(vfSlideInit)return;
  vfSlideInit=true;
  if(vfCards().some(card=>card.translation&&card.definitions.length))vfSlide=4;
  else if(vfCards().length)vfSlide=2;
}
// ═══ CEFR LEVEL FILTER (data/cefr.json) ═══
let vfCefrLevel='';
let vfCefrData=null;
async function vfLoadCefr(){
  if(vfCefrData)return vfCefrData;
  try{
    const cached=sessionStorage.getItem('vf_cefr');
    if(cached){vfCefrData=JSON.parse(cached);return vfCefrData}
  }catch(e){}
  try{
    const r=await fetch('data/cefr.json');
    if(r.ok){vfCefrData=await r.json();try{sessionStorage.setItem('vf_cefr',JSON.stringify(vfCefrData))}catch(e){}}
  }catch(e){}
  return vfCefrData;
}
function vfWordLevel(word){
  if(!vfCefrData||!vfCefrData.words)return null;
  const w=String(word||'').toLowerCase().trim();
  if(!w)return null;
  const levels=['A1','A2','B1','B2','C1','C2'];
  const check=function(term){for(const lv of levels){if((vfCefrData.words[lv]||'').split(' ').indexOf(term)>=0)return lv}return null};
  const direct=check(w);if(direct)return direct;
  const stems=vfStem(w);
  for(const s of stems){const lv=check(s);if(lv)return lv}
  return null;
}
async function vfFilterByCefr(words){
  const level=vfCefrLevel;
  if(!level||!words||!words.length)return{kept:words,removed:[]};
  await vfLoadCefr();
  const kept=[],removed=[];
  words.forEach(function(w){
    const lv=vfWordLevel(w);
    if(!lv||lv===level)kept.push(w);
    else removed.push(w);
  });
  return{kept,removed};
}
function vfNextHint(){
  if(vfSlide>=4)return 'مرحله‌ی بعدی: انتقال به کتابخانه یا حافظه بلندمدت، یا اتمام کار';
  if(vfSlide===3)return 'مرحله‌ی بعدی: رفتن به خروجی و انتقال کلمات';
  if(vfSlide===2)return 'مرحله‌ی بعدی: غنی‌سازی و ترجمه کلمات انتخاب‌شده';
  return 'مرحله‌ی بعدی: ورود متن یا فایل TXT/PDF/DOCX';
}
function vfStepDot(n){return 'import-step-dot'+(n===vfSlide?' active':n<vfSlide?' done':'')}
// کش نتایج غنی‌سازی و ترجمه در IndexedDB — کلیدهای جداگانه در همان leitnerDB
function vfCacheGet(key){return typeof idbGet==='function'?idbGet('vf_cache_'+key):Promise.resolve(null)}
function vfCacheSet(key,value){if(typeof idbPut==='function')return idbPut('vf_cache_'+key,value).catch(()=>{});return Promise.resolve(null)}
async function vfCached(key,compute){
  const cached=await vfCacheGet(key);
  if(cached!=null)return cached;
  const value=await compute();
  if(value!=null&&!(Array.isArray(value)&&!value.length))await vfCacheSet(key,value);
  return value;
}
function vfClearCache(){
  if(typeof openDB!=='function')return Promise.resolve(0);
  return openDB().then(db=>new Promise(resolve=>{
    const tx=db.transaction('data','readwrite');
    const store=tx.objectStore('data');
    const cursor=store.openCursor();const keys=[];
    cursor.onsuccess=()=>{if(cursor.result){if(String(cursor.result.key).startsWith('vf_cache_'))keys.push(cursor.result.key);cursor.result.continue()}else{keys.forEach(k=>store.delete(k));resolve(keys.length)}};
    cursor.onerror=()=>resolve(0);
  }));
}
function vfStore(){
  if(!S.settings.vocabForge)S.settings.vocabForge={cards:[]};
  if(!Array.isArray(S.settings.vocabForge.cards))S.settings.vocabForge.cards=[];
  return S.settings.vocabForge;
}
function vfCards(){return vfStore().cards}
function migrateLegacyVocabForge(){
  if(vfCards().length||!window.indexedDB)return Promise.resolve(false);
  return new Promise(resolve=>{
    const request=indexedDB.open('vocabforgeDB');
    request.onerror=()=>resolve(false);
    request.onupgradeneeded=event=>{event.target.result.close();resolve(false)};
    request.onsuccess=event=>{
      const db=event.target.result;
      if(!db.objectStoreNames.contains('cards')){db.close();resolve(false);return}
      const tx=db.transaction('cards','readonly');const get=tx.objectStore('cards').get('all');
      get.onsuccess=()=>{const legacy=Array.isArray(get.result)?get.result:[];db.close();if(!legacy.length){resolve(false);return}const added=vfAddCards(legacy);resolve(added>0)};
      get.onerror=()=>{db.close();resolve(false)};
    };
  });
}
function vfNormalize(raw){
  const card=createCard({...raw,id:raw.id||uid(),word:String(raw.word||raw.text||'').trim().toLowerCase(),category:raw.category||'VocabForge',source:raw.source||'VocabForge',tags:[...new Set([...(raw.tags||[]),'VocabForge'])]});
  card.box=0;card.nextReviewDate=null;card.fsrsState='new';return card;
}
function vfSaveCards(cards){vfStore().cards=cards.map(vfNormalize).filter(card=>card.word);save()}
function vfAddCards(cards){
  const existing=new Set(vfCards().map(card=>card.word.toLowerCase()));
  const fresh=[];
  for(const raw of cards){const card=vfNormalize(raw);const key=card.word.toLowerCase();if(key&&!existing.has(key)){existing.add(key);fresh.push(card)}}
  if(fresh.length)vfSaveCards([...vfCards(),...fresh]);
  return fresh.length;
}
// استخراج کلمات: حذف stopwords + شمارش فراوانی + مرتب‌سازی بر اساس تکرار (مثل نسخه‌ی اصلی)
const VF_STOP=new Set('a about above after again against all am an and any are as at be because been before being below between both but by can cannot could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves'.split(' '));
function vfExtractWords(text,minLen,maxWords){
  minLen=minLen||3;maxWords=maxWords||300;
  const counts=new Map();
  (String(text||'').match(/[a-zA-Z][a-zA-Z'-]*/g)||[]).forEach(w=>{
    const wl=w.toLowerCase();
    if(wl.length>=minLen&&!VF_STOP.has(wl)){const ex=counts.get(wl);counts.set(wl,{word:ex?ex.word:w,count:(ex?ex.count:0)+1})}
  });
  return [...counts.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,maxWords).map(e=>e[1].word);
}
function parsePageRange(str,total){
  if(!str)return null;
  const pages=new Set();
  String(str).split(',').forEach(p=>{p=p.trim();if(p.includes('-')){const[a,b]=p.split('-').map(Number);for(let i=a;i<=b;i++)if(i>=1&&i<=total)pages.add(i)}else{const n=Number(p);if(n>=1&&n<=total)pages.add(n)}});
  return pages.size?[...pages]:null;
}
async function vfExtractPdf(file,pageRangeStr,minLen,maxWords,onProgress){
  await ensurePdfJs();
  const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
  const pageRange=parsePageRange(pageRangeStr,pdf.numPages);
  const totalPages=pageRange?pageRange.length:pdf.numPages;
  let text='',done=0;
  for(let i=1;i<=pdf.numPages;i++){
    if(pageRange&&!pageRange.includes(i))continue;
    const content=await pdf.getPage(i).then(p=>p.getTextContent());
    text+=content.items.map(x=>x.str).join(' ')+' ';
    done++;
    if(typeof onProgress==='function')onProgress(done,totalPages);
  }
  let words=vfExtractWords(text,minLen,maxWords);
  const filt=await vfFilterByCefr(words);words=filt.kept;
  const added=vfAddCards(words.map(word=>({word,source:file.name.replace(/\.pdf$/i,'')})));
  return{added,total:words.length};
}
async function vfExtractFile(file,opts){
  const ext=file.name.split('.').pop().toLowerCase();
  const o=opts||{};
  if(ext==='txt'){let words=vfExtractWords(await file.text(),o.minLen,o.maxWords);const filt=await vfFilterByCefr(words);words=filt.kept;const added=vfAddCards(words.map(word=>({word,source:file.name})));return{added,total:words.length}}
  if(ext==='pdf')return vfExtractPdf(file,o.pages||'',o.minLen,o.maxWords,o.onProgress);
  if(ext==='docx'){
    await ensureJsZip();const zip=await JSZip.loadAsync(await file.arrayBuffer());let parsed=[];
    try{parsed=await parseDocxTableStructured(zip)}catch(e){parsed=[]}
    if(parsed.length)return{added:vfAddCards(parsed.map(card=>({...card,source:file.name}))),total:parsed.length};
    const xml=await zip.file('word/document.xml').async('text');const nodes=new DOMParser().parseFromString(xml,'text/xml').getElementsByTagName('w:t');let text='';
    for(let i=0;i<nodes.length;i++)text+=nodes[i].textContent+' ';
    const words=vfExtractWords(text,o.minLen,o.maxWords);return{added:vfAddCards(words.map(word=>({word,source:file.name}))),total:words.length};
  }
  throw new Error('فرمت پشتیبانی نمی‌شود؛ TXT، PDF یا DOCX انتخاب کنید');
}
function vfSelectionCount(){return vfCards().filter(card=>vfSelectedIds.has(card.id)).length}
function vfChips(arr,limit){
  if(!arr||!arr.length)return'';
  return '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">'+arr.slice(0,limit||6).map(v=>'<span style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 9px;font-size:.7rem;color:var(--accent)">'+esc(v)+'</span>').join('')+'</div>';
}
// نمایش غنی‌سازی هم‌فرمت بخش مرور: ترجمه، IPA، POS، تعاریف، مثال، مترادف، متضاد، خانواده، هم‌نشینی
function vfRichHtml(card){
  const s=[];
  const hdr=[];
  if(card.partOfSpeech)hdr.push('<span class="badge badge-accent" style="font-size:.6rem">'+esc(card.partOfSpeech)+'</span>');
  if(card.ipa)hdr.push('<span style="color:var(--text2);font-size:.75rem" dir="ltr">'+esc(card.ipa)+'</span>');
  if(hdr.length)s.push('<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:4px">'+hdr.join('')+'</div>');
  if(card.translation)s.push('<div style="margin-bottom:4px"><strong style="color:var(--success);font-size:.75rem">🌐 ترجمه:</strong> <span style="color:var(--text);font-size:.82rem">'+esc(card.translation)+'</span></div>');
  if(card.coreMeaning)s.push('<div style="color:var(--text2);font-size:.76rem;margin-bottom:4px">'+esc(card.coreMeaning)+'</div>');
  if(card.definitions&&card.definitions.length){const src=card.defSource==='fa-wiktionary'?'<span style="font-size:.62rem;color:var(--warning)">(ویکی‌واژه فارسی)</span>':card.defSource==='fallback-trans'?'<span style="font-size:.62rem;color:var(--warning)">(ترجمه خودکار)</span>':'';s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">📖 تعاریف '+src+'</div>'+card.definitions.slice(0,4).map(d=>'<div style="font-size:.78rem;line-height:1.6">• '+esc(d)+'</div>').join('')+'</div>')}
  if(card.examples&&card.examples.length){s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">💬 مثال</div>'+card.examples.slice(0,3).map(ex=>'<div style="font-size:.78rem;color:var(--text2);font-style:italic;line-height:1.6">«'+esc(ex)+'»</div>').join('')+'</div>')}
  if(card.synonyms&&card.synonyms.length){s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">🔄 مترادف</div>'+vfChips(card.synonyms,6)+'</div>')}
  if(card.antonyms&&card.antonyms.length){s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">⚡ متضاد</div>'+vfChips(card.antonyms,6)+'</div>')}
  if(card.wordFamily&&card.wordFamily.length){s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">🌳 خانواده واژگانی</div>'+vfChips(card.wordFamily,8)+'</div>')}
  if(card.collocations&&card.collocations.length){s.push('<div style="margin-bottom:4px"><div style="font-size:.7rem;color:var(--accent);font-weight:600;margin-bottom:2px">🔗 هم‌نشینی</div>'+vfChips(card.collocations,6)+'</div>')}
  return s.join('');
}
function vfCardRow(card,opts){
  const hasTrans=!!card.translation;const hasDef=!!(card.definitions&&card.definitions.length);
  const complete=hasTrans&&hasDef;
  const warnBorder=!complete&&hasTrans&&!hasDef?'border:1px solid var(--warning);box-shadow:0 0 0 1px var(--warning)':'';
  const badge=hasDef?'<span class="badge badge-success">غنی‌شده</span>':(hasTrans?'<span class="badge badge-warning">بدون غنی‌سازی</span>':'<span class="badge badge-accent">خام</span>');
  const checked=vfSelectedIds.has(card.id);
  const rich=(opts&&opts.rich)?'<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border)">'+vfRichHtml(card)+'</div>':'';
  const perRow=(opts&&opts.actions)?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn btn-primary btn-sm" data-vf-dest="words" data-vf-id="'+esc(card.id)+'" '+(complete?'':'disabled')+'>📚 انتقال به کتابخانه</button><button type="button" class="btn btn-success btn-sm" data-vf-dest="longTerm" data-vf-id="'+esc(card.id)+'" '+(complete?'':'disabled')+'>🧠 به حافظه بلندمدت</button><button type="button" class="btn btn-danger btn-sm" data-vf-del="'+esc(card.id)+'">🗑 حذف</button></div>':'';
  return '<div style="border:1px solid var(--border);border-radius:12px;padding:10px;margin-bottom:8px;background:var(--bg);'+warnBorder+'"><label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer"><input type="checkbox" data-vf-select="'+esc(card.id)+'" '+(checked?'checked':'')+'><strong style="min-width:90px">'+esc(card.word)+'</strong><span style="flex:1;color:var(--text2);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(card.translation||card.coreMeaning||'بدون ترجمه')+'</span>'+badge+'</label>'+rich+perRow+'</div>';
}
function vfListHtml(opts){
  if(!vfCards().length)return '<div class="empty" style="padding:24px"><div class="icon">📭</div><p>هنوز کلمه‌ای وارد نشده است.</p></div>';
  return '<div style="display:grid;gap:0;max-height:46vh;overflow-y:auto">'+vfCards().map(card=>vfCardRow(card,opts)).join('')+'</div>';
}
// ── Fallback تعریف فارسی برای کلمات نادر ─────────────────────
function faWikitextToDefs(wt){
  try{
    const out=[];
    String(wt||'').split('\n').forEach(function(raw){
      let t=raw.replace(/^[#*:;]+/,'').trim();
      if(!t)return;
      if(t.startsWith('=')||t.startsWith('{')||t.startsWith('|'))return;
      if(/رده:|ویکی‌پدیا|الگو:|ترجمه\s+ها?|نویسه/.test(t))return;
      // strip [[...]] link markup (inner label if any)
      t=t.replace(/\[[^\]]*\|([^\]]*)\]\]/g,'$1').replace(/\[\[([^\]]*)\]\]/g,'$1').replace(/'''''?/g,'').trim();
      if(!t)return;
      out.push(t);
    });
    return out.filter(Boolean).slice(0,4);
  }catch(e){return[]}
}
async function fetchPersianWiktionaryDefs(word){
  try{
    const r=await timedFetch('https://fa.wiktionary.org/w/api.php?action=parse&page='+encodeURIComponent(word)+'&prop=wikitext&format=json&origin=*');
    if(!r.ok)return[];
    const d=await r.json();
    const wt=d&&d.parse&&d.parse.wikitext?d.parse.wikitext['*']:'';
    return faWikitextToDefs(wt);
  }catch(e){return[]}
}
function vfStem(w){
  // Smart word resolver (same logic as standalone VocabForge):
  // multi-word → first word, plus morphological suffix stripping with
  // e-forms (tion→te, ity→e/y, ive→e/d, able→e, ...) for better hits.
  const lower=String(w||'').toLowerCase().trim();
  if(!lower)return[];
  const variants=[lower];
  if(lower.includes(' '))variants.push(lower.split(/\s+/)[0]);
  if(lower.endsWith('ing'))variants.push(lower.slice(0,-3),lower.slice(0,-3)+'e',lower.slice(0,-4));
  if(lower.endsWith('tion'))variants.push(lower.slice(0,-4)+'te',lower.slice(0,-4)+'t');
  if(lower.endsWith('ment'))variants.push(lower.slice(0,-4));
  if(lower.endsWith('ness'))variants.push(lower.slice(0,-4));
  if(lower.endsWith('ity'))variants.push(lower.slice(0,-3)+'e',lower.slice(0,-3)+'y');
  if(lower.endsWith('ence'))variants.push(lower.slice(0,-4)+'d');
  if(lower.endsWith('ance'))variants.push(lower.slice(0,-4)+'e');
  if(lower.endsWith('ly'))variants.push(lower.slice(0,-2));
  if(lower.endsWith('ed'))variants.push(lower.slice(0,-2),lower.slice(0,-1));
  if(lower.endsWith('er'))variants.push(lower.slice(0,-2),lower.slice(0,-2)+'e');
  if(lower.endsWith('es'))variants.push(lower.slice(0,-2),lower.slice(0,-1));
  if(lower.endsWith('s')&&!lower.endsWith('ss'))variants.push(lower.slice(0,-1));
  if(lower.endsWith('ful'))variants.push(lower.slice(0,-3));
  if(lower.endsWith('ous'))variants.push(lower.slice(0,-3));
  if(lower.endsWith('ive'))variants.push(lower.slice(0,-3)+'e',lower.slice(0,-3)+'d');
  if(lower.endsWith('able'))variants.push(lower.slice(0,-4),lower.slice(0,-4)+'e');
  if(lower.endsWith('ible'))variants.push(lower.slice(0,-4));
  return[...new Set(variants)].filter(v=>v.length>=2);
}
async function vfRun(operation){
  const selected=vfCards().filter(card=>vfSelectedIds.has(card.id));
  if(!selected.length){toast('ابتدا کلمات را انتخاب کنید','error');return}
  const wasSlide=vfSlide;
  const isTrans=operation==='translate';
  const fill=document.getElementById(isTrans?'vfTransFill':'vfEnrichFill');
  const label=document.getElementById(isTrans?'vfTransLabel':'vfEnrichLabel');
  const status=document.getElementById(isTrans?'vfTransStatus':'vfEnrichStatus');
  const resultEl=document.getElementById(isTrans?'vfTransResult':'vfEnrichResult');
  const stopBtn=document.getElementById(isTrans?'vfTransStopBtn':'vfEnrichStopBtn');
  const button=document.getElementById(isTrans?'vfTranslateBtn':'vfEnrichBtn');if(button)button.disabled=true;
  if(stopBtn)stopBtn.style.display='inline-flex';
  if(resultEl)resultEl.innerHTML='';
  if(fill)fill.style.width='0%';
  const total=selected.length;let done=0,aborted=false;
  const notFound=[];
  if(stopBtn)stopBtn.onclick=()=>{aborted=true};
  const concurrency=isTrans?6:6;
  let cursor=0;
  const processCard=async card=>{
    const key=card.word.toLowerCase();
    if(isTrans){const t=await vfCached('trans:'+key,()=>fetchTranslation(card.word));if(t)card.translation=t;else notFound.push(card.word)}
    else{
      let result=await vfCached('dict:'+key,()=>fetchDictionary(card.word));if(!result){const stems=vfStem(card.word).slice(1);for(let i=0;i<stems.length&&!result;i+=4){const chunk=stems.slice(i,i+4);const hits=await Promise.all(chunk.map(s=>vfCached('dict:'+s,()=>fetchDictionary(s))));const idx=hits.findIndex(h=>h&&h.meanings&&h.meanings.length);if(idx>=0){result=hits[idx];card.baseForm=card.baseForm||chunk[idx]}}}
      if(result&&(!result.meanings||!result.meanings.length))result=null;
      // Source 2 (like standalone): Wiktionary REST full definitions for rare words
      if(!result){const wikiDefs=await vfCached('wiki:'+key,()=>fetchWiktionaryDefinitions(card.word));if(wikiDefs&&wikiDefs.definitions&&wikiDefs.definitions.length){result=wikiDefs;card.definitions=wikiDefs.definitions;card.defSource='wiktionary';card.coreMeaning=card.coreMeaning||wikiDefs.definitions[0];if(!card.examples||!card.examples.length)card.examples=wikiDefs.examples||[];if(!card.partOfSpeech)card.partOfSpeech=wikiDefs.partOfSpeech||''}}
      if(!result){const faDefs=await vfCached('fadef2:'+key,()=>fetchPersianWiktionaryDefs(card.word));if(faDefs&&faDefs.length){card.definitions=faDefs;card.defSource='fa-wiktionary';card.coreMeaning=card.coreMeaning||faDefs[0]}}
      if(result){
        card.ipa=result.phonetic||card.ipa;card.audioUs=result.audioUs||card.audioUs;card.audioBr=result.audioBr||card.audioBr;
        const meanings=result.meanings||[];
        const defs=[...new Set(meanings.flatMap(m=>m.definitions||[]))].filter(Boolean).slice(0,8);
        if(defs.length){card.definitions=defs;card.coreMeaning=defs[0]||card.coreMeaning}
        if(meanings[0]&&meanings[0].partOfSpeech)card.partOfSpeech=card.partOfSpeech||meanings[0].partOfSpeech;
        const exs=[...new Set(meanings.flatMap(m=>m.examples||[]))].filter(Boolean).slice(0,6);if(exs.length)card.examples=exs;
        const syns=[...new Set(meanings.flatMap(m=>m.synonyms||[]))].filter(Boolean).slice(0,8);if(syns.length)card.synonyms=syns;
      }
      // Fallback translation as last resort — AFTER definitions are set from dict,
      // so enrich doesn't fetch a translation for every word unnecessarily.
      if(!card.definitions||!card.definitions.length){const autot=await vfCached('trans:'+key,()=>fetchTranslation(card.word));if(autot){card.definitions=[autot];card.defSource='fallback-trans';card.coreMeaning=card.coreMeaning||autot;if(!card.translation)card.translation=autot}}
      try{
        if(!card.wordFamily||!card.wordFamily.length)card.wordFamily=(getMorphologicalFamily(card.word)||[]).slice(0,8);
        if(!card.collocations||!card.collocations.length){const coll=suggestCollocations(card.word);if(coll&&coll.length)card.collocations=coll.slice(0,6)}
      }catch(e){}
      if(!card.definitions||!card.definitions.length)notFound.push(card.word);
    }
  };
  const worker=async()=>{while(true){if(aborted)return;const index=cursor++;if(index>=total)return;const card=selected[index];  if(status)status.textContent=(isTrans?'در حال ترجمه: ':'در حال غنی‌سازی: ')+card.word;try{await processCard(card)}catch(error){card._vfError='خطای موقت؛ دوباره تلاش کنید';notFound.push(card.word)}done++;const pct=Math.round(done/total*100);if(fill)fill.style.width=pct+'%';if(label)label.textContent=done+'/'+total;}};
  await Promise.all(Array.from({length:Math.min(concurrency,total)},worker));
  // Pass 2 (enrich only): antonyms via Datamuse — AFTER all words are done,
  // so pass 1 finishes as fast as possible (matches standalone VocabForge).
  if(!isTrans&&!aborted){
    const needAnt=selected.filter(c=>!c.antonyms||!c.antonyms.length);
    if(needAnt.length){
      let antCursor=0;
      const antWorker=async()=>{while(true){if(aborted)return;const i=antCursor++;if(i>=needAnt.length)return;const card=needAnt[i];try{const ant=await vfCached('ant:'+card.word.toLowerCase(),async()=>{const r=await fetchWithRetry('https://api.datamuse.com/words?rel_ant='+encodeURIComponent(card.word)+'&max=6');if(!r.ok)return[];const d=await r.json();return Array.isArray(d)?d.filter(x=>x&&x.word).map(x=>x.word):[]});card.antonyms=card.antonyms||[];card.antonyms=[...new Set(card.antonyms.concat(ant))].slice(0,6)}catch(e){}}};
      await Promise.all(Array.from({length:Math.min(6,needAnt.length)},antWorker));
    }
  }
  vfSaveCards(vfCards());
  if(button)button.disabled=false;
  if(stopBtn)stopBtn.style.display='none';
  if(fill)fill.style.width='100%';
  vfSetSlide(wasSlide);
  renderVocabforge(document.getElementById('content'));
  const missing=isTrans?selected.filter(c=>!c.translation).length:selected.filter(c=>!c.definitions||!c.definitions.length).length;
  const doneStatus=document.getElementById(isTrans?'vfTransStatus':'vfEnrichStatus');
  const doneResult=document.getElementById(isTrans?'vfTransResult':'vfEnrichResult');
  if(doneStatus)doneStatus.textContent=aborted?'⏹ متوقف شد':('✅ '+(isTrans?'ترجمه':'غنی‌سازی')+' کامل شد ('+(done-missing)+'/'+done+' کلمه)'+(missing?(' — '+missing+' کلمه ناموفق'):''));
  if(doneResult&&notFound.length)doneResult.innerHTML='<div style="padding:8px 10px;background:var(--bg);border-radius:10px;font-size:.78rem;max-height:160px;overflow-y:auto"><strong style="color:var(--danger)">یافت نشد ('+notFound.length+'):</strong><div style="margin-top:4px;color:var(--text2)">'+[...new Set(notFound)].slice(0,40).map(w=>'<span style="margin-left:6px">'+esc(w)+'</span>').join('')+(notFound.length>40?'...':'')+'</div></div>';
  selected.forEach(card=>{if(card._vfError)delete card._vfError});
}
function vfRemoveSelected(){
  const selected=new Set(vfCards().filter(card=>vfSelectedIds.has(card.id)).map(card=>card.id));
  if(!selected.size){toast('کلمه‌ای انتخاب نشده','error');return}
  vfSaveCards(vfCards().filter(card=>!selected.has(card.id)));
  selected.forEach(id=>vfSelectedIds.delete(id));
  if(!vfCards().length)vfSetSlide(1);
  toast(selected.size+' کلمه حذف شد','success');
  renderVocabforge(document.getElementById('content'));
}
function vfCompleteCard(card){return !!(card&&card.translation&&card.definitions&&card.definitions.length)}
function doVfMove(cards,destination,destLabel){
  const result=commitVocabForgeCards(cards,destination);
  const moved=new Set(cards.map(card=>card.id));
  vfSaveCards(vfCards().filter(card=>!moved.has(card.id)));
  moved.forEach(id=>vfSelectedIds.delete(id));
  if(!vfCards().length)vfSetSlide(1);
  toast(result.added+' کلمه به '+destLabel+' منتقل شد','success');
  if(result.dups)toast(result.dups+' کلمه تکراری رد شد','info');
  renderVocabforge(document.getElementById('content'));
}
function vfCommitSelected(destination){
  const selected=vfCards().filter(card=>vfSelectedIds.has(card.id));
  if(!selected.length){toast('کلمه‌ای انتخاب نشده','error');return}
  const destLabel=destination==='longTerm'?'حافظه بلندمدت':'کتابخانه';
  const complete=selected.filter(vfCompleteCard);
  const incomplete=selected.filter(c=>!vfCompleteCard(c));
  if(!incomplete.length){doVfMove(selected,destination,destLabel);return}
  const noTrans=incomplete.filter(c=>!c.translation).length;
  const noEnrich=incomplete.filter(c=>!c.definitions||!c.definitions.length).length;
  let msg='این '+incomplete.length+' کلمه آماده نیستند:'+'\n'+
    (noTrans?' • '+noTrans+' کلمه بدون ترجمه\n':'')+
    (noEnrich?' • '+noEnrich+' کلمه غنی‌سازی نشده\n':'')+
    ' • '+complete.length+' کلمه کامل و آماده'+
    '\n\nآیا این '+incomplete.length+' کلمه ناقص هم به '+destLabel+' منتقل شوند؟';
  if(confirm(msg)){doVfMove(selected,destination,destLabel)}
  else if(complete.length)doVfMove(complete,destination,destLabel);
}
function vfExportJson(){
  const cards=vfCards();if(!cards.length){toast('کارتی برای خروجی نیست','info');return}
  const blob=new Blob([JSON.stringify(cards,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='vocabforge-backup.json';link.click();URL.revokeObjectURL(url);
  toast(cards.length+' کارت به JSON صادر شد (بکاپ وکب فورج)','success');
}
async function vfImportJson(file){
  try{
    const data=JSON.parse(await file.text());
    const cards=Array.isArray(data)?data:(data.cards||[]);
    if(!cards.length){toast('فایل JSON معتبر نیست','error');return}
    const added=vfAddCards(cards);
    toast(added+' کارت بازیابی شد'+(cards.length-added?' ('+(cards.length-added)+' تکراری رد شد)':''),added?'success':'info');
    if(added)vfSetSlide(2);
    renderVocabforge(document.getElementById('content'));
  }catch(e){toast('خطا در خواندن فایل: '+e.message,'error')}
}
function vfFinish(){
  toast('اتمام کار؛ کلمات غنی‌شده در حافظه ماندند','success');
  setTimeout(()=>{try{location.reload()}catch(e){}},900);
}
function slideInputHTML(){
  const tabs=['text','pdf','docx','list','json'].map(t=>'<button type="button" class="btn '+(vfInputType===t?'btn-primary':'btn-ghost')+'" data-vf-input="'+t+'">'+(t==='text'?'✏️ متن':t==='pdf'?'📄 PDF':t==='docx'?'🗂 DOCX':t==='list'?'📋 لیست':'🧩 JSON')+'</button>').join('');
  const cefrOpts=['','A1','A2','B1','B2','C1','C2'].map(l=>'<option value="'+l+'"'+(vfCefrLevel===l?' selected':'')+'>'+(l||'همه سطوح')+'</option>').join('');
  let body='';
  if(vfInputType==='text'){
    body='<textarea class="input" id="vfText" rows="4" placeholder="متن انگلیسی را وارد کنید..."></textarea><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px"><div><label style="font-size:.7rem;color:var(--text2)">حداقل طول</label><input class="input" type="number" id="vfMinLen" value="3" min="2" max="15" style="max-width:70px;font-size:.8rem;padding:6px 8px"></div>'+vfMaxWordsControl()+'<button type="button" class="btn btn-primary" id="vfAddText">🔍 استخراج کلمات</button></div>';
  }else if(vfInputType==='pdf'){
    body='<p style="font-size:.78rem;color:var(--text2)">PDF با انتخاب محدوده صفحات و حداکثر کلمه استخراج می‌شود.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:8px"><input type="file" id="vfPdf" accept=".pdf" style="display:none"><button type="button" class="btn btn-ghost" id="vfPdfBtn">📂 انتخاب PDF</button><div><label style="font-size:.7rem;color:var(--text2)">محدوده صفحات (مثلا 1-3، 5)</label><input class="input" id="vfPdfPages" style="max-width:130px;padding:6px 8px;font-size:.8rem"></div><div><label style="font-size:.7rem;color:var(--text2)">حداقل طول</label><input class="input" type="number" id="vfPdfMinLen" value="3" min="2" max="15" style="max-width:70px;padding:6px 8px;font-size:.8rem"></div><div><label style="font-size:.7rem;color:var(--text2)">حداکثر کلمه</label><input class="input" type="number" id="vfPdfMaxWords" value="300" min="10" max="5000" style="max-width:80px;padding:6px 8px;font-size:.8rem"></div></div><div class="progress-bar" id="vfPdfProg" style="display:none;margin-top:10px"><div class="progress-fill" id="vfPdfFill" style="width:0"></div></div><span id="vfPdfStatus" style="font-size:.78rem;color:var(--text2)"></span>';
  }else if(vfInputType==='docx'){
    body='<p style="font-size:.78rem;color:var(--text2)">فایل DOCX با جدول واژگان یا متن ساده خوانده می‌شود.</p><input type="file" id="vfDocx" accept=".docx" style="display:none"><button type="button" class="btn btn-ghost" id="vfDocxBtn">🗂 انتخاب DOCX</button><span id="vfDocxStatus" style="font-size:.78rem;color:var(--text2)"></span>';
  }else if(vfInputType==='list'){
    body='<textarea class="input" id="vfListText" rows="6" placeholder="هر خط یک کلمه:&#10;ephemeral&#10;ubiquitous&#10;pragmatic" style="font-family:monospace"></textarea><button type="button" class="btn btn-primary btn-sm" id="vfAddList" style="margin-top:8px">افزودن لیست</button>';
  }else{
    body='<p style="font-size:.78rem;color:var(--text2)">فایل پشتیبان JSON وکب فورج را بازیابی کنید (کلمات تکراری رد می‌شوند).</p><input type="file" id="vfJsonFile" accept=".json" style="display:none"><button type="button" class="btn btn-ghost" id="vfJsonBtn">📥 بازیابی از JSON</button>';
  }
  return '<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:10px">۱. ورود کلمات</h3><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'+tabs+'</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><label style="font-size:.7rem;color:var(--text2)">سطح CEFR (فقط کلماتِ این سطح استخراج شوند):</label><select class="input" id="vfCefr" style="max-width:150px;font-size:.8rem;padding:6px 8px">'+cefrOpts+'</select><span style="font-size:.68rem;color:var(--text2)">کلماتِ بدون سطح‌بندی (نام‌ها/فنی) هم می‌مانند</span></div>'+body+'<div style="margin-top:12px"><span id="vfImportStatus" style="font-size:.78rem;color:var(--text2)"></span></div></div>';
}
function slideSelectHTML(){
  const selected=vfSelectionCount();const complete=vfCards().filter(card=>card.translation&&card.definitions.length).length;
  return '<div class="card" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">۲. انتخاب کلمات</h3><span data-vf-selcount style="color:var(--text2);font-size:.8rem">'+selected+' انتخاب شده</span><span style="margin-right:auto;color:var(--text2);font-size:.8rem">'+complete+' غنی‌شده</span></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><button type="button" class="btn btn-ghost btn-sm" id="vfSelectAll">انتخاب همه</button><button type="button" class="btn btn-ghost btn-sm" id="vfDeselect">لغو انتخاب</button><button type="button" class="btn btn-danger btn-sm" id="vfRemove">حذف انتخاب‌شده‌ها</button></div><div id="vfList">'+vfListHtml({rich:false,actions:false})+'</div><div style="margin-top:12px"><button type="button" class="btn btn-primary" id="vfNextBtn2">مرحله بعد ←</button></div></div>';
}
function vfIncompleteCards(){return vfCards().filter(c=>!(c.definitions&&c.definitions.length)||!c.translation)}
function vfFailedListHtml(){
  const incomplete=vfIncompleteCards();
  if(!incomplete.length)return '<div id="vfFailedSection" style="margin-top:10px;padding:8px;border-radius:8px;background:rgba(var(--success-rgb,0,180,80),0.1);border:1px solid var(--success)"><span style="font-size:.8rem;color:var(--success)">✅ همه کلمات غنی‌شده و ترجمه شده‌اند</span></div>';
  return '<div id="vfFailedSection" style="margin-top:12px;border-top:1px dashed var(--border);padding-top:10px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><span style="font-size:.8rem;font-weight:600;color:var(--warning)">⚠️ '+incomplete.length+' کلمه ناقص</span><button type="button" class="btn btn-primary btn-sm" id="vfRetryFailedBtn" style="font-size:.72rem">🔄 تلاش مجدد فقط همین‌ها</button></div><div style="display:grid;gap:4px;max-height:22vh;overflow-y:auto" id="vfFailedList">'+incomplete.map(function(c){const noDef=!(c.definitions&&c.definitions.length);const noTr=!c.translation;return '<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;background:var(--bg2)"><strong style="min-width:80px;font-size:.8rem">'+esc(c.word)+'</strong>'+(noDef?'<span class="badge" style="font-size:.6rem;background:rgba(var(--warning-rgb,255,160,0),0.15);color:var(--warning)">بدون تعریف</span>':'')+(noTr?'<span class="badge" style="font-size:.6rem;background:rgba(var(--warning-rgb,255,160,0),0.15);color:var(--warning)">بدون ترجمه</span>':'')+'</div>'}).join('')+'</div></div>';
}
async function vfRetryIncomplete(){
  const incomplete=vfIncompleteCards();
  if(!incomplete.length){toast('همه کلمات کامل هستند','info');return}
  vfSelectedIds=new Set(incomplete.map(function(c){return c.id}));
  vfSetSlide(3);
  renderVocabforge(document.getElementById('content'));
  toast('غنی‌سازی و ترجمه '+incomplete.length+' کلمه ناقص...','info');
  await vfRun('enrich');
  const stillNoTrans=vfCards().filter(function(c){return vfSelectedIds.has(c.id)&&!c.translation});
  if(stillNoTrans.length){vfSelectedIds=new Set(stillNoTrans.map(function(c){return c.id}));await vfRun('translate')}
  vfSelectedIds.clear();
}
function slideEnrichHTML(){
  const enriched=vfCards().filter(card=>card.definitions.length).length;
  const translated=vfCards().filter(card=>card.translation).length;
  const total=vfCards().length;
  return '<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:6px">۳. غنی‌سازی و ترجمه</h3><p style="font-size:.78rem;color:var(--text2);margin-bottom:10px">هر عملیات در سطر خودش با پیشرفت زنده؛ نتایج کش می‌شوند تا دوباره پردازش نشوند.</p>'+
  '<div class="vf-op-row"><button type="button" class="btn btn-primary" id="vfEnrichBtn">🔍 غنی‌سازی</button><span style="font-size:.72rem;color:var(--text2);min-width:80px">'+enriched+' / '+total+'</span><div class="vf-prog-wrap"><div class="vf-prog-fill" id="vfEnrichFill" style="width:0"></div></div><span class="vf-op-label" id="vfEnrichLabel">0/0</span><span class="vf-op-status" id="vfEnrichStatus" aria-live="polite">آماده</span><button type="button" class="btn btn-danger btn-sm" id="vfEnrichStopBtn" style="display:none">⏹ توقف</button><div id="vfEnrichResult" style="flex-basis:100%"></div></div>'+
  '<div class="vf-op-row"><button type="button" class="btn btn-primary" id="vfTranslateBtn">🌐 ترجمه</button><span style="font-size:.72rem;color:var(--text2);min-width:80px">'+translated+' / '+total+'</span><div class="vf-prog-wrap"><div class="vf-prog-fill" id="vfTransFill" style="width:0"></div></div><span class="vf-op-label" id="vfTransLabel">0/0</span><span class="vf-op-status" id="vfTransStatus" aria-live="polite">آماده</span><button type="button" class="btn btn-danger btn-sm" id="vfTransStopBtn" style="display:none">⏹ توقف</button><div id="vfTransResult" style="flex-basis:100%"></div></div>'+
  vfFailedListHtml()+
  '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" class="btn btn-ghost" id="vfClearCache">🗑 پاک کردن کش</button><button type="button" class="btn btn-primary" id="vfNextBtn3">مرحله بعد ←</button></div></div>';
}
function slideOutputHTML(){
  const all=vfCards();const total=all.length;const ready=all.filter(card=>card.translation&&card.definitions.length).length;
  const remaining=total-ready;
  return '<div class="card" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">۴. خروجی و انتقال</h3><span style="color:var(--success);font-size:.8rem">'+ready+' آماده انتقال</span>'+(remaining>0?'<span style="color:var(--warning);font-size:.8rem">'+remaining+' باقی‌مانده</span>':'')+'</div>'+(remaining>0?'<div style="margin:8px 0;padding:8px 12px;background:var(--accent-glow);border:1px solid var(--accent);border-radius:10px;font-size:.78rem;color:var(--text)">💡 '+remaining+' کلمه هنوز آماده نیستند (بدون ترجمه/غنی‌سازی). می‌توانید همین حالا برگردید و غنی‌سازی‌شان کنید، یا با اتمام کار، برای برد بعدی در حافظه می‌مانند.</div>':'')+'<p style="font-size:.78rem;color:var(--text2);margin:8px 0">انتخاب کنید و به باکس موردنظر بفرستید؛ هر کلمه بعد از انتقال از لیست حذف می‌شود.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button type="button" class="btn btn-ghost btn-sm" id="vfSelectAll">انتخاب همه</button><button type="button" class="btn btn-ghost btn-sm" id="vfDeselect">لغو انتخاب</button><button type="button" class="btn btn-primary btn-sm" id="vfToLibrary">📚 انتقال به کتابخانه</button><button type="button" class="btn btn-success btn-sm" id="vfToLongTerm">🧠 انتقال به حافظه بلندمدت</button><button type="button" class="btn btn-danger btn-sm" id="vfRemove">حذف انتخاب‌شده‌ها</button></div><div id="vfList">'+vfListHtml({rich:true,actions:true})+'</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">'+(remaining>0?'<button type="button" class="btn btn-ghost" id="vfBackToEnrich">🔙 غنی‌سازیِ باقی‌مانده ('+remaining+')</button>':'')+'<button type="button" class="btn btn-primary" id="vfFinish">🏁 اتمام کار</button><button type="button" class="btn btn-ghost" id="vfExportJson">💾 خروجی JSON (بکاپ)</button></div></div>';
}
function renderVocabforge(c){
  vfEnsureSlide();
  const stepper=[1,2,3,4].map(n=>{
    const connected=n<4?'<div class="import-step-line'+(n<vfSlide?' done':'')+'"></div>':'';
    return '<div style="display:flex;align-items:center">'+'<div class="'+vfStepDot(n)+'">'+(n<vfSlide?'✓':VF_FA_DIGITS[n])+'</div>'+connected+'</div>';
  }).join('');
  const header='<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:1.7rem">⚒️</span><div style="flex:1;min-width:220px"><h3 style="margin:0;color:var(--accent)">VocabForge داخلی</h3><p style="font-size:.82rem;color:var(--text2);margin-top:3px">مرحله '+vfSlide+' از ۴ — '+VF_STEP_LABELS[vfSlide]+'</p></div><span class="badge badge-accent">'+vfCards().length+' ذخیره</span></div><div class="import-steps" style="margin-top:12px">'+stepper+'</div><div style="display:flex;justify-content:space-between;color:var(--text2);font-size:.72rem;margin-top:6px"><span>ورود</span><span>انتخاب</span><span>غنی</span><span>خروجی</span></div><div style="margin-top:10px;padding:8px 12px;background:var(--accent-glow);border:1px solid var(--accent);border-radius:10px;color:var(--text);font-size:.8rem">👉 '+vfNextHint()+'</div></div>';
  c.innerHTML=header+
  '<div class="vf-slides">'+
  '<section class="vf-slide'+(vfSlide===1?' active':'')+'" id="vfSlide1">'+slideInputHTML()+'</section>'+
  '<section class="vf-slide'+(vfSlide===2?' active':'')+'" id="vfSlide2">'+slideSelectHTML()+'</section>'+
  '<section class="vf-slide'+(vfSlide===3?' active':'')+'" id="vfSlide3">'+slideEnrichHTML()+'</section>'+
  '<section class="vf-slide'+(vfSlide===4?' active':'')+'" id="vfSlide4">'+slideOutputHTML()+'</section>'+
  '</div>';
  bindVf(1);bindVf(2);bindVf(3);bindVf(4);
}
function updateVfSelectionUI(){
  const cnt=vfSelectionCount();
  document.querySelectorAll('[data-vf-selcount]').forEach(el=>el.textContent=cnt+' انتخاب شده');
}
function bindVf(n){
  const slide=document.getElementById('vfSlide'+n);
  if(!slide)return;
  if(n===1){
    bindVfMaxWords();
    slide.querySelectorAll('[data-vf-input]').forEach(btn=>btn.onclick=()=>{vfInputType=btn.dataset.vfInput;render()});
    const cefrSel=document.getElementById('vfCefr');if(cefrSel)cefrSel.onchange=function(){vfCefrLevel=cefrSel.value};
    const addText=document.getElementById('vfAddText');
    if(addText)addText.onclick=async()=>{
      const minLen=parseInt((document.getElementById('vfMinLen')||{}).value)||3;
      const maxWords=vfClampMaxWords((document.getElementById('vfMaxWords')||{}).value);
      const text=(document.getElementById('vfText')||{value:''}).value;
      if(!text.trim()){toast('متنی وارد نشده','error');return}
      let words=vfExtractWords(text,minLen,maxWords);
      const filt=await vfFilterByCefr(words);words=filt.kept;
      if(filt.removed.length)toast(filt.removed.length+' کلمه به دلیل سطح CEFR حذف شد','info');
      const added=vfAddCards(words.map(word=>({word,source:'متن VocabForge'})));
      toast(added?'✅ '+added+' کلمه استخراج شد':words.length?'همه تکراری‌اند':'کلمه‌ای یافت نشد',added?'success':'info');
      if(added)vfSetSlide(2);
      render();
      const status=document.getElementById('vfImportStatus');if(status)status.textContent=added+' کلمه اضافه شد';
    };
    const pdfBtn=document.getElementById('vfPdfBtn');
    if(pdfBtn)pdfBtn.onclick=()=>document.getElementById('vfPdf').click();
    const pdfInput=document.getElementById('vfPdf');
    if(pdfInput)pdfInput.onchange=async e=>{
      const file=e.target.files[0];if(!file)return;
      const status=document.getElementById('vfPdfStatus');const prog=document.getElementById('vfPdfProg');const fill=document.getElementById('vfPdfFill');
      prog.style.display='block';
      try{
        const r=await vfExtractPdf(file,document.getElementById('vfPdfPages').value,parseInt(document.getElementById('vfPdfMinLen').value)||3,parseInt(document.getElementById('vfPdfMaxWords').value)||300,(done,total)=>{fill.style.width=Math.round(done/total*100)+'%';if(status)status.textContent='صفحه '+done+'/'+total});
        if(status)status.textContent=r.added+' کلمه استخراج شد';
        toast(r.added+' کلمه از PDF اضافه شد','success');
        if(r.added)vfSetSlide(2);
        render();
      }catch(err){if(status)status.textContent='❌ '+err.message}
      prog.style.display='none';e.target.value='';
    };
    const docxBtn=document.getElementById('vfDocxBtn');
    if(docxBtn)docxBtn.onclick=()=>document.getElementById('vfDocx').click();
    const docxFile=document.getElementById('vfDocx');
    if(docxFile)docxFile.onchange=async e=>{
      const file=e.target.files[0];if(!file)return;
      const status=document.getElementById('vfDocxStatus');
      try{const r=await vfExtractFile(file,{});if(status)status.textContent=r.added+' کلمه اضافه شد';if(r.added){vfSetSlide(2);render()}}catch(err){if(status)status.textContent='❌ '+err.message}
      e.target.value='';
    };
    const addList=document.getElementById('vfAddList');
    if(addList)addList.onclick=async()=>{
      let lines=((document.getElementById('vfListText')||{value:''}).value||'').split(/[\n,]+/).map(s=>s.trim()).filter(s=>/^[a-zA-Z]{2,}$/.test(s));
      if(!lines.length){toast('لیست خالی است','info');return}
      const filt=await vfFilterByCefr(lines);lines=filt.kept;
      if(filt.removed.length)toast(filt.removed.length+' کلمه به دلیل سطح CEFR حذف شد','info');
      const added=vfAddCards(lines.map(word=>({word,source:'لیستی'})));
      toast(added+' کلمه اضافه شد'+(lines.length-added?' ('+(lines.length-added)+' تکراری)':''),added?'success':'info');
      if(added)vfSetSlide(2);
      render();
    };
    const jsonBtn=document.getElementById('vfJsonBtn');
    if(jsonBtn)jsonBtn.onclick=()=>document.getElementById('vfJsonFile').click();
    const jsonFile=document.getElementById('vfJsonFile');
    if(jsonFile)jsonFile.onchange=async e=>{if(e.target.files[0])await vfImportJson(e.target.files[0]);e.target.value=''};
  }
  if(n===2){
    slide.querySelectorAll('[data-vf-select]').forEach(input=>input.onchange=()=>{if(input.checked)vfSelectedIds.add(input.dataset.vfSelect);else vfSelectedIds.delete(input.dataset.vfSelect);updateVfSelectionUI()});
    const all=slide.querySelector('#vfSelectAll');if(all)all.onclick=()=>{vfCards().forEach(card=>vfSelectedIds.add(card.id));slide.querySelectorAll('[data-vf-select]').forEach(cb=>cb.checked=true);updateVfSelectionUI()};
    const des=slide.querySelector('#vfDeselect');if(des)des.onclick=()=>{vfSelectedIds.clear();slide.querySelectorAll('[data-vf-select]').forEach(cb=>cb.checked=false);updateVfSelectionUI()};
    const rem=slide.querySelector('#vfRemove');if(rem)rem.onclick=vfRemoveSelected;
    const next=document.getElementById('vfNextBtn2');if(next)next.onclick=()=>{vfSetSlide(3);render()};
  }
  if(n===3){
    const en=document.getElementById('vfEnrichBtn');if(en)en.onclick=()=>vfRun('enrich');
    const tr=document.getElementById('vfTranslateBtn');if(tr)tr.onclick=()=>vfRun('translate');
    const rf=document.getElementById('vfRetryFailedBtn');if(rf)rf.onclick=vfRetryIncomplete;
    const cc=document.getElementById('vfClearCache');if(cc)cc.onclick=async()=>{const count=await vfClearCache();toast(count?count+' مدخل کش پاک شد':'کش خالی بود','info')};
    const next=document.getElementById('vfNextBtn3');if(next)next.onclick=()=>{vfSetSlide(4);render()};
  }
  if(n===4){
    slide.querySelectorAll('[data-vf-select]').forEach(input=>input.onchange=()=>{if(input.checked)vfSelectedIds.add(input.dataset.vfSelect);else vfSelectedIds.delete(input.dataset.vfSelect);updateVfSelectionUI()});
    slide.querySelectorAll('[data-vf-dest]').forEach(btn=>btn.onclick=()=>{vfSelectedIds.clear();vfSelectedIds.add(btn.dataset.vfId);vfCommitSelected(btn.dataset.vfDest)});
    slide.querySelectorAll('[data-vf-del]').forEach(btn=>btn.onclick=()=>{vfSaveCards(vfCards().filter(c=>c.id!==btn.dataset.vfDel));vfSelectedIds.delete(btn.dataset.vfDel);render();toast('کلمه حذف شد','info')});
    const all=slide.querySelector('#vfSelectAll');if(all)all.onclick=()=>{vfCards().forEach(card=>vfSelectedIds.add(card.id));slide.querySelectorAll('[data-vf-select]').forEach(cb=>cb.checked=true);updateVfSelectionUI()};
    const des=slide.querySelector('#vfDeselect');if(des)des.onclick=()=>{vfSelectedIds.clear();slide.querySelectorAll('[data-vf-select]').forEach(cb=>cb.checked=false);updateVfSelectionUI()};
    const rem=slide.querySelector('#vfRemove');if(rem)rem.onclick=vfRemoveSelected;
    const lib=document.getElementById('vfToLibrary');if(lib)lib.onclick=()=>vfCommitSelected('words');
    const lt=document.getElementById('vfToLongTerm');if(lt)lt.onclick=()=>vfCommitSelected('longTerm');
    const back=document.getElementById('vfBackToEnrich');if(back)back.onclick=()=>{vfSetSlide(3);render()};
    const fin=document.getElementById('vfFinish');if(fin)fin.onclick=vfFinish;
    const ex=document.getElementById('vfExportJson');if(ex)ex.onclick=()=>vfExportJson();
  }
}
function commitVocabForgeCards(cards,dest){
  const target=dest==='longTerm'?S.longTerm:S.words;
  const existing=new Set([...S.words,...S.longTerm].map(card=>card.word.toLowerCase()));
  let added=0,dups=0;
  cards.forEach(raw=>{const card=sanitizeCard(raw);const key=card.word.toLowerCase();if(!key||existing.has(key)){dups++;return}if(dest==='longTerm'){card.box=0;card.nextReviewDate=null}target.push(card);existing.add(key);added++});
  if(added)save();
  return{added,dups};
}
// Migrate cards created by the previous standalone VocabForge once.
function receivePendingVocabForge(){
  migrateLegacyVocabForge().then(changed=>{if(changed&&typeof render==='function')render()});
  return false;
}
