

  function j() {
    fetch("/api/screen").then(function(a) {
      return a.json()
    }).then(function(a) {
      d.clearRect(0, 0, c.width, c.height);
      d.fillStyle = "#000";
      for (let b = 0; b < 8; b++)
        for (let i = 0; i < 32; i++) {
          const k = a[b * 32 + i],
            l = (k & 0xff0000) >> 16,
            m = (k & 0x00ff00) >> 8,
            n = k & 0x0000ff;
          d.fillStyle = `rgb(${l},${m},${n})`;
          d.fillRect(i * 33, b * 33, 29, 29)
        }
      if (f) {
        const o = performance.now(),
          p = Math.round((o - g));
        g = o;
        const q = d.getImageData(0, 0, w, h).data,
          r = "rgb444",
          s = quantize(q, 256, {
            format: r
          }),
          t = applyPalette(q, s, r);
        e.writeFrame(t, w, h, {
          palette: s,
          delay: p
        })
      }
      j()
    })
  }



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

 j();
 document.getElementById("h").addEventListener("click", function() {
   const a = document.createElement("a");
   a.href = c.toDataURL();
   a.download = 'awtrix.png';
   a.click()
 });
 document.getElementById("i").addEventListener("click", function() {
   const a = new XMLHttpRequest();
   a.open("POST", "/api/nextapp", !0);
   a.send()
 });
 document.getElementById("j").addEventListener("click", function() {
   const a = new XMLHttpRequest();
   a.open("POST", "/api/previousapp", !0);
   a.send()
 });
 document.getElementById("k").addEventListener("click", async function() {
   const a = this;
   if (f) {
     e.finish();
     const b = e.bytesView();
     l(b, 'awtrix.gif', 'image/gif');
     f = !1;
     a.textContent = "Start GIF recording"
   } else {
     e = GIFEncoder();
     g = performance.now();
     f = !0;
     a.textContent = "Stop GIF recording"
   }
 })



function l(b, a, c) {
    const d = b instanceof Blob ? b : new Blob([b], {
        type: c
      }),
      e = URL.createObjectURL(d),
      f = document.createElement("a");
    f.href = e;
    f.download = a;
    f.click()
  }