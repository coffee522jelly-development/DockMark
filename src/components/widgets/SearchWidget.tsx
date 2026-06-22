import React, { useState } from 'react';
import { Search } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const SearchWidget: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  return (
    <GlassCard className="aspect-square">
      <div className="flex flex-col h-full justify-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Search size={20} />
          </div>
          <h3 className="font-bold text-lg text-base-content">{t.widgets.search.title}</h3>
        </div>
        <form onSubmit={handleSearch} className="form-control">
          <div className="relative group">
            <input
              type="text"
              placeholder={t.widgets.search.placeholder}
              className="input input-bordered w-full pr-12 bg-base-100/50 border-white/10 focus:border-primary/50 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm btn-square"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-base-content/40 mt-4 text-center">{t.widgets.search.help}</p>
      </div>
    </GlassCard>
  );
};

export default SearchWidget;
