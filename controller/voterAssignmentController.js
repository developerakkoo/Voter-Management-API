const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');


// POST /api/assignment/assign - Assign voters to sub admin (Admin only)
const assignVotersToSubAdmin = async (req, res) => {
  try {
    const { subAdminId, voterIds, voterType, notes } = req.body;
    
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
    
    // Check for existing assignments and handle them appropriately
    const existingAssignments = await VoterAssignment.find({
      subAdminId,
      voterId: { $in: voterIds },
      voterType
    });
    
    const existingVoterIds = existingAssignments.map(a => a.voterId.toString());
    const newVoterIds = voterIds.filter(id => !existingVoterIds.includes(id.toString()));
    const assignmentsToUpdate = existingAssignments.filter(a => !a.isActive);
    const assignmentsToReactivate = existingAssignments.filter(a => a.isActive);
    
    let createdAssignments = [];
    let updatedAssignments = [];
    
    // Update inactive assignments to active
    if (assignmentsToUpdate.length > 0) {
      const updateResult = await VoterAssignment.updateMany(
        {
          _id: { $in: assignmentsToUpdate.map(a => a._id) }
        },
        {
          $set: {
            isActive: true,
            notes: notes || null,
            assignedAt: new Date()
          }
        }
      );
      updatedAssignments = await VoterAssignment.find({
        _id: { $in: assignmentsToUpdate.map(a => a._id) }
      });
    }
    
    // Create new assignments for voters that haven't been assigned before
    if (newVoterIds.length > 0) {
      const newAssignments = newVoterIds.map(voterId => ({
        subAdminId,
        voterId,
        voterType,
        notes: notes || null
      }));
      
      createdAssignments = await VoterAssignment.insertMany(newAssignments);
    }
    
    // Handle already assigned voters - assign remaining voters instead of failing
    if (assignmentsToReactivate.length > 0) {
      const alreadyAssignedVoterIds = assignmentsToReactivate.map(a => a.voterId);
      
      // Return success with partial assignment info
      return res.status(200).json({
        success: true,
        message: `Successfully assigned ${allAssignments.length} voters. ${alreadyAssignedVoterIds.length} voters were already assigned.`,
        data: {
          subAdminId,
          assignedCount: allAssignments.length,
          assignments: allAssignments,
          summary: {
            newlyAssigned: createdAssignments.length,
            reactivated: updatedAssignments.length,
            alreadyAssigned: alreadyAssignedVoterIds.length
          },
          alreadyAssigned: alreadyAssignedVoterIds,
          details: 'Some voters were already assigned and were skipped. Only new assignments were processed.'
        }
      });
    }
    
    const allAssignments = [...createdAssignments, ...updatedAssignments];
    
    res.status(201).json({
      success: true,
      message: `Successfully assigned ${allAssignments.length} voters to sub admin`,
      data: {
        subAdminId,
        assignedCount: allAssignments.length,
        assignments: allAssignments,
        summary: {
          newlyAssigned: createdAssignments.length,
          reactivated: updatedAssignments.length
        }
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
      isActive
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
        .populate('subAdminId', 'fullName userId locationName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VoterAssignment.countDocuments(filter)
    ]);
    
    // Get voter information for each assignment
    const voterIds = assignments.map(a => a.voterId);
    const assignmentVoterType = voterType || (assignments.length > 0 ? assignments[0].voterType : 'Voter');
    
    let voterInfo = {};
    if (voterIds.length > 0) {
      const VoterModel = assignmentVoterType === 'Voter' ? Voter : VoterFour;
      const voters = await VoterModel.find({ _id: { $in: voterIds } }).lean();
      
      // Create a lookup map for voter information
      voters.forEach(voter => {
        voterInfo[voter._id.toString()] = voter;
      });
    }
    
    // Add voter information to assignments
    const assignmentsWithVoterInfo = assignments.map(assignment => ({
      ...assignment,
      voterInfo: voterInfo[assignment.voterId.toString()] || null
    }));
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: assignmentsWithVoterInfo,
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

// POST /api/assignment/assign-from-excel - Assign voters to sub admin using Excel file with CardNo/CodeNo
const assignVotersFromExcel = async (req, res) => {
  try {
    const { subAdminId, voterType, notes } = req.body;
    
    // Validate required fields
    if (!subAdminId || !voterType) {
      return res.status(400).json({
        success: false,
        message: 'Sub admin ID and voter type are required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'Voter type must be either "Voter" or "VoterFour"'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required'
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
    
    // Read Excel file
    const ExcelReader = require('../utils/excelReader');
    const excelReader = new ExcelReader(req.file.path);
    const { data: excelData } = excelReader.excelToJson(req.file.originalname);
    
    // Extract CardNo or CodeNo from Excel with multiple column name variations
    const identifiers = [];
    const identifierFields = [
      'CardNo', 'Card No', 'Cardno', 'cardno', 'CARDNO', 'Card no',
      'CodeNo', 'Code No', 'Codeno', 'codeno', 'CODENO', 'Code no',
      'VoterID', 'Voter ID', 'VoterId', 'voterId', 'voter_id',
      'EPIC', 'epic', 'Epic'
    ];
    
    excelData.forEach((row) => {
      let identifier = null;
      
      // Try to find identifier in any of the supported column names
      for (const field of identifierFields) {
        if (row[field]) {
          identifier = row[field];
          break;
        }
      }
      
      // Also check if any key in the row contains 'card' or 'code'
      if (!identifier) {
        const keys = Object.keys(row);
        for (const key of keys) {
          const lowerKey = key.toLowerCase();
          if ((lowerKey.includes('card') || lowerKey.includes('code') || lowerKey.includes('epic')) && row[key]) {
            identifier = row[key];
            break;
          }
        }
      }
      
      if (identifier) {
        const cleanId = identifier.toString().trim();
        if (cleanId) {
          identifiers.push(cleanId);
        }
      }
    });
    
    // Remove duplicates
    const uniqueIdentifiers = [...new Set(identifiers)];
    
    if (uniqueIdentifiers.length === 0) {
      // Get column names from first row for debugging
      const columnNames = excelData.length > 0 ? Object.keys(excelData[0]) : [];
      
      return res.status(400).json({
        success: false,
        message: 'No CardNo or CodeNo found in Excel file. Please ensure the Excel has a column named CardNo (for Voter) or CodeNo (for VoterFour).',
        details: {
          columnsFound: columnNames,
          supportedColumnNames: [
            'CardNo', 'Card No', 'CodeNo', 'Code No', 'VoterID', 'Voter ID', 'EPIC'
          ],
          hint: 'Check if your column name matches one of the supported names (case-insensitive)'
        }
      });
    }
    
    // Find voters by CardNo or CodeNo
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const searchField = voterType === 'Voter' ? 'CardNo' : 'CodeNo';
    
    const foundVoters = await VoterModel.find({
      [searchField]: { $in: identifiers }
    }).select('_id CardNo CodeNo Voter Name Eng AC Part');
    
    if (foundVoters.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No voters found matching the ${searchField} in the Excel file`,
        details: {
          identifiersInExcel: identifiers.length,
          identifiersSample: identifiers.slice(0, 5)
        }
      });
    }
    
    const voterIds = foundVoters.map(v => v._id);
    
    // Check for existing assignments
    const existingAssignments = await VoterAssignment.find({
      subAdminId,
      voterId: { $in: voterIds },
      voterType,
      isActive: true
    });
    
    const existingVoterIds = existingAssignments.map(a => a.voterId.toString());
    const newVoterIds = voterIds.filter(id => !existingVoterIds.includes(id.toString()));
    
    // Create new assignments
    let createdAssignments = [];
    if (newVoterIds.length > 0) {
      const newAssignments = newVoterIds.map(voterId => ({
        subAdminId,
        voterId,
        voterType,
        notes: notes || 'Assigned via Excel upload'
      }));
      
      createdAssignments = await VoterAssignment.insertMany(newAssignments);
    }
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({
      success: true,
      message: `Successfully processed Excel file and assigned voters`,
      data: {
        subAdminId,
        subAdminName: subAdmin.fullName,
        voterType,
        excelStats: {
          totalIdentifiersInExcel: identifiers.length,
          votersFoundInDatabase: foundVoters.length,
          votersNotFound: identifiers.length - foundVoters.length,
          alreadyAssigned: existingAssignments.length,
          newlyAssigned: createdAssignments.length
        },
        assignments: {
          created: createdAssignments.length,
          skipped: existingAssignments.length
        }
      }
    });
    
  } catch (error) {
    console.error('Assign voters from Excel error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error assigning voters from Excel',
      error: error.message
    });
  }
};

// GET /api/assignment/assignment-page - Get voters for assignment page with filtering and sorting
const getAssignmentPageData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      voterType = 'Voter',
      subAdminId,
      assignmentStatus = 'all', // 'all', 'assigned', 'unassigned'
      search,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc',
      ac,
      part,
      booth,
      sex,
      ageMin,
      ageMax,
      isPaid,
      isVisited,
      surveyDone
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Build voter filter
    let voterFilter = { isActive: true };
    
    // Apply filters
    if (ac) {
      voterFilter.AC = { $in: Array.isArray(ac) ? ac : ac.split(',') };
    }
    
    if (part) {
      voterFilter.Part = { $in: Array.isArray(part) ? part : part.split(',') };
    }
    
    if (booth) {
      const boothField = voterType === 'Voter' ? 'Booth' : 'Booth no';
      voterFilter[boothField] = { $in: Array.isArray(booth) ? booth : booth.split(',') };
    }
    
    if (sex) {
      voterFilter.Sex = { $in: Array.isArray(sex) ? sex : sex.split(',') };
    }
    
    if (ageMin || ageMax) {
      voterFilter.Age = {};
      if (ageMin) voterFilter.Age.$gte = parseInt(ageMin);
      if (ageMax) voterFilter.Age.$lte = parseInt(ageMax);
    }
    
    if (isPaid !== undefined) {
      voterFilter.isPaid = isPaid === 'true';
    }
    
    if (isVisited !== undefined) {
      voterFilter.isVisited = isVisited === 'true';
    }
    
    if (surveyDone !== undefined) {
      voterFilter.surveyDone = surveyDone === 'true';
    }
    
    // Search filter
    if (search) {
      voterFilter.$or = [
        { 'Voter Name Eng': { $regex: search, $options: 'i' } },
        { 'Voter Name': { $regex: search, $options: 'i' } },
        { 'Relative Name Eng': { $regex: search, $options: 'i' } },
        { 'Relative Name': { $regex: search, $options: 'i' } },
        { 'CardNo': { $regex: search, $options: 'i' } },
        { 'CodeNo': { $regex: search, $options: 'i' } },
        { 'Address': { $regex: search, $options: 'i' } },
        { 'Address Eng': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get voters with pagination
    const [voters, totalVoterCount] = await Promise.all([
      VoterModel.find(voterFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VoterModel.countDocuments(voterFilter)
    ]);
    
    // Get voter IDs
    const voterIds = voters.map(v => v._id);
    
    // Get assignment information
    let assignmentFilter = {
      voterId: { $in: voterIds },
      voterType,
      isActive: true
    };
    
    // If subAdminId is provided, filter by specific sub admin
    if (subAdminId) {
      assignmentFilter.subAdminId = subAdminId;
    }
    
    const assignments = await VoterAssignment.find(assignmentFilter)
      .populate('subAdminId', 'fullName userId locationName')
      .lean();
    
    // Create assignment lookup map
    const assignmentMap = {};
    assignments.forEach(assignment => {
      assignmentMap[assignment.voterId.toString()] = assignment;
    });
    
    // Add assignment status to each voter
    let votersWithAssignment = voters.map(voter => ({
      _id: voter._id,
      voterType: voterType,
      'Voter Name Eng': voter['Voter Name Eng'],
      'Voter Name': voter['Voter Name'],
      AC: voter.AC,
      Part: voter.Part,
      Booth: voter.Booth || voter['Booth no'],
      Age: voter.Age,
      Sex: voter.Sex,
      CardNo: voter.CardNo,
      CodeNo: voter.CodeNo,
      Address: voter['Address Eng'] || voter.Address,
      isPaid: voter.isPaid,
      isVisited: voter.isVisited,
      surveyDone: voter.surveyDone,
      pno: voter.pno,
      assignmentStatus: assignmentMap[voter._id.toString()] ? {
        isAssigned: true,
        assignmentId: assignmentMap[voter._id.toString()]._id,
        subAdmin: assignmentMap[voter._id.toString()].subAdminId,
        assignedAt: assignmentMap[voter._id.toString()].assignedAt,
        notes: assignmentMap[voter._id.toString()].notes
      } : {
        isAssigned: false,
        assignmentId: null,
        subAdmin: null,
        assignedAt: null,
        notes: null
      }
    }));
    
    // Filter by assignment status if requested
    if (assignmentStatus === 'assigned') {
      votersWithAssignment = votersWithAssignment.filter(v => v.assignmentStatus.isAssigned);
    } else if (assignmentStatus === 'unassigned') {
      votersWithAssignment = votersWithAssignment.filter(v => !v.assignmentStatus.isAssigned);
    }
    
    // Count assigned and unassigned
    const assignedCount = votersWithAssignment.filter(v => v.assignmentStatus.isAssigned).length;
    const unassignedCount = votersWithAssignment.filter(v => !v.assignmentStatus.isAssigned).length;
    
    const totalPages = Math.ceil(totalVoterCount / parseInt(limit));
    
    res.json({
      success: true,
      data: votersWithAssignment,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount: totalVoterCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      stats: {
        totalVoters: votersWithAssignment.length,
        assignedVoters: assignedCount,
        unassignedVoters: unassignedCount,
        assignmentPercentage: votersWithAssignment.length > 0 
          ? ((assignedCount / votersWithAssignment.length) * 100).toFixed(2) 
          : 0
      },
      filters: {
        voterType,
        subAdminId,
        assignmentStatus,
        search,
        ac,
        part,
        booth,
        sex,
        ageMin,
        ageMax,
        isPaid,
        isVisited,
        surveyDone,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error('Get assignment page data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment page data',
      error: error.message
    });
  }
};

// POST /api/assignment/assign-selected - Assign selected voters to sub admin (supports 100, 500, 1000+ at once)
const assignSelectedVoters = async (req, res) => {
  try {
    const { subAdminId, voterIds, voterType, notes } = req.body;
    
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
    
    // Validate array size
    if (voterIds.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign more than 10,000 voters at once. Please split into multiple batches.'
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
    
    // Verify voters exist
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const existingVoters = await VoterModel.find({ _id: { $in: voterIds } });
    
    const foundVoterIds = existingVoters.map(v => v._id.toString());
    const notFoundIds = voterIds.filter(id => !foundVoterIds.includes(id.toString()));
    
    if (foundVoterIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'None of the provided voter IDs were found in the database'
      });
    }
    
    // Check for existing assignments
    const existingAssignments = await VoterAssignment.find({
      subAdminId,
      voterId: { $in: foundVoterIds },
      voterType,
      isActive: true
    });
    
    const alreadyAssignedIds = existingAssignments.map(a => a.voterId.toString());
    const newVoterIds = foundVoterIds.filter(id => !alreadyAssignedIds.includes(id));
    
    // Create new assignments
    let createdAssignments = [];
    if (newVoterIds.length > 0) {
      const newAssignments = newVoterIds.map(voterId => ({
        subAdminId,
        voterId,
        voterType,
        notes: notes || `Bulk assignment of ${voterIds.length} voters`
      }));
      
      createdAssignments = await VoterAssignment.insertMany(newAssignments);
    }
    
    // Determine response message based on results
    let message = `Successfully assigned ${createdAssignments.length} voters to sub admin`;
    if (alreadyAssignedIds.length > 0) {
      message += `. ${alreadyAssignedIds.length} voters were already assigned and skipped`;
    }
    if (notFoundIds.length > 0) {
      message += `. ${notFoundIds.length} voters were not found in database`;
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        subAdminId,
        subAdminName: subAdmin.fullName,
        voterType,
        requestedCount: voterIds.length,
        votersFound: foundVoterIds.length,
        votersNotFound: notFoundIds.length,
        alreadyAssigned: alreadyAssignedIds.length,
        newlyAssigned: createdAssignments.length,
        notFoundIds: notFoundIds.length > 0 ? notFoundIds.slice(0, 10) : [],
        alreadyAssignedIds: alreadyAssignedIds.length > 0 ? alreadyAssignedIds.slice(0, 10) : [],
        summary: {
          total: voterIds.length,
          successful: createdAssignments.length,
          skipped: alreadyAssignedIds.length,
          notFound: notFoundIds.length
        },
        details: alreadyAssignedIds.length > 0 || notFoundIds.length > 0 
          ? 'Some voters were skipped due to existing assignments or not being found in database'
          : 'All voters were successfully assigned'
      }
    });
    
  } catch (error) {
    console.error('Assign selected voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning selected voters',
      error: error.message
    });
  }
};

// GET /api/assignment/unassigned/:voterType - Get unassigned voters for a specific sub-admin
const getUnassignedVoters = async (req, res) => {
  try {
    const { voterType } = req.params;
    const {
      subAdminId,
      page = 1,
      limit = 50,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc',
      search,
      AC,
      Booth,
      pno,
      Part,
      Sex,
      ageMin,
      ageMax,
      surveyDone  // NEW: Filter by survey completion status
    } = req.query;
    
    // Validate required fields
    if (!subAdminId) {
      return res.status(400).json({
        success: false,
        message: 'subAdminId query parameter is required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Check if sub admin exists
    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }
    
    // Get all assigned voter IDs for this sub-admin
    const assignedVoterIds = await VoterAssignment.find({
      subAdminId,
      voterType,
      isActive: true
    }).distinct('voterId');
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Build query for unassigned voters
    const query = {
      _id: { $nin: assignedVoterIds },
      isActive: true
    };
    
    // Add search filter
    if (search) {
      query.$or = [
        { 'Voter Name Eng': { $regex: search, $options: 'i' } },
        { 'Voter Name': { $regex: search, $options: 'i' } },
        { 'Relative Name Eng': { $regex: search, $options: 'i' } },
        { 'Relative Name': { $regex: search, $options: 'i' } },
        { 'Address Eng': { $regex: search, $options: 'i' } },
        { 'Address': { $regex: search, $options: 'i' } },
        { 'CardNo': { $regex: search, $options: 'i' } },
        { 'CodeNo': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (AC) query.AC = AC;
    if (Booth) {
      const boothField = voterType === 'Voter' ? 'Booth' : 'Booth no';
      query[boothField] = Booth;
    }
    if (pno) query.pno = pno;
    if (Part) query.Part = Part;
    if (Sex) query.Sex = Sex;
    
    // Add age range filter
    if (ageMin || ageMax) {
      query.Age = {};
      if (ageMin) query.Age.$gte = parseInt(ageMin);
      if (ageMax) query.Age.$lte = parseInt(ageMax);
    }
    
    // NEW: Add survey completion filter
    if (surveyDone !== undefined) {
      // Convert string to boolean: 'true' -> true, 'false' -> false
      const isSurveyDone = surveyDone === 'true' || surveyDone === true;
      query.surveyDone = isSurveyDone;
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 1000); // Max 1000
    const skip = (pageNum - 1) * limitNum;
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with survey status fields included
    const [voters, totalCount] = await Promise.all([
      VoterModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      VoterModel.countDocuments(query)
    ]);
    
    // NEW: Add survey status info to each voter
    const votersWithSurveyStatus = voters.map(voter => ({
      ...voter,
      hasSurvey: voter.surveyDone || false,  // Boolean flag for easy frontend checks
      surveyCompleted: voter.surveyDone || false,  // Alias for clarity
      surveyDate: voter.lastSurveyDate || null
    }));
    
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: votersWithSurveyStatus,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get unassigned voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading unassigned voters',
      error: error.message
    });
  }
};

// GET /api/voter/filter-options - Get filter options for Voter type
const getVoterFilterOptions = async (req, res) => {
  try {
    const [ACs, Booths, pnos, Parts] = await Promise.all([
      Voter.distinct('AC', { isActive: true }),
      Voter.distinct('Booth', { isActive: true }),
      Voter.distinct('pno', { isActive: true }),
      Voter.distinct('Part', { isActive: true })
    ]);
    
    res.json({
      success: true,
      data: {
        ACs: ACs.filter(Boolean).sort(),
        Booths: Booths.filter(Boolean).sort(),
        pnos: pnos.filter(Boolean).sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numA - numB;
        }),
        Parts: Parts.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('Get voter filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading filter options',
      error: error.message
    });
  }
};

// GET /api/voterfour/filter-options - Get filter options for VoterFour type
const getVoterFourFilterOptions = async (req, res) => {
  try {
    const [ACs, Booths, pnos, Parts] = await Promise.all([
      VoterFour.distinct('AC', { isActive: true }),
      VoterFour.distinct('Booth no', { isActive: true }),
      VoterFour.distinct('pno', { isActive: true }),
      VoterFour.distinct('Part', { isActive: true })
    ]);
    
    res.json({
      success: true,
      data: {
        ACs: ACs.filter(Boolean).sort(),
        Booths: Booths.filter(Boolean).sort(),
        pnos: pnos.filter(Boolean).sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numA - numB;
        }),
        Parts: Parts.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('Get voterfour filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading filter options',
      error: error.message
    });
  }
};

// PATCH /api/assignment/bulk-update-status - Bulk update paid/visited status for multiple voters
const bulkUpdateVoterStatus = async (req, res) => {
  try {
    const { voterIds, voterType, isPaid, isVisited } = req.body;
    
    // Validate required fields
    if (!voterIds || !Array.isArray(voterIds) || voterIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'voterIds array is required and must contain at least one ID'
      });
    }
    
    if (!voterType) {
      return res.status(400).json({
        success: false,
        message: 'voterType is required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Validate at least one status field is provided
    if (typeof isPaid !== 'boolean' && typeof isVisited !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'At least one status field (isPaid or isVisited) must be provided'
      });
    }
    
    // Validate array size
    if (voterIds.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 10,000 voters at once'
      });
    }
    
    // Build update object
    const updateData = { lastUpdated: new Date() };
    if (typeof isPaid === 'boolean') updateData.isPaid = isPaid;
    if (typeof isVisited === 'boolean') updateData.isVisited = isVisited;
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Update voters
    const result = await VoterModel.updateMany(
      { _id: { $in: voterIds } },
      { $set: updateData }
    );
    
    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} voters`,
      data: {
        voterType,
        requestedCount: voterIds.length,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        updates: {
          isPaid: typeof isPaid === 'boolean' ? isPaid : 'unchanged',
          isVisited: typeof isVisited === 'boolean' ? isVisited : 'unchanged'
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk update voter status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating voter statuses',
      error: error.message
    });
  }
};

// POST /api/assignment/bulk-update-status-from-excel - Bulk update status from Excel file
const bulkUpdateStatusFromExcel = async (req, res) => {
  try {
    const { voterType, isPaid, isVisited } = req.body;
    
    // Validate required fields
    if (!voterType) {
      return res.status(400).json({
        success: false,
        message: 'voterType is required'
      });
    }
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Validate at least one status field
    if (typeof isPaid !== 'boolean' && typeof isVisited !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'At least one status field (isPaid or isVisited) must be provided'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required'
      });
    }
    
    // Read Excel file
    const ExcelReader = require('../utils/excelReader');
    const excelReader = new ExcelReader(req.file.path);
    const { data: excelData } = excelReader.excelToJson(req.file.originalname);
    
    // Extract identifiers
    const identifiers = [];
    const identifierFields = [
      'CardNo', 'Card No', 'Cardno', 'cardno', 'CARDNO',
      'CodeNo', 'Code No', 'Codeno', 'codeno', 'CODENO',
      'VoterID', 'Voter ID', 'VoterId', 'EPIC'
    ];
    
    excelData.forEach((row) => {
      let identifier = null;
      for (const field of identifierFields) {
        if (row[field]) {
          identifier = row[field];
          break;
        }
      }
      
      // Fallback: check any column with 'card' or 'code'
      if (!identifier) {
        const keys = Object.keys(row);
        for (const key of keys) {
          if ((key.toLowerCase().includes('card') || key.toLowerCase().includes('code')) && row[key]) {
            identifier = row[key];
            break;
          }
        }
      }
      
      if (identifier) {
        identifiers.push(identifier.toString().trim());
      }
    });
    
    const uniqueIdentifiers = [...new Set(identifiers)];
    
    if (uniqueIdentifiers.length === 0) {
      const columnNames = excelData.length > 0 ? Object.keys(excelData[0]) : [];
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'No CardNo or CodeNo found in Excel file',
        details: {
          columnsFound: columnNames,
          supportedColumnNames: identifierFields
        }
      });
    }
    
    // Find voters
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const searchField = voterType === 'Voter' ? 'CardNo' : 'CodeNo';
    
    const voters = await VoterModel.find({
      [searchField]: { $in: uniqueIdentifiers }
    });
    
    if (voters.length === 0) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: `No voters found matching the ${searchField} in Excel file`
      });
    }
    
    const voterIds = voters.map(v => v._id);
    
    // Build update object
    const updateData = { lastUpdated: new Date() };
    if (typeof isPaid === 'boolean') updateData.isPaid = isPaid;
    if (typeof isVisited === 'boolean') updateData.isVisited = isVisited;
    
    // Update voters
    const result = await VoterModel.updateMany(
      { _id: { $in: voterIds } },
      { $set: updateData }
    );
    
    // Clean up file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} voters from Excel file`,
      data: {
        voterType,
        excelStats: {
          totalIdentifiersInExcel: uniqueIdentifiers.length,
          votersFoundInDatabase: voters.length,
          votersNotFound: uniqueIdentifiers.length - voters.length,
          updated: result.modifiedCount
        },
        updates: {
          isPaid: typeof isPaid === 'boolean' ? isPaid : 'unchanged',
          isVisited: typeof isVisited === 'boolean' ? isVisited : 'unchanged'
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk update status from Excel error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating voter statuses from Excel',
      error: error.message
    });
  }
};

module.exports = {
  assignVotersToSubAdmin,
  getVotersWithAssignmentStatus,
  getAllAssignments,
  unassignVotersFromSubAdmin,
  getSubAdminAssignments,
  getVoterAssignments,
  getAssignmentStats,
  deleteAssignment,
  assignVotersFromExcel,
  getAssignmentPageData,
  assignSelectedVoters,
  getUnassignedVoters,
  getVoterFilterOptions,
  getVoterFourFilterOptions,
  bulkUpdateVoterStatus,
  bulkUpdateStatusFromExcel
};
