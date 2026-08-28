// ═══════════════════════════════════════════
// LEADERBOARD (anonymous, localStorage)
// ═══════════════════════════════════════════
const LEADERBOARD_KEY='leitner_leaderboard';
const PLAYER_ID_KEY='leitner_player_id';

function getPlayerId(){
  let id=localStorage.getItem(PLAYER_ID_KEY);
  if(!id){id='player_'+uid();localStorage.setItem(PLAYER_ID_KEY,id)}
  return id;
}

function submitScore(){
  const lb=JSON.parse(localStorage.getItem(LEADERBOARD_KEY)||'[]');
  const playerId=getPlayerId();
  const existing=lb.findIndex(e=>e.id===playerId);
  const entry={
    id:playerId,
    xp:S.stats.xp,
    words:S.words.length+S.longTerm.length,
    accuracy:S.stats.reviewed>0?Math.round(S.stats.correct/S.stats.reviewed*100):0,
    streak:S.stats.streak,
    level:getLevel(S.stats.xp).name,
    ts:Date.now()
  };
  if(existing>=0)lb[existing]=entry;
  else lb.push(entry);
  // Keep top 50
  lb.sort((a,b)=>b.xp-a.xp);
  const trimmed=lb.slice(0,50);
  localStorage.setItem(LEADERBOARD_KEY,JSON.stringify(trimmed));
  return entry;
}

function getLeaderboard(){
  return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)||'[]').sort((a,b)=>b.xp-a.xp);
}

function renderLeaderboard(){
  const lb=getLeaderboard();
  const playerId=getPlayerId();
  if(!lb.length)return'<p style="color:var(--text2);font-size:.85rem;text-align:center;padding:20px">هنوز امتیازی ثبت نشده</p>';
  let h='<div style="max-height:300px;overflow-y:auto">';
  lb.slice(0,20).forEach((e,i)=>{
    const isMe=e.id===playerId;
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    h+='<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);'+(isMe?'background:var(--accent-glow);border-radius:8px;':'')+'">';
    h+='<span style="min-width:28px;text-align:center;font-size:1rem">'+medal+'</span>';
    h+='<div style="flex:1"><div style="font-size:.85rem;font-weight:'+(isMe?'700':'400')+'">'+(isMe?'شما':'بازیکن')+'</div>';
    h+='<div style="font-size:.7rem;color:var(--text2)">'+esc(e.level)+' • '+e.words+' کلمه • دقت '+e.accuracy+'%</div></div>';
    h+='<div style="text-align:left"><div style="font-size:.9rem;font-weight:700;color:var(--accent)">'+e.xp.toLocaleString()+' XP</div>';
    if(e.streak>0)h+='<div style="font-size:.65rem;color:var(--warning)">🔥 '+e.streak+' روز</div>';
    h+='</div></div>';
  });
  h+='</div>';
  return h;
}
