import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-base-100/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden transition-all duration-300 ${noPadding ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
