import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import { Timer, AlertTriangle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const QUESTION_DURATION = 5; // seconds per question

const CandidateTest = () => {
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_DURATION);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs to prevent race conditions and multiple triggers
  const isTransitioningRef = useRef(false);
  const timerRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());
  const attemptIdRef = useRef(null);
  const questionsRef = useRef([]);
  const currentIndexRef = useRef(0);

  // Keep refs in sync with state for access in intervals/event handlers
  attemptIdRef.current = attemptId;
  questionsRef.current = questions;
  currentIndexRef.current = currentIndex;

  // Initialize test session & handle page refresh recovery
  useEffect(() => {
    const initSession = async () => {
      const storedAttemptId = localStorage.getItem('current_attempt_id');
      if (!storedAttemptId) {
        navigate('/test', { replace: true });
        return;
      }

      setAttemptId(storedAttemptId);

      try {
        // Fetch questions from API or cache
        let loadedQuestions = [];
        const cachedQuestions = sessionStorage.getItem('test_questions');
        if (cachedQuestions) {
          try {
            loadedQuestions = JSON.parse(cachedQuestions);
          } catch (e) {
            loadedQuestions = [];
          }
        }

        if (!loadedQuestions || loadedQuestions.length === 0) {
          const qRes = await testAPI.getQuestions();
          loadedQuestions = qRes.data.questions;
          sessionStorage.setItem('test_questions', JSON.stringify(loadedQuestions));
        }

        setQuestions(loadedQuestions);
        questionsRef.current = loadedQuestions;

        // Verify attempt state on server
        const attemptRes = await testAPI.getAttempt(storedAttemptId);
        const { isCompleted, attempt, answeredQuestionIds } = attemptRes.data;

        if (isCompleted) {
          sessionStorage.setItem('test_result', JSON.stringify(attempt));
          localStorage.removeItem('current_attempt_id');
          navigate('/test/result', { replace: true });
          return;
        }

        if (attempt?.candidateName) {
          setCandidateName(attempt.candidateName);
        }

        // Resume at first unanswered question
        if (answeredQuestionIds && answeredQuestionIds.length > 0) {
          const answeredSet = new Set(answeredQuestionIds);
          const firstUnansweredIndex = loadedQuestions.findIndex(q => !answeredSet.has(q.id));

          if (firstUnansweredIndex === -1) {
            // All questions answered, submit test!
            await finalizeTest(storedAttemptId);
            return;
          } else {
            setCurrentIndex(firstUnansweredIndex);
            currentIndexRef.current = firstUnansweredIndex;
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Session initialization error:', err);
        setErrorMessage('Failed to restore test session. Please try again.');
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      // Clear timers on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [navigate]);

  // Finalize Test and Redirect to Result
  const finalizeTest = useCallback(async (currentAttemptId) => {
    setIsFinishing(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const idToSubmit = currentAttemptId || attemptIdRef.current;
      const response = await testAPI.submitTest({ attemptId: idToSubmit });
      const finalResult = response.data.result;

      sessionStorage.setItem('test_result', JSON.stringify(finalResult));
      localStorage.removeItem('current_attempt_id');
      navigate('/test/result', { replace: true });
    } catch (err) {
      console.error('Failed to submit test:', err);
      setErrorMessage('Unable to submit test results. Please check your connection.');
      setIsFinishing(false);
    }
  }, [navigate]);

  // Move to next question or submit test if last question reached
  const advanceToNext = useCallback((nextIdx) => {
    const totalQ = questionsRef.current.length;
    if (nextIdx >= totalQ) {
      finalizeTest();
    } else {
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;
      setSelectedOption(null);
      setSecondsLeft(QUESTION_DURATION);
      isTransitioningRef.current = false;
      questionStartTimeRef.current = Date.now();
    }
  }, [finalizeTest]);

  // Handle Question Timeout (0 seconds reached)
  const handleTimeout = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questionsRef.current[currentIndexRef.current];
    const currentAttId = attemptIdRef.current;

    if (currentQ && currentAttId) {
      // Send unanswered record to server
      testAPI.submitAnswer({
        attemptId: currentAttId,
        questionId: currentQ.id,
        selectedAnswer: null,
        timeTaken: 5.0,
      }).catch(err => console.error('Auto timeout sync error:', err));
    }

    // Brief visual feedback showing time out, then advance
    transitionTimeoutRef.current = setTimeout(() => {
      advanceToNext(currentIndexRef.current + 1);
    }, 200);
  }, [advanceToNext]);

  // Start fresh 5-second countdown when question index changes
  useEffect(() => {
    if (isLoading || isFinishing || questions.length === 0) return;

    // Reset lock and timing
    isTransitioningRef.current = false;
    questionStartTimeRef.current = Date.now();
    setSecondsLeft(QUESTION_DURATION);

    if (timerRef.current) clearInterval(timerRef.current);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, Math.ceil(QUESTION_DURATION - elapsedSeconds));

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleTimeout();
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [currentIndex, isLoading, isFinishing, questions.length, handleTimeout]);

  // Handle User Option Selection
  const handleOptionSelect = (optionKey) => {
    // Prevent multiple submissions, double-clicking, or submission after timer expired
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Immediately stop timer
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.min(
      Math.max(parseFloat(((Date.now() - questionStartTimeRef.current) / 1000).toFixed(2)), 0.1),
      5.0
    );

    setSelectedOption(optionKey);

    const currentQ = questions[currentIndex];
    if (currentQ && attemptId) {
      testAPI.submitAnswer({
        attemptId,
        questionId: currentQ.id,
        selectedAnswer: optionKey,
        timeTaken: elapsed,
      }).catch(err => console.error('Answer submission error:', err));
    }

    // Short visual transition (250ms) before automatically jumping to next question
    transitionTimeoutRef.current = setTimeout(() => {
      advanceToNext(currentIndex + 1);
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-base font-semibold text-slate-800">Preparing assessment questions...</p>
        <p className="text-xs text-slate-500 mt-1">Get ready! Questions will begin immediately.</p>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Calculating your final score...</h2>
        <p className="text-sm text-slate-500 mt-1">Saving results securely to the database.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl shadow-lg border border-rose-200 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Test Interrupted</h3>
        <p className="text-sm text-slate-600 mb-6">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Retry Test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Visual timer color shifts: green (4-5s) -> amber (2-3s) -> red (1s or 0s)
  const timerColor =
    secondsLeft > 3 ? 'text-emerald-600 bg-emerald-50 border-emerald-300' :
    secondsLeft > 1 ? 'text-amber-600 bg-amber-50 border-amber-300' :
    'text-rose-600 bg-rose-50 border-rose-400 animate-pulse';

  const options = [
    { key: 'A', text: currentQuestion.optionA },
    { key: 'B', text: currentQuestion.optionB },
    { key: 'C', text: currentQuestion.optionC },
    { key: 'D', text: currentQuestion.optionD },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 select-none">
      {/* Top Bar: Progress and Candidate Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 mb-2">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="text-slate-400 font-normal">Candidate: {candidateName || 'Anonymous'}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
        {/* Timer Display */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
              Time Remaining
            </span>
            <span className="text-xs text-slate-500">Auto-advances when time expires</span>
          </div>

          {/* Prominent Circular/Badge Countdown */}
          <div className="flex items-center gap-2">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-2xl sm:text-3xl transition-colors shadow-sm ${timerColor}`}>
              {secondsLeft}
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;

            return (
              <button
                key={opt.key}
                type="button"
                disabled={isTransitioningRef.current}
                onClick={() => handleOptionSelect(opt.key)}
                className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-md text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 active:scale-[0.99] text-slate-800'
                } ${isTransitioningRef.current ? 'cursor-default' : ''}`}
              >
                {/* Option Letter Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                  }`}
                >
                  {opt.key}
                </div>

                {/* Option Text */}
                <span className="text-sm sm:text-base font-medium flex-1">
                  {opt.text}
                </span>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Hint */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Speed matters • 5 seconds per question</span>
          <span>No pausing • No going back</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateTest;