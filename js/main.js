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
    { key: 'favorite', label: 'Favorite', href: '/favorite/' },
    { key: 'game', label: 'Game', href: '/game/' },
    { key: 'about', label: 'About', href: '/about/' },
    { key: 'contact', label: 'Contact', href: '/contact/' }
  ],

  // 言語共通（日本語のみ）のセクション。/en/ 配下のページが存在しない
  langCommon: ['/game/', '/favorite/'],

  localizeHref(href) {
    if (this.langCommon.some(p => href.startsWith(p))) return href;
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
    // 言語共通ページには英語版が存在しないため、言語切替は表示しない
    const showSwitch = !this.langCommon.some(p => window.location.pathname.startsWith(p));

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
            ${showSwitch ? `<a href="${this.altLangHref()}" class="lang-switch" lang="${IS_EN ? 'ja' : 'en'}" title="${switchTitle}">${switchLabel}</a>` : ''}
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
            <p class="footer-copyright">&copy; ${new Date().getFullYear()} Sakae Shunsuke. All rights reserved.</p>
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

// ---------------------------------------------------------------------------
// Easter egg — 障害発生モード (Incident Mode)
// 起動: コナミコマンド（↑↑↓↓←→←→BA）/ フッターの©を5連打（モバイル用）
// 鎮火は /game/chinka/ で。閉じると「自然復旧」する。
// ---------------------------------------------------------------------------
const Incident = {
  active: false,
  KONAMI: ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'],
  buffer: [],
  clicks: 0,
  clickTimer: null,

  init() {
    document.addEventListener('keydown', (e) => {
      if (this.active) {
        if (e.key === 'Escape') this.resolve();
        return;
      }
      this.buffer.push(e.key.toLowerCase());
      if (this.buffer.length > this.KONAMI.length) this.buffer.shift();
      if (this.buffer.length === this.KONAMI.length && this.KONAMI.every((k, i) => this.buffer[i] === k)) {
        this.buffer = [];
        this.trigger();
      }
    });
    document.addEventListener('click', (e) => {
      if (this.active || !e.target.closest('.footer-copyright')) return;
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => { this.clicks = 0; }, 1500);
      if (++this.clicks >= 5) {
        this.clicks = 0;
        this.trigger();
      }
    });
  },

  injectStyle() {
    if (document.getElementById('incident-style')) return;
    const style = document.createElement('style');
    style.id = 'incident-style';
    style.textContent = `
      @keyframes incident-flash { 0%, 100% { opacity: .25; } 50% { opacity: .65; } }
      @keyframes incident-shake {
        0%, 100% { transform: translate(0, 0); }
        20% { transform: translate(-3px, 1px); } 40% { transform: translate(3px, -1px); }
        60% { transform: translate(-2px, -1px); } 80% { transform: translate(2px, 1px); }
      }
      @keyframes incident-pop { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .incident-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; background: rgba(10, 6, 4, .82);
        backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
        animation: incident-shake .35s linear 2;
      }
      .incident-overlay::before {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        box-shadow: inset 0 0 140px rgba(220, 60, 40, .8);
        animation: incident-flash 1.1s ease-in-out infinite;
      }
      .incident-overlay::after {
        content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .35;
        background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(0, 0, 0, .35) 2px 4px);
      }
      .incident-panel {
        position: relative; max-width: 460px; width: 100%;
        border: 1px solid rgba(224, 106, 74, .7); background: #140b08;
        padding: 28px 28px 24px; text-align: left;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #f3ecdc; animation: incident-pop .25s ease-out;
        box-shadow: 0 0 60px rgba(220, 60, 40, .35);
      }
      .incident-sev {
        font-size: 11px; letter-spacing: .35em; color: #ff6a4a; margin-bottom: 14px;
      }
      .incident-title {
        font-size: 18px; font-weight: 700; letter-spacing: .08em;
        margin-bottom: 16px; line-height: 1.5;
      }
      .incident-metrics {
        font-size: 11px; line-height: 2; letter-spacing: .08em;
        color: #d8cdb6; border-top: 1px dashed #3a2a22; border-bottom: 1px dashed #3a2a22;
        padding: 10px 0; margin-bottom: 20px; white-space: pre-line;
      }
      .incident-actions { display: flex; flex-wrap: wrap; gap: 12px; }
      .incident-actions a, .incident-actions button {
        font-family: inherit; font-size: 11px; letter-spacing: .15em;
        padding: 10px 16px; cursor: pointer; text-decoration: none;
      }
      .incident-actions a {
        background: #e06a4a; color: #140b08; border: 1px solid #e06a4a; font-weight: 700;
      }
      .incident-actions button {
        background: transparent; color: #b8b8b8; border: 1px solid #3a3a3a;
      }
      .incident-actions a:hover { background: #f6cf86; border-color: #f6cf86; }
      .incident-actions button:hover { color: #f3ecdc; border-color: #b8b8b8; }
      .incident-resolved {
        position: fixed; left: 50%; bottom: 36px; transform: translateX(-50%);
        z-index: 9999; padding: 12px 20px;
        background: #0c1410; border: 1px solid #3a6a4a; color: #8fd6a0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px; letter-spacing: .12em;
        animation: incident-pop .25s ease-out;
      }
    `;
    document.head.appendChild(style);
  },

  trigger() {
    if (this.active) return;
    this.active = true;
    this.injectStyle();
    const en = IS_EN;
    const overlay = document.createElement('div');
    overlay.className = 'incident-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-label', en ? 'Incident alert' : '障害アラート');
    overlay.innerHTML = `
      <div class="incident-panel">
        <div class="incident-sev">SEV-1 INCIDENT DETECTED</div>
        <div class="incident-title">${en ? 'A critical incident has occurred<br>in production.' : '本番環境で重大な障害が<br>発生しました。'}</div>
        <div class="incident-metrics">ERROR RATE ......... 99.97%
LATENCY ............ ∞ ms
${en ? 'IMPACT ............. this entire site' : '影響範囲 ........... このサイト全体'}
${en ? 'ROOT CAUSE ......... you (Konami code)' : '原因 ............... あなた（コナミコマンド）'}</div>
        <div class="incident-actions">
          <a href="/game/chinka/">${en ? 'RESPOND ▸ 鎮火' : '鎮火に向かう ▸'}</a>
          <button type="button" data-incident-close>${en ? 'PRETEND I SAW NOTHING [ESC]' : '見なかったことにする [ESC]'}</button>
        </div>
      </div>
    `;
    overlay.querySelector('[data-incident-close]').addEventListener('click', () => this.resolve());
    document.body.appendChild(overlay);
    this.overlay = overlay;
  },

  resolve() {
    if (!this.active) return;
    this.active = false;
    this.overlay?.remove();
    this.overlay = null;
    const toast = document.createElement('div');
    toast.className = 'incident-resolved';
    toast.textContent = IS_EN
      ? 'INCIDENT RESOLVED — recovered on its own. Root cause: unknown.'
      : 'INCIDENT RESOLVED — 自然復旧しました。原因は不明です。';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

Incident.init();

// Expose to global scope
window.Site = Site;
