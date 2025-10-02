const VoterAssignment = require('../models/VoterAssignment');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// GET /api/subadmin/voters - Get assigned voters for sub admin
const getAssignedVoters = async (req, res) => {
  try {
    const subAdminId = req.subAdminId;
    const { 
      page = 1, 
      limit = 20, 
      voterType, 
      isPaid, 
      isVisited,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria for assignments
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType) assignmentFilter.voterType = voterType;
    
    // Get assignments with voter data
    const assignments = await VoterAssignment.find(assignmentFilter)
      .populate({
        path: 'voterId',
        match: {
          ...(isPaid !== undefined && { isPaid: isPaid === 'true' }),
          ...(isVisited !== undefined && { isVisited: isVisited === 'true' })
        }
      })
      .lean();
    
    // Filter out assignments where voter was not found or doesn't match criteria
    const validAssignments = assignments.filter(assignment => assignment.voterId);
    
    // Sort assignments
    validAssignments.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Apply pagination
    const totalCount = validAssignments.length;
    const paginatedAssignments = validAssignments.slice(skip, skip + parseInt(limit));
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedAssignments,
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

// GET /api/subadmin/voters/:voterId/:voterType - Get specific assigned voter
const getAssignedVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    }).populate('voterId');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found or not assigned to you'
      });
    }
    
    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assigned voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned voter',
      error: error.message
    });
  }
};

// PUT /api/subadmin/voters/:voterId/:voterType - Update assigned voter
const updateAssignedVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;
    const updateData = req.body;
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found or not assigned to you'
      });
    }
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();
    
    const updatedVoter = await VoterModel.findByIdAndUpdate(
      voterId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedVoter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Voter updated successfully',
      data: updatedVoter
    });
  } catch (error) {
    console.error('Update assigned voter error:', error);
    
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

// PATCH /api/subadmin/voters/:voterId/:voterType/paid - Update payment status
const updateAssignedVoterPaidStatus = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;
    const { isPaid } = req.body;
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found or not assigned to you'
      });
    }
    
    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPaid must be a boolean value'
      });
    }
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    const voter = await VoterModel.findByIdAndUpdate(
      voterId,
      { 
        isPaid,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );
    
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
    console.error('Update assigned voter paid status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

// PATCH /api/subadmin/voters/:voterId/:voterType/visited - Update visit status
const updateAssignedVoterVisitedStatus = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;
    const { isVisited } = req.body;
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found or not assigned to you'
      });
    }
    
    if (typeof isVisited !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisited must be a boolean value'
      });
    }
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    const voter = await VoterModel.findByIdAndUpdate(
      voterId,
      { 
        isVisited,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );
    
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
    console.error('Update assigned voter visited status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visit status',
      error: error.message
    });
  }
};

// PATCH /api/subadmin/voters/:voterId/:voterType/status - Update both statuses
const updateAssignedVoterStatus = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;
    const { isPaid, isVisited } = req.body;
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found or not assigned to you'
      });
    }
    
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
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    const voter = await VoterModel.findByIdAndUpdate(
      voterId,
      updateData,
      { new: true, runValidators: true }
    );
    
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
    console.error('Update assigned voter status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// GET /api/subadmin/voters/search - Search assigned voters with advanced filtering
const searchAssignedVoters = async (req, res) => {
  try {
    const subAdminId = req.subAdminId;
    const {
      q, // search query
      'Voter Name Eng': voterNameEng,
      'Voter Name': voterName,
      'Relative Name Eng': relativeNameEng,
      'Relative Name': relativeName,
      AC,
      Part,
      'Booth no': boothNo,
      CardNo,
      CodeNo,
      Address,
      'Address Eng': addressEng,
      Booth,
      'Booth Eng': boothEng,
      Sex,
      Age,
      sourceFile,
      voterType,
      isPaid,
      isVisited,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build assignment filter
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType) assignmentFilter.voterType = voterType;
    
    // Get assignments with voter data
    const assignments = await VoterAssignment.find(assignmentFilter)
      .populate({
        path: 'voterId',
        match: {
          // Text search across multiple fields
          ...(q && {
            $or: [
              { 'Voter Name Eng': { $regex: q, $options: 'i' } },
              { 'Voter Name': { $regex: q, $options: 'i' } },
              { 'Relative Name Eng': { $regex: q, $options: 'i' } },
              { 'Relative Name': { $regex: q, $options: 'i' } },
              { Address: { $regex: q, $options: 'i' } },
              { 'Address Eng': { $regex: q, $options: 'i' } },
              { Booth: { $regex: q, $options: 'i' } },
              { 'Booth Eng': { $regex: q, $options: 'i' } }
            ]
          }),
          // Specific field searches
          ...(voterNameEng && { 'Voter Name Eng': { $regex: voterNameEng, $options: 'i' } }),
          ...(voterName && { 'Voter Name': { $regex: voterName, $options: 'i' } }),
          ...(relativeNameEng && { 'Relative Name Eng': { $regex: relativeNameEng, $options: 'i' } }),
          ...(relativeName && { 'Relative Name': { $regex: relativeName, $options: 'i' } }),
          ...(AC && { AC: { $regex: AC, $options: 'i' } }),
          ...(Part && { Part: { $regex: Part, $options: 'i' } }),
          ...(boothNo && { 'Booth no': { $regex: boothNo, $options: 'i' } }),
          ...(CardNo && { CardNo: { $regex: CardNo, $options: 'i' } }),
          ...(CodeNo && { CodeNo: { $regex: CodeNo, $options: 'i' } }),
          ...(Address && { Address: { $regex: Address, $options: 'i' } }),
          ...(addressEng && { 'Address Eng': { $regex: addressEng, $options: 'i' } }),
          ...(Booth && { Booth: { $regex: Booth, $options: 'i' } }),
          ...(boothEng && { 'Booth Eng': { $regex: boothEng, $options: 'i' } }),
          ...(Sex && { Sex: { $regex: Sex, $options: 'i' } }),
          ...(Age && { Age: parseInt(Age) }),
          ...(sourceFile && { sourceFile: { $regex: sourceFile, $options: 'i' } }),
          ...(isPaid !== undefined && { isPaid: isPaid === 'true' }),
          ...(isVisited !== undefined && { isVisited: isVisited === 'true' }),
          ...(isActive !== undefined && { isActive: isActive === 'true' })
        }
      })
      .lean();
    
    // Filter out assignments where voter was not found or doesn't match criteria
    const validAssignments = assignments.filter(assignment => assignment.voterId);
    
    // Sort assignments
    validAssignments.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'assignedAt') {
        aValue = new Date(a.assignedAt);
        bValue = new Date(b.assignedAt);
      } else if (sortBy.startsWith('voterId.')) {
        const field = sortBy.replace('voterId.', '');
        aValue = a.voterId[field];
        bValue = b.voterId[field];
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Apply pagination
    const totalCount = validAssignments.length;
    const paginatedAssignments = validAssignments.slice(skip, skip + parseInt(limit));
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedAssignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      searchCriteria: {
        query: q || null,
        filters: {
          voterNameEng,
          voterName,
          relativeNameEng,
          relativeName,
          AC,
          Part,
          boothNo,
          CardNo,
          CodeNo,
          Address,
          addressEng,
          Booth,
          boothEng,
          Sex,
          Age,
          sourceFile,
          voterType,
          isPaid,
          isVisited,
          isActive
        }
      }
    });
  } catch (error) {
    console.error('Search assigned voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching assigned voters',
      error: error.message
    });
  }
};

// GET /api/subadmin/voters/filter - Get assigned voters with advanced filtering
const filterAssignedVoters = async (req, res) => {
  try {
    const subAdminId = req.subAdminId;
    const {
      voterType,
      isPaid,
      isVisited,
      isActive,
      ageRange,
      gender,
      location,
      sourceFile,
      assignedDateFrom,
      assignedDateTo,
      page = 1,
      limit = 20,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build assignment filter
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType) assignmentFilter.voterType = voterType;
    if (assignedDateFrom || assignedDateTo) {
      assignmentFilter.assignedAt = {};
      if (assignedDateFrom) assignmentFilter.assignedAt.$gte = new Date(assignedDateFrom);
      if (assignedDateTo) assignmentFilter.assignedAt.$lte = new Date(assignedDateTo);
    }
    
    // Build voter filter
    const voterFilter = {};
    if (isPaid !== undefined) voterFilter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) voterFilter.isVisited = isVisited === 'true';
    if (isActive !== undefined) voterFilter.isActive = isActive === 'true';
    if (gender) voterFilter.Sex = { $regex: gender, $options: 'i' };
    if (sourceFile) voterFilter.sourceFile = { $regex: sourceFile, $options: 'i' };
    if (location) {
      voterFilter.$or = [
        { Address: { $regex: location, $options: 'i' } },
        { 'Address Eng': { $regex: location, $options: 'i' } },
        { Booth: { $regex: location, $options: 'i' } },
        { 'Booth Eng': { $regex: location, $options: 'i' } }
      ];
    }
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(Number);
      if (minAge && maxAge) {
        voterFilter.Age = { $gte: minAge, $lte: maxAge };
      } else if (minAge) {
        voterFilter.Age = { $gte: minAge };
      } else if (maxAge) {
        voterFilter.Age = { $lte: maxAge };
      }
    }
    
    // Get assignments with voter data
    const assignments = await VoterAssignment.find(assignmentFilter)
      .populate({
        path: 'voterId',
        match: voterFilter
      })
      .lean();
    
    // Filter out assignments where voter was not found or doesn't match criteria
    const validAssignments = assignments.filter(assignment => assignment.voterId);
    
    // Sort assignments
    validAssignments.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'assignedAt') {
        aValue = new Date(a.assignedAt);
        bValue = new Date(b.assignedAt);
      } else if (sortBy.startsWith('voterId.')) {
        const field = sortBy.replace('voterId.', '');
        aValue = a.voterId[field];
        bValue = b.voterId[field];
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Apply pagination
    const totalCount = validAssignments.length;
    const paginatedAssignments = validAssignments.slice(skip, skip + parseInt(limit));
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedAssignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filterCriteria: {
        voterType,
        isPaid,
        isVisited,
        isActive,
        ageRange,
        gender,
        location,
        sourceFile,
        assignedDateFrom,
        assignedDateTo
      }
    });
  } catch (error) {
    console.error('Filter assigned voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering assigned voters',
      error: error.message
    });
  }
};

// GET /api/subadmin/voters/stats - Get statistics for assigned voters
const getAssignedVotersStats = async (req, res) => {
  try {
    const subAdminId = req.subAdminId;
    
    // Get all assignments for this sub admin
    const assignments = await VoterAssignment.find({
      subAdminId,
      isActive: true
    }).populate('voterId');
    
    // Separate by voter type
    const voterAssignments = assignments.filter(a => a.voterType === 'Voter');
    const voterFourAssignments = assignments.filter(a => a.voterType === 'VoterFour');
    
    // Calculate statistics
    const voterStats = {
      total: voterAssignments.length,
      paid: voterAssignments.filter(a => a.voterId && a.voterId.isPaid).length,
      visited: voterAssignments.filter(a => a.voterId && a.voterId.isVisited).length,
      paidAndVisited: voterAssignments.filter(a => a.voterId && a.voterId.isPaid && a.voterId.isVisited).length
    };
    
    const voterFourStats = {
      total: voterFourAssignments.length,
      paid: voterFourAssignments.filter(a => a.voterId && a.voterId.isPaid).length,
      visited: voterFourAssignments.filter(a => a.voterId && a.voterId.isVisited).length,
      paidAndVisited: voterFourAssignments.filter(a => a.voterId && a.voterId.isPaid && a.voterId.isVisited).length
    };
    
    const totalStats = {
      total: assignments.length,
      paid: assignments.filter(a => a.voterId && a.voterId.isPaid).length,
      visited: assignments.filter(a => a.voterId && a.voterId.isVisited).length,
      paidAndVisited: assignments.filter(a => a.voterId && a.voterId.isPaid && a.voterId.isVisited).length
    };
    
    res.json({
      success: true,
      data: {
        total: totalStats,
        voter: voterStats,
        voterFour: voterFourStats
      }
    });
  } catch (error) {
    console.error('Get assigned voters stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned voters statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAssignedVoters,
  getAssignedVoter,
  updateAssignedVoter,
  updateAssignedVoterPaidStatus,
  updateAssignedVoterVisitedStatus,
  updateAssignedVoterStatus,
  getAssignedVotersStats,
  searchAssignedVoters,
  filterAssignedVoters
};
