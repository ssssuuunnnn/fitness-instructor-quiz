/* 共用：資料載入、紀錄存取、題目卡片 */
(function(){
  const KEY_HIST='fiq-history-110-v1', KEY_SESS='fiq-sessions-110-v1', KEY_CUR='fiq-current-110-v1';
  const L='ABCD';
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},
    del(k){try{localStorage.removeItem(k)}catch(e){}}
  };
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let cache=null;
  async function loadData(){
    if(cache) return cache;
    const r=await fetch('data/questions.json');
    const j=await r.json();
    cache={...j, byId:new Map(j.questions.map(q=>[q.id,q]))};
    return cache;
  }
  /* 作答紀錄：{ [id]: {n:作答次數, w:答錯次數, last:'A'|'', ok:true|false, t:時間} } */
  const hist={
    all(){return store.get(KEY_HIST,{})},
    record(results){
      const h=hist.all(), now=Date.now();
      results.forEach(r=>{
        const e=h[r.id]||{n:0,w:0};
        e.n++; if(!r.ok) e.w++;
        e.last=r.pick||''; e.ok=r.ok; e.t=now;
        h[r.id]=e;
      });
      store.set(KEY_HIST,h);
    },
    clear(){store.del(KEY_HIST);store.del(KEY_SESS);store.del(KEY_CUR)}
  };
  const sessions={
    all(){return store.get(KEY_SESS,[])},
    add(s){const a=sessions.all();a.unshift(s);store.set(KEY_SESS,a.slice(0,100))}
  };
  const current={get(){return store.get(KEY_CUR,null)},set(v){store.set(KEY_CUR,v)},clear(){store.del(KEY_CUR)}};

  /* 結果區塊：出現年度、各年度答案、說明 */
  function resultBlock(q,opts={}){
    const yrs=q.y.map(y=>`<span class="yr">${y}</span>`).join('');
    let v='';
    if(q.an&&q.an.length>1){
      v=`<div class="var"><div class="t">各年度答案不同</div>`+q.an.map(a=>`<div><span class="ys">${a.y.join('、')} 年</span><span>${a.l?`(${a.l}) `:''}${esc(a.t)}</span></div>`).join('')+`</div>`;
    }
    return `${v}<p class="why"><b>說明</b>${esc(q.x)}</p>
      <div class="meta">${q.n>1?`<span class="tag times">出現 ${q.n} 次</span>`:''}<span>出現年度</span>${yrs}<span>· ${esc(q.sj)}</span>${opts.extra||''}</div>`;
  }
  function setNavHeight(){
    const n=document.querySelector('.nav'); if(!n) return;
    const f=()=>document.documentElement.style.setProperty('--navh',n.offsetHeight+'px');
    f(); addEventListener('resize',f);
  }
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  window.FIQ={store,esc,loadData,hist,sessions,current,resultBlock,shuffle,L,setNavHeight};
  setNavHeight();
  if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
})();
