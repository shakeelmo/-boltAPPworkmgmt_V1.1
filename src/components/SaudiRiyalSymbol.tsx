import React from 'react';

interface SaudiRiyalSymbolProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  showLabel?: boolean;
}

export const SaudiRiyalSymbol: React.FC<SaudiRiyalSymbolProps> = ({
  className = '',
  size = 'md',
  color = 'currentColor',
  showLabel = false
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} style={{ color }}>
      <svg 
        className={`${sizeClasses[size]}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color }}
      >
        <path d="M4 6h2v12H4V6zm14 0h2v12h-2V6zM4 10h16v4H4v-4z"/>
        <path d="M18 8h2v8h-2V8z"/>
      </svg>
      {showLabel && <span>SAR</span>}
    </span>
  );
};

export default SaudiRiyalSymbol;
