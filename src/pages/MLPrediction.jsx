import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { Brain, Loader2, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, FileText, X, Download } from 'lucide-react';

const MLPrediction = ({ user, onSignOut }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isPrioritized, setIsPrioritized] = useState(false);
  
  // Report States
  const [generatingReports, setGeneratingReports] = useState({});
  const [generatedReports, setGeneratedReports] = useState({});
  const [activeReport, setActiveReport] = useState(null);
  const [reportStatuses, setReportStatuses] = useState({}); // default is 'Unflagged'

  const [members, setMembers] = useState([]);

  // Fetch initial unflagged members from backend
  useEffect(() => {
    // TODO: Replace with actual FastAPI call e.g., axios.get('/api/unflagged-members')
    setMembers([
      { id: 'MEM-1102', age: 72, sex: 'F', icd: 'I10', predictedRaf: '1.120' },
      { id: 'MEM-9910', age: 65, sex: 'M', icd: 'J45.909', predictedRaf: '1.050' },
      { id: 'MEM-3321', age: 81, sex: 'F', icd: 'M15.9', predictedRaf: '1.250' }
    ]);
  }, []);

  const getStatus = (id) => reportStatuses[id] || 'Unflagged';

  const handleCloseReport = () => {
    if (activeReport && getStatus(activeReport.id) === 'Unflagged') {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Viewed' }));
    }
    setActiveReport(null);
  };

  const handleMarkForReview = () => {
    if (activeReport) {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Marked for Review' }));
      setActiveReport(null);
    }
  };

  const handleRunPrediction = () => {
    setIsProcessing(true);
    // Simulate ML inference time
    setTimeout(() => {
      setIsProcessing(false);
      setHasResults(true);
    }, 3000);
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
  if (hasResults && isPrioritized) {
    displayedMembers.sort((a, b) => parseFloat(b.predictedRaf) - parseFloat(a.predictedRaf));
  }

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg">
                <Brain size={28} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-content-main">ML Risk Prediction</h1>
            </div>
            <p className="text-content-muted text-sm md:text-base">Process unflagged members through the predictive model to uncover hidden risk factors.</p>
          </div>
          {hasResults && (
            <button onClick={() => setHasResults(false)} className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
              Reset Analysis
            </button>
          )}
        </div>

        <div className="bg-surface rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-surface-border card-shadow">
          
          {/* Header Action Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-surface-border pb-6">
            <div>
              <h2 className="text-xl font-semibold text-content-main">Queue: Unflagged Members</h2>
              <p className="text-sm text-content-muted mt-1">3 members awaiting ML inference</p>
            </div>
            
            {!hasResults && (
              <button 
                onClick={handleRunPrediction}
                disabled={isProcessing}
                className="mt-4 md:mt-0 bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={18} />
                    <span>Calculate Risk Score</span>
                  </>
                )}
              </button>
            )}
            
            {hasResults && (
               <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                 <button 
                   onClick={() => setIsPrioritized(!isPrioritized)}
                   className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                     isPrioritized ? 'bg-brand-purple text-white border-brand-purple shadow-sm' : 'bg-surface text-brand-purple border-brand-purple hover:bg-brand-purple/5'
                   }`}
                 >
                   {isPrioritized ? 'Priority Applied' : 'Prioritize Members'}
                 </button>
                 <div className="flex items-center space-x-2 text-status-success bg-status-success/10 px-4 py-2 rounded-lg font-semibold text-sm">
                   <CheckCircle2 size={18} />
                   <span>Scores Calculated</span>
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
                  <th className="py-3 px-4 text-brand-purple">Risk Score</th>
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
                    <td className="py-4 px-4">
                      {hasResults ? (
                         <span className="text-base font-bold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-md">{member.predictedRaf}</span>
                      ) : (
                         <span className="text-base font-bold text-content-muted">-</span>
                      )}
                    </td>
                    {hasResults && (
                      <>
                        <td className="py-4 px-4">
                           {getStatus(member.id) === 'Unflagged' && <span className="text-content-muted font-semibold text-sm px-2.5 py-1">Unflagged</span>}
                           {getStatus(member.id) === 'Viewed' && <span className="text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md font-semibold text-sm">Viewed</span>}
                           {getStatus(member.id) === 'Marked for Review' && <span className="text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-md font-semibold text-sm">Marked for Review</span>}
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
              <Brain className="text-brand-purple animate-pulse mb-4" size={48} />
              <p className="text-lg font-semibold text-content-main">Analyzing clinical vectors...</p>
              <p className="text-sm text-content-muted mt-2 text-center">The model is predicting undiagnosed risk factors based on utilization history.</p>
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
                <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-content-main">AI Risk Assessment Report</h3>
                  <p className="text-xs text-content-muted">Generated for {activeReport.id}</p>
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
                 <div className="p-4 bg-surface-background rounded-lg border border-surface-border">
                    <p className="text-xs text-content-muted font-semibold mb-1 uppercase tracking-wider">Condition Vectors</p>
                    <p className="font-semibold text-content-main">{activeReport.icd} (Mocked Data)</p>
                 </div>
                 <div className="p-4 bg-brand-purple/5 rounded-lg border border-brand-purple/20">
                    <p className="text-xs text-brand-purple font-semibold mb-1 uppercase tracking-wider">Predicted RAF Impact</p>
                    <p className="font-bold text-brand-purple text-2xl">{activeReport.predictedRaf}</p>
                 </div>
               </div>
               
               <div>
                  <h4 className="font-semibold text-content-main mb-3 pb-2 border-b border-surface-border">Clinical Documentation Analysis</h4>
                  <p className="text-sm text-content-muted leading-relaxed">
                    Based on the aggregated claims data and unstructured clinical notes parsed by the FastAPI backend, the ML model has identified undocumented acuity matching the HCC suspect parameters. 
                    The predictive trajectory suggests an escalation in care requirements. Review is highly recommended to capture accurate HCC coding and ensure proper funding allocation.
                  </p>
               </div>
               
               <div>
                  <h4 className="font-semibold text-content-main mb-3 pb-2 border-b border-surface-border">Recommended Actions</h4>
                  <ul className="list-disc list-inside text-sm text-content-muted space-y-2">
                    <li>Schedule comprehensive clinical assessment within 30 days.</li>
                    <li>Verify ICD-10 mapping for associated secondary conditions.</li>
                    <li>Initiate care management protocol for condition stabilization.</li>
                  </ul>
               </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-border bg-surface-background flex flex-col sm:flex-row justify-between items-center gap-4">
               <button 
                 onClick={handleMarkForReview}
                 className="w-full sm:w-auto px-4 py-2 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning rounded-lg font-semibold text-sm transition-colors"
               >
                 Mark for Review
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

export default MLPrediction;
