import React from 'react';
import ClockWidget from './widgets/ClockWidget';
import CalendarWidget from './widgets/CalendarWidget';
import SearchWidget from './widgets/SearchWidget';
import TodoWidget from './widgets/TodoWidget';
import NotesWidget from './widgets/NotesWidget';
import TimerWidget from './widgets/TimerWidget';
import WeatherWidget from './widgets/WeatherWidget';
import RssWidget from './widgets/RssWidget';

const Dock: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ClockWidget />
      <CalendarWidget />
      <SearchWidget />
      <WeatherWidget />
      <TimerWidget />
      <TodoWidget />
      <NotesWidget />
      <RssWidget />
    </div>
  );
};

export default Dock;
