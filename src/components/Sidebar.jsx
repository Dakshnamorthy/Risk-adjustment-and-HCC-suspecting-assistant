import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onSignOut }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Review Queue', path: '/review-queue', icon: '📋' },
    { label: 'Members', path: '/members', icon: '👥' },
    { label: 'HCC Mapping', path: '/hcc-mapping', icon: '🧬' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'AI Analysis', path: '/ai-analysis', icon: '🤖' },
    { label: 'Evidence Timeline', path: '/evidence-timeline', icon: '📜' },
    { label: 'Review History', path: '/review-history', icon: '📑' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-20'} text-white h-screen fixed left-0 top-0 shadow-lg transition-all duration-300 z-40 flex flex-col`} style={{ backgroundColor: '#4F46E5' }}>
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottomColor: 'rgba(255,255,255,0.2)', borderBottomWidth: '1px' }}>
        <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center w-full'}`}>
          <div className="text-3xl">🏥</div>
          {isExpanded && (
            <div>
              <h1 className="font-bold text-lg">HCC</h1>
              <p className="text-xs text-blue-200">Assistant</p>
            </div>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded text-sm transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            title="Collapse sidebar"
          >
            ◀
          </button>
        )}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 rounded text-sm absolute right-1 transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            title="Expand sidebar"
          >
            ▶
          </button>
        )}
      </div>

      {/* User Info */}
      {isExpanded && (
        <div className="p-4 flex items-center justify-between" style={{ borderBottomColor: 'rgba(255,255,255,0.2)', borderBottomWidth: '1px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
              👤
            </div>
            <div className="text-sm">
              <p className="font-semibold">Care Manager</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              isActive(item.path)
                ? 'bg-white text-cyan-600 shadow-lg'
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
            title={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            {isExpanded && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4" style={{ borderTopColor: 'rgba(255,255,255,0.2)', borderTopWidth: '1px' }}>
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold ${!isExpanded && 'justify-center'}`}
          title="Logout"
        >
          <span className="text-xl">🚪</span>
          {isExpanded && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
