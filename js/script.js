// Sidebar und Menü-Toggle
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById('overlay');
const content = document.getElementById('content');
const navItems = document.querySelectorAll('.nav-item');
const navGroups = document.querySelectorAll('.nav-group');

// Sidebar-Interaktionen
menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('hidden');
    overlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

overlay.addEventListener('click', () => {
    sidebar?.classList.remove('hidden');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
});

// Navigation und Seitenwechsel
navItems.forEach(item => {
    // Skip parent items in nav groups
    if (item.classList.contains('nav-item-parent')) return;
    
    item.addEventListener('click', () => {
        // If this is a page link
        const pageId = item.getAttribute('data-page');
        if (pageId) {
            loadPage(pageId);
            
            // Set active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Close mobile menu
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('hidden');
                overlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
});

// Add handler for nav groups
navGroups.forEach(group => {
    const parentItem = group.querySelector('.nav-item-parent');
    parentItem.addEventListener('click', () => {
        group.classList.toggle('open');
    });
});

// Dynamische Seiten laden
async function loadPage(pageId) {
    try {
        // Special handling for creator page
        if (pageId === 'creator') {
            const content = document.getElementById('content');
            if (content) {
                content.innerHTML = `
                    <iframe 
                        src="piskel/index.html" 
                        style="width: 100%; height: 100vh; border: none;"
                        allowfullscreen>
                    </iframe>`;
                return;
            }
        }

        // Normal page loading for all other pages
        const response = await fetch(`pages/${pageId}.html`);
        if (!response.ok) throw new Error(`Fehler beim Laden der Seite: ${pageId}`);
        const html = await response.text();

        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = html;
            // Dynamisches Skript laden
            const script = document.createElement('script');
            script.src = `js/${pageId}.js`;
            script.type = 'module';
            // Event erst dispatchen, wenn das Skript geladen ist
            script.onload = () => {
                document.dispatchEvent(new CustomEvent('awtrixPageChange', {
                    detail: { pageId }
                }));
            };
            document.body.appendChild(script);
        } else {
            console.error('Content-Container (#content) nicht gefunden.');
        }

        // Update page title and history state
        updatePageTitleAndState(pageId);
    } catch (error) {
        console.error('Fehler beim Laden der Seite:', error);
        content.innerHTML = `<div class="error-message">Fehler beim Laden der Seite: ${error.message}</div>`;
    }
}

// Standardseite beim Start laden
(async () => {
    const defaultPage = 'dashboard'; // Setze hier die Standardseite
    await loadPage(defaultPage);
    document.querySelector(`.nav-item[data-page="${defaultPage}"]`)?.classList.add('active');
})();

// Update page title and history state
function updatePageTitleAndState(pageId) {
    let pageTitle = '';
    switch (pageId) {
        case 'dashboard':
            pageTitle = 'Dashboard';
            break;
        case 'settings':
            pageTitle = 'Einstellungen';
            break;
        case 'wifi':
            pageTitle = 'WLAN';
            break;
        case 'mqtt':
            pageTitle = 'MQTT';
            break;
        case 'network':
            pageTitle = 'Netzwerk';
            break;
        case 'time':
            pageTitle = 'Zeiteinstellungen';
            break;
        case 'icons':
            pageTitle = 'Icons';
            break;
        case 'creator':
            pageTitle = 'Icon Creator';
            break;
        default:
            pageTitle = 'AWTRIX 3';
    }
    document.title = `AWTRIX 3 | ${pageTitle}`;
    history.pushState(null, pageTitle, `#${pageId}`);
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const pageId = window.location.hash.substring(1) || 'dashboard';
    loadPage(pageId);
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });
});

// Show toast notification
window.showToast = function(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fa-solid fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fa-solid fa-times-circle"></i>';
            break;
        default:
            icon = '<i class="fa-solid fa-info-circle"></i>';
    }
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    // Remove toast after it fades out
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

