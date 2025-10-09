const express = require('express');
const router = express.Router();
const {
  createVoter,
  createMultipleVoters,
  getVoter,
  updateVoter,
  deleteVoter,
  searchVoters
} = require('../controller/unifiedVoterController');

// POST /api/unified-voter - Create a voter in either Voter or VoterFour collection
router.post('/', createVoter);

// POST /api/unified-voter/bulk - Create multiple voters at once
router.post('/bulk', createMultipleVoters);

// POST /api/unified-voter/search - Search voters in both collections
router.post('/search', searchVoters);

// GET /api/unified-voter/:voterId/:voterType - Get a voter from either collection
router.get('/:voterId/:voterType', getVoter);

// PUT /api/unified-voter/:voterId/:voterType - Update a voter in either collection
router.put('/:voterId/:voterType', updateVoter);

// DELETE /api/unified-voter/:voterId/:voterType - Delete a voter from either collection
router.delete('/:voterId/:voterType', deleteVoter);

module.exports = router;

