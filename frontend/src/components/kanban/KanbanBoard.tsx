'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { Ticket, TicketStatus } from '../../types';
import './kanban.css';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void;
  onAddNewItem: (status: TicketStatus) => void;
}

interface ColumnMeta {
  status: TicketStatus;
  label: string;
  badgeClass: string;
  icon: any;
}

const COLUMNS: ColumnMeta[] = [
  {
    status: 'Open',
    label: 'Open',
    badgeClass: 'open',
    icon: AlertCircle,
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    badgeClass: 'inprogress',
    icon: Clock,
  },
  {
    status: 'Closed',
    label: 'Done',
    badgeClass: 'closed',
    icon: CheckCircle2,
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
  onAddNewItem,
}) => {
  const [draggedOverCol, setDraggedOverCol] = useState<TicketStatus | null>(null);
  const [selectedMobileTab, setSelectedMobileTab] = useState<string>('all');

  const handleDragStart = (e: React.DragEvent, ticketId: number) => {
    e.dataTransfer.setData('text/plain', ticketId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverCol !== status) {
      setDraggedOverCol(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TicketStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const ticketIdStr = e.dataTransfer.getData('text/plain');
    if (!ticketIdStr) return;

    const ticketId = parseInt(ticketIdStr, 10);
    if (!isNaN(ticketId)) {
      onStatusChange(ticketId, newStatus);
    }
  };

  // Filter columns on mobile if a specific tab is chosen
  const visibleColumns = COLUMNS.filter((col) => {
    if (selectedMobileTab === 'all') return true;
    return col.status === selectedMobileTab;
  });

  return (
    <div className="kanban-board-wrapper">
      {/* Mobile Segmented Column Switcher Tabs */}
      <div className="kanban-mobile-tabs">
        <button
          type="button"
          className={`kanban-tab-btn ${selectedMobileTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedMobileTab('all')}
        >
          <LayoutGrid size={14} />
          <span>All</span>
          <span className="kanban-tab-count">{tickets.length}</span>
        </button>

        {COLUMNS.map((col) => {
          const colTicketsCount = tickets.filter((t) => t.status === col.status).length;
          const isActive = selectedMobileTab === col.status;

          return (
            <button
              key={col.status}
              type="button"
              className={`kanban-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedMobileTab(col.status)}
            >
              <span>{col.label}</span>
              <span className="kanban-tab-count">{colTicketsCount}</span>
            </button>
          );
        })}
      </div>

      {/* Board Columns Grid */}
      <div className="kanban-board-grid">
        {visibleColumns.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.status);
          const isOver = draggedOverCol === col.status;
          const Icon = col.icon;

          return (
            <div
              key={col.status}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="kanban-column-status">
                  <div className={`kanban-status-badge ${col.badgeClass}`}>
                    <Icon size={14} />
                    <span>{col.label}</span>
                  </div>
                  <span className="kanban-tab-count">{colTickets.length}</span>
                </div>

                <button
                  onClick={() => onAddNewItem(col.status)}
                  title={`Add ticket to ${col.label}`}
                  className="kanban-add-btn"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Card List Drop Area */}
              <div className="kanban-cards-list">
                {colTickets.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <span>No {col.label.toLowerCase()} tickets</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      Drag tickets here to update
                    </span>
                  </div>
                ) : (
                  colTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => onTicketClick(ticket)}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
