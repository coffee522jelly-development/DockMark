import React, { useState, useEffect } from 'react';
import { Rss, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

interface RssFeed {
  id: string;
  url: string;
  title: string;
}

const RssWidget: React.FC = () => {
  const { t } = useTranslation();
  const [feeds] = useStorage<RssFeed[]>('rssFeeds', [], 'local');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = async () => {
    if (feeds.length === 0) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    let allItems: any[] = [];

    try {
      for (const feed of feeds) {
        try {
          const response = await fetch(feed.url);
          const text = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'text/xml');

          // Basic RSS 2.0 parsing
          const entries = xml.querySelectorAll('item');
          entries.forEach((item, idx) => {
            if (idx < 5) {
              allItems.push({
                title: item.querySelector('title')?.textContent || 'Untitled',
                link: item.querySelector('link')?.textContent || '#',
                source: feed.url,
                id: Math.random().toString(36)
              });
            }
          });

          // Basic Atom parsing
          if (entries.length === 0) {
            const atomEntries = xml.querySelectorAll('entry');
            atomEntries.forEach((entry, idx) => {
              if (idx < 5) {
                allItems.push({
                  title: entry.querySelector('title')?.textContent || 'Untitled',
                  link: entry.querySelector('link')?.getAttribute('href') || '#',
                source: feed.url,
                  id: Math.random().toString(36)
                });
              }
            });
          }
        } catch (e) {
          console.error(`Failed to fetch feed: ${feed.url}`, e);
        }
      }

      setItems(allItems.slice(0, 20));
      setLoading(false);
    } catch (err) {
      setError('Failed to load feeds');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [feeds]);

  return (
    <GlassCard className="aspect-square" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-base-content flex items-center gap-2 m-0">
            <Rss className="w-5 h-5 text-orange-500" />
            {t.widgets.rss.title}
          </h3>
          <button
            onClick={fetchFeeds}
            className={`btn btn-ghost btn-xs btn-circle ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
          {loading && items.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-2">
                  <div className="h-3 bg-base-300 rounded w-3/4"></div>
                  <div className="h-2 bg-base-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-error opacity-70 text-center p-4">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <p className="text-xs">{error}</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group hover:bg-base-100/50 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-base-content line-clamp-2 leading-relaxed">
                    {item.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-base-content/30 opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
                <p className="text-[10px] text-base-content/40 mt-1 truncate">
                  {new URL(item.source).hostname}
                </p>
              </a>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-base-content/40 text-center p-4">
              <Rss className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">{t.widgets.rss.empty}</p>
              <p className="text-[10px] mt-1 opacity-60">{t.widgets.rss.help}</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default RssWidget;
