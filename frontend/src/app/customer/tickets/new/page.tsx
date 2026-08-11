'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, Ticket } from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { TicketPriority } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import api from '../../../../api/axios';
import './new-ticket.css';

export default function NewTicketPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/tickets/', {
        title,
        description,
        priority,
      });

      router.push('/customer/dashboard');
    } catch (err: any) {
      console.error('Failed to submit ticket:', err);
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="new-ticket-container animate-fade-in">
        <button
          type="button"
          onClick={() => router.push('/customer/dashboard')}
          className="back-link-btn"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        <div className="new-ticket-card">
          <div className="new-ticket-header">
            <div className="new-ticket-icon-box">
              <Ticket size={22} />
            </div>
            <div>
              <h1 className="new-ticket-title">Create Support Ticket</h1>
              <p className="new-ticket-subtitle">
                Please provide details so our admin team can assist you quickly.
              </p>
            </div>
          </div>

          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="new-ticket-form">
            <div className="form-group">
              <label className="form-label">Ticket Title / Subject *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cannot access billing dashboard"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="form-control"
              >
                <option value="Low">Low - General inquiry or minor question</option>
                <option value="Medium">Medium - Normal issue affecting workflow</option>
                <option value="High">High - Urgent issue / system feature broken</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, error messages, and reproduction steps..."
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={() => router.push('/customer/dashboard')}
                className="modal-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-save-btn"
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
