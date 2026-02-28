const express = require('express');
const router = express.Router();    
const opportunityController = require('../controllers/opportunityController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Public routes
router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById);

// Protected routes (Create & Manage)
router.post('/', authMiddleware, opportunityController.createOpportunity);

// Organization routes
router.get('/org/volunteers', authMiddleware, opportunityController.getOrgVolunteers);
router.put('/org/volunteers/:logId', authMiddleware, opportunityController.updateOrgVolunteerLog);

module.exports = router;
