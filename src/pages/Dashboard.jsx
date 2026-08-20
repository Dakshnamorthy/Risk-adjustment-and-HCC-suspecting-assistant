import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Phone, ChevronRight, MoreVertical, FileText, User } from 'lucide-react';

const Dashboard = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Members', value: '10,000', icon: <Activity className="text-brand-blue" size={24} />, style: 'bg-surface border-surface-border text-content-main', subText: 'text-content-muted' },
    { label: 'Flagged Members', value: '248', icon: <AlertTriangle className="text-status-danger" size={24} />, style: 'bg-surface border-surface-border text-status-danger', subText: 'text-status-danger/70' },
    { label: 'Unflagged', value: '9,752', icon: <CheckCircle className="text-status-success" size={24} />, style: 'bg-surface border-surface-border text-status-success', subText: 'text-status-success/70' },
    { label: 'Mark for Review', value: '32', icon: <Clock className="text-status-warning" size={24} />, style: 'bg-status-warning/5 border-status-warning/20 text-status-warning', subText: 'text-status-warning/70' },
    { label: 'In Follow Up', value: '15', icon: <Phone className="text-white" size={24} />, style: 'bg-brand-blue border-brand-blue text-white', subText: 'text-white/80' },
  ];

  // Pie Chart Data
  const chartData = [
    { name: 'Flagged Members', value: 248, color: '#D64545' }, // status-danger
    { name: 'Unflagged Members', value: 9752, color: '#0F9F7F' }, // status-success
    { name: 'Mark for Review', value: 32, color: '#D99A00' }, // status-warning
    { name: 'In Follow Up', value: 15, color: '#2563EB' } // brand-blue
  ];

  const priorityQueue = [
    { patient: 'James Wilson', details: 'Male, 72 yrs', room: 'MA-PD (ID: 8821)', condition: 'HCC 19: Diabetes without Complications', hr: '+0.104', spo2: '', status: 'Marked for Review', statusColor: 'bg-status-warning/10 text-status-warning' },
    { patient: 'Elena Rostova', details: 'Female, 29 yrs', room: 'MA Only (ID: 4192)', condition: 'HCC 111: COPD', hr: '+0.328', temp: '', status: 'Marked for Follow-up', statusColor: 'bg-brand-blue/10 text-brand-blue' },
    { patient: 'Sarah Jenkins', details: 'Female, 54 yrs', room: 'D-SNP (ID: 1102)', condition: 'HCC 85: Congestive Heart Failure', hr: '+0.323', spo2: '', status: 'Marked for Review', statusColor: 'bg-status-warning/10 text-status-warning' },
    { patient: 'David Kim', details: 'Male, 61 yrs', room: 'MA-PD (ID: 5543)', condition: 'HCC 22: Morbid Obesity', hr: '+0.273', bp: '', status: 'Marked for Follow-up', statusColor: 'bg-brand-blue/10 text-brand-blue' },
    { patient: 'Marcus Chen', details: 'Male, 31 yrs', room: 'C-SNP (ID: 9910)', condition: 'HCC 18: Diabetes with Complications', hr: '+0.318', spo2: '', status: 'Marked for Review', statusColor: 'bg-status-warning/10 text-status-warning' }
  ];

  return (
    <MainLayout user={user} onSignOut={onSignOut}>
      
      {/* Hero Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-content-main capitalize">Good Morning, {(user?.username || user?.name)?.split(' ')[0] || 'User'}</h1>
      </div>

      {/* 5 Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 md:mb-8">
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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Priority Patient Queue */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-surface rounded-xl p-6 flex-1 shadow-sm border border-surface-border flex flex-col card-shadow overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-content-main">HCC Suspecting Queue</h2>
              <button className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">View All</button>
            </div>
            
            <div className="overflow-x-auto flex-1 w-full">
              <table className="w-full text-sm text-left whitespace-nowrap min-w-[700px]">
                <thead>
                  <tr className="text-[13px] font-semibold text-content-muted uppercase tracking-wider border-b border-surface-border">
                    <th className="pb-3 px-2">Member</th>
                    <th className="pb-3 px-2">Plan / ID</th>
                    <th className="pb-3 px-2">Suspected HCC</th>
                    <th className="pb-3 px-2">Est. RAF Impact</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {priorityQueue.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-background transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-surface-background flex items-center justify-center text-content-muted overflow-hidden border border-surface-border shadow-sm">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-content-main">{item.patient}</p>
                            <p className="text-xs text-content-muted">{item.details}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-[13px] text-content-main">{item.room}</td>
                      <td className="py-4 px-2 text-[13px] text-content-main truncate max-w-[200px]" title={item.condition}>{item.condition}</td>
                      <td className="py-4 px-2">
                        <div className="text-[13px] font-bold text-brand-purple">
                          {item.hr}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center w-max space-x-1.5 ${item.statusColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="p-2 hover:bg-surface-border rounded-lg text-content-muted transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="flex flex-col space-y-6">
          {/* Patient Risk Distribution */}
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
                   <span className="text-3xl font-bold text-content-main mt-2">10k</span>
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
        
      </div>
    </MainLayout>
  );
};

export default Dashboard;
