import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import { Timer, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, User, Mail, School, Phone } from 'lucide-react';

const CandidateStart = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    college: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);

  useEffect(() => {
    // Check if there is an unfinished attempt stored in session
    const savedAttemptId = localStorage.getItem('current_attempt_id');
    if (savedAttemptId) {
      testAPI.getAttempt(savedAttemptId)
        .then((res) => {
          if (!res.data.isCompleted) {
            setExistingAttempt(res.data.attempt);
          } else {
            localStorage.removeItem('current_attempt_id');
          }
        })
        .catch(() => {
          localStorage.removeItem('current_attempt_id');
        });
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Full Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStartTest = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await testAPI.startTest(formData);
      const { attempt, questions } = response.data;

      // Save active session
      localStorage.setItem('current_attempt_id', attempt.id);
      sessionStorage.setItem('test_questions', JSON.stringify(questions));
      sessionStorage.setItem('candidate_info', JSON.stringify(attempt));

      // Navigate to active test screen
      navigate('/test/active');
    } catch (err) {
      console.error('Failed to start test:', err);
      setApiError(err.response?.data?.message || 'Unable to start the test. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = () => {
    navigate('/test/active');
  };

  const handleDiscardAndNew = () => {
    localStorage.removeItem('current_attempt_id');
    sessionStorage.removeItem('test_questions');
    sessionStorage.removeItem('candidate_info');
    setExistingAttempt(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero / Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Quick Skill Assessment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Test Your Technical Knowledge
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
          10 Questions • 5 Seconds Per Question
        </p>
      </div>

      {/* Interrupted Attempt Recovery Banner */}
      {existingAttempt && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Unfinished test found:</span> Incomplete attempt for {existingAttempt.candidateName}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDiscardAndNew}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
            >
              Start Fresh
            </button>
            <button
              onClick={handleResume}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-lg shadow-sm transition"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Instructions + Candidate Form */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
        {/* Assessment Instructions Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-indigo-600" />
            <span>Important Instructions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>There are <strong>10 questions</strong> in total.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>You have only <strong>5 seconds</strong> for each question.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>Select the best answer <strong>before the timer ends</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>If time runs out, the question is <strong>automatically skipped</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>You <strong>cannot go back</strong> to previous questions.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Your result is saved on the server upon completion.</span>
            </div>
          </div>
        </div>

        {/* Candidate Information Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Candidate Registration
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Please provide your details below before launching the test. No account required.
          </p>

          {apiError && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleStartTest} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="e.g. Sadiya Khan"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.candidateName
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.candidateName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.candidateName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. sadiya@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College / Organization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm transition focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm transition focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 shadow-lg shadow-indigo-200 transition text-base disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Preparing Assessment...</span>
                ) : (
                  <>
                    <span>Start Test Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Total test duration is approximately 50 seconds. Ensure you are ready before starting.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateStart;