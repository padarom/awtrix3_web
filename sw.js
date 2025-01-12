const GITHUB_PAGES_PATH = '/awtrix3_web_test/';  // Add trailing slash
let espIpAddress = '192.168.178.111';

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ESP_IP') {
        //espIpAddress = event.data.ip;
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    console.log('SW: Intercepted request:', {
        url: url.href,
        pathname: url.pathname,
        method: event.request.method,
        headers: Array.from(event.request.headers.entries())
    });
    
    // Check if the request is for the ESP API, checking both paths
    if (url.pathname.includes('/api/') || url.pathname.includes('/awtrix3_web_test/api/')) {
        console.log('SW: API request detected:', {
            originalPath: url.pathname,
            espIpAddress: espIpAddress
        });
        
        // Handle OPTIONS requests for CORS
        if (event.request.method === 'OPTIONS') {
            console.log('SW: Handling OPTIONS request');
            event.respondWith(
                new Response(null, {
                    status: 204,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                })
            );
            return;
        }

        const apiPath = url.pathname.includes('/awtrix3_web_test/api/') 
            ? url.pathname.substring(url.pathname.indexOf('/api/'))
            : url.pathname;
            
        console.log('SW: API path extracted:', apiPath);
        
        event.respondWith(handleApiRequest(event.request, apiPath));
        return;
    }
    
    // Pass through all other requests
    event.respondWith(fetch(event.request));
});

async function handleApiRequest(request, path) {
    console.log('SW: Handling API request:', {
        path: path,
        method: request.method,
        headers: Array.from(request.headers.entries())
    });

    if (!espIpAddress) {
        console.error('SW: ESP IP not configured');
        return new Response('ESP IP not configured', { status: 500 });
    }

    try {
        const espUrl = `http://${espIpAddress}${path}`;
        console.log('SW: Proxying request to:', espUrl);

        // Use fetch with modified options
        const response = await fetch(espUrl, {
            method: request.method,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            redirect: 'follow'
        });

        console.log('SW: Response from ESP:', {
            status: response.status,
            type: response.type,
            headers: Array.from(response.headers.entries())
        });

        // Read the response as an array buffer
        const buffer = await response.arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        console.log('SW: Response text:', text.substring(0, 100)); // Log first 100 chars

        // Try to parse as JSON if possible
        let data;
        try {
            data = JSON.parse(text);
            console.log('SW: Parsed JSON data:', data);
        } catch (e) {
            console.log('SW: Not JSON data, using raw text');
            data = text;
        }

        // Return the processed response
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

    } catch (error) {
        console.error('SW: Proxy error:', {
            message: error.message,
            stack: error.stack,
            path: path
        });
        
        return new Response(JSON.stringify({ 
            error: 'Failed to connect to ESP',
            details: error.message,
            path: path
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

// Ensure service worker activation and claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clear old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim clients immediately
            self.clients.claim()
        ])
    );
});
