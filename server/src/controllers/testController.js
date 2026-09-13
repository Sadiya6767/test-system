const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TRACK_NAMES = {
  SALES_ENGINEER: 'Web Developer cum Sales Engineer',
  HR_RECRUITER: 'Web Developer cum HR Recruiter',
  DIGITAL_MARKETING: 'Web Developer cum Digital Marketing',
};

/**
 * GET /api/test/questions?track=...
 * Returns the 15 active questions for the requested track without correctAnswer
 */
const getQuestions = async (req, res) => {
  try {
    const { track } = req.query;
    const activeTrack = (track && TRACK_NAMES[track]) ? track : 'SALES_ENGINEER';

    const questions = await prisma.question.findMany({
      where: { track: activeTrack },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        section: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true
      }
    });

    return res.status(200).json({
      success: true,
      track: activeTrack,
      trackTitle: TRACK_NAMES[activeTrack],
      questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load test questions.'
    });
  }
};

/**
 * POST /api/test/start (multipart form data with resume)
 * Registers candidate with full academic profile and creates an INCOMPLETE test attempt
 */
const startTest = async (req, res) => {
  try {
    const {
      candidateName,
      email,
      phone,
      college,
      course,
      branch,
      passingYear,
      currentCity,
      track
    } = req.body;

    if (!candidateName || typeof candidateName !== 'string' || candidateName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required.'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const trimmedName = candidateName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? phone.trim() : null;
    const trimmedCollege = college ? college.trim() : null;
    const trimmedCourse = course ? course.trim() : null;
    const trimmedBranch = branch ? branch.trim() : null;
    const trimmedYear = passingYear ? passingYear.trim() : null;
    const trimmedCity = currentCity ? currentCity.trim() : null;

    const normalizedTrack = (track && TRACK_NAMES[track]) ? track : 'SALES_ENGINEER';
    const readableTrack = TRACK_NAMES[normalizedTrack];

    // Single Attempt Enforcement: Block if candidate with this email or phone has already taken the test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          ...(trimmedPhone ? [{ phone: trimmedPhone }] : [])
        ]
      },
      orderBy: { startedAt: 'desc' }
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this test. Each candidate is strictly allowed only one attempt.'
        });
      }

      // If they have an incomplete attempt started within the last 30 minutes, prompt to resume
      const attemptAgeMinutes = (Date.now() - new Date(existingAttempt.startedAt).getTime()) / (1000 * 60);
      if (attemptAgeMinutes < 30) {
        return res.status(400).json({
          success: false,
          message: 'You already have an ongoing test session in progress. Please resume your session.',
          canResume: true,
          attemptId: existingAttempt.id
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Your test session has expired. Each candidate is allowed only one attempt.'
        });
      }
    }

    let fileBase64 = null;
    let originalName = 'resume.pdf';
    let mimeType = 'application/pdf';
    let fileSize = 0;

    if (req.file) {
      originalName = req.file.originalname;
      mimeType = req.file.mimetype || 'application/pdf';
      fileSize = req.file.size || 0;
      try {
        const buffer = fs.readFileSync(req.file.path);
        fileBase64 = buffer.toString('base64');
      } catch (fErr) {
        console.error('Error reading resume buffer:', fErr);
      }
    }

    const questions = await prisma.question.findMany({
      where: { track: normalizedTrack },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        section: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true
      }
    });

    if (!questions || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No test questions available for this track. Please contact administrator.'
      });
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        candidateName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        college: trimmedCollege,
        course: trimmedCourse,
        branch: trimmedBranch,
        passingYear: trimmedYear,
        currentCity: trimmedCity,
        resumeUrl: req.file ? `/api/test/resume/pending` : null,
        track: readableTrack,
        totalQuestions: questions.length,
        status: 'INCOMPLETE'
      }
    });

    let permanentResumeUrl = null;
    if (req.file) {
      permanentResumeUrl = `/api/test/resume/${attempt.id}`;
      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { resumeUrl: permanentResumeUrl }
      });

      if (fileBase64) {
        try {
          await prisma.candidateResume.create({
            data: {
              attemptId: attempt.id,
              filename: originalName,
              mimetype: mimeType,
              data: fileBase64,
              size: fileSize
            }
          });
        } catch (dbResumeErr) {
          console.error('Failed to store resume in database:', dbResumeErr);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Test started successfully.',
      attempt: {
        id: attempt.id,
        candidateName: attempt.candidateName,
        email: attempt.email,
        college: attempt.college,
        course: attempt.course,
        branch: attempt.branch,
        passingYear: attempt.passingYear,
        currentCity: attempt.currentCity,
        track: attempt.track,
        totalQuestions: attempt.totalQuestions,
        startedAt: attempt.startedAt,
        status: attempt.status
      },
      questions
    });
  } catch (error) {
    console.error('Error starting test:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to start the test. Please try again.'
    });
  }
};

/**
 * GET /api/test/attempt/:id
 * Fetches existing attempt for page refresh recovery
 */
const getAttempt = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: {
        answers: {
          select: {
            questionId: true,
            selectedAnswer: true,
            answered: true,
            timeTaken: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found.'
      });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        isCompleted: true,
        attempt: {
          id: attempt.id,
          candidateName: attempt.candidateName,
          email: attempt.email,
          track: attempt.track,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          wrongAnswers: attempt.wrongAnswers,
          unanswered: attempt.unanswered,
          percentage: attempt.percentage,
          completedAt: attempt.completedAt,
          status: attempt.status
        }
      });
    }

    const answeredQuestionIds = attempt.answers.map(a => a.questionId);

    return res.status(200).json({
      success: true,
      isCompleted: false,
      attempt: {
        id: attempt.id,
        candidateName: attempt.candidateName,
        email: attempt.email,
        college: attempt.college,
        course: attempt.course,
        branch: attempt.branch,
        passingYear: attempt.passingYear,
        currentCity: attempt.currentCity,
        track: attempt.track,
        totalQuestions: attempt.totalQuestions,
        startedAt: attempt.startedAt,
        status: attempt.status
      },
      answeredQuestionIds
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve test attempt.'
    });
  }
};

/**
 * POST /api/test/answer
 * Records an answer for a specific question within an active attempt
 */
const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer, timeTaken } = req.body;

    if (!attemptId || questionId === undefined || questionId === null) {
      return res.status(400).json({
        success: false,
        message: 'attemptId and questionId are required.'
      });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found.'
      });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This test has already been completed.'
      });
    }

    const numericQuestionId = parseInt(questionId, 10);
    const question = await prisma.question.findUnique({
      where: { id: numericQuestionId }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const isAnswerProvided = selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer !== '';
    const normalizedSelected = isAnswerProvided ? String(selectedAnswer).trim().toUpperCase() : null;
    const isCorrect = isAnswerProvided && normalizedSelected === question.correctAnswer.toUpperCase();
    const parsedTimeTaken = typeof timeTaken === 'number' && !isNaN(timeTaken) ? Math.min(Math.max(timeTaken, 0), 10) : 7.0;

    await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: numericQuestionId
        }
      },
      update: {
        selectedAnswer: normalizedSelected,
        correctAnswer: question.correctAnswer,
        isCorrect,
        answered: isAnswerProvided,
        timeTaken: parseFloat(parsedTimeTaken.toFixed(2))
      },
      create: {
        attemptId,
        questionId: numericQuestionId,
        selectedAnswer: normalizedSelected,
        correctAnswer: question.correctAnswer,
        isCorrect,
        answered: isAnswerProvided,
        timeTaken: parseFloat(parsedTimeTaken.toFixed(2))
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Answer recorded.'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record answer.'
    });
  }
};

/**
 * POST /api/test/submit
 * Finalizes test attempt for all questions of that track, calculates final score and percentage
 */
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'attemptId is required.'
      });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: true }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found.'
      });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        message: 'Test is already submitted.',
        result: {
          id: attempt.id,
          candidateName: attempt.candidateName,
          email: attempt.email,
          track: attempt.track,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          wrongAnswers: attempt.wrongAnswers,
          unanswered: attempt.unanswered,
          percentage: attempt.percentage,
          status: attempt.status,
          completedAt: attempt.completedAt
        }
      });
    }

    // Determine track key from attempt.track string
    let trackKey = 'SALES_ENGINEER';
    for (const [key, name] of Object.entries(TRACK_NAMES)) {
      if (attempt.track === name) {
        trackKey = key;
        break;
      }
    }

    const trackQuestions = await prisma.question.findMany({
      where: { track: trackKey },
      orderBy: { order: 'asc' }
    });

    const recordedQuestionIds = new Set(attempt.answers.map(a => a.questionId));

    for (const q of trackQuestions) {
      if (!recordedQuestionIds.has(q.id)) {
        await prisma.answer.create({
          data: {
            attemptId,
            questionId: q.id,
            selectedAnswer: null,
            correctAnswer: q.correctAnswer,
            isCorrect: false,
            answered: false,
            timeTaken: 7.0
          }
        });
      }
    }

    const finalAnswers = await prisma.answer.findMany({
      where: { attemptId }
    });

    const totalQuestions = trackQuestions.length;
    let correctAnswers = 0;
    let answeredCount = 0;

    for (const ans of finalAnswers) {
      if (ans.isCorrect) correctAnswers++;
      if (ans.answered) answeredCount++;
    }

    const wrongAnswers = answeredCount - correctAnswers;
    const unanswered = totalQuestions - answeredCount;
    const score = correctAnswers;
    const percentage = totalQuestions > 0 ? parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;
    const completedAt = new Date();

    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        percentage,
        status: 'COMPLETED',
        completedAt
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Test completed and result recorded.',
      result: {
        id: updatedAttempt.id,
        candidateName: updatedAttempt.candidateName,
        email: updatedAttempt.email,
        college: updatedAttempt.college,
        course: updatedAttempt.course,
        branch: updatedAttempt.branch,
        passingYear: updatedAttempt.passingYear,
        currentCity: updatedAttempt.currentCity,
        track: updatedAttempt.track,
        totalQuestions: updatedAttempt.totalQuestions,
        status: updatedAttempt.status,
        completedAt: updatedAttempt.completedAt
      }
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save your result. Please try again.'
    });
  }
};

/**
 * GET /api/test/resume/:attemptId
 * Streams or downloads candidate resume file directly from database or disk
 */
const getResumeFile = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // 1. Try finding in database
    const resumeRecord = await prisma.candidateResume.findUnique({
      where: { attemptId }
    });

    if (resumeRecord && resumeRecord.data) {
      const fileBuffer = Buffer.from(resumeRecord.data, 'base64');
      res.setHeader('Content-Type', resumeRecord.mimetype || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resumeRecord.filename)}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      return res.send(fileBuffer);
    }

    // 2. Fallback to disk if local file exists
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
    });

    if (attempt && attempt.resumeUrl) {
      const diskPath = path.join(__dirname, '../../uploads', path.basename(attempt.resumeUrl));
      if (fs.existsSync(diskPath)) {
        return res.sendFile(diskPath);
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Resume file not found.'
    });
  } catch (error) {
    console.error('Error fetching resume file:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume file.'
    });
  }
};

module.exports = {
  getQuestions,
  startTest,
  getAttempt,
  submitAnswer,
  submitTest,
  getResumeFile
};