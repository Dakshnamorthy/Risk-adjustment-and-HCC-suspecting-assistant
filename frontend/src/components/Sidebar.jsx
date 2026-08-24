import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, PieChart as ChartPie, Bot, History, LogOut, Settings, Stethoscope, Calculator, X } from 'lucide-react';

const Sidebar = ({ onSignOut, isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Members', path: '/members', icon: <Users size={20} /> },
    { label: 'HCC Mapping', path: '/hcc-mapping', icon: <Activity size={20} /> },
    { label: 'ML Prediction', path: '/ml-prediction', icon: <Bot size={20} /> },
    { label: 'Agent Analysis', path: '/agent-analysis', icon: <Stethoscope size={20} /> },
    { label: 'Cost Estimation', path: '/estimation', icon: <Calculator size={20} /> },
    { label: 'Analytics', path: '/analytics', icon: <ChartPie size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-brand-navy z-50 flex flex-col py-6 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:w-[72px] lg:w-60
      `}
    >
      <div className="flex items-center justify-between px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 min-w-[40px] bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            HZ
          </div>
          <span className="text-white font-bold text-lg whitespace-nowrap lg:block md:hidden block">
            HELIZA
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/50 hover:text-white md:hidden p-1"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 w-full flex flex-col px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group
                ${active 
                  ? 'bg-brand-blue text-white shadow-sm' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <div className={`min-w-[24px] flex items-center justify-center ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className={`whitespace-nowrap font-medium text-sm lg:block md:hidden block ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
        <button
          onClick={onSignOut}
          className="flex items-center gap-4 px-3 py-3 rounded-lg text-white/60 hover:bg-status-danger/20 hover:text-status-danger transition-all duration-200 group w-full"
          title="Logout"
        >
          <div className="min-w-[24px] flex items-center justify-center text-white/60 group-hover:text-status-danger">
            <LogOut size={20} />
          </div>
          <span className="whitespace-nowrap font-medium text-sm lg:block md:hidden block">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
