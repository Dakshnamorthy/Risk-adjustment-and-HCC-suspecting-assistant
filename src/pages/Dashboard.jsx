import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { dashboardAPI } from '../services/apiService';

const Dashboard = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    total_members: 0,
    flagged_members: 0,
    unflagged_members: 0,
    review_cases: 0,
    follow_ups: 0,
    accepted_members: 0,
    rejected_members: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getSummary();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
        // Use default values if API fails
        setDashboardData({
          total_members: 0,
          flagged_members: 0,
          unflagged_members: 0,
          review_cases: 0,
          follow_ups: 0,
          accepted_members: 0,
          rejected_members: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Members', value: dashboardData.total_members.toLocaleString(), icon: <Activity className="text-brand-blue" size={24} />, style: 'bg-surface border-surface-border text-content-main', subText: 'text-content-muted' },
    { label: 'Flagged Members', value: dashboardData.flagged_members.toLocaleString(), icon: <AlertTriangle className="text-status-danger" size={24} />, style: 'bg-surface border-surface-border text-status-danger', subText: 'text-status-danger/70' },
    { label: 'Unflagged', value: dashboardData.unflagged_members.toLocaleString(), icon: <CheckCircle className="text-status-success" size={24} />, style: 'bg-surface border-surface-border text-status-success', subText: 'text-status-success/70' },
    { label: 'Mark for Review', value: dashboardData.review_cases.toString(), icon: <Clock className="text-status-warning" size={24} />, style: 'bg-status-warning/5 border-status-warning/20 text-status-warning', subText: 'text-status-warning/70' },
    { label: 'In Follow Up', value: dashboardData.follow_ups.toString(), icon: <Phone className="text-white" size={24} />, style: 'bg-brand-blue border-brand-blue text-white', subText: 'text-white/80' },
    { label: 'Accepted', value: dashboardData.accepted_members.toLocaleString(), icon: <CheckCircle2 className="text-status-success" size={24} />, style: 'bg-surface border-surface-border text-status-success', subText: 'text-status-success/70' },
    { label: 'Rejected', value: dashboardData.rejected_members.toLocaleString(), icon: <XCircle className="text-status-danger" size={24} />, style: 'bg-surface border-surface-border text-status-danger', subText: 'text-status-danger/70' },
  ];

  // Pie Chart Data
  const chartData = [
    { name: 'Flagged Members', value: dashboardData.flagged_members, color: '#D64545' }, // status-danger
    { name: 'Unflagged Members', value: dashboardData.unflagged_members, color: '#0F9F7F' }, // status-success
    { name: 'Mark for Review', value: dashboardData.review_cases, color: '#D99A00' }, // status-warning
    { name: 'In Follow Up', value: dashboardData.follow_ups, color: '#2563EB' } // brand-blue
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg text-status-danger text-sm">
          Failed to load dashboard data: {error}. Showing default values.
        </div>
      )}

      {/* Hero Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-content-main capitalize">Good Morning, {(user?.username || user?.name)?.split(' ')[0] || 'User'}</h1>
      </div>

      {/* Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6 md:mb-8">
        {stats.map((stat, idx) => {
          let navPath = `/members?category=${encodeURIComponent(stat.label)}`;
          if (stat.label === 'Flagged Members') navPath = '/agent-analysis';
          if (stat.label === 'Unflagged') navPath = '/ml-prediction';
          if (stat.label === 'Mark for Review') navPath = '/unflagged-members';
          if (stat.label === 'In Follow Up') navPath = '/flagged-members';
          
          return (
            <div 
              key={idx} 
              onClick={() => stat.label !== 'Total Members' && navigate(navPath)}
              className={`${stat.style} border rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:shadow-md transition-shadow card-shadow ${stat.label !== 'Total Members' ? 'cursor-pointer hover:border-current' : ''}`}
            >
              <div className="flex justify-between items-start z-10 relative">
                <h3 className={`text-2xl md:text-3xl font-bold`}>{stat.value}</h3>
                <div className="p-2 bg-surface/30 rounded-lg backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
              <div className={`text-sm font-semibold mt-4 z-10 relative ${stat.subText}`}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-border flex flex-col card-shadow">
          <h2 className="text-lg font-semibold text-content-main mb-2">Review Outcomes</h2>
          <p className="text-sm text-content-muted mb-4">Accepted and rejected decisions recorded in the review table.</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Accepted', value: dashboardData.accepted_members, color: '#0F9F7F' },
                { name: 'Rejected', value: dashboardData.rejected_members, color: '#D64545' }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Members']} cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={54}>
                  {[0, 1].map(index => <Cell key={index} fill={index === 0 ? '#0F9F7F' : '#D64545'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-border flex-1 flex flex-col card-shadow">
             <h2 className="text-lg font-semibold text-content-main mb-2">Member Risk Distribution</h2>
             <div className="flex-1 flex flex-col relative items-center justify-center min-h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value.toLocaleString()}`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5EAF0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text inside Donut */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                   <span className="text-3xl font-bold text-content-main mt-2">{dashboardData.total_members.toLocaleString()}</span>
                   <span className="text-xs font-medium text-content-muted">Members</span>
                </div>
             </div>
             
             {/* Custom Legend */}
             <div className="grid grid-cols-2 gap-3 mt-6">
               {chartData.map((item, idx) => (
                 <div key={idx} className="flex items-center space-x-2">
                   <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                   <div className="text-xs font-medium text-content-muted">{item.name}</div>
                 </div>
               ))}
             </div>
          </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
