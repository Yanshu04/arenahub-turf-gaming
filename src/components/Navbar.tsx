/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/MockAuthContext';
import { LayoutDashboard, LogOut, User, MapPin, Briefcase } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <MapPin size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Arena<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-6 pr-6 border-r border-gray-100">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">My Bookings</span>
                </Link>
                <Link
                  to="/partner"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
                >
                  <Briefcase size={18} />
                  <span className="hidden sm:inline">Partner Hub</span>
                </Link>
              </div>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                <div className="flex items-center gap-2 py-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <User size={16} />
                  </div>
                  <span className="hidden text-sm font-semibold text-gray-700 md:inline">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
