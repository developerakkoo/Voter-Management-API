const User = require('../models/User');

// GET /api/user - Get all users with pagination, search, sort, and filter
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      pno,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    
    if (pno) {
      filter.pno = pno;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Get statistics
    const stats = await User.getUserStats();

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      statistics: stats,
      filters: {
        search,
        pno,
        isActive,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// GET /api/user/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// POST /api/user - Create new user
const createUser = async (req, res) => {
  try {
    const {
      userId,
      password,
      pno,
      fullName,
      email,
      phone,
      address,
      isActive = true,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!userId || !password || !pno || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'userId, password, pno, and fullName are required'
      });
    }

    // Validate PNO
    if (!['3', '4'].includes(pno)) {
      return res.status(400).json({
        success: false,
        message: 'PNO must be either 3 or 4'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUserId(userId);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this userId already exists'
      });
    }

    // Create new user
    const user = new User({
      userId: userId.toLowerCase(),
      password,
      pno,
      fullName,
      email,
      phone,
      address,
      isActive,
      metadata
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// PUT /api/user/:id - Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userId,
      password,
      pno,
      fullName,
      email,
      phone,
      address,
      isActive,
      metadata
    } = req.body;

    // Validate PNO if provided
    if (pno && !['3', '4'].includes(pno)) {
      return res.status(400).json({
        success: false,
        message: 'PNO must be either 3 or 4'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if userId is being changed and if it already exists
    if (userId && userId.toLowerCase() !== user.userId) {
      const existingUser = await User.findByUserId(userId);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this userId already exists'
        });
      }
    }

    // Update user fields
    const updateData = {};
    if (userId) updateData.userId = userId.toLowerCase();
    if (password) updateData.password = password;
    if (pno) updateData.pno = pno;
    if (fullName) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (metadata !== undefined) updateData.metadata = metadata;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// DELETE /api/user/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        userId: user.userId,
        fullName: user.fullName,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// DELETE /api/user - Delete all users
const deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    
    res.json({
      success: true,
      message: 'All users deleted successfully',
      data: {
        deletedCount: result.deletedCount,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Delete all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all users',
      error: error.message
    });
  }
};

// POST /api/user/login - User login
const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate required fields
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'userId and password are required'
      });
    }

    // Find user by userId
    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update login information
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        loginInfo: {
          lastLogin: user.lastLogin,
          loginCount: user.loginCount
        }
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// GET /api/user/search - Search users
const searchUsers = async (req, res) => {
  try {
    const {
      q,
      pno,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = {
      $or: [
        { userId: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ]
    };

    // Add additional filters
    if (pno) {
      searchFilter.pno = pno;
    }
    
    if (isActive !== undefined) {
      searchFilter.isActive = isActive === 'true';
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Search users
    const users = await User.find(searchFilter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalCount = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      searchCriteria: {
        query: q,
        pno,
        isActive,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};

// GET /api/user/stats - Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// GET /api/user/pno/:pno - Get users by PNO
const getUsersByPno = async (req, res) => {
  try {
    const { pno } = req.params;
    const { page = 1, limit = 20, isActive } = req.query;

    // Validate PNO
    if (!['3', '4'].includes(pno)) {
      return res.status(400).json({
        success: false,
        message: 'PNO must be either 3 or 4'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { pno };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filter: {
        pno,
        isActive
      }
    });
  } catch (error) {
    console.error('Get users by PNO error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by PNO',
      error: error.message
    });
  }
};

module.exports = {
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
};
