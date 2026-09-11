const express = require('express');
const router = express.Router();
const {
  getQuestions,
  startTest,
  getAttempt,
  submitAnswer,
  submitTest
} = require('../controllers/testController');

router.get('/questions', getQuestions);
router.post('/start', startTest);
router.get('/attempt/:id', getAttempt);
router.post('/answer', submitAnswer);
router.post('/submit', submitTest);

module.exports = router;