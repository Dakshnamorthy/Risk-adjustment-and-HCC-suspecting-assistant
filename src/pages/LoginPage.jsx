import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = ({ onSignIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    onSignIn({
      username,
      name: 'Care Manager',
      role: 'Insurance Reviewer'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col justify-center items-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 min-w-[64px] bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
          HZ
        </div>
        <h1 className="text-3xl font-bold text-content-main">HELIZA</h1>
        <p className="text-content-muted mt-2 font-medium text-center">Health Evidence & Liability Intelligence for Zero-gap Analysis</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-xl border border-surface-border p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-content-main">Sign In</h2>
          <p className="text-sm text-content-muted mt-1">Access your care management dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-status-danger/10 text-status-danger border border-status-danger/20 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-content-main text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2.5 text-sm bg-surface-background border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-content-main transition-shadow"
            />
          </div>

          <div>
            <label className="block text-content-main text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 text-sm bg-surface-background border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-content-main transition-shadow"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-3 rounded-lg shadow-sm transition-all mt-4"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-content-muted border-t border-surface-border pt-6 mt-8 font-medium">
          <p>Secure access for authorized healthcare professionals only.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
