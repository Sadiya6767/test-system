import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  School,
  Phone,
  Mail,
  Calendar,
  Hourglass,
  GraduationCap,
  MapPin,
  FileText,
  Download,
  Briefcase
} from 'lucide-react';

const getResumeUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getTrackBadge = (track) => {
  switch (track) {
    case 'SALES_ENGINEER':
      return {
        label: 'Web Dev cum Sales Engineer',
        bg: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    case 'HR_RECRUITER':
      return {
        label: 'Web Dev cum HR Recruiter',
        bg: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    case 'DIGITAL_MARKETING':
      return {
        label: 'Web Dev cum Digital Marketing',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    default:
      return {
        label: track || 'General Track',
        bg: 'bg-slate-50 text-slate-700 border-slate-200'
      };
  }
};

const CandidateDetailModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;

  const attempt = data?.attempt;
  const questions = data?.questions || [];
  const trackInfo = attempt ? getTrackBadge(attempt.track) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Candidate Assessment Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive question-by-question response breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500 font-medium">Loading candidate details...</p>
            </div>
          ) : !attempt ? (
            <div className="py-12 text-center text-slate-500">
              No detailed data found for this attempt.
            </div>
          ) : (
            <>
              {/* Candidate & Test Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidate Info Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Candidate Profile
                      </h3>
                      {trackInfo && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${trackInfo.bg}`}>
                          {trackInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-base text-slate-900 mb-2">
                      {attempt.candidateName}
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{attempt.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{attempt.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{attempt.college || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {attempt.course || 'N/A'} {attempt.branch ? `(${attempt.branch})` : ''} • Passing: {attempt.passingYear || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Location: {attempt.currentCity || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {attempt.resumeUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-200/70">
                      <a
                        href={getResumeUrl(attempt.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 border border-indigo-200 transition shadow-sm w-full justify-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Resume ({attempt.resumeUrl.split('.').pop().toUpperCase()})</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Score & Timing Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Performance Summary
                  </h3>
                  <div className="flex items-baseline gap-3 my-1">
                    <span className="text-3xl font-extrabold text-indigo-600">
                      {attempt.score} / {attempt.totalQuestions}
                    </span>
                    <span className="text-lg font-bold text-slate-700">
                      ({attempt.percentage}%)
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ml-auto ${
                      attempt.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      attempt.percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                      attempt.percentage >= 40 ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {attempt.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Duration</span>
                      <span className="font-semibold text-slate-800">
                        {attempt.durationSeconds ? `${attempt.durationSeconds}s` : 'In progress / NA'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Completed Date</span>
                      <span className="font-semibold text-slate-800">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Pill Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <span className="text-xs text-emerald-700 font-medium">Correct</span>
                  <p className="text-xl font-bold text-emerald-800">{attempt.correctAnswers}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                  <span className="text-xs text-rose-700 font-medium">Wrong</span>
                  <p className="text-xl font-bold text-rose-800">{attempt.wrongAnswers}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  <span className="text-xs text-amber-700 font-medium">Unanswered</span>
                  <p className="text-xl font-bold text-amber-800">{attempt.unanswered}</p>
                </div>
              </div>

              {/* Question-by-Question Detailed List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b pb-2">
                  <span>Questions Breakdown ({questions.length})</span>
                  <span className="text-xs text-slate-400 font-normal">Max 7.0s per question</span>
                </h3>

                {questions.map((q, idx) => {
                  let badge = {
                    bg: 'bg-amber-50 text-amber-700 border-amber-200',
                    label: 'Unanswered',
                    icon: <Clock className="w-4 h-4 text-amber-600" />
                  };

                  if (q.answered) {
                    if (q.isCorrect) {
                      badge = {
                        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        label: 'Correct',
                        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      };
                    } else {
                      badge = {
                        bg: 'bg-rose-50 text-rose-700 border-rose-200',
                        label: 'Wrong',
                        icon: <XCircle className="w-4 h-4 text-rose-600" />
                      };
                    }
                  }

                  return (
                    <div
                      key={q.questionId || idx}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Question {q.order || idx + 1}
                          </span>
                          {q.section && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {q.section}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
                            {q.timeTaken}s
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        {q.questionText}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`p-2.5 rounded-lg border ${
                          q.answered && q.isCorrect ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' :
                          q.answered && !q.isCorrect ? 'bg-rose-50/60 border-rose-200 text-rose-950' :
                          'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 mb-0.5">
                            Candidate Answer
                          </span>
                          <span className="font-medium">
                            {q.selectedOption ? `${q.selectedOption}. ${q.selectedText}` : 'No Answer Submitted (Skipped)'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg border bg-emerald-50/40 border-emerald-200 text-emerald-950">
                          <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700 mb-0.5">
                            Correct Answer
                          </span>
                          <span className="font-semibold text-emerald-800">
                            {q.correctOption}. {q.correctText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;