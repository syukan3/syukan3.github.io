// Main JavaScript

// Navigation Toggle (Mobile)
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      const isExpanded = navList.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-container')) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('active')) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Set active nav link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || currentPath.startsWith(linkPath) && linkPath !== '/renewal/') {
      link.classList.add('active');
    }
  });
});

// Data Loading Utilities
const DataLoader = {
  cache: {},

  async load(dataFile) {
    if (this.cache[dataFile]) {
      return this.cache[dataFile];
    }

    try {
      const response = await fetch(`/renewal/data/${dataFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${dataFile}`);
      }
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
  }
};

// Utility Functions
const Utils = {
  // Truncate text to specified length
  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },

  // Debounce function
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
  },

  // Smooth scroll to element
  scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
};

// Expose to global scope
window.DataLoader = DataLoader;
window.Utils = Utils;
