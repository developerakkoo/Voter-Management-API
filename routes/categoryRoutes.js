const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
  addDataEntry,
  updateDataEntry,
  deleteDataEntry,
  getCategoryDataEntries,
  reorderDataEntries,
  getActiveCategories,
  searchCategories,
  getCategoryStats
} = require('../controller/categoryController');
// const { authenticateToken } = require('../middleware/auth');

// GET /api/category/active - Get active categories (public)
router.get('/active', getActiveCategories);

// GET /api/category/search - Search categories (public)
router.get('/search', searchCategories);

// GET /api/category/stats - Get category statistics (public)
router.get('/stats', getCategoryStats);

// GET /api/category - Get all categories with pagination and filtering (Admin/SubAdmin)
router.get('/', getAllCategories);

// GET /api/category/:id - Get category by ID (Admin/SubAdmin)
router.get('/:id', getCategoryById);

// POST /api/category - Create new category (Admin/SubAdmin)
router.post('/', createCategory);

// PUT /api/category/:id - Update category (Admin/SubAdmin)
router.put('/:id', updateCategory);

// DELETE /api/category/:id - Delete category (Admin/SubAdmin)
router.delete('/:id', deleteCategory);

// DELETE /api/category - Delete all categories (Admin only)
router.delete('/', deleteAllCategories);

// Data Entry Management Routes

// GET /api/category/:id/data - Get data entries for category (Admin/SubAdmin)
router.get('/:id/data', getCategoryDataEntries);

// POST /api/category/:id/data - Add data entry to category (Admin/SubAdmin)
router.post('/:id/data', addDataEntry);

// PUT /api/category/:id/data/:entryId - Update data entry (Admin/SubAdmin)
router.put('/:id/data/:entryId', updateDataEntry);

// DELETE /api/category/:id/data/:entryId - Delete data entry (Admin/SubAdmin)
router.delete('/:id/data/:entryId', deleteDataEntry);

// PATCH /api/category/:id/data/reorder - Reorder data entries (Admin/SubAdmin)
router.patch('/:id/data/reorder', reorderDataEntries);

module.exports = router;
