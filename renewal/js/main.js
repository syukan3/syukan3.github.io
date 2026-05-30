// Main JavaScript

// ---------------------------------------------------------------------------
// Site Chrome (shared header / footer, injected from a single source)
// Each page only needs <div id="site-header"></div> / <div id="site-footer"></div>
// and <body data-page="work"> to mark the active nav item.
// ---------------------------------------------------------------------------
const Site = {
  nav: [
    { key: 'work', label: 'Work', href: '/renewal/work/' },
    { key: 'projects', label: 'Projects', href: '/renewal/projects/' },
    { key: 'writing', label: 'Writing', href: '/renewal/writing/' },
    { key: 'photo', label: 'Photo', href: '/renewal/photo/' },
    { key: 'about', label: 'About', href: '/renewal/about/' },
    { key: 'contact', label: 'Contact', href: '/renewal/contact/' }
  ],

  social: [
    { label: 'GitHub', href: 'https://github.com/syukan3' },
    { label: 'Qiita', href: 'https://qiita.com/syukan3' }
  ],

  renderHeader(active) {
    const items = this.nav.map(item => {
      const isActive = item.key === active;
      return `<li><a href="${item.href}" class="nav-link${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a></li>`;
    }).join('');

    return `
      <header class="header">
        <div class="header-container">
          <a href="/renewal/" class="logo">
            <span class="logo-mark" aria-hidden="true"></span>
            <span class="logo-text">Sakae Shunsuke</span>
          </a>
          <button class="menu-toggle" aria-label="メニューを開く" aria-expanded="false">
            <span class="menu-icon" aria-hidden="true"></span>
          </button>
          <nav aria-label="メインナビゲーション">
            <ul class="nav-list">${items}</ul>
          </nav>
        </div>
      </header>
    `;
  },

  renderFooter() {
    const navLinks = this.nav
      .map(item => `<a href="${item.href}" class="footer-link">${item.label}</a>`)
      .join('');
    const socialLinks = this.social
      .map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer" class="footer-link">${s.label}</a>`)
      .join('');

    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-brand">
              <span class="logo-mark" aria-hidden="true"></span>
              <p class="footer-brand-name">Sakae Shunsuke</p>
              <p class="footer-brand-tag">Engineering value through deliberate design.</p>
            </div>
            <div class="footer-section">
              <h3 class="footer-title">Navigate</h3>
              <div class="footer-links">${navLinks}</div>
            </div>
            <div class="footer-section">
              <h3 class="footer-title">Connect</h3>
              <div class="footer-links">${socialLinks}</div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>Toy Camera Noir — Portfolio</p>
            <p>&copy; 2025 Sakae Shunsuke. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  },

  renderChrome() {
    const active = document.body?.dataset.page || '';
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    if (headerSlot) headerSlot.outerHTML = this.renderHeader(active);
    if (footerSlot) footerSlot.outerHTML = this.renderFooter();
  },

  initNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    if (!menuToggle || !navList) return;

    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', navList.classList.contains('active'));
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-container')) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('active')) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Shrink header on scroll for a more deliberate feel
    const header = document.querySelector('.header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
};

// Inject chrome as soon as main.js runs (scripts sit at end of <body>, DOM is ready)
Site.renderChrome();

// ---------------------------------------------------------------------------
// Data Loading Utilities
// ---------------------------------------------------------------------------
const DataLoader = {
  cache: {},

  async load(dataFile) {
    if (this.cache[dataFile]) return this.cache[dataFile];
    try {
      const response = await fetch(`/renewal/data/${dataFile}`);
      if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
      const data = await response.json();
      this.cache[dataFile] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${dataFile}:`, error);
      return null;
    }
  },

  async getWorks() {
    const data = await this.load('works.json');
    return data?.works || [];
  },

  async getProjects() {
    const data = await this.load('projects.json');
    return data?.projects || [];
  },

  async getWriting() {
    const data = await this.load('writing.json');
    return data?.writing || [];
  },

  async getProfile() {
    const data = await this.load('profile.json');
    return data?.profile || {};
  },

  async getPhotos() {
    const data = await this.load('photos.json');
    return data?.photos || [];
  }
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------
const Utils = {
  escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  },

  sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(https?:|mailto:|\/)/i.test(trimmed)) {
      return Utils.escapeHtml(trimmed);
    }
    return '';
  },

  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return Utils.escapeHtml(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ---------------------------------------------------------------------------
// Scroll Reveal Animation
// ---------------------------------------------------------------------------
const ScrollAnimation = {
  observer: null,
  initialized: false,
  reduced: false,

  // Reveal an element that is already within (or above) the viewport right now,
  // so above-the-fold content is never left hidden / dimmed on load.
  isInInitialView(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight);
  },

  prepare(el) {
    if (el.dataset.revealReady) return;
    el.dataset.revealReady = '1';
    if (this.reduced || this.isInInitialView(el)) {
      // Show immediately — no fade for content the user can already see
      el.classList.add('animate-on-scroll', 'is-visible');
      return;
    }
    el.classList.add('animate-on-scroll');
    if (this.observer) this.observer.observe(el);
  },

  ensureObserver() {
    if (this.initialized) return;
    this.initialized = true;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reduced) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    }
  },

  init() {
    this.ensureObserver();
    document.querySelectorAll('[data-reveal]').forEach(el => this.prepare(el));
  },

  // Re-scan after dynamic content (cards) is injected
  refresh() {
    this.ensureObserver();
    document.querySelectorAll('[data-reveal]:not([data-reveal-ready])').forEach(el => this.prepare(el));
  }
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  Site.initNav();
  setTimeout(() => ScrollAnimation.init(), 80);
});

// Expose to global scope
window.Site = Site;
window.DataLoader = DataLoader;
window.Utils = Utils;
window.ScrollAnimation = ScrollAnimation;
