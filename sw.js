const SHELL = 'milagro-shell-17daefc4fccd273b';
const ASSETS = ["/","/calentamiento","/favicon.svg","/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-001175b1.woff2","/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-52306abf.woff2","/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-875ccdd4.woff2","/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2","/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-ff2310f5.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2","/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-1ab1ad55.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-656bbed6.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-6e1a6b2b.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-7249155f.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-749a3084.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-e34c5f1b.woff2","/_next/static/_vinext_fonts/inter-0c6ec1a12c79/inter-fc83e075.woff2","/_next/static/chunks/app-route-prefetch-policy-B30A1Is_.js","/_next/static/chunks/framework-D_rUT4EX.js","/_next/static/chunks/index-4Der5RMH.js","/_next/static/chunks/layout-segment-context-ipypWWO3.js","/_next/static/chunks/offline-library-BbytLi31.js","/_next/static/chunks/page-BeXyRuE9.js","/_next/static/chunks/rolldown-runtime-C60lm6uB.js","/_next/static/chunks/streamed-icons-Cs-m6aYg.js","/_next/static/chunks/vocal-warmups-De2sg7BT.js","/_next/static/css/index.7vSHmd-Y.css","/_next/static/e28beae7-1cdd-4cd6-bdd7-3f7aa554cee8/_buildManifest.js","/_next/static/e28beae7-1cdd-4cd6-bdd7-3f7aa554cee8/_ssgManifest.js"];
/* SHELL and ASSETS are injected at build time. */
const AUDIO = 'milagro-audio-v1';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    try {
      await cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })));
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(SHELL);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  // Keep earlier shell assets for tabs still running the previous build.
  // Never clear audio downloads during an application update.
  event.waitUntil(self.clients.claim());
});

async function audioResponse(request) {
  const saved = await (await caches.open(AUDIO)).match(request.url);
  if (!saved) return fetch(request);
  const range = request.headers.get('range');
  if (!range) return saved;
  const blob = await saved.blob();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const start = match?.[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match?.[2]));
  const end = match?.[1] && match?.[2] ? Math.min(Number(match[2]), blob.size - 1) : blob.size - 1;
  if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= blob.size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  }
  return new Response(blob.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': saved.headers.get('Content-Type') || 'audio/mpeg',
    'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1),
    'Content-Range': `bytes ${start}-${end}/${blob.size}`,
  } });
}
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(audioResponse(request));
  } else if (request.mode === 'navigate' && ['/', '/calentamiento', '/calentamiento/'].includes(url.pathname)) {
    const key = url.pathname === '/' ? '/' : '/calentamiento';
    event.respondWith(caches.open(SHELL).then(async cache => (await cache.match(key)) || fetch(request)));
  } else if (url.pathname.startsWith('/_next/') || url.pathname === '/favicon.svg') {
    event.respondWith(caches.match(request).then(saved => saved || fetch(request)));
  }
});
