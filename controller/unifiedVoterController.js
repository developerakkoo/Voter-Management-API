const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

/**
 * POST /api/unified-voter - Create a voter in either Voter or VoterFour collection
 * This controller handles both voter types with a single endpoint
 */
const createVoter = async (req, res) => {
  try {
    const { voterType, voterData } = req.body;
    
    // Validate required fields
    if (!voterType) {
      return res.status(400).json({
        success: false,
        message: 'voterType is required (must be "Voter" or "VoterFour")'
      });
    }
    
    if (!voterData) {
      return res.status(400).json({
        success: false,
        message: 'voterData is required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Validate required voter data fields
    if (!voterData['Voter Name Eng']) {
      return res.status(400).json({
        success: false,
        message: 'Voter Name Eng is required in voterData'
      });
    }
    
    // Select the appropriate model based on voterType
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Create the voter
    const newVoter = new VoterModel(voterData);
    await newVoter.save();
    
    res.status(201).json({
      success: true,
      message: `${voterType} created successfully`,
      data: {
        voterId: newVoter._id,
        voterType: voterType,
        voterData: newVoter
      }
    });
    
  } catch (error) {
    console.error('Create voter error:', error);
    
    // Handle duplicate CardNo/CodeNo error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A voter with this ${field} already exists`,
        error: error.message
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating voter',
      error: error.message
    });
  }
};

/**
 * GET /api/unified-voter/:voterId/:voterType - Get a voter from either collection
 */
const getVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Find the voter
    const voter = await VoterModel.findById(voterId);
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: `${voterType} not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        voterId: voter._id,
        voterType: voterType,
        voterData: voter
      }
    });
    
  } catch (error) {
    console.error('Get voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter',
      error: error.message
    });
  }
};

/**
 * PUT /api/unified-voter/:voterId/:voterType - Update a voter in either collection
 */
const updateVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const { voterData } = req.body;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    if (!voterData) {
      return res.status(400).json({
        success: false,
        message: 'voterData is required'
      });
    }
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Update the voter
    const updatedVoter = await VoterModel.findByIdAndUpdate(
      voterId,
      { ...voterData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedVoter) {
      return res.status(404).json({
        success: false,
        message: `${voterType} not found`
      });
    }
    
    res.json({
      success: true,
      message: `${voterType} updated successfully`,
      data: {
        voterId: updatedVoter._id,
        voterType: voterType,
        voterData: updatedVoter
      }
    });
    
  } catch (error) {
    console.error('Update voter error:', error);
    
    // Handle duplicate CardNo/CodeNo error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A voter with this ${field} already exists`,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating voter',
      error: error.message
    });
  }
};

/**
 * DELETE /api/unified-voter/:voterId/:voterType - Delete a voter from either collection
 */
const deleteVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Delete the voter
    const deletedVoter = await VoterModel.findByIdAndDelete(voterId);
    
    if (!deletedVoter) {
      return res.status(404).json({
        success: false,
        message: `${voterType} not found`
      });
    }
    
    res.json({
      success: true,
      message: `${voterType} deleted successfully`,
      data: {
        voterId: deletedVoter._id,
        voterType: voterType
      }
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

/**
 * POST /api/unified-voter/search - Search voters in both collections
 */
const searchVoters = async (req, res) => {
  try {
    const {
      voterType = 'all', // 'all', 'Voter', or 'VoterFour'
      search,
      page = 1,
      limit = 20,
      isPaid,
      isVisited,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.body;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isPaid !== undefined) filter.isPaid = isPaid;
    if (isVisited !== undefined) filter.isVisited = isVisited;
    
    // Add search filter
    if (search) {
      filter.$or = [
        { 'Voter Name Eng': { $regex: search, $options: 'i' } },
        { 'Voter Name': { $regex: search, $options: 'i' } },
        { 'Relative Name Eng': { $regex: search, $options: 'i' } },
        { 'Relative Name': { $regex: search, $options: 'i' } },
        { 'CardNo': { $regex: search, $options: 'i' } },
        { 'CodeNo': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    let results = [];
    let totalCount = 0;
    
    if (voterType === 'all' || voterType === 'Voter') {
      const [voters, voterCount] = await Promise.all([
        Voter.find(filter)
          .sort(sortOptions)
          .skip(voterType === 'all' ? 0 : skip)
          .limit(voterType === 'all' ? parseInt(limit) / 2 : parseInt(limit))
          .lean(),
        Voter.countDocuments(filter)
      ]);
      
      results = results.concat(voters.map(v => ({
        voterId: v._id,
        voterType: 'Voter',
        voterData: v
      })));
      
      totalCount += voterCount;
    }
    
    if (voterType === 'all' || voterType === 'VoterFour') {
      const [votersFour, voterFourCount] = await Promise.all([
        VoterFour.find(filter)
          .sort(sortOptions)
          .skip(voterType === 'all' ? 0 : skip)
          .limit(voterType === 'all' ? parseInt(limit) / 2 : parseInt(limit))
          .lean(),
        VoterFour.countDocuments(filter)
      ]);
      
      results = results.concat(votersFour.map(v => ({
        voterId: v._id,
        voterType: 'VoterFour',
        voterData: v
      })));
      
      totalCount += voterFourCount;
    }
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        voterType,
        search,
        isPaid,
        isVisited,
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

/**
 * POST /api/unified-voter/bulk - Create multiple voters at once
 * Supports bulk creation in either Voter or VoterFour collection
 */
const createMultipleVoters = async (req, res) => {
  try {
    const { voterType, voters } = req.body;
    
    // Validate required fields
    if (!voterType) {
      return res.status(400).json({
        success: false,
        message: 'voterType is required (must be "Voter" or "VoterFour")'
      });
    }
    
    if (!voters || !Array.isArray(voters) || voters.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'voters array is required and must contain at least one voter'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Validate that all voters have required fields
    const missingNameIndexes = [];
    voters.forEach((voter, index) => {
      if (!voter['Voter Name Eng']) {
        missingNameIndexes.push(index);
      }
    });
    
    if (missingNameIndexes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some voters are missing "Voter Name Eng"',
        invalidIndexes: missingNameIndexes
      });
    }
    
    // Select the appropriate model based on voterType
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Track results
    const results = {
      successful: [],
      failed: []
    };
    
    // Insert voters one by one to handle duplicates gracefully
    for (let i = 0; i < voters.length; i++) {
      try {
        const newVoter = new VoterModel(voters[i]);
        const savedVoter = await newVoter.save();
        
        results.successful.push({
          index: i,
          voterId: savedVoter._id,
          voterName: savedVoter['Voter Name Eng']
        });
      } catch (error) {
        let errorMessage = error.message;
        
        // Handle duplicate key error
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          errorMessage = `Duplicate ${field}: ${voters[i][field]}`;
        }
        
        results.failed.push({
          index: i,
          voterName: voters[i]['Voter Name Eng'],
          error: errorMessage
        });
      }
    }
    
    // Determine response status
    const statusCode = results.failed.length === 0 ? 201 : 
                       results.successful.length === 0 ? 400 : 207; // 207 = Multi-Status
    
    res.status(statusCode).json({
      success: results.failed.length === 0,
      message: `Processed ${voters.length} voters: ${results.successful.length} successful, ${results.failed.length} failed`,
      data: {
        voterType,
        totalProcessed: voters.length,
        successfulCount: results.successful.length,
        failedCount: results.failed.length,
        successful: results.successful,
        failed: results.failed
      }
    });
    
  } catch (error) {
    console.error('Create multiple voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating multiple voters',
      error: error.message
    });
  }
};

module.exports = {
  createVoter,
  createMultipleVoters,
  getVoter,
  updateVoter,
  deleteVoter,
  searchVoters
};

