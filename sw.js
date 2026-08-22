var C='tlog-v2';
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
  /* 앱 본체(index)는 항상 서버 재검증 — 페이지 캐시(10분)로 구버전이 남는 문제 차단 */
  var isDoc=e.request.mode==='navigate'||e.request.url.indexOf('index.html')>=0||e.request.url.slice(-1)==='/';
  var req=isDoc?new Request(e.request.url,{cache:'no-cache'}):e.request;
  e.respondWith(
    fetch(req).then(function(r){
      var cp=r.clone();
      caches.open(C).then(function(c){c.put(e.request,cp);});
      return r;
    }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('index.html');});})
  );
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){if('focus' in cs[i])return cs[i].focus();}
    if(clients.openWindow)return clients.openWindow('.');
  }));
});
