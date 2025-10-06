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

// routes/searchVoterFour.js
// const VoterFour = require("../models/VoterFour");

// --- helpers ---------------------------------------------------
const normTokens = (q = "") =>
  q.replace(/[^A-Za-z\s]+/g, " ")
   .replace(/\s+/g, " ")
   .trim()
   .split(" ")
   .filter(Boolean)
   .map((s) => s.toLowerCase());

function buildCompound(qRaw, { nameOnly = false } = {}) {
  const tokens = normTokens(qRaw);
  const must = [];
  const should = [];
  const filter = [];

  // 1) MUST: each token present as a prefix in name/relative (order-agnostic)
  tokens.forEach((t) => {
    const perToken = [
      { autocomplete: { path: "Voter Name Eng", query: t, fuzzy: { maxEdits: 1, prefixLength: 1 } } },
      ...(nameOnly ? [] : [
        { autocomplete: { path: "Relative Name Eng", query: t, fuzzy: { maxEdits: 1, prefixLength: 1 } } },
      ]),
    ];
    must.push({ compound: { should: perToken, minimumShouldMatch: 1 } });

    // single-letter fallback (since minGrams=2)
    if (t.length === 1) {
      must.push({ wildcard: { path: "Voter Name Eng", query: `${t}*`, allowAnalyzedField: true } });
    }
  });

  // 2) SHOULD: adjacency boosts (both orders) on names
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const a = tokens[i], b = tokens[j];
      should.push(
        { autocomplete: { path: "Voter Name Eng", query: `${a} ${b}`, fuzzy: { maxEdits: 1, prefixLength: 1 }, score: { boost: { value: 14 } } } },
        { autocomplete: { path: "Voter Name Eng", query: `${b} ${a}`, fuzzy: { maxEdits: 1, prefixLength: 1 }, score: { boost: { value: 14 } } } },
      );
      if (!nameOnly) {
        should.push(
          { autocomplete: { path: "Relative Name Eng", query: `${a} ${b}`, fuzzy: { maxEdits: 1, prefixLength: 1 }, score: { boost: { value: 7 } } } },
          { autocomplete: { path: "Relative Name Eng", query: `${b} ${a}`, fuzzy: { maxEdits: 1, prefixLength: 1 }, score: { boost: { value: 7 } } } },
        );
      }
    }
  }

  // 3) SHOULD: phrase boost for overall sequence (and reversed)
  if (tokens.length >= 2) {
    const rev = [...tokens].reverse();
    should.push(
      { phrase: { path: "Voter Name Eng", query: tokens, slop: 1, score: { boost: { value: 10 } } } },
      { phrase: { path: "Voter Name Eng", query: rev,    slop: 1, score: { boost: { value: 10 } } } },
    );
  }

  // 4) SHOULD: initials exact (lowercase to match token normalizer)
  if (tokens.length >= 2) {
    const letters = tokens.map((t) => t[0]).filter(Boolean);
    if (letters.length >= 2) {
      should.push(
        { equals: { path: "initials",       value: letters.join(""),   score: { boost: { value: 16 } } } },
        { equals: { path: "initialsSpaced", value: letters.join(" "),  score: { boost: { value: 14 } } } },
        { equals: { path: "initialsDotted", value: letters.join("."),  score: { boost: { value: 14 } } } },
      );
    }
  }

  // 5) SHOULD: full-text + fuzzy on English names; Marathi names/addresses too
  should.push(
    { text: { path: ["Voter Name Eng"],          query: qRaw, fuzzy: { maxEdits: 1 }, score: { boost: { value: 6 } } } },
    ...(nameOnly ? [] : [
      { text: { path: ["Relative Name Eng"],     query: qRaw, fuzzy: { maxEdits: 1 }, score: { boost: { value: 3 } } } },
      { text: { path: ["Address Eng","Booth Eng"], query: qRaw, fuzzy: { maxEdits: 1 }, score: { boost: { value: 1 } } } },
      { text: { path: ["Voter Name","Address","Booth"], query: qRaw, score: { boost: { value: 1 } } } },
    ])
  );

  return { must, should, filter, minimumShouldMatch: 1 };
}

// --- main handler ----------------------------------------------------------
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
      limit = 100,
      sortBy = "Voter Name Eng",
      sortOrder = "asc",
      // "relevance" (default) keeps Atlas order; "field" sorts by your field.
      sortMode = "relevance",
    } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query (q) is required" });
    }

    const pg   = Math.max(1, parseInt(page, 10) || 1);
    const lim  = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pg - 1) * lim;

    const compound = buildCompound(q, { nameOnly: nameOnly === "true" });

    // Pre-score filters
    compound.filter = compound.filter || [];
    if (isPaid !== undefined)    compound.filter.push({ equals: { path: "isPaid",    value: isPaid === "true" } });
    if (isVisited !== undefined) compound.filter.push({ equals: { path: "isVisited", value: isVisited === "true" } });
    if (isActive !== undefined)  compound.filter.push({ equals: { path: "isActive",  value: isActive === "true" } });
    if (sourceFile)              compound.filter.push({ equals: { path: "sourceFile", value: String(sourceFile).toLowerCase() } });

    const pipeline = [
      { $search: { index: "voterfour_search", compound } },
      { $addFields: { score: { $meta: "searchScore" } } }, // debug only
    ];

    if (sortMode === "field") {
      pipeline.push({ $sort: { [sortBy]: (sortOrder === "desc" ? -1 : 1), _id: 1 } });
    }
    pipeline.push({ $skip: skip }, { $limit: lim });

    const countPipeline = [
      { $searchMeta: { index: "voterfour_search", compound, count: { type: "total" } } }
    ];

    const [rows, meta] = await Promise.all([
      VoterFour.aggregate(pipeline).allowDiskUse(true),
      VoterFour.aggregate(countPipeline),
    ]);

    const totalCount = meta?.[0]?.count?.total ?? 0;

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: pg,
        totalPages: Math.ceil(totalCount / lim),
        totalCount,
        hasNextPage: pg * lim < totalCount,
        hasPrevPage: pg > 1,
        limit: lim,
      },
      searchCriteria: { q, isPaid, isVisited, isActive, sourceFile, nameOnly, sortBy, sortOrder, sortMode }
    });
  } catch (error) {
    console.error("Search VoterFour error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching VoterFour records",
      error: error.message,
    });
  }
};





// GET /api/voterfour/search - Search VoterFour by Voter Name Eng
// const searchVoterFour = async (req, res) => {
//   try {
//     const {
//       q,
//       isPaid,
//       isVisited,
//       isActive,
//       sourceFile,
//       nameOnly,
//       page = 1,
//       limit = 100,
//       sortBy = 'Voter Name Eng',
//       sortOrder = 'asc'
//     } = req.query;

//     if (!q) {
//       return res.status(400).json({
//         success: false,
//         message: 'Search query (q) is required'
//       });
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Build search filter
//     let searchFilter = {};
    
//     if (nameOnly === 'true') {
//       // Search only in name fields
//       searchFilter.$or = [
//         { 'Voter Name Eng': { $regex: q, $options: 'i' } },
//         { 'Voter Name': { $regex: q, $options: 'i' } },
//         { 'Relative Name Eng': { $regex: q, $options: 'i' } },
//         { 'Relative Name': { $regex: q, $options: 'i' } }
//       ];
//     } else {
//       // Search in all fields
//       searchFilter.$or = [
//         { 'Voter Name Eng': { $regex: q, $options: 'i' } },
//         { 'Voter Name': { $regex: q, $options: 'i' } },
//         { 'Relative Name Eng': { $regex: q, $options: 'i' } },
//         { 'Relative Name': { $regex: q, $options: 'i' } },
//         { 'Address': { $regex: q, $options: 'i' } },
//         { 'Address Eng': { $regex: q, $options: 'i' } }
//       ];
//     }

//     // Add additional filters
//     if (isPaid !== undefined) searchFilter.isPaid = isPaid === 'true';
//     if (isVisited !== undefined) searchFilter.isVisited = isVisited === 'true';
//     if (isActive !== undefined) searchFilter.isActive = isActive === 'true';
//     if (sourceFile) searchFilter.sourceFile = { $regex: sourceFile, $options: 'i' };

//     // Build sort object
//     const sortOptions = {};
//     sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Search VoterFour records
//     const voters = await VoterFour.find(searchFilter)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     // Get total count
//     const totalCount = await VoterFour.countDocuments(searchFilter);
//     const totalPages = Math.ceil(totalCount / parseInt(limit));

//     res.json({
//       success: true,
//       data: voters,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages,
//         totalCount,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//         limit: parseInt(limit)
//       },
//       searchCriteria: {
//         query: q,
//         isPaid,
//         isVisited,
//         isActive,
//         sourceFile,
//         nameOnly,
//         sortBy,
//         sortOrder
//       }
//     });
//   } catch (error) {
//     console.error('Search VoterFour error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error searching VoterFour records',
//       error: error.message
//     });
//   }
// };

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
