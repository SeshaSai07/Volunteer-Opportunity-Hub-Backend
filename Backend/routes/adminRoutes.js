const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

// All admin routes require BOTH auth and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/role', adminController.updateUserRole);

// Verification Tool
router.put('/verify-hours', adminController.verifyVolunteerHours);

// Moderation
router.delete('/reviews/:id', adminController.deleteReview);

// Analytics
router.get('/stats', adminController.getSystemStats);
router.get('/export/csv', adminController.exportVolunteerData);

// Volunteer Tracking
router.get('/volunteer-logs', adminController.getVolunteerLogs);
router.put('/volunteer-logs/:id', adminController.updateVolunteerLog);

// Deletions
router.delete('/users/:id', adminController.deleteUser);
router.delete('/opportunities/:id', adminController.deleteOpportunity);

module.exports = router;
