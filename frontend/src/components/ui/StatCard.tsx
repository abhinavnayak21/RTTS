import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'indigo' | 'emerald' | 'green' | 'amber' | 'yellow' | 'sky' | 'blue' | 'rose' | 'red';
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
  trend,
  description,
}) => {
  const getColorStyle = () => {
    switch (color) {
      case 'emerald':
      case 'green':
        return {
          bg: '#ecfdf5',
          color: '#059669',
          border: '#a7f3d0',
        };
      case 'amber':
      case 'yellow':
        return {
          bg: '#fffbeb',
          color: '#d97706',
          border: '#fde68a',
        };
      case 'sky':
      case 'blue':
        return {
          bg: '#f0f9ff',
          color: '#0284c7',
          border: '#bae6fd',
        };
      case 'rose':
      case 'red':
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          border: '#fecaca',
        };
      case 'indigo':
      default:
        return {
          bg: '#eef2ff',
          color: '#4f46e5',
          border: '#c7d2fe',
        };
    }
  };

  const style = getColorStyle();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: style.bg,
              color: style.color,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>

        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: trend.isUp ? '#059669' : '#dc2626',
              backgroundColor: trend.isUp ? '#ecfdf5' : '#fef2f2',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {trend.isUp ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>

      {description && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.375rem',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;
