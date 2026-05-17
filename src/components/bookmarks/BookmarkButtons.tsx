import React, { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
}

const BookmarkButtons: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkItem[] => {
      let flat: BookmarkItem[] = [];
      for (const node of nodes) {
        if (node.url) {
          flat.push({ id: node.id, title: node.title || node.url, url: node.url });
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
        { id: '1', title: 'Apple', url: 'https://apple.com' },
        { id: '2', title: 'Google', url: 'https://google.com' },
        { id: '3', title: 'Yahoo', url: 'https://yahoo.co.jp' },
        { id: '4', title: 'あいうえお銀行', url: 'https://example.com' },
        { id: '5', title: 'かきくけこ通販', url: 'https://example.com' },
      ];
      mock.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
      setBookmarks(mock);
    }
  }, []);

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300">
        <h2 className="text-2xl font-bold text-base-content">Bookmark Buttons</h2>
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search buttons..."
            className="input input-bordered w-full pl-10 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {filteredBookmarks.map((bookmark) => (
          <button
            key={bookmark.id}
            onClick={() => window.open(bookmark.url, '_blank')}
            className="btn btn-outline btn-primary normal-case font-medium gap-2 group hover:shadow-md transition-all"
          >
            <span className="truncate max-w-[150px]">{bookmark.title}</span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
        {filteredBookmarks.length === 0 && (
          <div className="w-full text-center py-20 text-base-content/40">
            No matching bookmarks found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkButtons;
