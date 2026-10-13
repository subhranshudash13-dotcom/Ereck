const DataStore = require('../services/dataStore');

// @desc    Register a student for an event
// @route   POST /api/registrations
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId, name, email, phone, rollNumber, branch, year, college } = req.body;

    // Basic required field validation
    if (!eventId || !name || !email || !phone || !rollNumber || !branch || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Email, Phone, Roll Number, Branch, and Academic Year.',
      });
    }

    // Email regex validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Phone validation (min 7 digits)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (at least 7 digits).',
      });
    }

    // Check if event exists
    const event = await DataStore.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'The requested event does not exist.',
      });
    }

    // Check if registration is open
    if (event.registrationOpen === false) {
      return res.status(400).json({
        success: false,
        message: 'Registrations for this event have closed.',
      });
    }

    // Check capacity limit
    const currentCount = event.registrationCount || 0;
    const maxCapacity = event.capacity || 100;
    if (currentCount >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration full: Maximum capacity for this event has been reached.',
      });
    }

    // Check duplicate registration
    const existingRegistration = await DataStore.findExistingRegistration(eventId, email, rollNumber);
    if (existingRegistration) {
      const matchType = existingRegistration.email.toLowerCase() === email.toLowerCase().trim() ? 'email' : 'roll number';
      return res.status(409).json({
        success: false,
        message: `You are already registered for "${event.title}" with this ${matchType}.`,
        registrationId: existingRegistration.registrationId,
      });
    }

    // Create registration
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

    res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully!',
      registration: {
        registrationId: newRegistration.registrationId,
        eventTitle: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        name: newRegistration.name,
        email: newRegistration.email,
        rollNumber: newRegistration.rollNumber,
        registeredAt: newRegistration.registeredAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
