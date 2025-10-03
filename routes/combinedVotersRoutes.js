const express = require('express');
const router = express.Router();
const {
  getAllVotersCombined,
  getCombinedVotersStats,
  searchCombinedVoters,
  streamAllVotersCombined
} = require('../controller/combinedVotersController');

// GET /api/voters/all - Get all voters from both Voter and VoterFour collections
router.get('/all', getAllVotersCombined);

// GET /api/voters/all/stats - Get combined statistics for all voters
router.get('/all/stats', getCombinedVotersStats);

// GET /api/voters/all/search - Search across both collections
router.get('/all/search', searchCombinedVoters);

// GET /api/voters/all/stream - Stream voters for very large datasets
router.get('/all/stream', streamAllVotersCombined);

module.exports = router;
