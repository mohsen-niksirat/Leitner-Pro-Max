// DAILY CHALLENGE — چالش روزانه
// ═══════════════════════════════════════════
function getDailyChallenge(){
  const dk=todayKey();
  const history=S.stats.history[dk]||{reviewed:0,correct:0,wrong:0};
  const streak=S.stats.streak||0;
  const dailyGoal=S.settings.dailyGoal||20;
  const progress=Math.min(100,Math.round(history.reviewed/dailyGoal*100));
  return {history,streak,dailyGoal,progress,completed:history.reviewed>=dailyGoal,reviewed:history.reviewed,correct:history.correct,wrong:history.wrong};
}

function renderDailyChallengeWidget(){
  const dc=getDailyChallenge();
  return `<div style="padding:12px 16px;background:linear-gradient(135deg,var(--accent),#764ba2);border-radius:12px;margin:8px 10px;color:#fff">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:.82rem;font-weight:600">🏆 چالش روزانه</span><span style="font-size:.75rem;opacity:.8">🔥 ${dc.streak} روز</span></div>
    <div style="height:6px;background:rgba(255,255,255,.2);border-radius:3px;overflow:hidden;margin-bottom:6px"><div style="height:100%;width:${dc.progress}%;background:#fff;border-radius:3px;transition:width .5s"></div></div>
    <div style="font-size:.72rem;display:flex;justify-content:space-between;opacity:.9"><span>${dc.reviewed}/${dc.dailyGoal} کلمه</span><span>${dc.completed?'✅ تکمیل شد!':'⏳ '+dc.progress+'%'}</span></div>
  </div>`;
}

const RELEASE_HISTORY=[
  {version:'۴.۰',title:'پایداری و انتشار',items:['Error Boundary برای جلوگیری از توقف کل برنامه','فشرده‌سازی CSS و JS و کاهش حجم خروجی','GitHub Actions و انتشار خودکار روی GitHub Pages']},
  {version:'۳.۸.۳',title:'ذخیره‌سازی و ابزارهای مطالعه',items:['مهاجرت از localStorage به IndexedDB','ورود انتخابی با مقصد کتابخانه یا حافظه بلندمدت','پخش خودکار مرور با چهار سرعت','PDF Reader با canvas، لایه متن و ناوبری','اتصال VocabForge و بهبود جستجو']},
  {version:'۳.۸.۲',title:'Reading و Word Web',items:['پنل اطلاعات و تنظیمات فونت، فاصله خطوط و تم محتوا','نقشه واژگان با فیلتر، زوم، پن و خروجی PNG','خروجی CSV و Anki و آمار تفصیلی','اهداف روزانه، تنظیمات آزمون و مدیریت دسته‌ها']},
  {version:'۳.۸',title:'هوش مصنوعی و تصویر',items:['AI Chat با Gemini، OpenRouter و Groq','تحلیل تصویر و PDF با مدل‌های چندوجهی','Drag & Drop و پیست تصویر','گزارش مصرف provider']},
  {version:'۳.۷',title:'FSRS و ایمنی داده',items:['FSRS-5 با ۱۷ پارامتر','پشتیبان نسخه‌بندی‌شده در IndexedDB','بارگذاری تنبل Chart.js، PDF.js و JSZip','دسترسی‌پذیری و کنتراست بالا']},
  {version:'۳.۶',title:'XP و ورود سریع',items:['سیستم XP و سطح‌بندی','ورود سریع کلمات و مدیریت Deck','تولید مثال و تحلیل PDF/TXT']},
  {version:'۳.۵',title:'آزمون هوشمند',items:['انتخاب کلمات ضعیف','دشواری تطبیقی','چهار حالت جدید آزمون','به‌روزرسانی خودکار وضعیت لایتنر']}
];

const ABOUT_FEATURES=[
  '🧠 مرور هوشمند با الگوریتم FSRS و زمان‌بندی تطبیقی','📚 کتابخانه و حافظه بلندمدت با دسته، برچسب و جستجو','🎯 آزمون‌های چندحالته، تمرین کلمه و تعیین سطح CEFR','📄 خواندن PDF/TXT، ترجمه و استخراج واژگان','⚒️ VocabForge برای استخراج و غنی‌سازی واژگان','🤖 چت AI با چند provider و پشتیبانی تصویر','📊 آمار، XP، سطح، تقویم، Heatmap و پیش‌بینی','📱 PWA قابل نصب، ذخیره‌سازی محلی و قابلیت‌های آفلاین','💾 ورود/خروج JSON، CSV، Anki و پشتیبان‌گیری','🌐 رابط فارسی، تم‌های متنوع و دسترسی‌پذیری'
];

const CURRENT_RELEASE_FEATURES=[
  '🎨 تم‌های تاریک، روشن، اقیانوسی، جنگلی، غروب، اسطوخودوسی و کنتراست بالا','⚡ هماهنگ‌سازی نسخه Service Worker و اعلان نسخه جدید','🔐 اعتبارسنجی URL تصاویر AI و حذف proxyهای عمومی از allowlist','💾 Backup کامل‌تر با quiz، PDF bookmark و تنظیمات Reading','🧪 اجرای مستقل تست‌های unit و بررسی syntax'
];

function aboutFeatureMarkup(items, current){
  return items.map(item=>`<div class="about-feature-item${current?' current':''}">${esc(item)}</div>`).join('');
}

function releaseMarkup(release,index){
  return `<details class="about-version"${index===0?' open':''}><summary><span><b>نسخه ${esc(release.version)}</b> — ${esc(release.title)}</span><small>مشاهده تغییرات</small></summary><div class="about-version-items">${release.items.map(item=>`<div>• ${esc(item)}</div>`).join('')}</div></details>`;
}

function renderAbout(c){
  const currentVersion=typeof APP_CONFIG!=='undefined'&&APP_CONFIG.version?APP_CONFIG.version:'۵.۰';
  c.innerHTML=`<div style="max-width:700px;margin:0 auto">
    <div class="about-hero"><div class="about-hero-icon">📚</div><h2>برنامه مرور هوشمند واژگان لایتنر</h2><p>نسخه ${esc(currentVersion)} — Leitner Pro Max</p><small>الگوریتم FSRS (Free Spaced Repetition Scheduler)</small></div>
    <div class="card about-card"><h3>✨ قابلیت‌های کلی برنامه</h3><div class="about-feature-grid">${aboutFeatureMarkup(ABOUT_FEATURES,false)}</div></div>
    <div class="card about-card about-current-card"><h3>🆕 ویژگی‌های نسخه ${esc(currentVersion)}</h3><div class="about-feature-grid">${aboutFeatureMarkup(CURRENT_RELEASE_FEATURES,true)}</div></div>
    <div class="card about-card"><h3>📋 نسخه‌های قبلی</h3><div class="about-version-list">${RELEASE_HISTORY.map(releaseMarkup).join('')}</div></div>
    <div class="card about-card"><h3>🔗 ارتباط با ما</h3><div class="about-links"><a href="https://t.me/MyLeitner" target="_blank" rel="noopener"><span>💬</span><div><b>تلگرام</b><small>@MyLeitner</small></div></a><a href="https://github.com/mohsen-niksirat/Leitner-Pro-Max" target="_blank" rel="noopener"><span>💻</span><div><b>گیت‌هاب</b><small>Leitner-Pro-Max</small></div></a></div></div>
    <div class="card about-card"><h3>🛡️ حریم خصوصی</h3><p class="about-privacy">داده‌های یادگیری در مرورگر شما ذخیره می‌شوند. API Key و تاریخچه چت در IndexedDB نگهداری می‌شوند و فقط درخواست‌های سرویس‌های انتخابی کاربر به شبکه ارسال می‌شوند.</p></div>
    <div class="about-footer"><p>ساخته شده با ❤️ برای یادگیری بهتر واژگان</p><p><a href="https://mohsen-niksirat.github.io/Leitner-Pro-Max/" target="_blank" rel="noopener">GitHub Pages</a> · <a href="https://t.me/MyLeitner" target="_blank" rel="noopener">@MyLeitner</a></p></div>
  </div>`;
}
