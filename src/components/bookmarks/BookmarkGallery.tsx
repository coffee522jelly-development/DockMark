import React, { useEffect, useState } from 'react';
import { ExternalLink, Search, Trash2, FileText, Download } from 'lucide-react';
import TurndownService from 'turndown';

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
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchBookmarks = () => {
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
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.remove(id, () => {
          fetchBookmarks();
        });
      } else {
        setBookmarks(prev => prev.filter(b => b.id !== id));
      }
    }
  };

  const handleDownloadMarkdown = async (bookmark: BookmarkItem) => {
    setIsProcessing(bookmark.id);
    try {
      const response = await fetch(bookmark.url);
      const html = await response.text();

      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });

      // Basic cleanup to get better markdown
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Remove scripts, styles, etc.
      const toRemove = doc.querySelectorAll('script, style, noscript, iframe, header, footer, nav');
      toRemove.forEach(el => el.remove());

      const markdown = turndownService.turndown(doc.body.innerHTML);
      const finalMarkdown = `# ${bookmark.title}\n\nSource: [${bookmark.url}](${bookmark.url})\n\n---\n\n${markdown}`;

      const blob = new Blob([finalMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookmark.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save as markdown:', error);
      alert('Failed to fetch content. This might be due to CORS restrictions or the site being offline.');
    } finally {
      setIsProcessing(null);
    }
  };

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
              <div key={bookmark.id} className="group relative">
                <button
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className={`btn btn-outline ${getFolderColor(bookmark.parentId)} normal-case font-medium pr-16 group-hover:shadow-md transition-all text-left block h-auto py-2 min-h-[2.5rem]`}
                >
                  <span className="truncate max-w-[150px] block">{bookmark.title}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadMarkdown(bookmark); }}
                    className={`btn btn-ghost btn-xs btn-circle ${isProcessing === bookmark.id ? 'loading loading-spinner' : ''}`}
                    title="Save as Markdown"
                  >
                    {!isProcessing && <FileText size={14} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(bookmark.id); }}
                    className="btn btn-ghost btn-xs btn-circle text-error"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
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
                  <div className="card-body p-4 relative">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadMarkdown(bookmark); }}
                        className="btn btn-circle btn-xs btn-ghost bg-base-100 shadow-sm"
                        title="Save as Markdown"
                      >
                        {isProcessing === bookmark.id ? <span className="loading loading-spinner loading-xs"></span> : <FileText size={12} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(bookmark.id); }}
                        className="btn btn-circle btn-xs btn-ghost bg-base-100 shadow-sm text-error"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
                  <th className="w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookmarks.map((bookmark) => {
                  const domain = new URL(bookmark.url).hostname;
                  const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
                  return (
                    <tr key={bookmark.id} className="hover:bg-base-200 transition-colors group">
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
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => window.open(bookmark.url, '_blank')}
                            className="btn btn-ghost btn-xs btn-circle text-primary"
                            title="Open"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadMarkdown(bookmark)}
                            className="btn btn-ghost btn-xs btn-circle"
                            title="Save as Markdown"
                          >
                            {isProcessing === bookmark.id ? <span className="loading loading-spinner loading-xs"></span> : <FileText size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(bookmark.id)}
                            className="btn btn-ghost btn-xs btn-circle text-error"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
              const chromeExtensionId = (typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime.id : '';
              const faviconUrl = `chrome-extension://${chromeExtensionId}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=64`;

              return (
                <div key={bookmark.id} className="group relative">
                  <div
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
                          (e.target as HTMLImageElement).src = `https://s2.googleusercontent.com/s2/favicons?domain=${url.hostname}&sz=64`;
                        }}
                      />
                    </button>
                  </div>
                  <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadMarkdown(bookmark); }}
                      className="btn btn-circle btn-[10px] h-5 w-5 min-h-0 btn-ghost bg-base-100 shadow-md border border-base-300"
                      title="Markdown"
                    >
                      {isProcessing === bookmark.id ? <span className="loading loading-spinner w-3 h-3"></span> : <Download size={10} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(bookmark.id); }}
                      className="btn btn-circle btn-[10px] h-5 w-5 min-h-0 btn-ghost bg-base-100 shadow-md border border-base-300 text-error"
                      title="Delete"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
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
