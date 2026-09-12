import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Timer, Shield, LogOut } from 'lucide-react';

const Navbar = () => {
  const { admin, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav during active test taking
  const isTakingTest = location.pathname === '/test/active';

  const handleLogout = () => {
    logout();
    navigate('/test');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/test" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg block leading-tight">QuickSkill</span>
            <span className="text-xs text-slate-500 font-medium block">Skill Assessment Portal</span>
          </div>
        </Link>

        {/* Right Navigation */}
        {!isTakingTest && (
          <div className="flex items-center gap-3">
            <Link
              to="/test"
              className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition ${
                location.pathname === '/test' || location.pathname === '/'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Take Assessment
            </Link>

            {/* ONLY visible if admin is already authenticated. Public visitors NEVER see Admin button! */}
            {isAuthenticated && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">{admin?.email || 'Admin'}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition ml-1"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;