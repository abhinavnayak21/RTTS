import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/ui/TicketBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../components/tickets/TicketDetailModal';
import { Ticket, AdminStats, PaginatedResponse, TicketStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get<AdminStats>('/admin/stats');
      setStats(statsRes.data);

      const ticketsRes = await api.get<PaginatedResponse<Ticket>>('/tickets/', {
        params: { limit: 5, sort_by: 'created_at', order: 'desc' },
      });
      setRecentTickets(ticketsRes.data.items || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <DashboardLayout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Admin Support Dashboard 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '2px' }}>
              Overview and management of all customer submitted support tickets.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={fetchData}
              title="Refresh Dashboard Data"
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
                boxShadow: 'var(--shadow-xs)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => navigate('/admin/tickets')}
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '1.25rem',
              }}
            >
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1.5rem',
                alignItems: 'start',
              }}
            >
              {/* Recent Customer Tickets Table Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Recent Customer Tickets
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Manage status updates for customer inquiries
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/tickets')}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    View All →
                  </button>
                </div>

                {recentTickets.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <TicketIcon size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: '500' }}>No customer tickets submitted yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem',
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            textAlign: 'left',
                          }}
                        >
                          <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                            TICKET
                          </th>
                          <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                            CUSTOMER
                          </th>
                          <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                            PRIORITY
                          </th>
                          <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                            STATUS & ACTION
                          </th>
                          <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            style={{
                              borderBottom: '1px solid var(--border-light)',
                              transition: 'background var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                {ticket.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                #{ticket.id} • {formatDate(ticket.created_at)}
                              </div>
                            </td>

                            <td style={{ padding: '1rem 0.5rem' }}>
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

                            <td style={{ padding: '1rem 0.5rem' }}>
                              <TicketPriorityBadge priority={ticket.priority} />
                            </td>

                            <td style={{ padding: '1rem 0.5rem' }}>
                              <select
                                value={ticket.status}
                                disabled={updatingId === ticket.id}
                                onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-surface)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.8125rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>

                            <td style={{ padding: '1rem 0.5rem' }}>
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                title="View Details"
                                style={{
                                  padding: '6px 10px',
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
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Priority Breakdown
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Customer ticket distribution by urgency
                </p>

                {(() => {
                  const total = stats?.total || 1;
                  const high = stats?.by_priority?.High || 0;
                  const med = stats?.by_priority?.Medium || 0;
                  const low = stats?.by_priority?.Low || 0;

                  const highPct = Math.round((high / total) * 100) || 0;
                  const medPct = Math.round((med / total) * 100) || 0;
                  const lowPct = Math.round((low / total) * 100) || 0;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* High Priority */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                          <span style={{ color: '#dc2626' }}>High Priority</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{high} ({highPct}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${highPct}%`, height: '100%', backgroundColor: '#dc2626', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>

                      {/* Medium Priority */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                          <span style={{ color: '#d97706' }}>Medium Priority</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{med} ({medPct}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${medPct}%`, height: '100%', backgroundColor: '#d97706', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>

                      {/* Low Priority */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                          <span style={{ color: '#0284c7' }}>Low Priority</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{low} ({lowPct}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${lowPct}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div
                  style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-light)',
                    border: '1px solid #c7d2fe',
                    color: 'var(--accent)',
                    fontSize: '0.8125rem',
                    lineHeight: '1.5',
                  }}
                >
                  <strong>Admin Role Scope:</strong> Managing customer-submitted tickets. Update statuses, priorities, or delete invalid tickets.
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ticket Detail Modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateSuccess={fetchData}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
