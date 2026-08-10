import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Search,
  PlusCircle,
  RefreshCw,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/ui/TicketBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../components/tickets/TicketDetailModal';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { Ticket, PaginatedResponse, TicketStatus } from '../../types';
import api from '../../api/axios';

const CustomerTicketsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Quick ticket creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<TicketStatus>('Open');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: viewMode === 'board' ? 50 : 10,
        sort_by: 'created_at',
        order: 'desc',
      };

      if (statusFilter && viewMode === 'table') params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await api.get<PaginatedResponse<Ticket>>('/tickets/', { params });
      setTickets(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch customer tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, debouncedSearch, viewMode]);

  const handleStatusChange = async (ticketId: number, newStatus: TicketStatus) => {
    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      fetchTickets();
    }
  };

  const handleAddNewItem = (status: TicketStatus) => {
    setCreateModalStatus(status);
    setIsCreateModalOpen(true);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              My Support Tickets
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '2px' }}>
              Track tasks, manage resolution status, or drag tickets across the board.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Mode Toggle */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
              }}
            >
              <button
                onClick={() => setViewMode('board')}
                title="Board View"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: viewMode === 'board' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'board' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutGrid size={15} />
                <span>Board</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <List size={15} />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={fetchTickets}
              title="Refresh list"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.875rem',
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
              onClick={() => handleAddNewItem('Open')}
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
              <span>Submit Ticket</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by title, tag, or description..."
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Tabs (only in table view) */}
          {viewMode === 'table' && (
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {['', 'Open', 'In Progress', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    border: statusFilter === st ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                    backgroundColor: statusFilter === st ? 'var(--accent-light)' : 'var(--bg-base)',
                    color: statusFilter === st ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {st === '' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content View */}
        {loading && tickets.length === 0 ? (
          <LoadingSpinner text="Loading tickets..." />
        ) : viewMode === 'board' ? (
          /* Kanban Board View */
          <KanbanBoard
            tickets={tickets}
            onTicketClick={(ticket) => setSelectedTicket(ticket)}
            onStatusChange={handleStatusChange}
            onAddNewItem={handleAddNewItem}
          />
        ) : (
          /* Table View */
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            {tickets.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  color: 'var(--text-muted)',
                }}
              >
                <TicketIcon size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  No tickets found
                </h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  You haven't submitted any tickets matching this criteria.
                </p>
                <button
                  onClick={() => handleAddNewItem('Open')}
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
                  Submit New Ticket
                </button>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', textAlign: 'left' }}>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          ID
                        </th>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          SUBJECT
                        </th>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          PRIORITY
                        </th>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          STATUS
                        </th>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          SUBMITTED
                        </th>
                        <th style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem' }}>
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          style={{ borderBottom: '1px solid var(--border-light)', transition: 'background var(--transition-fast)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                            #{ticket.id}
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {ticket.title}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <TicketPriorityBadge priority={ticket.priority} />
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <TicketStatusBadge status={ticket.status} />
                          </td>

                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            {formatDate(ticket.created_at)}
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              style={{
                                padding: '6px 12px',
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
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div>
                    Showing {tickets.length} of <strong>{total}</strong> tickets (Page {page} of {totalPages})
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-surface)',
                        color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Previous
                    </button>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-surface)',
                        color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Ticket Detail Inspection Modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateSuccess={fetchTickets}
        />

        {/* In-Place Ticket Creation Modal */}
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          initialStatus={createModalStatus}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchTickets}
        />
      </div>
    </DashboardLayout>
  );
};

export default CustomerTicketsPage;
