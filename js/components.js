// Component Rendering Functions
// Pure functions (no `this`) so they can be passed directly to Array.map.

const e = (t) => Utils.escapeHtml(t);
const safeUrl = (u) => Utils.sanitizeUrl(u);

// UI strings rendered by components, per language. Japanese case-study labels
// keep their bilingual "背景 / Background" form; English pages drop the kanji.
const STR = document.documentElement.lang === 'en'
  ? {
      talk: 'Talk', article: 'Article', role: 'Role', privateCode: 'Private codebase',
      empty: 'Nothing here yet.',
      caseLabels: ['Background', 'Constraints', 'Approach', 'Implementation', 'Results', 'Learnings'],
      workBase: '/en/work/'
    }
  : {
      talk: '登壇', article: '記事', role: '役割', privateCode: 'コード非公開',
      empty: 'コンテンツがありません',
      caseLabels: ['背景 / Background', '制約 / Constraints', '打ち手 / Approach', '実装 / Implementation', '成果 / Results', '学び / Learnings'],
      workBase: '/work/'
    };

const Components = {
  // ---- Work / Case study card (used on Home + Work) --------------------
  createWorkCard(work) {
    const href = `${STR.workBase}#${encodeURIComponent(work.slug || '')}`;
    const tags = (work.tags || []).slice(0, 4)
      .map(t => `<span class="tag">${e(t)}</span>`).join('');
    return `
      <a href="${href}" class="card card-link" data-reveal>
        <div class="card-media">
          ${work.thumbnail
            ? `<img src="${safeUrl(work.thumbnail)}" alt="${e(work.title)}" loading="lazy">`
            : `<span class="card-media-fallback">${e(work.title)}</span>`}
          ${work.year ? `<span class="card-badge">${e(work.year)}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${e(work.title)}</h3>
          <p class="card-description">${e(work.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ''}
        </div>
      </a>
    `;
  },

  // ---- Project card ----------------------------------------------------
  createProjectCard(project) {
    const links = [];
    if (project.links?.demo) links.push(`<a href="${safeUrl(project.links.demo)}" target="_blank" rel="noopener noreferrer" class="card-action">Demo ↗</a>`);
    if (project.links?.github) links.push(`<a href="${safeUrl(project.links.github)}" target="_blank" rel="noopener noreferrer" class="card-action">GitHub ↗</a>`);
    if (project.links?.article) links.push(`<a href="${safeUrl(project.links.article)}" target="_blank" rel="noopener noreferrer" class="card-action">Article ↗</a>`);
    if (project.code === 'private' && !project.links?.github) links.push(`<span class="card-action card-action-muted">${STR.privateCode}</span>`);
    const tags = (project.tags || []).slice(0, 4)
      .map(t => `<span class="tag">${e(t)}</span>`).join('');

    return `
      <article class="card" data-reveal>
        <div class="card-media">
          ${project.thumbnail
            ? `<img src="${safeUrl(project.thumbnail)}" alt="${e(project.title)}" loading="lazy">`
            : `<span class="card-media-fallback">${e(project.title)}</span>`}
          ${project.year ? `<span class="card-badge">${e(project.year)}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${e(project.title)}</h3>
          <p class="card-description">${e(project.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ''}
          ${project.role ? `<p class="card-meta">${STR.role} / ${e(project.role)}</p>` : ''}
          ${links.length ? `<div class="card-actions">${links.join('')}</div>` : ''}
        </div>
      </article>
    `;
  },

  // ---- Writing / Talk item --------------------------------------------
  createWritingItem(item) {
    const typeLabel = item.type === 'talk' ? STR.talk : STR.article;
    return `
      <a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer" class="writing-row card-link" data-reveal>
        <div class="writing-meta">
          <span class="tag tag-accent">${typeLabel}</span>
          ${item.date ? `<span class="writing-date">${Utils.formatDate(item.date)}</span>` : ''}
        </div>
        <div class="writing-body">
          <h3 class="writing-title">${e(item.title)}</h3>
          <p class="writing-summary">${e(item.summary)}</p>
        </div>
        <span class="writing-arrow" aria-hidden="true">↗</span>
      </a>
    `;
  },

  // ---- Timeline item (About) ------------------------------------------
  createTimelineItem(item) {
    return `
      <div class="timeline-item" data-reveal>
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-year">${e(item.year)}</div>
        <h4 class="timeline-title">${e(item.title)}</h4>
        <p class="timeline-desc">${e(item.description)}</p>
      </div>
    `;
  },

  // ---- Value / Expertise card (About) ---------------------------------
  createValueCard(item) {
    return `
      <div class="card card-plain" data-reveal>
        <div class="card-body">
          <h3 class="card-title card-title-sm">${e(item.title || item.area)}</h3>
          <p class="card-description">${e(item.description)}</p>
        </div>
      </div>
    `;
  },

  // ---- Full case study (Work page) ------------------------------------
  createCaseStudy(work) {
    const tags = (work.tags || []).map(t => `<span class="tag">${e(t)}</span>`).join('');
    const list = (arr) => `<ul>${(arr || []).map(x => `<li>${e(x)}</li>`).join('')}</ul>`;
    const block = (label, body) => `
      <div class="case-section">
        <h3 class="bracket-label">${label}</h3>
        <div class="case-section-content">${body}</div>
      </div>`;

    return `
      <article class="case-study" id="${e(work.slug)}" data-reveal>
        <div class="case-media">
          ${work.thumbnail ? `<img src="${safeUrl(work.thumbnail)}" alt="${e(work.title)}" loading="lazy">` : ''}
          ${work.year ? `<span class="card-badge">${e(work.year)}</span>` : ''}
        </div>
        <div class="case-head">
          <h2 class="case-title">${e(work.title)}</h2>
          <p class="case-summary">${e(work.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ''}
        </div>
        <div class="case-grid">
          ${block(STR.caseLabels[0], `<p>${e(work.background)}</p>`)}
          ${block(STR.caseLabels[1], list(work.constraints))}
          ${block(STR.caseLabels[2], `<p>${e(work.approach)}</p>`)}
          ${block(STR.caseLabels[3], `<p>${e(work.implementation)}</p>`)}
          ${block(STR.caseLabels[4], list(work.results))}
          ${block(STR.caseLabels[5], `<p>${e(work.learnings)}</p>`)}
        </div>
      </article>
    `;
  },

  // ---- Photo film frame (Photo page) ----------------------------------
  createPhotoItem(photo) {
    const captionLoc = photo.location ? `<span class="photo-loc">${e(photo.location)}</span>` : '';
    const captionDate = photo.date ? `<span class="photo-date">${e(photo.date)}</span>` : '';
    const captionTitle = photo.title ? `<span class="photo-title">${e(photo.title)}</span>` : '';
    const hasCaption = Boolean(captionTitle || captionLoc || captionDate);
    const caption = hasCaption
      ? `<figcaption class="photo-caption">
          ${captionTitle}
          <span class="photo-sub">${captionLoc}${captionDate}</span>
        </figcaption>`
      : '';
    const media = photo.src && !photo.placeholder
      ? `<img src="${safeUrl(photo.src)}" alt="${e(photo.alt || photo.title || '')}" loading="lazy">`
      : `<span class="photo-placeholder" aria-hidden="true"></span>`;
    return `
      <figure class="photo-frame${photo.placeholder ? ' is-placeholder' : ''}${hasCaption ? '' : ' photo-frame-no-caption'}" data-reveal>
        <div class="photo-media">${media}</div>
        ${caption}
      </figure>
    `;
  },

  // ---- Helpers ---------------------------------------------------------
  renderItems(containerId, items, createItemFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML = `<p class="text-muted">${STR.empty}</p>`;
      return;
    }
    container.innerHTML = items.map(item => createItemFn(item)).join('');
    if (window.ScrollAnimation) ScrollAnimation.refresh();
  },

  showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const one = `
      <div class="card">
        <div class="card-media skeleton"></div>
        <div class="card-body">
          <div class="skeleton skeleton-line" style="width:70%;height:22px;"></div>
          <div class="skeleton skeleton-line" style="width:100%;"></div>
          <div class="skeleton skeleton-line" style="width:85%;"></div>
        </div>
      </div>`;
    container.innerHTML = Array(count).fill(one).join('');
  }
};

window.Components = Components;
