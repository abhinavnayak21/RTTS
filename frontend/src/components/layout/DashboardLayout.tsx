import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
