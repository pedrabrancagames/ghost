// Service Worker para Ghostbusters AR
const CACHE_NAME = 'ghostbusters-ar-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets essenciais para cache
const ESSENTIAL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './visual-effects.js',
    './animations.js',
    './notifications.js',
    './ar-debug.js',
    './test-debug.js',
    './offline.html',
    './site.webmanifest',
    './favicon.ico',
    './android-chrome-192x192.png',
    './android-chrome-512x512.png',
    './apple-touch-icon.png',
    './favicon-16x16.png',
    './favicon-32x32.png'
];

// Assets de mídia para cache (modelos 3D, áudios, imagens)
const MEDIA_ASSETS = [
    './assets/models/ghost.glb',
    './assets/models/geleia.glb',
    './assets/audio/proton-beam.mp3',
    './assets/audio/ghost-capture.mp3',
    './assets/audio/inventory_full.mp3',
    './assets/images/logo.png',
    './assets/images/ghost_trap.png',
    './assets/images/proton_pack.png'
];

// CDN Assets (bibliotecas externas)
const CDN_ASSETS = [
    'https://aframe.io/releases/1.5.0/aframe.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Cache assets essenciais primeiro
            try {
                await cache.addAll(ESSENTIAL_ASSETS);
                console.log('[SW] Assets essenciais cacheados');
            } catch (error) {
                console.error('[SW] Erro ao cachear assets essenciais:', error);
            }

            // Cache CDN assets
            try {
                await cache.addAll(CDN_ASSETS);
                console.log('[SW] CDN assets cacheados');
            } catch (error) {
                console.error('[SW] Erro ao cachear CDN assets:', error);
            }

            // Cache assets de mídia (pode falhar se arquivos não existirem)
            for (const asset of MEDIA_ASSETS) {
                try {
                    await cache.add(asset);
                } catch (error) {
                    console.warn(`[SW] Asset não encontrado: ${asset}`);
                }
            }

            console.log('[SW] Service Worker instalado com sucesso');
        })()
    );

    // Força a ativação imediata
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Ativando Service Worker...');

    event.waitUntil(
        (async () => {
            // Limpa caches antigos
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log(`[SW] Removendo cache antigo: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
            );

            // Toma controle de todas as abas
            await self.clients.claim();
            console.log('[SW] Service Worker ativado');
        })()
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    // Ignora requisições não-HTTP
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // Tenta buscar da rede primeiro (estratégia Network First para conteúdo dinâmico)
                if (event.request.method === 'GET') {
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(event.request);

                    // Para assets estáticos, usa Cache First
                    if (isStaticAsset(event.request.url)) {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                    }

                    // Para outros recursos, tenta rede primeiro
                    try {
                        const networkResponse = await fetch(event.request);

                        // Cacheia a resposta se for bem-sucedida
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            cache.put(event.request, responseClone);
                        }

                        return networkResponse;
                    } catch (networkError) {
                        // Se a rede falhar, usa o cache
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // Se não há cache e é uma navegação, mostra página offline
                        if (event.request.mode === 'navigate') {
                            return cache.match(OFFLINE_URL);
                        }

                        throw networkError;
                    }
                }

                // Para métodos não-GET, sempre tenta a rede
                return await fetch(event.request);

            } catch (error) {
                console.error('[SW] Erro na requisição:', error);

                // Fallback para página offline em navegações
                if (event.request.mode === 'navigate') {
                    const cache = await caches.open(CACHE_NAME);
                    return cache.match(OFFLINE_URL);
                }

                throw error;
            }
        })()
    );
});

// Verifica se é um asset estático
function isStaticAsset(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.glb', '.mp3', '.wav'];
    const staticPaths = ['/assets/', '/android-chrome-', '/favicon', '/apple-touch-icon'];

    return staticExtensions.some(ext => url.endsWith(ext)) ||
        staticPaths.some(path => url.includes(path)) ||
        url.includes('aframe.io') ||
        url.includes('unpkg.com');
}

// Mensagens do cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        getCacheStatus().then(status => {
            event.ports[0].postMessage(status);
        });
    }
});

// Status do cache
async function getCacheStatus() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    return {
        cacheName: CACHE_NAME,
        cachedItems: keys.length,
        essentialCached: await checkAssetsCached(cache, ESSENTIAL_ASSETS),
        mediaCached: await checkAssetsCached(cache, MEDIA_ASSETS),
        cdnCached: await checkAssetsCached(cache, CDN_ASSETS)
    };
}

async function checkAssetsCached(cache, assets) {
    let cached = 0;
    for (const asset of assets) {
        const response = await cache.match(asset);
        if (response) cached++;
    }
    return { cached, total: assets.length };
}