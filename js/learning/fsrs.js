// ═══════════════════════════════════════════
// FSRS ALGORITHM (self-contained, improved)
// ═══════════════════════════════════════════
// FSRS-5 weights (17 parameters) — tuned defaults
const FSRS_W=[0.4,0.6,2.4,5.8,4.93,0.94,0.86,0.01,1.49,0.14,0.94,2.18,0.05,0.34,1.26,0.29,2.61];
const FSRS_RETENTION=0.9;
const FSRS_MAX_INTERVAL=365;
const FSRS_DECAY=-0.5; // Power-law decay exponent

function fsrsRetrieveProbability(stability,elapsed){
  if(stability<=0)return 0;
  return Math.pow(1+elapsed/(FSRS_W[9]*stability),FSRS_DECAY);
}
function fsrsInitialDifficulty(rating){
  return Math.min(Math.max(FSRS_W[4]-Math.exp(FSRS_W[5]*(rating-1))+1,1),10);
}
function fsrsInitialStability(rating){return FSRS_W[rating-1]}

// Short-term stability model: after first learning step
function fsrsShortTermStability(stability,rating){
  // Stability boost for short-term reviews (same-day)
  return stability*Math.exp(FSRS_W[15]*(rating-3));
}

// Interval fuzzing: add ±5% jitter to prevent review clustering
function fuzzInterval(interval){
  if(interval<=2)return interval;
  const fuzzRange=Math.max(1,Math.round(interval*0.05));
  const fuzzed=interval+Math.floor(Math.random()*(2*fuzzRange+1))-fuzzRange;
  return Math.max(1,fuzzed);
}

function fsrsNext(w,rating){
  // rating: 1=Again,2=Hard,3=Good,4=Easy
  const state=w.fsrsState||'new';
  const now=new Date();
  let newStability,newDifficulty,newInterval,newState,newLapses=w.lapses||0;

  if(state==='new'||state==='learning'){
    // First encounter or still in learning phase
    if(rating===1){
      newStability=Math.max(FSRS_W[0],0.1);
      newDifficulty=fsrsInitialDifficulty(rating);
      newInterval=0; // Immediate retry
      newState='learning';
      newLapses=w.lapses||0;
    }else if(rating===2){
      // Hard: short stability, review tomorrow
      newStability=Math.max(FSRS_W[1]*1.2,0.2);
      newDifficulty=fsrsInitialDifficulty(rating);
      newInterval=1;
      newState='review';
    }else if(rating===3){
      // Good: standard initial stability
      newStability=Math.max(fsrsShortTermStability(FSRS_W[2],rating),0.5);
      newDifficulty=fsrsInitialDifficulty(rating);
      newInterval=Math.max(1,Math.round(FSRS_W[2]));
      newState='review';
    }else{
      // Easy: high initial stability
      newStability=Math.max(FSRS_W[3],1);
      newDifficulty=fsrsInitialDifficulty(rating);
      newInterval=Math.max(1,Math.round(FSRS_W[3]));
      newState='review';
    }
  }else if(state==='review'){
    const elapsed=w.elapsedDays||0;
    const retrievability=fsrsRetrieveProbability(w.stability,Math.max(elapsed,0));

    // Difficulty update: mean-reverting toward initial difficulty
    const difficultyDelta=-FSRS_W[6]*(rating-3);
    newDifficulty=Math.min(Math.max(w.difficulty+difficultyDelta,1),10);
    // Mean-reversion: difficulty trends back toward initial based on rating
    const initialD=fsrsInitialDifficulty(rating);
    newDifficulty=newDifficulty+FSRS_W[13]*(initialD-newDifficulty);

    if(rating===1){
      // Again: lapse, go to relearning
      newLapses=(w.lapses||0)+1;
      // Stability after lapse: penalized by retrievability
      const lapseStability=FSRS_W[11]*Math.pow(newDifficulty,-FSRS_W[12])*
        (Math.pow(w.stability+1,FSRS_W[13])-1)*
        Math.exp(FSRS_W[14]*(1-retrievability));
      newStability=Math.max(lapseStability,0.1);
      newInterval=1;
      newState='relearning';
    }else{
      // Hard/Good/Easy: stability growth
      const hardPenalty=rating===2?FSRS_W[15]:1;
      const easyBonus=rating===4?FSRS_W[16]:1;
      // Stability growth factor depends on difficulty, stability, and retrievability
      const stabilityGrowth=1+Math.exp(FSRS_W[7])*
        (11-newDifficulty)*
        Math.pow(w.stability,-FSRS_W[8])*
        (Math.exp(FSRS_W[10]*(1-retrievability))-1)*
        hardPenalty*easyBonus;
      newStability=Math.max(w.stability*stabilityGrowth,0.1);

      // Interval from stability with retention target
      if(rating===2)newInterval=Math.max(1,Math.round(w.interval*1.2));
      else if(rating===3)newInterval=Math.max(1,Math.round(newStability*FSRS_DECAY_COEFF*Math.log(FSRS_RETENTION)/Math.log(0.9)));
      else newInterval=Math.max(1,Math.round(newStability*FSRS_DECAY_COEFF*1.3));
      newState='review';
    }
  }else if(state==='relearning'){
    if(rating===1){
      newStability=Math.max(FSRS_W[0],0.1);
      newInterval=1;
      newState='relearning';
      newLapses=(w.lapses||0);
    }else{
      // Return to review
      newStability=Math.max(w.stability||FSRS_W[0],0.1);
      newDifficulty=w.difficulty||fsrsInitialDifficulty(rating);
      newInterval=1;
      newState='review';
      newLapses=w.lapses||0;
    }
  }else{
    // Unknown state, treat as new
    newStability=Math.max(FSRS_W[0],0.1);
    newDifficulty=fsrsInitialDifficulty(rating);
    newInterval=1;
    newState='learning';
    newLapses=0;
  }

  // Clamp values
  newStability=Math.max(newStability,0.1);
  newInterval=Math.min(Math.max(Math.round(newInterval),0),FSRS_MAX_INTERVAL);
  if(newInterval===0)newInterval=1;

  // Apply fuzzing to prevent review clustering
  newInterval=fuzzInterval(newInterval);

  // Update card
  w.stability=newStability;
  w.difficulty=newDifficulty;
  w.interval=newInterval;
  w.fsrsState=newState;
  w.lapses=newLapses;
  w.reps=(w.reps||0)+1;
  w.elapsedDays=0;
  w.scheduledDays=newInterval;
  w.nextReviewDate=new Date(now.getTime()+newInterval*MS_PER_DAY).toISOString();
  w.lastReviewedAt=now.toISOString();
  w.box=Math.min(10,Math.ceil(newStability/30));
  w.easeFactor=Math.max(1.3,3-newDifficulty/5);
  return w;
}

function clampReviewValues(w){
  w.repetitions=Math.max(0,Number(w.repetitions)||0);
  w.interval=Math.max(1,Number(w.interval)||1);
  w.easeFactor=Math.max(1.3,Number(w.easeFactor)||2.5);
  w.box=Math.max(0,Math.min(10,Number(w.box)||0));
  if(w.nextReviewDate&&isNaN(new Date(w.nextReviewDate).getTime()))w.nextReviewDate=null;
  if(w.lastReviewedAt&&isNaN(new Date(w.lastReviewedAt).getTime()))w.lastReviewedAt=null;
  // Ensure FSRS fields exist
  if(w.stability===undefined)w.stability=0;
  if(w.difficulty===undefined)w.difficulty=0;
  if(w.fsrsState===undefined)w.fsrsState='new';
}

function sm2Legacy(w,q){
  clampReviewValues(w);
  const now=Date.now();
  if(q<3){w.repetitions=0;w.interval=1}
  else{w.repetitions++;if(w.repetitions===1)w.interval=1;else if(w.repetitions===2)w.interval=6;else w.interval=Math.round(w.interval*w.easeFactor)}
  w.easeFactor+=(0.1-(5-q)*(0.08+(5-q)*0.02));
  if(w.easeFactor<1.3)w.easeFactor=1.3;
  w.nextReviewDate=new Date(now+w.interval*MS_PER_DAY).toISOString();
  w.lastReviewedAt=new Date(now).toISOString();
  w.box=Math.min(10,w.repetitions);
  return w}

// Map old 1-5 rating to FSRS 1-4
function mapRating(q){return q<=1?1:q<=3?2:q===4?3:4}

if(typeof window!=='undefined')window.__createLearningService=window.__createLearningService||function(){return {rate:function(card,rating){if(!card||rating<1||rating>4)return {ok:false,reason:'invalid-rating',card};return {ok:true,card:fsrsNext({...card},rating)}},due:function(cards,at){var t=new Date(at||Date.now()).getTime();return (cards||[]).filter(function(card){if(!card||!card.nextReviewDate)return true;var d=new Date(card.nextReviewDate).getTime();return isNaN(d)||d<=t})}}};

