import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const Dashboard = ({ user, onSignOut }) => {
  const stats = [
    { label: 'Total Members', value: '10,000', icon: '👥', color: 'blue', change: '+2.5%' },
    { label: 'Active Cases', value: '248', icon: '📋', color: 'green', change: '+12%' },
    { label: 'Pending Reviews', value: '32', icon: '⏳', color: 'orange', change: '-5%' },
    { label: 'HCC Captured', value: '1,856', icon: '🧬', color: 'purple', change: '+8.3%' },
  ];

  const quickStats = [
    { title: 'Avg Risk Score', value: '1.82', unit: 'RAF' },
    { title: 'Documentation Rate', value: '92%', unit: 'Complete' },
    { title: 'Approval Rate', value: '87%', unit: 'HCCs' },
    { title: 'Turnaround Time', value: '2.4', unit: 'days' },
  ];

  const recentReviews = [
    { memberName: 'John Doe', memberId: 'MXQ1', decision: 'Approved', hccs: 2 },
    { memberName: 'Jane Smith', memberId: 'MXQ2', decision: 'Pending', hccs: 3 },
    { memberName: 'Robert Johnson', memberId: 'MXQ3', decision: 'Approved', hccs: 1 },
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, Care Manager! 👋</h1>
          <p className="text-blue-100 text-lg">
            You have <span className="font-bold">32 pending reviews</span> requiring attention today
          </p>
          <div className="mt-4 flex gap-2 text-sm">
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">📅 May 28, 2025</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">⏰ Last updated: 2 min ago</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-t-4"
              style={{ borderTopColor: 
                stat.color === 'blue' ? '#3b82f6' :
                stat.color === 'green' ? '#10b981' :
                stat.color === 'orange' ? '#f59e0b' : '#8b5cf6'
              }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm mt-2 font-semibold ${
                stat.change.includes('+') ? 'text-green-600' : 'text-red-600'
              }`}>{stat.change} from last month</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((qs, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold mb-2">{qs.title}</p>
              <p className="text-4xl font-bold text-blue-600">{qs.value}</p>
              <p className="text-gray-500 text-xs mt-1">{qs.unit}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Priority Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review Priority Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">🔴 High Priority</span>
                  <span className="text-sm font-bold text-red-600">8 cases</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">🟡 Medium Priority</span>
                  <span className="text-sm font-bold text-yellow-600">15 cases</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">🟢 Low Priority</span>
                  <span className="text-sm font-bold text-green-600">9 cases</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
              <Link to="/review-history" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Member</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Decision</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">HCCs</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((review, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-semibold text-gray-900">{review.memberName}</td>
                      <td className="py-3 px-3 text-gray-600">{review.memberId}</td>
                      <td className="py-3 px-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          review.decision === 'Approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.decision}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">{review.hccs}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </div>
    </MainLayout>
  );
};

export default Dashboard;
