const BASE_URL = 'http://192.168.178.111';

async function initializeWiFiPage() {
    setupEventListeners();
    startStatusUpdates();
}

function setupEventListeners() {
    const wifiForm = document.getElementById('wifiForm');
    const passwordToggle = document.querySelector('.password-toggle');
    const scanButton = document.getElementById('scanNetworks');

    wifiForm?.addEventListener('submit', handleWiFiSubmit);
    passwordToggle?.addEventListener('click', togglePasswordVisibility);
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

async function updateConnectionStatus() {
    try {
        const response = await fetch(`${BASE_URL}/api/stats`);
        if (!response.ok) throw new Error('Failed to fetch status');
        
        const data = await response.json();
        
        // Update status badge
        const statusBadge = document.getElementById('wifiStatus');
        const signalDb = parseInt(data.wifi_signal);
        
        // Konvertiere dB in Prozent (typische WiFi-Werte: -50dB bis -100dB)
        const signalStrength = Math.min(Math.max(2 * (signalDb + 100), 0), 100);
        

        // Update connection info
        document.getElementById('currentSSID').textContent = data.ssid || '-';
        document.getElementById('currentIP').textContent = data.ip_address || '-';
        
        // Update signal strength with both dB and percentage
        const signalStrengthElement = document.getElementById('signalStrength');
        if (signalDb !== 0) {
            const signalIcon = getSignalIcon(signalStrength);
            signalStrengthElement.innerHTML = `${signalIcon} ${signalStrength}% (${signalDb} dB)`;
        } else {
            signalStrengthElement.textContent = '-';
        }

    } catch (error) {
        console.error('Error updating WiFi status:', error);
    }
}

function getSignalIcon(strength) {
    if (strength >= 80) return '<i class="fas fa-signal"></i>';
    if (strength >= 60) return '<i class="fas fa-signal" style="opacity:0.8"></i>';
    if (strength >= 40) return '<i class="fas fa-signal" style="opacity:0.6"></i>';
    if (strength >= 20) return '<i class="fas fa-signal" style="opacity:0.4"></i>';
    return '<i class="fas fa-signal" style="opacity:0.2"></i>';
}

async function handleWiFiSubmit(e) {
    e.preventDefault();
    
    const formData = {
        ssid: document.getElementById('ssid').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${BASE_URL}/api/wifi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update WiFi settings');
        
        showToast('WiFi settings updated successfully', 'success');

      
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to update WiFi settings', 'error');
    }
}

function startStatusUpdates() {
    updateConnectionStatus(); // Initial update
    setInterval(updateConnectionStatus, 5000); // Update every 5 seconds
}

// Register page initialization
document.addEventListener('awtrixPageChange', (e) => {
    if (e.detail.pageId === 'wifi') {
        initializeWiFiPage();
    }
});

// Shared toast function (assuming it exists in your global scope)
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
