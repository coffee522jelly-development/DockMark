import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, action }) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100/40 backdrop-blur-md p-6 border border-white/10 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-base-content">{title}</h2>
          {description && <p className="text-base-content/70 mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
};

export default PageHeader;
