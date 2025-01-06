  // Initialisiere Feather Icons
  feather.replace();

  // Seiten Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
          // Aktive Klasse von allen Nav-Items entfernen
          document.querySelectorAll('.nav-item').forEach(nav => {
              nav.classList.remove('active');
          });
          
          // Aktive Klasse zum geklickten Item hinzufügen
          item.classList.add('active');
          
          // Alle Seiten ausblenden
          document.querySelectorAll('.page').forEach(page => {
              page.classList.remove('active');
          });
          
          // Gewählte Seite anzeigen
          const pageId = item.getAttribute('data-page');
          document.getElementById(pageId).classList.add('active');
      });
  });

  // Initial die erste Seite anzeigen
  document.querySelector('.nav-item').click();

  // Formular Submit Handler
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          console.log('Form data:', data);
          
          // Feedback Animation
          const btn = form.querySelector('.btn');
          const originalContent = btn.innerHTML;
          btn.innerHTML = '<i data-feather="check"></i> Gespeichert';
          feather.replace();
          btn.style.backgroundColor = '#059669';
          setTimeout(() => {
              btn.innerHTML = originalContent;
              feather.replace();
              btn.style.backgroundColor = '';
          }, 2000);
      });
  });