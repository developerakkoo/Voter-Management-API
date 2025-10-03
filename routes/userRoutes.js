const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
  loginUser,
  searchUsers,
  getUserStats,
  getUsersByPno
} = require('../controller/userController');

// GET /api/user - Get all users with pagination, search, sort, and filter
router.get('/', getAllUsers);

// GET /api/user/stats - Get user statistics
router.get('/stats', getUserStats);

// GET /api/user/search - Search users
router.get('/search', searchUsers);

// GET /api/user/pno/:pno - Get users by PNO
router.get('/pno/:pno', getUsersByPno);

// GET /api/user/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/user - Create new user
router.post('/', createUser);

// POST /api/user/login - User login
router.post('/login', loginUser);

// PUT /api/user/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/user/:id - Delete user
router.delete('/:id', deleteUser);

// DELETE /api/user - Delete all users
router.delete('/', deleteAllUsers);

module.exports = router;
