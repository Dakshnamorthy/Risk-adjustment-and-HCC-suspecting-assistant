import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, ChevronDown, User, AlertCircle, TrendingUp } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function Members({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [riskFilter, setRiskFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync category filter with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    } else {
      setCategoryFilter('all');
    }
  }, [location.search]);

  // Mock members data
  useEffect(() => {
    // TODO: Replace with actual FastAPI call e.g., axios.get('/api/members?risk=...&age=...')
    const mockMembers = [
      {
        id: 'MBR-001',
        name: 'James Wilson',
        mrn: 'MRN-12345',
        dob: '1958-03-15',
        age: 66,
        sex: 'M',
        riskScore: 4.8,
        riskLevel: 'Very High',
        hccCount: 12,
        docGaps: 3,
        status: 'Active',
        category: 'Flagged Members',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-15',
      },
      {
        id: 'MBR-002',
        name: 'Margaret Davis',
        mrn: 'MRN-12346',
        dob: '1952-07-22',
        age: 72,
        sex: 'F',
        riskScore: 4.2,
        riskLevel: 'High',
        hccCount: 9,
        docGaps: 1,
        status: 'Active',
        category: 'Unflagged',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-08-12',
      },
      {
        id: 'MBR-003',
        name: 'Robert Johnson',
        mrn: 'MRN-12347',
        dob: '1962-11-08',
        age: 62,
        sex: 'M',
        riskScore: 3.5,
        riskLevel: 'Moderate',
        hccCount: 6,
        docGaps: 2,
        status: 'Active',
        category: 'Mark for Review',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-10',
      },
      {
        id: 'MBR-004',
        name: 'Patricia Brown',
        mrn: 'MRN-12348',
        dob: '1955-05-30',
        age: 69,
        sex: 'F',
        riskScore: 4.5,
        riskLevel: 'Very High',
        hccCount: 11,
        docGaps: 4,
        status: 'Active',
        category: 'Flagged Members',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-14',
      },
      {
        id: 'MBR-005',
        name: 'Michael Garcia',
        mrn: 'MRN-12349',
        dob: '1970-01-12',
        age: 55,
        sex: 'M',
        riskScore: 2.1,
        riskLevel: 'Low',
        hccCount: 2,
        docGaps: 0,
        status: 'Active',
        category: 'Unflagged',
        provider: 'Dr. James Martinez',
        lastReview: '2025-08-08',
      },
      {
        id: 'MBR-006',
        name: 'Linda Martinez',
        mrn: 'MRN-12350',
        dob: '1948-09-25',
        age: 76,
        sex: 'F',
        riskScore: 4.9,
        riskLevel: 'Very High',
        hccCount: 13,
        docGaps: 5,
        status: 'Active',
        category: 'In Follow Up',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-13',
      },
      {
        id: 'MBR-007',
        name: 'William Thompson',
        mrn: 'MRN-12351',
        dob: '1960-06-17',
        age: 64,
        sex: 'M',
        riskScore: 3.8,
        riskLevel: 'High',
        hccCount: 8,
        docGaps: 1,
        status: 'Inactive',
        category: 'Flagged Members',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-07-20',
      },
      {
        id: 'MBR-008',
        name: 'Barbara Miller',
        mrn: 'MRN-12352',
        dob: '1965-02-03',
        age: 60,
        sex: 'F',
        riskScore: 2.8,
        riskLevel: 'Moderate',
        hccCount: 4,
        docGaps: 1,
        status: 'Active',
        category: 'Mark for Review',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-09',
      },
      {
        id: 'MBR-009',
        name: 'David Lee',
        mrn: 'MRN-12353',
        dob: '1957-12-11',
        age: 67,
        sex: 'M',
        riskScore: 4.1,
        riskLevel: 'High',
        hccCount: 10,
        docGaps: 2,
        status: 'Active',
        category: 'In Follow Up',
        provider: 'Dr. James Martinez',
        lastReview: '2025-08-11',
      },
      {
        id: 'MBR-010',
        name: 'Susan White',
        mrn: 'MRN-12354',
        dob: '1951-04-07',
        age: 73,
        sex: 'F',
        riskScore: 4.6,
        riskLevel: 'Very High',
        hccCount: 11,
        docGaps: 3,
        status: 'Active',
        category: 'Flagged Members',
        provider: 'Dr. Sarah Johnson',
        lastReview: '2025-08-16',
      },
      {
        id: 'MBR-011',
        name: 'Christopher Harris',
        mrn: 'MRN-12355',
        dob: '1968-08-19',
        age: 57,
        sex: 'M',
        riskScore: 2.4,
        riskLevel: 'Low',
        hccCount: 3,
        docGaps: 0,
        status: 'Active',
        category: 'Unflagged',
        provider: 'Dr. Michael Chen',
        lastReview: '2025-08-07',
      },
      {
        id: 'MBR-012',
        name: 'Nancy Clark',
        mrn: 'MRN-12356',
        dob: '1954-10-29',
        age: 70,
        sex: 'F',
        riskScore: 3.9,
        riskLevel: 'High',
        hccCount: 9,
        docGaps: 2,
        status: 'Active',
        category: 'Unflagged',
        provider: 'Dr. Lisa Anderson',
        lastReview: '2025-08-14',
      },
    ];
    setMembers(mockMembers);
  }, []);

  // Filter and search members
  useEffect(() => {
    let filtered = members;

    if (riskFilter !== 'all') {
      filtered = filtered.filter((member) => member.riskLevel === riskFilter);
    }
    
    if (ageFilter !== 'all') {
      if (ageFilter === 'under60') filtered = filtered.filter(m => m.age < 60);
      else if (ageFilter === '60-70') filtered = filtered.filter(m => m.age >= 60 && m.age <= 70);
      else if (ageFilter === '71-80') filtered = filtered.filter(m => m.age >= 71 && m.age <= 80);
      else if (ageFilter === 'over80') filtered = filtered.filter(m => m.age > 80);
    }
    
    if (sexFilter !== 'all') {
      filtered = filtered.filter(m => m.sex === sexFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, riskFilter, ageFilter, sexFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Very High':
        return 'bg-status-danger/10 text-status-danger border-status-danger/20';
      case 'High':
        return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'Moderate':
        return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'Low':
        return 'bg-status-success/10 text-status-success border-status-success/20';
      default:
        return 'bg-surface-background text-content-muted border-surface-border';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-status-success/10 text-status-success'
      : 'bg-surface-background text-content-muted';
  };

  const handleViewMember = (memberId) => {
    navigate(`/member-360?id=${memberId}`);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Members Directory</h1>
          <p className="text-content-muted">Manage and view all enrolled members</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border p-4 md:p-6 mb-6 md:mb-8 card-shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Risk Level Filter */}
            <div className="sm:col-span-1 lg:col-span-1">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-content-muted" size={18} />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none text-content-main"
                >
                  <option value="all">All Risks</option>
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-content-muted pointer-events-none" size={18} />
              </div>
            </div>
            
            {/* Age Filter */}
            <div className="sm:col-span-1 lg:col-span-1">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-content-muted" size={18} />
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none text-content-main"
                >
                  <option value="all">All Ages</option>
                  <option value="under60">Under 60</option>
                  <option value="60-70">60 - 70</option>
                  <option value="71-80">71 - 80</option>
                  <option value="over80">80+</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-content-muted pointer-events-none" size={18} />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="sm:col-span-1 lg:col-span-1">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-content-muted" size={18} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none text-content-main"
                >
                  <option value="all">All Categories</option>
                  <option value="Flagged Members">Flagged Members</option>
                  <option value="Unflagged">Unflagged</option>
                  <option value="Mark for Review">Mark for Review</option>
                  <option value="In Follow Up">In Follow Up</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-content-muted pointer-events-none" size={18} />
              </div>
            </div>

            {/* Sex Filter */}
            <div className="sm:col-span-1 lg:col-span-1">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-content-muted" size={18} />
                <select
                  value={sexFilter}
                  onChange={(e) => setSexFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none text-content-main"
                >
                  <option value="all">All Sex</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-content-muted pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-content-muted mt-4 font-medium">
            Showing {paginatedMembers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
          </p>
        </div>

        {/* Members Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border overflow-hidden card-shadow">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead className="bg-surface-background border-b border-surface-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">MRN</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Age/Sex</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">HCC Count</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Doc Gaps</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-surface-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-content-main">{member.name}</p>
                          <p className="text-xs text-content-muted">{member.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted font-medium">{member.mrn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted">{member.age} / {member.sex}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getRiskColor(member.riskLevel)}`}>
                          {member.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-content-main">{member.hccCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${member.docGaps > 0 ? 'bg-status-warning/10 text-status-warning' : 'bg-status-success/10 text-status-success'}`}>
                          {member.docGaps}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted">{member.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewMember(member.id)}
                          className="px-4 py-1.5 bg-surface border border-surface-border text-brand-blue rounded-md hover:bg-brand-blue/5 hover:border-brand-blue/30 transition-all font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-content-muted">
                      No members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-surface-background px-4 sm:px-6 py-4 border-t border-surface-border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-content-main bg-surface border border-surface-border rounded-md hover:bg-surface-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md shrink-0 transition-colors ${
                      currentPage === i + 1
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-surface text-content-main border border-surface-border hover:bg-surface-background'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-content-main bg-surface border border-surface-border rounded-md hover:bg-surface-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
