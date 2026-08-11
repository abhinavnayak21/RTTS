'use client';

import React, { ReactNode, useState } from 'react';
import { Menu, Ticket } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './layout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="dashboard-layout-container">
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="dashboard-content-area">
        {/* Mobile Top Header */}
        <header className="mobile-header-bar">
          <div className="mobile-brand">
            <div className="mobile-brand-icon">
              <Ticket size={18} />
            </div>
            <div>
              <span className="mobile-brand-title">RTTS</span>
              <span className="mobile-brand-subtitle">
                {isAdmin ? 'Admin Portal' : 'Customer Desk'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="dashboard-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
