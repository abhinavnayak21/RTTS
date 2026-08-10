import React from 'react';
import { Ticket } from '../../types';

interface KanbanCardProps {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, ticketId: number) => void;
}

// Extract tag and clean description if user entered [Category: Tag]
export const extractCategoryTag = (description?: string | null): { tag: string; cleanDesc: string } => {
  if (!description) return { tag: 'Support', cleanDesc: '' };

  const match = description.match(/^\[Category:\s*([^\]]+)\]\s*(.*)/is);
  if (match) {
    return {
      tag: match[1].trim(),
      cleanDesc: match[2].trim(),
    };
  }

  return { tag: 'Support', cleanDesc: description };
};

const getTagClassName = (tag: string): string => {
  const normalized = tag.toLowerCase();
  if (normalized.includes('work')) return 'kanban-pill tag-work';
  if (normalized.includes('personal')) return 'kanban-pill tag-personal';
  if (normalized.includes('learning')) return 'kanban-pill tag-learning';
  if (normalized.includes('bug')) return 'kanban-pill tag-bug';
  if (normalized.includes('feature')) return 'kanban-pill tag-feature';
  return 'kanban-pill tag-default';
};

const getPriorityDetails = (priority: string) => {
  switch (priority) {
    case 'High':
      return { label: 'High', className: 'kanban-pill priority-high' };
    case 'Medium':
      return { label: 'Medium', className: 'kanban-pill priority-medium' };
    case 'Low':
    default:
      return { label: 'Low', className: 'kanban-pill priority-low' };
  }
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const KanbanCard: React.FC<KanbanCardProps> = ({ ticket, onClick, onDragStart }) => {
  const { tag } = extractCategoryTag(ticket.description);
  const tagClass = getTagClassName(tag);
  const priorityInfo = getPriorityDetails(ticket.priority);

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
    >
      <div className="kanban-card-title-row">
        <svg
          className="kanban-card-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <polyline points="3 6 4 7 3 8" />
          <polyline points="3 12 4 13 3 14" />
          <polyline points="3 18 4 19 3 20" />
        </svg>

        <h3 className="kanban-card-title">{ticket.title}</h3>
      </div>

      <div className="kanban-card-badges">
        <span className={priorityInfo.className}>{priorityInfo.label}</span>
        <span className={tagClass}>{tag}</span>
      </div>

      <div className="kanban-card-date">{formatDate(ticket.created_at)}</div>
    </div>
  );
};

export default KanbanCard;
