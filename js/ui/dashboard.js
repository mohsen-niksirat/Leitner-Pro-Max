// DAILY CHALLENGE — چالش روزانه
// ═══════════════════════════════════════════
function getDailyChallenge(){
  const dk=todayKey();
  const history=S.stats.history[dk]||{reviewed:0,correct:0,wrong:0};
  const streak=S.stats.streak||0;
  const dailyGoal=20; // Default daily goal
  const progress=Math.min(100,Math.round(history.reviewed/dailyGoal*100));
  const completed=history.reviewed>=dailyGoal;
  return {history,streak,dailyGoal,progress,completed,reviewed:history.reviewed,correct:history.correct,wrong:history.wrong};
}
// Expose daily challenge in sidebar or as a banner
function renderDailyChallengeWidget(){
  const dc=getDailyChallenge();
  return `<div style="padding:12px 16px;background:linear-gradient(135deg,var(--accent),#764ba2);border-radius:12px;margin:8px 10px;color:#fff">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:.82rem;font-weight:600">🏆 چالش روزانه</span>
      <span style="font-size:.75rem;opacity:.8">🔥 ${dc.streak} روز</span>
    </div>
    <div style="height:6px;background:rgba(255,255,255,.2);border-radius:3px;overflow:hidden;margin-bottom:6px">
      <div style="height:100%;width:${dc.progress}%;background:#fff;border-radius:3px;transition:width .5s"></div>
    </div>
    <div style="font-size:.72rem;display:flex;justify-content:space-between;opacity:.9">
      <span>${dc.reviewed}/${dc.dailyGoal} کلمه</span>
      <span>${dc.completed?'✅ تکمیل شد!':'⏳ '+dc.progress+'%'}</span>
    </div>
  </div>`;
}

function renderAbout(c){
const featureItems=[
  '🧠 مرور هوشمند با الگوریتم FSRS و زمان‌بندی تطبیقی',
  '📚 کتابخانه، حافظه بلندمدت، دسته‌بندی، برچسب و جستجو',
  '🎯 آزمون‌های چندحالته، تمرین کلمه و تعیین سطح CEFR',
  '📄 خواندن PDF/TXT، ترجمه، انتخاب کلمه و استخراج واژگان',
  '⚒️ VocabForge برای استخراج و غنی‌سازی واژگان',
  '🤖 چت AI با چند ارائه‌دهنده و پشتیبانی تصویر',
  '📊 آمار، XP، سطح، تقویم، Heatmap و پیش‌بینی',
  '📱 PWA قابل نصب، ذخیره‌سازی محلی و قابلیت‌های آفلاین',
  '💾 ورود/خروج JSON، CSV، Anki و پشتیبان‌گیری',
  '🌐 رابط فارسی، تم‌های متنوع و دسترسی‌پذیری'
];
const currentFeatures=[
  '🛡️ سخت‌سازی مسیرهای AI و اعتبارسنجی URL تصاویر',
  '⚡ هماهنگ‌سازی نسخه Service Worker با نسخه برنامه',
  '🔐 حذف proxyهای عمومی از allowlist و عدم چاپ token در deploy',
  '🗂️ بهبود migration و یکسان‌سازی category پیش‌فرض',
  '🧪 اضافه شدن اجرای مستقل تست‌های unit و بررسی syntax'
];
const previousVersions=[
  ['نسخه ۴.۰','Error Boundary، minification، GitHub Actions و انتشار خودکار روی GitHub Pages'],
  ['نسخه ۳.۸.۳','IndexedDB، ورود انتخابی، پخش خودکار مرور، PDF Reader و اتصال VocabForge'],
  ['نسخه ۳.۸.۲','بهبود Reading، تم‌های محتوایی، Word Web، CSV/Anki و تنظیمات کامل‌تر'],
  ['نسخه ۳.۸','AI Chat، تحلیل تصویر، Drag & Drop و اتصال providerهای مختلف'],
  ['نسخه ۳.۷','FSRS-5، backup نسخه‌بندی‌شده، lazy loading و دسترسی‌پذیری'],
  ['نسخه ۳.۶','XP، سطح‌بندی، ورود سریع، مدیریت Deck و تولید مثال'],
  ['نسخه ۳.۵','آزمون هوشمند، انتخاب کلمات ضعیف و دشواری تطبیقی']
];
const featureHtml=featureItems.map(function(item){return '<div class="about-feature-item">'+esc(item)+'</div>'}).join('');
const currentHtml=currentFeatures.map(function(item){return '<div class="about-feature-item current">'+esc(item)+'</div>'}).join('');
const previousHtml=previousVersions.map(function(item,index){return '<details class="about-version"'+(index===0?' open':'')+'><summary><span>'+esc(item[0])+'</span><small>مشاهده تغییرات</small></summary><div>'+esc(item[1])+'</div></details>'}).join('');
c.innerHTML=`<div style="max-width:700px;margin:0 auto">
  <div style="text-align:center;background:linear-gradient(135deg,var(--accent),#764ba2);color:#fff;padding:48px 32px;border-radius:20px;margin-bottom:28px;box-shadow:0 16px 48px rgba(108,92,231,.35)">
    <div style="font-size:3.5rem;margin-bottom:14px">📚</div>
    <h2 style="font-size:2rem;margin-bottom:10px;font-weight:800">برنامه مرور هوشمند واژگان لایتنر</h2>
    <p style="opacity:.95;font-size:1.05rem;font-weight:500">نسخه 5.0 - Leitner Pro Max</p>
    <p style="opacity:.8;font-size:.9rem;margin-top:6px">الگوریتم: FSRS (Free Spaced Repetition Scheduler)</p>
  </div>

  <div class="card about-card" style="margin-bottom:16px;border:2px solid var(--accent)">
    <h3 style="margin-bottom:12px;color:var(--accent)">✨ قابلیت‌های کلی برنامه</h3>
    <div class="about-feature-grid">${featureHtml}</div>
  </div>

  <div class="card about-card" style="margin-bottom:16px;border:2px solid var(--success)">
    <h3 style="margin-bottom:12px;color:var(--success)">🆕 قابلیت‌های آخرین نسخه ۵.۰</h3>
    <div class="about-feature-grid">${currentHtml}</div>
  </div>

  <div class="card about-legacy-card" style="margin-bottom:16px;display:none">
    <h3 style="margin-bottom:12px;color:var(--accent)">📋 نسخه ۴.۰</h3>
    <div style="display:grid;gap:8px;margin-bottom:16px">
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">🛡️ Error Boundary</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">محافظت در برابر خطاها — اگر هر بخشی از برنامه خطا بده، فقط همون بخش متوقف میشه و بقیه سالم میمونه. پیام خطای فارسی و دکمه بازنشانی.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📦 Minification</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">فشرده‌سازی CSS و JS — کاهش ۲۱٪ حجم فایل. اسکریپت build خودکار با npm run build.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">🔧 GitHub Actions</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">build خودکار نسخه minified هر بار push. deployment به GitHub Pages.</p>
      </div>
    </div>
  </div>

  <div class="card about-legacy-card" style="margin-bottom:16px;display:none">
    <h3 style="margin-bottom:12px;color:var(--success)">🆕 ویژگی‌های قدیمی نسخه ۵.۰</h3>
    <div style="display:grid;gap:8px;margin-bottom:16px">
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">⚒️ بازطراحی VocabForge به‌صورت Wizard اسلایدی</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">چهار مرحله انیمیشنی: نوع ورود (متن، PDF با محدوده صفحات و حداکثر کلمه، DOCX، لیست، بازیابی JSON) ← انتخاب کلمات ← غنی‌سازی و ترجمه ← خروجی و انتقال.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📱 خواننده PDF موبایل (PDF-Mobile)</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">زیربخش جداگانه برای گوشی؛ استخراج متن، محدوده صفحات، حداکثر کلمه و ضربه روی کلمه برای ترجمه — بدون تداخل با خواننده canvas دسکتاپ.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">💾 کش IndexedDB در کل برنامه</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">نتایج ترجمه و دیکشنری در مرور، کتابخانه، خواندن و PDF در IndexedDB کش می‌شوند؛ کلمات تکراری دوباره پردازش نمی‌شوند و مصرف اینترنت کم می‌شود.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">🖥️ سایدبار موبایل با blur و بستن با لمس بیرون</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">باز شدن سایدبار دیگر صفحه را فشرده نمی‌کند؛ پس‌زمینه blur می‌شود و با تاچ بیرون بسته می‌شود.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📄 رفع باگ انتخاب کلمه در خواننده PDF</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">لایه متنی با TextLayer رسمی pdf.js بازسازی شد تا دابل‌کلیک روی کلمه در همه PDFها (مثل Can&#39;t Hurt Me) دقیق کار کند.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">⚡ ورود / خروج با ترتیب جدید</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">منوی «ورود کلمات ← وکب فورج ← خروج / پشتیبان» برای مسیر واضح استخراج و انتقال.</p>
      </div>
    </div>
  </div>  <div class="card about-legacy-card" style="margin-bottom:16px;display:none">
    <h3 style="margin-bottom:12px;color:var(--accent)">📋 نسخه ۳.۸.۳</h3>
    <div style="display:grid;gap:8px;margin-bottom:16px">
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">💾 ذخیره‌سازی IndexedDB</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">جابجایی از localStorage به IndexedDB — بدون محدودیت حجم. ورود ۳۰۰۰+ کلمه بدون خطا. مهاجرت خودکار داده‌های قبلی.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📋 ورود با انتخاب و مقصد</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">هنگام ورود JSON/DOCX، ابتدا لیست کلمات نمایش داده می‌شود. انتخاب تکی/گروهی + انتخاب مقصد (کتابخانه یا حافظه بلندمدت).</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">▶️ پخش خودکار مرور</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">حالت خودکار نمایش کلمه → تلفظ → چرخش کارت → کارت بعدی. ۴ سرعت. مکث/ادامه/توقف.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">⚒️ اتصال VocabForge</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">لینک مستقیم به VocabForge برای ساخت فلشکارت از PDF/DOCX با غنیسازی خودکار و ترجمه فارسی.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📄 خواننده PDF: رندر Canvas + ناوبری</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">رندر واقعی صفحات با canvas و لایه متنی. دکمه‌های ناوبری، جستجوی کلمه، پاپآپ غنی قابل درگ.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">🧠 حافظه بلندمدت: ویرایش و فراوانی</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">دکمه ویرایش فعال شد. نمایش سطح فراوانی کلمه در کنار هر ردیف.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">🔍 رفع باگ فوکوس جستجو</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">جستجو در کتابخانه، حافظه بلندمدت و خواندن — فوکوس بعد از تایپ حفظ می‌شود.</p>
      </div>
      <div style="padding:10px 14px;background:var(--bg);border-radius:8px;border-right:3px solid var(--success)">
        <strong style="font-size:.9rem">📖 بخش خواندن: بستن پاپآپ</strong>
        <p style="color:var(--text2);font-size:.8rem;margin-top:4px">کلیک روی فضای خالی صفحه، پاپآپ کلمه را می‌بندد.</p>
      </div>
    </div>
  </div>

  <div class="card about-legacy-card" style="margin-bottom:16px;display:none">
    <h3 style="margin-bottom:12px;color:var(--accent)">✨ ویژگی‌های اصلی قدیمی</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🧠 مرور هوشمند با الگوریتم FSRS</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📖 کتابخانه واژگان با جستجو، فیلتر و ویرایش</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">💾 حافظه بلندمدت با ویرایش و بازگشت به کتابخانه</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📥 ورود متن هوشمند با انتخاب کلمات و ترجمه</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📄 خواننده PDF با پاپ‌آپ ترجمه خودکار</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🌐 ترجمه خودکار با ۱۳ زبان و فرهنگ لغت</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🎮 آزمون هوشمند ۸ حالتی با به‌روزرسانی خودکار لایتنر</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🎯 تعیین سطح انگلیسی (CEFR) — <a href="https://mohsen-niksirat.github.io/EnglishQuiz/" target="_blank" style="color:var(--accent)">باز کردن</a></div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">⚡ مرور سریع تایم‌دار</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🎧 تمرین شنیداری (املاء)</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🗺️ نقشه ذهنی واژگان</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📅 تقویم مرور هوشمند</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🏆 چالش روزانه با streak</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📚 تمرین و توضیح کلمه</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🤖 چت هوش مصنوعی ۵ ارائه‌دهنده</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📰 خواندن پیشرفته با تحلیل متن و PDF</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🗂️ مدیریت دسته‌ها و گروه‌های واژگانی</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🏆 سیستم امتیاز و سطح‌بندی</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📊 آمار و نمودار با تقویم مرور و پیش‌بینی</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📈 نمودار پیشرفت ۳۰ روزه (اضافه‌شده + مرورشده)</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🔊 تلفظ خودکار هنگام مرور (تنظیمات)</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🔊 تلفظ صوتی آمریکایی و بریتیشی</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📱 PWA قابل نصب و آفلاین</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🌙 حالت تاریک و روشن</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">📎 تحلیل تصویر و PDF با هوش مصنوعی</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🔄 پشتیبان‌گیری کامل (لایتنر + حافظه بلندمدت)</div>
      <div style="padding:8px 12px;background:var(--bg);border-radius:8px;font-size:.85rem">🔗 اشتراک‌گذاری دسته با لینک</div>
    </div>
  </div>

  <div class="card about-versions-card" style="margin-bottom:16px">
    <h3 style="margin-bottom:12px;color:var(--accent)">📋 نسخه‌های قبلی</h3>
    <div class="about-version-list">${previousHtml}</div>
  </div>
  <div class="card about-legacy-card" style="margin-bottom:16px;display:none">
    <h3 style="margin-bottom:12px;color:var(--accent)">📋 آرشیو جزئیات قدیمی</h3>
<details style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">🆕 نسخه ۴.۰ — Leitner Pro ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• Error Boundary — محافظت در برابر خطاها؛ فقط بخش خطادار متوقف می‌شود</div>
        <div style="font-size:.82rem;color:var(--text2)">• Minification خودکار CSS و JS (کاهش ۲۱٪ حجم)</div>
        <div style="font-size:.82rem;color:var(--text2)">• GitHub Actions build و deployment به GitHub Pages</div>
      </div>
    </details>
    <details open style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">🆕 نسخه ۳.۸.۳ ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• رفتن از localStorage به IndexedDB — بدون محدودیت حجم، مهاجرت خودکار</div>
        <div style="font-size:.82rem;color:var(--text2)">• ورود با انتخاب و مقصد (کتابخانه یا حافظه بلندمدت)</div>
        <div style="font-size:.82rem;color:var(--text2)">• پخش خودکار مرور با ۴ سرعت</div>
        <div style="font-size:.82rem;color:var(--text2)">• خواننده PDF: رندر canvas + لایه متنی + ناوبری</div>
        <div style="font-size:.82rem;color:var(--text2)">• حافظه بلندمدت: ویرایش و نمایش فراوانی</div>
        <div style="font-size:.82rem;color:var(--text2)">• رفع باگ فوکوس جستجو و بستن پاپ‌آپ خواندن</div>
      </div>
    </details>
    <details open style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">🆕 نسخه ۳.۸.۲ — بهبود بخش خواندن و نقشه واژگان ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• پنل اطلاعات قابل مخفی در بخش خواندن با دکمه toggle</div>
        <div style="font-size:.82rem;color:var(--text2)">• اطلاعات جدید: زمان مطالعه، درصد واژگان شناخته‌شده، طولانی‌ترین کلمه، توزیع فراوانی</div>
        <div style="font-size:.82rem;color:var(--text2)">• گزینه‌های نمایش: فونت، فاصله خطوط، ۵ تم رنگی محتوا</div>
        <div style="font-size:.82rem;color:var(--text2)">• ترجمه دقیق: تعریف انگلیسی به فارسی به جای ترجمه مستقیم کلمه</div>
        <div style="font-size:.82rem;color:var(--text2)">• واکشی هوشمند دیتای موجود در کتابخانه هنگام کلیک روی کلمه</div>
        <div style="font-size:.82rem;color:var(--text2)">• بروزرسانی هوشمند فیلدهای خالی با دکمه اختصاصی</div>
        <div style="font-size:.82rem;color:var(--text2)">• رفع مشکل تشخیص کلمات متصل (word1,word2 → دو کلمه جدا)</div>
        <div style="font-size:.82rem;color:var(--text2)">• ناوبری پیشرفته صفحات: اول/آخر، اسلایدر، رفتن به صفحه دلخواه</div>
        <div style="font-size:.82rem;color:var(--text2)">• میانبرهای کیبورد برای جابجایی صفحات (←→ Home End)</div>
        <div style="font-size:.82rem;color:var(--text2)">• نقشه واژگان v2: ۵ حالت نمایش، ۴ نوع رنگ‌بندی، زوم و پن</div>
        <div style="font-size:.82rem;color:var(--text2)">• نقشه واژگان: فیلتر مترادف/متضاد/خانواده، خروجی PNG، تمام‌صفحه</div>
        <div style="font-size:.82rem;color:var(--text2)">• خروجی CSV با فیلتر دسته‌بندی و خروجی Anki (TSV)</div>
        <div style="font-size:.82rem;color:var(--text2)">• چاپ لیست واژگان و خروجی آمار تفصیلی</div>
        <div style="font-size:.82rem;color:var(--text2)">• نمودار مصرف حافظه مرورگر در بخش خروجی</div>
        <div style="font-size:.82rem;color:var(--text2)">• اهداف روزانه با نمودار پیشرفت در تنظیمات</div>
        <div style="font-size:.82rem;color:var(--text2)">• تنظیمات آزمون (تعداد سؤال، پاسخ فوری، فقط ناشناخته‌ها)</div>
        <div style="font-size:.82rem;color:var(--text2)">• مدیریت دسته‌بندی‌ها: افزودن، تغییر نام، حذف</div>
        <div style="font-size:.82rem;color:var(--text2)">• جدول میانبرهای کیبورد و سرعت تلفظ قابل تنظیم</div>
        <div style="font-size:.82rem;color:var(--text2)">• 📈 نمودار پیشرفت ۳۰ روز اخیر (کلمات اضافه‌شده و مرورشده)</div>
        <div style="font-size:.82rem;color:var(--text2)">• 🔊 تلفظ خودکار کلمه هنگام نمایش کارت مرور (قابل فعال/غیرفعال در تنظیمات)</div>
      </div>
    </details>
    <details style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">نسخه ۳.۸ — چت هوش مصنوعی و تحلیل تصویر ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• چت هوش مصنوعی با Gemini، OpenRouter و Groq</div>
        <div style="font-size:.82rem;color:var(--text2)">• تحلیل تصویر و فایل PDF با مدل‌های چندوجهی</div>
        <div style="font-size:.82rem;color:var(--text2)">• مصرف واقعی ارائه‌دهنده از هدرهای پاسخ</div>
        <div style="font-size:.82rem;color:var(--text2)">• Drag & Drop و پیست تصویر</div>
      </div>
    </details>
    <details style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">نسخه ۳.۷ — ایمنی داده و FSRS-5 ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• پشتیبان نسخه‌بندی شده در IndexedDB</div>
        <div style="font-size:.82rem;color:var(--text2)">• الگوریتم FSRS-5 با ۱۷ پارامتر</div>
        <div style="font-size:.82rem;color:var(--text2)">• بارگذاری تنبل Chart.js، PDF.js، JSZip</div>
        <div style="font-size:.82rem;color:var(--text2)">• لغو پاسخ آزمون با شمارش معکوس</div>
        <div style="font-size:.82rem;color:var(--text2)">• جفت‌های گیج‌کننده در آزمون</div>
        <div style="font-size:.82rem;color:var(--text2)">• خواننده PDF با text reflow</div>
        <div style="font-size:.82rem;color:var(--text2)">• ریشه‌شناسی و خانواده واژگانی</div>
        <div style="font-size:.82rem;color:var(--text2)">• دسترسی‌پذیری با ARIA و کنتراست بالا</div>
      </div>
    </details>
    <details style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">نسخه ۳.۶ — امتیاز و ورود سریع ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• سیستم امتیاز (XP) و ۹ سطح</div>
        <div style="font-size:.82rem;color:var(--text2)">• بوکمارکلت ورود سریع کلمات</div>
        <div style="font-size:.82rem;color:var(--text2)">• مدیریت دسته‌ها (Deck)</div>
        <div style="font-size:.82rem;color:var(--text2)">• تولید مثال با هوش مصنوعی</div>
        <div style="font-size:.82rem;color:var(--text2)">• خواننده PDF و TXT با تحلیل واژگان</div>
        <div style="font-size:.82rem;color:var(--text2)">• ترجمه کش‌شده و پنل جزئیات کلمه</div>
      </div>
    </details>
    <details style="margin-bottom:10px">
      <summary style="cursor:pointer;font-size:.9rem;font-weight:600;color:var(--text);padding:8px 0">نسخه ۳.۵ — آزمون هوشمند ▾</summary>
      <div style="display:grid;gap:6px;margin-top:8px;padding:10px;background:var(--bg);border-radius:10px">
        <div style="font-size:.82rem;color:var(--text2)">• به‌روزرسانی خودکار لایتنر با آزمون</div>
        <div style="font-size:.82rem;color:var(--text2)">• انتخاب هوشمند کلمات ضعیف</div>
        <div style="font-size:.82rem;color:var(--text2)">• دشواری تطبیقی</div>
        <div style="font-size:.82rem;color:var(--text2)">• ۴ حالت آزمون جدید</div>
      </div>
    </details>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h3 style="margin-bottom:12px;color:var(--accent)">🔗 ارتباط با ما</h3>
    <div style="display:grid;gap:8px">
      <a href="https://t.me/MyLeitner" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:10px;color:var(--text);text-decoration:none;transition:all .2s">
        <span style="font-size:1.3rem">💬</span>
        <div><div style="font-weight:600;font-size:.9rem">تلگرام</div><div style="font-size:.75rem;color:var(--text2)">@MyLeitner</div></div>
      </a>
      <a href="https://github.com/mohsen-niksirat/leitner-pro" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:10px;color:var(--text);text-decoration:none;transition:all .2s">
        <span style="font-size:1.3rem">💻</span>
        <div><div style="font-weight:600;font-size:.9rem">گیت‌هاب</div><div style="font-size:.75rem;color:var(--text2)">github.com/mohsen-niksirat/leitner-pro</div></div>
      </a>
    </div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h3 style="margin-bottom:12px;color:var(--accent)">🛡️ حریم خصوصی</h3>
    <p style="color:var(--text2);font-size:.85rem;line-height:1.8">تمام داده‌ها در مرورگر شما ذخیره می‌شوند و هرگز به سرور ارسال نمی‌شوند. API Key و تاریخچه چت در IndexedDB مرورگر ذخیره می‌شوند. ترجمه از API عمومی رایگان انجام می‌شود. پشتیبان خودکار نیز در IndexedDB نگهداری می‌شود.</p>
  </div>

  <div style="text-align:center;padding:20px;color:var(--text2);font-size:.8rem">
    <p>ساخته شده با ❤️ برای یادگیری بهتر واژگان</p>
    <p style="margin-top:4px"><a href="https://mohsen-niksirat.github.io/Leitner-Pro-Max/" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">GitHub Pages</a> · <a href="https://t.me/MyLeitner" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">@MyLeitner</a></p>
    <p style="margin-top:4px;opacity:.6">Leitner Pro v4.0 — FSRS Algorithm</p>
  </div>
</div>`}



// ═══════════════════════════════════════════
