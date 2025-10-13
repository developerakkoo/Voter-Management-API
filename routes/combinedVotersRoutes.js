const express = require('express');
const router = express.Router();
const {
  getAllVotersCombined,
  getCombinedVotersStats,
  searchCombinedVoters,
  streamAllVotersCombined,
  getMergedVoter,
  updateMergedVoter,
  updateMergedVoterStatus,
  deleteMergedVoter,
  searchMergedVoters,
  exportAllVoters,
  downloadVotersExcel,
  streamVotersExport
} = require('../controller/combinedVotersController');

// GET /api/voters/all - Get all voters from both Voter and VoterFour collections
router.get('/all', getAllVotersCombined);

// GET /api/voters/all/stats - Get combined statistics for all voters
router.get('/all/stats', getCombinedVotersStats);

// GET /api/voters/all/search - Search across both collections
router.get('/all/search', searchCombinedVoters);

// GET /api/voters/all/stream - Stream voters for very large datasets
router.get('/all/stream', streamAllVotersCombined);

// POST /api/voters/merged/search - Advanced search across both collections
router.post('/merged/search', searchMergedVoters);

// GET /api/voters/merged/:voterId/:voterType - Get a single voter from either collection
router.get('/merged/:voterId/:voterType', getMergedVoter);

// PUT /api/voters/merged/:voterId/:voterType - Update a voter in either collection
router.put('/merged/:voterId/:voterType', updateMergedVoter);

// PATCH /api/voters/merged/:voterId/:voterType/status - Update voter status
router.patch('/merged/:voterId/:voterType/status', updateMergedVoterStatus);

// DELETE /api/voters/merged/:voterId/:voterType - Delete a voter from either collection
router.delete('/merged/:voterId/:voterType', deleteMergedVoter);

// GET /api/voters/export - Export all voters to Excel
router.get('/export', exportAllVoters);

// GET /api/voters/export/download/:filename - Download Excel file
router.get('/export/download/:filename', downloadVotersExcel);

// GET /api/voters/export/stream - Stream voters export for large datasets
router.get('/export/stream', streamVotersExport);

module.exports = router;
