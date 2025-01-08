let selectedIcon = null;
const renameBtn = document.querySelector('.rename-btn');
const deleteBtn = document.querySelector('.delete-btn');
const BASE_URL = 'http://192.168.178.111';
const ICONS_PATH = '/ICONS';

async function loadIconsFromESP() {
    try {
        const response = await fetch(`${BASE_URL}/list?dir=${ICONS_PATH}`);
        const data = await response.json();
        const container = document.getElementById('esp-icon-grid');
        container.innerHTML = '';


        data.forEach(item => {
            if (item.type === "file") {
                const iconName = item.name;
                const item_div = document.createElement('div');
                item_div.className = 'icon-item';

                item_div.innerHTML = `
                    <div class="icon-preview">
                        <img src="${BASE_URL}${ICONS_PATH}/${iconName}" alt="${iconName}" />
                    </div>
                    <div class="icon-info">
                        <span>${iconName}</span>
                    </div>
                `;

                item_div.addEventListener('click', () => {
                    document.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
                    item_div.classList.add('selected');
                    selectedIcon = iconName;
                    renameBtn.disabled = false;
                    deleteBtn.disabled = false;
                });

                container.appendChild(item_div);
            }
        });
    } catch (error) {
        console.error('Error loading icons:', error);
    }
}


renameBtn.addEventListener('click', async () => {
    if (!selectedIcon) return;

    const newName = prompt('Neuer Name:', selectedIcon.split('.').slice(0, -1).join('.'));
    if (!newName) return;

    const newFileName = `${newName}.${selectedIcon.split('.').pop()}`;
    const oldPath = `${ICONS_PATH}/${selectedIcon}`;
    const newPath = `${ICONS_PATH}/${newFileName}`;

    try {

        const response = await fetch(`${BASE_URL}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `path=${encodeURIComponent(newPath)}&src=${encodeURIComponent(oldPath)}`
        });

        if (response.ok) {
            showToast('Icon erfolgreich umbenannt', 'success');
            loadIconsFromESP();
        } else {
            const text = await response.text();
            showToast(`Fehler beim Umbenennen: ${text}`, 'error');
        }
    } catch (error) {
        showToast('Fehler beim Umbenennen. Bitte überprüfe die Verbindung zum Server.', 'error');
    }
});

// Löschen-Funktion
deleteBtn.addEventListener('click', async () => {
    if (!selectedIcon) return;

    if (!confirm(`Möchten Sie das Icon "${selectedIcon}" wirklich löschen?`)) return;

    try {
        const response = await fetch(`${BASE_URL}/edit`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `path=${encodeURIComponent(ICONS_PATH + '/' + selectedIcon)}`
        });

        if (response.ok) {
            loadIconsFromESP();
            selectedIcon = null;
            renameBtn.disabled = true;
            deleteBtn.disabled = true;
        } else {
            const text = await response.text();
            showToast(`Fehler beim Löschen: ${text}`, 'error');
        }
    } catch (error) {
        showToast('Fehler beim Löschen. Bitte überprüfe die Verbindung zum Server.', 'error');
    }
});


async function uploadIcon(file) {
    const formData = new FormData();
    formData.append('file', file, ICONS_PATH + '/' + file.name);

    try {
        const response = await fetch(`${BASE_URL}/edit`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            loadIconsFromESP();
        } else {
            const text = await response.text();
            showToast(`Fehler beim Upload: ${text}`, 'error');
        }
    } catch (error) {
        showToast('Fehler beim Upload. Bitte überprüfe die Verbindung zum Server.', 'error');
    }
}


document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
});

document.getElementById('icon-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/gif', 'image/jpeg'].includes(file.type)) {
        showToast('Nur GIF oder JPG Dateien sind erlaubt', 'error');
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const validDimensions =
        (img.width === 8 && img.height === 8) ||
        (img.width === 32 && img.height === 8);

    if (!validDimensions) {
        showToast('Bild muss 8x8 oder 32x8 Pixel groß sein', 'error');
        return;
    }


    uploadIcon(file);
});


function createLametricLink() {
    const iconId = document.getElementById("lametric-iconID").value;
    const preview = document.createElement("img");
    
    // Entferne den onerror Handler vom Image Element
    preview.src = "https://developer.lametric.com/content/apps/icon_thumbs/" + iconId;
    
    const container = document.getElementById("icon-container");
    container.innerHTML = "";
    container.appendChild(preview);

    // Error handling über fetch
    fetch(preview.src)
        .then(response => {
            if (!response.ok) throw new Error('Icon nicht gefunden');
        })
        .catch(() => {
            container.innerHTML = ""; // Leere Container bei Fehler
            showToast('Diese Icon ID existiert nicht', 'error');
        });
}

async function downloadLametricImage() {
    const iconId = document.getElementById("lametric-iconID").value;

    try {
        const response = await fetch("https://developer.lametric.com/content/apps/icon_thumbs/" + iconId);
        const blob = await response.blob();
        let extension = "";

        const contentType = response.headers.get("content-type");

        if (contentType === "image/jpeg" || contentType === "image/png") {
            extension = ".jpg";
            const img = new Image();
            const objectUrl = URL.createObjectURL(blob);

            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);

                canvas.toBlob((blob) => {
                    sendBlob(blob, iconId, extension);
                }, "image/jpeg", 1);

                URL.revokeObjectURL(objectUrl);
            };

            img.src = objectUrl;
        } else if (response.headers.get("content-type") === "image/gif") {
            extension = ".gif";
            sendBlob(blob, iconId, extension);
        }
    } catch (error) {
        console.log("Error");
        showToast('Diese Icon ID existiert nicht', 'error');
    }
}

function sendBlob(blob, iconId, extension) {
    const formData = new FormData();
    formData.append("upfile", blob, "ICONS/" + iconId + extension);

    fetch(`${BASE_URL}/edit`, {
        method: "POST",
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                showToast('Icon erfolgreich gespeichert', 'success');
                loadIconsFromESP();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => {
            console.log(error);
            showToast(`Fehler beim Speichern des Icons: ${error.message}`, 'error');
        });
}

document.getElementById('preview-lametric')?.addEventListener('click', createLametricLink);
document.getElementById('import-lametric')?.addEventListener('click', downloadLametricImage);

// Modal Funktionalität
const uploadModal = document.getElementById('upload-modal');
const lametricModal = document.getElementById('lametric-modal');

document.getElementById('show-lametric')?.addEventListener('click', () => {
    lametricModal.classList.add('active');
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        uploadModal.classList.remove('active');
        lametricModal.classList.remove('active');
    });
});

// Entferne den doppelten Event Listener
document.getElementById('preview-lametric')?.addEventListener('click', () => {
    // Nur Import-Button aktivieren, createLametricLink wird bereits durch den anderen Listener aufgerufen
    document.getElementById('import-lametric').disabled = false;
});

// Schließen bei Klick außerhalb
window.addEventListener('click', (e) => {
    if (e.target === uploadModal || e.target === lametricModal) {
        uploadModal.classList.remove('active');
        lametricModal.classList.remove('active');
    }
});

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

loadIconsFromESP();