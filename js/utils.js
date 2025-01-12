export function getBaseUrl() {
    // If we're in an iframe, get the ESP IP from the parent window's location
    if (window !== window.parent) {
        // Parent URL will be something like http://192.168.1.100/
        try {
            const parentUrl = document.referrer || window.parent.location.href;
            const url = new URL(parentUrl);
            return `http://${url.hostname}`;
        } catch (e) {
            console.warn('Could not access parent URL:', e);
        }
    }
    
    // Fallback to localStorage if not in iframe or cannot access parent
    return `http://${localStorage.getItem('espIp') || '192.168.178.111'}`;
}

export const isIframe = window !== window.parent;
