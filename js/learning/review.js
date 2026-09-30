// ═══════════════════════════════════════════
// 1. REVIEW (with FSRS + edit in review)
// ═══════════════════════════════════════════
import { openWordDrill } from './word-drill.js';

export const reviewSession={queue:[],idx:0,flipped:false,correct:0,wrong:0,done:false,startTime:0};
let reviewRatingPending=false;
export function findCardById(id){let c=S.words.find(x=>x.id===id);return c||S.longTerm.find(x=>x.id===id)||null}
// ═══ AUTO-PLAY STATE ═══
export const autoPlayState={active:false,paused:false,timer:null,countdownTimer:null,countdown:0,flipDelay:3000,showDelay:5000,speed:'normal'};
export const AUTO_PLAY_SPEEDS={slow:{flip:4000,show:7000,label:'آهسته'},normal:{flip:3000,show:5000,label:'عادی'},fast:{flip:2000,show:3500,label:'سریع'},turbo:{flip:1200,show:2500,label:'خیلی سریع'}};
export function stopAutoPlay(){autoPlayState.active=false;autoPlayState.paused=false;if(autoPlayState.timer){clearTimeout(autoPlayState.timer);autoPlayState.timer=null}if(autoPlayState.countdownTimer){clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=null}autoPlayState.countdown=0;var bar=document.getElementById('autoPlayBar');if(bar)bar.remove();var ratingBar=document.getElementById('ratingBar');if(ratingBar)ratingBar.style.display='none'}
export function startAutoPlay(){if(!reviewSession.queue.length)return;if(reviewSession.done){reviewSession.done=false;reviewSession.idx=0;reviewSession.correct=0;reviewSession.wrong=0;reviewSession.startTime=Date.now()}autoPlayState.active=true;autoPlayState.paused=false;var sp=AUTO_PLAY_SPEEDS[autoPlayState.speed]||AUTO_PLAY_SPEEDS.normal;autoPlayState.flipDelay=sp.flip;autoPlayState.showDelay=sp.show;renderReview(document.getElementById('content'))}
export function autoPlayTick(){if(!autoPlayState.active||autoPlayState.paused)return;var c=document.getElementById('content');if(!reviewSession.flipped){reviewSession.flipped=true;var card=document.getElementById('rCard');if(card)card.classList.add('flipped');var rb=document.getElementById('ratingBar');if(rb)rb.style.display='none';autoPlayScheduleNext(autoPlayState.showDelay)}else{reviewSession.idx++;reviewSession.flipped=false;if(reviewSession.idx>=reviewSession.queue.length){stopAutoPlay();reviewSession.done=true;renderReview(c);return}renderReview(c)}}
export function autoPlayScheduleNext(delay){if(!autoPlayState.active)return;if(autoPlayState.timer)clearTimeout(autoPlayState.timer);autoPlayState.countdown=Math.ceil(delay/1000);updateAutoPlayCountdown();if(autoPlayState.countdownTimer)clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=setInterval(function(){autoPlayState.countdown--;updateAutoPlayCountdown();if(autoPlayState.countdown<=0){clearInterval(autoPlayState.countdownTimer);autoPlayState.countdownTimer=null}},1000);autoPlayState.timer=setTimeout(function(){autoPlayTick()},delay)}
export function updateAutoPlayCountdown(){var el=document.getElementById('apCountdown');if(el)el.textContent=autoPlayState.countdown>0?autoPlayState.countdown+'s':''}
export function renderAutoPlayBar(){return'<div class="auto-play-bar" id="autoPlayBar"><div class="auto-play-label"><div class="auto-play-dot"></div>پخش خودکار</div><button type="button" class="btn btn-ghost btn-sm" id="apPauseBtn" title="مکث/ادامه">'+(autoPlayState.paused?'▶️':'⏸️')+'</button><button type="button" class="btn btn-danger btn-sm" id="apStopBtn" title="توقف">⏹️</button><div class="auto-play-speed"><span>سرعت:</span><select id="apSpeedSelect"><option value="slow"'+(autoPlayState.speed==='slow'?' selected':'')+'>آهسته</option><option value="normal"'+(autoPlayState.speed==='normal'?' selected':'')+'>عادی</option><option value="fast"'+(autoPlayState.speed==='fast'?' selected':'')+'>سریع</option><option value="turbo"'+(autoPlayState.speed==='turbo'?' selected':'')+'>خیلی سریع</option></select></div><div class="auto-play-timer" id="apCountdown"></div></div>'}
export function getDue(){return S.words.filter(w=>!w.nextReviewDate||new Date(w.nextReviewDate)<=new Date())}
export const dueCards=getDue;
export function getDueAll(){return[...S.words,...S.longTerm].filter(w=>!w.nextReviewDate||new Date(w.nextReviewDate)<=new Date())}
export function prioritizeReviewQueue(cards){
  const now=Date.now();
  const stateOrder={relearning:0,learning:1,review:2,new:3};
  return [...cards].sort((a,b)=>{
    const sa=stateOrder[a.fsrsState||'new']??3;
    const sb=stateOrder[b.fsrsState||'new']??3;
    if(sa!==sb)return sa-sb;
    // Overdue days (more overdue first)
    const dueA=a.nextReviewDate?Math.max(0,(now-new Date(a.nextReviewDate).getTime())/MS_PER_DAY):0;
    const dueB=b.nextReviewDate?Math.max(0,(now-new Date(b.nextReviewDate).getTime())/MS_PER_DAY):0;
    if(Math.abs(dueB-dueA)>0.5)return dueB-dueA;
    // Lower stability (more fragile memory) first
    const stabA=Number(a.stability)||0;
    const stabB=Number(b.stability)||0;
    if(Math.abs(stabA-stabB)>0.2)return stabA-stabB;
    // Higher lapses/difficulty first
    const diffA=(Number(a.lapses)||0)*2+(Number(a.difficulty)||0);
    const diffB=(Number(b.lapses)||0)*2+(Number(b.difficulty)||0);
    if(diffB!==diffA)return diffB-diffA;
    // For new cards, prioritize higher frequency words (tier 1 > 2 > 3 > 0)
    const tierA=typeof getFrequencyTier==='function'?(getFrequencyTier(a.word)||99):99;
    const tierB=typeof getFrequencyTier==='function'?(getFrequencyTier(b.word)||99):99;
    return tierA-tierB;
  });
}
export function startReview(){
const due=getDue();
if(!due.length){toast('هیچ کارتی برای مرور نیست','info');return}
Object.assign(reviewSession,{queue:prioritizeReviewQueue(due),idx:0,flipped:false,correct:0,wrong:0,done:false,startTime:Date.now()});
renderReview(document.getElementById('content'))}
export function renderReview(c){
if(reviewSession.done){
const acc=reviewSession.queue.length?Math.round(reviewSession.correct/reviewSession.queue.length*100):0;
const elapsed=reviewSession.startTime?Date.now()-reviewSession.startTime:0;
const elapsedMin=Math.floor(elapsed/60000);
const elapsedSec=Math.floor((elapsed%60000)/1000);
const timeStr=elapsedMin>0?elapsedMin+' دقیقه و '+elapsedSec+' ثانیه':elapsedSec+' ثانیه';
const avgPerCard=reviewSession.queue.length>0?Math.round(elapsed/reviewSession.queue.length/1000):0;
c.innerHTML=`<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">پایان مرور</h3><div class="stat-grid"><div class="stat-card"><div class="val">${reviewSession.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${reviewSession.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${reviewSession.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div><div class="stat-card"><div class="val" style="font-size:1.2rem">⏱️ ${timeStr}</div><div class="lbl">زمان کل</div></div><div class="stat-card"><div class="val">${avgPerCard}s</div><div class="lbl">میانگین/کارت</div></div></div><button class="btn btn-primary" type="button" id="reviewRestart">مرور مجدد</button></div>`;
document.getElementById('reviewRestart').onclick=()=>{Object.assign(reviewSession,{queue:[],idx:0,flipped:false,correct:0,wrong:0,done:false});startReview()};return}
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
c.innerHTML=`<div style="max-width:500px;margin:0 auto">${autoPlayBarHtml}${autoPlayStartBtn}<div class="flex" style="justify-content:space-between;margin-bottom:16px"><span style="color:var(--text2)">${reviewSession.idx+1} از ${reviewSession.queue.length}</span><div class="flex" style="gap:4px"><span class="badge badge-accent">${w.box>0?'جعبه '+w.box:'جدید'}</span>${tier?`<span class="badge tier-${tier}">${tierLabel(tier)}</span>`:''}</div></div><div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>${reviewSearchHtml}<div class="review-card" id="rCard" tabindex="0" role="button" aria-label="کارت مرور — برای نمایش پاسخ کلیک یا Enter بزنید" aria-live="polite"><div class="review-inner"><div class="review-face"><div style="font-size:1.8rem;font-weight:700;margin-bottom:12px">${esc(w.word)} <button type="button" class="trans-audio-btn" id="reviewSpeakBtn" title="شنیدن تلفظ (S)" style="vertical-align:middle;font-size:1rem">🔊</button></div>${(S.settings.cardTemplate||{}).showIpa!==false&&w.ipa?`<div style="color:var(--text2);font-size:.9rem">${esc(w.ipa)}</div>`:''}<div style="color:var(--text2);font-size:.8rem;margin-top:16px">برای نمایش پاسخ کلیک کنید <kbd style="font-size:.65rem;opacity:.7;padding:1px 5px;border:1px solid var(--border);border-radius:4px">Space</kbd></div></div><div class="review-face review-back" style="justify-content:flex-start;padding-top:20px;overflow-y:auto;max-height:100%"><div class="rb-header"><span class="rb-word">${esc(w.word)}</span>${w.ipa?`<span class="rb-ipa">${esc(w.ipa)}</span>`:''}${w.partOfSpeech?`<span class="rb-pos">${esc(w.partOfSpeech)}</span>`:''}${tier?`<span class="badge tier-${tier}" style="font-size:.6rem">${tierLabel(tier)}</span>`:''}</div><div class="rb-translation">${esc(w.translation)}</div>${w.category&&w.category!=='پیش‌فرض'?`<div style="text-align:center;margin-bottom:12px"><span class="tag">${esc(w.category)}</span></div>`:''}${backHtml}<div class="rb-dialects" style="margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><span style="color:var(--text2);font-size:.72rem;align-self:center">تلفظ:</span><button type="button" class="btn btn-ghost btn-sm" data-dialect="us" style="font-size:.72rem;padding:4px 10px">🇺🇸 US</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="uk" style="font-size:.72rem;padding:4px 10px">🇬🇧 UK</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="au" style="font-size:.72rem;padding:4px 10px">🇦🇺 AU</button><button type="button" class="btn btn-ghost btn-sm" data-dialect="in" style="font-size:.72rem;padding:4px 10px">🇮🇳 IN</button></div><div style="margin-top:12px;gap:6px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" id="reviewEnrichBtn" style="font-size:.75rem">🔍 غنی‌سازی سریع</button><button type="button" class="btn btn-ghost btn-sm" id="reviewTransBtn" style="font-size:.75rem">🌐 ترجمه</button><button type="button" class="btn btn-ghost btn-sm" id="reviewEditBtn" style="font-size:.75rem">✏️ ویرایش</button></div></div></div></div><div class="rating-bar" id="ratingBar" style="display:none"><button type="button" class="btn btn-danger btn-sm" data-rate="1">❌ نادرست <kbd style="font-size:.6rem;opacity:.6">۱</kbd></button><button type="button" class="btn btn-ghost btn-sm" data-rate="3">😐 سخت <kbd style="font-size:.6rem;opacity:.6">۲</kbd></button><button type="button" class="btn btn-primary btn-sm" data-rate="4">🙂 خوب <kbd style="font-size:.6rem;opacity:.6">۳</kbd></button><button type="button" class="btn btn-success btn-sm" data-rate="5">😄 عالی <kbd style="font-size:.6rem;opacity:.6">۴</kbd></button></div><div style="text-align:center;margin-top:12px"><button type="button" class="btn btn-ghost btn-sm" id="wordDrillBtn" style="font-size:.8rem;gap:6px">📚 تمرین و توضیح کلمه <kbd style="font-size:.6rem;opacity:.6">D</kbd></button></div><div style="text-align:center;margin-top:8px;font-size:.7rem;color:var(--text2);opacity:.75">میانبرها: <kbd>Space</kbd> برگرداندن · <kbd>۱-۴</kbd> امتیاز · <kbd>S</kbd> تلفظ · <kbd>D</kbd> تمرین · <kbd>E</kbd> ویرایش · <kbd>←/→</kbd> جابجایی</div></div>`;
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
export function rateReview(q){
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
export function reviewKeyHandler(e){
if(autoPlayState.active)return;
if(currentTab!=='review'||reviewSession.done||!reviewSession.queue.length)return;
if(document.querySelector('.modal-overlay'))return;
const tag=e.target&&e.target.tagName;
if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(e.target&&e.target.isContentEditable))return;
if(e.ctrlKey||e.altKey||e.metaKey)return;
const w=reviewSession.queue[reviewSession.idx];
if((e.key===' '||e.key==='Enter')&&reviewSession.flipped===false){
  e.preventDefault();
  const card=document.getElementById('rCard');
  if(card){reviewSession.flipped=true;card.classList.add('flipped');const rb=document.getElementById('ratingBar');if(rb)rb.style.display='flex'}
  return;
}
if(reviewSession.flipped&&!reviewRatingPending){
  const map={'1':1,'2':3,'3':4,'4':5,'۱':1,'۲':3,'۳':4,'۴':5};
  if(map[e.key]){e.preventDefault();rateReview(map[e.key]);return}
}
if(w&&(e.key==='s'||e.key==='S'||e.key==='س')){
  e.preventDefault();speakWord(w.word);return;
}
if(w&&(e.key==='d'||e.key==='D'||e.key==='ی')){
  e.preventDefault();openWordDrill(w);return;
}
if(w&&reviewSession.flipped&&(e.key==='e'||e.key==='E'||e.key==='ث')){
  e.preventDefault();if(typeof editWord==='function')editWord(w.id,()=>renderReview(document.getElementById('content')));return;
}
if(e.key==='ArrowLeft'&&reviewSession.idx<reviewSession.queue.length-1){
  e.preventDefault();reviewSession.idx++;reviewSession.flipped=false;renderReview(document.getElementById('content'));return;
}
if(e.key==='ArrowRight'&&reviewSession.idx>0){
  e.preventDefault();reviewSession.idx--;reviewSession.flipped=false;renderReview(document.getElementById('content'));return;
}
}
