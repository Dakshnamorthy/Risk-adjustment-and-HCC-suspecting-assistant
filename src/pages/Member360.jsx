import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Activity, CreditCard, CheckCircle, FileText } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { getMemberById } from '../data/membersData';

const Member360 = ({ user, onSignOut }) => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id') || 'MBR-001';
  const [activeTab, setActiveTab] = useState('profile');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate backend fetch
    setLoading(true);
    // TODO: Replace with actual FastAPI call e.g., axios.get(`/api/members/${memberId}`)
    setTimeout(() => {
      const data = getMemberById(memberId);
      setMemberData(data);
      setLoading(false);
    }, 500); // 500ms network delay simulation
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

  if (!memberData || !memberData.id) {
    return (
      <MainLayout user={user} onSignOut={onSignOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-content-main mb-2">Member Not Found</h2>
            <p className="text-content-muted">We couldn't find a member with ID: {memberId}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const hccDetails = memberData.hccDetails || [];
  const claims = memberData.claims || [];

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <p className="text-white/60 text-xs md:text-sm font-semibold mb-1 uppercase tracking-wider">Member Name</p>
              <h2 className="text-2xl md:text-3xl font-bold">{memberData.name}</h2>
              <p className="text-white/80 text-sm mt-1 font-medium">{memberData.id}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs md:text-sm font-semibold mb-1 uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(15,159,127,0.8)]"></div>
                <p className="text-xl md:text-2xl font-bold">{memberData.status}</p>
              </div>
              <p className="text-white/80 text-sm mt-1 font-medium">Active Member</p>
            </div>
            <div>
              <p className="text-white/60 text-xs md:text-sm font-semibold mb-1 uppercase tracking-wider">Risk Score</p>
              <p className="text-3xl md:text-4xl font-bold text-brand-purple">{memberData.riskScore}</p>
              <p className="text-white/80 text-sm mt-1 font-medium">Risk Assessed</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-blue border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Age</p>
            <p className="text-3xl font-bold text-content-main mt-2">{memberData.age}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">DOB: {memberData.dob}</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-status-danger border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Active HCCs</p>
            <p className="text-3xl font-bold text-status-danger mt-2">{memberData.hccCount}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">Captured Conditions</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-status-success border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Documentation</p>
            <p className="text-3xl font-bold text-status-success mt-2">{memberData.documentation}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">Complete</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-purple border border-surface-border card-shadow">
            <p className="text-content-muted text-sm font-semibold">Member Since</p>
            <p className="text-2xl font-bold text-brand-purple mt-2">{memberData.memberSince}</p>
            <p className="text-content-muted text-xs mt-2 font-medium">Historical Data Active</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface rounded-xl shadow-sm overflow-hidden mb-8 border border-surface-border card-shadow">
          <div className="flex overflow-x-auto whitespace-nowrap border-b border-surface-border bg-surface-background">
            {[
              { id: 'profile', label: 'Profile', icon: <User size={18} /> },
              { id: 'hcc', label: 'HCC Codes', icon: <Activity size={18} /> },
              { id: 'claims', label: 'Claims', icon: <CreditCard size={18} /> }
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
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Gender</p>
                  <p className="text-lg font-semibold text-content-main">{memberData.gender}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Insurance Plan</p>
                  <p className="text-lg font-semibold text-content-main">{memberData.insurance}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Primary Provider</p>
                  <p className="text-lg font-semibold text-content-main">{memberData.provider}</p>
                </div>
                <div>
                  <p className="text-content-muted text-xs font-semibold mb-1 uppercase tracking-wider">Contact Status</p>
                  <div className="flex items-center gap-1.5 text-status-success font-semibold text-lg">
                    <CheckCircle size={20} />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* HCC Tab */}
            {activeTab === 'hcc' && (
              <div className="space-y-4">
                {hccDetails.map((hcc, idx) => (
                  <div key={idx} className="border-l-4 border-l-brand-blue bg-surface-background rounded-r-lg pl-4 pr-4 py-4 border-y border-r border-surface-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <h3 className="font-bold text-content-main text-[15px]">{hcc.code}: {hcc.desc}</h3>
                      <span className="text-status-success font-bold text-sm bg-status-success/10 px-2.5 py-1 rounded-md">Impact: {hcc.risk}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        hcc.strength === 'Strong' ? 'bg-status-success/10 text-status-success' :
                        'bg-status-warning/10 text-status-warning'
                      }`}>
                        {hcc.strength}
                      </span>
                      <span className="text-content-muted text-xs font-medium uppercase tracking-wider">Evidence Strength</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === 'claims' && (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-background">
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Service Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Provider</th>
                      <th className="text-right py-3 px-4 font-semibold text-content-muted uppercase tracking-wider text-xs">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {claims.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-surface-background/50 transition-colors">
                        <td className="py-3 px-4 text-content-main">{claim.date}</td>
                        <td className="py-3 px-4 font-semibold text-content-main">{claim.type}</td>
                        <td className="py-3 px-4 text-content-muted font-medium">{claim.provider}</td>
                        <td className="py-3 px-4 text-right font-bold text-brand-blue">{claim.amount}</td>
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
