const express = require('express');
const router = express.Router();
const {
  adminLogin,
  verifyAuth,
  getRestrictedAccountsInfo,
  getStats,
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  getAllRegistrations,
  exportCSV,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Public admin login & restricted roster metadata
router.post('/login', adminLogin);
router.get('/restricted-accounts', getRestrictedAccountsInfo);

// Protected routes (require valid JWT)
router.get('/verify', requireAdmin, verifyAuth);

// Protected routes (require valid JWT)
router.get('/stats', requireAdmin, getStats);
router.get('/events', requireAdmin, getAdminEvents);
router.post('/events', requireAdmin, createEvent);
router.put('/events/:id', requireAdmin, updateEvent);
router.delete('/events/:id', requireAdmin, deleteEvent);
router.get('/events/:id/registrations', requireAdmin, getEventRegistrations);
router.get('/registrations', requireAdmin, getAllRegistrations);
router.get('/events/:id/export-csv', requireAdmin, exportCSV);
router.get('/export-csv', requireAdmin, exportCSV);

module.exports = router;
