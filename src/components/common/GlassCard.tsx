import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-base-100/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden transition-all duration-300 ${noPadding ? '' : 'p-4'} ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
