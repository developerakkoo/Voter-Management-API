const Voter = require('../models/Voter');

// GET /api/voter - Get all voters with pagination, filtering, and search
const getAllVoters = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isPaid, 
      isVisited, 
      isActive,
      search,
      nameOnly,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) filter.isVisited = isVisited === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      if (nameOnly === 'true') {
        // Search only in name fields
        filter.$or = [
          { 'Voter Name Eng': { $regex: search, $options: 'i' } },
          { 'Voter Name': { $regex: search, $options: 'i' } },
          { 'Relative Name Eng': { $regex: search, $options: 'i' } },
          { 'Relative Name': { $regex: search, $options: 'i' } }
        ];
      } else {
        // Search in all fields
        filter.$or = [
          { 'Voter Name Eng': { $regex: search, $options: 'i' } },
          { 'Voter Name': { $regex: search, $options: 'i' } },
          { 'Relative Name Eng': { $regex: search, $options: 'i' } },
          { 'Relative Name': { $regex: search, $options: 'i' } },
          { 'Address': { $regex: search, $options: 'i' } },
          { 'Address Eng': { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [voters, totalCount] = await Promise.all([
      Voter.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Voter.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: voters,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        isPaid,
        isVisited,
        isActive,
        search,
        nameOnly,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get all voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voters',
      error: error.message
    });
  }
};

// GET /api/voter/:id - Get voter by ID
const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }
    
    res.json({
      success: true,
      data: voter
    });
  } catch (error) {
    console.error('Get voter by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter',
      error: error.message
    });
  }
};

// PUT /api/voter/:id - Update voter
const updateVoter = async (req, res) => {
  try {
    const voterId = req.params.id;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();
    
    const voter = await Voter.findByIdAndUpdate(
      voterId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Voter updated successfully',
      data: voter
    });
  } catch (error) {
    console.error('Update voter error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating voter',
      error: error.message
    });
  }
};

// DELETE /api/voter/:id - Delete voter
const deleteVoter = async (req, res) => {
  try {
    const voterId = req.params.id;
    
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }
    
    await Voter.findByIdAndDelete(voterId);
    
    res.json({
      success: true,
      message: 'Voter deleted successfully'
    });
  } catch (error) {
    console.error('Delete voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting voter',
      error: error.message
    });
  }
};

// DELETE /api/voter - Delete all voters (for testing/reset)
const deleteAllVoters = async (req, res) => {
  try {
    const result = await Voter.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} voters`
    });
  } catch (error) {
    console.error('Delete all voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all voters',
      error: error.message
    });
  }
};

// PATCH /api/voter/:id/paid - Update isPaid status
const updatePaidStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPaid must be a boolean value'
      });
    }

    const voter = await Voter.findByIdAndUpdate(
      id,
      { 
        isPaid,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      message: `Voter payment status updated to ${isPaid}`,
      data: {
        _id: voter._id,
        'Voter Name Eng': voter['Voter Name Eng'],
        isPaid: voter.isPaid,
        lastUpdated: voter.lastUpdated
      }
    });
  } catch (error) {
    console.error('Update paid status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

// PATCH /api/voter/:id/visited - Update isVisited status
const updateVisitedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisited } = req.body;

    if (typeof isVisited !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisited must be a boolean value'
      });
    }

    const voter = await Voter.findByIdAndUpdate(
      id,
      { 
        isVisited,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      message: `Voter visit status updated to ${isVisited}`,
      data: {
        _id: voter._id,
        'Voter Name Eng': voter['Voter Name Eng'],
        isVisited: voter.isVisited,
        lastUpdated: voter.lastUpdated
      }
    });
  } catch (error) {
    console.error('Update visited status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visit status',
      error: error.message
    });
  }
};

// PATCH /api/voter/:id/status - Update both isPaid and isVisited status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid, isVisited } = req.body;

    const updateData = { lastUpdated: new Date() };
    
    if (typeof isPaid === 'boolean') {
      updateData.isPaid = isPaid;
    }
    
    if (typeof isVisited === 'boolean') {
      updateData.isVisited = isVisited;
    }

    if (Object.keys(updateData).length === 1) { // Only lastUpdated
      return res.status(400).json({
        success: false,
        message: 'At least one status field (isPaid or isVisited) must be provided'
      });
    }

    const voter = await Voter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      message: 'Voter status updated successfully',
      data: {
        _id: voter._id,
        'Voter Name Eng': voter['Voter Name Eng'],
        isPaid: voter.isPaid,
        isVisited: voter.isVisited,
        lastUpdated: voter.lastUpdated
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// GET /api/voter/stats - Get statistics for isPaid and isVisited
const getVoterStats = async (req, res) => {
  try {
    const [
      totalVoters,
      paidVoters,
      visitedVoters,
      paidAndVisited,
      unpaidVoters,
      unvisitedVoters
    ] = await Promise.all([
      Voter.countDocuments(),
      Voter.countDocuments({ isPaid: true }),
      Voter.countDocuments({ isVisited: true }),
      Voter.countDocuments({ isPaid: true, isVisited: true }),
      Voter.countDocuments({ isPaid: false }),
      Voter.countDocuments({ isVisited: false })
    ]);

    res.json({
      success: true,
      data: {
        totalVoters,
        paymentStats: {
          paid: paidVoters,
          unpaid: unpaidVoters,
          paidPercentage: totalVoters > 0 ? ((paidVoters / totalVoters) * 100).toFixed(2) : 0
        },
        visitStats: {
          visited: visitedVoters,
          unvisited: unvisitedVoters,
          visitedPercentage: totalVoters > 0 ? ((visitedVoters / totalVoters) * 100).toFixed(2) : 0
        },
        combinedStats: {
          paidAndVisited,
          paidAndVisitedPercentage: totalVoters > 0 ? ((paidAndVisited / totalVoters) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get voter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter statistics',
      error: error.message
    });
  }
};

// GET /api/voter/search - Search voters by Voter Name Eng
const searchVoters = async (req, res) => {
  try {
    const {
      q,
      isPaid,
      isVisited,
      isActive,
      nameOnly,
      page = 1,
      limit = 20,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    let searchFilter = {};
    
    if (nameOnly === 'true') {
      // Search only in name fields
      searchFilter.$or = [
        { 'Voter Name Eng': { $regex: q, $options: 'i' } },
        { 'Voter Name': { $regex: q, $options: 'i' } },
        { 'Relative Name Eng': { $regex: q, $options: 'i' } },
        { 'Relative Name': { $regex: q, $options: 'i' } }
      ];
    } else {
      // Search in all fields
      searchFilter.$or = [
        { 'Voter Name Eng': { $regex: q, $options: 'i' } },
        { 'Voter Name': { $regex: q, $options: 'i' } },
        { 'Relative Name Eng': { $regex: q, $options: 'i' } },
        { 'Relative Name': { $regex: q, $options: 'i' } },
        { 'Address': { $regex: q, $options: 'i' } },
        { 'Address Eng': { $regex: q, $options: 'i' } }
      ];
    }

    // Add additional filters
    if (isPaid !== undefined) searchFilter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) searchFilter.isVisited = isVisited === 'true';
    if (isActive !== undefined) searchFilter.isActive = isActive === 'true';

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Search voters
    const voters = await Voter.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Voter.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: voters,
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
        isPaid,
        isVisited,
        isActive,
        nameOnly,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching voters',
      error: error.message
    });
  }
};

// GET /api/voter/search/all - Get all voters matching search criteria (no pagination)
const searchAllVoters = async (req, res) => {
  try {
    const {
      q,
      isPaid,
      isVisited,
      isActive,
      nameOnly,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    // Build search filter
    let searchFilter = {};
    
    if (nameOnly === 'true') {
      // Search only in name fields
      searchFilter.$or = [
        { 'Voter Name Eng': { $regex: q, $options: 'i' } },
        { 'Voter Name': { $regex: q, $options: 'i' } },
        { 'Relative Name Eng': { $regex: q, $options: 'i' } },
        { 'Relative Name': { $regex: q, $options: 'i' } }
      ];
    } else {
      // Search in all fields
      searchFilter.$or = [
        { 'Voter Name Eng': { $regex: q, $options: 'i' } },
        { 'Voter Name': { $regex: q, $options: 'i' } },
        { 'Relative Name Eng': { $regex: q, $options: 'i' } },
        { 'Relative Name': { $regex: q, $options: 'i' } },
        { 'Address': { $regex: q, $options: 'i' } },
        { 'Address Eng': { $regex: q, $options: 'i' } }
      ];
    }

    // Add additional filters
    if (isPaid !== undefined) searchFilter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) searchFilter.isVisited = isVisited === 'true';
    if (isActive !== undefined) searchFilter.isActive = isActive === 'true';

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get all matching voters (no pagination)
    const voters = await Voter.find(searchFilter)
      .sort(sortOptions)
      .lean();

    // Get total count
    const totalCount = await Voter.countDocuments(searchFilter);

    res.json({
      success: true,
      data: voters,
      totalCount,
      searchCriteria: {
        query: q,
        isPaid,
        isVisited,
        isActive,
        nameOnly,
        sortBy,
        sortOrder
      },
      warning: totalCount > 10000 ? `Large result set: ${totalCount} records. Consider using pagination for better performance.` : undefined
    });
  } catch (error) {
    console.error('Search all voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching all voters',
      error: error.message
    });
  }
};

module.exports = {
  getAllVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  deleteAllVoters,
  updatePaidStatus,
  updateVisitedStatus,
  updateStatus,
  getVoterStats,
  searchVoters,
  searchAllVoters
};
