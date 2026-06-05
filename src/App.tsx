import React, { useState, useEffect, useMemo } from 'react';
import Dock from './components/Dock';
import BookmarkManager from './components/bookmarks/BookmarkManager';
import BookmarkGallery from './components/bookmarks/BookmarkGallery';
import Snippets from './components/snippets/Snippets';
import RssManager from './components/rss/RssManager';
import TabHistory from './components/history/TabHistory';
import BookmarkGraph from './components/graph/BookmarkGraph';
import Sidebar from './components/layout/Sidebar';
import SettingsModal from './components/modals/SettingsModal';
import { useStorage } from './hooks/useStorage';
import { TabType, tabOrder } from './config';
import { useTranslation } from './contexts/LanguageContext';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dock');
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);

  // User Settings
  const { language, setLanguage } = useTranslation();
  const [userName, setUserName] = useStorage('userName', 'User', 'local');
  const [theme, setTheme] = useStorage('app-theme', 'light', 'localStorage');
  const [clockFont, setClockFont] = useStorage('clock-font', 'ui-sans-serif, system-ui', 'localStorage');
  const [iconShape, setIconShape] = useStorage<'round' | 'square'>('icon-shape', 'square', 'localStorage');
  const [iconSize, setIconSize] = useStorage('icon-size', 64, 'localStorage');
  const [borderRadius, setBorderRadius] = useStorage('border-radius', 16, 'localStorage');

  // Temporary state for modal
  const [tempSettings, setTempSettings] = useState({
    userName, theme, clockFont, iconShape, iconSize, borderRadius
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'snippets') setActiveTab('snippets');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveTab(prev => tabOrder[(tabOrder.indexOf(prev) + 1) % tabOrder.length]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveTab(prev => tabOrder[(tabOrder.indexOf(prev) - 1 + tabOrder.length) % tabOrder.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const { message, type = 'info' } = e.detail;
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  const openSettings = () => {
    setTempSettings({ userName, theme, clockFont, iconShape, iconSize, borderRadius });
    setShowSettings(true);
  };

  const saveSettings = () => {
    setUserName(tempSettings.userName);
    setTheme(tempSettings.theme);
    setClockFont(tempSettings.clockFont);
    setIconShape(tempSettings.iconShape);
    setIconSize(tempSettings.iconSize);
    setBorderRadius(tempSettings.borderRadius);
    setShowSettings(false);
  };

  const backgroundImage = useMemo(() => "https://picsum.photos/1920/1080?random=1", []);

  return (
    <div className="flex h-screen relative overflow-hidden">
      <style>
        {`
          :root {
            --rounded-box: ${borderRadius}px;
            --rounded-btn: ${borderRadius / 2}px;
            --rounded-badge: ${borderRadius / 4}px;
            --number-font: ${clockFont};
          }
          div, button, input, select, textarea, img, svg, span:not(.lucide), header, nav, section, main, .card, .alert {
            border-radius: ${borderRadius}px !important;
          }
          .font-number {
            font-family: var(--number-font) !important;
          }
        `}
      </style>

      <div
        className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="fixed inset-0 z-[-1] bg-black/50 backdrop-blur-[2px]" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} openSettings={openSettings} />

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div className="bg-base-100/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h2 className="text-3xl font-bold text-base-content">{t.header.welcome}, {userName}!</h2>
              <p className="text-base-content/70">{t.header.happening}</p>
            </div>
          </header>

          {activeTab === 'dock' && <Dock />}
          {activeTab === 'bookmark' && <BookmarkManager />}
          {['buttons', 'cards', 'bookshelf', 'icons', 'tables', 'timeline'].includes(activeTab) && (
            <BookmarkGallery
              viewMode={activeTab as any}
              iconShape={iconShape}
              iconSize={iconSize}
            />
          )}
          {activeTab === 'snippets' && <Snippets />}
          {activeTab === 'rss' && <RssManager />}
          {activeTab === 'history' && <TabHistory />}
          {activeTab === 'graph' && <BookmarkGraph />}
        </div>
      </main>

      <div className="toast toast-end toast-bottom z-[100]">
        {toasts.map(toast => (
          <div key={toast.id} className={`alert alert-${toast.type} shadow-lg animate-in slide-in-from-right duration-300`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
        userName={tempSettings.userName}
        setUserName={(val) => setTempSettings({...tempSettings, userName: val})}
        theme={tempSettings.theme}
        onThemeChange={(val) => {
          setTempSettings({...tempSettings, theme: val});
          document.documentElement.setAttribute('data-theme', val);
        }}
        clockFont={tempSettings.clockFont}
        setClockFont={(val) => setTempSettings({...tempSettings, clockFont: val})}
        iconShape={tempSettings.iconShape}
        setIconShape={(val) => setTempSettings({...tempSettings, iconShape: val})}
        iconSize={tempSettings.iconSize}
        setIconSize={(val) => setTempSettings({...tempSettings, iconSize: val})}
        borderRadius={tempSettings.borderRadius}
        setBorderRadius={(val) => setTempSettings({...tempSettings, borderRadius: val})}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
};

export default App;
