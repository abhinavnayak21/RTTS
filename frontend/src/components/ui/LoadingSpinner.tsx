import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '0.75rem',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2
        size={32}
        className="animate-spin"
        style={{ color: 'var(--accent)' }}
      />
      {text && <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
