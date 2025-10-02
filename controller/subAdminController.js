const SubAdmin = require('../models/SubAdmin');
const VoterAssignment = require('../models/VoterAssignment');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');
const jwt = require('jsonwebtoken');

// GET /api/subadmin - Get all sub admins with pagination and filtering
const getAllSubAdmins = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      locationName,
      sortBy = 'fullName',
      sortOrder = 'asc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (locationName) filter.locationName = { $regex: locationName, $options: 'i' };
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [subAdmins, totalCount] = await Promise.all([
      SubAdmin.find(filter)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SubAdmin.countDocuments(filter)
    ]);
    
    // Get assignment counts for each sub admin
    const subAdminsWithCounts = await Promise.all(
      subAdmins.map(async (subAdmin) => {
        const assignmentCount = await VoterAssignment.countDocuments({
          subAdminId: subAdmin._id,
          isActive: true
        });
        return {
          ...subAdmin,
          assignedVotersCount: assignmentCount
        };
      })
    );
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: subAdminsWithCounts,
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
    console.error('Get all sub admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub admins',
      error: error.message
    });
  }
};

// GET /api/subadmin/:id - Get sub admin by ID
const getSubAdminById = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id).select('-password');
    
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub admin not found'
      });
    }
    
    // Get assignment count
    const assignmentCount = await VoterAssignment.countDocuments({
      subAdminId: subAdmin._id,
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        ...subAdmin.toObject(),
        assignedVotersCount: assignmentCount
      }
    });
  } catch (error) {
    console.error('Get sub admin by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub admin',
      error: error.message
    });
  }
};

// POST /api/subadmin - Create new sub admin
const createSubAdmin = async (req, res) => {
  try {
    const { fullName, userId, password, locationName, locationImage } = req.body;
    
    // Validate required fields
    if (!fullName || !userId || !password || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Full name, user ID, password, and location name are required'
      });
    }
    
    // Check if sub admin already exists
    const existingSubAdmin = await SubAdmin.findOne({ userId: userId.toLowerCase() });
    if (existingSubAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Sub admin with this user ID already exists'
      });
    }
    
    // Create new sub admin
    const subAdmin = new SubAdmin({
      fullName,
      userId: userId.toLowerCase(),
      password,
      locationName,
      locationImage: locationImage || null
    });
    
    await subAdmin.save();
    
    res.status(201).json({
      success: true,
      message: 'Sub admin created successfully',
      data: subAdmin.getPublicProfile()
    });
  } catch (error) {
    console.error('Create sub admin error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating sub admin',
      error: error.message
    });
  }
};

// PUT /api/subadmin/:id - Update sub admin
const updateSubAdmin = async (req, res) => {
  try {
    const { fullName, userId, password, locationName, locationImage, isActive } = req.body;
    const subAdminId = req.params.id;
    
    // Check if sub admin exists
    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub admin not found'
      });
    }
    
    // Check if userId is being changed and if it already exists
    if (userId && userId.toLowerCase() !== subAdmin.userId) {
      const existingSubAdmin = await SubAdmin.findOne({ 
        userId: userId.toLowerCase(),
        _id: { $ne: subAdminId }
      });
      if (existingSubAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Sub admin with this user ID already exists'
        });
      }
    }
    
    // Update fields
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (userId) updateData.userId = userId.toLowerCase();
    if (password) updateData.password = password;
    if (locationName) updateData.locationName = locationName;
    if (locationImage !== undefined) updateData.locationImage = locationImage;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
      subAdminId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Sub admin updated successfully',
      data: updatedSubAdmin.getPublicProfile()
    });
  } catch (error) {
    console.error('Update sub admin error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating sub admin',
      error: error.message
    });
  }
};

// DELETE /api/subadmin/:id - Delete sub admin
const deleteSubAdmin = async (req, res) => {
  try {
    const subAdminId = req.params.id;
    
    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub admin not found'
      });
    }
    
    // Deactivate all voter assignments for this sub admin
    await VoterAssignment.updateMany(
      { subAdminId },
      { isActive: false }
    );
    
    await SubAdmin.findByIdAndDelete(subAdminId);
    
    res.json({
      success: true,
      message: 'Sub admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete sub admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sub admin',
      error: error.message
    });
  }
};

// DELETE /api/subadmin - Delete all sub admins (for testing/reset)
const deleteAllSubAdmins = async (req, res) => {
  try {
    // Deactivate all voter assignments
    await VoterAssignment.updateMany({}, { isActive: false });
    
    const result = await SubAdmin.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} sub admins`
    });
  } catch (error) {
    console.error('Delete all sub admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all sub admins',
      error: error.message
    });
  }
};

// POST /api/subadmin/login - Sub admin login
const loginSubAdmin = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    // Validate required fields
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }
    
    // Find sub admin by userId
    const subAdmin = await SubAdmin.findOne({ userId: userId.toLowerCase() });
    if (!subAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID or password'
      });
    }
    
    // Check if sub admin is active
    if (!subAdmin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Compare password
    const isPasswordValid = await subAdmin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID or password'
      });
    }
    
    // Update last login
    subAdmin.lastLogin = new Date();
    await subAdmin.save();
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        subAdminId: subAdmin._id,
        userId: subAdmin.userId,
        type: 'subadmin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        subAdmin: subAdmin.getPublicProfile()
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

// GET /api/subadmin/:id/assigned-voters - Get assigned voters for sub admin
const getAssignedVoters = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, voterType, sortBy = 'assignedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = { subAdminId: id, isActive: true };
    if (voterType) filter.voterType = voterType;
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [assignments, totalCount] = await Promise.all([
      VoterAssignment.find(filter)
        .populate('voterId')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VoterAssignment.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: assignments,
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
    console.error('Get assigned voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned voters',
      error: error.message
    });
  }
};

// GET /api/subadmin/:id/stats - Get sub admin statistics
const getSubAdminStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [
      totalAssignments,
      voterAssignments,
      voterFourAssignments,
      recentAssignments
    ] = await Promise.all([
      VoterAssignment.countDocuments({ subAdminId: id, isActive: true }),
      VoterAssignment.countDocuments({ subAdminId: id, voterType: 'Voter', isActive: true }),
      VoterAssignment.countDocuments({ subAdminId: id, voterType: 'VoterFour', isActive: true }),
      VoterAssignment.find({ subAdminId: id, isActive: true })
        .sort({ assignedAt: -1 })
        .limit(5)
        .populate('assignedBy', 'email')
        .lean()
    ]);
    
    res.json({
      success: true,
      data: {
        totalAssignments,
        voterAssignments,
        voterFourAssignments,
        recentAssignments
      }
    });
  } catch (error) {
    console.error('Get sub admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub admin statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubAdmins,
  getSubAdminById,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  deleteAllSubAdmins,
  loginSubAdmin,
  getAssignedVoters,
  getSubAdminStats
};
