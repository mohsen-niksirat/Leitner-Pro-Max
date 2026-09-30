export function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
export function errMsg(e){if(!e)return 'unknown error';if(typeof e==='string')return e;if(typeof e==='object'){if(e.message)return e.message;if(e.error&&e.error.message)return e.error.message;if(e.name&&e.reason)return e.name+': '+e.reason;if(e.name)return e.name}return String(e)}
export function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
export function fmtDate(d){if(!d)return'-';return new Date(d).toLocaleDateString('fa-IR')}
export function todayKey(){return new Date().toISOString().slice(0,10)}
