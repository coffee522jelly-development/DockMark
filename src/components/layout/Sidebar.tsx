import React from 'react';
import { LayoutGrid, Bookmark, Layout, Grid, Image as ImageIcon, Table, FileText, Rss, History, Settings } from 'lucide-react';
import { TabType } from '../../config';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openSettings }) => {
  const menuItems = [
    { id: 'dock', icon: LayoutGrid, label: 'Dock' },
    { id: 'bookmark', icon: Bookmark, label: 'Bookmarks' },
    { id: 'buttons', icon: Layout, label: 'Buttons' },
    { id: 'cards', icon: Grid, label: 'Cards' },
    { id: 'icons', icon: ImageIcon, label: 'Icons' },
    { id: 'tables', icon: Table, label: 'Tables' },
    { id: 'snippets', icon: FileText, label: 'Snippets', divider: true },
    { id: 'rss', icon: Rss, label: 'RSS Feeds' },
    { id: 'history', icon: History, label: 'Tab History' },
  ];

  return (
    <div className="w-20 lg:w-64 bg-base-100/80 backdrop-blur-md border-r border-base-300 flex flex-col">
      <div className="p-4 flex items-center justify-center lg:justify-start gap-3">
        <div className="bg-primary p-2 rounded-lg text-primary-content">
          <Bookmark size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl hidden lg:block text-base-content">MarkBrew</h1>
          <span className="text-[10px] opacity-30 hidden lg:block -mt-1 font-medium">v1.0.0</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            {item.divider && <div className="border-t border-base-300 my-2 opacity-50"></div>}
            <button
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200 text-base-content/70'
              }`}
            >
              <item.icon size={20} />
              <span className={`font-medium hidden lg:block text-left flex-1 ${activeTab === item.id ? 'text-primary-content' : 'text-base-content'}`}>
                {item.label}
              </span>
            </button>
          </React.Fragment>
        ))}
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
  );
};

export default Sidebar;
