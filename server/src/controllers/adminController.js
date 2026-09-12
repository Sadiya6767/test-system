const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/admin/login
 * Authenticates admin and returns JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const secret = process.env.JWT_SECRET || 'timed-test-jwt-super-secret-key-2026-production';
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error.'
    });
  }
};

/**
 * GET /api/admin/stats
 * Aggregates candidate statistics and score distributions
 */
const getStats = async (req, res) => {
  try {
    const totalCandidates = await prisma.testAttempt.count();
    const completedTests = await prisma.testAttempt.count({
      where: { status: 'COMPLETED' }
    });
    const incompleteTests = await prisma.testAttempt.count({
      where: { status: 'INCOMPLETE' }
    });

    const completedAttempts = await prisma.testAttempt.findMany({
      where: { status: 'COMPLETED' },
      select: { percentage: true, score: true, track: true }
    });

    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = 0;

    const distribution = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };

    const trackCounts = {};

    if (completedAttempts.length > 0) {
      const percentages = completedAttempts.map(a => a.percentage);
      const sum = percentages.reduce((acc, curr) => acc + curr, 0);
      averageScore = parseFloat((sum / percentages.length).toFixed(1));
      highestScore = Math.max(...percentages);
      lowestScore = Math.min(...percentages);

      for (const a of completedAttempts) {
        const p = a.percentage;
        if (p <= 20) distribution['0-20%']++;
        else if (p <= 40) distribution['21-40%']++;
        else if (p <= 60) distribution['41-60%']++;
        else if (p <= 80) distribution['61-80%']++;
        else distribution['81-100%']++;

        trackCounts[a.track] = (trackCounts[a.track] || 0) + 1;
      }
    }

    const distributionChartData = Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        completedTests,
        incompleteTests,
        averageScore,
        highestScore,
        lowestScore,
        distribution: distributionChartData,
        trackCounts
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment statistics.'
    });
  }
};

/**
 * GET /api/admin/results
 * Returns filtered, searched, and sorted list of candidates
 */
const getResults = async (req, res) => {
  try {
    const { search, status, scoreRange, sort, track } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (track && track !== 'ALL') {
      where.track = { contains: track };
    }

    if (scoreRange && scoreRange !== 'ALL') {
      if (scoreRange === '0-40') {
        where.percentage = { lte: 40 };
      } else if (scoreRange === '41-70') {
        where.percentage = { gt: 40, lte: 70 };
      } else if (scoreRange === '71-100') {
        where.percentage = { gt: 70 };
      }
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { candidateName: { contains: q } },
        { email: { contains: q } },
        { college: { contains: q } },
        { currentCity: { contains: q } },
        { branch: { contains: q } },
        { track: { contains: q } }
      ];
    }

    let orderBy = { startedAt: 'desc' };
    if (sort === 'highest_score') {
      orderBy = [{ score: 'desc' }, { startedAt: 'desc' }];
    } else if (sort === 'lowest_score') {
      orderBy = [{ score: 'asc' }, { startedAt: 'desc' }];
    } else if (sort === 'oldest') {
      orderBy = { startedAt: 'asc' };
    }

    const results = await prisma.testAttempt.findMany({
      where,
      orderBy,
      select: {
        id: true,
        candidateName: true,
        email: true,
        phone: true,
        college: true,
        course: true,
        branch: true,
        passingYear: true,
        currentCity: true,
        resumeUrl: true,
        track: true,
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        wrongAnswers: true,
        unanswered: true,
        percentage: true,
        status: true,
        startedAt: true,
        completedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load candidate results.'
    });
  }
};

/**
 * GET /api/admin/results/:id
 * Returns complete candidate information, academic info, resume, and question-by-question breakdown
 */
const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                order: true,
                section: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true
              }
            }
          },
          orderBy: {
            question: {
              order: 'asc'
            }
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Result record not found.'
      });
    }

    const questionsBreakdown = attempt.answers.map(ans => {
      const q = ans.question;
      const getOptionText = (key) => {
        if (!key) return 'None';
        switch (key.toUpperCase()) {
          case 'A': return q.optionA;
          case 'B': return q.optionB;
          case 'C': return q.optionC;
          case 'D': return q.optionD;
          default: return key;
        }
      };

      return {
        questionId: q.id,
        order: q.order,
        section: q.section,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        selectedOption: ans.selectedAnswer,
        selectedText: ans.selectedAnswer ? getOptionText(ans.selectedAnswer) : 'No Answer',
        correctOption: ans.correctAnswer,
        correctText: getOptionText(ans.correctAnswer),
        isCorrect: ans.isCorrect,
        answered: ans.answered,
        timeTaken: ans.timeTaken
      };
    });

    let durationSeconds = null;
    if (attempt.startedAt && attempt.completedAt) {
      durationSeconds = Math.round((new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000);
    }

    return res.status(200).json({
      success: true,
      attempt: {
        id: attempt.id,
        candidateName: attempt.candidateName,
        email: attempt.email,
        phone: attempt.phone || 'N/A',
        college: attempt.college || 'N/A',
        course: attempt.course || 'N/A',
        branch: attempt.branch || 'N/A',
        passingYear: attempt.passingYear || 'N/A',
        currentCity: attempt.currentCity || 'N/A',
        resumeUrl: attempt.resumeUrl,
        track: attempt.track,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        percentage: attempt.percentage,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        durationSeconds
      },
      questions: questionsBreakdown
    });
  } catch (error) {
    console.error('Error fetching result by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load candidate detailed report.'
    });
  }
};

/**
 * DELETE /api/admin/results/:id
 * Deletes candidate attempt and cascades to answers
 */
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.testAttempt.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Result record not found.'
      });
    }

    await prisma.testAttempt.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Candidate result deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting result:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete test result.'
    });
  }
};

/**
 * GET /api/admin/export
 * Downloads candidate results formatted as CSV with academic fields and resume URLs
 */
const exportCsv = async (req, res) => {
  try {
    const results = await prisma.testAttempt.findMany({
      orderBy: { startedAt: 'desc' }
    });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const formatted = String(str).replace(/"/g, '""');
      return `"${formatted}"`;
    };

    const host = req.get('host');
    const protocol = req.protocol;

    const headers = [
      'Candidate Name',
      'Email',
      'Phone',
      'College / University',
      'Course / Degree',
      'Branch / Specialization',
      'Passing Year',
      'Current Location (City)',
      'Role Track',
      'Score',
      'Percentage',
      'Correct',
      'Wrong',
      'Unanswered',
      'Status',
      'Resume URL',
      'Started At',
      'Completed At'
    ];

    const rows = results.map(r => {
      const fullResumeLink = r.resumeUrl ? `${protocol}://${host}${r.resumeUrl}` : 'No resume uploaded';
      return [
        escapeCsv(r.candidateName),
        escapeCsv(r.email),
        escapeCsv(r.phone || ''),
        escapeCsv(r.college || ''),
        escapeCsv(r.course || ''),
        escapeCsv(r.branch || ''),
        escapeCsv(r.passingYear || ''),
        escapeCsv(r.currentCity || ''),
        escapeCsv(r.track),
        escapeCsv(`${r.score}/${r.totalQuestions}`),
        escapeCsv(`${r.percentage}%`),
        r.correctAnswers,
        r.wrongAnswers,
        r.unanswered,
        escapeCsv(r.status),
        escapeCsv(fullResumeLink),
        escapeCsv(r.startedAt ? new Date(r.startedAt).toLocaleString() : ''),
        escapeCsv(r.completedAt ? new Date(r.completedAt).toLocaleString() : '')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="candidate_test_results.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export candidate results.'
    });
  }
};

module.exports = {
  login,
  getStats,
  getResults,
  getResultById,
  deleteResult,
  exportCsv
};