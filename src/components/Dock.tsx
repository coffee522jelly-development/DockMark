import React, { useState, useEffect } from 'react';
import ClockWidget from './widgets/ClockWidget';
import CalendarWidget from './widgets/CalendarWidget';
import SearchWidget from './widgets/SearchWidget';
import TodoWidget from './widgets/TodoWidget';
import NotesWidget from './widgets/NotesWidget';
import TimerWidget from './widgets/TimerWidget';
import WeatherWidget from './widgets/WeatherWidget';
import RssWidget from './widgets/RssWidget';
import BookmarksWidget from './widgets/BookmarksWidget';

type WidgetId = 'clock' | 'calendar' | 'search' | 'weather' | 'timer' | 'todo' | 'notes' | 'rss' | 'bookmarks';

const widgetComponents: Record<WidgetId, React.FC> = {
  clock: ClockWidget,
  calendar: CalendarWidget,
  search: SearchWidget,
  weather: WeatherWidget,
  timer: TimerWidget,
  todo: TodoWidget,
  notes: NotesWidget,
  rss: RssWidget,
  bookmarks: BookmarksWidget,
};

const defaultOrder: WidgetId[] = ['clock', 'calendar', 'search', 'weather', 'timer', 'todo', 'notes', 'rss', 'bookmarks'];

const Dock: React.FC = () => {
  const [order, setOrder] = useState<WidgetId[]>(defaultOrder);
  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadOrder = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['widgetOrder'], (result) => {
          if (result.widgetOrder) {
            setOrder(result.widgetOrder);
          }
          setIsLoaded(true);
        });
      } else {
        const stored = localStorage.getItem('dockmark_widget_order');
        if (stored) {
          setOrder(JSON.parse(stored));
        }
        setIsLoaded(true);
      }
    };
    loadOrder();
  }, []);

  const saveOrder = (newOrder: WidgetId[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ widgetOrder: newOrder });
    } else {
      localStorage.setItem('dockmark_widget_order', JSON.stringify(newOrder));
    }
  };

  const handleDragStart = (id: WidgetId) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newOrder = [...order];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    setOrder(newOrder);
  };

  const handleDragEnd = () => {
    saveOrder(order);
    setDraggedId(null);
  };

  if (!isLoaded) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {order.map((id) => {
        const Widget = widgetComponents[id];
        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragOver={(e) => handleDragOver(e, id)}
            onDragEnd={handleDragEnd}
            className={`cursor-move transition-all duration-200 ${
              draggedId === id ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <Widget />
          </div>
        );
      })}
    </div>
  );
};

export default Dock;
