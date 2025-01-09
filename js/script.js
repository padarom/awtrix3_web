

// Sidebar und Menü-Toggle
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

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
    nav.addEventListener('click', async (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        nav.classList.add('active');

        const page = nav.getAttribute('data-page');
        await loadPage(page); // Dynamische Seite laden
    });
});

// Dynamische Seiten laden
async function loadPage(pageId) {
    try {
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

                // Dynamisches Skript laden
                const script = document.createElement('script');
                script.src = `js/${pageId}.js`; // Stelle sicher, dass das Skript für die Seite existiert
                script.type = 'module'; // Füge dies hinzu, wenn das Skript ein Modul ist
                document.body.appendChild(script);
                console.log(script.src);
        
    } catch (error) {
        console.error('Fehler beim Laden der Seite:', error);
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

// Standardseite beim Start laden
(async () => {
    const defaultPage = 'dashboard'; // Setze hier die Standardseite
    await loadPage(defaultPage);
    document.querySelector(`.nav-item[data-page="${defaultPage}"]`)?.classList.add('active');
})();

