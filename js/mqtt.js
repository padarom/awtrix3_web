import { getBaseUrl, proxyFetch, BASE_URL } from './utils.js';

async function initializeMQTTSettings() {
    await loadMQTTSettings();
    setupEventListeners();
}

async function loadMQTTSettings() {
    try {
        const settings = await proxyFetch(`${BASE_URL}/api/system`);
        console.info("MQTT SETTINGS:", settings); 

        if (!settings) {
            throw new Error('Keine Einstellungen erhalten');
        }

        populateMQTTForm(settings);

    } catch (error) {
        console.error('Error loading MQTT settings:', error);
        showToast('Error loading MQTT settings', 'error');
    }
}

function populateMQTTForm(settings) {
    // Add MQTT active state
    const mqttToggle = document.getElementById('MQTT_ACTIVE');
    const mqttInputs = document.querySelectorAll('.mqtt-settings input');
    
    if (mqttToggle && 'MQTT_ACTIVE' in settings) {
        mqttToggle.checked = settings.MQTT_ACTIVE;
        mqttInputs.forEach(input => {
            input.disabled = !settings.MQTT_ACTIVE;
        });
    }

    // Map settings to form fields
    const mappings = {
        'MQTT_HOST': 'broker',
        'MQTT_PORT': 'port',
        'MQTT_USER': 'mqttUser',
        'MQTT_PASS': 'mqttPassword',
        'MQTT_PREFIX': 'topic'
    };

    Object.entries(mappings).forEach(([key, elementId]) => {
        const element = document.getElementById(elementId);
        if (element && key in settings) {
            element.value = settings[key];
        }
    });

    // Update connection status if available
    updateConnectionStatus(settings.MQTT_CONNECTED || false);
}

function setupEventListeners() {
    // Add MQTT toggle handler
    const mqttToggle = document.getElementById('MQTT_ACTIVE');
    const mqttInputs = document.querySelectorAll('.mqtt-settings input');
    
    mqttToggle?.addEventListener('change', (e) => {
        mqttInputs.forEach(input => {
            input.disabled = !e.target.checked;
        });
        updateSetting('MQTT_ACTIVE', e.target.checked);
    });

    const form = document.getElementById('mqttForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const settings = {
            MQTT_ACTIVE: document.getElementById('MQTT_ACTIVE').checked,
            MQTT_HOST: document.getElementById('broker').value,
            MQTT_PORT: parseInt(document.getElementById('port').value),
            MQTT_USER: document.getElementById('mqttUser').value,
            MQTT_PASS: document.getElementById('mqttPassword').value,
            MQTT_PREFIX: document.getElementById('topic').value
        };

        try {
            const response = await proxyFetch(`${BASE_URL}/api/system`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });

            if (!response || response.success !== true) {
                throw new Error('Failed to save MQTT settings');
            }
           

            showToast('MQTT settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving MQTT settings:', error);
            showToast('Error saving MQTT settings', 'error');
        }
    });
}

function updateConnectionStatus(isConnected) {
    const statusBadge = document.querySelector('.status-badge');
    if (!statusBadge) return;

    statusBadge.className = `status-badge ${isConnected ? 'success' : 'error'}`;
    statusBadge.innerHTML = `
        <i class="fa-solid ${isConnected ? 'fa-check-circle' : 'fa-x-circle'}"></i>
        ${isConnected ? 'Connected' : 'Not Connected'}
    `;
}

// Toast function from shared code
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
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize when page loads
document.addEventListener('awtrixPageChange', (e) => {
    if (e.detail.pageId === 'mqtt') {
        initializeMQTTSettings();
    }
});
