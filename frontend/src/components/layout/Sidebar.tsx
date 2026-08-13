'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ShieldCheck,
  UserCheck,
  ListFilter,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';
import './sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const navItems = isAdmin
    ? [
        {
          label: 'Admin Dashboard',
          path: '/admin/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'All Tickets',
          path: '/admin/tickets',
          icon: ListFilter,
        },
      ]
    : [
        {
          label: 'Dashboard',
          path: '/customer/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'My Tickets',
          path: '/customer/tickets',
          icon: ListFilter,
        },
        {
          label: 'Create Ticket',
          path: '/customer/tickets/new',
          icon: PlusCircle,
        },
      ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <div className="sidebar-brand-icon-wrapper">
              <Logo size={40} />
            </div>
            <div>
              <h1 className="sidebar-brand-title">RTTS</h1>
              <span className="sidebar-brand-subtitle">Support System</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Close navigation"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-heading">Navigation</div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user-row">
            <div className="sidebar-user-profile">
              <div className={`sidebar-user-avatar ${isAdmin ? 'admin' : ''}`}>
                {getInitials(user?.name)}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {user?.name || 'User'}
                </div>
                <div className={`sidebar-user-role ${isAdmin ? 'admin' : ''}`}>
                  {isAdmin ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                  <span>{user?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="sidebar-logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
