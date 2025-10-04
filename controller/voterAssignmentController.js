const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// GET /api/assignment/voters - Get all voters with assignment status (Admin only)
const getVotersWithAssignmentStatus = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      voterType = 'Voter',
      search,
      sortBy = 'Voter Name Eng', 
      sortOrder = 'desc',
      isActive = true,
      assignedOnly = false
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Build search filter
    let searchFilter = {};
    if (search) {
      if (voterType === 'Voter') {
        // Search fields for Voter collection
        searchFilter = {
          $or: [
            { 'Voter Name Eng': { $regex: search, $options: 'i' } },
            { 'Voter Name': { $regex: search, $options: 'i' } },
            { 'Relative Name Eng': { $regex: search, $options: 'i' } },
            { 'Relative Name': { $regex: search, $options: 'i' } },
            { 'Address': { $regex: search, $options: 'i' } },
            { 'Address Eng': { $regex: search, $options: 'i' } },
            { 'AC': { $regex: search, $options: 'i' } },
            { 'Part': { $regex: search, $options: 'i' } },
            { 'Booth': { $regex: search, $options: 'i' } }
          ]
        };
      } else {
        // Search fields for VoterFour collection
        searchFilter = {
          $or: [
            { 'Voter Name Eng': { $regex: search, $options: 'i' } },
            { 'Voter Name': { $regex: search, $options: 'i' } },
            { 'Relative Name Eng': { $regex: search, $options: 'i' } },
            { 'Relative Name': { $regex: search, $options: 'i' } },
            { 'Address': { $regex: search, $options: 'i' } },
            { 'Address Eng': { $regex: search, $options: 'i' } },
            { 'AC': { $regex: search, $options: 'i' } },
            { 'Part': { $regex: search, $options: 'i' } },
            { 'Booth': { $regex: search, $options: 'i' } }
          ]
        };
      }
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get all voters with pagination
    const [voters, totalCount] = await Promise.all([
      VoterModel.find(searchFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VoterModel.countDocuments(searchFilter)
    ]);
    
    // Get all voter IDs for assignment lookup
    const voterIds = voters.map(voter => voter._id.toString());
    
    // Get assignment information for these voters
    const assignments = await VoterAssignment.find({
      voterId: { $in: voterIds },
      voterType,
      isActive: true
    }).populate('subAdminId', 'fullName userId locationName').lean();
    
    // Create assignment lookup map
    const assignmentMap = {};
    assignments.forEach(assignment => {
      assignmentMap[assignment.voterId.toString()] = {
        isAssigned: true,
        subAdmin: assignment.subAdminId,
        assignedAt: assignment.assignedAt,
        assignmentId: assignment._id,
        notes: assignment.notes
      };
    });
    
    // Add assignment status to each voter
    const votersWithAssignment = voters.map(voter => ({
      ...voter,
      assignmentStatus: assignmentMap[voter._id.toString()] || {
        isAssigned: false,
        subAdmin: null,
        assignedAt: null,
        assignmentId: null,
        notes: null
      }
    }));
    
    // Filter by assignment status if requested
    let filteredVoters = votersWithAssignment;
    if (assignedOnly === 'true') {
      filteredVoters = votersWithAssignment.filter(voter => voter.assignmentStatus.isAssigned);
    }
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: filteredVoters,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      assignmentStats: {
        totalVoters: voters.length,
        assignedVoters: assignments.length,
        unassignedVoters: voters.length - assignments.length
      }
    });
  } catch (error) {
    console.error('Get voters with assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voters with assignment status',
      error: error.message
    });
  }
};

// GET /api/assignment - Get all assignments with filtering (Admin only)
const getAllAssignments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      voterType, 
      subAdminId,
      sortBy = 'assignedAt', 
      sortOrder = 'desc',
      isActive = true
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (voterType) filter.voterType = voterType;
    if (subAdminId) filter.subAdminId = subAdminId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [assignments, totalCount] = await Promise.all([
      VoterAssignment.find(filter)
        .populate('voterId')
        .populate('subAdminId', 'fullName userId locationName')
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
    console.error('Get all assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// DELETE /api/assignment/unassign - Unassign voters from sub admin (Admin only)
const unassignVotersFromSubAdmin = async (req, res) => {
  try {
    const { subAdminId, voterIds, voterType } = req.body;
    
    // Validate required fields
    if (!subAdminId || !voterIds || !Array.isArray(voterIds) || !voterType) {
      return res.status(400).json({
        success: false,
        message: 'Sub admin ID, voter IDs array, and voter type are required'
      });
    }
    
    // Deactivate assignments
    const result = await VoterAssignment.updateMany(
      {
        subAdminId,
        voterId: { $in: voterIds },
        voterType,
        isActive: true
      },
      { isActive: false }
    );
    
    res.json({
      success: true,
      message: `Successfully unassigned ${result.modifiedCount} voters from sub admin`,
      data: {
        subAdminId,
        unassignedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Unassign voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unassigning voters',
      error: error.message
    });
  }
};

// GET /api/assignment/subadmin/:id - Get all assignments for a sub admin (Admin only)
const getSubAdminAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, voterType, sortBy = 'assignedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = { subAdminId: id };
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
    console.error('Get sub admin assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// GET /api/assignment/voter/:voterId/:voterType - Get assignments for a specific voter (Admin only)
const getVoterAssignments = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    
    const assignments = await VoterAssignment.find({
      voterId,
      voterType,
      isActive: true
    })
    .populate('subAdminId', 'fullName userId locationName')
    .sort({ assignedAt: -1 })
    .lean();
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get voter assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter assignments',
      error: error.message
    });
  }
};

// GET /api/assignment/stats - Get assignment statistics (Admin only)
const getAssignmentStats = async (req, res) => {
  try {
    const [
      totalAssignments,
      activeAssignments,
      subAdminStats,
      voterTypeStats,
      recentAssignments
    ] = await Promise.all([
      VoterAssignment.countDocuments(),
      VoterAssignment.countDocuments({ isActive: true }),
      VoterAssignment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$subAdminId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'subadmins',
            localField: '_id',
            foreignField: '_id',
            as: 'subAdmin'
          }
        },
        {
          $unwind: '$subAdmin'
        },
        {
          $project: {
            subAdminName: '$subAdmin.fullName',
            subAdminUserId: '$subAdmin.userId',
            assignmentCount: '$count'
          }
        },
        { $sort: { assignmentCount: -1 } }
      ]),
      VoterAssignment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$voterType',
            count: { $sum: 1 }
          }
        }
      ]),
      VoterAssignment.find({ isActive: true })
        .populate('subAdminId', 'fullName userId')
        .sort({ assignedAt: -1 })
        .limit(10)
        .lean()
    ]);
    
    res.json({
      success: true,
      data: {
        totalAssignments,
        activeAssignments,
        subAdminStats,
        voterTypeStats,
        recentAssignments
      }
    });
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment statistics',
      error: error.message
    });
  }
};

// DELETE /api/assignment/:id - Delete specific assignment (Admin only)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await VoterAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    await VoterAssignment.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

module.exports = {
  getVotersWithAssignmentStatus,
  getAllAssignments,
  unassignVotersFromSubAdmin,
  getSubAdminAssignments,
  getVoterAssignments,
  getAssignmentStats,
  deleteAssignment
};
