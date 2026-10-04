/* Stella Coiffure (Cindy) — interactions
   Vanilla JS, progressive enhancement, reduced-motion aware. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Page ready fade-in ---- */
  requestAnimationFrame(function () { document.body.classList.add("page-ready"); });

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    // Fermer avec Échap
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
    // Fermer si on repasse en largeur desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 640 && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal],[data-reveal-stagger]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-reveal-stagger")) {
          var kids = el.children, i = 0;
          for (; i < kids.length; i++) {
            kids[i].style.transitionDelay = (i * 70) + "ms";
          }
        }
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Lightbox ---- */
  var gallery = document.querySelector("[data-lightbox]");
  if (gallery) {
    var figures = Array.prototype.slice.call(gallery.querySelectorAll("figure"));
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Agrandissement de la réalisation");
    box.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Fermer">✕</button>' +
      '<button class="lb-btn lb-prev" aria-label="Précédent">‹</button>' +
      '<img alt="">' +
      '<button class="lb-btn lb-next" aria-label="Suivant">›</button>';
    document.body.appendChild(box);
    var lbImg = box.querySelector("img");
    var current = 0, lastFocus = null;

    function show(i) {
      current = (i + figures.length) % figures.length;
      var src = figures[current].getAttribute("data-full") || figures[current].querySelector("img").src;
      var alt = figures[current].querySelector("img").alt;
      lbImg.src = src; lbImg.alt = alt;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i); box.classList.add("open");
      document.body.style.overflow = "hidden";
      box.querySelector(".lb-close").focus();
    }
    function close() {
      box.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    figures.forEach(function (fig, i) {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---- Subtle page transition on internal navigation ---- */
  if (!reduce) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (a.hostname && a.hostname !== window.location.hostname) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(function () { window.location.href = href; }, 320);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) document.body.classList.remove("page-leaving");
    });
  }

  /* ---- Accordion (page prestations) ---- */
  var acc = document.querySelector("[data-accordion]");
  if (acc) {
    var items = Array.prototype.slice.call(acc.querySelectorAll(".acc-item"));
    items.forEach(function (item) {
      var btn = item.querySelector(".acc-head");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    var openFromHash = function () {
      if (!location.hash) return;
      var target;
      try { target = acc.querySelector(location.hash); } catch (e) { return; }
      if (target && target.classList.contains("acc-item")) {
        target.classList.add("open");
        var h = target.querySelector(".acc-head");
        if (h) h.setAttribute("aria-expanded", "true");
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  /* ---- Year in footer ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
