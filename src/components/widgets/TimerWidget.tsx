import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

const TimerWidget: React.FC = () => {
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
      // Optional: alert('Timer finished!');
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
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body items-center text-center">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-2">
          <Timer className="w-5 h-5 text-primary" />
          25 min Timer
        </h3>

        <div className="relative flex items-center justify-center my-4">
          <div
            className="radial-progress text-primary"
            style={{ "--value": progress, "--size": "8rem", "--thickness": "8px" } as React.CSSProperties}
            role="progressbar"
          >
            <span className="text-2xl font-bold font-mono text-base-content">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={toggleTimer} className={`btn btn-circle ${isActive ? 'btn-outline' : 'btn-primary'}`}>
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button onClick={resetTimer} className="btn btn-circle btn-ghost border-base-300">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerWidget;
