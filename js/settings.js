// Replace static BASE_URL with dynamic version
const BASE_URL = (() => {
    const espIp = localStorage.getItem('espIp') || '192.168.178.111';
    return `http://${espIp}`;
})();

// Check if we're in an iframe
const isIframe = window !== window.parent;

// Add proxyFetch function
function proxyFetch(url, options = {}) {
    const targetUrl = window !== window.parent ? url.replace(BASE_URL, '') : url;
    
    if (window === window.parent) {
        console.log('Direct request:', targetUrl);
        return fetch(targetUrl, options)
            .then(res => res.ok ? (options.method === 'POST' ? {success: true} : res.json()) : Promise.reject('Request failed'))
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
        
        const message = {
            id: messageId,
            url,
            method: options.method || 'GET',
            body: options.body
        };
        
        window.parent.postMessage(message, '*');
    });
}

// Initialize settings listeners
function initializeSettings() {
    loadSettings(); // Load settings when initializing

    // Handle input changes for text and number inputs
    document.querySelectorAll('.settings-section input[type="text"], .settings-section input[type="number"]')
        .forEach(input => {
            input.addEventListener('change', handleSettingChange);
        });

    // Handle checkbox changes
    document.querySelectorAll('.settings-section input[type="checkbox"]')
        .forEach(checkbox => {
            checkbox.addEventListener('change', handleSettingChange);
        });

    // Handle select changes
    document.querySelectorAll('.settings-section select')
        .forEach(select => {
            select.addEventListener('change', handleSettingChange);
        });

    // Special handler for color correction
    const colorInputs = document.querySelector('.color-setting').querySelectorAll('input');
    colorInputs.forEach(input => {
        input.addEventListener('change', () => {
            const [r, g, b] = Array.from(colorInputs).map(input => parseInt(input.value));
            // Convert RGB to uint32_t
            const colorValue = (r << 16) | (g << 8) | b;
            updateSetting('C_CORRECTION', colorValue);
        });
    });

    // Special handler for color temperature
    const tempInputs = document.querySelectorAll('.color-setting')[1].querySelectorAll('input');
    tempInputs.forEach(input => {
        input.addEventListener('change', () => {
            const [r, g, b] = Array.from(tempInputs).map(input => parseInt(input.value));
            const colorValue = (r << 16) | (g << 8) | b;
            updateSetting('C_CORRECTION', colorValue);
        });
    });

    // Special handler for color temperature
    const tempInputs = document.querySelectorAll('.color-setting')[1].querySelectorAll('input');
    tempInputs.forEach(input => {
        input.addEventListener('change', () => {
            const [r, g, b] = Array.from(tempInputs).map(input => parseInt(input.value));
            const colorValue = (r << 16) | (g << 8) | b;
            updateSetting('C_TEMPERATURE', colorValue);
        });
    });

    // Special handler for all color inputs
    document.querySelectorAll('input[type="color"]').forEach(input => {
        const toggleId = input.id + '_enabled';
        const toggle = document.getElementById(toggleId);

        // Handle toggle changes
        toggle?.addEventListener('change', (e) => {
            input.disabled = !e.target.checked;
            if (!e.target.checked) {
                updateSetting(input.id, 0); // Disable color (value 0)
            } else {
                // Send current color value when enabled
                const hex = input.value;
                const r = parseInt(hex.substr(1, 2), 16);
                const g = parseInt(hex.substr(3, 2), 16);
                const b = parseInt(hex.substr(5, 2), 16);
                const colorValue = (r << 16) | (g << 8) | b;
                updateSetting(input.id, colorValue);
            }
        });

        // Handle color changes (only when enabled)
        input.addEventListener('change', (e) => {
            if (!input.disabled) {
                const hex = e.target.value;
                const r = parseInt(hex.substr(1, 2), 16);
                const g = parseInt(hex.substr(3, 2), 16);
                const b = parseInt(hex.substr(5, 2), 16);
                const colorValue = (r << 16) | (g << 8) | b;
                updateSetting(e.target.id, colorValue);
            }
        });
    });

    // Handle static IP toggle
    const staticIpToggle = document.getElementById('NET_STATIC');
    const ipInputs = document.querySelectorAll('.ip-setting input');

    staticIpToggle?.addEventListener('change', (e) => {
        ipInputs.forEach(input => {
            input.disabled = !e.target.checked;
        });
    });
}

// Show or hide loading indicator
function showLoading(show = true) {
    const loader = document.getElementById('settings-loading');
    if (show) {
        loader.classList.add('active');
    } else {
        loader.classList.remove('active');
    }
}

// Update loadSettings to handle security correctly
async function loadSettings() {
    showLoading(true);
    try {
        // Use relative URL if in iframe
        const url = isIframe ? '/api/system' : `${BASE_URL}/api/system`;
        const settings = await proxyFetch(url);
        populateSettings(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Error loading settings', 'error');
    } finally {
        showLoading(false);
    }
}

// Populate all form elements with settings
function populateSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (!element) return;

        // Handle color inputs
        if (element.type === 'color' && typeof value === 'number') {
            const toggle = document.getElementById(key + '_enabled');
            if (value === 0) {
                // Color is disabled
                element.disabled = true;
                if (toggle) toggle.checked = false;
            } else {
                // Color is enabled, set the color value
                element.disabled = false;
                if (toggle) toggle.checked = true;
                const r = (value >> 16) & 0xFF;
                const g = (value >> 8) & 0xFF;
                const b = value & 0xFF;
                const hex = '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                element.value = hex;
            }
            return;
        }

        // Handle other inputs as before
        if (element.type === 'checkbox') {
            element.checked = value;
        } else if (element.type === 'number' || element.type === 'text' || element.tagName === 'SELECT') {
            element.value = value;
        }
    });

    // Handle static IP fields
    if ('NET_STATIC' in settings) {
        const ipInputs = document.querySelectorAll('.ip-setting input');
        ipInputs.forEach(input => {
            input.disabled = !settings.NET_STATIC;
        });
    }
}

// Handle setting changes
async function handleSettingChange(event) {
    const input = event.target;
    const id = input.id;
    let value;

    if (input.type === 'checkbox') {
        value = input.checked;
    } else if (input.type === 'number') {
        value = input.type === 'number' && input.step === '0.1' ?
            parseFloat(input.value) : parseInt(input.value);
    } else {
        value = input.value;
    }

    await updateSetting(id, value);
}

// Update updateSetting to use proxyFetch correctly
async function updateSetting(key, value) {
    try {
        const settingsData = {
            [key]: value
        };

        // Use relative URL if in iframe
        const url = isIframe ? '/api/system' : `${BASE_URL}/api/system`;
        const response = await proxyFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData)
        });

        if (response.success) {
            showToast('Setting saved', 'success');
        } else {
            showToast('Error saving setting', 'error');
        }
    } catch (error) {
        console.error('Error updating setting:', error);
        showToast('Error saving setting', 'error');
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
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

// Initialize when DOM is loaded
initializeSettings();
