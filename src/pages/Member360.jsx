import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { getMemberById, membersData } from '../data/membersData';

const Member360 = ({ user, onSignOut }) => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id') || 'MXQ1';
  const [activeTab, setActiveTab] = useState('profile');

  const memberData = getMemberById(memberId);

  const hccDetails = memberData.hccDetails || [];
  const claims = memberData.claims || [];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">④ Member 360°</h1>
          <p className="text-gray-600">Comprehensive member profile and health risk analysis</p>
        </div>

        {/* Member Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Member Name</p>
              <h2 className="text-2xl font-bold">{memberData.name}</h2>
              <p className="text-blue-100 text-sm mt-1">{memberData.id}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Status</p>
              <p className="text-2xl font-bold">🟢 {memberData.status}</p>
              <p className="text-blue-100 text-sm mt-1">Active Member</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Risk Score</p>
              <p className="text-3xl font-bold">{memberData.riskScore}</p>
              <p className="text-blue-100 text-sm mt-1">Moderate Risk</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold">Age</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{memberData.age}</p>
            <p className="text-gray-500 text-xs mt-2">DOB: {memberData.dob}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold">Active HCCs</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{memberData.hccCount}</p>
            <p className="text-gray-500 text-xs mt-2">Captured Conditions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Documentation</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{memberData.documentation}</p>
            <p className="text-gray-500 text-xs mt-2">Complete</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold">Member Since</p>
            <p className="text-lg font-bold text-blue-600 mt-2">{memberData.memberSince}</p>
            <p className="text-gray-500 text-xs mt-2">10 years active</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="flex border-b">
            {['profile', 'hcc', 'claims'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab === 'profile' && '👤 Profile'}
                {tab === 'hcc' && '🧬 HCC Codes'}
                {tab === 'claims' && '💳 Claims'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">{memberData.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Insurance Plan</p>
                  <p className="text-lg font-semibold text-gray-900">{memberData.insurance}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Primary Provider</p>
                  <p className="text-lg font-semibold text-gray-900">{memberData.provider}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Contact Status</p>
                  <p className="text-lg font-semibold text-green-600">✓ Verified</p>
                </div>
              </div>
            )}

            {/* HCC Tab */}
            {activeTab === 'hcc' && (
              <div className="space-y-4">
                {hccDetails.map((hcc, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{hcc.code}: {hcc.desc}</h3>
                      <span className="text-green-600 font-bold">{hcc.risk}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        hcc.strength === 'Strong' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {hcc.strength}
                      </span>
                      <span className="text-gray-600 text-sm">Evidence Strength</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === 'claims' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {claims.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{claim.date}</td>
                        <td className="py-3 px-4 font-semibold">{claim.type}</td>
                        <td className="py-3 px-4">{claim.provider}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600">{claim.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>


      </div>
    </MainLayout>
  );
};

export default Member360;
