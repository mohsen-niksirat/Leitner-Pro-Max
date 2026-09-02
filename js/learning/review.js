// ═══════════════════════════════════════════
// 1. REVIEW (with FSRS + edit in review)
// ═══════════════════════════════════════════
let reviewSession={queue:[],idx:0,flipped:false,correct:0,wrong:0,done:false,startTime:0};
let reviewRatingPending=false;
function findCardById(id){let c=S.words.find(x=>x.id===id);return c||S.longTerm.find(x=>x.id===id)||null}
// ═══ AUTO-PLAY STATE ═══
let autoPlayState={active:false,paused:false,timer:null,countdownTimer:null,countdown:0,flipDelay:3000,showDelay:5000,speed:'normal'};
const AUTO_PLAY_SPEEDS={slow:{flip:4000,show:7000,label:'آهسته'},normal:{flip:3000,show:5000,label:'عادی'},fast:{flip:2000,show:3500,label:'سریع'},turbo:{flip:1200,show:2500,label:'خیلی سریع'}};
function stopAutoPlay(){autoPlayState.active=false;autoPlayState.paused=false;if(autoPlayState.timer){clearTimeout(autoPlayState.timer);autoPlayState.timer=null}if(autoPlayState.countdownTimer){clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=null}autoPlayState.countdown=0;var bar=document.getElementById('autoPlayBar');if(bar)bar.remove();var ratingBar=document.getElementById('ratingBar');if(ratingBar)ratingBar.style.display='none'}
function startAutoPlay(){if(!reviewSession.queue.length)return;if(reviewSession.done){reviewSession.done=false;reviewSession.idx=0;reviewSession.correct=0;reviewSession.wrong=0;reviewSession.startTime=Date.now()}autoPlayState.active=true;autoPlayState.paused=false;var sp=AUTO_PLAY_SPEEDS[autoPlayState.speed]||AUTO_PLAY_SPEEDS.normal;autoPlayState.flipDelay=sp.flip;autoPlayState.showDelay=sp.show;renderReview(document.getElementById('content'))}
function autoPlayTick(){if(!autoPlayState.active||autoPlayState.paused)return;var c=document.getElementById('content');if(!reviewSession.flipped){reviewSession.flipped=true;var card=document.getElementById('rCard');if(card)card.classList.add('flipped');var rb=document.getElementById('ratingBar');if(rb)rb.style.display='none';autoPlayScheduleNext(autoPlayState.showDelay)}else{reviewSession.idx++;reviewSession.flipped=false;if(reviewSession.idx>=reviewSession.queue.length){stopAutoPlay();reviewSession.done=true;renderReview(c);return}renderReview(c)}}
function autoPlayScheduleNext(delay){if(!autoPlayState.active)return;if(autoPlayState.timer)clearTimeout(autoPlayState.timer);autoPlayState.countdown=Math.ceil(delay/1000);updateAutoPlayCountdown();if(autoPlayState.countdownTimer)clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=setInterval(function(){autoPlayState.countdown--;updateAutoPlayCountdown();if(autoPlayState.countdown<=0){clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=null}},1000);autoPlayState.timer=setTimeout(function(){autoPlayTick()},delay)}
function updateAutoPlayCountdown(){var el=document.getElementById('apCountdown');if(el)el.textContent=autoPlayState.countdown>0?autoPlayState.countdown+'s':''}
function renderAutoPlayBar(){return'<div class="auto-play-bar" id="autoPlayBar"><div class="auto-play-label"><div class="auto-play-dot"></div>پخش خودکار</div><button type="button" class="btn btn-ghost btn-sm" id="apPauseBtn" title="مکث/ادامه">'+(autoPlayState.paused?'▶️':'⏸️')+'</button><button type="button" class="btn btn-danger btn-sm" id="apStopBtn" title="توقف">⏹️</button><div class="auto-play-speed"><span>سرعت:</span><select id="apSpeedSelect"><option value="slow"'+(autoPlayState.speed==='slow'?' selected':'')+'>آهسته</option><option value="normal"'+(autoPlayState.speed==='normal'?' selected':'')+'>عادی</option><option value="fast"'+(autoPlayState.speed==='fast'?' selected':'')+'>سریع</option><option value="turbo"'+(autoPlayState.speed==='turbo'?' selected':'')+'>خیلی سریع</option></select></div><div class="auto-play-timer" id="apCountdown"></div></div>'}
function getDue(){return S.words.filter(w=>!w.nextReviewDate||new Date(w.nextReviewDate)<=new Date())}
function getDueAll(){return[...S.words,...S.longTerm].filter(w=>!w.nextReviewDate||new Date(w.nextReviewDate)<=new Date())}
function startReview(){
const due=getDue();
if(!due.length){toast('هیچ کارتی برای مرور نیست','info');return}
reviewSession={queue:due.sort(()=>Math.random()-.5),idx:0,flipped:false,correct:0,wrong:0,done:false,startTime:Date.now()};
renderReview(document.getElementById('content'))}
function renderReview(c){
if(reviewSession.done){
const acc=reviewSession.queue.length?Math.round(reviewSession.correct/reviewSession.queue.length*100):0;
const elapsed=reviewSession.startTime?Date.now()-reviewSession.startTime:0;
const elapsedMin=Math.floor(elapsed/60000);
const elapsedSec=Math.floor((elapsed%60000)/1000);
const timeStr=elapsedMin>0?elapsedMin+' دقیقه و '+elapsedSec+' ثانیه':elapsedSec+' ثانیه';
const avgPerCard=reviewSession.queue.length>0?Math.round(elapsed/reviewSession.queue.length/1000):0;
c.innerHTML=`<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">پایان مرور</h3><div class="stat-grid"><div class="stat-card"><div class="val">${reviewSession.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${reviewSession.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${reviewSession.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div><div class="stat-card"><div class="val" style="font-size:1.2rem">⏱️ ${timeStr}</div><div class="lbl">زمان کل</div></div><div class="stat-card"><div class="val">${avgPerCard}s</div><div class="lbl">میانگین/کارت</div></div></div><button class="btn btn-primary" type="button" id="reviewRestart">مرور مجدد</button></div>`;
document.getElementById('reviewRestart').onclick=()=>{reviewSession={queue:[],idx:0,flipped:false,correct:0,wrong:0,done:false};startReview()};return}
if(!reviewSession.queue.length){startReview();if(!reviewSession.queue.length){c.innerHTML=`<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">📖</div><p>کارتی برای مرور نیست</p></div></div>`;return}}
// Search in review
const reviewSearchHtml=`<div style="margin-bottom:12px"><input class="input" placeholder="🔍 جستجو در کلمات مرور..." id="reviewSearch" style="max-width:300px;font-size:.85rem;padding:8px 12px"></div>`;
const w=reviewSession.queue[reviewSession.idx];
const prog=Math.round((reviewSession.idx/reviewSession.queue.length)*100);
const tier=getFrequencyTier(w.word);
let backHtml='';
// Rich back card rendering
const rbSections=[];
// Core Meaning
if(w.coreMeaning)rbSections.push('<div class="rb-core-meaning">'+esc(w.coreMeaning)+'</div>');
// Definitions
if(w.definitions&&w.definitions.length){const defs=w.definitions.slice(0,4);rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">📖</span> تعاریف</div><div class="rb-section-content">'+defs.map(d=>'<div style="margin-bottom:4px">• '+esc(d)+'</div>').join('')+'</div></div>')}
// Examples (template check)
if((S.settings.cardTemplate||{}).showExamples!==false){
if(w.examples&&w.examples.length){const exs=w.examples.slice(0,3);rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">💬</span> مثال</div>'+exs.map(ex=>'<div class="rb-example">"'+esc(ex)+'"</div>').join('')+'<button type="button" class="btn btn-sm btn-ghost" data-genex="'+esc(w.id)+'" style="margin-top:6px;font-size:.75rem">تولید مثال بیشتر 🤖</button></div>')}
else{rbSections.push('<div class="rb-section"><button type="button" class="btn btn-sm btn-ghost" data-genex="'+esc(w.id)+'" style="font-size:.75rem">تولید مثال با هوش مصنوعی 🤖</button></div>')}
}
// Context/Collocation (template check + auto-suggestions)
if((S.settings.cardTemplate||{}).showCollocations!==false){
const autoCollocs=suggestCollocations(w.word);
const allCollocs=[...(w.collocations||[]),...autoCollocs.filter(c=>!(w.collocations||[]).includes(c))].slice(0,6);
if(w.context||allCollocs.length){let ctxHtml='<div class="rb-section"><div class="rb-section-label"><span class="icon">🔗</span> بافت و همنشینی</div><div class="rb-context">';if(w.context)ctxHtml+=esc(w.context);if(allCollocs.length){if(w.context)ctxHtml+='<br>';ctxHtml+=allCollocs.map(c=>'<span class="rb-chip">'+esc(c)+'</span>').join(' ')}ctxHtml+='</div></div>';rbSections.push(ctxHtml)}
}
// Synonyms (template check)
if((S.settings.cardTemplate||{}).showSynonyms!==false&&w.synonyms&&w.synonyms.length){rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">🔄</span> مترادف</div><div class="rb-chips">'+w.synonyms.slice(0,6).map(s=>'<span class="rb-chip">'+esc(s)+'</span>').join('')+'</div></div>')}
// Antonyms (template check)
if((S.settings.cardTemplate||{}).showAntonyms!==false&&w.antonyms&&w.antonyms.length){rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">⚡</span> متضاد</div><div class="rb-chips">'+w.antonyms.slice(0,6).map(a=>'<span class="rb-chip antonym">'+esc(a)+'</span>').join('')+'</div></div>')}
// Word Family (template check + merge stored + auto-generated morphological)
if((S.settings.cardTemplate||{}).showFamily!==false){
const morphFamily=getMorphologicalFamily(w.word);
const allFamily=[...(w.wordFamily||[]),...morphFamily.filter(f=>!(w.wordFamily||[]).includes(f))].slice(0,8);
if(allFamily.length){rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">🌳</span> خانواده واژگانی</div><div class="rb-chips">'+allFamily.map(f=>'<span class="rb-chip word-family">'+esc(f)+'</span>').join('')+'</div></div>')}
}
// Frequency rank
const freqRank=getFrequencyRank(w.word);
if(freqRank)rbSections.push('<div class="rb-section"><div class="rb-section-label"><span class="icon">📊</span> رتبه فراوانی</div><div style="font-size:.85rem;color:var(--accent)">~'+freqRank.toLocaleString()+' (COCA — Corpus of Contemporary American English)</div></div>');
// Note
if(w.note)rbSections.push('<div class="rb-note-box"><div class="rb-section-label"><span class="icon">💡</span> یادداشت</div>'+esc(w.note)+'</div>');
// Trap
if(w.trap)rbSections.push('<div class="rb-trap-box"><div class="rb-section-label"><span class="icon">⚠️</span> نکته مهم</div>'+esc(w.trap)+'</div>');
// Footer: tags, source
let footerHtml='';
const footerItems=[];
if(w.tags&&w.tags.length)footerItems.push(...w.tags.map(t=>'<span class="tag">'+esc(t)+'</span>'));
if(w.source)footerItems.push('<span class="rb-source">'+esc(w.source)+'</span>');
if(footerItems.length)footerHtml='<div class="rb-footer">'+footerItems.join('')+'</div>';
backHtml=rbSections.join('')+footerHtml;
const autoPlayBarHtml=autoPlayState.active?renderAutoPlayBar():'';
const autoPlayStartBtn=!autoPlayState.active?`<div style="text-align:center;margin-bottom:14px"><button type="button" class="btn btn-ghost btn-sm" id="autoPlayStartBtn" style="font-size:.8rem;gap:6px">▶️ پخش خودکار</button></div>`:'';
c.innerHTML=`<div style="max-width:500px;margin:0 auto">${autoPlayBarHtml}${autoPlayStartBtn}<div class="flex" style="justify-content:space-between;margin-bottom:16px"><span style="color:var(--text2)">${reviewSession.idx+1} از ${reviewSession.queue.length}</span><div class="flex" style="gap:4px"><span class="badge badge-accent">${w.box>0?'جعبه '+w.box:'جدید'}</span>${tier?`<span class="badge tier-${tier}">${tierLabel(tier)}</span>`:''}</div></div><div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>${reviewSearchHtml}<div class="review-card" id="rCard" tabindex="0" role="button" aria-label="کارت مرور — برای نمایش پاسخ کلیک یا Enter بزنید" aria-live="polite"><div class="review-inner"><div class="review-face"><div style="font-size:1.8rem;font-weight:700;margin-bottom:12px">${esc(w.word)} <button type="button" class="trans-audio-btn" id="reviewSpeakBtn" title="شنیدن تلفظ" style="vertical-align:middle;font-size:1rem">🔊</button></div>${(S.settings.cardTemplate||{}).showIpa!==false&&w.ipa?`<div style="color:var(--text2);font-size:.9rem">${esc(w.ipa)}</div>`:''}<div style="color:var(--text2);font-size:.8rem;margin-top:16px">برای نمایش پاسخ کلیک کنید</div></div><div class="review-face review-back" style="justify-content:flex-start;padding-top:20px;overflow-y:auto;max-height:100%"><div class="rb-header"><span class="rb-word">${esc(w.word)}</span>${w.ipa?`<span class="rb-ipa">${esc(w.ipa)}</span>`:''}${w.partOfSpeech?`<span class="rb-pos">${esc(w.partOfSpeech)}</span>`:''}${tier?`<span class="badge tier-${tier}" style="font-size:.6rem">${tierLabel(tier)}</span>`:''}</div><div class="rb-translation">${esc(w.translation)}</div>${w.category&&w.category!=='پیش‌فرض'?`<div style="text-align:center;margin-bottom:12px"><span class="tag">${esc(w.category)}</span></div>`:''}${backHtml}<div class="rb-dialects" style="margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><span style="color:var(--text2);font-size:.72rem;align-self:center">تلفظ:</span><button type="button" class="btn btn-ghost btn-sm" data-dialect="us" style="font-size:.72rem;padding:4px 10px">🇺🇸 US</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="uk" style="font-size:.72rem;padding:4px 10px">🇬🇧 UK</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="au" style="font-size:.72rem;padding:4px 10px">🇦🇺 AU</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="in" style="font-size:.72rem;padding:4px 10px">🇮🇳 IN</button></div><div style="margin-top:12px;gap:6px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" id="reviewEnrichBtn" style="font-size:.75rem">🔍 غنی‌سازی سریع</button><button type="button" class="btn btn-ghost btn-sm" id="reviewTransBtn" style="font-size:.75rem">🌐 ترجمه</button><button type="button" class="btn btn-ghost btn-sm" id="reviewEditBtn" style="font-size:.75rem">✏️ ویرایش</button></div></div></div></div></div><div class="rating-bar" id="ratingBar" style="display:none"><button type="button" class="btn btn-danger btn-sm" data-rate="1">❌ نادرست <kbd style="font-size:.6rem;opacity:.6">۱</kbd></button><button type="button" class="btn btn-ghost btn-sm" data-rate="3">😐 سخت <kbd style="font-size:.6rem;opacity:.6">۲</kbd></button><button type="button" class="btn btn-primary btn-sm" data-rate="4">🙂 خوب <kbd style="font-size:.6rem;opacity:.6">۳</kbd></button><button type="button" class="btn btn-success btn-sm" data-rate="5">😄 عالی <kbd style="font-size:.6rem;opacity:.6">۴</kbd></button></div><div style="text-align:center;margin-top:12px"><button type="button" class="btn btn-ghost btn-sm" id="wordDrillBtn" style="font-size:.8rem;gap:6px">📚 تمرین و توضیح کلمه</button></div></div>`;
const card=document.getElementById('rCard');
const ratingBar=document.getElementById('ratingBar');
card.onclick=()=>{if(autoPlayState.active)return;if(reviewSession.flipped)return;reviewSession.flipped=true;card.classList.add('flipped');ratingBar.style.display='flex'};
card.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();card.onclick()}};
ratingBar.onclick=(e)=>{if(autoPlayState.active)return;const btn=e.target.closest('[data-rate]');if(!btn||reviewRatingPending)return;rateReview(parseInt(btn.dataset.rate))};
const reviewSpeakBtn=document.getElementById('reviewSpeakBtn');
if(reviewSpeakBtn)reviewSpeakBtn.onclick=(e)=>{e.stopPropagation();speakWord(w.word)};
// Dialect pronunciation buttons
document.querySelectorAll('[data-dialect]').forEach(btn=>{
  btn.onclick=(e)=>{e.stopPropagation();speakWord(w.word,null,btn.dataset.dialect)}
});
// Auto-pronounce if enabled (skip if auto-play is active, it handles its own)
if(S.settings.autoPronounce&&!autoPlayState.active){setTimeout(function(){speakWord(w.word,S.settings.speechRate?'en-US':'en-US')},300)};
// ═══ AUTO-PLAY WIRING ═══
if(autoPlayState.active){var apPauseBtn=document.getElementById('apPauseBtn');var apStopBtn=document.getElementById('apStopBtn');var apSpeedSelect=document.getElementById('apSpeedSelect');if(apPauseBtn)apPauseBtn.onclick=function(){autoPlayState.paused=!autoPlayState.paused;if(autoPlayState.paused){if(autoPlayState.timer){clearTimeout(autoPlayState.timer);autoPlayState.timer=null}if(autoPlayState.countdownTimer){clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=null}apPauseBtn.textContent='▶️'}else{apPauseBtn.textContent='⏸️';autoPlayScheduleNext(reviewSession.flipped?autoPlayState.showDelay:autoPlayState.flipDelay)}};if(apStopBtn)apStopBtn.onclick=function(){stopAutoPlay();renderReview(document.getElementById('content'))};if(apSpeedSelect)apSpeedSelect.onchange=function(){autoPlayState.speed=this.value;var sp=AUTO_PLAY_SPEEDS[this.value]||AUTO_PLAY_SPEEDS.normal;autoPlayState.flipDelay=sp.flip;autoPlayState.showDelay=sp.show};setTimeout(function(){speakWord(w.word);autoPlayScheduleNext(autoPlayState.flipDelay)},400)}var autoPlayStartBtnEl=document.getElementById('autoPlayStartBtn');if(autoPlayStartBtnEl)autoPlayStartBtnEl.onclick=function(){startAutoPlay()};
// ═══ غنی‌سازی/ترجمه سرعتی بدون خروج از مرور ═══
const reviewEnrBtn=document.getElementById('reviewEnrichBtn');
const reviewTrBtn=document.getElementById('reviewTransBtn');
if(reviewEnrBtn)reviewEnrBtn.onclick=async function(ev){
  ev.stopPropagation();
  reviewEnrBtn.disabled=true;const cur=reviewEnrBtn.textContent;
  reviewEnrBtn.textContent='⏳ غنی‌سازی...';
  try{
    let result=await fetchDictionary(w.word);
    if(!result){const stems=vfStem(w.word);for(let s=1;s<stems.length;s++){result=await fetchDictionary(stems[s]);if(result){w.baseForm=w.baseForm||stems[s];break}}}
    if(result&&(!result.meanings||!result.meanings.length))result=null;
    if(!result){const faDefs=await fetchPersianWiktionaryDefs(w.word);if(faDefs&&faDefs.length){w.definitions=faDefs;w.defSource='fa-wiktionary';w.coreMeaning=w.coreMeaning||faDefs[0]}}
    if(!w.definitions||!w.definitions.length){const autot=await fetchTranslation(w.word);if(autot){w.definitions=[autot];w.defSource='fallback-trans';w.coreMeaning=w.coreMeaning||autot;if(!w.translation)w.translation=autot}}
    if(result){
      w.ipa=result.phonetic||w.ipa;w.audioUs=result.audioUs||w.audioUs;w.audioBr=result.audioBr||w.audioBr;
      const meanings=result.meanings||[];
      const defs=[...new Set(meanings.flatMap(m=>m.definitions||[]))].filter(Boolean).slice(0,8);
      if(defs.length){w.definitions=defs;w.coreMeaning=defs[0]||w.coreMeaning;w.defSource=''}
      if(meanings[0]&&meanings[0].partOfSpeech)w.partOfSpeech=w.partOfSpeech||meanings[0].partOfSpeech;
      const exs=[...new Set(meanings.flatMap(m=>m.examples||[]))].filter(Boolean).slice(0,6);if(exs.length)w.examples=exs;
      const syns=[...new Set(meanings.flatMap(m=>m.synonyms||[]))].filter(Boolean).slice(0,8);if(syns.length)w.synonyms=syns;
      try{
        if(!w.antonyms||!w.antonyms.length){const r=await fetch('https://api.datamuse.com/words?rel_ant='+encodeURIComponent(w.word)+'&max=6');const d=await r.json();if(Array.isArray(d))w.antonyms=[...(w.antonyms||[]),...d.filter(x=>x&&x.word).map(x=>x.word)].filter((v,i,a)=>a.indexOf(v)===i).slice(0,6)}
        if(!w.wordFamily||!w.wordFamily.length)w.wordFamily=(getMorphologicalFamily(w.word)||[]).slice(0,8);
        if(!w.collocations||!w.collocations.length){const coll=suggestCollocations(w.word);if(coll&&coll.length)w.collocations=coll.slice(0,6)}
      }catch(e){}
    }
    save();invalidateLibCache();invalidateLtCache();
    toast('«'+w.word+'» غنی‌سازی شد','success');
    renderReview(document.getElementById('content'));
    return;
  }catch(err){toast('خطا در غنی‌سازی: '+err.message,'error')}
  reviewEnrBtn.disabled=false;reviewEnrBtn.textContent=cur;
};
if(reviewTrBtn)reviewTrBtn.onclick=async function(e){
  e.stopPropagation();
  reviewTrBtn.disabled=true;
  const cur=reviewTrBtn.textContent;
  reviewTrBtn.textContent='⏳ ترجمه...';
  try{
    const t=await fetchTranslation(w.word);
    if(!t)toast('ترجمه‌ای دریافت نشد','error');
    else{w.translation=t;save();invalidateLibCache();invalidateLtCache();toast('ترجمه ذخیره شد','success');renderReview(document.getElementById('content'))}
    return;
  }catch(e){toast('خطا در ترجمه: '+e.message,'error')}
  reviewTrBtn.disabled=false;reviewTrBtn.textContent=cur;
};
// Word Drill — تمرین و توضیح کلمه
const wordDrillBtn=document.getElementById('wordDrillBtn');
if(wordDrillBtn){
  wordDrillBtn.onclick=(e)=>{
    e.stopPropagation();
    openWordDrill(w);
  };
}
document.onkeydown=reviewKeyHandler;
// Search in review handler
const reviewSearchInput=document.getElementById('reviewSearch');
if(reviewSearchInput){
  reviewSearchInput.oninput=function(){
    const q=this.value.trim().toLowerCase();
    if(!q)return;
    const matchIdx=reviewSession.queue.findIndex((w,i)=>i>=reviewSession.idx&&(w.word.toLowerCase().includes(q)||w.translation.toLowerCase().includes(q)));
    if(matchIdx>=0&&matchIdx!==reviewSession.idx){
      reviewSession.idx=matchIdx;
      reviewSession.flipped=false;
      renderReview(document.getElementById('content'));
    }
  };
  reviewSearchInput.onkeydown=function(e){e.stopPropagation()};
}

// Edit in review
const editBtn=document.getElementById('reviewEditBtn');
if(editBtn)editBtn.onclick=(e)=>{e.stopPropagation();editWord(w.id,()=>renderReview(document.getElementById('content')))};

// Generate examples in review
c.querySelectorAll('[data-genex]').forEach(btn=>{
  btn.onclick=async(e)=>{
    e.stopPropagation();
    btn.disabled=true;btn.textContent='در حال دریافت...';
    try{
      const resp=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w.word)}`);
      if(resp.ok){
        const data=await resp.json();
        if(data[0]){
          const newExs=data[0].meanings.flatMap(m=>m.definitions.filter(d=>d.example).map(d=>d.example)).slice(0,5);
          if(newExs.length>0){
            w.examples=[...(w.examples||[]),...newExs].slice(0,10);
            const _exCard=findCardById(w.id);if(_exCard)_exCard.examples=w.examples;
            save();
            // Update examples section in-place without full re-render
            const backSection=btn.closest('.rb-section');
            if(backSection){
              const exHtml=w.examples.slice(0,3).map(ex=>'<div class="rb-example">"'+esc(ex)+'"</div>').join('');
              backSection.innerHTML='<div class="rb-section-label"><span class="icon">💬</span> مثال</div>'+exHtml+'<button type="button" class="btn btn-sm btn-ghost" data-genex="'+esc(w.id)+'" style="margin-top:6px;font-size:.75rem">تولید مثال بیشتر 🤖</button>';
              // Re-bind the new button
              const newBtn=backSection.querySelector('[data-genex]');
              if(newBtn){newBtn.onclick=btn.onclick}
            }
            toast(newExs.length+' مثال جدید اضافه شد','success');
          }else toast('مثالی یافت نشد','info');
        }
      }
    }catch(e){toast('خطا در دریافت','error')}
  };
});
}
function rateReview(q){
if(reviewRatingPending)return;
if(!reviewSession.queue||!reviewSession.queue.length||reviewSession.idx>=reviewSession.queue.length){reviewRatingPending=true;setTimeout(function(){reviewRatingPending=false},50);return}
reviewRatingPending=true;
try{
const w=reviewSession.queue[reviewSession.idx];
const reviewCard=findCardById(w.id);
if(reviewCard)fsrsNext(reviewCard,mapRating(q));
S.stats.reviewed++;S.stats.xp+={1:0,2:3,3:5,4:8,5:10}[q]||0;
if(q>=4)S.stats.correct++;else S.stats.wrong++;
const dk=todayKey();if(S.stats.lastReviewDate!==dk){if(S.stats.lastReviewDate===new Date(Date.now()-MS_PER_DAY).toISOString().slice(0,10))S.stats.streak++;else S.stats.streak=1;S.stats.lastReviewDate=dk}
if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};
S.stats.history[dk].reviewed++;if(q>=4)S.stats.history[dk].correct++;else S.stats.history[dk].wrong++;
save();
reviewSession.idx++;reviewSession.flipped=false;
if(reviewSession.idx>=reviewSession.queue.length)reviewSession.done=true;
}catch(e){console.error('[rateReview error]',e);toast('خطا در ذخیره نتیجه','error')}
reviewRatingPending=false;
renderReview(document.getElementById('content'))}
function reviewKeyHandler(e){
if(autoPlayState.active)return;
if(document.querySelector('.modal-overlay'))return;
if(e.key===' '&&reviewSession.flipped===false&&currentTab==='review'){e.preventDefault();const card=document.getElementById('rCard');if(card){reviewSession.flipped=true;card.classList.add('flipped');document.getElementById('ratingBar').style.display='flex'}}
if(reviewSession.flipped&&currentTab==='review'&&!reviewRatingPending){const map={'1':1,'2':3,'3':4,'4':5};if(map[e.key])rateReview(map[e.key])}}

// ═══════════════════════════════════════════
// WORD DRILL — تمرین و توضیح کلمه
// ═══════════════════════════════════════════
function openWordDrill(w) {
  const word = w.word;
  const trans = w.translation || '';
  const pos = w.partOfSpeech || '';
  const ipa = w.ipa || '';
  const examples = w.examples || [];
  const synonyms = w.synonyms || [];
  const antonyms = w.antonyms || [];
  const note = w.note || '';

  // Build explanation content
  let explainHtml = '';

  // Word header
  explainHtml += '<div style="text-align:center;margin-bottom:16px">';
  explainHtml += '<div style="font-size:1.6rem;font-weight:800;color:var(--accent)">' + esc(word) + '</div>';
  if (ipa) explainHtml += '<div style="color:var(--text2);font-size:.9rem;margin-top:2px">' + esc(ipa) + '</div>';
  if (pos) explainHtml += '<div style="margin-top:4px"><span class="badge badge-accent">' + esc(pos) + '</span></div>';
  explainHtml += '<div style="font-size:1.2rem;font-weight:600;margin-top:8px">' + esc(trans) + '</div>';
  explainHtml += '</div>';

  // Examples
  if (examples.length) {
    explainHtml += '<div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:10px;border-right:3px solid var(--accent)">';
    explainHtml += '<div style="font-size:.8rem;font-weight:600;color:var(--accent);margin-bottom:6px">💬 مثال‌ها:</div>';
    examples.slice(0, 3).forEach(ex => {
      explainHtml += '<div style="font-size:.85rem;color:var(--text);margin-bottom:6px;line-height:1.7">• ' + esc(ex) + '</div>';
    });
    explainHtml += '</div>';
  }

  // Synonyms & Antonyms
  if (synonyms.length || antonyms.length) {
    explainHtml += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
    if (synonyms.length) {
      explainHtml += '<div style="flex:1;min-width:140px;background:var(--bg);border-radius:10px;padding:10px">';
      explainHtml += '<div style="font-size:.75rem;color:var(--success);font-weight:600;margin-bottom:4px">🔄 مترادف‌ها</div>';
      explainHtml += '<div style="font-size:.82rem;color:var(--text)">' + synonyms.slice(0, 5).map(s => esc(s)).join('، ') + '</div>';
      explainHtml += '</div>';
    }
    if (antonyms.length) {
      explainHtml += '<div style="flex:1;min-width:140px;background:var(--bg);border-radius:10px;padding:10px">';
      explainHtml += '<div style="font-size:.75rem;color:var(--danger);font-weight:600;margin-bottom:4px">⚡ متضادها</div>';
      explainHtml += '<div style="font-size:.82rem;color:var(--text)">' + antonyms.slice(0, 5).map(a => esc(a)).join('، ') + '</div>';
      explainHtml += '</div>';
    }
    explainHtml += '</div>';
  }

  // Note
  if (note) {
    explainHtml += '<div style="background:var(--bg);border-radius:10px;padding:10px;margin-bottom:10px;border-right:3px solid var(--warning)">';
    explainHtml += '<div style="font-size:.75rem;color:var(--warning);font-weight:600;margin-bottom:4px">💡 یادداشت</div>';
    explainHtml += '<div style="font-size:.85rem;color:var(--text)">' + esc(note) + '</div>';
    explainHtml += '</div>';
  }

  // Memory tricks
  explainHtml += '<div style="background:var(--bg);border-radius:10px;padding:10px;margin-bottom:10px;border-right:3px solid var(--accent)">';
  explainHtml += '<div style="font-size:.75rem;color:var(--accent);font-weight:600;margin-bottom:4px">🧠 ترفند حفظ کردن</div>';
  explainHtml += '<div style="font-size:.85rem;color:var(--text);line-height:1.7">' + getMemoryTrick(word, trans, pos) + '</div>';
  explainHtml += '</div>';

  // Usage tip
  explainHtml += '<div style="background:var(--bg);border-radius:10px;padding:10px;margin-bottom:10px;border-right:3px solid var(--success)">';
  explainHtml += '<div style="font-size:.75rem;color:var(--success);font-weight:600;margin-bottom:4px">📝 نکته استفاده</div>';
  explainHtml += '<div style="font-size:.85rem;color:var(--text);line-height:1.7">' + getUsageTip(word, trans, pos) + '</div>';
  explainHtml += '</div>';

  // ── Build quiz content ──
  let quizHtml = '';
  const quiz = generateWordQuiz(w);
  quizHtml += '<div style="margin-bottom:16px">';
  quizHtml += '<div style="font-size:1rem;font-weight:700;margin-bottom:12px;text-align:center">🎯 آزمون از کلمه «' + esc(word) + '»</div>';
  quiz.forEach((q, qi) => {
    quizHtml += '<div class="wd-quiz-q" data-qi="' + qi + '" style="background:var(--bg);border-radius:12px;padding:14px;margin-bottom:10px">';
    quizHtml += '<div style="font-size:.88rem;font-weight:600;margin-bottom:10px">' + (qi + 1) + '. ' + esc(q.question) + '</div>';
    q.options.forEach((opt, oi) => {
      quizHtml += '<button type="button" class="wd-quiz-opt" data-qi="' + qi + '" data-oi="' + oi + '" style="width:100%;text-align:right;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font:inherit;font-size:.85rem;cursor:pointer;margin-bottom:6px;transition:all .2s;display:block">' + esc(opt) + '</button>';
    });
    quizHtml += '<div class="wd-quiz-feedback" data-qi="' + qi + '" style="display:none;margin-top:8px;font-size:.82rem;padding:8px;border-radius:8px"></div>';
    quizHtml += '</div>';
  });
  quizHtml += '<div id="wdQuizScore" style="text-align:center;margin-top:16px;display:none"></div>';
  quizHtml += '</div>';

  // ── Create modal ──
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = '<div style="background:var(--card);border-radius:var(--radius);width:min(520px,95vw);max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    + '<div style="font-size:1rem;font-weight:700">📚 تمرین و توضیح کلمه</div>'
    + '<button type="button" class="btn btn-ghost btn-sm" id="wdClose" style="padding:4px 10px">✕</button>'
    + '</div>'
    + '<div style="display:flex;border-bottom:1px solid var(--border)">'
    + '<button type="button" class="wd-tab active" data-tab="explain" style="flex:1;padding:10px;border:none;background:none;color:var(--accent);font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;border-bottom:2px solid var(--accent);transition:all .2s">📖 توضیحات</button>'
    + '<button type="button" class="wd-tab" data-tab="quiz" style="flex:1;padding:10px;border:none;background:none;color:var(--text2);font:inherit;font-size:.85rem;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s">🎯 آزمون</button>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;padding:20px">'
    + '<div id="wdExplainContent">' + explainHtml + '</div>'
    + '<div id="wdQuizContent" style="display:none">' + quizHtml + '</div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(ov);
  ov.querySelector('#wdClose').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };

  // Tab switching
  ov.querySelectorAll('.wd-tab').forEach(tab => {
    tab.onclick = () => {
      ov.querySelectorAll('.wd-tab').forEach(t => {
        t.style.color = 'var(--text2)';
        t.style.borderBottomColor = 'transparent';
        t.style.fontWeight = '500';
        t.classList.remove('active');
      });
      tab.style.color = 'var(--accent)';
      tab.style.borderBottomColor = 'var(--accent)';
      tab.style.fontWeight = '600';
      tab.classList.add('active');
      ov.querySelector('#wdExplainContent').style.display = tab.dataset.tab === 'explain' ? 'block' : 'none';
      ov.querySelector('#wdQuizContent').style.display = tab.dataset.tab === 'quiz' ? 'block' : 'none';
    };
  });

  // Quiz option click
  let quizAnswered = new Set();
  ov.querySelectorAll('.wd-quiz-opt').forEach(btn => {
    btn.onclick = () => {
      const qi = parseInt(btn.dataset.qi);
      const oi = parseInt(btn.dataset.oi);
      if (quizAnswered.has(qi)) return;
      quizAnswered.add(qi);
      const correct = quiz[qi].correct;
      const feedback = ov.querySelector('.wd-quiz-feedback[data-qi="' + qi + '"]');
      if (oi === correct) {
        btn.style.background = 'linear-gradient(135deg,var(--success),#00d2a0)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--success)';
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(0,184,148,.1)';
        feedback.style.color = 'var(--success)';
        feedback.textContent = '✅ درست! ' + (quiz[qi].explanation || '');
      } else {
        btn.style.background = 'linear-gradient(135deg,var(--danger),#f0825e)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--danger)';
        // Highlight correct answer
        const correctBtn = ov.querySelector('.wd-quiz-opt[data-qi="' + qi + '"][data-oi="' + correct + '"]');
        if (correctBtn) {
          correctBtn.style.background = 'linear-gradient(135deg,var(--success),#00d2a0)';
          correctBtn.style.color = '#fff';
          correctBtn.style.borderColor = 'var(--success)';
        }
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(225,112,85,.1)';
        feedback.style.color = 'var(--danger)';
        feedback.textContent = '❌ نادرست! ' + (quiz[qi].explanation || '');
      }
      // Check if all answered
      if (quizAnswered.size === quiz.length) {
        let correctCount = 0;
        ov.querySelectorAll('.wd-quiz-opt').forEach(b => {
          if (b.style.borderColor === 'var(--success)' && b.style.color === 'rgb(255, 255, 255)') {
            const qIdx = parseInt(b.dataset.qi);
            const oIdx = parseInt(b.dataset.oi);
            if (quiz[qIdx].correct === oIdx) correctCount++;
          }
        });
        const scoreEl = ov.querySelector('#wdQuizScore');
        scoreEl.style.display = 'block';
        const pct = Math.round(correctCount / quiz.length * 100);
        const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
        scoreEl.innerHTML = '<div style="font-size:1.2rem;font-weight:700;margin-bottom:8px">' + emoji + ' نتیجه: ' + correctCount + ' از ' + quiz.length + ' (' + pct + '%)</div>'
          + '<button type="button" class="btn btn-primary btn-sm" id="wdQuizRetry">🔄 تلاش مجدد</button>';
        ov.querySelector('#wdQuizRetry').onclick = () => {
          quizAnswered.clear();
          ov.querySelectorAll('.wd-quiz-opt').forEach(b => {
            b.style.background = 'var(--card)';
            b.style.color = 'var(--text)';
            b.style.borderColor = 'var(--border)';
          });
          ov.querySelectorAll('.wd-quiz-feedback').forEach(f => f.style.display = 'none');
          scoreEl.style.display = 'none';
        };
      }
    };
  });
}

// ── Memory trick generator ──
function getMemoryTrick(word, trans, pos) {
  const w = word.toLowerCase();
  // Try to find patterns for mnemonic
  let tricks = [];
  // Check for common prefixes/suffixes
  const prefixes = {
    'un': 'پیشوند «un-» = نفی (مثال: unhappy = ناشاد)',
    're': 'پیشوند «re-» = دوباره (مثال: rewrite = بازنویسی)',
    'pre': 'پیشوند «pre-» = قبل (مثال: preview = پیش‌نمایش)',
    'dis': 'پیشوند «dis-» = نفی (مثال: disagree = مخالفت)',
    'mis': 'پیشوند «mis-» = غلط (مثال: mistake = اشتباه)',
    'over': 'پیشوند «over-» = بیش از حد (مثال: overload = اضافه‌بار)',
    'out': 'پیشوند «out-» = بیشتر از (مثال: outperform = بهتر عمل کردن)',
    'inter': 'پیشوند «inter-» = بین (مثال: international = بین‌المللی)',
    'trans': 'پیشوند «trans-» = از طریق/فراتر (مثال: transport = حمل‌ونقل)',
    'sub': 'پیشوند «sub-» = زیر (مثال: submarine = زیردریایی)',
    'super': 'پیشوند «super-» = بالا/فوق (مثال: superhero = ابرقهرمان)',
    'anti': 'پیشوند «anti-» = ضد (مثال: antivirus = ضدویروس)',
    'auto': 'پیشوند «auto-» = خود (مثال: automatic = خودکار)',
    'bi': 'پیشوند «bi-» = دو (مثال: bicycle = دوچرخه)',
    'multi': 'پیشوند «multi-» = چند (مثال: multilingual = چندزبانه)'
  };
  const suffixes = {
    'tion': 'پسوند «-tion» = اسم مصدر (مثال: education = آموزش)',
    'sion': 'پسوند «-sion» = اسم مصدر (مثال: decision = تصمیم)',
    'ness': 'پسوند «-ness» = اسم کیفیت (مثال: happiness = خوشبختی)',
    'ment': 'پسوند «-ment» = اسم (مثال: development = توسعه)',
    'able': 'پسوند «-able» = صفت قابلیت (مثال: readable = خواندنی)',
    'ible': 'پسوند «-ible» = صفت قابلیت (مثال: flexible = انعطاف‌پذیر)',
    'ful': 'پسوند «-ful» = پر از (مثال: beautiful = زیبا)',
    'less': 'پسوند «-less» = بدون (مثال: homeless = بی‌خانمان)',
    'ous': 'پسوند «-ous» = دارای (مثال: dangerous = خطرناک)',
    'ive': 'پسوند «-ive» = صفت فاعلی (مثال: creative = خلاق)',
    'ly': 'پسوند «-ly» = قید (مثال: quickly = سریعاً)',
    'er': 'پسوند «-er» = تفضیلی/فاعل (مثال: bigger = بزرگتر)',
    'est': 'پسوند «-est» = اعلا (مثال: biggest = بزرگترین)',
    'ize': 'پسوند «-ize» = فعل (مثال: organize = سازماندهی)',
    'al': 'پسوند «-al» = صفت (مثال: natural = طبیعی)'
  };
  for (const [pfx, desc] of Object.entries(prefixes)) {
    if (w.startsWith(pfx) && w.length > pfx.length + 2) {
      tricks.push('🔍 ' + desc);
    }
  }
  for (const [sfx, desc] of Object.entries(suffixes)) {
    if (w.endsWith(sfx) && w.length > sfx.length + 2) {
      tricks.push('🔍 ' + desc);
    }
  }
  // Letter-based association
  const firstLetter = w[0];
  const associations = {
    'a': 'مثل «always» — همیشه شروع کن!', 'b': 'مثل «big» — بزرگ فکر کن!',
    'c': 'مثل «create» — خلق کن!', 'd': 'مثل «dream» — رویا ببین!',
    'e': 'مثل «energy» — انرژی بده!', 'f': 'مثل «fly» — پرواز کن!',
    'g': 'مثل «grow» — رشد کن!', 'h': 'مثل «hope» — امیدوار باش!',
    'i': 'مثل «imagine» — تصور کن!', 'j': 'مثل «joy» — شادی کن!',
    'k': 'مثل «knowledge» — علم بیاموز!', 'l': 'مثل "love" — عشق بورز!',
    'm': 'مثل «magic» — جادو کن!', 'n': 'مثل «nature» — طبیعت!',
    'o': 'مثل «open» — باز کن!', 'p': 'مثل «power» — قدرت!',
    'q': 'مثل «question» — سوال کن!', 'r': 'مثل «rise» — بلند شو!',
    's': 'مثل «shine» — بدرخش!', 't': 'مثل «trust» — اعتماد کن!',
    'u': 'مثل «unique» — منحصر‌به‌فرد!', 'v': 'مثل "victory" — پیروزی!',
    'w': 'مثل «wisdom» — حکمت!', 'x': 'مثل «xenial» — مهمان‌نواز!',
    'y': 'مثل «youth» — جوانی!', 'z': 'مثل «zenith» — اوج!'
  };
  if (associations[firstLetter]) {
    tricks.push('🔤 حرف اول «' + firstLetter.toUpperCase() + '» — ' + associations[firstLetter]);
  }
  // Word length trick
  if (w.length <= 4) tricks.push('📏 کلمه کوتاهه — فقط ' + w.length + ' حرف! راحت حفظش کن.');
  else if (w.length >= 8) tricks.push('📏 کلمه بلنده — به بخش‌ها تقسیمش کن: ' + w.match(/.{1,3}/g).join('-'));
  // Rhyme/sound similarity
  const rhymes = {
    'ight': 'مثل light, night, right — همه «-ight» دارن!',
    'ound': 'مثل sound, found, ground — همه «-ound» دارن!',
    'tion': 'مثل nation, station, action — همه «-tion» دارن!',
    'ness': 'مثل happiness, kindness — همه «-ness» دارن!',
    'ment': 'مثل moment, comment — همه «-ment» دارن!'
  };
  for (const [pattern, desc] of Object.entries(rhymes)) {
    if (w.endsWith(pattern)) {
      tricks.push('🎵 ' + desc);
      break;
    }
  }
  if (tricks.length === 0) {
    tricks.push('💡 سعی کن یه تصویر ذهنی از «' + trans + '» بسازی و به «' + word + '» ربطش بدی.');
  }
  return tricks.join('<br>');
}

// ── Usage tip generator ──
function getUsageTip(word, trans, pos) {
  const tips = [];
  const p = (pos || '').toLowerCase();
  if (p.includes('noun') || p.includes('اسم')) {
    tips.push('📌 این یک اسم است. می‌توانید قبلش «a/an/the» بذارید.');
    tips.push('📌 برای جمع: اگر قاعده‌مند است «-s/-es» اضافه کنید.');
  } else if (p.includes('verb') || p.includes('فعل')) {
    tips.push('📌 این یک فعل است. به زمان‌های مختلف صرف می‌شود.');
    tips.push('📌 حواش بهقاعده بودن یا نبودن ( irregular ) باشید.');
  } else if (p.includes('adj') || p.includes('صفت')) {
    tips.push('📌 این یک صفت است. قبل از اسم می‌آید: «a ' + word + ' person»');
    tips.push('📌 درجه تفضیلی: «more ' + word + '» یا «-er» (اگر کوتاه باشد)');
  } else if (p.includes('adv') || p.includes('قید')) {
    tips.push('📌 این یک قید است. فعل را توصیف می‌کند.');
    tips.push('📌 معمولاً «-ly» دارد و بعد از فعل می‌آید.');
  }
  // Collocation hint
  if (word.length <= 6) {
    tips.push('📌 این کلمه پرکاربرد است — سعی کنید در جمله‌های روزمره استفاده‌اش کنید.');
  }
  // Context tip
  tips.push('📌 یک جمله با «' + word + '» بسازید و بلند بخوانید تا بهتر در ذهنتان بماند.');
  if (tips.length === 0) {
    tips.push('📌 سعی کنید این کلمه را در مکالمه روزمره استفاده کنید.');
  }
  return tips.join('<br>');
}

// ── Quiz generator ──
function generateWordQuiz(w) {
  const quiz = [];
  const word = w.word;
  const trans = w.translation || '';
  const synonyms = w.synonyms || [];
  const antonyms = w.antonyms || [];
  const allWords = [...(S.words || []),...(S.longTerm || [])].filter(x => x.word !== word && x.translation);

  // Helper: pick random items from array
  function pick(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  // Q1: What does this word mean?
  if (trans) {
    const wrongOptions = pick(allWords.map(x => x.translation), 3);
    if (wrongOptions.length >= 3) {
      const options = [trans, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(trans);
      quiz.push({
        question: 'معنی کلمه «' + word + '» چیست؟',
        options: options,
        correct: correctIdx,
        explanation: '«' + word + '» یعنی «' + trans + '»'
      });
    }
  }

  // Q2: Which word means X?
  if (trans) {
    const wrongWords = pick(allWords.map(x => x.word), 3);
    if (wrongWords.length >= 3) {
      const options = [word, ...wrongWords].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(word);
      quiz.push({
        question: 'کدام کلمه به معنی «' + trans + '» است؟',
        options: options,
        correct: correctIdx,
        explanation: '«' + trans + '» معادل «' + word + '» است.'
      });
    }
  }

  // Q3: Synonym question
  if (synonyms.length > 0) {
    const correctSyn = synonyms[0];
    const wrongOptions = pick(allWords.map(x => x.word).filter(x => !synonyms.includes(x)), 3);
    if (wrongOptions.length >= 3) {
      const options = [correctSyn, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(correctSyn);
      quiz.push({
        question: 'کدام گزینه مترادف «' + word + '» است؟',
        options: options,
        correct: correctIdx,
        explanation: 'مترادف «' + word + '» = «' + correctSyn + '»'
      });
    }
  }

  // Q4: Antonym question
  if (antonyms.length > 0) {
    const correctAnt = antonyms[0];
    const wrongOptions = pick(allWords.map(x => x.word).filter(x => !antonyms.includes(x) && x !== word), 3);
    if (wrongOptions.length >= 3) {
      const options = [correctAnt, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(correctAnt);
      quiz.push({
        question: 'کدام گزینه متضاد «' + word + '» است؟',
        options: options,
        correct: correctIdx,
        explanation: 'متضاد «' + word + '» = «' + correctAnt + '»'
      });
    }
  }

  // If we don't have enough questions, add a fill-in-the-blank style
  if (quiz.length < 2 && trans) {
    const wrongOptions = pick(allWords.map(x => x.translation), 3);
    if (wrongOptions.length >= 3) {
      const options = [trans, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(trans);
      quiz.push({
        question: '«' + word + '» در کدام گزینه درست به کار رفته؟',
        options: options.map((t, i) => 'گزینه ' + (i + 1) + ': ' + t),
        correct: correctIdx,
        explanation: 'معنی صحیح «' + word + '» = «' + trans + '»'
      });
    }
  }

  // Ensure at least 1 question
  if (quiz.length === 0) {
    quiz.push({
      question: 'آیا معنی «' + word + '» را می‌دانید؟',
      options: ['بله، می‌دانم', 'خیر، نمی‌دانم', 'تا حدودی', 'نیاز به مرور دارم'],
      correct: 0,
      explanation: '«' + word + '» یعنی «' + trans + '» — بهتر است دوباره مرور کنید.'
    });
  }

  return quiz;
}

// ═══════════════════════════════════════════
// SPEED REVIEW — مرور سریع تایم‌دار
// ═══════════════════════════════════════════
let speedState={queue:[],idx:0,correct:0,wrong:0,done:false,timer:null,secondsLeft:5,totalTime:5,skipped:0};
function renderSpeedReview(c){
  // Always clear existing timer first to prevent duplicates
  if(speedState.timer){clearInterval(speedState.timer);speedState.timer=null}
  // Guard: only render if we're actually on speed review tab
  if(currentTab!=='speedreview')return;
  const due=getDue();
  if(speedState.done){
    const acc=speedState.queue.length?Math.round(speedState.correct/speedState.queue.length*100):0;
    c.innerHTML=`<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">⚡ پایان مرور سریع</h3><div class="stat-grid"><div class="stat-card"><div class="val">${speedState.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${speedState.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${speedState.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div></div><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="btn btn-primary" type="button" onclick="speedState={queue:[],idx:0,correct:0,wrong:0,done:false,timer:null,secondsLeft:5,totalTime:5,skipped:0};renderSpeedReview(document.getElementById('content'))">🔄 تلاش مجدد</button><button class="btn btn-ghost" type="button" onclick="currentTab='review';render()">بازگشت به مرور</button></div></div>`;
    return;
  }
  if(!speedState.queue.length){
    if(!due.length){c.innerHTML=`<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">⚡</div><p>کارتی برای مرور سریع نیست</p><p style="font-size:.8rem;margin-top:8px;color:var(--text2)">ابتدا کلماتی اضافه کنید یا منتظر مرور بعدی باشید</p></div></div>`;return}
    speedState.queue=due.slice(0,Math.min(20,due.length));
    speedState.idx=0;speedState.correct=0;speedState.wrong=0;speedState.done=false;
  }
  if(speedState.idx>=speedState.queue.length){speedState.done=true;renderSpeedReview(c);return}
  const w=speedState.queue[speedState.idx];
  const prog=Math.round((speedState.idx/speedState.queue.length)*100);
  // Build 4 options
  const allWords=[...S.words,...S.longTerm].filter(x=>x.id!==w.id&&x.translation);
  const wrongOpts=allWords.sort(()=>Math.random()-0.5).slice(0,3).map(x=>x.translation);
  const options=[w.translation,...wrongOpts].sort(()=>Math.random()-0.5);
  const correctIdx=options.indexOf(w.translation);
  c.innerHTML=`<div style="max-width:500px;margin:0 auto">
    <div class="flex" style="justify-content:space-between;margin-bottom:12px">
      <span style="color:var(--text2)">${speedState.idx+1} از ${speedState.queue.length}</span>
      <div class="flex" style="gap:8px;align-items:center">
        <span style="color:var(--success);font-size:.85rem">✅ ${speedState.correct}</span>
        <span style="color:var(--danger);font-size:.85rem">❌ ${speedState.wrong}</span>
      </div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>
    <div id="speedTimer" style="text-align:center;font-size:2rem;font-weight:800;margin:16px 0;color:var(--accent)">${speedState.totalTime}</div>
    <div class="card" style="text-align:center;margin-bottom:16px">
      <div style="font-size:1.8rem;font-weight:700;margin-bottom:16px">${esc(w.word)}</div>
      <div style="display:grid;gap:8px">
        ${options.map((opt,i)=>`<button type="button" class="speed-opt" data-idx="${i}" style="padding:14px;border-radius:12px;border:2px solid var(--border);background:var(--card);color:var(--text);font:inherit;font-size:.95rem;cursor:pointer;transition:all .2s">${esc(opt)}</button>`).join('')}
      </div>
    </div>
  </div>`;
  // Timer
  speedState.secondsLeft=speedState.totalTime;
  const timerEl=document.getElementById('speedTimer');
  if(speedState.timer)clearInterval(speedState.timer);
  speedState.timer=setInterval(()=>{
    speedState.secondsLeft--;
    if(timerEl)timerEl.textContent=speedState.secondsLeft;
    if(timerEl)timerEl.style.color=speedState.secondsLeft<=2?'var(--danger)':'var(--accent)';
    if(speedState.secondsLeft<=0){
      clearInterval(speedState.timer);speedState.timer=null;
      // Auto-fail
      speedState.wrong++;
      const _sf=findCardById(w.id);if(_sf)fsrsNext(_sf,1);
      S.stats.reviewed++;S.stats.wrong++;
      const dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};S.stats.history[dk].reviewed++;S.stats.history[dk].wrong++;
      save();
      // Highlight correct
      document.querySelectorAll('.speed-opt').forEach(b=>{
        if(parseInt(b.dataset.idx)===correctIdx){b.style.background='var(--success)';b.style.color='#fff';b.style.borderColor='var(--success)'}
        b.disabled=true;
      });
      setTimeout(()=>{speedState.idx++;renderSpeedReview(c)},800);
    }
  },1000);
  // Option click
  document.querySelectorAll('.speed-opt').forEach(btn=>{
    btn.onclick=()=>{
      if(speedState.timer){clearInterval(speedState.timer);speedState.timer=null}
      const oi=parseInt(btn.dataset.idx);
      const isCorrect=oi===correctIdx;
      if(isCorrect){
        btn.style.background='var(--success)';btn.style.color='#fff';btn.style.borderColor='var(--success)';
        speedState.correct++;
        const _sc=findCardById(w.id);if(_sc)fsrsNext(_sc,4);
        S.stats.reviewed++;S.stats.correct++;S.stats.xp+=5;
      }else{
        btn.style.background='var(--danger)';btn.style.color='#fff';btn.style.borderColor='var(--danger)';
        const correctBtn=document.querySelector(`.speed-opt[data-idx="${correctIdx}"]`);
        if(correctBtn){correctBtn.style.background='var(--success)';correctBtn.style.color='#fff';correctBtn.style.borderColor='var(--success)'}
        speedState.wrong++;
        const _sw=findCardById(w.id);if(_sw)fsrsNext(_sw,1);
        S.stats.reviewed++;S.stats.wrong++;
      }
      const dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};S.stats.history[dk].reviewed++;if(isCorrect)S.stats.history[dk].correct++;else S.stats.history[dk].wrong++;
      save();
      document.querySelectorAll('.speed-opt').forEach(b=>b.disabled=true);
      setTimeout(()=>{speedState.idx++;renderSpeedReview(c)},600);
    };
  });
}

// ═══════════════════════════════════════════
// LISTENING MODE — تمرین شنیداری
// ═══════════════════════════════════════════
let listenState={queue:[],idx:0,correct:0,wrong:0,done:false,revealed:false};
function renderListening(c){
  const due=getDue();
  if(listenState.done){
    const acc=listenState.queue.length?Math.round(listenState.correct/listenState.queue.length*100):0;
    c.innerHTML=`<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">🎧 پایان تمرین شنیداری</h3><div class="stat-grid"><div class="stat-card"><div class="val">${listenState.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${listenState.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${listenState.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div></div><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="btn btn-primary" type="button" onclick="listenState={queue:[],idx:0,correct:0,wrong:0,done:false,revealed:false};renderListening(document.getElementById('content'))">🔄 تلاش مجدد</button><button class="btn btn-ghost" type="button" onclick="currentTab='review';render()">بازگشت</button></div></div>`;
    return;
  }
  if(!listenState.queue.length){
    const pool=[...S.words,...S.longTerm];
    if(!pool.length){c.innerHTML=`<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">🎧</div><p>کلمه‌ای برای تمرین شنیداری نیست</p></div></div>`;return}
    listenState.queue=pool.sort(()=>Math.random()-0.5).slice(0,Math.min(15,pool.length));
    listenState.idx=0;listenState.correct=0;listenState.wrong=0;listenState.done=false;
  }
  if(listenState.idx>=listenState.queue.length){listenState.done=true;renderListening(c);return}
  const w=listenState.queue[listenState.idx];
  const prog=Math.round((listenState.idx/listenState.queue.length)*100);
  c.innerHTML=`<div style="max-width:500px;margin:0 auto">
    <div class="flex" style="justify-content:space-between;margin-bottom:12px">
      <span style="color:var(--text2)">${listenState.idx+1} از ${listenState.queue.length}</span>
      <div class="flex" style="gap:8px">
        <span style="color:var(--success);font-size:.85rem">✅ ${listenState.correct}</span>
        <span style="color:var(--danger);font-size:.85rem">❌ ${listenState.wrong}</span>
      </div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>
    <div class="card" style="text-align:center;padding:40px">
      <button type="button" class="btn btn-primary" id="listenPlayBtn" style="font-size:2rem;padding:20px 40px;border-radius:20px;margin-bottom:20px">🔊 گوش بده</button>
      <div style="margin-bottom:16px">
        <input type="text" class="input" id="listenInput" placeholder="بنویس چی شنیدی..." style="max-width:300px;font-size:1.1rem;text-align:center;direction:ltr" autocomplete="off" autocapitalize="off" spellcheck="false">
      </div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn btn-success" id="listenCheckBtn">بررسی ✓</button>
        <button type="button" class="btn btn-ghost" id="listenSkipBtn">رد شدن →</button>
        <button type="button" class="btn btn-ghost" id="listenShowBtn">نمایش جواب 👁</button>
      </div>
      <div id="listenFeedback" style="margin-top:16px;display:none"></div>
    </div>
  </div>`;
  const input=document.getElementById('listenInput');
  const playBtn=document.getElementById('listenPlayBtn');
  const feedback=document.getElementById('listenFeedback');
  // Play audio
  function playWord(){speakWord(w.word)}
  playBtn.onclick=playWord;
  setTimeout(playWord,300);
  input.focus();
  // Check
  document.getElementById('listenCheckBtn').onclick=()=>{
    const userAnswer=input.value.trim().toLowerCase();
    const correct=w.word.toLowerCase();
    const isCorrect=userAnswer===correct;
    listenState.revealed=true;
    if(isCorrect){
      listenState.correct++;
      feedback.style.display='block';
      feedback.innerHTML='<div style="color:var(--success);font-size:1.1rem;font-weight:700">✅ درست! «'+esc(w.word)+'» = '+esc(w.translation)+'</div>';
      const _lc=findCardById(w.id);if(_lc)fsrsNext(_lc,5);
      S.stats.reviewed++;S.stats.correct++;S.stats.xp+=8;
    }else{
      listenState.wrong++;
      feedback.style.display='block';
      feedback.innerHTML='<div style="color:var(--danger);font-size:1rem;font-weight:600">❌ نادرست! جواب صحیح: <strong>'+esc(w.word)+'</strong> = '+esc(w.translation)+'</div>';
      const _lw=findCardById(w.id);if(_lw)fsrsNext(_lw,1);
      S.stats.reviewed++;S.stats.wrong++;
    }
    const dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};S.stats.history[dk].reviewed++;if(isCorrect)S.stats.history[dk].correct++;else S.stats.history[dk].wrong++;
    save();
    input.disabled=true;
    setTimeout(()=>{listenState.idx++;listenState.revealed=false;renderListening(c)},1500);
  };
  // Enter key
  input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('listenCheckBtn').click()}};
  // Skip
  document.getElementById('listenSkipBtn').onclick=()=>{
    listenState.idx++;listenState.revealed=false;renderListening(c);
  };
  // Show answer
  document.getElementById('listenShowBtn').onclick=()=>{
    listenState.revealed=true;listenState.wrong++;
    feedback.style.display='block';
    feedback.innerHTML='<div style="color:var(--warning);font-size:1rem">👁 جواب: <strong>'+esc(w.word)+'</strong> = '+esc(w.translation)+'</div>';
    const _ls=findCardById(w.id);if(_ls)fsrsNext(_ls,2);
    S.stats.reviewed++;S.stats.wrong++;
    const dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};S.stats.history[dk].reviewed++;S.stats.history[dk].wrong++;
    save();
    input.disabled=true;
    setTimeout(()=>{listenState.idx++;listenState.revealed=false;renderListening(c)},1500);
  };
}

// ═══════════════════════════════════════════
