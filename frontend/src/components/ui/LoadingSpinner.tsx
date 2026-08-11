'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import './ui.css';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <Loader2
        size={32}
        className="animate-spin"
        style={{ color: 'var(--accent)' }}
      />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
