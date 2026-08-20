import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ReviewQueue from './pages/ReviewQueue';
import Members from './pages/Members';
import Member360 from './pages/Member360';
import EvidenceTimeline from './pages/EvidenceTimeline';
import AIAnalysis from './pages/AIAnalysis';
import HumanReview from './pages/HumanReview';
import DecisionConfirmation from './pages/DecisionConfirmation';
import ReviewHistory from './pages/ReviewHistory';
import Analytics from './pages/Analytics';
import HccMapping from './pages/HccMapping';

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
          path="/signup" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignUp onSignUp={handleSignIn} />
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
          path="/review-queue" 
          element={
            isAuthenticated ? 
            <ReviewQueue user={user} onSignOut={handleSignOut} /> : 
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
          path="/evidence-timeline" 
          element={
            isAuthenticated ? 
            <EvidenceTimeline user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/ai-analysis" 
          element={
            isAuthenticated ? 
            <AIAnalysis user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/human-review" 
          element={
            isAuthenticated ? 
            <HumanReview user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/decision-confirmation" 
          element={
            isAuthenticated ? 
            <DecisionConfirmation user={user} onSignOut={handleSignOut} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/review-history" 
          element={
            isAuthenticated ? 
            <ReviewHistory user={user} onSignOut={handleSignOut} /> : 
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
