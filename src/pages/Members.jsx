import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, User, AlertCircle, TrendingUp } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock members data
  useEffect(() => {
    const mockMembers = [
      {
        id: 'MBR-001',
        name: 'James Wilson',
        mrn: 'MRN-12345',
        dob: '1958-03-15',
        age: 66,
        riskScore: 4.8,
        riskLevel: 'Very High',
        hccCount: 12,
        docGaps: 3,
        status: 'Active',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-15',
      },
      {
        id: 'MBR-002',
        name: 'Margaret Davis',
        mrn: 'MRN-12346',
        dob: '1952-07-22',
        age: 72,
        riskScore: 4.2,
        riskLevel: 'High',
        hccCount: 9,
        docGaps: 1,
        status: 'Active',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-08-12',
      },
      {
        id: 'MBR-003',
        name: 'Robert Johnson',
        mrn: 'MRN-12347',
        dob: '1962-11-08',
        age: 62,
        riskScore: 3.5,
        riskLevel: 'Moderate',
        hccCount: 6,
        docGaps: 2,
        status: 'Active',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-10',
      },
      {
        id: 'MBR-004',
        name: 'Patricia Brown',
        mrn: 'MRN-12348',
        dob: '1955-05-30',
        age: 69,
        riskScore: 4.5,
        riskLevel: 'Very High',
        hccCount: 11,
        docGaps: 4,
        status: 'Active',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-14',
      },
      {
        id: 'MBR-005',
        name: 'Michael Garcia',
        mrn: 'MRN-12349',
        dob: '1970-01-12',
        age: 55,
        riskScore: 2.1,
        riskLevel: 'Low',
        hccCount: 2,
        docGaps: 0,
        status: 'Active',
        provider: 'Dr. James Martinez',
        lastReview: '2025-08-08',
      },
      {
        id: 'MBR-006',
        name: 'Linda Martinez',
        mrn: 'MRN-12350',
        dob: '1948-09-25',
        age: 76,
        riskScore: 4.9,
        riskLevel: 'Very High',
        hccCount: 13,
        docGaps: 5,
        status: 'Active',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-13',
      },
      {
        id: 'MBR-007',
        name: 'William Thompson',
        mrn: 'MRN-12351',
        dob: '1960-06-17',
        age: 64,
        riskScore: 3.8,
        riskLevel: 'High',
        hccCount: 8,
        docGaps: 1,
        status: 'Inactive',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-07-20',
      },
      {
        id: 'MBR-008',
        name: 'Barbara Miller',
        mrn: 'MRN-12352',
        dob: '1965-02-03',
        age: 60,
        riskScore: 2.8,
        riskLevel: 'Moderate',
        hccCount: 4,
        docGaps: 1,
        status: 'Active',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-09',
      },
      {
        id: 'MBR-009',
        name: 'David Lee',
        mrn: 'MRN-12353',
        dob: '1957-12-11',
        age: 67,
        riskScore: 4.1,
        riskLevel: 'High',
        hccCount: 10,
        docGaps: 2,
        status: 'Active',
        provider: 'Dr. James Martinez',
        lastReview: '2025-08-11',
      },
      {
        id: 'MBR-010',
        name: 'Susan White',
        mrn: 'MRN-12354',
        dob: '1951-04-07',
        age: 73,
        riskScore: 4.6,
        riskLevel: 'Very High',
        hccCount: 11,
        docGaps: 3,
        status: 'Active',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-16',
      },
      {
        id: 'MBR-011',
        name: 'Christopher Harris',
        mrn: 'MRN-12355',
        dob: '1968-08-19',
        age: 57,
        riskScore: 2.4,
        riskLevel: 'Low',
        hccCount: 3,
        docGaps: 0,
        status: 'Active',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-08-07',
      },
      {
        id: 'MBR-012',
        name: 'Nancy Clark',
        mrn: 'MRN-12356',
        dob: '1954-10-29',
        age: 70,
        riskScore: 3.9,
        riskLevel: 'High',
        hccCount: 9,
        docGaps: 2,
        status: 'Active',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-14',
      },
    ];
    setMembers(mockMembers);
  }, []);

  // Filter and search members
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk level filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter((member) => member.riskLevel === riskFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, searchTerm, riskFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Very High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Very High':
        return 'border-l-4 border-l-red-500';
      case 'High':
        return 'border-l-4 border-l-orange-500';
      case 'Moderate':
        return 'border-l-4 border-l-yellow-500';
      case 'Low':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-gray-500';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-50 text-green-700'
      : 'bg-gray-50 text-gray-700';
  };

  const handleViewMember = (memberId) => {
    navigate(`/member-360/${memberId}`);
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'Active').length,
    highRisk: members.filter((m) => m.riskLevel === 'Very High' || m.riskLevel === 'High').length,
    avgRisk: (members.reduce((sum, m) => sum + m.riskScore, 0) / members.length).toFixed(1),
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Members Directory</h1>
          <p className="text-gray-600">Manage and view all enrolled members</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <User className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">High Risk</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highRisk}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Risk Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgRisk}</p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, MRN, or Member ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Risk Level Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mt-4">
            Showing {paginatedMembers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
          </p>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">MRN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">HCC Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doc Gaps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className={`hover:bg-gray-50 transition ${getRiskBgColor(member.riskLevel)}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.mrn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(member.riskLevel)}`}>
                          {member.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.hccCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${member.docGaps > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {member.docGaps}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewMember(member.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
