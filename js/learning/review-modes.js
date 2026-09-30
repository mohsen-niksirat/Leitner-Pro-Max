// ═══════════════════════════════════════════
// SPEED REVIEW & LISTENING MODES
// ═══════════════════════════════════════════
import { findCardById, getDue } from './review.js';

export const speedState = { queue: [], idx: 0, correct: 0, wrong: 0, done: false, timer: null, secondsLeft: 5, totalTime: 5, skipped: 0 };

export function renderSpeedReview(c) {
  // Always clear existing timer first to prevent duplicates
  if (speedState.timer) { clearInterval(speedState.timer); speedState.timer = null; }
  // Guard: only render if we're actually on speed review tab
  if (currentTab !== 'speedreview') return;
  const due = getDue();
  if (speedState.done) {
    const acc = speedState.queue.length ? Math.round(speedState.correct / speedState.queue.length * 100) : 0;
    c.innerHTML = `<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">⚡ پایان مرور سریع</h3><div class="stat-grid"><div class="stat-card"><div class="val">${speedState.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${speedState.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${speedState.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div></div><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="btn btn-primary" type="button" onclick="Object.assign(speedState,{queue:[],idx:0,correct:0,wrong:0,done:false,timer:null,secondsLeft:5,totalTime:5,skipped:0});renderSpeedReview(document.getElementById('content'))">🔄 تلاش مجدد</button><button class="btn btn-ghost" type="button" onclick="currentTab='review';render()">بازگشت به مرور</button></div></div>`;
    return;
  }
  if (!speedState.queue.length) {
    if (!due.length) {
      c.innerHTML = `<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">⚡</div><p>کارتی برای مرور سریع نیست</p><p style="font-size:.8rem;margin-top:8px;color:var(--text2)">ابتدا کلماتی اضافه کنید یا منتظر مرور بعدی باشید</p></div></div>`;
      return;
    }
    speedState.queue = due.slice(0, Math.min(20, due.length));
    speedState.idx = 0; speedState.correct = 0; speedState.wrong = 0; speedState.done = false;
  }
  if (speedState.idx >= speedState.queue.length) { speedState.done = true; renderSpeedReview(c); return; }
  const w = speedState.queue[speedState.idx];
  const prog = Math.round((speedState.idx / speedState.queue.length) * 100);
  // Build 4 options
  const allWords = [...S.words, ...S.longTerm].filter(x => x.id !== w.id && x.translation);
  const wrongOpts = allWords.sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.translation);
  const options = [w.translation, ...wrongOpts].sort(() => Math.random() - 0.5);
  const correctIdx = options.indexOf(w.translation);
  c.innerHTML = `<div style="max-width:500px;margin:0 auto">
    <div class="flex" style="justify-content:space-between;margin-bottom:12px">
      <span style="color:var(--text2)">${speedState.idx + 1} از ${speedState.queue.length}</span>
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
        ${options.map((opt, i) => `<button type="button" class="speed-opt" data-idx="${i}" style="padding:14px;border-radius:12px;border:2px solid var(--border);background:var(--card);color:var(--text);font:inherit;font-size:.95rem;cursor:pointer;transition:all .2s">${esc(opt)}</button>`).join('')}
      </div>
    </div>
  </div>`;
  // Timer
  speedState.secondsLeft = speedState.totalTime;
  const timerEl = document.getElementById('speedTimer');
  if (speedState.timer) clearInterval(speedState.timer);
  speedState.timer = setInterval(() => {
    speedState.secondsLeft--;
    if (timerEl) timerEl.textContent = speedState.secondsLeft;
    if (timerEl) timerEl.style.color = speedState.secondsLeft <= 2 ? 'var(--danger)' : 'var(--accent)';
    if (speedState.secondsLeft <= 0) {
      clearInterval(speedState.timer); speedState.timer = null;
      // Auto-fail
      speedState.wrong++;
      const _sf = findCardById(w.id); if (_sf) fsrsNext(_sf, 1);
      S.stats.reviewed++; S.stats.wrong++;
      const dk = todayKey(); if (!S.stats.history[dk]) S.stats.history[dk] = { reviewed: 0, correct: 0, wrong: 0 }; S.stats.history[dk].reviewed++; S.stats.history[dk].wrong++;
      save();
      // Highlight correct
      document.querySelectorAll('.speed-opt').forEach(b => {
        if (parseInt(b.dataset.idx) === correctIdx) { b.style.background = 'var(--success)'; b.style.color = '#fff'; b.style.borderColor = 'var(--success)'; }
        b.disabled = true;
      });
      setTimeout(() => { speedState.idx++; renderSpeedReview(c); }, 800);
    }
  }, 1000);
  // Option click
  document.querySelectorAll('.speed-opt').forEach(btn => {
    btn.onclick = () => {
      if (speedState.timer) { clearInterval(speedState.timer); speedState.timer = null; }
      const oi = parseInt(btn.dataset.idx);
      const isCorrect = oi === correctIdx;
      if (isCorrect) {
        btn.style.background = 'var(--success)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--success)';
        speedState.correct++;
        const _sc = findCardById(w.id); if (_sc) fsrsNext(_sc, 4);
        S.stats.reviewed++; S.stats.correct++; S.stats.xp += 5;
      } else {
        btn.style.background = 'var(--danger)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--danger)';
        const correctBtn = document.querySelector(`.speed-opt[data-idx="${correctIdx}"]`);
        if (correctBtn) { correctBtn.style.background = 'var(--success)'; correctBtn.style.color = '#fff'; correctBtn.style.borderColor = 'var(--success)'; }
        speedState.wrong++;
        const _sw = findCardById(w.id); if (_sw) fsrsNext(_sw, 1);
        S.stats.reviewed++; S.stats.wrong++;
      }
      const dk = todayKey(); if (!S.stats.history[dk]) S.stats.history[dk] = { reviewed: 0, correct: 0, wrong: 0 }; S.stats.history[dk].reviewed++; if (isCorrect) S.stats.history[dk].correct++; else S.stats.history[dk].wrong++;
      save();
      document.querySelectorAll('.speed-opt').forEach(b => b.disabled = true);
      setTimeout(() => { speedState.idx++; renderSpeedReview(c); }, 600);
    };
  });
}

// ═══════════════════════════════════════════
// LISTENING MODE — تمرین شنیداری
// ═══════════════════════════════════════════
export const listenState = { queue: [], idx: 0, correct: 0, wrong: 0, done: false, revealed: false };

export function renderListening(c) {
  if (listenState.done) {
    const acc = listenState.queue.length ? Math.round(listenState.correct / listenState.queue.length * 100) : 0;
    c.innerHTML = `<div class="card" style="max-width:400px;margin:40px auto;text-align:center"><h3 style="margin-bottom:16px">🎧 پایان تمرین شنیداری</h3><div class="stat-grid"><div class="stat-card"><div class="val">${listenState.queue.length}</div><div class="lbl">کل</div></div><div class="stat-card"><div class="val" style="color:var(--success)">${listenState.correct}</div><div class="lbl">درست</div></div><div class="stat-card"><div class="val" style="color:var(--danger)">${listenState.wrong}</div><div class="lbl">نادرست</div></div><div class="stat-card"><div class="val">${acc}%</div><div class="lbl">دقت</div></div></div><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="btn btn-primary" type="button" onclick="Object.assign(listenState,{queue:[],idx:0,correct:0,wrong:0,done:false,revealed:false});renderListening(document.getElementById('content'))">🔄 تلاش مجدد</button><button class="btn btn-ghost" type="button" onclick="currentTab='review';render()">بازگشت</button></div></div>`;
    return;
  }
  if (!listenState.queue.length) {
    const pool = [...S.words, ...S.longTerm];
    if (!pool.length) { c.innerHTML = `<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">🎧</div><p>کلمه‌ای برای تمرین شنیداری نیست</p></div></div>`; return; }
    listenState.queue = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(15, pool.length));
    listenState.idx = 0; listenState.correct = 0; listenState.wrong = 0; listenState.done = false;
  }
  if (listenState.idx >= listenState.queue.length) { listenState.done = true; renderListening(c); return; }
  const w = listenState.queue[listenState.idx];
  const prog = Math.round((listenState.idx / listenState.queue.length) * 100);
  c.innerHTML = `<div style="max-width:500px;margin:0 auto">
    <div class="flex" style="justify-content:space-between;margin-bottom:12px">
      <span style="color:var(--text2)">${listenState.idx + 1} از ${listenState.queue.length}</span>
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
  const input = document.getElementById('listenInput');
  const playBtn = document.getElementById('listenPlayBtn');
  const feedback = document.getElementById('listenFeedback');
  // Play audio
  function playWord() { speakWord(w.word); }
  playBtn.onclick = playWord;
  setTimeout(playWord, 300);
  input.focus();
  // Check
  document.getElementById('listenCheckBtn').onclick = () => {
    const userAnswer = input.value.trim().toLowerCase();
    const correct = w.word.toLowerCase();
    const isCorrect = userAnswer === correct;
    listenState.revealed = true;
    if (isCorrect) {
      listenState.correct++;
      feedback.style.display = 'block';
      feedback.innerHTML = '<div style="color:var(--success);font-size:1.1rem;font-weight:700">✅ درست! «' + esc(w.word) + '» = ' + esc(w.translation) + '</div>';
      const _lc = findCardById(w.id); if (_lc) fsrsNext(_lc, 5);
      S.stats.reviewed++; S.stats.correct++; S.stats.xp += 8;
    } else {
      listenState.wrong++;
      feedback.style.display = 'block';
      feedback.innerHTML = '<div style="color:var(--danger);font-size:1rem;font-weight:600">❌ نادرست! جواب صحیح: <strong>' + esc(w.word) + '</strong> = ' + esc(w.translation) + '</div>';
      const _lw = findCardById(w.id); if (_lw) fsrsNext(_lw, 1);
      S.stats.reviewed++; S.stats.wrong++;
    }
    const dk = todayKey(); if (!S.stats.history[dk]) S.stats.history[dk] = { reviewed: 0, correct: 0, wrong: 0 }; S.stats.history[dk].reviewed++; if (isCorrect) S.stats.history[dk].correct++; else S.stats.history[dk].wrong++;
    save();
    input.disabled = true;
    setTimeout(() => { listenState.idx++; listenState.revealed = false; renderListening(c); }, 1500);
  };
  // Enter key
  input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('listenCheckBtn').click(); } };
  // Skip
  document.getElementById('listenSkipBtn').onclick = () => {
    listenState.idx++; listenState.revealed = false; renderListening(c);
  };
  // Show answer
  document.getElementById('listenShowBtn').onclick = () => {
    listenState.revealed = true; listenState.wrong++;
    feedback.style.display = 'block';
    feedback.innerHTML = '<div style="color:var(--warning);font-size:1rem">👁 جواب: <strong>' + esc(w.word) + '</strong> = ' + esc(w.translation) + '</div>';
    const _ls = findCardById(w.id); if (_ls) fsrsNext(_ls, 2);
    S.stats.reviewed++; S.stats.wrong++;
    const dk = todayKey(); if (!S.stats.history[dk]) S.stats.history[dk] = { reviewed: 0, correct: 0, wrong: 0 }; S.stats.history[dk].reviewed++; S.stats.history[dk].wrong++;
    save();
    input.disabled = true;
    setTimeout(() => { listenState.idx++; listenState.revealed = false; renderListening(c); }, 1500);
  };
}
