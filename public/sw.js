const CACHE='vdvoem-shell-v7';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/app.html','/manifest.webmanifest','/favicon.svg','/apple-touch-icon.png','/icon-192.png','/icon-512.png']))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.pathname.startsWith('/api/'))return;if(['document','script','style','manifest','image'].includes(event.request.destination)){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)))}});

