let espIpAddress = '';

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ESP_IP') {
        espIpAddress = event.data.ip;
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Check if the request is for the ESP API
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            handleApiRequest(event.request)
        );
        return;
    }
    
    // Pass through all other requests
    event.respondWith(fetch(event.request));
});

async function handleApiRequest(request) {
    if (!espIpAddress) {
        return new Response('ESP IP not configured', { status: 500 });
    }

    // Clone the request
    const modifiedRequest = new Request(
        `http://${espIpAddress}${new URL(request.url).pathname}`,
        {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' ? request.body : undefined,
            mode: 'cors'
        }
    );

    try {
        const response = await fetch(modifiedRequest);
        
        // Create a new response with CORS headers
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to connect to ESP' }), {
            status: 502,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Cache name for PWA
const CACHE_NAME = 'awtrix3-web-v1';

// Install event - cache basic resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/script.js'
                // Add other resources you want to cache
            ]);
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
