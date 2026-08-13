import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  alt = 'RTTS Logo',
}) => {
  return (
    <Image
      src="/favicon_512.png"
      alt={alt}
      width={size}
      height={size}
      className={`rtts-logo ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        flexShrink: 0,
      }}
      priority
    />
  );
};

export default Logo;
