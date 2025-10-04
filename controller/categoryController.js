const Category = require('../models/Category');

// GET /api/category - Get all categories with pagination and filtering
const getAllCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      includeDataEntries = false
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'dataEntries.title': { $regex: search, $options: 'i' } },
        { 'dataEntries.description': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Build projection based on includeDataEntries
    const projection = includeDataEntries === 'true' ? {} : { dataEntries: 0 };
    
    const [categories, totalCount] = await Promise.all([
      Category.find(filter, projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Category.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// GET /api/category/:id - Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// POST /api/category - Create new category
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    // Create new category
    const category = new Category({
      name,
      description,
     
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// PUT /api/category/:id - Update category
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updateData = req.body;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// DELETE /api/category/:id - Delete category
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// DELETE /api/category - Delete all categories (for testing/reset)
const deleteAllCategories = async (req, res) => {
  try {
    const result = await Category.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} categories`
    });
  } catch (error) {
    console.error('Delete all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all categories',
      error: error.message
    });
  }
};

// POST /api/category/:id/data - Add data entry to category
const addDataEntry = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const {
      title,
      description,
      info
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Create data entry
    const dataEntry = {
      title,
      description,
      info
    };
    
    await category.addDataEntry(dataEntry);
    
    // Fetch updated category
    const updatedCategory = await Category.findById(categoryId);
    
    res.status(201).json({
      success: true,
      message: 'Data entry added successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Add data entry error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding data entry',
      error: error.message
    });
  }
};

// PUT /api/category/:id/data/:entryId - Update data entry
const updateDataEntry = async (req, res) => {
  try {
    const { id: categoryId, entryId } = req.params;
    const updateData = req.body;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    
    await category.updateDataEntry(entryId, updateData);
    
    // Fetch updated category
    const updatedCategory = await Category.findById(categoryId);
    
    res.json({
      success: true,
      message: 'Data entry updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update data entry error:', error);
    
    if (error.message === 'Data entry not found') {
      return res.status(404).json({
        success: false,
        message: 'Data entry not found'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating data entry',
      error: error.message
    });
  }
};

// DELETE /api/category/:id/data/:entryId - Delete data entry
const deleteDataEntry = async (req, res) => {
  try {
    const { id: categoryId, entryId } = req.params;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.removeDataEntry(entryId);
    
    res.json({
      success: true,
      message: 'Data entry deleted successfully',
      data: {
        categoryId: category._id,
        remainingEntries: category.dataEntries.length
      }
    });
  } catch (error) {
    console.error('Delete data entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting data entry',
      error: error.message
    });
  }
};

// GET /api/category/:id/data - Get data entries for category
const getCategoryDataEntries = async (req, res) => {
  try {
    const { 
      id: categoryId,
      activeOnly = 'true',
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    let dataEntries = category.dataEntries;
    
    // Filter active entries if requested
    if (activeOnly === 'true') {
      dataEntries = category.getActiveDataEntries();
    }
    
    // Search in data entries if search term provided
    if (search) {
      dataEntries = category.searchDataEntries(search);
    }
    
    // Sort data entries
    dataEntries.sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'title') {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          description: category.description
        },
        dataEntries,
        totalEntries: dataEntries.length,
        activeEntries: category.getActiveDataEntries().length
      }
    });
  } catch (error) {
    console.error('Get category data entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data entries',
      error: error.message
    });
  }
};

// PATCH /api/category/:id/data/reorder - Reorder data entries
const reorderDataEntries = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { entryIds } = req.body;
    
    if (!entryIds || !Array.isArray(entryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Entry IDs array is required'
      });
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.reorderDataEntries(entryIds);
    
    res.json({
      success: true,
      message: 'Data entries reordered successfully',
      data: category
    });
  } catch (error) {
    console.error('Reorder data entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering data entries',
      error: error.message
    });
  }
};

// GET /api/category/active - Get active categories with data entries
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.getActiveCategories().lean();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get active categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active categories',
      error: error.message
    });
  }
};

// GET /api/category/search - Search categories and data entries
const searchCategories = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const categories = await Category.searchCategories(searchTerm).lean();
    
    res.json({
      success: true,
      data: categories,
      searchTerm
    });
  } catch (error) {
    console.error('Search categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching categories',
      error: error.message
    });
  }
};

// GET /api/category/stats - Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.getCategoryStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: error.message
    });
  }
};

module.exports = {
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
};
