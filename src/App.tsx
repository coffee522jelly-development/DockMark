import React, { useState, useEffect } from 'react';
import { LayoutGrid, Bookmark, Settings, X, User, Rss, Bell, Layout, Palette, Grid, Image as ImageIcon, Table } from 'lucide-react';
import Dock from './components/Dock';
import BookmarkManager from './components/bookmarks/BookmarkManager';
import BookmarkGallery from './components/bookmarks/BookmarkGallery';

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dock' | 'bookmark' | 'buttons' | 'cards' | 'icons' | 'tables'>('dock');
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('User');
  const [theme, setTheme] = useState('light');
  const [initialSettings, setInitialSettings] = useState({ userName: 'User', theme: 'light' });

  useEffect(() => {
    // Load Name from chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userName'], (result) => {
        if (result.userName) setUserName(result.userName);
      });
    }

    // Load Theme from localStorage
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const saveSettings = () => {
    // Save Name to chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ userName });
    }

    // Save Theme to localStorage
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    setShowSettings(false);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const openSettings = () => {
    setInitialSettings({ userName, theme });
    setShowSettings(true);
  };

  const cancelSettings = () => {
    setUserName(initialSettings.userName);
    setTheme(initialSettings.theme);
    document.documentElement.setAttribute('data-theme', initialSettings.theme);
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
          <h1 className="font-bold text-xl hidden lg:block text-base-content">DockMark</h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          <button
            onClick={() => setActiveTab('dock')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'dock' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <LayoutGrid size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'dock' ? 'text-primary-content' : 'text-base-content'}`}>Dock</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'bookmark' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Bookmark size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'bookmark' ? 'text-primary-content' : 'text-base-content'}`}>Bookmarks</span>
          </button>
          <button
            onClick={() => setActiveTab('buttons')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'buttons' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Layout size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'buttons' ? 'text-primary-content' : 'text-base-content'}`}>Buttons</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'cards' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Grid size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'cards' ? 'text-primary-content' : 'text-base-content'}`}>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'icons' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <ImageIcon size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'icons' ? 'text-primary-content' : 'text-base-content'}`}>Icons</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'tables' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Table size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'tables' ? 'text-primary-content' : 'text-base-content'}`}>Tables</span>
          </button>
        </nav>

        <div className="p-4 border-t border-base-300">
          <button
            onClick={openSettings}
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

          {activeTab === 'dock' && <Dock />}
          {activeTab === 'bookmark' && <BookmarkManager />}
          {activeTab === 'buttons' && <BookmarkGallery viewMode="buttons" />}
          {activeTab === 'cards' && <BookmarkGallery viewMode="cards" />}
          {activeTab === 'icons' && <BookmarkGallery viewMode="icons" />}
          {activeTab === 'tables' && <BookmarkGallery viewMode="tables" />}
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
              <button onClick={cancelSettings} className="btn btn-ghost btn-sm btn-circle">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
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
                  <span className="label-text font-bold flex items-center gap-2"><Palette size={16} /> App Theme</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  {themes.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <span className="label-text-alt mt-1 text-base-content/40">Select your favorite DaisyUI theme.</span>
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
              <button onClick={cancelSettings} className="btn btn-ghost">Cancel</button>
              <button onClick={saveSettings} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
