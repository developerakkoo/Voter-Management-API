const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getVotersWithAssignmentStatus,
  getAllAssignments,
  unassignVotersFromSubAdmin,
  getSubAdminAssignments,
  getVoterAssignments,
  getAssignmentStats,
  deleteAssignment,
  assignVotersToSubAdmin,
  assignVotersFromExcel,
  getAssignmentPageData,
  assignSelectedVoters,
  getUnassignedVoters,
  getVoterFilterOptions,
  getVoterFourFilterOptions
} = require('../controller/voterAssignmentController');
// const { authenticateToken } = require('../middleware/auth');

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/assignment/assignment-page - Get voters for assignment page with all filters
router.get('/assignment-page', getAssignmentPageData);

// GET /api/assignment/unassigned/:voterType - Get unassigned voters for a sub-admin
router.get('/unassigned/:voterType', getUnassignedVoters);

// GET /api/assignment/voters - Get all voters with assignment status (Admin only)
router.get('/voters', getVotersWithAssignmentStatus);

// GET /api/assignment - Get all assignments with filtering (Admin only)
router.get('/', getAllAssignments);

// POST /api/assignment/assign - Assign specific voters to sub admin
router.post('/assign', assignVotersToSubAdmin);

// POST /api/assignment/assign-selected - Assign selected voters (100, 500, 1000+)
router.post('/assign-selected', assignSelectedVoters);

// POST /api/assignment/assign-from-excel - Assign voters from Excel file
router.post('/assign-from-excel', upload.single('file'), assignVotersFromExcel);

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
