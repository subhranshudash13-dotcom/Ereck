/**
 * Electrorec Registration Module
 * Handles modal state, event pre-population, form validation, API submission, and success ticket
 */

const RegistrationModule = {
  currentEvent: null,

  /**
   * Initialize registration listeners
   */
  init() {
    this.bindModalEvents();
  },

  /**
   * Bind open, close, and submit event listeners
   */
  bindModalEvents() {
    const overlay = document.getElementById('registration-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const form = document.getElementById('registration-form');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal();
        }
      });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
        this.closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  },

  /**
   * Open the registration modal for a specific event
   * @param {Object} eventObj 
   */
  openModal(eventObj) {
    this.currentEvent = eventObj;
    const overlay = document.getElementById('registration-modal');
    const formView = document.getElementById('modal-form-view');
    const successView = document.getElementById('modal-success-view');
    const eventNameLabel = document.getElementById('modal-event-name');
    const eventIdInput = document.getElementById('reg-event-id');
    const alertBox = document.getElementById('modal-form-alert');

    // Reset views
    if (formView) formView.style.display = 'block';
    if (successView) successView.style.display = 'none';
    if (alertBox) {
      alertBox.className = 'form-alert';
      alertBox.textContent = '';
      alertBox.style.display = 'none';
    }

    // Pre-populate event details
    if (eventNameLabel) {
      eventNameLabel.textContent = `Registering for: ${eventObj.title}`;
    }
    if (eventIdInput) {
      eventIdInput.value = eventObj._id;
    }

    // Open overlay
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  },

  /**
   * Close modal and reset state
   */
  closeModal() {
    const overlay = document.getElementById('registration-modal');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Reset form after transition
    setTimeout(() => {
      const form = document.getElementById('registration-form');
      if (form) form.reset();
      this.currentEvent = null;
    }, 250);
  },

  /**
   * Validate and submit registration form
   * @param {Event} e 
   */
  async handleFormSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const submitBtn = document.getElementById('btn-submit-reg');
    const alertBox = document.getElementById('modal-form-alert');

    const eventId = document.getElementById('reg-event-id')?.value;
    const name = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const phone = document.getElementById('reg-phone')?.value.trim();
    const rollNumber = document.getElementById('reg-roll')?.value.trim();
    const branch = document.getElementById('reg-branch')?.value.trim();
    const year = document.getElementById('reg-year')?.value.trim();
    const college = document.getElementById('reg-college')?.value.trim() || 'NIT Kurukshetra';

    // Client-side validation
    if (!name || !email || !phone || !rollNumber || !branch || !year) {
      this.showAlert('Please fill in all mandatory fields.', 'error');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      this.showAlert('Please provide a valid email address (e.g. name@domain.com).', 'error');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7) {
      this.showAlert('Please enter a valid phone number (at least 7 digits).', 'error');
      return;
    }

    // Show loading state on button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0 4px 0 0;display:inline-block;vertical-align:middle;"></span>
        Submitting Registration...
      `;
    }

    try {
      const payload = {
        eventId,
        name,
        email,
        phone: cleanPhone,
        rollNumber,
        branch,
        year,
        college,
      };

      const result = await API.submitRegistration(payload);

      if (!result.success) {
        this.showAlert(result.message || 'Registration failed.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Complete Registration →';
        }
        return;
      }

      // Show success confirmation screen
      this.renderSuccessTicket(result.registration);

      // Refresh events in background so seat counts update
      EventsModule.loadAndRenderEvents(EventsModule.currentCategory);
    } catch (err) {
      console.error('[Registration] Submit Error:', err);
      this.showAlert('An unexpected network error occurred. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Complete Registration →';
      }
    }
  },

  /**
   * Display inline alert message in modal
   * @param {string} msg 
   * @param {string} type 
   */
  showAlert(msg, type = 'error') {
    const alertBox = document.getElementById('modal-form-alert');
    if (alertBox) {
      alertBox.textContent = msg;
      alertBox.className = `form-alert ${type}`;
      alertBox.style.display = 'block';
    }
  },

  /**
   * Render the verified registration ticket in modal
   * @param {Object} reg 
   */
  renderSuccessTicket(reg) {
    const formView = document.getElementById('modal-form-view');
    const successView = document.getElementById('modal-success-view');

    if (formView) formView.style.display = 'none';

    if (successView) {
      successView.style.display = 'block';
      successView.innerHTML = `
        <div class="success-view">
          <div class="success-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          
          <h3 class="success-title">Registration Confirmed!</h3>
          <p class="success-sub">You are successfully registered, <strong>${reg.name}</strong>.</p>

          <div class="reg-ticket-card">
            <div class="ticket-header">Official Confirmation Pass</div>
            <div class="ticket-reg-id">${reg.registrationId}</div>

            <div class="ticket-details">
              <div><strong>Event:</strong> ${reg.eventTitle}</div>
              <div><strong>Date & Time:</strong> ${reg.date} • ${reg.time}</div>
              <div><strong>Venue:</strong> ${reg.venue}</div>
              <div><strong>Roll Number:</strong> ${reg.rollNumber}</div>
              <div><strong>Registered Email:</strong> ${reg.email}</div>
            </div>
          </div>

          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:20px;">
            Please save or screenshot your Registration ID for check-in at the venue.
          </p>

          <button type="button" class="btn btn-primary" style="width:100%;" id="btn-done-registration">
            Done & Close
          </button>
        </div>
      `;

      // Bind close handler to Done button
      const doneBtn = document.getElementById('btn-done-registration');
      if (doneBtn) {
        doneBtn.addEventListener('click', () => this.closeModal());
      }
    }
  }
};
