import React, { useEffect, useState } from 'react';
import { Bookmark, RefreshCw } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const BookmarksWidget: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      // Get the bookmark bar (usually ID '1')
      chrome.bookmarks.getChildren('1', (children) => {
        // Filter only bookmarks (not folders) and limit to 12
        const items = children
          .filter(child => child.url)
          .slice(0, 12);
        setBookmarks(items);
        setLoading(false);
      });
    } else {
      // Mock data for development
      setTimeout(() => {
        setBookmarks([
          { id: '1', title: 'Google', url: 'https://google.com' },
          { id: '2', title: 'GitHub', url: 'https://github.com' },
          { id: '3', title: 'YouTube', url: 'https://youtube.com' },
          { id: '4', title: 'Tailwind', url: 'https://tailwindcss.com' },
        ] as any);
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <GlassCard className="h-80 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-sm flex items-center gap-2 text-base-content">
            <Bookmark size={16} className="text-primary" />
            Bookmarks
          </h2>
          <button
            onClick={fetchBookmarks}
            className="btn btn-ghost btn-xs btn-circle hover:bg-base-100/50"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scrollbar">
            {bookmarks.map((bm) => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group transition-transform hover:scale-110"
                title={bm.title}
              >
                <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center p-2 group-hover:bg-primary/10 transition-colors shadow-sm border border-base-300">
                  <img
                    src={getFavicon(bm.url || '')}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
                    }}
                  />
                </div>
                <span className="text-[10px] truncate w-full text-center opacity-70 group-hover:opacity-100 group-hover:text-primary font-medium">
                  {bm.title}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
            <Bookmark size={32} className="mb-2" />
            <p className="text-xs">No bookmarks in Bookmark Bar.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default BookmarksWidget;
