/* 隨機測驗 */
(async function(){
  const {esc,loadData,hist,sessions,current,resultBlock,shuffle,L}=FIQ;
  const $=s=>document.querySelector(s);
  const setup=$('#setup'), quiz=$('#quiz'), list=$('#list'), scoreBox=$('#score');
  let data;
  try{ data=await loadData(); }
  catch(e){ setup.innerHTML='<p class="warnline">題目資料載入失敗，請確認網路連線後重新整理頁面。</p>'; return; }
  const SUBJ=data.subjects;
  const params=new URLSearchParams(location.search);
  const pm=params.get('mode');
  const opt={sj:'全部', mode:['wrong','new','109'].includes(pm)?pm:'all', count:30};

  function wrongIds(){const h=hist.all();return Object.keys(h).filter(k=>h[k].ok===false).map(Number).filter(id=>data.byId.has(id))}
  function newIds(){const h=hist.all();return data.questions.map(q=>q.id).filter(id=>!h[id])}
  function pool(){
    let ids=opt.mode==='wrong'?wrongIds():opt.mode==='new'?newIds():opt.mode==='109'?data.q109.map(q=>q.id):data.questions.map(q=>q.id);
    if(opt.sj!=='全部') ids=ids.filter(id=>data.byId.get(id).sj===opt.sj);
    return ids;
  }

  /* ---------- 設定畫面 ---------- */
  function chips(el,items,key,label=x=>x){
    el.innerHTML=items.map(v=>`<button type="button" class="chip" data-v="${esc(v)}" aria-pressed="${String(opt[key])===String(v)}">${esc(label(v))}</button>`).join('');
    el.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;opt[key]=key==='count'?Number(b.dataset.v):b.dataset.v;renderSetup()};
  }
  function renderSetup(){
    setup.hidden=false; quiz.hidden=true;
    chips($('#sjChips'),['全部',...SUBJ],'sj');
    const w=wrongIds().length, nw=newIds().length;
    const ML={all:`全部題目（${data.questions.length}）`,new:`還沒做過的題目（${nw}）`,wrong:`只出錯題（${w}）`,'109':`109 年題目（${data.q109.length}）`};
    chips($('#modeChips'),['all','new','wrong','109'],'mode',v=>ML[v]);
    chips($('#countChips'),[10,30,50],'count',v=>`${v} 題`);
    const n=pool().length;
    $('#poolInfo').textContent=n?`符合條件的題目共 ${n} 題，將隨機抽出 ${Math.min(n,opt.count)} 題。`:(opt.mode==='wrong'?'目前沒有錯題，先做一回全部題目的測驗吧。':opt.mode==='new'?'這個範圍的題目你都做過了，可以改選全部題目或只出錯題。':'這個科目沒有題目。');
    $('#start').disabled=!n;
    const cur=current.get();
    $('#resume').hidden=!(cur&&!cur.submitted&&cur.ids&&cur.ids.length);
    if(cur&&!cur.submitted) $('#resumeInfo').textContent=`上次未完成：${cur.ids.length} 題，已作答 ${Object.keys(cur.picks||{}).length} 題。`;
  }
  $('#start').onclick=()=>{
    const ids=shuffle(pool()).slice(0,opt.count);
    current.set({ids,picks:{},sj:opt.sj,mode:opt.mode,submitted:false,t:Date.now()});
    renderQuiz(); scrollTo(0,0);
  };
  $('#resumeBtn').onclick=()=>{renderQuiz();scrollTo(0,0)};

  /* ---------- 作答畫面 ---------- */
  let confirmArmed=false;
  function renderQuiz(){
    const cur=current.get(); if(!cur) return renderSetup();
    setup.hidden=true; quiz.hidden=false; confirmArmed=false;
    $('#quizTitle').textContent=`${cur.mode==='wrong'?'錯題練習':cur.mode==='new'?'新題練習':cur.mode==='109'?'109 年題目':'隨機測驗'}・${cur.sj}・${cur.ids.length} 題`;
    list.innerHTML=cur.ids.map((id,i)=>{
      const q=data.byId.get(id);
      const opts=q.o.map((o,j)=>`<li><label class="opt"><input type="radio" name="q${id}" value="${L[j]}" ${cur.picks[id]===L[j]?'checked':''} ${cur.submitted?'disabled':''}><span class="L">(${L[j]})</span><span>${esc(o)}</span></label></li>`).join('');
      return `<article class="q" id="q-${id}" data-id="${id}"><div class="qh"><span class="qn">${i+1}.</span><p class="stem">${esc(q.s)}</p></div><ol class="opts">${opts}</ol><div class="result" hidden></div></article>`;
    }).join('');
    if(cur.submitted) showResults(cur,false); else {scoreBox.hidden=true; $('#submitArea').hidden=false; $('#afterArea').hidden=true; $('#submitTop').hidden=false;}
    updateProgress();
  }
  list.addEventListener('change',e=>{
    const inp=e.target; if(inp.type!=='radio') return;
    const cur=current.get(); if(!cur||cur.submitted) return;
    cur.picks[inp.name.slice(1)]=inp.value; current.set(cur); confirmArmed=false; $('#submitWarn').hidden=true; updateProgress();
  });
  function updateProgress(){
    const cur=current.get(); if(!cur) return;
    const done=Object.keys(cur.picks).length, tot=cur.ids.length;
    $('#progText').textContent=cur.submitted?`答對 ${cur.correct} / ${tot}`:`已作答 ${done} / ${tot}`;
    $('#progBar').style.width=(cur.submitted?cur.correct:done)/tot*100+'%';
  }
  function trySubmit(){
    const cur=current.get(); if(!cur||cur.submitted) return;
    const left=cur.ids.length-Object.keys(cur.picks).length;
    if(left>0&&!confirmArmed){
      confirmArmed=true; const w=$('#submitWarn'); w.hidden=false;
      w.textContent=`還有 ${left} 題未作答（會算答錯）。確定要送出的話，請再按一次「送出答案」。`;
      w.scrollIntoView({block:'center',behavior:'smooth'}); return;
    }
    const results=cur.ids.map(id=>{const q=data.byId.get(id);const pick=cur.picks[id]||'';return {id,pick,ok:pick===q.a}});
    cur.submitted=true; cur.correct=results.filter(r=>r.ok).length; cur.results=results;
    current.set(cur); hist.record(results);
    sessions.add({t:Date.now(),total:cur.ids.length,correct:cur.correct,sj:cur.sj,mode:cur.mode,wrong:results.filter(r=>!r.ok).map(r=>r.id)});
    showResults(cur,true);
  }
  $('#submit').onclick=trySubmit; $('#submitTop').onclick=trySubmit;

  function showResults(cur,scroll){
    const map=new Map(cur.results.map(r=>[r.id,r]));
    list.classList.add('done');
    list.querySelectorAll('.q').forEach(card=>{
      const id=Number(card.dataset.id), q=data.byId.get(id), r=map.get(id);
      card.classList.add(r.ok?'right':(r.pick?'wrong':'skip'));
      card.querySelectorAll('input').forEach(i=>i.disabled=true);
      card.querySelectorAll('.opt').forEach(lab=>{
        const v=lab.querySelector('input').value;
        if(v===q.a) lab.classList.add('correct'); else if(v===r.pick) lab.classList.add('picked-wrong');
      });
      const res=card.querySelector('.result'); res.hidden=false;
      const verdict=r.ok?'<p class="verdict ok">答對了</p>':(r.pick?`<p class="verdict bad">答錯了，你選 (${r.pick})，正確答案是 (${q.a})</p>`:`<p class="verdict skip">未作答，正確答案是 (${q.a})</p>`);
      res.innerHTML=verdict+resultBlock(q);
    });
    const tot=cur.ids.length, pct=Math.round(cur.correct/tot*100);
    scoreBox.hidden=false;
    scoreBox.innerHTML=`<div class="score"><span class="big">${cur.correct} / ${tot}</span><span>答對率 ${pct}%　${pct>=60?'達到及格標準（60%）':'未達及格標準（60%）'}</span></div>
      <p class="hint">綠色是正確答案，紅色是你選錯的選項。答錯的題目已記在「答題紀錄」，可以隨時回來練習。</p>`;
    $('#submitArea').hidden=true; $('#submitTop').hidden=true; $('#afterArea').hidden=false;
    $('#retryWrong').hidden=cur.correct===tot;
    updateProgress();
    if(scroll) scrollTo({top:0,behavior:'smooth'});
  }
  $('#again').onclick=()=>{current.clear();renderSetup();scrollTo(0,0)};
  $('#retryWrong').onclick=()=>{
    const cur=current.get(); const ids=shuffle(cur.results.filter(r=>!r.ok).map(r=>r.id));
    current.set({ids,picks:{},sj:cur.sj,mode:'wrong',submitted:false,t:Date.now()}); renderQuiz(); scrollTo(0,0);
  };

  const cur=current.get();
  if(cur&&cur.submitted&&!params.get('mode')) renderQuiz(); else renderSetup();
})();
