function defaultState(){return{words:[],longTerm:[],stats:{reviewed:0,correct:0,wrong:0,streak:0,xp:0,lastReviewDate:null,history:{}},quizStats:{sessions:[],totalCorrect:0,totalWrong:0,wordPerformance:{},currentSession:null},categories:['پیش‌فرض'],settings:{theme:'dark',sourceLang:'en',targetLang:'fa',notifications:false,notificationTime:'09:00',sidebarLocked:false,vocabForge:{cards:[]},aiChat:{provider:'gemini',model:'gemini-2.0-flash',apiKey:'',apiKeys:{gemini:'',openrouter:'',groq:''},systemPrompt:'',temperature:0.7,maxTokens:2048,dailyLimit:250,dailyUsage:0,dailyUsageDate:'',connectionStatus:'disconnected',lastError:'',messages:[],chats:[],activeChat:null,providerUsage:null}},_version:SCHEMA_VERSION}}
var S=defaultState();
Object.defineProperty(window,'S',{configurable:true,get:()=>S});

function sanitizeCard(c){
  return{id:String(c.id||uid()),word:String(c.word||'').trim(),translation:String(c.translation||'').trim(),ipa:String(c.ipa||'').trim(),category:String(c.category||'پیش‌فرض').trim(),favorite:!!c.favorite,context:String(c.context||'').trim(),
  box:Math.max(0,Math.min(10,Number(c.box)||0)),repetitions:Math.max(0,Number(c.repetitions)||0),interval:Math.max(1,Number(c.interval)||1),easeFactor:Math.max(1.3,Number(c.easeFactor)||2.5),
  addedDate:c.addedDate||new Date().toISOString(),nextReviewDate:c.nextReviewDate||null,lastReviewedAt:c.lastReviewedAt||null,
  // FSRS fields
  stability:Number(c.stability)||0,difficulty:Number(c.difficulty)||0,elapsedDays:Number(c.elapsedDays)||0,scheduledDays:Number(c.scheduledDays)||0,reps:Number(c.reps)||0,lapses:Number(c.lapses)||0,fsrsState:String(c.fsrsState||'new'),
  // Dictionary details
  definitions:Array.isArray(c.definitions)?c.definitions:[],examples:Array.isArray(c.examples)?c.examples:[],synonyms:Array.isArray(c.synonyms)?c.synonyms:[],partOfSpeech:String(c.partOfSpeech||'').trim(),audioUs:String(c.audioUs||'').trim(),audioBr:String(c.audioBr||'').trim(),
  // Rich vocabulary fields
  defSource:String(c.defSource||'').trim(),coreMeaning:String(c.coreMeaning||'').trim(),collocations:Array.isArray(c.collocations)?c.collocations:[],antonyms:Array.isArray(c.antonyms)?c.antonyms:[],wordFamily:Array.isArray(c.wordFamily)?c.wordFamily:[],note:String(c.note||'').trim(),trap:String(c.trap||'').trim(),tags:Array.isArray(c.tags)?c.tags:[],source:String(c.source||'').trim()}
}

function hydrateState(raw){
  const p=raw&&typeof raw==='object'?raw:{};
  const s={...defaultState(),...p};
  s.words=(p.words||[]).map(sanitizeCard).filter(w=>w.word);
  s.longTerm=(p.longTerm||[]).map(sanitizeCard).filter(w=>w.word);
  s.stats={...defaultState().stats,...(p.stats||{})};
  if(Array.isArray(s.stats.history))s.stats.history={};
  s.quizStats={...defaultState().quizStats,...(p.quizStats||{})};
  if(!s.quizStats.wordPerformance)s.quizStats.wordPerformance={};
  if(!s.quizStats.sessions)s.quizStats.sessions=[];
  s.settings={...defaultState().settings,...(p.settings||{})};
  if(!s.settings.aiChat)s.settings.aiChat=defaultState().settings.aiChat;
  else{
    s.settings.aiChat={...defaultState().settings.aiChat,...s.settings.aiChat};
    if(!s.settings.aiChat.apiKeys)s.settings.aiChat.apiKeys={gemini:'',openrouter:'',groq:''};
    if(s.settings.aiChat.apiKey&&s.settings.aiChat.apiKeys[s.settings.aiChat.provider]==='')s.settings.aiChat.apiKeys[s.settings.aiChat.provider]=s.settings.aiChat.apiKey;
    if(!s.settings.aiChat.chats)s.settings.aiChat.chats=[];
    if(!s.settings.aiChat.activeChat)s.settings.aiChat.activeChat=null;
  }
  return s;
}

function loadLegacyState(){
  // Chain: newest key first, then older keys, then the very old monolithic key.
  // If the newest key holds corrupt JSON, fall through so a partially-broken
  // store can never brick the migration.
  var keys=[LS_KEY,LS_KEY_V1,LS_KEY_OLD];
  for(var i=0;i<3;i++){
    try{
      var raw=localStorage.getItem(keys[i]);
      if(!raw)continue;
      var parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object')return hydrateState(parsed);
    }catch(e){console.warn('[Storage] legacy key corrupt, skipping:',keys[i])}
  }
  return null;
}

function loadState(){return loadLegacyState()||defaultState()} 
// Debounced save — batches writes into one IndexedDB transaction
var _saveTimer=null,_saveDirty=false;
function save(){
  _saveDirty=true;
  if(_saveTimer)clearTimeout(_saveTimer);
  _saveTimer=setTimeout(_doSave,500);
}
function _doSave(){
  _saveTimer=null;if(!_saveDirty)return;
  _saveDirty=false;
  idbPut('state',S).then(function(){
    rebuildIndex();autoBackup();
  }).catch(function(e){
    toast('خطای ذخیره‌سازی IndexedDB: '+e.message,'error');
  });
}

function saveForce(){
  return idbPut('state',S).then(function(){rebuildIndex();return true}).catch(function(){return false});
}

function loadFromIDB(){return idbGet('state')}

function stateSnapshotSizeKB(){
  try{return new Blob([JSON.stringify(S)]).size/1024}catch(e){return 0}
}

async function renderStorageMeter(el){
  if(!el)return;
  const stateKB=stateSnapshotSizeKB();
  let quotaText='';
  try{
    if(navigator.storage&&navigator.storage.estimate){
      const estimate=await navigator.storage.estimate();
      const quotaKB=Number(estimate.quota||0)/1024;
      if(quotaKB)quotaText=' از سهم تخمینی مرورگر ('+quotaKB.toFixed(0)+' KB)';
    }
  }catch(e){}
  el.innerHTML='<div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:4px"><span>💾 داده برنامه در IndexedDB</span><span style="color:var(--success)">'+stateKB.toFixed(1)+' KB'+quotaText+'</span></div><div style="font-size:.7rem;color:var(--text2);margin-top:4px">حجم بر اساس snapshot فعلی محاسبه شده است؛ محدودیت ساختگی ۵ مگابایتی localStorage در این مقدار دخالت ندارد.</div>';
}

// Force immediate save (for critical paths like page unload)
function saveNow(){
  if(_saveTimer){clearTimeout(_saveTimer);_saveTimer=null}
  if(!_saveDirty)return;
  _saveDirty=false;
  // IndexedDB is asynchronous; browsers may finish this short transaction during unload.
  try{idbPut('state',S).then(rebuildIndex).catch(function(){})}catch(e){}
}
// Warn on page close if there are unsaved changes
window.addEventListener('beforeunload',()=>{if(_saveDirty||_saveTimer){saveNow()}});
