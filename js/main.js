// Main JavaScript

// ---------------------------------------------------------------------------
// Locale — English pages live under /en/ and declare <html lang="en">.
// The chrome (nav, footer, labels) keys off this flag.
// ---------------------------------------------------------------------------
const IS_EN = document.documentElement.lang === 'en';

// ---------------------------------------------------------------------------
// Site Chrome (shared header / footer, injected from a single source)
// Each page only needs <div id="site-header"></div> / <div id="site-footer"></div>
// and <body data-page="work"> to mark the active nav item.
// ---------------------------------------------------------------------------
const Site = {
  lang: IS_EN ? 'en' : 'ja',

  nav: [
    { key: 'work', label: 'Work', href: '/work/' },
    { key: 'projects', label: 'Projects', href: '/projects/' },
    { key: 'writing', label: 'Writing', href: '/writing/' },
    { key: 'photo', label: 'Photo', href: '/photo/' },
    { key: 'game', label: 'Game', href: '/game/' },
    { key: 'about', label: 'About', href: '/about/' },
    { key: 'contact', label: 'Contact', href: '/contact/' }
  ],

  localizeHref(href) {
    if (href.startsWith('/game/')) return href; // 遊び場は言語共通（日本語のみ）
    return IS_EN ? `/en${href}` : href;
  },

  // Path of the current page in the other language (/work/ ⇄ /en/work/)
  altLangHref() {
    const path = window.location.pathname;
    if (IS_EN) {
      const stripped = path.replace(/^\/en\/?/, '/');
      return stripped || '/';
    }
    return path === '/' ? '/en/' : `/en${path}`;
  },

  social: [
    { label: 'GitHub', href: 'https://github.com/syukan3' },
    { label: 'Qiita', href: 'https://qiita.com/syukan3' }
  ],

  renderHeader(active) {
    const items = this.nav.map(item => {
      const isActive = item.key === active;
      return `<li><a href="${this.localizeHref(item.href)}" class="nav-link${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a></li>`;
    }).join('');

    const switchLabel = IS_EN ? '日本語' : 'EN';
    const switchTitle = IS_EN ? 'このページを日本語で読む' : 'Read this page in English';

    return `
      <header class="header">
        <div class="header-container">
          <a href="${IS_EN ? '/en/' : '/'}" class="logo">
            <span class="logo-mark" aria-hidden="true"></span>
            <span class="logo-text">Sakae Shunsuke</span>
          </a>
          <nav aria-label="${IS_EN ? 'Main navigation' : 'メインナビゲーション'}">
            <ul class="nav-list">${items}</ul>
          </nav>
          <div class="header-tools">
            <a href="${this.altLangHref()}" class="lang-switch" lang="${IS_EN ? 'ja' : 'en'}" title="${switchTitle}">${switchLabel}</a>
            <button class="menu-toggle" aria-label="${IS_EN ? 'Open menu' : 'メニューを開く'}" aria-expanded="false">
              <span class="menu-icon" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>
    `;
  },

  renderFooter() {
    const navLinks = this.nav
      .map(item => `<a href="${this.localizeHref(item.href)}" class="footer-link">${item.label}</a>`)
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
            <p>${IS_EN ? 'Engineering that moves business forward.' : '技術で、事業を前に。'}</p>
            <p>
              <a href="${IS_EN ? '/en/privacy/' : '/privacy/'}" class="footer-link">${IS_EN ? 'Privacy Policy' : 'プライバシーポリシー'}</a>
            </p>
            <p>&copy; ${new Date().getFullYear()} Sakae Shunsuke. All rights reserved.</p>
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

    // Shrink header on scroll. The page scrolls inside .noir-frame, not the
    // root (see base.css) — listen on the frame, fall back to window.
    const header = document.querySelector('.header');
    if (header) {
      const frame = document.querySelector('.noir-frame');
      const target = frame || window;
      const getY = () => (frame ? frame.scrollTop : window.scrollY);
      const onScroll = () => header.classList.toggle('is-scrolled', getY() > 8);
      target.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
};

// Inject chrome as soon as main.js runs (scripts sit at end of <body>, DOM is ready)
Site.renderChrome();

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
// コンテンツは tools/build.mjs がビルド時に静的HTMLとして書き込むため、
// クライアント側でのデータ読み込み・描画は行わない。
document.addEventListener('DOMContentLoaded', () => {
  Site.initNav();
});

// Expose to global scope
window.Site = Site;
