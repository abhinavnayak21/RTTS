'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Ticket as TicketIcon,
  User,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { TicketStatusBadge, TicketPriorityBadge } from '../ui/TicketBadge';
import { extractCategoryTag } from '../kanban/KanbanCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './modal.css';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const { tag, cleanDesc } = extractCategoryTag(ticket?.category, ticket?.description);

  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'Open');
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority || 'Medium');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
    }
  }, [ticket]);

  if (!ticket || !mounted) return null;

  const handleUpdate = async () => {
    setIsSaving(true);
    setError('');
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status,
        priority: isAdmin ? priority : ticket.priority,
      });
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update ticket:', err);
      setError(err.response?.data?.detail || 'Failed to update ticket.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete Ticket #${ticket.id}?`)) {
      return;
    }
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/tickets/${ticket.id}`);
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete ticket:', err);
      setError(err.response?.data?.detail || 'Failed to delete ticket.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-brand">
            <div className="modal-header-icon">
              <TicketIcon size={20} />
            </div>
            <div>
              <span className="modal-header-ticket-id">TICKET #{ticket.id}</span>
              <h2 className="modal-header-title">{ticket.title}</h2>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Badges & Meta */}
          <div className="modal-meta-row">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            {tag && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                Category: {tag}
              </span>
            )}

            <div className="modal-meta-date">
              <Clock size={14} />
              <span>{formatDate(ticket.created_at)}</span>
            </div>
          </div>

          {/* Customer Profile (Admin View) */}
          {isAdmin && ticket.owner && (
            <div className="modal-user-box">
              <div className="modal-user-avatar">
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Customer: {ticket.owner.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ticket.owner.email}
                </div>
              </div>
            </div>
          )}

          {/* Ticket Description */}
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Description
            </h3>
            <div className="modal-desc-box">
              {cleanDesc || 'No additional description provided.'}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="modal-controls-panel">
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Ticket Actions
            </h3>

            <div className="modal-grid-2col">
              {/* Status Selector */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="form-control"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Selector (Admin only or view) */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                  Priority Level
                </label>
                <select
                  value={priority}
                  disabled={!isAdmin}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="form-control"
                  style={{ opacity: isAdmin ? 1 : 0.7 }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {/* Left Action: Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="modal-delete-btn"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Ticket'}</span>
          </button>

          {/* Right Actions: Close & Save */}
          <div className="modal-footer-right">
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel-btn"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSaving}
              className="modal-save-btn"
            >
              <CheckCircle2 size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TicketDetailModal;
