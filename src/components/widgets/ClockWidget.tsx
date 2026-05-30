import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [font] = useStorage('clock-font', 'ui-sans-serif, system-ui', 'localStorage');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 h-80">
      <div className="card-body items-center justify-center text-center p-4">
        <Clock className="w-8 h-8 text-primary mb-2" />
        <h2
          className="text-4xl font-bold text-base-content break-all"
          style={{ fontFamily: font }}
        >
          {timeString}
        </h2>
        <p className="text-sm text-base-content/60 mt-2">{dateString}</p>
      </div>
    </div>
  );
};

export default ClockWidget;
