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
          bg: 'rgba(34, 197, 94, 0.15)',
          color: '#2ba658',
          dot: '#22c55e',
          glow: '0 0 8px 2px rgba(34, 197, 94, 0.6)',
        };
      case 'In Progress':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          color: '#b45309',
          dot: '#eab308',
          glow: '0 0 8px 2px rgba(234, 179, 8, 0.6)',
        };
      case 'Closed':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          color: '#7b899a',
          dot: '#94a3b8',
          glow: '0 0 8px 2px rgba(148, 163, 184, 0.6)',
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
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8125rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: 'none',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: style.dot,
          boxShadow: style.glow,
          display: 'inline-block',
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
          bg: 'rgba(239, 68, 68, 0.16)',
          color: '#f87171',
          label: 'High 🔥',
        };
      case 'Medium':
        return {
          bg: 'rgba(245, 158, 11, 0.16)',
          color: '#fbbf24',
          label: 'Medium ⏳',
        };
      case 'Low':
      default:
        return {
          bg: 'rgba(56, 189, 248, 0.16)',
          color: '#38bdf8',
          label: 'Low 💤',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '0.8125rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: 'none',
      }}
    >
      {style.label}
    </span>
  );
};
