export let BASE_URL = "";

export function getBaseUrl() {
    const isIframe = window !== window.parent;
    
    console.info("[INFO] Starte getBaseUrl...");

    if (isIframe) {
        console.info("[INFO] Seite läuft im iframe-Modus");
        
        try {
            // Alternative Methode: `document.referrer`
            const referrerUrl = document.referrer;
            
            if (referrerUrl) {
                const espHost = new URL(referrerUrl).host;
                BASE_URL = `http://${espHost}`;
                console.info("[SUCCESS] BASE_URL erkannt:", BASE_URL);
                return BASE_URL;
            } else {
                throw new Error("Kein gültiger Referrer gefunden.");
            }
        } catch (e) {
            console.error("[ERROR] Fehler beim Ermitteln der BASE_URL:", e);
            return ''; // Leerer String als Fallback
        }

    } else {
        console.info("[INFO] Seite wird direkt aufgerufen");

        // Versuche gespeicherte IP zu verwenden oder Standard-IP zu setzen
        BASE_URL = `http://${localStorage.getItem('espIp') || '192.168.20.210'}`;
        console.info("[SUCCESS] BASE_URL gesetzt:", BASE_URL);

        return BASE_URL;
    }
}

export function proxyFetch(url, options = {}) {
    const isIframe = window !== window.parent;
    const targetUrl = isIframe ? url.replace(BASE_URL, '') : url;
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

