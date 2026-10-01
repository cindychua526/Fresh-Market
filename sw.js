// 离线缓存：让游戏可以"添加到主屏幕"，没网也能打开单机模式。
// 每次更新游戏时把版本号 +1，玩家下次打开就会拿到新版本。
const VERSION = 'fm-v18';
const SHELL = ['./', 'index.html', 'game.min.js', 'config.js', 'manifest.webmanifest',
  'i18n.js', 'vendor/three.custom.js', 'vendor/supabase.js', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase 等外部请求直接走网络
  // vendor/ 和 icons/ 基本不变：优先用缓存（不用每次重新下载 800KB 的库），版本号更新时会整体刷新
  if (/\/(vendor|icons)\//.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    })));
    return;
  }
  // 其他文件：先用网络拿最新版，失败再用缓存（保证更新及时，又能离线）
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
