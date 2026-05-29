import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchWidget: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 h-80">
      <div className="card-body justify-center">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-primary" />
          Quick Search
        </h3>
        <form onSubmit={handleSearch} className="form-control">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Google..."
              className="input input-bordered flex-1 bg-base-200 focus:bg-base-100 border-base-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-square">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchWidget;
