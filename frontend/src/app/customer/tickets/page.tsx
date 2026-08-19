'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket as TicketIcon,
  Search,
  PlusCircle,
  RefreshCw,
  Eye,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { TicketStatusBadge, TicketPriorityBadge } from '../../../components/ui/TicketBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../../components/tickets/TicketDetailModal';
import CreateTicketModal from '../../../components/tickets/CreateTicketModal';
import KanbanBoard from '../../../components/kanban/KanbanBoard';
import { Ticket, PaginatedResponse, TicketStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useWebSocket } from '../../../context/WebSocketContext';
import api from '../../../api/axios';
import './tickets.css';

export default function CustomerTicketsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { subscribe, isConnected } = useWebSocket();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
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
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open creation modal automatically if navigated with ?create=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('create') === 'true') {
        setIsCreateModalOpen(true);
        window.history.replaceState({}, '', '/customer/tickets');
      }
    }
  }, []);

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
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [page, statusFilter, debouncedSearch, viewMode, isAuthenticated]);

  // Real-time live synchronization via WebSockets
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.event === 'TICKET_CREATED') {
        const newTicket = event.data as Ticket;
        setTickets((prev) => {
          if (prev.some((t) => t.id === newTicket.id)) return prev;
          return [newTicket, ...prev];
        });
        setTotal((prev) => prev + 1);
      } else if (event.event === 'TICKET_UPDATED') {
        const updated = event.data as Ticket;
        setTickets((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        setSelectedTicket((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
      } else if (event.event === 'TICKET_DELETED') {
        const deletedId = event.data?.id;
        setTickets((prev) => prev.filter((t) => t.id !== deletedId));
        setTotal((prev) => Math.max(0, prev - 1));
        setSelectedTicket((prev) => (prev?.id === deletedId ? null : prev));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

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

  const handleDeleteTicket = async (ticketId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ticket #${ticketId}?`)) {
      return;
    }
    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchTickets();
    } catch (err: any) {
      console.error('Failed to delete ticket:', err);
      alert(err.response?.data?.detail || 'Failed to delete ticket.');
    }
  };

  const totalPages = Math.ceil(total / (viewMode === 'board' ? 50 : 10)) || 1;

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

  if (authLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Checking session..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="tickets-page-container animate-fade-in">
        {/* Responsive Header */}
        <div className="page-header-row">
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: '800', color: 'var(--text-primary)' }}>
              My Support Tickets
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Track tasks, manage resolution status, or drag tickets across the board.
            </p>
          </div>

          <div className="page-header-actions">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
                title="Board View"
              >
                <LayoutGrid size={15} />
                <span>Board</span>
              </button>

              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={15} />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={fetchTickets}
              title="Refresh list"
              className="btn-secondary"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => handleAddNewItem('Open')}
              className="btn-primary"
            >
              <PlusCircle size={18} />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="filter-bar">
          {/* Search */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by title, tag, or description..."
              className="search-input"
            />
          </div>

          {/* Status Tabs (only in table view) */}
          {viewMode === 'table' && (
            <div className="filter-tab-group">
              {['', 'Open', 'In Progress', 'Closed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`filter-tab-btn ${statusFilter === st ? 'active' : ''}`}
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
          <div className="table-card">
            {tickets.length === 0 ? (
              <div className="dashboard-empty-state" style={{ border: 'none' }}>
                <TicketIcon size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <h3 className="dashboard-empty-title">No tickets found</h3>
                <p className="dashboard-empty-desc">You haven't submitted any tickets matching this criteria.</p>
                <button
                  onClick={() => handleAddNewItem('Open')}
                  className="btn-primary"
                >
                  Submit New Ticket
                </button>
              </div>
            ) : (
              <>
                <div className="table-responsive-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>SUBJECT</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>SUBMITTED</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>
                            #{ticket.id}
                          </td>

                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {ticket.title}
                            </div>
                            {ticket.category && (
                              <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                {ticket.category}
                              </span>
                            )}
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
                                <Eye size={14} />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={(e) => handleDeleteTicket(ticket.id, e)}
                                title="Delete ticket"
                                className="action-btn-delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div className="pagination-footer">
                  <div>
                    Showing {tickets.length} of <strong>{total}</strong> tickets (Page {page} of {totalPages})
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Ticket Detail Modal */}
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
}
