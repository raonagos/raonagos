var CACHE = "rao-nagos-v1";
var SHELL = [
"./", "index.html", "index.md", "manifest.webmanifest",
"assets/logo.png", "assets/hero_bg.webp", "assets/media_cover.webp",
"assets/w-1.webp", "assets/w-2.webp", "assets/w-4.webp",
"assets/icons/favicon.ico", "assets/icons/favicon-32x32.png",
"assets/icons/apple-touch-icon.png"
];
self.addEventListener("install", function (e) {
e.waitUntil(caches.open(CACHE).then(function (c) {
return Promise.all(SHELL.map(function (u) {
return c.add(new Request(u, { cache: "reload" })).catch(function () {});
}));
}).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
e.waitUntil(caches.keys().then(function (keys) {
return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
}).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
var req = e.request;
if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
if (req.mode === "navigate") {
e.respondWith(fetch(req).then(function (r) {
var copy = r.clone();
caches.open(CACHE).then(function (c) { c.put("index.html", copy); });
return r;
}).catch(function () {
return caches.match("index.html").then(function (r) { return r || caches.match("./"); });
}));
return;
}
e.respondWith(caches.match(req).then(function (hit) {
var net = fetch(req).then(function (r) {
if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
return r;
}).catch(function () { return hit; });
return hit || net;
}));
});
