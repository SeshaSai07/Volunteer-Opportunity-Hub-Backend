const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

// Get all resources
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);

// Create a new resource (Protected by auth, controller checks for admin/org)
router.post('/', authMiddleware, resourceController.createResource);

// Delete resource (Protected by auth and admin only)
router.delete('/:id', authMiddleware, adminMiddleware, resourceController.deleteResource);

module.exports = router;
