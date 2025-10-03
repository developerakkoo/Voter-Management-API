const VoterFour = require('../models/VoterFour');

// GET /api/voterfour - Get all VoterFour records with pagination, filtering, and search
const getAllVoterFour = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isPaid, 
      isVisited, 
      isActive,
      sourceFile,
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
    if (sourceFile) filter.sourceFile = { $regex: sourceFile, $options: 'i' };
    
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
      VoterFour.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VoterFour.countDocuments(filter)
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
        sourceFile,
        search,
        nameOnly,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get all VoterFour error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching VoterFour records',
      error: error.message
    });
  }
};

// GET /api/voterfour/:id - Get VoterFour by ID
const getVoterFourById = async (req, res) => {
  try {
    const voter = await VoterFour.findById(req.params.id);
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'VoterFour not found'
      });
    }
    
    res.json({
      success: true,
      data: voter
    });
  } catch (error) {
    console.error('Get VoterFour by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching VoterFour record',
      error: error.message
    });
  }
};

// PUT /api/voterfour/:id - Update VoterFour
const updateVoterFour = async (req, res) => {
  try {
    const voterId = req.params.id;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();
    
    const voter = await VoterFour.findByIdAndUpdate(
      voterId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'VoterFour not found'
      });
    }
    
    res.json({
      success: true,
      message: 'VoterFour updated successfully',
      data: voter
    });
  } catch (error) {
    console.error('Update VoterFour error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating VoterFour',
      error: error.message
    });
  }
};

// DELETE /api/voterfour/:id - Delete VoterFour
const deleteVoterFour = async (req, res) => {
  try {
    const voterId = req.params.id;
    
    const voter = await VoterFour.findById(voterId);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'VoterFour not found'
      });
    }
    
    await VoterFour.findByIdAndDelete(voterId);
    
    res.json({
      success: true,
      message: 'VoterFour deleted successfully'
    });
  } catch (error) {
    console.error('Delete VoterFour error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting VoterFour',
      error: error.message
    });
  }
};

// DELETE /api/voterfour - Delete all VoterFour records (for testing/reset)
const deleteAllVoterFour = async (req, res) => {
  try {
    const result = await VoterFour.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} VoterFour records`
    });
  } catch (error) {
    console.error('Delete all VoterFour error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all VoterFour records',
      error: error.message
    });
  }
};

// PATCH /api/voterfour/:id/paid - Update isPaid status
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

    const voter = await VoterFour.findByIdAndUpdate(
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
        message: 'VoterFour not found'
      });
    }

    res.json({
      success: true,
      message: `VoterFour payment status updated to ${isPaid}`,
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

// PATCH /api/voterfour/:id/visited - Update isVisited status
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

    const voter = await VoterFour.findByIdAndUpdate(
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
        message: 'VoterFour not found'
      });
    }

    res.json({
      success: true,
      message: `VoterFour visit status updated to ${isVisited}`,
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

// PATCH /api/voterfour/:id/status - Update both isPaid and isVisited status
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

    const voter = await VoterFour.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'VoterFour not found'
      });
    }

    res.json({
      success: true,
      message: 'VoterFour status updated successfully',
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

// GET /api/voterfour/stats - Get statistics for isPaid and isVisited
const getVoterFourStats = async (req, res) => {
  try {
    const [
      totalVoters,
      paidVoters,
      visitedVoters,
      paidAndVisited,
      unpaidVoters,
      unvisitedVoters
    ] = await Promise.all([
      VoterFour.countDocuments(),
      VoterFour.countDocuments({ isPaid: true }),
      VoterFour.countDocuments({ isVisited: true }),
      VoterFour.countDocuments({ isPaid: true, isVisited: true }),
      VoterFour.countDocuments({ isPaid: false }),
      VoterFour.countDocuments({ isVisited: false })
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
    console.error('Get voterfour stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching VoterFour statistics',
      error: error.message
    });
  }
};

// GET /api/voterfour/search - Search VoterFour by Voter Name Eng
const searchVoterFour = async (req, res) => {
  try {
    const {
      q,
      isPaid,
      isVisited,
      isActive,
      sourceFile,
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
    if (sourceFile) searchFilter.sourceFile = { $regex: sourceFile, $options: 'i' };

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Search VoterFour records
    const voters = await VoterFour.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await VoterFour.countDocuments(searchFilter);
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
        sourceFile,
        nameOnly,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search VoterFour error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching VoterFour records',
      error: error.message
    });
  }
};

module.exports = {
  getAllVoterFour,
  getVoterFourById,
  updateVoterFour,
  deleteVoterFour,
  deleteAllVoterFour,
  updatePaidStatus,
  updateVisitedStatus,
  updateStatus,
  getVoterFourStats,
  searchVoterFour
};
