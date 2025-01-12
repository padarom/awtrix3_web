const GITHUB_PAGES_PATH = '/awtrix3_web_test';
let espIpAddress = '';

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ESP_IP') {
        espIpAddress = event.data.ip;
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Remove the GitHub Pages path prefix for API requests
    const path = url.pathname.replace(GITHUB_PAGES_PATH, '');
    
    // Check if the request is for the ESP API
    if (path.startsWith('/api/')) {
        event.respondWith(
            handleApiRequest(event.request, path)
        );
        return;
    }
    
    // Pass through all other requests
    event.respondWith(fetch(event.request));
});

async function handleApiRequest(request, path) {
    if (!espIpAddress) {
        return new Response('ESP IP not configured', { status: 500 });
    }

    try {
        // Create the ESP API URL
        const espUrl = `http://${espIpAddress}${path}`;
        
        // Clone the request with the new URL
        const modifiedRequest = new Request(espUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' ? request.body : undefined,
            mode: 'cors'
        });

        const response = await fetch(modifiedRequest);
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to connect to ESP',
            details: error.message 
        }), {
            status: 502,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Update cache paths for GitHub Pages
const CACHE_NAME = 'awtrix3-web-v1';
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                GITHUB_PAGES_PATH + '/',
                GITHUB_PAGES_PATH + '/index.html',
                GITHUB_PAGES_PATH + '/css/style.css',
                GITHUB_PAGES_PATH + '/js/script.js'
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
