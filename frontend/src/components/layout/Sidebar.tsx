'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
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
          label: 'Dashboard',
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
        <div className="sidebar-top-container">
          <div className="sidebar-brand-wrapper">
            <Logo size={30} />
            <span className="sidebar-brand-title">RTTS</span>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Close navigation"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
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
                <Icon size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-profile">
              <div className={`sidebar-user-avatar ${isAdmin ? 'admin' : ''}`}>
                {getInitials(user?.name)}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name" title={user?.name || 'User'}>
                  {user?.name || 'User'}
                </div>
                <div className={`sidebar-user-role ${isAdmin ? 'admin' : ''}`}>
                  {isAdmin ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                  <span>{user?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="sidebar-logout-btn"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
