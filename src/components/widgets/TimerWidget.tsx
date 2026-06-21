import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, ChevronDown } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

const DEFAULT_PRESETS = [5, 15, 25, 45, 60, 90];

interface TimerState {
  isActive: boolean;
  endTime: number | null;
  duration: number;
}

const TimerWidget: React.FC = () => {
  const { t } = useTranslation();
  const [presets, setPresets] = useStorage<number[]>('timer-presets', DEFAULT_PRESETS, 'local');
  const [timerState, setTimerState] = useStorage<TimerState>('timerState', { isActive: false, endTime: null, duration: 25 }, 'local');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [customValue, setCustomValue] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (timerState.isActive && timerState.endTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((timerState.endTime! - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setTimerState(prev => ({ ...prev, isActive: false, endTime: null }));
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: t.widgets.timer.finished, type: 'success' }
          }));
          if (typeof chrome !== 'undefined' && chrome.alarms) {
            chrome.alarms.clear('pomodoroTimer');
          }
        }
      };

      updateTimer(); // Initial call
      interval = window.setInterval(updateTimer, 1000);
    } else {
      // If inactive but duration changed, or reset
      if (!timerState.isActive && !timerState.endTime) {
         setTimeLeft(timerState.duration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [timerState, t.widgets.timer.finished, setTimerState]);

  const toggleTimer = () => {
    if (timerState.isActive) {
      // Pause
      setTimerState(prev => ({ ...prev, isActive: false, endTime: null }));
      if (typeof chrome !== 'undefined' && chrome.alarms) {
        chrome.alarms.clear('pomodoroTimer');
      }
    } else {
      // Start or Resume
      const newEndTime = Date.now() + timeLeft * 1000;
      setTimerState(prev => ({ ...prev, isActive: true, endTime: newEndTime }));

      if (typeof chrome !== 'undefined' && chrome.alarms) {
        chrome.alarms.create('pomodoroTimer', { when: newEndTime });
      }
    }
  };

  const resetTimer = useCallback(() => {
    setTimerState({ isActive: false, endTime: null, duration: timerState.duration });
    setTimeLeft(timerState.duration * 60);
    if (typeof chrome !== 'undefined' && chrome.alarms) {
      chrome.alarms.clear('pomodoroTimer');
    }
  }, [timerState.duration, setTimerState]);

  const selectPreset = (mins: number) => {
    setTimerState({ isActive: false, endTime: null, duration: mins });
    setTimeLeft(mins * 60);
    setShowPresets(false);
    if (typeof chrome !== 'undefined' && chrome.alarms) {
      chrome.alarms.clear('pomodoroTimer');
    }
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

  const progress = ((timerState.duration * 60 - timeLeft) / (timerState.duration * 60)) * 100;

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-sm text-base-content flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            {t.widgets.timer.title}
          </h3>

          <div
            ref={dropdownRef}
            className={`dropdown dropdown-end ${showPresets ? 'dropdown-open' : ''}`}
          >
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1 opacity-60 hover:opacity-100"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setShowPresets(!showPresets);
              }}
            >
              {timerState.duration}{t.widgets.timer.custom} <ChevronDown size={12} />
            </button>
            {showPresets && (
              <div
                tabIndex={0}
                className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-xl border border-white/10 w-48 max-h-60 overflow-y-auto"
                style={{ display: 'block' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    className="input input-bordered input-xs w-full bg-base-200"
                    placeholder="min"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomPreset()}
                  />
                  <button onClick={(e) => { e.stopPropagation(); addCustomPreset(); }} className="btn btn-primary btn-xs btn-square">
                    <Plus size={12} />
                  </button>
                </div>
                <div className="divider my-1 opacity-20"></div>
                <ul className="menu menu-sm p-0">
                  {presets.map(p => (
                    <li key={p}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectPreset(p);
                        }}
                        className={timerState.duration === p ? 'active' : ''}
                      >
                        {p}{t.widgets.timer.custom}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              onClick={(e) => {
                e.stopPropagation();
                toggleTimer();
              }}
              className={`btn btn-circle btn-md ${timerState.isActive ? 'btn-outline' : 'btn-primary shadow-lg shadow-primary/20'}`}
            >
              {timerState.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetTimer();
              }}
              className="btn btn-circle btn-md btn-ghost border-white/10 hover:bg-base-100/50"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TimerWidget;
