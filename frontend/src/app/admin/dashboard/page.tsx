'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  RefreshCw,
  Eye,
  ListFilter,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import { TicketPriorityBadge } from '../../../components/ui/TicketBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../../components/tickets/TicketDetailModal';
import { Ticket, AdminStats, PaginatedResponse, TicketStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useWebSocket } from '../../../context/WebSocketContext';
import api from '../../../api/axios';
import './admin-dashboard.css';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { subscribe } = useWebSocket();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role?.toLowerCase() !== 'admin') {
        router.replace('/customer/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<PaginatedResponse<Ticket>>('/tickets/', {
          params: { limit: 5, sort_by: 'created_at', order: 'desc' },
        }),
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.items || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  // Real-time live sync for Admin Dashboard
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      // Re-fetch aggregate stats and latest queue when any ticket event occurs
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const handleStatusChange = async (ticketId: number, newStatus: TicketStatus) => {
    setUpdatingId(ticketId);
    try {
      await api.put(`/tickets/${ticketId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Checking session..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-dashboard-container animate-fade-in">
        {/* Responsive Header Bar */}
        <div className="page-header-row">
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: '800', color: 'var(--text-primary)' }}>
              Admin Support Dashboard 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Overview and management of all customer submitted support tickets.
            </p>
          </div>

          <div className="page-header-actions">
            <button
              onClick={fetchData}
              title="Refresh Dashboard Data"
              className="btn-secondary"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => router.push('/admin/tickets')}
              className="btn-primary"
            >
              <ListFilter size={18} />
              <span>View All Tickets</span>
            </button>
          </div>
        </div>

        {loading && !stats ? (
          <LoadingSpinner text="Loading Admin Dashboard statistics..." />
        ) : (
          <>
            {/* 4 Stat Cards Row */}
            <div className="stat-cards-grid">
              <StatCard
                title="Total Tickets"
                value={stats?.total ?? 0}
                icon={TicketIcon}
                color="indigo"
                description="Across all customer accounts"
              />
              <StatCard
                title="Open Tickets"
                value={stats?.by_status?.Open ?? 0}
                icon={AlertCircle}
                color="emerald"
                description="Awaiting admin response"
              />
              <StatCard
                title="In Progress"
                value={stats?.by_status?.['In Progress'] ?? 0}
                icon={Clock}
                color="amber"
                description="Currently being handled"
              />
              <StatCard
                title="Resolved / Closed"
                value={stats?.by_status?.Closed ?? 0}
                icon={CheckCircle2}
                color="sky"
                description="Completed tickets"
              />
            </div>

            {/* Grid for Recent Tickets & Priority Breakdown */}
            <div className="admin-dashboard-grid">
              {/* Recent Customer Tickets Table Card */}
              <div className="admin-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Recent Customer Tickets
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Manage status updates for customer inquiries
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/tickets')}
                    style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    View All →
                  </button>
                </div>

                {loading && recentTickets.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
                    <LoadingSpinner text="Fetching latest tickets..." />
                  </div>
                ) : recentTickets.length === 0 ? (
                  <div className="dashboard-empty-state" style={{ border: 'none' }}>
                    <TicketIcon size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: '500' }}>No customer tickets submitted yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>TICKET</th>
                          <th>CUSTOMER</th>
                          <th>PRIORITY</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                {ticket.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                #{ticket.id} • {formatDate(ticket.created_at)}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <User size={14} style={{ color: 'var(--accent)' }} />
                                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
                                  {ticket.owner?.name || `Customer #${ticket.owner_id}`}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {ticket.owner?.email || ''}
                              </div>
                            </td>

                            <td>
                              <TicketPriorityBadge priority={ticket.priority} />
                            </td>

                            <td>
                              <select
                                value={ticket.status}
                                disabled={updatingId === ticket.id}
                                onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                                className="form-control"
                                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8125rem' }}
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>

                            <td>
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                title="View Details"
                                className="action-btn-inspect"
                              >
                                <Eye size={14} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Priority Breakdown Card */}
              <div className="admin-card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Priority Breakdown
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Ticket urgency distribution
                  </p>
                </div>

                <div className="priority-progress-group">
                  {/* High */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#dc2626' }}>High Priority</span>
                      <span>{stats?.by_priority?.High ?? 0}</span>
                    </div>
                    <div className="priority-progress-bar-bg">
                      <div
                        className="priority-progress-bar-fill high"
                        style={{ width: `${stats?.total ? ((stats.by_priority.High / stats.total) * 100).toFixed(0) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#d97706' }}>Medium Priority</span>
                      <span>{stats?.by_priority?.Medium ?? 0}</span>
                    </div>
                    <div className="priority-progress-bar-bg">
                      <div
                        className="priority-progress-bar-fill medium"
                        style={{ width: `${stats?.total ? ((stats.by_priority.Medium / stats.total) * 100).toFixed(0) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Low */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#0284c7' }}>Low Priority</span>
                      <span>{stats?.by_priority?.Low ?? 0}</span>
                    </div>
                    <div className="priority-progress-bar-bg">
                      <div
                        className="priority-progress-bar-fill low"
                        style={{ width: `${stats?.total ? ((stats.by_priority.Low / stats.total) * 100).toFixed(0) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ticket Details Inspector Modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateSuccess={fetchData}
        />
      </div>
    </DashboardLayout>
  );
}
