import React, { useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { DollarSign, AlertCircle, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Realistic Mock Data
const MOCK_MEMBERS = [
  { id: 'PT005700', riskScore: 1.45, actualFunding: 12500, estimatedCost: 15400 },
  { id: 'PT008647', riskScore: 0.85, actualFunding: 8200, estimatedCost: 7100 },
  { id: 'PT001190', riskScore: 2.15, actualFunding: 18400, estimatedCost: 22800 },
  { id: 'PT001306', riskScore: 1.10, actualFunding: 10500, estimatedCost: 10800 },
  { id: 'PT001473', riskScore: 0.75, actualFunding: 7500, estimatedCost: 6200 },
  { id: 'PT002717', riskScore: 3.20, actualFunding: 28000, estimatedCost: 35000 },
  { id: 'PT003821', riskScore: 1.85, actualFunding: 15200, estimatedCost: 18500 },
  { id: 'PT005233', riskScore: 0.95, actualFunding: 9100, estimatedCost: 8900 },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const Estimation = ({ user, onSignOut }) => {

  const { totalFunding, totalCost, netVariance, avgRiskScore, chartData } = useMemo(() => {
    let funding = 0;
    let cost = 0;
    let riskSum = 0;

    const formattedChartData = MOCK_MEMBERS.map(m => {
      funding += m.actualFunding;
      cost += m.estimatedCost;
      riskSum += m.riskScore;
      
      return {
        name: m.id,
        Funding: m.actualFunding,
        Cost: m.estimatedCost,
      };
    });

    return {
      totalFunding: funding,
      totalCost: cost,
      netVariance: funding - cost,
      avgRiskScore: (riskSum / MOCK_MEMBERS.length).toFixed(2),
      chartData: formattedChartData
    };
  }, []);

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2">Cost Estimation Analysis</h1>
          <p className="text-content-muted text-sm md:text-base">Compare actual CMS funding versus ML-estimated costs based on Risk Score.</p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-blue border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Total Actual Funding</p>
                <div className="p-1.5 bg-brand-blue/10 rounded-md">
                  <DollarSign className="text-brand-blue" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{formatCurrency(totalFunding)}</p>
             <p className="text-xs text-content-muted mt-2 font-medium flex items-center">
                <TrendingUp size={14} className="text-brand-blue mr-1" />
                CMS Allocated Funds
             </p>
          </div>
          
          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-brand-purple border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Total Estimated Cost</p>
                <div className="p-1.5 bg-brand-purple/10 rounded-md">
                  <Activity className="text-brand-purple" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{formatCurrency(totalCost)}</p>
             <p className="text-xs text-content-muted mt-2 font-medium flex items-center">
                <TrendingUp size={14} className="text-brand-purple mr-1" />
                ML Predicted Expenditure
             </p>
          </div>

          <div className={`bg-surface rounded-xl shadow-sm p-5 border-t-4 border border-surface-border card-shadow ${netVariance >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Net Variance</p>
                <div className={`p-1.5 rounded-md ${netVariance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {netVariance >= 0 ? (
                    <TrendingUp className="text-green-600" size={18} />
                  ) : (
                    <TrendingDown className="text-red-600" size={18} />
                  )}
                </div>
             </div>
             <p className={`text-2xl md:text-3xl font-bold mt-1 ${netVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
               {netVariance > 0 ? '+' : ''}{formatCurrency(netVariance)}
             </p>
             <p className="text-xs text-content-muted mt-2 font-medium">Actual Funding vs Estimated Cost</p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-5 border-t-4 border-t-orange-500 border border-surface-border card-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-content-muted font-semibold text-sm uppercase tracking-wider">Avg Risk Score</p>
                <div className="p-1.5 bg-orange-100 rounded-md">
                  <Users className="text-orange-600" size={18} />
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-bold text-content-main mt-1">{avgRiskScore}</p>
             <p className="text-xs text-content-muted mt-2 font-medium">Across Population</p>
          </div>
        </div>

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Chart Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-border card-shadow flex flex-col">
            <div className="p-5 border-b border-surface-border">
              <h2 className="text-lg font-bold text-content-main">Funding vs Cost Comparison</h2>
              <p className="text-sm text-content-muted mt-1">Visualizing member-level financial variance.</p>
            </div>
            <div className="p-5 flex-grow min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                  <Bar dataKey="Funding" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Cost" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-border card-shadow flex flex-col">
            <div className="p-5 border-b border-surface-border">
              <h2 className="text-lg font-bold text-content-main">Member Estimation Details</h2>
              <p className="text-sm text-content-muted mt-1">Detailed breakdown of projected shortfalls and surpluses.</p>
            </div>
            <div className="overflow-x-auto p-0 flex-grow">
              <table className="w-full text-left text-sm text-content-main">
                <thead className="bg-surface-background/50 text-content-muted uppercase font-semibold text-xs border-b border-surface-border">
                  <tr>
                    <th className="px-5 py-4">Patient ID</th>
                    <th className="px-5 py-4">Risk Score</th>
                    <th className="px-5 py-4 text-right">Actual Funding</th>
                    <th className="px-5 py-4 text-right">Estimated Cost</th>
                    <th className="px-5 py-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {MOCK_MEMBERS.map((member) => {
                    const variance = member.actualFunding - member.estimatedCost;
                    const isPositive = variance >= 0;
                    
                    return (
                      <tr key={member.id} className="hover:bg-surface-background/50 transition-colors">
                        <td className="px-5 py-4 font-medium">{member.id}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            member.riskScore > 1.5 ? 'bg-red-100 text-red-700' :
                            member.riskScore > 1.0 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {member.riskScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">{formatCurrency(member.actualFunding)}</td>
                        <td className="px-5 py-4 text-right text-content-muted">{formatCurrency(member.estimatedCost)}</td>
                        <td className="px-5 py-4 text-right font-semibold">
                          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {isPositive ? '+' : ''}{formatCurrency(variance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default Estimation;
