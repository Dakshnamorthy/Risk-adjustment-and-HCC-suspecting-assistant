import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

const HccMapping = ({ user, onSignOut }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const hccMappings = [
    { icd: 'E11.9', icdDesc: 'Type 2 diabetes mellitus without complications', hcc: 'HCC-019', hccDesc: 'Diabetes with complications', category: 'Endocrine', confidence: '94%' },
    { icd: 'I50.9', icdDesc: 'Unspecified heart failure', hcc: 'HCC-082', hccDesc: 'Congestive Heart Failure', category: 'Cardiovascular', confidence: '91%' },
    { icd: 'J44.9', icdDesc: 'COPD, unspecified', hcc: 'HCC-096', hccDesc: 'Chronic Obstructive Pulmonary Disease', category: 'Respiratory', confidence: '87%' },
    { icd: 'I21.9', icdDesc: 'Unspecified myocardial infarction', hcc: 'HCC-112', hccDesc: 'Myocardial Infarction', category: 'Cardiovascular', confidence: '89%' },
    { icd: 'I10', icdDesc: 'Essential (primary) hypertension', hcc: 'HCC-018', hccDesc: 'Hypertension', category: 'Cardiovascular', confidence: '96%' },
    { icd: 'N18.3', icdDesc: 'Chronic kidney disease, stage 3', hcc: 'HCC-134', hccDesc: 'Chronic Kidney Disease', category: 'Renal', confidence: '85%' },
    { icd: 'J45.9', icdDesc: 'Unspecified asthma', hcc: 'HCC-031', hccDesc: 'Asthma', category: 'Respiratory', confidence: '88%' },
    { icd: 'F32.9', icdDesc: 'Major depressive disorder, single episode', hcc: 'HCC-011', hccDesc: 'Major Depression', category: 'Psychiatric', confidence: '83%' },
  ];

  const categories = ['all', 'Endocrine', 'Cardiovascular', 'Respiratory', 'Renal', 'Psychiatric'];

  const filteredMappings = hccMappings.filter(mapping => {
    const matchesSearch = mapping.icd.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mapping.hcc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mapping.icdDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || mapping.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = {
    Cardiovascular: { count: 3, icon: '❤️' },
    Respiratory: { count: 2, icon: '🫁' },
    Endocrine: { count: 1, icon: '💊' },
    Renal: { count: 1, icon: '🫘' },
    Psychiatric: { count: 1, icon: '🧠' },
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧬 HCC Diagnosis Mapping</h1>
          <p className="text-gray-600">ICD-10 to HCC code mapping reference and conversion tool</p>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {categories.slice(1).map((cat) => (
            <div key={cat} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl mb-2">{categoryStats[cat]?.icon}</p>
              <p className="text-gray-700 font-semibold mb-1">{cat}</p>
              <p className="text-2xl font-bold text-blue-600">{categoryStats[cat]?.count}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Search ICD-10, HCC code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mappings Grid */}
        <div className="space-y-4 mb-8">
          {filteredMappings.length > 0 ? (
            filteredMappings.map((mapping, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {/* ICD-10 Side */}
                  <div className="border-r-0 md:border-r-2 md:border-gray-200 pr-0 md:pr-6">
                    <div className="mb-2 inline-block">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                        ICD-10 CODE
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{mapping.icd}</p>
                    <p className="text-gray-600 mb-4">{mapping.icdDesc}</p>
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                      {mapping.category}
                    </div>
                  </div>

                  {/* Arrow and HCC Side */}
                  <div className="pt-6 md:pt-0">
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 -translate-y-12">
                      <div className="text-3xl text-blue-600">→</div>
                    </div>

                    <div className="mb-2 inline-block">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        MAPPED HCC
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 mb-2">{mapping.hcc}</p>
                    <p className="text-gray-600 mb-4">{mapping.hccDesc}</p>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">AI Confidence:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        parseInt(mapping.confidence) >= 90 ? 'bg-green-100 text-green-700' :
                        parseInt(mapping.confidence) >= 85 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {mapping.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No mappings found matching your search criteria</p>
            </div>
          )}
        </div>

        {/* Reference Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Mapping Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">About ICD-10 Codes</h3>
              <p className="text-gray-700 text-sm mb-3">
                ICD-10-CM codes are used to describe diagnoses, symptoms, and conditions documented in clinical records. They provide detailed clinical information for accurate HCC mapping.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">About HCC Codes</h3>
              <p className="text-gray-700 text-sm mb-3">
                HCC (Hierarchical Condition Category) codes are used for risk adjustment in healthcare quality measures and payment models. They aggregate clinically significant conditions.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-gray-700 text-sm">
              <span className="font-bold">💡 Tip:</span> Use the search functionality to find specific ICD-10 codes and their corresponding HCC mappings. Filter by clinical category for better organization.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HccMapping;
