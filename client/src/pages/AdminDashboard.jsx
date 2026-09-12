import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import CandidateDetailModal from '../components/CandidateDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  HelpCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search, Filter & Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');

  // Detail Modal State
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Dialog State
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getResumeUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getTrackLabel = (track) => {
    switch (track) {
      case 'SALES_ENGINEER':
        return { label: 'Sales Engineer', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'HR_RECRUITER':
        return { label: 'HR Recruiter', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'DIGITAL_MARKETING':
        return { label: 'Digital Mktg', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: track || 'General', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Fetch Summary Statistics
  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch Results List with current filters
  const loadResults = useCallback(async () => {
    try {
      const res = await adminAPI.getResults({
        search,
        status: statusFilter,
        scoreRange: scoreFilter,
        sort: sortBy,
        track: trackFilter,
      });
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  }, [search, statusFilter, scoreFilter, sortBy, trackFilter]);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadResults()]);
      setLoading(false);
    };
    fetchData();
  }, [loadStats, loadResults]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadResults()]);
    setRefreshing(false);
  };

  // Open Candidate Detail Modal
  const handleViewDetails = async (id) => {
    setSelectedCandidateId(id);
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminAPI.getResultById(id);
      setDetailData(res.data);
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Trigger Delete Confirmation
  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
  };

  // Confirm Delete Operation
  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    try {
      await adminAPI.deleteResult(candidateToDelete.id);
      setCandidateToDelete(null);
      await Promise.all([loadStats(), loadResults()]);
    } catch (err) {
      console.error('Failed to delete result:', err);
      alert('Unable to delete result. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Download CSV Export
  const handleExportCsv = () => {
    const exportUrl = adminAPI.getExportUrl();
    const token = localStorage.getItem('admin_token');

    // Fetch as blob with Authorization header
    fetch(exportUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidate_test_results_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Export error:', err);
        alert('Failed to export CSV. Please ensure you are logged in.');
      });
  };

  // Custom colors for chart bars
  const CHART_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#60a5fa', '#34d399'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment Results Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time candidate monitoring, score distribution, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            title="Refresh dataset"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Candidates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {stats ? stats.totalCandidates : '--'}
          </div>
          <span className="text-xs text-slate-500 font-medium">All recorded attempts</span>
        </div>

        {/* Tests Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tests Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
            {stats ? stats.completedTests : '--'}
          </div>
          <span className="text-xs text-slate-500 font-medium">Fully finished</span>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-blue-600">
            {stats ? `${stats.averageScore}%` : '--'}
          </div>
          <span className="text-xs text-slate-500 font-medium">Completed cohort mean</span>
        </div>

        {/* Highest Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Score</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-purple-600">
            {stats ? `${stats.highestScore}%` : '--'}
          </div>
          <span className="text-xs text-slate-500 font-medium">Top candidate mark</span>
        </div>

        {/* Lowest Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lowest Score</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600">
            {stats ? `${stats.lowestScore}%` : '--'}
          </div>
          <span className="text-xs text-slate-500 font-medium">Minimum mark</span>
        </div>
      </div>

      {/* Analytics Chart Section */}
      {stats && stats.distribution && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Score Distribution Analysis</h2>
              <p className="text-xs text-slate-500">Number of candidates achieving scores across percentage quintiles</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Candidates Count
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-bold">{payload[0].payload.range}</p>
                          <p className="text-indigo-200">{payload[0].value} Candidate(s)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name, email, college..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm transition focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Filter and Sort Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              {/* Role Track Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Track:</span>
                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Tracks</option>
                  <option value="SALES_ENGINEER">Sales Engineer</option>
                  <option value="HR_RECRUITER">HR Recruiter</option>
                  <option value="DIGITAL_MARKETING">Digital Marketing</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="INCOMPLETE">Incomplete</option>
                </select>
              </div>

              {/* Score Range Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Score:</span>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Scores</option>
                  <option value="71-100">71% - 100% (High)</option>
                  <option value="41-70">41% - 70% (Medium)</option>
                  <option value="0-40">0% - 40% (Low)</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="latest">Latest Attempt</option>
                  <option value="oldest">Oldest Attempt</option>
                  <option value="highest_score">Highest Score</option>
                  <option value="lowest_score">Lowest Score</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Loading candidate results...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">
                {search ? 'No candidates found.' : 'No test results yet.'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search
                  ? 'Try modifying your search keywords or clear filters to see all attempts.'
                  : 'Candidates who complete the public test will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Candidate</th>
                  <th className="py-3.5 px-4 font-semibold">Track</th>
                  <th className="py-3.5 px-4 font-semibold">Academic Profile</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Percentage</th>
                  <th className="py-3.5 px-4 font-semibold text-center hidden md:table-cell">Correct</th>
                  <th className="py-3.5 px-4 font-semibold text-center hidden md:table-cell">Wrong</th>
                  <th className="py-3.5 px-4 font-semibold text-center hidden md:table-cell">Unanswered</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => {
                  const isCompleted = r.status === 'COMPLETED';
                  const trackBadge = getTrackLabel(r.track);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Candidate Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.candidateName}</div>
                        <div className="text-xs text-slate-500">{r.email}</div>
                        {r.phone && <div className="text-[11px] text-slate-400">{r.phone}</div>}
                      </td>

                      {/* Track */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${trackBadge.bg}`}>
                          {trackBadge.label}
                        </span>
                      </td>

                      {/* College & Degree */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[170px]">
                        <div className="font-medium text-slate-800 truncate" title={r.college}>{r.college || '—'}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {r.course || ''} {r.branch ? `• ${r.branch}` : ''} {r.passingYear ? `(${r.passingYear})` : ''}
                        </div>
                        {r.currentCity && <div className="text-[10px] text-slate-400 truncate">📍 {r.currentCity}</div>}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {r.score}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          /{r.totalQuestions}
                        </span>
                      </td>

                      {/* Percentage Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            !isCompleted
                              ? 'bg-slate-100 text-slate-600'
                              : r.percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.percentage >= 60
                              ? 'bg-indigo-100 text-indigo-800'
                              : r.percentage >= 40
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCompleted ? `${r.percentage}%` : 'Incomplete'}
                        </span>
                      </td>

                      {/* Correct */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell font-medium text-emerald-700">
                        {r.correctAnswers}
                      </td>

                      {/* Wrong */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell font-medium text-rose-700">
                        {r.wrongAnswers}
                      </td>

                      {/* Unanswered */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell font-medium text-amber-700">
                        {r.unanswered}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {r.startedAt
                          ? new Date(r.startedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.resumeUrl && (
                            <a
                              href={getResumeUrl(r.resumeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                              title="Download Candidate Resume"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleViewDetails(r.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            title="View question-by-question breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete result"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
        loading={detailLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!candidateToDelete}
        title="Delete Candidate Result"
        message={`Are you sure you want to delete the test result for "${candidateToDelete?.candidateName}"?`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setCandidateToDelete(null)}
      />
    </div>
  );
};

export default AdminDashboard;