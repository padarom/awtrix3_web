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
    console.log('Intercepted request:', url.pathname);
    
    // Check if the request is for the ESP API, checking both paths
    if (url.pathname.includes('/api/') || url.pathname.includes('/awtrix3_web_test/api/')) {
        // Handle OPTIONS requests for CORS
        if (event.request.method === 'OPTIONS') {
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
            
        console.log('API path extracted:', apiPath);
        
        event.respondWith(handleApiRequest(event.request, apiPath));
        return;
    }
    
    // Pass through all other requests
    event.respondWith(fetch(event.request));
});

async function handleApiRequest(request, path) {
    console.log('Handling API request:', path);
    if (!espIpAddress) {
        return new Response('ESP IP not configured', { status: 500 });
    }

    try {
        // Create the ESP API URL with cleaned path
        const espUrl = `http://${espIpAddress}${path}`;
        console.log('Proxying request to:', espUrl);

        // Use fetch with no-cors mode for mixed content
        const response = await fetch(espUrl, {
            method: request.method,
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Accept': '*/*'
            }
        });

        // For no-cors responses, we need to handle the data differently
        let responseData;
        try {
            // Try to get response as JSON
            responseData = await response.clone().json();
        } catch (e) {
            try {
                // If JSON fails, try to get as text
                responseData = await response.text();
                try {
                    // Try to parse text as JSON
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // If parsing fails, return as-is
                    console.log('Response is not JSON:', responseData);
                }
            } catch (e) {
                // If text fails, try to get as array buffer
                responseData = await response.arrayBuffer();
            }
        }

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

    } catch (error) {
        console.error('Proxy error:', error);
        // Return a more detailed error response
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
