import { GIFEncoder, quantize, applyPalette } from 'https://unpkg.com/gifenc@1.0.3';

const c = document.getElementById('c');
let d, w = 1052, h = 260, e, f = false, g = performance.now();
let recordingStartTime = 0;
let recordingTimer = null;

if (c) {
    d = c.getContext('2d');
    c.width = w;
    c.height = h;
}

function updateRecordingTime() {
    const recordTimeElement = document.getElementById('recordTime');
    if (!recordTimeElement) return;
    
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    recordTimeElement.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')})`;
}

// Fetch und Canvas-Rendering-Funktion
function j() {
    fetch('/awtrix3_web_test/api/screen')
        .then(async response => {
            console.log('Screen API response:', response);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!d) return; // Canvas nicht verfügbar
            d.clearRect(0, 0, c.width, c.height);
            for (let b = 0; b < 8; b++) {
                for (let i = 0; i < 32; i++) {
                    const k = data[b * 32 + i];
                    const l = (k & 0xff0000) >> 16;
                    const m = (k & 0x00ff00) >> 8;
                    const n = k & 0x0000ff;
                    d.fillStyle = `rgb(${l},${m},${n})`;
                    d.fillRect(i * 33, b * 33, 29, 29);
                }
            }
            if (f) {
                const o = performance.now();
                const p = Math.round(o - g);
                g = o;
                const q = d.getImageData(0, 0, w, h).data;
                const r = "rgb444";
                const s = quantize(q, 256, { format: r });
                const t = applyPalette(q, s, r);
                e.writeFrame(t, w, h, {
                    palette: s,
                    delay: p
                });
            }
            j(); // Rekursion für kontinuierliches Update
        })
        .catch(error => {
            console.error("Error fetching screen data:", error);
            // Add retry logic
            setTimeout(j, 5000); // Retry after 5 seconds
        });
}

// Event-Listener für Buttons
document.getElementById("downloadpng")?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = c?.toDataURL();
    a.download = 'awtrix.png';
    a.click();
});

document.getElementById("nextapp")?.addEventListener("click", () => {
    fetch('/awtrix3_web_test/api/nextapp', { method: 'POST' });
});

document.getElementById("previousapp")?.addEventListener("click", () => {
    fetch('/awtrix3_web_test/api/previousapp', { method: 'POST' });
});

document.getElementById("startgif")?.addEventListener("click", async function () {
    const button = this;
    const span = button.querySelector('span:not(.record-time)');
    
    if (f) {
        // Stop recording
        e.finish();
        const b = e.bytesView();
        l(b, 'awtrix.gif', 'image/gif');
        f = false;
        span.textContent = "Record GIF";
        clearInterval(recordingTimer);
        document.getElementById('recordTime').textContent = '';
    } else {
        // Start recording
        e = GIFEncoder();
        g = performance.now();
        f = true;
        span.textContent = "Stop Recording";
        recordingStartTime = Date.now();
        updateRecordingTime();
        recordingTimer = setInterval(updateRecordingTime, 1000);
    }
});

function l(b, a, c) {
    const d = b instanceof Blob ? b : new Blob([b], { type: c });
    const e = URL.createObjectURL(d);
    const f = document.createElement("a");
    f.href = e;
    f.download = a;
    f.click();
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function fetchAndDisplayStats() {
    try {
        const response = await fetch('/awtrix3_web_test/api/stats');
        if (!response.ok) throw new Error('Failed to load statistics');
        
        const stats = await response.json();
        
        // Update RAM metrics
        document.getElementById('ramValue').textContent = `${formatBytes(stats.usedRam)} / ${formatBytes(stats.totalRam)}`;
        
        // Update Flash metrics
        document.getElementById('flashValue').textContent = `${formatBytes(stats.usedFlash)} / ${formatBytes(stats.totalFlash)}`;
        
        // Update Uptime
        document.getElementById('uptimeValue').textContent = formatUptime(stats.uptime);
        
        // Update WiFi Signal
        document.getElementById('wifiValue').textContent = `${stats.wifi_signal} dB`;
        
        // Update Current App
        document.getElementById('currentApp').textContent = stats.app || 'None';
    } catch (error) {
        console.error('Error fetching statistics:', error);
        // Add retry logic
        setTimeout(fetchAndDisplayStats, 5000);
    }
}

// Initialize Chart.js for message history
let messageChart;
function initMessageChart() {
    const ctx = document.getElementById('messageChart').getContext('2d');
    messageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Messages',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateMessageChart(history) {
    if (!messageChart) return;
    
    messageChart.data.labels = history.map((_, i) => `${i}m ago`);
    messageChart.data.datasets[0].data = history;
    messageChart.update();
}

// Add fullscreen functionality
document.getElementById('fullscreen')?.addEventListener('click', () => {
    const container = document.querySelector('.matrix-display');
    if (container.requestFullscreen) {
        container.requestFullscreen();
    }
});

// Responsive Canvas-Anpassung
function resizeCanvas() {
    const container = document.getElementById('container-live');
    if (!container || !c) return;
    
    const containerWidth = container.clientWidth;
    const scale = containerWidth / 1052;
    
    c.style.width = `${containerWidth}px`;
    c.style.height = `${260 * scale}px`;
}

// Event Listener für Resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

// Auto-refresh stats every 30 seconds
setInterval(fetchAndDisplayStats, 30000);

// Initialisiere das Dashboard
async function initializeDashboard() {

    await fetchAndDisplayStats();
}

// Rufe die Initialisierung des Dashboards auf, wenn die Seite geladen wird
document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initializeDashboard();
});
// Initialisierung
j(); // Startet das Rendern der Canvas-Daten

