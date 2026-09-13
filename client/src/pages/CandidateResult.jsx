import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Briefcase, Mail, School, Clock, FileCheck } from 'lucide-react';

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
    email,
    college,
    course,
    track = 'Web Developer Assessment',
    completedAt
  } = result;

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Celebration & Success Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Assessment Submitted Successfully!
        </h1>
        <p className="mt-1.5 text-slate-500 text-xs sm:text-sm">
          Your responses, profile, and resume have been securely recorded.
        </p>
      </div>

      {/* Main Submission Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Candidate & Role Profile */}
        <div className="text-center pb-6 border-b border-slate-100">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Candidate Submission
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{candidateName}</h2>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>{track}</span>
          </div>

          <div className="mt-3 text-xs text-slate-500 space-y-1">
            {email && (
              <div className="flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{email}</span>
              </div>
            )}
            {college && (
              <div className="flex items-center justify-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>{course ? `${course} • ` : ''}{college}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Notice Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Submission Status
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Under Review
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your assessment responses have been successfully submitted to our recruitment and technical evaluation team for review.
          </p>

          <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200/60">
            Our team will evaluate your test submission alongside your uploaded resume. If shortlisted, you will be contacted directly via your registered email or mobile number regarding the next steps in the selection process.
          </p>
        </div>

        {/* Timestamp & Single-Attempt Policy Note */}
        <div className="pt-2 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Completed on: {formattedDate}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs text-center font-medium">
            <span className="font-bold">Important Notice:</span> Only 1 attempt is permitted per candidate. Multiple submissions or re-tests are strictly disabled. You may now safely close this browser window.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateResult;