import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import {
  Timer,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Users,
  Megaphone,
  User,
  Mail,
  School,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  UploadCloud,
  FileText,
  Sparkles
} from 'lucide-react';

const TRACKS = [
  {
    key: 'SALES_ENGINEER',
    title: 'Web Developer cum Sales Engineer',
    badge: 'Tech + Client Solutions',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBorder: 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20',
    icon: Briefcase,
    iconColor: 'text-blue-600 bg-blue-100',
    description: '10 Web Dev + 5 Sales Engineering questions. Evaluates core development combined with product demo & client objection skills.'
  },
  {
    key: 'HR_RECRUITER',
    title: 'Web Developer cum HR Recruiter',
    badge: 'Tech + Talent Sourcing',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBorder: 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20',
    icon: Users,
    iconColor: 'text-purple-600 bg-purple-100',
    description: '10 Web Dev + 5 HR Recruitment questions. Evaluates frontend fundamentals and sourcing, interviewing, & candidate communication.'
  },
  {
    key: 'DIGITAL_MARKETING',
    title: 'Web Developer cum Digital Marketing',
    badge: 'Tech + Growth & SEO',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBorder: 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20',
    icon: Megaphone,
    iconColor: 'text-emerald-600 bg-emerald-100',
    description: '10 Web Dev + 5 Digital Marketing questions. Evaluates UI/backend basics along with SEO, CTA, CTR, and Analytics metrics.'
  }
];

const CandidateStart = () => {
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = useState('SALES_ENGINEER');
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    branch: '',
    passingYear: '2025',
    currentCity: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);

  useEffect(() => {
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
      newErrors.candidateName = 'First name and last name are required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Enter a valid 10-digit mobile number.';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College / University name is required.';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course / Degree is required.';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch / Specialization is required.';
    }

    if (!formData.passingYear) {
      newErrors.passingYear = 'Passing year is required.';
    }

    if (!formData.currentCity.trim()) {
      newErrors.currentCity = 'Current location (City) is required.';
    }

    if (!resumeFile) {
      newErrors.resume = 'Please upload your Resume (PDF or DOCX).';
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        setErrors((prev) => ({ ...prev, resume: 'Only PDF or Word documents (.doc, .docx) are allowed.' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: 'Resume file size cannot exceed 10MB.' }));
        return;
      }
      setResumeFile(file);
      setErrors((prev) => ({ ...prev, resume: null }));
    }
  };

  const handleStartTest = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('candidateName', formData.candidateName.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formData.phone.trim());
      data.append('college', formData.college.trim());
      data.append('course', formData.course.trim());
      data.append('branch', formData.branch.trim());
      data.append('passingYear', formData.passingYear);
      data.append('currentCity', formData.currentCity.trim());
      data.append('track', selectedTrack);
      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      const response = await testAPI.startTest(data);
      const { attempt, questions } = response.data;

      // Save active session
      localStorage.setItem('current_attempt_id', attempt.id);
      sessionStorage.setItem('test_questions', JSON.stringify(questions));
      sessionStorage.setItem('candidate_info', JSON.stringify(attempt));

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
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Quick Skill Assessment • 15 Questions • 7 Seconds Per Question</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Select Your Role & Start Assessment
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
          Choose the specialization you are interested in and test your skill set
        </p>
      </div>

      {/* Unfinished Attempt Banner */}
      {existingAttempt && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Unfinished test found:</span> Incomplete attempt for {existingAttempt.candidateName} ({existingAttempt.track})
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDiscardAndNew}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition cursor-pointer"
            >
              Start Fresh
            </button>
            <button
              onClick={handleResume}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Select Role Track Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Step 1: Choose Your Role Profile</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Required
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.key;
            const Icon = t.icon;

            return (
              <div
                key={t.key}
                onClick={() => setSelectedTrack(t.key)}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? `${t.activeBorder} shadow-md`
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.badgeColor}`}>
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {t.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">15 Questions • 7s each</span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Selected
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Select Role</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Candidate Registration Form */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
        {/* Instructions strip */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-indigo-600" />
            <span>Assessment Rules & Timer Notice</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>15 Questions:</strong> 10 Web Dev + 5 Specialization</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>7 Seconds</strong> per question countdown</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Auto-advance on click or 7s timeout</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Candidate Information & Resume
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please enter your full educational details and attach your resume before launching the test.
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleStartTest} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name and Last Name <span className="text-rose-500">*</span>
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
                    placeholder="e.g. Sadiya Ansari"
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
            </div>

            {/* Mobile Number & College */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
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
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / University Name <span className="text-rose-500">*</span>
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
                    placeholder="e.g. MBM Engineering College"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.college
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.college && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.college}</p>
                )}
              </div>
            </div>

            {/* Course / Degree & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course / Degree <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech / BCA / MCA / B.Sc"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.course
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.course && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.course}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Branch / Specialization <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science & Engineering"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.branch
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.branch && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.branch}</p>
                )}
              </div>
            </div>

            {/* Passing Year & Current City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Passing Year <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <select
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm transition focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    <option value="2027">2027 (Pursuing)</option>
                    <option value="2026">2026 (Pursuing)</option>
                    <option value="2025">2025 (Graduating Soon)</option>
                    <option value="2024">2024 (Graduate)</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021 or earlier">2021 or earlier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Location (City) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur, Jodhpur, Delhi"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.currentCity
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.currentCity && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.currentCity}</p>
                )}
              </div>
            </div>

            {/* Resume Upload Box */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resume Upload (PDF / DOC / DOCX) <span className="text-rose-500">*</span>
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl transition bg-slate-50/50">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-indigo-500" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="resume-upload"
                      className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2 py-0.5 border border-slate-200 shadow-sm"
                    >
                      <span>Select File</span>
                      <input
                        id="resume-upload"
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1 pt-0.5">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 10MB</p>

                  {resumeFile && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  )}
                </div>
              </div>

              {errors.resume && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.resume}</p>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 shadow-lg shadow-indigo-200 transition text-base disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Uploading profile & launching test...</span>
                ) : (
                  <>
                    <span>Start Test Now (15 Questions • 7s Each)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Total duration is approximately 1.5 minutes. Once started, the 7-second timer begins immediately.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateStart;