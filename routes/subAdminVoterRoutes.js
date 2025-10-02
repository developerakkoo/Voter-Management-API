const express = require('express');
const router = express.Router();
const {
  getAssignedVoters,
  getAssignedVoter,
  updateAssignedVoter,
  updateAssignedVoterPaidStatus,
  updateAssignedVoterVisitedStatus,
  updateAssignedVoterStatus,
  getAssignedVotersStats,
  searchAssignedVoters,
  filterAssignedVoters
} = require('../controller/subAdminVoterController');
const { authenticateSubAdmin } = require('../middleware/subAdminAuth');

// GET /api/subadmin/voters/stats - Get statistics for assigned voters
router.get('/stats', authenticateSubAdmin, getAssignedVotersStats);

// GET /api/subadmin/voters/search - Search assigned voters with advanced filtering
router.get('/search', authenticateSubAdmin, searchAssignedVoters);

// GET /api/subadmin/voters/filter - Get assigned voters with advanced filtering
router.get('/filter', authenticateSubAdmin, filterAssignedVoters);

// GET /api/subadmin/voters - Get assigned voters for sub admin
router.get('/', authenticateSubAdmin, getAssignedVoters);

// GET /api/subadmin/voters/:voterId/:voterType - Get specific assigned voter
router.get('/:voterId/:voterType', authenticateSubAdmin, getAssignedVoter);

// PUT /api/subadmin/voters/:voterId/:voterType - Update assigned voter
router.put('/:voterId/:voterType', authenticateSubAdmin, updateAssignedVoter);

// PATCH /api/subadmin/voters/:voterId/:voterType/paid - Update payment status
router.patch('/:voterId/:voterType/paid', authenticateSubAdmin, updateAssignedVoterPaidStatus);

// PATCH /api/subadmin/voters/:voterId/:voterType/visited - Update visit status
router.patch('/:voterId/:voterType/visited', authenticateSubAdmin, updateAssignedVoterVisitedStatus);

// PATCH /api/subadmin/voters/:voterId/:voterType/status - Update both statuses
router.patch('/:voterId/:voterType/status', authenticateSubAdmin, updateAssignedVoterStatus);

module.exports = router;
