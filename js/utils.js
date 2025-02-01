export function getBaseUrl() {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`);

    ws.onopen = () => {
        console.log('WebSocket verbunden');
        console.log(`http://${window.location.host}`);
        return `http://${window.location.host}`;
    };
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

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Automatisches Entfernen nach 3 Sekunden
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

