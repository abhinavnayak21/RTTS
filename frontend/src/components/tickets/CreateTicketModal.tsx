'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, AlertCircle, Ticket } from 'lucide-react';
import { TicketPriority, TicketStatus } from '../../types';
import api from '../../api/axios';
import './modal.css';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStatus?: TicketStatus;
}

const CATEGORY_TAGS = ['Support', 'Bug', 'Feature', 'Work', 'Personal', 'Other'];

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStatus = 'Open',
}) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [selectedTag, setSelectedTag] = useState<string>('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/tickets/', {
        title,
        description: description.trim() || null,
        priority,
        category: selectedTag,
      });

      if (initialStatus && initialStatus !== 'Open' && res.data?.id) {
        try {
          await api.put(`/tickets/${res.data.id}`, { status: initialStatus });
        } catch {
          // Status update fallback
        }
      }

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setSelectedTag('Work');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      setError(
        err.response?.data?.detail || 'Failed to create ticket. Please check fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-brand">
            <div className="modal-header-icon">
              <Ticket size={20} />
            </div>
            <div>
              <h2 className="modal-header-title">Create Ticket</h2>
              <span className="modal-header-ticket-id">
                {initialStatus ? `Status: ${initialStatus}` : 'New Ticket Request'}
              </span>
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
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Ticket Title / Subject *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Graphic Design Trends 2026"
                className="form-control"
              />
            </div>

            {/* Priority & Tag Selection */}
            <div className="modal-grid-2col">
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="form-control"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tag / Category</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="form-control"
                >
                  {CATEGORY_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add extra context, details, or steps..."
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Footer Actions */}
            <div className="modal-footer-right" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="modal-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-save-btn"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Creating...' : 'Create Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateTicketModal;
