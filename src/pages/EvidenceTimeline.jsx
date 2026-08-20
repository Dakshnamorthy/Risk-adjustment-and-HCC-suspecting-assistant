import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { getMemberById } from '../data/membersData';

const EvidenceTimeline = ({ user, onSignOut }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const memberId = searchParams.get('id') || 'MXQ1';
  const memberData = getMemberById(memberId);
  const [selectedHcc, setSelectedHcc] = useState('all');

  const evidenceItems = [
    {
      date: '2025-03-15',
      type: 'Claim',
      hcc: 'HCC-019',
      description: 'Diagnosis: Type 2 Diabetes with complications',
      strength: 'Strong',
      status: 'Verified',
      icon: '💳'
    },
    {
      date: '2025-02-28',
      type: 'Chart Note',
      hcc: 'HCC-082',
      description: 'Patient presents with CHF symptoms - ejection fraction 35%',
      strength: 'Strong',
      status: 'Verified',
      icon: '📋'
    },
    {
      date: '2025-02-15',
      type: 'Lab Result',
      hcc: 'HCC-096',
      description: 'FEV1 48% predicted - COPD stage III',
      strength: 'Moderate',
      status: 'Verified',
      icon: '🧪'
    },
    {
      date: '2025-01-30',
      type: 'Procedure Code',
      hcc: 'HCC-112',
      description: 'Cardiac catheterization - History of MI',
      strength: 'Moderate',
      status: 'Pending Review',
      icon: '🏥'
    },
  ];

  const hccList = ['all', 'HCC-019', 'HCC-082', 'HCC-096', 'HCC-112'];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⑤ Evidence & Timeline</h1>
          <p className="text-gray-600">Supporting documentation and chronological analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold">Total Evidence</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{evidenceItems.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold">Verified Items</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {evidenceItems.filter(e => e.status === 'Verified').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-yellow-600">
            <p className="text-gray-600 text-sm font-semibold">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {evidenceItems.filter(e => e.status === 'Pending Review').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Strong Evidence</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {evidenceItems.filter(e => e.strength === 'Strong').length}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Filter by HCC Code:</p>
          <div className="flex flex-wrap gap-2">
            {hccList.map((hcc) => (
              <button
                key={hcc}
                onClick={() => setSelectedHcc(hcc)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedHcc === hcc
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hcc === 'all' ? 'All Evidence' : hcc}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-900">Evidence Timeline</h2>
          </div>

          <div className="divide-y">
            {evidenceItems.map((item, idx) => (
              (selectedHcc === 'all' || item.hcc === selectedHcc) && (
                <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    {/* Timeline Marker */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                        {item.icon}
                      </div>
                      {idx < evidenceItems.length - 1 && (
                        <div className="w-1 h-12 bg-gray-300 my-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                            {item.type}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">
                            {item.hcc}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                            item.strength === 'Strong'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.strength}
                          </span>
                        </div>
                        <span className="text-gray-600 text-sm font-semibold">{item.date}</span>
                      </div>

                      <p className="text-gray-900 font-semibold mb-3 text-lg">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'Verified' && '✓'} {item.status}
                        </span>
                        <button 
                          onClick={() => navigate('/ai-analysis')}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>


      </div>
    </MainLayout>
  );
};

export default EvidenceTimeline;
