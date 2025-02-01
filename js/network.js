import { BASE_URL } from './dashboard.js';



async function initializeNetworkSettings() {
    await loadNetworkSettings();
    setupEventListeners();
}

async function loadNetworkSettings() {
    try {
        const response = await fetch(`${BASE_URL}/api/system`);
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        const settings = await response.json();
        populateNetworkForm(settings);
    } catch (error) {
        console.error('Error loading network settings:', error);
        showToast('Error loading network settings', 'error');
    }
}

function populateNetworkForm(settings) {
    const staticIpToggle = document.getElementById('NET_STATIC');
    const ipInputs = document.querySelectorAll('.ip-setting input');
    
    if (staticIpToggle && 'NET_STATIC' in settings) {
        staticIpToggle.checked = settings.NET_STATIC;
        ipInputs.forEach(input => {
            input.disabled = !settings.NET_STATIC;
        });
    }

    const mappings = {
        'NET_IP': 'NET_IP',
        'NET_GW': 'NET_GW',
        'NET_SN': 'NET_SN',
        'NET_PDNS': 'NET_PDNS',
        'NET_SDNS': 'NET_SDNS'
    };

    Object.entries(mappings).forEach(([key, elementId]) => {
        const element = document.getElementById(elementId);
        if (element && key in settings) {
            element.value = settings[key];
        }
    });
}

function setupEventListeners() {
    const staticIpToggle = document.getElementById('NET_STATIC');
    const ipInputs = document.querySelectorAll('.ip-setting input');
    
    staticIpToggle?.addEventListener('change', (e) => {
        ipInputs.forEach(input => {
            input.disabled = !e.target.checked;
        });
    });

    const form = document.getElementById('networkForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const settings = {
            NET_STATIC: document.getElementById('NET_STATIC').checked,
            NET_IP: document.getElementById('NET_IP').value,
            NET_GW: document.getElementById('NET_GW').value,
            NET_SN: document.getElementById('NET_SN').value,
            NET_PDNS: document.getElementById('NET_PDNS').value,
            NET_SDNS: document.getElementById('NET_SDNS').value
        };

        await saveNetworkSettings(settings);
    });
}

async function saveNetworkSettings(settings) {
    try {
        const response = await fetch(`${BASE_URL}/api/system`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            showToast('Error saving network settings', 'error');
            return;
        }

        showToast('Network settings saved', 'success');

    } catch (error) {
        showToast('Error saving network settings', 'error');
    }
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

initializeNetworkSettings();
