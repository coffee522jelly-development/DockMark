import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const ClockWidget: React.FC = () => {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString(t.widgets.clock.dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <GlassCard className="aspect-square" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-base-content flex items-center gap-2 m-0">
            <Clock className="w-5 h-5 text-primary" />
            {/* @ts-ignore - clock is dynamically added to widgets in our translation update */}
            {t.widgets?.clock?.title || 'Clock'}
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-bold text-base-content break-all font-number">
            {timeString}
          </h2>
          <p className="text-sm text-base-content/70 mt-3 font-medium">{dateString}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default ClockWidget;
