const express = require('express');
const router = express.Router();
const {
  getVotersWithAssignmentStatus,
  getAllAssignments,
  unassignVotersFromSubAdmin,
  getSubAdminAssignments,
  getVoterAssignments,
  getAssignmentStats,
  deleteAssignment
} = require('../controller/voterAssignmentController');
// const { authenticateToken } = require('../middleware/auth');

// GET /api/assignment/voters - Get all voters with assignment status (Admin only)
router.get('/voters', getVotersWithAssignmentStatus);

// GET /api/assignment - Get all assignments with filtering (Admin only)
router.get('/', getAllAssignments);

// DELETE /api/assignment/unassign - Unassign voters from sub admin (Admin only)
router.delete('/unassign', unassignVotersFromSubAdmin);

// GET /api/assignment/subadmin/:id - Get all assignments for a sub admin (Admin only)
router.get('/subadmin/:id', getSubAdminAssignments);

// GET /api/assignment/voter/:voterId/:voterType - Get assignments for a specific voter (Admin only)
router.get('/voter/:voterId/:voterType', getVoterAssignments);

// GET /api/assignment/stats - Get assignment statistics (Admin only)
router.get('/stats', getAssignmentStats);

// DELETE /api/assignment/:id - Delete specific assignment (Admin only)
router.delete('/:id', deleteAssignment);

module.exports = router;
