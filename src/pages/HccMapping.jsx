import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const HccMapping = ({ user, onSignOut }) => {
  // State Machine
  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Stratification
  const [file, setFile] = useState(null);
  
  const [isMapping, setIsMapping] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  
  const [isChecking, setIsChecking] = useState(false);
  const [flaggedMembers, setFlaggedMembers] = useState(null);
  const [unflaggedMembers, setUnflaggedMembers] = useState(null);

  // Popup State
  const [popupMessage, setPopupMessage] = useState(null);

  // Handlers
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStep(1); // Stay on step 1, but file is loaded
    }
  };

  const handleMapToHCC = () => {
    setIsMapping(true);
    // Simulate backend python script processing time
    setTimeout(() => {
      setMappedData([
        { patientId: 'PT-1001', age: 72, sex: 'M', icd: 'E11.9', hcc: 'HCC-019' },
        { patientId: 'PT-1002', age: 65, sex: 'F', icd: 'I50.9', hcc: 'HCC-085' },
        { patientId: 'PT-1003', age: 81, sex: 'M', icd: 'J44.9', hcc: 'HCC-111' },
        { patientId: 'PT-1004', age: 59, sex: 'F', icd: 'F32.9', hcc: 'HCC-059' },
        { patientId: 'PT-1005', age: 68, sex: 'M', icd: 'I10', hcc: 'HCC-018' }
      ]);
      setIsMapping(false);
      setStep(2);
    }, 2000);
  };

  const handleCheckMembers = () => {
    setIsChecking(true);
    // Simulate backend python script processing time
    setTimeout(() => {
      setFlaggedMembers([
        { id: 'MEM-8821', name: 'James Wilson', plan: 'MA-PD', missingHcc: 'HCC-019 (Diabetes)', estimatedRaf: '+0.104', status: 'High Priority' },
        { id: 'MEM-4192', name: 'Elena Rostova', plan: 'MA Only', missingHcc: 'HCC-111 (COPD)', estimatedRaf: '+0.328', status: 'High Priority' },
        { id: 'MEM-5543', name: 'David Kim', plan: 'D-SNP', missingHcc: 'HCC-022 (Morbid Obesity)', estimatedRaf: '+0.273', status: 'Medium Priority' }
      ]);
      
      setUnflaggedMembers([
        { id: 'MEM-1102', name: 'Sarah Jenkins', plan: 'MA-PD', condition: 'Hypertension (No HCC)', lastVisit: '10/12/2025' },
        { id: 'MEM-9910', name: 'Marcus Chen', plan: 'C-SNP', condition: 'Asthma (Controlled)', lastVisit: '11/05/2025' },
        { id: 'MEM-3321', name: 'Linda Smith', plan: 'MA-PD', condition: 'Osteoarthritis', lastVisit: '09/20/2025' }
      ]);
      
      setIsChecking(false);
      setStep(3);
    }, 2500);
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setMappedData(null);
    setFlaggedMembers(null);
    setUnflaggedMembers(null);
  };

  const handleSendToAgent = () => {
    setPopupMessage('Flagged members successfully sent for agent verification.');
    setTimeout(() => setPopupMessage(null), 3000);
  };

  const handleSendToML = () => {
    setPopupMessage('Unflagged members successfully sent for ML prediction.');
    setTimeout(() => setPopupMessage(null), 3000);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Patient Record Processing</h1>
            <p className="text-content-muted text-sm md:text-base">Upload clinical records to run AI-driven HCC mapping and risk stratification.</p>
          </div>
          {step > 1 && (
             <button onClick={handleReset} className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
               Start Over
             </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* Main Action Area */}
          <div className="space-y-6">
            
            {/* Step 1: File Upload & Mapping */}
            <div className={`bg-surface rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border transition-all card-shadow ${step === 1 ? 'border-brand-blue' : 'border-surface-border'}`}>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-lg">1</div>
                <h2 className="text-xl font-bold text-content-main">Upload & Map Claims Data</h2>
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
                  <p className="text-sm text-content-muted mt-2">Supports .CSV patient records and encounters</p>
                </div>
              ) : (
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="p-3 bg-surface rounded-lg text-brand-blue shadow-sm">
                      <FileSpreadsheet size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-content-main">{file.name}</p>
                      <p className="text-sm text-content-muted">{(file.size / 1024).toFixed(2)} KB • Ready for processing</p>
                    </div>
                  </div>
                  
                  {step === 1 && (
                    <button 
                      onClick={handleMapToHCC}
                      disabled={isMapping}
                      className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isMapping ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Mapping ICD to HCC...</span>
                        </>
                      ) : (
                        <>
                          <span>Map to HCC</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  )}
                  {step > 1 && (
                    <div className="flex items-center space-x-2 text-status-success bg-status-success/10 px-4 py-2 rounded-lg font-semibold text-sm w-full sm:w-auto justify-center">
                      <CheckCircle2 size={18} />
                      <span>Mapping Complete</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mapped Data Preview (Shows in Step 2) */}
              {step >= 2 && mappedData && (
                <div className="mt-8 animate-slide-in">
                  <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Extracted HCC Codes Overview</h3>
                  <div className="overflow-x-auto border border-surface-border rounded-lg w-full">
                    <table className="w-full text-sm text-left bg-surface min-w-[600px]">
                      <thead className="bg-surface-background text-content-muted font-semibold border-b border-surface-border">
                        <tr>
                          <th className="px-4 py-3">Patient ID</th>
                          <th className="px-4 py-3">Age</th>
                          <th className="px-4 py-3">Sex</th>
                          <th className="px-4 py-3">ICD Code</th>
                          <th className="px-4 py-3">Mapped HCC Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {mappedData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-background/50">
                            <td className="px-4 py-3 font-semibold text-content-main">{item.patientId}</td>
                            <td className="px-4 py-3 text-content-muted font-medium">{item.age}</td>
                            <td className="px-4 py-3 text-content-muted font-medium">{item.sex}</td>
                            <td className="px-4 py-3"><span className="bg-surface-background text-content-main px-2 py-1 rounded text-xs font-bold border border-surface-border">{item.icd}</span></td>
                            <td className="px-4 py-3"><span className="bg-brand-blue/10 text-brand-blue px-2 py-1 rounded text-xs font-bold">{item.hcc}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Stratification (Visible only after Step 1 completes) */}
            {step >= 2 && (
              <div className={`bg-surface rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border transition-all card-shadow ${step === 2 ? 'border-status-warning' : 'border-surface-border'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-status-warning/10 text-status-warning flex items-center justify-center font-bold text-lg">2</div>
                    <h2 className="text-xl font-bold text-content-main">Risk Stratification</h2>
                  </div>
                  
                  {step === 2 && (
                    <button 
                      onClick={handleCheckMembers}
                      disabled={isChecking}
                      className="w-full sm:w-auto bg-status-warning hover:bg-status-warning/90 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Analyzing Risk Gaps...</span>
                        </>
                      ) : (
                        <>
                          <span>Check for Flagged Members</span>
                          <ShieldCheck size={18} />
                        </>
                      )}
                    </button>
                  )}
                  {step === 3 && (
                     <div className="flex items-center space-x-2 text-status-success bg-status-success/10 px-4 py-2 rounded-lg font-semibold text-sm w-full sm:w-auto justify-center">
                      <CheckCircle2 size={18} />
                      <span>Analysis Complete</span>
                    </div>
                  )}
                </div>

                {/* Final Results (Shows in Step 3) */}
                {step === 3 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in mt-8">
                    
                    {/* Flagged Members Table */}
                    <div className="bg-status-danger/5 border border-status-danger/20 rounded-xl p-5 md:p-6 flex flex-col">
                      <div className="flex items-center space-x-2 mb-2 text-status-danger">
                        <AlertTriangle size={24} />
                        <h3 className="font-bold text-lg">Flagged Members</h3>
                      </div>
                      <p className="text-sm text-content-muted mb-6">Members with suspected undocumented HCCs based on clinical history.</p>
                      
                      <div className="space-y-3 mb-6 flex-1">
                        {flaggedMembers.map((member, idx) => (
                          <div key={idx} className="bg-surface rounded-lg p-4 shadow-sm border border-surface-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                              <p className="font-semibold text-content-main">{member.name}</p>
                              <p className="text-xs text-content-muted font-medium">{member.id} • {member.plan}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-sm font-bold text-status-danger">{member.missingHcc}</p>
                              <p className="text-xs font-semibold text-content-muted">Est. RAF: <span className="text-content-main">{member.estimatedRaf}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={handleSendToAgent}
                        className="w-full bg-status-danger hover:bg-status-danger/90 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex justify-center items-center space-x-2 mt-auto"
                      >
                        <span>Send for Agent Verification</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>

                    {/* Unflagged Members Table */}
                    <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-5 md:p-6 flex flex-col">
                      <div className="flex items-center space-x-2 mb-2 text-brand-purple">
                        <CheckCircle2 size={24} />
                        <h3 className="font-bold text-lg">Unflagged Members</h3>
                      </div>
                      <p className="text-sm text-content-muted mb-6">Members with clean records and fully captured risk factors.</p>
                      
                      <div className="space-y-3 mb-6 flex-1">
                        {unflaggedMembers.map((member, idx) => (
                          <div key={idx} className="bg-surface rounded-lg p-4 shadow-sm border border-surface-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                              <p className="font-semibold text-content-main">{member.name}</p>
                              <p className="text-xs text-content-muted font-medium">{member.id} • {member.plan}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-sm font-semibold text-content-main">{member.condition}</p>
                              <p className="text-xs font-medium text-content-muted">Last Encounter: {member.lastVisit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={handleSendToML}
                        className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex justify-center items-center space-x-2 mt-auto"
                      >
                        <span>Send for ML Prediction</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Toast Popup Notification */}
      {popupMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-surface border border-surface-border text-content-main px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-slide-in">
          <CheckCircle2 className="text-status-success" size={20} />
          <span className="font-semibold text-sm">{popupMessage}</span>
        </div>
      )}
    </MainLayout>
  );
};

export default HccMapping;
