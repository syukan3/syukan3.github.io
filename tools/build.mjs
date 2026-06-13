#!/usr/bin/env node
/**
 * 静的サイトジェネレータ
 *
 * data/*.json（日本語）と data/en/*.json（英語）を読み込み、
 *   1. 各ページ内の <!-- build:NAME --> ... <!-- /build:NAME --> マーカーへ静的HTMLを書き込む
 *   2. ケーススタディ詳細ページ /work/<slug>/ と /en/work/<slug>/ を生成する
 *   3. sitemap.xml と llms.txt を生成する
 *
 * 使い方:
 *   node tools/build.mjs          # 生成（変更があったファイルのみ書き込み）
 *   node tools/build.mjs --check  # 生成結果がコミット済みファイルと一致するか検査（CI用）
 *
 * コンテンツを更新するときは data/ 配下のJSONを編集し、このスクリプトを実行して
 * 生成されたHTMLごとコミットする。詳細は CONTENT_MANAGEMENT_GUIDE.md を参照。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://syukan3.github.io';
const CHECK = process.argv.includes('--check');
const TODAY = new Date().toISOString().slice(0, 10);

// ページが参照しているアセットのバージョン（キャッシュバスター）。
// CSS/JS を変更したらここも更新し、build を実行して全ページへ反映する。
const V = { css: '20260611', components: '20260613', mainjs: '20260618', hero: '20260614' };

// ---------------------------------------------------------------------------
// データ読み込み
// ---------------------------------------------------------------------------
const loadJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const DATA = {
  ja: {
    works: loadJson('data/works.json').works,
    projects: loadJson('data/projects.json').projects,
    writing: loadJson('data/writing.json').writing,
    profile: loadJson('data/profile.json')
  },
  en: {
    works: loadJson('data/en/works.json').works,
    projects: loadJson('data/en/projects.json').projects,
    writing: loadJson('data/en/writing.json').writing,
    profile: loadJson('data/en/profile.json')
  },
  photos: loadJson('data/photos.json').photos,
  favorite: loadJson('data/favorite.json')
};

// 言語別UI文字列（旧 js/components.js の STR を踏襲）
const STR = {
  ja: {
    talk: '登壇', article: '記事', role: '役割', privateCode: 'コード非公開',
    caseLabels: ['背景 / Background', '制約 / Constraints', '打ち手 / Approach', '実装 / Implementation', '成果 / Results', '学び / Learnings'],
    workBase: '/work/',
    skillGroups: ['言語', 'フレームワーク', 'インフラ / DB'],
    awsGroups: ['コアサービス', '統合サービス', 'AI/ML・処理サービス'],
    backToWork: '← Work 一覧へ',
    skip: 'メインコンテンツへスキップ',
    ctaTitle: '技術で、事業を前に。',
    ctaLead: 'この事例についてのご相談・お問い合わせはお気軽に。',
    ctaBtn: 'お問い合わせ',
    contactHref: '/contact/'
  },
  en: {
    talk: 'Talk', article: 'Article', role: 'Role', privateCode: 'Private codebase',
    caseLabels: ['Background', 'Constraints', 'Approach', 'Implementation', 'Results', 'Learnings'],
    workBase: '/en/work/',
    skillGroups: ['Languages', 'Frameworks', 'Infrastructure / DB'],
    awsGroups: ['Core', 'Integration', 'AI/ML & Analytics'],
    backToWork: '← All case studies',
    skip: 'Skip to main content',
    ctaTitle: 'Engineering that moves business forward.',
    ctaLead: 'Get in touch about this case study or anything else.',
    ctaBtn: 'Contact me',
    contactHref: '/en/contact/'
  }
};

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------
const esc = (t) => t == null ? '' : String(t)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const safeUrl = (u) => {
  if (!u) return '';
  const trimmed = String(u).trim();
  return /^(https?:|mailto:|\/)/i.test(trimmed) ? esc(trimmed) : '';
};

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function fmtDate(dateString, lang) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || '');
  if (!m) return esc(dateString);
  const [, y, mo, d] = m;
  return lang === 'en'
    ? `${EN_MONTHS[Number(mo) - 1]} ${Number(d)}, ${y}`
    : `${y}年${Number(mo)}月${Number(d)}日`;
}

function gitDate(relPath) {
  try {
    const dirty = execSync(`git status --porcelain -- "${relPath}"`, { cwd: ROOT }).toString().trim();
    if (dirty) return TODAY;
    const d = execSync(`git log -1 --format=%cs -- "${relPath}"`, { cwd: ROOT }).toString().trim();
    return d || TODAY;
  } catch {
    return TODAY;
  }
}

// ---------------------------------------------------------------------------
// コンポーネント描画（旧 js/components.js から移植した純関数群）
// ---------------------------------------------------------------------------
function workCard(work, lang) {
  const href = `${STR[lang].workBase}${encodeURIComponent(work.slug)}/`;
  const tags = (work.tags || []).slice(0, 4).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `
      <a href="${href}" class="card card-link" data-reveal>
        <div class="card-media">
          ${work.thumbnail
            ? `<img src="${safeUrl(work.thumbnail)}" alt="${esc(work.title)}" loading="lazy">`
            : `<span class="card-media-fallback">${esc(work.title)}</span>`}
          ${work.year ? `<span class="card-badge">${esc(work.year)}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(work.title)}</h3>
          <p class="card-description">${esc(work.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ''}
        </div>
      </a>`;
}

function projectCard(project, lang) {
  const links = [];
  if (project.links?.demo) links.push(`<a href="${safeUrl(project.links.demo)}" target="_blank" rel="noopener noreferrer" class="card-action">Demo ↗</a>`);
  if (project.links?.github) links.push(`<a href="${safeUrl(project.links.github)}" target="_blank" rel="noopener noreferrer" class="card-action">GitHub ↗</a>`);
  if (project.links?.article) links.push(`<a href="${safeUrl(project.links.article)}" target="_blank" rel="noopener noreferrer" class="card-action">Article ↗</a>`);
  if (project.code === 'private' && !project.links?.github) links.push(`<span class="card-action card-action-muted">${STR[lang].privateCode}</span>`);
  const tags = (project.tags || []).slice(0, 4).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `
      <article class="card" data-reveal>
        <div class="card-media">
          ${project.thumbnail
            ? `<img src="${safeUrl(project.thumbnail)}" alt="${esc(project.title)}" loading="lazy">`
            : `<span class="card-media-fallback">${esc(project.title)}</span>`}
          ${project.year ? `<span class="card-badge">${esc(project.year)}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(project.title)}</h3>
          <p class="card-description">${esc(project.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ''}
          ${project.role ? `<p class="card-meta">${STR[lang].role} / ${esc(project.role)}</p>` : ''}
          ${links.length ? `<div class="card-actions">${links.join('')}</div>` : ''}
        </div>
      </article>`;
}

function writingItem(item, lang) {
  const typeLabel = item.type === 'talk' ? STR[lang].talk : STR[lang].article;
  return `
      <a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer" class="writing-row card-link" data-reveal>
        <div class="writing-meta">
          <span class="tag tag-accent">${typeLabel}</span>
          ${item.date ? `<span class="writing-date">${fmtDate(item.date, lang)}</span>` : ''}
        </div>
        <div class="writing-body">
          <h3 class="writing-title">${esc(item.title)}</h3>
          <p class="writing-summary">${esc(item.summary)}</p>
        </div>
        <span class="writing-arrow" aria-hidden="true">↗</span>
      </a>`;
}

function timelineItem(item) {
  return `
      <div class="timeline-item" data-reveal>
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-year">${esc(item.year)}</div>
        <h4 class="timeline-title">${esc(item.title)}</h4>
        <p class="timeline-desc">${esc(item.description)}</p>
      </div>`;
}

function valueCard(item) {
  return `
      <div class="card card-plain" data-reveal>
        <div class="card-body">
          <h3 class="card-title card-title-sm">${esc(item.title || item.area)}</h3>
          <p class="card-description">${esc(item.description)}</p>
        </div>
      </div>`;
}

function photoItem(photo) {
  const captionLoc = photo.location ? `<span class="photo-loc">${esc(photo.location)}</span>` : '';
  const captionDate = photo.date ? `<span class="photo-date">${esc(photo.date)}</span>` : '';
  const captionTitle = photo.title ? `<span class="photo-title">${esc(photo.title)}</span>` : '';
  const hasCaption = Boolean(captionTitle || captionLoc || captionDate);
  const caption = hasCaption
    ? `<figcaption class="photo-caption">
          ${captionTitle}
          <span class="photo-sub">${captionLoc}${captionDate}</span>
        </figcaption>`
    : '';
  const media = photo.src && !photo.placeholder
    ? `<img src="${safeUrl(photo.src)}" alt="${esc(photo.alt || photo.title || '')}" loading="lazy">`
    : `<span class="photo-placeholder" aria-hidden="true"></span>`;
  return `
      <figure class="photo-frame${photo.placeholder ? ' is-placeholder' : ''}${hasCaption ? '' : ' photo-frame-no-caption'}" data-reveal>
        <div class="photo-media">${media}</div>
        ${caption}
      </figure>`;
}

// ---------------------------------------------------------------------------
// Favorite ページ（/favorite/ 日本語のみ）
// ---------------------------------------------------------------------------
// タイルグリッド型日本地図の都道府県座標 [grid-column, grid-row]（14列×13行）
const PREF_GRID = {
  '北海道': [14, 1],
  '青森': [13, 2],
  '秋田': [12, 3], '岩手': [13, 3],
  '山形': [12, 4], '宮城': [13, 4],
  '新潟': [11, 5], '福島': [12, 5],
  '石川': [9, 6], '富山': [10, 6], '長野': [11, 6], '群馬': [12, 6], '栃木': [13, 6],
  '福井': [9, 7], '岐阜': [10, 7], '山梨': [11, 7], '埼玉': [12, 7], '茨城': [13, 7],
  '島根': [5, 8], '鳥取': [6, 8], '京都': [8, 8], '滋賀': [9, 8], '愛知': [10, 8], '静岡': [11, 8], '東京': [12, 8], '千葉': [13, 8],
  '山口': [4, 9], '広島': [5, 9], '岡山': [6, 9], '兵庫': [7, 9], '大阪': [8, 9], '奈良': [9, 9], '三重': [10, 9], '神奈川': [12, 9],
  '長崎': [1, 10], '佐賀': [2, 10], '福岡': [3, 10], '大分': [4, 10], '愛媛': [5, 10], '香川': [6, 10], '徳島': [7, 10], '和歌山': [8, 10],
  '熊本': [3, 11], '宮崎': [4, 11], '高知': [6, 11],
  '鹿児島': [3, 12],
  '沖縄': [1, 13]
};

function japanMapBlock(japan) {
  const visited = new Set(japan.visited);
  for (const name of visited) {
    if (!PREF_GRID[name]) throw new Error(`data/favorite.json: 未知の都道府県 "${name}"`);
  }
  const tiles = Object.entries(PREF_GRID).map(([name, [col, row]]) => {
    const isVisited = visited.has(name);
    return `<li class="jp-tile${isVisited ? ' is-visited' : ''}" style="grid-column:${col};grid-row:${row};">${esc(name)}${isVisited ? '<span class="sr-only">（訪問済）</span>' : ''}</li>`;
  }).join('\n          ');
  return `
      <div class="jp-map-block" data-reveal>
        <div class="jp-map-stats">
          <span class="jp-map-count"><strong>${visited.size}</strong> / 47</span>
          <span class="jp-map-count-label">都道府県を制覇</span>
        </div>
        <p class="sr-only">旅した都道府県マップ。訪問済みの都道府県に「（訪問済）」を付けています。</p>
        <ul class="jp-map">
          ${tiles}
        </ul>
      </div>`;
}

function overseasStamps(list) {
  return `
      <div class="stamp-row" data-reveal>
        ${list.map(p => `<span class="stamp">${esc(p)}</span>`).join('\n        ')}
      </div>`;
}

function bookList(list) {
  return list.map(b => `
      <li class="book-row" data-reveal>
        <span class="book-title">${esc(b.title)}</span>
        ${b.author ? `<span class="book-author">${esc(b.author)}</span>` : ''}
        ${b.comment ? `<span class="book-comment">${esc(b.comment)}</span>` : ''}
      </li>`).join('');
}

function musicBlock(music) {
  // 曲に順位はないので番号は振らない
  const tracks = music.songs.map(s => `
          <li><span class="tr-title">♪ ${esc(s.title)}</span>${s.comment ? `<span class="tr-comment">${esc(s.comment)}</span>` : ''}</li>`).join('');
  return `
      <div class="mixtape" data-reveal>
        <div class="mixtape-head">
          <span class="mixtape-side">SIDE A</span>
          <span class="mixtape-artist">${esc(music.artist)}</span>
        </div>
        ${music.comment ? `<p class="mixtape-comment">${esc(music.comment)}</p>` : ''}
        <ol class="tracklist">${tracks}
        </ol>
      </div>`;
}

function skillsBlock(skills, lang) {
  const groups = [
    { label: STR[lang].skillGroups[0], items: skills?.languages },
    { label: STR[lang].skillGroups[1], items: skills?.frameworks },
    { label: STR[lang].skillGroups[2], items: skills?.infrastructure }
  ];
  return groups.filter(g => g.items?.length).map(g => `
          <h3>${esc(g.label)}</h3>
          <div class="skills-grid">
            ${g.items.map(s => `<span class="skill-badge">${esc(s.name)}<span class="skill-years">${esc(s.years || '')}</span></span>`).join('')}
          </div>`).join('');
}

function awsBlock(aws, lang) {
  if (!aws) return '';
  const cats = [
    { label: STR[lang].awsGroups[0], items: aws.core },
    { label: STR[lang].awsGroups[1], items: aws.integration },
    { label: STR[lang].awsGroups[2], items: aws.aiml }
  ];
  return cats.filter(c => c.items?.length).map(c => `
          <h3>${esc(c.label)}</h3>
          <div class="skills-grid">
            ${c.items.map(s => `<span class="skill-badge">${esc(s)}</span>`).join('')}
          </div>`).join('');
}

function certList(certifications) {
  return (certifications || []).map(c => {
    const name = typeof c === 'string' ? c : (c.name || '');
    const date = (c && typeof c === 'object' && c.date) ? c.date : '';
    return `<li>${esc(name)}${date ? `<span class="cert-date">${esc(date)}</span>` : ''}</li>`;
  }).join('\n          ');
}

function caseGrid(work, lang) {
  const L = STR[lang].caseLabels;
  const list = (arr) => `<ul>${(arr || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const block = (label, body) => `
          <div class="case-section">
            <h3 class="bracket-label">${label}</h3>
            <div class="case-section-content">${body}</div>
          </div>`;
  return `
        <div class="case-grid">
          ${block(L[0], `<p>${esc(work.background)}</p>`)}
          ${block(L[1], list(work.constraints))}
          ${block(L[2], `<p>${esc(work.approach)}</p>`)}
          ${block(L[3], `<p>${esc(work.implementation)}</p>`)}
          ${block(L[4], list(work.results))}
          ${block(L[5], `<p>${esc(work.learnings)}</p>`)}
        </div>`;
}

// ---------------------------------------------------------------------------
// JSON-LD（既存ページの Person / WebSite ブロックと同一内容）
// ---------------------------------------------------------------------------
const PERSON = {
  ja: {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: '栄 俊介',
    alternateName: ['Sakae Shunsuke', 'syukan3'],
    jobTitle: 'AIガバナンス・アーキテクト / システム部長',
    worksFor: { '@type': 'Organization', name: 'HiJoJo Partners株式会社' },
    url: `${SITE}/`,
    image: `${SITE}/images/profile.webp`,
    sameAs: ['https://github.com/syukan3', 'https://qiita.com/syukan3'],
    knowsAbout: ['生成AIガバナンス', 'FISC安全対策基準', 'J-SOX IT全般統制', '個人情報保護法', 'AWS', 'Ruby on Rails', 'Python', 'React', 'Next.js'],
    knowsLanguage: ['ja', 'en']
  },
  en: {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: 'Sakae Shunsuke',
    alternateName: ['栄 俊介', 'syukan3'],
    jobTitle: 'AI Governance Architect / Head of Systems',
    worksFor: { '@type': 'Organization', name: 'HiJoJo Partners, Inc.' },
    url: `${SITE}/en/`,
    image: `${SITE}/images/profile.webp`,
    sameAs: ['https://github.com/syukan3', 'https://qiita.com/syukan3'],
    knowsAbout: ['Generative AI governance', 'FISC security guidelines', 'J-SOX IT general controls', 'APPI (Act on the Protection of Personal Information)', 'AWS', 'Ruby on Rails', 'Python', 'React', 'Next.js'],
    knowsLanguage: ['ja', 'en']
  }
};

const WEBSITE = (lang) => ({
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: lang === 'en' ? 'Sakae Shunsuke — Portfolio' : '栄 俊介 | Sakae Shunsuke - Portfolio',
  inLanguage: lang,
  publisher: { '@id': `${SITE}/#person` }
});

// ---------------------------------------------------------------------------
// ケーススタディ詳細ページ
// ---------------------------------------------------------------------------
function workDetailPage(work, lang) {
  const L = STR[lang];
  const isEn = lang === 'en';
  const url = `${SITE}${L.workBase}${work.slug}/`;
  const jaUrl = `${SITE}/work/${work.slug}/`;
  const enUrl = `${SITE}/en/work/${work.slug}/`;
  // OGPはSVG非対応のため、SVGサムネイルのときは既定のOG画像へフォールバック
  const ogImage = work.thumbnail && !work.thumbnail.endsWith('.svg')
    ? `${SITE}${work.thumbnail}`
    : `${SITE}/images/og-image.png`;
  const pageTitle = isEn ? `${work.title} — Work | Sakae Shunsuke` : `${work.title} — Work | 栄 俊介`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      PERSON[lang],
      WEBSITE(lang),
      {
        '@type': 'Article',
        headline: work.title,
        description: work.summary,
        image: ogImage,
        author: { '@id': `${SITE}/#person` },
        publisher: { '@id': `${SITE}/#person` },
        inLanguage: lang,
        keywords: (work.tags || []).join(', '),
        mainEntityOfPage: url
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}${isEn ? '/en/' : '/'}` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}${L.workBase}` },
          { '@type': 'ListItem', position: 3, name: work.title, item: url }
        ]
      }
    ]
  };

  const tags = (work.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${esc(work.summary)}">

  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(work.summary)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
${isEn ? '  <meta property="og:locale" content="en_US">\n' : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(work.summary)}">
  <meta name="twitter:image" content="${ogImage}">

  <meta name="theme-color" content="#0b0a08">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="ja" href="${jaUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="x-default" href="${jaUrl}">
  <title>${esc(pageTitle)}</title>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- 構造化データ -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).replace(/<\/script/gi, '<\\/script')}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Shippori+Mincho:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/css/reset.css?v=${V.css}">
  <link rel="stylesheet" href="/css/variables.css?v=${V.css}">
  <link rel="stylesheet" href="/css/base.css?v=${V.css}">
  <link rel="stylesheet" href="/css/components.css?v=${V.components}">
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-QLXJBRYZZ8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-QLXJBRYZZ8');
  </script>
</head>
<body data-page="work">
  <a href="#main-content" class="skip-link">${L.skip}</a>
  <div id="site-header"></div>

  <div class="noir-frame">
    <main id="main-content">
      <section class="section">
        <div class="container container-lg">
          <div class="section-header" data-reveal>
            <span class="section-eyebrow">Case Study</span>
            <h1 class="section-title">${esc(work.title)}</h1>
          </div>

          <article class="case-study">
            <div class="case-media">
              ${work.thumbnail ? `<img src="${safeUrl(work.thumbnail)}" alt="${esc(work.title)}">` : ''}
              ${work.year ? `<span class="card-badge">${esc(work.year)}</span>` : ''}
            </div>
            <div class="case-head">
              <p class="case-summary">${esc(work.summary)}</p>
              ${tags ? `<div class="tag-list">${tags}</div>` : ''}
            </div>${caseGrid(work, lang)}
          </article>

          <p style="margin-top: var(--space-8);">
            <a href="${L.workBase}" class="view-all">${L.backToWork}</a>
          </p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-block" data-reveal>
            <span class="section-eyebrow">Let's Work Together</span>
            <h2 class="cta-title">${L.ctaTitle}</h2>
            <p class="cta-lead">${L.ctaLead}</p>
            <a href="${L.contactHref}" class="btn btn-primary">${L.ctaBtn}</a>
          </div>
        </div>
      </section>
    </main>
    <div id="site-footer"></div>
  </div>

  <script src="/js/main.js?v=${V.mainjs}"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// マーカー注入
// ---------------------------------------------------------------------------
function injectMarkers(html, replacements, file) {
  let out = html;
  for (const [name, content] of Object.entries(replacements)) {
    const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
    if (!re.test(out)) {
      throw new Error(`${file}: マーカー <!-- build:${name} --> が見つかりません`);
    }
    // 置換関数を使う: 文字列置換だとコンテンツ中の "$2" 等が特殊変数として解釈される
    out = out.replace(re, (_, open, close) => `${open}\n${content}\n      ${close}`);
  }
  return out;
}

const sortByDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');

function pageInjections(lang) {
  const d = DATA[lang];
  const prefix = lang === 'en' ? 'en/' : '';
  return [
    [`${prefix}index.html`, {
      'featured-works': d.works.filter(w => w.featured).slice(0, 3).map(w => workCard(w, lang)).join('\n'),
      'featured-projects': d.projects.filter(p => p.featured).slice(0, 3).map(p => projectCard(p, lang)).join('\n'),
      'pinned-writing': d.writing.filter(w => w.pinned).sort(sortByDateDesc).slice(0, 3).map(w => writingItem(w, lang)).join('\n')
    }],
    [`${prefix}work/index.html`, {
      'case-studies': d.works.map(w => workCard(w, lang)).join('\n')
    }],
    [`${prefix}projects/index.html`, {
      'featured-projects': d.projects.filter(p => p.featured).map(p => projectCard(p, lang)).join('\n'),
      'all-projects': d.projects.filter(p => !p.featured).map(p => projectCard(p, lang)).join('\n')
    }],
    [`${prefix}writing/index.html`, {
      'pinned-writing': d.writing.filter(w => w.pinned).sort(sortByDateDesc).map(w => writingItem(w, lang)).join('\n'),
      'recent-writing': d.writing.filter(w => !w.pinned).sort(sortByDateDesc).map(w => writingItem(w, lang)).join('\n')
    }],
    [`${prefix}photo/index.html`, {
      'photo-grid': DATA.photos.map(p => photoItem(p)).join('\n')
    }],
    [`${prefix}about/index.html`, {
      'bio': esc(d.profile.bio),
      'skills': skillsBlock(d.profile.skills, lang),
      'values': (d.profile.values || []).map(v => valueCard(v)).join('\n'),
      'expertise': (d.profile.expertise || []).map(v => valueCard(v)).join('\n'),
      'timeline': (d.profile.timeline || []).map(t => timelineItem(t)).join('\n'),
      'aws-services': awsBlock(d.profile.skills?.awsServices, lang),
      'certifications': certList(d.profile.certifications)
    }],
    // Favorite ページは言語共通（日本語のみ）
    ...(lang === 'ja' ? [
      ['favorite/index.html', {
        'fav-intro': esc(DATA.favorite.intro),
        'fav-books': bookList(DATA.favorite.books),
        'fav-manga': bookList(DATA.favorite.manga),
        'fav-movies': bookList(DATA.favorite.movies),
        'fav-anime': bookList(DATA.favorite.anime),
        'fav-dramas': bookList(DATA.favorite.dramas),
        'fav-music': musicBlock(DATA.favorite.music),
        'fav-foods': bookList(DATA.favorite.foods),
        'fav-hobbies': bookList(DATA.favorite.hobbies),
        'fav-japan': japanMapBlock(DATA.favorite.travel.japan),
        'fav-overseas': overseasStamps(DATA.favorite.travel.overseas),
        'fav-story': esc(DATA.favorite.story)
      }]
    ] : [])
  ];
}

// ---------------------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------------------
function buildSitemap(outputs) {
  // lastmod: このビルドで内容が変わるページは今日、それ以外はgitの最終コミット日
  const pageDate = (relPath) => {
    const abs = join(ROOT, relPath);
    const generated = outputs.get(abs);
    if (generated !== undefined) {
      const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
      if (current !== generated) return TODAY;
    }
    return gitDate(relPath);
  };

  const workPages = (prefix, pr) => DATA[prefix ? 'en' : 'ja'].works.map(w => ({
    loc: `/${prefix}work/${w.slug}/`, file: `${prefix}work/${w.slug}/index.html`, changefreq: 'monthly', priority: pr
  }));

  const pages = [
    { loc: '/', file: 'index.html', changefreq: 'weekly', priority: '1.0' },
    { loc: '/work/', file: 'work/index.html', changefreq: 'weekly', priority: '0.9' },
    ...workPages('', '0.8'),
    { loc: '/projects/', file: 'projects/index.html', changefreq: 'weekly', priority: '0.9' },
    { loc: '/writing/', file: 'writing/index.html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/photo/', file: 'photo/index.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/about/', file: 'about/index.html', changefreq: 'monthly', priority: '0.7' },
    { loc: '/favorite/', file: 'favorite/index.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/contact/', file: 'contact/index.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/game/', file: 'game/index.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/privacy/', file: 'privacy/index.html', changefreq: 'yearly', priority: '0.3' },
    { loc: '/en/', file: 'en/index.html', changefreq: 'weekly', priority: '0.9' },
    { loc: '/en/work/', file: 'en/work/index.html', changefreq: 'weekly', priority: '0.8' },
    ...workPages('en/', '0.7'),
    { loc: '/en/projects/', file: 'en/projects/index.html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/en/writing/', file: 'en/writing/index.html', changefreq: 'weekly', priority: '0.7' },
    { loc: '/en/photo/', file: 'en/photo/index.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/en/about/', file: 'en/about/index.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/en/contact/', file: 'en/contact/index.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/en/privacy/', file: 'en/privacy/index.html', changefreq: 'yearly', priority: '0.3' }
  ];

  const urls = pages.map(p => `  <url>
    <loc>${SITE}${p.loc}</loc>
    <lastmod>${pageDate(p.file)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ---------------------------------------------------------------------------
// llms.txt — LLMクローラ向けのサイト概要（https://llmstxt.org/ 形式）
// ---------------------------------------------------------------------------
function buildLlmsTxt() {
  const ja = DATA.ja;
  const en = DATA.en;
  const works = ja.works.map((w, i) =>
    `- [${w.title}](${SITE}/work/${w.slug}/): ${w.summary}（${w.year}） / EN: [${en.works[i]?.title || w.slug}](${SITE}/en/work/${w.slug}/)`
  ).join('\n');
  const projects = ja.projects.filter(p => p.featured).map(p =>
    `- ${p.title}: ${p.summary}`
  ).join('\n');
  const writing = ja.writing.filter(w => w.pinned).map(w =>
    `- [${w.title}](${w.url}): ${w.summary}`
  ).join('\n');

  return `# 栄 俊介 / Sakae Shunsuke — Portfolio

> ${ja.profile.profile.title}。${ja.profile.bio}

このサイトは日本語（${SITE}/）と英語（${SITE}/en/）で提供しています。
This site is available in Japanese (${SITE}/) and English (${SITE}/en/).

## ページ / Pages

- [Home](${SITE}/): 概要と主要な実績 / EN: ${SITE}/en/
- [Work](${SITE}/work/): ケーススタディ一覧 / EN: ${SITE}/en/work/
- [Projects](${SITE}/projects/): プロダクト・OSS・社内システム / EN: ${SITE}/en/projects/
- [Writing](${SITE}/writing/): 技術記事・登壇（Qiita 累計143万PV・270記事超） / EN: ${SITE}/en/writing/
- [About](${SITE}/about/): 経歴・スキル・資格 / EN: ${SITE}/en/about/
- [Favorite](${SITE}/favorite/): 好きな本・漫画・音楽、旅の記録、これまでの道のり（日本語のみ / Japanese only）
- [Contact](${SITE}/contact/): お問い合わせ / EN: ${SITE}/en/contact/
- [Privacy Policy](${SITE}/privacy/): プライバシーポリシー / EN: ${SITE}/en/privacy/

## ケーススタディ / Case Studies

${works}

## 主要プロジェクト / Featured Projects

${projects}

## 主要記事・登壇 / Selected Writing & Talks

${writing}

## リンク / Links

- GitHub: https://github.com/syukan3
- Qiita: https://qiita.com/syukan3
`;
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------
const outputs = new Map(); // 絶対パス → 生成内容

// 1. マーカー注入ページ
for (const lang of ['ja', 'en']) {
  for (const [file, replacements] of pageInjections(lang)) {
    const abs = join(ROOT, file);
    const html = readFileSync(abs, 'utf8');
    outputs.set(abs, injectMarkers(html, replacements, file));
  }
}

// 2. ケーススタディ詳細ページ
for (const lang of ['ja', 'en']) {
  for (const work of DATA[lang].works) {
    const file = `${lang === 'en' ? 'en/' : ''}work/${work.slug}/index.html`;
    outputs.set(join(ROOT, file), workDetailPage(work, lang));
  }
}

// 3. sitemap.xml と llms.txt（sitemapはページ出力が確定してから）
outputs.set(join(ROOT, 'llms.txt'), buildLlmsTxt());
outputs.set(join(ROOT, 'sitemap.xml'), buildSitemap(outputs));

// 4. 書き込み or 差分検査
// sitemap.xml の lastmod は実行日に依存するため、差分検査では日付を無視して比較する
const normalize = (abs, content) =>
  abs.endsWith('sitemap.xml') ? content.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod/>') : content;

const stale = [];
let written = 0;
for (const [abs, content] of outputs) {
  const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  if (current !== null && normalize(abs, current) === normalize(abs, content)) continue;
  if (CHECK) {
    stale.push(relative(ROOT, abs));
  } else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    console.log(`write: ${relative(ROOT, abs)}`);
    written++;
  }
}

if (CHECK) {
  if (stale.length) {
    console.error('生成ファイルがJSONデータと同期していません。`node tools/build.mjs` を実行してコミットしてください:');
    for (const f of stale) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`OK: ${outputs.size} ファイルすべて同期済み`);
} else {
  console.log(written ? `${written} ファイルを更新しました` : '変更はありません（すべて最新）');
}
