import React, { useState, useEffect } from 'react';
import { Rss, Plus, Trash2, ExternalLink, Globe } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';

interface RssFeed {
  id: string;
  url: string;
  title: string;
}

const RssManager: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={t.rss.title}
        description={t.rss.description}
        icon={Rss}
      />

      <GlassCard className="mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-primary" /> {t.rss.addNew}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">{t.rss.feedTitle}</span></label>
            <input
              type="text"
              placeholder="e.g. BBC News"
              className="input input-bordered w-full bg-base-100/50 border-white/10"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">{t.rss.feedUrl}</span></label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                className="input input-bordered w-full flex-1 bg-base-100/50 border-white/10"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFeed()}
              />
              <button onClick={addFeed} className="btn btn-primary">{t.rss.add}</button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-base-content">
          {t.rss.yourFeeds} <span className="badge badge-primary">{feeds.length}</span>
        </h3>

        {feeds.length === 0 ? (
          <div className="card bg-base-100/20 border-2 border-dashed border-white/10 py-12 text-center flex flex-col items-center justify-center opacity-30">
            <Globe className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">{t.rss.empty}</p>
            <p className="text-sm">{t.rss.emptySub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeds.map((feed) => (
              <GlassCard key={feed.id} className="hover:border-primary/30 group" noPadding>
                <div className="p-4 flex items-center gap-4">
                  <div className="bg-orange-100/20 p-3 rounded-2xl">
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
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RssManager;
