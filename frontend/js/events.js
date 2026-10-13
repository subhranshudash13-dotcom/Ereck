/**
 * Electrorec Events Module
 * Handles dynamic rendering, category filtering, and event card interaction
 */

const EventsModule = {
  currentCategory: 'All',
  cachedEvents: [],

  /**
   * Initialize events section
   */
  async init() {
    this.bindFilterEvents();
    await this.loadAndRenderEvents('All');
  },

  /**
   * Attach click handlers to category filter buttons
   */
  bindFilterEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const selectedCategory = e.currentTarget.getAttribute('data-category');
        
        // Update active filter style
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.currentCategory = selectedCategory;
        await this.loadAndRenderEvents(selectedCategory);
      });
    });

    // Bind "VIEW ALL →" header link
    const viewAllLink = document.getElementById('view-all-link');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const allBtn = document.getElementById('filter-all');
        if (allBtn) {
          filterButtons.forEach(b => b.classList.remove('active'));
          allBtn.classList.add('active');
        }
        this.currentCategory = 'All';
        await this.loadAndRenderEvents('All');
        const eventsSection = document.getElementById('events');
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  },

  /**
   * Fetch and render event list
   * @param {string} category 
   */
  async loadAndRenderEvents(category = 'All') {
    const gridEl = document.getElementById('event-grid');
    if (!gridEl) return;

    // Show loading skeleton
    gridEl.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading upcoming ${category === 'All' ? '' : category.toLowerCase()} events...</p>
      </div>
    `;

    try {
      const events = await API.fetchEvents(category);
      this.cachedEvents = events;
      this.renderEvents(events, gridEl);
    } catch (err) {
      console.error('[EventsModule] Failed to render events:', err);
      gridEl.innerHTML = `
        <div class="empty-state">
          <p>Unable to load events at the moment. Please try refreshing.</p>
        </div>
      `;
    }
  },

  /**
   * Render cards into container
   * @param {Array} events 
   * @param {HTMLElement} container 
   */
  renderEvents(events, container) {
    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No events found for category "${this.currentCategory}".</p>
        </div>
      `;
      return;
    }

    const cardsHtml = events.map(event => this.createCardHTML(event)).join('');
    container.innerHTML = cardsHtml;
  },

  /**
   * Generate HTML for a single event card
   * @param {Object} event 
   */
  createCardHTML(event) {
    const regCount = event.registrationCount || 0;
    const capacity = event.capacity || 100;
    const fillPercent = Math.min(100, Math.round((regCount / capacity) * 100));
    const isFull = regCount >= capacity;
    const isClosed = event.registrationOpen === false;

    // Category icon
    const categoryIcons = {
      'Technical': '⚡',
      'Cultural': '🎭',
      'Sports': '🏆',
    };
    const icon = categoryIcons[event.category] || '⚡';

    return `
      <article class="event-card" id="event-${event._id}">
        <a href="/event.html?id=${event._id}" class="card-media" title="View details for ${event.title}">
          <img 
            src="${event.image || '/assets/events/technical.jpg'}" 
            alt="${event.title}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='/assets/events/technical.jpg';"
          />
          <span class="card-category-badge">${icon} ${event.category}</span>
        </a>

        <div class="card-body">
          <h3 class="card-title">
            <a href="/event.html?id=${event._id}" style="color: inherit; text-decoration: none;">${event.title}</a>
          </h3>
          <p class="card-desc">${event.description || event.tagline || ''}</p>

          <ul class="card-meta-list">
            <li class="card-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${event.date}</span>
            </li>
            <li class="card-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${event.time}</span>
            </li>
            <li class="card-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${event.venue}</span>
            </li>
          </ul>

          <div class="card-status-box">
            <span class="status-indicator ${isClosed ? 'status-closed' : isFull ? 'status-full' : 'status-open'}">
              <span class="status-dot"></span>
              ${isClosed ? 'Registrations Closed' : isFull ? 'Capacity Reached' : 'Registrations Open'}
            </span>
          </div>

          <div class="card-footer">
            <a href="/event.html?id=${event._id}" class="btn-card-details">
              <span>Details</span>
              <span>→</span>
            </a>
            <a 
              href="/register.html?id=${event._id}" 
              class="btn-card-register ${isFull || isClosed ? 'disabled' : ''}"
              ${isFull || isClosed ? 'tabindex="-1" aria-disabled="true"' : ''}
            >
              <span>${isClosed ? 'Closed' : isFull ? 'Event Full' : 'Register'}</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }
};
