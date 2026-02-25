const express = require('express');
const router = express.Router();    
const opportunityController = require('../controllers/opportunityController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Public routes
router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById);

// Protected routes (Create)
router.post('/', authMiddleware, opportunityController.createOpportunity);

module.exports = router;
