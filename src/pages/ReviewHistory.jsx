import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const ReviewHistory = ({ user, onSignOut }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const reviewHistory = [
    { id: 'REV-2025-001234', memberId: 'MXQ1', memberName: 'John Doe', reviewDate: '2025-03-20', decision: 'Approved Selected', hccCount: 2, status: 'Completed', riskImpact: '+0.45', reviewTime: '12 min' },
    { id: 'REV-2025-001233', memberId: 'MXQ2', memberName: 'Jane Smith', reviewDate: '2025-03-19', decision: 'Approved All', hccCount: 3, status: 'Completed', riskImpact: '+0.78', reviewTime: '18 min' },
    { id: 'REV-2025-001232', memberId: 'MXQ3', memberName: 'Robert Johnson', reviewDate: '2025-03-18', decision: 'Request Docs', hccCount: 1, status: 'Pending', riskImpact: 'Pending', reviewTime: '8 min' },
    { id: 'REV-2025-001231', memberId: 'MXQ4', memberName: 'Maria Garcia', reviewDate: '2025-03-17', decision: 'Rejected', hccCount: 0, status: 'Completed', riskImpact: '0.00', reviewTime: '5 min' },
    { id: 'REV-2025-001230', memberId: 'MXQ5', memberName: 'James Wilson', reviewDate: '2025-03-16', decision: 'Approved Selected', hccCount: 2, status: 'Completed', riskImpact: '+0.32', reviewTime: '14 min' },
    { id: 'REV-2025-001229', memberId: 'MXQ6', memberName: 'Sarah Lee', reviewDate: '2025-03-15', decision: 'Approved All', hccCount: 4, status: 'Completed', riskImpact: '+1.12', reviewTime: '22 min' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Prepare CSV data
      const headers = ['Review ID', 'Member ID', 'Member Name', 'Review Date', 'Decision', 'HCC Count', 'Status', 'Risk Impact', 'Review Time'];
      const rows = reviewHistory.map(item => [
        item.id,
        item.memberId,
        item.memberName,
        item.reviewDate,
        item.decision,
        item.hccCount,
        item.status,
        item.riskImpact,
        item.reviewTime
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ReviewHistory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      alert('✅ Review History Exported Successfully!\nFile: ReviewHistory_' + new Date().toISOString().split('T')[0] + '.csv');
    }, 1000);
  };

  const filteredHistory = reviewHistory.filter(item => {
    const matchesSearch = item.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'Approved All':
      case 'Approved Selected':
        return '✅';
      case 'Request Docs':
        return '📧';
      case 'Rejected':
        return '❌';
      default:
        return '•';
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'Approved All':
      case 'Approved Selected':
        return 'text-green-600';
      case 'Request Docs':
        return 'text-yellow-600';
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⑨ Review History</h1>
          <p className="text-gray-600">Complete historical record of all member reviews</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold">Total Reviews</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{reviewHistory.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {reviewHistory.filter(r => r.status === 'Completed').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-yellow-600">
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {reviewHistory.filter(r => r.status === 'Pending').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold">Approved</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {reviewHistory.filter(r => r.decision.includes('Approved')).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-indigo-600">
            <p className="text-gray-600 text-sm font-semibold">Avg Time</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">13.5 <span className="text-lg">min</span></p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Search by Member ID, Name, or Review ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select 
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Status</option>
              <option value="Completed">✅ Completed</option>
              <option value="Pending">⏳ Pending</option>
            </select>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`px-4 py-3 text-white font-semibold rounded-lg transition-all ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span style={{ display: 'inline-block', animation: isExporting ? 'spin 1s linear infinite' : 'none' }}>
                📥
              </span>
              {isExporting ? ' Exporting...' : ' Export Records'}
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Review ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Member</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Review Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Decision</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">HCCs</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Risk Impact</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{item.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{item.memberName}</p>
                        <p className="text-sm text-gray-600">{item.memberId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{item.reviewDate}</td>
                    <td className={`px-6 py-4 font-bold ${getDecisionColor(item.decision)}`}>
                      <span className="mr-2">{getDecisionIcon(item.decision)}</span>
                      {item.decision}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">
                        {item.hccCount}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${
                      item.riskImpact === 'Pending' ? 'text-yellow-600' :
                      item.riskImpact === '0.00' ? 'text-gray-600' :
                      'text-green-600'
                    }`}>
                      {item.riskImpact}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.reviewTime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status === 'Completed' && '✓'} {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                    No reviews found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">Showing {paginatedHistory.length} of {filteredHistory.length} items</p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}


      </div>
    </MainLayout>
  );
};

export default ReviewHistory;
