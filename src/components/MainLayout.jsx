import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user, onSignOut }) => {
  return (
    <div>
      <Sidebar user={user} onSignOut={onSignOut} />
      <main className="ml-20 lg:ml-64 transition-all duration-300 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
