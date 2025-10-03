const express = require('express');
const router = express.Router();
const {
  getAllVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  deleteAllVoters,
  updatePaidStatus,
  updateVisitedStatus,
  updateStatus,
  getVoterStats,
  searchVoters,
  searchAllVoters
} = require('../controller/voterController');

// GET /api/voter/stats - Get statistics for isPaid and isVisited
router.get('/stats', getVoterStats);

// GET /api/voter/search - Search voters by Voter Name Eng (paginated)
router.get('/search', searchVoters);

// GET /api/voter/search/all - Search all voters matching criteria (no pagination)
router.get('/search/all', searchAllVoters);

// GET /api/voter - Get all voters with pagination and filtering
router.get('/', getAllVoters);

// GET /api/voter/:id - Get voter by ID
router.get('/:id', getVoterById);

// PUT /api/voter/:id - Update voter
router.put('/:id', updateVoter);

// DELETE /api/voter/:id - Delete voter
router.delete('/:id', deleteVoter);

// DELETE /api/voter - Delete all voters (for testing/reset)
router.delete('/', deleteAllVoters);

// PATCH /api/voter/:id/paid - Update isPaid status
router.patch('/:id/paid', updatePaidStatus);

// PATCH /api/voter/:id/visited - Update isVisited status
router.patch('/:id/visited', updateVisitedStatus);

// PATCH /api/voter/:id/status - Update both isPaid and isVisited status
router.patch('/:id/status', updateStatus);

module.exports = router;
