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
// 
// GET /api/category/active - Get active categories
router.get('/active', getActiveCategories);

// GET /api/category/search - Search categories
router.get('/search', searchCategories);

// GET /api/category/stats - Get category statistics
router.get('/stats', getCategoryStats);

// GET /api/category - Get all categories with pagination and filtering
router.get('/', getAllCategories);

// Data Entry Management Routes - These must come before /:id routes

// GET /api/category/:id/data - Get data entries for category
router.get('/:id/data', getCategoryDataEntries);

// POST /api/category/:id/data - Add data entry to category
router.post('/:id/data', addDataEntry);

// PUT /api/category/:id/data/:entryId - Update data entry
router.put('/:id/data/:entryId', updateDataEntry);

// DELETE /api/category/:id/data/:entryId - Delete data entry
router.delete('/:id/data/:entryId', deleteDataEntry);

// PATCH /api/category/:id/data/reorder - Reorder data entries
router.patch('/:id/data/reorder', reorderDataEntries);

// Category Management Routes

// GET /api/category/:id - Get category by ID
router.get('/:id', getCategoryById);

// POST /api/category - Create new category
router.post('/', createCategory);

// PUT /api/category/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/category/:id - Delete category
router.delete('/:id', deleteCategory);

// DELETE /api/category - Delete all categories
router.delete('/', deleteAllCategories);

module.exports = router;
