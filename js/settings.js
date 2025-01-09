const BASE_URL = 'http://192.168.178.111';

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
                const r = parseInt(hex.substr(1,2), 16);
                const g = parseInt(hex.substr(3,2), 16);
                const b = parseInt(hex.substr(5,2), 16);
                const colorValue = (r << 16) | (g << 8) | b;
                updateSetting(input.id, colorValue);
            }
        });

        // Handle color changes (only when enabled)
        input.addEventListener('change', (e) => {
            if (!input.disabled) {
                const hex = e.target.value;
                const r = parseInt(hex.substr(1,2), 16);
                const g = parseInt(hex.substr(3,2), 16);
                const b = parseInt(hex.substr(5,2), 16);
                const colorValue = (r << 16) | (g << 8) | b;
                updateSetting(e.target.id, colorValue);
            }
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

// Fetch all settings from server
async function loadSettings() {
    showLoading(true);
    try {
        const response = await fetch(`${BASE_URL}/api/system`);
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        const settings = await response.json();
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

async function updateSetting(key, value) {
    try {
        const settingsData = {
            [key]: value
        };

        console.log('Sending data:', settingsData); // Debug-Ausgabe

        const response = await fetch(`${BASE_URL}/api/system`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) {
            showToast('Fehler beim Speichern der Einstellung', 'error');
            return;
        }

        showToast('Einstellung gespeichert', 'success');

    } catch (error) {
        showToast('Fehler beim Speichern der Einstellung', 'error');
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
