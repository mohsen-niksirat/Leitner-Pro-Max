// TOAST
// ═══════════════════════════════════════════
function trackWordAdded(){var dk=todayKey();if(!S.stats.history[dk])S.stats.history[dk]={reviewed:0,correct:0,wrong:0};if(!S.stats.history[dk].added)S.stats.history[dk].added=0;S.stats.history[dk].added++}
function toast(msg,type='info'){
const c=document.getElementById('toasts');
const t=document.createElement('div');
t.className='toast toast-'+type;
t.textContent=msg;
c.appendChild(t);
setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},2500)}

