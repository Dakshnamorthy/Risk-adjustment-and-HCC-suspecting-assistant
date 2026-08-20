import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

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
    { label: 'Total HCCs Captured', value: '1,856', icon: '🧬', color: 'green' },
    { label: 'Average Risk Score', value: '1.82', icon: '📊', color: 'blue' },
    { label: 'Documentation Rate', value: '92%', icon: '📋', color: 'purple' },
    { label: 'Approval Rate', value: '87%', icon: '✅', color: 'orange' },
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Analytics & Reports</h1>
          <p className="text-gray-600">HCC capture, risk score, and documentation metrics</p>
        </div>

        {/* Time Frame Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-3 flex-wrap">
            {['week', 'month', 'quarter', 'year'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timeFrame === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, idx) => {
            const borderColors = {
              green: 'border-green-600',
              blue: 'border-blue-600',
              purple: 'border-purple-600',
              orange: 'border-orange-600'
            };
            return (
              <div key={idx} className={`bg-white rounded-lg shadow p-6 border-t-4 ${borderColors[metric.color]}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm font-semibold">{metric.label}</p>
                  <span className="text-3xl">{metric.icon}</span>
                </div>
                <p className="text-4xl font-bold text-gray-900">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* HCC Capture Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🧬 HCC Capture Trend</h2>
            <span className="text-green-600 font-bold text-lg">+8.3% YoY</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-64">
            {analyticsData.hccCapture.byMonth.map((value, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-colors"
                  style={{ height: `${(value / 500) * 100}%` }}
                  title={`Month ${idx + 1}: ${value} HCCs`}
                ></div>
                <p className="text-xs text-gray-600 mt-2">M{idx + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Risk Score Distribution</h2>
            <div className="space-y-4">
              {analyticsData.riskScore.distribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">{item.range}</span>
                    <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Documentation Status</h2>
            <div className="space-y-4">
              {analyticsData.documentation.status.map((item, idx) => {
                const colors = ['bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700'];
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className={`px-3 py-1 rounded font-bold text-sm ${colors[idx]}`}>
                      {item.status}
                    </div>
                    <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Approval Rate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeDasharray={`${2.51 * analyticsData.approval.rate} ${251}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">{analyticsData.approval.rate}%</p>
                    <p className="text-gray-600 text-sm">Approved</p>
                  </div>
                </div>
              </div>
              <p className="text-green-600 font-bold">{analyticsData.approval.trend} from last month</p>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <p className="text-gray-700 mb-2"><span className="font-bold">8,700 HCCs</span> approved for risk adjustment</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
                <p className="text-gray-700 mb-2"><span className="font-bold">1,100 HCCs</span> pending review</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '11%'}}></div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                <p className="text-gray-700 mb-2"><span className="font-bold">200 HCCs</span> rejected</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '2%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Key Insights</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <p className="text-gray-700">HCC capture increased by 8.3% YoY, indicating improved documentation and clinical coding</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <p className="text-gray-700">Average risk score of 1.82 RAF represents moderate member complexity and appropriate resource allocation</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-700">92% documentation completeness rate exceeds industry standards, supporting accurate HCC mapping</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <p className="text-gray-700">87% approval rate demonstrates high-quality AI recommendations and effective care manager reviews</p>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
