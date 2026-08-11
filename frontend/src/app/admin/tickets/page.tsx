'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket as TicketIcon,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { TicketStatusBadge, TicketPriorityBadge } from '../../../components/ui/TicketBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TicketDetailModal from '../../../components/tickets/TicketDetailModal';
import { Ticket, PaginatedResponse } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import './admin-tickets.css';

export default function AdminTicketsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'status' | 'title'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState<boolean>(true);
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

  // Debounce search input
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
        limit,
        sort_by: sortBy,
        order,
      };

      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await api.get<PaginatedResponse<Ticket>>('/tickets/', { params });
      setTickets(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      fetchTickets();
    }
  }, [page, statusFilter, priorityFilter, debouncedSearch, sortBy, order, isAuthenticated, user]);

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

  if (authLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Checking session..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-tickets-container animate-fade-in">
        {/* Responsive Header */}
        <div className="page-header-row">
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: '800', color: 'var(--text-primary)' }}>
              All Customer Tickets 📋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Filter, search, inspect, and update all tickets across the platform.
            </p>
          </div>

          <div className="page-header-actions">
            <button
              onClick={fetchTickets}
              title="Refresh list"
              className="btn-secondary"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="filter-bar">
          {/* Search Field */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or description..."
              className="search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="form-control"
              style={{ width: 'auto' }}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="form-control"
              style={{ width: 'auto' }}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-group">
            <label className="filter-select-label">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="form-control"
              style={{ width: 'auto' }}
            >
              <option value="created_at">Date Created</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>

            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              title={`Order: ${order}`}
              className="sort-order-btn"
            >
              {order === 'asc' ? '▲ ASC' : '▼ DESC'}
            </button>
          </div>
        </div>

        {/* Tickets Data Table */}
        <div className="table-card">
          {loading && tickets.length === 0 ? (
            <LoadingSpinner text="Loading tickets..." />
          ) : tickets.length === 0 ? (
            <div className="dashboard-empty-state" style={{ border: 'none' }}>
              <TicketIcon size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <h3 className="dashboard-empty-title">No tickets found</h3>
              <p className="dashboard-empty-desc">Try adjusting your search or status/priority filters.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>SUBJECT</th>
                      <th>CUSTOMER</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
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
                          {ticket.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                              {ticket.description}
                            </div>
                          )}
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
                          <TicketStatusBadge status={ticket.status} />
                        </td>

                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {formatDate(ticket.created_at)}
                        </td>

                        <td>
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="action-btn-inspect"
                          >
                            <Eye size={14} />
                            <span>View / Edit</span>
                          </button>
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="pagination-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateSuccess={fetchTickets}
        />
      </div>
    </DashboardLayout>
  );
}
