import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const HumanReview = ({ user, onSignOut }) => {
  const [selectedDecision, setSelectedDecision] = useState(null);

  const reviewData = {
    memberId: 'MXQ1',
    memberName: 'John Doe',
    reviewId: 'REV-2025-001234',
    aiFindings: [
      '✓ Diabetes with complications strongly supported by claims and clinical notes',
      '✓ CHF diagnosis with EF 35% meets HCC-082 criteria',
      '⚠ COPD severity documentation needs clarification'
    ],
    recommendedHccs: ['HCC-019', 'HCC-082', 'HCC-096', 'HCC-112']
  };

  const decisionOptions = [
    {
      id: 'approve-all',
      label: 'Approve All Recommended HCCs',
      color: 'green',
      description: 'Accept all AI-recommended HCC codes for risk adjustment',
      icon: '✅'
    },
    {
      id: 'approve-partial',
      label: 'Approve Selected HCCs Only',
      color: 'blue',
      description: 'Approve HCC-019 & HCC-082; Request clarification on others',
      icon: '⚠️'
    },
    {
      id: 'request-revision',
      label: 'Request Provider Documentation',
      color: 'yellow',
      description: 'Request additional documentation from provider',
      icon: '📧'
    },
    {
      id: 'reject',
      label: 'Reject HCC Recommendations',
      color: 'red',
      description: 'Insufficient evidence for HCC capture',
      icon: '❌'
    }
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⑦ Human Review</h1>
          <p className="text-gray-600">Care manager final decision and approval</p>
        </div>

        {/* Review Summary Card */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-cyan-100 text-sm font-semibold">Review ID</p>
              <p className="text-2xl font-bold mt-1">{reviewData.reviewId}</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm font-semibold">Member</p>
              <p className="text-2xl font-bold mt-1">{reviewData.memberName}</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm font-semibold">Member ID</p>
              <p className="text-2xl font-bold mt-1">{reviewData.memberId}</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm font-semibold">Recommended HCCs</p>
              <p className="text-2xl font-bold mt-1">{reviewData.recommendedHccs.length}</p>
            </div>
          </div>
        </div>

        {/* AI Findings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Findings Summary</h2>
          <div className="space-y-3">
            {reviewData.aiFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl mt-0.5">{finding.startsWith('✓') ? '✅' : '⚠️'}</span>
                <p className="text-gray-700 font-semibold">{finding.replace('✓', '').replace('⚠', '').trim()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended HCCs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended HCC Codes</h2>
          <div className="flex flex-wrap gap-3">
            {reviewData.recommendedHccs.map((hcc) => (
              <span key={hcc} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow">
                {hcc}
              </span>
            ))}
          </div>
        </div>

        {/* Decision Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Make Your Decision</h2>
          <div className="space-y-3">
            {decisionOptions.map((option) => (
              <label key={option.id} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all"
                style={{ 
                  borderColor: selectedDecision === option.id ? 
                    (option.color === 'green' ? '#22c55e' : 
                     option.color === 'blue' ? '#3b82f6' : 
                     option.color === 'yellow' ? '#eab308' : '#ef4444') : '#e5e7eb',
                  backgroundColor: selectedDecision === option.id ?
                    (option.color === 'green' ? '#f0fdf4' :
                     option.color === 'blue' ? '#f0f9ff' :
                     option.color === 'yellow' ? '#fffbeb' : '#fef2f2') : 'white'
                }}>
                <input
                  type="radio"
                  name="decision"
                  value={option.id}
                  checked={selectedDecision === option.id}
                  onChange={() => setSelectedDecision(option.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <p className="font-bold text-gray-900 text-lg">{option.label}</p>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Decision */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              if (!selectedDecision) {
                alert('Please select a decision');
                return;
              }
              window.location.href = '/decision-confirmation';
            }}
            className={`px-8 py-3 font-bold rounded-lg transition-colors ${
              selectedDecision 
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            SUBMIT DECISION
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default HumanReview;
