import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const CalendarWidget: React.FC = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = now.toLocaleDateString([], { month: 'long' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base-content">{monthName} {year}</h3>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs flex-1">
          {dayNames.map(d => (
            <div key={d} className="font-bold text-base-content/40 py-1">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                day === now.getDate()
                  ? 'bg-primary text-primary-content font-bold shadow-md'
                  : day
                    ? 'text-base-content hover:bg-base-100/50 cursor-default'
                    : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default CalendarWidget;
