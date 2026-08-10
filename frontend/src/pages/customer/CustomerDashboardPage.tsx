import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/ui/TicketBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../components/tickets/TicketDetailModal';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import { Ticket, PaginatedResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, closed: 0 });

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
    fetchCustomerTickets();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome, {user?.name || 'Customer'}!
            </h1>
            {/* <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '2px' }}>
              How can we assist you today? Track and manage your support tickets below.
            </p> */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={fetchCustomerTickets}
              title="Refresh"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={18} />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>

        {loading && tickets.length === 0 ? (
          <LoadingSpinner text="Fetching your support tickets..." />
        ) : (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
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

            {/* Recent Tickets */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    My Recent Support Tickets
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Track status and updates on your submitted requests
                  </p>
                </div>
                <button
                  onClick={() => navigate('/customer/tickets')}
                  style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              {tickets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3.5rem 1rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-base)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <TicketIcon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    No tickets submitted yet
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto 1.25rem' }}>
                    If you're facing any issue or have questions, create a new ticket to get started.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Submit Your First Ticket
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          SUBJECT / TITLE
                        </th>
                        <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          PRIORITY
                        </th>
                        <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          STATUS
                        </th>
                        <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          SUBMITTED
                        </th>
                        <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          DETAILS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {ticket.title}
                            </div>
                          </td>

                          <td style={{ padding: '1rem 0.5rem' }}>
                            <TicketPriorityBadge priority={ticket.priority} />
                          </td>

                          <td style={{ padding: '1rem 0.5rem' }}>
                            <TicketStatusBadge status={ticket.status} />
                          </td>

                          <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            {formatDate(ticket.created_at)}
                          </td>

                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--accent-light)',
                                  color: 'var(--accent)',
                                  border: '1px solid #c7d2fe',
                                  fontWeight: '600',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>

                              <button
                                onClick={(e) => handleDeleteTicket(ticket.id, e)}
                                title="Delete ticket"
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  fontWeight: '600',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                }}
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
};

export default CustomerDashboardPage;
