const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/send', authMiddleware, messageController.sendMessage);
router.get('/:otherUserId', authMiddleware, messageController.getConversation);

module.exports = router;
