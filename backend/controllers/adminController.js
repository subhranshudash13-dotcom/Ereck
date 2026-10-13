const jwt = require('jsonwebtoken');
const DataStore = require('../services/dataStore');
const { JWT_SECRET } = require('../middleware/auth');

// Whitelisted restricted administrator accounts
const RESTRICTED_ADMIN_ACCOUNTS = [
  {
    email: (process.env.ADMIN_EMAIL || 'admin@electrorec.club').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || 'electrorec2026',
    role: 'Super Administrator',
    name: 'Head Administrator',
    badge: 'Super Admin',
  },
  {
    email: (process.env.ORGANIZER_EMAIL || 'organizer@electrorec.club').toLowerCase().trim(),
    password: process.env.ORGANIZER_PASSWORD || 'organizer2026',
    role: 'Lead Event Organizer',
    name: 'Club Event Lead',
    badge: 'Lead Organizer',
  },
  {
    email: (process.env.CORE_EMAIL || 'core@electrorec.club').toLowerCase().trim(),
    password: process.env.CORE_PASSWORD || 'coreteam2026',
    role: 'Core Committee Coordinator',
    name: 'Technical Coordinator',
    badge: 'Core Team',
  },
];

// @desc    Admin login for restricted accounts
// @route   POST /api/admin/login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide administrator email and password.',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const matchedAccount = RESTRICTED_ADMIN_ACCOUNTS.find(
    (acc) => acc.email === normalizedEmail
  );

  if (!matchedAccount) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: The account is not on the authorized restricted administrator roster.',
    });
  }

  if (matchedAccount.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid password for this restricted account.',
    });
  }

  const token = jwt.sign(
    {
      email: matchedAccount.email,
      role: matchedAccount.role,
      name: matchedAccount.name,
      badge: matchedAccount.badge,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    success: true,
    message: `Welcome back, ${matchedAccount.name}. Restricted session authenticated.`,
    token,
    admin: {
      email: matchedAccount.email,
      role: matchedAccount.role,
      name: matchedAccount.name,
      badge: matchedAccount.badge,
    },
  });
};

// @desc    Verify active admin authentication token
// @route   GET /api/admin/verify
exports.verifyAuth = async (req, res) => {
  return res.status(200).json({
    success: true,
    authenticated: true,
    admin: req.admin,
  });
};

// @desc    Get public list of authorized restricted account roles for login portal
// @route   GET /api/admin/restricted-accounts
exports.getRestrictedAccountsInfo = (req, res) => {
  const roster = RESTRICTED_ADMIN_ACCOUNTS.map(acc => ({
    email: acc.email,
    role: acc.role,
    badge: acc.badge,
  }));
  return res.status(200).json({
    success: true,
    roster,
  });
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await DataStore.getStats();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events with registration count
// @route   GET /api/admin/events
exports.getAdminEvents = async (req, res, next) => {
  try {
    const events = await DataStore.getEvents();
    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/admin/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, category, tagline, description, date, time, venue, capacity, image } = req.body;

    if (!title || !category || !description || !date || !time || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details (Title, Category, Description, Date, Time, Venue).',
      });
    }

    const newEvent = await DataStore.createEvent({
      title: title.trim(),
      category,
      tagline: (tagline && tagline.trim()) || '',
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      venue: venue.trim(),
      capacity: Number(capacity) || 100,
      image: image || (category === 'Technical' ? '/assets/events/technical.jpg' : category === 'Cultural' ? '/assets/events/cultural.jpg' : '/assets/events/sports.jpg'),
      registrationOpen: true,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (e.g. toggle registration or capacity)
// @route   PUT /api/admin/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const updated = await DataStore.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const deleted = await DataStore.deleteEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event and its associated registrations deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for a specific event
// @route   GET /api/admin/events/:id/registrations
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const event = await DataStore.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registrations = await DataStore.getRegistrationsByEvent(req.params.id);
    res.status(200).json({
      success: true,
      eventTitle: event.title,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations across all events
// @route   GET /api/admin/registrations
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const registrations = await DataStore.getAllRegistrations();
    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export registrations as CSV
// @route   GET /api/admin/events/:id/export-csv
exports.exportCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    let registrations = [];
    let filename = 'electrorec-registrations-all.csv';

    if (id && id !== 'all') {
      const event = await DataStore.getEventById(id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      registrations = await DataStore.getRegistrationsByEvent(id);
      const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      filename = `electrorec-registrations-${safeTitle}.csv`;
    } else {
      registrations = await DataStore.getAllRegistrations();
    }

    // Generate CSV string
    const headers = ['Registration ID', 'Event Title', 'Student Name', 'Email', 'Phone', 'Roll Number', 'Branch', 'Year', 'College', 'Registered At'];
    
    const rows = registrations.map((r) => {
      const eventTitle = (typeof r.eventId === 'object' && r.eventId?.title) ? r.eventId.title : (r.eventTitle || 'Event');
      const dateStr = r.registeredAt ? new Date(r.registeredAt).toISOString() : '';
      return [
        `"${r.registrationId || ''}"`,
        `"${eventTitle.replace(/"/g, '""')}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.email || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.rollNumber || ''}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${r.year || ''}"`,
        `"${(r.college || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
