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

// Auto-render packs grid on import page
const _origRenderImportSteps=typeof renderImportSteps==='function'?renderImportSteps:null;
if(_origRenderImportSteps){
  window.renderImportSteps=function(){
    const html=_origRenderImportSteps();
    setTimeout(renderPacksGrid,150);
    return html;
  };
}

