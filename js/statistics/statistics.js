// 7. STATISTICS (with heatmap + forecast)
// ═══════════════════════════════════════════
let boxChart=null,weekChart=null,forecastChart=null;
function renderStats(c){
const dk=todayKey();
const todayH=S.stats.history[dk]||{reviewed:0,correct:0,wrong:0};
const dueCount=getDueAll().length;
const boxDist={};for(let i=0;i<=10;i++)boxDist[i]=0;
S.words.forEach(w=>{boxDist[Math.min(10,w.box)]=boxDist[Math.min(10,w.box)]+1});
const totalReviewed=S.stats.reviewed;
const accuracyPct=totalReviewed>0?Math.round(S.stats.correct/totalReviewed*100):0;
const masteredCount=S.longTerm.length+S.words.filter(w=>w.box>=5).length;
const levelInfo=getLevel(S.stats.xp);

// Build heatmap data (last 365 days)
const heatmapDays=371;// 53 weeks
const heatmapHtml=buildHeatmap(heatmapDays);

// Build forecast data (next 14 days)
const forecastData=buildForecast(14);

// 30-day calendar predictions
const calPredictions=[];
for(let d=0;d<30;d++){
  const date=new Date();date.setDate(date.getDate()+d);
  const dateStr=date.toISOString().slice(0,10);
  let count=0;
  S.words.forEach(w=>{if(w.due&&w.due.slice(0,10)===dateStr)count++});
  calPredictions.push({date:dateStr,count,day:date.toLocaleDateString('fa-IR',{weekday:'short'}),num:date.getDate()});
}
const calTotalDue=calPredictions.reduce((s,p)=>s+p.count,0);
const calMaxCount=Math.max(1,...calPredictions.map(p=>p.count));

c.innerHTML=`<div class="card" style="margin-bottom:16px;text-align:center;padding:20px"><div style="font-size:2.5rem;margin-bottom:4px">${levelInfo.icon}</div><div style="font-size:1.2rem;font-weight:700;color:var(--accent)">${levelInfo.name}</div><div style="font-size:.85rem;color:var(--text2);margin:6px 0">${levelInfo.xp} امتیاز</div>${levelInfo.next?`<div style="max-width:300px;margin:0 auto"><div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:${levelInfo.progress}%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;transition:width .5s"></div></div><div style="font-size:.75rem;color:var(--text2);margin-top:4px">${levelInfo.next.icon} ${levelInfo.next.name}: ${levelInfo.next.min-levelInfo.xp} امتیاز دیگر</div></div>`:'<div style="font-size:.85rem;color:var(--warning)">حداکثر سطح رسیده!</div>'}</div>
<div class="stat-grid"><div class="card stat-card"><div class="val">${S.words.length}</div><div class="lbl">کل کلمات</div></div><div class="card stat-card"><div class="val">${S.longTerm.length}</div><div class="lbl">حافظه بلندمدت</div></div><div class="card stat-card"><div class="val" style="color:var(--warning)">${dueCount}</div><div class="lbl">مرور امروز</div></div><div class="card stat-card"><div class="val">${todayH.reviewed}</div><div class="lbl">مرور شده امروز</div></div><div class="card stat-card"><div class="val" style="color:var(--success)">${todayH.correct}</div><div class="lbl">درست امروز</div></div><div class="card stat-card"><div class="val" style="color:var(--danger)">${todayH.wrong}</div><div class="lbl">نادرست امروز</div></div><div class="card stat-card"><div class="val">${S.stats.streak}</div><div class="lbl">روز متوالی</div></div><div class="card stat-card"><div class="val" style="color:var(--accent)">${S.stats.xp}</div><div class="lbl">امتیاز کل</div></div><div class="card stat-card"><div class="val" style="color:var(--success)">${accuracyPct}%</div><div class="lbl">دقت کل</div></div><div class="card stat-card"><div class="val" style="color:var(--accent2)">${masteredCount}</div><div class="lbl">تثبیت شده</div></div><div class="card stat-card"><div class="val" style="font-size:1rem">${stateSnapshotSizeKB().toFixed(1)} KB</div><div class="lbl">حجم داده</div></div></div><div class="card" style="margin-bottom:16px;padding:24px"><h3 style="margin-bottom:12px">تقویم مرور (۵۲ هفته اخیر)</h3>${heatmapHtml}<div class="heatmap-legend"><span>کم</span><div class="heatmap-legend-cell heatmap-l0"></div><div class="heatmap-legend-cell heatmap-l1"></div><div class="heatmap-legend-cell heatmap-l2"></div><div class="heatmap-legend-cell heatmap-l3"></div><div class="heatmap-legend-cell heatmap-l4"></div><span>زیاد</span></div></div><div class="grid-2"><div class="card"><h3 style="margin-bottom:12px">توزیع جعبه‌ها</h3><canvas id="boxChart"></canvas></div><div class="card"><h3 style="margin-bottom:12px">۷ روز اخیر</h3><canvas id="weekChart"></canvas></div></div><div class="card" style="margin-top:16px"><h3 style="margin-bottom:12px">پیش‌بینی ۱۴ روز آینده</h3><canvas id="forecastChart"></canvas></div><div class="card" style="margin-top:16px"><h3 style="margin-bottom:12px">📈 نمودار پیشرفت ۳۰ روز اخیر</h3><canvas id="progressChart"></canvas></div><div class="card" style="margin-top:16px"><h3 style="margin-bottom:12px;color:var(--accent)">📅 پیش‌بینی مرور ۳۰ روز آینده <span style="font-size:.75rem;font-weight:400;color:var(--text2)">(${calTotalDue} کلمه کل)</span></h3><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${calPredictions.map(p=>{const pct=p.count/calMaxCount;const bg=pct>0.7?'var(--danger)':pct>0.3?'var(--warning)':pct>0?'var(--success)':'var(--bg)';const isToday=p.date===todayKey();return `<div style="text-align:center;padding:8px 4px;border-radius:10px;background:${pct>0?bg:'var(--bg)'};color:${pct>0.3?'#fff':'var(--text)'};border:${isToday?'2px solid var(--accent)':'1px solid var(--border)'};font-size:.75rem;min-height:60px;display:flex;flex-direction:column;justify-content:center"><div style="font-size:.65rem;opacity:.7">${p.day}</div><div style="font-weight:700;font-size:.9rem">${p.num}</div><div style="font-size:.7rem;margin-top:2px">${p.count>0?p.count+' کلمه':'—'}</div></div>`}).join('')}</div><div style="display:flex;gap:8px;justify-content:center;margin-top:12px;font-size:.75rem;color:var(--text2)"><span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--success);display:inline-block"></span> کم</span><span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--warning);display:inline-block"></span> متوسط</span><span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--danger);display:inline-block"></span> زیاد</span></div></div>`;

if(boxChart){boxChart.destroy();boxChart=null}
if(weekChart){weekChart.destroy();weekChart=null}
if(forecastChart){forecastChart.destroy();forecastChart=null}
var progressChart=null;if(window._progressChart){window._progressChart.destroy();window._progressChart=null}
const labels=Object.keys(boxDist).filter(k=>boxDist[k]>0).map(k=>'جعبه '+k);
const data=Object.keys(boxDist).filter(k=>boxDist[k]>0).map(k=>boxDist[k]);
const isDark=S.settings.theme==='dark';
(async()=>{
  await ensureChartJs();
  if(!document.getElementById('boxChart'))return;
  function mkChart(elId,cfg){
    const el=document.getElementById(elId);
    if(!el)return;
    const prev=typeof Chart.getChart==='function'?Chart.getChart(el):null;
    if(prev)prev.destroy();
    try{return new Chart(el,cfg)}catch(e){console.warn('chart skip',elId,e&&e.message)}
  }
  const baseTicks={color:isDark?'#9aa0b0':'#5f6577'};
  const baseGrid={color:isDark?'#333645':'#e0e3e8'};
  mkChart('boxChart',{type:'bar',data:{labels:labels,datasets:[{data:data,backgroundColor:'rgba(108,92,231,.6)',borderRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:baseTicks,grid:{display:false}},y:{ticks:baseTicks,grid:baseGrid}}}});
  const weekDays=[];const weekData=[];
  for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*MS_PER_DAY).toISOString().slice(0,10);weekDays.push(d.slice(5));weekData.push((S.stats.history[d]||{}).reviewed||0)}
  mkChart('weekChart',{type:'line',data:{labels:weekDays,datasets:[{data:weekData,borderColor:'#6c5ce7',backgroundColor:'rgba(108,92,231,.2)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:baseTicks,grid:{display:false}},y:{ticks:baseTicks,grid:baseGrid}}}});
  mkChart('forecastChart',{type:'bar',data:{labels:forecastData.labels,datasets:[{label:'کارت‌های قابل مرور',data:forecastData.data,backgroundColor:'rgba(253,203,110,.5)',borderColor:'#fdcb6e',borderWidth:1,borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:baseTicks,grid:{display:false}},y:{ticks:baseTicks,grid:baseGrid,beginAtZero:true}}}});
  const progressDays=[];const progressAdded=[];const progressReviewed=[];
  for(let pi=29;pi>=0;pi--){const pd=new Date(Date.now()-pi*MS_PER_DAY).toISOString().slice(0,10);progressDays.push(pd.slice(5));const ph=S.stats.history[pd]||{};progressAdded.push(ph.added||0);progressReviewed.push(ph.reviewed||0)}
  mkChart('progressChart',{type:'line',data:{labels:progressDays,datasets:[{label:'کلمات اضافه شده',data:progressAdded,borderColor:'#00b894',backgroundColor:'rgba(0,184,148,.15)',fill:true,tension:.3,pointRadius:3},{label:'کلمات مرور شده',data:progressReviewed,borderColor:'#6c5ce7',backgroundColor:'rgba(108,92,231,.15)',fill:true,tension:.3,pointRadius:3}]},options:{responsive:true,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:isDark?'#c8cad8':'#333'}}},scales:{x:{ticks:baseTicks,maxRotation:45,grid:{display:false}},y:{ticks:baseTicks,grid:baseGrid,beginAtZero:true}}}});
})()

// Submit score and render leaderboard
submitScore();
const lbHtml=renderLeaderboard();
const lbCard=document.createElement('div');
lbCard.className='card';
lbCard.style.marginTop='16px';
lbCard.innerHTML='<h3 style="margin-bottom:12px">🏆 جدول امتیازات</h3><p style="color:var(--text2);font-size:.8rem;margin-bottom:12px">امتیازات شما در مقایسه با سایر بازیکنان (محلی)</p>'+lbHtml;
c.appendChild(lbCard);
}

function buildHeatmap(totalDays){
  let html='<div class="heatmap">';
  const now=new Date();
  for(let i=totalDays-1;i>=0;i--){
    const d=new Date(now.getTime()-i*MS_PER_DAY);
    const key=d.toISOString().slice(0,10);
    const count=(S.stats.history[key]||{}).reviewed||0;
    const level=count===0?0:count<=2?1:count<=5?2:count<=10?3:4;
    const tooltip=`${key}: ${count} مرور`;
    html+=`<div class="heatmap-cell heatmap-l${level}" data-count="${tooltip}" title="${tooltip}"></div>`;
  }
  html+='</div>';
  return html;
}

function buildForecast(days){
  const labels=[];
  const data=[];
  const now=new Date();
  for(let i=0;i<days;i++){
    const d=new Date(now.getTime()+i*MS_PER_DAY);
    const dateStr=d.toISOString().slice(0,10);
    const dayName=d.toLocaleDateString('fa-IR',{month:'short',day:'numeric'});
    labels.push(dayName);
    const count=S.words.filter(w=>w.nextReviewDate&&w.nextReviewDate.slice(0,10)===dateStr).length;
    data.push(count);
  }
  return{labels,data};
}

// ═══════════════════════════════════════════
