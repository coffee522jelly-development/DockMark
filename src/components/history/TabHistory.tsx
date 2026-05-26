import React, { useState, useEffect } from 'react';
import { History, ExternalLink, Trash2, Clock, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

interface TabEntry {
  title: string;
  url: string;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  tabs: TabEntry[];
}

const TabHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [autoRestore, setAutoRestore] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['tabHistory', 'autoRestoreEnabled'], (result) => {
        if (result.tabHistory) {
          setHistory(result.tabHistory);
        }
        if (result.autoRestoreEnabled !== undefined) {
          setAutoRestore(result.autoRestoreEnabled);
        }
      });
    } else {
      // Mock data
      setHistory([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          tabs: [
            { title: 'Google', url: 'https://google.com' },
            { title: 'GitHub', url: 'https://github.com' }
          ]
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          tabs: [
            { title: 'Twitter', url: 'https://twitter.com' }
          ]
        }
      ]);
    }
  };

  const toggleAutoRestore = () => {
    const newVal = !autoRestore;
    setAutoRestore(newVal);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoRestoreEnabled: newVal });
    }
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ tabHistory: updated });
    }
  };

  const restoreTabs = (tabs: TabEntry[]) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      tabs.forEach(tab => {
        chrome.tabs.create({ url: tab.url });
      });
    } else {
      alert(`Restoring ${tabs.length} tabs...`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <History className="text-primary" /> Tab History
          </h2>
          <p className="text-base-content/60">Manage your saved tab sessions (Max 10).</p>
        </div>

        <div className="flex items-center gap-4 px-4 py-2 bg-base-200 rounded-xl border border-base-300">
          <span className="text-sm font-medium">Auto-restore latest on startup</span>
          <button
            onClick={toggleAutoRestore}
            className={`transition-colors ${autoRestore ? 'text-primary' : 'text-base-content/30'}`}
          >
            {autoRestore ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.length > 0 ? (
          history.map((entry) => (
            <div key={entry.id} className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary/30 transition-all group">
              <div className="card-body p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{formatDate(entry.timestamp)}</h3>
                      <p className="text-sm text-base-content/60">{entry.tabs.length} tabs saved</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreTabs(entry.tabs)}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <ExternalLink size={16} /> Restore All
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-hidden max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {entry.tabs.map((tab, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-base-200 border border-base-300 text-xs truncate" title={tab.title}>
                      <Globe size={12} className="shrink-0 opacity-50" />
                      <span className="truncate flex-1">{tab.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-3xl border border-dashed border-base-300 opacity-50">
            <History size={64} className="mb-4" />
            <p className="text-xl font-medium">No history saved yet.</p>
            <p className="text-sm">Right-click on any page and select "Save current tab state" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabHistory;
