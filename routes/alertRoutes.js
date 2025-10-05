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
const { authenticateSubAdmin } = require('../middleware/subAdminAuth');

// GET /api/alert/published - Get published alerts (public)
router.get('/published', getPublishedAlerts);

// GET /api/alert/stats - Get alert statistics (public)
router.get('/stats', getAlertStats);

// GET /api/alert - Get all alerts with pagination and filtering (SubAdmin only)
router.get('/', authenticateSubAdmin, getAllAlerts);

// GET /api/alert/:id - Get alert by ID (SubAdmin only)
router.get('/:id', authenticateSubAdmin, getAlertById);

// POST /api/alert - Create new alert (SubAdmin only)
router.post('/', authenticateSubAdmin, createAlert);

// PUT /api/alert/:id - Update alert (SubAdmin only)
router.put('/:id', authenticateSubAdmin, updateAlert);

// DELETE /api/alert/:id - Delete alert (SubAdmin only)
router.delete('/:id', authenticateSubAdmin, deleteAlert);

// DELETE /api/alert - Delete all alerts (SubAdmin only)
router.delete('/', authenticateSubAdmin, deleteAllAlerts);

// POST /api/alert/:id/images - Upload images to alert (SubAdmin only)
router.post('/:id/images', authenticateSubAdmin, uploadAlertImages);

// DELETE /api/alert/:id/images/:imageId - Delete specific image from alert (SubAdmin only)
router.delete('/:id/images/:imageId', authenticateSubAdmin, deleteAlertImage);

// PATCH /api/alert/:id/publish - Publish alert (SubAdmin only)
router.patch('/:id/publish', authenticateSubAdmin, publishAlert);

// PATCH /api/alert/:id/unpublish - Unpublish alert (SubAdmin only)
router.patch('/:id/unpublish', authenticateSubAdmin, unpublishAlert);

module.exports = router;
