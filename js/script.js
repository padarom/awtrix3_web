// App Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const appLoader = document.querySelector('.app-loader');
    setTimeout(() => {
        appLoader.classList.add('hidden');
    }, 1200);

    // Toast System
    window.showToast = (message, type = 'info', title = null, duration = 3000) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast', type);

        let icon = '';
        switch(type) {
            case 'success':
                icon = 'fa-circle-check';
                title = title || 'Erfolg';
                break;
            case 'error':
                icon = 'fa-circle-exclamation';
                title = title || 'Fehler';
                break;
            case 'warning':
                icon = 'fa-triangle-exclamation';
                title = title || 'Warnung';
                break;
            default:
                icon = 'fa-circle-info';
                title = title || 'Information';
        }

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // Sidebar und Menü-Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("overlay");

    // Sidebar-Interaktionen
    menuToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('hidden');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar?.classList.add('hidden');
        overlay.classList.remove('active');
    });

    // Navigation und Seitenwechsel
    document.querySelectorAll('.nav-item').forEach(nav => {
        if(!nav.classList.contains('nav-item-parent')) {
            nav.addEventListener('click', async (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(item => {
                    if(!item.classList.contains('nav-item-parent')) {
                        item.classList.remove('active');
                    }
                });
                nav.classList.add('active');

                const page = nav.getAttribute('data-page');
                if(page) {
                    await loadPage(page);
                    sidebar?.classList.add('hidden');
                    overlay.classList.remove('active');
                }
            });
        }
    });

    // Add handler for nav groups
    document.querySelectorAll('.nav-item-parent').forEach(item => {
        item.addEventListener('click', () => {
            const group = item.closest('.nav-group');
            group.classList.toggle('open');
        });
    });

    // Dynamische Seiten laden
    async function loadPage(pageId) {
        try {
            showToast(`Lade Seite: ${pageId}`, 'info');
            
            // Content Container vorbereiten
            const content = document.getElementById('content');
            if (!content) {
                console.error('Content-Container (#content) nicht gefunden.');
                return;
            }

            // Loading Effekt
            content.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>Lade Inhalt...</p>
                </div>
            `;

            // Special handling for creator page
            if (pageId === 'creator') {
                content.innerHTML = `
                    <iframe 
                        src="piskel/index.html" 
                        style="width: 100%; height: 100vh; border: none;"
                        allowfullscreen>
                    </iframe>`;
                return;
            }

            // Normal page loading for all other pages
            try {
                const response = await fetch(`pages/${pageId}.html`);
                if (!response.ok) {
                    throw new Error(`Fehler beim Laden der Seite: ${pageId}`);
                }
                const html = await response.text();
                content.innerHTML = html;

                // Dynamisches Skript laden
                const script = document.createElement('script');
                script.src = `js/${pageId}.js`;
                script.type = 'module';

                // Alte Skripte entfernen
                const oldScript = document.querySelector(`script[src="js/${pageId}.js"]`);
                if (oldScript) {
                    oldScript.remove();
                }

                // Event erst dispatchen, wenn das Skript geladen ist
                script.onload = () => {
                    document.dispatchEvent(new CustomEvent('awtrixPageChange', {
                        detail: { pageId }
                    }));
                    showToast(`Seite '${pageId}' erfolgreich geladen`, 'success');
                };

                script.onerror = () => {
                    console.warn(`Kein Skript für '${pageId}' gefunden`);
                    // Dispatch event even if script not found
                    document.dispatchEvent(new CustomEvent('awtrixPageChange', {
                        detail: { pageId }
                    }));
                };

                document.body.appendChild(script);
            } catch (error) {
                content.innerHTML = `
                    <div class="error-content">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2>Seite konnte nicht geladen werden</h2>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadPage('dashboard')">
                            Zurück zum Dashboard
                        </button>
                    </div>
                `;
                showToast(`Fehler beim Laden der Seite: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Seite:', error);
            showToast(`Ein unerwarteter Fehler ist aufgetreten: ${error.message}`, 'error');
        }
    }

    // Überprüfe Online-Status und aktualisiere Status-Indikator
    function updateOnlineStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.online-status span:last-child');
        
        if (navigator.onLine) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusText.textContent = 'Online';
        } else {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusText.textContent = 'Offline';
        }
    }

    // Event-Listener für Online-Status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Standardseite beim Start laden
    (async () => {
        const defaultPage = 'dashboard'; // Setze hier die Standardseite
        await loadPage(defaultPage);
        document.querySelector(`.nav-item[data-page="${defaultPage}"]`)?.classList.add('active');
    })();

    // Exportiere globale Funktionen
    window.loadPage = loadPage;
});

// Utility Functions
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create matrix display animation effect for demo purposes
function initMatrixDisplay() {
    const matrixContainer = document.querySelector('.matrix-dots');
    if (!matrixContainer) return;
    
    // Create matrix dots
    const rows = 8;
    const cols = 32;
    for (let i = 0; i < rows * cols; i++) {
        const dot = document.createElement('div');
        dot.classList.add('matrix-dot');
        matrixContainer.appendChild(dot);
    }
    
    // Animate random dots
    setInterval(() => {
        const dots = document.querySelectorAll('.matrix-dot');
        const randomDot = dots[Math.floor(Math.random() * dots.length)];
        const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
        
        randomDot.classList.add('active');
        randomDot.style.backgroundColor = randomColor;
        randomDot.style.boxShadow = `0 0 10px ${randomColor}`;
        
        setTimeout(() => {
            randomDot.classList.remove('active');
            randomDot.style.backgroundColor = '';
            randomDot.style.boxShadow = '';
        }, 1000);
    }, 100);
}

// Call matrix display initialization when needed
document.addEventListener('awtrixPageChange', (e) => {
    if (e.detail.pageId === 'dashboard') {
        setTimeout(initMatrixDisplay, 500);
    }
});

