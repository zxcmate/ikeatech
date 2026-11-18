/**
 * APPLICATION LOGIC — ikea I tech
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
  }

  function renderHeader(locale) {
    $("brand-handle").textContent = data.brand.handle;

    document.querySelectorAll("#nav-links a[data-nav]").forEach((link) => {
      const key = link.getAttribute("data-nav");
      if (locale.nav[key]) {
        link.textContent = locale.nav[key];
      }
    });

    const langBtn = $("lang-toggle");
    langBtn.innerHTML =
      state.lang === "ru"
        ? '<span class="mono">RU</span> / EN'
        : 'RU / <span class="mono">EN</span>';
  }

  function renderHero(locale) {
    const h = locale.hero;
    $("hero-badge").textContent = h.badge;
    $("hero-title").textContent = h.title;
    $("hero-subtitle").textContent = h.subtitle;
    $("hero-description").textContent = h.description;
    $("hero-primary-cta").textContent = h.primaryCta;
    $("hero-secondary-cta").textContent = h.secondaryCta;
    const avatarImg = $("hero-avatar");
    const sources = [...data.brand.avatarSources];
    let sourceIndex = 0;

    avatarImg.onerror = () => {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        avatarImg.src = sources[sourceIndex];
      } else {
        avatarImg.onerror = null;
      }
    };
    avatarImg.src = sources[0];

    const specList = $("hero-spec-list");
    specList.replaceChildren();
    h.cardFacts.forEach((row) => {
      const wrapper = el("div", "spec-row");
      const dt = el("dt", "", row.key);
      const dd = el("dd");
      if (row.value === data.brand.telegram) {
        const link = el("a", "", row.value);
        link.href = data.brand.telegramUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        dd.appendChild(link);
      } else {
        dd.textContent = row.value;
      }
      wrapper.append(dt, dd);
      specList.appendChild(wrapper);
    });
  }

  function renderAbout(locale) {
    const a = locale.about;
    $("about-eyebrow").textContent = a.eyebrow;
    $("about-heading").textContent = a.heading;

    const cardsContainer = $("about-cards");
    cardsContainer.replaceChildren();
    a.cards.forEach((card) => {
      const article = el("article", "card glass-card reveal is-visible");
      article.append(
        el("span", "card-tag", card.tag),
        el("h3", "", card.title),
        el("p", "", card.text)
      );
      cardsContainer.appendChild(article);
    });
  }

  function renderServices(locale) {
    const s = locale.services;
    $("services-eyebrow").textContent = s.eyebrow;
    $("services-heading").textContent = s.heading;

    const cardsContainer = $("services-cards");
    cardsContainer.replaceChildren();
    s.items.forEach((item) => {
      const article = el("article", "card service-card glass-card reveal is-visible");
      const top = el("div");
      top.append(
        el("span", "card-tag", item.tag),
        el("h3", "", item.title),
        el("p", "", item.text)
      );

      const link = el("a", "service-cta mono", `${s.actionLabel} →`);
      link.href = data.brand.telegramUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      article.append(top, link);
      cardsContainer.appendChild(article);
    });
  }

  function renderContact(locale) {
    const c = locale.contact;
    $("contact-eyebrow").textContent = c.eyebrow;
    $("contact-heading").textContent = c.heading;
    $("contact-text").textContent = c.text;
    $("open-tg-btn").textContent = c.openTgBtn;
    $("copy-tg-btn").textContent = c.copyTgBtn;
  }

  function renderFooter(locale) {
    $("footer-note").textContent = `${locale.footer.note} • ${new Date().getFullYear()}`;
    $("back-to-top").textContent = `↑ ${locale.footer.backToTop}`;
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
  }

  let toastTimer = null;
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(value) {
    const notice = data.locales[state.lang].contact.copiedNotice;
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${notice} ${value}`);
    } catch {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast(`${notice} ${value}`);
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

    $("copy-tg-btn").addEventListener("click", () => copyText(data.brand.telegram));

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

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  applyTheme(state.theme);
  renderAll();
  setupEvents();
  setupReveal();
})();
