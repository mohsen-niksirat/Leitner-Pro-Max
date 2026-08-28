// ═══════════════════════════════════════════
// TRANSLATION POPUP (double-click)
// ═══════════════════════════════════════════
let transPopupAbort=null;

function hideTransPopup(){
  if(transPopupAbort){transPopupAbort.abort();transPopupAbort=null}
  const p=document.getElementById('transPopup');
  if(p)p.style.display='none'}

function positionTransPopup(rect){
  const p=document.getElementById('transPopup');
  if(!p)return;
  p.style.display='block';
  let top=rect.bottom+12;
  let left=rect.left;
  const pw=380,ph=p.offsetHeight||300;
  if(left+pw>window.innerWidth-16)left=window.innerWidth-pw-16;
  if(left<16)left=16;
  if(top+ph>window.innerHeight-16){top=rect.top-ph-12}
  if(top<16)top=16;
  p.style.top=top+'px';p.style.left=left+'px'}

async function renderTransPopup(word,rect){
  try{
  let popup=document.getElementById('transPopup');
  if(!popup){popup=document.createElement('div');popup.id='transPopup';popup.className='pdf-trans-popup';document.body.appendChild(popup)}

  popup.innerHTML='<button type="button" class="trans-close" id="transClose">&times;</button>'
    +'<div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو...</div>';
  popup.style.display='block';
  positionTransPopup(rect);
  document.getElementById('transClose').onclick=hideTransPopup;

  if(location.protocol==='file:'){
    popup.innerHTML='<button type="button" class="trans-close" id="transClose">&times;</button>'
      +'<div class="trans-error" style="text-align:left;line-height:1.6">⚠️ مرورگر درخواست‌های شبکه را از فایل محلی مسدود می‌کند.<br><br>لطفاً با سرور محلی باز کنید:<br><code style="font-size:.75rem;background:var(--bg);padding:4px 8px;border-radius:6px;display:block;margin-top:6px;direction:ltr;text-align:left">python -m http.server 8000</code></div>';
    document.getElementById('transClose').onclick=hideTransPopup;
    return}

  if(transPopupAbort)transPopupAbort.abort();
  transPopupAbort=new AbortController();

  const [dictResult, persianResult]=await Promise.all([
    fetchDictionary(word),
    fetchTranslation(word)
  ]);

  if(popup.style.display==='none')return;

  let html='<button type="button" class="trans-close" id="transClose">&times;</button>';

  const displayWord=dictResult?dictResult.headword:word;
  const ipaText=dictResult?(dictResult.phoneticBr||dictResult.phoneticUs||dictResult.phonetic||''):'';
  html+='<div class="trans-header">';
  html+='<span class="trans-word">'+esc(displayWord)+'</span>';
  if(ipaText)html+='<span class="trans-ipa">'+esc(ipaText)+'</span>';
  if(dictResult&&dictResult.audioUs)html+='<button type="button" class="trans-audio-btn" data-audio="'+esc(dictResult.audioUs)+'" title="American English">🇺🇸</button>';
  if(dictResult&&dictResult.audioBr)html+='<button type="button" class="trans-audio-btn" data-audio="'+esc(dictResult.audioBr)+'" title="British English">🇬🇧</button>';
  html+='<button type="button" class="trans-audio-btn" data-speak="'+esc(displayWord)+'" title="Listen">🔊</button>';
  html+='</div>';

  if(persianResult)html+='<div class="trans-persian">'+esc(persianResult)+'</div>';

  html+='<div class="trans-divider"></div>';
    // Frequency rank
    if(dictResult&&dictResult.freqRank)html+='<div style="font-size:.75rem;color:var(--accent);margin-bottom:4px">📊 رتبه فراوانی: ~'+dictResult.freqRank.toLocaleString()+' (COCA)</div>';
    // Etymology
    if(dictResult&&dictResult.etymology){
      html+='<div style="margin-bottom:10px"><div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">📖 ریشه‌شناسی</div><div style="font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic">'+esc(dictResult.etymology)+'</div></div>';
      html+='<div class="trans-divider"></div>';
    }
    // Morphological family
    if(dictResult&&dictResult.morphFamily&&dictResult.morphFamily.length){
      html+='<div style="margin-bottom:10px"><div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">🌳 خانواده واژگانی</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
      dictResult.morphFamily.slice(0,8).forEach(f=>{html+='<span class="trans-syn-tag">'+esc(f)+'</span>'});
      html+='</div></div>';
      html+='<div class="trans-divider"></div>';
    }

  if(dictResult&&dictResult.meanings.length){
    dictResult.meanings.forEach(m=>{
      if(m.partOfSpeech)html+='<span class="trans-pos">'+esc(m.partOfSpeech)+'</span> ';
      if(m.definitions.length){html+='<div class="trans-defs">';m.definitions.forEach(d=>{html+='<div class="trans-def-item">'+esc(d)+'</div>'});html+='</div>'}
      if(m.examples.length){html+='<div class="trans-examples">';m.examples.forEach(ex=>{html+='<div class="trans-example">"'+esc(ex)+'"</div>'});html+='</div>'}
      if(m.synonyms.length){html+='<div class="trans-synonyms">';m.synonyms.forEach(s=>{html+='<span class="trans-syn-tag">'+esc(s)+'</span>'});html+='</div>'}
    });
  }else if(!persianResult)html+='<div class="trans-error">نتیجه‌ای یافت نشد. اتصال اینترنت را بررسی کنید.</div>';

  const cleanWord=displayWord.toLowerCase();
  const alreadyExists=wordExists(cleanWord);

  html+='<button type="button" class="trans-add-btn" id="transAddBtn"'+(alreadyExists?' disabled':'')+'>';
  if(alreadyExists)html+='✅ در کتابخانه موجود است';
  else html+='＋ اضافه به لایتنر';
  html+='</button>';

  popup.innerHTML=html;
  positionTransPopup(rect);

  popup.querySelectorAll('[data-audio]').forEach(btn=>{btn.onclick=()=>playAudioUrl(btn.dataset.audio)});
  popup.querySelectorAll('[data-speak]').forEach(btn=>{btn.onclick=()=>speakWord(btn.dataset.speak)});
  document.getElementById('transClose').onclick=hideTransPopup;

  document.getElementById('transAddBtn').onclick=()=>{
    if(alreadyExists)return;
    const allDefs=dictResult?dictResult.meanings.flatMap(m=>m.definitions):[];
    const allExamples=dictResult?dictResult.meanings.flatMap(m=>m.examples):[];
    const allSynonyms=dictResult?dictResult.meanings.flatMap(m=>m.synonyms):[];
    const pos=dictResult&&dictResult.meanings[0]?dictResult.meanings[0].partOfSpeech:'';
    S.words.push(createCard({word:displayWord,translation:persianResult||'',ipa:ipaText,definitions:allDefs,examples:allExamples,synonyms:allSynonyms,partOfSpeech:pos,audioUs:dictResult?dictResult.audioUs||'':'',audioBr:dictResult?dictResult.audioBr||'':''}));
    trackWordAdded();save();
    toast(displayWord+' به لایتنر اضافه شد','success');
    const addBtn=document.getElementById('transAddBtn');
    if(addBtn){addBtn.disabled=true;addBtn.textContent='✅ در کتابخانه موجود است'}
  }
  }catch(err){
    console.error('[TransPopup Error]',err);
    toast('خطا در ترجمه: '+(err.message||'ناشناخته'),'error');
    var popup=document.getElementById('transPopup');
    if(popup){
      popup.innerHTML='<button type="button" class="trans-close" id="transClose">&times;</button>'
        +'<div class="trans-error">خطا در دریافت ترجمه<br><small>'+esc(err.message||'')+'</small></div>';
      document.getElementById('transClose').onclick=hideTransPopup;
    }
  }
}

// ═══════════════════════════════════════════
