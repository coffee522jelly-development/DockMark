import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const TimerWidget: React.FC = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

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
    setTimeLeft(25 * 60);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <GlassCard className="h-80">
      <div className="flex flex-col h-full items-center justify-center text-center">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-6">
          <Timer className="w-5 h-5 text-primary" />
          {t.widgets.timer.title}
        </h3>

        <div className="relative flex items-center justify-center mb-8">
          <div
            className="radial-progress text-primary bg-base-100/30"
            style={{ "--value": progress, "--size": "9rem", "--thickness": "6px" } as React.CSSProperties}
            role="progressbar"
          >
            <span className="text-3xl font-bold font-mono text-base-content tracking-tighter">
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
    </GlassCard>
  );
};

export default TimerWidget;
