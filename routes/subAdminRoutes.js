const express = require('express');
const router = express.Router();
const {
  getAllSubAdmins,
  getSubAdminById,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  deleteAllSubAdmins,
  loginSubAdmin,
  getAssignedVoters,
  getSubAdminStats
} = require('../controller/subAdminController');
// const { authenticateToken } = require('../middleware/auth');

// POST /api/subadmin/login - Sub admin login
router.post('/login', loginSubAdmin);

// GET /api/subadmin - Get all sub admins with pagination and filtering
router.get('/', getAllSubAdmins);

// GET /api/subadmin/:id - Get sub admin by ID
router.get('/:id', getSubAdminById);

// POST /api/subadmin - Create new sub admin
router.post('/', createSubAdmin);

// PUT /api/subadmin/:id - Update sub admin
router.put('/:id', updateSubAdmin);

// DELETE /api/subadmin/:id - Delete sub admin
router.delete('/:id', deleteSubAdmin);

// DELETE /api/subadmin - Delete all sub admins (for testing/reset)
router.delete('/', deleteAllSubAdmins);

// GET /api/subadmin/:id/assigned-voters - Get assigned voters for sub admin
router.get('/:id/assigned-voters', getAssignedVoters);

// GET /api/subadmin/:id/stats - Get sub admin statistics
router.get('/:id/stats', getSubAdminStats);

module.exports = router;
