const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.get('/', authMiddleware, notificationController.getNotifications);

module.exports = router;
