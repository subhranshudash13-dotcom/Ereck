/**
 * Electrorec Main Application Bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Dark / Light Theme Toggle
  setupThemeToggle();

  // Initialize Events and Registration sub-modules
  if (typeof EventsModule !== 'undefined') {
    EventsModule.init();
  }

  if (typeof RegistrationModule !== 'undefined') {
    RegistrationModule.init();
  }

  // Setup Mobile Menu Toggle
  setupMobileMenu();

  // Setup Navbar Scroll State
  setupNavbarScroll();

  // Setup Smooth Anchor Scrolling
  setupSmoothScroll();

  // Setup Admin Nav Status if logged in
  setupAdminNavStatus();

  // Setup Interactive FAQ Accordion
  setupFAQAccordion();
});

/**
 * Check if an organizer admin session is active and reflect on Navbar
 */
function setupAdminNavStatus() {
  const token = localStorage.getItem('electrorec_admin_token');
  const adminBtn = document.getElementById('nav-admin-btn');

  if (token && adminBtn) {
    // Quickly verify with backend
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          adminBtn.classList.add('is-authenticated');
          adminBtn.setAttribute('title', 'Admin Session Active - Go to Organizer Dashboard');
        } else {
          localStorage.removeItem('electrorec_admin_token');
        }
      })
      .catch(() => {
        // Silent catch for offline or dev server
      });
  }
}

/**
 * Mobile Navigation Toggle
 */
function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside or clicking any nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/**
 * Navbar background transition on scroll & active link highlight
 */
function setupNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Backdrop blur / opacity enhancement on scroll
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentSection = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Smooth scrolling for anchors
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Setup Theme Toggle (Dark & Light Mode) with localStorage persistence
 */
function setupThemeToggle() {
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('electrorec_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Strict default: dark theme
  };

  const updateButtons = (theme) => {
    const isLight = theme === 'light';
    const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
  };

  const applyTheme = (theme, persist = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      localStorage.setItem('electrorec_theme', theme);
    }
    updateButtons(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  // Sync initial theme (defaults to dark)
  const initialTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  applyTheme(initialTheme, false);

  // Attach click listener using event delegation for resilient binding
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle-btn');
    if (!btn) return;
    e.preventDefault();
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, true);
  });
}

/**
 * Setup Interactive FAQ Accordion and Category Filtering
 */
function setupFAQAccordion() {
  const faqSection = document.getElementById('faq');
  if (!faqSection) return;

  // Accordion Expand/Collapse
  const faqButtons = faqSection.querySelectorAll('.faq-question-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');

      // Close all other items for a clean accordion effect
      faqSection.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.faq-question-btn');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Category Filtering
  const pills = faqSection.querySelectorAll('.faq-cat-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter') || 'all';
      const items = faqSection.querySelectorAll('.faq-item');
      items.forEach(item => {
        const itemCat = item.getAttribute('data-category') || 'general';
        if (filter === 'all' || itemCat.toLowerCase() === filter.toLowerCase()) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

