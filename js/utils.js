export function getBaseUrl() {
    const isIframe = window !== window.parent;
    
    if (isIframe) {
        try {
            const parentUrl = window.parent.location.href;
            return `http://${new URL(parentUrl).host}`;
        } catch (e) {
            return '';
        }
    }
    return `http://${localStorage.getItem('espIp') || '192.168.178.111'}`;
}

// Enhanced API communication class
export class AWTRIX_API {
    static instance = null;
    
    constructor() {
        this.baseUrl = getBaseUrl();
        this.isIframe = window !== window.parent;
        this.callbacks = new Map();
    }

    static getInstance() {
        if (!AWTRIX_API.instance) {
            AWTRIX_API.instance = new AWTRIX_API();
        }
        return AWTRIX_API.instance;
    }

    // Core fetch functionality
    async fetch(endpoint, options = {}) {
        const url = this.isIframe ? endpoint : `${this.baseUrl}${endpoint}`;
        
        if (!this.isIframe) {
            return fetch(url, options)
                .then(res => options.method === 'POST' ? { success: true } : res.json());
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

    // API Methods
    async getStats() {
        return this.fetch('/api/stats');
    }

    async getScreen() {
        return this.fetch('/api/screen');
    }

    async updateSetting(key, value) {
        return this.fetch('/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: value })
        });
    }

    async getSettings() {
        return this.fetch('/api/system');
    }

    async nextApp() {
        return this.fetch('/api/nextapp', { method: 'POST' });
    }

    async previousApp() {
        return this.fetch('/api/previousapp', { method: 'POST' });
    }

    // File operations
    async uploadFile(path, data) {
        return this.fetch('/edit', {
            method: 'POST',
            body: { isFile: true, path, data }
        });
    }

    async deleteFile(path) {
        return this.fetch('/edit', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `path=${encodeURIComponent(path)}`
        });
    }

    async renameFile(oldPath, newPath) {
        return this.fetch('/edit', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `path=${encodeURIComponent(newPath)}&src=${encodeURIComponent(oldPath)}`
        });
    }

    async listFiles(dir) {
        return this.fetch(`/list?dir=${dir}`);
    }
}

// Utility functions
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container') || createToastContainer();
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Format utilities
export const formatters = {
    bytes: (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    uptime: (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }
};

