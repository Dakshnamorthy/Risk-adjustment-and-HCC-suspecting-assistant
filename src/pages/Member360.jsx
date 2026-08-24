import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Activity, CreditCard, AlertCircle } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { membersAPI } from '../services/apiService';

const Member360 = ({ user, onSignOut }) => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('profile');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      setError('No patient ID provided');
      return;
    }

    const fetchMemberHistory = async () => {
      try {
        setLoading(true);
        const data = await membersAPI.getHistory(memberId);
        setMemberData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch member history:', err);
        setError(err.message);
        setMemberData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberHistory();
  }, [memberId]);

  if (loading) {
    return (
      <MainLayout user={user} onSignOut={onSignOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-content-muted font-medium">Loading patient details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !memberData) {
    return (
      <MainLayout user={user} onSignOut={onSignOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-content-main mb-2">Patient Not Found</h2>
            <p className="text-content-muted mb-4">{error || 'Unable to load patient data'}</p>
            <Link
              to="/members"
              className="inline-flex items-center px-6 py-2.5 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-medium text-sm"
            >
              Back to Members Directory
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const summary = memberData.summary || {};
  const historyRecords = memberData.history || [];
  const historyByYear = memberData.history_by_year || {};

  // Helper to count HCC codes
  const countHCCs = (hccCodes) => {
    if (!hccCodes) return 0;
    const codeStr = String(hccCodes);
    if (codeStr.includes(',')) {
      return codeStr.split(',').filter(code => code.trim()).length;
    }
    return codeStr.trim() ? 1 : 0;
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Member 360°</h1>
          <p className="text-content-muted text-sm md:text-base">Comprehensive member profile and health risk analysis</p>
        </div>

        {/* Member Info Card */}
        <div className="bg-brand-navy rounded-xl shadow-sm p-6 md:p-8 mb-6 md:mb-8 text-white card-shadow">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div>
              <p className="text-white/60 text-xs md:text-sm font-semibold mb-1 uppercase tracking-wider">Patient ID</p>
              <h2 className="text-2xl md:text-3xl font-bold">{memberData.patient_id}</h2>
              <p className="text-white/80 text-sm mt-1 font-medium">{summary.sex === 'M' ? 'Male' : 'Female'}, {summary.age} years</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-blue border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Age / Sex</p>
            <p className="text-3xl font-bold text-content-main mt-2">{summary.age}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">{summary.sex === 'M' ? 'Male' : 'Female'}</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-status-danger border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">HCC Count</p>
            <p className="text-3xl font-bold text-status-danger mt-2">{countHCCs(summary.calculated_hcc_codes)}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">Captured Conditions</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-status-success border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Encounters</p>
            <p className="text-3xl font-bold text-status-success mt-2">{summary.number_of_encounters || 0}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">Total Encounters</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-purple border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">History Span</p>
            <p className="text-2xl font-bold text-brand-purple mt-2">{memberData.years ? memberData.years.length : 0} Years</p>
            <p className="text-content-muted text-xs mt-2 font-medium">{memberData.years ? memberData.years.join(', ') : 'N/A'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface rounded-xl shadow-sm overflow-hidden mb-8 border border-surface-border card-shadow">
          <div className="flex flex-wrap border-b border-surface-border bg-surface-background">
            {[
              { id: 'profile', label: 'Profile', icon: <User size={18} /> },
              { id: 'hcc', label: 'HCC History', icon: <Activity size={18} /> },
              { id: 'history', label: 'Yearly History', icon: <CreditCard size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-blue text-brand-blue bg-surface'
                    : 'border-transparent text-content-muted hover:bg-surface hover:text-content-main'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Patient ID</p>
                  <p className="text-lg font-semibold text-content-main">{memberData.patient_id}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Age / Sex</p>
                  <p className="text-lg font-semibold text-content-main">{summary.age} / {summary.sex}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Latest Year</p>
                  <p className="text-lg font-semibold text-content-main">{summary.year || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">HCC Mapping Status</p>
                  <p className="text-lg font-semibold text-content-main">{summary.hcc_mapping_status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Total Diagnoses</p>
                  <p className="text-lg font-semibold text-content-main">{summary.number_of_diagnoses || 0}</p>
                </div>
              </div>
            )}

            {/* HCC History Tab */}
            {activeTab === 'hcc' && (
              <div className="space-y-4">
                {historyRecords.filter(r => r.calculated_hcc_codes).length > 0 ? (
                  historyRecords.filter(r => r.calculated_hcc_codes).map((record, idx) => (
                    <div key={idx} className="border-l-4 border-l-brand-blue bg-surface-background rounded-r-lg pl-4 pr-4 py-4 border-y border-r border-surface-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <h3 className="font-bold text-content-main text-[15px]">
                          {record.year} - HCC: {record.calculated_hcc_codes}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-content-muted">
                        <div>Encounters: {record.number_of_encounters || 0}</div>
                        <div>Diagnoses: {record.number_of_diagnoses || 0}</div>
                        {record.disease_description && <div className="col-span-2">Disease: {record.disease_description}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-content-muted">
                    <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No HCC data available for this patient</p>
                  </div>
                )}
              </div>
            )}

            {/* Yearly History Tab */}
            {activeTab === 'history' && (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-background">
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Year</th>
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">HCC Codes</th>
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Encounters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {historyRecords.length > 0 ? (
                      historyRecords.map((record, idx) => (
                        <tr key={idx} className="hover:bg-surface-background/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-brand-blue">{record.year}</td>
                          <td className="py-3 px-4 text-content-muted font-medium">
                            {record.calculated_hcc_codes || 'None'}
                          </td>
                          <td className="py-3 px-4 text-content-main">{record.number_of_encounters || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-content-muted">
                          No history records available
                        </td>
                      </tr>
                    )}
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
