import React, { useState, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import { 
  Activity, BarChart2, FileText, CheckCircle2, TrendingUp, 
  Target, ShieldCheck, Users, Layers 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- MOCK DATA ---
const MOCK_DATA = [
  { patient_id: 'PT005700', icd10_codes: ['E11.9', 'I10'], hcc_codes: ['HCC19'], classification_status: 'FLAGGED', risk_score: 1.45, doc_status: 'Complete', mapped: true, approved: true },
  { patient_id: 'PT008647', icd10_codes: ['J44.9'], hcc_codes: ['HCC111'], classification_status: 'UNFLAGGED', risk_score: 0.85, doc_status: 'Complete', mapped: true, approved: true },
  { patient_id: 'PT001190', icd10_codes: ['I50.9', 'I10', 'E11.22'], hcc_codes: ['HCC85', 'HCC18'], classification_status: 'FLAGGED', risk_score: 2.15, doc_status: 'Needs Review', mapped: true, approved: false },
  { patient_id: 'PT001306', icd10_codes: ['F32.9'], hcc_codes: ['HCC59'], classification_status: 'UNFLAGGED', risk_score: 1.10, doc_status: 'Complete', mapped: true, approved: true },
  { patient_id: 'PT001473', icd10_codes: ['M54.5'], hcc_codes: [], classification_status: 'UNFLAGGED', risk_score: 0.75, doc_status: 'Partial', mapped: false, approved: true },
  { patient_id: 'PT002717', icd10_codes: ['C34.90', 'J44.9', 'I50.9'], hcc_codes: ['HCC8', 'HCC111', 'HCC85'], classification_status: 'FLAGGED', risk_score: 3.20, doc_status: 'Complete', mapped: true, approved: true },
  { patient_id: 'PT003821', icd10_codes: ['N18.3'], hcc_codes: ['HCC138'], classification_status: 'FLAGGED', risk_score: 1.85, doc_status: 'Complete', mapped: true, approved: true },
  { patient_id: 'PT005233', icd10_codes: ['E11.9'], hcc_codes: ['HCC19'], classification_status: 'UNFLAGGED', risk_score: 0.95, doc_status: 'Complete', mapped: true, approved: false },
  { patient_id: 'PT006112', icd10_codes: ['I10'], hcc_codes: [], classification_status: 'UNFLAGGED', risk_score: 0.45, doc_status: 'Complete', mapped: false, approved: true },
  { patient_id: 'PT007881', icd10_codes: ['E11.9', 'N18.4'], hcc_codes: ['HCC19', 'HCC137'], classification_status: 'FLAGGED', risk_score: 2.75, doc_status: 'Partial', mapped: true, approved: true },
];

const MOCK_TREND_DATA = [
  { month: 'Jan', hccs: 85 },
  { month: 'Feb', hccs: 92 },
  { month: 'Mar', hccs: 110 },
  { month: 'Apr', hccs: 105 },
  { month: 'May', hccs: 125 },
  { month: 'Jun', hccs: 142 },
];

const COLORS = {
  flagged: '#EF4444',
  unflagged: '#10B981',
  mapped: '#3B82F6',
  unmapped: '#F59E0B',
  complete: '#10B981',
  partial: '#F59E0B',
  review: '#EF4444'
};

const Analytics = ({ user, onSignOut }) => {
  const [timeFrame, setTimeFrame] = useState('month');

  const stats = useMemo(() => {
    let totalHcc = 0;
    let riskSum = 0;
    let mappedCount = 0;
    let approvedCount = 0;
    let flaggedCount = 0;
    let unflaggedCount = 0;

    const riskDist = { '0-1': 0, '1-2': 0, '2-3': 0, '3+': 0 };
    const docDist = { 'Complete': 0, 'Partial': 0, 'Needs Review': 0 };

    MOCK_DATA.forEach(m => {
      totalHcc += m.hcc_codes.length;
      riskSum += m.risk_score;
      if (m.mapped) mappedCount++;
      if (m.approved) approvedCount++;
      if (m.classification_status === 'FLAGGED') flaggedCount++;
      if (m.classification_status === 'UNFLAGGED') unflaggedCount++;

      if (m.risk_score < 1) riskDist['0-1']++;
      else if (m.risk_score < 2) riskDist['1-2']++;
      else if (m.risk_score < 3) riskDist['2-3']++;
      else riskDist['3+']++;

      if (docDist[m.doc_status] !== undefined) docDist[m.doc_status]++;
    });

    const total = MOCK_DATA.length;

    return {
      totalMembers: total,
      totalHcc,
      avgRisk: (riskSum / total).toFixed(2),
      mappingCoverage: Math.round((mappedCount / total) * 100),
      unmappedCount: total - mappedCount,
      mappedCount,
      approvalRate: Math.round((approvedCount / total) * 100),
      flaggedCount,
      unflaggedCount,
      riskData: [
        { name: '0-1', count: riskDist['0-1'], pct: Math.round((riskDist['0-1']/total)*100) },
        { name: '1-2', count: riskDist['1-2'], pct: Math.round((riskDist['1-2']/total)*100) },
        { name: '2-3', count: riskDist['2-3'], pct: Math.round((riskDist['2-3']/total)*100) },
        { name: '3+', count: riskDist['3+'], pct: Math.round((riskDist['3+']/total)*100) },
      ],
      docData: [
        { name: 'Complete', count: docDist['Complete'], pct: Math.round((docDist['Complete']/total)*100), color: COLORS.complete },
        { name: 'Partial', count: docDist['Partial'], pct: Math.round((docDist['Partial']/total)*100), color: COLORS.partial },
        { name: 'Needs Review', count: docDist['Needs Review'], pct: Math.round((docDist['Needs Review']/total)*100), color: COLORS.review },
      ],
      classData: [
        { name: 'FLAGGED', value: flaggedCount, color: COLORS.flagged },
        { name: 'UNFLAGGED', value: unflaggedCount, color: COLORS.unflagged },
      ],
      mapData: [
        { name: 'Mapped', value: mappedCount, color: COLORS.mapped },
        { name: 'Unmapped', value: total - mappedCount, color: COLORS.unmapped },
      ]
    };
  }, []);

  const topMetrics = [
    { label: 'Total HCCs Captured', value: stats.totalHcc, icon: <Activity size={24} />, color: 'brand-blue' },
    { label: 'Average Risk Score', value: stats.avgRisk, icon: <BarChart2 size={24} />, color: 'brand-purple' },
    { label: 'Mapping Coverage', value: `${stats.mappingCoverage}%`, icon: <Layers size={24} />, color: 'status-warning' },
    { label: 'Approval Rate', value: `${stats.approvalRate}%`, icon: <CheckCircle2 size={24} />, color: 'status-success' },
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-content-main mb-2 flex items-center gap-3">
              <BarChart2 size={28} className="text-brand-blue" />
              Analytics & Reports
            </h1>
            <p className="text-content-muted">HCC capture, risk score, classification, and mapping metrics</p>
          </div>
          
          <div className="bg-surface rounded-lg shadow-sm border border-surface-border p-1.5 inline-flex card-shadow">
            {['week', 'month', 'quarter', 'year'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-colors ${
                  timeFrame === tf
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-content-muted hover:bg-surface-background hover:text-content-main'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {topMetrics.map((metric, idx) => {
            const borderColors = {
              'status-success': 'border-status-success',
              'brand-blue': 'border-brand-blue',
              'brand-purple': 'border-brand-purple',
              'status-warning': 'border-status-warning'
            };
            const textColors = {
              'status-success': 'text-status-success',
              'brand-blue': 'text-brand-blue',
              'brand-purple': 'text-brand-purple',
              'status-warning': 'text-status-warning'
            };
            const bgColors = {
              'status-success': 'bg-status-success/10',
              'brand-blue': 'bg-brand-blue/10',
              'brand-purple': 'bg-brand-purple/10',
              'status-warning': 'bg-status-warning/10'
            };
            return (
              <div key={idx} className={`bg-surface rounded-xl shadow-sm p-5 border-t-4 border border-surface-border card-shadow ${borderColors[metric.color]}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-content-muted text-sm font-semibold uppercase tracking-wider">{metric.label}</p>
                  <div className={`p-1.5 rounded-md ${bgColors[metric.color]} ${textColors[metric.color]}`}>
                    {metric.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-content-main mt-1">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* HCC Capture Trend Chart */}
        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6 md:mb-8 border border-surface-border card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-content-main flex items-center gap-2">
              <Activity size={20} className="text-brand-blue" />
              HCC Capture Trend (Last 6 Months)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hccs" name="Captured HCCs" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
          
          {/* Risk Score Distribution */}
          <div className="bg-surface rounded-xl shadow-sm p-6 border border-surface-border card-shadow">
            <h2 className="text-lg font-bold text-content-main mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-purple" />
              Risk Score Distribution
            </h2>
            <div className="space-y-5">
              {stats.riskData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-content-main">{item.name} RAF</span>
                    <span className="font-bold text-content-main">{item.count} Members</span>
                  </div>
                  <div className="w-full bg-surface-background rounded-full h-2.5 border border-surface-border">
                    <div
                      className="bg-brand-purple h-full rounded-full"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-content-muted mt-1 font-medium">{item.pct}% of Population</p>
                </div>
              ))}
            </div>
          </div>

          {/* Classification & Mapping Summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Classification Summary */}
            <div className="bg-surface rounded-xl shadow-sm p-6 border border-surface-border card-shadow flex flex-col items-center justify-center">
              <h2 className="text-md font-bold text-content-main mb-4 self-start flex items-center gap-2">
                <Users size={18} className="text-brand-blue" />
                Classification
              </h2>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.classData} innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                      {stats.classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-content-muted mt-2 text-center w-full border-t border-surface-border pt-2">
                Out of {stats.totalMembers} classified members
              </p>
            </div>

            {/* Mapping Summary */}
            <div className="bg-surface rounded-xl shadow-sm p-6 border border-surface-border card-shadow flex flex-col items-center justify-center">
              <h2 className="text-md font-bold text-content-main mb-4 self-start flex items-center gap-2">
                <Layers size={18} className="text-status-warning" />
                ICD-10 Mapping
              </h2>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.mapData} innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                      {stats.mapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-content-muted mt-2 text-center w-full border-t border-surface-border pt-2">
                {stats.mappedCount} Mapped / {stats.unmappedCount} Unmapped
              </p>
            </div>
          </div>

        </div>

        {/* Documentation Status */}
        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6 border border-surface-border card-shadow">
          <h2 className="text-lg font-bold text-content-main mb-6 flex items-center gap-2">
            <FileText size={20} className="text-status-warning" />
            Documentation Status Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.docData.map((item, idx) => {
              const bgColors = ['bg-status-success/10 border-status-success/20', 'bg-status-warning/10 border-status-warning/20', 'bg-status-danger/10 border-status-danger/20'];
              const textColors = ['text-status-success', 'text-status-warning', 'text-status-danger'];
              
              return (
                <div key={idx} className={`p-4 rounded-lg border ${bgColors[idx]}`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`font-bold text-sm ${textColors[idx]}`}>{item.name}</p>
                    <p className="text-content-main font-bold text-xl">{item.count}</p>
                  </div>
                  <div className="w-full bg-surface-background rounded-full h-2 border border-surface-border">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                  </div>
                  <p className="text-xs text-content-muted mt-2 font-medium">{item.pct}% of cohort</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-brand-blue/5 rounded-xl shadow-sm p-6 border border-brand-blue/20">
          <h2 className="text-lg font-bold text-content-main mb-4 flex items-center gap-2">
            <Target size={20} className="text-brand-blue" />
            Key Insights
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <TrendingUp className="text-brand-blue mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed">
                <span className="font-semibold">Consistent HCC Mapping:</span> The current coverage rate of {stats.mappingCoverage}% successfully identified {stats.totalHcc} HCC codes across the population.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Users className="text-brand-purple mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed">
                <span className="font-semibold">Classification Parity:</span> Out of {stats.totalMembers} classified members, {stats.flaggedCount} were FLAGGED and {stats.unflaggedCount} were UNFLAGGED by the Agent.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="text-status-success mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed">
                <span className="font-semibold">{stats.approvalRate}% Final Approval Rate:</span> Clinical reviewers have confirmed the vast majority of AI recommendations.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
