const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// POST /api/assignment/assign - Assign voters to sub admin (Admin only)
const assignVotersToSubAdmin = async (req, res) => {
  try {
    const { subAdminId, voterIds, voterType, notes } = req.body;
    const adminId = req.adminId; // From auth middleware
    
    // Validate required fields
    if (!subAdminId || !voterIds || !Array.isArray(voterIds) || !voterType) {
      return res.status(400).json({
        success: false,
        message: 'Sub admin ID, voter IDs array, and voter type are required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'Voter type must be either "Voter" or "VoterFour"'
      });
    }
    
    // Check if sub admin exists
    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub admin not found'
      });
    }
    
    // Check if voters exist
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const existingVoters = await VoterModel.find({ _id: { $in: voterIds } });
    
    if (existingVoters.length !== voterIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some voters not found'
      });
    }
    
    // Check for existing assignments
    const existingAssignments = await VoterAssignment.find({
      subAdminId,
      voterId: { $in: voterIds },
      voterType,
      isActive: true
    });
    
    if (existingAssignments.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Some voters are already assigned to this sub admin',
        alreadyAssigned: existingAssignments.map(a => a.voterId)
      });
    }
    
    // Create assignments
    const assignments = voterIds.map(voterId => ({
      subAdminId,
      voterId,
      voterType,
      assignedBy: adminId,
      notes: notes || null
    }));
    
    const createdAssignments = await VoterAssignment.insertMany(assignments);
    
    res.status(201).json({
      success: true,
      message: `Successfully assigned ${createdAssignments.length} voters to sub admin`,
      data: {
        subAdminId,
        assignedCount: createdAssignments.length,
        assignments: createdAssignments
      }
    });
  } catch (error) {
    console.error('Assign voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning voters',
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
        .populate('assignedBy', 'email')
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
    .populate('assignedBy', 'email')
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
        .populate('assignedBy', 'email')
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
  assignVotersToSubAdmin,
  unassignVotersFromSubAdmin,
  getSubAdminAssignments,
  getVoterAssignments,
  getAssignmentStats,
  deleteAssignment
};
