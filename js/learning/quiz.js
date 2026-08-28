// 8. QUIZ (with card types)
// ═══════════════════════════════════════════
let quizState={card:null,options:[],answered:false,selected:-1,timer:null,quizText:''};
let quizCorrect=0,quizWrong=0;
let quizHistory=[];
let quizMode='mcq';// mcq,fill,reverse,listen,antonym,sentfill,spell,defmatch
let quizSessionStreak=0;

// ═══════════════════════════════════════════
// QUIZ PERSISTENCE HELPERS
// ═══════════════════════════════════════════
function initQuizSession(){
  if(!S.quizStats)S.quizStats={sessions:[],totalCorrect:0,totalWrong:0,wordPerformance:{},currentSession:null};
  if(!S.quizStats.currentSession){
    S.quizStats.currentSession={correct:0,wrong:0,mode:quizMode,startTime:new Date().toISOString(),words:[]};
    save();
  }
}
function finalizeQuizSession(){
  if(!S.quizStats||!S.quizStats.currentSession)return;
  const cs=S.quizStats.currentSession;
  if(cs.correct>0||cs.wrong>0){
    S.quizStats.sessions.push({date:new Date().toISOString(),correct:cs.correct,wrong:cs.wrong,mode:cs.mode,duration:Date.now()-new Date(cs.startTime).getTime()});
    if(S.quizStats.sessions.length>50)S.quizStats.sessions=S.quizStats.sessions.slice(-50);
    S.quizStats.totalCorrect+=cs.correct;
    S.quizStats.totalWrong+=cs.wrong;
  }
  S.quizStats.currentSession=null;
  save();
}
function updateQuizWordPerformance(wordId,isCorrect){
  if(!S.quizStats)return;
  if(!S.quizStats.wordPerformance[wordId])S.quizStats.wordPerformance[wordId]={correct:0,wrong:0,lastSeen:null,streak:0,confusedWith:{}};
  const wp=S.quizStats.wordPerformance[wordId];
  if(isCorrect){wp.correct++;wp.streak=Math.max(0,wp.streak)+1}
  else{wp.wrong++;wp.streak=Math.min(0,wp.streak)-1}
  wp.lastSeen=new Date().toISOString();
}

// ═══════════════════════════════════════════
// CONFUSION PAIRS TRACKING
// ═══════════════════════════════════════════
function recordConfusion(correctId,wrongId){
  if(!S.quizStats||!S.quizStats.wordPerformance)return;
  if(!S.quizStats.wordPerformance[correctId])S.quizStats.wordPerformance[correctId]={correct:0,wrong:0,lastSeen:null,streak:0,confusedWith:{}};
  const cw=S.quizStats.wordPerformance[correctId].confusedWith;
  cw[wrongId]=(cw[wrongId]||0)+1;
}
function getConfusionPartners(wordId){
  if(!S.quizStats||!S.quizStats.wordPerformance||!S.quizStats.wordPerformance[wordId])return[];
  const cw=S.quizStats.wordPerformance[wordId].confusedWith;
  if(!cw)return[];
  return Object.entries(cw).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
}

// ═══════════════════════════════════════════
// SESSION-AWARE SCHEDULING
// ═══════════════════════════════════════════
let _quizSessionWrongCount={}; // wordId -> wrong count in current session
let _quizSessionSkipUntil={};  // wordId -> skip until question N
let _quizQuestionNum=0;

function shouldSkipInSession(wordId){
  const skipUntil=_quizSessionSkipUntil[wordId];
  if(skipUntil&&_quizQuestionNum<skipUntil)return true;
  const wrongCount=_quizSessionWrongCount[wordId]||0;
  if(wrongCount>=3){
    _quizSessionSkipUntil[wordId]=_quizQuestionNum+5; // skip next 5 questions
    return true;
  }
  return false;
}
function recordSessionAnswer(wordId,isCorrect){
  if(!isCorrect){
    _quizSessionWrongCount[wordId]=(_quizSessionWrongCount[wordId]||0)+1;
  }
}

// ═══════════════════════════════════════════
// WORD STRENGTH & ADAPTIVE DIFFICULTY
// ═══════════════════════════════════════════
function getWordStrength(w){
  const stabilityScore=Math.min((w.stability||0)/60,1);
  const quizPerf=S.quizStats&&S.quizStats.wordPerformance?S.quizStats.wordPerformance[w.id]:null;
  let quizScore=0.5;
  if(quizPerf){const total=quizPerf.correct+quizPerf.wrong;if(total>0)quizScore=quizPerf.correct/total}
  const difficultyScore=1-((w.difficulty||0)/10);
  return stabilityScore*0.4+quizScore*0.4+difficultyScore*0.2;
}

// ═══════════════════════════════════════════
// QUIZ RENDERER
// ═══════════════════════════════════════════
function renderQuiz(c){
initQuizSession();
const valid=S.words.filter(w=>w.translation&&w.translation.trim());
if(valid.length<4){if(quizState.timer){clearTimeout(quizState.timer);quizState.timer=null}c.innerHTML=`<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">❓</div><p>برای آزمون حداقل ۴ کلمه با ترجمه لازم است</p><p style="color:var(--text2);font-size:.85rem;margin-top:8px">منبع فعلی: ${valid.length} کلمه معتبر</p></div></div>`;return}
if(!quizState.card)genQuiz();
const q=quizState.card;

// Quiz type selector (8 modes)
const typeBar=`<div class="quiz-type-bar" style="flex-wrap:wrap;gap:4px"><button type="button" class="btn btn-sm ${quizMode==='mcq'?'btn-primary':''}" data-qmode="mcq">چندگزینه‌ای</button><button type="button" class="btn btn-sm ${quizMode==='fill'?'btn-primary':''}" data-qmode="fill">تکمیلی</button><button type="button" class="btn btn-sm ${quizMode==='reverse'?'btn-primary':''}" data-qmode="reverse">معکوس</button><button type="button" class="btn btn-sm ${quizMode==='listen'?'btn-primary':''}" data-qmode="listen">شنیداری</button><button type="button" class="btn btn-sm ${quizMode==='antonym'?'btn-primary':''}" data-qmode="antonym">متضاد</button><button type="button" class="btn btn-sm ${quizMode==='sentfill'?'btn-primary':''}" data-qmode="sentfill">جمله</button><button type="button" class="btn btn-sm ${quizMode==='spell'?'btn-primary':''}" data-qmode="spell">املایی</button><button type="button" class="btn btn-sm ${quizMode==='defmatch'?'btn-primary':''}" data-qmode="defmatch">تعریف</button><button type="button" class="btn btn-sm ${quizMode==='speed'?'btn-danger':''}" data-qmode="speed">⚡ مرور سریع</button></div>`;

let questionHtml='';
if(quizMode==='mcq'){
  questionHtml=`<div style="font-size:1.6rem;font-weight:700">${esc(q.word)}</div></div><div id="quizContainer" style="display:grid;gap:10px">${quizState.options.map((o,i)=>{let cls='btn btn-ghost quiz-option';let st='';if(quizState.answered){if(i===quizState.selected){cls+=o===q.translation?' correct':' wrong'}else if(o===q.translation){cls+=' correct';st='opacity:.7'}}return`<button type="button" class="${cls}" data-qi="${i}" style="justify-content:center;${st}" ${quizState.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
}else if(quizMode==='fill'){
  questionHtml=`<div style="font-size:1.6rem;font-weight:700;margin-bottom:16px">${esc(q.word)}</div><input type="text" class="quiz-input" id="quizFillInput" placeholder="ترجمه را تایپ کنید..." ${quizState.answered?'disabled':''}><div style="display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" id="quizSubmitBtn" ${quizState.answered?'disabled':''}>✓ تایید پاسخ</button></div><div id="quizFillFeedback" style="margin-top:12px" aria-live="assertive" role="alert"></div></div>`;
}else if(quizMode==='reverse'){
  questionHtml=`<div style="font-size:1.3rem;font-weight:700;color:var(--accent);margin-bottom:8px">${esc(q.translation)}</div><div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">کدام کلمه انگلیسی است؟</div></div><div id="quizContainer" style="display:grid;gap:10px">${quizState.options.map((o,i)=>{let cls='btn btn-ghost quiz-option';let st='';if(quizState.answered){if(i===quizState.selected){cls+=o===q.word?' correct':' wrong'}else if(o===q.word){cls+=' correct';st='opacity:.7'}}return`<button type="button" class="${cls}" data-qi="${i}" style="justify-content:center;${st}" ${quizState.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
}else if(quizMode==='listen'){
  questionHtml=`<button type="button" class="btn btn-ghost" id="quizListenBtn" style="font-size:2rem;margin-bottom:16px">🔊</button><div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">آنچه می‌شنوید را تایپ کنید</div><input type="text" class="quiz-input" id="quizFillInput" placeholder="کلمه را تایپ کنید..." ${quizState.answered?'disabled':''}><div style="display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" id="quizSubmitBtn" ${quizState.answered?'disabled':''}>✓ تایید پاسخ</button></div><div id="quizFillFeedback" style="margin-top:12px" aria-live="assertive" role="alert"></div></div>`;
}else if(quizMode==='antonym'){
  questionHtml=`<div style="font-size:1.2rem;color:var(--text2);margin-bottom:8px">کدام کلمه متضاد <strong style="color:var(--accent)">${esc(q.word)}</strong> است؟</div></div><div id="quizContainer" style="display:grid;gap:10px">${quizState.options.map((o,i)=>{let cls='btn btn-ghost quiz-option';let st='';if(quizState.answered){if(i===quizState.selected){cls+=o===quizState.quizText?' correct':' wrong'}else if(o===quizState.quizText){cls+=' correct';st='opacity:.7'}}return`<button type="button" class="${cls}" data-qi="${i}" style="justify-content:center;${st}" ${quizState.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
}else if(quizMode==='sentfill'){
  questionHtml=`<div style="font-size:1rem;line-height:1.8;margin-bottom:16px">${esc(quizState.quizText||'')}</div><input type="text" class="quiz-input" id="quizFillInput" placeholder="کلمه مناسب را تایپ کنید..." ${quizState.answered?'disabled':''}><div style="display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" id="quizSubmitBtn" ${quizState.answered?'disabled':''}>✓ تایید پاسخ</button></div><div id="quizFillFeedback" style="margin-top:12px" aria-live="assertive" role="alert"></div></div>`;
}else if(quizMode==='spell'){
  const scrambled=q.word.split('').sort(()=>Math.random()-.5).join('');
  questionHtml=`<button type="button" class="btn btn-ghost" id="quizListenBtn" style="font-size:2rem;margin-bottom:8px">🔊</button><div style="font-size:.85rem;color:var(--text2);margin-bottom:4px">ترجمه: <strong style="color:var(--accent)">${esc(q.translation)}</strong></div><div style="font-size:1.1rem;letter-spacing:4px;margin-bottom:16px;color:var(--text2);font-weight:600">${esc(scrambled)}</div><input type="text" class="quiz-input" id="quizFillInput" placeholder="کلمه صحیح را تایپ کنید..." ${quizState.answered?'disabled':''}><div style="display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" id="quizSubmitBtn" ${quizState.answered?'disabled':''}>✓ تایید پاسخ</button></div><div id="quizFillFeedback" style="margin-top:12px" aria-live="assertive" role="alert"></div></div>`;
}else if(quizMode==='defmatch'){
  questionHtml=`<div style="font-size:1rem;line-height:1.8;margin-bottom:16px;color:var(--accent);font-style:italic">${esc(quizState.quizText||q.coreMeaning||q.translation)}</div></div><div id="quizContainer" style="display:grid;gap:10px">${quizState.options.map((o,i)=>{let cls='btn btn-ghost quiz-option';let st='';if(quizState.answered){if(i===quizState.selected){cls+=o===q.word?' correct':' wrong'}else if(o===q.word){cls+=' correct';st='opacity:.7'}}return`<button type="button" class="${cls}" data-qi="${i}" style="justify-content:center;${st}" ${quizState.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
}else if(quizMode==='speed'){
  questionHtml=`<div id="speedTimer" style="font-size:2.2rem;font-weight:800;color:var(--accent);margin-bottom:12px">5</div><div style="font-size:1.6rem;font-weight:700;margin-bottom:16px">${esc(q.word)}</div><div id="quizContainer" style="display:grid;gap:10px">${quizState.options.map((o,i)=>{let cls='btn btn-ghost quiz-option';let st='';if(quizState.answered){if(i===quizState.selected){cls+=o===q.translation?' correct':' wrong'}else if(o===q.translation){cls+=' correct';st='opacity:.7'}}return`<button type="button" class="${cls}" data-qi="${i}" style="justify-content:center;${st}" ${quizState.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
}

// Quiz history display
let historyHtml='';
if(S.quizStats&&S.quizStats.sessions.length>0){
  const recent=S.quizStats.sessions.slice(-5).reverse();
  historyHtml=`<div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:8px;text-align:right"><div style="font-size:.8rem;color:var(--text2);margin-bottom:8px">آخرین نتایج:</div>${recent.map(s=>{const pct=s.correct+s.wrong>0?Math.round(s.correct/(s.correct+s.wrong)*100):0;return`<div style="font-size:.75rem;color:var(--text);margin-bottom:2px">✓ ${s.correct} / ✗ ${s.wrong} (${pct}%) — ${new Date(s.date).toLocaleDateString('fa-IR')}</div>`}).join('')}</div>`;
}

c.innerHTML=`<div style="max-width:500px;margin:0 auto"><div class="card" style="text-align:center;margin-bottom:16px;padding:16px"><div style="color:var(--text2);font-size:.85rem;margin-bottom:8px">${quizMode==='reverse'?'ترجمه کدام کلمه است؟':quizMode==='antonym'?'کدام متضاد است؟':quizMode==='defmatch'?'کدام کلمه با تعریف مطابقت دارد؟':quizMode==='speed'?'⚡ ۵ ثانیه وقت داری!':'ترجمه کدام گزینه درست است؟'}</div>${quizState.card&&quizState.card.word&&isAdaptiveQuiz()?`<div style="font-size:.7rem;color:var(--text2);margin-bottom:6px">سختی: ${quizStrengthLabel(quizState.card)}</div>`:''}${typeBar}<div class="card" style="text-align:center;padding:16px">${questionHtml}</div>${quizState.answered?`<div style="text-align:center;margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" id="quizNext">سوال بعدی</button><button type="button" class="btn btn-ghost" id="quizUndo" style="font-size:.8rem">↩️ لغو پاسخ <span id="undoCountdown" style="color:var(--warning);font-size:.7rem"></span></button></div>`:''}<div style="text-align:center;margin-top:16px;color:var(--text2);font-size:.85rem">آمار: <span style="color:var(--success)">✓ ${quizCorrect}</span> / <span style="color:var(--danger)">✗ ${quizWrong}</span> | منبع: ${valid.length} کلمه</div>${historyHtml}</div>`;

if(quizState.answered){
  const nextBtn=document.getElementById('quizNext');
  if(nextBtn){nextBtn.onclick=()=>{if(quizState.timer){clearTimeout(quizState.timer);quizState.timer=null}if(_quizUndoTimer){clearTimeout(_quizUndoTimer);_quizUndoTimer=null;_quizUndoState=null}genQuiz();renderQuiz(document.getElementById('content'));initQuiz()}};
  // Undo button
  const undoBtn=document.getElementById('quizUndo');
  if(undoBtn){undoBtn.onclick=()=>{if(quizState.timer){clearTimeout(quizState.timer);quizState.timer=null}undoQuizAnswer()}};
  // Countdown timer for undo
  const cdEl=document.getElementById('undoCountdown');
  if(cdEl&&_quizUndoState){
    let remaining=3;
    cdEl.textContent='('+remaining+'s)';
    const cdInterval=setInterval(()=>{
      remaining--;
      if(remaining<=0||!_quizUndoState){clearInterval(cdInterval);if(undoBtn)undoBtn.style.opacity='0.4';if(cdEl)cdEl.textContent='';return}
      cdEl.textContent='('+remaining+'s)';
    },1000);
  }
}

// Bind quiz type selector
c.querySelectorAll('[data-qmode]').forEach(btn=>{
  btn.onclick=()=>{if(quizState._speedInterval){clearInterval(quizState._speedInterval);quizState._speedInterval=null}quizMode=btn.dataset.qmode;quizState={card:null,options:[],answered:false,selected:-1,timer:null,quizText:''};quizSessionStreak=0;renderQuiz(c);initQuiz()}});

// Fill-in-the-blank submit
if(['fill','listen','sentfill','spell'].includes(quizMode)&&!quizState.answered){
  const input=document.getElementById('quizFillInput');
  if(input){input.focus();input.onkeydown=(e)=>{if(e.key==='Enter')checkFillAnswer()}}
  const submitBtn=document.getElementById('quizSubmitBtn');
  if(submitBtn)submitBtn.onclick=()=>checkFillAnswer()}

// Speed mode timer
if(quizMode==='speed'&&!quizState.answered){
  const timerEl=document.getElementById('speedTimer');
  let secondsLeft=5;
  if(quizState._speedInterval){clearInterval(quizState._speedInterval)}
  quizState._speedInterval=setInterval(()=>{
    secondsLeft--;
    if(timerEl)timerEl.textContent=secondsLeft;
    if(timerEl)timerEl.style.color=secondsLeft<=2?'var(--danger)':'var(--accent)';
    if(secondsLeft<=0){
      clearInterval(quizState._speedInterval);quizState._speedInterval=null;
      quizState.answered=true;quizState.selected=-1;
      quizWrong++;
      const w=quizState.card;
      const idx=S.words.findIndex(x=>x.id===w.id);
      if(idx>=0)fsrsNext(S.words[idx],1);
      S.stats.reviewed++;S.stats.wrong++;
      const dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};S.stats.history[dk].reviewed++;S.stats.history[dk].wrong++;
      if(S.quizStats.currentSession){S.quizStats.currentSession.wrong++}
      quizSessionStreak=0;save();
      const correctIdx=quizState.options.indexOf(w.translation);
      document.querySelectorAll('.quiz-option').forEach(b=>{
        if(parseInt(b.dataset.qi)===correctIdx){b.classList.add('correct')}
        b.disabled=true;
      });
      const container=document.getElementById('quizContainer');
      if(container){const msg=document.createElement('div');msg.style.cssText='color:var(--danger);font-size:.9rem;font-weight:600;margin-top:8px';msg.textContent='⏰ زمان تمام شد!';container.appendChild(msg)}
      setTimeout(()=>{genQuiz();renderQuiz(document.getElementById('content'));initQuiz()},1200);
    }
  },1000);
}

// Listen button
if(['listen','spell'].includes(quizMode)){
  const listenBtn=document.getElementById('quizListenBtn');
  if(listenBtn&&!quizState.answered){listenBtn.onclick=()=>speakWord(q.word);setTimeout(()=>speakWord(q.word),100)}}
// Quiz keyboard shortcuts
document.onkeydown=function(e){
  if(document.querySelector('.modal-overlay'))return;
  if(currentTab!=='quiz')return;
  // Enter/Space: next question (when answered)
  if(quizState.answered&&(e.key==='Enter'||e.key===' ')){
    e.preventDefault();
    const nextBtn=document.getElementById('quizNext');
    if(nextBtn)nextBtn.click();
    return;
  }
  // Z: undo (when answered)
  if(quizState.answered&&(e.key==='z'||e.key==='Z')){
    e.preventDefault();
    const undoBtn=document.getElementById('quizUndo');
    if(undoBtn)undoBtn.click();
    return;
  }
  // 1-4: select option (when not answered, for MCQ modes)
  if(!quizState.answered&&['mcq','reverse','antonym','defmatch'].includes(quizMode)){
    const num=parseInt(e.key);
    if(num>=1&&num<=4){
      const btns=document.querySelectorAll('[data-qi]');
      if(btns[num-1])btns[num-1].click();
    }
  }
};
}

// ═══════════════════════════════════════════
// ANSWER HANDLER (FSRS + Persistence)
// ═══════════════════════════════════════════
// Quiz undo state
let _quizUndoState=null;
let _quizUndoTimer=null;

function handleQuizAnswer(isCorrect){
  // Save undo state before applying
  _quizUndoState={
    cardId:quizState.card.id,
    isCorrect:isCorrect,
    quizCorrect:quizCorrect,
    quizWrong:quizWrong,
    quizSessionStreak:quizSessionStreak,
    statsReviewed:S.stats.reviewed,
    statsCorrect:S.stats.correct,
    statsWrong:S.stats.wrong,
    fsrsSnapshot:{stability:quizState.card.stability,difficulty:quizState.card.difficulty,interval:quizState.card.interval,fsrsState:quizState.card.fsrsState,lapses:quizState.card.lapses,reps:quizState.card.reps,nextReviewDate:quizState.card.nextReviewDate,lastReviewedAt:quizState.card.lastReviewedAt,box:quizState.card.box,easeFactor:quizState.card.easeFactor,elapsedDays:quizState.card.elapsedDays,scheduledDays:quizState.card.scheduledDays},
    dk:todayKey(),
    dkHistory:S.stats.history[todayKey()]?{...S.stats.history[todayKey()]}:null
  };

  if(isCorrect){quizCorrect++;quizSessionStreak++;toast('درست! ✓','success')}
  else{quizWrong++;quizSessionStreak=0;toast('نادرست! ✗','error')}
  // XP for quiz
  const xpGain=isCorrect?5:1;
  S.stats.xp+=xpGain;
  S.stats.reviewed++;
  if(isCorrect)S.stats.correct++;else S.stats.wrong++;
  const dk=todayKey();
  if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};
  S.stats.history[dk].reviewed++;
  if(isCorrect)S.stats.history[dk].correct++;else S.stats.history[dk].wrong++;
  // Streak
  if(S.stats.lastReviewDate!==dk){if(S.stats.lastReviewDate===new Date(Date.now()-MS_PER_DAY).toISOString().slice(0,10))S.stats.streak++;else S.stats.streak=1;S.stats.lastReviewDate=dk}
  // FSRS update
  if(quizState.card){
    const w=S.words.find(x=>x.id===quizState.card.id);
    if(w){fsrsNext(w,isCorrect?3:1);save()}else save();
  }else save();
  // Persistence
  updateQuizWordPerformance(quizState.card.id,isCorrect);
  // Record confusion if wrong
  if(!isCorrect&&quizState.card&&quizState.selected>=0){
    const selectedOption=quizState.options[quizState.selected];
    const correctWord=quizState.card;
    // Find which word was selected
    const confusedWord=S.words.find(x=>x.translation===selectedOption||x.word===selectedOption);
    if(confusedWord)recordConfusion(correctWord.id,confusedWord.id);
  }
  // Session-aware scheduling
  recordSessionAnswer(quizState.card.id,isCorrect);
  _quizQuestionNum++;
  if(S.quizStats&&S.quizStats.currentSession){
    if(isCorrect)S.quizStats.currentSession.correct++;else S.quizStats.currentSession.wrong++;
    S.quizStats.currentSession.words.push({id:quizState.card.id,correct:isCorrect});
    save();
  }
  // Start undo timer
  if(_quizUndoTimer)clearTimeout(_quizUndoTimer);
  _quizUndoTimer=setTimeout(()=>{_quizUndoState=null;_quizUndoTimer=null},3500);
}

function undoQuizAnswer(){
  if(!_quizUndoState)return;
  const u=_quizUndoState;
  _quizUndoState=null;if(_quizUndoTimer){clearTimeout(_quizUndoTimer);_quizUndoTimer=null}

  // Restore counters
  quizCorrect=u.quizCorrect;
  quizWrong=u.quizWrong;
  quizSessionStreak=u.quizSessionStreak;
  S.stats.reviewed=u.statsReviewed;
  S.stats.correct=u.statsCorrect;
  S.stats.wrong=u.statsWrong;
  // Restore daily history
  if(u.dkHistory)S.stats.history[u.dk]=u.dkHistory;
  else delete S.stats.history[u.dk];
  // Restore FSRS state
  const w=S.words.find(x=>x.id===u.cardId);
  if(w&&u.fsrsSnapshot){
    Object.assign(w,u.fsrsSnapshot);
  }
  // Undo XP
  S.stats.xp-=u.isCorrect?5:1;
  if(S.stats.xp<0)S.stats.xp=0;
  // Undo session tracking
  if(S.quizStats&&S.quizStats.currentSession){
    if(u.isCorrect)S.quizStats.currentSession.correct--;else S.quizStats.currentSession.wrong--;
    S.quizStats.currentSession.words.pop();
  }
  _quizQuestionNum--;
  save();
  // Re-show the same question (reset quiz state)
  quizState.answered=false;
  quizState.selected=-1;
  toast('پاسخ لغو شد','info');
  renderQuiz(document.getElementById('content'));
  initQuiz();
}

// ═══════════════════════════════════════════
// LEVELS & GAMIFICATION
// ═══════════════════════════════════════════
function getLevel(xp){
  const levels=[
    {name:'مبتدی',icon:'🌱',min:0},
    {name:'تازه‌کار',icon:'📗',min:50},
    {name:' học viên',icon:'📘',min:150},
    {name:'ระดับกลาง',icon:'📙',min:350},
    {name:'پیشرفته',icon:'📕',min:700},
    {name:'حرفه‌ای',icon:'🎓',min:1200},
    {name:'استاد',icon:'🏆',min:2000},
    {name:'اسطوره',icon:'👑',min:3500},
    {name:'بی‌نهایت',icon:'⚡',min:5000}
  ];
  let current=levels[0];
  let next=levels[1];
  for(let i=levels.length-1;i>=0;i--){if(xp>=levels[i].min){current=levels[i];next=levels[i+1]||null;break}}
  const progress=next?((xp-current.min)/(next.min-current.min)*100):100;
  return{...current,next,progress:Math.min(100,progress),xp};
}

function checkFillAnswer(){
  if(quizState.answered)return;
  const input=document.getElementById('quizFillInput');
  if(!input)return;
  const answer=input.value.trim().toLowerCase();
  const correct=quizState.card.translation.toLowerCase();
  quizState.answered=true;
  const isCorrect=answer===correct||quizState.card.word.toLowerCase()===answer;
  handleQuizAnswer(isCorrect);
  const fb=document.getElementById('quizFillFeedback');
  if(fb)fb.innerHTML=isCorrect?`<div style="color:var(--success);font-weight:600">✓ درست</div>`:`<div style="color:var(--danger);font-weight:600">✗ پاسخ: ${esc(quizState.card.translation)}</div>`;
  input.disabled=true;
  renderQuiz(document.getElementById('content'));
  quizState.timer=setTimeout(()=>{genQuiz();renderQuiz(document.getElementById('content'));initQuiz()},2000);
}

// ═══════════════════════════════════════════
// QUIZ GENERATOR (Smart Selection + Adaptive)
// ═══════════════════════════════════════════
function genQuiz(){
if(quizState.timer){clearTimeout(quizState.timer);quizState.timer=null}
const valid=S.words.filter(w=>w.translation&&w.translation.trim());
if(valid.length<4)return;

// Weighted selection: weaker words appear more often, skip session-skipped
const adaptive=isAdaptiveQuiz();
const weights=valid.map(w=>{
  if(shouldSkipInSession(w.id))return 0;
  if(!adaptive)return 1;
  const strength=getWordStrength(w);
  const inHistory=quizHistory.includes(w.id);
  return Math.max(0.1,(1-strength+0.1)*(inHistory?0.2:1));
});
const totalWeight=weights.reduce((a,b)=>a+b,0);
let r=Math.random()*totalWeight;
let w=valid[0];
for(let i=0;i<valid.length;i++){r-=weights[i];if(r<=0){w=valid[i];break}}

// Adaptive difficulty: pick distractors based on streak
const difficulty=quizSessionStreak>=3?0.8:quizSessionStreak>=1?0.5:0.2;

if(quizMode==='mcq'||quizMode==='reverse'){
  const opts=new Set();
  const target=quizMode==='reverse'?w.word:w.translation;
  opts.add(target);
  const distractors=S.words.filter(x=>x.id!==w.id&&x.translation&&x.translation.trim());
  const distractorField=quizMode==='reverse'?'word':'translation';
  // Sort: confusion partners first, then by frequency tier proximity
  const targetTier=getFrequencyTier(w.word);
  const confusionIds=new Set(getConfusionPartners(w.id));
  distractors.sort((a,b)=>{
    const aConfused=confusionIds.has(a.id)?0:1;
    const bConfused=confusionIds.has(b.id)?0:1;
    if(aConfused!==bConfused)return aConfused-bConfused;
    const aDiff=Math.abs(getFrequencyTier(a.word)-targetTier);
    const bDiff=Math.abs(getFrequencyTier(b.word)-targetTier);
    return aDiff-bDiff;
  });
  const poolSize=Math.ceil(distractors.length*difficulty);
  const hardPool=distractors.slice(0,Math.max(3,poolSize));
  const seen=new Set([target]);
  for(let i=0;i<3&&hardPool.length;i++){const rIdx=Math.floor(Math.random()*hardPool.length);const r=hardPool.splice(rIdx,1)[0];const val=r[distractorField];if(!seen.has(val)){opts.add(val);seen.add(val)}}
  quizState={card:w,options:[...opts].sort(()=>Math.random()-.5),answered:false,selected:-1,timer:null,quizText:''};
}else if(quizMode==='antonym'){
  const opts=new Set();
  let correctAntonym=w.antonyms&&w.antonyms.length>0?w.antonyms[0]:null;
  if(!correctAntonym){correctAntonym=w.translation;}// fallback
  opts.add(correctAntonym);
  const others=S.words.filter(x=>x.id!==w.id&&x.translation);
  const seen=new Set([correctAntonym]);
  for(let i=0;i<3&&others.length;i++){const rIdx=Math.floor(Math.random()*others.length);const r=others.splice(rIdx,1)[0];const val=r.translation;if(!seen.has(val)){opts.add(val);seen.add(val)}}
  quizState={card:w,options:[...opts].sort(()=>Math.random()-.5),answered:false,selected:-1,timer:null,quizText:correctAntonym};
}else if(quizMode==='sentfill'){
  let sentence=w.context||'';if(!sentence&&w.examples&&w.examples.length>0)sentence=w.examples[0];
  if(!sentence)sentence=`The word "${w.word}" means ___`;
  quizState={card:w,options:[],answered:false,selected:-1,timer:null,quizText:sentence};
}else if(quizMode==='spell'){
  quizState={card:w,options:[],answered:false,selected:-1,timer:null,quizText:''};
}else if(quizMode==='defmatch'){
  const opts=new Set();
  opts.add(w.word);
  let definition=w.coreMeaning||'';if(!definition&&w.definitions&&w.definitions.length>0)definition=w.definitions[0];
  const others=S.words.filter(x=>x.id!==w.id);
  const seen=new Set([w.word]);
  for(let i=0;i<3&&others.length;i++){const rIdx=Math.floor(Math.random()*others.length);const r=others.splice(rIdx,1)[0];if(!seen.has(r.word)){opts.add(r.word);seen.add(r.word)}}
  quizState={card:w,options:[...opts].sort(()=>Math.random()-.5),answered:false,selected:-1,timer:null,quizText:definition||w.translation};
}else if(quizMode==='speed'){
  // Speed mode: same as MCQ but with timer
  const opts=new Set();
  opts.add(w.translation);
  const distractors=S.words.filter(x=>x.id!==w.id&&x.translation&&x.translation.trim());
  const seen=new Set([w.translation]);
  for(let i=0;i<3&&distractors.length;i++){const rIdx=Math.floor(Math.random()*distractors.length);const r=distractors.splice(rIdx,1)[0];if(!seen.has(r.translation)){opts.add(r.translation);seen.add(r.translation)}}
  quizState={card:w,options:[...opts].sort(()=>Math.random()-0.5),answered:false,selected:-1,timer:null,quizText:''};
}else{
  // fill, listen
  quizState={card:w,options:[],answered:false,selected:-1,timer:null,quizText:''};
}

quizHistory.push(w.id);if(quizHistory.length>20)quizHistory.shift();
}

function initQuiz(){
if(['fill','listen','sentfill','spell'].includes(quizMode))return;
const c=document.getElementById('quizContainer');
if(!c)return;
c.onclick=e=>{
const btn=e.target.closest('[data-qi]');
if(!btn||quizState.answered)return;
const idx=parseInt(btn.dataset.qi);
quizState.answered=true;
quizState.selected=idx;

let isCorrect;
if(quizMode==='reverse'||quizMode==='defmatch'){
  isCorrect=quizState.options[idx]===quizState.card.word;
}else if(quizMode==='antonym'){
  isCorrect=quizState.options[idx]===quizState.quizText;
}else{
  isCorrect=quizState.options[idx]===quizState.card.translation;
}
handleQuizAnswer(isCorrect);
// Clear speed timer if active
if(quizMode==='speed'&&quizState._speedInterval){clearInterval(quizState._speedInterval);quizState._speedInterval=null}
renderQuiz(document.getElementById('content'));
const autoAdvanceMs=quizMode==='speed'?800:1500;
quizState.timer=setTimeout(()=>{genQuiz();renderQuiz(document.getElementById('content'));initQuiz()},autoAdvanceMs)}}

// ═══════════════════════════════════════════
// 10. ENGLISH QUIZ (embedded + Leitner bridge)
// ═══════════════════════════════════════════
let engQuizLoaded=false;
function renderEngQuiz(c){
  c.innerHTML=`<div style="text-align:center;margin-bottom:16px"><p style="color:var(--text2);font-size:.9rem">آزمون تعیین سطح انگلیسی — واژگان، گرامر، لیسنینگ و رایتینگ</p><a href="https://mohsen-niksirat.github.io/EnglishQuiz/" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:8px 16px;background:linear-gradient(135deg,var(--accent),#7c6cf0);color:#fff;border-radius:10px;font-size:.85rem;font-weight:600;text-decoration:none">🎯 باز کردن در صفحه جدید</a></div><iframe class="eng-quiz-frame" src="https://mohsen-niksirat.github.io/EnglishQuiz/" allow="microphone" title="English Level Test" id="engQuizFrame"></iframe>`;
  const frame=document.getElementById('engQuizFrame');
  if(frame){
    frame.onload=()=>{
      try{
        const leitnerWords=S.words.map(w=>({id:w.id,word:w.word,translation:w.translation,box:w.box,stability:w.stability||0,difficulty:w.difficulty||0,fsrsState:w.fsrsState||'new'}));
        frame.contentWindow.postMessage({type:'leitner-init',words:leitnerWords},'*');
      }catch(e){}
    };
  }
  engQuizLoaded=true;
}

// Listen for quiz results from external English Quiz iframe
window.addEventListener('message',(event)=>{
  const data=event.data;
  if(!data||!data.type)return;
  if(data.type==='quiz-answer'&&data.wordId){
    const w=S.words.find(x=>x.id===data.wordId||x.word.toLowerCase()===(data.word||'').toLowerCase());
    if(w){fsrsNext(w,data.rating||(data.isCorrect?3:1));save()}
    if(S.quizStats){
      const wordKey=data.wordId||data.word||'unknown';
      updateQuizWordPerformance(wordKey,!!data.isCorrect);
    }
  }
  if(data.type==='quiz-complete'&&data.results){
    if(!S.quizStats)S.quizStats={sessions:[],totalCorrect:0,totalWrong:0,wordPerformance:{},currentSession:null};
    S.quizStats.sessions.push({date:new Date().toISOString(),correct:data.results.correct,wrong:data.results.wrong,mode:'external',duration:0});
    if(S.quizStats.sessions.length>50)S.quizStats.sessions=S.quizStats.sessions.slice(-50);
    S.quizStats.totalCorrect+=data.results.correct;
    S.quizStats.totalWrong+=data.results.wrong;
    if(data.results.wordResults){
      data.results.wordResults.forEach(r=>{
        updateQuizWordPerformance(r.wordId||r.questionId,!!r.correct);
      });
    }
    save();
    toast(`تعیین سطح تمام شد: ${data.results.correct}/${data.results.total}`,'success');
  }
});

// ═══════════════════════════════════════════
