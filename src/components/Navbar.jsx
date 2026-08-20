import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: '🏠 Dashboard', path: '/dashboard', icon: '📊' },
    { label: '📋 Review Queue', path: '/review-queue', icon: '📋' },
    { label: '👥 Members', path: '/member-360', icon: '👥' },
    { label: '📈 Analytics', path: '/analytics', icon: '📈' },
    { label: '🧬 HCC Mapping', path: '/hcc-mapping', icon: '🧬' },
    { label: '📑 History', path: '/review-history', icon: '📑' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="text-2xl">🏥</div>
            <div>
              <h1 className="text-white font-bold text-lg">HCC Assistant</h1>
              <p className="text-blue-100 text-xs">Risk Adjustment Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white hover:bg-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - User & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold">Care Manager</p>
                <p className="text-blue-100 text-xs">Active</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
            >
              <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-blue-600">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-white text-blue-700'
                    : 'text-white hover:bg-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
