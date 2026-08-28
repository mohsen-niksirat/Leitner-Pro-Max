// IndexedDB is the source of truth. The legacy localStorage snapshot is read only once for migration.
loadFromIDB().then(function(idbData){
  if(idbData){
    S=hydrateState(idbData);
    rebuildIndex();
    if(typeof render==='function')render();
    return;
  }
  const legacy=loadLegacyState();
  if(!legacy)return;
  S=legacy;
  rebuildIndex();
  return idbPut('state',S).then(function(){
    try{localStorage.removeItem(LS_KEY);localStorage.removeItem(LS_KEY_V1);localStorage.removeItem(LS_KEY_OLD)}catch(e){}
    if(typeof render==='function')render();
  });
}).catch(function(error){
  console.warn('[Storage] IndexedDB unavailable:',error);
  toast('حافظه IndexedDB در دسترس نیست؛ داده‌ها ذخیره نمی‌شوند','error');
});
checkDriveOnLoad();
// [Refactor Phase 1] moved to js/storage/state.js
// [Refactor Phase 1] moved to js/core/utils.js

// [Refactor Phase 1] moved to js/core/error-handler.js

// [Refactor Phase 1] moved to js/vocabulary/vocabulary.js

// [Refactor Phase 1] moved to js/storage/backup.js

// [Refactor Phase 1] moved to js/statistics/leaderboard.js

// [Refactor Phase 3] moved to js/vocabulary/vocabulary.js
// [Refactor Phase 3] moved to js/ui/toast.js
// [Refactor Phase 3] moved to js/vocabulary/enrichment.js
// [Refactor Phase 4] moved to js/storage/backup.js

// [Refactor Phase 4] moved to js/ui/translation-popup.js
// [Refactor Phase 5] moved to js/ui/navigation.js
// [Refactor Phase 5] moved to js/vocabulary/library.js
// [Refactor Phase 6] moved to js/vocabulary/import.js
// [Refactor Phase 7] moved to js/pdf/reader.js
// [Refactor Phase 7] moved to js/pdf/pdf-mobile.js
// [Refactor Phase 8] moved to js/reading/reading.js
// [Refactor Phase 8] moved to js/vocabulary/export.js
// [Refactor Phase 9] moved to js/statistics/statistics.js
// [Refactor Phase 10] moved to js/learning/quiz.js
// [Refactor Phase 11] moved to js/ai/ai-manager.js
// [Refactor Phase 13] renderSettings moved to js/ui/settings.js
// [Refactor Phase 12] moved to js/learning/quiz.js
// [Refactor Phase 12] moved to js/learning/review.js
// [Refactor Phase 12] moved to js/learning/review.js
// [Refactor Phase 12] moved to js/word-web/word-web.js
// THEME & INIT
// ═══════════════════════════════════════════
function applyTheme(){document.documentElement.setAttribute('data-theme',S.settings.theme);document.getElementById('themeBtn').textContent=S.settings.theme==='dark'?'🌙':'☀️'}
document.getElementById('themeBtn').onclick=()=>{S.settings.theme=S.settings.theme==='dark'?'light':'dark';save();applyTheme();render()};
function syncSidebarUI(){const sb=document.getElementById('sidebar');const mn=document.getElementById('main');const ov=document.getElementById('sidebarOverlay');const open=sb.classList.contains('open');const mobile=window.matchMedia('(max-width:1023px)').matches;if(ov)ov.classList.toggle('visible',open&&mobile);mn.className=open?'main sidebar-open':'main sidebar-closed';document.body.classList.toggle('no-scroll',open&&mobile);}document.getElementById('hamBtn').onclick=()=>{document.getElementById('sidebar').classList.toggle('open');syncSidebarUI()};const _overlayEl=document.getElementById('sidebarOverlay');if(_overlayEl)_overlayEl.onclick=()=>{document.getElementById('sidebar').classList.remove('open');syncSidebarUI()};function closeMobileSidebar(){if(!window.matchMedia('(max-width:1023px)').matches)return;const sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');syncSidebarUI()}}try{const _sbEl=document.getElementById('sidebar');if(_sbEl){let _swStartX=null,_swStartY=null;const _sbOnTouchStart=function(e){if(!_sbEl.classList.contains('open'))return;const t=e.changedTouches[0];_swStartX=t.clientX;_swStartY=t.clientY};const _sbOnTouchMove=function(e){if(_swStartX===null)return;const t=e.changedTouches[0];const dx=t.clientX-_swStartX,dy=t.clientY-_swStartY;if(!_sbEl.classList.contains('open')){_swStartX=null;return}if(dx>28&&Math.abs(dx)>Math.abs(dy)*1.6){_swStartX=null;closeMobileSidebar()}};_sbEl.addEventListener('touchstart',_sbOnTouchStart,{passive:true});_sbEl.addEventListener('touchmove',_sbOnTouchMove,{passive:true});} }catch(_e){}window.addEventListener('resize',syncSidebarUI);
// Initialize sidebar state
if(S.settings.sidebarLocked){document.getElementById('sidebar').classList.add('open')}else{document.getElementById('sidebar').classList.remove('open')}syncSidebarUI();
// Lock button
const lockBtn=document.getElementById('sidebarLockBtn');
function updateLockBtn(){if(!lockBtn)return;const locked=!!S.settings.sidebarLocked;lockBtn.classList.toggle('is-locked',locked);lockBtn.setAttribute('aria-pressed',String(locked));lockBtn.title=locked?'سایدبار قفل است — برای باز کردن کلیک کنید':'سایدبار باز است — برای قفل کردن کلیک کنید';const icon=lockBtn.querySelector('.sidebar-lock-icon');const label=lockBtn.querySelector('.sidebar-lock-state');if(icon)icon.textContent=locked?'🔒':'🔓';if(label)label.textContent=locked?'قفل است':'باز است';}
updateLockBtn();
lockBtn.onclick=()=>{S.settings.sidebarLocked=!S.settings.sidebarLocked;save();updateLockBtn();if(S.settings.sidebarLocked){document.getElementById('sidebar').classList.add('open')}else{document.getElementById('sidebar').classList.remove('open')}syncSidebarUI()};
// Restore PDF state if available - show on PDF reader tab
const savedPdf=loadPdfState();
if(savedPdf&&savedPdf.fileName)pdfFileName=savedPdf.fileName;
// Restore reading settings
try{var _rdDash=localStorage.getItem('leitner_reading_dashVisible');if(_rdDash!==null)readingDashboardVisible=_rdDash==='1';var _rdFont=localStorage.getItem('leitner_reading_fontSize');if(_rdFont)readingFontSize=parseFloat(_rdFont);var _rdLH=localStorage.getItem('leitner_reading_lineHeight');if(_rdLH)readingLineHeight=parseFloat(_rdLH);var _rdTheme=localStorage.getItem('leitner_reading_contentTheme');if(_rdTheme)readingContentTheme=_rdTheme;}catch(e){}
applyTheme();if(S.settings.fontSize)document.documentElement.setAttribute('data-fontsize',S.settings.fontSize);render();rebuildIndex();checkSharedDeckHash();
// دریافت خودکار کارت‌های ارسال‌شده از وکب فورج (بعد از بارگذاری کامل داده‌ها)
setTimeout(function(){if(typeof receivePendingVocabForge==='function'&&receivePendingVocabForge())render()},600);
// Re-init quiz delegation after each render
const origRender=render;
render=function(){origRender();if(currentTab==='quiz')initQuiz()};
