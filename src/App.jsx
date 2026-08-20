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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cts_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleSignIn = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('cts_user', JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('cts_user');
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
            isAuthenticated ? 
            <Dashboard user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/members" 
          element={
            isAuthenticated ? 
            <Members user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/member-360" 
          element={
            isAuthenticated ? 
            <Member360 user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/analytics" 
          element={
            isAuthenticated ? 
            <Analytics user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/hcc-mapping" 
          element={
            isAuthenticated ? 
            <HccMapping user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/ml-prediction" 
          element={
            isAuthenticated ? 
            <MLPrediction user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/unflagged-members" 
          element={
            isAuthenticated ? 
            <UnflaggedMembers user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/flagged-members" 
          element={
            isAuthenticated ? 
            <FlaggedMembers user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/agent-analysis" 
          element={
            isAuthenticated ? 
            <AgentAnalysis user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/estimation" 
          element={
            isAuthenticated ? 
            <Estimation user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
