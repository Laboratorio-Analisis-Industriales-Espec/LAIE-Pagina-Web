/* Interacciones del sitio (migración Astro del script original).
   Cambios vs. original: rutas limpias (/cursos en vez de cursos.html)
   y envío real de formularios con data-api hacia /api/*. */
(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function toggleMenu() {
    if (!menu || !toggle) return;
    var open = menu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", toggleMenu);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* Misma página: subir arriba con easing rápido en vez de recargar */
  var current = window.location.pathname.replace(/\/+$/, '') || '/';
  function fastScrollTop() {
    var start = window.scrollY, dur = 250, t0 = null;
    if (!start) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = Math.sin((p * Math.PI) / 2);
      window.scrollTo(0, start * (1 - e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('.nav-menu a, .brand').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '/') return;
    var target = href.replace(/\/+$/, '') || '/';
    if (target === current) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
        fastScrollTop();
      });
    }
  });
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Reveal */
  var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { obs.observe(el); });
  } else { els.forEach(function (el) { el.classList.add("visible"); }); }

  /* Formularios: validación + POST a data-api (o demo local si no hay backend) */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    function show(msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status " + (type || "");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var data = {};
      form.querySelectorAll("input, textarea, select").forEach(function (input) {
        input.classList.remove("invalid");
        var v = (input.value || "").trim();
        data[input.name || input.id] = v;
        if (input.hasAttribute("required") && !v) { input.classList.add("invalid"); ok = false; }
      });
      var email = form.querySelector('input[type="email"]');
      if (email && email.value.trim() && !emailRe.test(email.value.trim())) {
        email.classList.add("invalid"); ok = false;
      }
      if (!ok) { show("Revisa los campos marcados.", "err"); return; }
      var endpoint = form.getAttribute("data-api");
      var firstName = (data.nombre || "gracias").trim().split(" ")[0] || "gracias";
      if (!endpoint) {
        show("Gracias, " + firstName + ". Registro recibido (demo local, sin backend).", "ok");
        form.reset();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      show("Enviando…", "");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(function (res) { return res.json().catch(function () { return { ok: false }; }); })
        .then(function (out) {
          if (out && out.ok) { show(out.message || ("Gracias, " + firstName + "."), "ok"); form.reset(); }
          else { show((out && out.error) || "No se pudo enviar. Intenta de nuevo.", "err"); }
        })
        .catch(function () { show("Error de red. Intenta de nuevo.", "err"); })
        .finally(function () { if (btn) { btn.disabled = false; } });
    });
    form.addEventListener("input", function () { if (status) { status.textContent = ""; status.className = "form-status"; } });
  });
})();
