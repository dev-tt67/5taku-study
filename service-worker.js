const CACHE_NAME="quiz-sync-overwrite-clean-fix-v1";
const APP_SHELL=["./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
 const req=e.request; const url=new URL(req.url);
 if(req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("/index.html")){
  e.respondWith(fetch(req,{cache:"no-store"}).catch(()=>caches.match("./")));
  return;
 }
 e.respondWith(caches.match(req).then(c=>c||fetch(req)));
});
