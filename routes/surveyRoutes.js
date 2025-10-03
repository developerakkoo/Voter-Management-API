const express = require('express');
const router = express.Router();
const {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  deleteAllSurveys,
  updateSurveyStatus,
  getSurveyStats,
  searchSurveys,
  getSurveysBySurveyor,
  getSurveysByVoter,
  getAvailableVoters
} = require('../controller/surveyController');

// GET /api/survey/stats - Get survey statistics
router.get('/stats', getSurveyStats);

// GET /api/survey/available-voters - Get available voters for testing
router.get('/available-voters', getAvailableVoters);

// GET /api/survey/search - Search surveys
router.get('/search', searchSurveys);

// GET /api/survey/surveyor/:surveyorId - Get surveys by surveyor
router.get('/surveyor/:surveyorId', getSurveysBySurveyor);

// GET /api/survey/voter/:voterId/:voterType - Get surveys by voter
router.get('/voter/:voterId/:voterType', getSurveysByVoter);

// GET /api/survey - Get all surveys with pagination, filtering, and search
router.get('/', getAllSurveys);

// GET /api/survey/:id - Get survey by ID (must be last)
router.get('/:id', getSurveyById);

// POST /api/survey - Create new survey
router.post('/', createSurvey);

// PUT /api/survey/:id - Update survey
router.put('/:id', updateSurvey);

// PATCH /api/survey/:id/status - Update survey status
router.patch('/:id/status', updateSurveyStatus);

// DELETE /api/survey/:id - Delete survey
router.delete('/:id', deleteSurvey);

// DELETE /api/survey - Delete all surveys
router.delete('/', deleteAllSurveys);

module.exports = router;
