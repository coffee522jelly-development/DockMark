import React from 'react';
import { Settings as SettingsIcon, X, User, Palette, Clock, Bell, Globe } from 'lucide-react';
import { themes, clockFonts } from '../../config';
import { useTranslation } from '../../contexts/LanguageContext';
import { Language } from '../../i18n';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  userName: string;
  setUserName: (name: string) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  clockFont: string;
  setClockFont: (font: string) => void;
  iconShape: 'round' | 'square';
  setIconShape: (shape: 'round' | 'square') => void;
  iconSize: number;
  setIconSize: (size: number) => void;
  borderRadius: number;
  setBorderRadius: (radius: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  readerEnabled: boolean;
  setReaderEnabled: (enabled: boolean) => void;
  readerBg: string;
  setReaderBg: (color: string) => void;
  readerText: string;
  setReaderText: (color: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { t } = useTranslation();
  if (!props.show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-base-300">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" /> {t.settings.title}
          </h3>
          <button onClick={props.onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold flex items-center gap-2"><User size={16} /> {t.settings.userName}</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={props.userName}
              onChange={(e) => props.setUserName(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold flex items-center gap-2"><Palette size={16} /> {t.settings.theme}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={props.theme}
              onChange={(e) => props.onThemeChange(e.target.value)}
            >
              {themes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold flex items-center gap-2"><Clock size={16} /> {t.settings.clockFont}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={props.clockFont}
              onChange={(e) => props.setClockFont(e.target.value)}
              style={{ fontFamily: props.clockFont }}
            >
              {clockFonts.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold flex items-center gap-2"><Globe size={16} /> {t.settings.language}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={props.language}
              onChange={(e) => props.setLanguage(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <div className="border-t border-base-300 pt-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Palette size={16} className="text-primary" /> {t.settings.design}
            </h4>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t.settings.iconShape}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => props.setIconShape('square')}
                    className={`btn btn-sm flex-1 ${props.iconShape === 'square' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {t.settings.iconShapeSquare}
                  </button>
                  <button
                    onClick={() => props.setIconShape('round')}
                    className={`btn btn-sm flex-1 ${props.iconShape === 'round' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {t.settings.iconShapeRound}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t.settings.iconSize} ({props.iconSize}px)</span>
                </label>
                <input
                  type="range" min="48" max="96" step="8"
                  className="range range-primary range-xs"
                  value={props.iconSize}
                  onChange={(e) => props.setIconSize(Number(e.target.value))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t.settings.borderRadius} ({props.borderRadius}px)</span>
                </label>
                <input
                  type="range" min="0" max="32" step="4"
                  className="range range-primary range-xs"
                  value={props.borderRadius}
                  onChange={(e) => props.setBorderRadius(Number(e.target.value))}
                />
                <div className="label">
                  <span className="label-text-alt text-primary font-bold italic">{t.settings.extremeMode}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 pt-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={16} className="text-primary" /> {t.settings.readerTitle}
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Palette size={20} className="text-primary" />
                  <div>
                    <p className="font-bold text-sm">{t.settings.readerEnabled}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={props.readerEnabled}
                  onChange={(e) => props.setReaderEnabled(e.target.checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs">{t.settings.readerBg}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
                      value={props.readerBg}
                      onChange={(e) => props.setReaderBg(e.target.value)}
                    />
                    <span className="text-[10px] opacity-50 uppercase">{props.readerBg}</span>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs">{t.settings.readerText}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
                      value={props.readerText}
                      onChange={(e) => props.setReaderText(e.target.value)}
                    />
                    <span className="text-[10px] opacity-50 uppercase">{props.readerText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <div>
                <p className="font-bold text-sm">{t.settings.notifications}</p>
                <p className="text-xs text-base-content/60">{t.settings.timerAlerts}</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
          </div>
        </div>

        <div className="p-6 bg-base-200 border-t border-base-300 flex justify-end gap-3">
          <button onClick={props.onClose} className="btn btn-ghost">{t.settings.cancel}</button>
          <button onClick={props.onSave} className="btn btn-primary">{t.settings.save}</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
