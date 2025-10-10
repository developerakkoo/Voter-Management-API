const VoterAssignment = require('../models/VoterAssignment');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// GET /api/subadmin/voters - Get assigned voters for sub admin with advanced search
const getAssignedVoters = async (req, res) => {
  try {
    const subAdminId = req.subAdminId;
    const { 
      page = 1, 
      limit = 20, 
      voterType, 
      isPaid, 
      isVisited,
      search,
      q,
      nameOnly,
      AC,
      Part,
      Booth,
      Sex,
      ageMin,
      ageMax,
      CardNo,
      CodeNo,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = search || q;
    
    // Build filter criteria for assignments
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType) assignmentFilter.voterType = voterType;
    
    // Get all assignments for this sub-admin first
    const allAssignments = await VoterAssignment.find(assignmentFilter).lean();
    
    if (allAssignments.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: parseInt(limit)
        }
      });
    }
    
    // Group voter IDs by type
    const voterIdsByType = { Voter: [], VoterFour: [] };
    allAssignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        voterIdsByType.Voter.push(assignment.voterId);
      } else if (assignment.voterType === 'VoterFour') {
        voterIdsByType.VoterFour.push(assignment.voterId);
      }
    });
    
    // Build voter filter with advanced search
    const buildVoterFilter = (voterIds) => {
      const voterFilter = { _id: { $in: voterIds } };
      
      // Status filters
      if (isPaid !== undefined) voterFilter.isPaid = isPaid === 'true';
      if (isVisited !== undefined) voterFilter.isVisited = isVisited === 'true';
      
      // Advanced search
      if (searchTerm) {
        if (nameOnly === 'true') {
          // Search only in name fields
          voterFilter.$or = [
            { 'Voter Name Eng': { $regex: searchTerm, $options: 'i' } },
            { 'Voter Name': { $regex: searchTerm, $options: 'i' } },
            { 'Relative Name Eng': { $regex: searchTerm, $options: 'i' } },
            { 'Relative Name': { $regex: searchTerm, $options: 'i' } }
          ];
        } else {
          // Search in all fields
          voterFilter.$or = [
            { 'Voter Name Eng': { $regex: searchTerm, $options: 'i' } },
            { 'Voter Name': { $regex: searchTerm, $options: 'i' } },
            { 'Relative Name Eng': { $regex: searchTerm, $options: 'i' } },
            { 'Relative Name': { $regex: searchTerm, $options: 'i' } },
            { 'Address': { $regex: searchTerm, $options: 'i' } },
            { 'Address Eng': { $regex: searchTerm, $options: 'i' } },
            { 'Booth': { $regex: searchTerm, $options: 'i' } },
            { 'Booth Eng': { $regex: searchTerm, $options: 'i' } },
            { 'CardNo': { $regex: searchTerm, $options: 'i' } },
            { 'CodeNo': { $regex: searchTerm, $options: 'i' } }
          ];
        }
      }
      
      // Specific field filters
      if (AC) voterFilter.AC = { $regex: AC, $options: 'i' };
      if (Part) voterFilter.Part = { $regex: Part, $options: 'i' };
      if (Booth) voterFilter.Booth = { $regex: Booth, $options: 'i' };
      if (Sex) voterFilter.Sex = Sex;
      if (CardNo) voterFilter.CardNo = { $regex: CardNo, $options: 'i' };
      if (CodeNo) voterFilter.CodeNo = { $regex: CodeNo, $options: 'i' };
      
      // Age range filter
      if (ageMin || ageMax) {
        voterFilter.Age = {};
        if (ageMin) voterFilter.Age.$gte = parseInt(ageMin);
        if (ageMax) voterFilter.Age.$lte = parseInt(ageMax);
      }
      
      return voterFilter;
    };
    
    // Fetch voters from both collections
    const [voters, votersFour] = await Promise.all([
      voterIdsByType.Voter.length > 0
        ? Voter.find(buildVoterFilter(voterIdsByType.Voter)).lean()
        : [],
      voterIdsByType.VoterFour.length > 0
        ? VoterFour.find(buildVoterFilter(voterIdsByType.VoterFour)).lean()
        : []
    ]);
    
    // Create assignment map
    const assignmentMap = {};
    allAssignments.forEach(assignment => {
      assignmentMap[assignment.voterId.toString()] = {
        assignmentId: assignment._id,
        assignedAt: assignment.assignedAt,
        notes: assignment.notes,
        voterType: assignment.voterType
      };
    });
    
    // Combine voters with assignment data
    const combinedResults = [
      ...voters.map(v => ({
        ...v,
        voterType: 'Voter',
        assignmentInfo: assignmentMap[v._id.toString()]
      })),
      ...votersFour.map(v => ({
        ...v,
        voterType: 'VoterFour',
        assignmentInfo: assignmentMap[v._id.toString()]
      }))
    ];
    
    // Sort by the specified field
    combinedResults.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'assignedAt') {
        aValue = a.assignmentInfo?.assignedAt;
        bValue = b.assignmentInfo?.assignedAt;
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
    const totalCount = combinedResults.length;
    const paginatedResults = combinedResults.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedResults,
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
    
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const subAdminObjectId = new mongoose.Types.ObjectId(subAdminId);
    const voterObjectId = new mongoose.Types.ObjectId(voterId);
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId: subAdminObjectId,
      voterId: voterObjectId,
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
    
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const subAdminObjectId = new mongoose.Types.ObjectId(subAdminId);
    const voterObjectId = new mongoose.Types.ObjectId(voterId);
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId: subAdminObjectId,
      voterId: voterObjectId,
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
      voterObjectId,
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
    
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const subAdminObjectId = new mongoose.Types.ObjectId(subAdminId);
    const voterObjectId = new mongoose.Types.ObjectId(voterId);
    
 
    
    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPaid must be a boolean value'
      });
    }
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    const voter = await VoterModel.findByIdAndUpdate(
      voterObjectId,
      { 
        isPaid,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter record not found in database'
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
    
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const subAdminObjectId = new mongoose.Types.ObjectId(subAdminId);
    const voterObjectId = new mongoose.Types.ObjectId(voterId);
    

    
    if (typeof isVisited !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisited must be a boolean value'
      });
    }
    
    // Update voter based on type
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    const voter = await VoterModel.findByIdAndUpdate(
      voterObjectId,
      { 
        isVisited,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter record not found in database'
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
    
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const subAdminObjectId = new mongoose.Types.ObjectId(subAdminId);
    const voterObjectId = new mongoose.Types.ObjectId(voterId);
    
    // Check if voter is assigned to this sub admin
    const assignment = await VoterAssignment.findOne({
      subAdminId: subAdminObjectId,
      voterId: voterObjectId,
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
      voterObjectId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter record not found in database'
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

// GET /api/subadmin/voters/map-data - Get assigned voters with completed surveys for map plotting
const getAssignedVotersMapData = async (req, res) => {
  try {
    // Get subAdminId from either auth middleware or query parameter
    const subAdminId = req.subAdminId || req.query.subAdminId;
    const { 
      voterType = 'all',
      includeMembers = 'true',
      limit = 1000
    } = req.query;
    
    // Validate subAdminId
    if (!subAdminId) {
      return res.status(400).json({
        success: false,
        message: 'subAdminId is required (provide as query parameter or use authentication)'
      });
    }
    
    const Survey = require('../models/Survey');
    
    // Build assignment filter
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType !== 'all') {
      assignmentFilter.voterType = voterType;
    }
    
    // Get all assignments for this sub-admin
    const assignments = await VoterAssignment.find(assignmentFilter)
      .select('voterId voterType')
      .lean();
    
    if (assignments.length === 0) {
      return res.json({
        success: true,
        data: [],
        meta: {
          totalVoters: 0,
          totalSurveys: 0,
          message: 'No voters assigned to this sub-admin'
        }
      });
    }
    
    // Group voter IDs by type
    const voterIdsByType = { Voter: [], VoterFour: [] };
    assignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        voterIdsByType.Voter.push(assignment.voterId);
      } else if (assignment.voterType === 'VoterFour') {
        voterIdsByType.VoterFour.push(assignment.voterId);
      }
    });
    
    const allVoterIds = [...voterIdsByType.Voter, ...voterIdsByType.VoterFour];
    
    // Build survey filter - NO status filter, just get all surveys with location
    const surveyFilter = {
      voterId: { $in: allVoterIds },
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null }
    };
    
    // Fetch surveys with location data
    const surveys = await Survey.find(surveyFilter)
      .populate('surveyorId', 'fullName userId pno')
      .limit(parseInt(limit))
      .lean();
    
    // Fetch voter data for each survey
    const mapData = [];
    
    for (const survey of surveys) {
      if (!survey.voterId || !survey.voterType) continue;
      
      const VoterModel = survey.voterType === 'Voter' ? Voter : VoterFour;
      
      try {
        const voter = await VoterModel.findById(survey.voterId).lean();
        
        if (voter) {
          const mapPoint = {
            surveyId: survey._id,
            voterId: survey.voterId,
            voterType: survey.voterType,
            voterName: voter['Voter Name Eng'] || voter['Voter Name'] || 'Unknown',
            voterNameHindi: voter['Voter Name'],
            ac: voter.AC,
            part: voter.Part,
            booth: voter.Booth || voter['Booth no'],
            phoneNumber: survey.voterPhoneNumber,
            location: {
              lat: survey.location.latitude,
              lng: survey.location.longitude,
              accuracy: survey.location.accuracy || null
            },
            surveyor: {
              id: survey.surveyorId?._id || null,
              name: survey.surveyorId?.fullName || 'Unknown',
              userId: survey.surveyorId?.userId || '',
              pno: survey.surveyorId?.pno || ''
            },
            status: survey.status,
            completedAt: survey.completedAt,
            createdAt: survey.createdAt
          };
          
          // Add members if requested
          if (includeMembers === 'true' && survey.members && survey.members.length > 0) {
            mapPoint.members = survey.members.map(member => ({
              name: member.name || '',
              age: member.age || 0,
              phoneNumber: member.phoneNumber || '',
              relationship: member.relationship || '',
              isVoter: member.isVoter || false,
              voterId: member.voterId || null,
              voterType: member.voterType || null
            }));
            mapPoint.membersCount = survey.members.length;
          } else {
            mapPoint.members = [];
            mapPoint.membersCount = 0;
          }
          
          mapData.push(mapPoint);
        }
      } catch (err) {
        console.error('Error populating voter for survey:', survey._id, err);
      }
    }
    
    res.json({
      success: true,
      data: mapData,
      meta: {
        totalVoters: assignments.length,
        totalSurveys: mapData.length,
        surveysWithLocation: mapData.length,
        filters: {
          voterType,
          includeMembers: includeMembers === 'true',
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get assigned voters map data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned voters map data',
      error: error.message
    });
  }
};

// GET /api/subadmin/voters/surveys - Get all surveys for assigned voters
const getAssignedVotersSurveys = async (req, res) => {
  try {
    // Get subAdminId from either auth middleware or query parameter
    const subAdminId = req.subAdminId || req.query.subAdminId;
    const { 
      page = 1,
      limit = 20,
      voterType = 'all',
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Validate subAdminId
    if (!subAdminId) {
      return res.status(400).json({
        success: false,
        message: 'subAdminId is required (provide as query parameter or use authentication)'
      });
    }
    
    const Survey = require('../models/Survey');
    
    // Build assignment filter
    const assignmentFilter = { subAdminId, isActive: true };
    if (voterType !== 'all') {
      assignmentFilter.voterType = voterType;
    }
    
    // Get all assignments for this sub-admin
    const assignments = await VoterAssignment.find(assignmentFilter)
      .select('voterId voterType')
      .lean();
    
    if (assignments.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: parseInt(limit)
        },
        meta: {
          totalVoters: 0,
          totalSurveys: 0,
          message: 'No voters assigned to this sub-admin'
        }
      });
    }
    
    // Group voter IDs by type
    const voterIdsByType = { Voter: [], VoterFour: [] };
    assignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        voterIdsByType.Voter.push(assignment.voterId);
      } else if (assignment.voterType === 'VoterFour') {
        voterIdsByType.VoterFour.push(assignment.voterId);
      }
    });
    
    const allVoterIds = [...voterIdsByType.Voter, ...voterIdsByType.VoterFour];
    
    // Build survey filter
    const surveyFilter = {
      voterId: { $in: allVoterIds }
    };
    
    // Add status filter if provided
    if (status) {
      surveyFilter.status = status;
    }
    
    // Add date range filter
    if (dateFrom || dateTo) {
      surveyFilter.createdAt = {};
      if (dateFrom) surveyFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) surveyFilter.createdAt.$lte = new Date(dateTo);
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Fetch surveys with pagination
    const [surveys, totalCount] = await Promise.all([
      Survey.find(surveyFilter)
        .select('voterId voterType voterPhoneNumber location status completedAt createdAt members')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Survey.countDocuments(surveyFilter)
    ]);
    
    // Fetch voter data for each survey
    const surveysWithVoterData = [];
    
    for (const survey of surveys) {
      if (!survey.voterId || !survey.voterType) continue;
      
      const VoterModel = survey.voterType === 'Voter' ? Voter : VoterFour;
      
      try {
        const voter = await VoterModel.findById(survey.voterId)
          .select({
            'Voter Name Eng': 1,
            'Voter Name': 1,
            'AC': 1,
            'Part': 1,
            'Booth': 1,
            'Booth no': 1
          })
          .lean();
        
        if (voter) {
          const surveyData = {
            surveyId: survey._id,
            voterName: voter['Voter Name Eng'] || voter['Voter Name'] || 'Unknown',
            voterNameHindi: voter['Voter Name'],
            phoneNumber: survey.voterPhoneNumber,
            location: survey.location ? {
              latitude: survey.location.latitude || null,
              longitude: survey.location.longitude || null,
              accuracy: survey.location.accuracy || null,
              address: survey.location.address || null
            } : null,
            members: survey.members ? survey.members.map(member => ({
              name: member.name || '',
              age: member.age || 0,
              phoneNumber: member.phoneNumber || '',
              relationship: member.relationship || '',
              isVoter: member.isVoter || false
            })) : [],
            membersCount: survey.members ? survey.members.length : 0,
            status: survey.status,
            completedAt: survey.completedAt,
            createdAt: survey.createdAt,
            voterDetails: {
              ac: voter.AC,
              part: voter.Part,
              booth: voter.Booth || voter['Booth no']
            }
          };
          
          surveysWithVoterData.push(surveyData);
        }
      } catch (err) {
        console.error('Error populating voter for survey:', survey._id, err);
      }
    }
    
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: surveysWithVoterData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      },
      meta: {
        totalVoters: assignments.length,
        totalSurveys: totalCount,
        filters: {
          voterType,
          status: status || 'all',
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          sortBy,
          sortOrder
        }
      }
    });
    
  } catch (error) {
    console.error('Get assigned voters surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned voters surveys',
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
  filterAssignedVoters,
  getAssignedVotersMapData,
  getAssignedVotersSurveys
};
