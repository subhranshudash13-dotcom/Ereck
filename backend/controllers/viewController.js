const DataStore = require('../services/dataStore');

const viewController = {
  // @route GET /
  async renderHome(req, res, next) {
    try {
      const category = req.query.category || 'All';
      const events = await DataStore.getEvents(category);
      const stats = await DataStore.getStats();

      res.render('index', {
        title: 'Electrorec | Electrify Your Potential',
        events,
        stats,
        activeCategory: category,
      });
    } catch (err) {
      next(err);
    }
  },

  // @route GET /event/:id or GET /event?id=...
  async renderEventDetail(req, res, next) {
    try {
      const eventId = req.params.id || req.query.id;
      if (!eventId) {
        return res.redirect('/#events');
      }

      const event = await DataStore.getEventById(eventId);
      res.render('event', {
        title: event ? `${event.title} | Electrorec` : 'Event Details | Electrorec',
        event,
      });
    } catch (err) {
      next(err);
    }
  },

  // @route GET /register/:id or GET /register?id=...
  async renderRegister(req, res, next) {
    try {
      const eventId = req.params.id || req.query.id;
      let event = null;
      if (eventId) {
        event = await DataStore.getEventById(eventId);
      }

      res.render('register', {
        title: event ? `Register for ${event.title} | Electrorec` : 'Event Registration | Electrorec',
        event,
        formData: {},
        error: null,
        registration: null,
      });
    } catch (err) {
      next(err);
    }
  },

  // @route POST /register
  async handleRegistration(req, res, next) {
    try {
      const { eventId, name, email, phone, rollNumber, branch, year, college } = req.body;

      // Fetch event
      let event = null;
      if (eventId) {
        event = await DataStore.getEventById(eventId);
      }

      const formData = { eventId, name, email, phone, rollNumber, branch, year, college };

      // Validation
      if (!eventId || !event) {
        return res.render('register', {
          title: 'Event Registration | Electrorec',
          event: null,
          formData,
          error: 'Please select a valid event before submitting registration.',
          registration: null,
        });
      }

      if (!name || !email || !phone || !rollNumber || !branch || !year) {
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: 'Please fill in all mandatory fields: Full Name, Email, Phone, Roll Number, Branch, and Academic Year.',
          registration: null,
        });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: 'Please provide a valid email address.',
          registration: null,
        });
      }

      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      if (cleanPhone.length < 7) {
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: 'Please provide a valid phone number (at least 7 digits).',
          registration: null,
        });
      }

      if (event.registrationOpen === false) {
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: 'Registrations for this event are currently closed.',
          registration: null,
        });
      }

      const currentCount = event.registrationCount || 0;
      const maxCapacity = event.capacity || 100;
      if (currentCount >= maxCapacity) {
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: 'Registration full: Maximum capacity for this event has been reached.',
          registration: null,
        });
      }

      // Check for duplicate registration
      const existing = await DataStore.findExistingRegistration(eventId, email, rollNumber);
      if (existing) {
        const matchType = existing.email.toLowerCase() === email.toLowerCase().trim() ? 'email' : 'roll number';
        return res.render('register', {
          title: `Register for ${event.title} | Electrorec`,
          event,
          formData,
          error: `You are already registered for "${event.title}" with this ${matchType} (ID: ${existing.registrationId}).`,
          registration: null,
        });
      }

      // Create new registration record dynamically
      const newRegistration = await DataStore.createRegistration({
        eventId: event._id,
        eventTitle: event.title,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        rollNumber: rollNumber.trim().toUpperCase(),
        branch: branch.trim(),
        year: year.trim(),
        college: (college && college.trim()) || 'NIT Kurukshetra',
      });

      // Render success ticket
      return res.render('register', {
        title: `Registration Confirmed | ${event.title}`,
        event,
        formData: {},
        error: null,
        registration: newRegistration,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = viewController;
