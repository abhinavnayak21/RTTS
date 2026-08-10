import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { Ticket, TicketStatus } from '../../types';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void;
  onAddNewItem: (status: TicketStatus) => void;
}

interface ColumnMeta {
  status: TicketStatus;
  label: string;
  pillClass: string;
  dotClass: string;
}

const COLUMNS: ColumnMeta[] = [
  {
    status: 'Open',
    label: 'Open',
    pillClass: 'kanban-status-pill open',
    dotClass: 'kanban-status-dot open',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    pillClass: 'kanban-status-pill in-progress',
    dotClass: 'kanban-status-dot in-progress',
  },
  {
    status: 'Closed',
    label: 'Done',
    pillClass: 'kanban-status-pill closed',
    dotClass: 'kanban-status-dot closed',
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
  onAddNewItem,
}) => {
  const [draggedTicketId, setDraggedTicketId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: number) => {
    e.dataTransfer.setData('text/plain', ticketId.toString());
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: TicketStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const ticketIdStr =
      e.dataTransfer.getData('text/plain') || (draggedTicketId ? draggedTicketId.toString() : '');
    const ticketId = parseInt(ticketIdStr, 10);

    if (ticketId && !isNaN(ticketId)) {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket && ticket.status !== targetStatus) {
        onStatusChange(ticketId, targetStatus);
      }
    }
    setDraggedTicketId(null);
  };

  return (
    <div className="kanban-grid">
      {COLUMNS.map((col) => {
        const columnTickets = tickets.filter((t) => t.status === col.status);
        const isDragOver = dragOverColumn === col.status;

        return (
          <section
            key={col.status}
            className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            {/* Column Header */}
            <div className="kanban-col-header">
              <div className={col.pillClass}>
                <span className={col.dotClass} />
                <span>{col.label}</span>
              </div>

              <span className="kanban-count-badge">{columnTickets.length}</span>
            </div>

            {/* Cards List */}
            <div className="kanban-cards-list">
              {columnTickets.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => onTicketClick(ticket)}
                  onDragStart={handleDragStart}
                />
              ))}

              {columnTickets.length === 0 && (
                <div className="kanban-empty-col">
                  <span>No tickets in {col.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    Drag items here or click "+ New item"
                  </span>
                </div>
              )}
            </div>

            {/* Add New Item Button */}
            <button
              type="button"
              className="kanban-add-btn"
              onClick={() => onAddNewItem(col.status)}
            >
              <Plus size={16} />
              <span>+ New item</span>
            </button>
          </section>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
