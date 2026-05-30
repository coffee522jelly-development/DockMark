import React from 'react';
import { Settings as SettingsIcon, X, User, Palette, Clock, Bell } from 'lucide-react';
import { themes, clockFonts } from '../../config';

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
}

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  if (!props.show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-base-300">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" /> Settings
          </h3>
          <button onClick={props.onClose} className="btn btn-ghost btn-sm btn-circle">
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
              value={props.userName}
              onChange={(e) => props.setUserName(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold flex items-center gap-2"><Palette size={16} /> App Theme</span>
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
              <span className="label-text font-bold flex items-center gap-2"><Clock size={16} /> Clock Font</span>
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

          <div className="border-t border-base-300 pt-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Palette size={16} className="text-primary" /> Design Customization
            </h4>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Icon Shape</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => props.setIconShape('square')}
                    className={`btn btn-sm flex-1 ${props.iconShape === 'square' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Rounded Square
                  </button>
                  <button
                    onClick={() => props.setIconShape('round')}
                    className={`btn btn-sm flex-1 ${props.iconShape === 'round' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Circle
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Icon Size ({props.iconSize}px)</span>
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
                  <span className="label-text font-medium">Border Radius ({props.borderRadius}px)</span>
                </label>
                <input
                  type="range" min="0" max="32" step="4"
                  className="range range-primary range-xs"
                  value={props.borderRadius}
                  onChange={(e) => props.setBorderRadius(Number(e.target.value))}
                />
                <div className="label">
                  <span className="label-text-alt text-primary font-bold italic">Extreme Mode: Applies to ALMOST EVERYTHING! 🎨</span>
                </div>
              </div>
            </div>
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
          <button onClick={props.onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={props.onSave} className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
