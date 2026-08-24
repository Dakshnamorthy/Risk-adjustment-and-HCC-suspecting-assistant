import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, AlertCircle, Users, Brain, Eye, Play } from 'lucide-react';
import { hccAPI } from '../services/apiService';

const HccMapping = ({ user, onSignOut }) => {
  // State Management
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  
  // Results and pagination
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Classification results
  const [classificationResults, setClassificationResults] = useState(null);
  const [assignmentStatus, setAssignmentStatus] = useState({ agent: false, ml: false });

  // Load results on component mount
  useEffect(() => {
    loadResults(1);
    loadClassificationStats();
  }, []);

  // Check if classification has already been run (persists across page refresh)
  const loadClassificationStats = async () => {
    try {
      const stats = await hccAPI.getStats();
      if (stats && (stats.flagged_count > 0 || stats.unflagged_count > 0)) {
        setClassificationResults({
          total_classified: stats.flagged_count + stats.unflagged_count,
          flagged_count: stats.flagged_count,
          unflagged_count: stats.unflagged_count
        });
      }
    } catch (err) {
      // Non-critical — classification stats just won't pre-load
      console.error('Error loading classification stats:', err);
    }
  };

  const loadResults = async (page = 1) => {
    setLoadingResults(true);
    try {
      const resultsData = await hccAPI.getResults({
        page,
        page_size: 15  // Show only 15 records per page as required
      });
      setResults(resultsData);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setUploadError(null);
      setUploadResults(null);
      setClassificationResults(null);
      setAssignmentStatus({ agent: false, ml: false });
    }
  };

  const handleUploadAndMap = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await hccAPI.uploadCSV(file);
      setUploadResults(result);
      // Reload results to show new data
      await loadResults(1);
    } catch (err) {
      setUploadError(err.message || 'Failed to process CSV file and map HCC codes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClassifyMembers = async () => {
    setIsClassifying(true);
    try {
      const result = await hccAPI.classifyMembers();
      setClassificationResults(result);
      // Reload results to show classification status
      await loadResults(1);
    } catch (err) {
      setUploadError(err.message || 'Failed to classify members.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAssignForAgent = async () => {
    try {
      const result = await hccAPI.assignForAgent();
      setAssignmentStatus(prev => ({ ...prev, agent: true }));
      await loadResults(1);
      await loadClassificationStats();
      alert(`${result.successful} flagged members sent to Agent:\n${(result.patient_ids || []).join(', ')}`);
    } catch (err) {
      setUploadError(err.message || 'Failed to assign members for agent verification.');
    }
  };

  const handleAssignForML = async () => {
    try {
      const result = await hccAPI.assignForML();
      setAssignmentStatus(prev => ({ ...prev, ml: true }));
      await loadResults(1);
      await loadClassificationStats();
      alert(`${result.successful} unflagged members sent to ML:\n${(result.patient_ids || []).join(', ')}`);
    } catch (err) {
      setUploadError(err.message || 'Failed to assign members for ML prediction.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResults(null);
    setUploadError(null);
    setClassificationResults(null);
    setAssignmentStatus({ agent: false, ml: false });
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">HCC Mapping & Classification</h1>
            <p className="text-content-muted text-sm md:text-base">
              Upload 2025 clinical CSV records for ICD-10 to HCC mapping using hccinfhir, then classify for workflows.
            </p>
          </div>
          {uploadResults && (
            <button onClick={handleReset} className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
              Upload Another CSV
            </button>
          )}
        </div>

        <div className="space-y-6">
          
          {/* Step 1: File Upload & Mapping */}
          <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-lg">1</div>
              <h2 className="text-xl font-bold text-content-main">Upload & Map 2025 Claims Data</h2>
            </div>
            
            {!file ? (
              <div className="border-2 border-dashed border-surface-border rounded-xl p-8 md:p-12 flex flex-col items-center justify-center bg-surface-background hover:bg-surface-border/30 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <UploadCloud size={48} className="text-brand-blue mb-4" />
                <p className="text-lg font-bold text-content-main">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-content-muted mt-2">Supports 26-column .CSV 2025 patient records</p>
              </div>
            ) : (
              <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-5">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-surface rounded-lg text-brand-blue shadow-sm">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-content-main">{file.name}</p>
                    <p className="text-sm text-content-muted">{(file.size / 1024).toFixed(2)} KB • Ready for processing</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleUploadAndMap}
                  disabled={isUploading}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Mapping ICD-10 to HCC ...</span>
                    </>
                  ) : (
                    <>
                      <span>Map to HCC</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults && (
              <div className="mt-6 p-4 bg-status-success/5 border border-status-success/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle2 className="text-status-success" size={20} />
                  <span className="font-semibold text-status-success">Upload completed successfully!</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-content-muted">Total Records:</span>
                    <span className="ml-2 font-bold text-content-main">{uploadResults.total_records}</span>
                  </div>
                  <div>
                    <span className="font-medium text-content-muted">Mapped:</span>
                    <span className="ml-2 font-bold text-status-success">{uploadResults.mapped_records}</span>
                  </div>
                  <div>
                    <span className="font-medium text-content-muted">Unmapped:</span>
                    <span className="ml-2 font-bold text-status-danger">{uploadResults.unmapped_records}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-center space-x-3 p-4 bg-status-danger/5 border border-status-danger/20 rounded-lg mt-4">
                <AlertCircle className="text-status-danger shrink-0" size={20} />
                <p className="text-sm text-status-danger font-medium">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Step 2: Classification */}
          {(uploadResults || (results && results.records && results.records.length > 0)) && (
            <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">2</div>
                <h2 className="text-xl font-bold text-content-main">Check Member Classification</h2>
              </div>

              <div className="mb-4">
                <p className="text-content-muted mb-4">
                  Run classification pipeline on all uploaded patient records to determine FLAGGED or UNFLAGGED risk status.
                </p>
                
                <button 
                  onClick={handleClassifyMembers}
                  disabled={isClassifying}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Classifying current batch...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      <span>Classify All Members</span>
                    </>
                  )}
                </button>
              </div>

              {/* Classification Results */}
              {classificationResults && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="text-amber-600" size={20} />
                    <span className="font-semibold text-amber-800">Classification completed!</span>
                  </div>
                  
                </div>
              )}
            </div>
          )}

          {/* Step 3: Workflow Assignment */}
          {classificationResults && (
            <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">3</div>
                <h2 className="text-xl font-bold text-content-main">Assign Workflow</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agent Verification */}
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="text-red-600" size={24} />
                    <h3 className="font-bold text-red-800">Flagged Members</h3>
                  </div>
                  <p className="text-sm text-content-muted mb-4">
                    Send flagged members for agent verification and analysis.
                  </p>
                  <button
                    onClick={handleAssignForAgent}
                    disabled={assignmentStatus.agent}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignmentStatus.agent ? 'Assigned for Agent Verification' : 'Send for Agent Verification'}
                  </button>
                </div>

                {/* ML Prediction */}
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="text-blue-600" size={24} />
                    <h3 className="font-bold text-blue-800">Unflagged Members</h3>
                  </div>
                  <p className="text-sm text-content-muted mb-4">
                    Send unflagged members for ML risk prediction analysis.
                  </p>
                  <button
                    onClick={handleAssignForML}
                    disabled={assignmentStatus.ml}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignmentStatus.ml ? 'Assigned for ML Prediction' : 'Send for ML Prediction'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Table - Show only 15 records per page */}
          <div className="bg-surface rounded-xl p-6 md:p-8 shadow-sm border border-surface-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-content-main">HCC Mapping Results</h3>
              <div className="text-sm text-content-muted">
                {results && `Showing 15 records per page`}
              </div>
            </div>

            {loadingResults ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-brand-blue" size={32} />
                <span className="ml-3 text-content-muted">Loading results...</span>
              </div>
            ) : results && results.records.length > 0 ? (
              <>
                <div className="overflow-x-auto border border-surface-border rounded-lg">
                  <table className="w-full text-sm text-left bg-surface">
                    <thead className="bg-surface-background text-content-muted font-semibold border-b border-surface-border">
                      <tr>
                        <th className="px-4 py-3">Patient ID</th>
                        <th className="px-4 py-3">Age</th>
                        <th className="px-4 py-3">Sex</th>
                        <th className="px-4 py-3">ICD Code</th>
                        <th className="px-4 py-3">HCC Code</th>
                        <th className="px-4 py-3">Mapping Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {results.records.map((record, idx) => (
                        <tr key={idx} className="hover:bg-surface-background/50">
                          <td className="px-4 py-3 font-semibold text-content-main">
                            {record.patient_id}
                          </td>
                          <td className="px-4 py-3 text-content-muted">{record.age}</td>
                          <td className="px-4 py-3 text-content-muted">{record.sex}</td>
                          <td className="px-4 py-3">
                            <span className="bg-surface-background text-content-main px-2 py-1 rounded text-xs font-medium border border-surface-border">
                              {record.icd10_code || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-brand-blue/10 text-brand-blue px-2 py-1 rounded text-xs font-medium">
                              {record.hcc_code || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {record.mapping_status === 'MAPPED' ? (
                              <span className="bg-status-success/10 text-status-success px-2 py-1 rounded text-xs font-medium">
                                MAPPED
                              </span>
                            ) : (
                              <span className="bg-status-danger/10 text-status-danger px-2 py-1 rounded text-xs font-medium">
                                UNMAPPED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {results.total > 15 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-content-muted">
                      Page {currentPage} of {Math.ceil(results.total / 15)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadResults(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-content-muted hover:text-content-main disabled:opacity-50 disabled:cursor-not-allowed border border-surface-border rounded hover:bg-surface-background"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => loadResults(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(results.total / 15)}
                        className="px-3 py-2 text-sm font-medium text-content-muted hover:text-content-main disabled:opacity-50 disabled:cursor-not-allowed border border-surface-border rounded hover:bg-surface-background"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-content-muted">No results found. Upload a CSV file to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HccMapping;