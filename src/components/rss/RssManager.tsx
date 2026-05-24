import React, { useState, useEffect } from 'react';
import { Rss, Plus, Trash2, ExternalLink, Globe } from 'lucide-react';

interface RssFeed {
  id: string;
  url: string;
  title: string;
}

const RssManager: React.FC = () => {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeeds = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['rssFeeds'], (result) => {
          setFeeds(result.rssFeeds || []);
          setIsLoading(false);
        });
      } else {
        const stored = localStorage.getItem('dockmark_rss_feeds');
        if (stored) {
          setFeeds(JSON.parse(stored));
        }
        setIsLoading(false);
      }
    };

    loadFeeds();
  }, []);

  const saveFeeds = (updatedFeeds: RssFeed[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ rssFeeds: updatedFeeds });
    } else {
      localStorage.setItem('dockmark_rss_feeds', JSON.stringify(updatedFeeds));
    }
  };

  const addFeed = () => {
    if (!newUrl.trim()) return;

    const newFeed: RssFeed = {
      id: Date.now().toString(),
      url: newUrl,
      title: newTitle.trim() || newUrl,
    };

    const updated = [...feeds, newFeed];
    setFeeds(updated);
    saveFeeds(updated);
    setNewUrl('');
    setNewTitle('');
  };

  const deleteFeed = (id: string) => {
    const updated = feeds.filter(f => f.id !== id);
    setFeeds(updated);
    saveFeeds(updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-base-content">
            <Rss className="w-8 h-8 text-orange-500" />
            RSS Feed Management
          </h1>
          <p className="text-base-content/60 mt-1">Add and manage your favorite RSS feeds to display in the Dock.</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
        <div className="card-body p-6">
          <h3 className="card-title text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add New Feed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Feed Title (Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. BBC News"
                className="input input-bordered w-full"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Feed URL</span></label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  className="input input-bordered w-full flex-1"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFeed()}
                />
                <button onClick={addFeed} className="btn btn-primary">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-base-content">
          Your Feeds <span className="badge badge-primary">{feeds.length}</span>
        </h3>

        {feeds.length === 0 ? (
          <div className="card bg-base-200 border-2 border-dashed border-base-300 py-12 text-center flex flex-col items-center justify-center opacity-50">
            <Globe className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No RSS feeds registered</p>
            <p className="text-sm">Add your first feed above to see the latest news in your Dock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeds.map((feed) => (
              <div key={feed.id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow group">
                <div className="card-body p-4 flex-row items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <Rss className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate text-base-content">{feed.title}</h4>
                    <p className="text-xs text-base-content/50 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {feed.url}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    className="btn btn-ghost btn-circle btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RssManager;
