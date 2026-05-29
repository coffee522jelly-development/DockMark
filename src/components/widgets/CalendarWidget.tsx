import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

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
    <div className="card bg-base-100 shadow-xl border border-base-300 h-80">
      <div className="card-body p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base-content">{monthName} {year}</h3>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {dayNames.map(d => (
            <div key={d} className="font-bold text-base-content/40">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg ${
                day === now.getDate()
                  ? 'bg-primary text-primary-content font-bold'
                  : day
                    ? 'text-base-content hover:bg-base-200 cursor-default'
                    : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
