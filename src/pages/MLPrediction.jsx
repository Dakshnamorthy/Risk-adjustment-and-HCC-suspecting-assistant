import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { Brain, Loader2, TrendingUp, AlertCircle, CheckCircle2, FileText, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { mlAgentAPI, membersAPI } from '../services/apiService';

const normalizeReportDetails = (reportDetails) => {
  if (!reportDetails) return null;

  let root = reportDetails;
  if (typeof reportDetails === 'string') {
    try {
      root = JSON.parse(reportDetails);
    } catch (_) {
      return {
        summary: reportDetails,
        risk_assessment: [],
        explanations: [],
        recommendation: null,
        citations: []
      };
    }
  }

  if (!root || typeof root !== 'object') return null;

  if (root.output && typeof root.output === 'object') {
    root = root.output.final_report || root.output;
  }
  if (root.final_report && typeof root.final_report === 'object') {
    root = root.final_report;
  }

  // 1. Summary
  const summaryVal = root.summary || root.Summary;
  const summary = (typeof summaryVal === 'string' && summaryVal.trim()) ? summaryVal.trim() : null;

  // 2. Risk Assessment Array
  let rawRiskAssessment = root.risk_assessment || root.risk_factors || root['Risk Assessment'] || [];
  if (!Array.isArray(rawRiskAssessment) && typeof rawRiskAssessment === 'object' && rawRiskAssessment !== null) {
    rawRiskAssessment = [rawRiskAssessment];
  }
  const riskAssessment = Array.isArray(rawRiskAssessment)
    ? rawRiskAssessment.map(item => {
        if (typeof item === 'string') {
          return { disease: 'Overall Patient Risk', risk_score: null, risk_level: item };
        }
        const disease = item.disease || item.Disease || item['HCC Code'] || item.hcc_code || 'Overall Patient Risk';
        let score = item.risk_score ?? item['Risk Score'] ?? item.score;
        if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
          score = parseFloat(score).toFixed(2);
        } else {
          score = null;
        }
        const level = item.risk_level || item['Risk Level'] || item.level || null;
        return { disease, risk_score: score, risk_level: level };
      }).filter(item => item.disease || item.risk_score !== null || item.risk_level)
    : [];

  // 3. Explanations Array
  let rawExplanations = root.explanations || root.explanation || root.Explanations || [];
  if (typeof rawExplanations === 'string') {
    rawExplanations = [{ disease: 'Overall Patient Risk', text: rawExplanations }];
  } else if (!Array.isArray(rawExplanations) && typeof rawExplanations === 'object' && rawExplanations !== null) {
    rawExplanations = [rawExplanations];
  }
  const explanations = Array.isArray(rawExplanations)
    ? rawExplanations.map(item => {
        if (typeof item === 'string') {
          return { disease: 'Overall Patient Risk', text: item };
        }
        const disease = item.disease || item.Disease || 'Overall Patient Risk';
        const text = item.text || item.explanation || item.Explanations || item.details || item.reasoning || null;
        return { disease, text: (typeof text === 'string' && text.trim()) ? text.trim() : null };
      }).filter(item => item.text !== null)
    : [];

  // 4. Recommendation
  const rawRec = root.recommendation || root.recommendations || root.Recommendation;
  let recommendation = null;
  if (typeof rawRec === 'string' && rawRec.trim()) {
    recommendation = rawRec.trim();
  } else if (Array.isArray(rawRec) && rawRec.length > 0) {
    recommendation = rawRec.map(r => typeof r === 'string' ? r : (r.text || r.recommendation || '')).filter(Boolean).join(' ');
  } else if (rawRec && typeof rawRec === 'object') {
    recommendation = rawRec.text || rawRec.recommendation || null;
  }

  // 5. Citations / Supporting Details Array
  let rawCitations = root.citations || root.Citations || root.supporting_details || [];
  if (typeof rawCitations === 'string') {
    rawCitations = [{ disease: 'Overall Patient Risk', details: rawCitations }];
  } else if (!Array.isArray(rawCitations) && typeof rawCitations === 'object' && rawCitations !== null) {
    rawCitations = [rawCitations];
  }
  const citations = Array.isArray(rawCitations)
    ? rawCitations.map(cit => {
        if (typeof cit === 'string') {
          return { disease: 'Overall Patient Risk', details: cit };
        }
        const disease = cit.disease || cit.Disease || (cit.Year ? `${cit.Year} Guidelines` : 'Overall Patient Risk');
        let details = cit.details || cit.text || cit.citation || cit.summary;
        if (!details && (cit.Frequency || cit.Risk)) {
          details = `Frequency: ${cit.Frequency || 'N/A'}, Risk: ${cit.Risk || 'N/A'}`;
        }
        return { disease, details: (typeof details === 'string' && details.trim()) ? details.trim() : null };
      }).filter(cit => cit.details !== null)
    : [];

  return {
    summary,
    risk_assessment: riskAssessment,
    explanations,
    recommendation,
    citations
  };
};

const parseReportDetails = (reportDetails) => {
  return normalizeReportDetails(reportDetails);
};

const downloadReportPDF = (reportTitle, member, reportData) => {
  if (!member) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const norm = normalizeReportDetails(reportData);
  const summary = norm?.summary;
  const riskAssessment = norm?.risk_assessment || [];
  const explanations = norm?.explanations || [];
  const recommendation = norm?.recommendation;
  const citations = norm?.citations || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - ${member.id}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-item { display: flex; flex-direction: column; }
          .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .meta-value { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 15px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .text-block { font-size: 13.5px; color: #334155; white-space: pre-line; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .card { background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 10px; font-size: 13px; }
          .card-title { font-weight: bold; color: #0f172a; margin-bottom: 6px; font-size: 14px; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${reportTitle}</h1>
          <div class="subtitle">Medicare Risk Stratification & Predictive Analysis</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Patient ID</span>
            <span class="meta-value">${member.id}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">ICD-10 Code</span>
            <span class="meta-value">${member.icd || member.icd10_code || '—'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Predicted Risk Score</span>
            <span class="meta-value">${member.predictedRaf || member.risk_score || 'N/A'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Risk Level</span>
            <span class="meta-value">${member.riskLevel || member.risk_level || 'N/A'}</span>
          </div>
        </div>

        ${riskAssessment.length > 0 ? `
          <div class="section">
            <div class="section-title">Risk Assessment</div>
            ${riskAssessment.map(item => `
              <div class="card">
                <div class="card-title">Disease: ${item.disease}</div>
                ${item.risk_score !== null ? `<div><strong>Risk Score:</strong> ${item.risk_score}</div>` : ''}
                ${item.risk_level ? `<div><strong>Risk Level:</strong> ${item.risk_level}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${summary ? `
          <div class="section">
            <div class="section-title">Summary</div>
            <div class="text-block">${summary}</div>
          </div>
        ` : ''}

        ${explanations.length > 0 ? `
          <div class="section">
            <div class="section-title">Explanation</div>
            ${explanations.map(item => `
              <div class="card">
                <div class="card-title">Disease: ${item.disease}</div>
                <div><strong>Explanation:</strong> ${item.text}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${recommendation ? `
          <div class="section">
            <div class="section-title">Recommendation</div>
            <div class="text-block">${recommendation}</div>
          </div>
        ` : ''}

        ${citations.length > 0 ? `
          <div class="section">
            <div class="section-title">Supporting Details</div>
            ${citations.map(cit => `
              <div class="card">
                <div class="card-title">Disease: ${cit.disease}</div>
                <div><strong>Details:</strong> ${cit.details}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          Generated automatically by Healthcare Risk Stratification System • ${new Date().toLocaleDateString()}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const MLPrediction = ({ user, onSignOut }) => {
  const [isPrioritized, setIsPrioritized] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Report States
  const [generatedReports, setGeneratedReports] = useState({});
  const [activeReport, setActiveReport] = useState(null);
  const [reportStatuses, setReportStatuses] = useState({});

  const [members, setMembers] = useState([]);

  // Fetch UNFLAGGED members from PostgreSQL via FastAPI
  useEffect(() => {
    const fetchUnflaggedMembers = async () => {
      setLoadingMembers(true);
      setLoadError(null);
      try {
        const result = await mlAgentAPI.getUnflaggedMembers(currentPage, 10);
        if (!result.members || result.members.length === 0) {
          setLoadError('No unflagged members found in the database.');
          setMembers([]);
          setTotalPages(1);
        } else {
          setTotalPages(Math.ceil((result.total || 0) / 10) || 1);
          // Map DB column names -> component member shape
          const mapped = result.members.map(m => {
            const parsedReport = parseReportDetails(m.report_details);

            return {
              id: m.patient_id,
              age: m.age,
              sex: m.sex,
              icd: (m.icd10_code != null && m.icd10_code !== '') ? m.icd10_code : '—',
              predictedRaf: (m.risk_score != null && !isNaN(parseFloat(m.risk_score)))
                ? parseFloat(m.risk_score).toFixed(2)
                : null,
              riskLevel: m.risk_level || null,
              reviewStatus: m.review_status || 'NOT_REVIEWED',
              _raw: m,
              _pipelineData: parsedReport,
              _hasStoredResult: m.risk_score != null || m.risk_level != null || parsedReport != null
            };
          });
          setMembers(mapped);
          setReportStatuses(prev => ({
            ...prev,
            ...Object.fromEntries(
              mapped
                .filter(member => member.reviewStatus === 'REVIEWED')
                .map(member => [member.id, 'REVIEWED'])
            )
          }));

          // Since all unflagged members in ml_results have DB results
          const storedReports = {};
          mapped.forEach(m => {
            if (m._hasStoredResult) {
              storedReports[m.id] = true;
            }
          });
          setGeneratedReports(prev => ({ ...prev, ...storedReports }));

        }
      } catch (err) {
        setLoadError(`Failed to load unflagged members: ${err.message}`);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchUnflaggedMembers();
  }, [currentPage]);

  const displayedMembers = [...members];
  const getStatus = (id) => 'Unflagged';
  const getReviewStatus = (id) => reportStatuses[id] || members.find(member => member.id === id)?.reviewStatus || 'NOT_REVIEWED';

  const handleCloseReport = () => {
    if (activeReport && getReviewStatus(activeReport.id) === 'NOT_REVIEWED') {
      setReportStatuses(prev => ({ ...prev, [activeReport.id]: 'Viewed' }));
    }
    setActiveReport(null);
  };

  const handleDecision = async (decision) => {
    if (activeReport) {
      try {
        await membersAPI.submitDecision(activeReport.id, decision, 'ML');
        const patientId = activeReport.id;
        setSuccessMessage(`Patient ${patientId} decision recorded as ${decision}.`);
        setActiveReport(null);
        setMembers(prev => prev.filter(member => member.id !== patientId));
      } catch (err) {
        setLoadError(`Failed to record patient decision: ${err.message}`);
      }
    }
  };

  const handleMarkForReview = async () => {
    if (!activeReport) return;

    try {
      const patientId = activeReport.id;
      await membersAPI.markForReview(patientId);
      setReportStatuses(prev => ({ ...prev, [patientId]: 'REVIEWED' }));
      setMembers(prev => prev.map(member => (
        member.id === patientId ? { ...member, reviewStatus: 'REVIEWED' } : member
      )));
      setSuccessMessage(`Patient ${patientId} marked for review.`);
    } catch (err) {
      setLoadError(`Failed to mark patient for review: ${err.message}`);
    }
  };

  if (isPrioritized) {
    displayedMembers.sort((a, b) => {
      const aVal = parseFloat(a.predictedRaf) || 0;
      const bVal = parseFloat(b.predictedRaf) || 0;
      return bVal - aVal;
    });
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
        </div>

        <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border card-shadow">
          
          {/* Header Action Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-surface-border pb-6">
            <div>
              <h2 className="text-xl font-semibold text-content-main">Queue: Unflagged Members</h2>
              <p className="text-sm text-content-muted mt-1">
                {loadingMembers
                  ? 'Loading from database...'
                  : loadError
                  ? 'Error loading members'
                  : `${members.length} member${members.length !== 1 ? 's' : ''} awaiting ML inference (Page ${currentPage})`}
              </p>
            </div>
            
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
          </div>

          {/* Load error */}
          {loadError && (
            <div className="flex items-center space-x-3 p-4 bg-status-danger/5 border border-status-danger/20 rounded-lg mb-4">
              <AlertCircle className="text-status-danger shrink-0" size={20} />
              <p className="text-sm text-status-danger font-medium">{loadError}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center space-x-3 p-4 bg-status-success/5 border border-status-success/20 rounded-lg mb-4">
              <CheckCircle2 className="text-status-success shrink-0" size={20} />
              <p className="text-sm text-status-success font-medium">{successMessage}</p>
            </div>
          )}

          {/* Loading spinner */}
          {loadingMembers && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-brand-purple" size={32} />
              <span className="ml-3 text-content-muted font-medium">Loading unflagged members from database...</span>
            </div>
          )}

          {/* Data Table */}
          {!loadingMembers && !loadError && (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead>
                  <tr className="text-xs font-semibold text-content-muted uppercase tracking-wider border-b border-surface-border bg-surface-background">
                    <th className="py-3 px-4 rounded-tl-lg">Patient ID</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Sex</th>
                    <th className="py-3 px-4">ICD Code</th>
                    <th className="py-3 px-4 text-brand-purple">Risk Score</th>
                    <th className="py-3 px-4 text-brand-purple">Risk Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-tr-lg">Reports</th>
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
                        {member.predictedRaf != null ? (
                           <span className="text-base font-bold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-md">{member.predictedRaf}</span>
                        ) : (
                           <span className="text-base font-bold text-content-muted">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {member.riskLevel != null ? (
                           <span className="text-sm font-semibold text-brand-purple uppercase tracking-wider">{member.riskLevel}</span>
                        ) : (
                           <span className="text-base font-bold text-content-muted">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                         {getStatus(member.id) === 'Unflagged' && <span className="text-content-muted font-semibold text-sm px-2.5 py-1">Unflagged</span>}
                         {getReviewStatus(member.id) === 'REVIEWED' && <span className="text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-md font-semibold text-sm">Reviewed</span>}
                      </td>
                      <td className="py-4 px-4 w-[160px]">
                      {generatedReports[member.id] || member._pipelineData ? (
                        <button 
                          onClick={() => setActiveReport(member)}
                          className="w-[140px] flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-md font-semibold text-xs hover:bg-brand-blue/20 transition-colors"
                        >
                          <FileText size={14} />
                          <span>View Report</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActiveReport(member)}
                          className="w-[140px] flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-surface border border-surface-border text-content-main rounded-md font-semibold text-xs hover:bg-surface-background transition-colors"
                        >
                          <FileText size={14} />
                          <span>View Details</span>
                        </button>
                      )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loadingMembers && !loadError && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-border">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-surface border border-surface-border text-content-main rounded-lg text-sm font-semibold hover:bg-surface-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="text-sm font-medium text-content-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-surface border border-surface-border text-content-main rounded-lg text-sm font-semibold hover:bg-surface-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
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
                  <p className="text-xs text-content-muted">Patient ID: {activeReport.id}</p>
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
               {/* 1 & 2. HEADER META & RISK OVERVIEW */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-surface-background rounded-lg border border-surface-border">
                    <p className="text-xs text-content-muted font-semibold mb-1 uppercase tracking-wider">ICD-10 Code</p>
                    <p className="font-semibold text-content-main text-xl">{activeReport.icd || activeReport._raw?.icd10_code || '—'}</p>
                 </div>
                 <div className="p-4 bg-brand-purple/5 rounded-lg border border-brand-purple/20 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-brand-purple font-semibold mb-1 uppercase tracking-wider">Predicted Risk Score</p>
                      <p className="font-bold text-brand-purple text-2xl">{activeReport.predictedRaf || activeReport._raw?.risk_score || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-content-muted font-semibold mb-1 uppercase tracking-wider">Risk Level</p>
                      <p className="font-bold text-brand-purple text-xl">{activeReport.riskLevel || activeReport._raw?.risk_level || 'N/A'}</p>
                    </div>
                 </div>
               </div>
               
               {/* Real pipeline response data section-by-section */}
               {activeReport._pipelineData ? (
                 <div className="space-y-6">
                   {/* 1. SUMMARY */}
                   {activeReport._pipelineData.summary && (
                     <div>
                       <h4 className="font-bold text-content-main mb-2 uppercase tracking-wider text-xs text-brand-blue">SUMMARY</h4>
                       <p className="text-sm text-content-main leading-relaxed bg-surface-background p-4 rounded-lg border border-surface-border">
                         {activeReport._pipelineData.summary}
                       </p>
                     </div>
                   )}

                   {/* 2. RISK ASSESSMENT */}
                   {activeReport._pipelineData.risk_assessment && activeReport._pipelineData.risk_assessment.length > 0 && (
                     <div>
                       <h4 className="font-bold text-content-main mb-3 uppercase tracking-wider text-xs text-brand-blue">RISK ASSESSMENT</h4>
                       <div className="space-y-3">
                         {activeReport._pipelineData.risk_assessment.map((item, idx) => (
                           <div key={idx} className="p-4 bg-surface-background rounded-lg border border-surface-border text-sm">
                             <p className="font-bold text-content-main text-base mb-1">Disease: {item.disease}</p>
                             <div className="flex flex-wrap gap-4 text-xs font-semibold mt-2">
                               {item.risk_level && (
                                 <span className="text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded">
                                   Risk Level: {item.risk_level}
                                 </span>
                               )}
                               {item.risk_score !== null && item.risk_score !== undefined && (
                                 <span className="text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded">
                                   Risk Score: {item.risk_score}
                                 </span>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* 3. EXPLANATION */}
                   {activeReport._pipelineData.explanations && activeReport._pipelineData.explanations.length > 0 && (
                     <div>
                       <h4 className="font-bold text-content-main mb-3 uppercase tracking-wider text-xs text-brand-purple">EXPLANATION</h4>
                       <div className="space-y-3">
                         {activeReport._pipelineData.explanations.map((item, idx) => (
                           <div key={idx} className="p-4 bg-surface-background rounded-lg border border-surface-border text-sm">
                             <p className="font-bold text-content-main mb-1">Disease: {item.disease}</p>
                             <p className="text-sm text-content-muted leading-relaxed whitespace-pre-line mt-1">
                               <strong>Explanation:</strong> {item.text}
                             </p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* 4. RECOMMENDATION */}
                   {activeReport._pipelineData.recommendation && (
                     <div>
                       <h4 className="font-bold text-content-main mb-2 uppercase tracking-wider text-xs text-status-success">RECOMMENDATION</h4>
                       <p className="text-sm text-content-main leading-relaxed bg-surface-background p-4 rounded-lg border border-surface-border">
                         {activeReport._pipelineData.recommendation}
                       </p>
                     </div>
                   )}

                   {/* 5. CITATIONS / CLINICAL BASIS */}
                   {activeReport._pipelineData.citations && activeReport._pipelineData.citations.length > 0 && (
                     <div>
                       <h4 className="font-bold text-content-main mb-3 uppercase tracking-wider text-xs text-content-muted">CITATIONS / CLINICAL BASIS</h4>
                       <div className="space-y-3">
                         {activeReport._pipelineData.citations.map((cit, idx) => (
                           <div key={idx} className="p-4 bg-surface-background rounded-lg border border-surface-border text-sm">
                             <p className="font-bold text-content-main mb-1">Disease: {cit.disease}</p>
                             <p className="text-xs text-content-muted leading-relaxed mt-1">
                               <strong>Details:</strong> {cit.details}
                             </p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="text-center py-6 text-content-muted">
                   No detailed prediction report data available for this member yet. Run ML Prediction to calculate scores.
                 </div>
               )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-border bg-surface-background flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                 <button
                   onClick={() => handleDecision('ACCEPTED')}
                   className="w-full sm:w-auto px-4 py-2 bg-status-success/10 hover:bg-status-success/20 text-status-success rounded-lg font-semibold text-sm transition-colors"
                 >
                   ACCEPT
                 </button>
                 <button
                   onClick={() => handleDecision('REJECTED')}
                   className="w-full sm:w-auto px-4 py-2 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger rounded-lg font-semibold text-sm transition-colors"
                 >
                   REJECT
                 </button>
                 <button
                   onClick={handleMarkForReview}
                   className="w-full sm:w-auto px-4 py-2 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning rounded-lg font-semibold text-sm transition-colors"
                 >
                   MARK FOR REVIEW
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
