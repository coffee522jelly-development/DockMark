import React, { useState, useEffect } from 'react';
import { LayoutGrid, Bookmark, Settings, X, User, Rss, Bell, Layout, Palette, Grid, Image as ImageIcon, Table, FileText, Clock, History } from 'lucide-react';
import Dock from './components/Dock';
import BookmarkManager from './components/bookmarks/BookmarkManager';
import BookmarkGallery from './components/bookmarks/BookmarkGallery';
import Snippets from './components/snippets/Snippets';
import RssManager from './components/rss/RssManager';
import TabHistory from './components/history/TabHistory';

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
];

const clockFonts = [
  { name: 'Standard (Sans)', value: 'ui-sans-serif, system-ui' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond, serif' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Orbitron', value: 'Orbitron, sans-serif' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif' },
  { name: 'Righteous', value: 'Righteous, sans-serif' },
  { name: 'Unbounded', value: 'Unbounded, sans-serif' },
  { name: 'Press Start 2P', value: '"Press Start 2P", system-ui' },
  { name: 'Bangers', value: 'Bangers, system-ui' },
  { name: 'Lobster', value: 'Lobster, system-ui' },
  { name: 'Pacifico', value: 'Pacifico, system-ui' },
  { name: 'Caveat', value: 'Caveat, cursive' },
  { name: 'Dancing Script', value: 'Dancing Script, cursive' },
  { name: 'Special Elite', value: 'Special Elite, system-ui' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dock' | 'bookmark' | 'buttons' | 'cards' | 'icons' | 'tables' | 'snippets' | 'rss' | 'history'>('dock');
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('User');
  const [theme, setTheme] = useState('light');
  const [clockFont, setClockFont] = useState('ui-sans-serif, system-ui');
  const [initialSettings, setInitialSettings] = useState({ userName: 'User', theme: 'light', clockFont: 'ui-sans-serif, system-ui' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'snippets') {
      setActiveTab('snippets');
    }
  }, []);

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

    // Load Clock Font
    const savedFont = localStorage.getItem('clock-font') || 'ui-sans-serif, system-ui';
    setClockFont(savedFont);
  }, []);

  const saveSettings = () => {
    // Save Name to chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ userName });
    }

    // Save Theme to localStorage
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // Save Clock Font
    localStorage.setItem('clock-font', clockFont);

    setShowSettings(false);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const openSettings = () => {
    setInitialSettings({ userName, theme, clockFont });
    setShowSettings(true);
  };

  const cancelSettings = () => {
    setUserName(initialSettings.userName);
    setTheme(initialSettings.theme);
    setClockFont(initialSettings.clockFont);
    document.documentElement.setAttribute('data-theme', initialSettings.theme);
    setShowSettings(false);
  };

  const backgroundImage = "https://picsum.photos/1920/1080?random=1";

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div
        className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Dark Overlay */}
      <div className="fixed inset-0 z-[-1] bg-black/50 backdrop-blur-[2px]" />

      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-base-100/80 backdrop-blur-md border-r border-base-300 flex flex-col">
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

          <div className="border-t border-base-300 my-2 opacity-50"></div>

          <button
            onClick={() => setActiveTab('snippets')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'snippets' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <FileText size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'snippets' ? 'text-primary-content' : 'text-base-content'}`}>Snippets</span>
          </button>
          <button
            onClick={() => setActiveTab('rss')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'rss' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Rss size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'rss' ? 'text-primary-content' : 'text-base-content'}`}>RSS Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <History size={20} />
            <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === 'history' ? 'text-primary-content' : 'text-base-content'}`}>Tab History</span>
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
      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div className="bg-base-100/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h2 className="text-3xl font-bold text-base-content">Welcome back, {userName}!</h2>
              <p className="text-base-content/70">Here's what's happening today.</p>
            </div>
          </header>

          {activeTab === 'dock' && <Dock />}
          {activeTab === 'bookmark' && <BookmarkManager />}
          {activeTab === 'buttons' && <BookmarkGallery viewMode="buttons" />}
          {activeTab === 'cards' && <BookmarkGallery viewMode="cards" />}
          {activeTab === 'icons' && <BookmarkGallery viewMode="icons" />}
          {activeTab === 'tables' && <BookmarkGallery viewMode="tables" />}
          {activeTab === 'snippets' && <Snippets />}
          {activeTab === 'rss' && <RssManager />}
          {activeTab === 'history' && <TabHistory />}
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
                  <span className="label-text font-bold flex items-center gap-2"><Clock size={16} /> Clock Font</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={clockFont}
                  onChange={(e) => setClockFont(e.target.value)}
                  style={{ fontFamily: clockFont }}
                >
                  {clockFonts.map(f => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>
                  ))}
                </select>
                <span className="label-text-alt mt-1 text-base-content/40">Choose a font for the clock widget.</span>
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
