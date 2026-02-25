const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/:opportunityId', reviewController.getReviews);

module.exports = router;
