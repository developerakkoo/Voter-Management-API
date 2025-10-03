const Survey = require('../models/Survey');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');
const User = require('../models/User');

// GET /api/survey - Get all surveys with pagination, filtering, and search
const getAllSurveys = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      surveyorId,
      voterType,
      voterId,
      voterPhoneNumber,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter criteria
    const filter = {};
    
    if (status) filter.status = status;
    if (surveyorId) filter.surveyorId = surveyorId;
    if (voterType) filter.voterType = voterType;
    if (voterId) filter.voterId = voterId;
    if (voterPhoneNumber) filter.voterPhoneNumber = { $regex: voterPhoneNumber, $options: 'i' };
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { voterPhoneNumber: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'members.name': { $regex: search, $options: 'i' } },
        { 'members.phoneNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [surveys, totalCount] = await Promise.all([
      Survey.find(filter)
        .populate('surveyorId', 'fullName userId pno')
        .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
        .populate('verifiedBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Survey.countDocuments(filter)
    ]);

    // Manually populate members' voterId
    for (const survey of surveys) {
      if (survey.members && survey.members.length > 0) {
        for (const member of survey.members) {
          if (member.voterId && member.voterType) {
            const VoterModel = member.voterType === 'Voter' ? Voter : VoterFour;
            const voterData = await VoterModel.findById(member.voterId)
              .select('Voter Name Eng Voter Name pno CardNo')
              .lean();
            member.voterId = voterData || member.voterId;
          }
        }
      }
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: surveys,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        status,
        surveyorId,
        voterType,
        voterId,
        voterPhoneNumber,
        search,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get all surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys',
      error: error.message
    });
  }
};

// GET /api/survey/:id - Get survey by ID
const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('surveyorId', 'fullName userId pno email phone')
      .populate('voterId', 'Voter Name Eng Voter Name pno CardNo Address Sex Age')
      .populate('verifiedBy', 'email')
      .lean();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Manually populate members' voterId
    if (survey.members && survey.members.length > 0) {
      for (const member of survey.members) {
        if (member.voterId && member.voterType) {
          const VoterModel = member.voterType === 'Voter' ? Voter : VoterFour;
          const voterData = await VoterModel.findById(member.voterId)
            .select('Voter Name Eng Voter Name pno CardNo Address Sex Age')
            .lean();
          member.voterId = voterData || member.voterId;
        }
      }
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('Get survey by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey',
      error: error.message
    });
  }
};

// POST /api/survey - Create a new survey
const createSurvey = async (req, res) => {
  try {
    const {
      voterId,
      voterType,
      surveyorId,
      location,
      voterPhoneNumber,
      surveyData,
      notes,
      members,
      metadata
    } = req.body;

    // Validate required fields
    if (!voterId || !voterType || !surveyorId || !location || !voterPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID, voter type, surveyor ID, location, and voter phone number are required'
      });
    }

    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'Voter type must be either "Voter" or "VoterFour"'
      });
    }

    // Check if voter exists
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const voter = await VoterModel.findById(voterId);
    if (!voter) {
      // Get some available voter IDs for debugging
      const availableVoters = await VoterModel.find({}).limit(3).select('_id Voter Name Eng CardNo');
      
      return res.status(404).json({
        success: false,
        message: `${voterType} not found with ID: ${voterId}`,
        debug: {
          searchedId: voterId,
          voterType: voterType,
          availableVoters: availableVoters.map(v => ({
            id: v._id,
            name: v['Voter Name Eng'] || 'N/A',
            cardNo: v.CardNo || 'N/A'
          }))
        }
      });
    }

    // Check if surveyor exists
    const surveyor = await User.findById(surveyorId);
    if (!surveyor) {
      return res.status(404).json({
        success: false,
        message: 'Surveyor not found'
      });
    }

    // Check if survey already exists for this voter
    const existingSurvey = await Survey.findOne({ voterId, voterType });
    if (existingSurvey) {
      return res.status(409).json({
        success: false,
        message: 'Survey already exists for this voter'
      });
    }

    // Validate location coordinates
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(voterPhoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Voter phone number must be 10 digits'
      });
    }

    // Validate members if provided
    if (members && Array.isArray(members)) {
      for (const member of members) {
        if (!member.name || !member.age || !member.phoneNumber) {
          return res.status(400).json({
            success: false,
            message: 'Each member must have name, age, and phone number'
          });
        }
        if (!phoneRegex.test(member.phoneNumber)) {
          return res.status(400).json({
            success: false,
            message: 'Member phone number must be 10 digits'
          });
        }
      }
    }

    const survey = new Survey({
      voterId,
      voterType,
      surveyorId,
      location,
      voterPhoneNumber,
      surveyData: surveyData || {},
      notes,
      members: members || [],
      metadata: metadata || {}
    });

    await survey.save();

    // Populate the created survey
    const populatedSurvey = await Survey.findById(survey._id)
      .populate('surveyorId', 'fullName userId pno')
      .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: populatedSurvey
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating survey',
      error: error.message
    });
  }
};

// PUT /api/survey/:id - Update survey
const updateSurvey = async (req, res) => {
  try {
    const {
      location,
      voterPhoneNumber,
      surveyData,
      notes,
      members,
      metadata,
      status
    } = req.body;

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Update fields
    if (location) {
      if (location.latitude && location.longitude) {
        survey.location = { ...survey.location, ...location };
      }
    }
    if (voterPhoneNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(voterPhoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Voter phone number must be 10 digits'
        });
      }
      survey.voterPhoneNumber = voterPhoneNumber;
    }
    if (surveyData) survey.surveyData = surveyData;
    if (notes) survey.notes = notes;
    if (members) {
      // Validate members
      const phoneRegex = /^[0-9]{10}$/;
      for (const member of members) {
        if (!member.name || !member.age || !member.phoneNumber) {
          return res.status(400).json({
            success: false,
            message: 'Each member must have name, age, and phone number'
          });
        }
        if (!phoneRegex.test(member.phoneNumber)) {
          return res.status(400).json({
            success: false,
            message: 'Member phone number must be 10 digits'
          });
        }
      }
      survey.members = members;
    }
    if (metadata) survey.metadata = metadata;
    if (status) {
      if (!['draft', 'completed', 'submitted', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      survey.status = status;
      
      // Update timestamps based on status
      if (status === 'completed' && !survey.completedAt) {
        survey.completedAt = new Date();
      } else if (status === 'submitted' && !survey.submittedAt) {
        survey.submittedAt = new Date();
      }
    }

    await survey.save();

    // Populate the updated survey
    const populatedSurvey = await Survey.findById(survey._id)
      .populate('surveyorId', 'fullName userId pno')
      .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
      .lean();

    res.json({
      success: true,
      message: 'Survey updated successfully',
      data: populatedSurvey
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating survey',
      error: error.message
    });
  }
};

// DELETE /api/survey/:id - Delete survey
const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    await Survey.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting survey',
      error: error.message
    });
  }
};

// DELETE /api/survey - Delete all surveys
const deleteAllSurveys = async (req, res) => {
  try {
    const result = await Survey.deleteMany({});
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} surveys successfully`
    });
  } catch (error) {
    console.error('Delete all surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting surveys',
      error: error.message
    });
  }
};

// PATCH /api/survey/:id/status - Update survey status
const updateSurveyStatus = async (req, res) => {
  try {
    const { status, verifiedBy, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!['draft', 'completed', 'submitted', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    survey.status = status;
    
    // Update timestamps and fields based on status
    if (status === 'completed' && !survey.completedAt) {
      survey.completedAt = new Date();
    } else if (status === 'submitted' && !survey.submittedAt) {
      survey.submittedAt = new Date();
    } else if (status === 'verified') {
      survey.verifiedAt = new Date();
      if (verifiedBy) survey.verifiedBy = verifiedBy;
    } else if (status === 'rejected') {
      if (verifiedBy) survey.verifiedBy = verifiedBy;
      if (reason) survey.notes = reason;
    }

    await survey.save();

    // Populate the updated survey
    const populatedSurvey = await Survey.findById(survey._id)
      .populate('surveyorId', 'fullName userId pno')
      .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
      .populate('verifiedBy', 'email')
      .lean();

    res.json({
      success: true,
      message: 'Survey status updated successfully',
      data: populatedSurvey
    });
  } catch (error) {
    console.error('Update survey status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating survey status',
      error: error.message
    });
  }
};

// GET /api/survey/stats - Get survey statistics
const getSurveyStats = async (req, res) => {
  try {
    const {
      surveyorId,
      voterType,
      dateFrom,
      dateTo
    } = req.query;

    const filters = {};
    if (surveyorId) filters.surveyorId = surveyorId;
    if (voterType) filters.voterType = voterType;
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    const stats = await Survey.getSurveyStats(filters);
    
    // Get additional statistics
    const totalSurveys = await Survey.countDocuments();
    const surveysByStatus = await Survey.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const surveysByVoterType = await Survey.aggregate([
      { $group: { _id: '$voterType', count: { $sum: 1 } } }
    ]);

    const surveysBySurveyor = await Survey.aggregate([
      { $group: { _id: '$surveyorId', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'surveyor' } },
      { $unwind: '$surveyor' },
      { $project: { surveyorName: '$surveyor.fullName', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const avgMembersPerSurvey = await Survey.aggregate([
      { $project: { memberCount: { $size: '$members' } } },
      { $group: { _id: null, avgMembers: { $avg: '$memberCount' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalSurveys: 0,
          completedSurveys: 0,
          submittedSurveys: 0,
          verifiedSurveys: 0,
          rejectedSurveys: 0,
          draftSurveys: 0,
          totalMembers: 0,
          avgQualityScore: 0,
          avgDuration: 0
        },
        byStatus: surveysByStatus,
        byVoterType: surveysByVoterType,
        topSurveyors: surveysBySurveyor,
        avgMembersPerSurvey: avgMembersPerSurvey[0]?.avgMembers || 0,
        totalSurveys
      }
    });
  } catch (error) {
    console.error('Get survey stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey statistics',
      error: error.message
    });
  }
};

// GET /api/survey/search - Search surveys
const searchSurveys = async (req, res) => {
  try {
    const {
      q,
      status,
      surveyorId,
      voterType,
      voterPhoneNumber,
      dateFrom,
      dateTo,
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
        { voterPhoneNumber: { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { 'members.name': { $regex: q, $options: 'i' } },
        { 'members.phoneNumber': { $regex: q, $options: 'i' } }
      ]
    };

    // Add additional filters
    if (status) searchFilter.status = status;
    if (surveyorId) searchFilter.surveyorId = surveyorId;
    if (voterType) searchFilter.voterType = voterType;
    if (voterPhoneNumber) searchFilter.voterPhoneNumber = { $regex: voterPhoneNumber, $options: 'i' };
    
    // Date range filter
    if (dateFrom || dateTo) {
      searchFilter.createdAt = {};
      if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Search surveys
    const surveys = await Survey.find(searchFilter)
      .populate('surveyorId', 'fullName userId pno')
      .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Survey.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: surveys,
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
        status,
        surveyorId,
        voterType,
        voterPhoneNumber,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching surveys',
      error: error.message
    });
  }
};

// GET /api/survey/surveyor/:surveyorId - Get surveys by surveyor
const getSurveysBySurveyor = async (req, res) => {
  try {
    const { surveyorId } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      voterType,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { surveyorId };
    if (status) filter.status = status;
    if (voterType) filter.voterType = voterType;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [surveys, totalCount] = await Promise.all([
      Survey.find(filter)
        .populate('voterId', 'Voter Name Eng Voter Name pno CardNo')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Survey.countDocuments(filter)
    ]);

    // Manually populate members' voterId
    for (const survey of surveys) {
      if (survey.members && survey.members.length > 0) {
        for (const member of survey.members) {
          if (member.voterId && member.voterType) {
            const VoterModel = member.voterType === 'Voter' ? Voter : VoterFour;
            const voterData = await VoterModel.findById(member.voterId)
              .select('Voter Name Eng Voter Name pno CardNo')
              .lean();
            member.voterId = voterData || member.voterId;
          }
        }
      }
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: surveys,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        surveyorId,
        status,
        voterType,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get surveys by surveyor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys by surveyor',
      error: error.message
    });
  }
};

// GET /api/survey/voter/:voterId/:voterType - Get surveys by voter
const getSurveysByVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'Voter type must be either "Voter" or "VoterFour"'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { voterId, voterType };
    if (status) filter.status = status;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [surveys, totalCount] = await Promise.all([
      Survey.find(filter)
        .populate('surveyorId', 'fullName userId pno')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Survey.countDocuments(filter)
    ]);

    // Manually populate members' voterId
    for (const survey of surveys) {
      if (survey.members && survey.members.length > 0) {
        for (const member of survey.members) {
          if (member.voterId && member.voterType) {
            const VoterModel = member.voterType === 'Voter' ? Voter : VoterFour;
            const voterData = await VoterModel.findById(member.voterId)
              .select('Voter Name Eng Voter Name pno CardNo')
              .lean();
            member.voterId = voterData || member.voterId;
          }
        }
      }
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: surveys,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        voterId,
        voterType,
        status,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get surveys by voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys by voter',
      error: error.message
    });
  }
};

// GET /api/survey/available-voters - Get available voters for testing
const getAvailableVoters = async (req, res) => {
  try {
    const { voterType = 'all', limit = 10 } = req.query;
    
    let voters = [];
    let voterFours = [];
    
    if (voterType === 'all' || voterType === 'Voter') {
      voters = await Voter.find({})
        .limit(parseInt(limit))
        .select('_id Voter Name Eng Voter Name CardNo pno Sex Age')
        .lean();
    }
    
    if (voterType === 'all' || voterType === 'VoterFour') {
      voterFours = await VoterFour.find({})
        .limit(parseInt(limit))
        .select('_id Voter Name Eng Voter Name CardNo pno Sex Age')
        .lean();
    }
    
    res.json({
      success: true,
      data: {
        voters: voters.map(v => ({
          id: v._id,
          name: v['Voter Name Eng'] || v['Voter Name'] || 'N/A',
          cardNo: v.CardNo || 'N/A',
          pno: v.pno || 'N/A',
          sex: v.Sex || 'N/A',
          age: v.Age || 'N/A',
          type: 'Voter'
        })),
        voterFours: voterFours.map(v => ({
          id: v._id,
          name: v['Voter Name Eng'] || v['Voter Name'] || 'N/A',
          cardNo: v.CardNo || 'N/A',
          pno: v.pno || 'N/A',
          sex: v.Sex || 'N/A',
          age: v.Age || 'N/A',
          type: 'VoterFour'
        }))
      },
      counts: {
        voters: voters.length,
        voterFours: voterFours.length,
        total: voters.length + voterFours.length
      }
    });
  } catch (error) {
    console.error('Get available voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available voters',
      error: error.message
    });
  }
};

module.exports = {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  deleteAllSurveys,
  updateSurveyStatus,
  getSurveyStats,
  searchSurveys,
  getSurveysBySurveyor,
  getSurveysByVoter,
  getAvailableVoters
};
