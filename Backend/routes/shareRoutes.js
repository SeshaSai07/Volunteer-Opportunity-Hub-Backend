const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController.js');

router.get('/:id', shareController.getShareData);

module.exports = router;
