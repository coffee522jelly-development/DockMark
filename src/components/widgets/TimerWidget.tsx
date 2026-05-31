import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, ChevronDown } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

const DEFAULT_PRESETS = [5, 15, 25, 45, 60, 90];

const TimerWidget: React.FC = () => {
  const { t } = useTranslation();
  const [presets, setPresets] = useStorage<number[]>('timer-presets', DEFAULT_PRESETS, 'local');
  const [duration, setDuration] = useState(25); // current selection in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: t.widgets.timer.finished, type: 'success' }
      }));
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  }, [duration]);

  const selectPreset = (mins: number) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
    setShowPresets(false);
  };

  const addCustomPreset = () => {
    const val = parseInt(customValue);
    if (!isNaN(val) && val > 0 && val <= 1440) {
      if (!presets.includes(val)) {
        setPresets([...presets].sort((a, b) => a - b).concat(val).sort((a, b) => a - b));
      }
      selectPreset(val);
      setCustomValue('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-sm text-base-content flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            {t.widgets.timer.title}
          </h3>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-xs gap-1 opacity-60 hover:opacity-100" onClick={() => setShowPresets(!showPresets)}>
              {duration}{t.widgets.timer.custom} <ChevronDown size={12} />
            </label>
            <ul tabIndex={0} className={`dropdown-content z-[20] menu p-2 shadow-2xl bg-base-100 rounded-xl border border-white/10 w-48 max-h-60 overflow-y-auto ${showPresets ? '' : 'hidden'}`}>
              <div className="px-2 py-1 flex gap-1">
                <input
                  type="number"
                  className="input input-bordered input-xs w-full bg-base-200"
                  placeholder="min"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomPreset()}
                />
                <button onClick={addCustomPreset} className="btn btn-primary btn-xs btn-square"><Plus size={12} /></button>
              </div>
              <div className="divider my-1 opacity-20"></div>
              {presets.map(p => (
                <li key={p}>
                  <button onClick={() => selectPreset(p)} className={duration === p ? 'active' : ''}>
                    {p}{t.widgets.timer.custom}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div
              className="radial-progress text-primary bg-base-100/20"
              style={{ "--value": progress, "--size": "8rem", "--thickness": "6px" } as React.CSSProperties}
              role="progressbar"
            >
              <span className="text-4xl font-bold text-base-content tracking-tighter font-number">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className={`btn btn-circle btn-md ${isActive ? 'btn-outline' : 'btn-primary shadow-lg shadow-primary/20'}`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button onClick={resetTimer} className="btn btn-circle btn-md btn-ghost border-white/10 hover:bg-base-100/50">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TimerWidget;
