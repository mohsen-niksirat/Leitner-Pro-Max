// ═══════════════════════════════════════════
//  DOWNLOAD PACKS MODULE
// ═══════════════════════════════════════════
const READY_PACKS = [
  {id:'504',name:'📚 504 کلمه ضروری',desc:'کتاب 504 Absolutely Essential Words — ۴۲ درس',count:504,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/504words.json',category:'504'},
  {id:'ielts',name:'🎓 آیلتس',desc:'واژگان ضروری آیلتس',count:108,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/ielts.json',category:'آیلتس'},
  {id:'toefl',name:'🎓 تافل',desc:'واژگان ضروری تافل',count:107,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/toefl.json',category:'تافل'},
  {id:'computer',name:'💻 کامپیوتر',desc:'واژگان تخصصی فناوری',count:101,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/computer.json',category:'کامپیوتر'},
  {id:'gre',name:'📚 GRE',desc:'واژگان پیشرفته GRE',count:80,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/gre.json',category:'GRE'},
  {id:'daily',name:'💬 مکالمه',desc:'عبارات کاربردی روزمره',count:80,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/daily.json',category:'مکالمه'},
  {id:'academic',name:'🎓 آکادمیک',desc:'واژگان متون علمی',count:80,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/academic.json',category:'آکادمیک'},
  {id:'medical',name:'🏥 پزشکی',desc:'واژگان پزشکی و سلامت',count:60,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/medical.json',category:'پزشکی'},
  {id:'business',name:'💼 بیزنس',desc:'واژگان بازرگانی',count:60,url:'https://raw.githubusercontent.com/mohsen-niksirat/Leitner_Mobile/main/packs/business.json',category:'بیزنس'}
];

// ═══════════════════════════════════════════
//  CEFR VOCABULARY PACKS (A1-C2)
// ═══════════════════════════════════════════
const CEFR_BASE_URL = 'https://raw.githubusercontent.com/mohsen-niksirat/Leitner-Pro-Max/main/All_Vocabulary_Packs';

const CEFR_LEVELS = [
  {
    id: 'A1',
    name: 'مبتدی',
    icon: '🌱',
    color: '#2ecc71',
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
    id: 'A2',
    name: '.Elementary',
    icon: '🌿',
    color: '#3498db',
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
    id: 'B1',
    name: 'متوسط',
    icon: '🌳',
    color: '#e67e22',
    gradient: 'linear-gradient(135deg, #e67e22, #d35400)',
    packs: [
      { id: 'B1-01', name: 'تحصیل و یادگیری', desc: '۲۰۰ کلمه آکادمیک', count: 200, file: 'B1-01-education-learning.json' },
      { id: 'B1-02', name: 'کار و حرفه', desc: '۲۰۰ کلمه شغلی', count: 200, file: 'B1-02-career-business.json' },
      { id: 'B1-03', name: 'جامعه و فرهنگ', desc: '۲۰۰ کلمه اجتماعی', count: 200, file: 'B1-03-society-culture.json' },
      { id: 'B1-04', name: 'احساسات و روابط', desc: '۲۰۰ کلمه عاطفی', count: 200, file: 'B1-04-emotions-relationships.json' }
    ]
  },
  {
    id: 'B2',
    name: 'Upper-Intermediate',
    icon: '🌲',
    color: '#9b59b6',
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
    id: 'C1',
    name: 'پیشرفته',
    icon: '🏔️',
    color: '#e74c3c',
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
    id: 'C2',
    name: 'ماهر',
    icon: '👑',
    color: '#f1c40f',
    gradient: 'linear-gradient(135deg, #f1c40f, #f39c12)',
    packs: [
      { id: 'C2-01', name: 'ادبیات و نثر پیشرفته', desc: '۲۰۰ کلمه ادبی', count: 200, file: 'C2-01-advanced-literature.json' },
      { id: 'C2-02', name: 'اصطلاحات و زبان عامیانه', desc: '۲۰۰ کلمه محاوره‌ای', count: 200, file: 'C2-02-idioms-colloquial.json' },
      { id: 'C2-03', name: 'واژگان نادر و تخصصی', desc: '۲۰۰ کلمه نادر', count: 200, file: 'C2-03-rare-specialized.json' }
    ]
  }
];

function renderPacksGrid(){
  const el=document.getElementById('ready-packs-grid');
  if(!el)return;
  const existing={};
  (S.words||[]).forEach(w=>{const s=w.source||'';existing[s]=(existing[s]||0)+1});
  el.innerHTML=READY_PACKS.map(p=>{
    const loaded=existing[p.id]||0;
    return'<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all .25s" onclick="downloadPack(\''+p.id+'\')" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
      +'<div style="font-size:2rem">'+p.name.split(' ')[0]+'</div>'
      +'<div style="flex:1">'
      +'<div style="font-weight:700;font-size:.95rem">'+p.name.split(' ').slice(1).join(' ')+'</div>'
      +'<div style="font-size:.78rem;color:var(--text2)">'+p.desc+' — '+p.count+' کلمه</div>'
      +(loaded>0?'<div style="font-size:.7rem;color:var(--success);margin-top:2px">✅ '+loaded+' وارد شده</div>':'')
      +'</div>'
      +'<div style="font-size:1.4rem;color:var(--accent)">📥</div>'
      +'</div>';
  }).join('');
}

async function downloadPack(packId){
  const pack=READY_PACKS.find(p=>p.id===packId);
  if(!pack)return;
  const existing=(S.words||[]).filter(w=>w.source===packId).length;
  if(existing>=pack.count){toast('این پک قبلاً وارد شده','info');return}
  try{
    toast('⏳ در حال دانلود...','info');
    const res=await fetch(pack.url);
    if(!res.ok)throw new Error(res.status);
    const data=await res.json();
    if(!data.words||!Array.isArray(data.words))throw new Error('فرمت نامعتبر');
    const existingWords=new Set((S.words||[]).map(w=>(w.word||'').toLowerCase()));
    let added=0;
    for(const w of data.words){
      if(existingWords.has((w.word||'').toLowerCase()))continue;
      const packCard={
        id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
        partOfSpeech:w.partOfSpeech||'',category:w.category||pack.category,
        favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
        addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
        stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
        definitions:w.definitions||[],examples:w.examples||(w.example?[w.example]:[]),
        synonyms:w.synonyms||[],antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',
        collocations:w.collocations||[],wordFamily:w.wordFamily||[],
        note:w.note||'',trap:w.trap||'',tags:w.tags||[packId],source:packId
      };
      if(window.cardRepository?.get()?.add(packCard,'words')?.added){existingWords.add((w.word||'').toLowerCase());added++;}
    }
    save();
    toast('✅ '+added+' کلمه از «'+pack.name+'» وارد شد','success');
    renderPacksGrid();
    if(typeof showConfetti==='function')showConfetti();
  }catch(e){toast('❌ خطا: '+e.message,'danger')}
}

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
    const existing=new Set((S.words||[]).map(w=>(w.word||'').toLowerCase()));
    let added=0;
    for(const w of data.words){
      if(existing.has((w.word||'').toLowerCase()))continue;
      const packCard={
        id:uid(),word:w.word,translation:w.translation||'',ipa:w.ipa||'',
        partOfSpeech:w.partOfSpeech||'',category:w.category||name,
        favorite:false,context:'',box:0,repetitions:0,interval:1,easeFactor:2.5,
        addedDate:new Date().toISOString(),nextReviewDate:null,lastReviewedAt:null,
        stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,fsrsState:'new',
        definitions:w.definitions||[],examples:w.examples||[],synonyms:w.synonyms||[],
        antonyms:w.antonyms||[],coreMeaning:w.coreMeaning||'',collocations:w.collocations||[],
        wordFamily:w.wordFamily||[],note:w.note||'',trap:w.trap||'',tags:['custom'],source:'url-import'
      };
      if(window.cardRepository?.get()?.add(packCard,'words')?.added){existing.add((w.word||'').toLowerCase());added++;}
    }
    save();
    if(status)status.innerHTML='<span style="color:var(--success)">✅ '+added+' کلمه وارد شد</span>';
    toast('✅ '+added+' کلمه از «'+name+'»','success');
    if(typeof showConfetti==='function')showConfetti();
  }catch(e){
    if(status)status.innerHTML='<span style="color:var(--danger)">❌ '+e.message+'</span>';
    toast('❌ '+e.message,'danger');
  }
}

// ═══════════════════════════════════════════
//  CEFR PACKS RENDERING
// ═══════════════════════════════════════════
function renderCefrPacksSection(){
  const el=document.getElementById('cefr-packs-grid');
  if(!el)return;
  
  // Count loaded words per pack
  const existing={};
  (S.words||[]).forEach(w=>{const s=w.source||'';existing[s]=(existing[s]||0)+1});
  
  let html='';
  CEFR_LEVELS.forEach(level=>{
    const totalWords=level.packs.reduce((sum,p)=>sum+p.count,0);
    const loadedWords=level.packs.reduce((sum,p)=>sum+(existing[p.id]||0),0);
    
    html+=`<div class="cefr-level-row" style="margin-bottom:20px;border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--border);">
      <!-- Level Header -->
      <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:${level.gradient};color:white;cursor:pointer" onclick="toggleCefrLevel('${level.id}')">
        <div style="font-size:2rem;width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.2);border-radius:12px">${level.icon}</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:1.1rem;display:flex;align-items:center;gap:10px">
            <span>${level.id}</span>
            <span style="font-size:.85rem;font-weight:500;opacity:0.9">— ${level.name}</span>
          </div>
          <div style="font-size:.8rem;opacity:0.85;margin-top:2px">${level.packs.length} پک • ${totalWords} کلمه • ${loadedWords} وارد شده</div>
        </div>
        <div id="cefr-arrow-${level.id}" style="font-size:1.2rem;transition:transform .3s">▼</div>
      </div>
      <!-- Packs Grid (collapsible) -->
      <div id="cefr-packs-${level.id}" style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;transition:max-height .3s;overflow:hidden">
        ${level.packs.map(p=>{
          const loaded=existing[p.id]||0;
          const isComplete=loaded>=p.count;
          const progress=Math.min(100,Math.round((loaded/p.count)*100));
          return`<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg);border:2px solid ${isComplete?'var(--success)':'var(--border)'};border-radius:12px;cursor:pointer;transition:all .25s;position:relative;overflow:hidden" onclick="downloadCefrPack('${p.id}','${level.id}')" onmouseover="this.style.borderColor='${level.color}';this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)" onmouseout="this.style.borderColor='${isComplete?'var(--success)':'var(--border)'}';this.style.transform='none';this.style.boxShadow='none'">
            ${isComplete?`<div style="position:absolute;top:8px;left:8px;background:var(--success);color:white;font-size:.6rem;padding:2px 6px;border-radius:6px;font-weight:600">✓ وارد شده</div>`:''}
            <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${level.gradient};color:white;border-radius:10px;font-weight:800;font-size:.9rem;flex-shrink:0">${p.id.split('-')[1]}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
              <div style="font-size:.75rem;color:var(--text2);margin-top:2px">${p.desc}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
                <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${progress}%;background:${level.color};border-radius:2px;transition:width .3s"></div>
                </div>
                <span style="font-size:.65rem;color:var(--text2);white-space:nowrap">${loaded}/${p.count}</span>
              </div>
            </div>
            <div style="font-size:1.2rem;color:${level.color};flex-shrink:0">📥</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  
  el.innerHTML=html;
}

function toggleCefrLevel(levelId){
  const packsEl=document.getElementById('cefr-packs-'+levelId);
  const arrowEl=document.getElementById('cefr-arrow-'+levelId);
  if(!packsEl||!arrowEl)return;
  
  const isHidden=packsEl.style.display==='none';
  packsEl.style.display=isHidden?'grid':'none';
  arrowEl.style.transform=isHidden?'rotate(0deg)':'rotate(-90deg)';
}

async function downloadCefrPack(packId, levelId){
  const level=CEFR_LEVELS.find(l=>l.id===levelId);
  if(!level)return;
  const pack=level.packs.find(p=>p.id===packId);
  if(!pack)return;
  
  const existing=(S.words||[]).filter(w=>w.source===packId).length;
  if(existing>=pack.count){
    toast('این پک قبلاً وارد شده','info');
    return;
  }
  
  try{
    toast('⏳ در حال دانلود «'+pack.name+'»...','info');
    const url=CEFR_BASE_URL+'/'+levelId+'/'+pack.file;
    const res=await fetch(url);
    if(!res.ok)throw new Error(res.status);
    const data=await res.json();
    if(!data.words||!Array.isArray(data.words))throw new Error('فرمت نامعتبر');
    
    const existingWords=new Set((S.words||[]).map(w=>(w.word||'').toLowerCase()));
    let added=0;
    
    for(const w of data.words){
      if(existingWords.has((w.word||'').toLowerCase()))continue;
      const packCard={
        id:uid(),
        word:w.word,
        translation:w.translation||'',
        ipa:w.ipa||'',
        partOfSpeech:w.partOfSpeech||'',
        category:w.category||level.id+' — '+level.name,
        favorite:false,
        context:'',
        box:0,
        repetitions:0,
        interval:1,
        easeFactor:2.5,
        addedDate:new Date().toISOString(),
        nextReviewDate:null,
        lastReviewedAt:null,
        stability:0,
        difficulty:0,
        elapsedDays:0,
        scheduledDays:0,
        reps:0,
        lapses:0,
        fsrsState:'new',
        definitions:w.definitions||[],
        examples:w.examples||(w.example?[w.example]:[]),
        synonyms:w.synonyms||[],
        antonyms:w.antonyms||[],
        coreMeaning:w.coreMeaning||'',
        collocations:w.collocations||[],
        wordFamily:w.wordFamily||[],
        note:w.note||'',
        trap:w.trap||'',
        tags:w.tags||[level.id,packId],
        source:packId
      };
      if(window.cardRepository?.get()?.add(packCard,'words')?.added){
        existingWords.add((w.word||'').toLowerCase());
        added++;
      }
    }
    
    save();
    toast('✅ '+added+' کلمه از «'+pack.name+'» وارد شد','success');
    renderCefrPacksSection();
    if(typeof showConfetti==='function')showConfetti();
  }catch(e){
    toast('❌ خطا: '+e.message,'danger');
  }
}

// Auto-render packs grid on import page
const _origRenderImportSteps=typeof renderImportSteps==='function'?renderImportSteps:null;
if(_origRenderImportSteps){
  window.renderImportSteps=function(){
    const html=_origRenderImportSteps();
    setTimeout(()=>{
      renderPacksGrid();
      renderCefrPacksSection();
    },150);
    return html;
  };
}

