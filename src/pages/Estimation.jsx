import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { membersData } from '../data/membersData';
import { DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

const Estimation = ({ user, onSignOut }) => {
  const BASE_AMOUNT = 9500;
  
  // Create state for estimation data
  const [estimationData, setEstimationData] = useState([]);
  
  useEffect(() => {
    // Generate mock estimation data based on existing members
    const data = Object.values(membersData).map((member, index) => {
      const riskScore = parseFloat(member.riskScore);
      const estimatedCost = BASE_AMOUNT * riskScore;
      
      // Simulate CMS actual cost (some underfunded, some overfunded)
      // We'll use a deterministic random variation based on index so it's stable
      const varianceFactor = 1 + ((index % 5) - 2) * 0.15; // -30% to +30% variance
      const actualCost = Math.round(estimatedCost * varianceFactor);
      const variance = actualCost - estimatedCost;
      
      return {
        id: member.id,
        name: member.name,
        riskScore: riskScore,
        baseAmount: BASE_AMOUNT,
        estimatedCost: estimatedCost,
        actualCost: actualCost,
        variance: variance,
        status: variance >= 0 ? 'Surplus' : 'Deficit'
      };
    });
    
    setEstimationData(data);
  }, []);

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    if (estimationData.length === 0) return { totalEstimated: 0, totalActual: 0, netVariance: 0, avgRiskScore: 0 };
    
    let totalEstimated = 0;
    let totalActual = 0;
    let totalRisk = 0;
    
    estimationData.forEach(item => {
      totalEstimated += item.estimatedCost;
      totalActual += item.actualCost;
      totalRisk += item.riskScore;
    });
    
    return {
      totalEstimated,
      totalActual,
      netVariance: totalActual - totalEstimated,
      avgRiskScore: totalRisk / estimationData.length
    };
  }, [estimationData]);

  // Formatters
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Cost Estimation Analysis</h1>
          <p className="text-content-muted text-sm md:text-base">Compare actual CMS funding versus ML-estimated costs based on Risk Score.</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-blue border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Total Actual Funding</p>
                <div className="p-1.5 bg-brand-blue/10 rounded-md">
                  <DollarSign className="text-brand-blue" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{formatCurrency(metrics.totalActual)}</p>
             <p className="text-xs text-content-muted mt-2 font-medium">Funded by CMS</p>
          </div>
          
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-purple border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Total Estimated Cost</p>
                <div className="p-1.5 bg-brand-purple/10 rounded-md">
                  <Activity className="text-brand-purple" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{formatCurrency(metrics.totalEstimated)}</p>
             <p className="text-xs text-content-muted mt-2 font-medium">ML Calculated (Base × Risk)</p>
          </div>

          <div className={`bg-surface rounded-xl shadow-sm p-5 border-t-4 border border-surface-border card-shadow ${metrics.netVariance >= 0 ? 'border-t-status-success' : 'border-t-status-danger'}`}>
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Net Variance</p>
                <div className={`p-1.5 rounded-md ${metrics.netVariance >= 0 ? 'bg-status-success/10' : 'bg-status-danger/10'}`}>
                  {metrics.netVariance >= 0 ? <TrendingUp className="text-status-success" size={18} /> : <TrendingDown className="text-status-danger" size={18} />}
                </div>
             </div>
             <p className={`text-2xl md:text-3xl font-bold mt-1 ${metrics.netVariance >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
               {metrics.netVariance > 0 ? '+' : ''}{formatCurrency(metrics.netVariance)}
             </p>
             <p className="text-xs text-content-muted mt-2 font-medium">Actual vs Estimated Difference</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-content-muted border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Average Risk Score</p>
                <div className="p-1.5 bg-surface-background rounded-md border border-surface-border">
                  <AlertCircle className="text-content-muted" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{formatNumber(metrics.avgRiskScore)}</p>
             <p className="text-xs text-content-muted mt-2 font-medium">Across analyzed population</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-surface-border overflow-hidden card-shadow">
          <div className="p-4 sm:p-5 md:p-6 border-b border-surface-border flex justify-between items-center bg-surface-background">
            <h2 className="text-lg md:text-xl font-bold text-content-main">Member Estimation Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-surface-background text-content-muted uppercase text-xs font-semibold border-b border-surface-border">
                <tr>
                  <th className="px-6 py-3 tracking-wider">Member</th>
                  <th className="px-6 py-3 tracking-wider">Base Amount</th>
                  <th className="px-6 py-3 tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 tracking-wider">Estimated Cost</th>
                  <th className="px-6 py-3 tracking-wider">Actual Cost (CMS)</th>
                  <th className="px-6 py-3 tracking-wider">Variance</th>
                  <th className="px-6 py-3 tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {estimationData.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-content-main">{row.name}</p>
                      <p className="text-xs text-content-muted">{row.id}</p>
                    </td>
                    <td className="px-6 py-4 text-content-muted font-medium">{formatCurrency(row.baseAmount)}</td>
                    <td className="px-6 py-4 font-bold text-brand-purple">{formatNumber(row.riskScore)}</td>
                    <td className="px-6 py-4 font-semibold text-content-muted">{formatCurrency(row.estimatedCost)}</td>
                    <td className="px-6 py-4 font-bold text-content-main">{formatCurrency(row.actualCost)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${row.variance >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                        {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center space-x-1 ${
                        row.status === 'Surplus' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'
                      }`}>
                        <span>{row.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
                
                {estimationData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-content-muted font-medium">
                      Loading estimation data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Estimation;
