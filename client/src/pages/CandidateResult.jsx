import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Clock, ShieldCheck, Briefcase } from 'lucide-react';

const CandidateResult = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('test_result');
    if (!stored) {
      navigate('/test', { replace: true });
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch (e) {
      navigate('/test', { replace: true });
    }
  }, [navigate]);

  if (!result) return null;

  const {
    candidateName,
    track = 'Web Developer Assessment',
    score = 0,
    totalQuestions = 15,
    correctAnswers = 0,
    wrongAnswers = 0,
    unanswered = 0,
    percentage = 0,
  } = result;

  let performanceTier = {
    title: 'Keep Practicing',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Keep studying and reviewing fundamental concepts to improve your score.',
  };

  if (percentage >= 80) {
    performanceTier = {
      title: 'Excellent',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Outstanding technical proficiency! You demonstrated rapid comprehension and high accuracy.',
    };
  } else if (percentage >= 60) {
    performanceTier = {
      title: 'Good',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Solid performance with strong grasp of key technical fundamentals.',
    };
  } else if (percentage >= 40) {
    performanceTier = {
      title: 'Needs Improvement',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'You understand some fundamentals, but time pressure and specialized questions need practice.',
    };
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Celebration Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Test Completed!
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Assessment submitted and officially recorded on the server
        </p>
      </div>

      {/* Main Result Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 p-6 sm:p-8">
        {/* Candidate & Track Details */}
        <div className="text-center pb-6 border-b border-slate-100">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Candidate</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-0.5">{candidateName}</h2>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>{track}</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${performanceTier.badgeClass}">
            <Award className="w-4 h-4" />
            <span>Performance: {performanceTier.title}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
            {performanceTier.description}
          </p>
        </div>

        {/* Big Score Display */}
        <div className="my-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100/60 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black text-indigo-600 tracking-tight">
              {score}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400">
              / {totalQuestions}
            </span>
          </div>
          <div className="mt-1 text-base font-bold text-slate-700">
            Percentage: <span className="text-indigo-600">{percentage}%</span>
          </div>
        </div>

        {/* Detailed Breakdown Counters */}
        <div className="grid grid-cols-3 gap-3 text-center mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Correct</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {correctAnswers}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="flex items-center justify-center gap-1 text-rose-600 text-xs font-bold mb-1">
              <XCircle className="w-4 h-4" />
              <span>Wrong</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-700">
              {wrongAnswers}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>Unanswered</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-700">
              {unanswered}
            </div>
          </div>
        </div>

        {/* Completion Message */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Thank you for completing the assessment.
          </p>
          <p className="text-xs text-slate-400">
            Your profile, uploaded resume, and test responses have been submitted to the evaluation team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateResult;