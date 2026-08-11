'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ui.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky';
  trend?: {
    isUp: boolean;
    text: string;
  };
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  description,
}) => {
  return (
    <div className="stat-card">
      {Icon && (
        <div className={`stat-card-icon-box ${color}`}>
          <Icon size={24} />
        </div>
      )}

      <div className="stat-card-info">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-value">{value}</div>
        {description && <span className="stat-card-desc">{description}</span>}
      </div>
    </div>
  );
};

export default StatCard;
