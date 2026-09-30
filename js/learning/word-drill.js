// ═══════════════════════════════════════════
// WORD DRILL — تمرین و توضیح کلمه
// ═══════════════════════════════════════════
export function openWordDrill(w) {
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
export function getMemoryTrick(word, trans, pos) {
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
export function getUsageTip(word, trans, pos) {
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
export function generateWordQuiz(w) {
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
