/* Service worker：離線可用。版本 51eeb96c */
const CACHE='fiq-51eeb96c';
const PRECACHE=["./", "index.html", "review.html", "bank.html", "manifest.webmanifest", "data/questions.json", "assets/style.css?v=51eeb96c", "assets/common.js?v=51eeb96c", "assets/quiz.js?v=51eeb96c", "assets/review.js?v=51eeb96c", "assets/bank.js?v=51eeb96c", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.svg", "icons/apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>{
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>m);
    return m||net;
  }));
});
