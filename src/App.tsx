import React, { useState, useEffect } from 'react';
import { LayoutGrid, Bookmark, Settings, X, User, Rss, Bell } from 'lucide-react';
import Dock from './components/Dock';
import BookmarkManager from './components/bookmarks/BookmarkManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dock' | 'bookmark'>('dock');
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userName'], (result) => {
        if (result.userName) setUserName(result.userName);
      });
    }
  }, []);

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ userName });
    }
    setShowSettings(false);
  };

  return (
    <div className="flex h-screen bg-base-200">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-base-100 border-r border-base-300 flex flex-col">
        <div className="p-4 flex items-center justify-center lg:justify-start gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-content">
            <Bookmark size={24} />
          </div>
          <h1 className="font-bold text-xl hidden lg:block text-base-content">B-Organizer</h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          <button
            onClick={() => setActiveTab('dock')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'dock' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <LayoutGrid size={20} />
            <span className="font-medium hidden lg:block text-base-content text-left flex-1">Dock</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'bookmark' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Bookmark size={20} />
            <span className="font-medium hidden lg:block text-base-content text-left flex-1">Bookmarks</span>
          </button>
        </nav>

        <div className="p-4 border-t border-base-300">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-base-200 text-base-content/70 transition-all"
          >
            <Settings size={20} />
            <span className="font-medium hidden lg:block text-base-content text-left flex-1">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-base-content">Welcome back, {userName}!</h2>
              <p className="text-base-content/60">Here's what's happening today.</p>
            </div>
          </header>

          {activeTab === 'dock' ? <Dock /> : <BookmarkManager />}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-base-300">
            <div className="p-6 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings size={20} className="text-primary" /> Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold flex items-center gap-2"><User size={16} /> User Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold flex items-center gap-2"><Rss size={16} /> RSS Feed URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://example.com/rss"
                  disabled
                />
                <span className="label-text-alt mt-1 text-base-content/40">Coming soon...</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-primary" />
                  <div>
                    <p className="font-bold text-sm">Notifications</p>
                    <p className="text-xs text-base-content/60">Show timer alerts</p>
                  </div>
                </div>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </div>
            </div>

            <div className="p-6 bg-base-200 border-t border-base-300 flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={saveSettings} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
