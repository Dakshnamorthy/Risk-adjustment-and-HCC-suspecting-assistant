import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { membersAPI } from '../services/apiService';

export default function Members({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flagFilter, setFlagFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sync flag filter with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      // Map category names to flag status
      if (categoryParam === 'Flagged Members') {
        setFlagFilter('FLAGGED');
      } else if (categoryParam === 'Unflagged') {
        setFlagFilter('UNFLAGGED');
      } else {
        setFlagFilter('all');
      }
    } else {
      setFlagFilter('all');
    }
  }, [location.search]);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        const params = {
          page: currentPage,
          page_size: itemsPerPage,
        };

        // Apply filters
        if (flagFilter !== 'all') {
          params.flag_status = flagFilter;
        }
        
        if (sexFilter !== 'all') {
          params.sex = sexFilter;
        }
        
        // Age filters
        if (ageFilter === 'under60') {
          params.max_age = 59;
        } else if (ageFilter === '60-70') {
          params.min_age = 60;
          params.max_age = 70;
        } else if (ageFilter === '71-80') {
          params.min_age = 71;
          params.max_age = 80;
        } else if (ageFilter === 'over80') {
          params.min_age = 81;
        }

        const data = await membersAPI.getAll(params);
        setMembers(data.members);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setError(err.message);
        setMembers([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentPage, flagFilter, ageFilter, sexFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [flagFilter, ageFilter, sexFilter]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const countHCCs = (hccCodes) => {
    if (!hccCodes) return 0;
    // HCC codes can be a single value or comma-separated values
    const codeStr = String(hccCodes);
    if (codeStr.includes(',')) {
      return codeStr.split(',').filter(code => code.trim()).length;
    }
    // Single HCC code
    return codeStr.trim() ? 1 : 0;
  };

  const handleViewMember = (patientId) => {
    navigate(`/member-360?id=${patientId}`);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Members Directory</h1>
          <p className="text-content-muted">Manage and view all enrolled members</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg text-status-danger text-sm">
            Failed to load members: {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border p-4 md:p-6 mb-6 md:mb-8 card-shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
            {loading ? 'Loading...' : `Showing ${members.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to ${Math.min(currentPage * itemsPerPage, total)} of ${total} members`}
          </p>
        </div>

        {/* Members Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border overflow-hidden card-shadow">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead className="bg-surface-background border-b border-surface-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Member ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Age/Sex</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">HCC Count</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Encounters</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-content-muted">
                      Loading members...
                    </td>
                  </tr>
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member.patient_id} className="hover:bg-surface-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-content-main">{member.patient_id}</p>
                          <p className="text-xs text-content-muted">Patient ID</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted">{member.age} / {member.sex}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted font-medium">{member.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-content-main">
                        {countHCCs(member.calculated_hcc_codes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-muted">
                        {member.number_of_encounters || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewMember(member.patient_id)}
                          className="px-4 py-1.5 bg-surface border border-surface-border text-brand-blue rounded-md hover:bg-brand-blue/5 hover:border-brand-blue/30 transition-all font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-content-muted">
                      No members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="bg-surface-background px-6 py-4 border-t border-surface-border flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-content-main bg-surface border border-surface-border rounded-md hover:bg-surface-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
                  // Show first 10 pages or pages around current page
                  let pageNum;
                  if (totalPages <= 10) {
                    pageNum = i + 1;
                  } else if (currentPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 4) {
                    pageNum = totalPages - 9 + i;
                  } else {
                    pageNum = currentPage - 4 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'bg-surface text-content-main border border-surface-border hover:bg-surface-background'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
