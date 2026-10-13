const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Home page
router.get('/', viewController.renderHome);

// Event Details (both /event/:id and /event?id=...)
router.get('/event/:id', viewController.renderEventDetail);
router.get('/event', viewController.renderEventDetail);

// Event Registration (both /register/:id and /register?id=...)
router.get('/register/:id', viewController.renderRegister);
router.get('/register', viewController.renderRegister);

// Server-side Registration Form Submission
router.post('/register', viewController.handleRegistration);

module.exports = router;
