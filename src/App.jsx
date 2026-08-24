import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Member360 from './pages/Member360';
import Analytics from './pages/Analytics';
import HccMapping from './pages/HccMapping';
import MLPrediction from './pages/MLPrediction';
import UnflaggedMembers from './pages/UnflaggedMembers';
import FlaggedMembers from './pages/FlaggedMembers';
import AgentAnalysis from './pages/AgentAnalysis';
import Estimation from './pages/Estimation';
import { authAPI } from './services/apiService';

function ProtectedRoute({ isAuthenticated, children }) {
  if (isAuthenticated === null) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    authAPI.me()
      .then(data => { setUser(data.user); setIsAuthenticated(true); })
      .catch(() => { setUser(null); setIsAuthenticated(false); });
  }, []);

  const handleSignIn = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleSignOut = () => {
    authAPI.logout().finally(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginPage onSignIn={handleSignIn} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/members" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><Members user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/member-360" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><Member360 user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><Analytics user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/hcc-mapping" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><HccMapping user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/ml-prediction" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><MLPrediction user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/unflagged-members" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><UnflaggedMembers user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/flagged-members" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><FlaggedMembers user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/agent-analysis" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><AgentAnalysis user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/estimation" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}><Estimation user={user} onSignOut={handleSignOut} /></ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
