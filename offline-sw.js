---
---

function getAllUrlsToCache() {
  var urls = [
    '/about',
    '/api/reviews.json',
    '/api/bakers.json',
    '/css/main.css'
  ];
  {% for post in site.posts %}
  urls.push('{{ post.permalink }}');
  {% endfor %}
  {% for file in site.static_files %}
  if (isImageExt('{{ file.extname }}')) urls.push('{{ file.path }}');
  {% endfor %}
  return urls;
}

function isImageExt(ext) {
  switch(ext.toLowerCase()) {
    case '.gif':
    case '.png':
    case '.jpg':
    case '.jpeg':
      return true;
    default:
      return false;
  }
}

var CACHE_NAME = 'bagel-blog-offline-cache';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(getAllUrlsToCache());
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }

      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(function(response) {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });

        return response;
      });

    })
  );
});
