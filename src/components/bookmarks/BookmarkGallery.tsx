import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ExternalLink, Search, Trash2, Save, Download, Bookmark } from 'lucide-react';
import TurndownService from 'turndown';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  parentId?: string;
}

export type BookmarkViewMode = 'buttons' | 'cards' | 'icons' | 'tables';

interface BookmarkGalleryProps {
  viewMode: BookmarkViewMode;
  iconShape?: 'round' | 'square';
  iconSize?: number;
}

const BookmarkGallery: React.FC<BookmarkGalleryProps> = ({ viewMode, iconShape = 'square', iconSize = 64 }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchBookmarks = useCallback(() => {
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

        // Load custom order if it exists
        chrome.storage.local.get(['bookmarkIconOrder'], (result) => {
          if (result.bookmarkIconOrder && Array.isArray(result.bookmarkIconOrder)) {
            const order: string[] = result.bookmarkIconOrder;
            const sortedList = [...flatList].sort((a, b) => {
              const idxA = order.indexOf(a.id);
              const idxB = order.indexOf(b.id);

              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return a.title.localeCompare(b.title, 'ja');
            });
            setBookmarks(sortedList);
          } else {
            flatList.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
            setBookmarks(flatList);
          }
        });
      });
    } else {
      // Mock data
      const mock = [
        { id: '1', title: 'Apple', url: 'https://apple.com', parentId: 'f1' },
        { id: '2', title: 'Google', url: 'https://google.com', parentId: 'f1' },
        { id: '3', title: 'Yahoo', url: 'https://yahoo.co.jp', parentId: 'f2' },
        { id: '4', title: 'あいうえお銀行 - とても長い名前の銀行口座で、テストのためにわざと長くしています。どこまで表示されるかな？あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ', url: 'https://example.com/very/long/url/path/to/test/truncation/behavior/in/the/table/view/to/ensure/it/does/not/overflow', parentId: 'f3' },
        { id: '5', title: 'SuperLongBookmarkTitleThatShouldDefinitelyBeTruncatedInTheTableViewToPreventAnyHorizontalScrollingIssuesAndKeepTheUICleanWithoutAnySpacesToForceTheIssue', url: 'https://extremely-long-domain-name-that-goes-on-and-on-and-on-without-any-spaces-to-test-word-breaking.example.com/path?query=123&another_long_parameter=abcdefghijklmnopqrstuvwxyz1234567890&extremely_long_parameter_without_spaces_to_test_overflow_behavior_in_browsers_that_struggle_with_this', parentId: 'f3' },
      ];
      mock.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
      setBookmarks(mock);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookmarks, searchQuery]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (viewMode !== 'icons' || !draggedId || draggedId === targetId) return;

    const newBookmarks = [...bookmarks];
    const draggedIndex = newBookmarks.findIndex(b => b.id === draggedId);
    const targetIndex = newBookmarks.findIndex(b => b.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
      newBookmarks.splice(targetIndex, 0, draggedItem);
      setBookmarks(newBookmarks);
    }
  };

  const handleDragEnd = () => {
    if (viewMode === 'icons') {
      const order = bookmarks.map(b => b.id);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ bookmarkIconOrder: order });
      } else {
        localStorage.setItem('bookmarkIconOrder', JSON.stringify(order));
      }
    }
    setDraggedId(null);
  };

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={`Bookmark ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`}
        description={`Browse and manage your bookmarks in ${viewMode} view.`}
        icon={Bookmark}
        action={
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder={`Search ${viewMode}...`}
              className="input input-bordered w-full pl-10 bg-base-100/50 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      <div className="w-full">
        {viewMode === 'buttons' && (
          <GlassCard className="flex flex-wrap gap-3 p-6">
            {filteredBookmarks.map((bookmark: BookmarkItem) => (
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
                    {!isProcessing && <Save size={14} />}
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
          </GlassCard>
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filteredBookmarks.map((bookmark: BookmarkItem) => {
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
                        {isProcessing === bookmark.id ? <span className="loading loading-spinner loading-xs"></span> : <Save size={12} />}
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
          <GlassCard noPadding>
            <table className="table table-zebra w-full table-fixed bg-transparent">
              <thead>
                <tr>
                  <th className="w-12 text-center"></th>
                  <th className="w-[40%]">Title</th>
                  <th className="w-[45%]">URL</th>
                  <th className="w-28 text-right pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookmarks.map((bookmark: BookmarkItem) => {
                  const domain = new URL(bookmark.url).hostname;
                  const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
                  return (
                    <tr key={bookmark.id} className="hover:bg-base-100/50 transition-colors group">
                      <td className="text-center px-2">
                        <div className="avatar">
                          <div className="w-6 h-6 rounded bg-base-300/50 flex items-center justify-center p-0.5">
                            <img src={faviconUrl} alt="favicon" />
                          </div>
                        </div>
                      </td>
                      <td className="font-bold py-3 max-w-0">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate w-full block hover:underline hover:text-primary transition-all font-medium"
                          title={bookmark.title}
                        >
                          {bookmark.title}
                        </a>
                      </td>
                      <td className="text-sm text-base-content/50 py-3 max-w-0">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate w-full block hover:underline hover:text-primary transition-all font-normal"
                          title={bookmark.url}
                        >
                          {bookmark.url}
                        </a>
                      </td>
                      <td className="text-right pr-4 py-3">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            {isProcessing === bookmark.id ? <span className="loading loading-spinner loading-xs"></span> : <Save size={14} />}
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
          </GlassCard>
        )}

        {viewMode === 'icons' && (
          <GlassCard className="flex flex-wrap gap-4 p-6">
            {filteredBookmarks.map((bookmark: BookmarkItem) => {
              const url = new URL(bookmark.url);
              const chromeExtensionId = (typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime.id : '';
              const faviconUrl = `chrome-extension://${chromeExtensionId}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=64`;

              return (
                <div
                  key={bookmark.id}
                  className={`group relative transition-all duration-200 ${draggedId === bookmark.id ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
                  draggable
                  onDragStart={() => handleDragStart(bookmark.id)}
                  onDragOver={(e) => handleDragOver(e, bookmark.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    onClick={() => window.open(bookmark.url, '_blank')}
                    className="tooltip tooltip-bottom"
                    data-tip={bookmark.title}
                  >
                    <button
                      className={`btn btn-ghost p-2 hover:bg-primary/20 hover:text-primary transition-all overflow-hidden border border-base-300 cursor-move shadow-sm`}
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        borderRadius: iconShape === 'round' ? '9999px' : undefined
                      }}
                    >
                      <img
                        src={faviconUrl}
                        alt={bookmark.title}
                        className="w-full h-full object-contain pointer-events-none"
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
          </GlassCard>
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
