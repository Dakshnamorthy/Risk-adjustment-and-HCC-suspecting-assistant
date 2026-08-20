import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { Loader2, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, FileText, X, Download, Stethoscope } from 'lucide-react';

const AgentAnalysis = ({ user, onSignOut }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  // Report States
  const [generatingReports, setGeneratingReports] = useState({});
  const [generatedReports, setGeneratedReports] = useState({});
  const [activeReport, setActiveReport] = useState(null);
  const [reportStatuses, setReportStatuses] = useState({}); // default is 'Flagged'

  const getStatus = (id) => reportStatuses[id] || 'Flagged';

  const handleCloseReport = () => {
    if (activeReport && getStatus(activeReport.id) === 'Flagged') {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Viewed' }));
    }
    setActiveReport(null);
  };

  const handleMarkForFollowUp = () => {
    if (activeReport) {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Marked for Follow-up' }));
      setActiveReport(null);
    }
  };

  const [members, setMembers] = useState([]);

  // Fetch initial flagged members from backend
  useEffect(() => {
    // TODO: Replace with actual FastAPI call e.g., axios.get('/api/flagged-members')
    setMembers([
      { id: 'MEM-4192', age: 68, sex: 'F', icd: 'J44.9', name: 'Elena Rostova', missingHcc: 'HCC-111 (COPD)', estimatedRaf: '0.328', confidence: '94%' },
      { id: 'MEM-5543', age: 74, sex: 'M', icd: 'E66.01', name: 'David Kim', missingHcc: 'HCC-022 (Morbid Obesity)', estimatedRaf: '0.273', confidence: '89%' },
      { id: 'MEM-8821', age: 82, sex: 'M', icd: 'E11.9', name: 'James Wilson', missingHcc: 'HCC-019 (Diabetes)', estimatedRaf: '0.104', confidence: '97%' }
    ]);
  }, []);

  const handleRunAnalysis = () => {
    setIsProcessing(true);
    // Simulate FastAPI backend analysis delay
    setTimeout(() => {
      setIsProcessing(false);
      setHasResults(true);
    }, 3500);
  };

  const handleGenerateReport = (memberId) => {
    setGeneratingReports(prev => ({ ...prev, [memberId]: true }));
    // Simulate FastAPI backend generation delay
    setTimeout(() => {
      setGeneratingReports(prev => ({ ...prev, [memberId]: false }));
      setGeneratedReports(prev => ({ ...prev, [memberId]: true }));
    }, 2000);
  };

  const displayedMembers = [...members];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg">
                <Stethoscope size={28} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-content-main">Agent Analysis</h1>
            </div>
            <p className="text-content-muted text-sm md:text-base">Verify flagged members with suspected missing HCCs using AI clinical documentation review.</p>
          </div>
          {hasResults && (
            <button onClick={() => setHasResults(false)} className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
              Reset Analysis
            </button>
          )}
        </div>

        <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border card-shadow">
          
          {/* Header Action Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-surface-border pb-6">
            <div>
              <h2 className="text-xl font-semibold text-content-main">Queue: Flagged Members</h2>
              <p className="text-sm text-content-muted mt-1">3 members awaiting clinical evidence verification</p>
            </div>
            
            {!hasResults && (
              <button 
                onClick={handleRunAnalysis}
                disabled={isProcessing}
                className="mt-4 md:mt-0 bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Analyzing Evidence...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Run Agent Analysis</span>
                  </>
                )}
              </button>
            )}
            
            {hasResults && (
               <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
                 <div className="flex items-center space-x-2 text-status-success bg-status-success/10 px-4 py-2 rounded-lg font-semibold text-sm">
                   <CheckCircle2 size={18} />
                   <span>Verification Complete</span>
                 </div>
               </div>
            )}
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead>
                <tr className="text-xs font-semibold text-content-muted uppercase tracking-wider border-b border-surface-border bg-surface-background">
                  <th className="py-3 px-4 rounded-tl-lg">Patient ID</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">ICD Code</th>
                  {hasResults && (
                    <>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 rounded-tr-lg">Reports</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {displayedMembers.map((member, idx) => (
                  <tr key={idx} className="hover:bg-surface-background/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-content-main">{member.id}</td>
                    <td className="py-4 px-4 text-content-muted font-medium">{member.age}</td>
                    <td className="py-4 px-4 text-content-muted font-medium">{member.sex}</td>
                    <td className="py-4 px-4 font-medium text-content-main">{member.icd}</td>
                    {hasResults && (
                      <>
                        <td className="py-4 px-4">
                           {getStatus(member.id) === 'Flagged' && <span className="text-content-muted font-semibold text-sm px-2.5 py-1">Flagged</span>}
                           {getStatus(member.id) === 'Viewed' && <span className="text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md font-semibold text-sm">Viewed</span>}
                           {getStatus(member.id) === 'Marked for Follow-up' && <span className="text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-md font-semibold text-sm">Marked for Follow-up</span>}
                        </td>
                        <td className="py-4 px-4 w-[160px]">
                          {generatedReports[member.id] ? (
                            <button 
                              onClick={() => setActiveReport(member)}
                              className="w-[140px] flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-md font-semibold text-xs hover:bg-brand-blue/20 transition-colors"
                            >
                              <FileText size={14} />
                              <span>View Report</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleGenerateReport(member.id)}
                              disabled={generatingReports[member.id]}
                              className="w-[140px] flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-surface border border-surface-border text-content-main rounded-md font-semibold text-xs hover:bg-surface-background transition-colors disabled:opacity-50"
                            >
                              {generatingReports[member.id] ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                              <span>{generatingReports[member.id] ? 'Generating...' : 'Generate'}</span>
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isProcessing && (
            <div className="mt-8 flex flex-col items-center justify-center p-12 bg-surface-background rounded-xl border border-surface-border">
              <Stethoscope className="text-brand-purple animate-pulse mb-4" size={48} />
              <p className="text-lg font-semibold text-content-main">Agent is reviewing clinical notes...</p>
              <p className="text-sm text-content-muted mt-2 text-center">Correlating suspected HCCs with unstructured EHR evidence.</p>
            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-surface rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-background">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-status-danger/10 text-status-danger rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-content-main">Clinical Verification Report</h3>
                  <p className="text-xs text-content-muted">Generated for {activeReport.name} ({activeReport.id})</p>
                </div>
              </div>
              <button 
                onClick={handleCloseReport}
                className="p-2 text-content-muted hover:text-content-main hover:bg-surface border border-transparent hover:border-surface-border rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-surface flex-1 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-status-danger/5 rounded-lg border border-status-danger/20">
                    <p className="text-xs text-status-danger font-semibold mb-1 uppercase tracking-wider">Target Suspect HCC</p>
                    <p className="font-bold text-status-danger text-xl">{activeReport.missingHcc}</p>
                 </div>
                 <div className="p-4 bg-surface-background rounded-lg border border-surface-border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-content-muted font-semibold mb-1 uppercase tracking-wider">Agent Confidence</p>
                      <p className="font-bold text-content-main text-2xl">{activeReport.confidence}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-content-muted font-semibold mb-1 uppercase tracking-wider">Estimated Impact</p>
                      <p className="font-bold text-content-main text-xl">+{activeReport.estimatedRaf}</p>
                    </div>
                 </div>
               </div>
               
               <div>
                  <h4 className="font-semibold text-content-main mb-3 pb-2 border-b border-surface-border">Extracted Clinical Evidence</h4>
                  <p className="text-sm text-content-muted leading-relaxed mb-4">
                    The backend AI agent successfully analyzed 4 recent clinical encounter notes and 2 specialist referrals. 
                    Strong textual evidence was found supporting the active management of the suspected condition, which was omitted from the primary claims data.
                  </p>
                  <div className="bg-surface-background p-4 rounded-lg border border-surface-border text-sm font-mono text-content-main">
                    "...patient presents today for follow-up of their uncontrolled condition. We are adjusting the medication dosage and have recommended continuous monitoring..."
                  </div>
               </div>
               
               <div>
                  <h4 className="font-semibold text-content-main mb-3 pb-2 border-b border-surface-border">Recommended Agent Actions</h4>
                  <ul className="list-disc list-inside text-sm text-content-muted space-y-2">
                    <li>Submit query to provider for coding clarification based on found evidence.</li>
                    <li>Update member risk profile based on high-confidence finding.</li>
                    <li>Schedule follow-up via Care Management within 14 days.</li>
                  </ul>
               </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-border bg-surface-background flex flex-col sm:flex-row justify-between items-center gap-4">
               <button 
                 onClick={handleMarkForFollowUp}
                 className="w-full sm:w-auto px-4 py-2 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning rounded-lg font-semibold text-sm transition-colors"
               >
                 Mark for Follow-up
               </button>
               
               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-4 py-2 bg-surface border border-surface-border hover:bg-surface-background text-content-main rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2">
                   <Download size={16} />
                   <span>Download PDF</span>
                 </button>
                 <button 
                   onClick={handleCloseReport}
                   className="w-full sm:w-auto px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"
                 >
                   Close
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default AgentAnalysis;
