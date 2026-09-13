const express = require('express');
const router = express.Router();
const {
  login,
  getStats,
  getResults,
  getResultById,
  deleteResult,
  exportCsv
} = require('../controllers/adminController');
const { getResumeFile } = require('../controllers/testController');
const { verifyAdmin } = require('../middleware/auth');

// Public route for authentication
router.post('/login', login);

// Protected routes (JWT required)
router.get('/stats', verifyAdmin, getStats);
router.get('/results', verifyAdmin, getResults);
router.get('/results/:id', verifyAdmin, getResultById);
router.delete('/results/:id', verifyAdmin, deleteResult);
router.get('/export', verifyAdmin, exportCsv);
router.get('/resume/:attemptId', getResumeFile);

module.exports = router;