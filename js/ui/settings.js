// NOTIFICATION REMINDERS
// ═══════════════════════════════════════════
function checkNotifications(){
  if(!S.settings.notifications)return;
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const due=getDue();
  if(due.length===0)return;
  const now=new Date();
  const timeParts=(S.settings.notificationTime||'09:00').split(':');
  const notifHour=parseInt(timeParts[0])||9;
  const notifMin=parseInt(timeParts[1])||0;
  if(now.getHours()===notifHour&&Math.abs(now.getMinutes()-notifMin)<5){
    const lastNotif=localStorage.getItem('leitner_last_notif');
    if(lastNotif===todayKey())return;
    localStorage.setItem('leitner_last_notif',todayKey());
    new Notification('لایتنر - یادآوری مرور',{
      body:`${due.length} کلمه منتظر مرور شماست!`,
      icon:'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2720%27 fill=%27%236c5ce7%27/%3E%3Ctext x=%2750%27 y=%2768%27 text-anchor=%27middle%27 font-size=%2750%27 fill=%27white%27%3E📖%3C/text%3E%3C/svg%3E'
    })}
}

// Check every 5 minutes
setInterval(checkNotifications,5*60*1000);

// ═══════════════════════════════════════════
// PWA & OFFLINE
// ═══════════════════════════════════════════
// Offline indicator
window.addEventListener('online',()=>{document.getElementById('offlineBanner').classList.remove('visible')});
window.addEventListener('offline',()=>{document.getElementById('offlineBanner').classList.add('visible')});
if(!navigator.onLine)document.getElementById('offlineBanner').classList.add('visible');

// ═══════════════════════════════════════════

function renderSettings(c){
var s=S.settings;
var langOpts=Object.entries(LANGUAGES).map(function(e){return '<option value="'+e[0]+'"'+(e[0]===s.sourceLang?' selected':'')+'>'+e[1]+'</option>'}).join('');
var langOptsTarget=Object.entries(LANGUAGES).map(function(e){return '<option value="'+e[0]+'"'+(e[0]===s.targetLang?' selected':'')+'>'+e[1]+'</option>'}).join('');
var dataSize=stateSnapshotSizeKB().toFixed(1);
var dailyGoal=s.dailyGoal||20;
var reviewLimit=s.reviewLimit||50;
var h='';
// ── Daily Goals ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">🎯 اهداف روزانه</h3>';
h+='<div style="display:grid;gap:16px;max-width:450px">';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:6px">هدف کلمات جدید در روز: <strong style="color:var(--accent)" id="dailyGoalVal">'+dailyGoal+'</strong></label>';
h+='<input type="range" id="setDailyGoal" min="5" max="100" step="5" value="'+dailyGoal+'" style="width:100%;accent-color:var(--accent)">';
h+='<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text2)"><span>۵</span><span>۱۰۰</span></div></div>';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:6px">سقف مرور در هر جلسه: <strong style="color:var(--accent)" id="reviewLimitVal">'+reviewLimit+'</strong></label>';
h+='<input type="range" id="setReviewLimit" min="10" max="200" step="10" value="'+reviewLimit+'" style="width:100%;accent-color:var(--accent)">';
h+='<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text2)"><span>۱۰</span><span>۲۰۰</span></div></div>';
var todayReviewed=S.stats.history[todayKey()]?S.stats.history[todayKey()].reviewed:0;
h+='<div style="padding:10px;background:var(--bg);border-radius:10px;text-align:center">';
h+='<div style="font-size:.8rem;color:var(--text2);margin-bottom:4px">📊 وضعیت امروز</div>';
h+='<div style="font-size:1.5rem;font-weight:700;color:var(--accent)">'+todayReviewed+'</div>';
h+='<div class="progress-bar" style="margin-top:6px"><div class="progress-fill" style="width:'+Math.min(100,Math.round(todayReviewed/dailyGoal*100))+'%"></div></div>';
h+='<div style="font-size:.7rem;color:var(--text2);margin-top:4px">'+Math.min(100,Math.round(todayReviewed/dailyGoal*100))+'% از هدف روزانه</div>';
h+='</div></div></div>';
// ── Translation ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">🌐 تنظیمات ترجمه</h3>';
h+='<div style="display:grid;gap:12px;max-width:400px">';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">زبان مبدأ</label><select class="input" id="setSourceLang">'+langOpts+'</select></div>';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">زبان مقصد</label><select class="input" id="setTargetLang">'+langOptsTarget+'</select></div>';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">سرعت تلفظ</label>';
h+='<select class="input" id="setSpeechRate"><option value="0.6"'+(s.speechRate===0.6?' selected':'')+'>آهسته</option><option value="0.85"'+(!s.speechRate||s.speechRate===0.85?' selected':'')+'>عادی</option><option value="1"'+(s.speechRate===1?' selected':'')+'>سریع</option><option value="1.3"'+(s.speechRate===1.3?' selected':'')+'>خیلی سریع</option></select></div>';
h+='<div class="flex" style="margin-top:8px"><label style="font-size:.85rem;color:var(--text2)">🔊 تلفظ خودکار هنگام مرور</label><input type="checkbox" id="setAutoPronounce"'+(s.autoPronounce?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='<div style="font-size:.75rem;color:var(--text2);margin-top:4px">کلمه هنگام نمایش کارت مرور خودکار خوانده می‌شود</div>';
h+='</div></div>';
// ── Card Template ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">🎴 قالب کارت مرور</h3>';
h+='<p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">انتخاب کنید چه اطلاعاتی روی کارت مرور نمایش داده شود.</p>';
h+='<div style="display:grid;gap:8px;max-width:400px">';
var tmplItems=[['tmplShowIpa','showIpa','نویسه‌گردانی (IPA)'],['tmplShowExamples','showExamples','مثال‌ها'],['tmplShowSynonyms','showSynonyms','مترادف‌ها'],['tmplShowAntonyms','showAntonyms','متضادها'],['tmplShowFamily','showFamily','خانواده واژگانی'],['tmplShowCollocations','showCollocations','همنشینی‌ها']];
tmplItems.forEach(function(item){
  var checked=(S.settings.cardTemplate||{})[item[1]]!==false;
  h+='<label style="display:flex;align-items:center;gap:8px;font-size:.85rem;cursor:pointer"><input type="checkbox" id="'+item[0]+'"'+(checked?' checked':'')+' style="accent-color:var(--accent)"> '+item[2]+'</label>';
});
h+='</div></div>';
// ── Quiz Settings ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">❓ تنظیمات آزمون</h3>';
h+='<div style="display:grid;gap:12px;max-width:400px">';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">تعداد سؤال آزمون</label>';
h+='<select class="input" id="setQuizCount"><option value="10"'+((s.quizCount||10)===10?' selected':'')+'>۱۰</option><option value="20"'+(s.quizCount===20?' selected':'')+'>۲۰</option><option value="30"'+(s.quizCount===30?' selected':'')+'>۳۰</option><option value="50"'+(s.quizCount===50?' selected':'')+'>۵۰</option></select></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">نمایش پاسخ فوری</label><input type="checkbox" id="setQuizInstant"'+(s.quizInstantFeedback?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">آزمون فقط کلمات ناشناخته</label><input type="checkbox" id="setQuizUnknownOnly"'+(s.quizUnknownOnly?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">آزمون تطبیقی (سؤال بیشتر از کلمات سخت‌تر)</label><input type="checkbox" id="setQuizAdaptive"'+(s.quizAdaptive!==false?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='</div></div>';
// ── Notification ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">🔔 یادآوری روزانه</h3>';
h+='<p style="color:var(--text2);font-size:.85rem;margin-bottom:12px">اگر کارتی برای مرور دارید، یادآوری دریافت کنید.</p>';
h+='<div style="display:grid;gap:12px;max-width:400px">';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">فعال‌سازی یادآوری</label><input type="checkbox" id="setNotif"'+(s.notifications?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">ساعت یادآوری</label><input type="time" class="input" id="setNotifTime" value="'+(s.notificationTime||'09:00')+'" style="max-width:200px"></div>';
h+='</div></div>';
// ── Accessibility ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">♿ دسترسی‌پذیری</h3>';
h+='<div style="display:grid;gap:12px;max-width:400px">';
h+='<div><label style="display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px">اندازه فونت</label>';
h+='<select class="input" id="setFontSize"><option value="small"'+(S.settings.fontSize==='small'?' selected':'')+'>کوچک (14px)</option><option value="normal"'+(!S.settings.fontSize||S.settings.fontSize==='normal'?' selected':'')+'>عادی (16px)</option><option value="large"'+(S.settings.fontSize==='large'?' selected':'')+'>بزرگ (18px)</option><option value="xlarge"'+(S.settings.fontSize==='xlarge'?' selected':'')+'>خیلی بزرگ (20px)</option></select></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">حالت کنتراست بالا</label><input type="checkbox" id="setHighContrast"'+(S.settings.theme==='high-contrast'?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">کاهش حرکت (انیمیشن)</label><input type="checkbox" id="setReduceMotion"'+(S.settings.reduceMotion?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='</div></div>';
// ── Theme & Info ──
var themeOptions=[
  ['dark','🌙','تاریک','آرام و مناسب مطالعه شبانه'],
  ['light','☀️','روشن','شفاف و مناسب محیط‌های روشن'],
  ['ocean','🌊','اقیانوسی','آبی و آرامش‌بخش'],
  ['forest','🌲','جنگلی','سبز و طبیعی'],
  ['sunset','🌅','غروب','گرم و پرانرژی'],
  ['lavender','💜','اسطوخودوسی','بنفش ملایم و دوستانه'],
  ['high-contrast','◐','کنتراست بالا','خوانایی بیشتر']
];
var activeTheme=themeOptions.some(function(t){return t[0]===s.theme})?s.theme:'dark';
h+='<div class="card theme-settings-card" style="margin-bottom:16px"><h3 style="margin-bottom:8px">🎨 پوسته برنامه</h3><p style="color:var(--text2);font-size:.82rem;margin-bottom:14px">ظاهر برنامه را انتخاب کنید. تغییر پوسته بلافاصله اعمال و ذخیره می‌شود.</p><div class="theme-picker" role="radiogroup" aria-label="انتخاب پوسته">';
themeOptions.forEach(function(t){h+='<button type="button" class="theme-option '+(activeTheme===t[0]?'active':'')+'" data-app-theme="'+t[0]+'" role="radio" aria-checked="'+(activeTheme===t[0])+'"><span class="theme-option-icon">'+t[1]+'</span><span class="theme-option-text"><strong>'+t[2]+'</strong><small>'+t[3]+'</small></span><span class="theme-option-check">✓</span></button>'});
h+='</div><div class="theme-stats stat-grid" style="margin-top:14px">';
h+='<div class="theme-preview" data-preview-theme="'+activeTheme+'" aria-label="پیش‌نمایش پوسته فعال"></div>';
h+='<div class="stat-grid" style="margin-bottom:0">';
h+='<div class="stat-card"><div class="val">'+(themeOptions.find(function(t){return t[0]===activeTheme})||themeOptions[0])[1]+'</div><div class="lbl">'+(themeOptions.find(function(t){return t[0]===activeTheme})||themeOptions[0])[2]+'</div></div>';
h+='<div class="stat-card"><div class="val">'+dataSize+' KB</div><div class="lbl">حجم داده</div></div>';
h+='<div class="stat-card"><div class="val">'+(S.words.length+S.longTerm.length)+'</div><div class="lbl">کل کلمات</div></div>';
h+='<div class="stat-card"><div class="val">'+S.stats.reviewed+'</div><div class="lbl">کل مرورها</div></div>';
h+='</div></div>';
// ── Category Management ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">📁 مدیریت دسته‌بندی‌ها</h3>';
h+='<div id="catManager" style="max-height:300px;overflow-y:auto;margin-bottom:12px">';
S.categories.forEach(function(cat){
  var count=S.words.filter(function(w){return w.category===cat}).length;
  h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);gap:8px">';
  h+='<div><strong>'+esc(cat)+'</strong> <span style="color:var(--text2);font-size:.78rem">('+count+' کلمه)</span></div>';
  h+='<div style="display:flex;gap:4px">';
  h+='<button type="button" class="btn btn-ghost btn-sm" data-cat-rename="'+esc(cat)+'" style="font-size:.7rem">✏️</button>';
  if(cat!=='پیش‌فرض')h+='<button type="button" class="btn btn-ghost btn-sm" data-cat-delete="'+esc(cat)+'" style="font-size:.7rem;color:var(--danger)">🗑️</button>';
  h+='</div></div>';
});
h+='</div>';
h+='<div class="flex"><input type="text" class="input" id="newCatInput" placeholder="نام دسته جدید..." style="max-width:200px;font-size:.85rem"><button type="button" class="btn btn-primary btn-sm" id="addCatBtn">افزودن</button></div>';
h+='</div>';
// ── Keyboard Shortcuts ──
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px">⌨️ میانبرهای کیبورد</h3>';
h+='<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:.85rem">';
var shortcuts=[['Space / Enter','برگشت کارت'],['۱ / ۲ / ۳ / ۴','امتیازدهی'],['← / →','جابجایی صفحه (خواندن)'],['Home / End','صفحه اول/آخر'],['+ / -','زوم (نقشه واژگان)'],['Esc','بستن پاپ‌آپ']];
shortcuts.forEach(function(s){
  h+='<div style="padding:4px 10px;background:var(--bg);border-radius:6px;font-family:monospace;font-size:.8rem;text-align:center">'+s[0]+'</div>';
  h+='<div style="color:var(--text2)">'+s[1]+'</div>';
});
h+='</div></div>';
// ── Google Drive Sync ──
var drv=driveSettings();
h+='<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">☁️ همگام‌سازی گوگل درایو</h3>';
h+='<p style="color:var(--text2);font-size:.82rem;line-height:1.8;margin-bottom:10px">پشتیبان خودکار داده‌ها در فضای خصوصی گوگل درایو (AppData). برای اتصال، یک Client ID از کنسول گوگل بسازید:</p>';
h+='<ol style="color:var(--text2);font-size:.8rem;line-height:2;margin-bottom:12px;padding-right:18px"><li>در <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console</a> یک پروژه بسازید.</li><li>«OAuth consent screen» را با نوع External پیکربندی کنید و ایمیل خود را به عنوان Test user اضافه کنید.</li><li>یک «OAuth Client ID» از نوع Web application بسازید و این آدرس‌ها را در Authorized JavaScript origins وارد کنید: <code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:.72rem" dir="ltr">https://mohsen-niksirat.github.io</code> و <code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:.72rem" dir="ltr">http://127.0.0.1:8745</code></li><li>Client ID را در کادر زیر وارد کنید.</li></ol>';
h+='<div style="display:flex;gap:8px;margin-bottom:12px"><input class="input" id="driveClientId" placeholder="Client ID گوگل (مثل 1234-xxxx.apps.googleusercontent.com)" value="'+esc(drv.clientId||'1048349568529-5our29tuemgr642aqf5t1qqnfsf05ea0.apps.googleusercontent.com')+'" style="flex:1;font-size:.78rem" dir="ltr"><button type="button" class="btn btn-sm btn-primary" id="driveConnectBtn">'+(drv.connected?'🔁 اتصال مجدد':'🔗 اتصال')+'</button></div>';
if(drv.connected)h+='<div style="font-size:.78rem;color:var(--success);margin-bottom:10px">✅ متصل است'+(drv.lastSyncAt?' — آخرین همگام: '+new Date(drv.lastSyncAt).toLocaleString('fa-IR'):'')+'</div>';
h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button type="button" class="btn btn-sm btn-ghost" id="driveSyncNowBtn">📤 پشتیبان‌گیری الان</button><button type="button" class="btn btn-sm btn-ghost" id="driveRestoreBtn">📥 بازیابی از ابر</button><button type="button" class="btn btn-sm btn-ghost" id="driveDisconnectBtn" style="color:var(--danger)">⛔ قطع اتصال</button></div>';
h+='<div class="flex"><label style="font-size:.85rem;color:var(--text2)">همگام‌سازی خودکار هنگام هر ذخیره</label><input type="checkbox" id="driveAutoSync"'+(drv.autoSync?' checked':'')+' style="accent-color:var(--accent)"></div>';
h+='</div>';
// ── Storage & Security ──
h+='<div class="card"><h3 style="margin-bottom:12px">💾 ذخیره‌سازی و امنیت</h3>';
h+='<p style="color:var(--text2);font-size:.85rem;line-height:1.8">داده‌ها در مرورگر شما ذخیره می‌شوند و هرگز به سرور ارسال نمی‌شوند. پشتیبان خودکار در IndexedDB نگهداری می‌شود. حریم خصوصی شما کاملاً حفظ می‌شود.</p>';
h+='<div style="margin-top:12px;padding:10px;background:var(--bg);border-radius:10px;font-size:.8rem;color:var(--text2)">';
h+='<div>📦 نسخه: <strong>۴.۰</strong></div>';
h+='<div>💾 حجم داده: <strong>'+dataSize+' KB</strong></div>';
h+='<div>📊 کل کلمات: <strong>'+(S.words.length+S.longTerm.length)+'</strong></div>';
h+='<div>🕐 آخرین مرور: <strong>'+(S.stats.lastReviewDate?fmtDate(S.stats.lastReviewDate):'—')+'</strong></div>';
h+='</div></div>';
c.innerHTML=h;
// ── Event Bindings ──
document.getElementById('setSourceLang').onchange=function(e){S.settings.sourceLang=e.target.value;save()};
document.getElementById('setTargetLang').onchange=function(e){S.settings.targetLang=e.target.value;save()};
document.getElementById('setSpeechRate').onchange=function(e){S.settings.speechRate=parseFloat(e.target.value);save()};
document.getElementById('setAutoPronounce').onchange=function(e){S.settings.autoPronounce=e.target.checked;save()};
// Daily goal
var goalSlider=document.getElementById('setDailyGoal');
goalSlider.oninput=function(){document.getElementById('dailyGoalVal').textContent=this.value};
goalSlider.onchange=function(){S.settings.dailyGoal=parseInt(this.value);save()};
// Review limit
var limitSlider=document.getElementById('setReviewLimit');
limitSlider.oninput=function(){document.getElementById('reviewLimitVal').textContent=this.value};
limitSlider.onchange=function(){S.settings.reviewLimit=parseInt(this.value);save()};
// Card template
if(!S.settings.cardTemplate)S.settings.cardTemplate={showIpa:true,showExamples:true,showSynonyms:true,showAntonyms:true,showFamily:true,showCollocations:true};
tmplItems.forEach(function(item){
  var el=document.getElementById(item[0]);
  if(el)el.onchange=function(){S.settings.cardTemplate[item[1]]=this.checked;save()};
});
// Quiz settings
document.getElementById('setQuizCount').onchange=function(e){S.settings.quizCount=parseInt(e.target.value);save()};
document.getElementById('setQuizInstant').onchange=function(e){S.settings.quizInstantFeedback=e.target.checked;save()};
document.getElementById('setQuizUnknownOnly').onchange=function(e){S.settings.quizUnknownOnly=e.target.checked;save()};
var qAdapt=document.getElementById('setQuizAdaptive');if(qAdapt)qAdapt.onchange=function(e){S.settings.quizAdaptive=e.target.checked;save()};
// Accessibility
document.getElementById('setFontSize').onchange=function(e){S.settings.fontSize=e.target.value;document.documentElement.setAttribute('data-fontsize',e.target.value);save()};
document.getElementById('setHighContrast').onchange=function(e){
  if(e.target.checked){S.settings.theme='high-contrast';document.documentElement.setAttribute('data-theme','high-contrast')}
  else{S.settings.theme='dark';document.documentElement.setAttribute('data-theme','dark')}
  applyTheme();save();
};
document.getElementById('setReduceMotion').onchange=function(e){S.settings.reduceMotion=e.target.checked;save()};
document.querySelectorAll('[data-app-theme]').forEach(function(btn){btn.onclick=function(){var theme=btn.dataset.appTheme;S.settings.theme=theme;applyTheme();save();renderSettings(c)}});
// Notifications
document.getElementById('setNotif').onchange=async function(e){
  if(e.target.checked){
    if('Notification' in window){
      var perm=await Notification.requestPermission();
      if(perm==='granted'){S.settings.notifications=true;save();toast('یادآوری فعال شد','success')}
      else{e.target.checked=false;toast('اجازه اعلان داده نشد','error')}
    }else{e.target.checked=false;toast('مرورگر از اعلان پشتیبانی نمی‌کند','error')}
  }else{S.settings.notifications=false;save()}
};
document.getElementById('setNotifTime').onchange=function(e){S.settings.notificationTime=e.target.value;save()};
// Google Drive bindings
var dCl=document.getElementById('driveClientId');
if(dCl)dCl.onchange=function(e){var d=driveSettings();d.clientId=e.target.value.trim();if(d.clientId&&!d.connected){d.connected=true;save();toast('Client ID ذخیره شد — برای همگام روی «اتصال» بزنید','success')}else save()};
var dCn=document.getElementById('driveConnectBtn');
if(dCn)dCn.onclick=function(){var d=driveSettings();if(!document.getElementById('driveClientId').value.trim()){toast('ابتدا Client ID را وارد کنید','error');return}loadGisLib().then(function(){ensureDriveToken().then(function(){renderSettings(c)}).catch(function(e){})}).catch(function(e){toast(e.message,'error')})};
var dSn=document.getElementById('driveSyncNowBtn');
if(dSn)dSn.onclick=function(){syncNow()};
var dRs=document.getElementById('driveRestoreBtn');
if(dRs)dRs.onclick=function(){restoreFromDrive()};
var dDs=document.getElementById('driveDisconnectBtn');
if(dDs)dDs.onclick=function(){disconnectDrive();renderSettings(c)};
var dAs=document.getElementById('driveAutoSync');
if(dAs)dAs.onchange=function(e){driveSettings().autoSync=e.target.checked;save();toast(e.target.checked?'همگام‌سازی خودکار فعال شد':'همگام‌سازی خودکار غیرفعال شد','info')};
// Category management
document.getElementById('addCatBtn').onclick=function(){
  var input=document.getElementById('newCatInput');
  var name=input.value.trim();
  if(!name){toast('نام دسته را وارد کنید','error');return}
  if(S.categories.includes(name)){toast('این دسته از قبل وجود دارد','error');return}
  S.categories.push(name);save();toast('دسته «'+name+'» اضافه شد','success');renderSettings(c);
};
document.getElementById('newCatInput').onkeydown=function(e){if(e.key==='Enter')document.getElementById('addCatBtn').click()};
document.querySelectorAll('[data-cat-rename]').forEach(function(btn){
  btn.onclick=function(){
    var oldName=btn.dataset.catRename;
    var newName=prompt('نام جدید دسته:',oldName);
    if(!newName||newName.trim()===oldName)return;
    newName=newName.trim();
    if(S.categories.includes(newName)){toast('این دسته از قبل وجود دارد','error');return}
    var idx=S.categories.indexOf(oldName);
    if(idx>=0)S.categories[idx]=newName;
    S.words.forEach(function(w){if(w.category===oldName)w.category=newName});
    save();toast('دسته به «'+newName+'» تغییر نام یافت','success');renderSettings(c);
  };
});
document.querySelectorAll('[data-cat-delete]').forEach(function(btn){
  btn.onclick=function(){
    var cat=btn.dataset.catDelete;
    var count=S.words.filter(function(w){return w.category===cat}).length;
    if(!confirm('حذف دسته «'+cat+'»؟ '+count+' کلمه به «پیش‌فرض» منتقل می‌شوند.'))return;
    S.words.forEach(function(w){if(w.category===cat)w.category='پیش‌فرض'});
    S.categories=S.categories.filter(function(c){return c!==cat});
    save();toast('دسته «'+cat+'» حذف شد','success');renderSettings(c);
  };
});
}

// ═══════════════════════════════════════════
