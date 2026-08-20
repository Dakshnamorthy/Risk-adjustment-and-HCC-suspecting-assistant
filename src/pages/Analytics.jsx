import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { Activity, BarChart2, FileText, CheckCircle2, TrendingUp, Star, Target, ShieldCheck } from 'lucide-react';

const Analytics = ({ user, onSignOut }) => {
  const [timeFrame, setTimeFrame] = useState('month');

  const analyticsData = {
    hccCapture: {
      total: 1856,
      trend: '+8.3%',
      byMonth: [120, 145, 168, 192, 210, 245, 280, 310, 345, 380, 420, 456]
    },
    riskScore: {
      avg: 1.82,
      trend: '+2.1%',
      distribution: [
        { range: '0-1', count: 2400, percentage: 25 },
        { range: '1-2', count: 3600, percentage: 38 },
        { range: '2-3', count: 2200, percentage: 23 },
        { range: '3+', count: 800, percentage: 14 }
      ]
    },
    documentation: {
      rate: 92,
      trend: '+1.2%',
      status: [
        { status: 'Complete', count: 9200, percentage: 92 },
        { status: 'Incomplete', count: 600, percentage: 6 },
        { status: 'Missing', count: 200, percentage: 2 }
      ]
    },
    approval: {
      rate: 87,
      trend: '+3.4%'
    }
  };

  const metrics = [
    { label: 'Total HCCs Captured', value: '1,856', icon: <Activity size={24} />, color: 'brand-blue' },
    { label: 'Average Risk Score', value: '1.82', icon: <BarChart2 size={24} />, color: 'brand-purple' },
    { label: 'Documentation Rate', value: '92%', icon: <FileText size={24} />, color: 'status-warning' },
    { label: 'Approval Rate', value: '87%', icon: <CheckCircle2 size={24} />, color: 'status-success' },
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
            <p className="text-content-muted">HCC capture, risk score, and documentation metrics</p>
          </div>
          
          {/* Time Frame Selector */}
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

        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {metrics.map((metric, idx) => {
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

        {/* HCC Capture Chart */}
        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6 md:mb-8 border border-surface-border card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-content-main flex items-center gap-2">
              <Activity size={20} className="text-brand-blue" />
              HCC Capture Trend
            </h2>
            <span className="text-status-success font-bold text-sm bg-status-success/10 px-2.5 py-1 rounded-md">+8.3% YoY</span>
          </div>
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-64">
            {analyticsData.hccCapture.byMonth.map((value, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-brand-blue rounded-t-sm hover:bg-brand-blue/80 transition-colors"
                  style={{ height: `${(value / 500) * 100}%` }}
                  title={`Month ${idx + 1}: ${value} HCCs`}
                ></div>
                <p className="text-xs text-content-muted mt-2 font-medium">M{idx + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
          {/* Risk Distribution */}
          <div className="bg-surface rounded-xl shadow-sm p-6 border border-surface-border card-shadow">
            <h2 className="text-lg font-bold text-content-main mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-purple" />
              Risk Score Distribution
            </h2>
            <div className="space-y-5">
              {analyticsData.riskScore.distribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-content-main">{item.range}</span>
                    <span className="font-bold text-content-main">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-surface-background rounded-full h-2.5 border border-surface-border">
                    <div
                      className="bg-brand-purple h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-content-muted mt-1 font-medium">{item.percentage}% of Population</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Status */}
          <div className="bg-surface rounded-xl shadow-sm p-6 border border-surface-border card-shadow">
            <h2 className="text-lg font-bold text-content-main mb-6 flex items-center gap-2">
              <FileText size={20} className="text-status-warning" />
              Documentation Status
            </h2>
            <div className="space-y-4">
              {analyticsData.documentation.status.map((item, idx) => {
                const bgColors = ['bg-status-success/10 text-status-success', 'bg-status-warning/10 text-status-warning', 'bg-status-danger/10 text-status-danger'];
                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-surface-background border border-surface-border">
                    <div className={`px-3 py-1 rounded-md font-bold text-sm ${bgColors[idx]}`}>
                      {item.status}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-content-main block">{item.count.toLocaleString()}</span>
                      <span className="text-content-muted text-xs font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6 md:mb-8 border border-surface-border card-shadow">
          <h2 className="text-lg font-bold text-content-main mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-status-success" />
            Approval Rate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-surface-border, #E5EAF0)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0F9F7F"
                    strokeWidth="8"
                    strokeDasharray={`${2.51 * analyticsData.approval.rate} ${251}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-status-success">{analyticsData.approval.rate}%</p>
                    <p className="text-content-muted text-sm font-medium">Approved</p>
                  </div>
                </div>
              </div>
              <p className="text-status-success font-bold text-sm bg-status-success/10 px-3 py-1.5 rounded-full inline-block">{analyticsData.approval.trend} from last month</p>
            </div>

            <div className="col-span-2 space-y-4 flex flex-col justify-center">
              <div className="bg-status-success/5 p-4 rounded-lg border border-status-success/20">
                <p className="text-content-main mb-2 text-sm"><span className="font-bold">8,700 HCCs</span> approved for risk adjustment</p>
                <div className="w-full bg-surface-background rounded-full h-2 border border-surface-border">
                  <div className="bg-status-success h-full rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>

              <div className="bg-status-warning/5 p-4 rounded-lg border border-status-warning/20">
                <p className="text-content-main mb-2 text-sm"><span className="font-bold">1,100 HCCs</span> pending review</p>
                <div className="w-full bg-surface-background rounded-full h-2 border border-surface-border">
                  <div className="bg-status-warning h-full rounded-full" style={{width: '11%'}}></div>
                </div>
              </div>

              <div className="bg-status-danger/5 p-4 rounded-lg border border-status-danger/20">
                <p className="text-content-main mb-2 text-sm"><span className="font-bold">200 HCCs</span> rejected</p>
                <div className="w-full bg-surface-background rounded-full h-2 border border-surface-border">
                  <div className="bg-status-danger h-full rounded-full" style={{width: '2%'}}></div>
                </div>
              </div>
            </div>
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
              <p className="text-content-main text-sm leading-relaxed"><span className="font-semibold">HCC capture increased by 8.3% YoY</span>, indicating improved documentation and clinical coding.</p>
            </li>
            <li className="flex items-start gap-3">
              <Star className="text-status-warning mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed"><span className="font-semibold">Average risk score of 1.82 RAF</span> represents moderate member complexity and appropriate resource allocation.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-status-success mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed"><span className="font-semibold">92% documentation completeness rate</span> exceeds industry standards, supporting accurate HCC mapping.</p>
            </li>
            <li className="flex items-start gap-3">
              <Target className="text-brand-purple mt-0.5 shrink-0" size={18} />
              <p className="text-content-main text-sm leading-relaxed"><span className="font-semibold">87% approval rate</span> demonstrates high-quality AI recommendations and effective care manager reviews.</p>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
