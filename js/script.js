// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('bg-gradient-to-r', 'from-awtrix-primary', 'to-awtrix-secondary', 'text-gray-900');
            nav.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-gray-800');
        });
        item.classList.add('bg-gradient-to-r', 'from-awtrix-primary', 'to-awtrix-secondary', 'text-gray-900');
        item.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-gray-800');

        // Show/hide pages
        const targetPage = item.dataset.page;
        document.querySelectorAll('#mqtt-page, #status-page').forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(`${targetPage}-page`).classList.remove('hidden');

        // If status page is selected, fetch latest data
        if (targetPage === 'status') {
            fetchStatus();
        }
    });
});

// MQTT Form handling
document.getElementById('mqtt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        broker: document.getElementById('mqtt-broker').value,
        port: document.getElementById('mqtt-port').value,
        username: document.getElementById('mqtt-username').value,
        password: document.getElementById('mqtt-password').value
    };
    console.log('MQTT Settings:', formData);
    // Here you would typically send this data to your backend
});

// Status fetching and display
async function fetchStatus() {
    try {
        const response = await fetch('http://192.168.178.111/api/stats');
        const data = await response.json();
        updateStatusDisplay(data);
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

function updateStatusDisplay(data) {
    const statusGrid = document.getElementById('status-grid');
    statusGrid.innerHTML = ''; // Clear existing cards

    const formatValue = (key, value) => {
        switch(key) {
            case 'bat': return `${value}%`;
            case 'temp': return `${value}°C`;
            case 'hum': return `${value}%`;
            case 'uptime': return `${Math.floor(value / 60)}h ${value % 60}m`;
            case 'wifi_signal': return `${value} dBm`;
            default: return value;
        }
    };

    const translations = {
        bat: 'Batterie',
        temp: 'Temperatur',
        hum: 'Luftfeuchtigkeit',
        uptime: 'Laufzeit',
        wifi_signal: 'WLAN Signal',
        version: 'Version',
        app: 'Aktive App',
        matrix: 'Matrix Status',
        ip_address: 'IP Adresse'
    };

    // Create cards for selected metrics
    Object.entries(translations).forEach(([key, label]) => {
        if (data[key] !== undefined) {
            const card = document.createElement('div');
            card.className = 'bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-700/50';
            card.innerHTML = `
                <div class="text-sm font-medium text-gray-400">${label}</div>
                <div class="mt-1 text-2xl font-semibold text-white">${formatValue(key, data[key])}</div>
            `;
            statusGrid.appendChild(card);
        }
    });
}

// Initial status fetch if starting on status page
if (document.querySelector('.nav-item.active').dataset.page === 'status') {
    fetchStatus();
}

// Periodic status updates when on status page
setInterval(() => {
    if (document.querySelector('.nav-item.active').dataset.page === 'status') {
        fetchStatus();
    }
}, 5000); // Update every 5 seconds