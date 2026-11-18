/**
 * APPLICATION CORE — ikea I tech
 * Renders content from profile.js and drives interactions cleanly
 */

(function () {
  "use strict";

  const data = window.PROFILE_DATA;
  if (!data) return;

  const state = {
    lang: localStorage.getItem("iit_lang") || "ru",
    theme: localStorage.getItem("iit_theme") || "dark",
  };

  const $ = (id) => document.getElementById(id);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function applyTheme(theme) {
    state.theme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("iit_theme", state.theme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", state.theme === "light" ? "#f5f0ff" : "#06020d");
    }
  }

  function applyAvatarSources(img) {
    if (!img) return;
    const sources = [...data.brand.avatarSources];
    let sourceIndex = 0;

    img.onerror = () => {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        img.src = sources[sourceIndex];
      } else {
        img.onerror = null;
      }
    };
    img.src = sources[0];
  }

  function renderHeader(locale) {
    $("brand-handle").textContent = data.brand.handle;
    applyAvatarSources($("brand-avatar"));

    document.querySelectorAll("#nav-links a[data-nav]").forEach((link) => {
      const key = link.getAttribute("data-nav");
      if (locale.nav[key]) {
        link.textContent = locale.nav[key];
      }
    });

    $("lang-toggle").textContent = state.lang === "ru" ? "RU / EN" : "EN / RU";
  }

  function renderHero(locale) {
    const h = locale.hero;
    $("hero-status").textContent = h.status;
    $("hero-title").textContent = h.title;
    $("hero-subtitle").textContent = h.subtitle;
    $("hero-description").textContent = h.description;
    $("hero-primary-cta").textContent = h.primaryCta;
    $("hero-secondary-cta").textContent = h.secondaryCta;
    applyAvatarSources($("hero-avatar"));

    const factsList = $("hero-facts");
    factsList.replaceChildren();
    h.facts.forEach((fact) => {
      const row = el("div", "fact-row");
      const dt = el("dt", "", fact.label);
      const dd = el("dd");
      if (fact.isTelegram) {
        const link = el("a", "", fact.value);
        link.href = data.brand.telegramUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        dd.appendChild(link);
      } else {
        dd.textContent = fact.value;
      }
      row.append(dt, dd);
      factsList.appendChild(row);
    });
  }

  function renderAbout(locale) {
    const a = locale.about;
    $("about-heading").textContent = a.heading;
    $("about-lead").textContent = a.lead;

    const list = $("about-points");
    list.replaceChildren();
    a.points.forEach((point) => {
      const item = el("li", "editorial-item");
      item.append(el("h3", "", point.title), el("p", "", point.text));
      list.appendChild(item);
    });
  }

  function renderServices(locale) {
    const s = locale.services;
    $("services-heading").textContent = s.heading;
    $("services-lead").textContent = s.lead;

    const ledger = $("services-ledger");
    ledger.replaceChildren();
    s.items.forEach((item) => {
      const row = el("article", "service-row");

      const category = el("div", "service-category", item.category);
      const body = el("div", "service-body");
      body.append(el("h3", "", item.title), el("p", "", item.text));

      const action = el("a", "service-action", s.ctaLabel);
      action.href = data.brand.telegramUrl;
      action.target = "_blank";
      action.rel = "noopener noreferrer";

      row.append(category, body, action);
      ledger.appendChild(row);
    });
  }

  function renderContact(locale) {
    const c = locale.contact;
    $("contact-heading").textContent = c.heading;
    $("contact-text").textContent = c.text;
    $("open-tg-btn").textContent = c.openBtn;
    $("copy-tg-btn").textContent = c.copyBtn;
  }

  function renderFooter(locale) {
    $("footer-note").textContent = `${locale.footer.note}, ${new Date().getFullYear()}`;
    $("footer-top").textContent = locale.footer.topLink;
  }

  function bindSpotlights() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".glass-spotlight").forEach((panel) => {
      if (panel.dataset.spotlightBound) return;
      panel.dataset.spotlightBound = "1";
      panel.addEventListener(
        "pointermove",
        (e) => {
          const rect = panel.getBoundingClientRect();
          panel.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          panel.style.setProperty("--my", `${e.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });
  }

  function renderAll() {
    const locale = data.locales[state.lang] || data.locales.ru;
    document.documentElement.lang = state.lang;
    document.title = locale.metaTitle;

    renderHeader(locale);
    renderHero(locale);
    renderAbout(locale);
    renderServices(locale);
    renderContact(locale);
    renderFooter(locale);
    bindSpotlights();
  }

  let toastTimer = null;
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyTelegram() {
    const notice = data.locales[state.lang].contact.copiedToast;
    try {
      await navigator.clipboard.writeText(data.brand.telegram);
      showToast(notice);
    } catch {
      const input = document.createElement("input");
      input.value = data.brand.telegram;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast(notice);
    }
  }

  function setupEvents() {
    $("theme-toggle").addEventListener("click", () => {
      applyTheme(state.theme === "dark" ? "light" : "dark");
    });

    $("lang-toggle").addEventListener("click", () => {
      state.lang = state.lang === "ru" ? "en" : "ru";
      localStorage.setItem("iit_lang", state.lang);
      renderAll();
    });

    $("copy-tg-btn").addEventListener("click", copyTelegram);

    const menuBtn = $("menu-toggle");
    const navLinks = $("nav-links");
    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupActiveNav() {
    if (!("IntersectionObserver" in window)) return;
    const sections = document.querySelectorAll("main section[id]");
    const navMap = new Map(
      Array.from(document.querySelectorAll("#nav-links a[data-nav]")).map((a) => [
        a.getAttribute("data-nav"),
        a,
      ])
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navMap.get(entry.target.id);
          if (link && entry.isIntersecting) {
            navMap.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-38% 0px -48% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  applyTheme(state.theme);
  renderAll();
  setupEvents();
  setupActiveNav();
})();
