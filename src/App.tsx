import React, { useState } from 'react';
import { LayoutGrid, Bookmark, Settings } from 'lucide-react';
import Dock from './components/Dock';
import BookmarkManager from './components/bookmarks/BookmarkManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dock' | 'bookmark'>('dock');

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
            <span className="font-medium hidden lg:block text-base-content">Dock</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'bookmark' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
            }`}
          >
            <Bookmark size={20} />
            <span className="font-medium hidden lg:block text-base-content">Bookmarks</span>
          </button>
        </nav>

        <div className="p-4 border-t border-base-300">
          <button className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-base-200 text-base-content/70 transition-all">
            <Settings size={20} />
            <span className="font-medium hidden lg:block text-base-content">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dock' ? <Dock /> : <BookmarkManager />}
        </div>
      </main>
    </div>
  );
};

export default App;
