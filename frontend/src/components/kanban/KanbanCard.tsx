'use client';

import React from 'react';
import { Ticket } from '../../types';
import { TicketPriorityBadge } from '../ui/TicketBadge';

interface KanbanCardProps {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, ticketId: number) => void;
}

// Extract tag and clean description if user entered [Category: Tag]
export const extractCategoryTag = (description?: string | null): { tag: string; cleanDesc: string } => {
  if (!description) return { tag: 'Support', cleanDesc: '' };

  const match = description.match(/^\[Category:\s*([^\]]+)\]\s*([\s\S]*)/i);
  if (match) {
    return {
      tag: match[1].trim(),
      cleanDesc: match[2].trim(),
    };
  }

  return { tag: 'Support', cleanDesc: description };
};

const getTagClassName = (tag: string): string => {
  const lower = tag.toLowerCase();
  if (lower.includes('bug')) return 'category-bug';
  if (lower.includes('feature')) return 'category-feature';
  if (lower.includes('work')) return 'category-work';
  if (lower.includes('personal')) return 'category-personal';
  if (lower.includes('support')) return 'category-support';
  return 'category-other';
};

const KanbanCard: React.FC<KanbanCardProps> = ({ ticket, onClick, onDragStart }) => {
  const { tag, cleanDesc } = extractCategoryTag(ticket.description);
  const tagClass = getTagClassName(tag);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className="kanban-card"
    >
      {/* Top Tag & Priority */}
      <div className="kanban-card-top">
        <span className={`kanban-card-tag ${tagClass}`}>
          {tag}
        </span>
        <TicketPriorityBadge priority={ticket.priority} />
      </div>

      {/* Title */}
      <h3 className="kanban-card-title">
        {ticket.title}
      </h3>

      {/* Description Snippet */}
      {cleanDesc && (
        <p className="kanban-card-desc">
          {cleanDesc}
        </p>
      )}

      {/* Footer Meta */}
      <div className="kanban-card-footer">
        <span className="kanban-card-id">#{ticket.id}</span>
        <span>{ticket.owner?.name || 'Customer'}</span>
      </div>
    </div>
  );
};

export default KanbanCard;
