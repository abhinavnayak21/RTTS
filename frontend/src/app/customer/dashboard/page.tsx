'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import { TicketStatusBadge, TicketPriorityBadge } from '../../../components/ui/TicketBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../../components/tickets/TicketDetailModal';
import CreateTicketModal from '../../../components/tickets/CreateTicketModal';
import { Ticket, PaginatedResponse } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import './dashboard.css';

export default function CustomerDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, closed: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchCustomerTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Ticket>>('/tickets/', {
        params: { limit: 10, sort_by: 'created_at', order: 'desc' },
      });
      const items = response.data.items || [];
      setTickets(items);

      let open = 0;
      let inProgress = 0;
      let closed = 0;

      items.forEach((t) => {
        if (t.status === 'Open') open++;
        else if (t.status === 'In Progress') inProgress++;
        else if (t.status === 'Closed') closed++;
      });

      setStats({ open, inProgress, closed });
    } catch (err) {
      console.error('Failed to load customer tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ticket #${ticketId}?`)) {
      return;
    }
    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchCustomerTickets();
    } catch (err: any) {
      console.error('Failed to delete ticket:', err);
      alert(err.response?.data?.detail || 'Failed to delete ticket.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerTickets();
    }
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
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
      <div className="customer-dashboard-container animate-fade-in">
        {/* Responsive Header */}
        <div className="page-header-row">
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: '800', color: 'var(--text-primary)' }}>
              Welcome, {user?.name || 'Customer'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Track and manage your support tickets in real-time.
            </p>
          </div>

          <div className="page-header-actions">
            <button
              onClick={fetchCustomerTickets}
              title="Refresh"
              className="btn-secondary"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              <PlusCircle size={18} />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        {loading && tickets.length === 0 ? (
          <LoadingSpinner text="Fetching your support tickets..." />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="stat-cards-grid">
              <StatCard
                title="My Open Tickets"
                value={stats.open}
                icon={AlertCircle}
                color="emerald"
                description="Pending support response"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={Clock}
                color="amber"
                description="Under In progress"
              />
              <StatCard
                title="Resolved Tickets"
                value={stats.closed}
                icon={CheckCircle2}
                color="sky"
                description="Successfully closed"
              />
            </div>

            {/* Recent Tickets Card */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2 className="dashboard-card-title">My Recent Support Tickets</h2>
                  <p className="dashboard-card-subtitle">Track status and updates on your submitted requests</p>
                </div>
                <button
                  onClick={() => router.push('/customer/tickets')}
                  style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="dashboard-empty-state">
                  <div className="dashboard-empty-icon">
                    <TicketIcon size={26} />
                  </div>
                  <h3 className="dashboard-empty-title">No tickets submitted yet</h3>
                  <p className="dashboard-empty-desc">
                    If you're facing any issue or have questions, create a new ticket to get started.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                  >
                    Submit Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>SUBJECT / TITLE</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>SUBMITTED</th>
                        <th>DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {ticket.title}
                            </div>
                          </td>

                          <td>
                            <TicketPriorityBadge priority={ticket.priority} />
                          </td>

                          <td>
                            <TicketStatusBadge status={ticket.status} />
                          </td>

                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            {formatDate(ticket.created_at)}
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="action-btn-inspect"
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>

                              <button
                                onClick={(e) => handleDeleteTicket(ticket.id, e)}
                                title="Delete ticket"
                                className="action-btn-delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Ticket Detail Modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateSuccess={fetchCustomerTickets}
        />

        {/* Create Ticket Modal */}
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCustomerTickets}
        />
      </div>
    </DashboardLayout>
  );
}
