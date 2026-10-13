const express = require('express');
const router = express.Router();
const { registerForEvent } = require('../controllers/registrationController');

router.post('/', registerForEvent);

module.exports = router;
