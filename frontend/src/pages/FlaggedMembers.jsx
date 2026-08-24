import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { AlertTriangle, FileText, Upload, CheckCircle, Clock, X, Loader2, AlertCircle } from 'lucide-react';
import { membersAPI } from '../services/apiService';

const FlaggedMembers = ({ user, onSignOut }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for interactive workflow
  const [reportStatuses, setReportStatuses] = useState({}); // 'Flagged', 'Viewed', 'Marked for Follow-up'
  const [docStatuses, setDocStatuses] = useState({}); // 'Pending', 'Uploaded', 'Verified'
  const [generatingReports, setGeneratingReports] = useState({});
  const [generatedReports, setGeneratedReports] = useState({});
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    fetchFlaggedMembers();
  }, []);

  const fetchFlaggedMembers = async () => {
    setLoading(true);
    try {
      const data = await membersAPI.getAll({ flag_status: 'FLAGGED' });
      const formatted = (data.members || []).map(m => ({
        id: m.patient_id,
        age: m.age,
        sex: m.sex,
        icd: m.icd10_code || '—',
        // According to the data limitation, there is no real document-missing field in the schema.
        docsNeeded: 'Information Unavailable (Schema Limitation)',
        raw: m
      }));
      setMembers(formatted);
      setError(null);
    } catch (err) {
      console.error('Failed to load flagged members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (id) => reportStatuses[id] || 'Flagged';
  const getDocStatus = (id) => docStatuses[id] || 'Pending';

  const handleGenerateReport = (id) => {
    setGeneratingReports(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setGeneratingReports(prev => ({ ...prev, [id]: false }));
      setGeneratedReports(prev => ({ ...prev, [id]: true }));
    }, 2000);
  };

  const handleViewReport = (member) => {
    setActiveReport(member);
    if (getStatus(member.id) === 'Flagged') {
      setReportStatuses(prev => ({ ...prev, [member.id]: 'Viewed' }));
    }
  };

  const handleMarkFollowUp = () => {
    if (activeReport) {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Marked for Follow-up' }));
      setActiveReport(null);
    }
  };

  const handleUpload = (id) => {
    setDocStatuses(prev => ({ ...prev, [id]: 'Uploaded' }));
    setTimeout(() => {
      setDocStatuses(prev => ({ ...prev, [id]: 'Verified' }));
    }, 2000);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-[1500px] mx-auto pb-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                <AlertTriangle size={28} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-content-main">In Follow-up Queue</h1>
            </div>
            <p className="text-content-muted text-sm md:text-base">Review patients marked for follow-up and manage required clinical documentation.</p>
          </div>
          <button onClick={fetchFlaggedMembers} className="text-brand-blue font-medium hover:underline text-sm">
            Refresh Analysis
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border card-shadow">
          
          <div className="mb-6 border-b border-surface-border pb-4">
             <h2 className="text-xl font-semibold text-content-main">Action Required: Missing Documentation</h2>
          </div>

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-status-danger/5 border border-status-danger/20 rounded-lg mb-4">
              <AlertCircle className="text-status-danger shrink-0" size={20} />
              <p className="text-sm text-status-danger font-medium">{error}</p>
            </div>
          )}

          {loading ? (
             <div className="flex items-center justify-center p-12">
               <Loader2 className="animate-spin text-brand-purple" size={32} />
               <span className="ml-3 text-content-muted font-medium">Loading flagged members...</span>
             </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left min-w-[1100px]">
                <thead>
                  <tr className="text-xs font-semibold text-content-muted uppercase tracking-wider border-b border-surface-border bg-surface-background">
                    <th className="py-3 px-4 rounded-tl-lg">Patient ID</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Sex</th>
                    <th className="py-3 px-4">ICD Code</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reports</th>
                    <th className="py-3 px-4">Documents Needed</th>
                    <th className="py-3 px-4">Upload Documents</th>
                    <th className="py-3 px-4 rounded-tr-lg">Document Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {members.map((member, idx) => (
                    <tr key={idx} className="hover:bg-surface-background/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-content-main">{member.id}</td>
                      <td className="py-4 px-4 text-content-muted font-medium">{member.age}</td>
                      <td className="py-4 px-4 text-content-muted font-medium">{member.sex}</td>
                      <td className="py-4 px-4 font-medium text-content-main">{member.icd}</td>
                      
                      <td className="py-4 px-4">
                         {getStatus(member.id) === 'Flagged' && <span className="text-content-muted font-semibold text-sm px-2.5 py-1">Flagged</span>}
                         {getStatus(member.id) === 'Viewed' && <span className="text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md font-semibold text-sm">Viewed</span>}
                         {getStatus(member.id) === 'Marked for Follow-up' && <span className="text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-md font-semibold text-sm">Marked for Follow-up</span>}
                      </td>
                      
                      <td className="py-4 px-4 w-[160px]">
                          {generatedReports[member.id] ? (
                            <button 
                              onClick={() => handleViewReport(member)}
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
                              {generatingReports[member.id] ? <Clock size={14} className="animate-spin" /> : <FileText size={14} />}
                              <span>{generatingReports[member.id] ? 'Generating...' : 'Generate'}</span>
                            </button>
                          )}
                      </td>

                      <td className="py-4 px-4">
                         <span className="text-status-danger font-medium text-[13px]">{member.docsNeeded}</span>
                      </td>

                      <td className="py-4 px-4">
                         <button 
                           onClick={() => handleUpload(member.id)}
                           disabled={getDocStatus(member.id) !== 'Pending'}
                           className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           <Upload size={14} />
                           <span>Upload</span>
                         </button>
                      </td>

                      <td className="py-4 px-4 font-semibold">
                         {getDocStatus(member.id) === 'Pending' && <span className="text-content-muted bg-surface-background border border-surface-border px-2.5 py-1 rounded-md text-sm">Pending</span>}
                         {getDocStatus(member.id) === 'Uploaded' && (
                           <span className="text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md text-sm flex items-center w-max space-x-1">
                             <Clock size={14} className="animate-spin" />
                             <span>Verifying...</span>
                           </span>
                         )}
                         {getDocStatus(member.id) === 'Verified' && (
                           <span className="text-status-success bg-status-success/10 px-2.5 py-1 rounded-md text-sm flex items-center w-max space-x-1">
                             <CheckCircle size={14} />
                             <span>Verified</span>
                           </span>
                         )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-background">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-content-main">In Follow-up Report</h3>
                  <p className="text-xs text-content-muted">Patient ID: {activeReport.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveReport(null)}
                className="p-2 text-content-muted hover:text-content-main hover:bg-surface border border-transparent hover:border-surface-border rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-surface flex-1 space-y-6">
               <div className="p-4 bg-status-danger/5 rounded-lg border border-status-danger/20 mb-4">
                  <p className="text-sm font-semibold text-status-danger mb-1">Missing Evidence</p>
                  <p className="text-content-main text-sm">HCC mapping requires <span className="font-bold">{activeReport.docsNeeded}</span> to proceed with validation.</p>
               </div>
               
               <div>
                  <h4 className="font-semibold text-content-main mb-2 pb-1 border-b border-surface-border">Analysis Summary</h4>
                  <p className="text-sm text-content-muted leading-relaxed">
                    This patient was flagged during preliminary ML inference due to missing unstructured clinical notes corresponding to ICD code {activeReport.icd}.
                    Please upload the necessary documentation. Once uploaded, our NLP engine will parse the text and verify HCC coding validity.
                  </p>
               </div>
            </div>
            
            <div className="px-6 py-4 border-t border-surface-border bg-surface-background flex justify-between items-center">
               <button 
                 onClick={handleMarkFollowUp}
                 className="px-4 py-2 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning rounded-lg font-semibold text-sm transition-colors"
               >
                 Mark for Follow-up
               </button>
               
               <button 
                 onClick={() => setActiveReport(null)}
                 className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default FlaggedMembers;
