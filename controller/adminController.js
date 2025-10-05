const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// GET /api/admin - Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const [admins, totalCount] = await Promise.all([
      Admin.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Admin.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: admins,
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
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

// GET /api/admin/:id - Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message
    });
  }
};

// POST /api/admin - Create new admin
const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }
    
    // Create new admin
    const admin = new Admin({
      email: email.toLowerCase(),
      password
    });
    
    await admin.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Create admin error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};

// PUT /api/admin/:id - Update admin
const updateAdmin = async (req, res) => {
  try {
    const { email, password, isActive } = req.body;
    const adminId = req.params.id;
    
    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== admin.email) {
      const existingAdmin = await Admin.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: adminId }
      });
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Admin with this email already exists'
        });
      }
    }
    
    // Update fields
    const updateData = {};
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = password;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin.getPublicProfile()
    });
  } catch (error) {
    console.error('Update admin error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

// DELETE /api/admin/:id - Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    await Admin.findByIdAndDelete(adminId);
    
    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};

// DELETE /api/admin - Delete all admins (for testing/reset)
const deleteAllAdmins = async (req, res) => {
  try {
    const result = await Admin.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} admins`
    });
  } catch (error) {
    console.error('Delete all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all admins',
      error: error.message
    });
  }
};

// POST /api/admin/login - Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        adminId: admin._id,
        email: admin.email 
      },
      JWT_SECRET,
      { expiresIn: '7y' } // 7 years
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: admin.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  deleteAllAdmins,
  loginAdmin
};
