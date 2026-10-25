/* 答題紀錄 */
(async function(){
  const {esc,loadData,hist,sessions,resultBlock,L}=FIQ;
  const $=s=>document.querySelector(s);
  let data;
  try{ data=await loadData(); }catch(e){ $('#list').innerHTML='<p class="warnline">題目資料載入失敗，請重新整理頁面。</p>'; return; }
  const st={tab:'wrong',sj:'全部',limit:60};
  function render(){
    const h=hist.all();
    const ids=Object.keys(h).map(Number).filter(id=>data.byId.has(id));
    const n=ids.reduce((a,id)=>a+h[id].n,0), w=ids.reduce((a,id)=>a+h[id].w,0);
    const cw=ids.filter(id=>h[id].ok===false).length, ew=ids.filter(id=>h[id].w>0).length;
    $('#stats').innerHTML=`<span><b>${ids.length}</b>題做過</span><span><b>${n?Math.round((n-w)/n*100):0}%</b>累計答對率</span><span><b>${cw}</b>題目前錯題</span><span><b>${ew}</b>題曾經答錯</span>`;
    $('#practice').disabled=!cw;
    $('#practice').textContent=cw?`練習目前錯題（${cw} 題，每次隨機 30 題）`:'目前沒有錯題';
    const tabs=[['wrong','目前錯題',cw],['ever','曾經答錯',ew],['all','全部作答紀錄',ids.length]];
    $('#tabs').innerHTML=tabs.map(([k,t,c])=>`<button class="chip" data-k="${k}" aria-pressed="${st.tab===k}">${t}（${c}）</button>`).join('');
    $('#sj').innerHTML=['全部',...data.subjects].map(s=>`<option ${s===st.sj?'selected':''}>${esc(s)}</option>`).join('');
    let rows=ids.filter(id=>st.tab==='all'||(st.tab==='wrong'?h[id].ok===false:h[id].w>0));
    if(st.sj!=='全部') rows=rows.filter(id=>data.byId.get(id).sj===st.sj);
    rows.sort((a,b)=>h[b].t-h[a].t);
    const list=$('#list');
    if(!ids.length){list.innerHTML='<p class="empty">還沒有作答紀錄。到「測驗」頁做一回 30 題的隨機測驗，結果就會記在這裡。</p>';}
    else if(!rows.length){list.innerHTML=`<p class="empty">${st.tab==='wrong'?'目前沒有錯題，做得好！':'沒有符合條件的題目。'}</p>`;}
    else list.innerHTML=rows.slice(0,st.limit).map(id=>{
      const q=data.byId.get(id), e=h[id];
      const opts=q.o.map((o,j)=>{const v=L[j];const c=v===q.a?'correct':(v===e.last&&!e.ok?'picked-wrong opt':'');return `<li class="${c}"><span class="L">(${v})</span><span>${esc(o)}</span></li>`}).join('');
      const last=e.ok?'<span class="tag okc">上次答對</span>':`<span class="tag badc">上次${e.last?`選 (${e.last})`:'未作答'}</span>`;
      return `<article class="q static ${e.ok?'right':'wrong'}"><div class="qh"><span class="qn">#${id}</span><p class="stem">${esc(q.s)}</p></div><ol class="opts">${opts}</ol>
        <div class="result">${resultBlock(q,{extra:`${last}<span>作答 ${e.n} 次・錯 ${e.w} 次</span>`})}</div></article>`;
    }).join('')+(rows.length>st.limit?`<button class="btn ghost" id="more">再顯示 ${Math.min(60,rows.length-st.limit)} 題（尚有 ${rows.length-st.limit} 題）</button>`:'');
    const m=$('#more'); if(m) m.onclick=()=>{st.limit+=60;render()};
    const ss=sessions.all();
    $('#sessions').innerHTML=ss.length?`<table><thead><tr><th>時間</th><th>範圍</th><th>成績</th></tr></thead><tbody>`+ss.slice(0,20).map(s=>{const d=new Date(s.t);return `<tr><td>${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</td><td>${s.mode==='wrong'?'錯題・':s.mode==='new'?'新題・':''}${esc(s.sj)}</td><td>${s.correct} / ${s.total}（${Math.round(s.correct/s.total*100)}%）</td></tr>`}).join('')+`</tbody></table>`:'<p class="hint">還沒有測驗紀錄。</p>';
  }
  $('#tabs').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;st.tab=b.dataset.k;st.limit=60;render()};
  $('#sj').onchange=e=>{st.sj=e.target.value;st.limit=60;render()};
  $('#practice').onclick=()=>{location.href='index.html?mode=wrong'};
  let armed=false;
  $('#clear').onclick=()=>{
    if(!armed){armed=true;$('#clear').textContent='確定清除？再按一次';$('#clearHint').hidden=false;return}
    hist.clear(); armed=false; $('#clear').textContent='清除所有紀錄'; $('#clearHint').hidden=true; render();
  };
  render();
})();
