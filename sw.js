var C='tlog-v1';
var CORE=['.','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){if(k!==C)return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var cp=r.clone();
      caches.open(C).then(function(c){c.put(e.request,cp);});
      return r;
    }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('index.html');});})
  );
});