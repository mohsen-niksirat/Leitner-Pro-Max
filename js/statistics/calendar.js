// SMART CALENDAR — تقویم مرور هوشمند
// ═══════════════════════════════════════════
function renderCalendar(c){
  const today=new Date();
  const predictions=[];
  for(let d=0;d<30;d++){
    const date=new Date(today);date.setDate(date.getDate()+d);
    const dateStr=date.toISOString().slice(0,10);
    let count=0;
    S.words.forEach(w=>{
      if(!w.due)return;
      const dueDate=w.due.slice(0,10);
      if(dueDate===dateStr)count++;
    });
    predictions.push({date:dateStr,count,day:date.toLocaleDateString('fa-IR',{weekday:'short'}),num:date.getDate()});
  }
  const totalDue=predictions.reduce((s,p)=>s+p.count,0);
  const maxCount=Math.max(1,...predictions.map(p=>p.count));
  c.innerHTML=`<div style="max-width:700px;margin:0 auto">
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
      <div class="stat-card"><div class="val" style="color:var(--accent)">${getDue().length}</div><div class="lbl">قابل مرور امروز</div></div>
      <div class="stat-card"><div class="val" style="color:var(--success)">${totalDue}</div><div class="lbl">کل مرور ۳۰ روز</div></div>
      <div class="stat-card"><div class="val" style="color:var(--warning)">${S.words.length}</div><div class="lbl">کل کلمات</div></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:16px;color:var(--accent)">📅 پیش‌بینی مرور ۳۰ روز آینده</h3>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
        ${predictions.map(p=>{
          const pct=p.count/maxCount;
          const bg=pct>0.7?'var(--danger)':pct>0.3?'var(--warning)':pct>0?'var(--success)':'var(--bg)';
          const isToday=p.date===todayKey();
          return `<div style="text-align:center;padding:8px 4px;border-radius:10px;background:${pct>0?bg:'var(--bg)'};color:${pct>0.3?'#fff':'var(--text)'};border:${isToday?'2px solid var(--accent)':'1px solid var(--border)'};font-size:.75rem;min-height:60px;display:flex;flex-direction:column;justify-content:center">
            <div style="font-size:.65rem;opacity:.7">${p.day}</div>
            <div style="font-weight:700;font-size:.9rem">${p.num}</div>
            <div style="font-size:.7rem;margin-top:2px">${p.count>0?p.count+' کلمه':'—'}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;font-size:.75rem;color:var(--text2)">
        <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--success);display:inline-block"></span> کم</span>
        <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--warning);display:inline-block"></span> متوسط</span>
        <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--danger);display:inline-block"></span> زیاد</span>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3 style="margin-bottom:12px;color:var(--accent)">📊 نمودار پیش‌بینی</h3>
      <div style="display:flex;align-items:flex-end;gap:4px;height:150px;padding:10px 0">
        ${predictions.slice(0,14).map(p=>{
          const h=Math.max(4,p.count/maxCount*130);
          const bg=p.count>maxCount*0.7?'var(--danger)':p.count>maxCount*0.3?'var(--warning)':'var(--accent)';
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px">
            <div style="font-size:.6rem;color:var(--text2)">${p.count||''}</div>
            <div style="width:100%;height:${h}px;background:${bg};border-radius:4px 4px 0 0;transition:height .3s"></div>
            <div style="font-size:.55rem;color:var(--text2);writing-mode:vertical-rl;transform:rotate(180deg);height:30px;overflow:hidden">${p.day}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
