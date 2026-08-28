function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function fmtDate(d){if(!d)return'-';return new Date(d).toLocaleDateString('fa-IR')}
function todayKey(){return new Date().toISOString().slice(0,10)}
