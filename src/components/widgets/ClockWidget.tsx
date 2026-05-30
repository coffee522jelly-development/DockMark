import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import GlassCard from '../common/GlassCard';

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
    <GlassCard className="h-80">
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
          <Clock size={24} />
        </div>
        <h2
          className="text-4xl font-bold text-base-content break-all"
          style={{ fontFamily: font }}
        >
          {timeString}
        </h2>
        <p className="text-sm text-base-content/70 mt-3 font-medium">{dateString}</p>
      </div>
    </GlassCard>
  );
};

export default ClockWidget;
