const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', authMiddleware, adminMiddleware, resourceController.createResource);

module.exports = router;
