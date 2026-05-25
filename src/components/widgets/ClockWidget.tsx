import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body items-center text-center">
        <Clock className="w-8 h-8 text-primary mb-2" />
        <h2 className="text-4xl font-bold font-mono text-base-content">{timeString}</h2>
        <p className="text-base-content/60">{dateString}</p>
      </div>
    </div>
  );
};

export default ClockWidget;
