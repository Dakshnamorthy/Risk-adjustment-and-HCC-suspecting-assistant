import React, { useState } from 'react';
import { Brain, CheckCircle2, FileText, File } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function UnflaggedMembers({ user, onSignOut }) {
  const [members, setMembers] = useState([
    {
      id: 'MEM-3321',
      age: 81,
      sex: 'F',
      icdCode: 'M15.9',
      riskScore: '1.250',
      status: 'Viewed',
      reportStatus: 'view',
      nextStep: 'Pending',
    },
    {
      id: 'MEM-1102',
      age: 72,
      sex: 'F',
      icdCode: 'I10',
      riskScore: '1.120',
      status: 'Unflagged',
      reportStatus: 'view',
      nextStep: 'Pending',
    },
    {
      id: 'MEM-9910',
      age: 65,
      sex: 'M',
      icdCode: 'J45.909',
      riskScore: '1.050',
      status: 'Unflagged',
      reportStatus: 'view',
      nextStep: 'Pending',
    },
  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleViewReport = (member) => {
    setSelectedMember(member);
    setShowReportModal(true);
  };

  const handleProceed = () => {
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...m, nextStep: 'Proceed', status: m.status === 'Marked for Review' ? m.status : 'Viewed' } : m))
    );
    setShowReportModal(false);
  };

  const handleMarkForReview = () => {
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...m, status: 'Marked for Review' } : m))
    );
    setShowReportModal(false);
  };

  const handleCloseModal = () => {
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id && m.status === 'Unflagged' ? { ...m, status: 'Viewed' } : m))
    );
    setShowReportModal(false);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-6xl mx-auto pb-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <Brain className="text-brand-purple" size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-content-main">
                Review Queue Analysis
              </h1>
            </div>
            <p className="text-content-muted">
              Process members marked for review and generate final agent reports.
            </p>
          </div>
          <button className="text-brand-blue font-medium hover:underline text-sm">
            Reset Analysis
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border p-6 mb-8 card-shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-content-main mb-1">Queue: Marked for Review</h2>
              <p className="text-sm text-content-muted">
                {members.length} members awaiting final review and processing
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 border border-brand-purple text-brand-purple font-medium rounded-lg hover:bg-brand-purple/5 transition-colors text-sm">
                Prioritize Members
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-status-success/10 text-status-success font-medium rounded-lg text-sm">
                <CheckCircle2 size={18} />
                Scores Calculated
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead className="bg-surface-background border-y border-surface-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">PATIENT ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">AGE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">SEX</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">ICD CODE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-purple uppercase tracking-wider">RISK SCORE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">REPORTS</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-content-muted uppercase tracking-wider">NEXT STEP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-background/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-content-main">{member.id}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-content-muted">{member.age}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-content-muted">{member.sex}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-content-main">{member.icdCode}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-brand-purple/10 text-brand-purple">
                        {member.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {member.status === 'Viewed' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-brand-blue/10 text-brand-blue">
                          {member.status}
                        </span>
                      ) : member.status === 'Marked for Review' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-status-warning/10 text-status-warning">
                          Marked for Review
                        </span>
                      ) : (
                        <span className="text-sm text-content-muted font-medium">{member.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewReport(member)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue font-medium rounded-lg hover:bg-brand-blue/20 transition-colors text-sm"
                      >
                        <FileText size={16} />
                        View Report
                      </button>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          member.nextStep === 'Proceed'
                            ? 'bg-status-success/10 text-status-success border-status-success/20'
                            : 'bg-surface-background text-content-muted border-surface-border'
                        }`}
                      >
                        {member.nextStep}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for View Report */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-surface-border flex flex-col max-h-[90vh] animate-slide-up">
              <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-background">
                <h3 className="text-lg font-bold text-content-main flex items-center gap-2">
                  <FileText className="text-brand-purple" size={20} />
                  Report for {selectedMember?.id}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-content-muted hover:text-content-main text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <p className="text-content-muted text-sm leading-relaxed">
                    This report was fetched from the backend. The risk score for <strong>{selectedMember?.id}</strong> has been calculated as <strong>{selectedMember?.riskScore}</strong> based on the HCC mapping for ICD Code <strong>{selectedMember?.icdCode}</strong>.
                  </p>
                  <div className="bg-brand-purple/5 p-4 rounded-lg border border-brand-purple/20">
                    <h4 className="font-semibold text-brand-purple mb-2">Clinical Summary</h4>
                    <p className="text-sm text-content-main">Patient presents with documented conditions matching ICD code {selectedMember?.icdCode}. Backend risk stratification and HCC suspecting pipelines have validated this record. No immediate documentation gaps identified.</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-surface-border bg-surface-background flex justify-end items-center gap-3">
                <button
                  onClick={handleMarkForReview}
                  className="px-4 py-2 bg-surface border border-surface-border text-content-main font-medium rounded-lg hover:bg-surface-background transition-colors text-sm shadow-sm"
                >
                  Mark for Review
                </button>
                <button
                  onClick={handleProceed}
                  className="px-4 py-2 bg-brand-purple text-white font-medium rounded-lg hover:bg-brand-purple/90 transition-colors text-sm shadow-sm"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
