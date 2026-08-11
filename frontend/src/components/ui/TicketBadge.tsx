'use client';

import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';
import './ui.css';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const TicketStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-inprogress';
      case 'Closed':
      default:
        return 'status-closed';
    }
  };

  return (
    <span className={`ticket-badge ${getStatusClass()}`}>
      <span className="ticket-badge-dot" />
      <span>{status}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const TicketPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
      default:
        return 'priority-low';
    }
  };

  return (
    <span className={`ticket-badge ${getPriorityClass()}`}>
      <span>{priority}</span>
    </span>
  );
};
