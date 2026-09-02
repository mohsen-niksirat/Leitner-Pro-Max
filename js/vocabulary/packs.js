// ═══════════════════════════════════════════
//  DOWNLOAD PACKS MODULE — v2 (minimal + selection)
// ═══════════════════════════════════════════

// Only 504 remains — old packs removed
const READY_PACKS = [
  {id:'504',name:'📚 504 کلمه ضروری',desc:'کتاب 504 Absolutely Essential Words — ۴۲ درس',count:504,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/504words.json',category:'504'},
];

// ═══════════════════════════════════════════
//  CEFR VOCABULARY PACKS (A1-C2)
// ═══════════════════════════════════════════
const CEFR_BASE_URL = 'https://raw.githubusercontent.com/mohsen-niksirat/Leitner-Pro-Max/main/All_Vocabulary_Packs';

const CEFR_LEVELS = [
  {
    id: 'A1', name: 'مبتدی', icon: '🌱', color: '#2ecc71',
    gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    packs: [
      { id: 'A1-01', name: 'اعداد و زمان', desc: '۱۰۰ کلمه پایه', count: 100, file: 'A1-01-numbers-time.json' },
      { id: 'A1-02', name: 'خانواده و مردم', desc: '۱۰۰ کلمه خانوادگی', count: 100, file: 'A1-02-family-people.json' },
      { id: 'A1-03', name: 'خانه و غذا', desc: '۱۰۰ کلمه روزمره', count: 100, file: 'A1-03-home-food.json' },
      { id: 'A1-04', name: 'رنگ‌ها و اشیا', desc: '۱۰۰ کلمه محیطی', count: 100, file: 'A1-04-colors-objects.json' },
      { id: 'A1-05', name: 'افعال و سلام', desc: '۱۰۰ کلمه پایه', count: 100, file: 'A1-05-verbs-greetings.json' }
    ]
  },
  {
    id: 'A2', name: 'Elementary', icon: '🌿', color: '#3498db',
    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
    packs: [
      { id: 'A2-01', name: 'سفر و حمل‌ونقل', desc: '۱۰۰ کلمه سفر', count: 100, file: 'A2-01-travel-transport.json' },
      { id: 'A2-02', name: 'خرید و پول', desc: '۱۰۰ کلمه خرید', count: 100, file: 'A2-02-shopping-money.json' },
      { id: 'A2-03', name: 'سلامت و پزشکی', desc: '۱۰۰ کلمه بهداشت', count: 100, file: 'A2-03-health-medicine.json' },
      { id: 'A2-04', name: 'طبیعت و آب‌وهوا', desc: '۱۰۰ کلمه طبیعت', count: 100, file: 'A2-04-nature-weather.json' },
      { id: 'A2-05', name: 'کار و شغل', desc: '۱۰۰ کلمه شغلی', count: 100, file: 'A2-05-work-jobs.json' },
      { id: 'A2-06', name: 'سرگرمی و اجتماع', desc: '۱۰۰ کلمه تفریحی', count: 100, file: 'A2-06-hobbies-social.json' }
    ]
  },
  {
    id: 'B1', name: 'متوسط', icon: '🌳', color: '#e67e22',
    gradient: 'linear-gradient(135deg, #e67e22, #d35400)',
    packs: [
      { id: 'B1-01', name: 'تحصیل و یادگیری', desc: '۲۰۰ کلمه آکادمیک', count: 200, file: 'B1-01-education-learning.json' },
      { id: 'B1-02', name: 'کار و حرفه', desc: '۲۰۰ کلمه شغلی', count: 200, file: 'B1-02-career-business.json' },
      { id: 'B1-03', name: 'جامعه و فرهنگ', desc: '۲۰۰ کلمه اجتماعی', count: 200, file: 'B1-03-society-culture.json' },
      { id: 'B1-04', name: 'احساسات و روابط', desc: '۲۰۰ کلمه عاطفی', count: 200, file: 'B1-04-emotions-relationships.json' }
    ]
  },
  {
    id: 'B2', name: 'Upper-Intermediate', icon: '🌲', color: '#9b59b6',
    gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
    packs: [
      { id: 'B2-01', name: 'آکادمیک و مقاله', desc: '۲۰۰ کلمه علمی', count: 200, file: 'B2-01-academic-essays.json' },
      { id: 'B2-02', name: 'تکنولوژی و دیجیتال', desc: '۲۰۰ کلمه فناوری', count: 200, file: 'B2-02-technology-digital.json' },
      { id: 'B2-03', name: 'علوم و تحقیق', desc: '۲۰۰ کلمه پژوهشی', count: 200, file: 'B2-03-science-research.json' },
      { id: 'B2-04', name: 'سیاست و اجتماع', desc: '۲۰۰ کلمه سیاسی', count: 200, file: 'B2-04-politics-society.json' },
      { id: 'B2-05', name: 'اقتصاد و مالی', desc: '۲۰۰ کلمه مالی', count: 200, file: 'B2-05-economy-finance.json' }
    ]
  },
  {
    id: 'C1', name: 'پیشرفته', icon: '🏔️', color: '#e74c3c',
    gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    packs: [
      { id: 'C1-01', name: 'انتزاعی و فلسفی', desc: '۲۰۰ کلمه فلسفی', count: 200, file: 'C1-01-abstract-philosophical.json' },
      { id: 'C1-02', name: 'پزشکی و سلامت', desc: '۲۰۰ کلمه تخصصی', count: 200, file: 'C1-02-medical-health.json' },
      { id: 'C1-03', name: 'حقوقی و رسمی', desc: '۲۰۰ کلمه حقوقی', count: 200, file: 'C1-03-legal-formal.json' },
      { id: 'C1-04', name: 'ادبی و روزنامه‌نگاری', desc: '۲۰۰ کلمه رسانه‌ای', count: 200, file: 'C1-04-literary-journalism.json' },
      { id: 'C1-05', name: 'تخصصی مهندسی', desc: '۲۰۰ کلمه مهندسی', count: 200, file: 'C1-05-engineering.json' }
    ]
  },
  {
    id: 'C2', name: 'ماهر', icon: '👑', color: '#f1c40f',
    gradient: 'linear-gradient(135deg, #f1c40f, #f39c12)',
    packs: [
      { id: 'C2-01', name: 'ادبیات و نثر پیشرفته', desc: '۲۰۰ کلمه ادبی', count: 200, file: 'C2-01-advanced-literature.json' },
      { id: 'C2-02', name: 'اصطلاحات و زبان عامیانه', desc: '۲۰۰ کلمه محاوره‌ای', count: 200, file: 'C2-02-idioms-colloquial.json' },
      { id: 'C2-03', name: 'واژگان نادر و تخصصی', desc: '۲۰۰ کلمه نادر', count: 200, file: 'C2-03-rare-specialized.json' }
    ]
  }
];

// ═══════════════════════════════════════════
//  RENDER — minimal ready-packs (504 + CEFR)
// ═══════════════════════════════════════════
function renderPacksGrid(){
  const el=document.getElementById('ready-packs-grid');
  if(!el)return;
  const existing={};
  (S.words||[]).forEach(w=>{const s=w.source||'';existing[s]=(existing[s]||0)+1});

  let html='';
  // 504 pack
  READY_PACKS.forEach(p=>{
    const loaded=existing[p.id]||0;
    html+=`<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s" onclick="downloadPack('${p.id}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:1.6rem">📚</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.9rem">504 کلمه ضروری</div>
        <div style="font-size:.75rem;color:var(--text2)">${p.count} کلمه${loaded>0?' — ✅ '+loaded+' وارد شده':''}</div>
      </div>
      <div style="font-size:1.1rem;color:var(--accent)">📥</div>
    </div>`;
  });

  // CEFR levels — collapsed by default
  CEFR_LEVELS.forEach(level=>{
    const totalWords=level.packs.reduce((s,p)=>s+p.count,0);
    const loadedWords=level.packs.reduce((s,p)=>s+(existing[p.id]||0),0);
    const allLoaded=loadedWords>=totalWords;

    html+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg)">
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background .2s" onclick="toggleCefrLevel('${level.id}')" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='transparent'">
        <span style="font-size:1.3rem">${level.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.88rem;display:flex;align-items:center;gap:6px">
            <span>${level.id}</span>
            <span style="font-size:.78rem;font-weight:400;color:var(--text2)">— ${level.name}</span>
          </div>
          <div style="font-size:.72rem;color:var(--text3)">${level.packs.length} پک • ${totalWords} کلمه${loadedWords>0?' • '+loadedWords+' وارد شده':''}</div>
        </div>
        <div id="cefr-arrow-${level.id}" style="font-size:.8rem;color:var(--text2);transition:transform .25s;transform:rotate(-90deg)">▼</div>
      </div>
      <div id="cefr-packs-${level.id}" style="display:none;padding:0 10px 10px">
        <div style="display:grid;gap:6px">
          ${level.packs.map(p=>{
            const loaded=existing[p.id]||0;
            const isComplete=loaded>=p.count;
            const pct=Math.min(100,Math.round((loaded/p.count)*100));
            return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;transition:all .2s;${isComplete?'background:rgba(46,204,113,.06);border:1px solid rgba(46,204,113,.2)':'border:1px solid transparent'}" onclick="event.stopPropagation();downloadCefrPack('${p.id}','${level.id}')" onmouseover="this.style.background='${isComplete?'rgba(46,204,113,.06)':'var(--card-hover)'}'" onmouseout="this.style.background='${isComplete?'rgba(46,204,113,.06)':'transparent'}'">
              <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:${level.gradient};color:white;border-radius:8px;font-weight:800;font-size:.75rem;flex-shrink:0">${p.id.split('-')[1]}</div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
                  <div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:${isComplete?'var(--success)':level.color};border-radius:2px"></div>
                  </div>
                  <span style="font-size:.65rem;color:var(--text3);white-space:nowrap">${loaded}/${p.count}</span>
                </div>
              </div>
              <div style="font-size:.9rem;color:${isComplete?'var(--success)':level.color}">${isComplete?'✓':'📥'}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);display:flex;gap:6px">
          <button type="button" style="flex:1;padding:7px 10px;border-radius:8px;border:1px solid ${level.color};background:transparent;color:${level.color};font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s" onmouseover="this.style.background='${level.color}';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='${level.color}'" onclick="event.stopPropagation();downloadAllLevel('${level.id}')">
            📥 وارد کردن همه (${totalWords})
          </button>
        </div>
      </div>
    </div>`;
  });

  // Custom URL pack
  html+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;padding:10px 14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="font-size:1rem">🔗</span>
      <span style="font-weight:600;font-size:.85rem">دانلود پک از لینک</span>
    </div>
    <div style="display:flex;gap:6px">
      <input class="input" id="customPackUrl" placeholder="https://example.com/pack.json" style="flex:1;padding:7px 10px;font-size:.82rem">
      <button type="button" style="padding:7px 12px;border-radius:8px;border:none;background:var(--accent);color:white;font-size:.82rem;font-weight:600;cursor:pointer" onclick="downloadCustomPack()">📥</button>
    </div>
    <div id="custom-pack-status" style="margin-top:6px;font-size:.78rem"></div>
  </div>`;

  el.innerHTML=html;
  // All panels collapsed by default — no auto-open
}

// ═══════════════════════════════════════════
//  TOGGLE CEFR LEVEL
// ═══════════════════════════════════════════
function toggleCefrLevel(levelId){
  const packsEl=document.getElementById('cefr-packs-'+levelId);
  const arrowEl=document.getElementById('cefr-arrow-'+levelId);
  if(!packsEl||!arrowEl)return;
  const isHidden=packsEl.style.display==='none';
  packsEl.style.display=isHidden?'grid':'none';
  arrowEl.style.transform=isHidden?'rotate(0deg)':'rotate(-90deg)';
}

// ═══════════════════════════════════════════
//  DOWNLOAD 504 PACK (with selection)
// ═══════════════════════════════════════════
async function downloadPack(packId){
  const pack=READY_PACKS.find(p=>p.id===packId);
  if(!pack)return;
  try{
    toast('⏳ در حال دانلود...','info');
    const res=await fetch(pack.url);
    if(!res.ok)throw new Error(res.status);
    const data=await res.json();
    if(!data.words||!Array.isArray(data.words))throw new Error('فرمت نامعتبر');
    const cards=data.words.map(w=>({
      id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
      partOfSpeech:w.partOfSpeech||'',category:pack.category,
      favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
      addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
      stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
      definitions:w.definitions||[],examples:w.examples||(w.example?[w.example]:[]),
      synonyms:w.synonyms||[],antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',
      collocations:w.collocations||[],wordFamily:w.wordFamily||[],
      note:w.note||'',trap:w.trap||'',tags:w.tags||[packId],source:packId
    }));
    stageImportCards(cards,'pack:'+packId);
  }catch(e){toast('❌ خطا: '+e.message,'danger')}
}

// ═══════════════════════════════════════════
//  DOWNLOAD SINGLE CEFR PACK (with selection)
// ═══════════════════════════════════════════
async function downloadCefrPack(packId, levelId){
  const level=CEFR_LEVELS.find(l=>l.id===levelId);
  if(!level)return;
  const pack=level.packs.find(p=>p.id===packId);
  if(!pack)return;
  try{
    toast('⏳ در حال دانلود «'+pack.name+'»...','info');
    const url=CEFR_BASE_URL+'/'+levelId+'/'+pack.file;
    const res=await fetch(url);
    if(!res.ok)throw new Error(res.status);
    const data=await res.json();
    if(!data.words||!Array.isArray(data.words))throw new Error('فرمت نامعتبر');
    const cards=data.words.map(w=>({
      id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
      partOfSpeech:w.partOfSpeech||'',category:level.id+' — '+level.name,
      favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
      addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
      stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
      definitions:w.definitions||[],examples:w.examples||(w.example?[w.example]:[]),
      synonyms:w.synonyms||[],antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',
      collocations:w.collocations||[],wordFamily:w.wordFamily||[],
      note:w.note||'',trap:w.trap||'',tags:w.tags||[level.id,packId],source:packId
    }));
    stageImportCards(cards,'cefr:'+packId);
  }catch(e){toast('❌ خطا: '+e.message,'danger')}
}

// ═══════════════════════════════════════════
//  DOWNLOAD ALL PACKS IN A LEVEL (with selection)
// ═══════════════════════════════════════════
async function downloadAllLevel(levelId){
  const level=CEFR_LEVELS.find(l=>l.id===levelId);
  if(!level)return;
  try{
    toast('⏳ در حال دانلود همه پک‌های '+level.id+'...','info');
    let allCards=[];
    for(const pack of level.packs){
      const url=CEFR_BASE_URL+'/'+levelId+'/'+pack.file;
      const res=await fetch(url);
      if(!res.ok)continue;
      const data=await res.json();
      if(!data.words||!Array.isArray(data.words))continue;
      data.words.forEach(w=>{
        allCards.push({
          id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
          partOfSpeech:w.partOfSpeech||'',category:level.id+' — '+level.name,
          favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
          addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
          stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
          definitions:w.definitions||[],examples:w.examples||(w.example?[w.example]:[]),
          synonyms:w.synonyms||[],antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',
          collocations:w.collocations||[],wordFamily:w.wordFamily||[],
          note:w.note||'',trap:w.trap||'',tags:w.tags||[level.id,pack.id],source:pack.id
        });
      });
    }
    if(!allCards.length){toast('خطا در دانلود','error');return}
    stageImportCards(allCards,'cefr-all:'+levelId);
  }catch(e){toast('❌ خطا: '+e.message,'danger')}
}

// ═══════════════════════════════════════════
//  CUSTOM URL PACK (with selection)
// ═══════════════════════════════════════════
async function downloadCustomPack(){
  const input=document.getElementById('customPackUrl');
  const status=document.getElementById('custom-pack-status');
  if(!input)return;
  const url=input.value.trim();
  if(!url){toast('لینک را وارد کنید','warning');return}
  try{
    if(status)status.innerHTML='<span style="color:var(--text2)">⏳ ...</span>';
    const res=await fetch(url);
    if(!res.ok)throw new Error(res.status);
    const data=await res.json();
    if(!data.words||!Array.isArray(data.words))throw new Error('فرمت نامعتبر');
    const name=data.name||'پک سفارشی';
    const cards=data.words.map(w=>({
      id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
      partOfSpeech:w.partOfSpeech||'',category:name,
      favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
      addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
      stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
      definitions:w.definitions||[],examples:w.examples||[],synonyms:w.synonyms||[],
      antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',collocations:w.collocations||[],
      wordFamily:w.wordFamily||[],note:w.note||'',trap:w.trap||'',tags:['custom'],source:'url-import'
    }));
    if(status)status.innerHTML='';
    stageImportCards(cards,'url:'+name);
  }catch(e){
    if(status)status.innerHTML='<span style="color:var(--danger)">❌ '+e.message+'</span>';
    toast('❌ '+e.message,'danger');
  }
}

// ═══════════════════════════════════════════
//  AUTO-RENDER on import page
// ═══════════════════════════════════════════
const _origRenderImportSteps=typeof renderImportSteps==='function'?renderImportSteps:null;
if(_origRenderImportSteps){
  window.renderImportSteps=function(){
    const html=_origRenderImportSteps();
    setTimeout(()=>{renderPacksGrid()},150);
    return html;
  };
}
