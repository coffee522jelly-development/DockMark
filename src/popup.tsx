import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Palette, Sun, Settings, Globe } from 'lucide-react';
import { translations, Language } from './i18n';
import './index.css';

const Popup = () => {
  const [enabled, setEnabled] = useState(false);
  const [bg, setBg] = useState('#1a1a1a');
  const [text, setText] = useState('#e5e5e5');
  const [link, setLink] = useState('#60a5fa');
  const [brightness, setBrightness] = useState(0.7);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerLink', 'readerBrightness', 'language'], (res) => {
      setEnabled(res.readerEnabled || false);
      setBg(res.readerBg || '#1a1a1a');
      setText(res.readerText || '#e5e5e5');
      setLink(res.readerLink || '#60a5fa');
      setBrightness(res.readerBrightness !== undefined ? res.readerBrightness : 0.7);
      setLang(res.language || 'en');
    });
  }, []);

  const t = translations[lang];

  const save = (key: string, val: any) => {
    chrome.storage.local.set({ [key]: val });
  };

  return (
    <div className="p-4 bg-base-100 min-h-[400px] border border-base-300 rounded-lg shadow-xl overflow-hidden" data-theme="dark">
      <div className="flex items-center justify-between mb-6 border-b border-base-300 pb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Settings size={20} className="text-primary" /> {t.settings.readerTitle}
        </h1>
        <div className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-lg">
          <Globe size={12} className="opacity-50" />
          <select
            className="bg-transparent text-[10px] uppercase font-bold opacity-70 border-none outline-none cursor-pointer p-0"
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value as Language;
              setLang(newLang);
              save('language', newLang);
            }}
          >
            <option value="en">EN</option>
            <option value="ja">JA</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            <span className="font-bold text-sm">{t.settings.readerEnabled}</span>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              save('readerEnabled', e.target.checked);
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-[10px]">{t.settings.readerBg}</span>
            </label>
            <input
              type="color"
              className="w-full h-8 rounded cursor-pointer bg-transparent border-none"
              value={bg}
              onChange={(e) => {
                setBg(e.target.value);
                save('readerBg', e.target.value);
              }}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-[10px]">{t.settings.readerText}</span>
            </label>
            <input
              type="color"
              className="w-full h-8 rounded cursor-pointer bg-transparent border-none"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                save('readerText', e.target.value);
              }}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-[10px]">{t.settings.readerLink}</span>
            </label>
            <input
              type="color"
              className="w-full h-8 rounded cursor-pointer bg-transparent border-none"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                save('readerLink', e.target.value);
              }}
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text-alt font-medium flex items-center gap-1">
              <Sun size={14} /> {t.settings.readerBrightness} ({Math.round(brightness * 100)}%)
            </span>
          </label>
          <input
            type="range" min="0" max="1" step="0.05"
            className="range range-primary range-xs"
            value={brightness}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBrightness(val);
              save('readerBrightness', val);
            }}
          />
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-base-300 text-[10px] text-center opacity-50">
        {lang === 'ja' ? 'すべてのタブに即座に反映されます。' : 'Changes are applied instantly to all tabs.'}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('popup-root')!);
root.render(<Popup />);
