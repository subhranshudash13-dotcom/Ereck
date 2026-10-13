const DataStore = require('../services/dataStore');

// @desc    Get all events (optional category filter)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { category } = req.query;
    const events = await DataStore.getEvents(category);
    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await DataStore.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with provided ID',
      });
    }
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};
