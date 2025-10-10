const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// Helper function to calculate complete analytics using database aggregation
const calculateCompleteAnalytics = async (filter, voterType) => {
  try {
    const analytics = {
      totalVoters: 0,
      genderDistribution: { male: 0, female: 0, other: 0 },
      pnoDistribution: {},
      paymentStatus: { paid: 0, notPaid: 0 },
      visitStatus: { visited: 0, notVisited: 0 },
      voterTypeDistribution: { voter: 0, voterFour: 0 },
      activeStatus: { active: 0, inactive: 0 }
    };

    // Get analytics from Voter collection
    if (voterType === 'all' || voterType === 'voter') {
      const voterStats = await Voter.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            male: { $sum: { $cond: [{ $eq: ['$Sex', 'Male'] }, 1, 0] } },
            female: { $sum: { $cond: [{ $eq: ['$Sex', 'Female'] }, 1, 0] } },
            other: { $sum: { $cond: [{ $and: [{ $ne: ['$Sex', 'Male'] }, { $ne: ['$Sex', 'Female'] }] }, 1, 0] } },
            paid: { $sum: { $cond: ['$isPaid', 1, 0] } },
            notPaid: { $sum: { $cond: [{ $not: '$isPaid' }, 1, 0] } },
            visited: { $sum: { $cond: ['$isVisited', 1, 0] } },
            notVisited: { $sum: { $cond: [{ $not: '$isVisited' }, 1, 0] } },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } }
          }
        }
      ]);

      if (voterStats.length > 0) {
        const stats = voterStats[0];
        analytics.totalVoters += stats.total;
        analytics.genderDistribution.male += stats.male;
        analytics.genderDistribution.female += stats.female;
        analytics.genderDistribution.other += stats.other;
        analytics.paymentStatus.paid += stats.paid;
        analytics.paymentStatus.notPaid += stats.notPaid;
        analytics.visitStatus.visited += stats.visited;
        analytics.visitStatus.notVisited += stats.notVisited;
        analytics.activeStatus.active += stats.active;
        analytics.activeStatus.inactive += stats.inactive;
        analytics.voterTypeDistribution.voter += stats.total;
      }

      // Get PNO distribution from Voter collection
      const voterPnoStats = await Voter.aggregate([
        { $match: filter },
        { $group: { _id: '$pno', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      voterPnoStats.forEach(stat => {
        const pno = stat._id || 'Unknown';
        analytics.pnoDistribution[pno] = (analytics.pnoDistribution[pno] || 0) + stat.count;
      });
    }

    // Get analytics from VoterFour collection
    if (voterType === 'all' || voterType === 'voterfour') {
      const voterFourStats = await VoterFour.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            male: { $sum: { $cond: [{ $eq: ['$Sex', 'Male'] }, 1, 0] } },
            female: { $sum: { $cond: [{ $eq: ['$Sex', 'Female'] }, 1, 0] } },
            other: { $sum: { $cond: [{ $and: [{ $ne: ['$Sex', 'Male'] }, { $ne: ['$Sex', 'Female'] }] }, 1, 0] } },
            paid: { $sum: { $cond: ['$isPaid', 1, 0] } },
            notPaid: { $sum: { $cond: [{ $not: '$isPaid' }, 1, 0] } },
            visited: { $sum: { $cond: ['$isVisited', 1, 0] } },
            notVisited: { $sum: { $cond: [{ $not: '$isVisited' }, 1, 0] } },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } }
          }
        }
      ]);

      if (voterFourStats.length > 0) {
        const stats = voterFourStats[0];
        analytics.totalVoters += stats.total;
        analytics.genderDistribution.male += stats.male;
        analytics.genderDistribution.female += stats.female;
        analytics.genderDistribution.other += stats.other;
        analytics.paymentStatus.paid += stats.paid;
        analytics.paymentStatus.notPaid += stats.notPaid;
        analytics.visitStatus.visited += stats.visited;
        analytics.visitStatus.notVisited += stats.notVisited;
        analytics.activeStatus.active += stats.active;
        analytics.activeStatus.inactive += stats.inactive;
        analytics.voterTypeDistribution.voterFour += stats.total;
      }

      // Get PNO distribution from VoterFour collection
      const voterFourPnoStats = await VoterFour.aggregate([
        { $match: filter },
        { $group: { _id: '$pno', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      voterFourPnoStats.forEach(stat => {
        const pno = stat._id || 'Unknown';
        analytics.pnoDistribution[pno] = (analytics.pnoDistribution[pno] || 0) + stat.count;
      });
    }

    return analytics;
  } catch (error) {
    console.error('Error calculating complete analytics:', error);
    return {
      totalVoters: 0,
      genderDistribution: { male: 0, female: 0, other: 0 },
      pnoDistribution: {},
      paymentStatus: { paid: 0, notPaid: 0 },
      visitStatus: { visited: 0, notVisited: 0 },
      voterTypeDistribution: { voter: 0, voterFour: 0 },
      activeStatus: { active: 0, inactive: 0 }
    };
  }
};

// GET /api/voters/all - Get all voters from both Voter and VoterFour collections
const getAllVotersCombined = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      isPaid,
      isVisited,
      search,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc',
      voterType = 'all' // 'all', 'voter', 'voterfour'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) filter.isVisited = isVisited === 'true';
    if (search) {
      filter.$or = [
        { 'Voter Name Eng': { $regex: search, $options: 'i' } },
        { 'Voter Name': { $regex: search, $options: 'i' } },
        { 'Relative Name Eng': { $regex: search, $options: 'i' } },
        { 'Relative Name': { $regex: search, $options: 'i' } },
        { 'Address': { $regex: search, $options: 'i' } },
        { 'Address Eng': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Use aggregation for better performance with large datasets
    let voterPipeline = [];
    let voterFourPipeline = [];
    
    // Add match stage
    if (Object.keys(filter).length > 0) {
      voterPipeline.push({ $match: filter });
      voterFourPipeline.push({ $match: filter });
    }
    
    // Add sort stage
    voterPipeline.push({ $sort: sortOptions });
    voterFourPipeline.push({ $sort: sortOptions });
    
    // Add voterType field
    voterPipeline.push({ $addFields: { voterType: 'Voter', collectionId: '$_id' } });
    voterFourPipeline.push({ $addFields: { voterType: 'VoterFour', collectionId: '$_id' } });
    
    // Execute queries based on voterType filter
    let voters = [];
    let voterFour = [];
    let totalCount = 0;
    
    if (voterType === 'all' || voterType === 'voter') {
      const [voterResults, voterCount] = await Promise.all([
        Voter.aggregate(voterPipeline).limit(5000), // Limit to prevent memory issues
        Voter.countDocuments(filter)
      ]);
      voters = voterResults;
      totalCount += voterCount;
    }
    
    if (voterType === 'all' || voterType === 'voterfour') {
      const [voterFourResults, voterFourCount] = await Promise.all([
        VoterFour.aggregate(voterFourPipeline).limit(5000), // Limit to prevent memory issues
        VoterFour.countDocuments(filter)
      ]);
      voterFour = voterFourResults;
      totalCount += voterFourCount;
    }
    
    // Combine results
    let combinedResults = [...voters, ...voterFour];
    
    // Calculate analytics on COMPLETE dataset using database aggregation
    const analytics = await calculateCompleteAnalytics(filter, voterType);
    
    // Apply combined sorting if needed (only for small datasets)
    if (combinedResults.length <= 1000) {
      combinedResults.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'Voter Name Eng') {
          aValue = a['Voter Name Eng'] || '';
          bValue = b['Voter Name Eng'] || '';
        } else if (sortBy === 'Voter Name') {
          aValue = a['Voter Name'] || '';
          bValue = b['Voter Name'] || '';
        } else if (sortBy === 'Relative Name Eng') {
          aValue = a['Relative Name Eng'] || '';
          bValue = b['Relative Name Eng'] || '';
        } else if (sortBy === 'Relative Name') {
          aValue = a['Relative Name'] || '';
          bValue = b['Relative Name'] || '';
        } else if (sortBy === 'Address') {
          aValue = a['Address'] || '';
          bValue = b['Address'] || '';
        } else if (sortBy === 'Address Eng') {
          aValue = a['Address Eng'] || '';
          bValue = b['Address Eng'] || '';
        } else if (sortBy === 'AC') {
          aValue = a['AC'] || '';
          bValue = b['AC'] || '';
        } else if (sortBy === 'Part') {
          aValue = a['Part'] || '';
          bValue = b['Part'] || '';
        } else if (sortBy === 'Booth') {
          aValue = a['Booth'] || '';
          bValue = b['Booth'] || '';
        } else if (sortBy === 'Sex') {
          aValue = a['Sex'] || '';
          bValue = b['Sex'] || '';
        } else if (sortBy === 'Age') {
          aValue = parseInt(a['Age']) || 0;
          bValue = parseInt(b['Age']) || 0;
        } else if (sortBy === 'pno') {
          aValue = parseInt(a['pno']) || 0;
          bValue = parseInt(b['pno']) || 0;
        } else if (sortBy === 'CardNo') {
          aValue = a['CardNo'] || '';
          bValue = b['CardNo'] || '';
        } else if (sortBy === 'Sr No') {
          aValue = parseInt(a['Sr No']) || 0;
          bValue = parseInt(b['Sr No']) || 0;
        } else if (sortBy === 'House No') {
          aValue = a['House No'] || '';
          bValue = b['House No'] || '';
        } else if (sortBy === 'isPaid') {
          aValue = a.isPaid ? 1 : 0;
          bValue = b.isPaid ? 1 : 0;
        } else if (sortBy === 'isVisited') {
          aValue = a.isVisited ? 1 : 0;
          bValue = b.isVisited ? 1 : 0;
        } else if (sortBy === 'voterType') {
          aValue = a.voterType;
          bValue = b.voterType;
        } else {
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
        }
        
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        if (aValue < bValue) return -1 * multiplier;
        if (aValue > bValue) return 1 * multiplier;
        return 0;
      });
    }
    
    // Apply pagination
    const paginatedResults = combinedResults.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    // Add warning for large datasets
    const warnings = [];
    if (combinedResults.length >= 5000) {
      warnings.push('Large dataset detected. Results are limited to 5000 records per collection for performance.');
    }
    if (totalCount > 10000) {
      warnings.push('Total dataset exceeds 10,000 records. Consider using filters to narrow results.');
    }

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
      },
      analytics,
      filters: {
        isActive,
        isPaid,
        isVisited,
        search,
        sortBy,
        sortOrder,
        voterType
      },
      warnings: warnings.length > 0 ? warnings : undefined
    });
  } catch (error) {
    console.error('Get all voters combined error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching combined voters',
      error: error.message
    });
  }
};

// GET /api/voters/all/stats - Get combined statistics for all voters
const getCombinedVotersStats = async (req, res) => {
  try {
    const { isActive, isPaid, isVisited } = req.query;
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) filter.isVisited = isVisited === 'true';
    
    const [
      voterStats,
      voterFourStats,
      voterCount,
      voterFourCount
    ] = await Promise.all([
      Voter.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            paid: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] } },
            visited: { $sum: { $cond: [{ $eq: ['$isVisited', true] }, 1, 0] } },
            avgAge: { $avg: { $toDouble: '$Age' } }
          }
        }
      ]),
      VoterFour.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            paid: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] } },
            visited: { $sum: { $cond: [{ $eq: ['$isVisited', true] }, 1, 0] } },
            avgAge: { $avg: { $toDouble: '$Age' } }
          }
        }
      ]),
      Voter.countDocuments(filter),
      VoterFour.countDocuments(filter)
    ]);
    
    const voterStatsData = voterStats[0] || { total: 0, active: 0, paid: 0, visited: 0, avgAge: 0 };
    const voterFourStatsData = voterFourStats[0] || { total: 0, active: 0, paid: 0, visited: 0, avgAge: 0 };
    
    const combinedStats = {
      voter: {
        total: voterStatsData.total,
        active: voterStatsData.active,
        inactive: voterStatsData.total - voterStatsData.active,
        paid: voterStatsData.paid,
        unpaid: voterStatsData.total - voterStatsData.paid,
        paidPercentage: voterStatsData.total > 0 
          ? ((voterStatsData.paid / voterStatsData.total) * 100).toFixed(2) 
          : '0.00',
        visited: voterStatsData.visited,
        unvisited: voterStatsData.total - voterStatsData.visited,
        visitedPercentage: voterStatsData.total > 0 
          ? ((voterStatsData.visited / voterStatsData.total) * 100).toFixed(2) 
          : '0.00',
        avgAge: Math.round(voterStatsData.avgAge || 0)
      },
      voterFour: {
        total: voterFourStatsData.total,
        active: voterFourStatsData.active,
        inactive: voterFourStatsData.total - voterFourStatsData.active,
        paid: voterFourStatsData.paid,
        unpaid: voterFourStatsData.total - voterFourStatsData.paid,
        paidPercentage: voterFourStatsData.total > 0 
          ? ((voterFourStatsData.paid / voterFourStatsData.total) * 100).toFixed(2) 
          : '0.00',
        visited: voterFourStatsData.visited,
        unvisited: voterFourStatsData.total - voterFourStatsData.visited,
        visitedPercentage: voterFourStatsData.total > 0 
          ? ((voterFourStatsData.visited / voterFourStatsData.total) * 100).toFixed(2) 
          : '0.00',
        avgAge: Math.round(voterFourStatsData.avgAge || 0)
      },
      combined: {
        total: voterStatsData.total + voterFourStatsData.total,
        active: voterStatsData.active + voterFourStatsData.active,
        inactive: (voterStatsData.total - voterStatsData.active) + (voterFourStatsData.total - voterFourStatsData.active),
        paid: voterStatsData.paid + voterFourStatsData.paid,
        unpaid: (voterStatsData.total - voterStatsData.paid) + (voterFourStatsData.total - voterFourStatsData.paid),
        paidPercentage: (voterStatsData.total + voterFourStatsData.total) > 0 
          ? (((voterStatsData.paid + voterFourStatsData.paid) / (voterStatsData.total + voterFourStatsData.total)) * 100).toFixed(2) 
          : '0.00',
        visited: voterStatsData.visited + voterFourStatsData.visited,
        unvisited: (voterStatsData.total - voterStatsData.visited) + (voterFourStatsData.total - voterFourStatsData.visited),
        visitedPercentage: (voterStatsData.total + voterFourStatsData.total) > 0 
          ? (((voterStatsData.visited + voterFourStatsData.visited) / (voterStatsData.total + voterFourStatsData.total)) * 100).toFixed(2) 
          : '0.00',
        avgAge: Math.round(((voterStatsData.avgAge || 0) + (voterFourStatsData.avgAge || 0)) / 2)
      }
    };
    
    res.json({
      success: true,
      data: combinedStats
    });
  } catch (error) {
    console.error('Get combined voters stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching combined voters statistics',
      error: error.message
    });
  }
};

// GET /api/voters/all/search - Search across both collections
const searchCombinedVoters = async (req, res) => {
  try {
    const { 
      q: searchTerm,
      page = 1,
      limit = 20,
      voterType = 'all',
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const regex = new RegExp(searchTerm, 'i');
    
    const searchFilter = {
      $or: [
        { 'Voter Name Eng': regex },
        { 'Voter Name': regex },
        { 'Relative Name Eng': regex },
        { 'Relative Name': regex },
        { 'Address': regex },
        { 'Address Eng': regex },
        { 'AC': regex },
        { 'Part': regex },
        { 'Booth': regex }
      ]
    };
    
    let voterResults = [];
    let voterFourResults = [];
    let totalCount = 0;
    
    if (voterType === 'all' || voterType === 'voter') {
      const [voters, voterCount] = await Promise.all([
        Voter.find(searchFilter).limit(5000).lean(), // Limit to prevent memory issues
        Voter.countDocuments(searchFilter)
      ]);
      voterResults = voters.map(voter => ({
        ...voter,
        voterType: 'Voter',
        collectionId: voter._id
      }));
      totalCount += voterCount;
    }
    
    if (voterType === 'all' || voterType === 'voterfour') {
      const [voterFour, voterFourCount] = await Promise.all([
        VoterFour.find(searchFilter).limit(5000).lean(), // Limit to prevent memory issues
        VoterFour.countDocuments(searchFilter)
      ]);
      voterFourResults = voterFour.map(voter => ({
        ...voter,
        voterType: 'VoterFour',
        collectionId: voter._id
      }));
      totalCount += voterFourCount;
    }
    
    // Combine and sort results
    let combinedResults = [...voterResults, ...voterFourResults];
    
    // Calculate analytics on COMPLETE search results using database aggregation
    const analyticsFilter = {
      $or: [
        { 'Voter Name Eng': { $regex: searchTerm, $options: 'i' } },
        { 'Voter Name': { $regex: searchTerm, $options: 'i' } },
        { 'Relative Name Eng': { $regex: searchTerm, $options: 'i' } },
        { 'Relative Name': { $regex: searchTerm, $options: 'i' } },
        { 'Address': { $regex: searchTerm, $options: 'i' } },
        { 'Address Eng': { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    const analytics = await calculateCompleteAnalytics(analyticsFilter, voterType);
    
    // Apply sorting
    combinedResults.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'Voter Name Eng') {
        aValue = a['Voter Name Eng'] || '';
        bValue = b['Voter Name Eng'] || '';
      } else if (sortBy === 'voterType') {
        aValue = a.voterType;
        bValue = b.voterType;
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Apply pagination
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
      },
      analytics,
      searchCriteria: {
        searchTerm,
        voterType,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search combined voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching combined voters',
      error: error.message
    });
  }
};

// GET /api/voters/all/stream - Stream voters for very large datasets
const streamAllVotersCombined = async (req, res) => {
  try {
    const { 
      limit = 100,
      isActive, 
      isPaid,
      isVisited,
      search,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc',
      voterType = 'all',
      lastId = null
    } = req.query;
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (isVisited !== undefined) filter.isVisited = isVisited === 'true';
    if (search) {
      filter.$or = [
        { 'Voter Name Eng': { $regex: search, $options: 'i' } },
        { 'Voter Name': { $regex: search, $options: 'i' } },
        { 'Relative Name Eng': { $regex: search, $options: 'i' } },
        { 'Relative Name': { $regex: search, $options: 'i' } },
        { 'Address': { $regex: search, $options: 'i' } },
        { 'Address Eng': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add cursor-based pagination
    if (lastId) {
      if (sortOrder === 'desc') {
        filter._id = { $lt: lastId };
      } else {
        filter._id = { $gt: lastId };
      }
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    sortOptions._id = sortOrder === 'desc' ? -1 : 1; // Secondary sort for cursor pagination
    
    let voters = [];
    let voterFour = [];
    
    if (voterType === 'all' || voterType === 'voter') {
      const voterResults = await Voter.find(filter)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .lean();
      voters = voterResults.map(voter => ({
        ...voter,
        voterType: 'Voter',
        collectionId: voter._id
      }));
    }
    
    if (voterType === 'all' || voterType === 'voterfour') {
      const voterFourResults = await VoterFour.find(filter)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .lean();
      voterFour = voterFourResults.map(voter => ({
        ...voter,
        voterType: 'VoterFour',
        collectionId: voter._id
      }));
    }
    
    // Combine results
    let combinedResults = [...voters, ...voterFour];
    
    // Sort combined results
    combinedResults.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'Voter Name Eng') {
        aValue = a['Voter Name Eng'] || '';
        bValue = b['Voter Name Eng'] || '';
      } else if (sortBy === 'Voter Name') {
        aValue = a['Voter Name'] || '';
        bValue = b['Voter Name'] || '';
      } else if (sortBy === 'pno') {
        aValue = parseInt(a['pno']) || 0;
        bValue = parseInt(b['pno']) || 0;
      } else if (sortBy === 'CardNo') {
        aValue = a['CardNo'] || '';
        bValue = b['CardNo'] || '';
      } else if (sortBy === 'Sr No') {
        aValue = parseInt(a['Sr No']) || 0;
        bValue = parseInt(b['Sr No']) || 0;
      } else if (sortBy === 'Age') {
        aValue = parseInt(a['Age']) || 0;
        bValue = parseInt(b['Age']) || 0;
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Get next cursor
    const nextCursor = combinedResults.length > 0 ? combinedResults[combinedResults.length - 1]._id : null;
    
    res.json({
      success: true,
      data: combinedResults,
      pagination: {
        limit: parseInt(limit),
        hasMore: combinedResults.length === parseInt(limit),
        nextCursor
      },
      filters: {
        isActive,
        isPaid,
        isVisited,
        search,
        sortBy,
        sortOrder,
        voterType
      }
    });
  } catch (error) {
    console.error('Stream all voters combined error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming combined voters',
      error: error.message
    });
  }
};

// GET /api/voters/merged/:voterId/:voterType - Get a single voter from either collection
const getMergedVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
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
        ...voter.toObject(),
        voterType: voterType
      }
    });
  } catch (error) {
    console.error('Get merged voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter',
      error: error.message
    });
  }
};

// PUT /api/voters/merged/:voterId/:voterType - Update a voter in either collection
const updateMergedVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const updateData = req.body;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const updatedVoter = await VoterModel.findByIdAndUpdate(
      voterId,
      { ...updateData, lastUpdated: new Date() },
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
        ...updatedVoter.toObject(),
        voterType: voterType
      }
    });
  } catch (error) {
    console.error('Update merged voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating voter',
      error: error.message
    });
  }
};

// PATCH /api/voters/merged/:voterId/:voterType/status - Update status for either voter type
const updateMergedVoterStatus = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    const { isPaid, isVisited } = req.body;
    
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
    
    const updateData = { lastUpdated: new Date() };
    if (typeof isPaid === 'boolean') updateData.isPaid = isPaid;
    if (typeof isVisited === 'boolean') updateData.isVisited = isVisited;
    
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    const voter = await VoterModel.findByIdAndUpdate(
      voterId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: `${voterType} not found`
      });
    }
    
    res.json({
      success: true,
      message: `${voterType} status updated successfully`,
      data: {
        _id: voter._id,
        'Voter Name Eng': voter['Voter Name Eng'],
        voterType: voterType,
        isPaid: voter.isPaid,
        isVisited: voter.isVisited,
        lastUpdated: voter.lastUpdated
      }
    });
  } catch (error) {
    console.error('Update merged voter status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// DELETE /api/voters/merged/:voterId/:voterType - Delete a voter from either collection
const deleteMergedVoter = async (req, res) => {
  try {
    const { voterId, voterType } = req.params;
    
    // Validate voter type
    if (!['Voter', 'VoterFour'].includes(voterType)) {
      return res.status(400).json({
        success: false,
        message: 'voterType must be either "Voter" or "VoterFour"'
      });
    }
    
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
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
        voterType: voterType,
        voterName: deletedVoter['Voter Name Eng']
      }
    });
  } catch (error) {
    console.error('Delete merged voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting voter',
      error: error.message
    });
  }
};

// POST /api/voters/merged/search - Advanced search across both collections
const searchMergedVoters = async (req, res) => {
  try {
    const {
      search,
      voterType = 'all',
      page = 1,
      limit = 50,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc',
      AC,
      Part,
      Booth,
      Sex,
      ageMin,
      ageMax,
      isPaid,
      isVisited,
      CardNo,
      CodeNo,
      nameOnly = false
    } = req.body;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build base filter
    const buildFilter = () => {
      const filter = {};
      
      // Status filters
      if (isPaid !== undefined) filter.isPaid = isPaid;
      if (isVisited !== undefined) filter.isVisited = isVisited;
      
      // Location filters
      if (AC) filter.AC = { $regex: AC, $options: 'i' };
      if (Part) filter.Part = { $regex: Part, $options: 'i' };
      if (Booth) filter.Booth = { $regex: Booth, $options: 'i' };
      if (Sex) filter.Sex = Sex;
      
      // Identifier filters
      if (CardNo) filter.CardNo = { $regex: CardNo, $options: 'i' };
      if (CodeNo) filter.CodeNo = { $regex: CodeNo, $options: 'i' };
      
      // Age range
      if (ageMin || ageMax) {
        filter.Age = {};
        if (ageMin) filter.Age.$gte = parseInt(ageMin);
        if (ageMax) filter.Age.$lte = parseInt(ageMax);
      }
      
      // Search filter
      if (search) {
        if (nameOnly) {
          filter.$or = [
            { 'Voter Name Eng': { $regex: search, $options: 'i' } },
            { 'Voter Name': { $regex: search, $options: 'i' } },
            { 'Relative Name Eng': { $regex: search, $options: 'i' } },
            { 'Relative Name': { $regex: search, $options: 'i' } }
          ];
        } else {
          filter.$or = [
            { 'Voter Name Eng': { $regex: search, $options: 'i' } },
            { 'Voter Name': { $regex: search, $options: 'i' } },
            { 'Relative Name Eng': { $regex: search, $options: 'i' } },
            { 'Relative Name': { $regex: search, $options: 'i' } },
            { 'Address': { $regex: search, $options: 'i' } },
            { 'Address Eng': { $regex: search, $options: 'i' } },
            { 'Booth': { $regex: search, $options: 'i' } },
            { 'Booth Eng': { $regex: search, $options: 'i' } },
            { 'CardNo': { $regex: search, $options: 'i' } },
            { 'CodeNo': { $regex: search, $options: 'i' } }
          ];
        }
      }
      
      return filter;
    };
    
    const filter = buildFilter();
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    let results = [];
    let totalCount = 0;
    
    // Search Voter collection
    if (voterType === 'all' || voterType === 'Voter') {
      const [voters, count] = await Promise.all([
        Voter.find(filter)
          .sort(sortOptions)
          .skip(voterType === 'all' ? 0 : skip)
          .limit(voterType === 'all' ? Math.ceil(parseInt(limit) / 2) : parseInt(limit))
          .lean(),
        Voter.countDocuments(filter)
      ]);
      
      results = results.concat(voters.map(v => ({ ...v, voterType: 'Voter' })));
      totalCount += count;
    }
    
    // Search VoterFour collection
    if (voterType === 'all' || voterType === 'VoterFour') {
      const [votersFour, count] = await Promise.all([
        VoterFour.find(filter)
          .sort(sortOptions)
          .skip(voterType === 'all' ? 0 : skip)
          .limit(voterType === 'all' ? Math.ceil(parseInt(limit) / 2) : parseInt(limit))
          .lean(),
        VoterFour.countDocuments(filter)
      ]);
      
      results = results.concat(votersFour.map(v => ({ ...v, voterType: 'VoterFour' })));
      totalCount += count;
    }
    
    // If searching both, apply pagination to combined results
    if (voterType === 'all') {
      results = results.slice(skip, skip + parseInt(limit));
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
        search,
        voterType,
        AC,
        Part,
        Booth,
        Sex,
        ageMin,
        ageMax,
        isPaid,
        isVisited,
        CardNo,
        CodeNo,
        nameOnly,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search merged voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching voters',
      error: error.message
    });
  }
};

module.exports = {
  getAllVotersCombined,
  getCombinedVotersStats,
  searchCombinedVoters,
  streamAllVotersCombined,
  getMergedVoter,
  updateMergedVoter,
  updateMergedVoterStatus,
  deleteMergedVoter,
  searchMergedVoters
};
