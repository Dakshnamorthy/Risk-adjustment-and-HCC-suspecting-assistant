import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const ReviewQueue = ({ user, onSignOut }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queueItems = [
    { id: 'MXQ1', memberName: 'John Doe', hcc: 'HCC-019', priority: 'High', strength: 'Strong', documentation: '92%', daysWaiting: 3 },
    { id: 'MXQ2', memberName: 'Jane Smith', hcc: 'HCC-082', priority: 'High', strength: 'Strong', documentation: '88%', daysWaiting: 5 },
    { id: 'MXQ3', memberName: 'Robert Johnson', hcc: 'HCC-096', priority: 'Medium', strength: 'Moderate', documentation: '75%', daysWaiting: 2 },
    { id: 'MXQ4', memberName: 'Maria Garcia', hcc: 'HCC-112', priority: 'Low', strength: 'Weak', documentation: '60%', daysWaiting: 1 },
    { id: 'MXQ5', memberName: 'James Wilson', hcc: 'HCC-019', priority: 'High', strength: 'Strong', documentation: '95%', daysWaiting: 7 },
    { id: 'MXQ6', memberName: 'Sarah Lee', hcc: 'HCC-028', priority: 'Medium', strength: 'Moderate', documentation: '80%', daysWaiting: 4 },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      setSearchTerm('');
      setFilterPriority('all');
      setCurrentPage(1);
      alert('✅ Review Queue Refreshed Successfully!');
    }, 1500);
  };

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Review Queue</h1>
          <p className="text-gray-600">Manage and prioritize member reviews requiring attention</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold">High Priority</p>
            <p className="text-3xl font-bold text-red-600">{queueItems.filter(q => q.priority === 'High').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-600">
            <p className="text-gray-600 text-sm font-semibold">Medium Priority</p>
            <p className="text-3xl font-bold text-yellow-600">{queueItems.filter(q => q.priority === 'Medium').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold">Low Priority</p>
            <p className="text-3xl font-bold text-green-600">{queueItems.filter(q => q.priority === 'Low').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold">Total Items</p>
            <p className="text-3xl font-bold text-blue-600">{queueItems.length}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Search by Member ID or Name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select 
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-3 text-white font-semibold rounded-lg transition-all ${
                isRefreshing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
                🔄
              </span>
              {isRefreshing ? ' Refreshing...' : ' Refresh Queue'}
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </button>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Member ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Member Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">HCC Code</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Strength</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Documentation</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Days Waiting</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.memberName}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{item.hcc}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.priority === 'High' && '🔴'} {item.priority === 'Medium' && '🟡'} {item.priority === 'Low' && '🟢'} {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.strength === 'Strong' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.strength}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: item.documentation}}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">{item.documentation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.daysWaiting > 5 ? 'bg-red-100 text-red-700' :
                        item.daysWaiting > 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.daysWaiting} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/member-360?id=${item.id}`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors inline-block"
                      >
                        REVIEW
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                    No items matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 mb-8">
            <p className="text-sm text-gray-600">Showing {paginatedItems.length} of {filteredItems.length} items</p>
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

export default ReviewQueue;
