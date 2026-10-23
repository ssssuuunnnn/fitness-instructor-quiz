/* 題庫總覽：篩選與搜尋（頁面內容已預先產生） */
(function(){
  const cards=[...document.querySelectorAll('#list .q')];
  const tabs=document.getElementById('tabs'), q=document.getElementById('search'), cnt=document.getElementById('count');
  const st={sj:'全部',q:'',onlyRep:false};
  cards.forEach(c=>c._t=c.textContent.toLowerCase());
  function apply(){
    let n=0;
    cards.forEach(c=>{const show=(st.sj==='全部'||c.dataset.sj===st.sj)&&(!st.onlyRep||Number(c.dataset.n)>1)&&(!st.q||c._t.includes(st.q));c.hidden=!show;if(show)n++});
    cnt.textContent=`顯示 ${n} 題`;
    tabs.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===st.sj||(b.dataset.v==='rep'&&st.onlyRep)));
  }
  tabs.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;if(b.dataset.v==='rep')st.onlyRep=!st.onlyRep;else st.sj=b.dataset.v;apply()};
  let t;q.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{st.q=q.value.trim().toLowerCase();apply()},150)});
  apply();
})();
