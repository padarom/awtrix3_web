import { getBaseUrl, proxyFetch, BASE_URL } from './utils.js';

// Check if we're in an iframe
const isIframe = window !== window.parent;

// Toast Manager
const toastManager = {
    show: function(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animation
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, duration);
    }
};

// Settings Manager
const settingsManager = {
    pendingChanges: new Map(),
    
    addPendingChange: function(key, value) {
        this.pendingChanges.set(key, value);
        document.querySelector('.settings-actions').classList.add('has-changes');
    },
    
    clearPendingChanges: function() {
        this.pendingChanges.clear();
        document.querySelector('.settings-actions').classList.remove('has-changes');
    },
    
    hasPendingChanges: function() {
        return this.pendingChanges.size > 0;
    },
    
    saveAllChanges: async function() {
        if (!this.hasPendingChanges()) return;
        
        const settingsData = Object.fromEntries(this.pendingChanges);
        try {
            showLoading(true);
            const response = await proxyFetch(`${BASE_URL}/api/system`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsData)
            });
            
            if (response && response.success === true) {
                toastManager.show('Einstellungen wurden gespeichert', 'success');
                this.clearPendingChanges();
            } else {
                toastManager.show('Fehler beim Speichern der Einstellungen', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toastManager.show('Fehler beim Speichern der Einstellungen', 'error');
        } finally {
            showLoading(false);
        }
    },
    
    discardChanges: function() {
        this.clearPendingChanges();
        loadSettings(); // Reload settings from server
        toastManager.show('Änderungen wurden verworfen', 'info');
    }
};

// Initialize settings listeners
function initializeSettings() {
    // Add collapse/expand functionality to sections
    document.querySelectorAll('.settings-section h2').forEach(header => {
        header.innerHTML = `
            <span>${header.textContent}</span>
            <button class="section-toggle">
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
        
        header.addEventListener('click', () => {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
            const icon = header.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-right');
        });
    });
    
    // Initialize Action Buttons
    document.querySelector('.settings-actions .btn-secondary').addEventListener('click', () => {
        if (settingsManager.hasPendingChanges()) {
            if (confirm('Möchten Sie wirklich alle Änderungen verwerfen?')) {
                settingsManager.discardChanges();
            }
        } else {
            toastManager.show('Keine Änderungen zum Zurücksetzen vorhanden', 'info');
        }
    });
    
    document.querySelector('.settings-actions .btn').addEventListener('click', async () => {
        if (settingsManager.hasPendingChanges()) {
            await settingsManager.saveAllChanges();
        } else {
            toastManager.show('Keine Änderungen zum Speichern vorhanden', 'info');
        }
    });

    loadSettings(); // Load settings when initializing

    // Handle input changes for text and number inputs
    document.querySelectorAll('.settings-section input[type="text"], .settings-section input[type="number"]')
        .forEach(input => {
            input.addEventListener('change', handleSettingChange);
            // Add validation feedback
            input.addEventListener('input', validateInput);
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
            addPendingChange('C_CORRECTION', colorValue);
        });
    });

    // Special handler for color temperature
    const tempInputs = document.querySelectorAll('.color-setting')[1].querySelectorAll('input');
    tempInputs.forEach(input => {
        input.addEventListener('change', () => {
            const [r, g, b] = Array.from(tempInputs).map(input => parseInt(input.value));
            const colorValue = (r << 16) | (g << 8) | b;
            addPendingChange('C_TEMPERATURE', colorValue);
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
                addPendingChange(input.id, 0); // Disable color (value 0)
            } else {
                // Send current color value when enabled
                const hex = input.value;
                const r = parseInt(hex.substr(1, 2), 16);
                const g = parseInt(hex.substr(3, 2), 16);
                const b = parseInt(hex.substr(5, 2), 16);
                const colorValue = (r << 16) | (g << 8) | b;
                addPendingChange(input.id, colorValue);
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
                addPendingChange(e.target.id, colorValue);
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
    
    // Add search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Einstellungen durchsuchen...';
    searchInput.className = 'settings-search form-control';
    document.querySelector('#settings .header').appendChild(searchInput);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.length < 2) {
            // If search term is too short, show all sections
            document.querySelectorAll('.settings-section').forEach(section => {
                section.style.display = 'block';
                section.classList.remove('search-highlight');
                
                // Show all settings items
                section.querySelectorAll('.setting-item').forEach(item => {
                    item.style.display = 'flex';
                    item.classList.remove('search-match');
                });
            });
            return;
        }
        
        // Search through all settings
        document.querySelectorAll('.settings-section').forEach(section => {
            const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
            const hasMatch = sectionTitle.includes(searchTerm);
            
            // Search in setting items
            let matchFound = false;
            section.querySelectorAll('.setting-item').forEach(item => {
                const label = item.querySelector('label')?.textContent.toLowerCase() || '';
                const desc = item.querySelector('.setting-desc')?.textContent.toLowerCase() || '';
                
                const itemMatch = label.includes(searchTerm) || desc.includes(searchTerm);
                
                if (itemMatch) {
                    matchFound = true;
                    item.style.display = 'flex';
                    item.classList.add('search-match');
                } else {
                    item.style.display = hasMatch ? 'flex' : 'none';
                    item.classList.remove('search-match');
                }
            });
            
            // Show/hide section based on matches
            section.style.display = (hasMatch || matchFound) ? 'block' : 'none';
            section.classList.toggle('search-highlight', hasMatch);
            
            // Expand sections with matches
            if (hasMatch || matchFound) {
                section.classList.remove('collapsed');
                const icon = section.querySelector('.section-toggle i');
                if (icon) {
                    icon.classList.add('fa-chevron-down');
                    icon.classList.remove('fa-chevron-right');
                }
            }
        });
    });
}

// Validate inputs
function validateInput(event) {
    const input = event.target;
    const wrapper = input.closest('.setting-item');
    
    if (input.type === 'number') {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        if (input.value === '') {
            wrapper.classList.remove('valid', 'invalid');
        } else if ((min !== NaN && value < min) || (max !== NaN && value > max)) {
            wrapper.classList.add('invalid');
            wrapper.classList.remove('valid');
        } else {
            wrapper.classList.add('valid');
            wrapper.classList.remove('invalid');
        }
    } else if (input.type === 'text' && input.pattern) {
        const regex = new RegExp(input.pattern);
        if (input.value === '') {
            wrapper.classList.remove('valid', 'invalid');
        } else if (regex.test(input.value)) {
            wrapper.classList.add('valid');
            wrapper.classList.remove('invalid');
        } else {
            wrapper.classList.add('invalid');
            wrapper.classList.remove('valid');
        }
    }
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

// Add a pending change to the queue
function addPendingChange(key, value) {
    settingsManager.addPendingChange(key, value);
}

// Show toast message
function showToast(message, type = 'info') {
    toastManager.show(message, type);
}

// Update loadSettings to handle security correctly
async function loadSettings() {
    showLoading(true);
    try {
        const settings = await proxyFetch(`${BASE_URL}/api/system`);
        console.log('Received settings:', settings);
        populateSettings(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Fehler beim Laden der Einstellungen', 'error');
    } finally {
        showLoading(false);
    }
}

// Populate all form elements with settings
function populateSettings(settings) {
    console.info("[DEBUG] Erhaltene Einstellungen:", settings);
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
            element.checked = value === true || value === "true";
        } else if (element.type === 'number' || element.type === 'text' || element.tagName === 'SELECT') {
            element.value = value ?? '';
        }
    });

    // Handle static IP fields
    if ('NET_STATIC' in settings) {
        const ipInputs = document.querySelectorAll('.ip-setting input');
        const isStatic = settings.NET_STATIC === true || settings.NET_STATIC === "true";
        ipInputs.forEach(input => {
            input.disabled = !isStatic;
        });
    }
    
    // Clear any pending changes
    settingsManager.clearPendingChanges();
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

    addPendingChange(id, value);
}

// Update updateSetting to handle proxied responses correctly
async function updateSetting(key, value) {
    try {
        const settingsData = {
            [key]: value
        };

        console.log('Sending setting update:', settingsData);

        const response = await proxyFetch(`${BASE_URL}/api/system`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData)
        });

        // Die Antwort wird wie im Dashboard behandelt
        if (response && response.success === true) {
            showToast('Einstellung gespeichert', 'success');
            return true;
        } else {
            showToast('Fehler beim Speichern der Einstellung', 'error');
            return false;
        }

    } catch (error) {
        console.error('Error updating setting:', error);
        showToast('Fehler beim Speichern der Einstellung', 'error');
        return false;
    }
}

// Check for unsaved changes before leaving page
window.addEventListener('beforeunload', (e) => {
    if (settingsManager.hasPendingChanges()) {
        const confirmationMessage = 'Es gibt ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

initializeSettings();

