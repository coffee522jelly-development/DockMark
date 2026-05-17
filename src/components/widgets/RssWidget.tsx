import React from 'react';
import { Rss, ExternalLink } from 'lucide-react';

const RssWidget: React.FC = () => {
  // Mock RSS data
  const feeds = [
    { id: 1, title: 'Breaking News: New Tech Released', source: 'Tech Daily', time: '2h ago' },
    { id: 2, title: 'How to optimize your workflow', source: 'Productivity Hub', time: '5h ago' },
    { id: 3, title: 'The future of Web Development', source: 'Dev Community', time: '1d ago' },
    { id: 4, title: 'DaisyUI 5.0 is here!', source: 'UI News', time: '2d ago' },
  ];

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 h-80">
      <div className="card-body p-4 flex flex-col h-full">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-2">
          <Rss className="w-5 h-5 text-orange-500" />
          RSS Reader
        </h3>

        <div className="flex-1 overflow-auto space-y-3">
          {feeds.map(feed => (
            <div key={feed.id} className="border-b border-base-200 last:border-0 pb-2 cursor-pointer hover:bg-base-200 p-1 rounded transition-colors group">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-medium text-base-content line-clamp-2 leading-tight flex-1">
                  {feed.title}
                </h4>
                <ExternalLink className="w-3 h-3 text-base-content/30 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-base-content/50">
                <span>{feed.source}</span>
                <span>{feed.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost btn-xs w-full mt-2 text-primary">Manage Feeds</button>
      </div>
    </div>
  );
};

export default RssWidget;
