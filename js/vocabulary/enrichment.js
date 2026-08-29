// ═══════════════════════════════════════════
// TRANSLATION HELPERS
// ═══════════════════════════════════════════
const DICT_API='https://api.dictionaryapi.dev/api/v2/entries/en';
const MYMEMORY_API='https://api.mymemory.translated.net/get';
const RETRY_MAX=1; // کاهش از ۳ به ۱ — کش منفی وجود نداره، retry سریعتر از backoff
const FETCH_TIMEOUT_MS=8000; // کاهش از ۱۲ به ۸ — جلوگیری از معلق شدن workerها
function retryDelay(attempt,retryAfter){const parsed=Number(retryAfter);return Math.min(4000,Number.isFinite(parsed)&&parsed>0?parsed*1000:300*Math.pow(2,attempt)+Math.round(Math.random()*100))}
function timedFetch(url,options,timeoutMs){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs||FETCH_TIMEOUT_MS);
  const opts=Object.assign({},options,{signal:controller.signal});
  return fetch(url,opts).finally(()=>clearTimeout(timer));
}
async function fetchWithRetry(url,options){
  let lastError=null;
  for(let attempt=0;attempt<=RETRY_MAX;attempt++){
    try{
      const response=await timedFetch(url,options);
      if(response.ok)return response;
      const retryable=response.status===408||response.status===425||response.status===429||response.status>=500;
      if(!retryable||attempt===RETRY_MAX)return response;
      await new Promise(resolve=>setTimeout(resolve,retryDelay(attempt,response.headers.get('Retry-After'))));
    }catch(error){
      lastError=error;
      if(attempt===RETRY_MAX)throw lastError;
      await new Promise(resolve=>setTimeout(resolve,retryDelay(attempt)));
    }
  }
  throw lastError||new Error('request failed');
}
const LANGUAGES={en:'English',fa:'فارسی',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano',tr:'Türkçe',ar:'العربية',ru:'Русский',pt:'Português',zh:'中文',ja:'日本語',ko:'한국어'};

function normalizeWordLookup(text){
  return text.trim().toLowerCase().replace(/^[^a-zA-Z]+|[^a-zA-Z']+$/g,'').replace(/'+/g,"'")}

function playAudioUrl(url){
  if(!url)return;
  const a=new Audio(url);
  a.play().catch(()=>{})}

function speakWord(word,lang){
  if(!word||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(word);
  u.lang=lang||'en-US';u.rate=S&&S.settings&&S.settings.speechRate?S.settings.speechRate:0.85;
  window.speechSynthesis.speak(u)}

function decodeHtmlEntities(str){
  const el=document.createElement('textarea');
  el.innerHTML=str;return el.value}

// ── IndexedDB-backed lookup cache (shared by review, library, reading, PDF) ──
// Same pattern as VocabForge: keys prefixed app_cache_ in the main leitnerDB.
let _appCacheMem={};
const APP_CACHE_TTL=30*24*60*60*1000;
function appCacheKey(kind,word,fromLang,toLang){return 'app_cache_'+kind+':'+(fromLang||'en')+'-'+(toLang||'fa')+':'+normalizeWordLookup(word)}
async function appCacheLookup(kind,word,compute,fromLang,toLang){
  const key=appCacheKey(kind,word,fromLang,toLang);
  const now=Date.now();
  const fresh=value=>{if(!value||typeof value!=='object'||!value._cachedAt)return null;if(now-value._cachedAt>=APP_CACHE_TTL)return null;if(value.value===null||value.status==='failed')return null;return value};
  if(key in _appCacheMem){const hit=fresh(_appCacheMem[key]);if(hit)return hit.value;delete _appCacheMem[key]}
  if(typeof idbGet==='function'){
    try{const stored=await idbGet(key);const hit=fresh(stored);if(hit){_appCacheMem[key]=stored;return hit.value}}catch(e){}
  }
  try{
    const val=await compute();
    if(val!==null&&val!==undefined){const record={_cachedAt:now,value:val};_appCacheMem[key]=record;if(typeof idbPut==='function')try{await idbPut(key,record)}catch(e){};return val}
  }catch(error){}
  return null;
}
function appCacheInvalidate(word){
  Object.keys(_appCacheMem).filter(k=>k.endsWith(':'+normalizeWordLookup(word))).forEach(k=>delete _appCacheMem[k]);
  if(typeof idbGet!=='function')return;
  try{idbPut(appCacheKey('trans',word),null).catch(()=>{});idbPut(appCacheKey('dict',word),null).catch(()=>{})}catch(e){}
}
// Flush all lookup caches (app_cache_* translation/dictionary + vf_cache_*)
// from IndexedDB and the in-memory memo, keeping user vocabulary intact.
function flushLookupCaches(){
  _appCacheMem={};
  if(typeof openDB!=='function')return Promise.resolve(0);
  return openDB().then(db=>new Promise(resolve=>{
    try{
      const tx=db.transaction(IDB_STORE,'readwrite');
      const store=tx.objectStore(IDB_STORE);
      const cursor=store.openCursor();
      let removed=0;
      cursor.onsuccess=()=>{
        if(cursor.result){
          const k=String(cursor.result.key||'');
          if(k.startsWith('app_cache_')||k.startsWith('vf_cache_')){cursor.result.delete();removed++}
          cursor.result.continue();
        }else{
          // Also drop the runtime request cache but NEVER the precache (app shell)
          if('caches' in window){
            caches.keys().then(names=>Promise.all(
              names.filter(n=>n.indexOf('runtime')>=0).map(n=>caches.delete(n))
            )).then(()=>resolve(removed)).catch(()=>resolve(removed));
          }else{resolve(removed)}
        }
      };
      cursor.onerror=()=>resolve(removed);
    }catch(e){resolve(0)}
  }));
}
// Approximate size of the lookup caches (bytes) — sums serialized cache values.
function lookupCacheSizeBytes(){
  if(typeof openDB!=='function')return Promise.resolve(0);
  return openDB().then(db=>new Promise(resolve=>{
    try{
      const tx=db.transaction(IDB_STORE,'readonly');
      const store=tx.objectStore(IDB_STORE);
      const cursor=store.openCursor();
      let total=0,count=0;
      cursor.onsuccess=()=>{
        if(cursor.result){
          const k=String(cursor.result.key||'');
          if(k.startsWith('app_cache_')||k.startsWith('vf_cache_')){
            count++;
            try{total+=(k.length+(JSON.stringify(cursor.result.value)||'').length)*2}catch(e){total+=k.length*2}
          }
          cursor.result.continue();
        }else{resolve({bytes:total,count})}
      };
      cursor.onerror=()=>resolve({bytes:total,count});
    }catch(e){resolve({bytes:0,count:0})}
  }));
}
function fitBytes(bytes){
  if(bytes>=1048576)return (bytes/1048576).toFixed(2)+' MB';
  if(bytes>=1024)return (bytes/1024).toFixed(1)+' KB';
  return bytes+' B';
}

async function fetchDictionary(word){
  return appCacheLookup("dict",word,function(){return fetchDictionaryRaw(word)},'en','');
}
async function fetchDictionaryRaw(word){
  try{
    const r=await fetchWithRetry(DICT_API+'/'+encodeURIComponent(word),{headers:{Accept:'application/json'}});
    if(!r.ok)return null;
    const data=await r.json();
    if(!Array.isArray(data)||!data[0])return null;
    const e=data[0];
    const phonetics=Array.isArray(e.phonetics)?e.phonetics:[];
    const phoneticBr=phonetics.filter(p=>typeof p.audio==='string'&&/-uk\.mp3/i.test(p.audio)).map(p=>typeof p.text==='string'?p.text.trim():'').find(Boolean)||null;
    const phoneticUs=phonetics.filter(p=>typeof p.audio==='string'&&/-us\.mp3/i.test(p.audio)).map(p=>typeof p.text==='string'?p.text.trim():'').find(Boolean)||null;
    const audioBr=phonetics.filter(p=>typeof p.audio==='string'&&/-uk\.mp3/i.test(p.audio)).map(p=>p.audio).find(Boolean)||null;
    const audioUs=phonetics.filter(p=>typeof p.audio==='string'&&/-us\.mp3/i.test(p.audio)).map(p=>p.audio).find(Boolean)||null;
    const phonetic=phoneticBr||phoneticUs||phonetics.map(p=>typeof p.text==='string'?p.text.trim():'').find(Boolean)||null;
    const meanings=(Array.isArray(e.meanings)?e.meanings:[]).slice(0,4).map(m=>{
      const defs=(Array.isArray(m.definitions)?m.definitions:[]).slice(0,3).map(d=>typeof d.definition==='string'?d.definition.trim():'').filter(Boolean);
      const examples=(Array.isArray(m.definitions)?m.definitions:[]).slice(0,2).map(d=>typeof d.example==='string'?d.example.trim():'').filter(Boolean);
      const synonyms=[...(Array.isArray(m.synonyms)?m.synonyms:[]),...(Array.isArray(m.definitions)?m.definitions:[]).flatMap(d=>Array.isArray(d.synonyms)?d.synonyms:[])].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4).filter(s=>typeof s==='string').map(s=>s.trim());
      return{partOfSpeech:m.partOfSpeech||'',definitions:defs,examples,synonyms}});
    return{headword:e.word||word,phonetic,phoneticBr,phoneticUs,audioBr,audioUs,meanings}
  }catch(e){return null}}

async function fetchTranslation(word,fromLang,toLang){
  return appCacheLookup("trans",word,function(){return fetchTranslationRaw(word,fromLang,toLang)},fromLang||'en',toLang||'fa');
}
// MyMemory circuit breaker — shared across ALL translation calls.
// On 429/403 (or network failure) the service is marked dead for 60s and
// callers fall straight through to Google gtx instead of retrying per-word
// (this was the «one word every few minutes» bottleneck in VocabForge).
const _myMemoryBreaker={dead:false,cooldownUntil:0,lastError:''};
function myMemoryAvailable(){return !_myMemoryBreaker.dead||Date.now()>=_myMemoryBreaker.cooldownUntil}
function myMemoryMarkDead(reason){_myMemoryBreaker.dead=true;_myMemoryBreaker.cooldownUntil=Date.now()+60000;_myMemoryBreaker.lastError=reason}

async function fetchTranslationRaw(word,fromLang,toLang){
  const provider=(S.settings&&S.settings.translationProvider)||'auto';
  const src=fromLang||S.settings.sourceLang||'en';
  const tgt=toLang||S.settings.targetLang||'fa';
  // 1. MyMemory (single attempt + circuit breaker — no long retry backoff)
  async function tryMyMemory(){
    if(!myMemoryAvailable())return null;
    try{
      const langpair=src+'|'+tgt;
      const r=await timedFetch(MYMEMORY_API+'?q='+encodeURIComponent(word)+'&langpair='+langpair,{},8000);
      if(!r.ok){if(r.status===429||r.status===403||r.status>=500)myMemoryMarkDead('HTTP '+r.status);return null}
      const d=await r.json();
      if(d.responseStatus===429||d.responseStatus===403){myMemoryMarkDead('Rate limited');return null}
      if(d.responseData&&d.responseData.translatedText){
        let t=d.responseData.translatedText;
        if(t.toUpperCase()!==word.toUpperCase())return decodeHtmlEntities(t)}
      return null
    }catch(e){myMemoryMarkDead(String(e&&e.message||e));return null}}
  // 2. Google gtx (free, CORS-enabled, no hard rate-limit)
  async function tryGoogle(){
    try{
      const r=await timedFetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl='+src+'&tl='+tgt+'&dt=t&q='+encodeURIComponent(word));
      if(!r.ok)return null;
      const d=await r.json();
      if(Array.isArray(d)&&d[0]&&d[0][0]&&d[0][0][0]){
        let t=d[0][0][0];
        if(t.toUpperCase()===word.toUpperCase())return null;
        return decodeHtmlEntities(t)}
      return null
    }catch(e){return null}}
  if(provider==='google')return tryGoogle();
  if(provider==='mymemory')return tryMyMemory();
  // auto: MyMemory first, Google as fallback
  const result=await tryMyMemory();
  return result||await tryGoogle();
}

// Legacy alias
const fetchPersianTranslation=(w)=>fetchTranslation(w);

// ═══════════════════════════════════════════
// ETYMOLOGY (Wiktionary API)
// ═══════════════════════════════════════════
async function fetchEtymology(word){
  try{
    const r=await timedFetch('https://en.wiktionary.org/api/rest_v1/page/etymology/'+encodeURIComponent(word));
    if(!r.ok)return null;
    const data=await r.json();
    if(data&&data.extract)return data.extract;
    // Fallback: try the definition endpoint
    const r2=await timedFetch('https://en.wiktionary.org/api/rest_v1/definition/'+encodeURIComponent(word));
    if(!r2.ok)return null;
    const data2=await r2.json();
    if(data2&&data2.en&&data2.en[0]&&data2.en[0].etymology)return data2.en[0].etymology;
    return null;
  }catch(e){return null}
}

// ═══════════════════════════════════════════
// WIKTIONARY DEFINITIONS (REST) — fallback source for rare words
// Same as standalone VocabForge: full definitions, not just etymology.
// ═══════════════════════════════════════════
async function fetchWiktionaryDefinitions(word){
  return appCacheLookup("wikidef",word,function(){return fetchWiktionaryDefinitionsRaw(word)},'en','');
}
async function fetchWiktionaryDefinitionsRaw(word){
  try{
    const r=await timedFetch('https://en.wiktionary.org/api/rest_v1/page/definition/'+encodeURIComponent(word));
    if(!r.ok)return null;
    const data=await r.json();
    if(!data||!data.en||!data.en.length)return null;
    const defs=[],exs=[];
    let pos='';
    for(const section of data.en){
      if(section.partOfSpeech&&!pos)pos=section.partOfSpeech;
      for(const d of section.definitions||[]){
        if(d.definition){const clean=d.definition.replace(/<[^>]+>/g,'').trim();if(clean)defs.push(clean)}
        if(d.examples){for(const ex of d.examples){const clean=ex.replace(/<[^>]+>/g,'').trim();if(clean)exs.push(clean)}}
      }
    }
    if(!defs.length)return null;
    return{phonetic:'',partOfSpeech:pos,definitions:defs.slice(0,5),examples:exs.slice(0,4),synonyms:[],antonyms:[]};
  }catch(e){return null}
}

// ═══════════════════════════════════════════
// MORPHOLOGICAL FAMILY (word forms)
// ═══════════════════════════════════════════
const MORPH_SUFFIXES={
  verb:['ing','ed','es','s','er','ers','tion','ment','ance','ence','ive','able','ible'],
  noun:['s','es','tion','ment','ance','ence','ist','ism','ity','ness','er','or','age','ure','dom','ship'],
  adj:['ly','ness','er','est','ity','ism','ize','ise','ful','less','ous','ive','able','ible','al','ial'],
  adv:['ly','ness']
};

function getMorphologicalFamily(word){
  const w=word.toLowerCase();
  const family=new Set();
  family.add(w);
  // Strip common suffixes to find root
  for(const suffixes of Object.values(MORPH_SUFFIXES)){
    for(const s of suffixes){
      if(w.endsWith(s)&&w.length>s.length+2){
        const root=w.slice(0,-s.length);
        family.add(root);
        // Generate common forms from root
        family.add(root+'ing');family.add(root+'ed');family.add(root+'s');
        family.add(root+'tion');family.add(root+'ment');family.add(root+'ness');
        family.add(root+'ly');family.add(root+'er');family.add(root+'est');
        family.add(root+'ful');family.add(root+'less');family.add(root+'ous');
        family.add(root+'ive');family.add(root+'able');family.add(root+'ist');
        family.add(root+'ism');family.add(root+'ity');family.add(root+'ize');
        break;
      }
    }
  }
  // Also check if word itself is a root
  if(w.length>=3){
    family.add(w+'ing');family.add(w+'ed');family.add(w+'s');
    family.add(w+'tion');family.add(w+'ment');family.add(w+'ness');
    family.add(w+'ly');family.add(w+'er');family.add(w+'ful');
    family.add(w+'less');family.add(w+'ous');family.add(w+'ive');
    family.add(w+'able');family.add(w+'ist');family.add(w+'ism');
  }
  family.delete(w); // remove the word itself
  return[...family].filter(f=>f.length>=3).slice(0,12);
}

// ═══════════════════════════════════════════
// COLLOCATION SUGGESTIONS
// ═══════════════════════════════════════════
const COMMON_COLLOCATIONS={
  make:['a decision','a mistake','progress','effort','money','sense','a difference','a choice'],
  take:['a break','a chance','action','place','care','advantage','responsibility','notes'],
  do:['homework','damage','business','research','well','harm','justice','a favor'],
  have:['an effect','an impact','a chance','difficulty','access','fun','a look','a problem'],
  get:['rid of','used to','better','worse','along','away','over','through'],
  give:['up','in','away','birth','rise','permission','advice','priority'],
  break:['a rule','a record','the law','down','even','the ice','news','free'],
  keep:['track of','up','in mind','quiet','away','going','pace','score'],
  pay:['attention','a visit','tribute','off','back','for','the price','respect'],
  run:['out of','into','a risk','a business','smoothly','across','over','away'],
  turn:['out','into','down','up','around','off','over','away'],
  put:['forward','on','off','up with','down','out','aside','pressure'],
  come:['across','up with','true','first','to terms','into play','alive','clean'],
  go:['through','ahead','over','wrong','back','on','for','without'],
  set:['up','off','out','back','in','apart','fire','free'],
  bring:['about','up','out','in','back','to light','to an end','together'],
  carry:['out','on','away','through','over','weight','off','forward']
};

function suggestCollocations(word){
  const w=word.toLowerCase();
  if(COMMON_COLLOCATIONS[w])return COMMON_COLLOCATIONS[w];
  // Check if word appears in any collocation
  const suggestions=[];
  for(const[verb,colls]of Object.entries(COMMON_COLLOCATIONS)){
    for(const c of colls){
      if(c.includes(w))suggestions.push(verb+' '+c);
    }
  }
  return suggestions.slice(0,5);
}

// ═══════════════════════════════════════════
// FREQUENCY RANK (COCA-based approximate)
// ═══════════════════════════════════════════
function getFrequencyRank(word){
  const w=word.toLowerCase();
  // Approximate COCA rank from tier membership
  if(FREQ_T1.has(w)){
    // Top 500: assign position within set
    const t1Arr=[...FREQ_T1];
    const idx=t1Arr.indexOf(w);
    return idx>=0?idx+1:250;
  }
  if(FREQ_T2.has(w))return 500+Math.floor(Math.random()*500);
  if(FREQ_T3.has(w))return 1000+Math.floor(Math.random()*4000);
  return null; // not in top 5000
}

// ═══════════════════════════════════════════
// ENHANCED DICTIONARY POPUP (with etymology + frequency)
// ═══════════════════════════════════════════
// fetchDictionary returns ONLY the dictionary result — etymology is
// fetched lazily by the popup via fetchEtymologyCached(), so the
// enrichment pipeline is never blocked by the slow Wiktionary call.
const _origFetchDictionary=fetchDictionary;
fetchDictionary=async function(word){
  const result=await _origFetchDictionary(word);
  if(!result)return result;
  // Morphological family + frequency rank are computed locally (cheap)
  result.morphFamily=getMorphologicalFamily(word);
  result.freqRank=getFrequencyRank(word);
  return result;
};
async function fetchEtymologyCached(word){
  return appCacheLookup("etym",word,function(){return fetchEtymology(word)},'en','');
}

// ═══════════════════════════════════════════
