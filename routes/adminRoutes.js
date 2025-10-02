const express = require('express');
const router = express.Router();
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  deleteAllAdmins,
  loginAdmin
} = require('../controller/adminController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/admin/login - Admin login
router.post('/login', loginAdmin);

// GET /api/admin - Get all admins with pagination and filtering
router.get('/', getAllAdmins);

// GET /api/admin/:id - Get admin by ID
router.get('/:id', getAdminById);

// POST /api/admin - Create new admin
router.post('/', createAdmin);

// PUT /api/admin/:id - Update admin (protected)
router.put('/:id', authenticateToken, updateAdmin);

// DELETE /api/admin/:id - Delete specific admin (protected)
router.delete('/:id', authenticateToken, deleteAdmin);

// DELETE /api/admin - Delete all admins (protected - for testing/reset)
router.delete('/', authenticateToken, deleteAllAdmins);

module.exports = router;
