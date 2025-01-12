export function getBaseUrl() {
    const isIframe = window !== window.parent;
    
    if (isIframe) {
        // When in iframe, we can get the ESP IP from the parent window URL
        try {
            const parentUrl = window.parent.location.href;
            return `http://${new URL(parentUrl).host}`;
        } catch (e) {
            // Fallback if we can't access parent URL due to CORS
            return '';  // Empty base URL for iframe mode
        }
    } else {
        // Direct access - use stored IP or default
        return `http://${localStorage.getItem('espIp') || '192.168.178.111'}`;
    }
}

export function proxyFetch(url, options = {}) {
    const isIframe = window !== window.parent;
    const targetUrl = isIframe ? url.replace(getBaseUrl(), '') : url;
    
    if (!isIframe) {
        return fetch(targetUrl, options)
            .then(res => options.method === 'POST' ? { success: true } : res.json())
            .catch(err => {
                console.error('Direct fetch error:', err);
                throw err;
            });
    }

    return new Promise((resolve, reject) => {
        const messageId = Date.now().toString();
        
        const handler = (event) => {
            if (event.data.id !== messageId) return;
            window.removeEventListener('message', handler);
            
            if (event.data.success) {
                resolve(event.data.data);
            } else {
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', handler);
        window.parent.postMessage({
            id: messageId,
            url,
            method: options.method || 'GET',
            body: options.body,
            isImage: options.isImage
        }, '*');
    });
}
