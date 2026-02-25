const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/', authMiddleware, groupController.createGroup);
router.post('/join', authMiddleware, groupController.joinGroup);
router.get('/:id', groupController.getGroupDetails);

module.exports = router;
