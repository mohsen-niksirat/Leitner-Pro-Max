// NAVIGATION
// ═══════════════════════════════════════════
export const NAV_GROUPS=[
{label:'یادگیری',items:[
{id:'review',label:'مرور',icon:'📖'},
{id:'quiz',label:'آزمون',icon:'❓'},
{id:'engquiz',label:'تعیین سطح',icon:'🎯'}
]},
{label:'منابع',items:[
{id:'library',label:'کتابخانه',icon:'📚'},
{id:'longterm',label:'حافظه بلندمدت',icon:'🧠'},
{id:'wordweb',label:'نقشه واژگان',icon:'🗺️'}
]},
{label:'ورود / خروج',items:[
{id:'import',label:'ورود کلمات',icon:'📥'},
{id:'vocabforge',label:'وکب فورج',icon:'⚒️'},
{id:'export',label:'خروج / پشتیبان',icon:'💾'}
]},
{label:'خواندن',items:[
{id:'reading',label:'خواندن متن',icon:'📰'},
{id:'pdfreader',label:'خواننده PDF',icon:'📄'},
{id:'pdfmobile',label:'خواننده PDF موبایل',icon:'📱',mobileOnly:true}
]},
{label:'ابزارها',items:[
{id:'stats',label:'آمار و تقویم',icon:'📊'},
{id:'aichat',label:'هوش مصنوعی',icon:'🤖'},
{id:'speakai',label:'مربی مکالمه',icon:'🎙️'}
]},
{label:'سیستم',items:[
{id:'settings',label:'تنظیمات',icon:'⚙️'},
{id:'about',label:'درباره',icon:'ℹ️'}
]}
];
export const TABS=NAV_GROUPS.flatMap(g=>g.items);
export let currentTab='review';
if(typeof window!=='undefined'){
  Object.defineProperty(window,'currentTab',{configurable:true,get:()=>currentTab,set:(v)=>{currentTab=v;}});
}
export function renderNav(){
const nav=document.getElementById('nav');
if(!nav)return;
const dueCnt=(typeof getDue==='function')?getDue().length:0;
const libCnt=(typeof S!=='undefined'&&Array.isArray(S.words))?S.words.length:0;
const ltCnt=(typeof S!=='undefined'&&Array.isArray(S.longTerm))?S.longTerm.length:0;
const badgeMap={review:dueCnt,library:libCnt,longterm:ltCnt};
let html='';
NAV_GROUPS.forEach((g,i)=>{
if(i>0)html+='<div class="nav-divider"></div>';
html+='<div class="nav-section"><div class="nav-section-label">'+g.label+'</div>';
g.items.forEach(t=>{
const active=t.id===currentTab;
const bVal=badgeMap[t.id]||0;
const badgeHtml=bVal>0?'<span class="nav-count-badge'+(t.id==='review'?' nav-badge-due':'')+'">'+bVal+'</span>':'';
html+='<button type="button" class="nav-btn'+(active?' active':'')+'" data-tab="'+t.id+'"><span class="icon">'+t.icon+'</span><span class="nav-label">'+t.label+'</span>'+badgeHtml+'</button>';
});
html+='</div>';
});
nav.innerHTML=html;
nav.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{if(currentTab==='quiz'&&b.dataset.tab!=='quiz')finalizeQuizSession();currentTab=b.dataset.tab;render();if(!S.settings.sidebarLocked){document.getElementById('sidebar').classList.remove('open');syncSidebarUI()}})}
export function render(){
try{
if(currentTab!=='review'&&currentTab!=='pdfreader')document.onkeydown=null;
if(currentTab!=='pdfreader')hideTransPopup();
// Stop auto-play when leaving review
if(currentTab!=='review'&&autoPlayState.active){stopAutoPlay()}
// Clear speed review timer when leaving speed review
if(currentTab!=='speedreview'&&speedState.timer){clearInterval(speedState.timer);speedState.timer=null}
// Clear quiz speed timer when leaving quiz
if(currentTab!=='quiz'&&quizState&&quizState._speedInterval){clearInterval(quizState._speedInterval);quizState._speedInterval=null}
renderNav();
// Render daily challenge widget in sidebar
const dcw=document.getElementById('dailyChallengeWidget');
if(dcw&&typeof renderDailyChallengeWidget==='function')dcw.innerHTML=renderDailyChallengeWidget();
const titles={review:'مرور هوشمند',quiz:'آزمون تعاملی',engquiz:'تعیین سطح',library:'کتابخانه واژگان',longterm:'حافظه بلندمدت',import:'ورود کلمات',reading:'خواندن متن',pdfreader:'خواننده هوشمند PDF',pdfmobile:'خواننده PDF موبایل',wordweb:'نقشه واژگان',stats:'آمار و تقویم',export:'خروج / پشتیبان',aichat:'چت با هوش مصنوعی',speakai:'مربی مکالمه هوشمند',vocabforge:'وکب فورج',settings:'تنظیمات',about:'درباره'};
const subtitles={review:'تکرار فاصله‌دار هوشمند با الگوریتم FSRS-5',quiz:'سنجش سرعت و دقت یادآوری واژگان',engquiz:'ارزیابی استاندارد سطح زبان انگلیسی',library:'مدیریت، دسته‌بندی و ویرایش کارت‌های لایتنر',longterm:'واژگان تثبیت‌شده در حافظه پایدار',import:'افزودن دسته‌ای واژگان از فایل، متن یا بسته‌های آماده',reading:'مطالعه متن با ترجمه و استخراج آنی کلمات',pdfreader:'مطالعه کتاب‌های PDF با لایه کلمات دقیق و ابزارهای Foliate',pdfmobile:'نسخه بهینه‌شده مطالعه برای موبایل و تبلت',wordweb:'گراف ارتباط معنایی، مترادف‌ها و خانواده کلمات',stats:'تحلیل روند یادگیری، تقویم مرور و نمودارهای پیشرفت',export:'پشتیبان‌گیری، اشتراک‌گذاری و همگام‌سازی ابری',aichat:'دستیار هوشمند آموزش و تمرین زبان',speakai:'تمرین مکالمه و تلفظ با هوش مصنوعی',vocabforge:'کارگاه ساخت و غنی‌سازی خودکار کارت‌ها',settings:'شخصی‌سازی پوسته، تلفظ، الگوریتم و کلیدهای API',about:'معرفی امکانات و تاریخچه نسخه‌های لایتنر پرو مکس'};
document.getElementById('pageTitle').textContent=titles[currentTab]||'';
const subEl=document.getElementById('pageSubtitle');
if(subEl)subEl.textContent=subtitles[currentTab]||'';
// Update live stats pills in topbar
const topStats=document.getElementById('topbarStats');
if(topStats&&typeof S!=='undefined'&&S.stats){
  const dueNow=(typeof getDue==='function')?getDue().length:0;
  const streak=S.stats.streak||0;
  const xp=S.stats.xp||0;
  topStats.innerHTML=`<span class="top-stat-pill" title="کارت‌های آماده مرور امروز">📖 <strong>${dueNow}</strong> مرور</span><span class="top-stat-pill" title="زنجیره مطالعه روزانه">🔥 <strong>${streak}</strong> روز</span><span class="top-stat-pill top-stat-xp" title="امتیاز تجربه">⚡ <strong>${xp}</strong> XP</span>`;
}
// Help button in topbar (if this tab has help text)
var _th=document.getElementById('topActions');
if(_th){var _existingHelp=_th.querySelector('[onclick*="showHelp"]');if(HELP_DICT[currentTab]){_existingHelp?_existingHelp.setAttribute('onclick',"showHelp('"+currentTab+"')"):_th.insertAdjacentHTML('beforeend','<button type="button" class="btn btn-ghost btn-sm" onclick="showHelp(\''+currentTab+'\')" title="راهنمای این بخش">🙋 راهنما</button>')}else if(_existingHelp){_existingHelp.remove()}}
// Update page title with due count badge
const dueBadge=getDueAll().length;
document.title=dueBadge>0?'('+dueBadge+') لایتنر — '+titles[currentTab]:'لایتنر — مرور هوشمند';
const c=document.getElementById('content');
const renders={review:renderReview,library:renderLibrary,longterm:renderLongterm,import:(_stagedImportCards.length?renderStagedImport:renderImport),reading:renderReading,pdfreader:renderPDFReader,pdfmobile:renderPDFMobile,wordweb:renderWordWeb,export:renderExport,stats:renderStats,quiz:renderQuiz,engquiz:renderEngQuiz,aichat:renderAiChat,speakai:renderSpeakAi,vocabforge:renderVocabforge,settings:renderSettings,about:renderAbout};
const _renderFn=renders[currentTab];
if(_renderFn){
  try{
    _renderFn(c);
    if(currentTab==='quiz'&&typeof initQuiz==='function')initQuiz();
  }catch(err){
    console.error('[Tab Render Error]',currentTab,err);
    toast('خطا در نمایش «'+(titles[currentTab]||currentTab)+'»: '+(err.message||''),'error');
    c.innerHTML='<div class="card" style="text-align:center;padding:40px"><div class="empty"><div class="icon">⚠️</div><p>خطا در نمایش این بخش</p><p style="font-size:.8rem;color:var(--text2);margin-top:8px">'+esc(err.message||'')+'</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="location.reload()">بازنشانی صفحه</button></div></div>';
  }
}
}catch(err){
console.error('[Render Error]',err);
toast('خطا در نمایش صفحه: '+(err.message||'ناشناخته'),'error');
var _rc=document.getElementById('content');
if(_rc)_rc.innerHTML='<div class="card" style="text-align:center;padding:40px"><div class="empty"><div class="icon">⚠️</div><p>خطا در نمایش این بخش</p><p style="font-size:.8rem;color:var(--text2);margin-top:8px">'+esc(err.message||'')+'</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="location.reload()">بازنشانی صفحه</button></div></div>';
}}
