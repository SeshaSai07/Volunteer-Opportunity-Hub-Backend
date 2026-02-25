const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/join', authMiddleware, volunteerController.joinOpportunity);
router.get('/hours', authMiddleware, volunteerController.getVolunteerHistory);

module.exports = router;
