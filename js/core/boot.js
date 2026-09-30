// IndexedDB is the source of truth. The legacy localStorage snapshot is read only once for migration.
// ═══════════════════════════════════════════
// THEME & INIT
// ═══════════════════════════════════════════
export function applyTheme(){const theme=S.settings.theme||'dark';document.documentElement.setAttribute('data-theme',theme);if(theme==='custom'){var ct=S.settings.customTheme||{};var root=document.documentElement;root.style.setProperty('--bg',ct.bg||'#171326');root.style.setProperty('--bg2',ct.bg2||ct.bg||'#241c3a');root.style.setProperty('--card',ct.card||'#30264b');root.style.setProperty('--text',ct.text||'#f5f0ff');root.style.setProperty('--accent',ct.accent||'#b197fc');root.style.setProperty('--accent2',ct.accent2||ct.accent||'#d0bfff');}else document.documentElement.removeAttribute('style');const icons={dark:'🌙',light:'☀️',ocean:'🌊',forest:'🌲',sunset:'🌅',lavender:'💜','high-contrast':'◐',custom:'🎨'};const btn=document.getElementById('themeBtn');if(btn)btn.textContent=icons[theme]||'🎨';}

export function syncSidebarUI(){const sb=document.getElementById('sidebar');const mn=document.getElementById('main');const ov=document.getElementById('sidebarOverlay');const open=sb.classList.contains('open');const mobile=window.matchMedia('(max-width:1023px)').matches;if(ov)ov.classList.toggle('visible',open&&mobile);mn.className=open?'main sidebar-open':'main sidebar-closed';document.body.classList.toggle('no-scroll',open&&mobile);}

export function closeMobileSidebar(){if(!window.matchMedia('(max-width:1023px)').matches)return;const sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');syncSidebarUI()}}

export function updateLockBtn(){const lockBtn=document.getElementById('sidebarLockBtn');if(!lockBtn)return;const locked=!!S.settings.sidebarLocked;lockBtn.classList.toggle('is-locked',locked);lockBtn.setAttribute('aria-pressed',String(locked));lockBtn.title=locked?'سایدبار قفل است — برای باز کردن کلیک کنید':'سایدبار باز است — برای قفل کردن کلیک کنید';const icon=lockBtn.querySelector('.sidebar-lock-icon');const label=lockBtn.querySelector('.sidebar-lock-state');if(icon)icon.textContent=locked?'🔒':'🔓';if(label)label.textContent=locked?'قفل است':'باز است';}

export function bootApp(){
  loadFromIDB().then(function(idbData){
    if(idbData){
      window.S=hydrateState(idbData);
      rebuildIndex();
      if(typeof render==='function')render();
      return;
    }
    const legacy=loadLegacyState();
    if(!legacy)return;
    window.S=legacy;
    rebuildIndex();
    return idbPut('state',window.S).then(function(){
      try{localStorage.removeItem(LS_KEY);localStorage.removeItem(LS_KEY_V1);localStorage.removeItem(LS_KEY_OLD)}catch(e){}
      if(typeof render==='function')render();
    });
  }).catch(function(error){
    console.warn('[Storage] IndexedDB unavailable:',error);
    toast('حافظه IndexedDB در دسترس نیست؛ داده‌ها ذخیره نمی‌شوند','error');
  });
  checkDriveOnLoad();
  window.addEventListener('leitner:updated',function(){
    if(typeof toast==='function')toast('نسخه جدید برنامه آماده است؛ برای اعمال آن صفحه را بازنشانی کنید.','info');
    var banner=document.getElementById('offlineBanner');
    if(banner&&navigator.onLine){banner.textContent='✨ نسخه جدید آماده است — صفحه را بازنشانی کنید';banner.classList.add('visible');banner.style.cursor='pointer';banner.onclick=function(){location.reload()}}
  });
  document.getElementById('themeBtn').onclick=()=>{S.settings.theme=S.settings.theme==='dark'?'light':'dark';save();applyTheme();render()};
  document.getElementById('hamBtn').onclick=()=>{document.getElementById('sidebar').classList.toggle('open');syncSidebarUI()};
  const _overlayEl=document.getElementById('sidebarOverlay');
  if(_overlayEl)_overlayEl.onclick=()=>{document.getElementById('sidebar').classList.remove('open');syncSidebarUI()};
  try{const _sbEl=document.getElementById('sidebar');if(_sbEl){let _swStartX=null,_swStartY=null;const _sbOnTouchStart=function(e){if(!_sbEl.classList.contains('open'))return;const t=e.changedTouches[0];_swStartX=t.clientX;_swStartY=t.clientY};const _sbOnTouchMove=function(e){if(_swStartX===null)return;const t=e.changedTouches[0];const dx=t.clientX-_swStartX,dy=t.clientY-_swStartY;if(!_sbEl.classList.contains('open')){_swStartX=null;return}if(dx>28&&Math.abs(dx)>Math.abs(dy)*1.6){_swStartX=null;closeMobileSidebar()}};_sbEl.addEventListener('touchstart',_sbOnTouchStart,{passive:true});_sbEl.addEventListener('touchmove',_sbOnTouchMove,{passive:true});} }catch(_e){}
  window.addEventListener('resize',syncSidebarUI);
  // Initialize sidebar state
  if(S.settings.sidebarLocked){document.getElementById('sidebar').classList.add('open')}else{document.getElementById('sidebar').classList.remove('open')}
  syncSidebarUI();
  // Lock button
  const lockBtn=document.getElementById('sidebarLockBtn');
  updateLockBtn();
  if(lockBtn)lockBtn.onclick=()=>{S.settings.sidebarLocked=!S.settings.sidebarLocked;save();updateLockBtn();if(S.settings.sidebarLocked){document.getElementById('sidebar').classList.add('open')}else{document.getElementById('sidebar').classList.remove('open')}syncSidebarUI()};
  // Restore PDF state if available - show on PDF reader tab
  const savedPdf=loadPdfState();
  if(savedPdf&&savedPdf.fileName)window.pdfFileName=savedPdf.fileName;
  // Restore reading settings
  try{var _rdDash=localStorage.getItem('leitner_reading_dashVisible');if(_rdDash!==null)window.readingDashboardVisible=_rdDash==='1';var _rdFont=localStorage.getItem('leitner_reading_fontSize');if(_rdFont)window.readingFontSize=parseFloat(_rdFont);var _rdLH=localStorage.getItem('leitner_reading_lineHeight');if(_rdLH)window.readingLineHeight=parseFloat(_rdLH);var _rdTheme=localStorage.getItem('leitner_reading_contentTheme');if(_rdTheme)window.readingContentTheme=_rdTheme;}catch(e){}
  applyTheme();if(S.settings.fontSize)document.documentElement.setAttribute('data-fontsize',S.settings.fontSize);render();rebuildIndex();checkSharedDeckHash();
  // دریافت خودکار کارت‌های ارسال‌شده از وکب فورج (بعد از بارگذاری کامل داده‌ها)
  setTimeout(function(){if(typeof receivePendingVocabForge==='function'&&receivePendingVocabForge())render()},600);
}
