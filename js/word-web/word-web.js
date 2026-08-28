// WORD WEB v2 — نقشه ذهنی واژگان پیشرفته
// ═══════════════════════════════════════════
let webState={mode:'mindmap',colorBy:'category',showSynonyms:true,showAntonyms:true,showFamily:true,showDefinitions:false,zoom:1,panX:0,panY:0,fullscreen:false,selectedWord:null,physics:true};
function renderWordWeb(c){
  if(!S.words.length){c.innerHTML='<div class="card" style="text-align:center;padding:60px"><div class="empty"><div class="icon">🗺️</div><p>کلمه‌ای برای نمایش نقشه نیست</p></div></div>';return}
  var h='';
  h+='<div style="margin-bottom:12px">';
  // Top toolbar
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">';
  h+='<input type="text" class="input" id="webSearch" placeholder="🔍 جستجو..." style="max-width:220px;font-size:.85rem;padding:8px 12px">';
  h+='<select class="input" id="webWordSelect" style="max-width:220px;font-size:.85rem;padding:8px 12px">';
  S.words.forEach(function(w,i){h+='<option value="'+i+'">'+esc(w.word)+(w.translation?' — '+esc(w.translation):'')+'</option>'});
  h+='</select>';
  h+='<div class="sep" style="height:24px"></div>';
  // View mode buttons
  h+='<button type="button" class="btn btn-sm '+(webState.mode==='mindmap'?'btn-primary':'btn-ghost')+'" data-wmode="mindmap" title="نقشه ذهنی">🧠</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.mode==='force'?'btn-primary':'btn-ghost')+'" data-wmode="force" title="گراف نیرویی">⚛️</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.mode==='radial'?'btn-primary':'btn-ghost')+'" data-wmode="radial" title="شعاعی">🎯</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.mode==='cluster'?'btn-primary':'btn-ghost')+'" data-wmode="cluster" title="خوشه‌بندی دسته‌بندی">📦</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.mode==='tier'?'btn-primary':'btn-ghost')+'" data-wmode="tier" title="خوشه‌بندی فراوانی">📊</button>';
  h+='<div class="sep" style="height:24px"></div>';
  // Color by
  h+='<select class="input" id="webColorBy" style="max-width:140px;font-size:.8rem;padding:6px 10px">';
  h+='<option value="category"'+(webState.colorBy==='category'?' selected':'')+'>رنگ: دسته‌بندی</option>';
  h+='<option value="tier"'+(webState.colorBy==='tier'?' selected':'')+'>رنگ: فراوانی</option>';
  h+='<option value="box"'+(webState.colorBy==='box'?' selected':'')+'>رنگ: جعبه</option>';
  h+='<option value="mastery"'+(webState.colorBy==='mastery'?' selected':'')+'>رنگ: تسلط</option>';
  h+='</select>';
  h+='<div class="sep" style="height:24px"></div>';
  // Filters
  h+='<button type="button" class="btn btn-sm '+(webState.showSynonyms?'btn-success':'btn-ghost')+'" id="webToggleSyn" title="مترادف‌ها">🔄</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.showAntonyms?'btn-danger':'btn-ghost')+'" id="webToggleAnt" title="متضادها">⚡</button>';
  h+='<button type="button" class="btn btn-sm '+(webState.showFamily?'btn-ghost':'btn-ghost')+'" id="webToggleFam" title="خانواده" style='+(webState.showFamily?'border-color:var(--warning)':'')+'>🌳</button>';
  h+='<div class="sep" style="height:24px"></div>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="webZoomIn" title="بزرگنمایی">＋</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="webZoomOut" title="کوچک‌نمایی">−</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="webReset" title="بازنشانی">↺</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="webExportPng" title="خروجی PNG">📷</button>';
  h+='<button type="button" class="btn btn-ghost btn-sm" id="webFullscreen" title="تمام صفحه">⛶</button>';
  h+='</div>';
  // Stats bar
  h+='<div id="webStats" style="font-size:.75rem;color:var(--text2);display:flex;gap:12px;margin-bottom:8px"></div>';
  h+='</div>';
  h+='<div class="card" id="webCard" style="padding:0;overflow:hidden;position:relative;'+(webState.fullscreen?'position:fixed;inset:0;z-index:500;border-radius:0':'')+'">';
  h+='<canvas id="webCanvas" style="width:100%;display:block;cursor:grab;background:var(--bg)"></canvas>';
  h+='<div id="webTooltip" style="display:none;position:absolute;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:.82rem;box-shadow:var(--shadow);pointer-events:none;z-index:10;max-width:250px;direction:ltr;text-align:left"></div>';
  h+='</div>';
  c.innerHTML=h;
  webInitCanvas(c);
}
function webInitCanvas(c){
  var canvas=document.getElementById('webCanvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var tooltip=document.getElementById('webTooltip');
  var card=document.getElementById('webCard');
  var dpr=window.devicePixelRatio||1;
  var W,H;
  function resizeCanvas(){
    W=canvas.offsetWidth;
    H=webState.fullscreen?window.innerHeight-80:Math.max(500,Math.min(700,window.innerHeight-200));
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resizeCanvas();
  var nodes=[],edges=[],hoveredNode=null,dragNode=null,dragOff={x:0,y:0},isPanning=false,panStart={x:0,y:0};
  var selectedIdx=parseInt(document.getElementById('webWordSelect').value)||0;
  // Color palettes
  // High-saturation colors that work with white text
  var catColors=['#6c5ce7','#00897b','#d84315','#6a1b9a','#0277bd','#ad1457','#00838f','#4e342e','#37474f','#283593'];
  var tierColors={1:'#00897b',2:'#6c5ce7',3:'#e65100',0:'#b71c1c'};
  var boxColors=['#b71c1c','#d84315','#e65100','#f57f17','#558b2f','#00897b','#0277bd','#283593','#6a1b9a','#ad1457','#4e342e'];
  // Calculate contrasting text color for a background
  function getTextColor(bg){
    var r=parseInt(bg.slice(1,3),16),g=parseInt(bg.slice(3,5),16),b=parseInt(bg.slice(5,7),16);
    var lum=(0.299*r+0.587*g+0.114*b)/255;
    return lum>0.55?'#1a1a2e':'#ffffff';
  }
  function getNodeColor(n){
    if(n.isCenter)return '#6c5ce7';
    if(webState.colorBy==='tier')return tierColors[n.tier]||'#6c5ce7';
    if(webState.colorBy==='box')return boxColors[Math.min(n.box||0,10)]||'#6c5ce7';
    if(webState.colorBy==='mastery'){
      if(n.mastery>=80)return '#00897b';
      if(n.mastery>=50)return '#e65100';
      if(n.mastery>=20)return '#d84315';
      return '#455a64';
    }
    return catColors[n.catIdx%catColors.length]||'#6c5ce7';
  }
  function buildGraph(){
    nodes=[];edges=[];
    var w=S.words[selectedIdx];
    if(!w)return;
    var cx=W/2+webState.panX,cy=H/2+webState.panY;
    var catIdx=S.categories.indexOf(w.category);
    // Center node
    nodes.push({id:w.id,word:w.word,trans:w.translation||'',x:cx,y:cy,r:42,isCenter:true,tier:getFrequencyTier(w.word),box:w.box,catIdx:catIdx>=0?catIdx:0,mastery:w.reps>0?Math.min(100,Math.round(w.reps*10)):0,defs:w.definitions||[]});
    var synCount=0,antCount=0,famCount=0;
    // Synonyms
    if(webState.showSynonyms){
      (w.synonyms||[]).slice(0,8).forEach(function(s,i){
        var angle=(i/(Math.max(w.synonyms.length,1)))*Math.PI*2-Math.PI/2;
        var dist=160*webState.zoom;
        var sid='syn_'+i;
        nodes.push({id:sid,word:s,trans:'',x:cx+Math.cos(angle)*dist,y:cy+Math.sin(angle)*dist,r:Math.max(30,28*webState.zoom),tier:getFrequencyTier(s),box:0,catIdx:1,mastery:0,defs:[]});
        edges.push({from:w.id,to:sid,color:'#00b894',label:'مترادف',dash:true});
        synCount++;
      });
    }
    // Antonyms
    if(webState.showAntonyms){
      (w.antonyms||[]).slice(0,6).forEach(function(a,i){
        var total=(webState.showSynonyms?(w.synonyms||[]).length:0)+(w.antonyms||[]).length;
        var angle=((i+(webState.showSynonyms?(w.synonyms||[]).length:0))/Math.max(total,1))*Math.PI*2-Math.PI/2;
        var dist=160*webState.zoom;
        var aid='ant_'+i;
        nodes.push({id:aid,word:a,trans:'',x:cx+Math.cos(angle)*dist,y:cy+Math.sin(angle)*dist,r:Math.max(30,28*webState.zoom),tier:getFrequencyTier(a),box:0,catIdx:2,mastery:0,defs:[]});
        edges.push({from:w.id,to:aid,color:'#e17055',label:'متضاد',dash:true});
        antCount++;
      });
    }
    // Word family
    if(webState.showFamily){
      var family=getMorphologicalFamily(w.word).slice(0,8);
      family.forEach(function(f,i){
        var angle=(i/family.length)*Math.PI*2+Math.PI/4;
        var dist=240*webState.zoom;
        var fid='fam_'+i;
        nodes.push({id:fid,word:f,trans:'',x:cx+Math.cos(angle)*dist,y:cy+Math.sin(angle)*dist,r:Math.max(26,22*webState.zoom),tier:getFrequencyTier(f),box:0,catIdx:3,mastery:0,defs:[]});
        edges.push({from:w.id,to:fid,color:'#fdcb6e',label:'خانواده',dash:false});
        famCount++;
      });
    }
    // Definitions as sub-nodes
    if(webState.showDefinitions&&w.definitions&&w.definitions.length){
      w.definitions.slice(0,4).forEach(function(d,i){
        var def=typeof d==='string'?d:(d.definition||'');
        if(!def)return;
        var angle=(i/4)*Math.PI*2+Math.PI/2;
        var dist=300*webState.zoom;
        var did='def_'+i;
        var shortDef=def.length>40?def.slice(0,37)+'...':def;
        nodes.push({id:did,word:shortDef,trans:'',x:cx+Math.cos(angle)*dist,y:cy+Math.sin(angle)*dist,r:Math.max(24,20*webState.zoom),tier:0,box:0,catIdx:4,mastery:0,defs:[],isDef:true});
        edges.push({from:w.id,to:did,color:'#0984e3',label:'تعریف',dash:true});
      });
    }
    // Update stats
    var statsEl=document.getElementById('webStats');
    if(statsEl)statsEl.innerHTML='<span>🔵 '+nodes.length+' گره</span><span>🔗 '+edges.length+' اتصال</span><span>🔄 '+synCount+' مترادف</span><span>⚡ '+antCount+' متضاد</span><span>🌳 '+famCount+' خانواده</span>';
  }
  // Force-directed layout simulation
  var simRunning=false;
  function simulate(){
    if(!webState.physics||webState.mode==='mindmap'){simRunning=false;return}
    simRunning=true;
    var alpha=0.3;
    for(var iter=0;iter<3;iter++){
      // Repulsion between all nodes
      for(var i=0;i<nodes.length;i++){
        for(var j=i+1;j<nodes.length;j++){
          var dx=nodes[j].x-nodes[i].x;
          var dy=nodes[j].y-nodes[i].y;
          var dist=Math.sqrt(dx*dx+dy*dy)||1;
          var force=2000/(dist*dist);
          var fx=dx/dist*force*alpha;
          var fy=dy/dist*force*alpha;
          if(!nodes[i].isCenter&&!dragNode){nodes[i].x-=fx;nodes[i].y-=fy}
          if(!nodes[j].isCenter&&!dragNode){nodes[j].x+=fx;nodes[j].y+=fy}
        }
      }
      // Attraction along edges
      edges.forEach(function(e){
        var a=nodes.find(function(n){return n.id===e.from});
        var b=nodes.find(function(n){return n.id===e.to});
        if(!a||!b)return;
        var dx=b.x-a.x,dy=b.y-a.y;
        var dist=Math.sqrt(dx*dx+dy*dy)||1;
        var targetDist=webState.mode==='radial'?200*webState.zoom:150*webState.zoom;
        var force=(dist-targetDist)*0.05*alpha;
        var fx=dx/dist*force;
        var fy=dy/dist*force;
        if(!b.isCenter&&dragNode!==b){b.x-=fx;b.y-=fy}
        if(!a.isCenter&&dragNode!==a){a.x+=fx;a.y+=fy}
      });
      // Center gravity
      var cx2=W/2+webState.panX,cy2=H/2+webState.panY;
      nodes.forEach(function(n){
        if(n.isCenter||dragNode===n)return;
        n.x+=(cx2-n.x)*0.01;
        n.y+=(cy2-n.y)*0.01;
      });
      // Boundary clamping
      nodes.forEach(function(n){
        n.x=Math.max(n.r,Math.min(W-n.r,n.x));
        n.y=Math.max(n.r,Math.min(H-n.r,n.y));
      });
    }
    draw();
    if(simRunning)requestAnimationFrame(simulate);
  }
  // Cluster layout
  function applyClusterLayout(){
    var groups={};
    nodes.forEach(function(n){
      if(n.isCenter)return;
      var key=n.catIdx||0;
      if(!groups[key])groups[key]=[];
      groups[key].push(n);
    });
    var groupKeys=Object.keys(groups);
    var cx2=W/2+webState.panX,cy2=H/2+webState.panY;
    groupKeys.forEach(function(gi,idx){
      var angle=(idx/groupKeys.length)*Math.PI*2-Math.PI/2;
      var gDist=180*webState.zoom;
      var gx=cx2+Math.cos(angle)*gDist;
      var gy=cy2+Math.sin(angle)*gDist;
      groups[gi].forEach(function(n,i){
        var a2=(i/groups[gi].length)*Math.PI*2;
        var d2=60*webState.zoom;
        n.x=gx+Math.cos(a2)*d2;
        n.y=gy+Math.sin(a2)*d2;
      });
    });
  }
  function applyTierLayout(){
    var tiers=[[],[],[],[]];
    nodes.forEach(function(n){
      if(n.isCenter)return;
      tiers[n.tier||0].push(n);
    });
    var cx2=W/2+webState.panX,cy2=H/2+webState.panY;
    var labels=['پیشرفته','مفید','رایج','پرکاربرد'];
    tiers.forEach(function(tier,idx){
      var angle=(idx/4)*Math.PI*2-Math.PI/2;
      var gDist=(120+idx*50)*webState.zoom;
      var gx=cx2+Math.cos(angle)*gDist;
      var gy=cy2+Math.sin(angle)*gDist;
      tier.forEach(function(n,i){
        var a2=(i/tier.length)*Math.PI*2;
        var d2=50*webState.zoom;
        n.x=gx+Math.cos(a2)*d2;
        n.y=gy+Math.sin(a2)*d2;
      });
    });
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    // Draw grid dots
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--border')||'#2a2e42';
    for(var gx=0;gx<W;gx+=30){for(var gy=0;gy<H;gy+=30){ctx.beginPath();ctx.arc(gx,gy,1,0,Math.PI*2);ctx.fill()}}
    // Draw edges
    edges.forEach(function(e){
      var from=nodes.find(function(n){return n.id===e.from});
      var to=nodes.find(function(n){return n.id===e.to});
      if(!from||!to)return;
      ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);
      ctx.strokeStyle=e.color||'#6c5ce7';
      ctx.lineWidth=e.dash?2:2.5;
      if(e.dash)ctx.setLineDash([5,5]);
      ctx.stroke();ctx.setLineDash([]);
      // Edge label with background
      var mx=(from.x+to.x)/2,my=(from.y+to.y)/2;
      ctx.font='10px Vazirmatn';ctx.textAlign='center';
      var labelW=ctx.measureText(e.label).width+10;
      ctx.fillStyle='rgba(26,29,43,.85)';
      ctx.beginPath();
      if(ctx.roundRect){ctx.roundRect(mx-labelW/2,my-16,labelW,18,4)}
      else{ctx.rect(mx-labelW/2,my-16,labelW,18)}
      ctx.fill();
      ctx.fillStyle='#c8cad8';
      ctx.fillText(e.label,mx,my-4);
    });
    // Draw nodes
    nodes.forEach(function(n){
      var isHovered=hoveredNode===n;
      var col=n.isCenter?'#6c5ce7':getNodeColor(n);
      // Glow for center
      if(n.isCenter){
        ctx.beginPath();ctx.arc(n.x,n.y,n.r+8,0,Math.PI*2);
        ctx.fillStyle='rgba(108,92,231,.15)';ctx.fill();
      }
      // Node circle
      ctx.beginPath();ctx.arc(n.x,n.y,n.r+(isHovered?4:0),0,Math.PI*2);
      ctx.fillStyle=col;ctx.fill();
      ctx.strokeStyle=isHovered?'#fff':(n.isCenter?'#a29bfe':col);
      ctx.lineWidth=isHovered?3:1.5;ctx.stroke();
      // Mastery ring
      if(n.mastery>0&&!n.isCenter){
        ctx.beginPath();ctx.arc(n.x,n.y,n.r+2,-Math.PI/2,-Math.PI/2+Math.PI*2*(n.mastery/100));
        ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=3;ctx.stroke();
      }
      // Text with contrasting color
      var textColor=n.isCenter?'#fff':getTextColor(col);
      ctx.fillStyle=textColor;
      ctx.font=(n.isCenter?'bold 14px':n.isDef?'10px':'12px')+' Vazirmatn';
      ctx.textAlign='center';ctx.textBaseline='middle';
      // Text shadow for better readability
      ctx.save();
      ctx.shadowColor=textColor==='#fff'?'rgba(0,0,0,.5)':'rgba(255,255,255,.3)';
      ctx.shadowBlur=3;
      var maxChars=n.isCenter?14:n.r>26?12:n.r>20?9:7;
      var txt=n.word.length>maxChars?n.word.slice(0,maxChars-1)+'…':n.word;
      ctx.fillText(txt,n.x,n.y);
      ctx.restore();
    });
  }
  buildGraph();
  // Initial layout
  if(webState.mode==='cluster')applyClusterLayout();
  else if(webState.mode==='tier')applyTierLayout();
  else if(webState.mode==='radial'){
    nodes.forEach(function(n,i){
      if(n.isCenter)return;
      var angle=(i/nodes.length)*Math.PI*2;
      var dist=180*webState.zoom;
      n.x=W/2+webState.panX+Math.cos(angle)*dist;
      n.y=H/2+webState.panY+Math.sin(angle)*dist;
    });
  }
  draw();
  if(webState.mode==='force')simulate();
  // ── Mouse events ──
  canvas.onmousemove=function(e){
    var rect=canvas.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    // Transform mouse coords for zoom/pan
    var tmx=(mx-webState.panX),tmy=(my-webState.panY);
    hoveredNode=null;
    for(var ni=0;ni<nodes.length;ni++){
      var n=nodes[ni];
      var dx=mx-n.x,dy=my-n.y;
      if(dx*dx+dy*dy<=n.r*n.r){hoveredNode=n;break}
    }
    canvas.style.cursor=hoveredNode?'pointer':(isPanning?'grabbing':'grab');
    if(hoveredNode){
      tooltip.style.display='block';
      tooltip.style.left=Math.min(mx+12,W-250)+'px';
      tooltip.style.top=(my-50)+'px';
      var tt='<strong style="font-size:1rem">'+esc(hoveredNode.word)+'</strong>';
      if(hoveredNode.trans)tt+='<br><span style="color:var(--success)">'+esc(hoveredNode.trans)+'</span>';
      if(hoveredNode.tier)tt+='<br><span style="font-size:.75rem;color:var(--accent)">📊 '+tierLabel(hoveredNode.tier)+'</span>';
      if(hoveredNode.box)tt+='<br><span style="font-size:.75rem">📦 جعبه '+hoveredNode.box+'</span>';
      if(hoveredNode.mastery)tt+='<br><span style="font-size:.75rem">📈 تسلط '+hoveredNode.mastery+'%</span>';
      tooltip.innerHTML=tt;
    }else{tooltip.style.display='none'}
    if(dragNode){
      dragNode.x=mx-dragOff.x;dragNode.y=my-dragOff.y;
      if(!simRunning)draw();
    }
    if(isPanning&&!dragNode){
      var pdx=mx-panStart.x,pdy=my-panStart.y;
      webState.panX+=pdx;webState.panY+=pdy;
      nodes.forEach(function(n){n.x+=pdx;n.y+=pdy});
      panStart={x:mx,y:my};
      if(!simRunning)draw();
    }
  };
  canvas.onmousedown=function(e){
    var rect=canvas.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    if(hoveredNode){
      dragNode=hoveredNode;
      dragOff={x:mx-dragNode.x,y:my-dragNode.y};
      canvas.style.cursor='grabbing';
    }else{
      isPanning=true;
      panStart={x:mx,y:my};
      canvas.style.cursor='grabbing';
    }
  };
  canvas.onmouseup=function(){
    dragNode=null;isPanning=false;canvas.style.cursor='grab';
  };
  canvas.onmouseleave=function(){
    dragNode=null;isPanning=false;hoveredNode=null;tooltip.style.display='none';draw();
  };
  // Click node → show word detail
  canvas.onclick=function(e){
    if(dragNode)return;
    if(hoveredNode&&hoveredNode.word){
      var wIdx=S.words.findIndex(function(w){return w.word.toLowerCase()===hoveredNode.word.toLowerCase()});
      if(wIdx>=0){
        webState.selectedWord=wIdx;
        document.getElementById('webWordSelect').value=wIdx;
        buildGraph();
        if(webState.mode==='cluster')applyClusterLayout();
        else if(webState.mode==='tier')applyTierLayout();
        draw();
        if(webState.mode==='force')simulate();
      }else{
        // Word not in library - show lookup
        showWebWordLookup(hoveredNode.word);
      }
    }
  };
  // Zoom with mouse wheel
  canvas.onwheel=function(e){
    e.preventDefault();
    var delta=e.deltaY>0?-0.1:0.1;
    webState.zoom=Math.max(0.3,Math.min(3,webState.zoom+delta));
    buildGraph();
    if(webState.mode==='cluster')applyClusterLayout();
    else if(webState.mode==='tier')applyTierLayout();
    draw();
    if(webState.mode==='force')simulate();
  };
  // ── Button events ──
  c.querySelectorAll('[data-wmode]').forEach(function(btn){
    btn.onclick=function(){
      webState.mode=btn.dataset.wmode;
      webState.physics=webState.mode==='force';
      renderWordWeb(c);
    };
  });
  var colorSel=document.getElementById('webColorBy');
  if(colorSel)colorSel.onchange=function(){webState.colorBy=this.value;draw()};
  var togSyn=document.getElementById('webToggleSyn');
  if(togSyn)togSyn.onclick=function(){webState.showSynonyms=!webState.showSynonyms;renderWordWeb(c)};
  var togAnt=document.getElementById('webToggleAnt');
  if(togAnt)togAnt.onclick=function(){webState.showAntonyms=!webState.showAntonyms;renderWordWeb(c)};
  var togFam=document.getElementById('webToggleFam');
  if(togFam)togFam.onclick=function(){webState.showFamily=!webState.showFamily;renderWordWeb(c)};
  var zoomInBtn=document.getElementById('webZoomIn');
  if(zoomInBtn)zoomInBtn.onclick=function(){webState.zoom=Math.min(3,webState.zoom+0.2);buildGraph();draw();if(webState.mode==='force')simulate()};
  var zoomOutBtn=document.getElementById('webZoomOut');
  if(zoomOutBtn)zoomOutBtn.onclick=function(){webState.zoom=Math.max(0.3,webState.zoom-0.2);buildGraph();draw();if(webState.mode==='force')simulate()};
  var resetBtn=document.getElementById('webReset');
  if(resetBtn)resetBtn.onclick=function(){webState.zoom=1;webState.panX=0;webState.panY=0;buildGraph();draw();if(webState.mode==='force')simulate()};
  var exportBtn=document.getElementById('webExportPng');
  if(exportBtn)exportBtn.onclick=function(){
    var link=document.createElement('a');
    link.download='word-web-'+S.words[selectedIdx].word+'.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
    toast('تصویر ذخیره شد','success');
  };
  var fsBtn=document.getElementById('webFullscreen');
  if(fsBtn)fsBtn.onclick=function(){
    webState.fullscreen=!webState.fullscreen;
    renderWordWeb(c);
  };
  // Select word
  var select=document.getElementById('webWordSelect');
  select.onchange=function(){
    selectedIdx=parseInt(this.value);
    webState.selectedWord=selectedIdx;
    buildGraph();
    if(webState.mode==='cluster')applyClusterLayout();
    else if(webState.mode==='tier')applyTierLayout();
    draw();
    if(webState.mode==='force')simulate();
  };
  // Search
  var searchInput=document.getElementById('webSearch');
  searchInput.oninput=function(){
    var q=this.value.trim().toLowerCase();
    if(!q)return;
    var idx=S.words.findIndex(function(w){return w.word.toLowerCase().includes(q)||(w.translation||'').toLowerCase().includes(q)});
    if(idx>=0){
      select.value=idx;selectedIdx=idx;
      buildGraph();
      if(webState.mode==='cluster')applyClusterLayout();
      else if(webState.mode==='tier')applyTierLayout();
      draw();
      if(webState.mode==='force')simulate();
    }
  };
  // Keyboard shortcuts
  document.onkeydown=function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    if(e.key==='+'||e.key==='='){webState.zoom=Math.min(3,webState.zoom+0.1);buildGraph();draw()}
    else if(e.key==='-'){webState.zoom=Math.max(0.3,webState.zoom-0.1);buildGraph();draw()}
    else if(e.key==='Escape'&&webState.fullscreen){webState.fullscreen=false;renderWordWeb(c)}
  };
}
function showWebWordLookup(word){
  var ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML='<div class="modal" style="max-width:420px">'
    +'<h3 style="margin-bottom:12px">🔍 '+esc(word)+'</h3>'
    +'<p style="color:var(--text2);font-size:.85rem">این کلمه در کتابخانه شما نیست.</p>'
    +'<div id="webLookupBody" style="margin:12px 0"><div class="trans-loading"><div class="trans-spinner"></div>در حال جستجو...</div></div>'
    +'<div style="display:flex;gap:8px;justify-content:flex-end">'
    +'<button type="button" class="btn btn-ghost" id="webLookupClose">بستن</button>'
    +'<button type="button" class="btn btn-primary" id="webLookupAdd" disabled>＋ لایتنر</button>'
    +'</div></div>';
  ov.querySelector('#webLookupClose').onclick=function(){ov.remove()};
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove()};
  // Fetch word data
  (async function(){
    var dict=await fetchDictionary(word);
    var trans='';
    var body=ov.querySelector('#webLookupBody');
    if(!dict){body.innerHTML='<div style="color:var(--text2);text-align:center;padding:12px">نتیجه‌ای یافت نشد</div>';return}
    var ipa=dict.phoneticBr||dict.phoneticUs||dict.phonetic||'';
    var pos=dict.meanings[0]?dict.meanings[0].partOfSpeech:'';
    var defs=dict.meanings.flatMap(function(m){return m.definitions}).slice(0,3);
    var firstDef=defs[0]?(typeof defs[0]==='string'?defs[0]:defs[0].definition||''):'';
    if(firstDef)trans=await fetchTranslation(firstDef)||'';
    if(!trans)trans=await fetchTranslation(word)||'';
    var h='<div style="text-align:center;margin-bottom:8px">';
    h+='<div style="font-size:1.2rem;font-weight:700;color:var(--accent)">'+esc(word)+'</div>';
    if(ipa)h+='<div style="color:var(--text2);font-size:.85rem">/'+esc(ipa)+'/</div>';
    if(pos)h+='<span class="badge badge-accent">'+esc(pos)+'</span>';
    h+='</div>';
    if(trans)h+='<div style="text-align:center;font-size:1.1rem;font-weight:600;color:var(--success);padding:8px;background:var(--bg);border-radius:10px;margin-bottom:8px">'+esc(trans)+'</div>';
    defs.forEach(function(d){
      var def=typeof d==='string'?d:(d.definition||'');
      h+='<div style="font-size:.83rem;padding:6px 10px;margin-bottom:4px;background:var(--bg);border-radius:8px;border-right:3px solid var(--accent)">'+esc(def)+'</div>';
    });
    body.innerHTML=h;
    var addBtn=ov.querySelector('#webLookupAdd');
    addBtn.disabled=false;
    addBtn.onclick=function(){
      var allDefs=defs.map(function(d){return typeof d==='string'?d:(d.definition||'')});
      window.cardRepository?.get()?.add(createCard({word:word,translation:trans||'',ipa:ipa,partOfSpeech:pos,definitions:allDefs,source:'word-web'}),'words');
      save();toast(word+' اضافه شد','success');ov.remove();renderWordWeb(document.getElementById('content'));
    };
  })();
}

// ═══════════════════════════════════════════
// [Refactor Phase 9] moved to js/statistics/calendar.js
// [Refactor Phase 9] moved to js/ui/dashboard.js
// [Refactor Phase 9] moved to js/ui/dashboard.js
// [Refactor Phase 9] moved to js/ui/settings.js
