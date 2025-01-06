// Tab switching functionality
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding section
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// WiFi scanning functionality
document.getElementById('scanWifi').addEventListener('click', async () => {
    try {
        const wifiList = document.getElementById('wifiList');
        wifiList.innerHTML = '<div class="wifi-item">Scanning...</div>';
        
        // Simulate WiFi scan - replace with actual API call
        const networks = await simulateWifiScan();
        
        wifiList.innerHTML = networks.map(network => `
            <div class="wifi-item" data-ssid="${network.ssid}">
                <span>${network.ssid}</span>
                <div class="wifi-signal">
                    <span>${network.strength}%</span>
                    ${network.secured ? '🔒' : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers for WiFi networks
        document.querySelectorAll('.wifi-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('ssid').value = item.dataset.ssid;
                document.getElementById('password').focus();
            });
        });
    } catch (error) {
        showToast('Failed to scan WiFi networks', 'error');
    }
});

// Form submission handlers
document.getElementById('wifiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        // Replace with actual API call
        const formData = {
            ssid: document.getElementById('ssid').value,
            password: document.getElementById('password').value
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast('WiFi settings saved successfully');
    } catch (error) {
        showToast('Failed to save WiFi settings', 'error');
    }
});

document.getElementById('mqttForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        // Replace with actual API call
        const formData = {
            broker: document.getElementById('broker').value,
            port: document.getElementById('port').value,
            username: document.getElementById('mqttUser').value,
            password: document.getElementById('mqttPass').value,
            topic: document.getElementById('topic').value
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast('MQTT settings saved successfully');
    } catch (error) {
        showToast('Failed to save MQTT settings', 'error');
    }
});

document.getElementById('timeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        // Replace with actual API call
        const formData = {
            timezone: document.getElementById('timezone').value,
            ntpServer: document.getElementById('ntpServer').value,
            timeFormat: document.getElementById('timeFormat').value
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout
