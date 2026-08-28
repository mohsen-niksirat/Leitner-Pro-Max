// ═══════════════════════════════════════════
// STATE SNAPSHOT IMPORT/EXPORT HELPERS
// ═══════════════════════════════════════════
function sanitizeStateSnapshot(raw){
  if(!raw||typeof raw!=='object')return null;
  const s={...defaultState()};
  // Detect format
  const isFullSnapshot=raw.schema==='leitner-full-backup'||(Array.isArray(raw.words)&&(Array.isArray(raw.longTerm)||raw.longTerm===undefined));
  if(isFullSnapshot){
    s.words=(raw.words||[]).map(sanitizeCard).filter(w=>w.word);
    s.longTerm=(raw.longTerm||[]).map(sanitizeCard).filter(w=>w.word);
    if(raw.stats&&typeof raw.stats==='object'&&!Array.isArray(raw.stats)){
      s.stats={...defaultState().stats,...raw.stats};
      if(Array.isArray(s.stats.history))s.stats.history={};
    }
    if(Array.isArray(raw.categories))s.categories=raw.categories.filter(c=>typeof c==='string'&&c.trim());
    if(raw.settings&&typeof raw.settings==='object')s.settings={...defaultState().settings,...raw.settings};
    if(raw.quizStats&&typeof raw.quizStats==='object')s.quizStats={...defaultState().quizStats,...raw.quizStats};
    if(raw.pdfState&&typeof localStorage!=='undefined'){try{localStorage.setItem('leitner_pdf_state',JSON.stringify(raw.pdfState))}catch(e){}}
    if(raw.pdfBookmarks&&typeof localStorage!=='undefined'){try{localStorage.setItem('leitner_pdf_bm',JSON.stringify(raw.pdfBookmarks))}catch(e){}}
    if(raw.readingSettings&&typeof localStorage!=='undefined'){try{Object.entries(raw.readingSettings).forEach(function(entry){if(entry[1]!==null&&entry[1]!==undefined)localStorage.setItem('leitner_reading_'+entry[0],entry[1])})}catch(e){}}
    if(raw._version||raw.version)s._version=raw._version||raw.version;
    return{s,isFull:true};
  }
  // Legacy format: just words array or {words:[...]}
  let cards=[];
  if(Array.isArray(raw))cards=raw.filter(w=>w&&typeof w.word==='string'&&w.word.trim());
  else if(Array.isArray(raw.words))cards=raw.words.filter(w=>w&&typeof w.word==='string'&&w.word.trim());
  if(!cards.length)return null;
  return{cards,isFull:false};
}

function exportStateSnapshot(){
  return JSON.stringify({
    schema:'leitner-full-backup',
    version:SCHEMA_VERSION,
    exportedAt:new Date().toISOString(),
    words:S.words,
    longTerm:S.longTerm,
    stats:S.stats,
    quizStats:S.quizStats,
    categories:S.categories,
    settings:S.settings,
    pdfState:typeof loadPdfState==='function'?loadPdfState():null,
    pdfBookmarks:(function(){try{return JSON.parse(localStorage.getItem('leitner_pdf_bm')||'{}')}catch(e){return{}}})(),
    readingSettings:(function(){try{return{dashboardVisible:localStorage.getItem('leitner_reading_dashVisible'),fontSize:localStorage.getItem('leitner_reading_fontSize'),lineHeight:localStorage.getItem('leitner_reading_lineHeight'),contentTheme:localStorage.getItem('leitner_reading_contentTheme')}}catch(e){return{}}})()
  },null,2);
}

function importStateSnapshot(data){
  const result=sanitizeStateSnapshot(data);
  if(!result)return{ok:false,msg:'ساختار فایل معتبر نیست'};
  let allCards=[];
  if(result.isFull){
    allCards=[...(result.s.words||[]),...(result.s.longTerm||[])];
    if(result.s.categories&&result.s.categories.length){result.s.categories.forEach(c=>{if(!S.categories.includes(c))S.categories.push(c)})}
    if(result.s.settings)S.settings={...S.settings,...result.s.settings};
  }else{
    allCards=result.cards||[];
  }
  const staged=stageImportCards(allCards,'json');
  if(staged)return{ok:true,staged:true};
  return{ok:true,msg:'همه تکراری بودند'};
}

// ═══════════════════════════════════════════
// SHARED DECK FORMAT (lightweight, shareable)
// ═══════════════════════════════════════════
function exportSharedDeck(category){
  const words=S.words.filter(w=>!category||w.category===category);
  if(!words.length)return null;
  // Lightweight format: only essential fields
  const deck={
    v:1,
    name:category||'همه کلمات',
    lang:S.settings.sourceLang||'en',
    target:S.settings.targetLang||'fa',
    count:words.length,
    words:words.map(w=>({
      w:w.word,
      t:w.translation,
      ipa:w.ipa||undefined,
      pos:w.partOfSpeech||undefined,
      def:w.definitions&&w.definitions.length?w.definitions[0]:undefined,
      ex:w.examples&&w.examples.length?w.examples[0]:undefined,
      syn:w.synonyms&&w.synonyms.length?w.synonyms.slice(0,3):undefined,
      ant:w.antonyms&&w.antonyms.length?w.antonyms.slice(0,2):undefined
    }))
  };
  return deck;
}

function exportSharedDeckJSON(category){
  const deck=exportSharedDeck(category);
  if(!deck)return null;
  return JSON.stringify(deck);
}

function exportSharedDeckLink(category){
  const json=exportSharedDeckJSON(category);
  if(!json)return null;
  try{
    const encoded=btoa(unescape(encodeURIComponent(json)));
    const baseUrl=location.href.split('#')[0].split('?')[0];
    return baseUrl+'#deck='+encoded.slice(0,2000); // URL length limit
  }catch(e){return null}
}

function importSharedDeck(deck){
  if(!deck||!deck.words||!Array.isArray(deck.words))return{ok:false,msg:'ساختار دسته معتبر نیست'};
  let added=0,skipped=0;
  deck.words.forEach(item=>{
    const word=String(item.w||'').trim().toLowerCase();
    if(!word||wordExists(word)){skipped++;return}
    const _r=window.repoAdd?window.repoAdd(createCard({
      word:item.w,
      translation:item.t||'',
      ipa:item.ipa||'',
      partOfSpeech:item.pos||'',
      definitions:item.def?[item.def]:[],
      examples:item.ex?[item.ex]:[],
      synonyms:item.syn||[],
      antonyms:item.ant||[],
      category:deck.name||'مشترک',
      source:'shared-deck'
    }),'words'):null;
    if(_r&&_r.added)added++;
  });
  save();
  return{ok:true,msg:`${added} کلمه از دسته «${deck.name||'مشترک'}» اضافه شد${skipped?` (${skipped} تکراری رد شد)`:''}`};
}

// Check URL hash for shared deck on load
function checkSharedDeckHash(){
  const hash=location.hash;
  if(!hash.startsWith('#deck='))return;
  try{
    const encoded=hash.slice(6);
    const json=decodeURIComponent(escape(atob(encoded)));
    const deck=JSON.parse(json);
    if(deck&&deck.words){
      const result=importSharedDeck(deck);
      if(result.ok){
        toast(result.msg,'success');
        // Clear hash to avoid re-import on refresh
        history.replaceState(null,'',location.pathname+location.search);
      }
    }
  }catch(e){toast('خطا در خواندن دسته مشترک','error')}
}
// AUTO-BACKUP (IndexedDB) — versioned snapshots
// ═══════════════════════════════════════════
const BACKUP_STORE='backups';
const BACKUP_META_STORE='backup_meta';
const MAX_BACKUPS=10;
let backupDb=null;
let _backupCounter=0;

function openBackupDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open('leitner_backup_db',2);
    req.onupgradeneeded=(e)=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(BACKUP_STORE))db.createObjectStore(BACKUP_STORE);
      if(!db.objectStoreNames.contains(BACKUP_META_STORE))db.createObjectStore(BACKUP_META_STORE);
    };
    req.onsuccess=()=>{backupDb=req.result;resolve(req.result)};
    req.onerror=()=>reject(req.error)});
}

async function autoBackup(){
  _backupCounter++;
  // Backup every 20 saves (not every single save)
  if(_backupCounter<20)return;
  _backupCounter=0;
  try{
    const db=backupDb||await openBackupDb();
    const now=new Date();
    const ts=now.toISOString();
    const snapshot=JSON.stringify(S);
    const tx=db.transaction([BACKUP_STORE,BACKUP_META_STORE],'readwrite');
    // Save snapshot with timestamp key
    const key='snap_'+ts;
    tx.objectStore(BACKUP_STORE).put(snapshot,key);
    // Update meta: list of snapshot keys + pointer to latest
    const metaStore=tx.objectStore(BACKUP_META_STORE);
    metaStore.put(ts,'latest_ts');
    const metaReq=metaStore.get('snapshot_keys');
    metaReq.onsuccess=()=>{
      let keys=metaReq.result||[];
      keys.push(key);
      // Prune old snapshots beyond MAX_BACKUPS
      while(keys.length>MAX_BACKUPS){
        const old=keys.shift();
        try{tx.objectStore(BACKUP_STORE).delete(old)}catch(e){}}
      metaStore.put(keys,'snapshot_keys');
    };
  }catch(e){}}

// Get list of available snapshots
async function listSnapshots(){
  try{
    const db=backupDb||await openBackupDb();
    return new Promise(resolve=>{
      const tx=db.transaction(BACKUP_META_STORE,'readonly');
      const req=tx.objectStore(BACKUP_META_STORE).get('snapshot_keys');
      req.onsuccess=()=>resolve((req.result||[]).reverse());
      req.onerror=()=>resolve([])});
  }catch(e){return[]}}

// Restore a specific snapshot by key
async function restoreSnapshot(key){
  try{
    const db=backupDb||await openBackupDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(BACKUP_STORE,'readonly');
      const req=tx.objectStore(BACKUP_STORE).get(key);
      req.onsuccess=()=>{try{resolve(JSON.parse(req.result))}catch(e){resolve(null)}};
      req.onerror=()=>resolve(null)});
  }catch(e){return null}}

// Get latest snapshot (backward compat)
async function exportBackup(){
  try{
    const db=backupDb||await openBackupDb();
    const tsTx=db.transaction(BACKUP_META_STORE,'readonly');
    const tsReq=tsTx.objectStore(BACKUP_META_STORE).get('latest_ts');
    return new Promise(resolve=>{
      tsReq.onsuccess=()=>{
        const ts=tsReq.result;
        if(!ts){resolve(null);return}
        const key='snap_'+ts;
        const tx=db.transaction(BACKUP_STORE,'readonly');
        const req=tx.objectStore(BACKUP_STORE).get(key);
        req.onsuccess=()=>resolve(req.result||null);
        req.onerror=()=>resolve(null)};
      tsReq.onerror=()=>resolve(null)});
  }catch(e){return null}}

// Legacy compat: restoreBackup returns latest
async function restoreBackup(){
  try{
    const data=await exportBackup();
    return data?JSON.parse(data):null;
  }catch(e){return null}}

// Delete a specific snapshot
async function deleteSnapshot(key){
  try{
    const db=backupDb||await openBackupDb();
    const tx=db.transaction([BACKUP_STORE,BACKUP_META_STORE],'readwrite');
    tx.objectStore(BACKUP_STORE).delete(key);
    const metaReq=tx.objectStore(BACKUP_META_STORE).get('snapshot_keys');
    metaReq.onsuccess=()=>{
      let keys=(metaReq.result||[]).filter(k=>k!==key);
      tx.objectStore(BACKUP_META_STORE).put(keys,'snapshot_keys');
    };
  }catch(e){}}
