const express = require('express');
const router = express.Router();
const {
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
} = require('../controller/voterFourController');

// GET /api/voterfour/stats - Get statistics for isPaid and isVisited
router.get('/stats', getVoterFourStats);

// GET /api/voterfour/search - Search VoterFour by Voter Name Eng
router.get('/search', searchVoterFour);

// GET /api/voterfour - Get all VoterFour records with pagination and filtering
router.get('/', getAllVoterFour);

// GET /api/voterfour/:id - Get VoterFour by ID
router.get('/:id', getVoterFourById);

// PUT /api/voterfour/:id - Update VoterFour
router.put('/:id', updateVoterFour);

// DELETE /api/voterfour/:id - Delete VoterFour
router.delete('/:id', deleteVoterFour);

// DELETE /api/voterfour - Delete all VoterFour records (for testing/reset)
router.delete('/', deleteAllVoterFour);

// PATCH /api/voterfour/:id/paid - Update isPaid status
router.patch('/:id/paid', updatePaidStatus);

// PATCH /api/voterfour/:id/visited - Update isVisited status
router.patch('/:id/visited', updateVisitedStatus);

// PATCH /api/voterfour/:id/status - Update both isPaid and isVisited status
router.patch('/:id/status', updateStatus);

module.exports = router;
