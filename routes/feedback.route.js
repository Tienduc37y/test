const express = require('express');
const router = express.Router();
const { sendFeedback } = require('../controllers/feedback.controller');

router.post('/', sendFeedback);

module.exports = router; 