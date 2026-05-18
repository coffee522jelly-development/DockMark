import React, { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  parentId?: string;
}

export type BookmarkViewMode = 'buttons' | 'cards' | 'icons' | 'tables';

interface BookmarkGalleryProps {
  viewMode: BookmarkViewMode;
}

const BookmarkGallery: React.FC<BookmarkGalleryProps> = ({ viewMode }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkItem[] => {
      let flat: BookmarkItem[] = [];
      for (const node of nodes) {
        if (node.url) {
          flat.push({
            id: node.id,
            title: node.title || node.url,
            url: node.url,
            parentId: node.parentId
          });
        }
        if (node.children) {
          flat = [...flat, ...flattenBookmarks(node.children)];
        }
      }
      return flat;
    };

    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.getTree((tree) => {
        const flatList = flattenBookmarks(tree);
        // Sort by title (ABC / あいうえお order)
        flatList.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
        setBookmarks(flatList);
      });
    } else {
      // Mock data
      const mock = [
        { id: '1', title: 'Apple', url: 'https://apple.com', parentId: 'f1' },
        { id: '2', title: 'Google', url: 'https://google.com', parentId: 'f1' },
        { id: '3', title: 'Yahoo', url: 'https://yahoo.co.jp', parentId: 'f2' },
        { id: '4', title: 'あいうえお銀行', url: 'https://example.com', parentId: 'f3' },
        { id: '5', title: 'かきくけこ通販', url: 'https://example.com', parentId: 'f3' },
      ];
      mock.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
      setBookmarks(mock);
    }
  }, []);

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFolderColor = (parentId?: string) => {
    if (!parentId) return 'btn-primary';

    const colors = [
      'btn-primary',
      'btn-secondary',
      'btn-accent',
      'btn-info',
      'btn-success',
      'btn-warning',
      'btn-error',
    ];

    // Simple hash function for the parentId string
    let hash = 0;
    for (let i = 0; i < parentId.length; i++) {
      hash = parentId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-base-content whitespace-nowrap capitalize">Bookmark {viewMode}</h2>
        </div>

        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            className="input input-bordered w-full pl-10 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full">
        {viewMode === 'buttons' && (
          <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filteredBookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => window.open(bookmark.url, '_blank')}
                className={`btn btn-outline ${getFolderColor(bookmark.parentId)} normal-case font-medium gap-2 group hover:shadow-md transition-all`}
              >
                <span className="truncate max-w-[150px]">{bookmark.title}</span>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filteredBookmarks.map((bookmark) => {
              const domain = new URL(bookmark.url).hostname;
              return (
                <div
                  key={bookmark.id}
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                >
                  <figure className="aspect-video bg-base-200 relative">
                    <img
                      src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(bookmark.url)}?w=400`}
                      alt={bookmark.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </figure>
                  <div className="card-body p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
                        <img
                          src={`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`}
                          alt="favicon"
                          className="w-5 h-5"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="card-title text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {bookmark.title}
                        </h3>
                        <p className="text-xs text-base-content/50 truncate">
                          {domain}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'tables' && (
          <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="w-16 text-center">Icon</th>
                  <th>Title</th>
                  <th>URL</th>
                  <th className="w-20 text-center">Open</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookmarks.map((bookmark) => {
                  const domain = new URL(bookmark.url).hostname;
                  const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
                  return (
                    <tr key={bookmark.id} className="hover:bg-base-200 transition-colors">
                      <td className="text-center">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center p-1">
                            <img src={faviconUrl} alt="favicon" />
                          </div>
                        </div>
                      </td>
                      <td className="font-bold">{bookmark.title}</td>
                      <td className="text-sm text-base-content/50 truncate max-w-xs">{bookmark.url}</td>
                      <td className="text-center">
                        <button
                          onClick={() => window.open(bookmark.url, '_blank')}
                          className="btn btn-ghost btn-sm btn-circle text-primary"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'icons' && (
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filteredBookmarks.map((bookmark) => {
              const url = new URL(bookmark.url);
              // Construct chrome-extension://_favicon/ URL
              const chromeExtensionId = (typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime.id : '';
              const faviconUrl = `chrome-extension://${chromeExtensionId}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=64`;

              return (
                <div
                  key={bookmark.id}
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="tooltip tooltip-bottom"
                  data-tip={bookmark.title}
                >
                  <button className="btn btn-ghost btn-circle p-2 hover:bg-primary/20 hover:text-primary transition-all overflow-hidden border border-base-300">
                    <img
                      src={faviconUrl}
                      alt={bookmark.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to Google S2 if chrome-extension favicon fails (e.g. in dev)
                        (e.target as HTMLImageElement).src = `https://s2.googleusercontent.com/s2/favicons?domain=${url.hostname}&sz=64`;
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {filteredBookmarks.length === 0 && (
          <div className="w-full text-center py-20 text-base-content/40">
            No matching bookmarks found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkGallery;
