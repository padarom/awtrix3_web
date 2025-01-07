document.addEventListener('DOMContentLoaded', () => {

        // Menü-Button Toggle
        const menuToggle = document.getElementById("menu-toggle");
        const sidebar = document.querySelector(".sidebar");
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);
    
        // Sidebar ein- und ausblenden
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            overlay.classList.toggle('active');
        });
    
        // Klick auf das Overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.add('hidden');
            overlay.classList.remove('active');
        });
    

    // Seiten-Navigation
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            nav.classList.add('active');

            const pageId = nav.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
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
 // feather.replace();

});