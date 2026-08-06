import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const TicketStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Open':
        return {
          bg: 'var(--status-open-bg)',
          color: 'var(--status-open-fg)',
          border: 'var(--status-open-border)',
          dot: '#10b981',
        };
      case 'In Progress':
        return {
          bg: 'var(--status-inprogress-bg)',
          color: 'var(--status-inprogress-fg)',
          border: 'var(--status-inprogress-border)',
          dot: '#f59e0b',
        };
      case 'Closed':
      default:
        return {
          bg: 'var(--status-closed-bg)',
          color: 'var(--status-closed-fg)',
          border: 'var(--status-closed-border)',
          dot: '#64748b',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.dot,
        }}
      />
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const TicketPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'High':
        return {
          bg: 'var(--priority-high-bg)',
          color: 'var(--priority-high-fg)',
          border: 'var(--priority-high-border)',
        };
      case 'Medium':
        return {
          bg: 'var(--priority-medium-bg)',
          color: 'var(--priority-medium-fg)',
          border: 'var(--priority-medium-border)',
        };
      case 'Low':
      default:
        return {
          bg: 'var(--priority-low-bg)',
          color: 'var(--priority-low-fg)',
          border: 'var(--priority-low-border)',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {priority} Priority
    </span>
  );
};
