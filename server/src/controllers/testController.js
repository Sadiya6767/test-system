const prisma = require('../prisma');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/test/questions
 * Returns all active questions without the correctAnswer field to protect test integrity
 */
const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true
      }
    });

    return res.status(200).json({
      success: true,
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
 * POST /api/test/start
 * Registers candidate info and creates an INCOMPLETE test attempt
 */
const startTest = async (req, res) => {
  try {
    const { candidateName, email, college, phone } = req.body;

    if (!candidateName || typeof candidateName !== 'string' || candidateName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required.'
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
    const trimmedCollege = college ? college.trim() : null;
    const trimmedPhone = phone ? phone.trim() : null;

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
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
        message: 'No test questions available. Please contact administrator.'
      });
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        candidateName: trimmedName,
        email: trimmedEmail,
        college: trimmedCollege,
        phone: trimmedPhone,
        totalQuestions: questions.length,
        status: 'INCOMPLETE'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Test started successfully.',
      attempt: {
        id: attempt.id,
        candidateName: attempt.candidateName,
        email: attempt.email,
        college: attempt.college,
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
    const parsedTimeTaken = typeof timeTaken === 'number' && !isNaN(timeTaken) ? Math.min(Math.max(timeTaken, 0), 10) : 5.0;

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
 * Finalizes test attempt, ensures all questions have records, calculates final score and percentage
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

    // If already completed, return existing final result
    if (attempt.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        message: 'Test is already submitted.',
        result: {
          id: attempt.id,
          candidateName: attempt.candidateName,
          email: attempt.email,
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

    const allQuestions = await prisma.question.findMany({
      orderBy: { order: 'asc' }
    });

    const recordedQuestionIds = new Set(attempt.answers.map(a => a.questionId));

    // For any unrecorded question, fill in as unanswered
    for (const q of allQuestions) {
      if (!recordedQuestionIds.has(q.id)) {
        await prisma.answer.create({
          data: {
            attemptId,
            questionId: q.id,
            selectedAnswer: null,
            correctAnswer: q.correctAnswer,
            isCorrect: false,
            answered: false,
            timeTaken: 5.0
          }
        });
      }
    }

    // Refresh answers after filling missing ones
    const finalAnswers = await prisma.answer.findMany({
      where: { attemptId }
    });

    const totalQuestions = allQuestions.length;
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
        phone: updatedAttempt.phone,
        score: updatedAttempt.score,
        totalQuestions: updatedAttempt.totalQuestions,
        correctAnswers: updatedAttempt.correctAnswers,
        wrongAnswers: updatedAttempt.wrongAnswers,
        unanswered: updatedAttempt.unanswered,
        percentage: updatedAttempt.percentage,
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

module.exports = {
  getQuestions,
  startTest,
  getAttempt,
  submitAnswer,
  submitTest
};