const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  deleteAllAlerts,
  uploadAlertImages,
  deleteAlertImage,
  publishAlert,
  unpublishAlert,
  getPublishedAlerts,
  getAlertStats
} = require('../controller/alertController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateSubAdmin } = require('../middleware/subAdminAuth');

// GET /api/alert/published - Get published alerts (public)
router.get('/published', getPublishedAlerts);

// GET /api/alert/stats - Get alert statistics (public)
router.get('/stats', getAlertStats);

// GET /api/alert - Get all alerts with pagination and filtering (Admin/SubAdmin)
router.get('/', authenticateToken, getAllAlerts);

// GET /api/alert/:id - Get alert by ID (Admin/SubAdmin)
router.get('/:id', getAlertById);

// POST /api/alert - Create new alert (Admin/SubAdmin)
router.post('/', authenticateToken, createAlert);

// PUT /api/alert/:id - Update alert (Admin/SubAdmin)
router.put('/:id', authenticateToken, updateAlert);

// DELETE /api/alert/:id - Delete alert (Admin/SubAdmin)
router.delete('/:id', authenticateToken, deleteAlert);

// DELETE /api/alert - Delete all alerts (Admin only)
router.delete('/', authenticateToken, deleteAllAlerts);

// POST /api/alert/:id/images - Upload images to alert (Admin/SubAdmin)
router.post('/:id/images', authenticateToken, uploadAlertImages);

// DELETE /api/alert/:id/images/:imageId - Delete specific image from alert (Admin/SubAdmin)
router.delete('/:id/images/:imageId', authenticateToken, deleteAlertImage);

// PATCH /api/alert/:id/publish - Publish alert (Admin/SubAdmin)
router.patch('/:id/publish', authenticateToken, publishAlert);

// PATCH /api/alert/:id/unpublish - Unpublish alert (Admin/SubAdmin)
router.patch('/:id/unpublish', authenticateToken, unpublishAlert);

module.exports = router;
