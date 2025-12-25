// Component Rendering Functions

const Components = {
  // Create Work Card
  createWorkCard(work) {
    return `
      <article class="card light-leak">
        ${work.thumbnail ? `<img src="${work.thumbnail}" alt="${work.title}" class="card-image" loading="lazy">` : ''}
        <h3 class="card-title">${work.title}</h3>
        <p class="card-description">${work.summary}</p>
        ${work.tags && work.tags.length > 0 ? `
          <div class="tag-list">
            ${work.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <a href="/renewal/work/#${work.slug}" class="btn btn-ghost" style="margin-top: var(--space-4);">
          詳しく見る →
        </a>
      </article>
    `;
  },

  // Create Project Card
  createProjectCard(project) {
    const links = [];
    if (project.links.github) links.push(`<a href="${project.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>`);
    if (project.links.demo) links.push(`<a href="${project.links.demo}" target="_blank" rel="noopener noreferrer">Demo</a>`);
    if (project.links.article) links.push(`<a href="${project.links.article}" target="_blank" rel="noopener noreferrer">Article</a>`);

    return `
      <article class="card">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-description">${project.summary}</p>
        ${project.role ? `<p class="text-muted" style="font-size: var(--text-sm); margin-bottom: var(--space-3);">役割: ${project.role}</p>` : ''}
        ${project.tags && project.tags.length > 0 ? `
          <div class="tag-list" style="margin-bottom: var(--space-4);">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${links.length > 0 ? `
          <div style="display: flex; gap: var(--space-4); font-size: var(--text-sm);">
            ${links.join('')}
          </div>
        ` : ''}
      </article>
    `;
  },

  // Create Writing/Talk Item
  createWritingItem(item) {
    const typeLabel = item.type === 'talk' ? '登壇' : '記事';

    return `
      <article class="card">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
          <span class="tag">${typeLabel}</span>
          ${item.date ? `<span class="text-muted" style="font-size: var(--text-sm);">${Utils.formatDate(item.date)}</span>` : ''}
        </div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.summary}</p>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="margin-top: var(--space-4);">
          読む →
        </a>
      </article>
    `;
  },

  // Create Timeline Item (for About page)
  createTimelineItem(item) {
    return `
      <div class="timeline-item" style="margin-bottom: var(--space-8); padding-left: var(--space-8); border-left: 2px solid var(--color-border); position: relative;">
        <div style="position: absolute; left: -6px; top: 0; width: 10px; height: 10px; background-color: var(--color-white); border-radius: 50%;"></div>
        <div class="text-muted" style="font-size: var(--text-sm); margin-bottom: var(--space-2);">${item.year}</div>
        <h4 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${item.title}</h4>
        <p class="text-secondary" style="font-size: var(--text-sm);">${item.description}</p>
      </div>
    `;
  },

  // Create Value/Expertise Card
  createValueCard(item) {
    return `
      <div class="card">
        <h3 style="font-size: var(--text-xl); margin-bottom: var(--space-3);">${item.title || item.area}</h3>
        <p class="text-secondary">${item.description}</p>
      </div>
    `;
  },

  // Render multiple items into a container
  renderItems(containerId, items, createItemFn) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<p class="text-muted">コンテンツがありません</p>';
      return;
    }

    container.innerHTML = items.map(createItemFn).join('');
  },

  // Show loading skeleton
  showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletons = Array(count).fill(0).map(() => `
      <div class="card">
        <div class="skeleton" style="height: 200px; margin-bottom: var(--space-4); border-radius: var(--radius-md);"></div>
        <div class="skeleton" style="height: 24px; width: 70%; margin-bottom: var(--space-3);"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: var(--space-2);"></div>
        <div class="skeleton" style="height: 16px; width: 90%;"></div>
      </div>
    `).join('');

    container.innerHTML = skeletons;
  }
};

// Expose to global scope
window.Components = Components;
