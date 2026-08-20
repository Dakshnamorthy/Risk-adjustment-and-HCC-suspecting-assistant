import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const DecisionConfirmation = ({ user, onSignOut }) => {
  const confirmationData = {
    reviewId: 'REV-2025-001234',
    memberId: 'MXQ1',
    memberName: 'John Doe',
    decision: 'Approved Selected HCCs',
    approvedHccs: ['HCC-019', 'HCC-082'],
    pendingHccs: ['HCC-096', 'HCC-112'],
    timestamp: new Date().toLocaleString(),
    reviewedBy: 'Care Manager',
    riskScoreImpact: '+0.45'
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-12 mb-8 text-center text-white">
          <div className="text-7xl mb-4 animate-bounce">✓</div>
          <h1 className="text-4xl font-bold mb-2">Decision Confirmed!</h1>
          <p className="text-green-100 text-lg">Your review has been successfully recorded in the system</p>
        </div>

        {/* Decision Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Decision Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Review ID</p>
                <p className="text-2xl font-bold text-blue-700">{confirmationData.reviewId}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Member</p>
                <p className="text-2xl font-bold text-indigo-700">{confirmationData.memberName}</p>
                <p className="text-gray-600 text-sm mt-1">{confirmationData.memberId}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Risk Score Impact</p>
                <p className="text-2xl font-bold text-orange-700">{confirmationData.riskScoreImpact}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Decision</p>
                <p className="text-2xl font-bold text-green-700">✓ {confirmationData.decision}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Reviewed By</p>
                <p className="text-2xl font-bold text-purple-700">{confirmationData.reviewedBy}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-600">
                <p className="text-gray-600 text-sm font-semibold mb-1">Timestamp</p>
                <p className="text-sm font-mono text-gray-700">{confirmationData.timestamp}</p>
              </div>
            </div>
          </div>

          {/* HCC Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Approved */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span> Approved HCC Codes
              </h3>
              <div className="space-y-3">
                {confirmationData.approvedHccs.map((hcc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-bold text-green-700 text-lg">{hcc}</p>
                      <p className="text-green-600 text-sm">Approved for risk adjustment</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending */}
            {confirmationData.pendingHccs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⏳</span> Pending Review
                </h3>
                <div className="space-y-3">
                  {confirmationData.pendingHccs.map((hcc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <p className="font-bold text-yellow-700 text-lg">{hcc}</p>
                        <p className="text-yellow-600 text-sm">Awaiting clarification</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 mb-8 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Next Steps</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Decision recorded and saved in the system</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Member risk score will be updated within 24 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Provider will be notified of pending items</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Review history automatically updated</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/member-360'}
            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            👁️ VIEW CASE
          </button>
          <Link
            to="/review-queue"
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-center"
          >
            📋 BACK TO QUEUE
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            🏠 BACK TO DASHBOARD
          </Link>
        </div>


      </div>
    </MainLayout>
  );
};

export default DecisionConfirmation;
