import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { getMemberById } from '../data/membersData';

const AIAnalysis = ({ user, onSignOut }) => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id') || 'MXQ1';
  const memberData = getMemberById(memberId);
  const analysisResults = [
    {
      id: 1,
      icdCode: 'E11.9',
      icdDescription: 'Type 2 diabetes mellitus without complications',
      mappedHcc: 'HCC-019',
      hccDescription: 'Diabetes with complications',
      priority: 'High',
      whyFlagged: 'Documentation indicates diabetic complications not captured in claims',
      docStatus: 'Incomplete',
      aiConfidence: '94%'
    },
    {
      id: 2,
      icdCode: 'I50.9',
      icdDescription: 'Unspecified heart failure',
      mappedHcc: 'HCC-082',
      hccDescription: 'Congestive Heart Failure',
      priority: 'High',
      whyFlagged: 'EF 35% documented; qualifies for higher risk category',
      docStatus: 'Complete',
      aiConfidence: '91%'
    },
    {
      id: 3,
      icdCode: 'J44.9',
      icdDescription: 'Chronic obstructive pulmonary disease, unspecified',
      mappedHcc: 'HCC-096',
      hccDescription: 'Chronic Obstructive Pulmonary Disease',
      priority: 'Medium',
      whyFlagged: 'FEV1 28% requires severity-level verification',
      docStatus: 'Needs Clarification',
      aiConfidence: '87%'
    },
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⑥ AI Analysis</h1>
          <p className="text-gray-600">ICD-10 to HCC mapping and clinical insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-indigo-600">
            <p className="text-gray-600 text-sm font-semibold">Total Diagnoses</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{analysisResults.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold">High Priority</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {analysisResults.filter(r => r.priority === 'High').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-yellow-600">
            <p className="text-gray-600 text-sm font-semibold">Avg AI Confidence</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">90%</p>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6 mb-8">
          {analysisResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Diagnosis #{result.id}</h3>
                  <p className="text-blue-100 text-sm mt-1">ICD-10: {result.icdCode}</p>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  result.priority === 'High' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {result.priority === 'High' && '🔴'} {result.priority} Priority
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* ICD-10 to HCC Mapping */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* ICD-10 */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    <p className="text-gray-600 text-xs font-semibold mb-2">ICD-10 CODE</p>
                    <p className="text-lg font-bold text-gray-900">{result.icdCode}</p>
                    <p className="text-gray-600 text-sm mt-2">{result.icdDescription}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="text-4xl text-indigo-600">→</div>
                  </div>

                  {/* HCC */}
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                    <p className="text-gray-600 text-xs font-semibold mb-2">MAPPED HCC</p>
                    <p className="text-lg font-bold text-indigo-700">{result.mappedHcc}</p>
                    <p className="text-gray-600 text-sm mt-2">{result.hccDescription}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Why Flagged */}
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-600">
                    <p className="text-gray-600 text-xs font-semibold mb-2">WHY FLAGGED</p>
                    <p className="text-gray-900 font-semibold">{result.whyFlagged}</p>
                  </div>

                  {/* Documentation Status */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <p className="text-gray-600 text-xs font-semibold mb-2">DOCUMENTATION</p>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                      result.docStatus === 'Complete' ? 'bg-green-100 text-green-700' :
                      result.docStatus === 'Incomplete' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {result.docStatus}
                    </span>
                  </div>

                  {/* AI Confidence */}
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <p className="text-gray-600 text-xs font-semibold mb-2">AI CONFIDENCE</p>
                    <p className="text-2xl font-bold text-green-600">{result.aiConfidence}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </MainLayout>
  );
};

export default AIAnalysis;
