import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CandidateStart from './pages/CandidateStart';
import CandidateTest from './pages/CandidateTest';
import CandidateResult from './pages/CandidateResult';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Candidate Portal */}
          <Route path="/" element={<Navigate to="/test" replace />} />
          <Route path="/test" element={<CandidateStart />} />
          <Route path="/test/active" element={<CandidateTest />} />
          <Route path="/test/result" element={<CandidateResult />} />

          {/* Secure Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/test" replace />} />
        </Routes>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        QuickSkill Online Assessment Platform • Real-time Timed Examination Engine
      </footer>
    </div>
  );
}

export default App;