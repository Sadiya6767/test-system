const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getQuestions,
  startTest,
  getAttempt,
  submitAnswer,
  submitTest,
  getResumeFile
} = require('../controllers/testController');

// Configure multer storage for resumes
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/questions', getQuestions);
router.post('/start', upload.single('resume'), startTest);
router.get('/attempt/:id', getAttempt);
router.get('/resume/:attemptId', getResumeFile);
router.post('/answer', submitAnswer);
router.post('/submit', submitTest);

module.exports = router;